// atoms.jsx — shared low-level components used across pages

function SectionHead({ title, hint, action }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      marginBottom: "var(--gap-card)", paddingBottom: 8, gap: 12,
    }}>
      <div className="section-head">{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {hint && <div className="eyebrow">{hint}</div>}
        {action}
      </div>
    </div>
  );
}

function Eyebrow({ children, style }) {
  return <div className="eyebrow" style={style}>{children}</div>;
}

function Button({ children, variant = "default", icon, onClick, type, title, style }) {
  return (
    <button
      type={type || "button"}
      title={title}
      onClick={onClick}
      className={`btn ${variant === "primary" ? "primary" : variant === "ghost" ? "ghost" : variant === "danger" ? "danger" : ""}`}
      style={style}
    >
      {icon && <UIIcon kind={icon} size={12} />}
      {children}
    </button>
  );
}

function IconBtn({ icon, onClick, title, size = 28, danger = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size,
        background: hover ? (danger ? "rgba(255,59,48,0.10)" : "var(--fill-tertiary)") : "transparent",
        color: danger ? "var(--red)" : "var(--label-secondary)",
        border: 0, borderRadius: "var(--radius-sm)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background .15s",
      }}>
      <UIIcon kind={icon} size={Math.round(size * 0.46)} />
    </button>
  );
}

function Pill({ tone = "muted", children, style }) {
  return <span className={`pill ${tone}`} style={style}>{children}</span>;
}

function PriorityPill({ priority }) {
  if (!priority) return <Pill tone="muted">—</Pill>;
  const tone = priority === "HIGH" ? "high" : priority === "MID" ? "mid" : "low";
  const label = priority === "HIGH" ? "高" : priority === "MID" ? "中" : "低";
  return <Pill tone={tone}>{label} · {priority}</Pill>;
}

function StatusDot({ state }) {
  const c = state === "focus" ? "var(--accent)"
          : state === "done"  ? "rgba(134,134,139,0.55)"
          : "var(--ink)";
  return <span style={{ width: 7, height: 7, borderRadius: 99, background: c, display: "inline-block" }}/>;
}

function ProgressBar({ value, height = 4, accent = false, dark = false, overdue = false }) {
  // Apple HIG semantic colors: overdue=red, <50%=orange, 50-99%=blue, 100%=green
  const fill = dark ? "#fff"
    : overdue      ? "var(--red)"
    : value >= 100 ? "var(--green)"
    : value >= 50  ? "var(--blue)"
    : "var(--orange)";
  const track = dark ? "rgba(255,255,255,0.22)" : "var(--fill-tertiary)";
  return (
    <div style={{
      height, borderRadius: 99, background: track, overflow: "hidden",
    }}>
      <div style={{
        width: `${Math.min(value ?? 0, 100)}%`, height: "100%", borderRadius: 99,
        background: fill,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}/>
    </div>
  );
}

// Display number — uses theme-aware --display-family
function DisplayNumber({ value, unit, size = 48, weight = 700, color, style }) {
  return (
    <div style={{
      fontFamily: "var(--display-family)",
      fontSize: size, fontWeight: weight, lineHeight: 1,
      letterSpacing: "-0.03em", color: color || "var(--ink)",
      fontFeatureSettings: "'tnum'", display: "flex",
      alignItems: "baseline", gap: 4, ...style,
    }}>
      {value}
      {unit && (
        <small style={{
          fontFamily: "var(--font-mono)", fontSize: Math.max(11, size * 0.28),
          fontWeight: 600, color: "var(--muted)",
        }}>{unit}</small>
      )}
    </div>
  );
}

function KPI({ label, value, unit, foot, accent = false, hint }) {
  return (
    <div className={`widget-tile${accent ? " accent" : ""}`} style={{ flex: 1, minWidth: 0 }}>
      {/* EYEBROW — 11px sans uppercase, HIG widget pattern */}
      <div className="widget-eyebrow">{label}</div>
      {/* VALUE — 34px tabular bold */}
      <div className="widget-value">
        {value}{unit && <small style={{ fontSize: "0.45em", fontWeight: 600, marginLeft: 4, opacity: 0.6 }}>{unit}</small>}
      </div>
      {foot && <div className="widget-foot">{foot}</div>}
      {hint && !foot && <div className="widget-foot">{hint}</div>}
    </div>
  );
}

function SubsystemTag({ kind, withIcon = true, size = "sm" }) {
  const color = SUBSYSTEM_COLOR[kind] || "var(--label-secondary)";
  const small = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "3px 10px" : "4px 12px",
      background: color + "18",
      color: color,
      borderRadius: 9999,   /* capsule — WWDC 2025 iOS/iPadOS control style */
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      letterSpacing: "0.02em",
      lineHeight: 1.4,
      whiteSpace: "nowrap",
    }}>
      {withIcon && <SubsystemIcon kind={kind} size={small ? 10 : 12} color={color}/>}
      {kind}
    </span>
  );
}

// Name-based gradient palette — maps first char to Apple system color pairs
// Muted, low-saturation palette — calm solid tones (no vivid gradients)
const AVATAR_COLORS = [
  "#7C93B3",  // slate blue
  "#7FA39A",  // muted sage
  "#A092B5",  // dusty lavender
  "#B59A7E",  // warm taupe
  "#94A0AD",  // neutral slate
];
function Avatar({ name, size = 32, dark = false }) {
  // Guard: empty string → charCodeAt returns NaN (not caught by ??), so coerce.
  const c0 = name && name.length > 0 ? name.charCodeAt(0) : 0;
  const c1 = name && name.length > 1 ? name.charCodeAt(1) : 0;
  const bg = AVATAR_COLORS[(c0 + c1) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg,
      color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(10, size * 0.38), fontWeight: 600,
      flexShrink: 0, letterSpacing: 0,
    }}>{name?.[0] || "?"}</div>
  );
}

// Confirm dialog (delete confirmation)
function ConfirmDialog({ open, onClose, onConfirm, title, body }) {
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "var(--faint)", marginBottom: 18 }}>{body}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="danger" icon="trash" onClick={() => { onConfirm(); onClose(); }}>確定刪除</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Premium Segmented Control ───
function SegmentedControl({ options, value, onChange, style }) {
  return (
    <div className="segmented-control" style={style}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`segmented-item ${active ? "active" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── View Toggle — icon-button pair for toolbar view-switching ───
// options: [{ value, icon: SVGElement, title }]
function ViewToggle({ options, value, onChange }) {
  return (
    <div className="view-toggle" role="group">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          className={`view-toggle-btn ${opt.value === value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

// ─── Premium Subsystem Grid Selector ───
function SubsystemGridSelector({ value, onChange, multiple = false }) {
  const toggle = (s) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(s)
        ? current.filter(x => x !== s)
        : [...current, s];
      onChange(next);
    } else {
      onChange(s);
    }
  };

  return (
    <div className="subsystem-grid">
      {SUBSYSTEMS.map(s => {
        const active = multiple
          ? (Array.isArray(value) && value.includes(s))
          : value === s;
        const color = SUBSYSTEM_COLOR[s] || "#444";
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`subsystem-btn ${active ? "active" : ""}`}
            style={{
              background: active ? `${color}14` : undefined,
              borderColor: active ? `${color}40` : undefined,
              color: active ? color : undefined,
            }}
          >
            <SubsystemIcon kind={s} size={12} color={active ? color : "var(--muted)"}/>
            <span style={{ fontSize: 10 }}>{s}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Glowing Slider thumb ───
function GlowingSlider({ min = 0, max = 100, step = 1, value, onChange, label = "進度" }) {
  return (
    <div className="slider-container" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
        <label style={{
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)"
        }}>{label}</label>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
          color: "var(--accent)", letterSpacing: "-0.01em"
        }}>{value}%</span>
      </div>
      <div className="range-slider-wrapper">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || 0)}
          className="range-slider"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${value}%, rgba(0,0,0,0.06) ${value}%, rgba(0,0,0,0.06) 100%)`
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DetailPreview — 共用「放大預覽」骨架（讀模式詳情）
//  以資源預覽為基礎泛化，六個區塊共用。輕量、token-driven、深淺自適應。
//
//  props:
//   onClose                 關閉
//   onPrev / onNext         （可選）上一張/下一張 → 啟用畫廊側箭頭 + 鍵盤 ←/→
//   counter                 （可選）"3 / 12" 頁碼字串
//   hero: {
//     cover,                圖片網址（有則顯示圖 + 漸層遮罩）
//     color,                無圖時的色塊主色（預設 --fill-secondary）
//     monogram,             無圖時的字母（圓角方塊）
//     icon,                 無圖時的圖示節點（取代 monogram）
//     height,               hero 高度（預設 180）
//     ringValue,            （可選）顯示環形進度數值（0-100），用於任務
//   }
//   badges                  hero 左下角的 badge 節點（型別/狀態/優先度）
//   title, subtitle, body   主標 / 副標 / 內文
//   tags                    標籤列節點（如 SubsystemTag）
//   meta: [{label, value, href}]   屬性行（HIG inset separator）
//   children                自訂插槽（如計畫的狀態切換）
//   footer                  底部動作節點（編輯/刪除/開連結）
//   width                   預設 480
// ─────────────────────────────────────────────────────────────
function RingProgress({ value = 0, size = 64, stroke = 6, color = "var(--blue)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--fill-tertiary)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - v/100)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(0.4,0,0.2,1)" }}/>
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: size*0.26, fontWeight: 700,
        color: "var(--label-primary)", fontFeatureSettings: "'tnum'",
      }}>{v}<span style={{ fontSize: size*0.15, fontWeight: 600, opacity: 0.5 }}>%</span></div>
    </div>
  );
}

// Track the last pointer-down position so previews can zoom from the click origin.
let __lastPointer = null;
if (typeof window !== "undefined" && !window.__previewPointerHooked) {
  window.__previewPointerHooked = true;
  window.addEventListener("pointerdown", (e) => {
    __lastPointer = { x: e.clientX, y: e.clientY };
  }, true);
}

function DetailPreview({
  onClose, onPrev, onNext, counter,
  hero = {}, badges, title, subtitle, body, tags, meta = [], children, footer,
  width = 480,
}) {
  const META_CAP = 5;
  const [metaExpanded, setMetaExpanded] = React.useState(false);
  const shownMeta = metaExpanded ? meta : meta.slice(0, META_CAP);

  // zoom-from-source: set transform-origin to where the user clicked
  const cardRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el || !__lastPointer) return;
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = `${__lastPointer.x - r.left}px ${__lastPointer.y - r.top}px`;
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft")  onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const { cover, color = "var(--fill-secondary)", monogram, icon, node, height = 180, ringValue } = hero;
  const heroColor = typeof color === "string" ? color : "var(--fill-secondary)";

  const arrow = (dir, fn) => (
    <button onClick={(e) => { e.stopPropagation(); fn(); }} title={dir === "prev" ? "上一個 (←)" : "下一個 (→)"}
      style={{
        position: "absolute", top: "50%", [dir === "prev" ? "left" : "right"]: -56,
        transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%",
        border: "none", background: "rgba(255,255,255,0.14)", color: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <polyline points={dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}/>
      </svg>
    </button>
  );

  return (
    <div className="modal-back" style={{ zIndex: 600, padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: width }}>
        {onPrev && arrow("prev", onPrev)}
        {onNext && arrow("next", onNext)}

        <div ref={cardRef} style={{
          width: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column",
          /* WWDC25 sheet 材質：毛玻璃 + 細描邊 + 高光 */
          background: "var(--glass-fill-strong)",
          backdropFilter: "blur(30px) saturate(180%)", WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "0.5px solid var(--separator)", borderRadius: "var(--radius-2xl)",
          overflow: "hidden", boxShadow: "var(--card-highlight), var(--shadow-modal)",
          animation: "detail-zoom .34s var(--ease-spring, cubic-bezier(0.32,0.72,0,1))",
        }}>
          {/* HERO（固定，不捲動） */}
          <div style={{
            height, flexShrink: 0, position: "relative",
            background: cover ? `url('${cover}') center/cover` : heroColor,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {!cover && node}
            {!cover && !node && ringValue !== undefined && <RingProgress value={ringValue}/>}
            {!cover && !node && ringValue === undefined && (icon ? (
              <div style={{
                width: 72, height: 72, borderRadius: "var(--radius-lg)",
                background: "var(--bg-secondary)", boxShadow: "var(--shadow-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{icon}</div>
            ) : monogram ? (
              <div style={{
                width: 72, height: 72, borderRadius: "var(--radius-lg)",
                background: "var(--bg-secondary)", boxShadow: "var(--shadow-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, fontWeight: 800, color: heroColor.startsWith("var") ? "var(--label-primary)" : heroColor,
              }}>{monogram}</div>
            ) : null)}
            {cover && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)" }}/>}

            {/* close */}
            <button onClick={onClose} title="關閉 (Esc)" style={{
              position: "absolute", top: 12, right: 12, width: 30, height: 30,
              borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.40)", color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 2,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {badges && (
              <div style={{ position: "absolute", bottom: 12, left: 16, display: "flex", gap: 6, alignItems: "center", zIndex: 2 }}>
                {badges}
              </div>
            )}
          </div>

          {/* BODY（唯一捲動區，高度受 88vh 限制 → 不巢狀捲動） */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 22px 8px" }} className="scroll-soft">
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--label-primary)", margin: 0, lineHeight: 1.25 }}>{title}</h2>
            {subtitle && <div style={{ fontSize: 13, color: "var(--label-secondary)", marginTop: 4 }}>{subtitle}</div>}
            {body && <p style={{ fontSize: 15, color: "var(--label-secondary)", lineHeight: 1.6, marginTop: 10, whiteSpace: "pre-wrap", textWrap: "pretty" }}>{body}</p>}
            {tags && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>{tags}</div>}

            {meta.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column" }}>
                {shownMeta.map(({ label, value, href }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "0.5px solid var(--separator)", gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--label-tertiary)", flexShrink: 0 }}>{label}</span>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 500, color: "var(--blue)", display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                        {value} <UIIcon kind="external" size={12}/>
                      </a>
                    ) : (
                      <span style={{ fontSize: 15, fontWeight: 500, color: "var(--label-primary)", textAlign: "right" }}>{value}</span>
                    )}
                  </div>
                ))}
                {/* 漸進揭露：超過 5 條才出現「展開更多」 */}
                {meta.length > META_CAP && (
                  <button onClick={() => setMetaExpanded(v => !v)}
                    style={{
                      marginTop: 4, padding: "10px 0", border: "none", borderTop: "0.5px solid var(--separator)",
                      background: "transparent", color: "var(--blue)", fontSize: 13, fontWeight: 600,
                      fontFamily: "inherit", cursor: "pointer", textAlign: "left",
                    }}>
                    {metaExpanded ? "收合" : `展開更多（${meta.length - META_CAP}）`}
                  </button>
                )}
              </div>
            )}

            {children}
          </div>

          {footer && (
            <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 22px 20px", borderTop: "0.5px solid var(--separator)" }}>{footer}</div>
          )}
        </div>

        {counter && (
          <div style={{ position: "absolute", bottom: -28, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>{counter}</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  SectionHead, Eyebrow, Button, IconBtn, Pill, PriorityPill,
  StatusDot, ProgressBar, DisplayNumber, KPI, SubsystemTag, Avatar, ConfirmDialog,
  SegmentedControl, ViewToggle, SubsystemGridSelector, GlowingSlider,
  DetailPreview, RingProgress,
});
