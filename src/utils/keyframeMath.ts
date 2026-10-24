import { EasingType, KeyframePoint, KeyframeChannels } from '../types/editor.ts';

/**
 * Standard easing interpolation functions
 */
export function evaluateEasing(t: number, easing: EasingType): number {
  const clampedT = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'linear':
      return clampedT;
    case 'ease-in':
      return clampedT * clampedT;
    case 'ease-out':
      return clampedT * (2 - clampedT);
    case 'ease-in-out':
      return clampedT < 0.5
        ? 2 * clampedT * clampedT
        : -1 + (4 - 2 * clampedT) * clampedT;
    case 'bezier':
      // Smooth cubic ease
      return clampedT * clampedT * (3 - 2 * clampedT);
    case 'spring': {
      // Gentle spring overshoot
      const s = 1.70158;
      const p = clampedT - 1;
      return p * p * ((s + 1) * p + s) + 1;
    }
    default:
      return clampedT;
  }
}

/**
 * Evaluates the value of a keyframed property at time `time`
 */
export function interpolateKeyframes(
  points: KeyframePoint[],
  time: number,
  defaultValue: number
): number {
  if (!points || points.length === 0) return defaultValue;

  // Sort points by time
  const sorted = [...points].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (time <= sorted[0].time) {
    return sorted[0].value;
  }

  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  // Find surrounding keyframe points
  for (let i = 0; i < sorted.length - 1; i++) {
    const kfA = sorted[i];
    const kfB = sorted[i + 1];

    if (time >= kfA.time && time <= kfB.time) {
      const duration = kfB.time - kfA.time;
      if (duration <= 0.0001) return kfB.value;
      const progress = (time - kfA.time) / duration;
      const easedProgress = evaluateEasing(progress, kfA.easing);
      return kfA.value + (kfB.value - kfA.value) * easedProgress;
    }
  }

  return defaultValue;
}

/**
 * Evaluates all transform channels for a clip at a given clip-relative time
 */
export interface EvaluatedTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  brightness: number;
  blur: number;
  depth3D: number;
}

export function evaluateTransformAtTime(
  channels: KeyframeChannels,
  clipTime: number
): EvaluatedTransform {
  return {
    x: interpolateKeyframes(channels.posX, clipTime, 0),
    y: interpolateKeyframes(channels.posY, clipTime, 0),
    scale: interpolateKeyframes(channels.scale, clipTime, 1),
    rotation: interpolateKeyframes(channels.rotation, clipTime, 0),
    opacity: interpolateKeyframes(channels.opacity, clipTime, 1),
    brightness: interpolateKeyframes(channels.brightness, clipTime, 100),
    blur: interpolateKeyframes(channels.blur, clipTime, 0),
    depth3D: channels.depth3D
      ? interpolateKeyframes(channels.depth3D, clipTime, 1)
      : 1,
  };
}

/**
 * Adds or updates a keyframe at time `time` with value and easing
 */
export function upsertKeyframe(
  points: KeyframePoint[],
  time: number,
  value: number,
  easing: EasingType = 'ease-in-out',
  tolerance = 0.04
): KeyframePoint[] {
  const existingIndex = points.findIndex(
    (p) => Math.abs(p.time - time) <= tolerance
  );
  if (existingIndex >= 0) {
    const updated = [...points];
    updated[existingIndex] = {
      ...updated[existingIndex],
      time,
      value,
      easing,
    };
    return updated.sort((a, b) => a.time - b.time);
  }

  const newPoint: KeyframePoint = {
    id: `kf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time,
    value,
    easing,
  };

  return [...points, newPoint].sort((a, b) => a.time - b.time);
}

/**
 * Removes a keyframe close to the given time
 */
export function removeKeyframeAtTime(
  points: KeyframePoint[],
  time: number,
  tolerance = 0.05
): KeyframePoint[] {
  return points.filter((p) => Math.abs(p.time - time) > tolerance);
}
