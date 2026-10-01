import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Download,
  Scissors,
  Sparkles,
  Type,
  Smile,
  Maximize2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  Edit2,
  Check,
  Share2,
  RefreshCw,
  Copy,
  Flame,
} from 'lucide-react';
import { GeneratedClip, AspectRatio, CaptionPreset, Project, TimedCaption } from '../types';
import { formatTime } from '../utils/formatters';

interface EditorViewProps {
  project: Project;
  clip: GeneratedClip;
  onUpdateClip: (updatedClip: GeneratedClip) => void;
  onExportClip: (clip: GeneratedClip) => void;
  onBackToClips: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  project,
  clip,
  onUpdateClip,
  onExportClip,
  onBackToClips,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(clip.startTime);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(clip.playbackSpeed || 1);
  const [activeTab, setActiveTab] = useState<'captions' | 'hooks' | 'titles' | 'social' | 'overlays'>('captions');

  // Clip state copies
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(clip.aspectRatio || '9:16');
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>(clip.captionPreset || 'bold');
  const [startTime, setStartTime] = useState<number>(clip.startTime);
  const [endTime, setEndTime] = useState<number>(clip.endTime);
  const [cropX, setCropX] = useState<number>(clip.customCropX ?? 0.5);
  const [isAutoTracking, setIsAutoTracking] = useState<boolean>(true);
  const [customOverlay, setCustomOverlay] = useState<string>(clip.customOverlayText || '');
  const [selectedSticker, setSelectedSticker] = useState<string>(clip.customSticker || '🔥');
  const [previewMode, setPreviewMode] = useState<'canvas' | 'direct'>('canvas');

  // AI Generation states
  const [generatedHooks, setGeneratedHooks] = useState<string[]>(clip.alternativeHooks || []);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>(clip.alternativeTitles || []);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Subtitles edit
  const [captionsList, setCaptionsList] = useState<TimedCaption[]>(clip.captions || []);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const thumbnailImgRef = useRef<HTMLImageElement | null>(null);

  const duration = Math.max(1, endTime - startTime);
  const totalVideoDuration = project.videoDuration || 100;

  // Preload thumbnail for canvas fallback
  useEffect(() => {
    if (project.thumbnailUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = project.thumbnailUrl;
      img.onload = () => {
        thumbnailImgRef.current = img;
      };
    }
  }, [project.thumbnailUrl]);

  // Sync internal changes to parent clip
  useEffect(() => {
    onUpdateClip({
      ...clip,
      startTime,
      endTime,
      duration: Math.round((endTime - startTime) * 10) / 10,
      aspectRatio,
      captionPreset,
      customCropX: cropX,
      customOverlayText: customOverlay,
      customSticker: selectedSticker,
      playbackSpeed,
      captions: captionsList,
    });
  }, [startTime, endTime, aspectRatio, captionPreset, cropX, customOverlay, selectedSticker, playbackSpeed, captionsList]);

  // Ensure video element loads source
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.currentTime = startTime;
    }
  }, [project.videoUrl]);

  // Handle Play / Pause with robust fallback
  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (currentTime >= endTime || currentTime < startTime) {
          videoRef.current.currentTime = startTime;
          setCurrentTime(startTime);
        }
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio policy blocked unmuted autoplay, falling back to muted playback:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          try {
            await videoRef.current.play();
            setIsPlaying(true);
          } catch (e2) {
            console.error('Playback error:', e2);
          }
        }
      }
    }
  };

  // Video timeupdate loop
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (t >= endTime) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
      if (!isPlaying) {
        videoRef.current.pause();
      }
    }
  };

  const seekTo = (newTime: number) => {
    const clamped = Math.max(0, Math.min(totalVideoDuration, newTime));
    setCurrentTime(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  // Step 1 sec
  const stepTime = (offset: number) => {
    seekTo(currentTime + offset);
  };

  // Handle Speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Handle Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  // Live Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Draw background
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, width, height);

      if (video.readyState >= 2) {
        const vW = video.videoWidth || 1920;
        const vH = video.videoHeight || 1080;
        const videoRatio = vW / vH;
        const targetRatio = width / height;

        // Auto tracking pan or manual
        let focusX = cropX;
        if (isAutoTracking && clip.subjectTrack && clip.subjectTrack.length > 0) {
          const keyframes = clip.subjectTrack;
          for (let i = 0; i < keyframes.length - 1; i++) {
            if (currentTime >= keyframes[i].time && currentTime <= keyframes[i + 1].time) {
              const factor = (currentTime - keyframes[i].time) / (keyframes[i + 1].time - keyframes[i].time);
              focusX = keyframes[i].focusX + (keyframes[i + 1].focusX - keyframes[i].focusX) * factor;
              break;
            }
          }
        }

        if (aspectRatio === '9:16' && videoRatio > targetRatio) {
          const cropW = vH * targetRatio;
          const maxSourceX = vW - cropW;
          const srcX = Math.max(0, Math.min(maxSourceX, focusX * vW - cropW / 2));

          // Draw blurred ambient background
          try {
            ctx.filter = 'blur(16px) brightness(0.35)';
            ctx.drawImage(video, 0, 0, vW, vH, -width * 0.1, -height * 0.1, width * 1.2, height * 1.2);
            ctx.filter = 'none';
          } catch {
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(0, 0, width, height);
          }

          // Draw sharp centered/tracked frame
          try {
            ctx.drawImage(video, srcX, 0, cropW, vH, 0, 0, width, height);
          } catch (drawErr) {
            // Draw thumbnail fallback if available
            if (thumbnailImgRef.current && thumbnailImgRef.current.complete) {
              ctx.drawImage(thumbnailImgRef.current, 0, 0, width, height);
            }
          }
        } else if (aspectRatio === '1:1') {
          const minDim = Math.min(vW, vH);
          const srcX = (vW - minDim) / 2;
          const srcY = (vH - minDim) / 2;
          try {
            ctx.drawImage(video, srcX, srcY, minDim, minDim, 0, 0, width, height);
          } catch {
            if (thumbnailImgRef.current && thumbnailImgRef.current.complete) {
              ctx.drawImage(thumbnailImgRef.current, 0, 0, width, height);
            }
          }
        } else {
          // 16:9
          try {
            ctx.drawImage(video, 0, 0, vW, vH, 0, 0, width, height);
          } catch {
            if (thumbnailImgRef.current && thumbnailImgRef.current.complete) {
              ctx.drawImage(thumbnailImgRef.current, 0, 0, width, height);
            }
          }
        }
      } else {
        // Fallback when video is loading or buffering - never show pure black
        if (thumbnailImgRef.current && thumbnailImgRef.current.complete) {
          ctx.drawImage(thumbnailImgRef.current, 0, 0, width, height);
        } else {
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(0.5, '#0f172a');
          grad.addColorStop(1, '#0284c7');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          ctx.font = 'bold 20px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText('Loading Video Stream...', width / 2, height / 2);
        }
      }

        // Draw Subtitles
        const activeCaption = captionsList.find(
          (c) => currentTime >= c.start && currentTime <= c.end
        );

        if (activeCaption) {
          renderCanvasSubtitle(ctx, activeCaption, currentTime, width, height, captionPreset);
        }

        // Draw Sticker / Emoji
        if (selectedSticker) {
          ctx.font = `${Math.floor(width * 0.09)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(selectedSticker, width * 0.5, height * 0.18);
        }

        // Draw Custom Text Overlay
        if (customOverlay) {
          ctx.save();
          const ovFontSize = Math.floor(width * 0.05);
          ctx.font = `900 ${ovFontSize}px 'Montserrat', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.floor(ovFontSize * 0.2);
          ctx.strokeText(customOverlay.toUpperCase(), width * 0.5, height * 0.25);
          ctx.fillText(customOverlay.toUpperCase(), width * 0.5, height * 0.25);
          ctx.restore();
        }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, aspectRatio, captionPreset, cropX, isAutoTracking, selectedSticker, customOverlay, captionsList]);

  // Generate more hooks using server API
  const handleGenerateHooks = async () => {
    setIsGeneratingHooks(true);
    try {
      const res = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clipTitle: clip.title, context: clip.reason }),
      });
      const data = await res.json();
      if (data.hooks && data.hooks.length > 0) {
        setGeneratedHooks(data.hooks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  // Generate more titles using server API
  const handleGenerateTitles = async () => {
    setIsGeneratingTitles(true);
    try {
      const res = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clipTitle: clip.title, hook: clip.hook }),
      });
      const data = await res.json();
      if (data.titles && data.titles.length > 0) {
        const titleStrings = data.titles.map((t: any) => typeof t === 'string' ? t : t.title);
        setGeneratedTitles(titleStrings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Caption edit helpers
  const handleSaveCaptionEdit = (capId: string) => {
    setCaptionsList((prev) =>
      prev.map((c) => {
        if (c.id === capId) {
          const words = editText.split(' ');
          const wordDur = (c.end - c.start) / Math.max(1, words.length);
          const timedWords = words.map((w, idx) => ({
            word: w,
            start: Math.round((c.start + idx * wordDur) * 100) / 100,
            end: Math.round((c.start + (idx + 1) * wordDur) * 100) / 100,
          }));
          return { ...c, text: editText, words: timedWords };
        }
        return c;
      })
    );
    setEditingCaptionId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToClips}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Clips</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wide">
                Editing Clip
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Score {clip.viralityScore}
              </span>
            </div>
            <h2 className="text-lg font-black text-white truncate max-w-lg">
              {clip.title}
            </h2>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExportClip(clip)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Clip (100% Free)</span>
          </button>
        </div>
      </div>

      {/* Editor Grid: Left Canvas Player / Right Sidebar Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Canvas & Scrubber Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Aspect Ratio Switcher Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 pl-2">
                Ratio:
              </span>
              {[
                { id: '9:16', label: '9:16 Vertical (Shorts/TikTok)' },
                { id: '1:1', label: '1:1 Square (Feed)' },
                { id: '16:9', label: '16:9 Landscape' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAspectRatio(opt.id as AspectRatio)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    aspectRatio === opt.id
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Smart Tracking & View Mode Toggle */}
            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('canvas')}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    previewMode === 'canvas'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  9:16 Shorts
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('direct')}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    previewMode === 'direct'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Original Video
                </button>
              </div>

              <label className="hidden sm:flex text-xs text-slate-400 font-medium items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoTracking}
                  onChange={(e) => setIsAutoTracking(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-0"
                />
                <span>AI Track</span>
              </label>
            </div>
          </div>

          {/* Interactive Video Canvas Viewport */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-black p-4 shadow-2xl min-h-[440px]">
            {/* Native video element with active decoder surface */}
            <video
              ref={videoRef}
              src={project.videoUrl}
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              className={
                previewMode === 'direct'
                  ? 'max-h-[500px] w-auto rounded-2xl shadow-2xl object-contain border border-slate-800/80 z-10'
                  : 'absolute -top-[9999px] -left-[9999px] w-[320px] h-[180px] opacity-0 pointer-events-none'
              }
            />

            {/* Rendered Canvas */}
            {previewMode === 'canvas' && (
              <canvas
                ref={canvasRef}
                width={aspectRatio === '9:16' ? 540 : aspectRatio === '1:1' ? 600 : 800}
                height={aspectRatio === '9:16' ? 960 : aspectRatio === '1:1' ? 600 : 450}
                className="max-h-[500px] w-auto rounded-2xl shadow-2xl object-contain border border-slate-800/80"
              />
            )}

            {/* Overlay quick play button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute z-20 flex h-16 w-16 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-2xl backdrop-blur-md transition hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Play className="h-7 w-7 fill-white translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Manual Camera Horizontal Pan Slider (when in 9:16 mode) */}
          {aspectRatio === '9:16' && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs">
              <span className="font-semibold text-slate-400 shrink-0">
                Camera Crop Pan:
              </span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.01"
                value={cropX}
                onChange={(e) => {
                  setCropX(parseFloat(e.target.value));
                  setIsAutoTracking(false);
                }}
                className="w-full accent-cyan-400"
              />
              <span className="font-mono text-cyan-400 shrink-0">
                {Math.round(cropX * 100)}%
              </span>
              <button
                onClick={() => {
                  setCropX(0.5);
                  setIsAutoTracking(true);
                }}
                className="text-[11px] text-violet-400 hover:underline shrink-0"
              >
                Auto Center
              </button>
            </div>
          )}

          {/* Timeline & Playback Control Bar */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            {/* Primary Scrubber */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-bold">
                  {formatTime(currentTime, true)}
                </span>
                <span>
                  Trim: {formatTime(startTime)} - {formatTime(endTime)} ({formatTime(duration)}s)
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={totalVideoDuration}
                step={0.1}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Trimming In/Out Range Controls */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <Scissors className="h-3 w-3 text-violet-400" /> Start Trim:
                  </span>
                  <span className="font-mono text-white font-bold">{formatTime(startTime, true)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={endTime - 2}
                    step={0.1}
                    value={startTime}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setStartTime(v);
                      seekTo(v);
                    }}
                    className="w-full accent-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <Scissors className="h-3 w-3 text-cyan-400" /> End Trim:
                  </span>
                  <span className="font-mono text-white font-bold">{formatTime(endTime, true)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={startTime + 2}
                    max={totalVideoDuration}
                    step={0.1}
                    value={endTime}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setEndTime(v);
                      seekTo(v);
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stepTime(-1)}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
                  title="Back 1s"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/30 hover:bg-violet-500"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>Play Clip</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => stepTime(1)}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
                  title="Forward 1s"
                >
                  <FastForward className="h-4 w-4" />
                </button>
              </div>

              {/* Volume & Speed */}
              <div className="flex items-center gap-4">
                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVolumeChange(isMuted ? 1 : 0)}
                    className="text-slate-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 accent-violet-500"
                  />
                </div>

                {/* Speed buttons */}
                <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1 text-[11px] font-bold">
                  {[0.75, 1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`rounded-lg px-2 py-0.5 transition ${
                        playbackSpeed === spd
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tabbed Tools Column (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tool Navigation Tabs */}
          <div className="flex overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-1 gap-1">
            {[
              { id: 'captions', label: 'Captions', icon: Type },
              { id: 'hooks', label: 'AI Hooks', icon: Sparkles },
              { id: 'titles', label: 'Titles', icon: Flame },
              { id: 'social', label: 'Social Copy', icon: Share2 },
              { id: 'overlays', label: 'Stickers', icon: Smile },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CAPTIONS STYLING & PHRASES */}
          {activeTab === 'captions' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Caption Preset
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'bold', label: 'Viral Bold', sub: 'Yellow / White' },
                    { id: 'clean', label: 'Clean Minimal', sub: 'Crisp White' },
                    { id: 'neon', label: 'Cyber Neon', sub: 'Cyan Glow' },
                    { id: 'impact', label: 'Social Impact', sub: 'Red Punch' },
                    { id: 'karaoke', label: 'Karaoke', sub: 'Active Green' },
                    { id: 'classic', label: 'Classic Box', sub: 'Subtitles' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setCaptionPreset(preset.id as CaptionPreset)}
                      className={`flex flex-col rounded-xl border p-2.5 text-left transition ${
                        captionPreset === preset.id
                          ? 'border-cyan-400 bg-cyan-950/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-white">{preset.label}</span>
                      <span className="text-[10px] text-slate-500">{preset.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Phrases */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Timed Phrases ({captionsList.length})
                  </h4>
                  <span className="text-[11px] text-cyan-400">Click to edit words</span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {captionsList.map((cap) => (
                    <div
                      key={cap.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5 transition hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>
                          {formatTime(cap.start)} - {formatTime(cap.end)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingCaptionId(cap.id);
                            setEditText(cap.text);
                          }}
                          className="text-violet-400 hover:text-white"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>

                      {editingCaptionId === cap.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingCaptionId(null)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveCaptionEdit(cap.id)}
                              className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-bold text-white"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-slate-200">
                          {cap.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI HOOKS */}
          {activeTab === 'hooks' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Opening Hooks</h4>
                  <p className="text-xs text-slate-400">
                    Strong 3-second lines designed to stop the infinite feed scroll.
                  </p>
                </div>
                <button
                  onClick={handleGenerateHooks}
                  disabled={isGeneratingHooks}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-600 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingHooks ? 'animate-spin' : ''}`} />
                  <span>Generate More</span>
                </button>
              </div>

              {/* Current Hook */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3.5">
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  Active Clip Hook:
                </div>
                <p className="text-xs font-semibold text-slate-200 italic">
                  "{clip.hook}"
                </p>
              </div>

              {/* Alternative Hooks List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Alternative AI Hooks
                </h5>
                {generatedHooks.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 transition"
                  >
                    <p className="text-xs text-slate-300 font-medium italic">
                      "{h}"
                    </p>
                    <button
                      onClick={() => onUpdateClip({ ...clip, hook: h })}
                      className="shrink-0 rounded-lg bg-violet-600/30 border border-violet-500/30 px-2.5 py-1 text-[11px] font-bold text-violet-200 hover:bg-violet-600 hover:text-white"
                    >
                      Use Hook
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI VIRAL TITLES */}
          {activeTab === 'titles' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Viral Titles</h4>
                  <p className="text-xs text-slate-400">
                    High CTR titles tuned for YouTube Shorts and TikTok algorithms.
                  </p>
                </div>
                <button
                  onClick={handleGenerateTitles}
                  disabled={isGeneratingTitles}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-600 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingTitles ? 'animate-spin' : ''}`} />
                  <span>Generate More</span>
                </button>
              </div>

              {/* Current Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Title
                </label>
                <input
                  type="text"
                  value={clip.title}
                  onChange={(e) => onUpdateClip({ ...clip, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Click to Apply Alternative Title
                </h5>
                {generatedTitles.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => onUpdateClip({ ...clip, title: t })}
                    className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs font-semibold text-slate-200 hover:border-violet-500 hover:bg-slate-900 transition flex items-center justify-between group"
                  >
                    <span>{t}</span>
                    <Check className="h-3.5 w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL MEDIA READY COPY */}
          {activeTab === 'social' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div>
                <h4 className="text-sm font-bold text-white">Social Media Captions</h4>
                <p className="text-xs text-slate-400">
                  Ready-to-copy tailored captions with viral hashtags.
                </p>
              </div>

              {/* YouTube Shorts */}
              <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">YouTube Shorts</span>
                  <button
                    onClick={() => handleCopyText(clip.social?.youtube || clip.social?.description || '', 'yt')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'yt' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'yt' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-3">
                  {clip.social?.youtube || clip.social?.description}
                </p>
              </div>

              {/* TikTok */}
              <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">TikTok Caption</span>
                  <button
                    onClick={() => handleCopyText(clip.social?.tiktok || clip.social?.description || '', 'tt')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tt' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'tt' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-3">
                  {clip.social?.tiktok || clip.social?.description}
                </p>
              </div>

              {/* Instagram Reels */}
              <div className="space-y-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400">Instagram Reels</span>
                  <button
                    onClick={() => handleCopyText(clip.social?.instagram || clip.social?.description || '', 'ig')}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'ig' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'ig' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-3">
                  {clip.social?.instagram || clip.social?.description}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: STICKERS & OVERLAYS */}
          {activeTab === 'overlays' && (
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div>
                <h4 className="text-sm font-bold text-white">Stickers &amp; Text Overlays</h4>
                <p className="text-xs text-slate-400">
                  Boost engagement with animated emojis and retention banners.
                </p>
              </div>

              {/* Emoji Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Animated Emoji Sticker
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🔥', '😱', '⚡', '🤯', '💡', '🚀', '👀', '💯', 'none'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedSticker(emoji === 'none' ? '' : emoji)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition ${
                        (selectedSticker === emoji || (!selectedSticker && emoji === 'none'))
                          ? 'border-cyan-400 bg-cyan-950/30'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      {emoji === 'none' ? <span className="text-xs text-slate-500">Off</span> : emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Banner Text */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Top Banner Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WAIT FOR THE END, OR UNPOPULAR TRUTH"
                  value={customOverlay}
                  onChange={(e) => setCustomOverlay(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['WAIT FOR IT...', 'MUST WATCH 🚨', 'DO NOT MISS THIS', 'PART 1'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCustomOverlay(preset)}
                      className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:text-white"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Canvas subtitle renderer helper for the live editor
function renderCanvasSubtitle(
  ctx: CanvasRenderingContext2D,
  caption: TimedCaption,
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
  const words = caption.words && caption.words.length > 0
    ? caption.words
    : caption.text.split(' ').map((w) => ({ word: w, start: 0, end: 9999 }));

  const totalText = words.map((w) => w.word).join(' ');
  const totalWidth = ctx.measureText(totalText).width;
  let currentX = (width - totalWidth) / 2;

  ctx.lineWidth = Math.max(3, Math.floor(fontSize * 0.16));
  ctx.strokeStyle = '#000000';

  for (const w of words) {
    const wordWidth = ctx.measureText(w.word + ' ').width;
    const wordCenterX = currentX + wordWidth / 2;
    const isActive = currentTime >= w.start && currentTime <= w.end;

    if (preset === 'bold') {
      ctx.fillStyle = isActive ? '#facc15' : '#ffffff';
    } else if (preset === 'neon') {
      ctx.fillStyle = isActive ? '#06b6d4' : '#f43f5e';
      if (isActive) {
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
      }
    } else if (preset === 'impact') {
      ctx.fillStyle = isActive ? '#ef4444' : '#ffffff';
    } else if (preset === 'karaoke') {
      ctx.fillStyle = isActive ? '#22c55e' : '#cbd5e1';
      if (isActive) {
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
      }
    } else {
      ctx.fillStyle = isActive ? '#fbbf24' : '#ffffff';
    }

    ctx.strokeText(w.word.toUpperCase(), wordCenterX, posY);
    ctx.fillText(w.word.toUpperCase(), wordCenterX, posY);
    currentX += wordWidth;
  }

  ctx.restore();
}
