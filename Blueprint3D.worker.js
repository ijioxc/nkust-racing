// Blueprint3D.worker.js — OffscreenCanvas renderer
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const GLB_PATH = 'fsae-car-7.snapshot.4/chassis_grouped.glb';

let renderer, scene, camera, controls, animId;
let groupMeshes = {};
let origMaterials = new Map();
let activeGroup = null;

const H_MAT = new THREE.MeshStandardMaterial({
  color: 0x0071e3, emissive: 0x0071e3, emissiveIntensity: 0.28,
  metalness: 0.3, roughness: 0.55, transparent: true, opacity: 0.93,
});

const _HOVER_MAT = new THREE.MeshStandardMaterial({
  color: 0x0071e3, emissive: 0x0071e3, emissiveIntensity: 0.12,
  metalness: 0.3, roughness: 0.55, transparent: true, opacity: 0.96,
});

let _hovered = null;

// Fake DOM element for OrbitControls since it expects a DOM element
class DummyDOMElement {
  constructor() {
    this.clientWidth = 800;
    this.clientHeight = 600;
    this.listeners = {};
    this.style = {};
  }
  addEventListener(type, cb, opts) {
    if(!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }
  removeEventListener(type, cb, opts) {
    if(this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== cb);
    }
  }
  dispatchEvent(event) {
    (this.listeners[event.type] || []).forEach(cb => cb(event));
  }
  setPointerCapture() {}
  releasePointerCapture() {}
  hasPointerCapture() { return false; }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight, right: this.clientWidth, bottom: this.clientHeight }; }
  focus() {}
}

const dummyCanvas = new DummyDOMElement();

function init(canvas, width, height, pixelRatio) {
  dummyCanvas.clientWidth = width;
  dummyCanvas.clientHeight = height;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, width / height, 0.01, 200);
  camera.position.set(4, 2.5, 4);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(6, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd0e8ff, 0.8);
  fill.position.set(-5, 3, -4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(0, -4, -6);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.14 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Controls (using dummy canvas)
  controls = new OrbitControls(camera, dummyCanvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 0.4;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI * 0.88;

  // Load Model (use absolute URL relative to location)
  const loader = new GLTFLoader();
  const absPath = new URL(GLB_PATH, self.location.href).href;
  
  loader.load(absPath, gltf => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const ctr = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3.6 / maxDim;

    model.position.sub(ctr.multiplyScalar(scale));
    model.scale.setScalar(scale);
    model.position.y -= (size.y * scale) * 0.1;

    model.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    scene.add(model);

    model.traverse(obj => {
      if (!obj.isMesh) return;
      let node = obj;
      while (node.parent && node.parent !== model) node = node.parent;
      const key = node.name || ('group_' + node.id);
      if (!groupMeshes[key]) groupMeshes[key] = [];
      groupMeshes[key].push(obj);
      origMaterials.set(obj, Array.isArray(obj.material) ? [...obj.material] : obj.material);
    });

    postMessage({ type: 'progress', pct: 100 });
    postMessage({ type: 'groups', names: Object.keys(groupMeshes) });
    
  }, xhr => {
    postMessage({ type: 'progress', pct: Math.round((xhr.loaded / xhr.total) * 100) });
  });

  _loop();
}

function _loop() {
  animId = requestAnimationFrame(_loop);
  controls?.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function _clearHighlightInternal() {
  if (!activeGroup) return;
  (groupMeshes[activeGroup] || []).forEach(m => {
    const orig = origMaterials.get(m);
    if (orig) m.material = orig;
  });
}

function setHighlight(groupName) {
  _clearHighlightInternal();
  activeGroup = groupName;
  (groupMeshes[groupName] || []).forEach(m => { m.material = H_MAT; });
}

function clearHighlight() {
  _clearHighlightInternal();
  activeGroup = null;
}

function resize(w, h) {
  dummyCanvas.clientWidth = w;
  dummyCanvas.clientHeight = h;
  if (!renderer || !camera) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function handleEvent(e) {
  // Pass to OrbitControls dummy
  e.preventDefault = () => {};
  e.stopPropagation = () => {};
  dummyCanvas.dispatchEvent(e);
}

function raycast(x, y, isClick) {
  if (!camera) return;
  const ndc = new THREE.Vector2(
    (x / dummyCanvas.clientWidth) * 2 - 1,
    -(y / dummyCanvas.clientHeight) * 2 + 1,
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(Object.values(groupMeshes).flat());
  const hit = hits.length ? hits[0].object : null;
  const group = hit ? Object.keys(groupMeshes).find(g => groupMeshes[g].includes(hit)) : null;

  if (isClick) {
    if (group) {
      setHighlight(group);
      postMessage({ type: 'select', group });
    } else {
      clearHighlight();
      postMessage({ type: 'select', group: null });
    }
  } else {
    // Hover logic
    if (_hovered && _hovered !== activeGroup && _hovered !== group) {
      (groupMeshes[_hovered] || []).forEach(m => {
        const orig = origMaterials.get(m);
        if (orig) m.material = orig;
      });
      _hovered = null;
    }
    if (group && group !== activeGroup && group !== _hovered) {
      (groupMeshes[group] || []).forEach(m => { m.material = _HOVER_MAT; });
      _hovered = group;
    }
    postMessage({ type: 'cursor', cursor: group ? 'pointer' : 'grab' });
  }
}

// Message Router
self.onmessage = function(e) {
  const data = e.data;
  switch (data.type) {
    case 'init':
      init(data.canvas, data.width, data.height, data.pixelRatio);
      break;
    case 'resize':
      resize(data.width, data.height);
      break;
    case 'event':
      handleEvent(data.event);
      break;
    case 'raycast':
      raycast(data.x, data.y, data.isClick);
      break;
    case 'setHighlight':
      setHighlight(data.group);
      break;
    case 'clearHighlight':
      clearHighlight();
      break;
    case 'resetView':
      if (controls && camera) {
        controls.target.set(0, 0, 0);
        camera.position.set(4, 2.5, 4);
      }
      break;
  }
};
