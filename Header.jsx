// Header.jsx — top-level page nav (Dashboard / Blueprint / Essay) + sub-tabs

function Header({ page, onPageChange, subTab, onSubTabChange, dashTabs, appearance = "auto", onAppearanceChange }) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const menuWrapRef = React.useRef(null);
  React.useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    const onEsc = (e) => { if (e.key === "Escape") setSettingsOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
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

          {/* Avatar — doubles as the account / settings menu trigger */}
          <div ref={menuWrapRef} style={{ position: "relative" }}>
            <button style={{ ...hdrStyles.avatarBtn, boxShadow: settingsOpen ? "0 0 0 2px var(--blue)" : "none" }}
              title="帳號與設定" onClick={() => setSettingsOpen(v => !v)}>
              <Avatar name="陳" size={28} />
            </button>

            {settingsOpen && (
              <div style={hdrStyles.menu}>
                {/* Account header */}
                <div style={hdrStyles.menuProfile}>
                  <Avatar name="陳" size={38} />
                  <div style={{ minWidth: 0 }}>
                    <div style={hdrStyles.menuName}>陳偉成</div>
                    <div style={hdrStyles.menuRole}>隊長 · 高科大賽車隊</div>
                  </div>
                </div>

                <div style={hdrStyles.menuDivider}/>

                <div style={hdrStyles.menuSectionLabel}>外觀</div>
                {[
                  { id: "light", label: "淺色" },
                  { id: "dark",  label: "深色" },
                  { id: "auto",  label: "自動" },
                ].map(opt => {
                  const active = appearance === opt.id;
                  return (
                    <button key={opt.id} onClick={() => onAppearanceChange?.(opt.id)}
                      style={hdrStyles.menuRow}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--fill-tertiary)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={hdrStyles.menuRowIcon}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          {opt.id === "light" && <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>}
                          {opt.id === "dark" && <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
                          {opt.id === "auto" && <><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></>}
                        </svg>
                      </span>
                      <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 400, color: "var(--label-primary)" }}>{opt.label}</span>
                      {active && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
  avatarBtn: {
    width: 28, height: 28, padding: 0, border: "none", background: "transparent",
    borderRadius: "50%", cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "box-shadow .15s",
  },
  /* ── Apple-style account / settings menu ── */
  menu: {
    position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 200,
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--separator)",
    borderRadius: 14,
    boxShadow: "var(--shadow-4)",
    padding: 7, minWidth: 248,
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    transformOrigin: "top right",
    animation: "modal-pop .22s var(--ease-out)",
  },
  menuProfile: {
    display: "flex", alignItems: "center", gap: 11,
    padding: "8px 10px 10px",
  },
  menuName: {
    fontSize: 15, fontWeight: 600, color: "var(--label-primary)",
    letterSpacing: "-0.01em", lineHeight: 1.2,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  menuRole: {
    fontSize: 12, color: "var(--label-secondary)", lineHeight: 1.3, marginTop: 2,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  menuDivider: { height: "0.5px", background: "var(--separator)", margin: "3px 4px 5px" },
  menuSectionLabel: {
    fontSize: 11, fontWeight: 600, color: "var(--label-tertiary)",
    letterSpacing: "0.02em", padding: "4px 12px 6px",
  },
  menuRow: {
    display: "flex", alignItems: "center", gap: 11, width: "100%",
    padding: "8px 12px", border: "none", background: "transparent",
    borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
    transition: "background .12s",
  },
  menuRowIcon: {
    width: 22, display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--label-secondary)", flexShrink: 0,
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