import * as THREE from 'three';
import { COLORS, LANES } from './constants.js';

export function createPlayer(scene) {
  const root = new THREE.Group();
  root.position.set(0, 0, 2.5);

  const chairGroup = new THREE.Group();
  root.add(chairGroup);

  // Chair base + 5 caster wheels
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x4c566a, metalness: 0.6, roughness: 0.4 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e222a, roughness: 0.8 });
  const seatMat = new THREE.MeshStandardMaterial({ color: COLORS.chairFabric, roughness: 0.7 });
  const accentMat = new THREE.MeshStandardMaterial({ color: COLORS.chairAccent, roughness: 0.5 });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 10), metalMat);
  stem.position.y = 0.25;
  chairGroup.add(stem);

  const wheels = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.45), metalMat);
    leg.position.set(Math.sin(angle) * 0.22, 0.1, Math.cos(angle) * 0.22);
    leg.rotation.y = angle;
    chairGroup.add(leg);

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(Math.sin(angle) * 0.42, 0.06, Math.cos(angle) * 0.42);
    chairGroup.add(wheel);
    wheels.push(wheel);
  }

  // Seat cushion & backrest
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.72), seatMat);
  seat.position.set(0, 0.48, 0);
  seat.castShadow = true;
  chairGroup.add(seat);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.85, 0.12), seatMat);
  backrest.position.set(0, 0.92, 0.32);
  backrest.rotation.x = 0.12;
  backrest.castShadow = true;
  chairGroup.add(backrest);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.14), accentMat);
  stripe.position.set(0, 0.92, 0.32);
  stripe.rotation.x = 0.12;
  chairGroup.add(stripe);

  // Office Worker character sitting on chair
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xeceff4, roughness: 0.6 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3b4252, roughness: 0.7 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd2b3, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.8 });
  const tieMat = new THREE.MeshStandardMaterial({ color: 0xbf616a, roughness: 0.5 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.34), shirtMat);
  torso.position.set(0, 0.88, 0.02);
  torso.castShadow = true;
  chairGroup.add(torso);

  // Red tie
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.38, 0.05), tieMat);
  tie.position.set(0, 0.86, -0.16);
  chairGroup.add(tie);

  // Legs
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.45), pantsMat);
  legs.position.set(0, 0.6, -0.22);
  chairGroup.add(legs);

  // Head + Hair
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), skinMat);
  head.position.set(0, 1.4, 0);
  head.castShadow = true;
  chairGroup.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.14, 0.39), hairMat);
  hair.position.set(0, 1.58, 0.01);
  chairGroup.add(hair);

  // Flow State Aura ring
  const auraGeo = new THREE.TorusGeometry(0.75, 0.05, 8, 24);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x88c0d0,
    transparent: true,
    opacity: 0.0
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.2;
  root.add(aura);

  scene.add(root);

  let laneIndex = 1; // 0: left, 1: center, 2: right
  let vy = 0;
  let y = 0;
  let isGrounded = true;
  const GRAVITY = -34;
  const JUMP_VEL = 12.8;

  return {
    mesh: root,
    getLaneIndex() {
      return laneIndex;
    },
    moveLeft() {
      if (laneIndex > 0) {
        laneIndex -= 1;
        return true;
      }
      return false;
    },
    moveRight() {
      if (laneIndex < 2) {
        laneIndex += 1;
        return true;
      }
      return false;
    },
    jump() {
      if (isGrounded) {
        vy = JUMP_VEL;
        isGrounded = false;
        return true;
      }
      return false;
    },
    update(dt, state) {
      const targetX = LANES[laneIndex];
      const dx = targetX - root.position.x;
      root.position.x += dx * Math.min(1, dt * 14);

      // Lean chair into turn
      chairGroup.rotation.z = THREE.MathUtils.clamp(-dx * 0.18, -0.32, 0.32);
      chairGroup.rotation.y = THREE.MathUtils.clamp(-dx * 0.1, -0.2, 0.2);

      // Jump physics
      if (!isGrounded) {
        vy += GRAVITY * dt;
        y += vy * dt;
        if (y <= 0) {
          y = 0;
          vy = 0;
          isGrounded = true;
        }
      }
      root.position.y = y;

      // Spin caster wheels
      for (const w of wheels) {
        w.rotation.x -= state.speed * dt * 0.9;
      }

      // Flow state aura
      if (state.caffeineTimer > 0) {
        auraMat.opacity = 0.65 + Math.sin(state.elapsed * 14) * 0.25;
        aura.scale.setScalar(1 + Math.sin(state.elapsed * 10) * 0.08);
      } else {
        auraMat.opacity = 0;
      }

      // Invulnerability blink
      if (state.invulnTimer > 0) {
        chairGroup.visible = Math.floor(state.invulnTimer * 16) % 2 === 0;
      } else {
        chairGroup.visible = true;
      }
    },
    getBounds() {
      return {
        x: root.position.x,
        y: root.position.y,
        z: root.position.z,
        halfW: 0.42,
        height: 1.5,
        halfD: 0.42
      };
    },
    reset() {
      laneIndex = 1;
      vy = 0;
      y = 0;
      isGrounded = true;
      root.position.set(0, 0, 2.5);
      chairGroup.rotation.set(0, 0, 0);
      chairGroup.visible = true;
      auraMat.opacity = 0;
    }
  };
}
