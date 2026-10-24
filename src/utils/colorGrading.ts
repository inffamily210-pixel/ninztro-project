import { ColorGradeSettings, FilterPresetId } from '../types/editor.ts';

export const DEFAULT_COLOR_GRADE: ColorGradeSettings = {
  preset: 'normal',
  filterIntensity: 100,
  exposure: 0,
  contrast: 0,
  brightness: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
  grain: 0,
  bloom: 0,
  liftColor: '#000000',
  gammaColor: '#808080',
  gainColor: '#ffffff',
};

export interface FilterPresetInfo {
  id: FilterPresetId;
  name: string;
  category: 'Cinematic' | 'AI Creative' | 'Vintage' | 'Atmospheric';
  description: string;
  badge: string;
  defaultSettings: Partial<ColorGradeSettings>;
}

export const FILTER_PRESETS: FilterPresetInfo[] = [
  {
    id: 'normal',
    name: 'Natural Standard',
    category: 'Cinematic',
    description: 'Clean, neutral baseline with natural colors and balanced exposure',
    badge: 'RAW',
    defaultSettings: {
      exposure: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      vignette: 0,
      bloom: 0,
    },
  },
  {
    id: 'cyberpunk',
    name: 'AI Cyberpunk 2077',
    category: 'AI Creative',
    description: 'Electric neon cyan & magenta split-tone, crushed blacks, high dynamic pop',
    badge: 'AI NEON',
    defaultSettings: {
      exposure: 5,
      contrast: 35,
      saturation: 45,
      temperature: -20,
      tint: 40,
      highlights: 25,
      shadows: -30,
      bloom: 40,
      vignette: 25,
      liftColor: '#0b001a',
      gainColor: '#00ffff',
    },
  },
  {
    id: 'tealOrange',
    name: 'Hollywood Teal & Orange',
    category: 'Cinematic',
    description: 'Blockbuster cinema standard: cool cyan shadows paired with warm radiant skin highlights',
    badge: '35MM LUT',
    defaultSettings: {
      exposure: 0,
      contrast: 25,
      saturation: 20,
      temperature: 15,
      tint: -15,
      highlights: 20,
      shadows: -20,
      vignette: 30,
      liftColor: '#021824',
      gainColor: '#ff9d42',
    },
  },
  {
    id: 'kodak35mm',
    name: 'Kodak Portra 400',
    category: 'Vintage',
    description: 'Warm analog film grain, creamy rolled-off highlights, subtle matte blacks',
    badge: 'ANALOG',
    defaultSettings: {
      exposure: 8,
      contrast: -10,
      saturation: -10,
      temperature: 25,
      tint: 10,
      highlights: -15,
      shadows: 20,
      grain: 35,
      vignette: 20,
      liftColor: '#120f0d',
      gainColor: '#fff5ea',
    },
  },
  {
    id: 'animeShinkai',
    name: 'Anime Shinkai Sky',
    category: 'AI Creative',
    description: 'Luminous anime aesthetics, saturated azure skies, vibrant lush pastels & dreamy bloom',
    badge: 'AI ANIME',
    defaultSettings: {
      exposure: 15,
      contrast: 10,
      saturation: 50,
      temperature: -10,
      tint: 5,
      highlights: 30,
      shadows: 15,
      bloom: 45,
      vignette: 0,
      gainColor: '#e0f2fe',
    },
  },
  {
    id: 'neonNoir',
    name: 'Neon Noir Tokyo',
    category: 'Atmospheric',
    description: 'Dark moody street photography, near-monochrome shadows pierced by glowing neon highlights',
    badge: 'NOIR',
    defaultSettings: {
      exposure: -15,
      contrast: 45,
      saturation: -15,
      temperature: -35,
      tint: 30,
      highlights: 40,
      shadows: -50,
      bloom: 50,
      vignette: 55,
      liftColor: '#000000',
      gainColor: '#f43f5e',
    },
  },
  {
    id: 'aerochrome',
    name: 'Infrared Aerochrome',
    category: 'AI Creative',
    description: 'Surreal false-color infrared film: foliage turns vivid crimson and magenta',
    badge: 'AI INFRARED',
    defaultSettings: {
      exposure: 5,
      contrast: 25,
      saturation: 40,
      temperature: 30,
      tint: 60,
      highlights: 15,
      shadows: -10,
      bloom: 20,
      vignette: 20,
    },
  },
  {
    id: 'bwSilver',
    name: 'Ilford Silver Gelatin',
    category: 'Vintage',
    description: 'Timeless high-contrast black & white with rich silver highlight preservation and organic grain',
    badge: 'B&W PRO',
    defaultSettings: {
      exposure: 0,
      contrast: 35,
      saturation: -100,
      temperature: 0,
      tint: 0,
      highlights: 20,
      shadows: -25,
      grain: 45,
      vignette: 35,
    },
  },
  {
    id: 'dramaticDark',
    name: 'Chiaroscuro Dark Aura',
    category: 'Atmospheric',
    description: 'Deep shadows, mysterious low-key studio lighting with concentrated high-contrast drama',
    badge: 'DARK MOOD',
    defaultSettings: {
      exposure: -30,
      contrast: 50,
      saturation: -20,
      temperature: -15,
      tint: -10,
      highlights: 35,
      shadows: -60,
      vignette: 75,
      bloom: 15,
    },
  },
  {
    id: 'goldenHour',
    name: 'Sunset Golden Hour',
    category: 'Atmospheric',
    description: 'Rich amber sunlight, soft warm glow, gentle shadow lift for cinematic golden hour shots',
    badge: 'SUNSET',
    defaultSettings: {
      exposure: 10,
      contrast: 15,
      saturation: 30,
      temperature: 45,
      tint: 15,
      highlights: 10,
      shadows: 15,
      bloom: 35,
      vignette: 25,
      gainColor: '#fed7aa',
    },
  },
];

/**
 * Builds CSS filter string from color grade settings
 */
export function buildCssFilterString(settings: ColorGradeSettings): string {
  const intensity = (settings.filterIntensity ?? 100) / 100;

  // Exposure converted to brightness ratio: 100% is 1.0, +/- 100 shifts
  const exposureRatio = Math.pow(2, (settings.exposure * intensity) / 50);
  const brightnessVal = Math.max(0, (1 + (settings.brightness * intensity) / 100) * exposureRatio);
  const contrastVal = Math.max(0, 1 + (settings.contrast * intensity) / 100);
  const saturationVal = Math.max(0, 1 + (settings.saturation * intensity) / 100);

  // Temperature / Tint mapped to sepia and hue-rotate
  const temp = (settings.temperature * intensity) / 100;
  const tint = (settings.tint * intensity) / 100;

  const filters: string[] = [];

  filters.push(`brightness(${brightnessVal.toFixed(3)})`);
  filters.push(`contrast(${contrastVal.toFixed(3)})`);
  filters.push(`saturate(${saturationVal.toFixed(3)})`);

  if (temp > 0) {
    // Warm: slight sepia
    filters.push(`sepia(${(temp * 0.35).toFixed(3)})`);
  } else if (temp < 0) {
    // Cool: hue rotate towards blue
    filters.push(`hue-rotate(${(temp * 25).toFixed(1)}deg)`);
  }

  if (Math.abs(tint) > 0.05) {
    filters.push(`hue-rotate(${(tint * 30).toFixed(1)}deg)`);
  }

  return filters.join(' ');
}

/**
 * Applies vignette and lighting effects directly onto a canvas 2D rendering context
 */
export function applyCanvasLightingOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ColorGradeSettings
): void {
  const vignette = settings.vignette;
  if (vignette > 0) {
    const radius = Math.max(width, height) * 0.75;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * (1 - vignette / 100 * 0.6),
      width / 2,
      height / 2,
      radius
    );
    const alpha = (vignette / 100) * 0.85;
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Grain simulation overlay if active
  if (settings.grain > 0) {
    ctx.save();
    ctx.globalAlpha = (settings.grain / 100) * 0.12;
    ctx.fillStyle = '#ffffff';
    // Fast pseudo-noise specks
    const count = Math.min(2500, Math.floor((width * height * settings.grain) / 50000));
    for (let i = 0; i < count; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
    ctx.restore();
  }
}
