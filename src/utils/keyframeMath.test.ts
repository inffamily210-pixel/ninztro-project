import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEasing,
  interpolateKeyframes,
  evaluateTransformAtTime,
  upsertKeyframe,
  removeKeyframeAtTime,
} from './keyframeMath.ts';
import { KeyframePoint, KeyframeChannels } from '../types/editor.ts';

test('evaluateEasing computes linear and ease curves correctly', () => {
  assert.equal(evaluateEasing(0, 'linear'), 0);
  assert.equal(evaluateEasing(1, 'linear'), 1);
  assert.equal(evaluateEasing(0.5, 'linear'), 0.5);

  // Ease-in accelerates
  const easeInHalf = evaluateEasing(0.5, 'ease-in');
  assert.equal(easeInHalf, 0.25);

  // Ease-out decelerates
  const easeOutHalf = evaluateEasing(0.5, 'ease-out');
  assert.equal(easeOutHalf, 0.75);

  // Clamps bounds
  assert.equal(evaluateEasing(-0.5, 'linear'), 0);
  assert.equal(evaluateEasing(1.5, 'linear'), 1);
});

test('interpolateKeyframes returns proper value before, between, and after points', () => {
  const points: KeyframePoint[] = [
    { id: '1', time: 1.0, value: 0, easing: 'linear' },
    { id: '2', time: 3.0, value: 100, easing: 'linear' },
  ];

  // Before first point
  assert.equal(interpolateKeyframes(points, 0.5, -99), 0);

  // Exactly at points
  assert.equal(interpolateKeyframes(points, 1.0, -99), 0);
  assert.equal(interpolateKeyframes(points, 3.0, -99), 100);

  // Interpolated midway
  assert.equal(interpolateKeyframes(points, 2.0, -99), 50);

  // After last point
  assert.equal(interpolateKeyframes(points, 4.0, -99), 100);

  // Empty points fallback
  assert.equal(interpolateKeyframes([], 2.0, 42), 42);
});

test('upsertKeyframe inserts or updates existing point within tolerance', () => {
  const initial: KeyframePoint[] = [
    { id: '1', time: 1.0, value: 10, easing: 'linear' },
  ];

  // Update existing at 1.02 (within tolerance 0.04)
  const updated = upsertKeyframe(initial, 1.02, 25, 'ease-out');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].value, 25);
  assert.equal(updated[0].easing, 'ease-out');

  // Insert new point at 2.5
  const added = upsertKeyframe(updated, 2.5, 80, 'ease-in-out');
  assert.equal(added.length, 2);
  assert.equal(added[1].value, 80);
});

test('evaluateTransformAtTime evaluates all channels correctly', () => {
  const channels: KeyframeChannels = {
    posX: [{ id: '1', time: 0, value: 0, easing: 'linear' }, { id: '2', time: 2, value: 100, easing: 'linear' }],
    posY: [{ id: '3', time: 0, value: 50, easing: 'linear' }],
    scale: [{ id: '4', time: 0, value: 1, easing: 'linear' }, { id: '5', time: 2, value: 2, easing: 'linear' }],
    rotation: [],
    opacity: [{ id: '6', time: 0, value: 0.5, easing: 'linear' }],
    brightness: [],
    blur: [],
  };

  const transform = evaluateTransformAtTime(channels, 1.0);
  assert.equal(transform.x, 50);
  assert.equal(transform.y, 50);
  assert.equal(transform.scale, 1.5);
  assert.equal(transform.opacity, 0.5);
  assert.equal(transform.rotation, 0); // default
  assert.equal(transform.brightness, 100); // default
});
