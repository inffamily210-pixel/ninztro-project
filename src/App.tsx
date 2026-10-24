import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectState, MediaClip, FilterPresetId } from './types/editor.ts';
import {
  createDefaultClips,
  createDefaultAudioTracks,
  createDefault3DTracking,
} from './data/sampleMedia.ts';
import { Header } from './components/Header.tsx';
import { SidebarTabs } from './components/SidebarTabs.tsx';
import { InspectorContainer } from './components/InspectorContainer.tsx';
import { ViewportPlayer } from './components/ViewportPlayer.tsx';
import { Timeline } from './components/Timeline.tsx';
import { ExportModal } from './components/panels/ExportModal.tsx';
import { AboutView } from './components/AboutView.tsx';
import { ProjectsListView } from './components/ProjectsListView.tsx';
import { NewProjectModal } from './components/panels/NewProjectModal.tsx';
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  createNewProjectState,
  StoredProjectData,
  generateShareableLink,
  ProjectCreateOptions,
} from './utils/projectStorage.ts';
import { generate3DTrackingTrajectory } from './utils/tracking3D.ts';
import { playSynthSound } from './utils/audioSynth.ts';

export default function App() {
  const initialClips = createDefaultClips();
  const initialAudio = createDefaultAudioTracks();
  const { trackingPoints: initialPoints, trackedElements: initialElements } = createDefault3DTracking();

  // Navigation: Menu 1 (About), Menu 2 (Projects List), Menu 3 (Editor)
  const [currentMainView, setCurrentMainView] = useState<'about' | 'projects' | 'editor'>('editor');

  // Stored projects library
  const [savedProjects, setSavedProjects] = useState<StoredProjectData[]>(() => {
    return loadProjectsFromStorage();
  });

  const [activeProjectId, setActiveProjectId] = useState<string>('proj-default-1');

  const [project, setProject] = useState<ProjectState>({
    title: 'Cyberpunk Tokyo Motion',
    canvasWidth: 1920,
    canvasHeight: 1080,
    aspectRatioLabel: '16:9',
    fps: 30,
    currentTime: 1.8,
    duration: 12.0,
    isPlaying: false,
    selectedClipId: initialClips[0].id,
    selected3DElementId: initialElements[0].id,
    selectedAudioTrackId: initialAudio[0].id,
    clips: initialClips,
    audioTracks: initialAudio,
    trackingPoints: initialPoints,
    trackedElements: initialElements,
    isTrackingModeActive: false,
    activeTab: 'filters',
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync project changes to savedProjects
  const updateProject = useCallback((updates: Partial<ProjectState>) => {
    setProject((prev) => {
      const nextState = { ...prev, ...updates };

      // Update in saved projects
      setSavedProjects((list) => {
        const updatedList = list.map((item) => {
          if (item.metadata.id === activeProjectId) {
            return {
              ...item,
              metadata: {
                ...item.metadata,
                title: nextState.title,
                duration: nextState.duration,
                clipsCount: nextState.clips.length,
                effectsCount: nextState.trackedElements.length,
                aspectRatio: nextState.aspectRatioLabel as any,
                updatedAt: 'Baru saja',
              },
              state: nextState,
            };
          }
          return item;
        });
        saveProjectsToStorage(updatedList);
        return updatedList;
      });

      return nextState;
    });
  }, [activeProjectId]);

  // Open project from Menu 2
  const handleOpenProject = useCallback((projectData: StoredProjectData) => {
    playSynthSound('synthwave');
    setActiveProjectId(projectData.metadata.id);
    setProject(projectData.state);
    setCurrentMainView('editor');
  }, []);

  // Trigger New Project Modal
  const handleCreateNewProject = useCallback(() => {
    playSynthSound('laser');
    setIsNewProjectModalOpen(true);
  }, []);

  // Confirm creation from New Project Modal with chosen resolution and fps (30 to 144)
  const handleConfirmCreateProject = useCallback((title: string, options: ProjectCreateOptions) => {
    playSynthSound('synthwave');
    const newId = `proj-${Date.now()}`;
    const newState = createNewProjectState(title, options);

    const newProjectData: StoredProjectData = {
      metadata: {
        id: newId,
        title,
        thumbnailUrl: newState.clips[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
        duration: newState.duration,
        clipsCount: newState.clips.length,
        aspectRatio: (newState.aspectRatioLabel as any) || '16:9',
        updatedAt: 'Baru saja',
        createdAt: 'Hari ini',
        effectsCount: newState.trackedElements.length,
      },
      state: newState,
    };

    const updated = [newProjectData, ...savedProjects];
    setSavedProjects(updated);
    saveProjectsToStorage(updated);

    setActiveProjectId(newId);
    setProject(newState);
    setIsNewProjectModalOpen(false);
    setCurrentMainView('editor');
  }, [savedProjects]);

  // Duplicate project
  const handleDuplicateProject = useCallback((projectId: string) => {
    playSynthSound('swoosh');
    const existing = savedProjects.find((p) => p.metadata.id === projectId);
    if (!existing) return;

    const copyId = `proj-copy-${Date.now()}`;
    const copyTitle = `${existing.metadata.title} (Salinan)`;
    const copyData: StoredProjectData = {
      metadata: {
        ...existing.metadata,
        id: copyId,
        title: copyTitle,
        updatedAt: 'Baru saja',
      },
      state: {
        ...existing.state,
        title: copyTitle,
      },
    };

    const updated = [copyData, ...savedProjects];
    setSavedProjects(updated);
    saveProjectsToStorage(updated);
  }, [savedProjects]);

  // Delete project
  const handleDeleteProject = useCallback((projectId: string) => {
    playSynthSound('swoosh');
    const updated = savedProjects.filter((p) => p.metadata.id !== projectId);
    setSavedProjects(updated);
    saveProjectsToStorage(updated);
  }, [savedProjects]);

  // Selected entities
  const selectedClip = project.clips.find((c) => c.id === project.selectedClipId) || project.clips[0] || null;
  const selected3DElement = project.trackedElements.find((el) => el.id === project.selected3DElementId) || null;
  const selectedAudioTrack = project.audioTracks.find((tr) => tr.id === project.selectedAudioTrackId) || null;

  // Toggle playback
  const togglePlay = useCallback(() => {
    setProject((prev) => {
      const nextPlay = !prev.isPlaying;
      if (nextPlay) {
        lastTimeRef.current = performance.now();
      }
      return { ...prev, isPlaying: nextPlay };
    });
  }, []);

  // Main playback animation loop
  useEffect(() => {
    if (!project.isPlaying || currentMainView !== 'editor') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const loop = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (now - lastTimeRef.current) / 1000;
        setProject((prev) => {
          if (!prev.isPlaying) return prev;
          let newTime = prev.currentTime + delta;
          if (newTime >= prev.duration) {
            newTime = 0; // loop
          }
          return { ...prev, currentTime: Number(newTime.toFixed(3)) };
        });
      }
      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [project.isPlaying, currentMainView]);

  // Split selected clip at playhead
  const handleSplitClip = useCallback(() => {
    playSynthSound('swoosh');
    setProject((prev) => {
      let accumulated = 0;
      let targetIndex = -1;
      let splitTimeInClip = 0;

      for (let i = 0; i < prev.clips.length; i++) {
        const c = prev.clips[i];
        const clipDur = c.outPoint - c.inPoint;
        if (prev.currentTime >= accumulated && prev.currentTime <= accumulated + clipDur) {
          targetIndex = i;
          splitTimeInClip = c.inPoint + (prev.currentTime - accumulated) * c.playbackSpeed;
          break;
        }
        accumulated += clipDur;
      }

      if (targetIndex === -1) return prev;

      const clipToSplit = prev.clips[targetIndex];
      if (splitTimeInClip - clipToSplit.inPoint < 0.2 || clipToSplit.outPoint - splitTimeInClip < 0.2) {
        return prev;
      }

      const firstPart: MediaClip = {
        ...clipToSplit,
        id: `clip-part1-${Date.now()}`,
        outPoint: splitTimeInClip,
        name: `${clipToSplit.name} (A)`,
      };

      const secondPart: MediaClip = {
        ...clipToSplit,
        id: `clip-part2-${Date.now()}`,
        inPoint: splitTimeInClip,
        name: `${clipToSplit.name} (B)`,
      };

      const newClips = [...prev.clips];
      newClips.splice(targetIndex, 1, firstPart, secondPart);

      return {
        ...prev,
        clips: newClips,
        selectedClipId: secondPart.id,
      };
    });
  }, []);

  // Delete currently selected clip
  const handleDeleteSelectedClip = useCallback(() => {
    playSynthSound('swoosh');
    setProject((prev) => {
      if (prev.clips.length <= 1) return prev;
      const newClips = prev.clips.filter((c) => c.id !== prev.selectedClipId);
      const newDuration = newClips.reduce((acc, c) => acc + (c.outPoint - c.inPoint), 0);
      return {
        ...prev,
        clips: newClips,
        selectedClipId: newClips[0]?.id || null,
        duration: Math.max(1, newDuration),
        currentTime: Math.min(prev.currentTime, newDuration),
      };
    });
  }, []);

  // Snapshot frame as 4K PNG photo
  const handleCaptureSnapshot = useCallback(() => {
    playSynthSound('laser');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = project.canvasWidth;
      canvas.height = project.canvasHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#080a10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('NINZTRO 4K SNAPSHOT', 100, 150);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px sans-serif';
        ctx.fillText(`Timecode: ${project.currentTime.toFixed(2)}s | Filter: ${selectedClip?.colorGrade.preset}`, 100, 220);
      }
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Ninztro_Snapshot_${project.currentTime.toFixed(2)}s.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.log('Snapshot captured', err);
    }
  }, [project.canvasWidth, project.canvasHeight, project.currentTime, selectedClip]);

  // AI Auto-Grade quick trigger
  const handleTriggerAiGrade = useCallback(async () => {
    if (!selectedClip) return;
    setIsAiLoading(true);
    playSynthSound('laser');

    try {
      const res = await fetch('/api/ai-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Cinematic Cyberpunk Neon Grade with deep contrast and rich color highlights',
          mediaType: selectedClip.type,
          currentSettings: selectedClip.colorGrade,
        }),
      });

      const data = await res.json();
      if (data.recipe) {
        const updatedClips = project.clips.map((c) =>
          c.id === selectedClip.id
            ? {
                ...c,
                colorGrade: {
                  ...c.colorGrade,
                  preset: data.recipe.preset as FilterPresetId,
                  filterIntensity: data.recipe.filterIntensity ?? 90,
                  exposure: data.recipe.exposure ?? 5,
                  contrast: data.recipe.contrast ?? 30,
                  saturation: data.recipe.saturation ?? 30,
                  temperature: data.recipe.temperature ?? -10,
                  tint: data.recipe.tint ?? 15,
                  highlights: data.recipe.highlights ?? 15,
                  shadows: data.recipe.shadows ?? -20,
                  vignette: data.recipe.vignette ?? 35,
                  grain: data.recipe.grain ?? 20,
                  bloom: data.recipe.bloom ?? 30,
                },
              }
            : c
        );
        updateProject({ clips: updatedClips, activeTab: 'filters' });
        playSynthSound('synthwave');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedClip, project.clips, updateProject]);

  // Click on video canvas in 3D tracking mode
  const handleAddTrackingPointAtCoord = useCallback((nx: number, ny: number) => {
    playSynthSound('laser');
    const newTrajectory = generate3DTrackingTrajectory(nx, ny, project.duration, 10, 'smoothParallax');
    updateProject({
      trackingPoints: newTrajectory,
      isTrackingModeActive: false,
    });
  }, [project.duration, updateProject]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        updateProject({ currentTime: Math.max(0, project.currentTime - 1 / project.fps) });
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        updateProject({ currentTime: Math.min(project.duration, project.currentTime + 1 / project.fps) });
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitClip();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelectedClip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, project.currentTime, project.duration, project.fps, handleSplitClip, handleDeleteSelectedClip, updateProject]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0e14] text-zinc-100 overflow-hidden select-none font-sans">
      {/* Top Header with 3 Main Menus (Tentang Ninztro | List Project | Studio Editing) */}
      <Header
        project={project}
        onUpdateProject={updateProject}
        onOpenExport={() => setIsExportOpen(true)}
        onCaptureSnapshot={handleCaptureSnapshot}
        onTriggerAiGrade={handleTriggerAiGrade}
        isComparingOriginal={isComparingOriginal}
        onToggleCompare={() => setIsComparingOriginal(!isComparingOriginal)}
        isAiLoading={isAiLoading}
        currentMainView={currentMainView}
        onNavigateView={setCurrentMainView}
      />

      {/* Main Content Area based on Selected Menu */}
      {currentMainView === 'about' && (
        <AboutView
          onNavigateToProjects={() => setCurrentMainView('projects')}
          onNavigateToEditor={() => setCurrentMainView('editor')}
          onCreateNewProject={handleCreateNewProject}
        />
      )}

      {currentMainView === 'projects' && (
        <ProjectsListView
          projects={savedProjects}
          onOpenProject={handleOpenProject}
          onCreateNewProject={handleCreateNewProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onNavigateToAbout={() => setCurrentMainView('about')}
        />
      )}

      {currentMainView === 'editor' && (
        <>
          {/* Main Workspace (Sidebar Tabs + Inspector Container + Viewport Player) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Studio Tabs Bar */}
            <SidebarTabs
              activeTab={project.activeTab}
              onSelectTab={(tab) => updateProject({ activeTab: tab })}
            />

            {/* Inspector Panel for active studio tool */}
            <InspectorContainer
              project={project}
              onUpdateProject={updateProject}
              selectedClip={selectedClip}
              selected3DElement={selected3DElement}
              selectedAudioTrack={selectedAudioTrack}
              isComparingOriginal={isComparingOriginal}
              onToggleCompare={() => setIsComparingOriginal(!isComparingOriginal)}
            />

            {/* Central Viewport Player Compositor */}
            <ViewportPlayer
              project={project}
              onUpdateProject={updateProject}
              onTogglePlay={togglePlay}
              isComparingOriginal={isComparingOriginal}
              onAddTrackingPointAtCoord={handleAddTrackingPointAtCoord}
            />
          </div>

          {/* Bottom Multi-Track Precision Timeline */}
          <Timeline
            project={project}
            onUpdateProject={updateProject}
            onTogglePlay={togglePlay}
            onSplitClip={handleSplitClip}
            onDeleteSelectedClip={handleDeleteSelectedClip}
            selectedClip={selectedClip}
          />
        </>
      )}

      {/* Export & Project Share Link Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      {/* New Project Setup Modal (Resolution & 30-144 FPS Selector) */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleConfirmCreateProject}
        defaultProjectNumber={savedProjects.length + 1}
      />
    </div>
  );
}
