// firebase-store.jsx — Realtime Database sync layer
//
// Provides useRtdbState(collection, seed) — a drop-in replacement for
// React.useState that mirrors a local array to a Firebase RTDB node and
// stays live across devices/users via .on("value").
//
// All app data lives under ROOT/ to keep clear of any legacy nodes.

const firebaseConfig = {
  apiKey: "AIzaSyCaLAdn2l-VZJJGk_uVst03MaNEtCJLn0Q",
  authDomain: "nkust-racing.firebaseapp.com",
  databaseURL: "https://nkust-racing-default-rtdb.firebaseio.com",
  projectId: "nkust-racing",
  storageBucket: "nkust-racing.firebasestorage.app",
  messagingSenderId: "438278825258",
  appId: "1:438278825258:web:b90e07234f150a3c39aa53",
  measurementId: "G-1M5XV451VE",
};

firebase.initializeApp(firebaseConfig);
const RTDB = firebase.database();
const ROOT = "racing";

function rtdbRef(coll) {
  return RTDB.ref(`${ROOT}/${coll}`);
}

// Diff prev → next and push only the changes to RTDB
function writeDiff(coll, prev, next) {
  const ref = rtdbRef(coll);
  const prevMap = new Map(prev.map((x, i) => [x.id, { item: x, i }]));
  const updates = {};

  next.forEach((item, i) => {
    const id = item.id;
    if (!id) return;
    const payload = { ...item, _order: i };
    const old = prevMap.get(id);
    const changed = !old || old.i !== i ||
      JSON.stringify(old.item) !== JSON.stringify(item);
    if (changed) updates[id] = payload;
    prevMap.delete(id);
  });

  // Anything left in prevMap was removed
  prevMap.forEach((_, id) => { updates[id] = null; });

  if (Object.keys(updates).length) ref.update(updates);
}

// useState-compatible hook backed by RTDB
function useRtdbState(coll, seed) {
  const [items, setLocal] = React.useState(seed || []);
  const seededRef = React.useRef(false);

  React.useEffect(() => {
    const ref = rtdbRef(coll);
    const handler = ref.on("value", (snap) => {
      const val = snap.val();

      // Empty node → seed once with the bundled defaults (idempotent: keyed by id)
      if (!val) {
        if (!seededRef.current && seed && seed.length) {
          seededRef.current = true;
          const init = {};
          seed.forEach((it, i) => { init[it.id] = { ...it, _order: i }; });
          ref.set(init);
        }
        return;
      }

      seededRef.current = true;
      const arr = Object.entries(val)
        .map(([id, v]) => ({ ...v, id }))
        .sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
      setLocal(arr);
    });
    return () => ref.off("value", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coll]);

  const setItems = React.useCallback((updater) => {
    setLocal(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeDiff(coll, prev, next);
      return next;
    });
  }, [coll]);

  return [items, setItems];
}

Object.assign(window, { useRtdbState, RTDB, rtdbRef });
