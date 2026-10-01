import React from 'react';
import {
  UploadCloud,
  Film,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  Layers,
  CheckCircle,
  TrendingUp,
  Video,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Project } from '../types';
import { formatDate } from '../utils/formatters';

interface DashboardViewProps {
  projects: Project[];
  onUploadClick: () => void;
  onOpenProject: (projectId: string) => void;
  onSelectDemoVideo: (sampleId: string) => void;
  onOpenEditorWithClip?: (project: Project, clipId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onUploadClick,
  onOpenProject,
  onSelectDemoVideo,
}) => {
  const totalClips = projects.reduce((acc, p) => acc + (p.clips?.length || 0), 0);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-8 sm:p-12 shadow-2xl">
        {/* Ambient glow backgrounds */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Nahid JR • AI YouTube to Shorts Studio • 100% Free</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Turn Long Videos &amp; YouTube Links Into{' '}
            <span className="bg-gradient-to-r from-red-500 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Viral Shorts
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            ইউটিউব লিঙ্ক কপি করে পেস্ট করুন অথবা যেকোনো ভিডিও আপলোড করুন। Nahid JR AI নিজে থেকেই সবচেয়ে আকর্ষণীয় ভাইরাল মুহূর্তগুলো খুঁজে বের করে ৯:১৬ ভার্টিক্যাল শর্টস তৈরি করে দিবে।
          </p>

          {/* Quick YouTube Link Bar on Hero */}
          <div className="rounded-2xl border border-red-500/30 bg-slate-950/80 p-2 sm:p-2.5 backdrop-blur-md shadow-2xl max-w-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full flex items-center">
                <span className="absolute left-3.5 text-red-500">
                  <Play className="h-4 w-4 fill-red-500" />
                </span>
                <input
                  type="url"
                  placeholder="Paste YouTube Link here (e.g. https://www.youtube.com/watch?v=...)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUploadClick();
                    }
                  }}
                  className="w-full rounded-xl border-0 bg-transparent pl-10 pr-3 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                onClick={onUploadClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-violet-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-red-600/30 hover:brightness-110 active:scale-95 transition cursor-pointer shrink-0"
              >
                <span>Make Shorts</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Or Upload Video File</span>
            </button>

            <button
              onClick={() => onSelectDemoVideo('sample-podcast')}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white hover:border-slate-600 active:scale-95 cursor-pointer"
            >
              <Flame className="h-4 w-4 text-amber-400" />
              <span>Try Demo: Viral Podcast</span>
            </button>
          </div>

          {/* Guarantee Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>No Watermark Added</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Smart 9:16 Reframing</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>1080p Full HD Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{projects.length}</div>
            <div className="text-xs text-slate-400 font-medium">Projects Created</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalClips}</div>
            <div className="text-xs text-slate-400 font-medium">Viral Shorts Generated</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">94.8%</div>
            <div className="text-xs text-slate-400 font-medium">Avg Virality Retention Score</div>
          </div>
        </div>
      </section>

      {/* Try Demo Presets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Test Instant Demos
            </h2>
            <p className="text-xs text-slate-400">
              No video file ready? Test the full AI highlight and reframing workflow with 1-click sample footage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'sample-podcast',
              title: 'Viral Podcast: Scaling to $10M',
              category: 'Founder Interview',
              duration: '15s',
              badge: 'Virality: 96',
              bg: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
            },
            {
              id: 'sample-tech',
              title: 'Keynote: Future of Spatial AI',
              category: 'Tech Keynote',
              duration: '15s',
              badge: 'Virality: 94',
              bg: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
            },
            {
              id: 'sample-mindset',
              title: 'The 1% Rule of Compounding Habits',
              category: 'Storytelling',
              duration: '15s',
              badge: 'Virality: 91',
              bg: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
            },
          ].map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectDemoVideo(sample.id)}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left transition hover:border-violet-500/50 hover:bg-slate-900/80 cursor-pointer"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-800 mb-3">
                <img
                  src={sample.bg}
                  alt={sample.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 rounded-md bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                  {sample.badge}
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                  <Play className="h-3 w-3 fill-white text-white" />
                  <span>{sample.duration}</span>
                </div>
              </div>

              <div className="text-xs font-semibold text-violet-400 mb-1">
                {sample.category}
              </div>
              <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition truncate">
                {sample.title}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Click to analyze</span>
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1 text-slate-300" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recent Projects
            </h2>
            <p className="text-xs text-slate-400">
              Access your previous video repurposing workspaces and generated clips.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <Film className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-white">No projects yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your first video to start automatically detecting viral moments.
            </p>
            <button
              onClick={onUploadClick}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900/90 shadow-lg"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 mb-3 border border-slate-800">
                    <img
                      src={
                        project.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={project.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-200 border border-slate-700 backdrop-blur-sm">
                      {project.clips.length} Clips Created
                    </div>
                  </div>

                  {/* Project Info */}
                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition">
                    {project.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      <span>{project.clips.length} viral shorts</span>
                    </div>
                  </div>
                </div>

                {/* Open Project Button */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">
                    100% Free Ready
                  </span>
                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-500/30 px-3.5 py-1.5 text-xs font-bold text-violet-300 transition hover:bg-violet-600 hover:text-white cursor-pointer"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
