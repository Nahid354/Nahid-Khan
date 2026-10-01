import React, { useState } from 'react';
import {
  FolderOpen,
  Film,
  Clock,
  Trash2,
  Edit2,
  Copy,
  Plus,
  Play,
  ArrowRight,
  Layers,
  Search,
  Check,
  X,
} from 'lucide-react';
import { Project } from '../types';
import { formatDate, formatTime } from '../utils/formatters';

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId: string;
  onOpenProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
  onNewVideoClick: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
  onNewVideoClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (p: Project) => {
    setEditingId(p.id);
    setEditName(p.name);
  };

  const saveRename = (id: string) => {
    if (editName.trim()) {
      onRenameProject(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Project Library</span>
            <span className="rounded-full bg-violet-600/20 px-3 py-0.5 text-xs font-bold text-violet-300 border border-violet-500/30">
              {projects.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your long-form video repurposing workspaces and generated shorts.
          </p>
        </div>

        <button
          onClick={onNewVideoClick}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search projects by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try matching another search term.' : 'Upload a video to create your first project.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`group flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-xl transition ${
                activeProjectId === project.id
                  ? 'border-violet-500/60 bg-slate-900/90 shadow-violet-500/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-slate-800">
                  <img
                    src={
                      project.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={project.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-2.5 left-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {project.clips.length} Clips
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                    Duration: {formatTime(project.videoDuration)}
                  </div>
                </div>

                {/* Name / Rename Input */}
                <div>
                  {editingId === project.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(project.id)}
                        className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-500"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {project.name}
                      </h3>
                      <button
                        onClick={() => startRename(project)}
                        className="opacity-0 group-hover:opacity-100 transition rounded p-1 text-slate-400 hover:text-white"
                        title="Rename Project"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {formatDate(project.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-slate-500" />
                      {project.clips.length} viral shorts
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-slate-400 hover:border-rose-500/50 hover:text-rose-400 transition"
                  title="Delete Project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => onOpenProject(project.id)}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500 cursor-pointer"
                >
                  <span>Open Project</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
