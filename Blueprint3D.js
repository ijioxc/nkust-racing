// Blueprint3D.js — Proxy for OffscreenCanvas Web Worker
// Exposes window.BlueprintGL = { init, destroy, setHighlight, resetView, getGroupNames }

let worker = null;
let onSelectCb = null;
let loadProgress = null;
let _groupNames = [];

function init(canvas, onGroupSelect, onProgress) {
  onSelectCb = onGroupSelect;
  loadProgress = onProgress;

  const workerUrl = 'Blueprint3D.worker.js?v=15';
  worker = new Worker(workerUrl, { type: 'module' });
  const offscreen = canvas.transferControlToOffscreen();
  
  const rect = canvas.getBoundingClientRect();
  const absGlbPath = new URL('fsae-car-7.snapshot.4/chassis_grouped.glb', window.location.href).href;
  worker.postMessage({
    type: 'init',
    canvas: offscreen,
    glbPath: absGlbPath,
    width: rect.width || 800,
    height: rect.height || 600,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
  }, [offscreen]);

  worker.onmessage = (e) => {
    const { type, pct, names, group, cursor } = e.data;
    if (type === 'progress') {
      loadProgress?.(pct);
    } else if (type === 'groups') {
      _groupNames = names;
    } else if (type === 'select') {
      onSelectCb?.(group);
    } else if (type === 'cursor') {
      canvas.style.cursor = cursor;
    }
  };

  const forwardEvent = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.type === 'pointerdown' || e.type === 'pointermove' || e.type === 'pointerup') {
      worker.postMessage({
        type: 'event',
        event: {
          type: e.type,
          clientX: e.clientX - rect.left,
          clientY: e.clientY - rect.top,
          pointerId: e.pointerId,
          pointerType: e.pointerType,
          isPrimary: e.isPrimary,
          button: e.button,
          buttons: e.buttons
        }
      });
    }
    
    // Separate raycast logic since orbit controls consumes the event
    if (e.type === 'pointermove') {
      worker.postMessage({
        type: 'raycast',
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isClick: false
      });
    }
  };

  const forwardClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    worker.postMessage({
      type: 'raycast',
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isClick: true
    });
  };

  canvas.addEventListener('pointerdown', forwardEvent);
  canvas.addEventListener('pointermove', forwardEvent);
  canvas.addEventListener('pointerup', forwardEvent);
  canvas.addEventListener('click', forwardClick);
  canvas._events = forwardEvent;
  canvas._click = forwardClick;

  const ro = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    if (worker) {
      worker.postMessage({ type: 'resize', width: r.width, height: r.height });
    }
  });
  ro.observe(canvas.parentElement || canvas);
  canvas._ro = ro;
}

function destroy() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

function setHighlight(group) {
  worker?.postMessage({ type: 'setHighlight', group });
}

function clearHighlight() {
  worker?.postMessage({ type: 'clearHighlight' });
}

function getGroupNames() {
  return _groupNames;
}

function resetView() {
  worker?.postMessage({ type: 'resetView' });
}

function captureViews() {
  console.warn("captureViews disabled in Worker mode");
  return null;
}

function captureOne() {
  console.warn("captureOne disabled in Worker mode");
  return null;
}

function captureToRtdb() {
  console.warn("captureToRtdb disabled in Worker mode");
  return null;
}

window.BlueprintGL = {
  init, destroy, setHighlight, clearHighlight, getGroupNames, resetView,
  captureViews, captureOne, captureToRtdb
};
