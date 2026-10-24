import { ProjectState, MediaClip, AudioTrack, TrackingPoint3D, Tracked3DElement } from '../types/editor.ts';
import { createDefaultClips, createDefaultAudioTracks, createDefault3DTracking } from '../data/sampleMedia.ts';

export interface ProjectMetadata {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  clipsCount: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '21:9';
  updatedAt: string;
  createdAt: string;
  effectsCount: number;
  shareCode?: string;
}

export interface StoredProjectData {
  metadata: ProjectMetadata;
  state: ProjectState;
}

const STORAGE_KEY = 'ninztro_saved_projects_v1';

export interface ProjectCreateOptions {
  canvasWidth?: number;
  canvasHeight?: number;
  aspectRatioLabel?: '16:9' | '9:16' | '1:1' | '4:5' | '21:9';
  fps?: number;
}

/**
 * Creates a brand new default empty/starter project with configurable resolution & fps (30 to 144 FPS)
 */
export function createNewProjectState(title = 'Project Baru', options?: ProjectCreateOptions): ProjectState {
  const clips = createDefaultClips();
  const audio = createDefaultAudioTracks();
  const { trackingPoints, trackedElements } = createDefault3DTracking();

  const fps = Math.min(144, Math.max(30, options?.fps ?? 30));
  const canvasWidth = options?.canvasWidth ?? 1920;
  const canvasHeight = options?.canvasHeight ?? 1080;
  const aspectRatioLabel = options?.aspectRatioLabel ?? (canvasWidth === 1080 && canvasHeight === 1920 ? '9:16' : '16:9');

  return {
    title,
    canvasWidth,
    canvasHeight,
    aspectRatioLabel,
    fps,
    currentTime: 0,
    duration: 12.0,
    isPlaying: false,
    selectedClipId: clips[0]?.id || null,
    selected3DElementId: trackedElements[0]?.id || null,
    selectedAudioTrackId: audio[0]?.id || null,
    clips,
    audioTracks: audio,
    trackingPoints,
    trackedElements,
    isTrackingModeActive: false,
    activeTab: 'media',
    beatSyncEnabled: false,
    cameraFrustumVisible: false,
  };
}

/**
 * Generates an export shareable link and compact project payload code
 */
export function generateShareableLink(project: ProjectState): { shareLink: string; shareCode: string } {
  // Create clean lightweight representation for sharing
  const sharePayload = {
    v: 1,
    title: project.title,
    aspect: project.aspectRatioLabel,
    duration: project.duration,
    clipsCount: project.clips.length,
    trackedCount: project.trackedElements.length,
    timestamp: Date.now(),
  };

  const shareCode = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .slice(0, 16);

  // Generates canonical share URL for the project
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ninztro.studio';
  const shareLink = `${baseUrl}/?share=${shareCode}&title=${encodeURIComponent(project.title)}`;

  return { shareLink, shareCode };
}

/**
 * Loads all user saved projects from LocalStorage, falling back to starter projects
 */
export function loadProjectsFromStorage(): StoredProjectData[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load projects from storage:', err);
  }

  // Fallback initial starter projects
  const starter1 = createNewProjectState('Cyberpunk Tokyo Motion');
  const starter2 = createNewProjectState('Alpine Golden Sunset 4K');
  starter2.aspectRatioLabel = '16:9';
  starter2.duration = 8.5;

  const starter3 = createNewProjectState('Street Action Reel');
  starter3.aspectRatioLabel = '9:16';
  starter3.duration = 15.0;

  const initialProjects: StoredProjectData[] = [
    {
      metadata: {
        id: 'proj-default-1',
        title: starter1.title,
        thumbnailUrl: starter1.clips[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
        duration: starter1.duration,
        clipsCount: starter1.clips.length,
        aspectRatio: '16:9',
        updatedAt: '2 jam yang lalu',
        createdAt: '24 Okt 2026',
        effectsCount: starter1.trackedElements.length,
        shareCode: 'ninz-cyb70',
      },
      state: starter1,
    },
    {
      metadata: {
        id: 'proj-default-2',
        title: starter2.title,
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        duration: starter2.duration,
        clipsCount: 2,
        aspectRatio: '16:9',
        updatedAt: 'Kemarin',
        createdAt: '23 Okt 2026',
        effectsCount: 3,
        shareCode: 'ninz-alp99',
      },
      state: starter2,
    },
    {
      metadata: {
        id: 'proj-default-3',
        title: starter3.title,
        thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        duration: starter3.duration,
        clipsCount: 3,
        aspectRatio: '9:16',
        updatedAt: '3 hari yang lalu',
        createdAt: '21 Okt 2026',
        effectsCount: 5,
        shareCode: 'ninz-act45',
      },
      state: starter3,
    },
  ];

  saveProjectsToStorage(initialProjects);
  return initialProjects;
}

/**
 * Persists list of projects to LocalStorage
 */
export function saveProjectsToStorage(projects: StoredProjectData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.warn('Failed to save projects to storage:', err);
  }
}
