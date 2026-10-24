import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  subtitle,
  children,
}) => {
  // Prevent background body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end pointer-events-none transition-all duration-300">
      {/* Click outside backdrop in upper canvas to close drawer */}
      <div className="flex-1 w-full pointer-events-auto" onClick={onClose} />

      {/* Drawer content */}
      <div
        className="w-full bg-[#0f121b]/95 backdrop-blur-md border-t border-zinc-700/80 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.85)] flex flex-col max-h-[60vh] h-[56vh] animate-in slide-in-from-bottom duration-250 select-none pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Pill Handle */}
        <div className="w-full flex justify-center pt-2 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-cyan-400">{icon}</span>}
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">{title}</h3>
              {subtitle && <p className="text-[10px] text-zinc-400">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSynthSound('laser');
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Selesai</span>
          </button>
        </div>

        {/* Drawer Body Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
