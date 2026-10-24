import React, { useRef } from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Play,
  Trash2,
  Sliders,
  Sparkles,
  Radio,
} from 'lucide-react';
import { AudioTrack, ProjectState } from '../../types/editor.ts';
import { SAMPLE_AUDIO_LIBRARY } from '../../data/sampleMedia.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface AudioPanelProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedAudioTrack: AudioTrack | null;
}

export const AudioPanel: React.FC<AudioPanelProps> = ({
  project,
  onUpdateProject,
  selectedAudioTrack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const newAudio: AudioTrack = {
      id: `audio-usr-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      src: objectUrl,
      category: 'music',
      duration: 15,
      startTime: project.currentTime,
      inPoint: 0,
      outPoint: 15,
      volume: 80,
      muted: false,
      fadeIn: 0.5,
      fadeOut: 1.0,
    };

    onUpdateProject({
      audioTracks: [...project.audioTracks, newAudio],
      selectedAudioTrackId: newAudio.id,
    });
  };

  const handleAddStockAudio = (sample: typeof SAMPLE_AUDIO_LIBRARY[0]) => {
    // Audition sound
    if (sample.category === 'sfx') {
      playSynthSound(sample.id.includes('swoosh') ? 'swoosh' : 'laser');
    } else {
      playSynthSound('synthwave');
    }

    const newAudio: AudioTrack = {
      id: `audio-stock-${Date.now()}`,
      name: sample.name,
      src: sample.url,
      category: sample.category,
      duration: sample.duration,
      startTime: project.currentTime,
      inPoint: 0,
      outPoint: sample.duration,
      volume: sample.category === 'sfx' ? 95 : 85,
      muted: false,
      fadeIn: sample.category === 'music' ? 0.8 : 0,
      fadeOut: sample.category === 'music' ? 1.5 : 0.2,
    };

    onUpdateProject({
      audioTracks: [...project.audioTracks, newAudio],
      selectedAudioTrackId: newAudio.id,
    });
  };

  const updateSelectedTrack = (updates: Partial<AudioTrack>) => {
    if (!selectedAudioTrack) return;
    const updated = project.audioTracks.map((tr) =>
      tr.id === selectedAudioTrack.id ? { ...tr, ...updates } : tr
    );
    onUpdateProject({ audioTracks: updated });
  };

  const handleDeleteTrack = (id: string) => {
    const updated = project.audioTracks.filter((tr) => tr.id !== id);
    onUpdateProject({
      audioTracks: updated,
      selectedAudioTrackId: updated[0]?.id || null,
    });
  };

  const handleAuditionSynth = (type: 'swoosh' | 'laser' | 'bass' | 'synthwave') => {
    playSynthSound(type);
  };

  return (
    <div className="space-y-4 text-xs text-zinc-300">
      <div>
        <p className="font-bold text-white text-xs uppercase tracking-wider">
          Studio Audio & Add Sound
        </p>
        <p className="text-[11px] text-zinc-400">
          Tambahkan background music, sound effect (SFX) transisi, dan atur volume multi-track.
        </p>
      </div>

      {/* Upload user audio file */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUploadAudio}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-900/60 hover:bg-emerald-950/20 rounded-xl p-3.5 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">Unggah Musik / Suara Anda</p>
            <p className="text-[10px] text-zinc-400">Format MP3, WAV, AAC, OGG</p>
          </div>
        </button>
      </div>

      {/* Selected Audio Track Properties */}
      {selectedAudioTrack && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1.5 truncate">
              <Music className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-bold text-white text-xs truncate max-w-[150px]">
                {selectedAudioTrack.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateSelectedTrack({ muted: !selectedAudioTrack.muted })}
                className={`p-1 rounded ${selectedAudioTrack.muted ? 'text-rose-400' : 'text-emerald-400'}`}
                title="Mute / Unmute"
              >
                {selectedAudioTrack.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTrack(selectedAudioTrack.id)}
                className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                title="Hapus Audio Track"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Volume slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-400">Volume Suara</span>
              <span className="font-mono text-emerald-400 font-bold">{selectedAudioTrack.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedAudioTrack.volume}
              onChange={(e) => updateSelectedTrack({ volume: parseInt(e.target.value, 10) })}
              className="w-full cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Fade In & Fade Out */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="text-zinc-400 block mb-0.5">Fade In ({selectedAudioTrack.fadeIn}s)</label>
              <input
                type="range"
                min="0"
                max="3.0"
                step="0.1"
                value={selectedAudioTrack.fadeIn}
                onChange={(e) => updateSelectedTrack({ fadeIn: parseFloat(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-0.5">Fade Out ({selectedAudioTrack.fadeOut}s)</label>
              <input
                type="range"
                min="0"
                max="3.0"
                step="0.1"
                value={selectedAudioTrack.fadeOut}
                onChange={(e) => updateSelectedTrack({ fadeOut: parseFloat(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stock Library SFX & Music */}
      <div>
        <p className="font-bold text-white text-xs uppercase tracking-wider mb-2">
          Koleksi BGM Sinematik & SFX Transisi
        </p>

        <div className="space-y-1.5">
          {SAMPLE_AUDIO_LIBRARY.map((sample) => (
            <div
              key={sample.id}
              className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/60 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <button
                  type="button"
                  onClick={() =>
                    handleAuditionSynth(
                      sample.id.includes('swoosh')
                        ? 'swoosh'
                        : sample.id.includes('laser')
                        ? 'laser'
                        : sample.id.includes('bass')
                        ? 'bass'
                        : 'synthwave'
                    )
                  }
                  className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-colors flex-shrink-0"
                  title="Dengarkan Suara Preview"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
                <div className="truncate">
                  <p className="font-semibold text-white text-xs truncate">{sample.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    <span className="uppercase text-emerald-400">{sample.category}</span> • {sample.duration} detik
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddStockAudio(sample)}
                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 text-[10px] font-bold transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
