import React from 'react';
import {
  Film,
  Sparkles,
  Zap,
  Sun,
  Diamond,
  Crosshair,
  Music,
  Gauge,
  Camera,
  Layers,
} from 'lucide-react';
import { ProjectState } from '../types/editor.ts';

interface SidebarTabsProps {
  activeTab: ProjectState['activeTab'];
  onSelectTab: (tab: ProjectState['activeTab']) => void;
}

interface TabItem {
  id: ProjectState['activeTab'];
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: 'media', label: 'Media', icon: <Film className="w-4 h-4" /> },
  { id: 'transitions', label: 'Transisi', icon: <Zap className="w-4 h-4" />, badge: 'VFX' },
  { id: 'filters', label: 'Filter AI', icon: <Sparkles className="w-4 h-4" />, badge: 'AI' },
  { id: 'lighting', label: 'Cahaya', icon: <Sun className="w-4 h-4" />, badge: 'FX' },
  { id: 'keyframes', label: 'Keyframe', icon: <Diamond className="w-4 h-4" />, badge: 'PRO' },
  { id: 'tracking3d', label: 'Kamera 3D', icon: <Camera className="w-4 h-4" />, badge: 'CAM' },
  { id: 'effects', label: '240+ Efek', icon: <Layers className="w-4 h-4" />, badge: '240+' },
  { id: 'speedramp', label: 'Speed Ramp', icon: <Gauge className="w-4 h-4" />, badge: 'NEW' },
  { id: 'audio', label: 'Sound', icon: <Music className="w-4 h-4" /> },
];

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="w-16 bg-[#0c0e16] border-r border-zinc-800/80 flex flex-col items-center py-2 gap-1 select-none flex-shrink-0 z-20 overflow-y-auto custom-scrollbar">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`w-13 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all relative group cursor-pointer flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-b from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            {tab.badge && (
              <span className={`absolute top-0.5 right-0.5 px-1 rounded-[4px] font-extrabold text-[7px] leading-tight ${
                tab.badge === '240+' ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/50' : 'bg-cyan-500 text-black'
              }`}>
                {tab.badge}
              </span>
            )}
            <div className={`p-1 rounded-lg ${isActive ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-white'}`}>
              {tab.icon}
            </div>
            <span className="truncate max-w-[50px] leading-none text-[8.5px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
