import * as Y from 'https://cdn.jsdelivr.net/npm/yjs@13.6.14/+esm';
import { IndexeddbPersistence } from 'https://cdn.jsdelivr.net/npm/y-indexeddb@9.0.12/+esm';
import { WebrtcProvider } from 'https://cdn.jsdelivr.net/npm/y-webrtc@10.3.0/+esm';

// 建立全域的 Yjs Document
const ydoc = new Y.Doc();

// 離線持久化 (IndexedDB)
// 這會將 Yjs 狀態保存在瀏覽器，達到真正的 Offline-First
const indexeddbProvider = new IndexeddbPersistence('nkust-racing-db', ydoc);

// P2P 即時協作 (WebRTC)
// 透過公共 signaling server 尋找同伴並進行端對端同步（無須後端資料庫）
const webrtcProvider = new WebrtcProvider('nkust-racing-room-v1', ydoc, {
  signaling: [
    'wss://signaling.yjs.dev',
    'wss://y-webrtc-signaling-eu.herokuapp.com'
  ]
});

// 各個模組的共用陣列快取 (YArray)
const yCollections = {};

// 追蹤 IndexedDB 是否已完成初始同步，防範與 React 元件 mount 之間的 Race Condition 競態問題
let isIndexedDbSynced = false;
indexeddbProvider.on('synced', () => {
  isIndexedDbSynced = true;
});

/**
 * useCrdtState(collectionName, seed)
 * 用來取代 useState 的 Hook。
 * 監聽 Yjs Array 的變化並觸發 React 重新渲染。
 */
function useCrdtState(coll, seed) {
  if (!yCollections[coll]) {
    yCollections[coll] = ydoc.getArray(coll);
  }
  const yArray = yCollections[coll];
  const [items, setLocal] = React.useState(yArray.toJSON());
  const seededRef = React.useRef(false);

  React.useEffect(() => {
    const observer = () => {
      setLocal(yArray.toJSON());
    };
    yArray.observe(observer);

    const checkAndSeed = () => {
      if (yArray.length === 0 && seed && !seededRef.current) {
        seededRef.current = true;
        ydoc.transact(() => {
          yArray.push(seed);
        });
      }
      setLocal(yArray.toJSON());
    };

    // 雙重防線：若 IndexedDB 在元件 mount 之前或瞬間就已完成 synced，則直接呼叫 seeding 與狀態拉取；否則才綁定 once 事件。
    if (isIndexedDbSynced || indexeddbProvider.synced) {
      checkAndSeed();
    } else {
      indexeddbProvider.once('synced', checkAndSeed);
    }

    return () => yArray.unobserve(observer);
  }, [coll, yArray, seed]);

  // 更新邏輯
  const setItems = React.useCallback((updater) => {
    ydoc.transact(() => {
      const prev = yArray.toJSON();
      const next = typeof updater === "function" ? updater(prev) : updater;
      
      // CRDT 的特性是不能直接覆寫陣列，必須找出差異並 insert/delete
      // 這裡做一個簡單的完整替換 (在真實大型專案中應優化為細粒度 delta)
      yArray.delete(0, yArray.length);
      yArray.insert(0, next);
    });
  }, [yArray]);

  return [items, setItems];
}

// 覆蓋 window 對象上的 useRtdbState，讓 App.jsx 無縫接軌，無需修改 App.jsx 的呼叫
window.useRtdbState = useCrdtState;
window.ydoc = ydoc;
