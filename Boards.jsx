// Boards.jsx — Parts (Kanban by category) + Resources (Races/Tools/Learning)

// ═══════════════════════════════════════════════════════════
//  PARTS — Kanban by supplier category, drag-between-columns
// ═══════════════════════════════════════════════════════════
function PartsView({ suppliers, setSuppliers }) {
  const [editing, setEditing] = React.useState({ open: false, initial: null });
  const [confirm, setConfirm] = React.useState(null);
  const [drag, setDrag] = React.useState(null);     // dragged supplier id
  const [overCat, setOverCat] = React.useState(null); // target column cat

  const save = (s) => setSuppliers(prev => {
    if (s.id) return prev.map(x => x.id === s.id ? { ...x, ...s } : x);
    return [...prev, { ...s, id: "s" + Date.now() }];
  });
  const remove = (s) => setSuppliers(prev => prev.filter(x => x.id !== s.id));

  const onDragStart = (id) => () => setDrag(id);
  const onDragEnd = () => { setDrag(null); setOverCat(null); };
  const onDragOver = (cat) => (e) => { e.preventDefault(); setOverCat(cat); };
  const onDrop = (cat) => (e) => {
    e.preventDefault();
    if (!drag) return;
    setSuppliers(prev => prev.map(x => x.id === drag ? { ...x, cat } : x));
    setDrag(null); setOverCat(null);
  };

  // Aggregate stats
  const total = suppliers.length;
  const high  = suppliers.filter(s => s.priority === "HIGH").length;
  const ordered = suppliers.filter(s => ["已下單","已收到"].includes(s.status)).length;
  const sponsor = suppliers.filter(s => s.status === "贊助申請").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      <div style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="TOTAL"     value={total}   foot="ITEMS TRACKED"/>
        <KPI label="HIGH PRIO" value={high}    foot={`/ ${total} ITEMS`} accent/>
        <KPI label="ORDERED"   value={ordered} unit={`/ ${total}`} foot="已下單 + 已收到"/>
        <KPI label="SPONSOR"   value={sponsor} foot="贊助申請中"/>
      </div>

      <SectionHead title="零件供應商 · Suppliers" hint={`${total} ITEMS · KANBAN BY CATEGORY`}
        action={<Button variant="primary" icon="plus"
          onClick={() => setEditing({ open: true, initial: null })}>新增項目</Button>}/>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${SUPPLIER_CATEGORIES.length}, 1fr)`,
        gap: 10, alignItems: "start",
      }}>
        {SUPPLIER_CATEGORIES.map(cat => {
          const items = suppliers.filter(s => s.cat === cat);
          const isOver = overCat === cat;
          return (
            <div key={cat}
              onDragOver={onDragOver(cat)}
              onDrop={onDrop(cat)}
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
                  <SubsystemIcon kind={items[0]?.sub || "其他"} size={12} color={SUBSYSTEM_COLOR[items[0]?.sub || "其他"]}/>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{cat}</span>
                </div>
                <span className="eyebrow">{items.length}</span>
              </div>
              {items.map(s => (
                <SupplierCard key={s.id} supplier={s}
                  draggable
                  dragging={drag === s.id}
                  onDragStart={onDragStart(s.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => setEditing({ open: true, initial: s })}
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
              <button onClick={() => setEditing({ open: true, initial: { cat, sub: "其他", priority: "MID", status: "詢價" } })}
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
        padding: 11, cursor: "pointer",
        background: "rgba(255,255,255,0.85)",
        position: "relative",
        display: "flex", flexDirection: "column", gap: 7,
      }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 6,
      }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
          letterSpacing: "-0.005em", lineHeight: 1.3, flex: 1,
        }}>{supplier.name}</div>
        <span className="drag-handle" style={{ flexShrink: 0, marginTop: 1 }}>
          <UIIcon kind="grip" size={12}/>
        </span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
        color: "var(--ink)", letterSpacing: 0,
      }}>{supplier.price}</div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6,
        marginTop: 2,
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          padding: "2px 7px", borderRadius: 99,
          background: tone.bg, color: tone.fg,
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.04em",
        }}>{tone.label}</span>
        <span className={`pill ${prioTone}`}>{supplier.priority}</span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)",
        letterSpacing: "0.06em", textTransform: "uppercase",
        display: "flex", justifyContent: "space-between",
      }}>
        <span>FROM · {supplier.origin}</span>
      </div>
    </div>
  );
}

// ─── Supplier modal ────────────────────────────────────────
function SupplierModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = { name: "", price: "", cat: "輪圈", sub: "車體",
                  priority: "MID", status: "詢價", origin: "" };
  const [s, setS] = React.useState(initial || blank);
  React.useEffect(() => { setS(initial || blank); }, [initial, open]);
  const u = (k, v) => setS(prev => ({ ...prev, [k]: v }));
  const isNew = !initial?.id;
  return (
    <Modal open={open} onClose={onClose}
      eyebrow={isNew ? "NEW SUPPLIER ITEM" : "EDIT SUPPLIER ITEM"}
      title={isNew ? "新增零件項目" : s.name || "編輯零件"}
      footer={
        <>
          {!isNew && (
            <Button variant="danger" icon="trash" onClick={() => { onDelete(s); onClose(); }}
              style={{ marginRight: "auto" }}>刪除</Button>
          )}
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" icon="check" onClick={() => { onSave(s); onClose(); }}>儲存</Button>
        </>
      }>
      <div className="field"><label>項目名稱</label>
        <input type="text" value={s.name} onChange={e => u("name", e.target.value)} autoFocus/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>類別</label>
          <select value={s.cat} onChange={e => u("cat", e.target.value)}>
            {SUPPLIER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field"><label>子系統</label>
          <select value={s.sub} onChange={e => u("sub", e.target.value)}>
            {SUBSYSTEMS.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>價格</label>
          <input type="text" value={s.price} onChange={e => u("price", e.target.value)} placeholder="$0 / set"/>
        </div>
        <div className="field"><label>產地</label>
          <input type="text" value={s.origin} onChange={e => u("origin", e.target.value)}/>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>優先度</label>
          <select value={s.priority} onChange={e => u("priority", e.target.value)}>
            <option value="HIGH">高 · HIGH</option>
            <option value="MID">中 · MID</option>
            <option value="LOW">低 · LOW</option>
          </select>
        </div>
        <div className="field"><label>採購狀態</label>
          <select value={s.status} onChange={e => u("status", e.target.value)}>
            {Object.keys(STATUS_TONES).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
//  RESOURCES — Races / Tools / Learning library
// ═══════════════════════════════════════════════════════════
function ResourcesView({ resources, setResources }) {
  const [filter, setFilter] = React.useState("all");
  const [editing, setEditing] = React.useState({ open: false, initial: null });
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* KPI strip */}
      <div style={{ display: "flex", gap: "var(--gap-card)" }}>
        {groups.map(g => {
          const items = resources.filter(r => r.group === g.id);
          return (
            <div key={g.id} className="tcard tile hoverable" style={{
              flex: 1, padding: "var(--tile-pad)", cursor: "pointer",
            }} onClick={() => setFilter(g.id)}>
              <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <UIIcon kind={g.icon} size={11}/>
                {g.en}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
                <DisplayNumber value={items.length} size={36}/>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}>{g.label}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6, lineHeight: 1.4 }}>
                {g.desc}
              </div>
            </div>
          );
        })}
      </div>

      <SectionHead title="資源庫 · Library" hint={`${visible.length} OF ${resources.length} ITEMS`}
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
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
            <SegmentedFilter value={filter} onChange={setFilter} options={[
              { id: "all",      label: "全部" },
              { id: "races",    label: "賽事" },
              { id: "tools",    label: "工具" },
              { id: "learning", label: "學習" },
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
              <div className="tcard large" style={{ padding: 8 }}>
                {items.map((r, i) => (
                  <ResourceRow key={r.id} item={r} index={i + 1}
                    onClick={() => setEditing({ open: true, initial: r })}
                    onDelete={() => setConfirm(r)}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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

function ResourceRow({ item, index, onClick, onDelete }) {
  const prioTone = item.priority === "HIGH" ? "high" : item.priority === "MID" ? "mid" : "low";
  return (
    <div onClick={onClick} style={{
      display: "grid",
      gridTemplateColumns: "30px 1fr 110px 90px 60px",
      gap: 12, alignItems: "center",
      padding: "10px 12px", borderRadius: 10, cursor: "pointer",
      transition: "background .15s",
    }} onMouseEnter={e => e.currentTarget.style.background = "var(--accent-bg)"}
       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)",
        letterSpacing: "0.06em", fontWeight: 500,
      }}>{String(index).padStart(2, "0")}</span>
      <div style={{ minWidth: 0 }}>
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
      <div style={{
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

function ResourceModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = { group: "races", name: "", org: "", note: "",
                  priority: "MID", date: "", url: "" };
  const [r, setR] = React.useState(initial || blank);
  React.useEffect(() => { setR(initial || blank); }, [initial, open]);
  const u = (k, v) => setR(prev => ({ ...prev, [k]: v }));
  const isNew = !initial?.id;
  return (
    <Modal open={open} onClose={onClose}
      eyebrow={isNew ? "NEW RESOURCE" : "EDIT RESOURCE"}
      title={isNew ? "新增資源" : r.name || "編輯資源"}
      footer={
        <>
          {!isNew && (
            <Button variant="danger" icon="trash" onClick={() => { onDelete(r); onClose(); }}
              style={{ marginRight: "auto" }}>刪除</Button>
          )}
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" icon="check" onClick={() => { onSave(r); onClose(); }}>儲存</Button>
        </>
      }>
      <div className="field"><label>名稱</label>
        <input type="text" value={r.name} onChange={e => u("name", e.target.value)} autoFocus/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>類別</label>
          <select value={r.group} onChange={e => u("group", e.target.value)}>
            <option value="races">賽事資訊</option>
            <option value="tools">工程工具</option>
            <option value="learning">學習資源</option>
          </select>
        </div>
        <div className="field"><label>優先度</label>
          <select value={r.priority} onChange={e => u("priority", e.target.value)}>
            <option value="HIGH">高 · HIGH</option>
            <option value="MID">中 · MID</option>
            <option value="LOW">低 · LOW</option>
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>機構 / 作者</label>
          <input type="text" value={r.org} onChange={e => u("org", e.target.value)}/>
        </div>
        <div className="field"><label>日期 / 類型</label>
          <input type="text" value={r.date} onChange={e => u("date", e.target.value)} placeholder="2026-08-15 或 PDF"/>
        </div>
      </div>
      <div className="field"><label>說明</label>
        <textarea value={r.note} onChange={e => u("note", e.target.value)} rows={2}/>
      </div>
      <div className="field"><label>URL（選填）</label>
        <input type="text" value={r.url} onChange={e => u("url", e.target.value)}/>
      </div>
    </Modal>
  );
}

Object.assign(window, { PartsView, ResourcesView });
