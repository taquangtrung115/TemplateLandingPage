import * as THREE from 'three';
import { drawPrintBoard, drawPrintSurface, loadImage, printBoardRatio } from './photoCanvas';

export function makePrintBoardGeometry() {
  const width = 2, height = width * printBoardRatio, inset = 0.018;
  const shape = new THREE.Shape();
  shape.moveTo(inset - width / 2, inset - height / 2);
  shape.lineTo(width / 2 - inset, inset - height / 2);
  shape.lineTo(width / 2 - inset, height / 2 - inset);
  shape.lineTo(inset - width / 2, height / 2 - inset);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.032, bevelEnabled: true, bevelThickness: 0.012, bevelSize: inset, bevelSegments: 2 }).translate(0, 0, -0.016);
}

function createPrintBoard() {
  const group = new THREE.Group();
  const backing = new THREE.Mesh(makePrintBoardGeometry(), new THREE.MeshStandardMaterial({ color: '#d7cabc', roughness: 0.75 }));
  const geometry = new THREE.PlaneGeometry(1.978, 1.978 * printBoardRatio);
  const surface = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#fcfaf6', toneMapped: false }));
  const back = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#f0e8e0', toneMapped: false }));
  surface.position.z = 0.029;
  back.position.z = -0.029;
  back.rotation.y = Math.PI;
  group.add(backing, surface, back);
  group.userData = { backing, surface, back, edges: [] };
  return group;
}

function materialFor(model) {
  if (model === 'crystal_mirror') return new THREE.MeshPhysicalMaterial({
    roughness: 0.18, metalness: 0.03, clearcoat: 1, clearcoatRoughness: 0.08,
  });
  return new THREE.MeshStandardMaterial({ roughness: model === 'canvas_wrap' ? 0.85 : 0.61 });
}

export function createPhotoMesh(model, frameColor) {
  if (model === 'print_board') return createPrintBoard();
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
  const materials = [group.userData.surface.material];
  if (options.board) materials.push(group.userData.back.material);
  materials.forEach((material, index) => {
    const canvas = document.createElement('canvas');
    if (options.board) drawPrintBoard(canvas, images[0], options.board, index === 1);
    else drawPrintSurface(canvas, images, options);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    material.map?.dispose();
    material.map = texture;
    material.color.set('#ffffff');
    material.needsUpdate = true;
  });
}

export function disposeScene(scene) {
  const materials = new Set();
  const geometries = new Set();
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) materials.add(object.material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    material.map?.dispose();
    material.dispose();
  }
}
