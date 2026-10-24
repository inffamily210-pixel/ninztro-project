import React, { useState } from 'react';
import {
  Diamond,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Activity,
  Sliders,
  Move,
  Maximize2,
  RotateCw,
  Eye,
  Sun,
  Layers,
} from 'lucide-react';
import { MediaClip, ProjectState, KeyframeChannels, EasingType, KeyframePoint } from '../../types/editor.ts';
import { upsertKeyframe, removeKeyframeAtTime, interpolateKeyframes } from '../../utils/keyframeMath.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface KeyframePanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
}

type ChannelKey = keyof KeyframeChannels;

interface ChannelDefinition {
  key: ChannelKey;
  label: string;
  icon: React.ReactNode;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
}

const CHANNELS: ChannelDefinition[] = [
  { key: 'scale', label: 'Skala / Zoom', icon: <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />, unit: 'x', min: 0.2, max: 3.0, step: 0.05, defaultVal: 1.0 },
  { key: 'posX', label: 'Posisi X (Horizontal)', icon: <Move className="w-3.5 h-3.5 text-indigo-400" />, unit: 'px', min: -400, max: 400, step: 1, defaultVal: 0 },
  { key: 'posY', label: 'Posisi Y (Vertikal)', icon: <Move className="w-3.5 h-3.5 text-indigo-400" />, unit: 'px', min: -400, max: 400, step: 1, defaultVal: 0 },
  { key: 'rotation', label: 'Rotasi / Kemiringan', icon: <RotateCw className="w-3.5 h-3.5 text-amber-400" />, unit: '°', min: -180, max: 180, step: 1, defaultVal: 0 },
  { key: 'opacity', label: 'Opasitas (Transparansi)', icon: <Eye className="w-3.5 h-3.5 text-emerald-400" />, unit: '', min: 0, max: 1, step: 0.05, defaultVal: 1.0 },
  { key: 'brightness', label: 'Kecerahan Animasi', icon: <Sun className="w-3.5 h-3.5 text-yellow-400" />, unit: '%', min: 0, max: 200, step: 1, defaultVal: 100 },
  { key: 'blur', label: 'Rack Focus Blur', icon: <Layers className="w-3.5 h-3.5 text-purple-400" />, unit: 'px', min: 0, max: 30, step: 1, defaultVal: 0 },
];

export const KeyframePanel: React.FC<KeyframePanelProps> = ({
  project,
  onUpdateProject,
  selectedClip,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<ChannelKey>('scale');
  const [selectedEasing, setSelectedEasing] = useState<EasingType>('ease-in-out');

  // Compute clip-relative local time
  let accumulatedTime = 0;
  for (const c of project.clips) {
    if (selectedClip && c.id === selectedClip.id) break;
    accumulatedTime += c.outPoint - c.inPoint;
  }
  const clipLocalTime = Math.max(0, project.currentTime - accumulatedTime);

  const activeChannelDef = CHANNELS.find((c) => c.key === selectedChannel) || CHANNELS[0];
  const channelPoints: KeyframePoint[] = (selectedClip?.keyframes[selectedChannel] as KeyframePoint[]) || [];

  // Current interpolated value at playhead
  const currentValue = interpolateKeyframes(channelPoints, clipLocalTime, activeChannelDef.defaultVal);

  // Check if there is an exact keyframe at current playhead
  const activePoint = channelPoints.find((p) => Math.abs(p.time - clipLocalTime) <= 0.08);

  const handleUpdateValue = (newVal: number) => {
    if (!selectedClip) return;
    const updated = upsertKeyframe(channelPoints, clipLocalTime, newVal, selectedEasing);
    const updatedChannels = {
      ...selectedClip.keyframes,
      [selectedChannel]: updated,
    };
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, keyframes: updatedChannels } : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const handleAddKeyframe = () => {
    if (!selectedClip) return;
    playSynthSound('laser');
    const updated = upsertKeyframe(channelPoints, clipLocalTime, currentValue, selectedEasing);
    const updatedChannels = {
      ...selectedClip.keyframes,
      [selectedChannel]: updated,
    };
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, keyframes: updatedChannels } : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const handleDeleteCurrentKeyframe = () => {
    if (!selectedClip) return;
    const updated = removeKeyframeAtTime(channelPoints, clipLocalTime, 0.1);
    const updatedChannels = {
      ...selectedClip.keyframes,
      [selectedChannel]: updated,
    };
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, keyframes: updatedChannels } : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const handleJumpKeyframe = (direction: -1 | 1) => {
    if (channelPoints.length === 0) return;
    const times = channelPoints.map((p) => p.time).sort((a, b) => a - b);
    if (direction === 1) {
      const next = times.find((t) => t > clipLocalTime + 0.05);
      if (next !== undefined) {
        onUpdateProject({ currentTime: Math.min(project.duration, accumulatedTime + next) });
      }
    } else {
      const prev = [...times].reverse().find((t) => t < clipLocalTime - 0.05);
      if (prev !== undefined) {
        onUpdateProject({ currentTime: Math.max(0, accumulatedTime + prev) });
      }
    }
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div>
        <p className="font-bold text-white text-xs uppercase tracking-wider">
          Pengaturan Keyframe Presisi (Precision Keyframing)
        </p>
        <p className="text-[11px] text-zinc-400">
          Animasi profesional setiap parameter frame-by-frame dengan kurva easing.
        </p>
      </div>

      {/* Channel Selector Pills */}
      <div>
        <span className="text-[10px] uppercase font-semibold text-zinc-500 mb-1.5 block">
          Pilih Parameter Animasi
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {CHANNELS.map((ch) => {
            const count = (selectedClip?.keyframes[ch.key] as KeyframePoint[])?.length || 0;
            const isSelected = selectedChannel === ch.key;
            return (
              <button
                key={ch.key}
                type="button"
                onClick={() => setSelectedChannel(ch.key)}
                className={`p-2 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-md'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {ch.icon}
                  <span className="font-semibold text-xs truncate">{ch.label}</span>
                </div>
                {count > 0 && (
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {count} ◆
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyframe Controller Card for selected channel */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Diamond className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-white text-xs">{activeChannelDef.label}</span>
              <p className="text-[10px] font-mono text-cyan-400">
                Nilai: {currentValue.toFixed(2)} {activeChannelDef.unit}
              </p>
            </div>
          </div>

          {/* Jump Prev / Add / Jump Next */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleJumpKeyframe(-1)}
              title="Keyframe Sebelumnya"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleAddKeyframe}
              title="Tambah / Kunci Keyframe di Playhead"
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                activePoint ? 'bg-cyan-500 text-black' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
              }`}
            >
              {activePoint ? 'Terkunci' : '+ Kunci KF'}
            </button>
            {activePoint && (
              <button
                type="button"
                onClick={handleDeleteCurrentKeyframe}
                title="Hapus Keyframe Ini"
                className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleJumpKeyframe(1)}
              title="Keyframe Selanjutnya"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Value Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Atur Nilai Parameter</span>
            <input
              type="number"
              step={activeChannelDef.step}
              min={activeChannelDef.min}
              max={activeChannelDef.max}
              value={currentValue}
              onChange={(e) => handleUpdateValue(parseFloat(e.target.value) || 0)}
              className="w-20 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-right font-mono text-cyan-400 font-bold"
            />
          </div>
          <input
            type="range"
            min={activeChannelDef.min}
            max={activeChannelDef.max}
            step={activeChannelDef.step}
            value={currentValue}
            onChange={(e) => handleUpdateValue(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Easing Curve Selector */}
        <div>
          <span className="text-zinc-400 block mb-1">Kurva Easing (Interpolasi Animasi)</span>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {[
              { id: 'linear', label: 'Linear' },
              { id: 'ease-in', label: 'Ease In' },
              { id: 'ease-out', label: 'Ease Out' },
              { id: 'ease-in-out', label: 'Ease In-Out' },
              { id: 'bezier', label: 'Cubic Bezier' },
              { id: 'spring', label: 'Spring Bounce' },
            ].map((ease) => (
              <button
                key={ease.id}
                type="button"
                onClick={() => {
                  setSelectedEasing(ease.id as EasingType);
                  if (activePoint) {
                    handleUpdateValue(activePoint.value);
                  }
                }}
                className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors ${
                  selectedEasing === ease.id
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {ease.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List of current keyframe points */}
      {channelPoints.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Daftar Keyframe ({channelPoints.length})
          </span>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {channelPoints.map((kf) => (
              <div
                key={kf.id}
                onClick={() => onUpdateProject({ currentTime: accumulatedTime + kf.time })}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/60 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Diamond className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                  <span className="font-mono text-white text-[11px]">{kf.time.toFixed(2)}s</span>
                  <span className="text-zinc-500">|</span>
                  <span className="font-mono text-cyan-300 text-[11px]">
                    {kf.value.toFixed(2)} {activeChannelDef.unit}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                  {kf.easing}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
