export type AspectRatio = '9:16' | '1:1' | '16:9';

export type CaptionPreset =
  | 'bold'
  | 'clean'
  | 'neon'
  | 'impact'
  | 'karaoke'
  | 'classic';

export interface TimedWord {
  word: string;
  start: number;
  end: number;
}

export interface TimedCaption {
  id: string;
  start: number;
  end: number;
  text: string;
  words: TimedWord[];
}

export interface FocusKeyframe {
  time: number;
  focusX: number; // 0.0 (left) to 1.0 (right), 0.5 is centered
}

export interface GeneratedClip {
  id: string;
  title: string;
  alternativeTitles: string[];
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  hook: string;
  alternativeHooks: string[];
  reason: string;
  subjectTrack: FocusKeyframe[];
  captions: TimedCaption[];
  social: {
    description: string;
    hashtags: string[];
    keywords: string[];
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    linkedin?: string;
  };
  aspectRatio?: AspectRatio;
  captionPreset?: CaptionPreset;
  customOverlayText?: string;
  customSticker?: string;
  customCropX?: number; // 0 to 1
  playbackSpeed?: number;
}

export interface Project {
  id: string;
  name: string;
  videoUrl: string;
  videoFilename?: string;
  videoDuration: number;
  fileSize?: number;
  createdAt: string;
  clips: GeneratedClip[];
  thumbnailUrl?: string;
}

export interface AppSettings {
  appId: string;
  studioWorkspaceId: string;
  theme: 'dark' | 'midnight' | 'slate';
  defaultAspectRatio: AspectRatio;
  defaultCaptionPreset: CaptionPreset;
  defaultExportQuality: '1080p' | '720p';
  language: string;
  autoSave: boolean;
  subjectTrackingEnabled: boolean;
}
