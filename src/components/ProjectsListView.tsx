import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Plus,
  Play,
  Share2,
  Trash2,
  Copy,
  Clock,
  Ratio,
  Film,
  Layers,
  Search,
  Check,
  ExternalLink,
  MoreVertical,
} from 'lucide-react';
import { StoredProjectData, generateShareableLink } from '../utils/projectStorage.ts';
import { ProjectState } from '../types/editor.ts';
import { playSynthSound } from '../utils/audioSynth.ts';

interface ProjectsListViewProps {
  projects: StoredProjectData[];
  onOpenProject: (projectData: StoredProjectData) => void;
  onCreateNewProject: () => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onNavigateToAbout: () => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  projects,
  onOpenProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onNavigateToAbout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRatio, setFilterRatio] = useState<'all' | '16:9' | '9:16' | '1:1'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.metadata.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRatio = filterRatio === 'all' || p.metadata.aspectRatio === filterRatio;
      return matchesSearch && matchesRatio;
    });
  }, [projects, searchQuery, filterRatio]);

  const handleCopyShareLink = (project: StoredProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    playSynthSound('laser');
    const { shareLink } = generateShareableLink(project.state);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLink).catch(() => {});
    }
    setCopiedId(project.metadata.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="flex-1 bg-[#0c0e14] text-zinc-200 overflow-y-auto custom-scrollbar select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* View Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                Daftar Semua Project
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-xs font-semibold border border-zinc-700">
                {projects.length} Project
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Kelola, lanjutkan editing, atau bagikan tautan project kepada rekan kerja dan klien.
            </p>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onCreateNewProject}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Project Baru</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama project..."
              className="w-full bg-[#11141d] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Ratio filter tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-zinc-500 mr-1 hidden sm:inline">Format:</span>
            {[
              { id: 'all', label: 'Semua Rasio' },
              { id: '16:9', label: '16:9 Landscape' },
              { id: '9:16', label: '9:16 Reels' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterRatio(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterRatio === tab.id
                    ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toast confirmation if link copied */}
        {copiedId && (
          <div className="p-3 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-200 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Tautan Berbagi Project berhasil disalin ke clipboard! Siap dikirimkan.</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">https://ninztro.studio/?share=...</span>
          </div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.metadata.id}
                onClick={() => onOpenProject(project)}
                className="group rounded-2xl bg-[#11141d] border border-zinc-800 hover:border-zinc-700 overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <img
                    src={project.metadata.thumbnailUrl}
                    alt={project.metadata.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  {/* Aspect Ratio, Duration & FPS badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 font-semibold border border-zinc-800">
                      {project.metadata.aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-zinc-800">
                      {project.metadata.duration.toFixed(1)}s
                    </span>
                    {project.state?.fps && (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-800/60 font-semibold">
                        {project.state.fps} FPS
                      </span>
                    )}
                  </div>

                  {/* Play overlay button on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-zinc-100 truncate">
                      {project.metadata.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Film className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{project.metadata.clipsCount} Klip</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{project.metadata.effectsCount} Efek 3D</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer toolbar */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500">
                      Disunting {project.metadata.updatedAt}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Copy Share Link button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyShareLink(project, e)}
                        title="Salin Tautan Berbagi Project"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Project */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(project.metadata.id);
                        }}
                        title="Duplikat Project"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Project */}
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project.metadata.id);
                          }}
                          title="Hapus Project"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-[#11141d]/50 space-y-3">
            <p className="text-zinc-400 text-sm">Tidak ada project yang cocok dengan filter pencarian.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterRatio('all');
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
