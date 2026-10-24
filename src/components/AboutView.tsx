import React from 'react';
import {
  Film,
  Camera,
  Layers,
  Sparkles,
  Gauge,
  Music,
  Share2,
  HardDrive,
  Cpu,
  MonitorPlay,
  Play,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Crosshair,
  Diamond,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateToProjects: () => void;
  onNavigateToEditor: () => void;
  onCreateNewProject: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateToProjects,
  onNavigateToEditor,
  onCreateNewProject,
}) => {
  const capabilities = [
    {
      title: '3D Camera Matchmove Tracking',
      desc: 'Pelacakan murni lintasan gerak kamera 3D dengan optical flow, kalkulasi giroskopik sudut pitch, yaw, dan roll secara real-time, serta visualisasi bidang kerucut frustum kamera.',
      icon: <Camera className="w-5 h-5 text-zinc-300" />,
      badge: 'MATCHMOVE',
    },
    {
      title: '240+ Efek & Spatial VFX Library',
      desc: 'Katalog 246 efek sinematik siap pasang: Cyber HUD, target lock, tipografi 3D, pin telemetri, wireframe mesh, tesseract 4D, partikel kosmik, dan deflector shield.',
      icon: <Layers className="w-5 h-5 text-zinc-300" />,
      badge: '246 PRESETS',
    },
    {
      title: 'Pengaturan Keyframe Presisi',
      desc: 'Kontrol animasi frame-by-frame dengan penanda intan keyframe (◆), interpolasi channel multi-sumbu (X/Y, skala, rotasi, opasitas, blur), serta kurva easing Bezier dan Spring.',
      icon: <Diamond className="w-5 h-5 text-zinc-300" />,
      badge: 'CURVE EASING',
    },
    {
      title: 'Studio Cahaya, Gelap & Grading',
      desc: 'Penyetelan eksposur, kontras dinamis, bayangan gelap pekat, sorotan terang, vignette analog, film grain 35mm, serta pendaran Anamorphic Lens Flare dengan penempatan titik bebas.',
      icon: <Sliders className="w-5 h-5 text-zinc-300" />,
      badge: 'COLOR STUDIO',
    },
    {
      title: 'Speed Ramping & Velocity Remapping',
      desc: 'Manipulasi waktu sinematik dengan kurva kecepatan Bezier interaktif untuk efek Bullet Time, fast whip montage, dan slow-motion impact tanpa patahan.',
      icon: <Gauge className="w-5 h-5 text-zinc-300" />,
      badge: 'TIME REMAP',
    },
    {
      title: 'Audio Mixer & Beat-Sync 120 BPM',
      desc: 'Dukungan multi-track suara, waveform frekuensi interaktif, SFX transisi, pengaturan volume, fade in/out, serta sinkronisasi penanda ketukan irama otomatis.',
      icon: <Music className="w-5 h-5 text-zinc-300" />,
      badge: 'AUDIO ENGINE',
    },
  ];

  const engineSpecs = [
    { label: 'Compositor Engine', value: 'WebGL 2.0 Hardware Accelerated' },
    { label: 'Render Target', value: 'MP4 Universal (H.264), WebM, PNG 4K Master' },
    { label: 'Frame Rates', value: '24 FPS, 30 FPS, 60 FPS Cinema' },
    { label: 'Format Aspek Rasio', value: '16:9 Landscape, 9:16 Shorts/Reels, 1:1, 21:9 Scope' },
    { label: 'Collab & Sharing', value: 'Instan Cloud Project Link & File Export' },
    { label: 'Versi Engine', value: 'Ninztro Studio Edition v3.2 Pro' },
  ];

  return (
    <div className="flex-1 bg-[#0c0e14] text-zinc-200 overflow-y-auto custom-scrollbar select-none">
      {/* Top Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="border border-zinc-800 bg-[#11141d] rounded-2xl p-5 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] font-semibold tracking-wider uppercase border border-zinc-700">
                  NINZTRO STUDIO v3.2
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hardware Engine Ready</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                Aplikasi Pengolah Video, Foto & Pelacakan Kamera 3D
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Ninztro dirancang untuk para kreator, video editor, dan seniman visual yang membutuhkan
                alat penyuntingan presisi tinggi: integrasi 3D camera matchmove, pustaka 246 efek visual
                spasial, penataan nada gelap-terang sinematik, serta tautan berbagi project instan.
              </p>
            </div>

            {/* Quick Action CTA Box */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-64 flex-shrink-0">
              <button
                type="button"
                onClick={onNavigateToEditor}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <MonitorPlay className="w-4 h-4 text-zinc-900" />
                <span>Buka Studio Editor</span>
              </button>

              <button
                type="button"
                onClick={onCreateNewProject}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
              >
                <Film className="w-4 h-4 text-zinc-300" />
                <span>Buat Project Baru</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToProjects}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-zinc-400" />
                <span>Lihat Semua Project</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid Pillars */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Arsitektur & Kemampuan Inti Ninztro
            </h2>
            <p className="text-xs text-zinc-400">
              Peralatan kerja profesional yang dirancang tanpa antarmuka artifisial berlebihan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#11141d] border border-zinc-800/90 hover:border-zinc-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/80">
                    {item.icon}
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specs & Sharing Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Engine Specs */}
          <div className="p-6 rounded-2xl bg-[#11141d] border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-white text-sm">Spesifikasi Engine Pengolahan</h3>
            </div>
            <div className="space-y-2.5">
              {engineSpecs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-850 text-xs">
                  <span className="text-zinc-400">{spec.label}</span>
                  <span className="font-mono text-zinc-200 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Sharing Workflow */}
          <div className="p-6 rounded-2xl bg-[#11141d] border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-zinc-400" />
                <h3 className="font-bold text-white text-sm">Alur Kerja Berbagi Project (Share Link)</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Saat mengekspor karya di Ninztro, selain opsi unduh berkas video (MP4/WebM) dan foto
                (PNG 4K), sistem secara otomatis menghasilkan <strong>Tautan Berbagi Project</strong>.
                Tautan ini memungkinkan tim, klien, atau teman untuk langsung membuka salinan project
                dan memeriksa susunan timeline, efek 3D, serta grading secara langsung di browser tanpa
                perlu mentransfer berkas berat.
              </p>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                <span className="truncate">https://ninztro.studio/?share=ninz-tokyo-7x9q</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] uppercase ml-2 flex-shrink-0">
                  Siap Dibagikan
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Siap memulai karya Anda?</span>
              <button
                type="button"
                onClick={onNavigateToEditor}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Masuk ke Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
