// Header.jsx — top-level page nav (Dashboard / Blueprint / Essay) + sub-tabs

function Header({ page, onPageChange, subTab, onSubTabChange, dashTabs }) {
  return (
    <div style={hdrStyles.bar}>
      <header style={{ ...hdrStyles.inner, fontFamily: "-apple-system" }}>
        <div style={hdrStyles.left}>
          <div style={hdrStyles.logoBox}>
            <img src="assets/nkust-logo.png" alt="NKUST" style={hdrStyles.logoImg} />
          </div>
          <span style={hdrStyles.wordmark}>高科大賽車隊</span>
          <span style={hdrStyles.sep}>·</span>
          <span style={hdrStyles.season}>S2026</span>
        </div>
        <nav style={hdrStyles.pageNav}>
          {[
          { id: "dashboard", label: "工作台", en: "Dashboard" },
          { id: "blueprint", label: "車體圖解", en: "Blueprint" },
          { id: "essay", label: "技術手冊", en: "First Principles" }].
          map((p) => {
            const active = page === p.id;
            return (
              <button key={p.id}
              onClick={() => onPageChange(p.id)}
              style={{ ...hdrStyles.pageTab,
                color: active ? "var(--blue)" : "var(--label-secondary)",
                fontWeight: active ? 600 : 500,
                background: active ? "var(--fill-tertiary)" : "transparent",
                opacity: 1,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--fill-quaternary)"; e.currentTarget.style.color = "var(--label-primary)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--label-secondary)"; } }}
              >
                {p.label}
              </button>);

          })}
        </nav>
        <div style={hdrStyles.actions}>
          <button style={hdrStyles.hdrBtn} title="搜尋"><UIIcon kind="search" size={14} /></button>
          <button style={hdrStyles.hdrBtn} title="匯出"><UIIcon kind="download" size={14} /></button>
          <Avatar name="陳" size={26} dark />
        </div>
      </header>
      {page === "dashboard" && dashTabs &&
      <div style={hdrStyles.subBar}>
          <div style={{ ...hdrStyles.subInner, opacity: "1" }}>
            <nav style={hdrStyles.subNav}>
              {dashTabs.map((t) =>
            <button key={t.id} onClick={() => onSubTabChange(t.id)}
            style={{
              ...hdrStyles.subTab,
              color: subTab === t.id ? "var(--label-primary)" : "var(--label-secondary)",
              fontWeight: subTab === t.id ? 600 : 400,
              borderBottomColor: subTab === t.id ? "var(--blue)" : "transparent"
            }}>
                  <UIIcon kind={t.icon} size={13} />
                  {t.label}
                  {t.count !== undefined && <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)",
                marginLeft: 2
              }}>{t.count}</span>}
                </button>
            )}
            </nav>
          </div>
        </div>
      }
    </div>);

}

const hdrStyles = {
  bar: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(255,255,255,0.62)",
    backdropFilter: "saturate(180%) blur(28px)",
    WebkitBackdropFilter: "saturate(180%) blur(28px)",
    borderBottom: "0.5px solid rgba(0,0,0,0.06)",
    boxShadow: "0 1px 0 rgba(0,0,0,0.03)"
  },
  inner: {
    display: "flex", alignItems: "center", height: 52,
    maxWidth: 1440, margin: "0 auto", padding: "0 var(--hdr-pad, 40px)", gap: 0
  },
  left: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  logoBox: {
    width: 28, height: 28, overflow: "hidden",
    display: "flex", alignItems: "center",
    flexShrink: 0
  },
  logoImg: {
    height: 28, width: "auto",
    objectFit: "cover", objectPosition: "left center",
    flexShrink: 0
  },
  mark: {
    width: 24, height: 24, borderRadius: 7, background: "var(--ink)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontFamily: "var(--font-mono)",
    fontSize: 9, fontWeight: 700, letterSpacing: "-0.4px"
  },
  wordmark: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.014em", color: "var(--ink)" },
  sep: { color: "var(--rule)", margin: "0 4px" },
  season: {
    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)",
    letterSpacing: "0.04em"
  },
  pageNav: { display: "flex", alignItems: "center", marginLeft: "auto", gap: 4 },
  pageTab: {
    padding: "7px var(--page-tab-pad, 16px)",
    background: "transparent", border: "none", borderRadius: 980,
    fontSize: "var(--page-tab-fs, 13px)", letterSpacing: "-0.005em", cursor: "pointer",
    whiteSpace: "nowrap", transition: "all .15s",
    fontWeight: 500, fontFamily: "inherit"
  },
  actions: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  hdrBtn: {
    width: 32, height: 32,            /* 32px visual, 44pt tappable area via padding */
    minWidth: 44, minHeight: 44,      /* HIG: 44pt minimum touch target */
    borderRadius: "var(--radius-sm)", background: "transparent",
    border: "none", color: "var(--blue)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background .15s, transform .1s",
    marginInline: -6,                 /* compensate extra touch area */
  },
  subBar: {
    background: "transparent"
  },
  subInner: { maxWidth: 1440, margin: "0 auto", padding: "0 var(--hdr-pad, 40px)" },
  subNav: { display: "flex", gap: 0, alignItems: "center" },
  subTab: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "10px var(--page-tab-pad, 16px)", height: 42,
    background: "transparent", border: "none",
    borderBottom: "2px solid transparent",
    fontSize: "calc(var(--page-tab-fs, 13px) - 0.5px)", cursor: "pointer", letterSpacing: "-0.005em",
    transition: "color .15s, border-color .15s, font-weight .15s",
    fontFamily: "inherit"
  }
};

window.Header = Header;