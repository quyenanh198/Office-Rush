import * as THREE from 'three';
import { COLORS, LANES } from './constants.js';
import { computeSpawnInterval } from './state.js';

function buildManagerMesh() {
  const g = new THREE.Group();
  const suitMat = new THREE.MeshStandardMaterial({ color: COLORS.managerSuit, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd2b3, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.8 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.1, 0.45), suitMat);
  body.position.y = 0.8;
  body.castShadow = true;
  g.add(body);

  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.4), suitMat);
  legs.position.y = 0.28;
  g.add(legs);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), skinMat);
  head.position.y = 1.62;
  head.castShadow = true;
  g.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.44), hairMat);
  hair.position.y = 1.85;
  g.add(hair);

  // Floating clipboard / "SYNC?" badge
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.36, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xebcb8b })
  );
  board.position.set(0, 2.15, 0);
  g.add(board);

  return { mesh: g, halfW: 0.5, height: 1.9, halfD: 0.4 };
}

function buildPrinterMesh() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.printer, roughness: 0.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x434c5e, roughness: 0.6 });
  const alertMat = new THREE.MeshBasicMaterial({ color: 0xbf616a });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.88, 0.95), bodyMat);
  base.position.y = 0.44;
  base.castShadow = true;
  g.add(base);

  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.65), darkMat);
  tray.position.y = 0.94;
  g.add(tray);

  const led = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.1), alertMat);
  led.position.set(0.45, 0.8, 0.48);
  g.add(led);

  return { mesh: g, halfW: 0.68, height: 0.95, halfD: 0.48 };
}

function buildStackMesh() {
  const g = new THREE.Group();
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xeceff4, roughness: 0.8 });
  const folderMat = new THREE.MeshStandardMaterial({ color: 0xd08770, roughness: 0.7 });

  for (let i = 0; i < 4; i++) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.95 - i * 0.06, 0.34, 0.85 - i * 0.05),
      i % 2 === 0 ? paperMat : folderMat
    );
    box.position.y = 0.17 + i * 0.34;
    box.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.14;
    box.castShadow = true;
    g.add(box);
  }
  return { mesh: g, halfW: 0.52, height: 1.4, halfD: 0.45 };
}

function buildWetFloorMesh() {
  const g = new THREE.Group();
  const signMat = new THREE.MeshStandardMaterial({ color: COLORS.warning, roughness: 0.4 });
  const sign = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.72, 4), signMat);
  sign.position.y = 0.36;
  sign.rotation.y = Math.PI / 4;
  sign.castShadow = true;
  g.add(sign);

  const puddle = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 16),
    new THREE.MeshBasicMaterial({ color: 0x88c0d0, transparent: true, opacity: 0.55 })
  );
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.y = 0.02;
  g.add(puddle);

  return { mesh: g, halfW: 0.55, height: 0.55, halfD: 0.55 };
}

function buildCollectibleMesh(kind) {
  const g = new THREE.Group();
  if (kind === 'coffee') {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.2, 0.56, 12),
      new THREE.MeshStandardMaterial({ color: COLORS.coffeeCup, roughness: 0.4 })
    );
    cup.position.y = 0.75;
    g.add(cup);

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.23, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: COLORS.coffee, roughness: 0.7 })
    );
    sleeve.position.y = 0.73;
    g.add(sleeve);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: 0x2e3440 })
    );
    lid.position.y = 1.06;
    g.add(lid);
  } else if (kind === 'donut') {
    const donut = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.13, 10, 20),
      new THREE.MeshStandardMaterial({ color: COLORS.donut, roughness: 0.35 })
    );
    donut.position.y = 0.85;
    g.add(donut);
  } else {
    // approval document
    const doc = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.62, 0.08),
      new THREE.MeshStandardMaterial({ color: COLORS.approval, emissive: 0x2b4420, emissiveIntensity: 0.3 })
    );
    doc.position.y = 0.85;
    g.add(doc);
  }
  return { mesh: g, halfW: 0.45, height: 1.2, halfD: 0.45 };
}

export function createSpawner(scene) {
  const entities = [];
  let spawnTimer = 0.7;

  function spawnWave(state) {
    // Pick 1 or 2 lanes for hazards/collectibles, always leaving at least 1 safe lane!
    const laneOrder = [0, 1, 2].sort(() => Math.random() - 0.5);
    const hazardCount = Math.random() < 0.35 && state.elapsed > 12 ? 2 : 1;

    const hazardKinds = ['manager', 'printer', 'stack', 'wetfloor'];
    for (let i = 0; i < hazardCount; i++) {
      const lane = laneOrder[i];
      const kind = hazardKinds[Math.floor(Math.random() * hazardKinds.length)];
      let built;
      if (kind === 'manager') built = buildManagerMesh();
      else if (kind === 'printer') built = buildPrinterMesh();
      else if (kind === 'stack') built = buildStackMesh();
      else built = buildWetFloorMesh();

      built.mesh.position.set(LANES[lane], 0, -78);
      scene.add(built.mesh);
      entities.push({
        type: 'hazard',
        kind,
        lane,
        ...built,
        passed: false
      });
    }

    // Spawn collectible on a guaranteed safe lane
    if (Math.random() < 0.78) {
      const safeLane = laneOrder[hazardCount];
      const roll = Math.random();
      let kind = 'approval';
      if (roll < 0.5) kind = 'coffee';
      else if (roll < 0.64) kind = 'donut';

      const built = buildCollectibleMesh(kind);
      built.mesh.position.set(LANES[safeLane], 0, -78);
      scene.add(built.mesh);
      entities.push({
        type: 'collectible',
        kind,
        lane: safeLane,
        ...built
      });
    }
  }

  function removeEntity(index) {
    const item = entities[index];
    scene.remove(item.mesh);
    entities.splice(index, 1);
  }

  return {
    update(dt, state, playerBounds, callbacks) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnWave(state);
        spawnTimer = computeSpawnInterval(state);
      }

      const moveZ = state.speed * dt;
      for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        e.mesh.position.z += moveZ;

        if (e.type === 'collectible') {
          e.mesh.rotation.y += dt * 2.6;
        }

        // Check AABB collision with player
        const ex = e.mesh.position.x;
        const ez = e.mesh.position.z;
        const overlapX = Math.abs(playerBounds.x - ex) < (playerBounds.halfW + e.halfW);
        const overlapZ = Math.abs(playerBounds.z - ez) < (playerBounds.halfD + e.halfD);
        const overlapY = playerBounds.y < e.height;

        if (overlapX && overlapZ && overlapY) {
          if (e.type === 'collectible') {
            callbacks.onCollect(e.kind);
            removeEntity(i);
            continue;
          } else {
            callbacks.onHazard(e.kind);
            removeEntity(i);
            continue;
          }
        }

        if (e.type === 'hazard' && !e.passed && ez > playerBounds.z + 1.2) {
          e.passed = true;
          state.hazardsDodged += 1;
        }

        if (ez > 10) {
          removeEntity(i);
        }
      }
    },
    reset() {
      while (entities.length > 0) {
        removeEntity(entities.length - 1);
      }
      spawnTimer = 0.6;
    }
  };
}
