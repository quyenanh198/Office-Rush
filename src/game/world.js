import * as THREE from 'three';
import { COLORS, CORRIDOR_WIDTH, LANE_WIDTH } from './constants.js';

const SEGMENT_LENGTH = 16;
const SEGMENT_COUNT = 8;

export function createOfficeWorld(scene) {
  scene.background = new THREE.Color(0x242936);
  scene.fog = new THREE.Fog(0x242936, 32, 96);

  // Lighting: cool office fluorescent + warm accent
  const hemi = new THREE.HemisphereLight(0xeceff4, 0x2e3440, 0.85);
  scene.add(hemi);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.05);
  dirLight.position.set(8, 18, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 65;
  dirLight.shadow.camera.left = -14;
  dirLight.shadow.camera.right = 14;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  scene.add(dirLight);

  // Shared geometries & materials for performance
  const floorGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH, SEGMENT_LENGTH);
  const floorMat = new THREE.MeshStandardMaterial({
    color: COLORS.floorMain,
    roughness: 0.85,
    metalness: 0.05
  });

  const laneStripeGeo = new THREE.PlaneGeometry(0.12, SEGMENT_LENGTH);
  const laneStripeMat = new THREE.MeshBasicMaterial({
    color: 0x616e88,
    transparent: true,
    opacity: 0.65
  });

  const wallGeo = new THREE.BoxGeometry(0.4, 4.2, SEGMENT_LENGTH);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3b4252,
    roughness: 0.9
  });

  const windowGeo = new THREE.PlaneGeometry(3.4, 1.8);
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x81a1c1 });

  const deskTopGeo = new THREE.BoxGeometry(1.7, 0.1, 2.8);
  const deskMat = new THREE.MeshStandardMaterial({ color: COLORS.desk, roughness: 0.6 });

  const monitorGeo = new THREE.BoxGeometry(0.12, 0.65, 1.05);
  const monitorMat = new THREE.MeshStandardMaterial({
    color: 0x2e3440,
    emissive: 0x4c78a8,
    emissiveIntensity: 0.55
  });

  const cubicleGeo = new THREE.BoxGeometry(0.15, 1.35, 3.0);
  const cubicleMat = new THREE.MeshStandardMaterial({ color: COLORS.cubicle, roughness: 0.8 });

  const ceilingLightGeo = new THREE.BoxGeometry(2.6, 0.1, 1.2);
  const ceilingLightMat = new THREE.MeshBasicMaterial({ color: 0xeceff4 });

  const potGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.4, 8);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xd08770, roughness: 0.7 });
  const leafGeo = new THREE.DodecahedronGeometry(0.36, 0);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xa3be8c, roughness: 0.8 });

  const segments = [];

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const seg = new THREE.Group();
    seg.position.z = -i * SEGMENT_LENGTH;

    // Floor
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    seg.add(floor);

    // Lane dividers
    for (const xOffset of [-LANE_WIDTH / 2, LANE_WIDTH / 2]) {
      const stripe = new THREE.Mesh(laneStripeGeo, laneStripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(xOffset, 0.01, 0);
      seg.add(stripe);
    }

    // Side walls + windows + cubicles + desks
    for (const side of [-1, 1]) {
      const wallX = side * (CORRIDOR_WIDTH / 2 + 0.2);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(wallX, 2.1, 0);
      seg.add(wall);

      // Glowing office windows
      for (const wz of [-4, 4]) {
        const win = new THREE.Mesh(windowGeo, windowMat);
        win.position.set(wallX - side * 0.22, 2.3, wz);
        win.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
        seg.add(win);
      }

      // Cubicle workstations along the corridor edges
      for (const dz of [-4.5, 3.5]) {
        const deskX = side * (CORRIDOR_WIDTH / 2 - 0.95);
        const desk = new THREE.Mesh(deskTopGeo, deskMat);
        desk.position.set(deskX, 0.78, dz);
        desk.castShadow = true;
        desk.receiveShadow = true;
        seg.add(desk);

        const monitor = new THREE.Mesh(monitorGeo, monitorMat);
        monitor.position.set(deskX + side * 0.35, 1.18, dz);
        seg.add(monitor);

        const divider = new THREE.Mesh(cubicleGeo, cubicleMat);
        divider.position.set(deskX + side * 0.72, 0.68, dz);
        seg.add(divider);
      }

      // Office plant every segment
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(side * (CORRIDOR_WIDTH / 2 - 0.5), 0.2, -0.5);
      seg.add(pot);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(side * (CORRIDOR_WIDTH / 2 - 0.5), 0.62, -0.5);
      seg.add(leaf);
    }

    // Overhead fluorescent ceiling lights
    for (const lz of [-4, 4]) {
      const lightPanel = new THREE.Mesh(ceilingLightGeo, ceilingLightMat);
      lightPanel.position.set(0, 4.6, lz);
      seg.add(lightPanel);
    }

    scene.add(seg);
    segments.push(seg);
  }

  return {
    update(speed, dt) {
      const moveZ = speed * dt;
      for (const seg of segments) {
        seg.position.z += moveZ;
        if (seg.position.z > SEGMENT_LENGTH) {
          seg.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
        }
      }
    },
    reset() {
      segments.forEach((seg, i) => {
        seg.position.z = -i * SEGMENT_LENGTH;
      });
    }
  };
}
