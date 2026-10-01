import React, { useState } from 'react';
import {
  Play,
  Sliders,
  Download,
  Sparkles,
  Flame,
  Clock,
  Share2,
  Copy,
  Check,
  ChevronDown,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { GeneratedClip, Project } from '../types';
import { formatTime } from '../utils/formatters';

interface ClipsViewProps {
  project: Project;
  onOpenEditor: (clip: GeneratedClip) => void;
  onPreviewClip: (clip: GeneratedClip) => void;
  onExportClip: (clip: GeneratedClip) => void;
  onUpdateClipTitle: (clipId: string, newTitle: string) => void;
}

export const ClipsView: React.FC<ClipsViewProps> = ({
  project,
  onOpenEditor,
  onPreviewClip,
  onExportClip,
  onUpdateClipTitle,
}) => {
  const [filterScore, setFilterScore] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openTitleMenuId, setOpenTitleMenuId] = useState<string | null>(null);

  const clips = project.clips || [];
  const filteredClips = clips.filter((c) => c.viralityScore >= filterScore);

  const handleCopyCaption = (clip: GeneratedClip) => {
    const textToCopy = `${clip.title}\n\n${clip.social?.description || ''}\n\n${(clip.social?.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Project Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Project</span>
            <span>•</span>
            <span className="text-cyan-400">{project.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Generated AI Shorts</span>
            <span className="rounded-full bg-violet-600/20 px-3 py-0.5 text-xs font-bold text-violet-300 border border-violet-500/30">
              {clips.length} Viral Clips
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by AI virality score, retention hooks, and audience engagement potential.
          </p>
        </div>

        {/* Filter / Score Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Virality:</span>
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            {[
              { label: 'All Clips', minScore: 0 },
              { label: 'Top 90+ Score', minScore: 90 },
              { label: 'High Potential', minScore: 85 },
            ].map((btn) => (
              <button
                key={btn.minScore}
                onClick={() => setFilterScore(btn.minScore)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  filterScore === btn.minScore
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clips Grid */}
      {filteredClips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Flame className="mx-auto h-12 w-12 text-slate-600 mb-2" />
          <h3 className="text-base font-semibold text-white">No clips match this filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your score filter to view all generated moments.
          </p>
          <button
            onClick={() => setFilterScore(0)}
            className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Show All Clips
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClips.map((clip, index) => (
            <div
              key={clip.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl transition hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="space-y-4">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-black text-violet-300 border border-violet-500/40">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Clip #{index + 1}
                    </span>
                  </div>

                  {/* Virality Score Badge */}
                  <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 px-3 py-1 border border-amber-500/30">
                    <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-white">
                      Score: {clip.viralityScore}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Video Preview Aspect Box */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 group-hover:border-slate-700">
                  <video
                    src={`${project.videoUrl}#t=${clip.startTime},${clip.endTime}`}
                    poster={project.thumbnailUrl}
                    preload="auto"
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center transition group-hover:bg-slate-950/20">
                    <button
                      onClick={() => onPreviewClip(clip)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-xl backdrop-blur-md transition hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <Play className="h-5 w-5 fill-slate-950 translate-x-0.5" />
                    </button>
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-mono font-bold text-white backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{formatTime(clip.duration)}</span>
                  </div>

                  {/* Timestamp Span */}
                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-1 text-[10px] font-mono text-slate-300">
                    {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                  </div>
                </div>

                {/* Title & Alternative Titles Dropdown */}
                <div className="relative space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight">
                      {clip.title}
                    </h3>
                    {clip.alternativeTitles && clip.alternativeTitles.length > 0 && (
                      <button
                        onClick={() =>
                          setOpenTitleMenuId(openTitleMenuId === clip.id ? null : clip.id)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
                        title="Switch title"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Alternative Titles Menu */}
                  {openTitleMenuId === clip.id && (
                    <div className="absolute z-20 left-0 right-0 mt-1 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        AI Alternative Titles:
                      </div>
                      {clip.alternativeTitles.map((altTitle, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => {
                            onUpdateClipTitle(clip.id, altTitle);
                            setOpenTitleMenuId(null);
                          }}
                          className="w-full text-left rounded-xl px-2.5 py-1.5 text-xs text-slate-200 hover:bg-violet-600/30 hover:text-white transition"
                        >
                          {altTitle}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Hook Highlight */}
                {clip.hook && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-violet-300 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Opening Hook (First 3s):</span>
                    </div>
                    <p className="text-slate-300 italic font-medium">"{clip.hook}"</p>
                  </div>
                )}

                {/* Reason selected */}
                {clip.reason && (
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{clip.reason}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewClip(clip)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleCopyCaption(clip)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer"
                    title="Copy ready social media text"
                  >
                    {copiedId === clip.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Caption</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditor(clip)}
                    className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/30 hover:bg-violet-500 cursor-pointer"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Edit Clip</span>
                  </button>

                  <button
                    onClick={() => onExportClip(clip)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Free</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
