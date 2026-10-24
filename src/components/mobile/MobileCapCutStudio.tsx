import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Trash2,
  Copy,
  Volume2,
  VolumeX,
  Diamond,
  Sliders,
  Sparkles,
  Camera,
  Layers,
  Music,
  Gauge,
  Maximize,
  Minimize,
  Grid,
  ChevronLeft,
  Share2,
  Ratio,
  Move,
  RotateCw,
  Sun,
  Eye,
  Check,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  ProjectState,
  MediaClip,
  Tracked3DElement,
  AudioTrack,
  FilterPresetId,
} from '../../types/editor.ts';
import { evaluateTransformAtTime, upsertKeyframe, removeKeyframeAtTime } from '../../utils/keyframeMath.ts';
import { buildCssFilterString } from '../../utils/colorGrading.ts';
import { interpolateTrackingAtTime, compute3DElementTransform } from '../../utils/tracking3D.ts';
import { evaluateSpeedRamp } from '../../utils/effects3DMath.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';
import { MobileBottomSheet } from './MobileBottomSheet.tsx';

// Import existing studio inspector panels
import { FiltersPanel } from '../panels/FiltersPanel.tsx';
import { TransitionsPanel } from '../panels/TransitionsPanel.tsx';
import { KeyframePanel } from '../panels/KeyframePanel.tsx';
import { CameraTrackingPanel } from '../panels/CameraTrackingPanel.tsx';
import { EffectsLibraryPanel } from '../panels/EffectsLibraryPanel.tsx';
import { AudioPanel } from '../panels/AudioPanel.tsx';
import { SpeedRampPanel } from '../panels/SpeedRampPanel.tsx';
import { LightingPanel } from '../panels/LightingPanel.tsx';

interface MobileCapCutStudioProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  onTogglePlay: () => void;
  onSplitClip: () => void;
  onDeleteSelectedClip: () => void;
  selectedClip: MediaClip | null;
  selected3DElement: Tracked3DElement | null;
  selectedAudioTrack: AudioTrack | null;
  isComparingOriginal: boolean;
  onToggleCompare: () => void;
  onOpenExport: () => void;
  onNavigateToProjects: () => void;
  onNavigateToAbout: () => void;
}

type MobileToolTab =
  | 'none'
  | 'edit'
  | 'audio'
  | 'filters'
  | 'effects'
  | 'tracking3d'
  | 'keyframes'
  | 'transitions'
  | 'speedramp'
  | 'lighting'
  | 'format';

export const MobileCapCutStudio: React.FC<MobileCapCutStudioProps> = ({
  project,
  onUpdateProject,
  onTogglePlay,
  onSplitClip,
  onDeleteSelectedClip,
  selectedClip,
  selected3DElement,
  selectedAudioTrack,
  isComparingOriginal,
  onToggleCompare,
  onOpenExport,
  onNavigateToProjects,
  onNavigateToAbout,
}) => {
  const [activeDrawerTab, setActiveDrawerTab] = useState<MobileToolTab>('none');
  const [showGrid, setShowGrid] = useState(false);
  const [showPlayRipple, setShowPlayRipple] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Timecode formatting: mm:ss.f
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  // Find currently active clip based on project.currentTime
  const { activeClip, clipLocalTime, transitionEffect } = useMemo(() => {
    let accumulatedTime = 0;
    for (let i = 0; i < project.clips.length; i++) {
      const clip = project.clips[i];
      const clipDuration = clip.outPoint - clip.inPoint;
      if (
        project.currentTime >= accumulatedTime &&
        project.currentTime <= accumulatedTime + clipDuration + 0.001
      ) {
        const localTime = clip.inPoint + (project.currentTime - accumulatedTime) * clip.playbackSpeed;

        let effect: string | null = null;
        const timeFromStart = project.currentTime - accumulatedTime;
        const timeToEnd = accumulatedTime + clipDuration - project.currentTime;

        if (clip.transitionIn.type !== 'none' && timeFromStart < clip.transitionIn.duration) {
          effect = clip.transitionIn.type;
        } else if (clip.transitionOut.type !== 'none' && timeToEnd < clip.transitionOut.duration) {
          effect = clip.transitionOut.type;
        }

        return { activeClip: clip, clipLocalTime: localTime, transitionEffect: effect };
      }
      accumulatedTime += clipDuration;
    }

    return {
      activeClip: project.clips[0] || null,
      clipLocalTime: 0,
      transitionEffect: null,
    };
  }, [project.clips, project.currentTime]);

  // Sync video element time
  useEffect(() => {
    if (activeClip && activeClip.type === 'video' && videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - clipLocalTime) > 0.3) {
        videoRef.current.currentTime = clipLocalTime;
      }
      if (project.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!project.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [activeClip, clipLocalTime, project.isPlaying]);

  // Current keyframe transform for active clip
  const currentTransform = useMemo(() => {
    if (!activeClip || !activeClip.keyframes) {
      return { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 };
    }
    return evaluateTransformAtTime(activeClip.keyframes, clipLocalTime);
  }, [activeClip, clipLocalTime]);

  // Speed ramp multiplier
  const currentSpeed = useMemo(() => {
    if (!activeClip || !activeClip.speedRampCurve || !activeClip.speedRampEnabled) {
      return activeClip?.playbackSpeed || 1.0;
    }
    const clipDuration = activeClip.outPoint - activeClip.inPoint;
    const progress = Math.max(0, Math.min(1, clipLocalTime / (clipDuration || 1)));
    return evaluateSpeedRamp(activeClip.speedRampCurve, progress);
  }, [activeClip, clipLocalTime]);

  // Video CSS filter
  const filterStyle = useMemo(() => {
    if (isComparingOriginal || !activeClip || !activeClip.colorGrade) {
      return 'none';
    }
    return buildCssFilterString(activeClip.colorGrade);
  }, [activeClip, isComparingOriginal]);

  // 3D tracking trajectory coordinates
  const currentTrackPoint = useMemo(() => {
    if (!project.trackingPoints || project.trackingPoints.length === 0) return null;
    return interpolateTrackingAtTime(project.trackingPoints, project.currentTime);
  }, [project.trackingPoints, project.currentTime]);

  // Tap canvas to play/pause
  const handleCanvasTap = () => {
    playSynthSound('laser');
    setShowPlayRipple(true);
    setTimeout(() => setShowPlayRipple(false), 400);
    onTogglePlay();
  };

  // Step frame by frame
  const handleStepFrame = (direction: -1 | 1) => {
    playSynthSound('swoosh');
    const step = 1 / (project.fps || 30);
    const newTime = Math.max(0, Math.min(project.duration, project.currentTime + direction * step));
    onUpdateProject({ currentTime: Number(newTime.toFixed(3)) });
  };

  // Split selected clip
  const handleSplit = () => {
    playSynthSound('swoosh');
    onSplitClip();
  };

  // Duplicate selected clip
  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    playSynthSound('synthwave');
    const copyClip: MediaClip = {
      ...selectedClip,
      id: `clip-copy-${Date.now()}`,
      name: `${selectedClip.name} (Salin)`,
    };
    const clipIndex = project.clips.findIndex((c) => c.id === selectedClip.id);
    const newClips = [...project.clips];
    newClips.splice(clipIndex + 1, 0, copyClip);
    const newDuration = newClips.reduce((acc, c) => acc + (c.outPoint - c.inPoint), 0);
    onUpdateProject({ clips: newClips, duration: Number(newDuration.toFixed(2)) });
  };

  // Keyframe toggle: add or delete keyframe diamond at current playhead
  const handleToggleKeyframe = () => {
    if (!selectedClip) return;
    playSynthSound('laser');

    let accumulatedTime = 0;
    for (const c of project.clips) {
      if (c.id === selectedClip.id) break;
      accumulatedTime += c.outPoint - c.inPoint;
    }
    const localTime = Math.max(0, project.currentTime - accumulatedTime);

    // Check if keyframe already exists near localTime
    const existing = selectedClip.keyframes.scale.find((k) => Math.abs(k.time - localTime) < 0.15);
    let updatedChannels = { ...selectedClip.keyframes };

    if (existing) {
      // Remove keyframe
      updatedChannels = {
        ...updatedChannels,
        scale: removeKeyframeAtTime(updatedChannels.scale, existing.time),
        posX: removeKeyframeAtTime(updatedChannels.posX, existing.time),
        posY: removeKeyframeAtTime(updatedChannels.posY, existing.time),
        rotation: removeKeyframeAtTime(updatedChannels.rotation, existing.time),
      };
    } else {
      // Add keyframe diamond
      updatedChannels = {
        ...updatedChannels,
        scale: upsertKeyframe(updatedChannels.scale, localTime, 1.15, 'ease-in-out'),
        posX: upsertKeyframe(updatedChannels.posX, localTime, 0, 'ease-in-out'),
        posY: upsertKeyframe(updatedChannels.posY, localTime, 0, 'ease-in-out'),
        rotation: upsertKeyframe(updatedChannels.rotation, localTime, 0, 'ease-in-out'),
      };
    }

    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, keyframes: updatedChannels } : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  // Check if playhead is currently on a keyframe
  const hasKeyframeAtCurrent = useMemo(() => {
    if (!selectedClip) return false;
    let accumulatedTime = 0;
    for (const c of project.clips) {
      if (c.id === selectedClip.id) break;
      accumulatedTime += c.outPoint - c.inPoint;
    }
    const localTime = Math.max(0, project.currentTime - accumulatedTime);
    return selectedClip.keyframes.scale.some((k) => Math.abs(k.time - localTime) < 0.2);
  }, [selectedClip, project.currentTime, project.clips]);

  // Touch scrubbing on timeline
  const handleTimelineTouchScrub = (clientX: number) => {
    if (!timelineScrollRef.current) return;
    const rect = timelineScrollRef.current.getBoundingClientRect();
    const touchX = clientX - rect.left;
    const pixelsPerSecond = 55;
    const newTime = Math.max(0, Math.min(project.duration, touchX / pixelsPerSecond));
    onUpdateProject({ currentTime: Number(newTime.toFixed(2)) });
  };

  // Aspect ratio presets
  const aspectRatios: { label: ProjectState['aspectRatioLabel']; w: number; h: number }[] = [
    { label: '9:16', w: 1080, h: 1920 },
    { label: '16:9', w: 1920, h: 1080 },
    { label: '1:1', w: 1080, h: 1080 },
    { label: '21:9', w: 2560, h: 1080 },
  ];

  // Tool dock buttons (CapCut & Alight Motion style)
  const dockButtons: { id: MobileToolTab; label: string; icon: React.ReactNode }[] = [
    { id: 'edit', label: 'Edit', icon: <Scissors className="w-5 h-5" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-5 h-5" /> },
    { id: 'filters', label: 'Filter AI', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'effects', label: 'Efek VFX', icon: <Layers className="w-5 h-5" /> },
    { id: 'tracking3d', label: 'Kamera 3D', icon: <Camera className="w-5 h-5" /> },
    { id: 'keyframes', label: 'Keyframe', icon: <Diamond className="w-5 h-5" /> },
    { id: 'transitions', label: 'Transisi', icon: <Zap className="w-5 h-5" /> },
    { id: 'speedramp', label: 'Kecepatan', icon: <Gauge className="w-5 h-5" /> },
    { id: 'lighting', label: 'Cahaya', icon: <Sun className="w-5 h-5" /> },
    { id: 'format', label: 'Format', icon: <Ratio className="w-5 h-5" /> },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#090b10] text-zinc-100 overflow-hidden relative select-none font-sans">
      {/* 1. TOP MOBILE APP BAR (CapCut / Alight Motion style) */}
      <header className="h-12 bg-[#0e111a] border-b border-zinc-800/80 px-3 flex items-center justify-between z-20 flex-shrink-0">
        {/* Left: Back button to Projects */}
        <button
          type="button"
          onClick={() => {
            playSynthSound('laser');
            onNavigateToProjects();
          }}
          className="flex items-center gap-1 text-zinc-300 hover:text-white active:scale-95 transition-transform py-1 px-1.5 -ml-1 rounded-lg"
          title="Kembali ke Daftar Project"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-300" />
          <span className="text-xs font-semibold">Proyek</span>
        </button>

        {/* Center: Project title & FPS/Res badge */}
        <div className="flex items-center gap-2 max-w-[50%] truncate">
          <span className="text-xs font-bold text-white truncate max-w-[120px]">
            {project.title}
          </span>
          <button
            type="button"
            onClick={() => setActiveDrawerTab('format')}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-850 border border-zinc-750 text-[10px] font-mono text-cyan-400 shrink-0 font-medium active:scale-95 transition-transform"
          >
            <span>{project.aspectRatioLabel}</span>
            <span className="text-zinc-500">•</span>
            <span>{project.fps || 30} FPS</span>
          </button>
        </div>

        {/* Right: Compare RAW and CapCut Export Button */}
        <div className="flex items-center gap-2">
          {/* Compare RAW button */}
          <button
            type="button"
            onClick={onToggleCompare}
            title={isComparingOriginal ? 'Melihat RAW' : 'Bandingkan Warna'}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
              isComparingOriginal
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-850 border-zinc-750 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* CapCut-style Export Button */}
          <button
            type="button"
            onClick={() => {
              playSynthSound('synthwave');
              onOpenExport();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-950/40 active:scale-95 transition-all"
          >
            <span>Ekspor</span>
            <Share2 className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* 2. PLAYER VIEWPORT (Top Half Preview Canvas) */}
      <section
        ref={containerRef}
        onClick={handleCanvasTap}
        className="flex-[4] min-h-[220px] max-h-[46vh] bg-[#050608] flex items-center justify-center relative overflow-hidden cursor-pointer"
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Aspect-ratio bounded canvas wrapper */}
        <div
          className="relative max-h-full max-w-full flex items-center justify-center transition-all duration-200"
          style={{
            aspectRatio: `${project.canvasWidth} / ${project.canvasHeight}`,
            height: project.aspectRatioLabel === '9:16' ? '96%' : 'auto',
            width: project.aspectRatioLabel === '9:16' ? 'auto' : '92%',
          }}
        >
          {/* Active Clip Preview */}
          {activeClip && (
            <div
              className="relative w-full h-full overflow-hidden rounded-md shadow-2xl bg-black border border-zinc-800/80"
              style={{
                transform: `translate(${currentTransform.x}px, ${currentTransform.y}px) scale(${currentTransform.scale}) rotate(${currentTransform.rotation}deg)`,
                opacity: currentTransform.opacity,
                filter: filterStyle,
                transition: project.isPlaying ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              {activeClip.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={activeClip.src}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  playsInline
                  loop
                />
              ) : (
                <img
                  src={activeClip.src}
                  alt={activeClip.name}
                  className="w-full h-full object-cover pointer-events-none"
                />
              )}

              {/* 3D Tracked Elements Overlays */}
              {currentTrackPoint &&
                project.trackedElements
                  .filter((el) => el.visible)
                  .map((el) => {
                    const { style } = compute3DElementTransform(
                      el,
                      currentTrackPoint,
                      360,
                      200
                    );
                  return (
                    <div
                      key={el.id}
                      style={style}
                      className="pointer-events-none select-none"
                    >
                      {el.type === 'cyberReticle' && (
                        <div
                          className="w-16 h-16 border border-cyan-400/80 rounded-full animate-spin flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                          style={{ borderColor: el.color }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: el.color }} />
                        </div>
                      )}
                      {el.type === 'text3d' && (
                        <div
                          className="px-2 py-0.5 bg-black/80 border rounded text-[10px] font-mono font-bold tracking-wider uppercase shadow-lg"
                          style={{ borderColor: el.color, color: el.color }}
                        >
                          {el.text || el.name}
                        </div>
                      )}
                      {el.type !== 'cyberReticle' && el.type !== 'text3d' && (
                        <div
                          className="w-10 h-10 border-2 rounded-lg rotate-45 flex items-center justify-center"
                          style={{ borderColor: el.color }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: el.color }} />
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* 3D Camera Trajectory Tracking Dot */}
              {currentTrackPoint && (
                <div
                  className="absolute pointer-events-none w-3 h-3 rounded-full bg-cyan-400 border border-white shadow-[0_0_8px_#22d3ee] transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${currentTrackPoint.screenX * 100}%`,
                    top: `${currentTrackPoint.screenY * 100}%`,
                  }}
                />
              )}

              {/* Composition Grid Lines */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>
              )}
            </div>
          )}

          {/* Central Animated Play/Pause Ripple */}
          {showPlayRipple && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/75 backdrop-blur-sm border border-cyan-400/40 flex items-center justify-center text-cyan-400 animate-out fade-out zoom-out duration-300">
                {project.isPlaying ? <Play className="w-6 h-6 ml-1" /> : <Pause className="w-6 h-6" />}
              </div>
            </div>
          )}

          {/* Transition Pill Badge overlay */}
          {transitionEffect && (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-cyan-500/90 text-zinc-950 font-bold text-[10px] flex items-center gap-1 shadow-lg animate-pulse">
              <Zap className="w-2.5 h-2.5" />
              <span>Transisi: {transitionEffect}</span>
            </div>
          )}
        </div>

        {/* Viewport Overlay Controls Bar (Bottom of Player) */}
        <div
          className="absolute bottom-1.5 inset-x-3 flex items-center justify-between text-xs font-mono text-zinc-400 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timecode */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-zinc-800 text-[11px]">
            <span className="text-white font-bold">{formatTimecode(project.currentTime)}</span>
            <span className="text-zinc-600">/</span>
            <span>{formatTimecode(project.duration)}</span>
          </div>

          {/* Play/Pause & Frame Step Buttons */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md border border-zinc-800 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => handleStepFrame(-1)}
              className="p-1 rounded text-zinc-400 hover:text-white active:scale-95"
              title="-1 Frame"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              className="p-1 px-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 active:scale-95"
              title={project.isPlaying ? 'Pause' : 'Play'}
            >
              {project.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleStepFrame(1)}
              className="p-1 rounded text-zinc-400 hover:text-white active:scale-95"
              title="+1 Frame"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid line toggle */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded-md border text-[10px] ${
              showGrid
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-black/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Garis Kisi Komposisi"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. CAPCUT QUICK ACTION TOOLBAR (Directly above Timeline) */}
      <div className="h-10 bg-[#0d0f17] border-y border-zinc-800/80 px-2 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {/* Split Clip */}
          <button
            type="button"
            onClick={handleSplit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold active:scale-95 transition-transform shrink-0 border border-zinc-750"
            title="Bagi / Split Video di Playhead"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bagi</span>
          </button>

          {/* Delete Clip */}
          <button
            type="button"
            onClick={onDeleteSelectedClip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold active:scale-95 transition-transform shrink-0 border border-zinc-750"
            title="Hapus Klip Terpilih"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Hapus</span>
          </button>

          {/* Keyframe Diamond */}
          <button
            type="button"
            onClick={handleToggleKeyframe}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold active:scale-95 transition-transform shrink-0 border ${
              hasKeyframeAtCurrent
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-zinc-850 border-zinc-750 text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Tambah / Hapus Intan Keyframe"
          >
            <Diamond className={`w-3.5 h-3.5 ${hasKeyframeAtCurrent ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
            <span>{hasKeyframeAtCurrent ? 'Hapus ◇' : '◇+ Keyframe'}</span>
          </button>

          {/* Speed Ramp */}
          <button
            type="button"
            onClick={() => setActiveDrawerTab('speedramp')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold active:scale-95 transition-transform shrink-0 border border-zinc-750"
            title="Kurva Kecepatan Video"
          >
            <Gauge className="w-3.5 h-3.5 text-yellow-400" />
            <span>Kecepatan</span>
          </button>

          {/* Duplicate Clip */}
          <button
            type="button"
            onClick={handleDuplicateClip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold active:scale-95 transition-transform shrink-0 border border-zinc-750"
            title="Duplikat Klip"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Duplikat</span>
          </button>
        </div>

        {/* Selected Clip indicator tag */}
        {selectedClip && (
          <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full shrink-0 font-medium truncate max-w-[90px]">
            {selectedClip.name}
          </span>
        )}
      </div>

      {/* 4. MOBILE TOUCH TIMELINE (Smooth Horizontally Scrubbable) */}
      <section
        className="flex-[3] min-h-[140px] max-h-[28vh] bg-[#090b11] relative flex flex-col overflow-hidden select-none"
        onMouseDown={() => setIsScrubbing(true)}
        onMouseUp={() => setIsScrubbing(false)}
        onTouchStart={() => setIsScrubbing(true)}
        onTouchEnd={() => setIsScrubbing(false)}
      >
        {/* Playhead Needle (Center / Scrubber Indicator) */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
          style={{
            left: `${Math.min(95, Math.max(5, (project.currentTime / (project.duration || 1)) * 100))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Diamond head */}
          <div className="w-3 h-3 bg-cyan-400 rotate-45 border border-white shadow-[0_0_8px_#22d3ee] -mt-1.5" />
          {/* Vertical line */}
          <div className="w-0.5 flex-1 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
        </div>

        {/* Time Ruler (Seconds markers) */}
        <div
          ref={timelineScrollRef}
          onClick={(e) => handleTimelineTouchScrub(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches[0]) handleTimelineTouchScrub(e.touches[0].clientX);
          }}
          className="h-5 border-b border-zinc-800/80 px-4 flex items-center relative cursor-ew-resize overflow-x-hidden bg-[#0a0d14]"
        >
          {Array.from({ length: Math.ceil(project.duration) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: `${(i / (project.duration || 1)) * 100}%` }}
            >
              <div className="h-1.5 w-px bg-zinc-600" />
              <span className="text-[9px] font-mono text-zinc-500">{i}s</span>
            </div>
          ))}
        </div>

        {/* Video Track (Thumbnail cards sequence) */}
        <div
          onClick={(e) => handleTimelineTouchScrub(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches[0]) handleTimelineTouchScrub(e.touches[0].clientX);
          }}
          className="flex-1 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar relative cursor-pointer"
        >
          {project.clips.map((clip, idx) => {
            const clipDur = clip.outPoint - clip.inPoint;
            const isSelected = selectedClip?.id === clip.id;
            const clipWidthPercent = (clipDur / (project.duration || 1)) * 100;

            return (
              <React.Fragment key={clip.id}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    playSynthSound('laser');
                    onUpdateProject({ selectedClipId: clip.id });
                  }}
                  className={`relative h-14 rounded-lg overflow-hidden flex flex-col justify-between p-1.5 transition-all flex-shrink-0 ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 bg-zinc-850 shadow-lg'
                      : 'border border-zinc-800 bg-zinc-900 opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    width: `${Math.max(70, clipWidthPercent * 3.4)}px`,
                  }}
                >
                  {/* Thumbnail background */}
                  {clip.thumbnailUrl && (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
                    />
                  )}

                  {/* Clip Label */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white truncate max-w-[80%] drop-shadow">
                      {clip.name}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-300 drop-shadow">
                      {clipDur.toFixed(1)}s
                    </span>
                  </div>

                  {/* Render Keyframe diamond markers directly on the clip bar */}
                  <div className="relative z-10 h-3 flex items-center">
                    {clip.keyframes.scale.map((kf) => (
                      <div
                        key={kf.id}
                        className="absolute w-2 h-2 bg-amber-400 rotate-45 border border-amber-200 shadow-sm"
                        style={{ left: `${Math.min(95, Math.max(5, (kf.time / (clipDur || 1)) * 100))}%` }}
                        title={`Keyframe scale: ${kf.value} @ ${kf.time.toFixed(2)}s`}
                      />
                    ))}
                  </div>

                  {/* Active Selection Glow */}
                  {isSelected && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  )}
                </div>

                {/* Transition Pill between clips */}
                {idx < project.clips.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSynthSound('laser');
                      onUpdateProject({ selectedClipId: clip.id });
                      setActiveDrawerTab('transitions');
                    }}
                    className="w-6 h-6 rounded-md bg-zinc-850 hover:bg-cyan-500/20 border border-zinc-700 hover:border-cyan-400/60 flex items-center justify-center text-zinc-400 hover:text-cyan-300 active:scale-90 transition-all shrink-0 z-10"
                    title="Ubah Transisi Video"
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Audio Waveform Track Strip */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActiveDrawerTab('audio');
          }}
          className="h-7 border-t border-zinc-850 bg-[#07090e] px-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <Music className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-medium truncate">
              {project.audioTracks[0]?.name || 'Audio BGM'} ({project.audioTracks[0]?.volume || 80}%)
            </span>
          </div>

          {/* Simulated waveform bars */}
          <div className="flex items-center gap-0.5 h-3">
            {[4, 10, 6, 12, 8, 14, 5, 11, 7, 13, 9, 6, 12, 8, 4].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-cyan-500/60 rounded-full"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. CAPCUT HORIZONTAL BOTTOM DOCK (Icons Bar) */}
      <footer className="h-16 bg-[#0b0d14] border-t border-zinc-800 px-2 flex items-center overflow-x-auto no-scrollbar z-20 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-full justify-between sm:justify-start">
          {dockButtons.map((btn) => {
            const isActive = activeDrawerTab === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  playSynthSound('laser');
                  setActiveDrawerTab(isActive ? 'none' : btn.id);
                }}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <div className="mb-0.5">{btn.icon}</div>
                <span className="text-[10px] tracking-tight">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* 6. SLIDE-UP BOTTOM SHEET FOR CAPCUT / ALIGHT MOTION TOOLS */}
      <MobileBottomSheet
        isOpen={activeDrawerTab !== 'none'}
        onClose={() => setActiveDrawerTab('none')}
        title={
          activeDrawerTab === 'edit'
            ? 'Transform & Posisi Klip'
            : activeDrawerTab === 'audio'
            ? 'Audio Mixer & Efek Suara'
            : activeDrawerTab === 'filters'
            ? 'Filter AI & Color Grading'
            : activeDrawerTab === 'effects'
            ? '240+ Efek & VFX 3D'
            : activeDrawerTab === 'tracking3d'
            ? 'Kamera 3D Matchmove'
            : activeDrawerTab === 'keyframes'
            ? 'Pengaturan Intan Keyframe'
            : activeDrawerTab === 'transitions'
            ? 'Transisi Video Antar-Klip'
            : activeDrawerTab === 'speedramp'
            ? 'Speed Ramping & Velocity'
            : activeDrawerTab === 'lighting'
            ? 'Cahaya & Anamorphic Flare'
            : activeDrawerTab === 'format'
            ? 'Rasio Format Kanvas'
            : ''
        }
        subtitle={
          activeDrawerTab === 'filters'
            ? 'Sesuaikan preset & color grading secara langsung'
            : activeDrawerTab === 'tracking3d'
            ? 'Lintasan kamera & spatial element tracking'
            : undefined
        }
      >
        {/* EDIT / TRANSFORM CONTROLS */}
        {activeDrawerTab === 'edit' && (
          <div className="space-y-4 text-xs">
            {selectedClip ? (
              <>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Skala (Zoom)</span>
                    <span className="font-mono text-cyan-400">
                      {currentTransform.scale.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={currentTransform.scale}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updatedClips = project.clips.map((c) =>
                        c.id === selectedClip.id
                          ? {
                              ...c,
                              keyframes: {
                                ...c.keyframes,
                                scale: upsertKeyframe(c.keyframes.scale, clipLocalTime, val),
                              },
                            }
                          : c
                      );
                      onUpdateProject({ clips: updatedClips });
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Rotasi Putaran</span>
                    <span className="font-mono text-cyan-400">
                      {currentTransform.rotation.toFixed(0)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={currentTransform.rotation}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updatedClips = project.clips.map((c) =>
                        c.id === selectedClip.id
                          ? {
                              ...c,
                              keyframes: {
                                ...c.keyframes,
                                rotation: upsertKeyframe(c.keyframes.rotation, clipLocalTime, val),
                              },
                            }
                          : c
                      );
                      onUpdateProject({ clips: updatedClips });
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Posisi Horisontal (X)</span>
                    <span className="font-mono text-cyan-400">{currentTransform.x}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="2"
                    value={currentTransform.x}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updatedClips = project.clips.map((c) =>
                        c.id === selectedClip.id
                          ? {
                              ...c,
                              keyframes: {
                                ...c.keyframes,
                                posX: upsertKeyframe(c.keyframes.posX, clipLocalTime, val),
                              },
                            }
                          : c
                      );
                      onUpdateProject({ clips: updatedClips });
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Opasitas</span>
                    <span className="font-mono text-cyan-400">
                      {Math.round(currentTransform.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentTransform.opacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updatedClips = project.clips.map((c) =>
                        c.id === selectedClip.id
                          ? {
                              ...c,
                              keyframes: {
                                ...c.keyframes,
                                opacity: upsertKeyframe(c.keyframes.opacity, clipLocalTime, val),
                              },
                            }
                          : c
                      );
                      onUpdateProject({ clips: updatedClips });
                    }}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </>
            ) : (
              <p className="text-zinc-400">Pilih klip pada timeline untuk mengedit posisi & skala.</p>
            )}
          </div>
        )}

        {/* AUDIO PANEL */}
        {activeDrawerTab === 'audio' && (
          <AudioPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedAudioTrack={selectedAudioTrack}
          />
        )}

        {/* FILTER AI PANEL */}
        {activeDrawerTab === 'filters' && (
          <FiltersPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
            isComparingOriginal={isComparingOriginal}
            onToggleCompare={onToggleCompare}
          />
        )}

        {/* EFFECTS VFX PANEL */}
        {activeDrawerTab === 'effects' && (
          <EffectsLibraryPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedElement={selected3DElement}
          />
        )}

        {/* CAMERA 3D MATCHMOVE PANEL */}
        {activeDrawerTab === 'tracking3d' && (
          <CameraTrackingPanel
            project={project}
            onUpdateProject={onUpdateProject}
          />
        )}

        {/* KEYFRAMES PANEL */}
        {activeDrawerTab === 'keyframes' && (
          <KeyframePanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}

        {/* TRANSITIONS PANEL */}
        {activeDrawerTab === 'transitions' && (
          <TransitionsPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}

        {/* SPEED RAMP PANEL */}
        {activeDrawerTab === 'speedramp' && (
          <SpeedRampPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}

        {/* LIGHTING PANEL */}
        {activeDrawerTab === 'lighting' && (
          <LightingPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}

        {/* FORMAT / ASPECT RATIO PANEL */}
        {activeDrawerTab === 'format' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white">Pilih Format & Aspek Rasio</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {aspectRatios.map((ar) => {
                const isSelected = project.aspectRatioLabel === ar.label;
                return (
                  <button
                    key={ar.label}
                    type="button"
                    onClick={() => {
                      playSynthSound('laser');
                      onUpdateProject({
                        aspectRatioLabel: ar.label,
                        canvasWidth: ar.w,
                        canvasHeight: ar.h,
                      });
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold">{ar.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {ar.w} × {ar.h}
                    </span>
                    <span className="text-[9px] text-cyan-400">
                      {ar.label === '9:16'
                        ? 'TikTok / Reels'
                        : ar.label === '16:9'
                        ? 'YouTube / Cinema'
                        : ar.label === '1:1'
                        ? 'Instagram Persegi'
                        : 'UltraWide Scope'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </MobileBottomSheet>
    </div>
  );
};
