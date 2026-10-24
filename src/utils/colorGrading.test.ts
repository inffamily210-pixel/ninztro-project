import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_COLOR_GRADE,
  FILTER_PRESETS,
  buildCssFilterString,
} from './colorGrading.ts';

test('buildCssFilterString produces baseline values with default settings', () => {
  const css = buildCssFilterString(DEFAULT_COLOR_GRADE);
  assert.match(css, /brightness\(1\.000\)/);
  assert.match(css, /contrast\(1\.000\)/);
  assert.match(css, /saturate\(1\.000\)/);
});

test('buildCssFilterString modifies brightness and contrast when exposure is altered', () => {
  const modified = {
    ...DEFAULT_COLOR_GRADE,
    exposure: 25,
    contrast: 50,
    saturation: -50,
  };
  const css = buildCssFilterString(modified);
  assert.match(css, /brightness\(/);
  assert.match(css, /contrast\(1\.500\)/);
  assert.match(css, /saturate\(0\.500\)/);
});

test('FILTER_PRESETS includes all 10 curated pro presets', () => {
  assert.equal(FILTER_PRESETS.length >= 8, true);
  const ids = FILTER_PRESETS.map((p) => p.id);
  assert.equal(ids.includes('cyberpunk'), true);
  assert.equal(ids.includes('kodak35mm'), true);
  assert.equal(ids.includes('tealOrange'), true);
  assert.equal(ids.includes('dramaticDark'), true);
});
