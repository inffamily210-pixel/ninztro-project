import React, { useRef } from 'react';
import {
  Upload,
  Film,
  Image as ImageIcon,
  Clock,
  Gauge,
  Plus,
  PlaySquare,
  Sparkles,
} from 'lucide-react';
import { MediaClip, ProjectState } from '../../types/editor.ts';
import { SAMPLE_MEDIA_LIBRARY } from '../../data/sampleMedia.ts';
import { DEFAULT_COLOR_GRADE } from '../../utils/colorGrading.ts';

interface MediaPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({
  project,
  onUpdateProject,
  selectedClip,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local user video/photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);

    const newClip: MediaClip = {
      id: `clip-usr-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: isVideo ? 'video' : 'photo',
      src: objectUrl,
      thumbnailUrl: isVideo ? undefined : objectUrl,
      duration: isVideo ? 10 : 5,
      inPoint: 0,
      outPoint: isVideo ? 10 : 5,
      playbackSpeed: 1,
      aspectRatio: 16 / 9,
      width: 1920,
      height: 1080,
      keyframes: {
        posX: [],
        posY: [],
        scale: [],
        rotation: [],
        opacity: [],
        brightness: [],
        blur: [],
      },
      colorGrade: { ...DEFAULT_COLOR_GRADE },
      lighting: {
        enabled: false,
        type: 'none',
        intensity: 50,
        color: '#ffffff',
        x: 50,
        y: 50,
        size: 100,
        rotation: 0,
        blendMode: 'screen',
      },
      transitionIn: { type: 'none', duration: 0.5 },
      transitionOut: { type: 'none', duration: 0.5 },
    };

    const newClips = [...project.clips, newClip];
    const newTotalDuration = newClips.reduce((acc, c) => acc + (c.outPoint - c.inPoint), 0);

    onUpdateProject({
      clips: newClips,
      selectedClipId: newClip.id,
      duration: Math.max(1, newTotalDuration),
    });
  };

  const handleAddSampleClip = (sample: typeof SAMPLE_MEDIA_LIBRARY[0]) => {
    const newClip: MediaClip = {
      id: `clip-sample-${Date.now()}`,
      name: sample.name,
      type: sample.type,
      src: sample.url,
      thumbnailUrl: sample.thumbnail,
      duration: sample.duration,
      inPoint: 0,
      outPoint: Math.min(6, sample.duration),
      playbackSpeed: 1,
      aspectRatio: 16 / 9,
      width: 1920,
      height: 1080,
      keyframes: {
        posX: [],
        posY: [],
        scale: [],
        rotation: [],
        opacity: [],
        brightness: [],
        blur: [],
      },
      colorGrade: { ...DEFAULT_COLOR_GRADE },
      lighting: {
        enabled: false,
        type: 'none',
        intensity: 50,
        color: '#ffffff',
        x: 50,
        y: 50,
        size: 100,
        rotation: 0,
        blendMode: 'screen',
      },
      transitionIn: { type: 'none', duration: 0.5 },
      transitionOut: { type: 'none', duration: 0.5 },
    };

    const newClips = [...project.clips, newClip];
    const newTotalDuration = newClips.reduce((acc, c) => acc + (c.outPoint - c.inPoint), 0);

    onUpdateProject({
      clips: newClips,
      selectedClipId: newClip.id,
      duration: Math.max(1, newTotalDuration),
    });
  };

  const updateSelectedClip = (updates: Partial<MediaClip>) => {
    if (!selectedClip) return;
    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, ...updates } : c
    );
    const newTotalDuration = updatedClips.reduce((acc, c) => acc + (c.outPoint - c.inPoint), 0);
    onUpdateProject({
      clips: updatedClips,
      duration: Math.max(1, newTotalDuration),
    });
  };

  return (
    <div className="space-y-5 text-xs text-zinc-300">
      {/* Upload button area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-zinc-700 hover:border-cyan-500 bg-zinc-900/60 hover:bg-cyan-950/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">Unggah Video atau Foto</p>
            <p className="text-[11px] text-zinc-400">MP4, WebM, MOV, JPG, PNG (Resolusi Penuh)</p>
          </div>
        </button>
      </div>

      {/* Selected Clip Properties (Trim, Speed, Duration) */}
      {selectedClip && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-cyan-400" />
              <span className="truncate max-w-[150px]">{selectedClip.name}</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {selectedClip.type}
            </span>
          </div>

          {/* Speed slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-zinc-400">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kecepatan Pemutaran</span>
              </span>
              <span className="font-mono text-cyan-400">{selectedClip.playbackSpeed}x</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0.5, 0.75, 1.0, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => updateSelectedClip({ playbackSpeed: spd })}
                  className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                    selectedClip.playbackSpeed === spd
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Trim in/out slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Durasi Potongan Klip</span>
              </span>
              <span className="font-mono text-amber-400">
                {(selectedClip.outPoint - selectedClip.inPoint).toFixed(1)}s
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-zinc-500 text-[10px] uppercase">Titik Masuk (In)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={selectedClip.outPoint - 0.5}
                  value={selectedClip.inPoint}
                  onChange={(e) => updateSelectedClip({ inPoint: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-200 mt-0.5"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] uppercase">Titik Keluar (Out)</label>
                <input
                  type="number"
                  step="0.1"
                  min={selectedClip.inPoint + 0.5}
                  max={selectedClip.duration}
                  value={selectedClip.outPoint}
                  onChange={(e) => updateSelectedClip({ outPoint: Math.min(selectedClip.duration, parseFloat(e.target.value) || 1) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 font-mono text-zinc-200 mt-0.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Sample Clips Library */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-white text-xs uppercase tracking-wider">
            Koleksi Media Sinematik
          </p>
          <span className="text-[10px] text-zinc-500">1-Klik Tambah ke Timeline</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {SAMPLE_MEDIA_LIBRARY.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleAddSampleClip(sample)}
              className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/60 hover:bg-zinc-800/60 transition-all cursor-pointer group"
            >
              <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                <img
                  src={sample.thumbnail}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 font-mono text-[9px] text-zinc-300">
                  {sample.duration}s
                </span>
              </div>
              <div className="flex-1 truncate">
                <p className="font-semibold text-white truncate text-xs">{sample.name}</p>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <span className="px-1 py-0.2 rounded bg-zinc-800 text-cyan-300">
                    {sample.category}
                  </span>
                  <span>{sample.type === 'video' ? 'Video 1080p' : 'Foto HDR'}</span>
                </p>
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-cyan-500 group-hover:text-black flex items-center justify-center text-zinc-400 transition-colors"
                title="Tambahkan ke Timeline"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
