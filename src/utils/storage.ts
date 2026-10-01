import { Project, AppSettings } from '../types';
import { INITIAL_PROJECTS } from './sampleData';

const STORAGE_KEYS = {
  PROJECTS: 'pulsecut_projects_v1',
  ACTIVE_PROJECT: 'pulsecut_active_project_id',
  SETTINGS: 'pulsecut_settings_v1',
};

export const APP_ID = '3554ce10-6a15-4abd-ba48-1d1ea14c8d65';

export const DEFAULT_SETTINGS: AppSettings = {
  appId: APP_ID,
  studioWorkspaceId: 'pcut-ws-3554ce10',
  theme: 'dark',
  defaultAspectRatio: '9:16',
  defaultCaptionPreset: 'bold',
  defaultExportQuality: '1080p',
  language: 'English (US)',
  autoSave: true,
  subjectTrackingEnabled: true,
};

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed: Project[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    // Auto-heal legacy 403 URLs
    const sanitized = parsed.map((p) => {
      if (p.videoUrl?.includes('commondatastorage.googleapis.com')) {
        return {
          ...p,
          videoUrl: p.name.includes('Spatial') ? '/api/videos/sample-tech.mp4' : '/api/videos/sample-podcast.mp4',
        };
      }
      return p;
    });
    return sanitized;
  } catch (e) {
    console.error('Failed to load projects from storage', e);
    return INITIAL_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to storage', e);
  }
}

export function loadActiveProjectId(fallbackId: string): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT) || fallbackId;
  } catch {
    return fallbackId;
  }
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
  } catch (e) {
    console.error('Failed to save active project ID', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
