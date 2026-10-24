import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Plus,
  Volume2,
  VolumeX,
  Crosshair,
  Diamond,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Music,
} from 'lucide-react';
import { ProjectState, MediaClip, AudioTrack } from '../types/editor.ts';
import { upsertKeyframe, removeKeyframeAtTime } from '../utils/keyframeMath.ts';
import { playSynthSound } from '../utils/audioSynth.ts';

interface TimelineProps {
  project: ProjectState;
  onUpdateProject: (updates: Partial<ProjectState>) => void;
  onTogglePlay: () => void;
  onSplitClip: () => void;
  onDeleteSelectedClip: () => void;
  selectedClip: MediaClip | null;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  onUpdateProject,
  onTogglePlay,
  onSplitClip,
  onDeleteSelectedClip,
  selectedClip,
}) => {
  const [zoomScale, setZoomScale] = useState(1.0); // 1.0 = ~60px per second
  const timelineTrackRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = 70 * zoomScale;
  const totalTimelineWidth = Math.max(1200, project.duration * pixelsPerSecond + 200);

  // Seek time on ruler/timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(project.duration, clickX / pixelsPerSecond));
    onUpdateProject({ currentTime: Number(newTime.toFixed(3)) });
  };

  const stepFrame = (direction: -1 | 1) => {
    const frameTime = 1 / project.fps;
    const newTime = Math.max(0, Math.min(project.duration, project.currentTime + direction * frameTime));
    onUpdateProject({ currentTime: Number(newTime.toFixed(3)) });
  };

  // Add keyframe at current playhead for active clip
  const handleAddKeyframeAtPlayhead = () => {
    if (!selectedClip) return;
    playSynthSound('laser');

    // Compute clip local time
    let accumulatedTime = 0;
    for (const c of project.clips) {
      if (c.id === selectedClip.id) break;
      accumulatedTime += c.outPoint - c.inPoint;
    }
    const localTime = Math.max(0, project.currentTime - accumulatedTime);

    const updatedChannels = {
      ...selectedClip.keyframes,
      scale: upsertKeyframe(selectedClip.keyframes.scale, localTime, 1.2, 'ease-in-out'),
      posX: upsertKeyframe(selectedClip.keyframes.posX, localTime, 15, 'ease-in-out'),
      rotation: upsertKeyframe(selectedClip.keyframes.rotation, localTime, 2, 'ease-in-out'),
    };

    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, keyframes: updatedChannels } : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  // Delete keyframe near current playhead
  const handleDeleteKeyframeAtPlayhead = () => {
    if (!selectedClip) return;
    let accumulatedTime = 0;
    for (const c of project.clips) {
      if (c.id === selectedClip.id) break;
      accumulatedTime += c.outPoint - c.inPoint;
    }
    const localTime = Math.max(0, project.currentTime - accumulatedTime);

    const updatedChannels = {
      ...selectedClip.keyframes,
      scale: removeKeyframeAtTime(selectedClip.keyframes.scale, localTime, 0.15),
      posX: removeKeyframeAtTime(selectedClip.keyframes.posX, localTime, 0.15),
      rotation: removeKeyframeAtTime(selectedClip.keyframes.rotation, localTime, 0.15),
    };

    const updatedClips = project.clips.map((c) =>
      c.id === selectedClip.id ? { ...c, keyframes: updatedChannels } : c
    );
    onUpdateProject({ clips: updatedClips });
  };

  // Jump to next or previous keyframe
  const jumpKeyframe = (direction: -1 | 1) => {
    if (!selectedClip) return;
    const allTimes: number[] = [];
    Object.values(selectedClip.keyframes).forEach((kfArray) => {
      if (Array.isArray(kfArray)) {
        kfArray.forEach((kf) => allTimes.push(kf.time));
      }
    });

    if (allTimes.length === 0) return;
    const uniqueTimes = Array.from(new Set(allTimes)).sort((a, b) => a - b);

    let accumulatedTime = 0;
    for (const c of project.clips) {
      if (c.id === selectedClip.id) break;
      accumulatedTime += c.outPoint - c.inPoint;
    }
    const currentLocal = project.currentTime - accumulatedTime;

    if (direction === 1) {
      const next = uniqueTimes.find((t) => t > currentLocal + 0.05);
      if (next !== undefined) {
        onUpdateProject({ currentTime: Math.min(project.duration, accumulatedTime + next) });
      }
    } else {
      const prev = [...uniqueTimes].reverse().find((t) => t < currentLocal - 0.05);
      if (prev !== undefined) {
        onUpdateProject({ currentTime: Math.max(0, accumulatedTime + prev) });
      }
    }
  };

  // Collect keyframe points of selected clip for display
  const keyframeMarkers = React.useMemo(() => {
    if (!selectedClip) return [];
    let accumulatedTime = 0;
    for (const c of project.clips) {
      if (c.id === selectedClip.id) break;
      accumulatedTime += c.outPoint - c.inPoint;
    }

    const markers: { id: string; globalTime: number; channel: string }[] = [];
    Object.entries(selectedClip.keyframes).forEach(([channel, points]) => {
      if (Array.isArray(points)) {
        points.forEach((pt) => {
          markers.push({
            id: pt.id,
            globalTime: accumulatedTime + pt.time,
            channel,
          });
        });
      }
    });
    return markers;
  }, [selectedClip, project.clips]);

  // Generate tick marks for time ruler
  const rulerTicks = [];
  const tickInterval = zoomScale > 1.4 ? 0.5 : 1.0;
  for (let t = 0; t <= project.duration + 2; t += tickInterval) {
    const isMajor = t % 1 === 0;
    rulerTicks.push({ time: t, isMajor, left: t * pixelsPerSecond });
  }

  return (
    <div className="h-72 bg-[#0a0d14] border-t border-zinc-800 flex flex-col select-none z-20">
      {/* Timeline Controls Toolbar */}
      <div className="h-10 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-[#0e111a]">
        {/* Playback & Frame Steps */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => stepFrame(-1)}
            title="Step 1 Frame Back"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={project.isPlaying ? 'Pause' : 'Play'}
            className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            {project.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => stepFrame(1)}
            title="Step 1 Frame Forward"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Split & Delete Clip Actions */}
          <button
            type="button"
            onClick={onSplitClip}
            title="Potong Klip di Playhead (Split)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/90 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Split Klip</span>
          </button>
          <button
            type="button"
            onClick={onDeleteSelectedClip}
            title="Hapus Klip Terpilih"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Beat-Sync Toggle */}
          <button
            type="button"
            onClick={() => onUpdateProject({ beatSyncEnabled: !project.beatSyncEnabled })}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              project.beatSyncEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Sinkronisasi Ketukan Irama Musik (Beat Sync 120 BPM)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Beat-Sync</span>
            <span className={`text-[9px] px-1 rounded ${project.beatSyncEnabled ? 'bg-amber-500 text-black font-extrabold' : 'bg-zinc-800 text-zinc-500'}`}>
              {project.beatSyncEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Keyframe Management Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-0.5">
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <Diamond className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span>Keyframe</span>
            </span>
            <button
              type="button"
              onClick={() => jumpKeyframe(-1)}
              title="Ke Keyframe Sebelumnya"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleAddKeyframeAtPlayhead}
              title="Tambah Keyframe di Posisi Saat Ini"
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Keyframe</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteKeyframeAtPlayhead}
              title="Hapus Keyframe di Playhead"
              className="px-1.5 py-0.5 rounded text-[10px] text-rose-400 hover:bg-rose-500/10"
            >
              - Del
            </button>
            <button
              type="button"
              onClick={() => jumpKeyframe(1)}
              title="Ke Keyframe Selanjutnya"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Timeline Zoom */}
          <div className="flex items-center gap-1 text-zinc-400">
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.25))}
              title="Zoom Out Timeline"
              className="p-1 rounded hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono">{zoomScale.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.25))}
              title="Zoom In Timeline"
              className="p-1 rounded hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Track Canvas & Scrubber */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative flex">
        {/* Track Headers Column (Left fixed) */}
        <div className="w-36 flex-shrink-0 bg-[#0d1017] border-r border-zinc-800 text-[11px] font-medium text-zinc-400 z-10 flex flex-col">
          {/* Ruler spacer */}
          <div className="h-6 border-b border-zinc-800/80 px-2 flex items-center text-[10px] text-zinc-500 font-mono">
            TRACKS
          </div>
          {/* Video track header */}
          <div className="h-16 border-b border-zinc-800/70 px-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>V1 Media</span>
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {project.clips.length} Klip
            </span>
          </div>
          {/* 3D Tracking track header */}
          <div className="h-12 border-b border-zinc-800/70 px-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Crosshair className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>3D Track</span>
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/40">
              {project.trackedElements.length} 3D FX
            </span>
          </div>
          {/* Audio track header */}
          <div className="h-14 border-b border-zinc-800/70 px-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>A1 Audio</span>
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              {project.audioTracks.length} Audio
            </span>
          </div>
          {/* Keyframe track header */}
          <div className="flex-1 px-2.5 py-1.5 flex items-center text-cyan-400/90 gap-1.5 text-[10px] font-semibold">
            <Diamond className="w-3 h-3 fill-cyan-400" />
            <span>Keyframes</span>
          </div>
        </div>

        {/* Scrollable Timeline Area */}
        <div
          ref={timelineTrackRef}
          onClick={handleTimelineClick}
          style={{ width: `${totalTimelineWidth}px` }}
          className="relative flex-1 bg-[#090b11] cursor-pointer"
        >
          {/* Time Ruler */}
          <div className="h-6 border-b border-zinc-800/80 relative bg-zinc-950/60">
            {rulerTicks.map((tick) => (
              <div
                key={tick.time}
                style={{ left: `${tick.left}px` }}
                className="absolute top-0 bottom-0 flex flex-col items-start pointer-events-none"
              >
                <div
                  className={`w-px ${
                    tick.isMajor ? 'h-3 bg-zinc-600' : 'h-1.5 bg-zinc-800'
                  }`}
                />
                {tick.isMajor && (
                  <span className="text-[9px] font-mono text-zinc-500 pl-1 -mt-0.5">
                    {tick.time}s
                  </span>
                )}
              </div>
            ))}

            {/* Gold Beat-Sync Markers along Ruler */}
            {project.beatSyncEnabled &&
              [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0].map((bt) => (
                <div
                  key={bt}
                  style={{ left: `${bt * pixelsPerSecond}px` }}
                  className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400 -translate-x-1/2 pointer-events-none"
                  title="Beat Marker (120 BPM)"
                />
              ))}
          </div>

          {/* Track 1: Video / Photo Clips Lane */}
          <div className="h-16 border-b border-zinc-800/70 relative p-1 flex items-center">
            {project.clips.map((clip, idx) => {
              // Compute clip position
              let startOffset = 0;
              for (let i = 0; i < idx; i++) {
                startOffset += project.clips[i].outPoint - project.clips[i].inPoint;
              }
              const duration = clip.outPoint - clip.inPoint;
              const clipWidth = Math.max(50, duration * pixelsPerSecond);
              const isSelected = selectedClip?.id === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateProject({ selectedClipId: clip.id });
                  }}
                  style={{
                    left: `${startOffset * pixelsPerSecond}px`,
                    width: `${clipWidth}px`,
                  }}
                  className={`absolute h-14 rounded-lg overflow-hidden flex items-center px-2 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20'
                      : 'border-zinc-700 bg-zinc-900/80 hover:border-zinc-500'
                  }`}
                >
                  {/* Thumbnail snippet */}
                  {clip.thumbnailUrl && (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.name}
                      className="w-12 h-10 object-cover rounded mr-2 opacity-80 flex-shrink-0"
                    />
                  )}
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{clip.name}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                      <span>{clip.type === 'video' ? 'Video MP4' : 'Photo JPG'}</span>
                      <span>•</span>
                      <span>{duration.toFixed(1)}s</span>
                      {clip.speedRampEnabled && (
                        <span className="px-1 rounded bg-amber-500/30 text-amber-300 font-mono text-[9px] font-bold">
                          RAMP
                        </span>
                      )}
                      {clip.colorGrade.preset !== 'normal' && (
                        <span className="px-1 rounded bg-purple-500/30 text-purple-300 font-mono text-[9px]">
                          {clip.colorGrade.preset}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Transition indicator pill between clips */}
                  {clip.transitionOut.type !== 'none' && (
                    <div
                      title={`Transisi: ${clip.transitionOut.type}`}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-fuchsia-500 text-black font-extrabold text-[8px] uppercase tracking-tighter"
                    >
                      {clip.transitionOut.type.slice(0, 4)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Track 2: 3D Tracking Lane */}
          <div className="h-12 border-b border-zinc-800/70 relative p-1 flex items-center">
            <div
              style={{
                left: '0px',
                width: `${Math.max(200, project.duration * pixelsPerSecond)}px`,
              }}
              className="absolute h-9 rounded-lg px-3 flex items-center justify-between text-xs border border-fuchsia-800/50 bg-fuchsia-950/30 text-fuchsia-200"
            >
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-fuchsia-400 animate-spin" />
                <span className="font-semibold text-white text-xs">3D Camera Matchmove Trajectory</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-900/60 text-fuchsia-300 border border-fuchsia-700/50">
                  {project.trackingPoints.length} Points (Solved)
                </span>
              </div>

              {/* 3D Elements badges */}
              <div className="flex items-center gap-1.5">
                {project.trackedElements.map((elem) => (
                  <button
                    key={elem.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateProject({ selected3DElementId: elem.id, activeTab: 'effects' });
                    }}
                    style={{
                      borderColor: project.selected3DElementId === elem.id ? elem.color : 'transparent',
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors flex items-center gap-1 ${
                      project.selected3DElementId === elem.id
                        ? 'bg-fuchsia-900/80 text-white shadow-md'
                        : 'bg-black/40 text-fuchsia-300 hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: elem.color }} />
                    <span className="truncate max-w-[90px]">{elem.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Track 3: Audio Tracks Lane */}
          <div className="h-14 border-b border-zinc-800/70 relative p-1 flex items-center">
            {project.audioTracks.map((audio) => {
              const audioWidth = Math.max(80, audio.duration * pixelsPerSecond);
              return (
                <div
                  key={audio.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateProject({ selectedAudioTrackId: audio.id, activeTab: 'audio' });
                  }}
                  style={{
                    left: `${audio.startTime * pixelsPerSecond}px`,
                    width: `${audioWidth}px`,
                  }}
                  className={`absolute h-10 rounded-md px-2.5 flex items-center justify-between text-xs cursor-pointer border ${
                    project.selectedAudioTrackId === audio.id
                      ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200'
                      : 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300 hover:border-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {audio.muted ? (
                      <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="text-[11px] font-medium truncate">{audio.name}</span>
                  </div>
                  {/* Mini waveform bars */}
                  <div className="flex items-center gap-0.5 h-4 opacity-75">
                    {[0.3, 0.7, 0.9, 0.5, 0.8, 0.4, 0.95, 0.6, 0.3, 0.75, 0.85].map((h, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${h * 100}%` }}
                        className="w-[2px] bg-emerald-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyframe Sub-track (Diamond points) */}
          <div className="h-8 relative flex items-center bg-[#07090f]/70">
            {keyframeMarkers.map((marker) => (
              <div
                key={marker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateProject({ currentTime: marker.globalTime });
                }}
                style={{ left: `${marker.globalTime * pixelsPerSecond}px` }}
                title={`Keyframe at ${marker.globalTime.toFixed(2)}s (${marker.channel})`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-cyan-400 border border-white shadow-md shadow-cyan-500/50 hover:scale-125 transition-transform cursor-pointer"
              />
            ))}
          </div>

          {/* Red Draggable Playhead Scrubber */}
          <div
            style={{ left: `${project.currentTime * pixelsPerSecond}px` }}
            className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
          >
            {/* Playhead marker handle */}
            <div className="w-4 h-4 bg-rose-500 rounded-sm -mt-0.5 rotate-45 shadow-lg shadow-rose-500/50 border border-white" />
            <div className="w-[2px] flex-1 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
