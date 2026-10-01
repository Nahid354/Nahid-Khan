import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Film,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { GeneratedClip, AspectRatio, CaptionPreset } from '../types';
import { exportClipVideo } from '../utils/videoExporter';
import { formatTime } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: GeneratedClip;
  videoUrl: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clip,
  videoUrl,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setErrorMsg(null);
    setDownloadUrl(null);

    try {
      const blob = await exportClipVideo({
        videoUrl,
        clip,
        resolution,
        aspectRatio: clip.aspectRatio || '9:16',
        captionPreset: clip.captionPreset || 'bold',
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusMessage(msg);
        },
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Automatically trigger download
      const cleanTitle = clip.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PulseCut_${cleanTitle}_${resolution}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsExporting(false);
    } catch (err: any) {
      console.error('Export failed:', err);
      setErrorMsg(err.message || 'Export failed. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export Ready Short</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Render &amp; Download Clip
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            "{clip.title}" ({formatTime(clip.duration)}s)
          </p>
        </div>

        {/* 100% Free Guarantee Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold">Zero Watermark Guarantee</div>
            <div className="text-[11px] text-emerald-400/80">
              Clean 1080p full-speed rendering with no logo or watermark added.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Export Settings (when not actively exporting) */}
        {!isExporting && !downloadUrl && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Export Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setResolution('1080p')}
                  className={`flex flex-col rounded-2xl border p-3.5 text-left transition ${
                    resolution === '1080p'
                      ? 'border-cyan-400 bg-cyan-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black text-white">1080p Full HD</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Recommended for TikTok &amp; Shorts</span>
                </button>

                <button
                  onClick={() => setResolution('720p')}
                  className={`flex flex-col rounded-2xl border p-3.5 text-left transition ${
                    resolution === '720p'
                      ? 'border-cyan-400 bg-cyan-950/30 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black text-white">720p Fast HD</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Ultra-fast export &amp; smaller file</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Aspect Ratio:</span>
                <span className="font-semibold text-white">{clip.aspectRatio || '9:16'} Vertical</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Captions:</span>
                <span className="font-semibold text-white">Burned In ({clip.captionPreset || 'bold'})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <span className="font-semibold text-white">{formatTime(clip.duration)}s</span>
              </div>
            </div>

            <button
              onClick={handleStartExport}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 transition hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Start Free Export</span>
            </button>
          </div>
        )}

        {/* Progress Bar (during rendering) */}
        {isExporting && (
          <div className="space-y-4 py-4 text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/20 text-cyan-400 border border-violet-500/30">
              <RefreshCw className="h-10 w-10 animate-spin" />
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white">Rendering Viral Short...</div>
              <div className="text-xs text-slate-400">{statusMessage}</div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-end text-xs font-mono text-cyan-400 font-bold">
                {progress}%
              </div>
            </div>
          </div>
        )}

        {/* Download Ready State */}
        {downloadUrl && (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">Export Complete!</h4>
              <p className="text-xs text-slate-400">
                Your video has been rendered without watermarks and downloaded to your device.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={downloadUrl}
                download={`PulseCut_${clip.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${resolution}.mp4`}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white hover:brightness-110"
              >
                <Download className="h-4 w-4" />
                <span>Download Again</span>
              </a>
              <button
                onClick={onClose}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-200 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
