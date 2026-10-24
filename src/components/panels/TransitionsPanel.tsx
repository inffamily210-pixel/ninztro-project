import React from 'react';
import {
  Sparkles,
  Zap,
  Box,
  Layers,
  Flame,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { MediaClip, ProjectState, TransitionType } from '../../types/editor.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface TransitionsPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
}

interface TransitionItem {
  id: TransitionType;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const TRANSITIONS: TransitionItem[] = [
  {
    id: 'zoomBlur',
    title: 'Zoom Blur Warp',
    badge: 'KINETIC',
    description: 'Dynamic forward velocity zoom with radial motion blur punch',
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
    gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40',
  },
  {
    id: 'whipGlitch',
    title: 'Whip Pan Glitch',
    badge: 'CYBER',
    description: 'High-speed directional whip cut with chromatic RGB displacement',
    icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
    gradient: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40',
  },
  {
    id: 'lightLeakFlash',
    title: 'Light Leak Flash',
    badge: 'ANALOG',
    description: 'Cinematic warm lens flare burst mimicking vintage camera shutter leak',
    icon: <Flame className="w-4 h-4 text-amber-400" />,
    gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
  },
  {
    id: 'cube3d',
    title: '3D Cube Spin',
    badge: '3D SPATIAL',
    description: 'Volumetric 3D rotational perspective cube flip into the next scene',
    icon: <Box className="w-4 h-4 text-purple-400" />,
    gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40',
  },
  {
    id: 'opticalMorph',
    title: 'Optical Morph Flow',
    badge: 'SEAMLESS',
    description: 'Soft seamless luminance blend preserving scene geometry',
    icon: <ArrowRightLeft className="w-4 h-4 text-emerald-400" />,
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
  },
  {
    id: 'crossDissolve',
    title: 'Film Cross Dissolve',
    badge: 'CLASSIC',
    description: 'Smooth linear exposure crossfade between consecutive footage',
    icon: <Layers className="w-4 h-4 text-zinc-300" />,
    gradient: 'from-zinc-500/20 to-slate-500/20 border-zinc-500/40',
  },
];

export const TransitionsPanel: React.FC<TransitionsPanelProps> = ({
  project,
  onUpdateProject,
  selectedClip,
}) => {
  const currentTransition = selectedClip?.transitionOut.type || 'none';
  const duration = selectedClip?.transitionOut.duration || 0.6;

  const handleApplyTransition = (type: TransitionType) => {
    playSynthSound('swoosh');
    if (!selectedClip) return;
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            transitionOut: {
              type,
              duration,
            },
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const handleApplyToAllClips = (type: TransitionType) => {
    playSynthSound('swoosh');
    const updatedClips = project.clips.map((c) => ({
      ...c,
      transitionOut: {
        type,
        duration,
      },
    }));
    onUpdateProject({ clips: updatedClips });
  };

  const handleDurationChange = (val: number) => {
    if (!selectedClip) return;
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            transitionOut: {
              ...c.transitionOut,
              duration: val,
            },
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div>
        <p className="font-bold text-white text-xs uppercase tracking-wider mb-1">
          Transisi Canggih (VFX Transitions)
        </p>
        <p className="text-[11px] text-zinc-400">
          Pilih efek transisi cinematic dinamis untuk peralihan antar klip.
        </p>
      </div>

      {/* Duration slider */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-zinc-400">Durasi Transisi</span>
          <span className="font-mono text-cyan-400 font-bold">{duration.toFixed(2)} detik</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="2.0"
          step="0.1"
          value={duration}
          onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
          <span>0.2s (Kilat)</span>
          <span>1.0s (Standar)</span>
          <span>2.0s (Dramatis)</span>
        </div>
      </div>

      {/* Transition cards grid */}
      <div className="space-y-2">
        {TRANSITIONS.map((trans) => {
          const isActive = currentTransition === trans.id;
          return (
            <div
              key={trans.id}
              onClick={() => handleApplyTransition(trans.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer bg-zinc-900/50 hover:bg-zinc-800/60 ${
                isActive ? `${trans.gradient} ring-1 ring-cyan-400` : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    {trans.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{trans.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-cyan-300">
                        {trans.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{trans.description}</p>
                  </div>
                </div>

                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {isActive && (
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">Aktif pada klip terpilih</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyToAllClips(trans.id);
                    }}
                    className="text-[10px] text-cyan-300 hover:text-white font-medium underline cursor-pointer"
                  >
                    Terapkan ke Semua Klip
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
