// EssayWidgets.jsx — interactive physics widgets for the First Principles essay
//
// Each widget is a self-contained component. They share a common card chrome
// (use <WidgetFrame> for consistent caption + readouts) and a small set of
// shared SVG/scale helpers.

// ─── Shared shell ─────────────────────────────────────────
function WidgetFrame({ title, caption, readouts, children, height = 320 }) {
  return (
    <figure style={{
      margin: "32px 0",
      padding: 18,
      background: "rgba(255,255,255,0.78)",
      backdropFilter: "blur(20px) saturate(160%)",
      WebkitBackdropFilter: "blur(20px) saturate(160%)",
      border: "0.5px solid rgba(0,0,0,0.06)",
      borderRadius: 16,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        display: "flex", alignItems: "baseline",
        justifyContent: "space-between", marginBottom: 14,
        paddingBottom: 10, borderBottom: "0.5px solid var(--rule)",
      }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>INTERACTIVE</div>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14, fontWeight: 600, color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}>{title}</div>
        </div>
        {readouts && (
          <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
            {readouts.map((r, i) => (
              <Readout key={i} label={r.label} value={r.value} unit={r.unit} accent={r.accent}/>
            ))}
          </div>
        )}
      </div>
      <div style={{ minHeight: height }}>{children}</div>
      {caption && (
        <figcaption style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--muted)", letterSpacing: "0.06em",
          textTransform: "uppercase", marginTop: 12,
          paddingTop: 10, borderTop: "0.5px solid var(--rule)",
        }}>{caption}</figcaption>
      )}
    </figure>
  );
}

function Readout({ label, value, unit, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
      <span className="eyebrow">{label}</span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 18, fontWeight: 700,
        color: accent ? "var(--accent)" : "var(--ink)",
        letterSpacing: "-0.01em", lineHeight: 1,
        fontFeatureSettings: "'tnum'",
      }}>
        {value}
        {unit && <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  );
}

function Slider({ label, value, min, max, step = 0.01, unit, onChange, format }) {
  const display = format ? format(value) : value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline",
      }}>
        <span className="eyebrow">{label}</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
          color: "var(--ink)", fontFeatureSettings: "'tnum'",
        }}>
          {display}{unit && <span style={{ color: "var(--muted)", marginLeft: 2 }}>{unit}</span>}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ accentColor: "var(--accent)", width: "100%" }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  01 — Friction Circle (tyre section)
// ═══════════════════════════════════════════════════════════
function FrictionCircle() {
  const cx = 160, cy = 160, R = 130;
  const [pt, setPt] = React.useState({ x: -60, y: -80 }); // in same units
  const svgRef = React.useRef(null);
  const drag = React.useRef(false);

  const update = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const ev = e.touches ? e.touches[0] : e;
    let x = ev.clientX - rect.left - cx;
    let y = ev.clientY - rect.top - cy;
    const r = Math.sqrt(x*x + y*y);
    if (r > R) { // clamp to circle edge
      x = (x / r) * R; y = (y / r) * R;
    }
    setPt({ x, y });
  };

  const Fx = Math.round((pt.y / R) * -100);  // braking (-) / accel (+)  invert y for natural feel
  const Fy = Math.round((pt.x / R) * 100);   // left/right turn
  const total = Math.round(Math.sqrt(Fx*Fx + Fy*Fy));
  const used = Math.min(100, Math.round((Math.sqrt(pt.x*pt.x + pt.y*pt.y) / R) * 100));
  const accent = used > 95 ? "var(--accent)" : "var(--ink)";

  // Vector angle
  const angle = Math.atan2(pt.y, pt.x) * 180 / Math.PI;
  const angleLabel = pt.y < 0 ? "煞車" : "加速";
  const turnLabel = pt.x > 5 ? "右轉" : pt.x < -5 ? "左轉" : "直線";

  // Precomputed grid lines (50%, 75%)
  return (
    <WidgetFrame title="摩擦圈 · Friction Circle"
      caption="拖曳藍點模擬輪胎當前負荷。當點被推到圓邊，輪胎已經到極限 — 再多一點力就會失去抓地。"
      readouts={[
        { label: "USED",  value: used,  unit: "%", accent: used > 90 },
        { label: "TOTAL", value: total, unit: "" },
      ]}
      height={340}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 200px", gap: 20,
        alignItems: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg ref={svgRef} width={320} height={320}
            style={{ cursor: drag.current ? "grabbing" : "grab",
                     touchAction: "none", userSelect: "none" }}
            onMouseDown={e => { drag.current = true; update(e); }}
            onMouseMove={e => drag.current && update(e)}
            onMouseUp={() => drag.current = false}
            onMouseLeave={() => drag.current = false}
            onTouchStart={e => { drag.current = true; update(e); }}
            onTouchMove={e => drag.current && update(e)}
            onTouchEnd={() => drag.current = false}>
            {/* Axes */}
            <line x1={cx-R-10} y1={cy} x2={cx+R+10} y2={cy} stroke="rgba(0,0,0,0.12)" strokeWidth="0.5"/>
            <line x1={cx} y1={cy-R-10} x2={cx} y2={cy+R+10} stroke="rgba(0,0,0,0.12)" strokeWidth="0.5"/>
            {/* Inner reference rings */}
            <circle cx={cx} cy={cy} r={R*0.5} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" strokeDasharray="3,3"/>
            <circle cx={cx} cy={cy} r={R*0.75} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="0.5" strokeDasharray="3,3"/>
            {/* Limit circle */}
            <circle cx={cx} cy={cy} r={R} fill="rgba(0,113,227,0.04)"
              stroke="var(--accent)" strokeWidth="1.5"/>
            {/* Axis labels */}
            <text x={cx} y={cy-R-16} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.1em">+ Fx · ACCEL</text>
            <text x={cx} y={cy+R+24} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.1em">– Fx · BRAKE</text>
            <text x={cx-R-18} y={cy+3} textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.1em">– Fy</text>
            <text x={cx+R+18} y={cy+3}
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.1em">+ Fy</text>
            {/* Vector from origin to point */}
            <line x1={cx} y1={cy} x2={cx+pt.x} y2={cy+pt.y}
              stroke={accent} strokeWidth="1.5" strokeDasharray="3,3"/>
            {/* Decomposed Fx, Fy lines */}
            <line x1={cx} y1={cy} x2={cx+pt.x} y2={cy}
              stroke="rgba(184,48,37,0.4)" strokeWidth="1.5"/>
            <line x1={cx+pt.x} y1={cy} x2={cx+pt.x} y2={cy+pt.y}
              stroke="rgba(184,48,37,0.4)" strokeWidth="1.5"/>
            {/* Draggable point */}
            <circle cx={cx+pt.x} cy={cy+pt.y} r="9"
              fill={accent}
              stroke="#fff" strokeWidth="2"
              style={{ filter: `drop-shadow(0 2px 6px ${used > 90 ? 'rgba(0,113,227,0.5)' : 'rgba(0,0,0,0.2)'})` }}/>
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ReadoutLine label="STATE" value={`${angleLabel} + ${turnLabel}`}/>
          <ReadoutLine label="Fx" value={Fx > 0 ? `+${Fx}` : Fx} unit="kg"/>
          <ReadoutLine label="Fy" value={Fy > 0 ? `+${Fy}` : Fy} unit="kg"/>
          <ReadoutLine label="|F|" value={total} unit="kg"/>
          <div style={{
            marginTop: 8, padding: 12,
            background: used > 95 ? "rgba(184,48,37,0.08)" : "var(--accent-bg)",
            borderRadius: 10,
            fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)",
          }}>
            {used > 95 ? "⚠ 已到輪胎極限 — 再增加任一方向都會打滑。" :
             used > 70 ? "輪胎工作在 70–95% 區間，是賽車手要追求的甜蜜點。" :
                        "目前還有大量抓地力儲備，車手可以更大膽。"}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}

function ReadoutLine({ label, value, unit }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "baseline", padding: "4px 0",
      borderBottom: "0.5px solid var(--rule)",
    }}>
      <span className="eyebrow">{label}</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
        color: "var(--ink)", fontFeatureSettings: "'tnum'",
      }}>
        {value}
        {unit && <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 3 }}>{unit}</span>}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  02 — Weight distribution (CG visualizer)
// ═══════════════════════════════════════════════════════════
function WeightDistribution() {
  const [front, setFront] = React.useState(47);
  const [cgH,   setCgH]   = React.useState(280);  // mm
  const wb = 1550;  // wheelbase mm
  const tr = 1200;  // track width mm

  // CG position in mm from front axle
  const cgFromFront = wb * (1 - front / 100);
  const handlingLabel =
    front < 44 ? "明顯轉向過度 (Oversteer)" :
    front < 48 ? "輕微轉向過度" :
    front < 52 ? "中性 · Neutral" :
    front < 56 ? "輕微轉向不足" :
                 "明顯轉向不足 (Understeer)";
  const handlingTone =
    front < 44 || front > 56 ? "var(--accent)" :
    front < 48 || front > 52 ? "var(--ink)" :
                                "#2a6b38";

  // Load transfer % during 1g cornering
  const loadTransferPct = ((cgH / tr) * 100).toFixed(1);

  // Top-down car SVG: width 320, height 200
  return (
    <WidgetFrame title="配重 + 重心 · Weight Distribution"
      caption="調整前後配重與重心高度，觀察操控特性與過彎時的輪胎負荷轉移。"
      readouts={[
        { label: "BALANCE", value: `${front}:${100-front}`, unit: "F:R" },
        { label: "LT @ 1g", value: loadTransferPct, unit: "%", accent: cgH > 320 },
      ]}
      height={380}>
      <div style={{
        display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24,
        alignItems: "center",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          {/* Top-down view */}
          <svg width={340} height={200} viewBox="0 0 340 200">
            {/* Track */}
            <rect x={10} y={10} width={320} height={180} rx={12}
              fill="rgba(0,113,227,0.04)" stroke="rgba(0,113,227,0.15)" strokeWidth="0.5"
              strokeDasharray="4,4"/>
            {/* Car silhouette */}
            <path d="M 60 100 L 60 70 Q 60 50 110 50 L 230 50 Q 280 50 280 70 L 280 130 Q 280 150 230 150 L 110 150 Q 60 150 60 130 Z"
              fill="rgba(0,0,0,0.04)" stroke="var(--ink)" strokeWidth="1.2"/>
            {/* Wheels */}
            <rect x={75} y={42} width={12} height={20} fill="var(--ink)" rx={2}/>
            <rect x={75} y={138} width={12} height={20} fill="var(--ink)" rx={2}/>
            <rect x={253} y={42} width={12} height={20} fill="var(--ink)" rx={2}/>
            <rect x={253} y={138} width={12} height={20} fill="var(--ink)" rx={2}/>
            {/* Wheelbase line */}
            <line x1={81} y1={170} x2={259} y2={170}
              stroke="var(--muted)" strokeWidth="0.5"/>
            <text x={170} y={186} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.06em">WHEELBASE · {wb}mm</text>
            {/* Front / Rear axle labels */}
            <text x={81} y={32} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted)" letterSpacing="0.06em">FRONT</text>
            <text x={259} y={32} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted)" letterSpacing="0.06em">REAR</text>
            {/* CG marker — interpolate position */}
            {(() => {
              const cgX = 81 + (cgFromFront / wb) * (259 - 81);
              return (
                <g>
                  {/* Quadrant cross */}
                  <circle cx={cgX} cy={100} r={20} fill="rgba(0,113,227,0.10)"
                    stroke="var(--accent)" strokeWidth="1.5"/>
                  <circle cx={cgX} cy={100} r={20} fill="none"
                    stroke="var(--accent)" strokeWidth="1" strokeDasharray="2,2"/>
                  <path d={`M ${cgX-20} 100 L ${cgX+20} 100 M ${cgX} 80 L ${cgX} 120`}
                    stroke="var(--accent)" strokeWidth="1.5"/>
                  <circle cx={cgX} cy={100} r={3.5} fill="var(--accent)"/>
                  <text x={cgX} y={75}
                    textAnchor="middle" fontFamily="var(--font-mono)"
                    fontSize="9" fill="var(--accent)" fontWeight="700"
                    letterSpacing="0.06em">CG</text>
                </g>
              );
            })()}
          </svg>

          {/* Side view bar showing CG height */}
          <svg width={340} height={90} viewBox="0 0 340 90">
            {/* Ground */}
            <line x1={10} y1={75} x2={330} y2={75}
              stroke="var(--ink)" strokeWidth="1.5"/>
            {/* Wheels */}
            <circle cx={81} cy={68} r={14}
              fill="rgba(0,0,0,0.06)" stroke="var(--ink)" strokeWidth="1"/>
            <circle cx={259} cy={68} r={14}
              fill="rgba(0,0,0,0.06)" stroke="var(--ink)" strokeWidth="1"/>
            {/* CG marker — height proportional */}
            {(() => {
              const cgX = 81 + (cgFromFront / wb) * (259 - 81);
              const cgYBase = 75;
              const cgYTop  = 75 - (cgH / 500) * 50;
              return (
                <g>
                  <line x1={cgX} y1={cgYBase} x2={cgX} y2={cgYTop}
                    stroke="var(--accent)" strokeWidth="1" strokeDasharray="2,2"/>
                  <circle cx={cgX} cy={cgYTop} r={4} fill="var(--accent)"/>
                  <text x={cgX + 8} y={cgYTop + 3}
                    fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)" fontWeight="700"
                    letterSpacing="0.06em">{cgH}mm</text>
                </g>
              );
            })()}
            <text x={170} y={88} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted)"
              letterSpacing="0.06em">SIDE VIEW</text>
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Slider label="前配重" value={front} min={40} max={60} step={1} unit="%"
            onChange={setFront}/>
          <Slider label="重心高度" value={cgH} min={200} max={400} step={5} unit="mm"
            onChange={setCgH}/>
          <div style={{
            marginTop: 6, padding: 12,
            background: handlingTone === "#2a6b38" ? "rgba(42,107,56,0.08)" : "var(--accent-bg)",
            borderRadius: 10,
          }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>HANDLING</div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: handlingTone,
              letterSpacing: "-0.01em",
            }}>{handlingLabel}</div>
            <div style={{
              fontSize: 11.5, color: "var(--faint)", marginTop: 6, lineHeight: 1.5,
            }}>
              {cgH > 320 ? "重心偏高 — 1g 過彎時超過 25% 負荷會轉移到外輪，輪胎負荷敏感性會偷走抓地力。"
                          : "重心控制良好，負荷轉移在可接受範圍內。"}
            </div>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}

// ═══════════════════════════════════════════════════════════
//  03 — Downforce curve (aero section)
// ═══════════════════════════════════════════════════════════
function DownforceCurve() {
  const [cl, setCl] = React.useState(2.4);
  const [area, setArea] = React.useState(1.2);
  const [speed, setSpeed] = React.useState(60);

  const RHO = 1.225;
  const calcDown = (v) => 0.5 * RHO * Math.pow(v / 3.6, 2) * area * cl;
  const currentDown = calcDown(speed);

  // Build curve points (0..120 km/h)
  const W = 380, H = 220, PAD = 40;
  const xMax = 120;
  const yMax = calcDown(xMax) * 1.05;
  const xToPx = (v) => PAD + (v / xMax) * (W - 2*PAD);
  const yToPx = (n) => H - PAD - (n / yMax) * (H - 2*PAD);

  const points = [];
  for (let v = 0; v <= xMax; v += 5) {
    points.push(`${xToPx(v)},${yToPx(calcDown(v))}`);
  }

  return (
    <WidgetFrame title="下壓力曲線 · Downforce vs Speed"
      caption="L = ½·ρ·v²·S·CL — 二次曲線意味著速度翻倍，下壓力變 4 倍。"
      readouts={[
        { label: "@ SLIDER",  value: currentDown.toFixed(0), unit: "N", accent: true },
        { label: "= MASS",    value: (currentDown / 9.81).toFixed(1), unit: "kg" },
      ]}
      height={280}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 200px", gap: 20,
        alignItems: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg width={W} height={H}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <g key={i}>
                <line x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)}
                  stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
                <text x={PAD - 6} y={PAD + t*(H-2*PAD) + 3} textAnchor="end"
                  fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)">
                  {Math.round(yMax * (1 - t))}
                </text>
              </g>
            ))}
            {[0, 30, 60, 90, 120].map(v => (
              <g key={v}>
                <line x1={xToPx(v)} y1={H-PAD} x2={xToPx(v)} y2={H-PAD+4}
                  stroke="var(--muted)" strokeWidth="0.5"/>
                <text x={xToPx(v)} y={H-PAD+16} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)">{v}</text>
              </g>
            ))}
            {/* Axes labels */}
            <text x={W-PAD} y={H-12} textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.06em">km/h</text>
            <text x={6} y={PAD-6}
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.06em">N · DOWNFORCE</text>
            {/* Area under curve */}
            <polygon
              points={`${PAD},${H-PAD} ${points.join(' ')} ${W-PAD},${H-PAD}`}
              fill="rgba(0,113,227,0.10)"/>
            {/* Curve */}
            <polyline points={points.join(' ')}
              fill="none" stroke="var(--accent)" strokeWidth="2"/>
            {/* Marker for current speed */}
            <line x1={xToPx(speed)} y1={H-PAD} x2={xToPx(speed)} y2={yToPx(currentDown)}
              stroke="var(--accent)" strokeWidth="1" strokeDasharray="3,3"/>
            <circle cx={xToPx(speed)} cy={yToPx(currentDown)} r="5"
              fill="var(--accent)" stroke="#fff" strokeWidth="2"/>
            <text x={xToPx(speed)} y={yToPx(currentDown) - 12} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="11" fontWeight="700"
              fill="var(--accent)">
              {currentDown.toFixed(0)} N
            </text>
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Slider label="升力係數 CL" value={cl} min={0.5} max={3.5} step={0.1}
            onChange={setCl} format={v => v.toFixed(1)}/>
          <Slider label="參考面積 S" value={area} min={0.4} max={2.0} step={0.05} unit="m²"
            onChange={setArea} format={v => v.toFixed(2)}/>
          <Slider label="車速" value={speed} min={20} max={120} step={5} unit="km/h"
            onChange={setSpeed}/>
        </div>
      </div>
    </WidgetFrame>
  );
}

// ═══════════════════════════════════════════════════════════
//  04 — Brake energy
// ═══════════════════════════════════════════════════════════
function BrakeEnergy() {
  const [mass, setMass] = React.useState(280);  // kg incl. driver
  const [v1,   setV1]   = React.useState(100);  // km/h
  const [v2,   setV2]   = React.useState(40);   // km/h

  const v1ms = v1 / 3.6;
  const v2ms = Math.min(v1, v2) / 3.6;
  const dKE = 0.5 * mass * (v1ms*v1ms - v2ms*v2ms);  // Joules
  const kJ = dKE / 1000;

  // Disc temp rise: 4 discs, total thermal mass ~ 4 × 0.8 kg × 460 J/kg·K
  const C = 4 * 0.8 * 460;
  const dT = dKE / C;

  return (
    <WidgetFrame title="煞車能量 · Kinetic Energy Dissipation"
      caption="ΔKE = ½m(v₁² − v₂²)。所有動能幾乎全部變成碟盤的熱 — 煞車設計的本質是熱管理。"
      readouts={[
        { label: "ENERGY", value: kJ.toFixed(1), unit: "kJ", accent: true },
        { label: "ΔT 預估", value: dT.toFixed(0), unit: "°C", accent: dT > 200 },
      ]}
      height={240}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 200px", gap: 20,
        alignItems: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 8px" }}>
          {/* Speed bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow">SPEED RANGE</div>
            <div style={{
              position: "relative", height: 32, borderRadius: 8,
              background: "rgba(0,0,0,0.04)", overflow: "hidden",
            }}>
              {/* v1 marker */}
              <div style={{
                position: "absolute", left: `${(v2/140)*100}%`, top: 0, bottom: 0,
                width: `${((v1-v2)/140)*100}%`,
                background: "linear-gradient(90deg, var(--accent), rgba(0,113,227,0.5))",
                borderRadius: 8,
              }}/>
              <div style={{
                position: "absolute", left: `${(v2/140)*100}%`, top: 0, bottom: 0,
                paddingLeft: 8, display: "flex", alignItems: "center",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                color: "#fff", letterSpacing: "0.04em",
              }}>{v2} km/h</div>
              <div style={{
                position: "absolute", left: `${(v1/140)*100}%`, top: 0, bottom: 0,
                paddingLeft: 6, display: "flex", alignItems: "center",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                color: "var(--accent)", letterSpacing: "0.04em",
              }}>{v1} km/h</div>
            </div>
          </div>

          {/* Energy big read */}
          <div style={{
            padding: 16,
            background: dT > 200 ? "rgba(184,48,37,0.08)" : "var(--accent-bg)",
            borderRadius: 10,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 42, fontWeight: 700,
              color: dT > 200 ? "#b83025" : "var(--accent)",
              lineHeight: 1, letterSpacing: "-0.02em",
              fontFeatureSettings: "'tnum'",
            }}>{kJ.toFixed(0)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div className="eyebrow">KJ DISSIPATED</div>
              <div style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.4 }}>
                = {(dKE / 4184).toFixed(2)} 千卡的熱<br/>
                ≈ {(kJ / 12).toFixed(1)} 顆 60W 燈泡 1 分鐘的能量
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Slider label="車重(含車手)" value={mass} min={180} max={400} step={5} unit="kg"
            onChange={setMass}/>
          <Slider label="起始車速 V₁" value={v1} min={40} max={140} step={5} unit="km/h"
            onChange={(v) => { setV1(v); if (v2 > v) setV2(v); }}/>
          <Slider label="終速 V₂" value={v2} min={0} max={Math.max(v1-5, 5)} step={5} unit="km/h"
            onChange={setV2}/>
        </div>
      </div>
    </WidgetFrame>
  );
}

// ═══════════════════════════════════════════════════════════
//  05 — Torque curve
// ═══════════════════════════════════════════════════════════
function TorqueCurve() {
  const [peakRpm, setPeakRpm] = React.useState(11000);
  const [intakeLen, setIntakeLen] = React.useState(280);  // mm
  const [useRangeMin, setUseRangeMin] = React.useState(6000);
  const [useRangeMax, setUseRangeMax] = React.useState(10000);

  // Synthetic torque curve: Gaussian-ish peak centered at peakRpm
  // Peak torque magnitude depends on intake length (resonance proxy)
  const torque = (rpm) => {
    const sigma = 2500 + intakeLen * 4;  // longer intake = wider peak (handwave)
    const peak = 65 - Math.abs(intakeLen - 280) * 0.05;  // peak around 65 Nm
    const g = Math.exp(-Math.pow((rpm - peakRpm), 2) / (2 * sigma * sigma));
    return peak * g + 35 * Math.exp(-Math.pow((rpm - peakRpm*0.6), 2) / (2 * 3000 * 3000));
  };
  const power = (rpm) => torque(rpm) * rpm / 9549; // kW
  const powerHp = (rpm) => power(rpm) * 1.341;

  const W = 380, H = 220, PAD = 40;
  const xMin = 3000, xMax = 14000;
  const yMax = 80;
  const xToPx = (v) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2*PAD);
  const yToPx = (n) => H - PAD - (n / yMax) * (H - 2*PAD);

  const torquePts = [];
  const powerPts = [];
  for (let r = xMin; r <= xMax; r += 250) {
    torquePts.push(`${xToPx(r)},${yToPx(torque(r))}`);
    powerPts.push(`${xToPx(r)},${yToPx(powerHp(r))}`);
  }

  const peakTorque = torque(peakRpm).toFixed(1);
  const peakPower  = powerHp(peakRpm).toFixed(1);
  const useTorque  = ((torque(useRangeMin) + torque(useRangeMax)) / 2).toFixed(1);

  return (
    <WidgetFrame title="扭力 + 馬力曲線 · Torque & Power"
      caption="FSAE 場地多在 6000–10000 RPM — 平闊的扭力曲線比尖銳的峰值馬力重要。"
      readouts={[
        { label: "PEAK TQ",  value: peakTorque, unit: "Nm" },
        { label: "PEAK HP",  value: peakPower,  unit: "hp", accent: true },
        { label: "USE TQ",   value: useTorque,  unit: "Nm" },
      ]}
      height={300}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 200px", gap: 20,
        alignItems: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg width={W} height={H}>
            {/* Use range shading */}
            <rect x={xToPx(useRangeMin)} y={PAD}
              width={xToPx(useRangeMax) - xToPx(useRangeMin)} height={H - 2*PAD}
              fill="rgba(46,107,127,0.08)"/>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <g key={i}>
                <line x1={PAD} y1={PAD + t*(H-2*PAD)} x2={W-PAD} y2={PAD + t*(H-2*PAD)}
                  stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
                <text x={PAD-6} y={PAD + t*(H-2*PAD) + 3} textAnchor="end"
                  fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)">
                  {Math.round(yMax * (1 - t))}
                </text>
              </g>
            ))}
            {[3000, 6000, 9000, 12000].map(r => (
              <g key={r}>
                <line x1={xToPx(r)} y1={H-PAD} x2={xToPx(r)} y2={H-PAD+4}
                  stroke="var(--muted)" strokeWidth="0.5"/>
                <text x={xToPx(r)} y={H-PAD+16} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)">
                  {r/1000}k
                </text>
              </g>
            ))}
            {/* Curves */}
            <polyline points={torquePts.join(' ')}
              fill="none" stroke="#b83025" strokeWidth="2"/>
            <polyline points={powerPts.join(' ')}
              fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4,3"/>
            {/* Peak marker */}
            <line x1={xToPx(peakRpm)} y1={PAD} x2={xToPx(peakRpm)} y2={H-PAD}
              stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="2,2"/>
            <text x={xToPx(peakRpm)} y={PAD - 8} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink)" fontWeight="700">
              PEAK · {peakRpm} RPM
            </text>
            {/* Legend */}
            <g transform={`translate(${PAD + 6}, ${PAD + 6})`}>
              <line x1={0} y1={5} x2={14} y2={5} stroke="#b83025" strokeWidth="2"/>
              <text x={20} y={9} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink)">TORQUE Nm</text>
              <line x1={0} y1={20} x2={14} y2={20} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3,2"/>
              <text x={20} y={24} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink)">POWER hp</text>
            </g>
            {/* Axis labels */}
            <text x={W-PAD} y={H-12} textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--muted)"
              letterSpacing="0.06em">RPM</text>
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Slider label="峰值 RPM" value={peakRpm} min={9000} max={13000} step={250} unit="rpm"
            onChange={setPeakRpm}/>
          <Slider label="進氣歧管長度" value={intakeLen} min={150} max={450} step={10} unit="mm"
            onChange={setIntakeLen}/>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            padding: 10, background: "rgba(46,107,127,0.06)", borderRadius: 8,
          }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>USE MIN</div>
              <input type="number" value={useRangeMin} step={500}
                onChange={e => setUseRangeMin(parseInt(e.target.value) || 0)}
                style={{
                  width: "100%", background: "transparent", border: 0, borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                  color: "var(--ink)", padding: "2px 0",
                }}/>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>USE MAX</div>
              <input type="number" value={useRangeMax} step={500}
                onChange={e => setUseRangeMax(parseInt(e.target.value) || 0)}
                style={{
                  width: "100%", background: "transparent", border: 0, borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                  color: "var(--ink)", padding: "2px 0",
                }}/>
            </div>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}

// ═══════════════════════════════════════════════════════════
//  00 — System diagram (intro)
//   5 subsystems arranged in a pentagon. Hover highlights how
//   each subsystem feeds the others.
// ═══════════════════════════════════════════════════════════
function SystemDiagram() {
  const subs = [
    { id: "tyre",   label: "輪胎",    en: "Tyre",    color: "#b83025",
      desc: "唯一接觸地面的元件，決定一切抓地力上限。" },
    { id: "weight", label: "配重",    en: "Weight",  color: "#8a6610",
      desc: "決定抓地力如何被利用、過彎時負荷如何轉移。" },
    { id: "aero",   label: "空力",    en: "Aero",    color: "#0e7490",
      desc: "增加垂直負荷不增加慣性 — 物理上幾乎是作弊。" },
    { id: "brake",  label: "煞車",    en: "Brake",   color: "#2a6b38",
      desc: "把動能轉成熱能 — 設計核心是熱管理。" },
    { id: "power",  label: "動力",    en: "Power",   color: "#1c3d5e",
      desc: "扭力曲線形狀比峰值馬力重要 — 動力是放大器。" },
  ];
  const [hover, setHover] = React.useState(null);
  const cx = 200, cy = 180, R = 130;
  // Position around pentagon
  const positions = subs.map((s, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI / subs.length);
    return { ...s, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });
  const hov = hover ? positions.find(p => p.id === hover) : null;

  return (
    <WidgetFrame title="系統思考 · The Whole is Not the Parts"
      caption="懸停子系統節點看它與其他子系統的耦合關係。"
      height={400}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 220px", gap: 16,
        alignItems: "center",
      }}>
        <svg width={400} height={360} viewBox="0 0 400 360"
          style={{ margin: "0 auto", display: "block" }}>
          {/* All-to-all connector lines */}
          {positions.map((p, i) =>
            positions.slice(i + 1).map((q, j) => {
              const isHighlighted = hover && (p.id === hover || q.id === hover);
              return (
                <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                  stroke={isHighlighted ? p.color : "rgba(0,0,0,0.08)"}
                  strokeWidth={isHighlighted ? 1.5 : 0.5}
                  opacity={hover && !isHighlighted ? 0.2 : 1}
                  style={{ transition: "all .2s var(--ease-out)" }}/>
              );
            })
          )}
          {/* Nodes */}
          {positions.map(p => {
            const isHov = hover === p.id;
            const isDimmed = hover && hover !== p.id;
            return (
              <g key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer", transition: "all .2s var(--ease-out)" }}>
                <circle cx={p.x} cy={p.y} r={isHov ? 36 : 30}
                  fill={p.color + (isHov ? "f0" : "20")}
                  stroke={p.color}
                  strokeWidth={isHov ? 2 : 1}
                  opacity={isDimmed ? 0.4 : 1}
                  style={{ transition: "all .2s var(--ease-out)" }}/>
                <text x={p.x} y={p.y - 1} textAnchor="middle"
                  fontFamily="var(--font-sans)" fontSize="13" fontWeight="700"
                  fill={isHov ? "#fff" : p.color}
                  opacity={isDimmed ? 0.4 : 1}
                  style={{ transition: "all .2s var(--ease-out)" }}>
                  {p.label}
                </text>
                <text x={p.x} y={p.y + 12} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="8" fontWeight="700"
                  fill={isHov ? "rgba(255,255,255,0.7)" : "var(--muted)"}
                  opacity={isDimmed ? 0.4 : 1}
                  letterSpacing="0.06em"
                  style={{ transition: "all .2s var(--ease-out)" }}>
                  {p.en.toUpperCase()}
                </text>
              </g>
            );
          })}
          {/* Center label */}
          <text x={cx} y={cy - 4} textAnchor="middle"
            fontFamily="var(--font-serif)" fontSize="14" fontWeight="700"
            fill="var(--muted)" opacity={hover ? 0.3 : 1}>
            一台車
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9"
            fill="var(--muted)" letterSpacing="0.08em"
            opacity={hover ? 0.3 : 1}>
            ONE SYSTEM
          </text>
        </svg>
        <div style={{
          padding: 14, borderRadius: 12,
          background: hov ? hov.color + "10" : "rgba(0,0,0,0.03)",
          minHeight: 140,
          transition: "background .2s var(--ease-out)",
        }}>
          {hov ? (
            <>
              <div className="eyebrow" style={{ marginBottom: 6, color: hov.color }}>{hov.en.toUpperCase()}</div>
              <div style={{
                fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700,
                color: "var(--ink)", letterSpacing: "-0.015em", marginBottom: 8,
              }}>{hov.label}</div>
              <p style={{
                fontSize: 13, color: "var(--ink)", lineHeight: 1.6,
                textWrap: "pretty",
              }}>{hov.desc}</p>
            </>
          ) : (
            <>
              <div className="eyebrow" style={{ marginBottom: 6 }}>5 SUBSYSTEMS</div>
              <p style={{
                fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--ink)",
                lineHeight: 1.7, textWrap: "pretty",
              }}>
                每個子系統的決策都會牽動其他四個。把游標移到任一節點，看它與其他子系統的耦合線條。
              </p>
            </>
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}

Object.assign(window, {
  FrictionCircle, WeightDistribution, DownforceCurve,
  BrakeEnergy, TorqueCurve, SystemDiagram,
});
