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

Object.assign(window, {
  SectionHead, Eyebrow, Button, IconBtn, Pill, PriorityPill,
  StatusDot, ProgressBar, DisplayNumber, KPI, SubsystemTag, Avatar, ConfirmDialog,
  SegmentedControl, ViewToggle, SubsystemGridSelector, GlowingSlider,
});
