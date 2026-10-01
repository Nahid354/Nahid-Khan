import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Sliders,
  Download,
  Flame,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { GeneratedClip, Project } from '../types';
import { formatTime } from '../utils/formatters';

interface ClipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: GeneratedClip;
  project: Project;
  onOpenEditor: (clip: GeneratedClip) => void;
  onExportClip: (clip: GeneratedClip) => void;
}

export const ClipPreviewModal: React.FC<ClipPreviewModalProps> = ({
  isOpen,
  onClose,
  clip,
  project,
  onOpenEditor,
  onExportClip,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(clip.startTime);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = clip.startTime;
      setCurrentTime(clip.startTime);
    }
  }, [isOpen, clip]);

  if (!isOpen) return null;

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (videoRef.current.currentTime >= clip.endTime || videoRef.current.currentTime < clip.startTime) {
          videoRef.current.currentTime = clip.startTime;
        }
        await videoRef.current.play();
        setIsPlaying(true);
      } catch {
        if (videoRef.current) {
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
            setIsPlaying(true);
          } catch {}
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    if (t >= clip.endTime) {
      videoRef.current.currentTime = clip.startTime;
      setCurrentTime(clip.startTime);
    }
  };

  // Find active caption
  const activeCaption = (clip.captions || []).find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-600/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                Short Preview
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span>Score: {clip.viralityScore}</span>
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-1 line-clamp-1">
              {clip.title}
            </h3>
          </div>
        </div>

        {/* Video Player Box with 9:16 Vertical Preview Frame */}
        <div className="relative mx-auto flex items-center justify-center aspect-[9/16] max-h-[460px] w-auto overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl">
          <video
            ref={videoRef}
            src={project.videoUrl}
            poster={project.thumbnailUrl}
            preload="auto"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            className="h-full w-full object-cover cursor-pointer"
          />

          {/* Subtitle Overlay */}
          {activeCaption && (
            <div className="pointer-events-none absolute bottom-12 left-4 right-4 text-center">
              <span className="caption-stroke-thick font-black uppercase text-xl sm:text-2xl text-yellow-400 font-['Montserrat'] drop-shadow-2xl">
                {activeCaption.text}
              </span>
            </div>
          )}

          {/* Sticker Overlay */}
          {clip.customSticker && (
            <div className="pointer-events-none absolute top-8 text-4xl">
              {clip.customSticker}
            </div>
          )}

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-xl backdrop-blur-sm transition hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Play className="h-6 w-6 fill-slate-950 translate-x-0.5" />
            </button>
          )}

          {/* Timecode badge */}
          <div className="absolute top-3 left-3 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-mono text-white">
            {formatTime(currentTime)} / {formatTime(clip.endTime)}
          </div>
        </div>

        {/* Hook text */}
        {clip.hook && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 text-xs">
            <span className="font-bold text-violet-300">Hook: </span>
            <span className="text-slate-300 italic">"{clip.hook}"</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime = clip.startTime;
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart Clip</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEditor(clip);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Open in Editor</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onExportClip(clip);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/30 hover:brightness-110"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Free</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
