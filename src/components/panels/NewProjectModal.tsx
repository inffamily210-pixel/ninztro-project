import React, { useState } from 'react';
import { X, Film, Sparkles, Check, Monitor, Smartphone, Square, Sliders, Play } from 'lucide-react';
import { ProjectCreateOptions } from '../../utils/projectStorage.ts';

interface ResolutionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatioLabel: '16:9' | '9:16' | '1:1' | '4:5' | '21:9';
  icon: 'monitor' | 'smartphone' | 'square' | 'wide';
  badge: string;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: 'fhd-1080p',
    name: 'Full HD 1080p',
    width: 1920,
    height: 1080,
    aspectRatioLabel: '16:9',
    icon: 'monitor',
    badge: 'Standar Populer',
  },
  {
    id: 'uhd-4k',
    name: '4K Ultra HD',
    width: 3840,
    height: 2160,
    aspectRatioLabel: '16:9',
    icon: 'monitor',
    badge: 'Sinematik 4K',
  },
  {
    id: 'qhd-2k',
    name: '2K Quad HD',
    width: 2560,
    height: 1440,
    aspectRatioLabel: '16:9',
    icon: 'monitor',
    badge: 'High-Res',
  },
  {
    id: 'reels-916',
    name: '9:16 Reels & TikTok',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    icon: 'smartphone',
    badge: 'Vertikal Mobile',
  },
  {
    id: 'square-11',
    name: '1:1 Square Feed',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1',
    icon: 'square',
    badge: 'Instagram Feed',
  },
  {
    id: 'cinema-219',
    name: '21:9 CinemaScope',
    width: 2560,
    height: 1080,
    aspectRatioLabel: '21:9',
    icon: 'wide',
    badge: 'Anamorphic Widescreen',
  },
];

const FPS_PRESETS = [30, 60, 90, 120, 144];

function getFpsDescription(fps: number): { label: string; tone: string } {
  if (fps <= 30) {
    return { label: 'Standar Sinematik TV & Film (24-30 fps)', tone: 'text-zinc-400' };
  } else if (fps <= 60) {
    return { label: 'Ultra Smooth Motion (Standar Web & YouTube 60 fps)', tone: 'text-cyan-400' };
  } else if (fps <= 90) {
    return { label: 'High Refresh Rate (Gerakan responsif & jernih)', tone: 'text-emerald-400' };
  } else if (fps <= 120) {
    return { label: 'High Frame Rate (Dukungan Slow-Motion 4x Halus)', tone: 'text-purple-400' };
  } else {
    return { label: 'Extreme Fluidity 144Hz (Maksimal gaming & visual berkecepatan tinggi)', tone: 'text-amber-400' };
  }
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (title: string, options: ProjectCreateOptions) => void;
  defaultProjectNumber?: number;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  defaultProjectNumber = 1,
}) => {
  const [title, setTitle] = useState(`Project Sinematik ${defaultProjectNumber}`);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fhd-1080p');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [isCustomResolution, setIsCustomResolution] = useState(false);
  const [fps, setFps] = useState<number>(60);

  if (!isOpen) return null;

  const currentPreset = RESOLUTION_PRESETS.find((p) => p.id === selectedPresetId);
  const resolvedWidth = isCustomResolution ? customWidth : (currentPreset?.width || 1920);
  const resolvedHeight = isCustomResolution ? customHeight : (currentPreset?.height || 1080);
  const resolvedAspect = isCustomResolution
    ? (resolvedWidth > resolvedHeight ? '16:9' : resolvedWidth === resolvedHeight ? '1:1' : '9:16')
    : (currentPreset?.aspectRatioLabel || '16:9');

  const fpsInfo = getFpsDescription(fps);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim() || `Project Baru ${defaultProjectNumber}`;
    onCreateProject(cleanTitle, {
      canvasWidth: resolvedWidth,
      canvasHeight: resolvedHeight,
      aspectRatioLabel: resolvedAspect,
      fps: Math.min(144, Math.max(30, fps)),
    });
  };

  const handleSelectPreset = (preset: ResolutionPreset) => {
    setSelectedPresetId(preset.id);
    setIsCustomResolution(false);
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
  };

  const handleFpsChange = (val: number) => {
    const clamped = Math.min(144, Math.max(30, val));
    setFps(clamped);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#11141d] border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                Buat Project Baru
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  NINZTRO V3.2
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Pilih resolusi kanvas dan frame rate animasi (30 - 144 FPS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {/* Project Name */}
            <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nama Project
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul project..."
              className="w-full bg-[#0c0e14] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Resolution Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-300">
                Pilih Resolusi Kanvas
              </label>
              <button
                type="button"
                onClick={() => setIsCustomResolution(!isCustomResolution)}
                className={`text-[11px] font-medium transition-colors ${
                  isCustomResolution ? 'text-cyan-400 underline' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isCustomResolution ? 'Gunakan Preset' : '+ Atur Ukuran Kustom'}
              </button>
            </div>

            {!isCustomResolution ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RESOLUTION_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border transition-all relative ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/70 text-zinc-100 shadow-sm shadow-cyan-500/10'
                          : 'bg-[#0d1017] border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:bg-[#131722]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-cyan-400">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
                        {preset.aspectRatioLabel}
                      </div>
                      <div className="text-xs font-semibold text-zinc-100 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {preset.width} × {preset.height}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#0c0e14] border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                    Lebar (Width px)
                  </label>
                  <input
                    type="number"
                    min="360"
                    max="7680"
                    step="2"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value) || 1920)}
                    className="w-full bg-[#131722] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <span className="text-zinc-500 font-mono mt-4">×</span>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                    Tinggi (Height px)
                  </label>
                  <input
                    type="number"
                    min="360"
                    max="7680"
                    step="2"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value) || 1080)}
                    className="w-full bg-[#131722] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FPS Selector: 30 up to 144 FPS */}
          <div className="bg-[#0d1017] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Frame Rate (FPS): <span className="text-cyan-400 font-mono">{fps} FPS</span>
                </label>
                <div className={`text-[11px] mt-0.5 ${fpsInfo.tone}`}>
                  {fpsInfo.label}
                </div>
              </div>

              {/* Direct numerical entry box */}
              <div className="flex items-center gap-1.5 bg-[#151924] border border-zinc-700/70 rounded-lg px-2.5 py-1">
                <input
                  type="number"
                  min="30"
                  max="144"
                  value={fps}
                  onChange={(e) => handleFpsChange(Number(e.target.value))}
                  className="w-12 bg-transparent text-right font-mono text-sm text-cyan-300 font-semibold focus:outline-none"
                />
                <span className="text-xs font-mono text-zinc-400">FPS</span>
              </div>
            </div>

            {/* Quick preset pills */}
            <div className="flex items-center gap-1.5 pt-1">
              {FPS_PRESETS.map((presetFps) => {
                const isActive = fps === presetFps;
                return (
                  <button
                    key={presetFps}
                    type="button"
                    onClick={() => handleFpsChange(presetFps)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-black font-semibold shadow-sm shadow-cyan-500/25'
                        : 'bg-[#151924] text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-100'
                    }`}
                  >
                    {presetFps}
                  </button>
                );
              })}
            </div>

            {/* Precision Range Slider (30 to 144) */}
            <div className="pt-2">
              <input
                type="range"
                min="30"
                max="144"
                step="1"
                value={fps}
                onChange={(e) => handleFpsChange(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>30 FPS (Cinema)</span>
                <span>60 FPS</span>
                <span>90 FPS</span>
                <span>120 FPS</span>
                <span>144 FPS (Max)</span>
              </div>
            </div>
          </div>

          {/* Live Specification Summary */}
          <div className="bg-[#090b10] border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-zinc-200 font-semibold">{resolvedWidth} × {resolvedHeight}</span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">{fps} FPS</span>
              <span>•</span>
              <span>{(1000 / fps).toFixed(2)} ms/frame</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Hardware Ready
            </span>
          </div>

          </div>

          {/* Action buttons (Docked Footer) */}
          <div className="px-5 py-3.5 bg-[#0e1119] border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Buat & Buka Studio Editor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
