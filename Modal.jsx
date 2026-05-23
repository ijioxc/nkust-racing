// Modal.jsx — modal scaffolding + Task/Person/Plan edit modals

// onDismiss = auto-save handler for X / backdrop / ESC
// onClose   = explicit cancel (discard)
function Modal({ open, onClose, onDismiss, title, eyebrow, children, footer, headerAction, width = 520 }) {
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
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: width, background: "var(--bg-secondary)", border: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 8px",
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--label-primary)" }}>{title}</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {headerAction}
            <IconBtn icon="x" onClick={handleDismiss} title="關閉（自動儲存）"/>
          </div>
        </div>
        <div style={{ padding: "8px 22px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 0,
            padding: "0",
            borderTop: "none",
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// ─── Schema-Driven Form Field Renderer ──────────────────────
function renderFieldInput(field, value, onChange) {
  const baseInputStyle = { background: "transparent", border: "none", outline: "none", padding: "4px 0", color: "var(--label-primary)", fontSize: 16, width: "100%" };
  switch (field.type) {
    case "text":
      return <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} autoFocus={field.autoFocus} style={baseInputStyle}/>;
    case "textarea":
      return <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={field.rows || 3} placeholder={field.placeholder} style={{ ...baseInputStyle, resize: "vertical" }}/>;
    case "number":
      return <input type="number" min={field.min} max={field.max} value={value === undefined ? "" : value} onChange={e => onChange(parseInt(e.target.value) || 0)} style={baseInputStyle}/>;
    case "select":
      return (
        <select value={value || ""} onChange={e => onChange(e.target.value)} style={baseInputStyle}>
          {field.options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      );
    case "segmented":
      return <SegmentedControl options={field.options} value={value} onChange={onChange} multiple={field.multiple}/>;
    case "subsystem":
      return <SubsystemGridSelector value={value} onChange={onChange} multiple={field.multiple}/>;
    case "slider":
      return <GlowingSlider value={value || 0} onChange={onChange} label={field.sliderLabel}/>;
    case "image":
      return (
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <input type="text" value={value || ""} onChange={e => onChange(e.target.value || null)} placeholder={field.placeholder} style={{ ...baseInputStyle, flex: 1 }}/>
            <Button variant="ghost" icon="upload" onClick={() => {
              const fileInput = document.createElement("input");
              fileInput.type = "file";
              fileInput.accept = "image/*";
              fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => onChange(evt.target.result);
                  reader.readAsDataURL(file);
                }
              };
              fileInput.click();
            }}>上傳</Button>
            {value && (
              <Button variant="danger" icon="trash" onClick={() => onChange(null)} title="移除圖片" style={{ minWidth: "auto", padding: "0 10px" }}>
                移除
              </Button>
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ─── Dynamic Schema Form Modal with Live Canvas Preview ──────
function DynamicEditorModal({ open, onClose, onSave, onDelete, initial, schema, renderPreview, eyebrow, titleKey, width = 840 }) {
  const [data, setData] = React.useState(initial || {});
  React.useEffect(() => { setData(initial || {}); }, [initial, open]);

  const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));
  const isNew = !initial?.id;

  const autoSave = () => {
    onSave(data);
    onClose();
  };

  let displayTitle = isNew ? "新增項目" : "編輯項目";
  if (!isNew && data) {
    if (typeof titleKey === "function") displayTitle = titleKey(data);
    else if (typeof titleKey === "string" && data[titleKey]) displayTitle = data[titleKey];
    else if (data.name) displayTitle = data.name;
    else if (data.title) displayTitle = data.title;
    else if (data.content) displayTitle = data.content.split('\n')[0].trim();
  }

  const headerAction = (
    <Button variant="ghost" style={{ color: "var(--blue)", fontWeight: 600, padding: "0 12px" }} onClick={autoSave}>儲存</Button>
  );

  const footerContent = !isNew && onDelete ? (
    <button onClick={() => { onDelete(data); onClose(); }} style={{ width: "100%", padding: "16px 0", background: "transparent", border: "none", color: "var(--red)", fontSize: 16, fontWeight: 600, cursor: "pointer", borderTop: "0.5px solid var(--separator)" }}>刪除</button>
  ) : null;

  return (
    <Modal open={open} onClose={onClose} onDismiss={autoSave} eyebrow={eyebrow} title={displayTitle} headerAction={headerAction} footer={footerContent} width={renderPreview ? width : 520}>
      <div className="split-editor-container">
        {/* Left Side: Form Fields */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg-tertiary)", borderRadius: 16 }}>
          {schema.map((f, i) => {
            if (f.type === "row") {
              return (
                <div key={`row-${i}`} style={{ display: "flex", position: "relative" }}>
                  {f.fields.map((subF, j) => (
                    <div className="field" key={subF.key} style={{ flex: 1, padding: "12px 16px", position: "relative" }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--label-tertiary)", marginBottom: 4, letterSpacing: "0.01em" }}>{subF.label}</div>
                      <div>
                        {renderFieldInput(subF, data[subF.key], (val) => update(subF.key, val))}
                      </div>
                      {j < f.fields.length - 1 && <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "0.5px", background: "var(--separator)" }} />}
                    </div>
                  ))}
                  {i < schema.length - 1 && <div style={{ position: "absolute", bottom: 0, left: 16, right: 0, height: "0.5px", background: "var(--separator)" }} />}
                </div>
              );
            }
            return (
              <div className="field" key={f.key} style={{ padding: "12px 16px", position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--label-tertiary)", marginBottom: 4, letterSpacing: "0.01em" }}>{f.label}</div>
                <div>
                  {renderFieldInput(f, data[f.key], (val) => update(f.key, val))}
                </div>
                {i < schema.length - 1 && <div style={{ position: "absolute", bottom: 0, left: 16, right: 0, height: "0.5px", background: "var(--separator)" }} />}
              </div>
            );
          })}
        </div>

        {/* Right Side: Xcode-Style Live Card Preview (Desktop Only) */}
        {renderPreview && (
          <div className="live-preview-pane">
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#27c93f" }}/>
              Live Canvas Preview
            </div>
            
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--fill-quaternary)",
              border: "1px dashed var(--separator)",
              borderRadius: "var(--radius-lg)",
              padding: 16,
              position: "relative",
              overflow: "hidden",
            }}>
              {renderPreview(data)}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Task Schema & Modal Wrapper ────────────────────────────
const TASK_SCHEMA = [
  { key: "title", label: "任務標題", type: "text", placeholder: "例：底盤主環 TIG 焊接", autoFocus: true },
  { key: "subsystem", label: "系統", type: "segmented", options: [
    { value: "車體", label: "車體" }, { value: "引擎", label: "引擎" }, { value: "懸吊", label: "懸吊" }, { value: "煞車", label: "煞車" }, { value: "電裝", label: "電裝" }, { value: "空力", label: "空力" }, { value: "其他", label: "其他" }
  ]},
  { key: "priority", label: "優先度", type: "segmented", options: [
    { value: "HIGH", label: "高 · HIGH" },
    { value: "MID", label: "中 · MID" },
    { value: "LOW", label: "低 · LOW" },
  ]},
  { key: "state", label: "狀態", type: "segmented", options: [
    { value: "active", label: "進行中" },
    { value: "focus", label: "本週焦點" },
    { value: "done", label: "已完成" },
  ]},
  { key: "owner", label: "負責人", type: "text", placeholder: "例：陳偉成" },
  { key: "size", label: "Bento 尺寸", type: "segmented", options: [
    { value: "1x1", label: "1×1" },
    { value: "2x1", label: "2×1" },
    { value: "2x2", label: "2×2" },
    { value: "3x2", label: "3×2" },
  ]},
  { key: "progress", label: "任務進度", type: "slider", sliderLabel: "任務進度" },
  { key: "start", label: "起始週", type: "number", min: 0, max: 20 },
  { key: "span", label: "持續週", type: "number", min: 1, max: 20 },
];

function TaskModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = {
    subsystem: "車體", title: "", progress: 0, start: 0, span: 7,
    owner: "", priority: "MID", size: "1x1", state: "active",
  };
  return (
    <DynamicEditorModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      initial={initial || blank}
      schema={TASK_SCHEMA}
      eyebrow={!initial ? "NEW TASK" : "EDIT TASK"}
      titleKey="title"
      renderPreview={(data) => {
        const BentoCard = window.BentoCard;
        if (!BentoCard) return null;
        return <BentoCard task={data} onClick={() => {}} />;
      }}
    />
  );
}

// ─── Person Schema & Modal Wrapper ──────────────────────────
const PERSON_SCHEMA = [
  { key: "name", label: "姓名", type: "text", placeholder: "例：黃哲宇", autoFocus: true },
  { type: "row", fields: [
    { key: "email", label: "Email", type: "text", placeholder: "example@nkust.edu.tw" },
    { key: "phone", label: "電話", type: "text", placeholder: "0900-000-000" }
  ]},
  { key: "position", label: "職位", type: "segmented", options: [
    { value: "隊長", label: "隊長" }, { value: "副隊長", label: "副隊長" }, { value: "組長", label: "組長" }, { value: "成員", label: "成員" }, { value: "教授", label: "教授" }, { value: "助教", label: "助教" }, { value: "顧問", label: "顧問" }
  ]},
  { key: "department", label: "系所", type: "segmented", options: [
    { value: "機械系", label: "機械系" }, { value: "車輛系", label: "車輛系" }, { value: "電機系", label: "電機系" }, { value: "模具系", label: "模具系" }, { value: "工管系", label: "工管系" }, { value: "其他", label: "其他" }
  ]},
  { key: "grade", label: "年級", type: "segmented", options: [
    { value: "大一", label: "大一" }, { value: "大二", label: "大二" }, { value: "大三", label: "大三" }, { value: "大四", label: "大四" }, { value: "碩一", label: "碩一" }, { value: "碩二", label: "碩二" }, { value: "教職", label: "教職" }
  ]},
  { key: "workTypes", label: "負責系統（可複選）", type: "segmented", multiple: true, options: [
    { value: "車體", label: "車體" }, { value: "引擎", label: "引擎" }, { value: "懸吊", label: "懸吊" }, { value: "煞車", label: "煞車" }, { value: "電裝", label: "電裝" }, { value: "空力", label: "空力" }, { value: "其他", label: "其他" }
  ]},
];

function PersonModal({ open, onClose, onSave, onDelete, initial }) {
  const blank = {
    name: "", position: "成員", email: "", phone: "",
    department: "機械系", grade: "大一", workTypes: [],
  };
  return (
    <DynamicEditorModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      initial={initial || blank}
      schema={PERSON_SCHEMA}
      eyebrow={!initial ? "NEW MEMBER" : "EDIT MEMBER"}
      titleKey="name"
      renderPreview={(data) => {
        const PersonCard = window.PersonCard;
        if (!PersonCard) return null;
        return (
          <div style={{ width: "100%", transform: "scale(0.92)", transformOrigin: "center" }}>
            <PersonCard person={data} onClick={() => {}} />
          </div>
        );
      }}
    />
  );
}

// ─── Plan Schema & Modal Wrapper ────────────────────────────
const PLAN_SCHEMA = [
  { key: "content", label: "計畫內容", type: "textarea", rows: 5, placeholder: "2026 底盤管架結構輕量化設計\n\n詳細說明計畫背景與技術指標…", hint: "第一行 → 標題 ／ 以下 → 說明" },
  { key: "sub", label: "系統", type: "segmented", options: [
    { value: "車體", label: "車體" }, { value: "引擎", label: "引擎" }, { value: "懸吊", label: "懸吊" }, { value: "煞車", label: "煞車" }, { value: "電裝", label: "電裝" }, { value: "空力", label: "空力" }, { value: "其他", label: "其他" }
  ]},
  { key: "tag", label: "進度狀態", type: "segmented", options: [
    { value: "討論中", label: "討論中" },
    { value: "進行中", label: "進行中" },
    { value: "已完成", label: "已完成" },
    { value: "擱置",   label: "擱置" },
  ]},
  { key: "cover", label: "封面圖與預覽", type: "image", placeholder: "輸入外部圖片網址，或點擊右側上傳..." },
];

function PlanModal({ open, onClose, onSave, onDelete, initial }) {
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
  const [initialState, setInitialState] = React.useState(() => initial ? { ...blank, ...initial, content: toContent(initial) } : blank);
  React.useEffect(() => {
    setInitialState(initial ? { ...blank, ...initial, content: toContent(initial) } : blank);
  }, [initial, open]);

  const handleSave = (data) => {
    const lines = (data.content || "").split('\n');
    const title = lines[0] || "";
    const body  = lines.slice(1).join('\n').trimStart();
    onSave({ ...data, title, body, kicker: "" });
  };

  return (
    <DynamicEditorModal
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onDelete={onDelete}
      initial={initialState}
      schema={PLAN_SCHEMA}
      eyebrow={!initial ? "NEW PLAN" : "EDIT PLAN"}
      titleKey={(d) => (d.content || "").split('\n')[0].trim() || "編輯計畫"}
      renderPreview={(data) => {
        const PlanCard = window.PlanCard;
        if (!PlanCard) return null;
        const lines = (data.content || "").split('\n');
        const title = lines[0] || "";
        const body  = lines.slice(1).join('\n').trimStart();
        const mockPlan = { ...data, title, body };
        return (
          <div style={{ width: "100%", transform: "scale(0.85)", transformOrigin: "center" }}>
            <PlanCard plan={mockPlan} draggable={false} scale={2} onClick={() => {}} onScaleChange={() => {}} />
          </div>
        );
      }}
    />
  );
}

Object.assign(window, { Modal, TaskModal, PersonModal, PlanModal, DynamicEditorModal });
