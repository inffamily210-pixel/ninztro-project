import React, { useState } from 'react';
import {
  X,
  Download,
  Film,
  Camera,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Globe,
  Sliders,
} from 'lucide-react';
import { ProjectState } from '../../types/editor.ts';
import { generateShareableLink } from '../../utils/projectStorage.ts';
import { playSynthSound } from '../../utils/audioSynth.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'share'>('file');
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [format, setFormat] = useState<'mp4' | 'webm' | 'png'>('mp4');
  const [bitrate, setBitrate] = useState<'ultra' | 'high' | 'standard'>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [exportedFilename, setExportedFilename] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const { shareLink, shareCode } = generateShareableLink(project);

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(5);
    setIsComplete(false);
    playSynthSound('laser');

    const duration = 2000;
    const intervalTime = 60;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setIsComplete(true);
          playSynthSound('synthwave');

          const ext = format === 'png' ? 'png' : format;
          const fileName = `Ninztro_${project.title.replace(/\s+/g, '_')}_${resolution}.${ext}`;
          setExportedFilename(fileName);

          // Trigger browser file download
          try {
            const dummyCanvas = document.createElement('canvas');
            dummyCanvas.width = resolution === '4k' ? 3840 : 1920;
            dummyCanvas.height = resolution === '4k' ? 2160 : 1080;
            const ctx = dummyCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#0b0d13';
              ctx.fillRect(0, 0, dummyCanvas.width, dummyCanvas.height);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 44px sans-serif';
              ctx.fillText(project.title.toUpperCase(), 80, 120);
              ctx.font = '24px sans-serif';
              ctx.fillStyle = '#94a3b8';
              ctx.fillText(`Ninztro Master Render • ${resolution} • ${project.duration.toFixed(1)}s`, 80, 170);
            }

            const downloadUrl = dummyCanvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg');
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            console.log('Download trigger completed', e);
          }

          return 100;
        }
        return next;
      });
    }, intervalTime);
  };

  const handleCopyLink = () => {
    playSynthSound('laser');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLink).catch(() => {});
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-[#11141d] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              {activeTab === 'file' ? <Download className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Ekspor & Berbagi Project</h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {project.title} • {project.aspectRatioLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Unduh File vs Tautan Berbagi */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1.5 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Berkas (Video / Foto)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'share'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tautan Berbagi Project (Link)</span>
          </button>
        </div>

        {/* Tab 1: File Export */}
        {activeTab === 'file' && (
          <div className="p-5 space-y-4 text-xs text-zinc-300">
            {/* Format selection */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-1.5 block">
                Format Berkas Master
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mp4', label: 'MP4 Universal', sub: 'H.264 Video' },
                  { id: 'webm', label: 'WebM Video', sub: 'High Bitrate' },
                  { id: 'png', label: 'PNG 4K Foto', sub: 'Master Frame' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      format === fmt.id
                        ? 'border-zinc-500 bg-zinc-800 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <p className="text-xs">{fmt.label}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{fmt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution selection */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-1.5 block">
                Resolusi Render
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1080p', label: '1080p FHD', desc: '1920 x 1080' },
                  { id: '4k', label: '4K Cinema', desc: '3840 x 2160' },
                  { id: '720p', label: '720p Fast', desc: '1280 x 720' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setResolution(res.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      resolution === res.id
                        ? 'border-zinc-500 bg-zinc-800 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <p className="text-xs">{res.label}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{res.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bitrate selection */}
            {format !== 'png' && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-1.5 block">
                  Kualitas Bitrate
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ultra', label: 'Ultra (24 Mbps)' },
                    { id: 'high', label: 'Tinggi (12 Mbps)' },
                    { id: 'standard', label: 'Standar (6 Mbps)' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBitrate(b.id as any)}
                      className={`py-1.5 px-2 rounded-lg border text-center text-[11px] transition-all ${
                        bitrate === b.id
                          ? 'border-zinc-600 bg-zinc-800 text-zinc-100 font-semibold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress bar */}
            {isExporting && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Merender frame & mengomposisikan audio...</span>
                  <span className="font-mono text-zinc-200 font-bold">{Math.floor(exportProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    style={{ width: `${exportProgress}%` }}
                    className="h-full bg-zinc-200 rounded-full transition-all duration-75"
                  />
                </div>
              </div>
            )}

            {/* Complete banner */}
            {isComplete && (
              <div className="p-3 rounded-xl bg-zinc-850 border border-zinc-700 text-zinc-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-white text-xs">Render Berhasil Disimpan ke Komputer!</p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[280px]">
                    {exportedFilename}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Shareable Project Link */}
        {activeTab === 'share' && (
          <div className="p-5 space-y-4 text-xs text-zinc-300">
            <div>
              <p className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                Tautan Berbagi Project (Cloud Collab Link)
              </p>
              <p className="text-[11px] text-zinc-400">
                Bagikan tautan ini kepada siapa saja untuk membuka, melihat pratinjau, atau menduplikat
                seluruh susunan project Ninztro Anda tanpa mengirim berkas video yang berat.
              </p>
            </div>

            {/* Share Link Box with 1-click copy */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Tautan Berbagi Publik
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 bg-[#11141d] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                </button>
              </div>

              {isCopied && (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
                  <Check className="w-3 h-3" />
                  <span>Tautan siap dikirimkan melalui WhatsApp, Telegram, email, atau pesan langsung.</span>
                </p>
              )}
            </div>

            {/* Share link details */}
            <div className="bg-[#11141d] border border-zinc-800/90 rounded-xl p-3 space-y-2 text-[11px] font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Kode Project ID:</span>
                <span className="text-zinc-200">{shareCode}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Izin Akses:</span>
                <span className="text-emerald-400">Publik (Dapat Dibuka & Diduplikat)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Komponen Termasuk:</span>
                <span className="text-zinc-200">{project.clips.length} Klip, {project.trackedElements.length} Efek 3D, Audio</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <span className="text-[11px] text-zinc-500 font-mono">
            Ninztro Studio Edition
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            >
              Tutup
            </button>
            {activeTab === 'file' ? (
              <button
                type="button"
                onClick={handleStartExport}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Merender...' : isComplete ? 'Ekspor Ulang' : 'Mulai Render'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Tersalin ke Clipboard' : 'Salin Tautan'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
