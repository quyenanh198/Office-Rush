import * as THREE from 'three';
import { STORAGE_KEY } from './game/constants.js';
import {
  createInitialState,
  startGameState,
  updateRunState,
  applyCollectible,
  applyHazardHit,
  getRankForScore
} from './game/state.js';
import { createOfficeWorld } from './game/world.js';
import { createPlayer } from './game/player.js';
import { createSpawner } from './game/spawner.js';
import { sfx } from './game/audio.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 140);
camera.position.set(0, 4.1, 8.2);
camera.lookAt(0, 1.1, -6);

const world = createOfficeWorld(scene);
const player = createPlayer(scene);
const spawner = createSpawner(scene);

// DOM Elements
const hudEl = document.getElementById('hud');
const scoreEl = document.getElementById('hud-score');
const comboEl = document.getElementById('hud-combo');
const sanityEl = document.getElementById('hud-sanity');
const caffeineFillEl = document.getElementById('hud-caffeine-fill');
const eventEl = document.getElementById('hud-event');

const menuModal = document.getElementById('menu-modal');
const pauseModal = document.getElementById('pause-modal');
const gameoverModal = document.getElementById('gameover-modal');
const bossOverlay = document.getElementById('boss-overlay');
const menuBestEl = document.getElementById('menu-best');

const btnStart = document.getElementById('btn-start');
const btnResume = document.getElementById('btn-resume');
const btnQuit = document.getElementById('btn-quit');
const btnRetry = document.getElementById('btn-retry');
const btnGoMenu = document.getElementById('btn-go-menu');
const btnMute = document.getElementById('btn-mute');
const btnPause = document.getElementById('btn-pause');
const btnBoss = document.getElementById('btn-boss');
const btnBossExit = document.getElementById('btn-boss-exit');

let selectedDifficulty = 'crunch';
let state = createInitialState(selectedDifficulty);
let eventFadeTimer = 0;

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { bestScore: 0, totalCoffees: 0, runs: 0 };
  } catch {
    return { bestScore: 0, totalCoffees: 0, runs: 0 };
  }
}

function saveStats(currentScore, coffees) {
  const stats = loadStats();
  stats.bestScore = Math.max(stats.bestScore, Math.floor(currentScore));
  stats.totalCoffees += coffees;
  stats.runs += 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage quota errors
  }
  return stats;
}

function refreshMenuBest() {
  const stats = loadStats();
  menuBestEl.textContent = stats.bestScore > 0
    ? `🏆 Kỷ lục: ${stats.bestScore} điểm | ☕ Tổng cà phê: ${stats.totalCoffees} | 🪑 Số lượt: ${stats.runs}`
    : 'Chưa có kỷ lục — hãy là người đầu tiên trốn họp thành công!';
}

function syncModals() {
  hudEl.classList.toggle('hidden', state.phase !== 'playing' && state.phase !== 'paused');
  menuModal.classList.toggle('hidden', state.phase !== 'menu');
  pauseModal.classList.toggle('hidden', state.phase !== 'paused');
  gameoverModal.classList.toggle('hidden', state.phase !== 'gameover');
  bossOverlay.classList.toggle('hidden', state.phase !== 'stealth');
}

function startRun() {
  world.reset();
  player.reset();
  spawner.reset();
  state = startGameState(selectedDifficulty);
  eventFadeTimer = 0;
  eventEl.textContent = '';
  syncModals();
  updateHUD();
}

function showMenu() {
  world.reset();
  player.reset();
  spawner.reset();
  state = createInitialState(selectedDifficulty);
  refreshMenuBest();
  syncModals();
}

function togglePause() {
  if (state.phase === 'playing') {
    state.phase = 'paused';
    syncModals();
  } else if (state.phase === 'paused') {
    state.phase = 'playing';
    syncModals();
  }
}

let preStealthMuted = false;
function toggleBossKey() {
  if (state.phase === 'stealth') {
    state.phase = state.previousPhase || 'menu';
    sfx.setMuted(preStealthMuted);
    btnMute.textContent = sfx.muted ? '🔇' : '🔊';
    document.title = 'Office Rush 3D — Coffee & Deadlines';
    syncModals();
  } else {
    state.previousPhase = state.phase === 'playing' ? 'paused' : state.phase;
    state.phase = 'stealth';
    preStealthMuted = sfx.muted;
    sfx.setMuted(true);
    document.title = 'Q4_Budget_KPI_Tracker_FINAL_v3.xlsx - Excel';
    syncModals();
  }
}

function showGameOver() {
  sfx.playGameOver();
  const finalScore = Math.floor(state.score);
  const stats = saveStats(finalScore, state.coffeesCollected);
  const rank = getRankForScore(finalScore);

  document.getElementById('go-rank').textContent = `${rank.badge} ${rank.title}`;
  document.getElementById('go-score').textContent = finalScore.toLocaleString();
  document.getElementById('go-best').textContent = stats.bestScore.toLocaleString();
  document.getElementById('go-dist').textContent = `${Math.floor(state.distance)} m`;
  document.getElementById('go-coffee').textContent = `${state.coffeesCollected} ☕`;
  document.getElementById('go-approval').textContent = `${state.approvalsCollected} 📄`;
  document.getElementById('go-combo').textContent = `x${state.maxCombo}`;
  syncModals();
}

function updateHUD() {
  scoreEl.textContent = Math.floor(state.score).toLocaleString();
  comboEl.textContent = `x${state.multiplier} (${state.combo})`;
  sanityEl.textContent = '❤️'.repeat(state.sanity) + '🖤'.repeat(Math.max(0, state.maxSanity - state.sanity));
  caffeineFillEl.style.width = `${Math.min(100, Math.round(state.caffeineEnergy))}%`;
}

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDifficulty = btn.dataset.diff;
  });
});

btnStart.addEventListener('click', startRun);
btnRetry.addEventListener('click', startRun);
btnResume.addEventListener('click', togglePause);
btnQuit.addEventListener('click', showMenu);
btnGoMenu.addEventListener('click', showMenu);
btnPause.addEventListener('click', togglePause);
btnBoss.addEventListener('click', toggleBossKey);
btnBossExit.addEventListener('click', toggleBossKey);

btnMute.addEventListener('click', () => {
  const muted = sfx.toggleMute();
  btnMute.textContent = muted ? '🔇' : '🔊';
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (key === 'b') {
    e.preventDefault();
    toggleBossKey();
    return;
  }

  if (state.phase === 'stealth') return;

  if (key === 'm') {
    const muted = sfx.toggleMute();
    btnMute.textContent = muted ? '🔇' : '🔊';
    return;
  }

  if (key === 'p' || key === 'escape') {
    if (state.phase === 'playing' || state.phase === 'paused') {
      togglePause();
    }
    return;
  }

  if (state.phase === 'menu' && (key === 'enter' || key === ' ')) {
    e.preventDefault();
    startRun();
    return;
  }

  if (state.phase === 'gameover' && (key === 'enter' || key === ' ')) {
    e.preventDefault();
    startRun();
    return;
  }

  if (state.phase !== 'playing') return;

  if (key === 'arrowleft' || key === 'a') {
    if (player.moveLeft()) sfx.playLaneSwitch();
  } else if (key === 'arrowright' || key === 'd') {
    if (player.moveRight()) sfx.playLaneSwitch();
  } else if (key === 'arrowup' || key === 'w' || key === ' ') {
    e.preventDefault();
    if (player.jump()) sfx.playJump();
  }
});

// Touch swipe support for mobile/tablet
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (state.phase !== 'playing' || e.changedTouches.length === 0) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
    if (dx < 0 && player.moveLeft()) sfx.playLaneSwitch();
    if (dx > 0 && player.moveRight()) sfx.playLaneSwitch();
  } else if (dy < -28) {
    if (player.jump()) sfx.playJump();
  }
}, { passive: true });

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main animation loop
let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (state.phase === 'playing') {
    updateRunState(state, dt);
    world.update(state.speed, dt);
    player.update(dt, state);

    spawner.update(dt, state, player.getBounds(), {
      onCollect(kind) {
        const res = applyCollectible(state, kind);
        sfx.playCollect(kind);
        if (res.triggeredFlow) sfx.playFlowStart();
        eventEl.textContent = state.lastEventText;
        eventFadeTimer = 2.0;
      },
      onHazard(kind) {
        const res = applyHazardHit(state, kind);
        if (res.smashed) {
          sfx.playSmash();
        } else if (res.damaged) {
          sfx.playHit();
        }
        eventEl.textContent = state.lastEventText;
        eventFadeTimer = 2.2;
        if (res.gameOver) {
          showGameOver();
        }
      }
    });

    if (eventFadeTimer > 0) {
      eventFadeTimer -= dt;
      if (eventFadeTimer <= 0) {
        eventEl.textContent = '';
      }
    }

    // Subtle camera follow + Flow State FOV
    const targetCamX = player.mesh.position.x * 0.42;
    camera.position.x += (targetCamX - camera.position.x) * Math.min(1, dt * 8);
    const targetFov = state.caffeineTimer > 0 ? 70 : 62;
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 6);
      camera.updateProjectionMatrix();
    }

    updateHUD();
  } else if (state.phase === 'menu') {
    // Gentle ambient world scroll in background on menu
    world.update(4.5, dt);
  }

  renderer.render(scene, camera);
}

refreshMenuBest();
syncModals();
requestAnimationFrame(animate);
