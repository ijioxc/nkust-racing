// Modal.jsx — modal scaffolding + Task/Person/Plan edit modals

// onDismiss = auto-save handler for X / backdrop / ESC
// onClose   = explicit cancel (discard)
function Modal({ open, onClose, onDismiss, title, eyebrow, children, footer, width = 520 }) {
  const handleDismiss = onDismiss || onClose;
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && handleDismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleDismiss]);
  if (!open) return null;
  return (
    <div className="modal-back" onClick={handleDismiss}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: width }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 8px",
        }}>
          <div>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</div>
          </div>
          <IconBtn icon="x" onClick={handleDismiss} title="關閉（自動儲存）"/>
        </div>
        <div style={{ padding: "8px 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 0,
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

  const autoClose = () => { onSave(t); onClose(); };
  return (
    <Modal open={open} onClose={onClose} onDismiss={autoClose}
      eyebrow={isNew ? "NEW TASK" : "EDIT TASK"}
      title={isNew ? "新增工作" : t.title || "編輯工作"}
      footer={
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" icon="check" onClick={autoClose}>儲存</Button>
          </div>
          {!isNew && onDelete && (
            <div style={{ borderTop: "0.5px solid var(--rule)", marginTop: 10, paddingTop: 10 }}>
              <Button variant="danger" icon="trash" onClick={() => { onDelete(t); onClose(); }}>刪除</Button>
            </div>
          )}
        </>
      }>
      <div className="field">
        <label>任務標題</label>
        <input type="text" value={t.title} onChange={e => update("title", e.target.value)} placeholder="例：底盤主環 TIG 焊接" autoFocus/>
      </div>

      <div className="field">
        <label>子系統</label>
        <SubsystemGridSelector value={t.subsystem} onChange={v => update("subsystem", v)}/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>優先度</label>
          <SegmentedControl
            options={[
              { value: "HIGH", label: "高 · HIGH" },
              { value: "MID", label: "中 · MID" },
              { value: "LOW", label: "低 · LOW" },
            ]}
            value={t.priority}
            onChange={v => update("priority", v)}
          />
        </div>
        <div className="field">
          <label>狀態</label>
          <SegmentedControl
            options={[
              { value: "active", label: "進行中" },
              { value: "focus", label: "本週焦點" },
              { value: "done", label: "已完成" },
            ]}
            value={t.state}
            onChange={v => update("state", v)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>負責人</label>
          <input type="text" value={t.owner} onChange={e => update("owner", e.target.value)} placeholder="例：陳偉成"/>
        </div>
        <div className="field">
          <label>Bento 尺寸</label>
          <SegmentedControl
            options={[
              { value: "1x1", label: "1×1" },
              { value: "2x1", label: "2×1" },
              { value: "2x2", label: "2×2" },
              { value: "3x2", label: "3×2" },
            ]}
            value={t.size}
            onChange={v => update("size", v)}
          />
        </div>
      </div>

      <div className="field" style={{ marginTop: 6 }}>
        <GlowingSlider value={t.progress} onChange={v => update("progress", v)} label="任務進度" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>起始週</label>
          <input type="number" min="0" max="20" value={t.start} onChange={e => update("start", parseInt(e.target.value) || 0)}/>
        </div>
        <div className="field">
          <label>持續週</label>
          <input type="number" min="1" max="20" value={t.span} onChange={e => update("span", parseInt(e.target.value) || 1)}/>
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
  const isNew = !initial;

  const autoClose = () => { onSave(p); onClose(); };
  return (
    <Modal open={open} onClose={onClose} onDismiss={autoClose}
      eyebrow={isNew ? "NEW MEMBER" : "EDIT MEMBER"}
      title={isNew ? "新增成員" : p.name || "編輯成員"}
      footer={
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" icon="check" onClick={autoClose}>儲存</Button>
          </div>
          {!isNew && onDelete && (
            <div style={{ borderTop: "0.5px solid var(--rule)", marginTop: 10, paddingTop: 10 }}>
              <Button variant="danger" icon="trash" onClick={() => { onDelete(p); onClose(); }}>刪除</Button>
            </div>
          )}
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>姓名</label>
          <input type="text" value={p.name} onChange={e => update("name", e.target.value)} autoFocus placeholder="例：黃哲宇"/>
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
        <input type="email" value={p.email} onChange={e => update("email", e.target.value)} placeholder="example@nkust.edu.tw"/>
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
        <SubsystemGridSelector value={p.workTypes} onChange={v => update("workTypes", v)} multiple />
      </div>
    </Modal>
  );
}

// ─── Plan editor ───────────────────────────────────────────
function PlanModal({ open, onClose, onSave, onDelete, initial }) {
  // Migrate legacy {title, kicker, body} → unified content string
  const toContent = (pl) => {
    if (!pl) return "";
    if (pl.content !== undefined) return pl.content;
    const lines = [];
    if (pl.title)  lines.push(pl.title);
    if (pl.kicker) lines.push(pl.kicker);
    if (pl.body)   lines.push(pl.body);
    return lines.join('\n');
  };

  const blank = { content: "", sub: "車體", layout: "landscape", tag: "討論中", cover: null };
  const toState = (pl) => pl ? { ...blank, ...pl, content: toContent(pl) } : blank;
  const [p, setP] = React.useState(() => toState(initial));
  React.useEffect(() => { setP(toState(initial)); }, [initial, open]);
  const update = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const isNew = !initial;

  // Derive display title from first line for Modal header
  const firstLine = (p.content || "").split('\n')[0].trim();

  const autoClose = () => {
    // Sync legacy fields for backward compat (PlanDetailPanel, etc.)
    const lines = (p.content || "").split('\n');
    const title = lines[0] || "";
    const body  = lines.slice(1).join('\n').trimStart();
    onSave({ ...p, title, body, kicker: "" });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} onDismiss={autoClose}
      eyebrow={isNew ? "NEW PLAN" : "EDIT PLAN"}
      title={isNew ? "新增計畫" : firstLine || "編輯計畫"} width={540}
      footer={
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" icon="check" onClick={autoClose}>儲存</Button>
          </div>
          {!isNew && onDelete && (
            <div style={{ borderTop: "0.5px solid var(--rule)", marginTop: 10, paddingTop: 10 }}>
              <Button variant="danger" icon="trash" onClick={() => { onDelete(p); onClose(); }}>刪除</Button>
            </div>
          )}
        </>
      }>

      {/* Unified content field: first line = big title, rest = body */}
      <div className="field">
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          計畫內容
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", opacity: 0.45, fontWeight: 400, letterSpacing: "0.04em" }}>
            第一行 → 標題 ／ 以下 → 說明
          </span>
        </label>
        <textarea
          value={p.content}
          onChange={e => update("content", e.target.value)}
          autoFocus
          rows={5}
          placeholder={"2026 底盤管架結構輕量化設計\n\n詳細說明計畫背景與技術指標…"}
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="field"><label>子系統分類</label>
        <SubsystemGridSelector value={p.sub} onChange={v => update("sub", v)}/>
      </div>

      <div className="field"><label>進度狀態</label>
        <SegmentedControl
          options={[
            { value: "討論中", label: "討論中" },
            { value: "進行中", label: "進行中" },
            { value: "已完成", label: "已完成" },
            { value: "擱置",   label: "擱置" },
          ]}
          value={p.tag || "討論中"}
          onChange={v => update("tag", v)}
        />
      </div>

      <div className="field">
        <label>封面圖與預覽</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <input 
            type="text" 
            value={p.cover || ""} 
            onChange={e => update("cover", e.target.value || null)}
            placeholder="輸入外部圖片網址，或點擊右側上傳..."
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
        
        {p.cover ? (
          <div style={{ 
            borderRadius: 8, 
            overflow: "hidden", 
            border: "1px solid var(--rule)", 
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
        ) : (
          <div className="blueprint-draft-grid">
            <div style={{ 
              color: "rgba(255, 255, 255, 0.08)", 
              fontSize: 16, 
              fontWeight: 800, 
              fontFamily: "var(--font-mono)", 
              letterSpacing: "0.15em",
              pointerEvents: "none",
              userSelect: "none"
            }}>
              {p.sub.toUpperCase()} SPECIFICATION DRAFT
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

Object.assign(window, { Modal, TaskModal, PersonModal, PlanModal });
