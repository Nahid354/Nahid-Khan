/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { ClipsView } from './components/ClipsView';
import { EditorView } from './components/EditorView';
import { ProjectsView } from './components/ProjectsView';
import { SettingsView } from './components/SettingsView';
import { ExportModal } from './components/ExportModal';
import { ClipPreviewModal } from './components/ClipPreviewModal';
import { Project, GeneratedClip, AppSettings } from './types';
import {
  loadProjects,
  saveProjects,
  loadActiveProjectId,
  saveActiveProjectId,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { INITIAL_PROJECTS } from './utils/sampleData';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadActiveProjectId(projects[0]?.id || '')
  );
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Active clip being edited or previewed
  const [selectedClip, setSelectedClip] = useState<GeneratedClip | null>(null);
  const [exportClipTarget, setExportClipTarget] = useState<GeneratedClip | null>(null);
  const [previewClipTarget, setPreviewClipTarget] = useState<GeneratedClip | null>(null);

  // Sync projects to storage
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  // Sync active project to storage
  useEffect(() => {
    if (activeProjectId) {
      saveActiveProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  // Sync settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Active project lookup
  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Handle new project creation from Upload view
  const handleAnalysisComplete = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    if (newProject.clips && newProject.clips.length > 0) {
      setSelectedClip(newProject.clips[0]);
    }
    setCurrentTab('clips');
  };

  // Select 1-click sample video
  const handleSelectSample = (sampleId: string) => {
    const existing = projects.find((p) => p.id.includes(sampleId.replace('sample-', '')));
    if (existing) {
      setActiveProjectId(existing.id);
      setSelectedClip(existing.clips[0] || null);
      setCurrentTab('clips');
      return;
    }

    // Otherwise clone from initial projects
    const matched = INITIAL_PROJECTS.find((p) => p.id.includes(sampleId.replace('sample-', ''))) || INITIAL_PROJECTS[0];
    const cloned: Project = {
      ...matched,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [cloned, ...prev]);
    setActiveProjectId(cloned.id);
    setSelectedClip(cloned.clips[0] || null);
    setCurrentTab('clips');
  };

  // Open existing project
  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p && p.clips.length > 0) {
      setSelectedClip(p.clips[0]);
    }
    setCurrentTab('clips');
  };

  // Rename project
  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (activeProjectId === id && remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Open clip in Editor
  const handleOpenEditor = (clip: GeneratedClip) => {
    setSelectedClip(clip);
    setCurrentTab('editor');
  };

  // Update a single clip in the active project
  const handleUpdateClip = (updatedClip: GeneratedClip) => {
    setSelectedClip(updatedClip);
    if (!activeProject) return;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === activeProject.id) {
          const updatedClips = proj.clips.map((c) =>
            c.id === updatedClip.id ? updatedClip : c
          );
          return { ...proj, clips: updatedClips };
        }
        return proj;
      })
    );
  };

  // Update clip title specifically
  const handleUpdateClipTitle = (clipId: string, newTitle: string) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === activeProject.id) {
          const updatedClips = proj.clips.map((c) =>
            c.id === clipId ? { ...c, title: newTitle } : c
          );
          return { ...proj, clips: updatedClips };
        }
        return proj;
      })
    );
  };

  return (
    <div
      className={`min-h-screen ${
        settings.theme === 'midnight'
          ? 'bg-[#080d1a] text-slate-100'
          : settings.theme === 'slate'
          ? 'bg-[#0f172a] text-slate-100'
          : 'bg-[#0a0e17] text-slate-100'
      }`}
    >
      {/* Universal Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewVideoClick={() => setCurrentTab('upload')}
        activeProjectName={activeProject?.name}
        appId={settings.appId}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            onUploadClick={() => setCurrentTab('upload')}
            onOpenProject={handleOpenProject}
            onSelectDemoVideo={handleSelectSample}
          />
        )}

        {/* TAB 2: UPLOAD VIDEO */}
        {currentTab === 'upload' && (
          <UploadView
            onAnalysisComplete={handleAnalysisComplete}
            onSelectSample={handleSelectSample}
          />
        )}

        {/* TAB 3: AI CLIPS GALLERY */}
        {currentTab === 'clips' && activeProject && (
          <ClipsView
            project={activeProject}
            onOpenEditor={handleOpenEditor}
            onPreviewClip={(clip) => setPreviewClipTarget(clip)}
            onExportClip={(clip) => setExportClipTarget(clip)}
            onUpdateClipTitle={handleUpdateClipTitle}
          />
        )}

        {/* TAB 4: VIDEO EDITOR */}
        {currentTab === 'editor' && activeProject && selectedClip && (
          <EditorView
            project={activeProject}
            clip={selectedClip}
            onUpdateClip={handleUpdateClip}
            onExportClip={(clip) => setExportClipTarget(clip)}
            onBackToClips={() => setCurrentTab('clips')}
          />
        )}

        {/* TAB 5: PROJECTS LIBRARY */}
        {currentTab === 'projects' && (
          <ProjectsView
            projects={projects}
            activeProjectId={activeProjectId}
            onOpenProject={handleOpenProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
            onNewVideoClick={() => setCurrentTab('upload')}
          />
        )}

        {/* TAB 6: SETTINGS */}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}
      </main>

      {/* Export Modal */}
      {exportClipTarget && activeProject && (
        <ExportModal
          isOpen={!!exportClipTarget}
          onClose={() => setExportClipTarget(null)}
          clip={exportClipTarget}
          videoUrl={activeProject.videoUrl}
        />
      )}

      {/* Preview Modal */}
      {previewClipTarget && activeProject && (
        <ClipPreviewModal
          isOpen={!!previewClipTarget}
          onClose={() => setPreviewClipTarget(null)}
          clip={previewClipTarget}
          project={activeProject}
          onOpenEditor={(clip) => {
            setPreviewClipTarget(null);
            handleOpenEditor(clip);
          }}
          onExportClip={(clip) => {
            setPreviewClipTarget(null);
            setExportClipTarget(clip);
          }}
        />
      )}
    </div>
  );
}
