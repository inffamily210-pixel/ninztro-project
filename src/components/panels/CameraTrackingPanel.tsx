import React, { useState } from 'react';
import {
  Camera,
  Activity,
  CheckCircle2,
  Crosshair,
  Sparkles,
  Sliders,
  Grid,
  Layers,
  RotateCw,
  Compass,
  Eye,
  Info,
} from 'lucide-react';
import { ProjectState } from '../../types/editor.ts';
import { generate3DTrackingTrajectory } from '../../utils/tracking3D.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface CameraTrackingPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
}

export const CameraTrackingPanel: React.FC<CameraTrackingPanelProps> = ({
  project,
  onUpdateProject,
}) => {
  const [isSolving, setIsSolving] = useState(false);
  const [focalLength, setFocalLength] = useState<number>(35); // mm
  const [smoothing, setSmoothing] = useState<number>(45); // %
  const [parallaxDepth, setParallaxDepth] = useState<number>(1.2); // multiplier

  // Currently evaluated tracking point for live telemetry
  const currentPoint = project.trackingPoints[0] || {
    screenX: 0.5,
    screenY: 0.5,
    depthZ: 1.2,
    pitch: 5.2,
    yaw: -12.4,
    roll: 1.8,
    confidence: 0.98,
  };

  const handleSolveCamera = () => {
    setIsSolving(true);
    playSynthSound('laser');

    setTimeout(() => {
      const activeClip = project.clips[0];
      const duration = activeClip ? activeClip.outPoint - activeClip.inPoint : 6;
      const newPoints = generate3DTrackingTrajectory(0.5, 0.45, duration, 10, 'smoothParallax');

      onUpdateProject({
        trackingPoints: newPoints,
      });
      setIsSolving(false);
      playSynthSound('synthwave');
    }, 600);
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>3D Camera Tracking Studio</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            Pelacakan murni gerakan kamera 3D, orientasi giroskopik & vektor spasial.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-bold">
          SOLVER 3D
        </span>
      </div>

      {/* Camera Matchmove Solver Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Status 3D Matchmove Solver</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>SOLVED (0.38 px error)</span>
          </span>
        </div>

        {/* Live Gyro Telemetry Readout */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
          <div className="bg-black/50 p-2 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block text-[9px] uppercase">Pitch (Kemiringan)</span>
            <span className="text-cyan-400 font-bold text-xs">{currentPoint.pitch.toFixed(1)}°</span>
          </div>
          <div className="bg-black/50 p-2 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block text-[9px] uppercase">Yaw (Rotasi Y)</span>
            <span className="text-fuchsia-400 font-bold text-xs">{currentPoint.yaw.toFixed(1)}°</span>
          </div>
          <div className="bg-black/50 p-2 rounded-lg border border-zinc-850">
            <span className="text-zinc-500 block text-[9px] uppercase">Z-Depth Spasial</span>
            <span className="text-emerald-400 font-bold text-xs">{currentPoint.depthZ.toFixed(2)}m</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleSolveCamera}
            disabled={isSolving}
            className="py-2 px-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
            <span>{isSolving ? 'Menghitung 3D...' : 'Solve 3D Camera'}</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateProject({ isTrackingModeActive: !project.isTrackingModeActive })}
            className={`px-2 py-2 rounded-lg font-bold border transition-colors flex items-center justify-center gap-1 text-xs ${
              project.isTrackingModeActive
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-md'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{project.isTrackingModeActive ? 'Target: ON' : 'Klik Target 3D'}</span>
          </button>
        </div>
      </div>

      {/* Camera Frustum & Visual Display Options */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Visualisasi Bidang Kamera Spasial</span>
        </span>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-zinc-200 font-medium">Tampilkan Kerucut Frustum 3D</p>
            <p className="text-[10px] text-zinc-500">Garis batas sudut pandang optik kamera pada video</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdateProject({ cameraFrustumVisible: !project.cameraFrustumVisible })}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              project.cameraFrustumVisible
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow-sm'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {project.cameraFrustumVisible ? 'AKTIF' : 'NONAKTIF'}
          </button>
        </div>
      </div>

      {/* 3D Camera Calibration & Lens Optics */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Kalibrasi Lensa & Solver Kamera</span>
        </span>

        {/* Focal length selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-zinc-400">Panjang Fokus Lensa (Focal Length)</span>
            <span className="font-mono text-cyan-400 font-bold">{focalLength} mm</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px]">
            {[
              { mm: 24, label: '24mm Wide' },
              { mm: 35, label: '35mm Film' },
              { mm: 50, label: '50mm Prime' },
              { mm: 85, label: '85mm Tele' },
            ].map((f) => (
              <button
                key={f.mm}
                type="button"
                onClick={() => setFocalLength(f.mm)}
                className={`py-1.5 rounded-lg border text-center transition-colors ${
                  focalLength === f.mm
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Motion Smoothing */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Peredam Getaran Gerak (Smoothing)</span>
            <span className="font-mono text-indigo-400 font-bold">{smoothing}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={smoothing}
            onChange={(e) => setSmoothing(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Parallax Depth Multiplier */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Kedalaman Efek Paralaks 3D</span>
            <span className="font-mono text-fuchsia-400 font-bold">{parallaxDepth.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={parallaxDepth}
            onChange={(e) => setParallaxDepth(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-fuchsia-500"
          />
        </div>
      </div>

      {/* Solved 3D Tracking Points List */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Titik Vektor Kamera Terlacak ({project.trackingPoints.length} Titik)
        </span>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {project.trackingPoints.slice(0, 8).map((pt, idx) => (
            <div
              key={pt.id}
              onClick={() => onUpdateProject({ currentTime: pt.time })}
              className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/60 flex items-center justify-between cursor-pointer text-[11px]"
            >
              <div className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-white">Frame {idx + 1} ({pt.time.toFixed(1)}s)</span>
              </div>
              <div className="font-mono text-zinc-400 text-[10px] flex items-center gap-2">
                <span>X: {(pt.screenX * 100).toFixed(0)}%</span>
                <span>Y: {(pt.screenY * 100).toFixed(0)}%</span>
                <span className="text-emerald-400 font-bold">{(pt.confidence * 100).toFixed(0)}% Solved</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
