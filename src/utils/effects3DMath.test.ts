import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSpeedRamp, SPEED_RAMP_PRESETS, computeCameraFrustum } from './effects3DMath.ts';
import { getEffectsCount, searchEffects } from '../data/effects3DLibrary.ts';

test('EFFECTS_3D_LIBRARY contains 240+ distinct 3D tracking & VFX presets', () => {
  const count = getEffectsCount();
  assert.ok(count >= 240, `Expected at least 240 effects, found: ${count}`);
});

test('searchEffects filters by category and keyword cleanly', () => {
  const allHuds = searchEffects('', 'cyberHud');
  assert.ok(allHuds.length >= 40);

  const typography = searchEffects('Cyber', 'typography3d');
  assert.ok(typography.length > 0);

  const particles = searchEffects('Vortex', 'particlesVfx');
  assert.ok(particles.length > 0);
});

test('evaluateSpeedRamp calculates bullet time curve correctly', () => {
  const bulletCurve = SPEED_RAMP_PRESETS[0].points;

  // Start at 2.0x
  const startSpeed = evaluateSpeedRamp(bulletCurve, 0);
  assert.equal(startSpeed, 2.0);

  // Slow-mo plateau
  const slowSpeed = evaluateSpeedRamp(bulletCurve, 0.5);
  assert.ok(slowSpeed <= 0.3);

  // Return fallback if no curve
  assert.equal(evaluateSpeedRamp(undefined, 0.5), 1.0);
});

test('computeCameraFrustum returns 4 ray vectors', () => {
  const frustum = computeCameraFrustum(10, -15, 500, 1920, 1080);
  assert.equal(frustum.length, 4);
  assert.equal(frustum[0].x1, 960);
  assert.equal(frustum[0].y1, 540);
});
