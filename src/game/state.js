import { DIFFICULTIES, OFFICE_RANKS } from './constants.js';

export function getRankForScore(score) {
  let current = OFFICE_RANKS[0];
  for (const rank of OFFICE_RANKS) {
    if (score >= rank.minScore) {
      current = rank;
    }
  }
  return current;
}

export function createInitialState(difficultyKey = 'crunch') {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.crunch;
  return {
    phase: 'menu', // 'menu' | 'playing' | 'paused' | 'stealth' | 'gameover'
    previousPhase: 'menu',
    difficulty: diff.id,
    score: 0,
    distance: 0,
    speed: diff.baseSpeed,
    sanity: diff.startSanity,
    maxSanity: diff.startSanity,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    caffeineEnergy: 0, // 0..100
    caffeineTimer: 0, // > 0 means Flow/Boost active
    invulnTimer: 0, // brief i-frames after hit
    coffeesCollected: 0,
    approvalsCollected: 0,
    donutsCollected: 0,
    hazardsDodged: 0,
    elapsed: 0,
    lastEventText: ''
  };
}

export function startGameState(difficultyKey = 'crunch') {
  const state = createInitialState(difficultyKey);
  state.phase = 'playing';
  return state;
}

export function updateRunState(state, dt) {
  if (state.phase !== 'playing') return state;

  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.crunch;
  state.elapsed += dt;

  // Speed ramps up over time; caffeine boost adds temporary +35% speed
  const baseTargetSpeed = Math.min(diff.maxSpeed, diff.baseSpeed + state.elapsed * diff.speedRamp);
  const boostMultiplier = state.caffeineTimer > 0 ? 1.35 : 1.0;
  state.speed = baseTargetSpeed * boostMultiplier;

  const distDelta = state.speed * dt;
  state.distance += distDelta;
  state.score += distDelta * 1.4 * state.multiplier;

  if (state.caffeineTimer > 0) {
    state.caffeineTimer = Math.max(0, state.caffeineTimer - dt);
    state.caffeineEnergy = (state.caffeineTimer / 5.0) * 100;
  }

  if (state.invulnTimer > 0) {
    state.invulnTimer = Math.max(0, state.invulnTimer - dt);
  }

  return state;
}

export function computeSpawnInterval(state) {
  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.crunch;
  const speedRatio = (state.speed - diff.baseSpeed) / Math.max(1, diff.maxSpeed - diff.baseSpeed);
  const clamped = Math.max(0, Math.min(1, speedRatio));
  return diff.spawnInterval - clamped * (diff.spawnInterval - diff.minSpawnInterval);
}

export function applyCollectible(state, kind) {
  if (state.phase !== 'playing') return { points: 0, triggeredFlow: false };

  state.combo += 1;
  if (state.combo > state.maxCombo) {
    state.maxCombo = state.combo;
  }
  state.multiplier = Math.min(5, 1 + Math.floor(state.combo / 4));

  let basePoints = 0;
  let triggeredFlow = false;

  if (kind === 'coffee') {
    basePoints = 60;
    state.coffeesCollected += 1;
    if (state.caffeineTimer <= 0) {
      state.caffeineEnergy = Math.min(100, state.caffeineEnergy + 34);
      if (state.caffeineEnergy >= 100) {
        state.caffeineTimer = 5.0;
        triggeredFlow = true;
        state.lastEventText = '⚡ FLOW STATE! Miễn nhiễm họp 5s!';
      } else {
        state.lastEventText = '☕ +1 Cà phê đá';
      }
    } else {
      state.caffeineTimer = Math.min(5.0, state.caffeineTimer + 1.0);
      state.lastEventText = '☕ Kéo dài Flow State!';
    }
  } else if (kind === 'approval') {
    basePoints = 100;
    state.approvalsCollected += 1;
    state.lastEventText = '📄 +100 Duyệt KPI!';
  } else if (kind === 'donut') {
    basePoints = 50;
    state.donutsCollected += 1;
    if (state.sanity < state.maxSanity) {
      state.sanity += 1;
      state.lastEventText = '🍩 +1 Tinh thần (Pantry Donut)';
    } else {
      basePoints = 120;
      state.lastEventText = '🍩 Full tinh thần! +120 điểm';
    }
  }

  const points = basePoints * state.multiplier;
  state.score += points;
  return { points, triggeredFlow };
}

export function applyHazardHit(state, hazardKind) {
  if (state.phase !== 'playing') return { damaged: false, gameOver: false, smashed: false };

  // In Flow State, player smashes through hazards for bonus points!
  if (state.caffeineTimer > 0) {
    state.score += 75 * state.multiplier;
    state.hazardsDodged += 1;
    state.lastEventText = '💥 Flow State ủi bay vật cản! +75';
    return { damaged: false, gameOver: false, smashed: true };
  }

  if (state.invulnTimer > 0) {
    return { damaged: false, gameOver: false, smashed: false };
  }

  state.sanity = Math.max(0, state.sanity - 1);
  state.combo = 0;
  state.multiplier = 1;
  state.invulnTimer = 1.4;

  const messages = {
    manager: '👔 Bị Sếp tóm đi "Quick Sync 5 phút"!',
    printer: '🖨️ Kẹt giấy máy in!',
    stack: '📁 Đổ tháp hồ sơ deadline!',
    wetfloor: '⚠️ Trượt sàn ướt phòng pantry!'
  };
  state.lastEventText = messages[hazardKind] || '💥 Va chạm công sở!';

  if (state.sanity <= 0) {
    state.phase = 'gameover';
    return { damaged: true, gameOver: true, smashed: false };
  }

  return { damaged: true, gameOver: false, smashed: false };
}
