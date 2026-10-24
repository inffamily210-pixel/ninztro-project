import React from 'react';
import {
  Sparkles,
  Camera,
  Download,
  Film,
  Layers,
  Ratio,
  Maximize2,
  Eye,
  Sliders,
  FolderOpen,
  Info,
  MonitorPlay,
  Share2,
} from 'lucide-react';
import { ProjectState } from '../types/editor.ts';

interface HeaderProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  onOpenExport: () => void;
  onCaptureSnapshot: () => void;
  onTriggerAiGrade: () => void;
  isComparingOriginal: boolean;
  onToggleCompare: () => void;
  isAiLoading: boolean;
  currentMainView: 'about' | 'projects' | 'editor';
  onNavigateView: (view: 'about' | 'projects' | 'editor') => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  onOpenExport,
  onCaptureSnapshot,
  onTriggerAiGrade,
  isComparingOriginal,
  onToggleCompare,
  isAiLoading,
  currentMainView,
  onNavigateView,
}) => {
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  const aspectRatios: { label: ProjectState['aspectRatioLabel']; w: number; h: number; desc: string }[] = [
    { label: '16:9', w: 1920, h: 1080, desc: 'Landscape Cinema' },
    { label: '9:16', w: 1080, h: 1920, desc: 'TikTok / Reels' },
    { label: '1:1', w: 1080, h: 1080, desc: 'Square Post' },
    { label: '21:9', w: 2560, h: 1080, desc: 'UltraWide Scope' },
  ];

  return (
    <header className="h-14 bg-[#11141d] border-b border-zinc-800 px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Main View Switcher Tabs */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigateView('about')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Ke Beranda & Tentang Ninztro"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
            <span className="font-extrabold text-white text-xs tracking-wider">
              N
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 leading-none">
              NINZTRO
              <span className="text-[9px] uppercase font-mono px-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                PRO
              </span>
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden md:block" />

        {/* 3 Main Menu Navigation Pills */}
        <nav className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
          <button
            type="button"
            onClick={() => onNavigateView('about')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentMainView === 'about'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Tentang Ninztro</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView('projects')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentMainView === 'projects'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>List Project</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentMainView === 'editor'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5 text-zinc-300" />
            <span>Studio Editing</span>
          </button>
        </nav>
      </div>

      {/* Editor Context Controls (When in Editor mode) */}
      {currentMainView === 'editor' && (
        <div className="hidden lg:flex items-center gap-3">
          {/* Project Title Input */}
          <input
            type="text"
            value={project.title}
            onChange={(e) => onUpdateProject({ title: e.target.value })}
            className="bg-transparent hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent hover:border-zinc-800 focus:border-zinc-700 rounded-lg px-2 py-0.5 text-xs text-zinc-300 font-medium max-w-[180px] truncate"
            title="Ubah Nama Project"
          />

          {/* Aspect Ratio Selector */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono font-medium rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <Ratio className="w-3 h-3 text-zinc-400" />
              <span>{project.aspectRatioLabel}</span>
            </button>
            <div className="absolute left-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 hidden group-hover:block group-focus-within:block z-50">
              {aspectRatios.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    onUpdateProject({
                      aspectRatioLabel: item.label,
                      canvasWidth: item.w,
                      canvasHeight: item.h,
                    })
                  }
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    project.aspectRatioLabel === item.label
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-zinc-500">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timecode & Project Canvas Telemetry (FPS & Resolution) */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1 font-mono text-xs">
            <span className="text-zinc-200 font-bold">{formatTimecode(project.currentTime)}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{formatTimecode(project.duration)}</span>
            <span className="text-zinc-700">|</span>
            <span className="text-cyan-400 font-semibold">{project.fps || 30} FPS</span>
            <span className="text-zinc-600 text-[10px]">({project.canvasWidth}×{project.canvasHeight})</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {currentMainView === 'editor' && (
          <>
            {/* Compare RAW button */}
            <button
              type="button"
              onClick={onToggleCompare}
              title={isComparingOriginal ? 'Viewing Original RAW' : 'Bandingkan dengan RAW'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isComparingOriginal
                  ? 'bg-zinc-700 text-white border-zinc-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{isComparingOriginal ? 'RAW' : 'Bandingkan'}</span>
            </button>

            {/* Snapshot Frame */}
            <button
              type="button"
              onClick={onCaptureSnapshot}
              title="Snapshot Frame (PNG 4K)"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline">Snapshot</span>
            </button>
          </>
        )}

        {/* Ekspor & Link Berbagi button */}
        <button
          type="button"
          onClick={() => {
            if (currentMainView !== 'editor') onNavigateView('editor');
            onOpenExport();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-white text-zinc-950 shadow-md transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Ekspor & Bagikan Link</span>
        </button>
      </div>
    </header>
  );
};
