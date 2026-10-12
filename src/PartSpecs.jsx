// PartSpecs.jsx — 工作台「零件規格」分頁：零件的材質、重量、法規、負責人、供應商
// 資料存在 RTDB 的 blueprintParts（沿用原「車體圖解」的資料，不需要搬移）。
// 每筆零件仍帶 viewId / x / y（在哪張視圖照片上的位置），編輯時可在預覽圖上拖曳調整。

function PartSpecs() {
  const [views] = useRtdbState("blueprintViews", BLUEPRINT_VIEWS);
  const [parts, setParts] = useRtdbState("blueprintParts", BLUEPRINT_PARTS);
  const [selectedId, setSelectedId] = React.useState(null);
  const [editing, setEditing] = React.useState({ open: false, initial: null });
  const [confirm, setConfirm] = React.useState(null);
  const selected = parts.find(p => p.id === selectedId);
  const defaultViewId = views[0]?.id || "";

  const savePart = (p) => setParts(prev => {
    if (p.id) return prev.map(x => x.id === p.id ? { ...x, ...p } : x);
    return [...prev, { ...p, id: "bp" + Date.now() }];
  });
  const deletePart = (p) => {
    setParts(prev => prev.filter(x => x.id !== p.id));
    if (selectedId === p.id) setSelectedId(null);
  };

  return (
    <>
      <div className="part-specs">
        <Inspector
          part={selected}
          allParts={parts}
          viewParts={parts}
          views={views}
          currentViewId={null}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onEdit={() => selected && setEditing({ open: true, initial: selected })}
          onDelete={() => selected && setConfirm(selected)}
          onAdd={() => setEditing({ open: true, initial: null })}/>
      </div>

      {views.length > 0 && (
        <PartModal open={editing.open} initial={editing.initial}
          onClose={() => setEditing({ open: false, initial: null })}
          onSave={(p) => { savePart(p); if (p.id) setSelectedId(p.id); }}
          onDelete={(p) => setConfirm(p)}
          currentViewId={defaultViewId} views={views}/>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="確定刪除這筆資料？"
        body={confirm ? `「${confirm.label}」零件將被移除。` : ""}
        onConfirm={() => { if (confirm) deletePart(confirm); }}/>
    </>
  );
}

function Inspector({ part, allParts, viewParts, views, currentViewId, selectedId, onSelect, onEdit, onDelete, onAdd, mode3d }) {
  const [search, setSearch] = React.useState("");
  // Accordion — only one subsystem open at a time
  const [openSub, setOpenSub] = React.useState(part?.sub || null);
  React.useEffect(() => { if (part?.sub) setOpenSub(part.sub); }, [part?.sub]);
  const toggleSub = (sub) => setOpenSub(prev => prev === sub ? null : sub);

  // Filter then group
  const filtered = allParts.filter(p =>
    !search ||
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    (p.material || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.owner || "").toLowerCase().includes(search.toLowerCase())
  );
  const grouped = SUBSYSTEMS
    .map(sub => ({ sub, parts: filtered.filter(p => p.sub === sub) }))
    .filter(g => g.parts.length > 0);

  if (!part) {
    return (
      <div className="tcard large" style={{
        padding: 0, overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "18px 22px 14px",
          borderBottom: "0.5px solid var(--rule)",
        }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>PART INSPECTOR</div>
          <div style={{
            fontFamily: "var(--display-family)",
            fontSize: 18, fontWeight: 700, color: "var(--muted)",
            letterSpacing: "-0.018em", lineHeight: 1.2,
          }}>沒有選定的零件</div>
          {!mode3d && onAdd && (
          <Button variant="primary" icon="plus" onClick={onAdd}
            style={{ marginTop: 12 }}>新增零件</Button>
        )}
        </div>
        <PartLibrary search={search} setSearch={setSearch}
          grouped={grouped} totalCount={allParts.length}
          selectedId={selectedId} currentViewId={currentViewId}
          views={views} onSelect={onSelect} onAdd={onAdd}
          collapsed={null} openSub={openSub} toggleSub={toggleSub}
          mode3d={mode3d}/>
      </div>
    );
  }
  return (
    <div className="tcard large" style={{
      padding: 0, overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 22px 14px",
        borderBottom: "0.5px solid var(--rule)",
        position: "relative",
      }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>PART INSPECTOR</div>
        <div style={{
          fontFamily: "var(--display-family)",
          fontSize: 22, fontWeight: 700, color: "var(--ink)",
          letterSpacing: "-0.022em", lineHeight: 1.15, paddingRight: 60,
        }}>{part.label}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <SubsystemTag kind={part.sub}/>
          <Pill tone="muted">{part.revision || "—"}</Pill>
          <Pill tone="muted">{views.find(v => v.id === part.viewId)?.short || part.viewId}</Pill>
        </div>
        <div style={{
          position: "absolute", top: 14, right: 14, display: "flex", gap: 2,
        }}>
          <IconBtn icon="edit"  onClick={onEdit}   title="編輯" size={28}/>
          <IconBtn icon="trash" onClick={onDelete} title="刪除" size={28} danger/>
        </div>
      </div>

      {/* Spec rows */}
      <div style={{ padding: "6px 22px 2px" }}>
        <SpecRow label="MATERIAL"   value={part.material}/>
        <SpecRow label="WEIGHT"     value={part.weight}/>
        <SpecRow label="REGULATION" value={part.regulation}/>
        <SpecRow label="OWNER"      value={part.owner}/>
        <SpecRow label="SUPPLIER"   value={part.supplier}/>
      </div>

      {/* Notes */}
      {part.note && (
        <div style={{ padding: "10px 22px 16px" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--muted)", marginBottom: 6,
          }}>NOTES</div>
          <p style={{
            fontSize: 13, color: "var(--ink)", lineHeight: 1.65,
            margin: 0, textWrap: "pretty", WebkitTextWrap: "pretty",
            opacity: 0.72,
          }}>{part.note}</p>
        </div>
      )}

      {/* Library */}
      <PartLibrary search={search} setSearch={setSearch}
        grouped={grouped} totalCount={allParts.length}
        selectedId={selectedId} currentViewId={currentViewId}
        views={views} onSelect={onSelect} onAdd={onAdd}
        collapsed={null} openSub={openSub} toggleSub={toggleSub}/>
    </div>
  );
}

function PartLibrary({ search, setSearch, grouped, totalCount, selectedId,
                      currentViewId, views, onSelect, onAdd, openSub, toggleSub, mode3d }) {
  const visibleCount = grouped.reduce((a, g) => a + g.parts.length, 0);
  return (
    <div style={{
      flex: 1, minHeight: 0,
      borderTop: "0.5px solid var(--rule)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Sticky header */}
      <div style={{
        padding: "12px 22px 8px",
        display: "flex", flexDirection: "column", gap: 8,
        borderBottom: "0.5px solid var(--rule)",
        background: "var(--card-fill)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        position: "sticky", top: 0, zIndex: 2,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "baseline",
        }}>
          <div className="eyebrow">ALL PARTS · {visibleCount}{visibleCount !== totalCount && ` / ${totalCount}`}</div>
          {!mode3d && onAdd && (
            <button onClick={onAdd} title="新增零件" style={{
              background: "transparent", border: 0, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              color: "var(--accent)", fontSize: 11, fontWeight: 600,
              fontFamily: "inherit", padding: 0,
            }}>
              <UIIcon kind="plus" size={11}/> 新增
            </button>
          )}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 10px",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 999, height: 26,
        }}>
          <UIIcon kind="search" size={11} color="var(--muted)"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋零件 / 材質 / 負責人…"
            style={{
              background: "transparent", border: 0, outline: 0,
              fontSize: 11.5, fontFamily: "inherit", flex: 1,
              color: "var(--ink)", minWidth: 0,
            }}/>
          {search && (
            <button onClick={() => setSearch("")} style={{
              background: "transparent", border: 0, cursor: "pointer",
              color: "var(--muted)", padding: 0, display: "flex",
            }}>
              <UIIcon kind="x" size={11}/>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable groups */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "8px 14px 18px",
      }}>
        {grouped.length === 0 ? (
          <div style={{
            padding: "30px 14px", textAlign: "center",
            color: "var(--muted)", fontSize: 11,
            fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
          }}>沒有符合搜尋的零件</div>
        ) : grouped.map(g => {
          // Search mode auto-expands all. Otherwise accordion: only openSub open.
          const isOpen = search ? true : (openSub === g.sub);
          const color = SUBSYSTEM_COLOR[g.sub];
          return (
            <div key={g.sub} style={{ marginBottom: 4 }}>
              <button onClick={() => toggleSub(g.sub)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "10px 10px", border: 0,
                background: isOpen ? color + "10" : "transparent",
                cursor: "pointer", fontFamily: "inherit",
                borderRadius: 8, transition: "background .15s",
                borderLeft: "2px solid " + (isOpen ? color : "transparent"),
              }}>
                <UIIcon kind={isOpen ? "chevron-down" : "chevron-right"} size={11} color="var(--muted)"/>
                <SubsystemIcon kind={g.sub} size={13} color={color}/>
                <span style={{
                  flex: 1, fontSize: 12.5, fontWeight: 700,
                  color: isOpen ? color : "var(--ink)",
                  textAlign: "left", letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}>{g.sub}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: isOpen ? color : "var(--muted)",
                  letterSpacing: "0.04em", fontWeight: 700,
                  padding: "1px 6px",
                  background: isOpen ? "#fff" : "rgba(0,0,0,0.04)",
                  borderRadius: 4,
                }}>{g.parts.length}</span>
              </button>
              {isOpen && (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 2,
                  marginLeft: 14, marginTop: 6, marginBottom: 10,
                  paddingLeft: 12,
                  borderLeft: "1px dashed " + color + "44",
                }}>
                  {g.parts.map(p => {
                    const view = views.find(v => v.id === p.viewId);
                    const inCurrentView = p.viewId === currentViewId;
                    const isSelected = p.id === selectedId;
                    return (
                      <button key={p.id}
                        onClick={() => onSelect(p.id, p.viewId)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "7px 10px", borderRadius: 6,
                          background: isSelected ? "var(--accent-bg)" : "transparent",
                          border: 0, cursor: "pointer", textAlign: "left",
                          transition: "background .15s", fontFamily: "inherit",
                        }} onMouseEnter={e => !isSelected && (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                           onMouseLeave={e => !isSelected && (e.currentTarget.style.background = "transparent")}>
                        <span style={{
                          fontSize: 12, color: isSelected ? "var(--accent)" : "var(--ink)",
                          fontWeight: isSelected ? 600 : 500,
                          flex: 1, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{p.label}</span>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: 9,
                          color: inCurrentView ? "var(--accent)" : "var(--muted)",
                          fontWeight: inCurrentView ? 700 : 500,
                          letterSpacing: "0.06em",
                          padding: "1px 5px",
                          background: inCurrentView ? "var(--accent-mid)" : "rgba(0,0,0,0.04)",
                          borderRadius: 4,
                        }}>{view?.short || "?"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "90px 1fr", gap: 10,
      alignItems: "baseline",
      padding: "7px 0",
      borderBottom: "0.5px solid var(--rule)",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--muted)",
      }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: value ? "var(--ink)" : "var(--muted)",
        fontWeight: 600, letterSpacing: "-0.01em",
      }}>{value || <span style={{ opacity: 0.3 }}>—</span>}</div>
    </div>
  );
}

// ─── Part Modal ──────────────────────────────────────────
function PartModal({ open, onClose, onSave, onDelete, initial, currentViewId, views }) {
  const blank = {
    viewId: currentViewId, x: 50, y: 50,
    label: "", sub: "其他", material: "", weight: "",
    regulation: "", revision: "r1", owner: "", supplier: "", note: "",
  };
  const [p, setP] = React.useState(initial || blank);
  React.useEffect(() => { setP(initial || blank); }, [initial, open]);
  const u = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const isNew = !initial?.id;
  const view = views.find(v => v.id === p.viewId) || views[0];
  const previewRef = React.useRef(null);
  const dragRef = React.useRef(false);
  const color = SUBSYSTEM_COLOR[p.sub] || "#444";

  const handlePreviewMove = (e) => {
    const r = previewRef.current.getBoundingClientRect();
    const ev = e.touches ? e.touches[0] : e;
    const x = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((ev.clientY - r.top) / r.height) * 100));
    setP(prev => ({ ...prev, x: Math.round(x), y: Math.round(y) }));
  };

  const autoClose = () => { onSave(p); onClose(); };
  return (
    <Modal open={open} onClose={onClose} onDismiss={autoClose} width={640}
      eyebrow={isNew ? "NEW PART" : "EDIT PART"}
      title={isNew ? "新增零件標記" : p.label || "編輯零件"}
      footer={
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" icon="check" onClick={autoClose}>儲存</Button>
          </div>
          {!isNew && (
            <div style={{ borderTop: "0.5px solid var(--rule)", marginTop: 10, paddingTop: 10 }}>
              <Button variant="danger" icon="trash" onClick={() => { onDelete(p); onClose(); }}>刪除</Button>
            </div>
          )}
        </>
      }>
      {/* ─── Live preview ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <div className="eyebrow">POSITION PREVIEW</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--muted)", letterSpacing: "0.06em",
          }}>{view.label}  ·  點擊或拖曳調整</div>
        </div>
        <div
          ref={previewRef}
          onMouseDown={(e) => { dragRef.current = true; handlePreviewMove(e); }}
          onMouseMove={(e) => dragRef.current && handlePreviewMove(e)}
          onMouseUp={() => dragRef.current = false}
          onMouseLeave={() => dragRef.current = false}
          onTouchStart={(e) => { dragRef.current = true; handlePreviewMove(e); }}
          onTouchMove={(e) => dragRef.current && handlePreviewMove(e)}
          onTouchEnd={() => dragRef.current = false}
          style={{
            position: "relative", borderRadius: 10, overflow: "hidden",
            background: "var(--fill-secondary)",
            border: "0.5px solid var(--rule)",
            aspectRatio: "16/9", cursor: "crosshair",
            userSelect: "none", touchAction: "none",
          }}>
          <img src={view.image} alt=""
            draggable={false}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "contain",
              padding: "5%", filter: "saturate(0.92)",
              pointerEvents: "none",
            }}/>
          {/* Crosshairs */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: `${p.y}%`,
            height: 1, background: color + "55", pointerEvents: "none",
          }}/>
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: `${p.x}%`,
            width: 1, background: color + "55", pointerEvents: "none",
          }}/>
          {/* Marker */}
          <div style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
            width: 26, height: 26, borderRadius: "50%",
            background: color, border: "2px solid #fff",
            boxShadow: `0 0 0 6px ${color}22, 0 2px 8px rgba(0,0,0,0.2)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            transition: "background .15s, box-shadow .15s",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: "#fff" }}/>
          </div>
          {/* Coord readout */}
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            padding: "3px 8px", borderRadius: 6,
            background: "rgba(20,20,25,0.78)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.04em", fontWeight: 600,
            pointerEvents: "none",
          }}>X {p.x}%  ·  Y {p.y}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>零件名稱</label>
          <input type="text" value={p.label} onChange={e => u("label", e.target.value)}
            placeholder="例:主環" autoFocus/>
        </div>
        <div className="field"><label>所屬視圖</label>
          <select value={p.viewId} onChange={e => u("viewId", e.target.value)}>
            {views.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field"><label>子系統</label>
          <select value={p.sub} onChange={e => u("sub", e.target.value)}>
            {SUBSYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>X 座標 · {p.x}%</label>
          <input type="range" min="0" max="100" value={p.x}
            onChange={e => u("x", parseInt(e.target.value) || 0)}
            style={{ accentColor: "var(--accent)" }}/>
        </div>
        <div className="field"><label>Y 座標 · {p.y}%</label>
          <input type="range" min="0" max="100" value={p.y}
            onChange={e => u("y", parseInt(e.target.value) || 0)}
            style={{ accentColor: "var(--accent)" }}/>
        </div>
      </div>
      <div className="field"><label>材質 / 規格</label>
        <input type="text" value={p.material} onChange={e => u("material", e.target.value)}
          placeholder="1018 鋼管 Ø25.4 × 2.4 mm"/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field"><label>重量</label>
          <input type="text" value={p.weight} onChange={e => u("weight", e.target.value)} placeholder="2.46 kg"/>
        </div>
        <div className="field"><label>修訂版</label>
          <input type="text" value={p.revision} onChange={e => u("revision", e.target.value)} placeholder="r3"/>
        </div>
        <div className="field"><label>規則</label>
          <input type="text" value={p.regulation} onChange={e => u("regulation", e.target.value)} placeholder="FSAE §T.4"/>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>負責人</label>
          <input type="text" value={p.owner} onChange={e => u("owner", e.target.value)}/>
        </div>
        <div className="field"><label>供應商</label>
          <input type="text" value={p.supplier} onChange={e => u("supplier", e.target.value)}/>
        </div>
      </div>
      <div className="field"><label>備註</label>
        <textarea value={p.note} onChange={e => u("note", e.target.value)} rows={2}/>
      </div>
    </Modal>
  );
}

window.PartSpecs = PartSpecs;
