import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewProjectState, generateShareableLink } from './projectStorage.ts';

test('createNewProjectState generates valid fresh project', () => {
  const proj = createNewProjectState('My Indie Short');
  assert.equal(proj.title, 'My Indie Short');
  assert.ok(proj.clips.length > 0);
  assert.equal(proj.aspectRatioLabel, '16:9');
  assert.equal(proj.fps, 30);
});

test('createNewProjectState respects custom resolution and fps between 30 and 144', () => {
  const custom = createNewProjectState('E-Sports High FPS', {
    canvasWidth: 3840,
    canvasHeight: 2160,
    aspectRatioLabel: '16:9',
    fps: 144,
  });
  assert.equal(custom.title, 'E-Sports High FPS');
  assert.equal(custom.canvasWidth, 3840);
  assert.equal(custom.canvasHeight, 2160);
  assert.equal(custom.fps, 144);

  // Clamps under 30 to 30 and over 144 to 144
  const clampedLow = createNewProjectState('Low FPS', { fps: 15 });
  assert.equal(clampedLow.fps, 30);

  const clampedHigh = createNewProjectState('Super High FPS', { fps: 240 });
  assert.equal(clampedHigh.fps, 144);
});

test('generateShareableLink creates valid share link and code', () => {
  const proj = createNewProjectState('Test Share Link');
  const result = generateShareableLink(proj);

  assert.ok(result.shareLink.includes('share='));
  assert.ok(result.shareCode.length >= 6);
  assert.ok(result.shareLink.includes('Test%20Share%20Link') || result.shareLink.includes('title='));
});

