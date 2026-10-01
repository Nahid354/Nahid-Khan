import React from 'react';
import {
  Scissors,
  LayoutDashboard,
  UploadCloud,
  Film,
  Sliders,
  FolderOpen,
  Settings,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewVideoClick: () => void;
  activeProjectName?: string;
  appId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNewVideoClick,
  activeProjectName,
  appId = '3554ce10-6a15-4abd-ba48-1d1ea14c8d65',
}) => {
  const [copiedAppId, setCopiedAppId] = React.useState(false);

  const handleCopyAppId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(appId);
    setCopiedAppId(true);
    setTimeout(() => setCopiedAppId(false), 2000);
  };
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Video', icon: UploadCloud },
    { id: 'clips', label: 'AI Clips', icon: Film },
    { id: 'editor', label: 'Editor', icon: Sliders },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 text-left transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/25">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Scissors className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  Nahid <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">JR</span>
                </span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-400 border border-emerald-500/20">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                AI Viral Shorts &amp; Repurposing Studio
              </p>
            </div>
          </button>

          {activeProjectName && (
            <div className="hidden md:flex items-center pl-4 ml-4 border-l border-slate-800">
              <span className="text-xs text-slate-500 mr-2">Project:</span>
              <span className="text-xs font-semibold text-slate-300 max-w-[180px] truncate">
                {activeProjectName}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-slate-800/90 bg-slate-900/60 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action button & Guarantee Badge */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyAppId}
            title={`App ID: ${appId} (Click to copy)`}
            className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-400 bg-slate-900 border border-slate-800 hover:border-violet-500/50 hover:text-cyan-300 px-2.5 py-1 rounded-full transition cursor-pointer"
          >
            <span className="text-violet-400 font-bold">ID:</span>
            <span>{appId.slice(0, 8)}...</span>
            <span className="text-[10px] text-emerald-400 font-sans font-semibold">
              {copiedAppId ? 'Copied!' : 'Copy'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            <span>No Watermark • Unlimited</span>
          </div>

          <button
            onClick={onNewVideoClick}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>New Video</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-1 bg-slate-950/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
