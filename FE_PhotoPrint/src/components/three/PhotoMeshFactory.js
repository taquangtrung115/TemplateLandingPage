import * as THREE from 'three';
import { drawPrintSurface, loadImage } from './photoCanvas';

function materialFor(model) {
  if (model === 'crystal_mirror') return new THREE.MeshPhysicalMaterial({
    roughness: 0.18, metalness: 0.03, clearcoat: 1, clearcoatRoughness: 0.08,
  });
  return new THREE.MeshStandardMaterial({ roughness: model === 'canvas_wrap' ? 0.85 : 0.61 });
}

export function createPhotoMesh(model, frameColor) {
  const group = new THREE.Group();
  const thickness = { framed_photo: 0.17, crystal_mirror: 0.16, canvas_wrap: 0.22, polaroid_card: 0.03, photobook_open: 0.13 }[model] || 0.1;
  const backing = new THREE.Mesh(new THREE.BoxGeometry(2.15, 2.15, thickness), new THREE.MeshStandardMaterial({
    color: frameColor, roughness: model === 'crystal_mirror' ? 0.27 : 0.59, metalness: model === 'crystal_mirror' ? 0.33 : 0,
  }));
  backing.castShadow = true;
  group.add(backing);

  const surface = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 2.02), materialFor(model));
  surface.position.z = thickness / 2 + 0.005;
  group.add(surface);

  const edges = [];
  if (model === 'framed_photo') {
    for (const [x, y, width, height] of [[-1.04, 0, 0.085, 2.16], [1.04, 0, 0.085, 2.16], [0, -1.04, 2.16, 0.085], [0, 1.04, 2.16, 0.085]]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.12), backing.material);
      edge.position.set(x, y, thickness / 2);
      edge.castShadow = true;
      group.add(edge);
      edges.push(edge);
    }
  }
  group.userData = { backing, surface, edges };
  return group;
}

export function updateDimensions(group, widthCm, heightCm) {
  const ratio = Math.min(4, Math.max(0.25, widthCm / heightCm || 1));
  group.scale.set(Math.min(ratio, 1), Math.min(1 / ratio, 1), 1);
}

export function updateFrameColor(group, value) {
  group.userData.backing.material.color.set(value);
}

export async function applyPhotoTexture(group, options, renderer, stillCurrent) {
  const images = await Promise.all([loadImage(options.src), loadImage(options.rightSrc)]);
  if (!stillCurrent()) return;
  const canvas = document.createElement('canvas');
  drawPrintSurface(canvas, images, options);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const material = group.userData.surface.material;
  material.map?.dispose();
  material.map = texture;
  material.needsUpdate = true;
}

export function disposeScene(scene) {
  const materials = new Set();
  scene.traverse(object => {
    object.geometry?.dispose();
    if (object.material) materials.add(object.material);
  });
  for (const material of materials) {
    material.map?.dispose();
    material.dispose();
  }
}
