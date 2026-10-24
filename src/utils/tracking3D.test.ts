import test from 'node:test';
import assert from 'node:assert/strict';
import {
  project3DToScreen,
  interpolateTrackingAtTime,
  generate3DTrackingTrajectory,
  compute3DElementTransform,
} from './tracking3D.ts';
import { TrackingPoint3D, Tracked3DElement } from '../types/editor.ts';

test('project3DToScreen calculates perspective coordinates properly', () => {
  const camera = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
    focalLength: 500,
  };
  const point = { x: 0, y: 0, z: 500 };
  const res = project3DToScreen(point, camera, 1000, 500);

  assert.equal(res.visible, true);
  // Center of screen
  assert.equal(res.x, 500);
  assert.equal(res.y, 250);
  assert.equal(res.scale, 1);
});

test('interpolateTrackingAtTime computes smooth intermediate values', () => {
  const points: TrackingPoint3D[] = [
    {
      id: 'p1',
      time: 0,
      screenX: 0.2,
      screenY: 0.3,
      depthZ: 1.0,
      pitch: 0,
      yaw: 0,
      roll: 0,
      confidence: 0.9,
    },
    {
      id: 'p2',
      time: 2,
      screenX: 0.6,
      screenY: 0.7,
      depthZ: 2.0,
      pitch: 10,
      yaw: 20,
      roll: 4,
      confidence: 0.9,
    },
  ];

  const mid = interpolateTrackingAtTime(points, 1.0);
  assert.ok(mid);
  assert.ok(Math.abs(mid.screenX - 0.4) < 0.001);
  assert.ok(Math.abs(mid.screenY - 0.5) < 0.001);
  assert.ok(Math.abs(mid.depthZ - 1.5) < 0.001);
  assert.ok(Math.abs(mid.yaw - 10) < 0.001);
});

test('generate3DTrackingTrajectory yields valid trajectory points over clip duration', () => {
  const trajectory = generate3DTrackingTrajectory(0.5, 0.5, 3.0, 10);
  assert.ok(trajectory.length > 10);
  assert.equal(trajectory[0].time, 0);
  assert.ok(trajectory[trajectory.length - 1].time <= 3.01);
  for (const pt of trajectory) {
    assert.ok(pt.screenX >= 0 && pt.screenX <= 1);
    assert.ok(pt.screenY >= 0 && pt.screenY <= 1);
    assert.ok(pt.depthZ > 0);
  }
});

test('compute3DElementTransform returns CSS transforms and pixel positions', () => {
  const element: Tracked3DElement = {
    id: 'el-1',
    name: 'Cyber Title',
    type: 'text3d',
    text: 'TARGET ACQUIRED',
    color: '#00ffff',
    size: 1.0,
    offsetX: 10,
    offsetY: -20,
    offsetZ: 0,
    opacity: 0.9,
    glow: true,
    visible: true,
    trackId: 'track-1',
  };

  const trackingPoint: TrackingPoint3D = {
    id: 'pt-1',
    time: 0,
    screenX: 0.5,
    screenY: 0.5,
    depthZ: 1.0,
    pitch: 5,
    yaw: -10,
    roll: 2,
    confidence: 0.98,
  };

  const result = compute3DElementTransform(element, trackingPoint, 800, 600);
  assert.equal(result.pixelX, 410); // 0.5 * 800 + 10
  assert.equal(result.pixelY, 280); // 0.5 * 600 - 20
  assert.ok(result.style.transform);
});
