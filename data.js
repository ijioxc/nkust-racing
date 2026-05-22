// data.js — mock data, mutable in-memory state via React useState in App

const SUBSYSTEMS = ["車體", "引擎", "懸吊", "煞車", "電裝", "空力", "其他"];

const SUBSYSTEM_COLOR = {
  "車體": "#b83025", "引擎": "#8a6610", "懸吊": "#1c3d5e",
  "煞車": "#2a6b38", "電裝": "#6b21a8", "空力": "#0e7490", "其他": "#444",
};

const INITIAL_TASKS = [
  { id: "t1", subsystem: "車體", title: "底盤主環 TIG 焊接",       progress: 62,  start: 0,  span: 10, owner: "陳偉成", priority: "HIGH", size: "2x2", state: "focus" },
  { id: "t2", subsystem: "懸吊", title: "前 A 臂幾何驗證",         progress: 42,  start: 2,  span: 8,  owner: "王俊宏", priority: "HIGH", size: "2x1", state: "active" },
  { id: "t3", subsystem: "煞車", title: "前/後輪卡鉗安裝",          progress: 88,  start: 6,  span: 5,  owner: "王俊宏", priority: "MID",  size: "2x1", state: "active" },
  { id: "t4", subsystem: "引擎", title: "進排氣管詢價",             progress: 28,  start: 4,  span: 9,  owner: "林彥伯", priority: "MID",  size: "1x1", state: "active" },
  { id: "t5", subsystem: "電裝", title: "ECU 線束打線",             progress: 55,  start: 5,  span: 7,  owner: "李采蓁", priority: "HIGH", size: "1x1", state: "active" },
  { id: "t6", subsystem: "空力", title: "前翼風洞迭代",             progress: 100, start: 0,  span: 7,  owner: "張雅惠", priority: "MID",  size: "1x1", state: "done"   },
  { id: "t7", subsystem: "其他", title: "贊助商簡報",               progress: 33,  start: 7,  span: 4,  owner: "蔡明峻", priority: "LOW",  size: "1x1", state: "active" },
  { id: "t8", subsystem: "車體", title: "側衝撞防護結構驗證",       progress: 100, start: 1,  span: 6,  owner: "陳偉成", priority: "HIGH", size: "2x1", state: "done"   },
];

const INITIAL_PEOPLE = [
  { id: "p1", name: "陳偉成", position: "隊長",   email: "chen.w@gmail.com",   department: "機械系", grade: "大四", workTypes: ["車體", "空力"] },
  { id: "p2", name: "林彥伯", position: "副隊長", email: "lin.yb@gmail.com",   department: "車輛系", grade: "大三", workTypes: ["引擎"] },
  { id: "p3", name: "王俊宏", position: "組長",   email: "wang.jh@gmail.com",  department: "機械系", grade: "大三", workTypes: ["懸吊", "煞車"] },
  { id: "p4", name: "李采蓁", position: "成員",   email: "lee.cz@gmail.com",   department: "電機系", grade: "大二", workTypes: ["電裝"] },
  { id: "p5", name: "張雅惠", position: "成員",   email: "chang.yh@gmail.com", department: "車輛系", grade: "大三", workTypes: ["空力"] },
  { id: "p6", name: "黃志強", position: "成員",   email: "huang.zq@gmail.com", department: "模具系", grade: "大二", workTypes: ["車體"] },
  { id: "p7", name: "蔡明峻", position: "成員",   email: "tsai.mj@gmail.com",  department: "機械系", grade: "大一", workTypes: ["其他"] },
  { id: "p8", name: "周教授", position: "教授",   email: "chou@nkust.edu.tw",  department: "機械系", grade: "教職", workTypes: [] },
];

const INITIAL_PLANS = [
  { id: "pl1", title: "2026 賽季設計提案",        kicker: "DESIGN PROPOSAL · S2026",
    body: "整體車重目標 < 230 kg；前後配重 47:53；新型雙叉臂幾何強化過彎反應。",
    cover: "assets/car-snapshots/untitled.16.jpg", sub: "車體" },
  { id: "pl2", title: "前翼空力策略",              kicker: "AERODYNAMICS · DOWNFORCE",
    body: "雙翼面三段式，CFD 預估 60 km/h 下壓力 28 kg；側板渦流引導冷卻。",
    cover: "assets/car-snapshots/457.jpg", sub: "空力" },
  { id: "pl3", title: "傳動比與檔位策略",          kicker: "POWERTRAIN · GEARING",
    body: "目標彎中 4 檔；末端速 105 km/h。沿用 Yamaha YZF-R6 引擎本體 + 17/40 終傳。",
    cover: "assets/car-snapshots/cgdykj.jpg", sub: "引擎" },
  { id: "pl4", title: "煞車冷卻管道",              kicker: "BRAKE COOLING DUCT",
    body: "三方向風道導流，碟盤工作溫度 350–500 °C；卡鉗熱浸試驗已通過。",
    cover: "assets/car-snapshots/untitled.17.jpg", sub: "煞車" },
  { id: "pl5", title: "ECU 與資料擷取拓樸",        kicker: "ELECTRICAL · DATA",
    body: "MoTeC M150 + CAN bus 干線拓樸，IMU + 4×輪速 + 油壓 + 水溫等 18 通道。",
    cover: "assets/car-snapshots/6UegT.jpg", sub: "電裝" },
  { id: "pl6", title: "JSAE 規則對齊清單",         kicker: "RACE · COMPLIANCE",
    body: "scrutineering 對應條目共 84 項；目前 76 項通過，8 項施工中。",
    cover: null, sub: "其他" },
];

// ─── Supplier / parts (Kanban) ─────────────────────────────
const INITIAL_SUPPLIERS = [
  { id: "s1",  cat: "輪圈",   sub: "車體", name: "OZ Racing FS Wheels",   price: "€420 / set",     priority: "HIGH", origin: "Italy",  status: "已下單" },
  { id: "s2",  cat: "輪圈",   sub: "車體", name: 'Keizer Aluminum 10"',   price: "$890 / set",     priority: "HIGH", origin: "USA",    status: "詢價" },
  { id: "s3",  cat: "輪圈",   sub: "車體", name: "Enkei SF-01",            price: "¥38,000 / set",  priority: "MID",  origin: "Japan",  status: "比較中" },
  { id: "s4",  cat: "輪胎",   sub: "車體", name: "Hoosier FSAE 20×7.5",   price: "$245 / unit",    priority: "HIGH", origin: "USA",    status: "已下單" },
  { id: "s5",  cat: "輪胎",   sub: "車體", name: "GY Racing FSAE",         price: "AU$220",         priority: "MID",  origin: "AUS",    status: "備案" },
  { id: "s6",  cat: "煞車",   sub: "煞車", name: "Wilwood PS-1 Caliper",  price: "$169",           priority: "HIGH", origin: "USA",    status: "已收到" },
  { id: "s7",  cat: "煞車",   sub: "煞車", name: "Tilton Master Cyl.",     price: "$240",           priority: "MID",  origin: "USA",    status: "詢價" },
  { id: "s8",  cat: "煞車",   sub: "煞車", name: "Hawk DTC-60 Pad",        price: "$180",           priority: "MID",  origin: "USA",    status: "比較中" },
  { id: "s9",  cat: "煞車",   sub: "煞車", name: "DOT 5.1 Fluid",          price: "$32",            priority: "LOW",  origin: "USA",    status: "已收到" },
  { id: "s10", cat: "引擎",   sub: "引擎", name: "Yoshimura R-77 Exhaust",price: "$1,290",         priority: "HIGH", origin: "Japan",  status: "詢價" },
  { id: "s11", cat: "引擎",   sub: "引擎", name: "K&N Filter",             price: "$78",            priority: "LOW",  origin: "USA",    status: "已收到" },
  { id: "s12", cat: "電裝",   sub: "電裝", name: "MoTeC M150 ECU",         price: "$5,200",         priority: "HIGH", origin: "AUS",    status: "贊助申請" },
  { id: "s13", cat: "電裝",   sub: "電裝", name: "AEM CD-5 Dash",          price: "$995",           priority: "MID",  origin: "USA",    status: "比較中" },
  { id: "s14", cat: "其他",   sub: "其他", name: "OMP HTE-R Seat",         price: "€790",           priority: "MID",  origin: "Italy",  status: "已下單" },
  { id: "s15", cat: "其他",   sub: "其他", name: "Sparco 6pt Harness",     price: "€280",           priority: "MID",  origin: "Italy",  status: "詢價" },
];

// ─── Resource library (races / tools / learning) ──────────
const INITIAL_RESOURCES = [
  // Races
  { id: "r1", group: "races",    name: "Formula SAE Taiwan 2026",      org: "FSAE-TW",   note: "報名截止 W-3 · 文件 §T.4 同步更新",        priority: "HIGH", date: "2026-08-15", url: "https://fstaiwan.net" },
  { id: "r2", group: "races",    name: "JSAE Formula Japan ICV",       org: "JSAE",      note: "ICV 組別 · 大會官方文件 + 場地圖",         priority: "HIGH", date: "2026-09-04", url: "https://jsae.or.jp/formula" },
  { id: "r3", group: "races",    name: "FSAE Online 官方文件",         org: "SAE Intl",  note: "規則書 · scrutineering checklist · 表單",   priority: "HIGH", date: "全年", url: "https://www.fsaeonline.com" },
  { id: "r4", group: "races",    name: "FSAE Taiwan SES Document Review", org: "FSAE-TW", note: "煞車系統認證文件範本",                     priority: "MID", date: "2026-06-20", url: "" },
  // Tools
  { id: "t1", group: "tools",    name: "Realis Simulation 學術贊助申請", org: "Realis",  note: "CFD + 結構模擬軟體 · 一次申請可用一年",   priority: "MID",  date: "申請中", url: "" },
  { id: "t2", group: "tools",    name: "Altair 技術贊助",              org: "Altair",    note: "HyperWorks + OptiStruct · 學生車隊計畫",    priority: "MID",  date: "已通過", url: "" },
  { id: "t3", group: "tools",    name: "ANSYS 學生車隊計畫",           org: "ANSYS",     note: "Mechanical + Fluent · 一年使用權",           priority: "MID",  date: "已通過", url: "" },
  { id: "t4", group: "tools",    name: "MathWorks Formula SAE 支援",   org: "MathWorks", note: "MATLAB + Simulink · 學生車隊免費",          priority: "MID",  date: "已通過", url: "" },
  { id: "t5", group: "tools",    name: "Onshape 教育版",                org: "Onshape",   note: "雲端 CAD · 多人協作",                       priority: "LOW",  date: "已通過", url: "" },
  // Learning
  { id: "l1", group: "learning", name: "JSAE Formula 2025 數位手冊",     org: "JSAE",    note: "賽事總集 · 各校設計報告精華",               priority: "HIGH", date: "PDF",  url: "" },
  { id: "l2", group: "learning", name: "Learn And Compete — FSAE Primer", org: "Wakeman", note: "新手必讀 · 從零開始的車輛動力學",       priority: "HIGH", date: "Book", url: "" },
  { id: "l3", group: "learning", name: "Race Car Design (Derek Seward)",  org: "Seward",  note: "剛體與懸吊幾何的標準教科書",               priority: "HIGH", date: "Book", url: "" },
  { id: "l4", group: "learning", name: "FSAE TO WIN — Technical Library", org: "FSAE",    note: "歷年技術論文 · 賽後分析",                   priority: "HIGH", date: "Web",  url: "" },
  { id: "l5", group: "learning", name: "FSAE 概念與客觀設計 (Design Judges)", org: "—",   note: "Design Event 評審角度 · 簡報範本",          priority: "HIGH", date: "PDF",  url: "" },
  { id: "l6", group: "learning", name: "Tune To Win (Carroll Smith)",     org: "Smith",   note: "經典車輛設定哲學 · 不過時",                 priority: "MID", date: "Book", url: "" },
];

const SUPPLIER_CATEGORIES = ["輪圈", "輪胎", "煞車", "引擎", "電裝", "其他"];

const STATUS_TONES = {
  "詢價":     { bg: "rgba(0,0,0,0.04)",       fg: "var(--faint)",  label: "詢價" },
  "比較中":   { bg: "var(--status-mid-bg)",   fg: "var(--status-mid-fg)",  label: "比較中" },
  "已下單":   { bg: "var(--status-high-bg)",  fg: "var(--status-high-fg)", label: "已下單" },
  "已收到":   { bg: "rgba(42,107,56,0.10)",   fg: "#2a6b38",       label: "已收到" },
  "贊助申請": { bg: "rgba(107,33,168,0.10)",  fg: "#6b21a8",       label: "贊助申請" },
  "備案":     { bg: "rgba(0,0,0,0.04)",       fg: "var(--muted)",  label: "備案" },
};

// Blueprint multi-view + extensible parts
const BLUEPRINT_VIEWS = [
  { id: "iso",   label: "ISO 立體",  short: "ISO",   image: "assets/car-snapshots/view_iso.png" },
  { id: "side",  label: "側視",      short: "SIDE",  image: "assets/car-snapshots/view_side.png" },
  { id: "front", label: "前視",      short: "FRONT", image: "assets/car-snapshots/view_front.png" },
  { id: "rear",  label: "後視",      short: "REAR",  image: "assets/car-snapshots/view_rear.png" },
  { id: "top",   label: "俯視",      short: "TOP",   image: "assets/car-snapshots/view_top.png" },
];

// Blueprint parts — extensible schema for future Claude Code work
const BLUEPRINT_PARTS = [
  // ISO view
  { id: "bp1",  viewId: "iso",   x: 50, y: 32, label: "主環",       sub: "車體",
    material: "1018 鋼管 Ø25.4 × 2.4 mm", weight: "2.46 kg", regulation: "FSAE 2026 §T.4",
    revision: "r3 · 2026-04-12", owner: "陳偉成", supplier: "在地鋼鐵",
    note: "主環為車手頭部保護的主要結構，TIG 焊接後 X-ray 探傷檢測。" },
  { id: "bp2",  viewId: "iso",   x: 26, y: 56, label: "前避震",     sub: "懸吊",
    material: "Öhlins TTX-25 · 三段可調", weight: "1.20 kg", regulation: "FSAE §T.7",
    revision: "r2", owner: "王俊宏", supplier: "Öhlins",
    note: "三段式可調避震器；scrutineering 前須做游隙檢查。" },
  { id: "bp3",  viewId: "iso",   x: 78, y: 60, label: "後輪總成",   sub: "懸吊",
    material: "OZ FS Wheel 10\" + Hoosier 20×7.5", weight: "6.40 kg", regulation: "FSAE §T.6",
    revision: "r1", owner: "王俊宏", supplier: "OZ / Hoosier",
    note: "輪胎工作溫度區間 70–95°C，胎壓 0.85 bar。" },
  { id: "bp4",  viewId: "iso",   x: 64, y: 70, label: "進氣歧管",   sub: "引擎",
    material: "Yamaha YZF-R6 + 20mm 限流孔", weight: "3.10 kg", regulation: "FSAE §IC.1.6",
    revision: "r4", owner: "林彥伯", supplier: "自製 + Yoshimura",
    note: "進氣須通過 20 mm 限流孔；歧管長度依共振頻率調整。" },
  { id: "bp5",  viewId: "iso",   x: 40, y: 70, label: "電池盒",     sub: "電裝",
    material: "12V 5Ah LiFePO4 · 軌道固定", weight: "0.95 kg", regulation: "FSAE §EV.4.7.3",
    revision: "r2", owner: "李采蓁", supplier: "Headway",
    note: "正極端子防誤觸護套，獨立保險絲盒。" },
  { id: "bp6",  viewId: "iso",   x: 86, y: 78, label: "煞車卡鉗",   sub: "煞車",
    material: "Wilwood PS-1 · 鋁合金", weight: "0.45 kg", regulation: "FSAE §T.5",
    revision: "r1", owner: "王俊宏", supplier: "Wilwood",
    note: "前後分離油路，scrutineering 須證明四輪同時鎖死。" },
  // Rear view
  { id: "bp7",  viewId: "rear",  x: 50, y: 18, label: "尾翼主翼",   sub: "空力",
    material: "碳纖維 + 鋁芯", weight: "1.80 kg", regulation: "FSAE §T.9.2",
    revision: "r2", owner: "張雅惠", supplier: "自製",
    note: "三段式可調尾翼，攻角 15–32°；CFD 預估 60 km/h 下壓力 12 kg。" },
  { id: "bp8",  viewId: "rear",  x: 50, y: 60, label: "差速器殼",   sub: "引擎",
    material: "鋁合金 6061-T6 CNC", weight: "2.10 kg", regulation: "—",
    revision: "r3", owner: "林彥伯", supplier: "自製",
    note: "Drexler LSD 差速器，預載扭矩 60–80 Nm。" },
  // Side view
  { id: "bp9",  viewId: "side",  x: 28, y: 50, label: "前翼",       sub: "空力",
    material: "碳纖維", weight: "1.40 kg", regulation: "FSAE §T.9.3",
    revision: "r3", owner: "張雅惠", supplier: "自製",
    note: "雙翼面，CFD 預估 50 km/h 下壓力 8 kg。" },
  { id: "bp10", viewId: "side",  x: 72, y: 42, label: "側板",       sub: "空力",
    material: "碳纖維 + 玻纖", weight: "0.90 kg", regulation: "FSAE §T.9.4",
    revision: "r1", owner: "張雅惠", supplier: "自製",
    note: "側板渦流引導散熱器氣流。" },
  // Front view
  { id: "bp11", viewId: "front", x: 50, y: 55, label: "鼻錐",       sub: "車體",
    material: "玻纖殼 + 蜂巢芯", weight: "1.10 kg", regulation: "FSAE §T.4.6 Impact Attenuator",
    revision: "r2", owner: "陳偉成", supplier: "自製",
    note: "撞擊吸能器；通過 FSAE 跌落測試。" },
  // Top view
  { id: "bp12", viewId: "top",   x: 50, y: 48, label: "車手座艙",   sub: "車體",
    material: "OMP HTE-R 桶椅 + 6 點安全帶", weight: "4.20 kg", regulation: "FSAE §T.3 Cockpit",
    revision: "r1", owner: "陳偉成", supplier: "OMP / Sparco",
    note: "座艙開口須通過 template 測試。" },
];

// Make these globals for child scripts
Object.assign(window, {
  SUBSYSTEMS, SUBSYSTEM_COLOR, SUPPLIER_CATEGORIES, STATUS_TONES,
  INITIAL_TASKS, INITIAL_PEOPLE, INITIAL_PLANS,
  INITIAL_SUPPLIERS, INITIAL_RESOURCES,
  BLUEPRINT_VIEWS, BLUEPRINT_PARTS,
});
