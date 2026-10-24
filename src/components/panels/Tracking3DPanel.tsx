import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  Sparkles,
  Layers,
  Box,
  Type,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Move,
  Eye,
  Activity,
  Maximize2,
  Search,
  Flame,
  Camera,
  Grid,
  Zap,
  Check,
} from 'lucide-react';
import { ProjectState, Tracked3DElement, Effect3DCategory, Effect3DPreset } from '../../types/editor.ts';
import {
  EFFECTS_3D_LIBRARY,
  CATEGORY_LABELS,
  searchEffects,
  getEffectsCount,
} from '../../data/effects3DLibrary.ts';
import { generate3DTrackingTrajectory } from '../../utils/tracking3D.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface Tracking3DPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedElement: Tracked3DElement | null;
}

export const Tracking3DPanel: React.FC<Tracking3DPanelProps> = ({
  project,
  onUpdateProject,
  selectedElement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Effect3DCategory>('all');
  const [isSolving, setIsSolving] = useState(false);
  const totalCount = getEffectsCount();

  const filteredEffects = useMemo(() => {
    return searchEffects(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Re-solve 3D motion tracking trajectory
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

  // Attach a preset from the 240+ catalog
  const handleAttachPreset = (preset: Effect3DPreset) => {
    playSynthSound('laser');
    const newElement: Tracked3DElement = {
      id: `trk-3d-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      presetId: preset.id,
      name: preset.name,
      type: preset.type,
      category: preset.category,
      text: preset.type === 'calloutPin' ? 'OBJECT [TRACKED]' : preset.type === 'text3d' ? 'NINZTRO 3D' : preset.name.toUpperCase(),
      color: preset.defaultColor,
      size: preset.defaultSize,
      offsetX: 0,
      offsetY: 0,
      offsetZ: preset.defaultDepthZ,
      pitchOffset: 0,
      yawOffset: 0,
      rollOffset: 0,
      opacity: 0.95,
      glow: true,
      visible: true,
      trackId: 'track-camera-1',
      animationSpeed: preset.animationSpeed || 1.0,
      depthOcclusion: false,
    };

    onUpdateProject({
      trackedElements: [...project.trackedElements, newElement],
      selected3DElementId: newElement.id,
    });
  };

  const updateSelectedElement = (updates: Partial<Tracked3DElement>) => {
    if (!selectedElement) return;
    const updated = project.trackedElements.map((el) =>
      el.id === selectedElement.id ? { ...el, ...updates } : el
    );
    onUpdateProject({ trackedElements: updated });
  };

  const handleDeleteElement = (id: string) => {
    const updated = project.trackedElements.filter((el) => el.id !== id);
    onUpdateProject({
      trackedElements: updated,
      selected3DElementId: updated[0]?.id || null,
    });
  };

  const categories: Effect3DCategory[] = [
    'all',
    'cyberHud',
    'typography3d',
    'calloutPins',
    'geometric3d',
    'particlesVfx',
    'cameraMotion',
  ];

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      {/* Header & Count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Studio 3D Tracking & VFX</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            {totalCount} efek 3D tracking sinematik siap pasang ke video.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-bold">
          {totalCount} EFEK 3D
        </span>
      </div>

      {/* 3D Camera Solver & Spatial HUD */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Camera Matchmove Solver</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>{project.trackingPoints.length} Vektor</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSolveCamera}
            disabled={isSolving}
            className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
            <span>{isSolving ? 'Menghitung 3D...' : 'Re-Solve 3D Camera'}</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateProject({ isTrackingModeActive: !project.isTrackingModeActive })}
            className={`px-2 py-1.5 rounded-lg font-bold border transition-colors flex items-center justify-center gap-1 text-[11px] ${
              project.isTrackingModeActive
                ? 'bg-cyan-500 text-black border-cyan-400'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{project.isTrackingModeActive ? 'Target: ON' : 'Klik Target 3D'}</span>
          </button>
        </div>

        {/* Camera Frustum & Grid toggle */}
        <div className="pt-1 flex items-center justify-between border-t border-zinc-800/80 text-[11px]">
          <span className="text-zinc-400">Visualisasi Bidang Kamera Spasial</span>
          <button
            type="button"
            onClick={() => onUpdateProject({ cameraFrustumVisible: !project.cameraFrustumVisible })}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              project.cameraFrustumVisible
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {project.cameraFrustumVisible ? 'Frustum Aktif' : 'Tampilkan Frustum'}
          </button>
        </div>
      </div>

      {/* Selected Element Property Inspector */}
      {selectedElement && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedElement.color }} />
              <span className="font-bold text-white text-xs truncate max-w-[140px]">
                {selectedElement.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateSelectedElement({ visible: !selectedElement.visible })}
                className={`p-1 rounded ${selectedElement.visible ? 'text-cyan-400' : 'text-zinc-600'}`}
                title="Toggle Visibilitas"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteElement(selectedElement.id)}
                className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                title="Hapus Elemen 3D"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text/Label input */}
          <div>
            <label className="text-zinc-400 block mb-1">Teks / Label Elemen 3D</label>
            <input
              type="text"
              value={selectedElement.text}
              onChange={(e) => updateSelectedElement({ text: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Color palette */}
          <div>
            <label className="text-zinc-400 block mb-1">Warna Hologram 3D</label>
            <div className="flex items-center gap-2">
              {['#00ffff', '#ec4899', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#ffffff'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateSelectedElement({ color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedElement.color === c ? 'scale-110 border-white' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Size & Depth */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-zinc-400 text-[10px] mb-0.5">
                <span>Skala 3D</span>
                <span className="font-mono text-cyan-400">{selectedElement.size.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={selectedElement.size}
                onChange={(e) => updateSelectedElement({ size: parseFloat(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 text-[10px] mb-0.5">
                <span>Kedalaman Z</span>
                <span className="font-mono text-fuchsia-400">{selectedElement.offsetZ}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="120"
                value={selectedElement.offsetZ}
                onChange={(e) => updateSelectedElement({ offsetZ: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Offset X & Offset Y */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex justify-between text-zinc-400 text-[10px] mb-0.5">
                <span>Posisi X</span>
                <span className="font-mono text-zinc-300">{selectedElement.offsetX}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={selectedElement.offsetX}
                onChange={(e) => updateSelectedElement({ offsetX: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-400 text-[10px] mb-0.5">
                <span>Posisi Y</span>
                <span className="font-mono text-zinc-300">{selectedElement.offsetY}px</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={selectedElement.offsetY}
                onChange={(e) => updateSelectedElement({ offsetY: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Depth Occlusion toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[11px]">
            <span className="text-zinc-400">Depth Occlusion (Berada di Belakang Subjek)</span>
            <button
              type="button"
              onClick={() => updateSelectedElement({ depthOcclusion: !selectedElement.depthOcclusion })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedElement.depthOcclusion
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
              }`}
            >
              {selectedElement.depthOcclusion ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* 240+ Catalog Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari dari ${totalCount} efek 3D tracking...`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => {
            const info = CATEGORY_LABELS[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{info.label}</span>
                <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-black/30 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'}`}>
                  {info.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Catalog Items Grid */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {filteredEffects.map((preset) => {
            return (
              <div
                key={preset.id}
                onClick={() => handleAttachPreset(preset)}
                className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/60 hover:bg-zinc-800/60 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/40"
                    style={{ backgroundColor: preset.defaultColor }}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <p className="font-semibold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                        {preset.name}
                      </p>
                      <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">
                        {preset.subcategory}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                      {preset.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-cyan-500 group-hover:text-black flex items-center justify-center text-zinc-400 transition-colors flex-shrink-0 ml-2"
                  title="Pasang Efek 3D ini ke Video"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
