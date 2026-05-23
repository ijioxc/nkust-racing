// Blueprint.jsx — multi-view car part inspector with editable parts
//
// Schema (defined in data.js, mirrored here in state for live editing):
//   views: [{ id, label, short, image }]
//   parts: [{
//     id, viewId, x, y,            // position in % over image
//     label, sub,                   // display
//     material, weight, regulation, // spec fields
//     revision, owner, supplier,
//     note                          // free-text description
//   }]
//
// Extensible: add a new schema field → the modal and inspector pick it up
// (or add a new <SpecRow> below). See PART_FIELDS at the bottom for the
// editable schema definition.

// ─── Group name → subsystem (handles chassis_grouped.glb names) ──
const GROUP_MAP = {
  chassis:    "車體",
  bodywork:   "車體",
  body:       "車體",
  frame:      "車體",
  suspension: "懸吊",
  susp:       "懸吊",
  wheel:      "懸吊",
  drivetrain: "引擎",
  engine:     "引擎",
  powertrain: "引擎",
  brake:      "煞車",
  brakes:     "煞車",
  aero:       "空力",
  aerodynamics: "空力",
  wings:      "空力",
  electrical: "電裝",
  ecu:        "電裝",
  harness:    "電裝",
};

function guessSubsystem(groupName) {
  const n = (groupName || "").toLowerCase().replace(/[_\-\s]+/g, "");
  for (const [key, sub] of Object.entries(GROUP_MAP)) {
    if (n.includes(key)) return sub;
  }
  // CJK fallback
  if (/車體|body/.test(groupName))  return "車體";
  if (/懸吊|susp/.test(groupName))  return "懸吊";
  if (/引擎|engine/.test(groupName)) return "引擎";
  if (/煞車|brake/.test(groupName))  return "煞車";
  if (/電裝|elec/.test(groupName))   return "電裝";
  if (/空力|aero/.test(groupName))   return "空力";
  return "其他";
}

// Display label for GLB group button
const GROUP_LABEL = {
  chassis:    "主架 · Chassis",
  bodywork:   "車殼 · Body",
  suspension: "懸吊 · Susp",
  drivetrain: "傳動 · Drive",
  aero:       "空力 · Aero",
  wheel:      "輪組 · Wheel",
  brake:      "煞車 · Brake",
};

function Blueprint() {
  const [views, setViews]           = useRtdbState("blueprintViews", BLUEPRINT_VIEWS);
  const [parts, setParts]           = useRtdbState("blueprintParts", BLUEPRINT_PARTS);
  const [viewId, setViewId]         = React.useState(BLUEPRINT_VIEWS[0].id);
  const [selectedPartId, setSelectedPartId] = React.useState(null);
  const [addingMode, setAddingMode] = React.useState(false);
  const [editing, setEditing]       = React.useState({ open: false, initial: null });
  const [viewEditing, setViewEditing] = React.useState({ open: false, initial: null });
  const [confirm, setConfirm]       = React.useState(null);

  // 3D mode
  const [mode3d,   setMode3d]   = React.useState(false);
  const [loadPct,  setLoadPct]  = React.useState(0);
  const [glGroups, setGlGroups] = React.useState([]);  // names from GLB
  const canvasRef = React.useRef(null);

  // Init / destroy Three.js scene when switching modes
  React.useEffect(() => {
    if (!mode3d) return;
    const canvas = canvasRef.current;
    if (!canvas || !window.BlueprintGL) return;

    window.BlueprintGL.init(
      canvas,
      (groupName) => {
        if (!groupName) { setSelectedPartId(null); return; }
        const sub = guessSubsystem(groupName);
        const match = parts.find(p => p.sub === sub) || parts[0];
        if (match) setSelectedPartId(match.id);
      },
      (pct) => {
        setLoadPct(pct);
        if (pct >= 100) {
          const names = window.BlueprintGL.getGroupNames();
          setGlGroups(names);
          console.log('[Blueprint] GLB groups:', names);
        }
      },
    );
    return () => window.BlueprintGL.destroy();
  }, [mode3d]);

  const view  = views.find(v => v.id === viewId) || views[0] || { id: "", label: "", short: "", image: "" };
  const viewParts = parts.filter(p => p.viewId === viewId);
  const selected = parts.find(p => p.id === selectedPartId);

  // Ensure selection is in current view; fall back to first part
  React.useEffect(() => {
    if (mode3d) return;
    if (!selected || selected.viewId !== viewId) {
      setSelectedPartId(viewParts[0]?.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId, parts.length, mode3d]);

  if (!views || views.length === 0) {
    return (
      <div className="tcard large" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 92px - 80px)",
        minHeight: 560,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--muted)",
        letterSpacing: "0.08em",
      }}>
        INITIALIZING BLUEPRINT VIEWS · SYNCING CRDT...
      </div>
    );
  }

  // Save / delete handlers
  const savePart = (p) => setParts(prev => {
    if (p.id) return prev.map(x => x.id === p.id ? { ...x, ...p } : x);
    const id = "bp" + Date.now();
    return [...prev, { ...p, id }];
  });
  const deletePart = (p) => {
    setParts(prev => prev.filter(x => x.id !== p.id));
    if (selectedPartId === p.id) setSelectedPartId(null);
  };
  const saveView = (v) => setViews(prev => {
    if (v.id && prev.find(x => x.id === v.id)) {
      return prev.map(x => x.id === v.id ? { ...x, ...v } : x);
    }
    const id = v.id || "v" + Date.now();
    return [...prev, { ...v, id }];
  });
  const deleteView = (v) => {
    if (views.length <= 1) return; // never delete last
    setViews(prev => prev.filter(x => x.id !== v.id));
    setParts(prev => prev.filter(p => p.viewId !== v.id));
    if (viewId === v.id) setViewId(views.find(x => x.id !== v.id)?.id);
  };

  // Click on image to add part (when in addingMode)
  const onImageClick = (e) => {
    if (!addingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setAddingMode(false);
    setEditing({
      open: true,
      initial: {
        viewId, x: Math.round(x), y: Math.round(y),
        label: "", sub: "其他", material: "", weight: "",
        regulation: "", revision: "r1", owner: "", supplier: "", note: "",
      },
    });
  };

  return (
    <>
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 340px",
      gap: "var(--gap-card)",
      height: "calc(100vh - 92px - 80px)",
      minHeight: 560, maxHeight: 900,
    }}>
      {/* Viewer */}
      <div className="tcard large" style={{
        padding: 0, overflow: "hidden", position: "relative",
        background: mode3d
          ? "linear-gradient(160deg, #0e0f11 0%, #1a1c22 100%)"
          : "linear-gradient(180deg, #fafafa 0%, #ededef 100%)",
        cursor: mode3d ? "grab" : (addingMode ? "crosshair" : "default"),
        transition: "background .4s",
      }}>
        {/* Top controls bar */}
        <div style={{
          position: "absolute", top: 16, left: 16, right: 16, zIndex: 5,
          display: "flex", justifyContent: "space-between", gap: 10,
          alignItems: "flex-start",
        }}>
          {/* View selector (photo mode) / group tags (3D mode) */}
          {mode3d ? (
            <div style={{
              display: "flex", gap: 4, flexWrap: "wrap", maxWidth: "72%",
            }}>
              {glGroups.length > 0 && glGroups.map(g => {
                const sub   = guessSubsystem(g);
                const color = (window.SUBSYSTEM_COLOR || SUBSYSTEM_COLOR)[sub] || "#888";
                const label = GROUP_LABEL[g] || g;
                return (
                  <button key={g} onClick={() => {
                    window.BlueprintGL?.setHighlight(g);
                    const match = parts.find(p => p.sub === sub) || parts[0];
                    if (match) setSelectedPartId(match.id);
                  }} style={{
                    padding: "4px 11px", borderRadius: 999, border: "none",
                    background: `${color}28`,
                    backdropFilter: "blur(10px)",
                    color: "#fff", fontSize: 10, fontWeight: 600,
                    fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "background .15s",
                    boxShadow: `inset 0 0 0 1px ${color}55`,
                  }} onMouseEnter={e => e.currentTarget.style.background = `${color}55`}
                     onMouseLeave={e => e.currentTarget.style.background = `${color}28`}>
                    <SubsystemIcon kind={sub} size={10}/>
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <ViewStrip views={views} viewId={viewId} onChange={setViewId}
              onEditView={(v) => setViewEditing({ open: true, initial: v })}
              onAddView={() => setViewEditing({ open: true, initial: null })}/>
          )}

          {/* Right controls */}
          <div style={{
            display: "flex", gap: 4, padding: 4,
            background: mode3d ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.78)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            borderRadius: 999,
            border: "0.5px solid rgba(255,255,255,0.15)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            {mode3d ? (
              <>
                <IconBtn icon="rotate" title="重設視角" size={28}
                  style={{ color: "#fff" }}
                  onClick={() => window.BlueprintGL?.resetView()}/>
                <IconBtn icon="target" title="取消高亮" size={28}
                  style={{ color: "#fff" }}
                  onClick={() => window.BlueprintGL?.clearHighlight()}/>
              </>
            ) : (
              <>
                <IconBtn icon="rotate" title="重設視角" size={28}/>
                <IconBtn icon="target" title="居中" size={28}/>
              </>
            )}
            {/* Mode toggle */}
            <button onClick={() => { setMode3d(v => !v); setAddingMode(false); }} style={{
              padding: "4px 10px", borderRadius: 999, border: 0,
              background: mode3d ? "rgba(0,113,227,0.7)" : "rgba(0,0,0,0.06)",
              color: mode3d ? "#fff" : "var(--ink)",
              fontSize: 10, fontWeight: 700,
              fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
              cursor: "pointer", height: 24,
              transition: "all .2s",
            }}>
              {mode3d ? "2D 圖解" : "3D 模型"}
            </button>
          </div>
        </div>

        {/* ─── 3D canvas ─── */}
        {mode3d && (
          <div style={{ position: "absolute", inset: 0 }}>
            <canvas ref={canvasRef} style={{
              width: "100%", height: "100%", display: "block",
            }}/>
            {/* Loading bar */}
            {loadPct < 100 && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, pointerEvents: "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em",
                }}>LOADING GLB · {loadPct}%</div>
                <div style={{ width: 180, height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${loadPct}%`,
                    background: "var(--accent)",
                    transition: "width .3s",
                  }}/>
                </div>
              </div>
            )}
            {/* 3D hint */}
            {loadPct >= 100 && (
              <div style={{
                position: "absolute", bottom: 16, left: "50%",
                transform: "translateX(-50%)",
                padding: "5px 14px",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 999, pointerEvents: "none",
                fontFamily: "var(--font-mono)", fontSize: 9,
                color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}>
                拖曳旋轉 · 滾輪縮放 · 點擊高亮零件群組
              </div>
            )}
          </div>
        )}

        {/* ─── 2D Image + hotspots ─── */}
        {!mode3d && (
          <>
            <div onClick={onImageClick} style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                position: "relative",
                width: "90%", height: "82%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img src={view.image} alt={view.label}
                  style={{
                    maxWidth: "100%", maxHeight: "100%",
                    objectFit: "contain", filter: "saturate(0.92)",
                    userSelect: "none", pointerEvents: "none",
                  }}/>
                {viewParts.map(p => (
                  <Hotspot key={p.id} part={p}
                    active={selectedPartId === p.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedPartId(p.id); }}/>
                ))}
                {addingMode && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,113,227,0.04)",
                    border: "1px dashed var(--accent)",
                    borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    pointerEvents: "none",
                  }}>
                    <div style={{
                      padding: "8px 14px",
                      background: "var(--accent)", color: "#fff",
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      letterSpacing: "0.06em", borderRadius: 999,
                      boxShadow: "0 4px 14px rgba(0,113,227,0.32)",
                    }}>點擊任意位置新增零件 · ESC 取消</div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom bar (2D only) */}
            <div style={{
              position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 5,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[...new Set(viewParts.map(p => p.sub))].map(s => (
                  <SubsystemTag key={s} kind={s} size="sm"/>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Button variant={addingMode ? "primary" : "default"}
                  icon={addingMode ? "x" : "plus"}
                  onClick={() => setAddingMode(v => !v)}
                  style={{
                    background: addingMode ? "var(--accent)" : "rgba(255,255,255,0.78)",
                    backdropFilter: "blur(14px)",
                    color: addingMode ? "#fff" : "var(--ink)",
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                  {addingMode ? "取消新增" : "新增零件"}
                </Button>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  color: "var(--muted)", letterSpacing: "0.08em",
                  background: "rgba(255,255,255,0.78)",
                  backdropFilter: "blur(14px)",
                  padding: "8px 12px", borderRadius: 999,
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>{viewParts.length} PARTS · {view.short}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inspector */}
      <Inspector
        part={selected}
        allParts={parts}
        viewParts={mode3d ? parts : viewParts}
        views={views}
        currentViewId={viewId}
        selectedId={selectedPartId}
        mode3d={mode3d}
        onSelect={(partId, partViewId) => {
          setSelectedPartId(partId);
          if (mode3d) {
            const p = parts.find(x => x.id === partId);
            if (p && window.BlueprintGL) {
              const names = window.BlueprintGL.getGroupNames();
              const g = names.find(n => guessSubsystem(n) === p.sub);
              if (g) window.BlueprintGL.setHighlight(g);
            }
            return;
          }
          if (partViewId && partViewId !== viewId) setViewId(partViewId);
        }}
        onEdit={() => selected && setEditing({ open: true, initial: selected })}
        onDelete={() => selected && setConfirm({ kind: "part", target: selected })}
        onAdd={mode3d ? null : () => setAddingMode(true)}/>
    </div>

    <PartModal open={editing.open} initial={editing.initial}
      onClose={() => setEditing({ open: false, initial: null })}
      onSave={(p) => { savePart(p); if (p.id) setSelectedPartId(p.id); }}
      onDelete={(p) => setConfirm({ kind: "part", target: p })}
      currentViewId={viewId} views={views}/>

    <ViewModal open={viewEditing.open} initial={viewEditing.initial}
      onClose={() => setViewEditing({ open: false, initial: null })}
      onSave={saveView}
      onDelete={(v) => setConfirm({ kind: "view", target: v })}
      canDelete={views.length > 1}/>

    <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
      title="確定刪除這筆資料？"
      body={confirm
        ? confirm.kind === "view"
          ? `「${confirm.target.label}」視圖將被移除（含 ${parts.filter(p => p.viewId === confirm.target.id).length} 個零件標記）。`
          : `「${confirm.target.label}」零件將被移除。`
        : ""}
      onConfirm={() => {
        if (!confirm) return;
        if (confirm.kind === "view") deleteView(confirm.target);
        if (confirm.kind === "part") deletePart(confirm.target);
      }}/>
    </>
  );
}

// ─── View selector ────────────────────────────────────────
function ViewStrip({ views, viewId, onChange, onEditView, onAddView }) {
  return (
    <div style={{
      display: "flex", gap: 4, padding: 4,
      background: "rgba(255,255,255,0.78)",
      backdropFilter: "blur(14px) saturate(160%)",
      WebkitBackdropFilter: "blur(14px) saturate(160%)",
      borderRadius: 14,
      border: "0.5px solid rgba(0,0,0,0.08)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {views.map(v => {
        const active = v.id === viewId;
        return (
          <button key={v.id} onClick={() => onChange(v.id)}
            onDoubleClick={() => onEditView(v)}
            title={`${v.label} · 雙擊編輯`}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              padding: "5px 10px", minWidth: 64,
              borderRadius: 10, border: 0, cursor: "pointer",
              background: active ? "var(--ink)" : "transparent",
              color: active ? "#fff" : "var(--ink)",
              fontFamily: "inherit",
              transition: "all .15s var(--ease-out)",
            }}>
            <span style={{
              width: 36, height: 24, borderRadius: 4, overflow: "hidden",
              background: "var(--surface-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={v.image} alt={v.label}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  filter: active ? "saturate(0.9)" : "saturate(0.95)",
                }}/>
            </span>
            <span style={{
              fontSize: 9, fontWeight: 600,
              fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
            }}>{v.short}</span>
          </button>
        );
      })}
      <button onClick={onAddView} title="新增視圖"
        style={{
          width: 64, minHeight: 50,
          background: "transparent",
          border: "0.5px dashed var(--rule)", borderRadius: 10,
          color: "var(--muted)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "inherit",
        }}>
        <UIIcon kind="plus" size={14}/>
      </button>
    </div>
  );
}

function Hotspot({ part, active, onClick }) {
  const color = SUBSYSTEM_COLOR[part.sub] || "#444";
  return (
    <button onClick={onClick} style={{
      position: "absolute",
      left: `${part.x}%`, top: `${part.y}%`,
      transform: "translate(-50%, -50%)",
      width: active ? 28 : 22, height: active ? 28 : 22,
      borderRadius: "50%",
      background: active ? color : "rgba(255,255,255,0.92)",
      border: "1.5px solid " + (active ? color : color + "88"),
      cursor: "pointer", padding: 0,
      transition: "all .25s var(--ease-back)",
      boxShadow: active
        ? `0 0 0 6px ${color}22, 0 4px 12px ${color}55`
        : "0 1px 3px rgba(0,0,0,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 99, background: active ? "#fff" : color }}/>
      {active && (
        <div style={{
          position: "absolute", top: -6, left: 32, whiteSpace: "nowrap",
          padding: "4px 10px", borderRadius: 8,
          background: "var(--ink)", color: "#fff",
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.04em",
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        }}>{part.label}</div>
      )}
    </button>
  );
}

// ─── Inspector side panel ────────────────────────────────
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
      <div style={{ padding: "14px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <SpecRow label="MATERIAL"   value={part.material}/>
        <SpecRow label="WEIGHT"     value={part.weight}/>
        <SpecRow label="REGULATION" value={part.regulation}/>
        <SpecRow label="OWNER"      value={part.owner}/>
        <SpecRow label="SUPPLIER"   value={part.supplier}/>
      </div>

      {/* Notes */}
      {part.note && (
        <div style={{ padding: "0 22px 16px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>NOTES</div>
          <p style={{
            fontSize: 13, color: "var(--faint)", lineHeight: 1.6,
            textWrap: "pretty",
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
        background: "rgba(255,255,255,0.4)",
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
      display: "grid", gridTemplateColumns: "100px 1fr", gap: 12,
      alignItems: "baseline",
    }}>
      <div className="eyebrow">{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: value ? "var(--ink)" : "var(--muted)",
        fontWeight: 500, letterSpacing: 0,
      }}>{value || "—"}</div>
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
            background: "linear-gradient(180deg, #fafafa 0%, #ededef 100%)",
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

// ─── View (image group) Modal ────────────────────────────
function ViewModal({ open, onClose, onSave, onDelete, initial, canDelete }) {
  const blank = { label: "", short: "", image: "assets/car-snapshots/untitled.16.jpg" };
  const [v, setV] = React.useState(initial || blank);
  React.useEffect(() => { setV(initial || blank); }, [initial, open]);
  const u = (k, val) => setV(prev => ({ ...prev, [k]: val }));
  const isNew = !initial?.id;
  const autoClose = () => { onSave(v); onClose(); };
  return (
    <Modal open={open} onClose={onClose} onDismiss={autoClose} width={480}
      eyebrow={isNew ? "NEW VIEW" : "EDIT VIEW"}
      title={isNew ? "新增車輛視圖" : v.label || "編輯視圖"}
      footer={
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" icon="check" onClick={autoClose}>儲存</Button>
          </div>
          {!isNew && canDelete && (
            <div style={{ borderTop: "0.5px solid var(--rule)", marginTop: 10, paddingTop: 10 }}>
              <Button variant="danger" icon="trash" onClick={() => { onDelete(v); onClose(); }}>刪除</Button>
            </div>
          )}
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div className="field"><label>視圖名稱</label>
          <input type="text" value={v.label} onChange={e => u("label", e.target.value)}
            placeholder="例：俯視 + 配重" autoFocus/>
        </div>
        <div className="field"><label>短代碼</label>
          <input type="text" value={v.short} onChange={e => u("short", e.target.value)} placeholder="TOP"/>
        </div>
      </div>
      <div className="field"><label>圖片路徑</label>
        <input type="text" value={v.image} onChange={e => u("image", e.target.value)}
          placeholder="assets/car-snapshots/..."/>
      </div>
      {v.image && (
        <div style={{
          marginTop: 4, padding: 8,
          background: "var(--surface-3)", borderRadius: 10,
          display: "flex", justifyContent: "center", aspectRatio: "16/9",
        }}>
          <img src={v.image} alt="" style={{
            maxWidth: "100%", maxHeight: 180, objectFit: "contain",
          }}/>
        </div>
      )}
    </Modal>
  );
}

window.Blueprint = Blueprint;
