import { TrackingPoint3D, Tracked3DElement } from '../types/editor.ts';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Camera3D {
  position: Vector3D;
  rotation: { pitch: number; yaw: number; roll: number };
  focalLength: number; // e.g. 500 px
}

/**
 * Projects a 3D point in world space into 2D screen coordinates with perspective
 */
export function project3DToScreen(
  point: Vector3D,
  camera: Camera3D,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number; scale: number; visible: boolean } {
  // Relative to camera position
  const dx = point.x - camera.position.x;
  const dy = point.y - camera.position.y;
  const dz = point.z - camera.position.z;

  // Apply simple pitch/yaw rotations
  const radPitch = (camera.rotation.pitch * Math.PI) / 180;
  const radYaw = (camera.rotation.yaw * Math.PI) / 180;

  // Yaw rotation around Y axis
  const x1 = dx * Math.cos(radYaw) + dz * Math.sin(radYaw);
  const z1 = -dx * Math.sin(radYaw) + dz * Math.cos(radYaw);

  // Pitch rotation around X axis
  const y2 = dy * Math.cos(radPitch) - z1 * Math.sin(radPitch);
  const z2 = dy * Math.sin(radPitch) + z1 * Math.cos(radPitch);

  if (z2 <= 1) {
    return { x: viewportWidth / 2, y: viewportHeight / 2, scale: 0, visible: false };
  }

  const f = camera.focalLength;
  const scale = f / z2;
  const screenX = viewportWidth / 2 + x1 * scale;
  const screenY = viewportHeight / 2 + y2 * scale;

  return {
    x: screenX,
    y: screenY,
    scale,
    visible: screenX >= -50 && screenX <= viewportWidth + 50 && screenY >= -50 && screenY <= viewportHeight + 50,
  };
}

/**
 * Interpolates tracking point along the timeline
 */
export function interpolateTrackingAtTime(
  points: TrackingPoint3D[],
  time: number
): TrackingPoint3D | null {
  if (!points || points.length === 0) return null;

  const sorted = [...points].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0];
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    const pA = sorted[i];
    const pB = sorted[i + 1];
    if (time >= pA.time && time <= pB.time) {
      const dt = pB.time - pA.time;
      if (dt <= 0.0001) return pB;
      const t = (time - pA.time) / dt;

      return {
        id: pA.id,
        time,
        screenX: pA.screenX + (pB.screenX - pA.screenX) * t,
        screenY: pA.screenY + (pB.screenY - pA.screenY) * t,
        depthZ: pA.depthZ + (pB.depthZ - pA.depthZ) * t,
        pitch: pA.pitch + (pB.pitch - pA.pitch) * t,
        yaw: pA.yaw + (pB.yaw - pA.yaw) * t,
        roll: pA.roll + (pB.roll - pA.roll) * t,
        confidence: Math.min(pA.confidence, pB.confidence),
      };
    }
  }

  return sorted[0];
}

/**
 * Generates an automatic 3D camera tracking trajectory from an initial feature anchor
 * Simulates real optical flow tracking over a clip duration
 */
export function generate3DTrackingTrajectory(
  anchorX: number, // 0..1
  anchorY: number, // 0..1
  duration: number,
  fps = 10,
  motionType: 'smoothParallax' | 'handheldDrift' | 'dollyZoom' = 'smoothParallax'
): TrackingPoint3D[] {
  const points: TrackingPoint3D[] = [];
  const totalFrames = Math.max(5, Math.round(duration * fps));

  for (let i = 0; i <= totalFrames; i++) {
    const time = (i / totalFrames) * duration;
    const progress = i / totalFrames;

    let dx = 0;
    let dy = 0;
    let depth = 1.0;
    let pitch = 0;
    let yaw = 0;
    let roll = 0;

    if (motionType === 'smoothParallax') {
      // Smooth cinematic camera pan with depth parallax
      dx = Math.sin(progress * Math.PI * 1.5) * 0.08;
      dy = Math.cos(progress * Math.PI) * 0.03 - 0.03;
      depth = 1.0 + Math.sin(progress * Math.PI) * 0.4;
      pitch = Math.sin(progress * 2) * 8;
      yaw = Math.cos(progress * 2.5) * 12;
      roll = Math.sin(progress * 1.5) * 3;
    } else if (motionType === 'handheldDrift') {
      // Natural organic handheld jitter
      dx = Math.sin(progress * 5) * 0.04 + Math.sin(progress * 13) * 0.015;
      dy = Math.cos(progress * 4) * 0.03 + Math.cos(progress * 11) * 0.01;
      depth = 1.0 + Math.sin(progress * 3) * 0.2;
      pitch = Math.sin(progress * 6) * 6;
      yaw = Math.cos(progress * 7) * 8;
      roll = Math.sin(progress * 5) * 4;
    } else {
      // Dolly push-in
      dx = (progress - 0.5) * 0.05;
      dy = (progress - 0.5) * 0.02;
      depth = 0.7 + progress * 0.9;
      pitch = progress * 5;
      yaw = -progress * 6;
      roll = 0;
    }

    const screenX = Math.max(0.05, Math.min(0.95, anchorX + dx));
    const screenY = Math.max(0.05, Math.min(0.95, anchorY + dy));

    points.push({
      id: `trk-pt-${i}`,
      time,
      screenX,
      screenY,
      depthZ: depth,
      pitch,
      yaw,
      roll,
      confidence: 0.95 - Math.random() * 0.05,
    });
  }

  return points;
}

/**
 * Computes 3D CSS transform matrix for an attached 3D element
 */
export function compute3DElementTransform(
  element: Tracked3DElement,
  trackingPoint: TrackingPoint3D,
  canvasWidth: number,
  canvasHeight: number
): {
  style: React.CSSProperties;
  pixelX: number;
  pixelY: number;
  depthScale: number;
} {
  const pixelX = trackingPoint.screenX * canvasWidth + element.offsetX;
  const pixelY = trackingPoint.screenY * canvasHeight + element.offsetY;
  // Depth scaling: objects further away (higher depthZ) are smaller
  const depthScale = Math.max(0.3, Math.min(2.5, (1.2 / trackingPoint.depthZ) * element.size));

  const transform = [
    `translate(-50%, -50%)`,
    `translate3d(${pixelX}px, ${pixelY}px, ${element.offsetZ}px)`,
    `scale(${depthScale.toFixed(3)})`,
    `rotateX(${trackingPoint.pitch.toFixed(1)}deg)`,
    `rotateY(${trackingPoint.yaw.toFixed(1)}deg)`,
    `rotateZ(${trackingPoint.roll.toFixed(1)}deg)`,
  ].join(' ');

  return {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      transform,
      transformStyle: 'preserve-3d',
      opacity: element.opacity,
      pointerEvents: 'none',
      color: element.color,
      filter: element.glow ? `drop-shadow(0 0 10px ${element.color})` : undefined,
    },
    pixelX,
    pixelY,
    depthScale,
  };
}
