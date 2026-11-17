import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  startGameState,
  updateRunState,
  applyCollectible,
  applyHazardHit,
  computeSpawnInterval,
  getRankForScore
} from '../src/game/state.js';

test('startGameState initializes playing state for selected difficulty', () => {
  const chill = startGameState('chill');
  assert.equal(chill.phase, 'playing');
  assert.equal(chill.sanity, 4);

  const friday = startGameState('friday');
  assert.equal(friday.phase, 'playing');
  assert.equal(friday.sanity, 3);
  assert.ok(friday.speed > chill.speed);
});

test('updateRunState advances distance, score, and speed', () => {
  const state = startGameState('crunch');
  const initialSpeed = state.speed;
  updateRunState(state, 1.0);
  assert.ok(state.distance > 0);
  assert.ok(state.score > 0);
  assert.ok(state.speed >= initialSpeed);
});

test('collecting 3 coffees triggers Flow State invulnerability', () => {
  const state = startGameState('crunch');
  applyCollectible(state, 'coffee');
  applyCollectible(state, 'coffee');
  const third = applyCollectible(state, 'coffee');
  assert.equal(third.triggeredFlow, true);
  assert.ok(state.caffeineTimer > 0);

  // Hazard during Flow State smashes without losing sanity
  const hit = applyHazardHit(state, 'manager');
  assert.equal(hit.smashed, true);
  assert.equal(hit.damaged, false);
  assert.equal(state.sanity, 3);
});

test('hazard hits reduce sanity and trigger gameover at 0', () => {
  const state = startGameState('crunch');
  const hit1 = applyHazardHit(state, 'printer');
  assert.equal(hit1.damaged, true);
  assert.equal(hit1.gameOver, false);
  assert.equal(state.sanity, 2);

  // Clear i-frames manually to test subsequent hits
  state.invulnTimer = 0;
  applyHazardHit(state, 'stack');
  state.invulnTimer = 0;
  const hit3 = applyHazardHit(state, 'manager');
  assert.equal(hit3.gameOver, true);
  assert.equal(state.phase, 'gameover');
});

test('donut heals 1 sanity when below maxSanity', () => {
  const state = startGameState('crunch');
  applyHazardHit(state, 'wetfloor');
  assert.equal(state.sanity, 2);
  applyCollectible(state, 'donut');
  assert.equal(state.sanity, 3);
});

test('computeSpawnInterval stays within configured bounds', () => {
  const state = startGameState('crunch');
  const interval = computeSpawnInterval(state);
  assert.ok(interval >= 0.45 && interval <= 0.95);
});

test('getRankForScore returns appropriate office rank', () => {
  assert.equal(getRankForScore(0).title, 'Thực tập sinh lạc lối');
  assert.equal(getRankForScore(6000).title, 'VP Về Đúng 5h00 Chiều');
});
