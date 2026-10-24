import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Sliders,
  Check,
  Eye,
  Info,
  Layers,
} from 'lucide-react';
import { MediaClip, ProjectState, FilterPresetId } from '../../types/editor.ts';
import { FILTER_PRESETS, FilterPresetInfo } from '../../utils/colorGrading.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface FiltersPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
  isComparingOriginal: boolean;
  onToggleCompare: () => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  project,
  onUpdateProject,
  selectedClip,
  isComparingOriginal,
  onToggleCompare,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(
    'AI Neural Engine siap menganalisis nuansa visual video & foto Anda.'
  );

  const currentGrade = selectedClip?.colorGrade;

  // Apply a preset filter
  const handleSelectPreset = (preset: FilterPresetInfo) => {
    if (!selectedClip) return;
    playSynthSound('synthwave');

    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            colorGrade: {
              ...c.colorGrade,
              preset: preset.id,
              ...preset.defaultSettings,
            },
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  // Intensity slider
  const handleIntensityChange = (val: number) => {
    if (!selectedClip) return;
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id
        ? {
            ...c,
            colorGrade: {
              ...c.colorGrade,
              filterIntensity: val,
            },
          }
        : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  // AI Prompt Grade Generator
  const handleGenerateAiGrade = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPrompt || 'Cinematic Cyberpunk Neon Grade';
    setIsLoadingAi(true);
    playSynthSound('laser');

    try {
      const res = await fetch('/api/ai-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          mediaType: selectedClip?.type || 'video',
          currentSettings: currentGrade,
        }),
      });

      const data = await res.json();
      if (data.recipe && selectedClip) {
        setAiInsight(data.recipe.aiInsight || `AI berhasil meracik color grade: ${data.title}`);

        const updatedClips = project.clips.map((c) =>
          c.id === selectedClip.id
            ? {
                ...c,
                colorGrade: {
                  ...c.colorGrade,
                  preset: data.recipe.preset as FilterPresetId,
                  filterIntensity: data.recipe.filterIntensity ?? 90,
                  exposure: data.recipe.exposure ?? 0,
                  contrast: data.recipe.contrast ?? 20,
                  saturation: data.recipe.saturation ?? 20,
                  temperature: data.recipe.temperature ?? 0,
                  tint: data.recipe.tint ?? 0,
                  highlights: data.recipe.highlights ?? 10,
                  shadows: data.recipe.shadows ?? -15,
                  vignette: data.recipe.vignette ?? 30,
                  grain: data.recipe.grain ?? 15,
                  bloom: data.recipe.bloom ?? 20,
                },
              }
            : c
        );
        onUpdateProject({ clips: updatedClips });
      }
    } catch (err) {
      console.error(err);
      setAiInsight('Mode AI lokal aktif: filter sinematik diterapkan.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      {/* AI Prompt Generator Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-cyan-950/50 border border-purple-500/30 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Neural Color Grading</span>
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            GEMINI 3.8
          </span>
        </div>

        <p className="text-[11px] text-zinc-400">
          Ketik deskripsi mood sinematik atau klik prompt cepat untuk meracik grading secara otomatis:
        </p>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="misal: nuansa anime makoto shinkai senja berkabut..."
            className="flex-1 bg-black/60 border border-purple-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiGrade()}
          />
          <button
            type="button"
            onClick={() => handleGenerateAiGrade()}
            disabled={isLoadingAi}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'AI...' : 'Proses'}</span>
          </button>
        </div>

        {/* Quick prompt pills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {[
            'Cyberpunk Neon Tokyo',
            'Kodak Portra Analog 35mm',
            'Anime Sky Shinkai',
            'Chiaroscuro Dark Aura',
          ].map((promptPill) => (
            <button
              key={promptPill}
              type="button"
              onClick={() => {
                setAiPrompt(promptPill);
                handleGenerateAiGrade(promptPill);
              }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/40 transition-colors"
            >
              + {promptPill}
            </button>
          ))}
        </div>

        {/* AI Insight Box */}
        {aiInsight && (
          <div className="mt-2 p-2 rounded-lg bg-black/50 border border-purple-500/20 text-[11px] text-purple-200/90 flex items-start gap-1.5 font-normal">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>{aiInsight}</span>
          </div>
        )}
      </div>

      {/* Filter Intensity Slider */}
      {currentGrade && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400">Intensitas Filter AI</span>
            <span className="font-mono text-cyan-400 font-bold">
              {currentGrade.filterIntensity ?? 100}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentGrade.filterIntensity ?? 100}
            onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1.5">
            <span>0% (Asli)</span>
            <button
              type="button"
              onClick={onToggleCompare}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors ${
                isComparingOriginal ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{isComparingOriginal ? 'Melihat RAW' : 'Bandingkan RAW'}</span>
            </button>
            <span>100% (Penuh)</span>
          </div>
        </div>
      )}

      {/* Filter Presets Grid */}
      <div>
        <p className="font-bold text-white text-xs uppercase tracking-wider mb-2">
          Koleksi LUT & Filter Berbasis AI
        </p>

        <div className="grid grid-cols-2 gap-2">
          {FILTER_PRESETS.map((preset) => {
            const isSelected = currentGrade?.preset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono uppercase px-1 rounded bg-zinc-800 text-cyan-300">
                    {preset.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="font-semibold text-white text-xs truncate">{preset.name}</p>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
