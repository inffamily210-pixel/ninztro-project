import React from 'react';
import { ProjectState, MediaClip, Tracked3DElement, AudioTrack } from '../types/editor.ts';
import { MediaPanel } from './panels/MediaPanel.tsx';
import { TransitionsPanel } from './panels/TransitionsPanel.tsx';
import { FiltersPanel } from './panels/FiltersPanel.tsx';
import { LightingPanel } from './panels/LightingPanel.tsx';
import { KeyframePanel } from './panels/KeyframePanel.tsx';
import { CameraTrackingPanel } from './panels/CameraTrackingPanel.tsx';
import { EffectsLibraryPanel } from './panels/EffectsLibraryPanel.tsx';
import { AudioPanel } from './panels/AudioPanel.tsx';
import { SpeedRampPanel } from './panels/SpeedRampPanel.tsx';

interface InspectorContainerProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  selectedClip: MediaClip | null;
  selected3DElement: Tracked3DElement | null;
  selectedAudioTrack: AudioTrack | null;
  isComparingOriginal: boolean;
  onToggleCompare: () => void;
}

export const InspectorContainer: React.FC<InspectorContainerProps> = ({
  project,
  onUpdateProject,
  selectedClip,
  selected3DElement,
  selectedAudioTrack,
  isComparingOriginal,
  onToggleCompare,
}) => {
  return (
    <aside className="w-80 md:w-96 bg-[#0c0f18] border-r border-zinc-800/80 flex flex-col flex-shrink-0 select-none z-10 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {project.activeTab === 'media' && (
          <MediaPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}
        {project.activeTab === 'transitions' && (
          <TransitionsPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}
        {project.activeTab === 'filters' && (
          <FiltersPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
            isComparingOriginal={isComparingOriginal}
            onToggleCompare={onToggleCompare}
          />
        )}
        {project.activeTab === 'lighting' && (
          <LightingPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}
        {project.activeTab === 'keyframes' && (
          <KeyframePanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}
        {project.activeTab === 'tracking3d' && (
          <CameraTrackingPanel
            project={project}
            onUpdateProject={onUpdateProject}
          />
        )}
        {project.activeTab === 'effects' && (
          <EffectsLibraryPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedElement={selected3DElement}
          />
        )}
        {project.activeTab === 'speedramp' && (
          <SpeedRampPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedClip={selectedClip}
          />
        )}
        {project.activeTab === 'audio' && (
          <AudioPanel
            project={project}
            onUpdateProject={onUpdateProject}
            selectedAudioTrack={selectedAudioTrack}
          />
        )}
      </div>
    </aside>
  );
};
