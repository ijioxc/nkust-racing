// Blueprint3D.js — Three.js scene manager for chassis GLB viewer
// Exposes window.BlueprintGL = { init, destroy, setHighlight, resetView, getGroupNames }

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const GLB_PATH = 'fsae-car-7.snapshot.4/chassis_grouped.glb';

// State
let renderer, scene, camera, controls, animId;
let groupMeshes = {};          // groupName → Mesh[]
let origMaterials = new Map(); // Mesh → original Material
let activeGroup = null;
let onSelectCb = null;
let loadProgress = null;       // function(pct) for loading bar
let groundMesh = null;         // shadow plane (hidden during capture)
let modelRoot = null;          // loaded GLB root

// Highlight material — blue-accent tinted, semitransparent
const H_MAT = new THREE.MeshStandardMaterial({
  color: 0x0071e3,
  emissive: 0x0071e3,
  emissiveIntensity: 0.28,
  metalness: 0.3,
  roughness: 0.55,
  transparent: true,
  opacity: 0.93,
});

// ─── Public API ───────────────────────────────────────────────
function init(canvas, onGroupSelect, onProgress) {
  onSelectCb  = onGroupSelect;
  loadProgress = onProgress;

  // Renderer (preserveDrawingBuffer lets us capture stills via toDataURL)
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(42, 1, 0.01, 200);
  camera.position.set(4, 2.5, 4);

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(amb);

  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(6, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far  = 50;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -5;
  sun.shadow.camera.right = sun.shadow.camera.top   =  5;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xd0e8ff, 0.8);
  fill.position.set(-5, 3, -4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(0, -4, -6);
  scene.add(rim);

  // Ground shadow plane
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.14 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);
  groundMesh = ground;

  // Controls
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor  = 0.06;
  controls.minDistance    = 0.4;
  controls.maxDistance    = 30;
  controls.maxPolarAngle  = Math.PI * 0.88;

  // Resize
  const ro = new ResizeObserver(_resize);
  ro.observe(canvas.parentElement || canvas);
  canvas._bpRO = ro;
  _resize();

  // Load GLB
  const loader = new GLTFLoader();
  loader.load(
    GLB_PATH,
    _onLoad,
    (xhr) => loadProgress?.(Math.round((xhr.loaded / xhr.total) * 100)),
    (err) => console.error('[BlueprintGL] load error:', err),
  );

  // Events
  canvas._bpClick = (e) => _onClick(e, canvas);
  canvas._bpMove  = (e) => _onMove(e, canvas);
  canvas.addEventListener('click',     canvas._bpClick);
  canvas.addEventListener('mousemove', canvas._bpMove);

  window._bpKey = (e) => { if (e.key === 'Escape') clearHighlight(); };
  window.addEventListener('keydown', window._bpKey);

  // Render loop
  _loop();
}

function destroy() {
  cancelAnimationFrame(animId);
  const canvas = renderer?.domElement;
  if (canvas) {
    canvas.removeEventListener('click',     canvas._bpClick);
    canvas.removeEventListener('mousemove', canvas._bpMove);
    canvas._bpRO?.disconnect();
  }
  window.removeEventListener('keydown', window._bpKey);
  renderer?.dispose();
  renderer = scene = camera = controls = null;
  groupMeshes = {};
  origMaterials = new Map();
  activeGroup = null;
}

function setHighlight(groupName) {
  _clearHighlightInternal();
  activeGroup = groupName;
  (groupMeshes[groupName] || []).forEach(m => { m.material = H_MAT; });
}

function clearHighlight() {
  _clearHighlightInternal();
  activeGroup = null;
  onSelectCb?.(null);
}

function getGroupNames() {
  return Object.keys(groupMeshes);
}

function resetView() {
  if (!controls || !camera) return;
  controls.target.set(0, 0, 0);
  camera.position.set(4, 2.5, 4);
  controls.update();
}

// Render clean stills of the model from standard angles.
// Returns { iso, front, back, left, right, top } → PNG dataURLs (transparent bg).
function captureViews(size = 1400) {
  if (!renderer || !scene || !camera || !modelRoot) return null;
  clearHighlight();

  // Save state
  const oldSize = new THREE.Vector2();
  renderer.getSize(oldSize);
  const oldPos    = camera.position.clone();
  const oldAspect = camera.aspect;
  const oldGround = groundMesh ? groundMesh.visible : true;
  if (groundMesh) groundMesh.visible = false;

  renderer.setSize(size, size, false);
  camera.aspect = 1;
  camera.updateProjectionMatrix();

  // Distance to frame the (origin-centred, ~3.6u) model
  const d = 5.2;
  const angles = {
    iso:   new THREE.Vector3( d * 0.78, d * 0.52,  d * 0.78),
    front: new THREE.Vector3( 0,        d * 0.06,  d),
    back:  new THREE.Vector3( 0,        d * 0.06, -d),
    left:  new THREE.Vector3( d,        d * 0.06,  0),
    right: new THREE.Vector3(-d,        d * 0.06,  0),
    top:   new THREE.Vector3( 0.001,    d,         0.001),
  };

  const out = {};
  for (const [k, pos] of Object.entries(angles)) {
    camera.position.copy(pos);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    out[k] = renderer.domElement.toDataURL("image/png");
  }

  // Restore
  if (groundMesh) groundMesh.visible = oldGround;
  renderer.setSize(oldSize.x, oldSize.y, false);
  camera.position.copy(oldPos);
  camera.aspect = oldAspect;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);

  return out;
}

// Capture a single angle (smaller eval payload). angle ∈ iso|front|back|left|right|top
function captureOne(angle, size = 1400) {
  const all = captureViews(size);
  return all ? all[angle] : null;
}

// ─── Private ──────────────────────────────────────────────────
function _onLoad(gltf) {
  const model = gltf.scene;

  // Center + normalise scale
  const box  = new THREE.Box3().setFromObject(model);
  const ctr  = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 3.6 / maxDim;

  model.position.sub(ctr.multiplyScalar(scale));
  model.scale.setScalar(scale);
  model.position.y -= (size.y * scale) * 0.1; // slight downshift

  model.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow    = true;
      obj.receiveShadow = true;
    }
  });

  scene.add(model);
  modelRoot = model;

  // Build group map:
  // Walk every mesh → find its ancestor that is a direct child of the model root
  groupMeshes = {};
  origMaterials = new Map();

  model.traverse(obj => {
    if (!obj.isMesh) return;
    // Find the top-level group (immediate child of model)
    let node = obj;
    while (node.parent && node.parent !== model) node = node.parent;
    const key = node.name || ('group_' + node.id);
    if (!groupMeshes[key]) groupMeshes[key] = [];
    groupMeshes[key].push(obj);
    origMaterials.set(obj, Array.isArray(obj.material) ? [...obj.material] : obj.material);
  });

  console.log('[BlueprintGL] groups loaded:', Object.keys(groupMeshes));
  loadProgress?.(100);

  // Adjust camera
  const fitDist = Math.max(size.x, size.z) * scale * 1.6;
  camera.position.set(fitDist, fitDist * 0.6, fitDist);
  controls.target.set(0, 0, 0);
  controls.update();
}

function _clearHighlightInternal() {
  if (!activeGroup) return;
  (groupMeshes[activeGroup] || []).forEach(m => {
    const orig = origMaterials.get(m);
    if (orig) m.material = orig;
  });
}

let _hovered = null;
const _HOVER_MAT = new THREE.MeshStandardMaterial({
  color: 0x0071e3,
  emissive: 0x0071e3,
  emissiveIntensity: 0.12,
  metalness: 0.3,
  roughness: 0.55,
  transparent: true,
  opacity: 0.96,
});

function _onMove(e, canvas) {
  if (!scene) return;
  const hit = _raycast(e, canvas);
  const group = hit ? _groupOf(hit) : null;

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
  canvas.style.cursor = group ? 'pointer' : 'grab';
}

function _onClick(e, canvas) {
  if (!scene) return;
  const hit = _raycast(e, canvas);
  if (!hit) { clearHighlight(); return; }
  const group = _groupOf(hit);
  if (!group) return;
  setHighlight(group);
  onSelectCb?.(group);
}

function _raycast(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width)  *  2 - 1,
    -((e.clientY - rect.top) / rect.height) *  2 + 1,
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ndc, camera);
  const meshes = Object.values(groupMeshes).flat();
  const hits = ray.intersectObjects(meshes);
  return hits.length ? hits[0].object : null;
}

function _groupOf(mesh) {
  return Object.keys(groupMeshes).find(g => groupMeshes[g].includes(mesh)) || null;
}

function _resize() {
  if (!renderer || !camera) return;
  const el = renderer.domElement.parentElement || renderer.domElement;
  const w  = el.clientWidth  || 800;
  const h  = el.clientHeight || 600;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function _loop() {
  animId = requestAnimationFrame(_loop);
  controls?.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

// Capture all angles and stash them in a temp RTDB node so a large
// payload can be fetched out-of-band via REST (avoids eval size limits).
// Returns the list of angle keys written.
function captureToRtdb(size = 1400) {
  const views = captureViews(size);
  if (!views) return null;
  const db = window.RTDB;
  if (!db) { console.error("[BlueprintGL] RTDB not ready"); return null; }
  const updates = {};
  Object.entries(views).forEach(([k, dataUrl]) => { updates[k] = dataUrl; });
  db.ref("_capture").set(updates);
  return Object.keys(views);
}

// Export
window.BlueprintGL = {
  init, destroy, setHighlight, clearHighlight, getGroupNames, resetView,
  captureViews, captureOne, captureToRtdb,
};
