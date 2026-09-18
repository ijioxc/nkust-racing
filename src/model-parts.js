// model-parts.js — 把 GLB 的一個網格拆成「散件」（互相不相連的零件）
// 同一套演算法同時給簡報頁（Deck.jsx）與標記工具（tools/parts.html）使用，
// 兩邊算出來的零件編號才會一致。

// 回傳 { partOfTri: Int32Array（每個三角形屬於哪個零件）, count }
// 零件編號依「第一次出現的三角形順序」給定，因此對同一個檔案永遠相同。
function splitLooseParts(geometry, weldEps = 1e-4) {
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const triCount = index ? index.count / 3 : pos.count / 3;

  // 1) 依座標焊接重複頂點（CAD 匯出常把同一點拆成多個）
  const key = new Map();
  const weld = new Int32Array(pos.count);
  let vCount = 0;
  const inv = 1 / weldEps;
  for (let i = 0; i < pos.count; i++) {
    const k = Math.round(pos.getX(i) * inv) + "," +
              Math.round(pos.getY(i) * inv) + "," +
              Math.round(pos.getZ(i) * inv);
    let v = key.get(k);
    if (v === undefined) { v = vCount++; key.set(k, v); }
    weld[i] = v;
  }

  // 2) Union-Find：共用頂點的三角形算同一件
  const parent = new Int32Array(vCount);
  for (let i = 0; i < vCount; i++) parent[i] = i;
  const find = (x) => {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    while (parent[x] !== r) { const n = parent[x]; parent[x] = r; x = n; }
    return r;
  };
  const vi = (t, c) => weld[index ? index.getX(t * 3 + c) : t * 3 + c];
  for (let t = 0; t < triCount; t++) {
    const a = find(vi(t, 0)), b = find(vi(t, 1)), c = find(vi(t, 2));
    if (b !== a) parent[b] = a;
    const rc = find(c);
    if (rc !== a) parent[rc] = a;
  }

  // 3) 依出現順序編號
  const order = new Map();
  const partOfTri = new Int32Array(triCount);
  for (let t = 0; t < triCount; t++) {
    const r = find(vi(t, 0));
    let id = order.get(r);
    if (id === undefined) { id = order.size; order.set(r, id); }
    partOfTri[t] = id;
  }
  return { partOfTri, count: order.size };
}

if (typeof window !== "undefined") window.splitLooseParts = splitLooseParts;
