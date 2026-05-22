// Essay.jsx — interactive First Principles handbook
// Layout: TOC sidebar + reading column with inline interactive widgets

function Essay() {
  const [active, setActive] = React.useState("intro");
  const articleRef = React.useRef(null);
  const sections = [
    { id: "intro",   num: "00", label: "序章",            short: "Intro" },
    { id: "tire",    num: "01", label: "輪胎是一切的開始", short: "Tyre" },
    { id: "weight",  num: "02", label: "重量分配",        short: "Weight" },
    { id: "aero",    num: "03", label: "空氣力學",        short: "Aero" },
    { id: "brake",   num: "04", label: "煞車能量",        short: "Brake" },
    { id: "power",   num: "05", label: "動力與圈速",      short: "Power" },
  ];

  // Reset scroll when section changes
  React.useEffect(() => {
    articleRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  const idx = sections.findIndex(s => s.id === active);
  const prev = sections[idx - 1];
  const next = sections[idx + 1];

  return (
    <div className="tcard large" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "260px 1fr",
        minHeight: "calc(100vh - 160px)",
      }}>
        {/* TOC */}
        <aside style={{
          padding: "40px 22px 40px 32px",
          borderRight: "0.5px solid var(--rule)",
          alignSelf: "start", position: "sticky", top: 0,
        }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>FIRST PRINCIPLES</div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 24,
            fontWeight: 700, color: "var(--ink)",
            letterSpacing: "-0.015em", lineHeight: 1.2, marginBottom: 26,
          }}>FSAE 工程手冊</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)} style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 10,
                background: active === s.id ? "var(--accent-bg)" : "transparent",
                color: active === s.id ? "var(--accent)" : "var(--ink)",
                border: 0, cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: active === s.id ? 600 : 400,
                letterSpacing: "-0.005em", lineHeight: 1.3,
                transition: "all .15s",
                display: "flex", alignItems: "baseline", gap: 10,
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: active === s.id ? "var(--accent)" : "var(--muted)",
                  letterSpacing: "0.06em", fontWeight: 700,
                }}>{s.num}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Progress */}
          <div style={{
            marginTop: 28, paddingTop: 18,
            borderTop: "0.5px solid var(--rule)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "baseline", marginBottom: 8,
            }}>
              <div className="eyebrow">PROGRESS</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--accent)", fontWeight: 700,
              }}>{idx + 1} / {sections.length}</div>
            </div>
            <div style={{
              height: 3, borderRadius: 99, background: "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: "var(--accent)",
                width: `${((idx + 1) / sections.length) * 100}%`,
                transition: "width .42s var(--ease-out)",
              }}/>
            </div>
          </div>

          <div style={{
            marginTop: 22, paddingTop: 14,
            borderTop: "0.5px solid var(--rule)",
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
            color: "var(--muted)", lineHeight: 1.7, textTransform: "uppercase",
          }}>
            REV 3.2 · 2026<br/>
            授權 · NKUST RACING<br/>
            內部教材 · 18 PAGES
          </div>
        </aside>

        {/* Reading column */}
        <article ref={articleRef} style={{
          padding: "56px 80px 80px",
          maxWidth: 820, minWidth: 0,
        }}>
          {active === "intro" && <IntroSection/>}
          {active === "tire"   && <TyreSection/>}
          {active === "weight" && <WeightSection/>}
          {active === "aero"   && <AeroSection/>}
          {active === "brake"  && <BrakeSection/>}
          {active === "power"  && <PowerSection/>}

          {/* Footer nav */}
          <div style={{
            marginTop: 60, paddingTop: 24,
            borderTop: "0.5px solid var(--rule)",
            display: "flex", justifyContent: "space-between", gap: 12,
          }}>
            {prev ? (
              <button onClick={() => setActive(prev.id)} style={navBtnStyle("prev")}>
                <UIIcon kind="chevron-down" size={12} color="currentColor"/>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="eyebrow" style={{ color: "var(--muted)" }}>PREVIOUS · {prev.num}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{prev.label}</span>
                </div>
              </button>
            ) : <div/>}
            {next ? (
              <button onClick={() => setActive(next.id)} style={navBtnStyle("next")}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
                  <span className="eyebrow" style={{ color: "var(--muted)" }}>NEXT · {next.num}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{next.label}</span>
                </div>
                <UIIcon kind="arrow" size={12} color="currentColor"/>
              </button>
            ) : <div/>}
          </div>
        </article>
      </div>
    </div>
  );
}

function navBtnStyle(dir) {
  return {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 16px", borderRadius: 12,
    background: "rgba(0,0,0,0.03)", border: 0, cursor: "pointer",
    color: "var(--ink)", fontFamily: "inherit", textAlign: "left",
    transition: "background .15s",
  };
}

// ─── Section primitives ──────────────────────────────────
function H1({ children, num }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {num && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
          color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 12,
        }}>{num}</div>
      )}
      <h1 style={{
        fontFamily: "var(--font-serif)", fontSize: 52, fontWeight: 900,
        lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--ink)",
      }}>{children}</h1>
    </div>
  );
}
function Lead({ children }) {
  return <p style={{
    fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 400,
    lineHeight: 1.65, color: "var(--ink)", marginBottom: 32,
    textWrap: "pretty",
  }}>{children}</p>;
}
function H2({ children, num }) {
  return (
    <div style={{ marginTop: 44, marginBottom: 18, display: "flex", alignItems: "baseline", gap: 14 }}>
      {num && (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
          color: "var(--muted)", letterSpacing: "0.1em",
        }}>{num}</span>
      )}
      <h2 style={{
        fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700,
        lineHeight: 1.2, letterSpacing: "-0.015em", color: "var(--ink)",
      }}>{children}</h2>
    </div>
  );
}
function P({ children }) {
  return <p style={{
    fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 400,
    lineHeight: 1.85, color: "var(--ink)", marginBottom: 16,
    textWrap: "pretty",
  }}>{children}</p>;
}
function Eyebr({ children }) {
  return <div className="eyebrow" style={{ marginBottom: 14 }}>{children}</div>;
}
function Pullquote({ children, src }) {
  return (
    <blockquote style={{
      margin: "32px 0", padding: "22px 28px",
      borderLeft: "3px solid var(--accent)",
      background: "var(--accent-bg)", borderRadius: "0 12px 12px 0",
    }}>
      <p style={{
        fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 400,
        lineHeight: 1.55, color: "var(--ink)", letterSpacing: "-0.01em",
      }}>「{children}」</p>
      {src && <div style={{
        fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 10,
        color: "var(--muted)", letterSpacing: "0.06em",
      }}>— {src}</div>}
    </blockquote>
  );
}
function Formula({ expr, where }) {
  return (
    <div style={{
      margin: "20px 0", padding: "18px 22px",
      background: "rgba(0,0,0,0.025)", borderRadius: 10,
      borderLeft: "2px solid var(--rule)",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500,
        color: "var(--ink)", letterSpacing: 0,
      }}>{expr}</div>
      {where && <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 8,
        color: "var(--muted)", letterSpacing: "0.02em", lineHeight: 1.55,
      }}>{where}</div>}
    </div>
  );
}

// ─── Sections ──────────────────────────────────────────────
function IntroSection() {
  return (
    <>
      <Eyebr>00 — INTRODUCTION</Eyebr>
      <H1>把『車』當成系統</H1>
      <Lead>
        Formula SAE 賽車不是把好零件堆起來就會跑得快。一台好車的本質是
        子系統之間的協調 — 輪胎、配重、空力、煞車、動力，每一個決策都會牽動其他四個。
        這本手冊不教你怎麼畫 CAD，而是談背後的物理。
      </Lead>

      <SystemDiagram/>

      <P>
        每個賽季開始前，車隊都應該重新回到第一性原理（first principles）
        重新審視每一個過去視為理所當然的設計選擇。過去用的東西不一定錯，
        但它必須能在今年的目標下被重新證明合理。
      </P>
      <Pullquote src="Carroll Smith, Engineer to Win">
        每一個你不理解的零件，都是還在等著背叛你的零件。
      </Pullquote>
      <P>
        這份手冊按照一個圈速分析的順序展開：先談輪胎能給你多少抓地力，
        再談車重分配如何決定那些抓地力的利用率，最後才是空力、煞車、動力。
        順序很重要 — 動力擺最後，因為動力是放大器，不是答案。
      </P>
    </>
  );
}

function TyreSection() {
  return (
    <>
      <Eyebr>01 — TYRE</Eyebr>
      <H1 num="01">輪胎是一切的開始</H1>
      <Lead>
        車手感受到的所有事情 — 轉向、煞車、加速 — 都是輪胎與地面之間摩擦的結果。
        如果輪胎沒有抓地，剩下的設計都沒有意義。
      </Lead>

      <H2 num="1.1">摩擦圈（Friction Circle）</H2>
      <P>
        每個輪胎能提供的最大力量大略是一個圓。你可以全部拿去煞車，或全部拿去過彎，
        但你不能同時擁有兩者的最大值。當車手踩煞車進彎，他必須一邊釋放煞車一邊加大轉向，
        讓總合力始終貼著這個圓的邊緣。
      </P>

      <FrictionCircle/>

      <Formula
        expr="√(Fx² + Fy²) ≤ μ · Fz"
        where="Fx: 縱向力（煞車/加速），Fy: 橫向力（過彎），μ: 摩擦係數，Fz: 垂直負荷"/>

      <H2 num="1.2">負荷敏感性</H2>
      <P>
        輪胎的摩擦係數會隨著垂直負荷下降 — 這就是所謂的 load sensitivity。
        這代表把車重壓在某個輪胎上不會線性地增加抓地力，過大的負荷反而會降低總合抓地力。
        這也是為什麼防傾桿、避震阻尼、後傾角這些看似細節的設定如此重要。
      </P>

      <H2 num="1.3">工作溫度窗</H2>
      <P>
        Hoosier R25B 的最佳工作溫度區間在 70–95°C。低於這個窗 tyre 表面像橡皮擦，
        高於這個窗則開始脫塊。胎壓、camber、合適的暖胎程序都是讓胎溫進入窗口的工具。
      </P>
    </>
  );
}

function WeightSection() {
  return (
    <>
      <Eyebr>02 — WEIGHT</Eyebr>
      <H1 num="02">把每一克都當成設計決策</H1>
      <Lead>
        每多 1 kg，每圈損失約 0.02–0.04 秒。聽起來不多，但 FSAE 場地一場可達 22 圈，
        20 公斤的差距等於將近 1 秒。問題不是「能不能更輕」，而是「哪裡能更輕又不失剛性」。
      </Lead>

      <H2 num="2.1">縱向配重</H2>
      <P>
        前後配重決定了車輛的轉向特性。47:53（前:後）大約是中性偏推；
        45:55 則開始偏 oversteer。FSAE 場地多為慢速彎，所以後驅車一般偏好稍偏前的配重，
        以避免後輪在加速出彎時過早觸發 wheelspin。
      </P>

      <WeightDistribution/>

      <Formula
        expr="Front Wt% = (b / L) × M_total"
        where="b: 後輪到質心的距離；L: 軸距；M_total: 整車重量（含車手）"/>

      <H2 num="2.2">重心高度</H2>
      <P>
        重心每降 10 mm，過彎時的內外輪負荷轉移會線性下降。降低重心比減重往往更划算 —
        因為它同時改善了輪胎的負荷敏感性問題。
      </P>
      <Pullquote src="Allan Staniforth, Race &amp; Rally Car Source Book">
        如果你只能改一件事，把重心降低。如果你能改兩件事，再來才是減重。
      </Pullquote>
    </>
  );
}

function AeroSection() {
  return (
    <>
      <Eyebr>03 — AERO</Eyebr>
      <H1 num="03">下壓力是免費的負荷</H1>
      <Lead>
        空力下壓力增加輪胎的垂直負荷，但不增加慣性。這在物理上幾乎是作弊。
        但 FSAE 場地速度低（多在 30–90 km/h），下壓力收益必須對抗額外的重量和阻力。
      </Lead>

      <H2 num="3.1">下壓力的二次曲線</H2>
      <P>
        下壓力與車速平方成正比。換句話說，速度從 40 翻倍到 80 km/h，下壓力是 4 倍。
        FSAE 直線太短，所以前翼/尾翼設計通常要在 50 km/h 左右就要產生明顯效益，
        而不是賭最高速時的數字。
      </P>

      <DownforceCurve/>

      <Formula
        expr="L = ½ · ρ · V² · S · CL"
        where="ρ: 空氣密度 ≈ 1.225 kg/m³，V: 車速，S: 投影面積，CL: 升力係數"/>

      <H2 num="3.2">L/D 比</H2>
      <P>
        每一公斤下壓力都伴隨阻力。一個好的 FSAE 翼面 L/D 約在 2–3，
        意思是一公斤下壓力換來 0.4–0.5 公斤阻力。如果 L/D &lt; 1，
        你只是在浪費引擎馬力。
      </P>
    </>
  );
}

function BrakeSection() {
  return (
    <>
      <Eyebr>04 — BRAKE</Eyebr>
      <H1 num="04">煞車是動能的轉換器</H1>
      <Lead>
        煞車不是讓車停下來 — 那是輪胎的工作。煞車是把動能轉成熱能。
        所以煞車系統設計的核心是熱管理，不是力道。
      </Lead>

      <H2 num="4.1">煞車能量</H2>
      <P>
        從 100 km/h 煞到全停，280 kg 的車總共要消化 108 kJ 的能量，
        而且通常在 2.5 秒內完成。這些能量幾乎全部變成碟盤的熱，
        所以選擇對的碟盤材質與通風設計比挑「好的卡鉗」更影響極限。
      </P>

      <BrakeEnergy/>

      <Formula
        expr="ΔKE = ½ · m · (V₁² − V₂²)"
        where="m: 車重 + 車手；V₁: 起始車速，V₂: 終速（m/s）"/>

      <H2 num="4.2">前後制動配比</H2>
      <P>
        煞車時負荷轉移到前輪，所以前輪可承受的制動力更高 — 通常前後分配約 65:35。
        FSAE 規則要求前後獨立油路、雙主缸，以便細微調整 bias bar。
      </P>
    </>
  );
}

function PowerSection() {
  return (
    <>
      <Eyebr>05 — POWER</Eyebr>
      <H1 num="05">動力是放大器</H1>
      <Lead>
        新車手以為馬力決定圈速。實際上，FSAE 引擎都被 20 mm 限流孔限制在 80–85 hp 左右。
        所以「動力」幾乎是個常數，關鍵在於 *如何把這 80 匹平順地放上地面*。
      </Lead>

      <H2 num="5.1">扭力曲線形狀比峰值馬力重要</H2>
      <P>
        FSAE 場地多為 40–80 km/h，能讓引擎跑到峰值馬力的機會極少。
        所以調校的目標是讓 6000–10000 rpm 範圍內扭力曲線平順、寬闊；
        歧管長度、凸輪正時、進氣腔體積都是這場戰役的工具。
      </P>

      <TorqueCurve/>

      <H2 num="5.2">傳動比策略</H2>
      <P>
        最終減速比決定了你能多早把車掛上 6 檔。對 FSAE 場地，常用策略是
        4 檔過彎中、5 檔僅在直線末端，把換檔次數降到最少 —
        每一次換檔都是輪胎抓地力中斷的瞬間。
      </P>
      <Pullquote src="2025 NKUST Racing 賽後檢討">
        我們不是輸在馬力，而是輸在我們從來沒把那些馬力穩定地傳給地面。
      </Pullquote>
    </>
  );
}

window.Essay = Essay;
