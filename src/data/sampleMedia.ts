import { MediaClip, AudioTrack, TrackingPoint3D, Tracked3DElement } from '../types/editor.ts';
import { DEFAULT_COLOR_GRADE } from '../utils/colorGrading.ts';

// High-definition sample videos & photos (cinematic and cyberpunk footage)
export const SAMPLE_MEDIA_LIBRARY: {
  id: string;
  name: string;
  type: 'video' | 'photo';
  category: 'Cinematic' | 'Cyberpunk' | 'Nature' | 'Urban';
  url: string;
  thumbnail: string;
  duration: number;
}[] = [
  {
    id: 'sample-cyber-drive',
    name: 'Cyberpunk Neon Highway',
    type: 'video',
    category: 'Cyberpunk',
    // Ultra-reliable public domain high-res creative commons video
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    duration: 15,
  },
  {
    id: 'sample-tokyo-night',
    name: 'Neo Tokyo Night Market',
    type: 'video',
    category: 'Urban',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
    duration: 15,
  },
  {
    id: 'sample-drone-sunset',
    name: 'Golden Alpine Horizon',
    type: 'photo',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    duration: 5,
  },
  {
    id: 'sample-street-dancer',
    name: 'Cinematic Street Motion',
    type: 'video',
    category: 'Cinematic',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    duration: 12,
  },
  {
    id: 'sample-cyber-portrait',
    name: 'Anime Cyberpunk Portrait',
    type: 'photo',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    duration: 5,
  },
];

// Curated royalty-free music & SFX tracks
export const SAMPLE_AUDIO_LIBRARY: {
  id: string;
  name: string;
  category: 'music' | 'sfx';
  duration: number;
  url: string;
  bpm?: number;
  waveformPeaks: number[];
}[] = [
  {
    id: 'audio-synthwave',
    name: 'Synthwave Neon Drive (120 BPM)',
    category: 'music',
    duration: 18,
    url: 'https://actions.google.com/sounds/v1/science_fiction/scifi_engine_power_up.ogg',
    bpm: 120,
    waveformPeaks: [0.2, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.85, 0.5, 0.75, 0.9, 0.6, 0.4, 0.8, 0.95, 0.7, 0.5, 0.3],
  },
  {
    id: 'audio-bass-drop',
    name: 'Cinematic Sub Bass Rumble',
    category: 'sfx',
    duration: 6,
    url: 'https://actions.google.com/sounds/v1/science_fiction/alien_spaceship_drone.ogg',
    waveformPeaks: [0.9, 0.85, 0.7, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05],
  },
  {
    id: 'audio-glitch-swoosh',
    name: 'Whip Pan Transition Swoosh',
    category: 'sfx',
    duration: 2,
    url: 'https://actions.google.com/sounds/v1/science_fiction/whoosh_air_burst.ogg',
    waveformPeaks: [0.1, 0.3, 0.8, 0.95, 0.4, 0.1],
  },
  {
    id: 'audio-laser-ping',
    name: '3D Tracking Lock Beep',
    category: 'sfx',
    duration: 1.5,
    url: 'https://actions.google.com/sounds/v1/science_fiction/short_laser_blast.ogg',
    waveformPeaks: [0.95, 0.7, 0.4, 0.2, 0.05],
  },
];

export function createDefaultClips(): MediaClip[] {
  return [
    {
      id: 'clip-1',
      name: 'Cyberpunk Neon Highway',
      type: 'video',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      duration: 10,
      inPoint: 0,
      outPoint: 6.5,
      playbackSpeed: 1,
      aspectRatio: 16 / 9,
      width: 1920,
      height: 1080,
      keyframes: {
        posX: [{ id: 'k1', time: 0, value: 0, easing: 'ease-in-out' }, { id: 'k2', time: 6, value: 20, easing: 'ease-in-out' }],
        posY: [{ id: 'k3', time: 0, value: 0, easing: 'ease-in-out' }],
        scale: [{ id: 'k4', time: 0, value: 1.0, easing: 'ease-in-out' }, { id: 'k5', time: 6, value: 1.15, easing: 'ease-in-out' }],
        rotation: [{ id: 'k6', time: 0, value: 0, easing: 'linear' }, { id: 'k7', time: 6, value: -1.5, easing: 'ease-out' }],
        opacity: [{ id: 'k8', time: 0, value: 1, easing: 'linear' }],
        brightness: [{ id: 'k9', time: 0, value: 100, easing: 'linear' }],
        blur: [{ id: 'k10', time: 0, value: 0, easing: 'linear' }],
        depth3D: [{ id: 'k11', time: 0, value: 1.0, easing: 'linear' }],
      },
      colorGrade: {
        ...DEFAULT_COLOR_GRADE,
        preset: 'cyberpunk',
        filterIntensity: 85,
        exposure: 5,
        contrast: 30,
        saturation: 35,
        temperature: -15,
        tint: 30,
        highlights: 20,
        shadows: -25,
        bloom: 35,
        vignette: 30,
      },
      lighting: {
        enabled: true,
        type: 'anamorphicFlare',
        intensity: 65,
        color: '#06b6d4',
        x: 48,
        y: 40,
        size: 90,
        rotation: 0,
        blendMode: 'screen',
      },
      transitionIn: { type: 'zoomBlur', duration: 0.8 },
      transitionOut: { type: 'whipGlitch', duration: 0.6 },
    },
    {
      id: 'clip-2',
      name: 'Anime Cyberpunk Portrait',
      type: 'photo',
      src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
      duration: 6,
      inPoint: 0,
      outPoint: 5.5,
      playbackSpeed: 1,
      aspectRatio: 16 / 9,
      width: 1920,
      height: 1080,
      keyframes: {
        posX: [{ id: 'k21', time: 0, value: 0, easing: 'linear' }],
        posY: [{ id: 'k22', time: 0, value: 0, easing: 'linear' }],
        scale: [{ id: 'k23', time: 0, value: 1.15, easing: 'ease-out' }, { id: 'k24', time: 5, value: 1.0, easing: 'ease-out' }],
        rotation: [],
        opacity: [{ id: 'k25', time: 0, value: 1, easing: 'linear' }],
        brightness: [],
        blur: [],
      },
      colorGrade: {
        ...DEFAULT_COLOR_GRADE,
        preset: 'animeShinkai',
        filterIntensity: 90,
        exposure: 10,
        contrast: 15,
        saturation: 40,
        temperature: 10,
        tint: 15,
        bloom: 40,
        vignette: 20,
      },
      lighting: {
        enabled: true,
        type: 'dynamicLightLeak',
        intensity: 50,
        color: '#f59e0b',
        x: 75,
        y: 25,
        size: 110,
        rotation: 25,
        blendMode: 'screen',
      },
      transitionIn: { type: 'lightLeakFlash', duration: 0.7 },
      transitionOut: { type: 'none', duration: 0.5 },
    },
  ];
}

export function createDefaultAudioTracks(): AudioTrack[] {
  return [
    {
      id: 'audio-trk-1',
      name: 'Cyberpunk Synth Beats',
      src: 'https://actions.google.com/sounds/v1/science_fiction/scifi_engine_power_up.ogg',
      category: 'music',
      duration: 12,
      startTime: 0,
      inPoint: 0,
      outPoint: 12,
      volume: 85,
      muted: false,
      fadeIn: 0.5,
      fadeOut: 1.2,
    },
    {
      id: 'audio-trk-2',
      name: 'Whip Swoosh SFX',
      src: 'https://actions.google.com/sounds/v1/science_fiction/whoosh_air_burst.ogg',
      category: 'sfx',
      duration: 2,
      startTime: 6.2,
      inPoint: 0,
      outPoint: 2,
      volume: 95,
      muted: false,
      fadeIn: 0,
      fadeOut: 0.3,
    },
  ];
}

export function createDefault3DTracking(): {
  trackingPoints: TrackingPoint3D[];
  trackedElements: Tracked3DElement[];
} {
  // Pre-tracked 3D points for sample clip
  const points: TrackingPoint3D[] = [];
  const duration = 6.5;
  const count = 30;

  for (let i = 0; i <= count; i++) {
    const t = (i / count) * duration;
    const progress = i / count;
    points.push({
      id: `pt-${i}`,
      time: t,
      screenX: 0.48 + Math.sin(progress * Math.PI) * 0.12,
      screenY: 0.42 + Math.cos(progress * Math.PI * 1.5) * 0.05,
      depthZ: 1.2 + Math.sin(progress * Math.PI) * 0.5,
      pitch: Math.sin(progress * 3) * 12,
      yaw: -15 + progress * 30,
      roll: Math.sin(progress * 2) * 4,
      confidence: 0.98,
    });
  }

  const elements: Tracked3DElement[] = [
    {
      id: 'trk-elem-1',
      name: 'Cyberpunk Target Lock HUD',
      type: 'cyberReticle',
      text: 'LOCK [35.6895°N, 139.6917°E]',
      color: '#06b6d4',
      size: 1.1,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 20,
      opacity: 0.95,
      glow: true,
      visible: true,
      trackId: 'track-camera-1',
    },
    {
      id: 'trk-elem-2',
      name: '3D Floating Title',
      type: 'text3d',
      text: 'NINZTRO V3.0',
      color: '#f43f5e',
      size: 1.25,
      offsetX: 0,
      offsetY: -75,
      offsetZ: 40,
      opacity: 1,
      glow: true,
      visible: true,
      trackId: 'track-camera-1',
    },
    {
      id: 'trk-elem-3',
      name: '3D Callout Vector',
      type: 'calloutPin',
      text: 'VELOCITY: 88.4 KM/H [SOLVED]',
      color: '#10b981',
      size: 0.9,
      offsetX: 80,
      offsetY: -40,
      offsetZ: 10,
      opacity: 0.9,
      glow: true,
      visible: true,
      trackId: 'track-camera-1',
    },
    {
      id: 'trk-elem-4',
      name: '3D Hologram Cube Wireframe',
      type: 'wireframeCube',
      text: 'CUBE NULL',
      color: '#a855f7',
      size: 1.0,
      offsetX: -80,
      offsetY: 20,
      offsetZ: 30,
      opacity: 0.85,
      glow: true,
      visible: true,
      trackId: 'track-camera-1',
    },
  ];

  return { trackingPoints: points, trackedElements: elements };
}
