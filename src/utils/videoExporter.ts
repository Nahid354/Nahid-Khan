import { GeneratedClip, AspectRatio, CaptionPreset } from '../types';

interface ExportOptions {
  videoUrl: string;
  clip: GeneratedClip;
  resolution: '1080p' | '720p';
  aspectRatio: AspectRatio;
  captionPreset: CaptionPreset;
  onProgress: (percent: number, status: string) => void;
}

export async function exportClipVideo(options: ExportOptions): Promise<Blob> {
  const { videoUrl, clip, resolution, aspectRatio, captionPreset, onProgress } = options;

  return new Promise(async (resolve, reject) => {
    try {
      onProgress(5, 'Preparing video engine...');

      const video = document.createElement('video');
      if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
        video.crossOrigin = 'anonymous';
      }
      video.src = videoUrl;
      video.muted = true; // Muted by default to ensure browser never blocks recording
      video.playsInline = true;
      video.preload = 'auto';

      await new Promise<void>((res, rej) => {
        video.onloadedmetadata = () => res();
        video.oncanplay = () => res();
        video.onerror = (e) => rej(new Error('Failed to load video stream for export'));
      });

      // Target Dimensions
      let targetWidth = 1080;
      let targetHeight = 1920;

      if (aspectRatio === '9:16') {
        targetWidth = resolution === '1080p' ? 1080 : 720;
        targetHeight = resolution === '1080p' ? 1920 : 1280;
      } else if (aspectRatio === '1:1') {
        targetWidth = resolution === '1080p' ? 1080 : 720;
        targetHeight = resolution === '1080p' ? 1080 : 720;
      } else {
        // 16:9
        targetWidth = resolution === '1080p' ? 1920 : 1280;
        targetHeight = resolution === '1080p' ? 1080 : 720;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      onProgress(15, 'Setting up high-framerate recorder...');

      // Setup audio and video capture
      const stream = canvas.captureStream(30);

      // Attempt to attach audio from video if possible
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        const destination = audioCtx.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioCtx.destination);
        const audioTrack = destination.stream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
        }
      } catch (audioErr) {
        console.warn('Audio routing notice:', audioErr);
      }

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else {
          mimeType = '';
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const recordedChunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      const startTime = Math.max(0, clip.startTime);
      const endTime = Math.min(video.duration || 9999, clip.endTime);
      const totalDuration = endTime - startTime;

      video.currentTime = startTime;

      await new Promise<void>((res) => {
        video.onseeked = () => res();
      });

      recorder.start();
      try {
        await video.play();
      } catch (err) {
        console.warn('Playback error during export, muting and retrying:', err);
        video.muted = true;
        try {
          await video.play();
        } catch (e2) {
          console.error('Final export play error:', e2);
        }
      }

      let animationFrameId: number;

      const renderFrame = () => {
        const current = video.currentTime;
        if (current >= endTime || video.paused || video.ended) {
          // Finished
          cancelAnimationFrame(animationFrameId);
          video.pause();
          recorder.stop();
          return;
        }

        const elapsed = current - startTime;
        const progressPct = Math.min(96, Math.floor(15 + (elapsed / totalDuration) * 80));
        onProgress(progressPct, `Rendering frames (${Math.round(elapsed)}s / ${Math.round(totalDuration)}s)...`);

        // Draw Canvas Background & Video
        drawCanvasFrame(ctx, video, targetWidth, targetHeight, aspectRatio, clip, current, captionPreset);

        animationFrameId = requestAnimationFrame(renderFrame);
      };

      animationFrameId = requestAnimationFrame(renderFrame);

      recorder.onstop = () => {
        onProgress(98, 'Packaging final video...');
        const blob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
        onProgress(100, 'Export complete!');
        resolve(blob);
      };

      recorder.onerror = (err) => {
        cancelAnimationFrame(animationFrameId);
        video.pause();
        reject(err);
      };
    } catch (err) {
      reject(err);
    }
  });
}

function drawCanvasFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  aspectRatio: AspectRatio,
  clip: GeneratedClip,
  currentTime: number,
  captionPreset: CaptionPreset
) {
  // Clear canvas
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, width, height);

  const vWidth = video.videoWidth || 1920;
  const vHeight = video.videoHeight || 1080;
  const videoAspect = vWidth / vHeight;
  const targetAspect = width / height;

  // Horizontal pan focus point (0.0 to 1.0)
  let focusX = clip.customCropX ?? 0.5;
  if (clip.subjectTrack && clip.subjectTrack.length > 0) {
    const keyframes = clip.subjectTrack;
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (currentTime >= keyframes[i].time && currentTime <= keyframes[i + 1].time) {
        const factor = (currentTime - keyframes[i].time) / (keyframes[i + 1].time - keyframes[i].time);
        focusX = keyframes[i].focusX + (keyframes[i + 1].focusX - keyframes[i].focusX) * factor;
        break;
      }
    }
  }

  // Reframing: crop & draw
  if (aspectRatio === '9:16' && videoAspect > targetAspect) {
    // Landscape video into Vertical 9:16
    const cropWidth = vHeight * targetAspect;
    const cropHeight = vHeight;
    const maxSourceX = vWidth - cropWidth;
    const sourceX = Math.max(0, Math.min(maxSourceX, (focusX * vWidth) - (cropWidth / 2)));
    const sourceY = 0;

    // Draw blurred backdrop for aesthetic richness
    try {
      if ('filter' in ctx) {
        ctx.filter = 'blur(16px) brightness(0.35)';
      }
      ctx.drawImage(video, 0, 0, vWidth, vHeight, -width * 0.1, -height * 0.1, width * 1.2, height * 1.2);
      ctx.filter = 'none';
    } catch {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw main centered crop
    try {
      ctx.drawImage(video, sourceX, sourceY, cropWidth, cropHeight, 0, 0, width, height);
    } catch (e) {
      console.warn('Frame crop draw error:', e);
    }
  } else if (aspectRatio === '1:1') {
    const minDim = Math.min(vWidth, vHeight);
    const sourceX = (vWidth - minDim) / 2;
    const sourceY = (vHeight - minDim) / 2;
    ctx.drawImage(video, sourceX, sourceY, minDim, minDim, 0, 0, width, height);
  } else {
    // 16:9 standard
    ctx.drawImage(video, 0, 0, vWidth, vHeight, 0, 0, width, height);
  }

  // Find active caption
  const activeCaption = clip.captions.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  if (activeCaption) {
    drawSubtitles(ctx, activeCaption, currentTime, width, height, captionPreset);
  }

  // Draw custom overlay sticker if set
  if (clip.customSticker) {
    ctx.font = `${Math.floor(width * 0.08)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(clip.customSticker, width * 0.5, height * 0.18);
  }

  // Draw custom overlay text if set
  if (clip.customOverlayText) {
    ctx.save();
    ctx.font = `900 ${Math.floor(width * 0.045)}px 'Montserrat', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.floor(width * 0.012);
    ctx.strokeText(clip.customOverlayText.toUpperCase(), width * 0.5, height * 0.24);
    ctx.fillText(clip.customOverlayText.toUpperCase(), width * 0.5, height * 0.24);
    ctx.restore();
  }
}

function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  caption: { text: string; words: Array<{ word: string; start: number; end: number }> },
  currentTime: number,
  width: number,
  height: number,
  preset: CaptionPreset
) {
  ctx.save();

  const fontSize = Math.floor(width * 0.06);
  ctx.font = `900 ${fontSize}px 'Montserrat', 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const posY = height * 0.76;

  // Active word detection
  const words = caption.words && caption.words.length > 0
    ? caption.words
    : caption.text.split(' ').map((w) => ({ word: w, start: 0, end: 9999 }));

  // Word-by-word placement calculation
  const totalText = words.map((w) => w.word).join(' ');
  const totalWidth = ctx.measureText(totalText).width;
  let currentX = (width - totalWidth) / 2;

  // If text is wider than 85% of screen, wrap into 2 lines
  if (totalWidth > width * 0.85) {
    drawWrappedSubtitles(ctx, caption.text, currentTime, words, width, posY, fontSize, preset);
    ctx.restore();
    return;
  }

  for (const w of words) {
    const wordWidth = ctx.measureText(w.word + ' ').width;
    const wordCenterX = currentX + wordWidth / 2;
    const isActive = currentTime >= w.start && currentTime <= w.end;

    applyCaptionStyle(ctx, preset, isActive, fontSize);

    // Stroke
    ctx.strokeText(w.word.toUpperCase(), wordCenterX, posY);
    // Fill
    ctx.fillText(w.word.toUpperCase(), wordCenterX, posY);

    currentX += wordWidth;
  }

  ctx.restore();
}

function drawWrappedSubtitles(
  ctx: CanvasRenderingContext2D,
  _text: string,
  currentTime: number,
  words: Array<{ word: string; start: number; end: number }>,
  width: number,
  baseY: number,
  fontSize: number,
  preset: CaptionPreset
) {
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid);
  const line2 = words.slice(mid);

  const drawLine = (lineWords: typeof words, y: number) => {
    const lineText = lineWords.map((w) => w.word).join(' ');
    const lineWidth = ctx.measureText(lineText).width;
    let startX = (width - lineWidth) / 2;

    for (const w of lineWords) {
      const wordWidth = ctx.measureText(w.word + ' ').width;
      const wordCenterX = startX + wordWidth / 2;
      const isActive = currentTime >= w.start && currentTime <= w.end;

      applyCaptionStyle(ctx, preset, isActive, fontSize);
      ctx.strokeText(w.word.toUpperCase(), wordCenterX, y);
      ctx.fillText(w.word.toUpperCase(), wordCenterX, y);

      startX += wordWidth;
    }
  };

  drawLine(line1, baseY - fontSize * 0.7);
  drawLine(line2, baseY + fontSize * 0.7);
}

function applyCaptionStyle(
  ctx: CanvasRenderingContext2D,
  preset: CaptionPreset,
  isActive: boolean,
  fontSize: number
) {
  ctx.lineWidth = Math.max(3, Math.floor(fontSize * 0.16));
  ctx.strokeStyle = '#000000';

  switch (preset) {
    case 'bold': // Yellow & White Hormozi Style
      ctx.fillStyle = isActive ? '#facc15' : '#ffffff';
      break;

    case 'neon': // Cyber Cyan & Magenta Glow
      ctx.fillStyle = isActive ? '#06b6d4' : '#f43f5e';
      if (isActive) {
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 16;
      } else {
        ctx.shadowBlur = 0;
      }
      break;

    case 'impact': // High-contrast Red & White
      ctx.fillStyle = isActive ? '#ef4444' : '#ffffff';
      break;

    case 'karaoke': // Glowing green active word
      ctx.fillStyle = isActive ? '#22c55e' : '#cbd5e1';
      if (isActive) {
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;
      }
      break;

    case 'clean': // Minimalist pure white
      ctx.lineWidth = Math.max(2, Math.floor(fontSize * 0.08));
      ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
      break;

    case 'classic':
    default:
      ctx.fillStyle = isActive ? '#fbbf24' : '#f8fafc';
      break;
  }
}
