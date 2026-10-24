import { SpeedRampPoint } from '../types/editor.ts';

/**
 * Evaluates speed multiplier at normalized clip time (0..1)
 */
export function evaluateSpeedRamp(
  curve: SpeedRampPoint[] | undefined,
  timePercent: number
): number {
  if (!curve || curve.length === 0) return 1.0;

  const clampedT = Math.max(0, Math.min(1, timePercent));
  const sorted = [...curve].sort((a, b) => a.timePercent - b.timePercent);

  if (clampedT <= sorted[0].timePercent) {
    return sorted[0].speed;
  }
  if (clampedT >= sorted[sorted.length - 1].timePercent) {
    return sorted[sorted.length - 1].speed;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const pA = sorted[i];
    const pB = sorted[i + 1];
    if (clampedT >= pA.timePercent && clampedT <= pB.timePercent) {
      const segmentLen = pB.timePercent - pA.timePercent;
      if (segmentLen <= 0.0001) return pB.speed;
      const t = (clampedT - pA.timePercent) / segmentLen;
      // Smooth cubic hermite interpolation
      const smoothT = t * t * (3 - 2 * t);
      return pA.speed + (pB.speed - pA.speed) * smoothT;
    }
  }

  return 1.0;
}

/**
 * Standard Speed Ramping Presets (Bullet time, Montage Hero, Flash Cut)
 */
export const SPEED_RAMP_PRESETS: {
  id: string;
  name: string;
  badge: string;
  description: string;
  points: SpeedRampPoint[];
}[] = [
  {
    id: 'bulletTime',
    name: 'Bullet Time Matrix',
    badge: 'CINEMA',
    description: 'Fast entry (2.0x), ultra slow-motion impact (0.2x), and smooth exit (1.0x)',
    points: [
      { id: 'p1', timePercent: 0, speed: 2.0 },
      { id: 'p2', timePercent: 0.3, speed: 0.2 },
      { id: 'p3', timePercent: 0.7, speed: 0.25 },
      { id: 'p4', timePercent: 1.0, speed: 1.2 },
    ],
  },
  {
    id: 'heroDrop',
    name: 'Hero Action Drop',
    badge: 'ACTION',
    description: 'Standard speed, quick deceleration on climax, rapid snap back',
    points: [
      { id: 'p1', timePercent: 0, speed: 1.0 },
      { id: 'p2', timePercent: 0.45, speed: 0.3 },
      { id: 'p3', timePercent: 0.55, speed: 0.3 },
      { id: 'p4', timePercent: 1.0, speed: 2.5 },
    ],
  },
  {
    id: 'montageWhip',
    name: 'Montage Whip Flow',
    badge: 'TIKTOK/REELS',
    description: 'High kinetic energy whips: 3.0x -> 0.5x -> 2.8x',
    points: [
      { id: 'p1', timePercent: 0, speed: 2.8 },
      { id: 'p2', timePercent: 0.25, speed: 0.5 },
      { id: 'p3', timePercent: 0.75, speed: 0.5 },
      { id: 'p4', timePercent: 1.0, speed: 3.0 },
    ],
  },
  {
    id: 'subtleEase',
    name: 'Smooth Cinematic Ease',
    badge: 'ORGANIC',
    description: 'Gentle deceleration curve for documentary and luxury footage',
    points: [
      { id: 'p1', timePercent: 0, speed: 1.4 },
      { id: 'p2', timePercent: 0.5, speed: 0.7 },
      { id: 'p3', timePercent: 1.0, speed: 1.0 },
    ],
  },
];

/**
 * Calculates 3D camera frustum points for on-screen HUD projection
 */
export function computeCameraFrustum(
  cameraPitch: number,
  cameraYaw: number,
  focalLength: number,
  width: number,
  height: number
): { x1: number; y1: number; x2: number; y2: number }[] {
  const radP = (cameraPitch * Math.PI) / 180;
  const radY = (cameraYaw * Math.PI) / 180;

  const cx = width / 2;
  const cy = height / 2;

  // 4 corner rays
  const offsetX = Math.sin(radY) * 60;
  const offsetY = Math.sin(radP) * 40;

  return [
    { x1: cx, y1: cy, x2: 40 + offsetX, y2: 40 + offsetY },
    { x1: cx, y1: cy, x2: width - 40 + offsetX, y2: 40 + offsetY },
    { x1: cx, y1: cy, x2: width - 40 + offsetX, y2: height - 40 + offsetY },
    { x1: cx, y1: cy, x2: 40 + offsetX, y2: height - 40 + offsetY },
  ];
}
