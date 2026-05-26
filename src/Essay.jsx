// Essay.jsx — Bento Grid + 固定 3D 賽車 + Scroll-driven 章節
// Three.js 透過 importmap 動態載入（不依賴 npm bundle）

// ─── Spinner keyframe & Premium Bento styles（注入一次） ─────────────────────────────
;(function injectStyles() {
  if (document.getElementById("essay-styles")) return;
  const s = document.createElement("style");
  s.id = "essay-styles";
  s.textContent = `
    @keyframes essay-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes essay-fadein {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .essay-spin-ring {
      width: 36px; height: 36px; border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.06);
      border-top-color: var(--orange, #e05a1a);
      animation: essay-spin 0.9s linear infinite;
    }
    [data-essay] .bcard {
      animation: essay-fadein 0.45s cubic-bezier(0.4,0,0.2,1) both;
    }

    /* ── Bento card reset: no bg, no border, layout only ── */
    .bcard {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      transition: opacity 0.25s ease !important;
    }

    /* accent card: orange left-bar only */
    .bcard-accent {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding-left: 16px !important;
      border-left: 2px solid var(--orange, #e05a1a) !important;
    }

    .bcard-glass,
    .bcard-dark {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .bento-column {
      background: rgba(18, 18, 22, 0.5) !important;
      backdrop-filter: blur(24px) saturate(150%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.06) !important;
    }
    .bento-column label, .bento-column figcaption, .bento-column .eyebrow {
      color: var(--label-tertiary) !important;
    }
    .bento-column input[type="range"] {
      background: var(--fill-secondary) !important;
    }
    @media (min-width: 900px) {
      .hud-telemetry-metrics { display: flex !important; }
    }
  `;
  document.head.appendChild(s);
})();

// ─── Main component ───────────────────────────────────────────
function Essay() {
  const canvasRef   = React.useRef(null);
  const sceneRef    = React.useRef(null);   // { THREE, camera, controls, renderer, nodes, origPos, camTarget, nodeTargets }
  const [activeId,  setActiveId]  = React.useState("intro");
  const [loaded,    setLoaded]    = React.useState(false);
  const [camTag,    setCamTag]    = React.useState("");

  // ── Snap Debugger State ──────────────────────────────────
  // Removed snap config since we are using fullpage scroll now
  

  // ── Chapter metadata ───────────────────────────────────────
  const CHAPTERS = [
    { id: "intro",  num: "00", label: "序章"            },
    { id: "tire",   num: "01", label: "輪胎是一切的開始" },
    { id: "weight", num: "02", label: "重量分配"         },
    { id: "aero",   num: "03", label: "空氣力學"         },
    { id: "brake",  num: "04", label: "煞車能量"         },
    { id: "power",  num: "05", label: "動力與圈速"       },
  ];

  // ── Camera presets (Customized by User) ──
  const CAM = {
    intro:  { pos: [-3.80, 1.88, 5.05],  at: [0.09, 0.88, 1.25],  tag: "CHASSIS OVERVIEW // 3D" },
    tire:   { pos: [-0.80, 6.91, 0.49],  at: [-0.82, 0.10, 0.58], tag: "FRONT WHEEL ASSEMBLY // 01" },
    weight: { pos: [6.65, 0.74, 0.80],   at: [0.12, 0.86, -0.66], tag: "WEIGHT SIDE PROFILE // 02" },
    aero:   { pos: [-1.84, 1.95, 5.56],  at: [0.47, 0.66, 0.46],  tag: "FRONT AERO DOWNFORCE // 03" },
    brake:  { pos: [-2.11, 1.08, -2.40], at: [0.60, 0.30, -0.40], tag: "ROTOR THERMAL MANAGEMENT // 04" },
    power:  { pos: [1.00, 1.88, -2.61],  at: [-0.81, 0.26, -0.16], tag: "POWERTRAIN DRIVE SYSTEM // 05" },
  };

  // ── Per-chapter animations (X-Ray & Cinematic) ───────────────
  const CHAPTER_ANIMATIONS = {
    intro:  { active: [],                xray: [] },
    tire:   { active: ["Node2","Node8"], xray: ["Node1","Node3","Node4","Node5","Node6","Node7"] },
    weight: { active: [],                xray: ["Node1","Node2","Node8"] }, // Make body X-ray to show weight distribution center conceptually
    aero:   { active: ["Node1"],         xray: ["Node2","Node3","Node4","Node5","Node6","Node7","Node8"] },
    brake:  { active: ["Node3","Node4"], xray: ["Node1","Node2","Node5","Node6","Node7","Node8"] },
    power:  { active: ["Node5","Node6"], xray: ["Node1","Node2","Node3","Node4","Node7","Node8"] },
  };
  // ── Three.js init ──────────────────────────────────────────
  React.useEffect(() => {
    let dead = false;
    let raf;
    let cleanupRO;

    (async () => {
      const THREE             = await import("three");
      const { GLTFLoader }    = await import("three/addons/loaders/GLTFLoader.js");
      const { DRACOLoader }   = await import("three/addons/loaders/DRACOLoader.js");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      if (dead) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = canvas.clientWidth  || 600;
      const H = canvas.clientHeight || 600;

      // ── Renderer ──────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type    = THREE.PCFShadowMap;
      renderer.toneMapping       = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      // ── Scene & Environment ────────────────────────────────
      const scene = new THREE.Scene();
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

      // ── Camera ─────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.05, 300);
      camera.position.set(3.5, 2.0, 4.0);

      // ── Lights ─────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));

      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(6, 10, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.setScalar(1024);
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far  = 30;
      sun.shadow.camera.left = sun.shadow.camera.bottom = -5;
      sun.shadow.camera.right = sun.shadow.camera.top   = 5;
      scene.add(sun);

      const fill = new THREE.DirectionalLight(0xd0e8ff, 0.3);
      fill.position.set(-5, 3, -4);
      scene.add(fill);

      // Ground and reflection ring removed for a fully floating transparent aesthetic

      // ── OrbitControls ──────────────────────────────────────
      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0.5, 0);
      controls.enableDamping  = false; // 關閉阻尼，避免與手動運鏡 (lerp) 衝突與瞬間回彈
      controls.enableZoom     = true;
      controls.zoomSpeed      = 0.5;
      controls.minDistance    = 1.5;
      controls.maxDistance    = 14;
      controls.maxPolarAngle  = Math.PI * 0.88;

      // ── Camera animation targets ────────────────────────────
      const camTarget = {
        pos:    new THREE.Vector3(3.5, 2.0, 4.0),
        lookAt: new THREE.Vector3(0, 0.5, 0),
      };

      // ── Debug helper ─────────────────────────────────────────
      // 把相機狀態綁定到全域變數，方便你在 Console 隨時印出座標
      window.getCam = () => {
        const p = camera.position;
        const t = controls.target;
        console.log(`pos: [${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}], at: [${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)}]`);
      };

      // ── Store in ref before GLB load so animation loop can start ──
      sceneRef.current = {
        THREE, camera, controls, renderer, scene,
        camTarget, nodeTargets: {}, nodes: {}, origPos: {},
        loaded: false,
      };

      // ── GLB Load ───────────────────────────────────────────
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        "public/models/chassis-ready.glb",
        (gltf) => {
          if (dead) return;
          const root = gltf.scene;

          // 自動縮放，確保最大邊長約為 3.5 單位
          const rawBox = new THREE.Box3().setFromObject(root);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);
          const scale = 3.5 / maxDim;
          root.scale.setScalar(scale);

          // 套用旋轉（Blender 匯出 Y-up 已正確，僅微調朝向）
          root.rotation.y = Math.PI; // 車頭朝向正面

          // 套用旋轉後重新計算 bounding box 並置中
          root.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(root);
          const center = box.getCenter(new THREE.Vector3());
          root.position.x -= center.x;
          root.position.z -= center.z;
          root.position.y -= box.min.y; // 車底貼地

          scene.add(root);

          // Collect meshes + apply premium materials from Digital Twin
          const nodes   = {};
          const origPos = {};

          root.traverse((child) => {
            if (!child.isMesh) return;
            

            const n = child.name;
            
            // 向上追溯父節點，判斷是否屬於任何 Node 節點
            let belongsToNode = null;
            let curr = child;
            while (curr && curr !== root) {
              if (curr.name && curr.name.toLowerCase().includes('node')) {
                belongsToNode = curr.name;
                break;
              }
              curr = curr.parent;
            }

            if (belongsToNode) {
              nodes[n] = child;
              child.userData.belongsToNode = belongsToNode;
              origPos[n] = child.position.clone();
            }

            // 使用高質感金屬烤漆，不使用半透明（因模型 Node 切割隨機）
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xc0c4c8, 
              metalness: 0.85, 
              roughness: 0.2, 
              clearcoat: 0.5,
              side: THREE.DoubleSide
            });

            child.castShadow    = true;
            child.receiveShadow = true;
          });

          Object.assign(sceneRef.current, { nodes, origPos, loaded: true });
          if (!dead) setLoaded(true);
        },
        undefined,
        (err) => console.error("[Essay] GLB load failed:", err)
      );

      // ── Resize observer ────────────────────────────────────
      const ro = new ResizeObserver(() => {
        if (dead || !canvas) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(canvas);
      cleanupRO = () => ro.disconnect();

      // ── Render loop ────────────────────────────────────────
      const clock = new THREE.Clock();
      function tick() {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.05);

        const s = sceneRef.current;
        if (s && s.nodes && Object.keys(s.nodes).length) {
          
          // ── 彈簧物理運鏡 (Spring-like Camera Interpolation) ──
          if (s.isAnimatingCamera) {
            controls.enabled = false; // 正在自動運鏡：關閉控制
            
            const tCam = s.camTarget.pos;
            const tAt  = s.camTarget.lookAt;
            const cPos = camera.position;
            
            // 使用更具彈性與阻尼感的平滑過渡
            // dt 通常約為 0.016 (60fps)，我們用 dt 算一個平滑的速率
            const springK = 3.5;
            cPos.lerp(tCam, springK * dt);
            
            const currentLookAt = controls.target.clone();
            currentLookAt.lerp(tAt, springK * dt);
            controls.target.copy(currentLookAt);
  
            const distPos = cPos.distanceTo(tCam);
            const distAt  = currentLookAt.distanceTo(tAt);
  
            if (distPos < 0.01 && distAt < 0.01) {
              s.isAnimatingCamera = false;
            }
            controls.update();
          } else {
            // 運鏡結束：讓使用者自由操作
            controls.enabled = true;
            controls.update();
          }
          
          camera.updateProjectionMatrix();

          // ── 材質與隱藏平滑過渡 (Visibility & Glow Lerp) ──
          Object.entries(s.nodes).forEach(([name, mesh]) => {
            const t = s.nodeTargets[name];
            if (!t) return;

            const mat = mesh.material;
            const ek = 0.08;

            // Emissive glow
            mat.emissive.r += (t.emissive[0] - mat.emissive.r) * ek;
            mat.emissive.g += (t.emissive[1] - mat.emissive.g) * ek;
            mat.emissive.b += (t.emissive[2] - mat.emissive.b) * ek;

            if (t.pulse) {
              mat.emissiveIntensity = 0.8 + 0.4 * Math.sin(Date.now() * 0.003);
            } else {
              mat.emissiveIntensity += (1.0 - mat.emissiveIntensity) * ek;
            }

            // 針對「動力」章節，處理 scale 動畫來隱藏物件（避免突然消失）
            mesh.scale.lerp(new THREE.Vector3().setScalar(t.scale), 0.1);
          });
        }

        renderer.render(scene, camera);
      }
      tick();
    })();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      cleanupRO?.();
      const s = sceneRef.current;
      if (s?.renderer) s.renderer.dispose();
    };
  }, []);

  // ── Apply chapter state to 3D ──────────────────────────────
  React.useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;

    const c  = CAM[activeId]    || CAM.intro;
    const anim = CHAPTER_ANIMATIONS[activeId] || CHAPTER_ANIMATIONS.intro;

    s.camTarget.pos.set(...c.pos);
    s.camTarget.lookAt.set(...c.at);
    s.isAnimatingCamera = true;
    setCamTag(c.tag);

    // 運鏡期間隱藏除錯 HUD
    const hud = document.getElementById("essay-camera-hud");
    if (hud) hud.style.display = "none";

    // Update node targets only if nodes are loaded
    if (!s.nodes || !Object.keys(s.nodes).length) return;

    Object.keys(s.nodes).forEach(name => {
      const mesh = s.nodes[name];
      const belongsTo = mesh.userData.belongsToNode || name;
      const isActive = anim.active.some(a => belongsTo.toLowerCase().includes(a.toLowerCase()));

      if (isActive) {
        // 重點展示區：科技藍光
        s.nodeTargets[name] = {
          emissive: [0.08, 0.25, 0.75],
          pulse: true,
          scale: 1.0,
        };
      } else {
        // 預設狀態
        s.nodeTargets[name] = {
          emissive: [0, 0, 0],
          pulse: false,
          scale: 1.0,
        };
      }
    });
  }, [activeId, loaded]);

  // ── Fullpage Scroll Logic ──────────────────────────────────
  React.useEffect(() => {
    // 鎖死原生的全域滾動
    document.body.style.overflow = "hidden";
    
    let isThrottled = false;
    let touchStartY = 0;

    const navigate = (direction) => {
      if (isThrottled || direction === 0) return;
      
      setActiveId(prev => {
        const idx = CHAPTERS.findIndex(c => c.id === prev);
        let nextIdx = idx + direction;
        
        if (nextIdx < 0 || nextIdx >= CHAPTERS.length) return prev;
        
        isThrottled = true;
        // 鎖定 1.2 秒（與 3D 運鏡時間一致），這段時間內禁止連續翻頁
        setTimeout(() => isThrottled = false, 1200); 
        
        return CHAPTERS[nextIdx].id;
      });
    };

    const handleWheel = (e) => {
      // 智慧滾動判斷：如果游標停留在文案區塊，且內容可以滾動，就優先讓內容滾動
      const section = e.target.closest('section');
      if (section) {
        const atBottom = Math.ceil(section.scrollTop + section.clientHeight) >= section.scrollHeight - 2;
        const atTop = section.scrollTop <= 0;

        if (e.deltaY > 0 && !atBottom) {
          return; // 內容還沒到底，放行原生往下滾動
        }
        if (e.deltaY < 0 && !atTop) {
          return; // 內容還沒到頂，放行原生往上滾動
        }
      }

      e.preventDefault();
      navigate(Math.sign(e.deltaY));
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const section = e.target.closest('section');
      const deltaY = touchStartY - e.touches[0].clientY;

      if (section) {
        const atBottom = Math.ceil(section.scrollTop + section.clientHeight) >= section.scrollHeight - 2;
        const atTop = section.scrollTop <= 0;

        if (deltaY > 0 && !atBottom) return; // 往下滑動查看內容
        if (deltaY < 0 && !atTop) return;    // 往上滑動查看內容
      }

      e.preventDefault();
      if (Math.abs(deltaY) > 40) { // swipe 閥值
        navigate(Math.sign(deltaY));
      }
    };

    // passive: false 是為了能使用 e.preventDefault() 阻止預設滾動
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const idx = CHAPTERS.findIndex(c => c.id === activeId);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{
      display:               "grid",
      gridTemplateColumns:   "45% 55%",
      gridTemplateRows:      "1fr",
      minHeight:             "calc(100vh - var(--hdr-total-h, 52px))",
      margin:                "-32px -40px -80px",
      alignItems:            "start",
      position:              "relative",
    }}>

      {/* ════════════ LEFT: sticky 3D panel ════════════ */}
      <div style={{
        position:   "sticky",
        top:        "var(--hdr-total-h, 52px)",
        height:     "calc(100vh - var(--hdr-total-h, 52px))",
        overflow:   "visible",
        marginLeft: "calc(-40px - max(0px, (100vw - 1440px) / 2))", // Pull flush to the left screen boundary
        width:      "calc(65vw + max(0px, (100vw - 1440px) / 2))", // Expand width to maintain overlap positioning
        flexShrink: 0,
        zIndex:     1,
      }}>

        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />


        {/* Loading overlay */}
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
            background: "var(--bg-primary)",
          }}>
            <div className="essay-spin-ring" />
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "rgba(255,255,255,0.30)", letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>Loading · Chassis_add.glb</div>
          </div>
        )}


        {/* Chapter dots nav (right edge) */}
        <div style={{
          position:       "absolute",
          right:          14,
          top:            "50%",
          transform:      "translateY(-50%)",
          display:        "flex",
          flexDirection:  "column",
          gap:            10,
          pointerEvents:  "none",
        }}>
          {CHAPTERS.map((c, i) => (
            <div key={c.id} style={{
              width:        i === idx ? 6 : 4,
              height:       i === idx ? 6 : 4,
              borderRadius: "50%",
              background:   i === idx
                ? "linear-gradient(135deg,#e05a1a,#f5a623)"
                : "rgba(255,255,255,0.22)",
              transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
              boxShadow:  i === idx ? "0 0 8px rgba(224,90,26,0.7)" : "none",
            }} />
          ))}
        </div>
      </div>

      {/* ════════════ RIGHT: bento content ════════════ */}
      <div className="bento-column" style={{
        overflow: "hidden", // 移除原生滾動，由 transform 接管
        height: "calc(100vh - var(--hdr-total-h, 52px))", // 確保只佔滿一整個螢幕高度
        boxSizing: "border-box",
        position: "relative",
        zIndex: 2,
        pointerEvents: "auto", 
      }}>
        <div style={{
          transform: `translateY(-${idx * 100}%)`,
          transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
          height: "100%"
        }}>

        <EssaySection id="intro">
          <IntroBento />
        </EssaySection>

        <EssaySection id="tire">
          <TireBento />
        </EssaySection>

        <EssaySection id="weight">
          <WeightBento />
        </EssaySection>

        <EssaySection id="aero">
          <AeroBento />
        </EssaySection>

        <EssaySection id="brake">
          <BrakeBento />
        </EssaySection>

        <EssaySection id="power">
          <PowerBento />
        </EssaySection>

        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────
// Ensure each section precisely takes up 100% of the parent wrapper height
function EssaySection({ id, children }) {
  return (
    <section
      data-essay={id}
      style={{
        height: "100%", 
        padding: "32px 44px 40px 40px", // 減少上方 padding (從 56px -> 32px)，把整體往上拉
        boxSizing: "border-box",
        borderBottom: "0.5px solid var(--separator, rgba(255,255,255,0.05))",
        overflowY: "auto", // Allow internal scrolling if content is exceptionally long
      }}
    >
      {children}
    </section>
  );
}

// ─── Bento primitives ────────────────────────────────
function BentoGrid({ cols = 2, children, style }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

function BCard({ span = 1, variant, children, style }) {
  const className = variant === "accent" ? "bcard-accent" : "bcard";
  return (
    <div 
      className={className} 
      style={{
        gridColumn: `span ${span}`,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BEye({ children, color, style }) {
  return (
    <div contentEditable suppressContentEditableWarning style={{
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: color || "var(--orange, #e05a1a)",
      marginBottom: 8,
      outline: "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

function BTitle({ size = 32, children, style }) {
  return (
    <h2 contentEditable suppressContentEditableWarning style={{
      fontFamily: "var(--font-sans)",
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.15,
      color: "var(--label-primary)",
      letterSpacing: "-0.025em",
      margin: "0 0 16px 0",
      outline: "none",
      ...style,
    }}>
      {children}
    </h2>
  );
}

function BLead({ children, style }) {
  return (
    <p contentEditable suppressContentEditableWarning style={{
      fontFamily: "var(--font-sans)",
      fontSize: 16,
      lineHeight: 1.55,
      color: "var(--label-secondary)",
      margin: "0 0 24px 0",
      textWrap: "pretty",
      outline: "none",
      ...style,
    }}>
      {children}
    </p>
  );
}

function BBody({ children, style }) {
  return (
    <p contentEditable suppressContentEditableWarning style={{
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "var(--label-secondary)",
      margin: "8px 0 0 0",
      textWrap: "pretty",
      outline: "none",
      ...style,
    }}>
      {children}
    </p>
  );
}

function BStat({ label, value, unit, accent = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
        color: "var(--label-secondary)", letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700,
        letterSpacing: "-0.02em", lineHeight: 1,
        color: accent ? "var(--orange, #e05a1a)" : "var(--label-primary)",
      }}>
        {value}
        {unit && <span style={{ fontSize: 11, color: "var(--label-tertiary)", marginLeft: 4, fontWeight: 400 }}>{unit}</span>}
      </div>
    </div>
  );
}

function BFormula({ expr, where }) {
  return (
    <div style={{
      paddingLeft: 14,
      borderLeft: "2px solid var(--orange, #e05a1a)",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      marginBottom: 8,
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: "var(--orange, #e05a1a)",
        marginBottom: 6,
        letterSpacing: "0.01em",
      }}>{expr}</div>
      {where && (
        <div style={{
          whiteSpace: "pre-line",
          fontSize: 10,
          color: "var(--label-tertiary, rgba(255,255,255,0.38))",
          lineHeight: 1.5,
        }}>{where}</div>
      )}
    </div>
  );
}

function BQuote({ src, children }) {
  return (
    <blockquote style={{
      margin: "10px 0 0",
      paddingLeft: 14,
      borderLeft: "2px solid var(--orange, #e05a1a)",
      fontStyle: "italic",
      color: "var(--label-secondary, rgba(255,255,255,0.65))",
      fontSize: 13,
      lineHeight: 1.6,
    }}>
      “{children}”
      {src && (
        <cite style={{
          display: "block",
          fontSize: 10,
          color: "var(--label-tertiary, rgba(255,255,255,0.38))",
          marginTop: 6,
          fontStyle: "normal",
          letterSpacing: "0.06em",
        }}>— {src}</cite>
      )}
    </blockquote>
  );
}

function Divider() {
  return <div style={{ height: 32 }} />;
}

// ─── Chapter bentos ────────────────────────────────────────────

function IntroBento() {
  return (
    <>
      <BEye>00 — 導言</BEye>
      <BTitle size={44}>把賽車當成系統</BTitle>
      <BLead>
        圈速不是某個零件的成績，是系統的輸出。<br/>
        輪胎 / 配重 / 空力 / 煞車 / 動力——每個環節的上限，決定下一個環節能發揮多少。
      </BLead>

      <Divider />

      <BentoGrid cols={2}>
        <BCard span={2}>
          <SystemDiagram />
        </BCard>

        <BCard variant="accent">
          <BEye color="rgba(255,255,255,0.5)">第一性原理</BEye>
          <BQuote src="Carroll Smith · Engineer to Win">
            每一個你不理解的零件，都是還在等著背叛你的零件。
          </BQuote>
        </BCard>

        <BCard>
          <BEye>閱讀順序</BEye>
          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
            marginTop: 4,
          }}>
            {["01 輪胎","02 重量","03 空力","04 煞車","05 動力"].map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                fontFamily: "var(--font-sans)", fontSize: 13,
                color: "var(--label-primary)", fontWeight: i === 0 ? 700 : 400,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: i === 0 ? "var(--orange,#e05a1a)" : "var(--label-tertiary)",
                  flexShrink: 0,
                }} />
                {t}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 14,
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--label-tertiary)", lineHeight: 1.5,
          }}>
            動力排最後——因為馬力<br/>是放大器，不是答案。
          </div>
        </BCard>
      </BentoGrid>
    </>
  );
}

function TireBento() {
  return (
    <>
      <BEye>01 — 輪胎</BEye>
      <BTitle size={44}>抓地力先於一切</BTitle>
      <BLead>
        轉向、煞車、加速——車手感知到的所有回饋，<br/>
        都是橡膠與柏油之間那幾平方公分的摩擦結果。輪胎不工作，其餘設計全部無效。
      </BLead>

      <Divider />

      <BentoGrid cols={2} style={{ marginBottom: 11 }}>
        <BCard>
          <BEye>工作溫度</BEye>
          <BStat label="Hoosier R25B 最佳工作溫度" value="70–95" unit="°C" accent />
          <BBody>低於下限，橡膠偏硬如橡皮擦；超過上限，表面開始脫塊。
          溫度管理不是調校選項，是設計前提。</BBody>
        </BCard>
        <BCard>
          <BEye>摩擦圓</BEye>
          <BFormula
            expr="√(Fx² + Fy²) ≤ μ · Fz"
            where={"Fx: 縱向力（煞車 / 加速）\nFy: 橫向力（過彎）\nμ: 摩擦係數  Fz: 垂直負荷"}
          />
          <BBody style={{ marginTop: 8 }}>輪胎只有一個力的預算。煞車用掉多少，過彎就少多少。</BBody>
        </BCard>
      </BentoGrid>

      <BCard span={2} style={{ marginBottom: 11 }}>
        <FrictionCircle />
      </BCard>

      <BCard>
        <BEye>負荷敏感度</BEye>
        <BBody>
          摩擦係數隨垂直負荷增加而遞減。把重量壓向某個輪胎，
          不會線性增加抓地力——超過臨界點反而降低合力上限。
          防傾桿、阻尼、後傾角，都是在分配這個負荷的工具。
        </BBody>
      </BCard>
    </>
  );
}

function WeightBento() {
  return (
    <>
      <BEye>02 — 重量</BEye>
      <BTitle size={44}>每一克都是決策</BTitle>
      <BLead>
        輕量化與配重決定了賽車的瞬態反應與極限抓地力。<br/>
        每一克的分布，都是在動態過彎中對四輪負荷的精密控制。
      </BLead>

      <Divider />

      <BentoGrid cols={2} style={{ marginBottom: 11 }}>
        <BCard>
          <BStat label="每多 1 kg 每圈損失" value="0.03" unit="sec" accent />
          <BStat label="20 kg × 22 圈 累計" value="~13" unit="sec" />
        </BCard>
        <BCard>
          <BEye>配重目標</BEye>
          <BStat label="後驅慢速場建議配重" value="47:53" unit="F:R" />
          <BBody>偏後配重壓制出彎 wheelspin，
          讓後輪在扭力上升時仍有餘裕。</BBody>
        </BCard>
      </BentoGrid>

      <BCard span={2} style={{ marginBottom: 11 }}>
        <WeightDistribution />
      </BCard>

      <BentoGrid cols={2}>
        <BCard>
          <BEye>荷重轉移公式</BEye>
          <BFormula
            expr="Front Wt = (b / L) × M"
            where={"b: 後軸至質心距離\nL: 軸距  M: 整車重（含車手）"}
          />
        </BCard>
        <BCard variant="accent">
          <BEye color="rgba(255,255,255,0.5)">設計準則</BEye>
          <BQuote src="Allan Staniforth, Race Car Design">
            如果只能改一件事，降低重心。
            如果還能改第二件事，再來才是減重。
          </BQuote>
        </BCard>
      </BentoGrid>
    </>
  );
}

function AeroBento() {
  return (
    <>
      <BEye>03 — 空力</BEye>
      <BTitle size={44}>下壓力不計入慣性</BTitle>
      <BLead>
        下壓力增加輪胎垂直負荷，但不增加車的質量——物理上接近作弊。<br/>
        FSAE 的場地速度低（30–90 km/h），翼面增加的重量 and 阻力，很可能比它帶來的抓地力更貴。
      </BLead>

      <Divider />

      <BentoGrid cols={2} style={{ marginBottom: 11 }}>
        <BCard>
          <BEye>平方定律</BEye>
          <BStat label="速度翻倍，下壓力倍數" value="×4" accent />
          <BBody>直線太短，翼面必須在 50 km/h 就開始做功，
          否則阻力先吃掉加速收益。</BBody>
        </BCard>
        <BCard>
          <BEye>升阻比</BEye>
          <BStat label="優秀 FSAE 翼面目標" value="2–3" unit="L/D" />
          <BBody>L/D &lt; 1 意味著每 1 N 下壓力，
          你同時拖著超過 1 N 的阻力跑全場。</BBody>
        </BCard>
      </BentoGrid>

      <BCard span={2} style={{ marginBottom: 11 }}>
        <DownforceCurve />
      </BCard>

      <BCard>
        <BEye>物理機制</BEye>
        <BFormula
          expr="L = ½ · ρ · V² · S · CL"
          where={"ρ ≈ 1.225 kg/m³（空氣密度）\nV: 車速（m/s）  S: 翼面面積\nCL: 升力係數"}
        />
      </BCard>
    </>
  );
}

function BrakeBento() {
  return (
    <>
      <BEye>04 — 煞車</BEye>
      <BTitle size={44}>煞車是熱管理題</BTitle>
      <BLead>
        讓車減速的是輪胎，不是卡鉗。煞車系統真正在做的，是把動能轉換成碟盤的熱——<br/>
        設計核心是「熱去哪裡」，不是「力道夠不夠大」。
      </BLead>

      <Divider />

      <BentoGrid cols={2} style={{ marginBottom: 11 }}>
        <BCard>
          <BEye>單次煞車能量</BEye>
          <BStat label="100→0 km/h · 280 kg" value="108" unit="kJ" accent />
          <BStat label="完成時間" value="2.5" unit="sec" />
        </BCard>
        <BCard>
          <BEye>煞車配比</BEye>
          <BStat label="前後制動配比" value="65:35" unit="F:R" />
          <BBody>制動時重心前移，前輪垂直負荷增加，
          能承受更高的制動力而不鎖死。</BBody>
        </BCard>
      </BentoGrid>

      <BCard span={2} style={{ marginBottom: 11 }}>
        <BrakeEnergy />
      </BCard>

      <BCard span={2}>
        <BEye>熱能消散與碟盤管理</BEye>
        <BBody>
          制動瞬間產生的巨大動能會轉化為千度高溫。如果碟盤散熱速度不夠快，
          高溫會傳導至煞車油導致氣阻（Vapor Lock），或是令來令片超出工作溫度而產生熱衰竭。
          因此，設計碟盤的通風散熱孔與材質選擇，重要性遠高於卡鉗本體的夾緊力。
        </BBody>
      </BCard>
    </>
  );
}

function PowerBento() {
  return (
    <>
      <BEye>05 — 動力</BEye>
      <BTitle size={44}>動力是放大器</BTitle>
      <BLead>
        在限制規格下，動力輸出的「平順度」比峰值馬力更具關鍵性。<br/>
        唯有穩定的輪胎接地負荷與線性的扭力高原，才能將每一匹馬力化為確實的向前推力。
      </BLead>

      <Divider />

      <BentoGrid cols={2} style={{ marginBottom: 11 }}>
        <BCard>
          <BEye>限流孔限制</BEye>
          <BStat label="20 mm 限流孔峰值" value="80–85" unit="hp" accent />
          <BBody>各隊引擎上限相近。
          圈速差距在傳動效率和扭力輸出的平順度，不在爆發力。</BBody>
        </BCard>
        <BCard>
          <BEye>最佳轉速區間</BEye>
          <BStat label="FSAE 場地主要工作區間" value="6–10k" unit="rpm" />
          <BBody>寬扁的中段扭力曲線比峰值更實用——
          換檔少，輪胎負荷中斷的次數就少。</BBody>
        </BCard>
      </BentoGrid>

      <BCard span={2} style={{ marginBottom: 11 }}>
        <TorqueCurve />
      </BCard>

      <BentoGrid cols={2}>
        <BCard>
          <BEye>換檔策略</BEye>
          <BBody>
            慢速彎走 3–4 檔，5 檔只在直線末段出現。
            每一次換檔，驅動力短暫中斷——這個瞬間的輪胎負荷變化，
            是過彎穩定性最脆弱的時刻。
            歧管長度、凸輪正時、進氣腔體積，都是在塑造扭力曲線形狀。
          </BBody>
        </BCard>
        <BCard variant="accent">
          <BEye color="rgba(255,255,255,0.5)">2025 賽後總結</BEye>
          <BQuote src="NKUST Racing 賽後總結">
            我們不是輸在馬力。我們輸在從來沒把那些馬力，穩定地傳到地面上。
          </BQuote>
        </BCard>
      </BentoGrid>
    </>
  );
}

window.Essay = Essay;
