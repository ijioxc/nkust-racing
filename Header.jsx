// Header.jsx — top-level page nav (Dashboard / Blueprint / Essay) + sub-tabs

function Header({ page, onPageChange, subTab, onSubTabChange, dashTabs, appearance = "auto", onAppearanceChange }) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  React.useEffect(() => {
    if (!settingsOpen) return;
    const close = () => setSettingsOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [settingsOpen]);
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

          {/* Settings — appearance toggle */}
          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
            <button style={{ ...hdrStyles.hdrBtn, color: settingsOpen ? "var(--blue)" : "var(--label-secondary)", background: settingsOpen ? "var(--fill-tertiary)" : "transparent" }}
              title="設定" onClick={() => setSettingsOpen(v => !v)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {settingsOpen && (
              <div style={hdrStyles.settingsPanel}>
                <div style={hdrStyles.settingsLabel}>外觀 · APPEARANCE</div>
                <div style={hdrStyles.appearanceRow}>
                  {[
                    { id: "light", label: "淺色", icon: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4", circle: true },
                    { id: "dark",  label: "深色", moon: true },
                    { id: "auto",  label: "自動", auto: true },
                  ].map(opt => {
                    const active = appearance === opt.id;
                    return (
                      <button key={opt.id} onClick={() => onAppearanceChange?.(opt.id)}
                        style={{ ...hdrStyles.appearanceBtn,
                          background: active ? "var(--blue)" : "var(--fill-tertiary)",
                          color: active ? "#fff" : "var(--label-secondary)",
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          {opt.circle && <><circle cx="12" cy="12" r="4"/><path d={opt.icon}/></>}
                          {opt.moon && <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
                          {opt.auto && <><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></>}
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
    background: "var(--header-bg)",
    backdropFilter: "saturate(180%) blur(28px)",
    WebkitBackdropFilter: "saturate(180%) blur(28px)",
    borderBottom: "0.5px solid var(--header-border)",
    boxShadow: "var(--header-shadow)"
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
  settingsPanel: {
    position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--separator)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-3)",
    padding: 12, minWidth: 220,
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    animation: "modal-pop .25s var(--ease-out)",
  },
  settingsLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--label-tertiary)",
    marginBottom: 8, paddingInline: 2,
  },
  appearanceRow: { display: "flex", gap: 6 },
  appearanceBtn: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    gap: 6, padding: "10px 6px", border: "none",
    borderRadius: "var(--radius-sm)", cursor: "pointer",
    fontFamily: "inherit", transition: "background .15s, color .15s",
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