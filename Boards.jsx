// Boards.jsx — Parts (Kanban by category) + Resources (Races/Tools/Learning)

// ═══════════════════════════════════════════════════════════
//  PARTS — Kanban by supplier category, drag-between-columns
// ═══════════════════════════════════════════════════════════
function PartsView({ suppliers, setSuppliers }) {
  const [editing, setEditing] = React.useState({ open: false, initial: null });
  const [preview, setPreview] = React.useState(null);  // supplier being previewed
  const [confirm, setConfirm] = React.useState(null);
  const [drag, setDrag] = React.useState(null);     // dragged supplier id
  const [overSub, setOverSub] = React.useState(null); // target column sub
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 768);
  const [mobileSub, setMobileSub] = React.useState(SUBSYSTEMS[0]);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const save = (s) => setSuppliers(prev => {
    if (s.id) return prev.map(x => x.id === s.id ? { ...x, ...s } : x);
    return [...prev, { ...s, id: "s" + Date.now() }];
  });
  const remove = (s) => setSuppliers(prev => prev.filter(x => x.id !== s.id));

  const onDragStart = (id) => () => setDrag(id);
  const onDragEnd = () => { setDrag(null); setOverSub(null); };
  const onDragOver = (sub) => (e) => { e.preventDefault(); setOverSub(sub); };
  const onDrop = (sub) => (e) => {
    e.preventDefault();
    if (!drag) return;
    setSuppliers(prev => prev.map(x => x.id === drag ? { ...x, sub } : x));
    setDrag(null); setOverSub(null);
  };

  // Aggregate stats
  const total = suppliers.length;
  const high  = suppliers.filter(s => s.priority === "HIGH").length;
  const ordered = suppliers.filter(s => ["已下單","已收到"].includes(s.status)).length;
  const sponsor = suppliers.filter(s => s.status === "贊助申請").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      <div className="kpi-strip" style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="TOTAL"     value={total}/>
        <KPI label="HIGH PRIO" value={high}/>
        <KPI label="ORDERED"   value={ordered} unit={`/ ${total}`} foot="已下單+已收到"/>
        <KPI label="SPONSOR"   value={sponsor} foot="贊助申請中"/>
      </div>

      {!isMobile && (
        <SectionHead title="零件供應商 · Suppliers" hint={`${total} ITEMS · KANBAN BY SYSTEM`}
          action={<Button variant="primary" icon="plus"
            onClick={() => setEditing({ open: true, initial: null })}>新增項目</Button>}/>
      )}

      {isMobile ? (
        /* ── Mobile: system tabs + vertical list ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* System picker + add button 同一列 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* System picker — 所有 7 個系統一排顯示，active 改文字 */}
          <div className="hdr-sub-nav" style={{
            display: "flex", gap: 12, flex: 1,
            marginInline: -16,
            paddingInline: 16,
          }}>
            {SUBSYSTEMS.map(sub => {
              const cnt = suppliers.filter(s => s.sub === sub).length;
              const active = mobileSub === sub;
              const color = SUBSYSTEM_COLOR[sub];
              return (
                <button key={sub} onClick={() => setMobileSub(sub)}
                  style={{
                    flex: active ? "0 0 48px" : "0 0 38px",
                    height: active ? 48 : 38,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 0,
                    borderRadius: active ? 13 : 10,
                    border: active
                      ? `1.5px solid ${color}88`
                      : "0.5px solid var(--separator)",
                    background: active ? color + "1a" : "var(--card-fill)",
                    cursor: "pointer", position: "relative",
                    transition: "all .18s", overflow: "hidden",
                  }}>
                  {/* Colored top accent bar */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: active ? 2.5 : 1.5,
                    background: active ? color : color + "44",
                    borderRadius: "10px 10px 0 0",
                  }}/>
                  {/* Count badge — inactive only */}
                  {cnt > 0 && !active && (
                    <div style={{
                      position: "absolute", top: 3, right: 3,
                      minWidth: 13, height: 13, borderRadius: 99,
                      background: "rgba(120,120,128,0.22)",
                      color: "var(--muted)",
                      fontSize: 8, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 2px",
                    }}>{cnt}</div>
                  )}
                  {/* inactive → icon / active → text label */}
                  {active ? (
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "-0.02em",
                      color: color, lineHeight: 1,
                    }}>{sub}</span>
                  ) : (
                    <SubsystemIcon kind={sub} size={16} color={color + "99"}/>
                  )}
                </button>
              );
            })}
          {/* + button 直接置入滾動列的最後一個元素，避免左右分裂與對齊跑掉 */}
          <button onClick={() => setEditing({ open: true, initial: { sub: mobileSub, status: "詢價" } })}
            style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: 10,
              background: "var(--card-fill)",
              border: "0.5px solid var(--separator)",
              color: "var(--faint)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.borderColor = "var(--blue)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--faint)"; e.currentTarget.style.borderColor = "var(--separator)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          </div>
          </div>{/* end picker + add row */}

          {/* Vertical list for selected system */}
          {(() => {
            const items = suppliers
              .filter(s => s.sub === mobileSub)
              .sort((a, b) => {
                const pWeight = { HIGH: 3, MID: 2, LOW: 1 };
                return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
              });
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.length === 0 && (
                  <div style={{
                    padding: "32px 16px", textAlign: "center",
                    color: "var(--muted)", fontSize: 12,
                    fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                    border: "1px dashed var(--rule)", borderRadius: 12,
                  }}>EMPTY — 此系統尚無項目</div>
                )}
                {items.map(s => (
                  <SupplierCard key={s.id} supplier={s}
                    draggable={false}
                    dragging={false}
                    onDragStart={() => {}}
                    onDragEnd={() => {}}
                    onClick={() => setPreview(s)}
                    onDelete={() => setConfirm(s)}/>
                ))}
                <button onClick={() => setEditing({ open: true, initial: { sub: mobileSub, status: "詢價" } })}
                  style={{
                    padding: "10px", borderRadius: 10,
                    background: "transparent", border: "0.5px dashed var(--rule)",
                    color: "var(--muted)", fontSize: 12, cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}><UIIcon kind="plus" size={12}/>新增 {mobileSub} 項目</button>
              </div>
            );
          })()}
        </div>
      ) : (
        /* ── Desktop: original Kanban grid ── */
        <div className="parts-kanban-container">
        <div className="parts-kanban-grid" style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SUBSYSTEMS.length}, 1fr)`,
          gap: 10, alignItems: "start",
        }}>
          {SUBSYSTEMS.map(sub => {
            const items = suppliers
              .filter(s => s.sub === sub)
              .sort((a, b) => {
                const pWeight = { HIGH: 3, MID: 2, LOW: 1 };
                return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
              });
            const isOver = overSub === sub;
            return (
              <div key={sub}
                onDragOver={onDragOver(sub)}
                onDrop={onDrop(sub)}
                className={`tcard ${isOver ? "drag-over" : ""}`}
                style={{
                  padding: 12, display: "flex", flexDirection: "column", gap: 8,
                  minHeight: 220,
                  outline: isOver ? "2px solid var(--accent)" : "none",
                  outlineOffset: -2,
                  background: isOver ? "var(--accent-bg)" : "var(--card-fill)",
                  transition: "background .15s, outline-color .15s",
                }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "2px 4px 8px",
                  borderBottom: "0.5px solid var(--rule)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <SubsystemIcon kind={sub} size={12} color={SUBSYSTEM_COLOR[sub]}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{sub}</span>
                  </div>
                  <span className="eyebrow">{items.length}</span>
                </div>
                {items.map(s => (
                  <SupplierCard key={s.id} supplier={s}
                    draggable
                    dragging={drag === s.id}
                    onDragStart={onDragStart(s.id)}
                    onDragEnd={onDragEnd}
                    onClick={() => setPreview(s)}
                    onDelete={() => setConfirm(s)}/>
                ))}
                {items.length === 0 && (
                  <div style={{
                    padding: "20px 12px", textAlign: "center",
                    color: "var(--muted)", fontSize: 11,
                    fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                    border: "1px dashed var(--rule)", borderRadius: 8,
                  }}>EMPTY</div>
                )}
                <button onClick={() => setEditing({ open: true, initial: { sub, status: "詢價" } })}
                  style={{
                    padding: "8px 10px", borderRadius: 8,
                    background: "transparent", border: "0.5px dashed var(--rule)",
                    color: "var(--muted)", fontSize: 11, cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}><UIIcon kind="plus" size={11}/>新增項目</button>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* 放大預覽 — 點供應商卡先預覽，再決定編輯/刪除/開連結 */}
      {preview && (
        <SupplierPreview supplier={preview}
          onClose={() => setPreview(null)}
          onEdit={() => { setEditing({ open: true, initial: preview }); setPreview(null); }}
          onDelete={() => { setConfirm(preview); setPreview(null); }}/>
      )}

      <SupplierModal open={editing.open} initial={editing.initial}
        onClose={() => setEditing({ open: false, initial: null })}
        onSave={save} onDelete={remove}/>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="確定刪除這筆資料？"
        body={confirm ? `「${confirm.name}」將被永久移除。` : ""}
        onConfirm={() => confirm && remove(confirm)}/>
    </div>
  );
}

function SupplierCard({ supplier, draggable, dragging, onDragStart, onDragEnd, onClick, onDelete }) {
  const tone = STATUS_TONES[supplier.status] || STATUS_TONES["詢價"];
  const prioTone = supplier.priority === "HIGH" ? "high" : supplier.priority === "MID" ? "mid" : "low";
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`tcard tile hoverable ${dragging ? "dragging" : ""}`}
      style={{
        padding: 12, cursor: "pointer",
        background: "var(--bg-secondary)",
        border: "0.5px solid var(--separator)",
        position: "relative",
        display: "flex", flexDirection: "column", gap: 7,
      }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 6,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "var(--label-primary)",
          letterSpacing: "-0.005em", lineHeight: 1.3, flex: 1,
          display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
        }}>
          {supplier.name}
        </div>
        <span className="drag-handle" style={{ flexShrink: 0, marginTop: 1 }}>
          <UIIcon kind="grip" size={12}/>
        </span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
        color: "var(--label-primary)", letterSpacing: 0,
      }}>{supplier.price}</div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6,
        marginTop: 2, height: 20, // Provide some fixed height so it doesn't collapse if empty
      }}>
        <div title={tone.label} style={{
          width: 8, height: 8, borderRadius: "50%", background: tone.fg,
          flexShrink: 0
        }} />
        {supplier.url && (
          <a
            href={supplier.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex",
              color: "var(--label-secondary)",
              transition: "color 0.2s",
              padding: "2px 4px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--label-secondary)"; }}
            title="前往官方網站"
          >
            <UIIcon kind="external" size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── SupplierPreview — 放大預覽（建於共用 CardPreview）───
function SupplierPreview({ supplier, onClose, onEdit, onDelete }) {
  if (!supplier) return null;
  const tone = STATUS_TONES[supplier.status] || STATUS_TONES["詢價"];
  const prioTone = supplier.priority === "HIGH" ? "high" : supplier.priority === "MID" ? "mid" : "low";
  const color = SUBSYSTEM_COLOR[supplier.sub] || "var(--blue)";

  return (
    <CardPreview
      onClose={onClose}
      color={color}
      node={
        <div style={{
          position: "relative", width: 120, height: 120, borderRadius: 24,
          background: `color-mix(in srgb, ${color} 20%, transparent)`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <SubsystemIcon kind={supplier.sub} size={64} color={color}/>
        </div>
      }
      badges={<>
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "3px 10px", borderRadius: "var(--radius-full)",
          background: "var(--bg-secondary)", color: tone.fg,
          fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
          backdropFilter: "blur(8px)",
        }}>{tone.label}</span>
      </>}
      title={supplier.name}
      subtitle={supplier.cat ? `${supplier.cat} · ${supplier.sub}` : supplier.sub}
      meta={[
        { label: "估算價格", value: supplier.price || "—" },
        { label: "採購狀態", value: tone.label },
        ...(supplier.url ? [{ label: "官網", value: getDomain(supplier.url), href: supplier.url }] : []),
      ]}
      actions={<>
        <IconBtn danger icon="trash" style={{ marginRight: "auto" }} onClick={onDelete} title="刪除" />
        {supplier.url && (
          <IconBtn icon="external"
            onClick={() => window.open(supplier.url, "_blank", "noopener")} title="開啟連結" />
        )}
        <IconBtn icon="edit" onClick={onEdit} title="編輯" />
      </>}
    />
  );
}

// ─── Supplier Schema & Modal Wrapper ────────────────────────
const SUPPLIER_SCHEMA = [
  { key: "name", label: "名稱", type: "text", placeholder: "例： OZ Racing 方程式輪圈", autoFocus: true },
  { key: "sub", label: "系統", type: "segmented", options: [
    { value: "車體", label: "車體" },
    { value: "引擎", label: "引擎" },
    { value: "懸吊", label: "懸吊" },
    { value: "煞車", label: "煞車" },
    { value: "電裝", label: "電裝" },
    { value: "空力", label: "空力" },
    { value: "其他", label: "其他" }
  ]},
  { key: "status", label: "採購", type: "segmented", options: [
    { value: "詢價", label: "詢價" },
    { value: "比較中", label: "比較中" },
    { value: "已下單", label: "已下單" },
    { value: "已收到", label: "已收到" },
    { value: "贊助申請", label: "贊助申請" },
    { value: "備案", label: "備案" }
  ]},
  { key: "price", label: "價格", type: "text", placeholder: "$0 / set" },
  { key: "url", label: "連結", type: "text", placeholder: "https://..." },
];

function SupplierModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = { name: "", price: "", sub: "車體",
                  status: "詢價", url: "" };
  return (
    <DynamicEditorModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      initial={initial || blank}
      schema={SUPPLIER_SCHEMA}
      eyebrow={!initial?.id ? "NEW SUPPLIER ITEM" : "EDIT SUPPLIER ITEM"}
      titleKey="name"
      renderPreview={(data) => {
        const SupplierCard = window.SupplierCard;
        if (!SupplierCard) return null;
        return (
          <div style={{ width: "100%", transform: "scale(0.95)", transformOrigin: "center" }}>
            <SupplierCard supplier={data} onClick={() => {}} />
          </div>
        );
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  RESOURCES — Races / Tools / Learning library
// ═══════════════════════════════════════════════════════════
function ResourcesView({ resources, setResources }) {
  const [filter, setFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState("card");
  const [editing, setEditing] = React.useState({ open: false, initial: null });
  const [preview, setPreview] = React.useState(null);  // resource being previewed
  const [confirm, setConfirm] = React.useState(null);
  const [search, setSearch] = React.useState("");

  const visible = resources.filter(r => {
    if (filter !== "all" && r.group !== filter) return false;
    if (search && !(r.name + r.org + r.note).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groups = [
    { id: "races",    label: "賽事資訊", en: "Races",    icon: "flag",  desc: "官方規則、賽事行事曆、scrutineering 文件" },
    { id: "tools",    label: "工程工具", en: "Tools",    icon: "wrench", desc: "贊助 / 授權的 CAE 與設計軟體" },
    { id: "learning", label: "學習資源", en: "Library",  icon: "book",  desc: "技術參考書、論文、設計判定範本" },
  ];

  const save = (r) => setResources(prev => {
    if (r.id) return prev.map(x => x.id === r.id ? { ...x, ...r } : x);
    return [...prev, { ...r, id: r.group[0] + Date.now() }];
  });
  const remove = (r) => setResources(prev => prev.filter(x => x.id !== r.id));

  return (
    <div className="resources-view" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* KPI strip — 4 cards: TOTAL + 3 groups */}
      <div className="kpi-strip" style={{ display: "flex", gap: "var(--gap-card)" }}>
        {/* TOTAL */}
        <div className="tcard tile hoverable" style={{
          flex: 1, minWidth: 0, padding: "var(--tile-pad)", cursor: "pointer",
          overflow: "hidden",
        }} onClick={() => setFilter("all")}>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <UIIcon kind="layers" size={11}/>
            ALL
          </div>
          <div className="resource-kpi-num" style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
            <DisplayNumber value={resources.length} size={36}/>
            <span className="resource-kpi-label" style={{
              fontSize: 13, fontWeight: 600, color: "var(--ink)",
              letterSpacing: "-0.01em", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>所有資源</span>
          </div>
          <div className="resource-kpi-desc" style={{ fontSize: 12, color: "var(--faint)", marginTop: 6, lineHeight: 1.4 }}>
            賽事 · 工具 · 學習資源總計
          </div>
        </div>
        {groups.map(g => {
          const items = resources.filter(r => r.group === g.id);
          return (
            <div key={g.id} className="tcard tile hoverable" style={{
              flex: 1, minWidth: 0, padding: "var(--tile-pad)", cursor: "pointer",
              overflow: "hidden",
            }} onClick={() => setFilter(g.id)}>
              <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <UIIcon kind={g.icon} size={11}/>
                {g.en}
              </div>
              <div className="resource-kpi-num" style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <DisplayNumber value={items.length} size={36}/>
                <span className="resource-kpi-label" style={{
                  fontSize: 13, fontWeight: 600, color: "var(--ink)",
                  letterSpacing: "-0.01em", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{g.label}</span>
              </div>
              <div className="resource-kpi-desc" style={{ fontSize: 12, color: "var(--faint)", marginTop: 6, lineHeight: 1.4 }}>
                {g.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile unified glass pill — [全部][賽事][工具][學習] | [⊞][≡][+] */}
      <div className="resources-mobile-cat">
        {/* Category icon buttons */}
        {[{ id: "all", label: "全部", icon: "filter" }, ...groups.map(g => ({ id: g.id, label: g.label, icon: g.icon }))].map(g => {
          const active = filter === g.id;
          return (
            <button key={g.id} onClick={() => setFilter(g.id)} title={g.label}
              className={active ? "seg-btn--active" : ""}
              style={{ padding: "0 9px", height: 28, borderRadius: 999, border: 0, cursor: "pointer",
                background: active ? "#fff" : "transparent", flexShrink: 0,
                color: active ? "var(--ink)" : "var(--faint)",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                display: "inline-flex", alignItems: "center", transition: "all .15s",
              }}>
              <UIIcon kind={g.icon} size={13}/>
            </button>
          );
        })}

        {/* Separator */}
        <div style={{ width: 1, alignSelf: "stretch", background: "rgba(120,120,128,0.35)", margin: "4px 3px", flexShrink: 0 }}/>

        {/* View toggle: 圖卡 / 列表 — single toggle button */}
        <button onClick={() => setViewMode(v => v === "card" ? "list" : "card")}
          title={viewMode === "card" ? "切換列表" : "切換圖卡"}
          className="seg-btn--active"
          style={{ padding: "0 9px", height: 28, borderRadius: 999, border: 0, cursor: "pointer",
            background: "#fff", flexShrink: 0, color: "var(--ink)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            display: "inline-flex", alignItems: "center", transition: "all .15s",
          }}>
          {viewMode === "card"
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>
          }
        </button>

        {/* + add button */}
        <button onClick={() => setEditing({ open: true, initial: { group: filter === "all" ? "races" : filter } })}
          title="新增資源"
          style={{ padding: "0 10px", height: 28, borderRadius: 999, border: 0, cursor: "pointer",
            background: "transparent", color: "var(--ink)", flexShrink: 0,
            display: "inline-flex", alignItems: "center",
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      <SectionHead title="資源庫 · Library" hint={`${visible.length} OF ${resources.length} ITEMS`}
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="section-search-box" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", background: "rgba(0,0,0,0.04)",
              borderRadius: 999, height: 28,
            }}>
              <UIIcon kind="search" size={12} color="var(--muted)"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋…"
                style={{
                  background: "transparent", border: 0, outline: 0,
                  fontSize: 12, fontFamily: "inherit", width: 130,
                  color: "var(--ink)",
                }}/>
            </div>
            <SegmentedFilter className="view-filter" value={filter} onChange={setFilter} options={[
              { id: "all",      label: "全部" },
              { id: "races",    label: "賽事" },
              { id: "tools",    label: "工具" },
              { id: "learning", label: "學習" },
            ]}/>
            <SegmentedFilter className="view-toggle" value={viewMode} onChange={setViewMode} options={[
              { id: "card",     label: "圖卡" },
              { id: "list",     label: "列表" },
            ]}/>
            <Button variant="primary" icon="plus"
              onClick={() => setEditing({ open: true, initial: { group: filter === "all" ? "races" : filter } })}>
              新增資源
            </Button>
          </div>
        }/>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {(filter === "all" ? groups : groups.filter(g => g.id === filter)).map(g => {
          const items = visible.filter(r => r.group === g.id);
          if (items.length === 0 && filter !== "all") return (
            <EmptyState key={g.id} icon={g.icon} label={`沒有符合「${g.label}」的資源`}/>
          );
          if (items.length === 0) return null;
          return (
            <div key={g.id}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10,
                paddingBottom: 6,
              }}>
                <UIIcon kind={g.icon} size={14} color="var(--muted)"/>
                <div style={{
                  fontFamily: "var(--display-family)",
                  fontSize: 17, fontWeight: 700, color: "var(--ink)",
                  letterSpacing: "-0.015em",
                }}>{g.label}</div>
                <div className="eyebrow">{g.en} · {items.length}</div>
              </div>
              {viewMode === "list" ? (
                <div className="tcard large" style={{ padding: 8 }}>
                  {items.map((r, i) => (
                    <ResourceRow key={r.id} item={r} index={i + 1}
                      onClick={() => setPreview(r)}
                      onDelete={() => setConfirm(r)}/>
                  ))}
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                  marginBottom: 16
                }}>
                  {items.map((r) => (
                    <ResourceCard key={r.id} item={r}
                      onClick={() => setPreview(r)}/>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 放大預覽 — 點圖卡先進此預覽，再決定編輯/刪除/開連結 */}
      {preview && (
        <ResourcePreview
          item={preview}
          onClose={() => setPreview(null)}
          onEdit={() => { setEditing({ open: true, initial: preview }); setPreview(null); }}
          onDelete={() => { setConfirm(preview); setPreview(null); }}/>
      )}

      <ResourceModal open={editing.open} initial={editing.initial}
        onClose={() => setEditing({ open: false, initial: null })}
        onSave={save} onDelete={remove}/>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="確定刪除這筆資料？"
        body={confirm ? `「${confirm.name}」將被永久移除。` : ""}
        onConfirm={() => confirm && remove(confirm)}/>
    </div>
  );
}

const getDomain = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1] : url;
  }
};

const getMonogram = (item) => {
  const domain = getDomain(item.url);
  if (domain) return domain[0].toUpperCase();
  return (item.org || item.name || "?")[0].toUpperCase();
};

// Apple HIG group accent colors (Apple system palette)
const RESOURCE_GROUP_THEME = {
  races:    { color: "var(--red)",   tint: "rgba(255,59,48,0.10)",  label: "RACE"  },
  tools:    { color: "var(--blue)",  tint: "rgba(0,122,255,0.10)",  label: "TOOL"  },
  learning: { color: "var(--green)", tint: "rgba(52,199,89,0.10)",  label: "LEARN" },
};

function ResourceCard({ item, onClick }) {
  const monogram = getMonogram(item);
  const prioTone = item.priority === "HIGH" ? "high" : item.priority === "MID" ? "mid" : "low";
  const theme = RESOURCE_GROUP_THEME[item.group] || RESOURCE_GROUP_THEME.learning;
  const typeLabel = item.group === "races" ? "RACE"
    : item.group === "tools" ? "TOOL"
    : (item.date === "Book" || item.date === "PDF" || item.date === "Web") ? item.date.toUpperCase()
    : "LEARN";

  return (
    <div
      onClick={onClick}
      className="tcard large hoverable"
      style={{
        display: "flex", flexDirection: "column",
        overflow: "hidden", height: 248, cursor: "pointer",
        background: "var(--card-fill)",
        backdropFilter: "var(--card-blur)", WebkitBackdropFilter: "var(--card-blur)",
        border: "var(--card-border)",
        boxShadow: "var(--card-highlight), var(--card-shadow)",
      }}
    >
      {/* ── HERO ZONE — cover image OR monogram tint (16:9-ish) ── */}
      <div style={{
        height: 116, position: "relative", flexShrink: 0,
        background: item.cover
          ? `url('${item.cover}') center/cover`
          : theme.tint,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!item.cover && (
          <div style={{
            width: 52, height: 52, borderRadius: "var(--radius-md)",
            background: "var(--bg-secondary)",
            boxShadow: "var(--shadow-1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800,
            color: theme.color,
          }}>{monogram}</div>
        )}
        {/* type badge — top-left, frosted */}
        <span style={{
          position: "absolute", top: 10, left: 10,
          fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.06em",
          padding: "3px 8px", borderRadius: "var(--radius-full)",
          background: item.cover ? "rgba(0,0,0,0.45)" : "var(--bg-secondary)",
          color: item.cover ? "#fff" : theme.color,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>{typeLabel}</span>
        {/* priority dot pill — top-right */}
        <span className={`pill ${prioTone}`} style={{
          position: "absolute", top: 8, right: 10,
          background: item.cover ? "rgba(0,0,0,0.45)" : undefined,
          color: item.cover ? "#fff" : undefined,
          backdropFilter: item.cover ? "blur(8px)" : undefined,
        }}>
          {item.priority === "HIGH" ? "高" : item.priority === "MID" ? "中" : "低"}
        </span>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
          color: "var(--label-primary)", letterSpacing: "-0.01em", lineHeight: 1.35,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", textWrap: "pretty",
        }}>{item.name}</div>

        <div style={{
          fontSize: 13, color: "var(--label-secondary)", lineHeight: 1.45, marginTop: 5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", textWrap: "pretty", flex: 1,
        }}>{item.note}</div>

        {/* single clean metadata line */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 10, fontSize: 12, color: "var(--label-tertiary)",
        }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.org || "NKUST RACING"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            {item.date && item.date !== "Book" && item.date !== "PDF" && item.date !== "Web" ? item.date : ""}
            {item.url && <UIIcon kind="external" size={11} color="var(--blue)" />}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── ResourcePreview — centered card popup (放大預覽), spring entry ───
function ResourcePreview({ item, onClose, onEdit, onDelete }) {
  if (!item) return null;
  const monogram = getMonogram(item);
  const theme = RESOURCE_GROUP_THEME[item.group] || RESOURCE_GROUP_THEME.learning;
  const prioTone = item.priority === "HIGH" ? "high" : item.priority === "MID" ? "mid" : "low";
  const typeLabel = item.group === "races" ? "賽事資訊"
    : item.group === "tools" ? "工程工具" : "學習資源";
  const prioLabel = item.priority === "HIGH" ? "高 · HIGH" : item.priority === "MID" ? "中 · MID" : "低 · LOW";

  return (
    <CardPreview
      onClose={onClose}
      color={theme.color}
      cover={item.cover}
      monogram={item.cover ? null : monogram}
      badges={<>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
          padding: "3px 10px", borderRadius: "var(--radius-full)",
          background: item.cover ? "rgba(0,0,0,0.45)" : "var(--bg-secondary)",
          color: item.cover ? "#fff" : theme.color, backdropFilter: "blur(8px)",
        }}>{typeLabel}</span>
        <span className={`pill ${prioTone}`} style={{
          background: item.cover ? "rgba(0,0,0,0.45)" : undefined,
          color: item.cover ? "#fff" : undefined,
          backdropFilter: item.cover ? "blur(8px)" : undefined,
        }}>{prioLabel}</span>
      </>}
      title={item.name}
      subtitle={item.note}
      meta={[
        { label: "機構 / 作者", value: item.org || "—" },
        { label: "日期 / 類型", value: item.date || "—" },
        ...(item.url ? [{ label: "連結", value: getDomain(item.url), href: item.url }] : []),
      ]}
      actions={<>
        <IconBtn danger icon="trash" style={{ marginRight: "auto" }} onClick={onDelete} title="刪除" />
        {item.url && (
          <IconBtn icon="external"
            onClick={() => window.open(item.url, "_blank", "noopener")} title="開啟連結" />
        )}
        <IconBtn icon="edit" onClick={onEdit} title="編輯" />
      </>}
    />
  );
}

function ResourceRow({ item, index, onClick, onDelete }) {
  const prioTone = item.priority === "HIGH" ? "high" : item.priority === "MID" ? "mid" : "low";
  return (
    <div onClick={onClick} className="resource-row" style={{
      display: "grid",
      gridTemplateColumns: "30px 1fr 110px 90px 60px",
      gap: 12, alignItems: "center",
      padding: "10px 12px", borderRadius: 10, cursor: "pointer",
      transition: "background .15s",
    }} onMouseEnter={e => e.currentTarget.style.background = "var(--accent-bg)"}
       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span className="resource-row-index" style={{
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)",
        letterSpacing: "0.06em", fontWeight: 500,
      }}>{String(index).padStart(2, "0")}</span>
      <div className="resource-row-line1" style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
          letterSpacing: "-0.005em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{item.name}</div>
        <div style={{
          fontSize: 12, color: "var(--faint)", marginTop: 3,
          lineHeight: 1.4, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{item.note}</div>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--faint)", letterSpacing: "0.02em",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{item.org}</div>
      <div className="resource-row-line2" style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: "var(--muted)", letterSpacing: "0.04em",
      }}>{item.date}</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>
        <span className={`pill ${prioTone}`}>{item.priority === "HIGH" ? "高" : item.priority === "MID" ? "中" : "低"}</span>
        <IconBtn icon="trash" size={24} danger onClick={(e) => { e.stopPropagation(); onDelete(); }}/>
      </div>
    </div>
  );
}

function EmptyState({ icon, label }) {
  return (
    <div className="tcard large" style={{
      padding: "40px 20px", textAlign: "center",
      color: "var(--muted)", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 10,
    }}>
      <UIIcon kind={icon} size={28} color="var(--muted)"/>
      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

// ─── Resource Schema & Modal Wrapper ────────────────────────
const RESOURCE_SCHEMA = [
  { key: "name", label: "資源名稱", type: "text", placeholder: "例： FSAE Online 官方技術規範", autoFocus: true },
  { key: "group", label: "資源類別", type: "segmented", options: [
    { value: "races", label: "賽事資訊" },
    { value: "tools", label: "工程工具" },
    { value: "learning", label: "學習資源" },
  ]},
  { key: "org", label: "機構 / 作者", type: "text", placeholder: "例： SAE International" },
  { key: "date", label: "日期 / 類型", type: "text", placeholder: "例： 2026-08-15 或 PDF" },
  { key: "priority", label: "重要程度 (優先度)", type: "segmented", options: [
    { value: "HIGH", label: "高 · HIGH" },
    { value: "MID", label: "中 · MID" },
    { value: "LOW", label: "低 · LOW" },
  ]},
  { key: "note", label: "簡短說明", type: "textarea", rows: 2, placeholder: "請輸入對該資源的說明或使用指南..." },
  { key: "url", label: "URL（網頁連結）", type: "text", placeholder: "https://..." },
  { key: "cover", label: "封面圖網址（選填）", type: "text", placeholder: "https://… .jpg / .png — 留空則用字母圖示" },
];

function ResourceModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = { group: "races", name: "", org: "", note: "",
                  priority: "MID", date: "", url: "" };
  return (
    <DynamicEditorModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      initial={initial || blank}
      schema={RESOURCE_SCHEMA}
      eyebrow={!initial?.id ? "NEW RESOURCE" : "EDIT RESOURCE"}
      titleKey="name"
      renderPreview={(data) => {
        const ResourceCard = window.ResourceCard;
        if (!ResourceCard) return null;
        return (
          <div style={{ width: "100%", transform: "scale(0.95)", transformOrigin: "center" }}>
            <ResourceCard item={data} onClick={() => {}} />
          </div>
        );
      }}
    />
  );
}

Object.assign(window, { PartsView, ResourcesView, SupplierCard, SupplierPreview, ResourceCard, ResourcePreview });
