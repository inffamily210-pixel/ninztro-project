export type MediaType = 'video' | 'photo';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier' | 'spring';

export interface KeyframePoint {
  id: string;
  time: number; // in seconds
  value: number;
  easing: EasingType;
}

export interface KeyframeChannels {
  posX: KeyframePoint[];
  posY: KeyframePoint[];
  scale: KeyframePoint[];
  rotation: KeyframePoint[];
  opacity: KeyframePoint[];
  brightness: KeyframePoint[];
  blur: KeyframePoint[];
  depth3D?: KeyframePoint[];
}

export type FilterPresetId =
  | 'normal'
  | 'cyberpunk'
  | 'kodak35mm'
  | 'tealOrange'
  | 'animeShinkai'
  | 'neonNoir'
  | 'aerochrome'
  | 'bwSilver'
  | 'dramaticDark'
  | 'goldenHour';

export interface ColorGradeSettings {
  preset: FilterPresetId;
  filterIntensity: number; // 0 to 100
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  saturation: number; // -100 to 100
  temperature: number; // -100 to 100 (Cool to Warm)
  tint: number; // -100 to 100 (Green to Magenta)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  vignette: number; // 0 to 100
  grain: number; // 0 to 100
  bloom: number; // 0 to 100
  liftColor: string; // hex shadow tint
  gammaColor: string; // hex midtone tint
  gainColor: string; // hex highlight tint
}

export interface LightingEffectSettings {
  enabled: boolean;
  type: 'none' | 'anamorphicFlare' | 'dynamicLightLeak' | 'spotlightDark' | 'neonRimLight';
  intensity: number; // 0 to 100
  color: string; // hex color
  x: number; // 0 to 100 %
  y: number; // 0 to 100 %
  size: number; // 10 to 200 %
  rotation: number; // degrees
  blendMode: 'screen' | 'lighten' | 'color-dodge' | 'multiply';
}

export type TransitionType =
  | 'none'
  | 'zoomBlur'
  | 'whipGlitch'
  | 'lightLeakFlash'
  | 'cube3d'
  | 'opticalMorph'
  | 'crossDissolve';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // seconds, e.g. 0.8
}

export interface SpeedRampPoint {
  id: string;
  timePercent: number; // 0 to 1
  speed: number; // 0.1x to 5.0x
}

export interface MediaClip {
  id: string;
  name: string;
  type: MediaType;
  src: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  inPoint: number; // trim start
  outPoint: number; // trim end
  playbackSpeed: number; // 0.25 to 4
  speedRampEnabled?: boolean;
  speedRampCurve?: SpeedRampPoint[];
  aspectRatio: number;
  width: number;
  height: number;
  // Keyframe animation on clip
  keyframes: KeyframeChannels;
  // Color grade & lighting on clip
  colorGrade: ColorGradeSettings;
  lighting: LightingEffectSettings;
  transitionIn: TransitionConfig;
  transitionOut: TransitionConfig;
}

export interface TrackingPoint3D {
  id: string;
  time: number;
  screenX: number; // normalized 0..1
  screenY: number; // normalized 0..1
  depthZ: number; // simulated depth 0.2 .. 3.0
  pitch: number;
  yaw: number;
  roll: number;
  confidence: number;
}

export type Effect3DCategory =
  | 'all'
  | 'cyberHud'
  | 'typography3d'
  | 'calloutPins'
  | 'geometric3d'
  | 'particlesVfx'
  | 'cameraMotion';

export type Attached3DType =
  | 'text3d'
  | 'cyberReticle'
  | 'wireframeCube'
  | 'calloutPin'
  | 'hologramRing'
  | 'particleField'
  | 'spatialShield'
  | 'dnaHelix'
  | 'tesseract4d'
  | 'laserGrid'
  | 'gyroCompass'
  | 'telemetryHud'
  | 'portalRing'
  | 'energySphere'
  | 'neonSign'
  | 'matrixRain'
  | 'custom3d';

export interface Effect3DPreset {
  id: string;
  name: string;
  category: Effect3DCategory;
  subcategory: string;
  type: Attached3DType;
  iconType: string;
  defaultColor: string;
  defaultSize: number;
  defaultDepthZ: number;
  tags: string[];
  description: string;
  animationSpeed?: number;
}

export interface Tracked3DElement {
  id: string;
  presetId?: string;
  name: string;
  type: Attached3DType;
  category?: Effect3DCategory;
  text: string;
  color: string;
  secondaryColor?: string;
  size: number; // scale multiplier
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  pitchOffset?: number;
  yawOffset?: number;
  rollOffset?: number;
  opacity: number;
  glow: boolean;
  visible: boolean;
  trackId: string; // which tracking anchor to follow
  animationSpeed?: number;
  depthOcclusion?: boolean; // layer behind subjects
}

export interface AudioTrack {
  id: string;
  name: string;
  src: string;
  category: 'music' | 'sfx' | 'voice';
  duration: number;
  startTime: number; // timeline placement
  inPoint: number;
  outPoint: number;
  volume: number; // 0 to 100
  muted: boolean;
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  beatMarkers?: number[]; // timestamps for beat-sync
}

export interface ProjectState {
  title: string;
  canvasWidth: number;
  canvasHeight: number;
  aspectRatioLabel: '16:9' | '9:16' | '1:1' | '4:5' | '21:9';
  fps: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  selected3DElementId: string | null;
  selectedAudioTrackId: string | null;
  clips: MediaClip[];
  audioTracks: AudioTrack[];
  trackingPoints: TrackingPoint3D[];
  trackedElements: Tracked3DElement[];
  isTrackingModeActive: boolean;
  activeTab: 'media' | 'transitions' | 'filters' | 'lighting' | 'keyframes' | 'tracking3d' | 'effects' | 'audio' | 'speedramp' | 'export';
  beatSyncEnabled?: boolean;
  cameraFrustumVisible?: boolean;
}
