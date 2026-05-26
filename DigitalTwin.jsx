import React, { useEffect, useMemo, useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Html, ContactShadows, CameraControls, Center } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import * as THREE from 'three';

// ─── Handbook content ─────────────────────────────────────────────────────────
const ENGINEERING_NODES = {
  structure: {
    id: 'structure',
    index: '00',
    label: '序章 // FIRST PRINCIPLES',
    title: '把「車」當成系統',
    cameraPos: [5, 4, 5],
    lookAt: [0, 0.5, 0],
    content: [
      { type: 'lead', text: 'Formula SAE 賽車不是把好零件堆起來就會跑得快。一台好車的本質是子系統之間的協調 — 輪胎、配重、空力、煞車、動力，每一個決策都會牽動其他四個。這本手冊不教你怎麼畫 CAD，而是談背後的物理。' },
      { type: 'p', text: '每個賽季開始前，車隊都應該重新回到第一性原理（First Principles），重新審視每一個過去視為理所當然的設計選擇。過去用的東西不一定錯，但它必須能在今年的目標下被重新證明合理。' },
      { type: 'quote', text: '每一個你不理解的零件，都是還在等著背叛你的零件。', src: 'Carroll Smith, Engineer to Win' },
      { type: 'p', text: '這份手冊按照一個圈速分析的順序展開：先談輪胎能給你多少抓地力，再談車重分配如何決定那些抓地力的利用率，最後才是空力、煞車、動力。順序很重要 — 動力擺最後，因為動力是放大器，不是答案。' },
    ],
  },
  tyre: {
    id: 'tyre',
    index: '01',
    label: '輪胎 // TYRE DYNAMICS',
    title: '輪胎是一切的開始',
    cameraPos: [-3, 1, 2],
    lookAt: [-1.2, 0.3, 1],
    content: [
      { type: 'lead', text: '車手感受到的所有事情 — 轉向、煞車、加速 — 都是輪胎與地面之間摩擦的結果。如果輪胎沒有抓地，剩下的設計都沒有意義。' },
      { type: 'h2', text: '1.1　摩擦圓（Friction Circle）' },
      { type: 'p', text: '每個輪胎能提供的最大力量大略是一個圓。你可以全部拿去煞車，或全部拿去過彎，但你不能同時擁有兩者的最大值。當車手踩煞車進彎，他必須一邊釋放煞車一邊加大轉向，讓總合力始終貼著這個圓的邊緣。' },
      { type: 'formula', expr: '√(Fx² + Fy²) ≤ μ · Fz', where: 'Fx: 縱向力（煞車/加速），Fy: 橫向力（過彎），μ: 摩擦係數，Fz: 垂直負荷' },
      { type: 'h2', text: '1.2　負荷敏感性（Load Sensitivity）' },
      { type: 'p', text: '輪胎的摩擦係數會隨著垂直負荷下降 — 這就是所謂的 load sensitivity。這代表把車重壓在某個輪胎上不會線性地增加抓地力，過大的負荷反而會降低總合抓地力。這也是為什麼防傾桿、避震阻尼、後傾角這些看似細節的設定如此重要。' },
      { type: 'formula', expr: 'Fy = μ · Fz · (1 - k·Fz)', where: 'k: 負荷敏感係數（Hoosier R25B ≈ 0.0015）' },
      { type: 'h2', text: '1.3　工作溫度窗' },
      { type: 'p', text: 'Hoosier R25B 的最佳工作溫度區間在 70–95°C。低於這個窗 tyre 表面像橡皮擦，高於這個窗則開始脫塊。胎壓、camber、合適的暖胎程序都是讓胎溫進入窗口的工具。' },
    ],
  },
  cg: {
    id: 'cg',
    index: '02',
    label: '重心 // CG & MASS',
    title: '把每一克都當成設計決策',
    cameraPos: [4, 2.5, 3],
    lookAt: [0, 0.4, 0],
    content: [
      { type: 'lead', text: '每多 1 kg，每圈損失約 0.02–0.04 秒。聽起來不多，但 FSAE 場地一場可達 22 圈，20 公斤的差距等於將近 1 秒。問題不是「能不能更輕」，而是「哪裡能更輕又不失剛性」。' },
      { type: 'h2', text: '2.1　縱向配重' },
      { type: 'p', text: '前後配重決定了車輛的轉向特性。47:53（前:後）大約是中性偏推；45:55 則開始偏 oversteer。FSAE 場地多為慢速彎，所以後驅車一般偏好稍偏前的配重，以避免後輪在加速出彎時過早觸發 wheelspin。' },
      { type: 'formula', expr: 'Front Wt% = (b / L) × M_total', where: 'b: 後輪到質心的距離；L: 軸距；M_total: 整車重量（含車手）' },
      { type: 'h2', text: '2.2　重心高度' },
      { type: 'p', text: '重心每降 10 mm，過彎時的內外輪負荷轉移會線性下降。降低重心比減重往往更划算 — 因為它同時改善了輪胎的負荷敏感性問題。' },
      { type: 'formula', expr: 'ΔW_lateral = (M · a_y · H_cg) / T', where: 'H_cg: 重心高度，T: 輪距，a_y: 橫向加速度' },
      { type: 'quote', text: '如果你只能改一件事，把重心降低。如果你能改兩件事，再來才是減重。', src: 'Allan Staniforth, Race & Rally Car Source Book' },
    ],
  },
  aero: {
    id: 'aero',
    index: '03',
    label: '空力 // AERODYNAMICS',
    title: '下壓力是免費的負荷',
    cameraPos: [-2, 3, -5],
    lookAt: [0, 0.8, -2],
    content: [
      { type: 'lead', text: '空力下壓力增加輪胎的垂直負荷，但不增加慣性。這在物理上幾乎是作弊。但 FSAE 場地速度低（多在 30–90 km/h），下壓力收益必須對抗額外的重量和阻力。' },
      { type: 'h2', text: '3.1　下壓力的二次曲線' },
      { type: 'p', text: '下壓力與車速平方成正比。換句話說，速度從 40 翻倍到 80 km/h，下壓力是 4 倍。FSAE 直線太短，所以前翼/尾翼設計通常要在 50 km/h 左右就要產生明顯效益，而不是賭最高速時的數字。' },
      { type: 'formula', expr: 'L = ½ · ρ · V² · S · CL', where: 'ρ: 空氣密度 ≈ 1.225 kg/m³，V: 車速，S: 投影面積，CL: 升力係數' },
      { type: 'h2', text: '3.2　L/D 比' },
      { type: 'p', text: '每一公斤下壓力都伴隨阻力。一個好的 FSAE 翼面 L/D 約在 2–3，意思是一公斤下壓力換來 0.4–0.5 公斤阻力。如果 L/D < 1，你只是在浪費引擎馬力。' },
      { type: 'formula', expr: 'L/D = CL / CD', where: '目標 L/D > 2.0，同時 CL > 1.5 at 60 km/h' },
    ],
  },
  brake: {
    id: 'brake',
    index: '04',
    label: '煞車 // BRAKE SYSTEM',
    title: '煞車是動能的轉換器',
    cameraPos: [-2, 0.8, 1.5],
    lookAt: [-1.2, 0.3, 1],
    content: [
      { type: 'lead', text: '煞車不是讓車停下來 — 那是輪胎的工作。煞車是把動能轉成熱能。所以煞車系統設計的核心是熱管理，不是力道。' },
      { type: 'h2', text: '4.1　煞車能量' },
      { type: 'p', text: '從 100 km/h 煞到全停，280 kg 的車總共要消化 108 kJ 的能量，而且通常在 2.5 秒內完成。這些能量幾乎全部變成碟盤的熱，所以選擇對的碟盤材質與通風設計比挑「好的卡鉗」更影響極限。' },
      { type: 'formula', expr: 'ΔKE = ½ · m · (V₁² − V₂²)', where: 'm: 車重 + 車手；V₁: 起始車速，V₂: 終速（m/s）' },
      { type: 'h2', text: '4.2　前後制動配比' },
      { type: 'p', text: '煞車時負荷轉移到前輪，所以前輪可承受的制動力更高 — 通常前後分配約 65:35。FSAE 規則要求前後獨立油路、雙主缸，以便細微調整 bias bar。' },
      { type: 'formula', expr: 'Brake Bias = F_front / (F_front + F_rear)', where: '最佳 bias 隨減速度 g 值動態變化，靜態設定約 62–68%' },
    ],
  },
  power: {
    id: 'power',
    index: '05',
    label: '動力 // POWERTRAIN',
    title: '動力是放大器',
    cameraPos: [2, 1.5, -1],
    lookAt: [0, 0.5, -1],
    content: [
      { type: 'lead', text: '新車手以為馬力決定圈速。實際上，FSAE 引擎都被 20 mm 限流孔限制在 80–85 hp 左右。所以「動力」幾乎是個常數，關鍵在於如何把這 80 匹平順地放上地面。' },
      { type: 'h2', text: '5.1　扭力曲線形狀比峰值馬力重要' },
      { type: 'p', text: 'FSAE 場地多為 40–80 km/h，能讓引擎跑到峰值馬力的機會極少。所以調校的目標是讓 6000–10000 rpm 範圍內扭力曲線平順、寬闊；歧管長度、凸輪正時、進氣腔體積都是這場戰役的工具。' },
      { type: 'formula', expr: 'Tractive Force = (T_e · G_t · G_f · η) / R_w', where: 'G_t: 變速比，G_f: 終傳比，η: 傳動效率 ≈ 0.88，R_w: 輪胎半徑' },
      { type: 'h2', text: '5.2　傳動比策略' },
      { type: 'p', text: '最終減速比決定了你能多早把車掛上 6 檔。對 FSAE 場地，常用策略是 4 檔過彎中、5 檔僅在直線末端，把換檔次數降到最少 — 每一次換檔都是輪胎抓地力中斷的瞬間。' },
      { type: 'quote', text: '我們不是輸在馬力，而是輸在我們從來沒把那些馬力穩定地傳給地面。', src: '2025 NKUST Racing 賽後檢討' },
    ],
  },
  suspension: {
    id: 'suspension',
    index: '06',
    label: '懸吊 // SUSPENSION',
    title: '運動幾何與滾動中心',
    cameraPos: [0, 1, 3],
    lookAt: [0, 0.2, 1.5],
    content: [
      { type: 'lead', text: '懸吊幾何決定了輪胎在側傾與上下跳動時的姿態。目標只有一個：在任何工況下，輪胎 contact patch 都要最大化地接觸地面。' },
      { type: 'h2', text: '6.1　Roll Center' },
      { type: 'p', text: '透過控制 A 臂的節點座標，定義出 Roll Center 與 Camber Gain。Roll Center 越高，車身側傾越小，但側向負荷轉移越劇烈；Roll Center 越低，側傾大但輪胎負荷分配更均勻。兩者之間的取捨是懸吊工程師最核心的決策。' },
      { type: 'formula', expr: 'Roll Moment = M_s · a_y · (H_cg - H_rc)', where: 'M_s: 簧載質量，H_rc: 側傾中心高度，a_y: 橫向加速度' },
      { type: 'h2', text: '6.2　Camber Gain' },
      { type: 'p', text: '車輛過彎側傾時，外側輪胎的 camber 角必須保持接近 0°（或小幅負 camber）才能維持最大 contact patch。A 臂長度比例與安裝角度是控制 camber gain 曲線的主要參數。' },
    ],
  },
  steering: {
    id: 'steering',
    index: '07',
    label: '轉向 // STEERING',
    title: '阿克曼幾何與滑角',
    cameraPos: [0, 1.5, 0.5],
    lookAt: [0, 0.5, 1.5],
    content: [
      { type: 'lead', text: '轉向幾何決定了在不同速度、不同轉向角下，前輪內外側的實際轉向角差。這個設計直接影響輪胎的滑角分佈與轉向手感。' },
      { type: 'h2', text: '7.1　阿克曼幾何（Ackermann）' },
      { type: 'p', text: '理想的阿克曼幾何讓內外側輪胎都能沿著同心圓行駛，無需側滑。實際 FSAE 設計多採用 50–100% 阿克曼，在低速彎道（需要大差速角）與高速彎道（輪胎側向力需要）間取得平衡。' },
      { type: 'formula', expr: 'cot(δo) - cot(δi) = T / L', where: 'δo: 外側轉向角，δi: 內側轉向角，T: 輪距，L: 軸距' },
      { type: 'h2', text: '7.2　轉向力回饋（Caster）' },
      { type: 'p', text: 'Caster 角讓輪胎在轉向時產生自回正力矩，給予車手路面資訊。FSAE 通常設定 4–7° caster，搭配 3–5° king pin inclination，在輕方向盤手感與清晰回饋間找到平衡。' },
    ],
  },
};

const NODE_KEYS = Object.keys(ENGINEERING_NODES);

// ─── Store ────────────────────────────────────────────────────────────────────
const useStore = create((set) => ({
  activeNode: 'structure',
  setActiveNode: (node) => set({ activeNode: node }),
  isExploded: false,
  setExploded: (val) => set({ isExploded: val }),
  panelOpen: true,
  setPanelOpen: (val) => set({ panelOpen: val }),
}));

// ─── Model ────────────────────────────────────────────────────────────────────
function Model({ url, ...props }) {
  const isExploded = useStore((s) => s.isExploded);
  const { scene } = useGLTF(url);

  useMemo(() => {
    if (!scene) return;
    try {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.x -= center.x;
      scene.position.z -= center.z;
      scene.position.y -= box.min.y;
      scene.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;

        if (!child.userData.originalPosition) {
          child.userData.originalPosition = child.position.clone();
        }

        const name = (child.name || '').toLowerCase();

        if (name.includes('node2') || name.includes('node8')) {
          child.material = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.1, roughness: 0.9 });
          child.userData.explodeOffset = name.includes('node2')
            ? new THREE.Vector3(0, -0.3, 0.6)
            : new THREE.Vector3(0, -0.3, -0.6);
        } else if (name.includes('node1')) {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#c0c4c8', metalness: 0.85, roughness: 0.2, clearcoat: 0.5 });
          child.userData.explodeOffset = new THREE.Vector3(0, 0.4, 0);
        } else if (name.includes('node3')) {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#b5b2a8', metalness: 0.85, roughness: 0.25, clearcoat: 0.3 });
          child.userData.explodeOffset = new THREE.Vector3(0, -0.3, 0);
        } else if (name.includes('node4')) {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#888b8e', metalness: 0.75, roughness: 0.4, clearcoat: 0.1 });
          child.userData.explodeOffset = new THREE.Vector3(0, 0, -0.6);
        } else if (name.includes('node5')) {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#d8dadc', metalness: 0.95, roughness: 0.1, clearcoat: 1.0 });
          child.userData.explodeOffset = new THREE.Vector3(0, 0.3, 0.4);
        } else if (name.includes('node6')) {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#989a9c', metalness: 0.7, roughness: 0.5, clearcoat: 0.0 });
          child.userData.explodeOffset = new THREE.Vector3(0, 0.3, -0.4);
        } else if (name.includes('node7')) {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#e0e2e4', metalness: 0.85, roughness: 0.15, clearcoat: 0.8 });
          child.userData.explodeOffset = new THREE.Vector3(0, -0.2, 0.4);
        } else {
          child.material = new THREE.MeshPhysicalMaterial({ color: '#d0d4d9', metalness: 0.8, roughness: 0.25, clearcoat: 0.8 });
          child.userData.explodeOffset = new THREE.Vector3(0, 0, 0);
        }
      });
    } catch (e) { console.error('[Model]', e); }
  }, [scene]);

  useFrame((_, delta) => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh && child.userData.originalPosition && child.userData.explodeOffset) {
        const target = child.userData.originalPosition.clone();
        if (isExploded) target.add(child.userData.explodeOffset);
        child.position.lerp(target, 4 * delta);
      }
    });
  });

  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material?.dispose();
        }
      });
    };
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

useGLTF.preload('/Chassis_add.glb');

// ─── Camera ───────────────────────────────────────────────────────────────────
function CameraRig() {
  const activeNode = useStore((s) => s.activeNode);
  const controlsRef = useRef();

  useEffect(() => {
    const node = ENGINEERING_NODES[activeNode];
    if (node && controlsRef.current) {
      controlsRef.current.setLookAt(...node.cameraPos, ...node.lookAt, true);
    }
  }, [activeNode]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={2}
      maxDistance={12}
      maxPolarAngle={Math.PI / 2 + 0.1}
    />
  );
}

function Loader() {
  return (
    <Html center>
      <div style={{ color: '#b8ff00', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.2em', background: 'rgba(0,0,0,0.8)', padding: '12px 24px', border: '1px solid #b8ff00', whiteSpace: 'nowrap' }}>
        SYSTEM_BOOTING...
      </div>
    </Html>
  );
}

// ─── Content Panel ────────────────────────────────────────────────────────────
function ContentBlock({ block }) {
  const base = { fontFamily: 'system-ui, -apple-system, sans-serif' };

  if (block.type === 'lead') return (
    <p style={{ ...base, fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.85)', marginBottom: 20, fontWeight: 400 }}>
      {block.text}
    </p>
  );

  if (block.type === 'p') return (
    <p style={{ ...base, fontSize: 13.5, lineHeight: 1.85, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>
      {block.text}
    </p>
  );

  if (block.type === 'h2') return (
    <div style={{ marginTop: 28, marginBottom: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#b8ff00', fontFamily: 'monospace', textTransform: 'uppercase' }}>
      {block.text}
    </div>
  );

  if (block.type === 'formula') return (
    <div style={{ margin: '16px 0', padding: '14px 18px', background: 'rgba(255,255,255,0.04)', borderLeft: '2px solid rgba(184,255,0,0.4)', borderRadius: '0 8px 8px 0' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#b8ff00', letterSpacing: '0.01em' }}>
        {block.expr}
      </div>
      {block.where && (
        <div style={{ fontFamily: 'monospace', fontSize: 10, marginTop: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          {block.where}
        </div>
      )}
    </div>
  );

  if (block.type === 'quote') return (
    <blockquote style={{ margin: '20px 0', padding: '16px 20px', background: 'rgba(184,255,0,0.05)', borderLeft: '3px solid #b8ff00', borderRadius: '0 10px 10px 0' }}>
      <p style={{ ...base, fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: block.src ? 8 : 0 }}>
        「{block.text}」
      </p>
      {block.src && (
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
          — {block.src}
        </div>
      )}
    </blockquote>
  );

  return null;
}

function ContentPanel() {
  const activeNode = useStore((s) => s.activeNode);
  const panelOpen = useStore((s) => s.panelOpen);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const node = ENGINEERING_NODES[activeNode];
  const scrollRef = useRef(null);

  // 切換章節時滾回頂端
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeNode]);

  return (
    <>
      {/* 收合按鈕 */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        style={{
          position: 'absolute',
          right: panelOpen ? 384 : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          width: 24,
          height: 56,
          background: 'rgba(20,20,20,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRight: panelOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          borderRadius: panelOpen ? '8px 0 0 8px' : '8px 0 0 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 10,
          transition: 'right 0.35s cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: 'auto',
        }}
        title={panelOpen ? '收合手冊' : '展開手冊'}
      >
        {panelOpen ? '›' : '‹'}
      </button>

      {/* 主面板 */}
      <motion.div
        initial={false}
        animate={{ x: panelOpen ? 0 : 384 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 384,
          background: 'rgba(8,8,10,0.92)',
          backdropFilter: 'blur(24px) saturate(150%)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          zIndex: 20,
        }}
      >
        {/* 面板頂部：章節 label */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode + '-header'}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.18em', color: '#b8ff00', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>
                {node.index} — {node.id.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                {node.title}
              </h1>
              <div style={{ marginTop: 16, height: 1, background: 'linear-gradient(to right, rgba(184,255,0,0.3), transparent)' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 內文捲動區 */}
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode + '-content'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              {node.content.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部翻頁導覽 */}
        <div style={{ flexShrink: 0, padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(() => {
            const idx = NODE_KEYS.indexOf(activeNode);
            const prev = NODE_KEYS[idx - 1];
            const next = NODE_KEYS[idx + 1];
            return (
              <>
                {prev ? (
                  <button onClick={() => useStore.setState({ activeNode: prev })} style={navBtnStyle}>
                    <span style={{ opacity: 0.4, fontSize: 10 }}>‹</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{ENGINEERING_NODES[prev].index}</span>
                  </button>
                ) : <div />}
                <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.2)' }}>
                  {NODE_KEYS.indexOf(activeNode) + 1} / {NODE_KEYS.length}
                </div>
                {next ? (
                  <button onClick={() => useStore.setState({ activeNode: next })} style={navBtnStyle}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{ENGINEERING_NODES[next].index}</span>
                    <span style={{ opacity: 0.4, fontSize: 10 }}>›</span>
                  </button>
                ) : <div />}
              </>
            );
          })()}
        </div>
      </motion.div>
    </>
  );
}

const navBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: '4px 8px', borderRadius: 6,
  transition: 'background 0.15s',
};

// ─── Chapter Nav (左側) ───────────────────────────────────────────────────────
function ChapterNav() {
  const activeNode = useStore((s) => s.activeNode);
  const setActiveNode = useStore((s) => s.setActiveNode);
  const isExploded = useStore((s) => s.isExploded);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 30, pointerEvents: 'auto' }}>
      {/* EXPLODE 按鈕 + 選單觸發 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(8,8,10,0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '8px 14px', cursor: 'pointer', color: '#fff',
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#b8ff00' }}>
            {ENGINEERING_NODES[activeNode].index}
          </span>
          <span style={{ fontFamily: 'system-ui', fontSize: 13, fontWeight: 600 }}>
            {ENGINEERING_NODES[activeNode].title}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: 10, opacity: 0.4, lineHeight: 1 }}
          >▾</motion.span>
        </button>

        <button
          onClick={() => useStore.setState(s => ({ isExploded: !s.isExploded }))}
          style={{
            padding: '8px 12px',
            background: isExploded ? '#b8ff00' : 'rgba(8,8,10,0.85)',
            backdropFilter: 'blur(16px)',
            color: isExploded ? '#000' : '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, cursor: 'pointer',
            fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            transition: 'all 0.2s',
          }}
        >
          {isExploded ? 'ASSEMBLE' : 'EXPLODE'}
        </button>
      </div>

      {/* 下拉選單 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              background: 'rgba(8,8,10,0.92)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
              overflow: 'hidden', minWidth: 260,
            }}
          >
            {NODE_KEYS.map((key, i) => {
              const item = ENGINEERING_NODES[key];
              const isActive = key === activeNode;
              return (
                <button
                  key={key}
                  onClick={() => { setActiveNode(key); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '10px 16px', background: isActive ? 'rgba(184,255,0,0.08)' : 'transparent',
                    border: 'none', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', textAlign: 'left', gap: 12,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: isActive ? '#b8ff00' : 'rgba(255,255,255,0.3)', width: 20 }}>
                    {item.index}
                  </span>
                  <span style={{ fontFamily: 'system-ui', fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#b8ff00' : 'rgba(255,255,255,0.7)' }}>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Right-side node indicator (dots) ────────────────────────────────────────
function NodeDots() {
  const activeNode = useStore((s) => s.activeNode);
  const setActiveNode = useStore((s) => s.setActiveNode);
  return (
    <div style={{ position: 'absolute', right: 400, top: '50%', transform: 'translateY(-50%)', zIndex: 20, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'auto' }}>
      {NODE_KEYS.map(key => {
        const isActive = key === activeNode;
        return (
          <button
            key={key}
            onClick={() => setActiveNode(key)}
            title={ENGINEERING_NODES[key].title}
            style={{
              width: isActive ? 18 : 6, height: 6,
              borderRadius: 99,
              background: isActive ? '#b8ff00' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: isActive ? '0 0 8px #b8ff00' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DigitalTwin() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', overflow: 'hidden', position: 'relative' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 4, 5], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 30]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={<Loader />}>
          <group position={[0, 0.735, 0]}>
            <group rotation={[0, -Math.PI / 2, 0]}>
              <group rotation={[Math.PI / 2, 0, 0]}>
                <Center>
                  <Model url="/Chassis_add.glb" scale={0.001} />
                </Center>
              </group>
            </group>
          </group>
          <Environment preset="city" />
          <ContactShadows position={[0, 0, 0]} opacity={0.7} blur={2} resolution={1024} far={10} />
        </Suspense>
        <gridHelper args={[50, 50, '#1a1a1a', '#0a0a0a']} position={[0, 0, 0]} />
        <CameraRig />
      </Canvas>

      {/* HUD overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        <ChapterNav />
        <NodeDots />
        <ContentPanel />
      </div>
    </div>
  );
}
