// Deck.jsx — 簡報頁（車隊介紹／招募）
// 內容寫死在 DECK_SLIDES：改文字、換圖、增刪投影片都只要改這個陣列。
// 投影片版型（layout）：cover / statement / columns / stage / grid / split / list / flags / waterline / flow / closing
// car 欄位：這張要不要顯示 3D 車、放在哪裡（說明見 DeckStageCar）。有 car 的投影片，模型載好後會取代照片。
// 文字標「〔待填〕」的地方請換成車隊實際資料。

const DECK_SLIDES = [
  {
    layout: "cover",
    image: "public/car-snapshots/6UegT.jpg",
    eyebrow: "國立高雄科技大學 · 學生方程式車隊",
    title: "NKUST Racing",
    subtitle: "自己設計、自己製造、自己開上賽道",
    car: { x: 0.73, w: 0.52, tone: "dark" },
  },
  {
    layout: "statement",
    eyebrow: "什麼是學生方程式",
    title: "一年，一台車，一整支團隊",
    body: "Formula SAE 是國際大學生賽車競賽。學生要在一年內完成一台單座賽車的設計、製造與測試，再帶到比賽現場接受評分——不只比速度，也比工程設計、成本控制與簡報能力。",
  },
  {
    layout: "columns",
    eyebrow: "比賽怎麼評分",
    title: "靜態 + 動態，兩種戰場",
    columns: [
      { heading: "靜態項目", tone: "blue",
        items: ["設計審查 Design", "成本與製造 Cost", "商業簡報 Business Presentation"] },
      { heading: "動態項目", tone: "orange",
        items: ["直線加速 Acceleration", "八字繞環 Skid Pad", "繞錐競速 Autocross", "耐久賽 Endurance"] },
    ],
  },
  {
    layout: "stage",   // 純 3D 舞台：文字在左上，爆炸圖在中間
    eyebrow: "車隊組別",
    title: "四個技術組，拼成一台車",
    body: "車體、底盤、動力、電力，各管一塊；再加上行銷與財務後勤，讓車隊跑得下去。",
    car: { x: 0.68, y: 0.62, w: 0.56, zoom: 1.4, explode: 1, labels: true, spin: 0.35, tone: "dark",
           portrait: { zoom: 1.45 } },
  },
  {
    layout: "grid",
    eyebrow: "車隊組別",
    title: "每一組在做什麼",
    hint: "點卡片看每一組在做什麼",
    // what：做什麼；how：怎麼做（點卡片後展開顯示）
    // 3D 標亮依 kind 對照組別（DECK_TEAM_OF 把 parts.json 的系統歸到組）；car: false＝不顯示 3D 車
    // icon：用哪個 SubsystemIcon（省略＝同 kind）；image：沒有 3D 車時左側改放這張圖（載入失敗退回圖示）
    cells: [
      { kind: "車體", text: "車架、座艙、外殼與空力",
        what: "整台車的骨架和外衣。車架撐起所有零件、翻車時保護車手；外殼和翼片決定空氣怎麼流過車身。",
        how: ["用 CAD 畫鋼管車架，提交結構等效表（SES）審查",
              "用 FEA 模擬車架剛性，用 CFD 模擬氣流",
              "裁管焊接車架，用碳纖維或玻璃纖維做外殼與翼片"] },
      { kind: "底盤", icon: "懸吊", text: "懸吊、轉向與煞車",
        what: "讓輪胎貼住地面，讓車轉得過去、也停得下來。這台車好不好開，底盤說了算。",
        how: ["設計懸吊幾何：外傾角、前束、側傾中心",
              "選避震器與彈簧，計算煞車力並選卡鉗、碟盤",
              "製作 A 臂、輪轂與踏板組；技檢時四輪必須能同時鎖死"] },
      { kind: "動力", icon: "引擎", text: "引擎、進排氣與傳動",
        what: "讓車跑起來：引擎、進排氣、燃油、冷卻與傳動。",
        how: ["多數隊伍改用約 600cc 的重機引擎",
              "規則要求進氣經過限流閥（汽油車 20mm），需設計進氣道與集氣室",
              "調整噴油與點火，上測功機或實車測試"] },
      { kind: "電力", icon: "電裝", text: "配線、感測器與資料擷取",
        what: "整台車的神經系統：配線、電瓶、感測器、儀表與資料擷取。",
        how: ["畫配線圖、製作線束",
              "安裝規則要求的安全迴路：主開關、緊急停止按鈕",
              "裝感測器並用數據記錄器收集測試數據"] },
      { kind: "行銷", car: false, image: "public/team/marketing.png", text: "品牌、社群與贊助",
        what: "讓外界看見車隊：經營社群、記錄造車過程、爭取贊助，比賽時也負責商業簡報。",
        how: ["經營 IG 等社群，拍照、剪片記錄造車過程",
              "做贊助提案，跟廠商談合作",
              "準備比賽的商業簡報（Business Presentation）"] },
      { kind: "財務後勤", car: false, text: "預算、採購與行程",
        what: "讓車隊運轉得下去：管錢、買料、安排場地和比賽行程。",
        how: ["編列預算、記帳，控制每一筆支出",
              "整理零件採購，協助準備比賽的成本報告（Cost）",
              "安排工作空間、交通與比賽住宿"] },
    ],
  },
  {
    layout: "split",
    image: "public/car-snapshots/untitled.17.jpg",
    car: { x: 0.71, w: 0.56, focus: "車體", zoom: 0.78, portrait: { zoom: 0.55 } },
    eyebrow: "從模型到實車",
    title: "每一根管件，都先在電腦裡跑過",
    body: "我們用 CAD 建模、CAE 模擬驗證強度，再進工廠加工焊接。你在課本上學的力學，會變成真的能跑的零件。",
  },
  {
    layout: "list",
    eyebrow: "加入你會得到",
    title: "課堂上學不到的東西",
    items: [
      { head: "業界軟體實戰", text: "CAD / CAE / MATLAB，做真的專案" },
      { head: "動手製造", text: "加工、焊接、組裝、上車測試" },
      { head: "跨領域團隊", text: "機械、電機、管理，一起解決問題" },
      { head: "創業思維", text: "商業簡報、控制成本、爭取贊助，像經營一家新創" },
      { head: "團隊管理", text: "排進度、分工協調、帶新人，學會帶領團隊" },
      { head: "履歷亮點", text: "國際賽事經驗，面試有故事可以講" },
    ],
  },
  {
    layout: "flags",   // 團隊管理模式：三個燈號，一眼看懂哪裡自由、哪裡要配合
    eyebrow: "團隊管理模式",
    title: "哪裡自由，哪裡配合",
    flags: [
      { tone: "green", head: "自己決定",
        items: ["組內分工", "開會時間", "學習方式", "活動安排"] },
      { tone: "yellow", head: "先講一聲",
        items: ["設計影響別組", "花費超過〔待填〕元", "借場地、工具", "想休息一陣子"] },
      { tone: "red", head: "一起決定",
        items: ["組間接口", "比賽規則", "截止日", "總預算", "安全"] },
    ],
    footer: "紅燈只有這 5 項，其他都是你的。",
  },
  {
    layout: "waterline",   // 案例：Gore-Tex 水線原則（左文右圖，同 split 版型）
    eyebrow: "為什麼這樣設計",
    title: "借鏡 Gore-Tex\n的「水線原則」",
    body: "做防水外套的 Gore-Tex 不太分上司下屬，只守一條線：水線以上的洞，打錯補一下就好；水線以下的洞，動手前先找人商量。我們照做：自由不是沒規則，而是規則很少、而且你看得到。",
    above: { head: "水線以上", text: "打錯一個洞，補一下就好" },
    below: { head: "水線以下", text: "打錯一個洞，整艘船會沉" },
    aside: { head: "那完全扁平呢？",
      text: "Valve（Steam 母公司）以「沒有主管」出名，但有離職員工說過，公司裡其實有一層看不見的權力。所以我們把紅燈清單直接寫出來。" },
  },
  {
    layout: "flow",   // 實際怎麼跑：有想法時怎麼判斷燈號，加上窗口／協調會／紀錄
    eyebrow: "實際怎麼跑",
    title: "先問：這件事會碰到誰？",
    paths: [
      { tone: "green", when: "只有自己組", head: "直接做" },
      { tone: "yellow", when: "會碰到別組", head: "跟窗口說一聲" },
      { tone: "red", when: "接口、規則、預算、安全", head: "帶到協調會" },
    ],
    facts: [
      { head: "窗口", text: "每組一位：〔待填〕" },
      { head: "協調會", text: "每〔待填〕一次，30 分鐘" },
      { head: "紀錄", text: "〔待填〕，大家都查得到" },
    ],
  },
  {
    layout: "closing",
    image: "public/car-snapshots/457.jpg",
    car: { x: 0.72, w: 0.5, zoom: 1.12, tone: "dark" },
    eyebrow: "招募中",
    title: "不限科系，歡迎加入",
    subtitle: "對車有興趣就夠了，技術我們一起學",
    contacts: [
      { label: "Instagram", value: "〔待填〕" },
      { label: "Email", value: "〔待填〕" },
      { label: "社團教室", value: "〔待填〕" },
    ],
  },
];

// ── 3D 車輛（整份簡報共用）───────────────────────────────
// chassis_final.glb 已按群組分件：bodywork / chassis / aero / suspension / drivetrain / wheel / brake
// 模型只載入一次，之後每次展開都重用。

const DECK_CAR_MODEL = "public/models/chassis_final.glb";
const DECK_CAR_PARTS = "public/models/chassis_final.parts.json";
// parts.json 標的是系統（懸吊、煞車…），簡報以組別呈現：系統 → 組
const DECK_TEAM_OF = { 車體: "車體", 空力: "車體", 懸吊: "底盤", 煞車: "底盤", 引擎: "動力", 電裝: "電力" };
let deckCarAssets = null;   // Promise<{ THREE, pivot, radius, subsystems }>

// 依 chassis_final.parts.json 的「零件→系統」對照表，把模型重組成每個系統一個網格。
// （GLB 原本的群組左右不對稱、常把同一片板子拆到兩組，所以不直接用。）
function loadDeckCar() {
  if (!deckCarAssets) {
    deckCarAssets = (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const [gltf, table] = await Promise.all([
        new GLTFLoader().loadAsync(DECK_CAR_MODEL),
        fetch(DECK_CAR_PARTS).then(r => r.ok ? r.json() : { assign: {} }).catch(() => ({ assign: {} })),
      ]);
      const assign = table.assign || {};
      const root = gltf.scene;

      const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
      root.scale.setScalar(3.2 / Math.max(size.x, size.y, size.z));
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const pivot = new THREE.Group();          // 旋轉軸在車身中心
      root.position.sub(center);
      pivot.add(root);

      const source = [];
      root.traverse(o => { if (o.isMesh) source.push(o); });

      // 爆炸圖：每個散件沿「離車身中心的方向」往外推，再依系統往上抬，分出層次。
      // 位移存成頂點屬性 aExplode，由共用的 uExplode（0＝組好、1＝完全散開）在 shader 裡套用。
      const explode = { value: 0 };
      const EXPLODE_SPREAD = 0.45;
      const EXPLODE_LIFT = { 空力: 0.55, 引擎: 0.45, 車體: 0.2, 煞車: -0.05, 懸吊: 0, 其他: 0.25 };
      const labelCands = {};   // 組 → 散件清單（挑一個掛標籤）
      pivot.updateMatrixWorld(true);

      const subsystems = new Set();
      for (const mesh of source) {
        const geo = mesh.geometry;
        const { partOfTri, count } = window.splitLooseParts(geo);
        const idx = geo.index;
        const pos = geo.attributes.position;
        const bySub = new Map();
        const sums = new Float64Array(count * 3), tris = new Int32Array(count);
        for (let t = 0; t < partOfTri.length; t++) {
          const p = partOfTri[t];
          const sub = DECK_TEAM_OF[assign[mesh.name + ":" + p]] || "其他";
          let list = bySub.get(sub);
          if (!list) bySub.set(sub, list = []);
          for (let c = 0; c < 3; c++) {
            const v = idx.getX(t * 3 + c);
            list.push(v);
            sums[p * 3] += pos.getX(v); sums[p * 3 + 1] += pos.getY(v); sums[p * 3 + 2] += pos.getZ(v);
          }
          tris[p]++;
        }

        // 每個散件的位移（世界座標算好再轉回網格的區域座標）
        const inv = mesh.matrixWorld.clone().invert();
        const origin = new THREE.Vector3().applyMatrix4(inv);
        const partOff = new Float32Array(count * 3);
        for (let p = 0; p < count; p++) {
          if (!tris[p]) continue;
          const n = tris[p] * 3;
          const c = new THREE.Vector3(sums[p * 3] / n, sums[p * 3 + 1] / n, sums[p * 3 + 2] / n)
            .applyMatrix4(mesh.matrixWorld);
          const raw = assign[mesh.name + ":" + p] || "其他";   // 往上抬的高度依系統分層
          const sub = DECK_TEAM_OF[raw] || "其他";
          const off = new THREE.Vector3(c.x * EXPLODE_SPREAD, c.y * EXPLODE_SPREAD * 0.5 + (EXPLODE_LIFT[raw] ?? 0.2), c.z * EXPLODE_SPREAD);
          (labelCands[sub] ||= []).push({ tris: tris[p], base: c, off: off.clone() });
          off.applyMatrix4(inv).sub(origin);
          partOff[p * 3] = off.x; partOff[p * 3 + 1] = off.y; partOff[p * 3 + 2] = off.z;
        }
        const vOff = new Float32Array(pos.count * 3);
        for (let t = 0; t < partOfTri.length; t++) {
          const p = partOfTri[t];
          for (let c = 0; c < 3; c++) {
            const v = idx.getX(t * 3 + c);
            vOff[v * 3] = partOff[p * 3]; vOff[v * 3 + 1] = partOff[p * 3 + 1]; vOff[v * 3 + 2] = partOff[p * 3 + 2];
          }
        }
        const aExplode = new THREE.BufferAttribute(vOff, 3);

        for (const [sub, indices] of bySub) {
          subsystems.add(sub);
          const g = new THREE.BufferGeometry();
          for (const name of Object.keys(geo.attributes)) g.setAttribute(name, geo.attributes[name]);
          g.setAttribute("aExplode", aExplode);
          g.setIndex(indices);
          const mat = new THREE.MeshPhysicalMaterial({
            color: 0xb8bcc2, metalness: 0.6, roughness: 0.35, clearcoat: 0.4,
            transparent: true, side: THREE.DoubleSide,
          });
          mat.onBeforeCompile = (sh) => {
            sh.uniforms.uExplode = explode;
            sh.vertexShader = "attribute vec3 aExplode;\nuniform float uExplode;\n" +
              sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += aExplode * uExplode;");
          };
          mat.customProgramCacheKey = () => "deck-explode";
          const part = new THREE.Mesh(g, mat);
          part.frustumCulled = false;           // 散開後會超出原本的包圍球
          part.userData = { sub, mix: 0 };      // mix：1＝標亮、-1＝淡出
          mesh.parent.add(part);
        }
        mesh.visible = false;
      }
      // 標籤掛在「夠大的散件裡飛最遠的那個」：尾翼、輪子這種一眼認得出來的零件
      const labelInfo = {};
      for (const [sub, list] of Object.entries(labelCands)) {
        if (sub === "其他") continue;
        const big = Math.max(...list.map(c => c.tris)) * 0.05;
        const pick = list.filter(c => c.tris >= big).reduce((a, b) => (b.off.length() > a.off.length() ? b : a));
        labelInfo[sub] = { base: pick.base, off: pick.off };
      }

      const radius = new THREE.Box3().setFromObject(pivot).getBoundingSphere(new THREE.Sphere()).radius;

      // 每個系統的範圍：鏡頭聚焦時用來決定拉近多少、看哪個高度
      const focus = {};
      pivot.updateMatrixWorld(true);
      pivot.traverse(obj => {
        if (!obj.isMesh) return;
        const box = new THREE.Box3().setFromObject(obj);
        focus[obj.userData.sub] = focus[obj.userData.sub] ? focus[obj.userData.sub].union(box) : box.clone();
      });
      const focusInfo = {};
      for (const [sub, box] of Object.entries(focus)) {
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        focusInfo[sub] = { y: sphere.center.y, radius: sphere.radius };
      }
      return { THREE, pivot, radius, subsystems, focusInfo, explode, labelInfo };
    })();
    deckCarAssets.catch(() => { deckCarAssets = null; });
  }
  return deckCarAssets;
}

// ── 常駐 3D 車（整份簡報共用一個 renderer）──────────────────
// 投影片的 car 欄位決定車在畫面上的位置，切換投影片時鏡頭平滑移過去：
//   x：車身中心的水平位置（0＝最左、1＝最右）
//   w：車可佔用的區域寬度比例，用來決定鏡頭拉多遠
//   focus：標亮的組（DECK_TEAM_OF 的組名）；省略＝整台車
//   y：車身中心的垂直位置（預設 0.5）
//   zoom：>1 拉遠、<1 推近
//   tone："dark" 時底下鋪深色背景（封面／結尾）
//   explode：1＝爆炸圖（進場後散開，離開時組回去）；labels：散開時在各系統上標名稱
//   spin：自轉速度倍率（預設 1）
//   portrait：手機直拿時覆寫上面的值（省略＝置中、依版型放到空白處，見 DECK_PORTRAIT_Y）
// 沒有 car 欄位的投影片，車會淡出並停止繪製。
const DECK_DETAIL_CAR = { x: 0.23, w: 0.46, portrait: { zoom: 0.7 } };   // 組別卡片展開時：左側 46% 區域

// 手機直拿：版面改上下堆疊，車水平置中，垂直放到該版型的空白處
const DECK_PORTRAIT_Y = { cover: 0.3, closing: 0.2, stage: 0.62, split: 0.66, grid: 0.17 };
function deckPortraitPose(pose, layout) {
  return { ...pose, x: 0.5, w: 0.86, y: DECK_PORTRAIT_Y[layout] ?? pose.y, ...pose.portrait };
}

function DeckStageCar({ pose, onStatus }) {
  const canvasRef = React.useRef(null);
  const poseRef = React.useRef(pose);
  const wakeRef = React.useRef(() => {});
  const [ready, setReady] = React.useState(false);
  const [labelSubs, setLabelSubs] = React.useState([]);
  const labelEls = React.useRef({});
  poseRef.current = pose;

  React.useEffect(() => { wakeRef.current(); }, [pose]);

  React.useEffect(() => {
    let dead = false, raf = 0, renderer, ro, envTex, scene, pivotRef;
    onStatus?.("loading");
    loadDeckCar().then(({ THREE, pivot, radius, subsystems, focusInfo, explode, labelInfo }) => {
      if (dead || !canvasRef.current) return;
      const canvas = canvasRef.current;
      pivotRef = pivot;
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      scene = new THREE.Scene();
      import("three/addons/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
        if (dead) return;
        const pmrem = new THREE.PMREMGenerator(renderer);
        envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        pmrem.dispose();
      });
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const sun = new THREE.DirectionalLight(0xffffff, 1.4);
      sun.position.set(4, 8, 5);
      scene.add(sun);
      scene.add(pivot);

      const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 100);
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const viewDir = new THREE.Vector3(0, 0.38, 1).normalize();
      const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      ro = new ResizeObserver(resize);
      ro.observe(canvas);

      const accent = new THREE.Color(
        getComputedStyle(document.documentElement).getPropertyValue("--orange").trim() || "#FF9500");
      const base = new THREE.Color(0xb8bcc2);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      pivot.rotation.y = -0.6;

      const cur = { x: 0.5, vy: 0.5, w: 1, dist: 0, y: 0, e: 0 };   // 目前值（每幀向目標靠近）
      let last = poseRef.current || { x: 0.5, w: 1 };
      let hiddenSince = null;
      let shownAt = 0;
      let snap = true;   // 從隱藏狀態出現時直接跳到定位，不從上一個位置滑過來
      const tmp = new THREE.Vector3();

      const tick = () => {
        const p = poseRef.current;
        const now = performance.now();
        if (p) { last = p; hiddenSince = null; }
        else if (hiddenSince == null) hiddenSince = now;
        if (!p && now - hiddenSince > 800) { raf = 0; snap = true; return; }   // 淡出完就停
        raf = requestAnimationFrame(tick);

        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        const active = last.focus && subsystems.has(last.focus) ? last.focus : null;
        const k  = reduceMotion || snap ? 1 : 1 - Math.pow(0.001, dt);
        const ck = reduceMotion || snap ? 1 : 1 - Math.pow(0.004, dt);
        if (snap) { cur.e = 0; shownAt = now; }   // 出現時先是組好的車，再散開
        snap = false;

        if (!reduceMotion) pivot.rotation.y += dt * 0.35 * (last.spin ?? 1);

        // 爆炸圖：出現 0.5 秒後才散開（先讓觀眾看到完整的車）
        const wantE = p && now - shownAt > 500 ? (last.explode ?? 0) : 0;
        cur.e = reduceMotion ? wantE : cur.e + (wantE - cur.e) * (1 - Math.pow(0.03, dt));
        explode.value = cur.e;

        // 鏡頭：依可用區域的寬高比 fit 到外接球，再用 view offset 把車移到 x
        cur.x += ((last.x ?? 0.5) - cur.x) * ck;
        cur.w += ((last.w ?? 1) - cur.w) * ck;
        cur.vy += ((last.y ?? 0.5) - cur.vy) * ck;
        const halfAngle = Math.min(vHalf, Math.atan(Math.tan(vHalf) * camera.aspect * cur.w));
        const f = active ? focusInfo[active] : null;
        const r = f ? Math.max(f.radius * 1.9, radius * 0.66) : radius;
        const wantDist = (r * 0.88) / Math.sin(halfAngle) * (last.zoom ?? 1);
        cur.dist += (wantDist - cur.dist) * ck;
        cur.y    += ((f ? f.y * 0.75 : 0) - cur.y) * ck;
        camera.position.copy(viewDir).multiplyScalar(cur.dist);
        camera.position.y += cur.y;
        camera.lookAt(0, cur.y, 0);
        const cw = canvas.clientWidth, chh = canvas.clientHeight;
        if (cw && chh) camera.setViewOffset(cw, chh, (0.5 - cur.x) * cw, (0.5 - cur.vy) * chh, cw, chh);

        pivot.traverse(obj => {
          if (!obj.isMesh) return;
          const target = !active ? 0 : obj.userData.sub === active ? 1 : -1;
          obj.userData.mix += (target - obj.userData.mix) * k;
          const m = obj.userData.mix;
          const pulse = reduceMotion ? 0 : 0.12 * (0.5 + 0.5 * Math.sin(t * 3));
          obj.material.color.copy(base).lerp(accent, Math.max(0, m));
          obj.material.emissive.copy(accent).multiplyScalar(Math.max(0, m) * (0.18 + pulse));
          obj.material.opacity = m < 0 ? 1 + m * 0.88 : 1;       // 淡出到 0.12
          obj.material.depthWrite = obj.material.opacity > 0.5;
        });
        renderer.render(scene, camera);

        // 系統標籤：跟著散開的零件走（投影到畫面座標）
        const la = last.labels ? Math.min(1, Math.max(0, (cur.e - 0.6) / 0.3)) : 0;
        const placed = [];
        for (const [sub, info] of Object.entries(labelInfo)) {
          const el = labelEls.current[sub];
          if (!el) continue;
          el.style.opacity = la;
          if (!la) continue;
          tmp.copy(info.off).multiplyScalar(cur.e).add(info.base).applyMatrix4(pivot.matrixWorld).project(camera);
          placed.push({ el, x: (tmp.x + 1) / 2 * cw, y: (1 - tmp.y) / 2 * chh - el.offsetHeight * 0.9,
                        w: el.offsetWidth + 6, h: el.offsetHeight + 4 });
        }
        // 標籤互相重疊時上下推開
        for (let it = 0; it < 4; it++) {
          for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
            const a = placed[i], b = placed[j];
            const ox = (a.w + b.w) / 2 - Math.abs(a.x - b.x), oy = (a.h + b.h) / 2 - Math.abs(a.y - b.y);
            if (ox <= 0 || oy <= 0) continue;
            const push = oy / 2 * (a.y <= b.y ? 1 : -1);
            a.y -= push; b.y += push;
          }
        }
        for (const l of placed) l.el.style.transform = `translate(${l.x}px, ${l.y}px) translate(-50%, -50%)`;
      };
      wakeRef.current = () => {
        if (dead || raf || !poseRef.current) return;
        clock.getDelta();
        raf = requestAnimationFrame(tick);
      };
      wakeRef.current();
      setLabelSubs(Object.keys(labelInfo));
      setReady(true);
      onStatus?.("ready");
    }).catch(err => {
      console.error("[Deck] 3D model load failed:", err);
      if (!dead) onStatus?.("error");
    });

    return () => {
      dead = true;
      wakeRef.current = () => {};
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (scene && pivotRef) scene.remove(pivotRef);
      envTex?.dispose();
      renderer?.dispose();
    };
  }, []);

  const visible = ready && !!pose;
  return (
    <div className="deck-car-layer" aria-hidden="true">
      <div className={`deck-car-backdrop${visible && pose.tone === "dark" ? " is-on" : ""}`}/>
      <canvas ref={canvasRef} className={`deck-car-canvas${visible ? " is-visible" : ""}`}/>
      <div className="deck-car-labels">
        {labelSubs.map(sub => (
          <div key={sub} className="deck-car-label" ref={el => { labelEls.current[sub] = el; }}>{sub}組</div>
        ))}
      </div>
    </div>
  );
}

// 模型裡沒有這個系統的零件時（例如電裝）給一行說明
function DeckCarNote({ kind }) {
  const [missing, setMissing] = React.useState(false);
  React.useEffect(() => {
    let dead = false;
    loadDeckCar().then(({ subsystems }) => { if (!dead) setMissing(!subsystems.has(kind)); })
                 .catch(() => {});
    return () => { dead = true; };
  }, [kind]);
  return missing ? <div className="deck-car-note">模型未含此組零件，顯示整台車</div> : null;
}

// ── 各版型 ──────────────────────────────────────────────

function DeckEyebrow({ children }) {
  return children ? <div className="deck-eyebrow">{children}</div> : null;
}

// 水線原則示意圖：船身剖面，水線以上的洞（綠）補一下就好，水線以下的洞（紅）會沉船。
// 顏色全走 CSS class（themes.css 的 .deck-wl-*），深色模式自動跟隨。
function DeckWaterline({ above, below }) {
  const WL = 150;   // 水線高度
  const label = (y, tone, t) => (
    <g>
      <text x="270" y={y} className={`deck-wl-head deck-wl-head--${tone}`}>{t.head}</text>
      <text x="270" y={y + 26} className="deck-wl-text">{t.text}</text>
    </g>
  );
  return (
    <svg className="deck-wl" viewBox="0 0 480 290" role="img" aria-label={`${above.head}：${above.text}；${below.head}：${below.text}`}>
      <rect x="0" y={WL} width="480" height={290 - WL} className="deck-wl-water"/>
      <line x1="0" y1={WL} x2="480" y2={WL} className="deck-wl-line"/>
      <path d="M30 30 L230 30 L218 140 Q202 252 130 258 Q58 252 42 140 Z" className="deck-wl-hull"/>
      <circle cx="190" cy="88" r="7" className="deck-wl-hole deck-wl-hole--green"/>
      <circle cx="182" cy="212" r="7" className="deck-wl-hole deck-wl-hole--red"/>
      {label(88, "green", above)}
      {label(212, "red", below)}
    </svg>
  );
}

// 沒有 3D 車的組別：有 image 就放圖，沒有或載入失敗就放大圖示
function DeckDetailFigure({ cell }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [cell.image]);
  if (cell.image && !failed) {
    return <img className="deck-detail-figure" src={cell.image} alt="" draggable="false" onError={() => setFailed(true)}/>;
  }
  return <div className="deck-detail-emblem"><SubsystemIcon kind={cell.icon || cell.kind} size={96}/></div>;
}

function DeckSlide({ slide, openCell, onOpenCell, carStatus }) {
  const carCls = slide.car ? " deck-slide--car" : "";
  switch (slide.layout) {
    case "cover":
    case "closing":
      return (
        <div className={`deck-slide deck-slide--photo${carCls}`}>
          <img className="deck-photo" src={slide.image} alt="" draggable="false"/>
          <div className="deck-scrim"/>
          <div className="deck-photo-text">
            <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
            <h1 className={slide.layout === "cover" ? "deck-title-xl" : "deck-title-lg"}>{slide.title}</h1>
            {slide.subtitle && <p className="deck-subtitle">{slide.subtitle}</p>}
            {slide.contacts && (
              <div className="deck-contacts">
                {slide.contacts.map(c => (
                  <div key={c.label} className="deck-contact">
                    <span className="deck-contact-label">{c.label}</span>
                    <span className="deck-contact-value">{c.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    case "stage":
      return (
        <div className={`deck-slide deck-slide--pad deck-stage-slide${carCls}`}>
          <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
          <h2 className="deck-title-lg">{slide.title}</h2>
          {slide.body && <p className="deck-body deck-stage-body">{slide.body}</p>}
        </div>
      );

    case "statement":
      return (
        <div className="deck-slide deck-slide--pad deck-slide--center">
          <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
          <h2 className="deck-title-lg">{slide.title}</h2>
          <p className="deck-body deck-body--wide">{slide.body}</p>
        </div>
      );

    case "columns":
      return (
        <div className="deck-slide deck-slide--pad deck-slide--center">
          <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
          <h2 className="deck-title-md">{slide.title}</h2>
          <div className="deck-columns">
            {slide.columns.map(col => (
              <div key={col.heading} className="deck-card">
                <div className="deck-card-head" style={{ color: `var(--${col.tone})` }}>{col.heading}</div>
                <ul className="deck-bullets">
                  {col.items.map(it => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "grid": {
      const detail = openCell != null ? slide.cells[openCell] : null;
      return (
        <div className={`deck-slide deck-slide--pad${detail ? " deck-slide--detail-open" : ""}`}>
          <div className="deck-grid-head">
            <div>
              <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
              <h2 className="deck-title-md">{slide.title}</h2>
            </div>
            {slide.hint && <div className="deck-grid-hint">{slide.hint}</div>}
          </div>
          <div className="deck-grid">
            {slide.cells.map((cell, i) => (
              <button key={cell.kind} type="button" className="deck-card deck-cell"
                      onClick={() => onOpenCell?.(i)} disabled={!cell.what}>
                <span className="deck-cell-icon"><SubsystemIcon kind={cell.icon || cell.kind} size={28}/></span>
                <div className="deck-card-head">{cell.kind}組</div>
                <div className="deck-cell-text">{cell.text}</div>
              </button>
            ))}
          </div>

          {detail && (
            <div className="deck-detail" role="dialog" aria-label={detail.kind}>
              <button type="button" className="deck-detail-close" onClick={() => onOpenCell?.(null)} aria-label="返回">
                <UIIcon kind="x" size={20}/>
              </button>
              <div className="deck-detail-side">
                {detail.car === false ? (
                  <DeckDetailFigure cell={detail}/>
                ) : (<>
                  {carStatus !== "ready" && (
                    <div className="deck-car-status">{carStatus === "error" ? "3D 模型載入失敗" : "載入 3D 模型…"}</div>
                  )}
                  <DeckCarNote kind={detail.kind}/>
                </>)}
              </div>
              <div className="deck-detail-main">
                <div className="deck-detail-title">
                  <span className="deck-detail-icon"><SubsystemIcon kind={detail.icon || detail.kind} size={40}/></span>
                  <h2 className="deck-title-md">{detail.kind}組</h2>
                </div>
                <div className="deck-detail-label">做什麼</div>
                <p className="deck-body deck-detail-what">{detail.what}</p>
                <div className="deck-detail-label">怎麼做</div>
                <ol className="deck-steps">
                  {detail.how.map((step, j) => (
                    <li key={j}>
                      <span className="deck-list-num">{String(j + 1).padStart(2, "0")}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="deck-detail-pager">
                  {slide.cells.map((c, j) => (
                    <button key={c.kind} type="button"
                            className={`deck-detail-tab${j === openCell ? " is-active" : ""}`}
                            onClick={() => onOpenCell?.(j)}>
                      {c.kind}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    case "split":
      return (
        <div className={`deck-slide deck-split${carCls}`}>
          <div className="deck-split-text">
            <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
            <h2 className="deck-title-md">{slide.title}</h2>
            <p className="deck-body">{slide.body}</p>
          </div>
          <div className="deck-split-media">
            <img src={slide.image} alt="" draggable="false"/>
          </div>
        </div>
      );

    case "list":
      return (
        <div className="deck-slide deck-slide--pad deck-slide--center">
          <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
          <h2 className="deck-title-md">{slide.title}</h2>
          <div className="deck-list">
            {slide.items.map((it, i) => (
              <div key={it.head} className="deck-list-row">
                <span className="deck-list-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="deck-card-head">{it.head}</div>
                  <div className="deck-cell-text">{it.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "flags":
      return (
        <div className="deck-slide deck-slide--pad deck-slide--center">
          <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
          <h2 className="deck-title-md">{slide.title}</h2>
          <div className="deck-columns deck-flags">
            {slide.flags.map(f => (
              <div key={f.head} className="deck-card">
                <div className="deck-card-head deck-lamp-head">
                  <span className="deck-lamp" style={{ "--lamp": `var(--${f.tone})` }} aria-hidden="true"/>{f.head}
                </div>
                <ul className="deck-bullets">
                  {f.items.map(it => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="deck-body deck-flags-foot">{slide.footer}</p>
        </div>
      );

    case "waterline":
      return (
        <div className="deck-slide deck-split">
          <div className="deck-split-text">
            <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
            <h2 className="deck-title-md deck-title--lines">{slide.title}</h2>
            <p className="deck-body">{slide.body}</p>
            <div className="deck-card deck-aside">
              <div className="deck-card-head">{slide.aside.head}</div>
              <div className="deck-cell-text">{slide.aside.text}</div>
            </div>
          </div>
          <div className="deck-split-media deck-wl-media">
            <DeckWaterline above={slide.above} below={slide.below}/>
          </div>
        </div>
      );

    case "flow":
      return (
        <div className="deck-slide deck-slide--pad deck-slide--center">
          <DeckEyebrow>{slide.eyebrow}</DeckEyebrow>
          <h2 className="deck-title-md">{slide.title}</h2>
          <div className="deck-columns deck-flags">
            {slide.paths.map(p => (
              <div key={p.head} className="deck-card">
                <div className="deck-cell-text">{p.when}</div>
                <div className="deck-flow-arrow" aria-hidden="true">↓</div>
                <div className="deck-card-head deck-lamp-head">
                  <span className="deck-lamp" style={{ "--lamp": `var(--${p.tone})` }} aria-hidden="true"/>{p.head}
                </div>
              </div>
            ))}
          </div>
          <div className="deck-flow-facts">
            {slide.facts.map(f => (
              <div key={f.head}>
                <div className="deck-flow-fact-head">{f.head}</div>
                <div className="deck-cell-text">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="deck-slide deck-slide--pad"><h2 className="deck-title-md">{slide.title}</h2></div>;
  }
}

// ── 播放器 ──────────────────────────────────────────────

const portraitQuery = window.matchMedia("(max-width: 768px) and (orientation: portrait)");

function Deck() {
  const total = DECK_SLIDES.length;
  const [index, setIndex] = React.useState(() => {
    try {
      const saved = parseInt(localStorage.getItem("deckIndex"), 10);
      return saved >= 0 && saved < total ? saved : 0;
    } catch { return 0; }
  });
  const [isFull, setIsFull] = React.useState(false);
  const [pseudoFull, setPseudoFull] = React.useState(false);   // 不支援 Fullscreen API（iPhone Safari）時改用 CSS 鋪滿
  const [openCell, setOpenCell] = React.useState(null);   // 格狀投影片展開的卡片
  const [carStatus, setCarStatus] = React.useState("loading");
  const [isPortrait, setIsPortrait] = React.useState(() => portraitQuery.matches);   // 手機直拿：直式排版
  const rootRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const frameRefs = React.useRef([]);
  const touchX = React.useRef(null);

  const go = React.useCallback((i) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
  }, [total]);

  React.useEffect(() => {
    try { localStorage.setItem("deckIndex", String(index)); } catch {}
    setOpenCell(null);
  }, [index]);

  React.useEffect(() => {
    const onChange = () => setIsPortrait(portraitQuery.matches);
    portraitQuery.addEventListener("change", onChange);
    return () => portraitQuery.removeEventListener("change", onChange);
  }, []);

  // 3D 車這一刻該在哪：組別卡片展開時跟著系統走，其他投影片看 car 欄位
  const carPose = React.useMemo(() => {
    const s = DECK_SLIDES[index];
    let pose = s.car || null;
    if (s.layout === "grid") {
      const cell = openCell != null ? s.cells[openCell] : null;
      pose = cell && cell.car !== false ? { ...DECK_DETAIL_CAR, focus: cell.kind } : null;
    }
    return pose && isPortrait ? deckPortraitPose(pose, s.layout) : pose;
  }, [index, openCell, isPortrait]);

  const canFullscreen = typeof document !== "undefined" &&
    !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

  const toggleFullscreen = React.useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!canFullscreen) { setPseudoFull(v => !v); return; }
    const current = document.fullscreenElement || document.webkitFullscreenElement;
    if (current) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
    } else {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {});
    }
  }, [canFullscreen]);

  React.useEffect(() => {
    const onChange = () => setIsFull(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && openCell != null) { e.preventDefault(); setOpenCell(null); return; }
      if (e.key === "Escape" && pseudoFull) { e.preventDefault(); setPseudoFull(false); return; }
      switch (e.key) {
        case "ArrowRight": case "ArrowDown": case "PageDown": case " ":
          e.preventDefault(); setIndex(i => Math.min(total - 1, i + 1)); break;
        case "ArrowLeft": case "ArrowUp": case "PageUp":
          e.preventDefault(); setIndex(i => Math.max(0, i - 1)); break;
        case "Home": e.preventDefault(); setIndex(0); break;
        case "End":  e.preventDefault(); setIndex(total - 1); break;
        case "f": case "F": e.preventDefault(); toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, toggleFullscreen, openCell, pseudoFull]);

  // 手機直拿：整份簡報改成上下捲動，目前這張＝跨過畫面中線的那張
  React.useEffect(() => {
    if (!isPortrait) return;
    const io = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting) setIndex(frameRefs.current.indexOf(en.target));
    }, { root: stageRef.current, rootMargin: "-49% 0px -49% 0px" });
    frameRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [isPortrait]);

  // 直拿時 index 由鍵盤、計數器或讀取進度改變 → 捲到那張（已在畫面中就不動）
  const didScroll = React.useRef(false);
  React.useEffect(() => {
    const stage = stageRef.current, el = frameRefs.current[index];
    if (!isPortrait) { didScroll.current = false; return; }
    if (!stage || !el) return;
    const mid = stage.scrollTop + stage.clientHeight / 2;
    if (mid >= el.offsetTop && mid < el.offsetTop + el.offsetHeight) return;
    stage.scrollTo({ top: el.offsetTop, behavior: didScroll.current ? "smooth" : "instant" });
    didScroll.current = true;
  }, [index, isPortrait]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null || isPortrait) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div ref={rootRef} className={`deck-root${isFull || pseudoFull ? " is-fullscreen" : ""}${pseudoFull ? " is-pseudo-full" : ""}${isPortrait ? " is-portrait" : ""}${carStatus === "ready" ? " is-car-ready" : ""}`}>
      <div className="deck-stage-wrap">
        <div ref={stageRef} className="deck-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
             role="region" aria-roledescription="簡報" aria-label={`第 ${index + 1} 張，共 ${total} 張`}>
          <DeckStageCar pose={carPose} onStatus={setCarStatus}/>
          {DECK_SLIDES.map((s, i) => (
            <div key={i} ref={el => { frameRefs.current[i] = el; }}
                 className={`deck-frame${i === index ? " is-active" : ""}`} aria-hidden={!isPortrait && i !== index}>
              <DeckSlide slide={s}
                         openCell={i === index ? openCell : null}
                         onOpenCell={setOpenCell}
                         carStatus={carStatus}/>
              {isPortrait && i === 0 && (
                <div className="deck-scroll-hint" aria-hidden="true">
                  往下滑<UIIcon kind="chevron-down" size={16} strokeWidth={2}/>
                </div>
              )}
            </div>
          ))}
          <div className="deck-progress">
            <div className="deck-progress-fill"
                 style={{ transform: `scaleX(${(index + 1) / total})` }}/>
          </div>
          <button className="deck-hit deck-hit--prev" aria-label="上一張" onClick={() => go(index - 1)} disabled={index === 0}/>
          <button className="deck-hit deck-hit--next" aria-label="下一張" onClick={() => go(index + 1)} disabled={index === total - 1}/>
        </div>
      </div>


      <div className="deck-controls">
        <button className="deck-ctrl-btn deck-ctrl-btn--prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="上一張">
          <UIIcon kind="chevron-right" size={18} strokeWidth={2}/>
        </button>
        <div className="deck-dots">
          {DECK_SLIDES.map((_, i) => (
            <button key={i} className={`deck-dot${i === index ? " is-active" : ""}`}
                    onClick={() => go(i)} aria-label={`第 ${i + 1} 張`}
                    title={DECK_SLIDES[i].title}/>
          ))}
        </div>
        <span className="deck-counter">{index + 1} / {total}</span>
        <button className="deck-ctrl-btn deck-ctrl-btn--next" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="下一張">
          <UIIcon kind="chevron-right" size={18} strokeWidth={2}/>
        </button>
        <button className="deck-ctrl-btn" onClick={toggleFullscreen} aria-label={isFull || pseudoFull ? "離開全螢幕" : "全螢幕"} title="全螢幕 (F)">
          <UIIcon kind="resize" size={16}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Deck, DECK_SLIDES });
