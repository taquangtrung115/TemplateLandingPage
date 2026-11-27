import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPhotoMesh, applyPhotoTexture, updateDimensions, updateFrameColor, disposeScene } from './PhotoMeshFactory';
import { isWebGLAvailable } from './webglSupport';
import Fallback25DViewer from './Fallback25DViewer';

const cameraPosition = [0.75, 0.3, 3.8];

export default function ThreeStageCanvas({ ref, options }) {
  const host = useRef(null);
  const stage = useRef(null);
  const fallback = useRef(null);
  const currentOptions = useRef(options);
  currentOptions.current = options;
  const [failed, setFailed] = useState(() => !isWebGLAvailable());

  useImperativeHandle(ref, () => ({
    resetCamera: () => stage.current?.controls.reset() ?? fallback.current?.resetCamera(),
    captureSnapshot: () => stage.current
      ? stage.current.renderer.domElement.toDataURL('image/png')
      : fallback.current?.captureSnapshot() ?? null,
  }), []);

  useEffect(() => {
    if (failed) return;
    const element = host.current;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', 'Mô hình thành phẩm 3D');
    let renderer;
    try {
      const context = canvas.getContext('webgl2', { antialias: true, alpha: true, preserveDrawingBuffer: true });
      if (!context) { setFailed(true); return; }
      renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(...cameraPosition);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.1;
    controls.maxDistance = 7;
    controls.autoRotateSpeed = 0.75;
    const ambient = new THREE.HemisphereLight(0xfff6e7, 0x8d8278, 2.6);
    const key = new THREE.DirectionalLight(0xfff6df, 2.3);
    key.position.set(-1, 3, 5);
    const rim = new THREE.DirectionalLight(0xeaf1fb, 1.25);
    rim.position.set(3, 0, 2);
    scene.add(ambient, key, rim);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const state = { renderer, controls, scene, ambient, key, mesh: null, model: null };
    stage.current = state;
    element.append(canvas);

    const resize = () => {
      const width = element.clientWidth || 320, height = element.clientHeight || 240;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    observer?.observe(element);
    resize();

    let frame;
    function render() {
      controls.autoRotate = Boolean(currentOptions.current.autoRotate) && !motion.matches;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    }
    function loseContext(event) { event.preventDefault(); setFailed(true); }
    canvas.addEventListener('webglcontextlost', loseContext);
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      canvas.removeEventListener('webglcontextlost', loseContext);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      stage.current = null;
    };
  }, [failed]);

  const { model, widthCm, heightCm, src, rightSrc, fitMode, focalX, focalY, caption, captionFont, borderTone, frameColor, hasMatboard, warm } = options;
  useEffect(() => {
    const state = stage.current;
    if (failed || !state) return;
    if (state.model !== model) {
      if (state.mesh) { state.scene.remove(state.mesh); disposeScene(state.mesh); }
      state.mesh = createPhotoMesh(model, frameColor);
      state.scene.add(state.mesh);
      state.model = model;
    }
    updateDimensions(state.mesh, widthCm, heightCm);
    updateFrameColor(state.mesh, frameColor);
    state.key.color.set(warm ? 0xffbc75 : 0xfff7e7);
    state.key.intensity = warm ? 3.4 : 2.1;
    state.ambient.intensity = warm ? 1.15 : 2.45;
    let active = true;
    applyPhotoTexture(state.mesh, { model, widthCm, heightCm, src, rightSrc, fitMode, focalX, focalY, caption, captionFont, borderTone, frameColor, hasMatboard }, state.renderer, () => active)
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [failed, model, widthCm, heightCm, src, rightSrc, fitMode, focalX, focalY, caption, captionFont, borderTone, frameColor, hasMatboard, warm]);

  return failed ? <Fallback25DViewer ref={fallback} options={options} /> : <div className={'three-stage' + (warm ? ' warm' : '')} ref={host} />;
}
