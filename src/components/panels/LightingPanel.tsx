import React from 'react';
import {
  Sun,
  Moon,
  Sliders,
  Sparkles,
  Flame,
  RotateCcw,
  Palette,
  Eye,
} from 'lucide-react';
import { MediaClip, ProjectState, ColorGradeSettings, LightingEffectSettings } from '../../types/editor.ts';
import { DEFAULT_COLOR_GRADE } from '../../utils/colorGrading.ts';

interface LightingPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
}

export const LightingPanel: React.FC<LightingPanelProps> = ({
  project,
  onUpdateProject,
  selectedClip,
}) => {
  const grade = selectedClip?.colorGrade || DEFAULT_COLOR_GRADE;
  const lighting = selectedClip?.lighting || {
    enabled: false,
    type: 'none',
    intensity: 50,
    color: '#06b6d4',
    x: 50,
    y: 50,
    size: 100,
    rotation: 0,
    blendMode: 'screen',
  };

  const updateColorGrade = (updates: Partial<ColorGradeSettings>) => {
    if (!selectedClip) return;
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            colorGrade: {
              ...c.colorGrade,
              ...updates,
            },
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const updateLighting = (updates: Partial<LightingEffectSettings>) => {
    if (!selectedClip) return;
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            lighting: {
              ...c.lighting,
              ...updates,
            },
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  const resetLighting = () => {
    if (!selectedClip) return;
    updateColorGrade({
      exposure: 0,
      contrast: 0,
      brightness: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0,
      vignette: 0,
      grain: 0,
      bloom: 0,
    });
    updateLighting({
      enabled: false,
      type: 'none',
    });
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-xs uppercase tracking-wider">
            Studio Cahaya & Gelap (Color & Lighting)
          </p>
          <p className="text-[11px] text-zinc-400">
            Kendali eksposur, kontras bayangan gelap, saturasi warna, dan efek cahaya anamorphic.
          </p>
        </div>
        <button
          type="button"
          onClick={resetLighting}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-400 flex items-center gap-1"
          title="Reset ke Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[10px]">Reset</span>
        </button>
      </div>

      {/* Tone Mapping Sliders (Exposure, Contrast, Shadows, Highlights) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Pengaturan Dasar Nada & Cahaya</span>
        </span>

        {/* Exposure */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Eksposur (Kecerahan Utama)</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.exposure > 0 ? `+${grade.exposure}` : grade.exposure}</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={grade.exposure}
            onChange={(e) => updateColorGrade({ exposure: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Kontras Dinamis</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.contrast > 0 ? `+${grade.contrast}` : grade.contrast}</span>
          </div>
          <input
            type="range"
            min="-60"
            max="80"
            value={grade.contrast}
            onChange={(e) => updateColorGrade({ contrast: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Shadows / Bayangan Gelap */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span>Bayangan Gelap (Shadows)</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{grade.shadows > 0 ? `+${grade.shadows}` : grade.shadows}</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={grade.shadows}
            onChange={(e) => updateColorGrade({ shadows: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Highlights / Sorotan Terang */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Sorotan Terang (Highlights)</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.highlights > 0 ? `+${grade.highlights}` : grade.highlights}</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={grade.highlights}
            onChange={(e) => updateColorGrade({ highlights: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Color Grading & Temperature */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
          <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Gradasi Warna & Suhu (Color & White Balance)</span>
        </span>

        {/* Saturation */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Saturasi Warna</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.saturation > 0 ? `+${grade.saturation}` : grade.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={grade.saturation}
            onChange={(e) => updateColorGrade({ saturation: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Temperature */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Suhu Warna (Biru Sejuk — Jingga Hangat)</span>
            <span className="font-mono text-amber-400 font-bold">{grade.temperature}</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={grade.temperature}
            onChange={(e) => updateColorGrade({ temperature: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Tint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Tint Warna (Hijau — Magenta)</span>
            <span className="font-mono text-fuchsia-400 font-bold">{grade.tint}</span>
          </div>
          <input
            type="range"
            min="-60"
            max="60"
            value={grade.tint}
            onChange={(e) => updateColorGrade({ tint: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Cinematic Vignette, Film Grain & Bloom */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Vignette & Efek Suasana Sinematik</span>
        </span>

        {/* Vignette */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Vignette Gelap Pinggir</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.vignette}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={grade.vignette}
            onChange={(e) => updateColorGrade({ vignette: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Bloom */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Highlight Bloom (Kilau Cahaya)</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.bloom}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={grade.bloom}
            onChange={(e) => updateColorGrade({ bloom: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Grain */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Film Grain Analog</span>
            <span className="font-mono text-cyan-400 font-bold">{grade.grain}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="70"
            value={grade.grain}
            onChange={(e) => updateColorGrade({ grain: parseInt(e.target.value, 10) })}
            className="w-full cursor-pointer"
          />
        </div>
      </div>

      {/* Lighting Studio VFX (Anamorphic Flare & Dynamic Light Leak) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio Cahaya VFX (Lens Flare & Leaks)</span>
          </span>
          <button
            type="button"
            onClick={() => updateLighting({ enabled: !lighting.enabled })}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              lighting.enabled ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {lighting.enabled ? 'AKTIF' : 'NONAKTIF'}
          </button>
        </div>

        {lighting.enabled && (
          <div className="space-y-3 pt-1">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'anamorphicFlare', label: 'Anamorphic Flare' },
                { id: 'dynamicLightLeak', label: 'Light Leak Burst' },
                { id: 'spotlightDark', label: 'Dark Spotlight Mood' },
                { id: 'neonRimLight', label: 'Neon Rim Glow' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateLighting({ type: opt.id as any })}
                  className={`p-2 rounded-lg text-left text-[11px] transition-colors ${
                    lighting.type === opt.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-850'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Flare Color Picker */}
            <div>
              <span className="text-zinc-400 block mb-1">Warna Pendaran Cahaya</span>
              <div className="flex items-center gap-2">
                {['#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateLighting({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      lighting.color === c ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Intensity & Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-500 text-[10px]">Intensitas ({lighting.intensity}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={lighting.intensity}
                  onChange={(e) => updateLighting({ intensity: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px]">Ukuran Streak ({lighting.size}%)</label>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={lighting.size}
                  onChange={(e) => updateLighting({ size: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-500 text-[10px]">Posisi X ({lighting.x}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lighting.x}
                  onChange={(e) => updateLighting({ x: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px]">Posisi Y ({lighting.y}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lighting.y}
                  onChange={(e) => updateLighting({ y: parseInt(e.target.value, 10) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
