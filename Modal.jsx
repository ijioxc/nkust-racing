// Modal.jsx — modal scaffolding + Task/Person/Plan edit modals

function Modal({ open, onClose, title, eyebrow, children, footer, width = 520 }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: width }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 8px",
        }}>
          <div>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</div>
          </div>
          <IconBtn icon="x" onClick={onClose} title="關閉"/>
        </div>
        <div style={{ padding: "8px 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 8,
            padding: "12px 22px 20px",
            borderTop: "0.5px solid var(--rule)",
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// ─── Task editor ──────────────────────────────────────────
function TaskModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = {
    subsystem: "車體", title: "", progress: 0, start: 0, span: 7,
    owner: "", priority: "MID", size: "1x1", state: "active",
  };
  const [t, setT] = React.useState(initial || blank);
  React.useEffect(() => { setT(initial || blank); }, [initial, open]);

  const update = (k, v) => setT(prev => ({ ...prev, [k]: v }));
  const isNew = !initial;

  return (
    <Modal open={open} onClose={onClose}
      eyebrow={isNew ? "NEW TASK" : "EDIT TASK"}
      title={isNew ? "新增工作" : t.title || "編輯工作"}
      footer={
        <>
          {!isNew && onDelete && (
            <Button variant="danger" icon="trash" onClick={() => { onDelete(t); onClose(); }} style={{ marginRight: "auto" }}>刪除</Button>
          )}
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" icon="check" onClick={() => { onSave(t); onClose(); }}>儲存</Button>
        </>
      }>
      <div className="field">
        <label>任務標題</label>
        <input type="text" value={t.title} onChange={e => update("title", e.target.value)} placeholder="例：底盤主環 TIG 焊接" autoFocus/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>子系統</label>
          <select value={t.subsystem} onChange={e => update("subsystem", e.target.value)}>
            {SUBSYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label>優先度</label>
          <select value={t.priority} onChange={e => update("priority", e.target.value)}>
            <option value="HIGH">高 · HIGH</option>
            <option value="MID">中 · MID</option>
            <option value="LOW">低 · LOW</option>
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>負責人</label>
          <input type="text" value={t.owner} onChange={e => update("owner", e.target.value)} placeholder="例：陳偉成"/>
        </div>
        <div className="field">
          <label>狀態</label>
          <select value={t.state} onChange={e => update("state", e.target.value)}>
            <option value="active">進行中</option>
            <option value="focus">本週焦點</option>
            <option value="done">已完成</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>進度 — {t.progress}%</label>
        <input type="range" min="0" max="100" step="1" value={t.progress}
          onChange={e => update("progress", parseInt(e.target.value))}
          style={{ accentColor: "var(--accent)" }}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>起始週</label>
          <input type="number" min="0" max="20" value={t.start} onChange={e => update("start", parseInt(e.target.value) || 0)}/>
        </div>
        <div className="field">
          <label>持續週</label>
          <input type="number" min="1" max="20" value={t.span} onChange={e => update("span", parseInt(e.target.value) || 1)}/>
        </div>
        <div className="field">
          <label>Bento 尺寸</label>
          <select value={t.size} onChange={e => update("size", e.target.value)}>
            <option value="1x1">1×1</option>
            <option value="2x1">2×1</option>
            <option value="2x2">2×2</option>
            <option value="3x2">3×2</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ─── Person editor ─────────────────────────────────────────
function PersonModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = {
    name: "", position: "成員", email: "",
    department: "機械系", grade: "大一", workTypes: [],
  };
  const [p, setP] = React.useState(initial || blank);
  React.useEffect(() => { setP(initial || blank); }, [initial, open]);
  const update = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const toggle = (s) => setP(prev => ({
    ...prev,
    workTypes: prev.workTypes.includes(s)
      ? prev.workTypes.filter(x => x !== s)
      : [...prev.workTypes, s],
  }));
  const isNew = !initial;

  return (
    <Modal open={open} onClose={onClose}
      eyebrow={isNew ? "NEW MEMBER" : "EDIT MEMBER"}
      title={isNew ? "新增成員" : p.name || "編輯成員"}
      footer={
        <>
          {!isNew && onDelete && (
            <Button variant="danger" icon="trash" onClick={() => { onDelete(p); onClose(); }} style={{ marginRight: "auto" }}>刪除</Button>
          )}
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" icon="check" onClick={() => { onSave(p); onClose(); }}>儲存</Button>
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>姓名</label>
          <input type="text" value={p.name} onChange={e => update("name", e.target.value)} autoFocus/>
        </div>
        <div className="field">
          <label>職位</label>
          <select value={p.position} onChange={e => update("position", e.target.value)}>
            {["隊長","副隊長","組長","成員","教授","助教","顧問"].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={p.email} onChange={e => update("email", e.target.value)}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>系所</label>
          <select value={p.department} onChange={e => update("department", e.target.value)}>
            {["機械系","車輛系","電機系","模具系","工管系","其他"].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="field">
          <label>年級</label>
          <select value={p.grade} onChange={e => update("grade", e.target.value)}>
            {["大一","大二","大三","大四","碩一","碩二","教職"].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>負責子系統（可複選）</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {SUBSYSTEMS.map(s => {
            const on = p.workTypes.includes(s);
            const color = SUBSYSTEM_COLOR[s];
            return (
              <button key={s} type="button" onClick={() => toggle(s)} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 11px", borderRadius: 999,
                background: on ? color + "1c" : "rgba(0,0,0,0.04)",
                color: on ? color : "var(--muted)",
                border: "0.5px solid " + (on ? color + "40" : "rgba(0,0,0,0.06)"),
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                transition: "all .15s",
              }}>
                <SubsystemIcon kind={s} size={11} color={on ? color : "currentColor"}/>
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ─── Plan editor ───────────────────────────────────────────
function PlanModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = { title: "", kicker: "", body: "", cover: null, sub: "車體" };
  const [p, setP] = React.useState(initial || blank);
  React.useEffect(() => { setP(initial || blank); }, [initial, open]);
  const update = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const isNew = !initial;
  return (
    <Modal open={open} onClose={onClose}
      eyebrow={isNew ? "NEW PLAN" : "EDIT PLAN"}
      title={isNew ? "新增計畫" : p.title || "編輯計畫"} width={560}
      footer={
        <>
          {!isNew && onDelete && (
            <Button variant="danger" icon="trash" onClick={() => { onDelete(p); onClose(); }} style={{ marginRight: "auto" }}>刪除</Button>
          )}
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" icon="check" onClick={() => { onSave(p); onClose(); }}>儲存</Button>
        </>
      }>
      <div className="field"><label>計畫標題</label>
        <input type="text" value={p.title} onChange={e => update("title", e.target.value)} autoFocus/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Kicker（英文副標）</label>
          <input type="text" value={p.kicker} onChange={e => update("kicker", e.target.value)} placeholder="DESIGN PROPOSAL"/>
        </div>
        <div className="field"><label>子系統</label>
          <select value={p.sub} onChange={e => update("sub", e.target.value)}>
            {SUBSYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label>內容描述</label>
        <textarea value={p.body} onChange={e => update("body", e.target.value)} rows={3}/>
      </div>
      <div className="field">
        <label>封面圖</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input 
            type="text" 
            value={p.cover || ""} 
            onChange={e => update("cover", e.target.value || null)}
            placeholder="輸入圖片網址、路徑，或點擊右側上傳..."
            style={{ flex: 1 }}
          />
          <Button 
            variant="ghost" 
            icon="upload" 
            onClick={() => {
              const fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.accept = "image/*";
              fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    update("cover", evt.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              };
              fileInput.click();
            }}
          >
            上傳
          </Button>
          {p.cover && (
            <Button 
              variant="danger" 
              icon="trash" 
              onClick={() => update("cover", null)}
              title="移除封面"
              style={{ minWidth: "auto", padding: "0 10px" }}
            >
              移除
            </Button>
          )}
        </div>
        {p.cover && (
          <div style={{ 
            marginTop: 8, 
            borderRadius: 6, 
            overflow: "hidden", 
            border: "1px solid var(--border)", 
            height: 120, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            background: "rgba(255,255,255,0.02)",
            position: "relative"
          }}>
            <img 
              src={p.cover} 
              alt="Cover Preview" 
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

Object.assign(window, { Modal, TaskModal, PersonModal, PlanModal });
