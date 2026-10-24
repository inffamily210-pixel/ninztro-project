import React from 'react';
import {
  Gauge,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  Flame,
  Activity,
  Play,
} from 'lucide-react';
import { MediaClip, ProjectState, SpeedRampPoint } from '../../types/editor.ts';
import { SPEED_RAMP_PRESETS, evaluateSpeedRamp } from '../../utils/effects3DMath.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface SpeedRampPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
}

export const SpeedRampPanel: React.FC<SpeedRampPanelProps> = ({
  project,
  onUpdateProject,
  selectedClip,
}) => {
  const isEnabled = selectedClip?.speedRampEnabled ?? false;
  const currentCurve = selectedClip?.speedRampCurve || SPEED_RAMP_PRESETS[0].points;

  const handleToggleSpeedRamp = () => {
    if (!selectedClip) return;
    playSynthSound('laser');
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            speedRampEnabled: !isEnabled,
            speedRampCurve: !isEnabled ? SPEED_RAMP_PRESETS[0].points : undefined,
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const handleApplyPreset = (presetPoints: SpeedRampPoint[]) => {
    if (!selectedClip) return;
    playSynthSound('swoosh');
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            speedRampEnabled: true,
            speedRampCurve: presetPoints,
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const handleUpdatePointSpeed = (index: number, newSpeed: number) => {
    if (!selectedClip) return;
    const updatedCurve = [...currentCurve];
    updatedCurve[index] = { ...updatedCurve[index], speed: newSpeed };

    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            speedRampEnabled: true,
            speedRampCurve: updatedCurve,
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Speed Ramping (Curved Velocity)</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            Kurva kecepatan sinematik (Fast-in, Slow-Mo Impact, Whip-Out).
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleSpeedRamp}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
            isEnabled
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
          }`}
        >
          {isEnabled ? 'RAMP: ON' : 'AKTIFKAN'}
        </button>
      </div>

      {/* Visual Velocity Curve Canvas / Graph */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-xs">Kurva Kecepatan Waktu</span>
          <span className="text-[10px] font-mono text-cyan-400">
            {isEnabled ? 'Time Remapping Aktif' : 'Konstan 1.0x'}
          </span>
        </div>

        {/* Graph display */}
        <div className="h-28 bg-black/60 rounded-xl border border-zinc-800 relative overflow-hidden flex items-end px-3 pb-3">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
            <div className="border-b border-cyan-400 w-full" />
            <div className="border-b border-cyan-400 w-full" />
            <div className="border-b border-cyan-400 w-full" />
          </div>

          {/* SVG Smooth Bezier Path */}
          <svg className="absolute inset-0 w-full h-full p-3 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={currentCurve
                .map((pt) => {
                  const x = pt.timePercent * 100;
                  // Map speed 0..3x to 100..0 y
                  const y = Math.max(5, Math.min(95, 100 - (pt.speed / 3.0) * 90));
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>

          {/* Interactive Node markers */}
          {currentCurve.map((pt, idx) => {
            const x = pt.timePercent * 100;
            const y = Math.max(5, Math.min(95, 100 - (pt.speed / 3.0) * 90));
            return (
              <div
                key={pt.id}
                style={{ left: `${x}%`, bottom: `${100 - y}%` }}
                className="absolute -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/50 flex items-center justify-center pointer-events-none"
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            );
          })}
        </div>

        {/* Speed adjustment nodes */}
        {isEnabled && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Node Titik Kecepatan
            </span>
            <div className="grid grid-cols-2 gap-2">
              {currentCurve.map((pt, idx) => (
                <div key={pt.id} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-zinc-400">Titik {idx + 1} ({(pt.timePercent * 100).toFixed(0)}%)</span>
                    <span className="font-mono text-cyan-400 font-bold">{pt.speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={pt.speed}
                    onChange={(e) => handleUpdatePointSpeed(idx, parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preset Curves */}
      <div>
        <p className="font-bold text-white text-xs uppercase tracking-wider mb-2">
          Preset Kurva Kecepatan Populer
        </p>

        <div className="space-y-2">
          {SPEED_RAMP_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset.points)}
              className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/60 hover:bg-zinc-800/60 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </p>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-300">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">{preset.description}</p>
              </div>

              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-zinc-800 group-hover:bg-cyan-500 group-hover:text-black font-bold text-[10px] transition-colors flex-shrink-0"
              >
                Pakai
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
