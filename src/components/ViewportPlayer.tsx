import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Grid,
  Crosshair,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { ProjectState, MediaClip, TrackingPoint3D, Tracked3DElement } from '../types/editor.ts';
import { evaluateTransformAtTime } from '../utils/keyframeMath.ts';
import { buildCssFilterString, DEFAULT_COLOR_GRADE } from '../utils/colorGrading.ts';
import { interpolateTrackingAtTime, compute3DElementTransform } from '../utils/tracking3D.ts';
import { evaluateSpeedRamp, computeCameraFrustum } from '../utils/effects3DMath.ts';

interface ViewportPlayerProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  onTogglePlay: () => void;
  isComparingOriginal: boolean;
  onAddTrackingPointAtCoord?: (x: number, y: number) => void;
}

export const ViewportPlayer: React.FC<ViewportPlayerProps> = ({
  project,
  onUpdateProject,
  onTogglePlay,
  isComparingOriginal,
  onAddTrackingPointAtCoord,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 854, height: 480 });

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

        // Check if in transition zone
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
      if (Math.abs(videoRef.current.currentTime - clipLocalTime) > 0.25) {
        videoRef.current.currentTime = clipLocalTime;
      }
      if (project.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!project.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [activeClip, clipLocalTime, project.isPlaying]);

  // Compute container dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Fit within container while maintaining aspect ratio
        const targetRatio = project.canvasWidth / project.canvasHeight;
        let w = rect.width;
        let h = w / targetRatio;
        if (h > rect.height) {
          h = rect.height;
          w = h * targetRatio;
        }
        setCanvasDimensions({ width: Math.max(200, Math.floor(w)), height: Math.max(120, Math.floor(h)) });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [project.canvasWidth, project.canvasHeight]);

  // Transform for active clip based on keyframes
  const evaluatedTransform = useMemo(() => {
    if (!activeClip) {
      return { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, brightness: 100, blur: 0, depth3D: 1 };
    }
    return evaluateTransformAtTime(activeClip.keyframes, clipLocalTime);
  }, [activeClip, clipLocalTime]);

  // CSS Filter string from color grade
  const cssFilters = useMemo(() => {
    if (isComparingOriginal || !activeClip) {
      return 'none';
    }
    const base = buildCssFilterString(activeClip.colorGrade);
    const extraBlur = evaluatedTransform.blur > 0 ? ` blur(${evaluatedTransform.blur}px)` : '';
    return `${base}${extraBlur}`;
  }, [activeClip, isComparingOriginal, evaluatedTransform.blur]);

  // Interpolated 3D tracking point at currentTime
  const currentTrackingPoint = useMemo(() => {
    return interpolateTrackingAtTime(project.trackingPoints, project.currentTime);
  }, [project.trackingPoints, project.currentTime]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!project.isTrackingModeActive || !onAddTrackingPointAtCoord) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    onAddTrackingPointAtCoord(Math.max(0.05, Math.min(0.95, nx)), Math.max(0.05, Math.min(0.95, ny)));
  };

  // Transition style overrides
  const transitionClasses = useMemo(() => {
    if (!transitionEffect) return '';
    switch (transitionEffect) {
      case 'zoomBlur':
        return 'scale-110 filter blur-[3px] transition-transform duration-200';
      case 'whipGlitch':
        return 'translate-x-3 skew-x-3 filter contrast-150 saturate-200';
      case 'lightLeakFlash':
        return 'brightness-150 contrast-125';
      case 'cube3d':
        return 'rotate-y-12 scale-95';
      default:
        return '';
    }
  }, [transitionEffect]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-[#07090e] flex items-center justify-center p-3 overflow-hidden select-none"
    >
      {/* Aspect Ratio Canvas Container */}
      <div
        onClick={handleCanvasClick}
        style={{
          width: `${canvasDimensions.width}px`,
          height: `${canvasDimensions.height}px`,
        }}
        className={`relative bg-black rounded-lg shadow-2xl overflow-hidden border border-zinc-800/80 group perspective-1000 ${
          project.isTrackingModeActive ? 'cursor-crosshair ring-2 ring-cyan-500/80 ring-offset-2 ring-offset-zinc-950' : ''
        }`}
      >
        {/* Media Layer (Video or Photo) */}
        {activeClip ? (
          <div
            className={`w-full h-full relative overflow-hidden flex items-center justify-center transition-all ${transitionClasses}`}
            style={{
              transform: `translate3d(${evaluatedTransform.x}px, ${evaluatedTransform.y}px, 0px) scale(${evaluatedTransform.scale}) rotate(${evaluatedTransform.rotation}deg)`,
              opacity: evaluatedTransform.opacity,
            }}
          >
            {activeClip.type === 'video' ? (
              <div className="w-full h-full relative">
                {activeClip.thumbnailUrl && (
                  <img
                    src={activeClip.thumbnailUrl}
                    alt={activeClip.name}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ filter: cssFilters }}
                  />
                )}
                <video
                  ref={videoRef}
                  src={activeClip.src}
                  poster={activeClip.thumbnailUrl}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ filter: cssFilters }}
                  playsInline
                  muted
                  loop
                  autoPlay
                />
              </div>
            ) : (
              <img
                src={activeClip.src}
                alt={activeClip.name}
                className="w-full h-full object-cover pointer-events-none"
                style={{ filter: cssFilters }}
              />
            )}

            {/* Vignette Overlay */}
            {!isComparingOriginal && activeClip.colorGrade.vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                    (activeClip.colorGrade.vignette / 100) * 0.95
                  }) 100%)`,
                }}
              />
            )}

            {/* Film Grain Simulation Overlay */}
            {!isComparingOriginal && activeClip.colorGrade.grain > 0 && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                style={{
                  backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 0)`,
                  backgroundSize: '4px 4px',
                }}
              />
            )}

            {/* Highlight Bloom Glow Overlay */}
            {!isComparingOriginal && activeClip.colorGrade.bloom > 0 && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,${
                    (activeClip.colorGrade.bloom / 100) * 0.25
                  }) 0%, transparent 70%)`,
                }}
              />
            )}

            {/* Lighting Studio Overlay (Anamorphic Flare / Dynamic Light Leak / Dark Spotlight) */}
            {!isComparingOriginal && activeClip.lighting.enabled && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${activeClip.lighting.x}%`,
                  top: `${activeClip.lighting.y}%`,
                  width: `${activeClip.lighting.size * 3}px`,
                  height: activeClip.lighting.type === 'anamorphicFlare' ? '40px' : `${activeClip.lighting.size * 2}px`,
                  transform: `translate(-50%, -50%) rotate(${activeClip.lighting.rotation}deg)`,
                  mixBlendMode: activeClip.lighting.blendMode,
                  opacity: activeClip.lighting.intensity / 100,
                  background:
                    activeClip.lighting.type === 'anamorphicFlare'
                      ? `linear-gradient(90deg, transparent 0%, ${activeClip.lighting.color} 50%, transparent 100%)`
                      : `radial-gradient(circle, ${activeClip.lighting.color} 0%, transparent 70%)`,
                  filter: activeClip.lighting.type === 'anamorphicFlare' ? 'blur(4px)' : 'blur(20px)',
                }}
              />
            )}

            {/* Extra Dark Spotlight Mood if Dark Mode Lighting is active */}
            {!isComparingOriginal && activeClip.lighting.enabled && activeClip.lighting.type === 'spotlightDark' && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${activeClip.lighting.x}% ${activeClip.lighting.y}%, transparent 20%, rgba(0,0,0,0.85) 80%)`,
                }}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
            <p>Tidak ada media di timeline</p>
          </div>
        )}

        {/* 3D Tracking & VFX Projections Layer */}
        {currentTrackingPoint && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Tracking Anchor Reticle if in 3D tracking tab or active */}
            {project.isTrackingModeActive && (
              <div
                className="absolute flex items-center justify-center transition-all duration-75"
                style={{
                  left: `${currentTrackingPoint.screenX * 100}%`,
                  top: `${currentTrackingPoint.screenY * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative w-8 h-8 rounded-full border-2 border-cyan-400 animate-spin">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                </div>
                <div className="absolute w-2 h-2 bg-fuchsia-500 rounded-full" />
                <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-cyan-500/50 text-[9px] font-mono text-cyan-300 whitespace-nowrap shadow-lg">
                  3D TRACK: ({(currentTrackingPoint.screenX * 100).toFixed(1)}%, {(currentTrackingPoint.screenY * 100).toFixed(1)}%) | Z: {currentTrackingPoint.depthZ.toFixed(2)}m
                </div>
              </div>
            )}

            {/* Attached 3D Elements (Titles, HUD, Holograms) */}
            {project.trackedElements
              .filter((elem) => elem.visible)
              .map((elem) => {
                const { style, pixelX, pixelY, depthScale } = compute3DElementTransform(
                  elem,
                  currentTrackingPoint,
                  canvasDimensions.width,
                  canvasDimensions.height
                );

                if (elem.type === 'text3d') {
                  return (
                    <div
                      key={elem.id}
                      style={style}
                      className="font-extrabold tracking-widest uppercase text-xl drop-shadow-2xl select-none"
                    >
                      <span
                        style={{
                          color: elem.color,
                          textShadow: elem.glow
                            ? `0 0 10px ${elem.color}, 0 0 20px ${elem.color}, 0 4px 12px rgba(0,0,0,0.8)`
                            : '0 4px 12px rgba(0,0,0,0.9)',
                        }}
                      >
                        {elem.text}
                      </span>
                    </div>
                  );
                }

                if (elem.type === 'cyberReticle') {
                  return (
                    <div
                      key={elem.id}
                      style={style}
                      className="flex flex-col items-center justify-center select-none"
                    >
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* Outer rotating cyber ring */}
                        <div
                          className="absolute inset-0 rounded-full border border-dashed border-cyan-400/80 animate-[spin_8s_linear_infinite]"
                          style={{ borderColor: elem.color }}
                        />
                        {/* Inner targeting ring */}
                        <div
                          className="absolute inset-3 rounded-full border border-cyan-400/40"
                          style={{ borderColor: elem.color }}
                        />
                        {/* Crosshairs */}
                        <div className="absolute w-full h-[1px] bg-cyan-400/60" style={{ backgroundColor: elem.color }} />
                        <div className="absolute h-full w-[1px] bg-cyan-400/60" style={{ backgroundColor: elem.color }} />
                        {/* Center lock dot */}
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" style={{ backgroundColor: elem.color }} />
                      </div>
                      <div
                        className="mt-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-cyan-500/50 text-[10px] font-mono tracking-wider"
                        style={{ color: elem.color }}
                      >
                        {elem.text}
                      </div>
                    </div>
                  );
                }

                if (elem.type === 'calloutPin') {
                  return (
                    <div key={elem.id} style={style} className="select-none flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30" />
                      <div className="flex flex-col">
                        <div className="w-16 h-[2px] bg-emerald-400/80 -mb-1" />
                        <div className="bg-black/90 border border-emerald-500/60 px-2 py-1 rounded text-[10px] font-mono text-emerald-300 shadow-xl backdrop-blur-md whitespace-nowrap">
                          {elem.text}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (elem.type === 'wireframeCube' || elem.type === 'tesseract4d') {
                  return (
                    <div
                      key={elem.id}
                      className="w-20 h-20 border-2 rounded-lg rotate-45 animate-pulse flex items-center justify-center shadow-xl perspective-500"
                      style={{ ...style, borderColor: elem.color }}
                    >
                      {/* Inner 4D hypercube or core */}
                      <div
                        className="w-10 h-10 border border-dashed rounded animate-[spin_6s_linear_infinite]"
                        style={{ borderColor: elem.color }}
                      />
                      <div className="absolute w-2 h-2 rounded-full" style={{ backgroundColor: elem.color }} />
                    </div>
                  );
                }

                if (elem.type === 'dnaHelix') {
                  return (
                    <div key={elem.id} style={style} className="w-16 h-28 flex flex-col justify-between py-2 items-center">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: `${Math.abs(Math.sin((i / 5) * Math.PI + (project.currentTime * 3))) * 40 + 10}px`,
                            backgroundColor: elem.color,
                          }}
                          className="h-[2px] rounded-full shadow-sm shadow-cyan-400"
                        />
                      ))}
                    </div>
                  );
                }

                if (elem.type === 'spatialShield') {
                  return (
                    <div
                      key={elem.id}
                      style={{ ...style, borderColor: elem.color }}
                      className="w-32 h-32 rounded-2xl border-2 border-dashed animate-pulse flex items-center justify-center"
                    >
                      <div
                        className="w-20 h-20 rounded-xl border border-dotted opacity-75 animate-[spin_10s_linear_infinite]"
                        style={{ borderColor: elem.color }}
                      />
                      <div className="absolute text-[8px] font-mono tracking-widest uppercase px-1 rounded bg-black/60" style={{ color: elem.color }}>
                        DEFLECTOR SHIELD
                      </div>
                    </div>
                  );
                }

                if (elem.type === 'particleField') {
                  return (
                    <div key={elem.id} style={style} className="w-32 h-32 relative flex items-center justify-center">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((pIdx) => (
                        <div
                          key={pIdx}
                          style={{
                            position: 'absolute',
                            left: `${50 + Math.sin(pIdx * 0.8 + project.currentTime * 2) * 35}%`,
                            top: `${50 + Math.cos(pIdx * 0.8 + project.currentTime * 2) * 35}%`,
                            backgroundColor: elem.color,
                            boxShadow: `0 0 8px ${elem.color}`,
                          }}
                          className="w-2 h-2 rounded-full animate-ping"
                        />
                      ))}
                    </div>
                  );
                }

                if (elem.type === 'gyroCompass' || elem.type === 'portalRing' || elem.type === 'hologramRing') {
                  return (
                    <div key={elem.id} style={style} className="w-28 h-28 relative flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full border-2 border-dashed animate-[spin_6s_linear_infinite]"
                        style={{ borderColor: elem.color }}
                      />
                      <div
                        className="absolute inset-3 rounded-full border border-dotted animate-[spin_4s_linear_infinite_reverse]"
                        style={{ borderColor: elem.color }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border border-solid opacity-80"
                        style={{ borderColor: elem.color }}
                      />
                    </div>
                  );
                }

                return null;
              })}
          </div>
        )}

        {/* 3D Camera Frustum HUD Visualization */}
        {project.cameraFrustumVisible && currentTrackingPoint && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none">
              {computeCameraFrustum(
                currentTrackingPoint.pitch,
                currentTrackingPoint.yaw,
                500,
                canvasDimensions.width,
                canvasDimensions.height
              ).map((ray, rIdx) => (
                <line
                  key={rIdx}
                  x1={ray.x1}
                  y1={ray.y1}
                  x2={ray.x2}
                  y2={ray.y2}
                  stroke="#ec4899"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              ))}
            </svg>
            <div className="absolute bottom-12 left-4 px-2 py-1 rounded bg-black/80 border border-fuchsia-500/50 text-[10px] font-mono text-fuchsia-300">
              FRUSTUM: Pitch {currentTrackingPoint.pitch.toFixed(1)}° | Yaw {currentTrackingPoint.yaw.toFixed(1)}° | Roll {currentTrackingPoint.roll.toFixed(1)}°
            </div>
          </div>
        )}

        {/* Rule of Thirds Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-cyan-500/20">
            <div className="border-r border-b border-cyan-500/30" />
            <div className="border-r border-b border-cyan-500/30" />
            <div className="border-b border-cyan-500/30" />
            <div className="border-r border-b border-cyan-500/30" />
            <div className="border-r border-b border-cyan-500/30" />
            <div className="border-b border-cyan-500/30" />
            <div className="border-r border-cyan-500/30" />
            <div className="border-r border-cyan-500/30" />
            <div />
          </div>
        )}

        {/* RAW Compare Banner */}
        {isComparingOriginal && (
          <div className="absolute top-3 left-3 bg-amber-500 text-black font-bold text-xs px-2.5 py-1 rounded-md shadow-xl flex items-center gap-1.5 pointer-events-none">
            <Info className="w-3.5 h-3.5" />
            <span>ORIGINAL RAW FOOTAGE</span>
          </div>
        )}

        {/* 3D Tracking active mode banner */}
        {project.isTrackingModeActive && (
          <div className="absolute top-3 right-3 bg-cyan-500/90 text-black font-bold text-xs px-2.5 py-1 rounded-md shadow-xl flex items-center gap-1.5 pointer-events-none animate-pulse">
            <Crosshair className="w-3.5 h-3.5" />
            <span>KLIK PADA OBJEK UNTUK TRACK 3D</span>
          </div>
        )}

        {/* Viewport Floating Controls Bar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md border border-zinc-800/80 px-3 py-1.5 rounded-xl flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={project.isPlaying ? 'Pause video' : 'Play video'}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            {project.isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Rule of Thirds Grid"
            className={`p-1.5 rounded-lg transition-colors ${
              showGrid ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* 3D Tracking Anchor Toggle */}
          <button
            type="button"
            onClick={() => onUpdateProject({ isTrackingModeActive: !project.isTrackingModeActive })}
            title="Toggle 3D Feature Tracking Reticle"
            className={`p-1.5 rounded-lg transition-colors ${
              project.isTrackingModeActive ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-700" />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
