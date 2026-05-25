// Dashboard.jsx — 4 sub-views: Overview, Worklog, Plans, People
//
// Owns the editable lists. Receives state + setters from App so persistence/
// undo can later be added at the top level.

const TOTAL_WEEKS = 14;
const WEEK_LABELS = Array.from({ length: TOTAL_WEEKS }, (_, i) => `W${i + 1}`);

// ─── Plan content helpers (backward-compat with legacy {title,kicker,body}) ───
function planTitle(plan) {
  if (plan.content !== undefined) return plan.content.split('\n')[0].trim() || "（無標題）";
  return plan.title || "（無標題）";
}
function planBody(plan) {
  if (plan.content !== undefined) {
    const nl = plan.content.indexOf('\n');
    return nl >= 0 ? plan.content.slice(nl + 1).trimStart() : "";
  }
  return [plan.kicker, plan.body].filter(Boolean).join('\n');
}
function planBodyLines(plan, n = 3) {
  return planBody(plan).split('\n').filter(l => l.trim()).slice(0, n).join(' ').trim();
}

function Dashboard({ tab, tasks, setTasks, people, setPeople, plans, setPlans, suppliers, setSuppliers, resources, setResources }) {
  const [taskModal, setTaskModal]   = React.useState({ open: false, initial: null });
  const [personModal, setPersonModal] = React.useState({ open: false, initial: null });
  const [planModal, setPlanModal]   = React.useState({ open: false, initial: null });
  const [planDetail, setPlanDetail] = React.useState({ open: false, target: null });
  const [taskPreview, setTaskPreview] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);

  // Common edit-list helpers
  const saveTask = (t) => setTasks(prev => {
    if (t.id) return prev.map(x => x.id === t.id ? { ...x, ...t } : x);
    return [...prev, { ...t, id: "t" + (Date.now()) }];
  });
  const deleteTask = (t) => setTasks(prev => prev.filter(x => x.id !== t.id));

  const savePerson = (p) => setPeople(prev => {
    if (p.id) return prev.map(x => x.id === p.id ? { ...x, ...p } : x);
    return [...prev, { ...p, id: "p" + Date.now() }];
  });
  const deletePerson = (p) => setPeople(prev => prev.filter(x => x.id !== p.id));

  const savePlan = (p) => setPlans(prev => {
    if (p.id) return prev.map(x => x.id === p.id ? { ...x, ...p } : x);
    return [...prev, { ...p, id: "pl" + Date.now() }];
  });
  const deletePlan = (p) => setPlans(prev => prev.filter(x => x.id !== p.id));

  return (
    <>
      {tab === "overview" && (
        <OverviewView tasks={tasks} people={people} plans={plans}
          openTask={(t) => setTaskPreview(t)}
          openPlan={(p) => setPlanDetail({ open: true, target: p })}/>
      )}
      {tab === "worklog" && (
        <WorklogView tasks={tasks}
          openTask={(t) => setTaskPreview(t)}
          newTask={() => setTaskModal({ open: true, initial: null })}
          onDelete={(t) => setConfirm({ kind: "task", target: t })}/>
      )}
      {tab === "plans" && (
        <PlansView plans={plans} setPlans={setPlans}
          openPlan={(p) => setPlanDetail({ open: true, target: p })}
          editPlan={(p) => setPlanModal({ open: true, initial: p })}
          newPlan={() => setPlanModal({ open: true, initial: null })}
          onDelete={(p) => setConfirm({ kind: "plan", target: p })}/>
      )}
      {tab === "people" && (
        <PeopleView people={people}
          editPerson={(p) => setPersonModal({ open: true, initial: p })}
          newPerson={() => setPersonModal({ open: true, initial: null })}
          onDelete={(p) => setConfirm({ kind: "person", target: p })}/>
      )}
      {tab === "parts" && (
        <PartsView suppliers={suppliers} setSuppliers={setSuppliers}/>
      )}
      {tab === "resources" && (
        <ResourcesView resources={resources} setResources={setResources}/>
      )}

      <TaskModal open={taskModal.open} initial={taskModal.initial}
        onClose={() => setTaskModal({ open: false, initial: null })}
        onSave={saveTask} onDelete={deleteTask}/>
      <PersonModal open={personModal.open} initial={personModal.initial}
        onClose={() => setPersonModal({ open: false, initial: null })}
        onSave={savePerson} onDelete={deletePerson}/>
      <PlanModal open={planModal.open} initial={planModal.initial}
        onClose={() => setPlanModal({ open: false, initial: null })}
        onSave={savePlan} onDelete={deletePlan}/>

      {planDetail.open && planDetail.target && (
        <PlanPreview plan={planDetail.target} plans={plans}
          onClose={() => setPlanDetail({ open: false, target: null })}
          onEdit={(p) => { setPlanDetail({ open: false, target: null }); setPlanModal({ open: true, initial: p }); }}
          onDelete={(p) => { setPlanDetail({ open: false, target: null }); setConfirm({ kind: "plan", target: p }); }}
          onTagChange={(id, tag) => setPlans(prev => prev.map(p => p.id === id ? { ...p, tag } : p))}/>
      )}

      {taskPreview && (
        <BentoPreviewModal task={taskPreview}
          onClose={() => setTaskPreview(null)}
          onEdit={() => { setTaskModal({ open: true, initial: taskPreview }); setTaskPreview(null); }}
          onDelete={() => { setConfirm({ kind: "task", target: taskPreview }); setTaskPreview(null); }}/>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="確定刪除這筆資料？"
        body={confirm ? `「${confirm.target.title || confirm.target.name}」將被永久移除，此操作無法復原。` : ""}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "task")   deleteTask(confirm.target);
          if (confirm.kind === "person") deletePerson(confirm.target);
          if (confirm.kind === "plan")   deletePlan(confirm.target);
        }}/>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  OVERVIEW
// ═══════════════════════════════════════════════════════════
function OverviewView({ tasks, people, plans, openTask, openPlan }) {
  const active   = tasks.filter(t => t.state !== "done").length;
  const onTime   = tasks.filter(t => t.state !== "done" && t.progress >= 40).length;
  const overdue  = tasks.filter(t => t.state !== "done" && t.progress < 40 && t.start + t.span < 8).length;
  const donePct  = Math.round((tasks.filter(t => t.state === "done").length / tasks.length) * 100);

  const focused = tasks.find(t => t.state === "focus") || tasks[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* Mini bento preview */}
      <div>
        <SectionHead title="本週 Bento · This Week" hint={`${tasks.length} TASKS`}/>
        <BentoBoard tasks={tasks} onTaskClick={openTask}/>
      </div>

      {/* Roster — own row, scrolls horizontally */}
      <div style={{ minWidth: 0 }}>
        <SectionHead title="團隊成員" hint={`${people.length} 人 · ROSTER`}/>
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 6, paddingRight: 4,
          scrollbarWidth: "thin",
        }}>
          {people.map(p => <RosterChip key={p.id} person={p}/>)}
        </div>
      </div>

      {/* Module summaries — 4-up grid */}
      <div className="overview-summary-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "var(--gap-card)",
      }}>
        <WeeklyFocusCard/>
        <PlansSnapshot plans={plans} onOpen={openPlan}/>
        <PartsSnapshot/>
        <RacesSnapshot/>
      </div>
    </div>
  );
}

function WeeklyFocusCard() {
  const items = [
    { label: "FSAE-TW 2026 報名截止", date: "W-3", priority: "HIGH" },
    { label: "scrutineering 文件",  date: "W-5", priority: "HIGH" },
    { label: "贊助合約 — Realis",   date: "W-2", priority: "MID"  },
    { label: "鼻錐跌落測試",        date: "W-6", priority: "MID"  },
  ];
  return (
    <div className="tcard large" style={{ padding: "var(--card-pad)", minWidth: 0 }}>
      <SectionHead title="本週重點" hint="WEEKLY"/>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 7,
            padding: "6px 0",
            borderBottom: i < items.length - 1 ? "0.5px solid var(--rule)" : "none",
          }}>
            {/* 優先度色點 */}
            <PriorityPill priority={it.priority} dotOnly style={{ marginTop: 4 }}/>
            {/* 名稱（主角，允許換行） */}
            <span style={{
              flex: 1, fontSize: 12, lineHeight: 1.35, color: "var(--ink)",
              fontWeight: 500, letterSpacing: "-0.005em",
            }}>{it.label}</span>
            {/* 週次 */}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 8,
              color: "var(--muted)", flexShrink: 0,
              letterSpacing: "0.04em", marginTop: 2,
            }}>{it.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlansSnapshot({ plans, onOpen }) {
  return (
    <div className="tcard large" style={{ padding: "var(--card-pad)", minWidth: 0 }}>
      <SectionHead title="設計提案" hint={`${plans.length} PLANS`}/>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {plans.slice(0, 4).map(p => (
          <div key={p.id}
            onClick={() => onOpen?.(p)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "6px 8px",
              borderRadius: 8, cursor: onOpen ? "pointer" : "default",
              transition: "background .15s",
            }}
            onMouseEnter={e => onOpen && (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: p.cover
                ? `url('${p.cover}') center/cover`
                : `linear-gradient(135deg, ${SUBSYSTEM_COLOR[p.sub]}, ${SUBSYSTEM_COLOR[p.sub]}88)`,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
                lineHeight: 1.25, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
              }}>{planTitle(p)}</div>
              <div className="eyebrow" style={{ marginTop: 2 }}>{p.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartsSnapshot() {
  const stats = [
    { label: "已下單", count: 3, tone: "high" },
    { label: "比較中", count: 4, tone: "mid" },
    { label: "詢價",   count: 5, tone: "muted" },
    { label: "贊助申請", count: 1, tone: "low" },
  ];
  return (
    <div className="tcard large" style={{ padding: "var(--card-pad)", minWidth: 0 }}>
      <SectionHead title="零件採購" hint="15 ITEMS"/>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "4px 0",
          }}>
            <span style={{ fontSize: 12.5, color: "var(--ink)" }}>{s.label}</span>
            <span style={{
              fontFamily: "var(--display-family)", fontSize: 18, fontWeight: 700,
              color: "var(--ink)", letterSpacing: "-0.015em",
            }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RacesSnapshot() {
  const items = [
    { label: "FSAE Taiwan 2026", date: "2026-08-15", priority: "HIGH" },
    { label: "JSAE Formula Japan",  date: "2026-09-04", priority: "HIGH" },
    { label: "FSAE Online 規則",    date: "全年",        priority: "HIGH" },
  ];
  return (
    <div className="tcard large" style={{ padding: "var(--card-pad)", minWidth: 0 }}>
      <SectionHead title="賽事行事曆" hint="UPCOMING"/>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", gap: 3,
            padding: "6px 0",
            borderBottom: i < items.length - 1 ? "0.5px solid var(--rule)" : "none",
          }}>
            <div style={{
              fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{it.label}</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--muted)", letterSpacing: "0.04em",
            }}>{it.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusCard({ task, onClick }) {
  if (!task) return null;
  return (
    <div onClick={onClick} className="tcard hoverable large" style={{
      background: "var(--accent)", color: "#fff",
      borderColor: "var(--accent)",
      padding: 28, cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>
          THIS WEEK · FOCUS
        </div>
        <span style={{
          display: "inline-flex", gap: 5, alignItems: "center",
          padding: "2px 9px", background: "#fff", color: "var(--accent)",
          borderRadius: 999, fontSize: 9, fontWeight: 700,
          fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
        }}>
          <SubsystemIcon kind={task.subsystem} size={11}/>
          {task.subsystem}
        </span>
      </div>
      <div style={{ marginTop: 22, fontSize: 19, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25 }}>
        {task.title}
      </div>
      <div style={{ marginTop: 16 }}>
        <DisplayNumber value={task.progress} unit="%" size={56} color="#fff"/>
      </div>
      <div style={{ marginTop: 10 }}>
        <ProgressBar value={task.progress} height={3} dark/>
      </div>
      <div style={{
        marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12,
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
        color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap",
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>負責 · {task.owner}</span>
        <span>W{task.start + 1}→W{task.start + task.span}</span>
      </div>
    </div>
  );
}

function RosterChip({ person }) {
  return (
    <div className="tcard hoverable" style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 12, flexShrink: 0,
      cursor: "pointer",
    }}>
      <Avatar name={person.name} size={28} dark/>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>{person.name}</div>
        <div className="eyebrow" style={{ marginTop: 1 }}>{person.position}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  WORKLOG — KPIs + Gantt + Bento
// ═══════════════════════════════════════════════════════════
function WorklogView({ tasks, openTask, newTask, onDelete }) {
  const active  = tasks.filter(t => t.state !== "done").length;
  const onTime  = tasks.filter(t => t.state !== "done" && t.progress >= 40).length;
  const overdue = tasks.filter(t => t.state !== "done" && t.progress < 40).length;
  const donePct = Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length);

  const [view, setView] = React.useState("gantt"); // gantt | bento
  const [filter, setFilter] = React.useState("all");

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.subsystem === filter);

  return (
    <div className="worklog-view" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* KPI strip — mobile: 2×2 grid via .kpi-strip */}
      <div className="kpi-strip" style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="ACTIVE"  value={active}  unit={`/ ${tasks.length}`}/>
        <KPI label="ON TIME" value={onTime}  unit={`/ ${active}`}/>
        <KPI label="OVERDUE" value={overdue}/>
        <KPI label="AVG"     value={donePct} unit="%"/>
      </div>

      {/* Mobile: unified single glass pill — [subsystems] | [view toggle] | [+] */}
      <div className="worklog-mobile-bar">
        {/* Subsystem icon buttons */}
        {[{ id: "all", ui: "filter" }, ...SUBSYSTEMS.map(s => ({ id: s, sub: s }))].map(s => {
          const active = filter === s.id;
          return (
            <button key={s.id} onClick={() => setFilter(s.id)} title={s.id === "all" ? "全部" : s.id}
              className={active ? "seg-btn--active" : ""}
              style={{ padding: "0 9px", height: 28, borderRadius: 999, border: 0, cursor: "pointer",
                background: active ? "#fff" : "transparent", flexShrink: 0,
                color: active ? "var(--ink)" : "var(--faint)",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                display: "inline-flex", alignItems: "center", transition: "all .15s",
              }}>
              {s.ui ? <UIIcon kind={s.ui} size={13}/> : <SubsystemIcon kind={s.sub} size={13} color={active ? "var(--ink)" : "var(--faint)"}/>}
            </button>
          );
        })}
        {/* Separator */}
        <div style={{ width: 1, alignSelf: "stretch", background: "rgba(120,120,128,0.35)", margin: "4px 3px", flexShrink: 0 }}/>
        {/* View toggle — single button, tap to cycle */}
        <button onClick={() => setView(v => v === "gantt" ? "bento" : "gantt")}
          title={view === "gantt" ? "切換 Bento" : "切換甘特"}
          className="seg-btn--active"
          style={{ padding: "0 9px", height: 28, borderRadius: 999, border: 0, cursor: "pointer",
            background: "#fff", flexShrink: 0, color: "var(--ink)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            display: "inline-flex", alignItems: "center", transition: "all .15s",
          }}>
          <UIIcon kind={view === "gantt" ? "calendar" : "target"} size={13}/>
        </button>
        {/* + button */}
        <button onClick={newTask} title="新增工作"
          style={{ padding: "0 10px", height: 28, borderRadius: 999, border: 0, cursor: "pointer",
            background: "transparent", color: "var(--ink)", flexShrink: 0,
            display: "inline-flex", alignItems: "center",
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {/* Desktop section head — hidden on mobile */}
      <SectionHead
        title={view === "gantt" ? "甘特圖 · Gantt" : "Bento Board"}
        hint={`${filtered.length} OF ${tasks.length} TASKS`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <SegmentedFilter className="subsystem-filter" value={filter} onChange={setFilter} options={[
              { id: "all",  label: "全部", uiIcon: "filter" },
              ...SUBSYSTEMS.map(s => ({ id: s, label: s, subIcon: s })),
            ]}/>
            <div style={{ width: 1, background: "var(--rule)" }}/>
            <SegmentedFilter className="gantt-view-toggle" value={view} onChange={setView} options={[
              { id: "gantt", label: "甘特", uiIcon: "calendar" },
              { id: "bento", label: "Bento", uiIcon: "target" },
            ]}/>
            <Button variant="primary" icon="plus" className="btn-new-task" onClick={newTask}>
              <span className="btn-label">新增工作</span>
            </Button>
          </div>
        }/>

      {view === "gantt" ? (
        <GanttChart tasks={filtered} onTaskClick={openTask} onDelete={onDelete}/>
      ) : (
        <BentoBoard tasks={filtered} onTaskClick={openTask}/>
      )}
    </div>
  );
}

function SegmentedFilter({ options, value, onChange, className }) {
  return (
    <div className={className || ""} style={{
      display: "inline-flex", alignItems: "center", gap: 2,
      padding: 2, background: "rgba(0,0,0,0.04)",
      borderRadius: 999, height: 28,
    }}>
      {options.map(o => (
        <button key={o.id} className={value === o.id ? "seg-btn--active" : ""} onClick={() => onChange(o.id)} style={{
          padding: "0 11px", height: 24, borderRadius: 999,
          background: value === o.id ? "#fff" : "transparent",
          border: 0, fontSize: 11.5, color: value === o.id ? "var(--ink)" : "var(--faint)",
          fontWeight: value === o.id ? 600 : 500, cursor: "pointer",
          boxShadow: value === o.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          transition: "all .15s", fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", gap: 4,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {o.uiIcon && <UIIcon kind={o.uiIcon} size={12} />}
          {o.subIcon && <SubsystemIcon kind={o.subIcon} size={12} />}
          {o.shortLabel
            ? <><span className="seg-label">{o.label}</span><span className="seg-short">{o.shortLabel}</span></>
            : <span className="seg-label">{o.label}</span>
          }
        </button>
      ))}
    </div>
  );
}

// ─── Gantt ─────────────────────────────────────────────────
function GanttChart({ tasks, onTaskClick, onDelete }) {
  const colW = 100 / TOTAL_WEEKS;
  return (
    <div className="tcard large gantt-chart" style={{ padding: "16px 0 18px", overflow: "hidden" }}>
      {/* scrollable inner — allows horizontal pan on mobile */}
      <div className="gantt-scroll" style={{
        overflowX: "auto", WebkitOverflowScrolling: "touch",
        padding: "0 14px",
      }}>
        {/* week ruler */}
        <div className="gantt-ruler" style={{ display: "flex", paddingLeft: 220, marginBottom: 8, minWidth: 560 }}>
          {WEEK_LABELS.map((w, i) => (
            <div key={w} style={{
              flex: 1, fontFamily: "var(--font-mono)", fontSize: 9,
              color: i === 4 ? "var(--accent)" : "var(--muted)",
              fontWeight: i === 4 ? 700 : 500,
              letterSpacing: "0.04em", textAlign: "left", paddingLeft: 4,
              borderLeft: "0.5px solid " + (i === 4 ? "var(--accent-mid)" : "rgba(0,0,0,0.05)"),
              position: "relative",
            }}>
              {w}
              {i === 4 && <div style={{
                position: "absolute", top: 14, left: 0, bottom: -8,
                width: 1, background: "var(--accent)", opacity: 0.5,
                pointerEvents: "none",
              }}/>}
            </div>
          ))}
        </div>

        {/* rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 560 }}>
          {tasks.map(t => (
            <GanttRow key={t.id} task={t} colW={colW}
              onClick={() => onTaskClick(t)} onDelete={() => onDelete(t)}/>
          ))}
          {tasks.length === 0 && (
            <div style={{
              padding: "30px 20px", textAlign: "center",
              color: "var(--muted)", fontSize: 12,
            }}>沒有符合的工作</div>
          )}
        </div>
      </div>
    </div>
  );
}

function GanttRow({ task, colW, onClick, onDelete }) {
  const color = SUBSYSTEM_COLOR[task.subsystem];
  const isDone = task.state === "done";
  const isFocus = task.state === "focus";
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center",
      borderRadius: 8, transition: "background .15s",
      cursor: "pointer", padding: "4px 6px",
    }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div className="gantt-label" style={{ width: 214, display: "flex", alignItems: "center", gap: 8, paddingRight: 10 }}>
        <SubsystemIcon kind={task.subsystem} size={13} color={color}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, color: "var(--ink)", fontWeight: isFocus ? 600 : 500,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            opacity: isDone ? 0.55 : 1,
          }}>{task.title}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>
            {task.owner || "—"}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", height: 24 }}>
        {/* grid */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
        }}>
          {WEEK_LABELS.map((_, i) => (
            <div key={i} style={{
              flex: 1, borderLeft: "0.5px solid " + (i === 4 ? "var(--accent-mid)" : "rgba(0,0,0,0.04)"),
            }}/>
          ))}
        </div>
        {/* bar */}
        <div style={{
          position: "absolute",
          left: `${task.start * colW}%`,
          width: `${task.span * colW}%`,
          top: 4, bottom: 4,
          background: isFocus ? "var(--accent)" : (isDone ? color + "44" : color + "22"),
          border: "0.5px solid " + (isFocus ? "var(--accent)" : color + "55"),
          borderRadius: 6,
          display: "flex", alignItems: "center",
          padding: "0 6px",
          overflow: "hidden",
        }}>
          {/* progress fill */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${task.progress}%`,
            background: isFocus ? "rgba(255,255,255,0.18)" : color + "55",
            transition: "width .8s var(--ease-out)",
          }}/>
          <span style={{
            position: "relative", fontFamily: "var(--font-mono)",
            fontSize: 9, fontWeight: 700,
            color: isFocus ? "#fff" : color, letterSpacing: "0.04em",
          }}>{task.progress}%</span>
        </div>
      </div>
      <div className="gantt-row-actions" style={{ width: 60, display: "flex", justifyContent: "flex-end", gap: 0 }}>
        <IconBtn icon="edit"  onClick={(e) => { e.stopPropagation(); onClick(); }} title="編輯" size={24}/>
        <IconBtn icon="trash" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="刪除" size={24} danger/>
      </div>
    </div>
  );
}

// ─── Bento Board ───────────────────────────────────────────
function BentoBoard({ tasks, onTaskClick }) {
  // 將卡片依照尺寸權重排序，讓大方塊 (3x2, 2x2, 2x1) 優先繪製，從而自動往左上角排列
  const sortedTasks = React.useMemo(() => {
    const getWeight = (size) => {
      if (size === "3x2") return 6;
      if (size === "2x2") return 4;
      if (size === "2x1") return 2;
      return 1; // 1x1
    };
    return [...tasks].sort((a, b) => getWeight(b.size || "1x1") - getWeight(a.size || "1x1"));
  }, [tasks]);

  return (
    <div className="bento-board" style={{
      display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
      gridAutoRows: "var(--bento-row-h)", gap: "var(--bento-gap, 10px)", gridAutoFlow: "dense",
    }}>
      {sortedTasks.map(t => <BentoCard key={t.id} task={t} onClick={() => onTaskClick(t)}/>)}
    </div>
  );
}

// ─── ActivityRing (供 BentoPreviewModal 使用) ───
function ActivityRing({ progress, size, strokeWidth, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        style={{ opacity: 0.1, color: color }}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s var(--ease-out)" }}
      />
    </svg>
  );
}

function BentoCard({ task, onClick }) {
  const { subsystem, title, progress, start, span, size = "1x1", state, owner } = task;
  const isFocus = state === "focus";
  const isDone  = state === "done";
  const isLarge = size === "2x2" || size === "3x2";
  const isSmall = size === "1x1";

  const sizeStyle = {
    "1x1": { gridColumn: "span 1", gridRow: "span 1" },
    "2x1": { gridColumn: "span 2", gridRow: "span 1" },
    "2x2": { gridColumn: "span 2", gridRow: "span 2" },
    "3x2": { gridColumn: "span 3", gridRow: "span 2" },
  }[size];

  const daysToEnd = start + span - 5;
  const daysLabel = daysToEnd === 0 ? "TODAY"
                  : daysToEnd < 0  ? `OVERDUE ${-daysToEnd}W` : `T-${daysToEnd}W`;

  const subColor   = window.SUBSYSTEM_COLOR?.[subsystem] || "var(--blue)";
  const textColor  = isFocus ? "#fff" : "var(--ink)";
  const mutedColor = isFocus ? "rgba(255,255,255,0.55)" : "var(--muted)";

  // 簡化：只用 2 種環色 — 完成=綠，其他=藍（focus 卡用半透明白）
  const ringColor = isFocus ? "rgba(255,255,255,0.85)"
                  : isDone  ? "var(--green)"
                  : "var(--blue)";

  return (
    <div onClick={onClick} className={`tcard tile hoverable bento-card-${size || "1x1"}`} style={{
      ...sizeStyle,
      /* 非大卡：左 padding 壓縮讓圈靠近邊界；大卡維持對稱 */
      padding: isLarge ? "14px 16px" : "10px 14px 10px 10px",
      cursor: "pointer", overflow: "hidden",
      display: "flex", flexDirection: "column",
      background: isFocus ? "var(--accent)" : "var(--card-fill)",
      borderColor: isFocus ? "var(--accent)" : undefined,
      opacity: isDone ? 0.7 : 1,
    }}>

      {isLarge ? (
        /* ══ LARGE (2x2 / 3x2)：大數字 + 名稱 + 條 + 時間 — 保持不變 ══ */
        <>
          <span style={{
            width: 6, height: 6, borderRadius: 99,
            background: isFocus ? "rgba(255,255,255,0.7)" : subColor,
            display: "inline-block",
          }}/>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 5, marginTop: 8 }}>
            <DisplayNumber value={progress} unit="%" size={44} color={textColor}/>
            <div style={{
              fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em",
              color: textColor, fontSize: 15,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{title}</div>
            <ProgressBar value={progress} height={2} dark={isFocus}/>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.04em", color: mutedColor, display: "flex", justifyContent: "space-between" }}>
              <span>{daysLabel}</span><span>{owner}</span>
            </div>
          </div>
        </>
      ) : (
        /* ══ SMALL / WIDE (1x1 / 2x1)：進度圈 + 名稱/時間
              Apple Control Center widget 排版:
              [ 圈 ]  名稱（粗體，2行）
                      T-xW（小字）
        ══ */
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%" }}>

          {/* ── 左：ActivityRing，數字在圈心（大字） ── */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <ActivityRing
              progress={progress}
              size={40}
              strokeWidth={3.5}
              color={ringColor}
            />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontWeight: 700,
                fontSize: 15, lineHeight: 1,
                color: textColor,
              }}>{progress}</span>
            </div>
          </div>

          {/* ── 右：名稱（主角）＋ 剩餘天數 ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, lineHeight: 1.28, letterSpacing: "-0.01em",
              color: textColor, fontSize: 13,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{title}</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              letterSpacing: "0.04em", color: mutedColor,
              marginTop: 4,
            }}>{daysLabel}</div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── BentoPreviewModal (簡覽) ───
const TASK_STATE_LABEL = { focus: "本週焦點", done: "已完成", active: "進行中" };

function BentoPreviewModal({ task, onClose, onEdit, onDelete }) {
  if (!task) return null;
  const color = window.SUBSYSTEM_COLOR?.[task.subsystem] || "var(--blue)";
  const stateLabel = TASK_STATE_LABEL[task.state] || "進行中";
  const daysToEnd = (task.start || 0) + (task.span || 0) - 5;
  const schedule = daysToEnd === 0 ? "本週到期"
    : daysToEnd < 0 ? `已逾期 ${-daysToEnd} 週` : `剩 ${daysToEnd} 週`;
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const ringSize = isMobile ? 88 : 140;
  const ringStroke = isMobile ? 10 : 16;
  const ringFont = isMobile ? 28 : 36;

  return (
    <CardPreview
      onClose={onClose}
      color={color}
      title={task.title}
      subsystem={task.subsystem}
      node={
        <div style={{ position: "relative", width: ringSize, height: ringSize }}>
          <ActivityRing progress={task.progress || 0} size={ringSize} strokeWidth={ringStroke} color={color} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: ringFont, letterSpacing: "-0.04em",
            color: "var(--ink)",
          }}>
            {task.progress || 0}%
          </div>
        </div>
      }
      badges={
        <span style={{
          fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: color,
        }}>
          {task.subsystem}
        </span>
      }
      meta={[
        { label: "負責人", value: task.owner || "—" },
        { label: "期程", value: `W${task.start} – W${(task.start || 0) + (task.span || 0)} · ${schedule}` },
        { label: "優先度", value: task.priority || "—" },
        { label: "狀態", value: stateLabel }
      ]}
      actions={<>
        {onDelete && <IconBtn danger icon="trash" style={{ marginRight: "auto" }} onClick={() => onDelete(task)} title="刪除" />}
        {onEdit && <IconBtn icon="edit" onClick={() => onEdit(task)} title="編輯" />}
      </>}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  PLANS — IG-style gallery + lightbox + detail popup + Kanban
// ═══════════════════════════════════════════════════════════
const PLAN_TAGS = ["討論中", "進行中", "已完成", "擱置"];
const PLAN_TAG_COLORS = {
  "討論中": "#0071e3",
  "進行中": "#b83025",
  "已完成": "#2a6b38",
  "擱置": "#86868b",
};

function PlansView({ plans, setPlans, openPlan, editPlan, newPlan, onDelete }) {
  const [view, setView] = React.useState("gallery"); // gallery | kanban
  const [drag, setDrag] = React.useState(null);
  const [over, setOver] = React.useState(null);
  const [kanbanDraggedId, setKanbanDraggedId] = React.useState(null);
  const [lightboxId, setLightboxId] = React.useState(null); // open lightbox for this plan

  // Blueprint sorting handlers
  const onDragStart = (id) => () => setDrag(id);
  const onDragOver  = (id) => (e) => { e.preventDefault(); setOver(id); };
  const onDragEnd   = () => { setDrag(null); setOver(null); };
  const onDrop      = (id) => (e) => {
    e.preventDefault();
    if (!drag || drag === id) return;
    setPlans(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(p => p.id === drag);
      const toIdx   = next.findIndex(p => p.id === id);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDrag(null); setOver(null);
  };

  const onScaleChange = (id, newScale) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, scale: newScale } : p));
  };

  // Kanban Column DnD
  const onKanbanDragStart = (id) => (e) => {
    setKanbanDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
  };
  
  const onKanbanDropColumn = (targetTag) => (e) => {
    e.preventDefault();
    if (!kanbanDraggedId) return;
    setPlans(prev => prev.map(p => p.id === kanbanDraggedId ? { ...p, tag: targetTag } : p));
    setKanbanDraggedId(null);
  };

  const onKanbanDragOver = (e) => {
    e.preventDefault();
  };

  // KPI Calculations
  const total = plans.length;
  const inProgress = plans.filter(p => p.tag === "進行中").length;
  const completed = plans.filter(p => p.tag === "已完成").length;
  const pending = plans.filter(p => !p.tag || ["討論中", "擱置"].includes(p.tag)).length;

  // Lightbox helpers
  const lbIdx  = plans.findIndex(p => p.id === lightboxId);
  const lbPlan = plans[lbIdx] || null;
  const lbPrev = () => setLightboxId(plans[(lbIdx - 1 + plans.length) % plans.length]?.id);
  const lbNext = () => setLightboxId(plans[(lbIdx + 1) % plans.length]?.id);
  const openLightbox = (id) => setLightboxId(id);
  const closeLightbox = () => setLightboxId(null);

  return (
    <>
    <div className="plans-view" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* KPI row — mobile: 一列壓縮 via .kpi-strip */}
      <div className="kpi-strip" style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="PROPOSALS" value={total} foot="提案總數" />
        <KPI label="IN PROGRESS" value={inProgress} foot="進行中" />
        <KPI label="COMPLETED" value={completed} foot="已完成" />
        <KPI label="PENDING" value={pending} foot="待討論" />
      </div>

      <SectionHead
        title="設計提案"
        hint={`${plans.length} PLANS`}
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ViewToggle value={view} onChange={setView} options={[
              {
                value: "gallery",
                title: "圖片牆",
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>,
              },
              {
                value: "kanban",
                title: "工作流看板",
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="18" rx="1"/>
                  <rect x="10" y="3" width="5" height="13" rx="1"/>
                  <rect x="17" y="3" width="5" height="9" rx="1"/>
                </svg>,
              },
            ]} />
            <div style={{ width: 0.5, height: 20, background: "var(--rule)" }} />
            <Button variant="primary" icon="plus" onClick={newPlan}>新增</Button>
          </div>
        }/>

      {view === "gallery" ? (
        /* IG-style photo grid — tight 3px gap, square thumbs */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 3,
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {plans.map(p => (
            <PlanThumb key={p.id} plan={p}
              dragging={drag === p.id}
              dragOver={over === p.id && drag !== p.id}
              draggable
              onDragStart={onDragStart(p.id)}
              onDragOver={onDragOver(p.id)}
              onDragEnd={onDragEnd}
              onDrop={onDrop(p.id)}
              onClick={() => openLightbox(p.id)}/>
          ))}
        </div>
      ) : (
        /* 工作流看板 */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          alignItems: "start",
          minHeight: 460,
        }}>
          {PLAN_TAGS.map(columnTag => {
            const columnPlans = plans.filter(p => {
              const currentTag = p.tag || "討論中";
              return currentTag === columnTag;
            });
            const tagColor = PLAN_TAG_COLORS[columnTag];
            return (
              <div
                key={columnTag}
                onDragOver={onKanbanDragOver}
                onDrop={onKanbanDropColumn(columnTag)}
                className="tcard"
                style={{
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minHeight: 400,
                  background: kanbanDraggedId ? "rgba(0, 0, 0, 0.015)" : "var(--card-fill)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 8,
                  borderBottom: `2.5px solid ${tagColor}40`,
                  marginBottom: 4,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: tagColor }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{columnTag}</span>
                  </div>
                  <span className="eyebrow" style={{ color: tagColor, fontSize: 10 }}>{columnPlans.length}</span>
                </div>
                
                {columnPlans.map(p => (
                  <KanbanPlanCard
                    key={p.id}
                    plan={p}
                    onDragStart={onKanbanDragStart(p.id)}
                    onClick={() => openPlan(p)}
                  />
                ))}
                
                {columnPlans.length === 0 && (
                  <div style={{
                    padding: "36px 12px",
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    border: "1px dashed var(--rule)",
                    borderRadius: 8,
                  }}>
                    EMPTY
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* 放大預覽 — 統一 DetailPreview，畫廊含上下張切換 */}
    {lightboxId && lbPlan && (
      <PlanPreview
        plan={lbPlan} plans={plans}
        onClose={closeLightbox}
        onPrev={lbPrev} onNext={lbNext}
        onEdit={() => { closeLightbox(); editPlan(lbPlan); }}
        onDelete={() => { closeLightbox(); onDelete(lbPlan); }}
        onTagChange={(id, tag) => setPlans(prev => prev.map(p => p.id === id ? { ...p, tag } : p))}
      />
    )}
    </>
  );
}

// ─── PlanThumb — compact IG-style square card ───
function PlanThumb({ plan, draggable, dragging, dragOver, onDragStart, onDragOver, onDragEnd, onDrop, onClick }) {
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--accent)";
  const tagColor = PLAN_TAG_COLORS[plan.tag] || null;
  const [hov, setHov] = React.useState(false);
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        outline: dragOver ? "3px solid var(--accent)" : "none",
        outlineOffset: -3,
        background: plan.cover
          ? `url('${plan.cover}') center/cover`
          : `linear-gradient(135deg, ${color}cc, ${color}55)`,
      }}
    >
      {/* Subsystem color bar at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: color, zIndex: 2,
      }}/>

      {/* Hover overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: hov ? "rgba(0,0,0,0.52)" : "rgba(0,0,0,0)",
        transition: "background 0.22s ease",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: 14, gap: 4,
      }}>
        {hov && <>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "2px 7px", borderRadius: 6,
            background: color + "cc", color: "#fff",
            fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em", width: "fit-content",
          }}>
            <SubsystemIcon kind={plan.sub} size={9} color="#fff"/>{plan.sub}
          </div>
          <div style={{
            color: "#fff", fontSize: 13.5, fontWeight: 700,
            lineHeight: 1.25, letterSpacing: "-0.01em",
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>{planTitle(plan)}</div>
        </>}
      </div>

      {/* Status dot (always visible, top-right) */}
      {plan.tag && tagColor && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 4,
          width: 8, height: 8, borderRadius: "50%",
          background: tagColor,
          boxShadow: `0 0 0 2px rgba(255,255,255,0.8)`,
        }}/>
      )}

      {/* Drag ghost (only on hover) */}
      {hov && (
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 4,
          width: 22, height: 22, borderRadius: 6,
          background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        }}>
          <UIIcon kind="grip" size={11}/>
        </div>
      )}
    </div>
  );
}

// ─── PlanPreview — 統一計畫預覽（建於共用 DetailPreview）───
function PlanPreview({ plan, plans, onClose, onPrev, onNext, onEdit, onDelete, onTagChange }) {
  if (!plan) return null;
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--blue)";
  const tagColor = PLAN_TAG_COLORS[plan.tag] || null;
  const idx = plans ? plans.findIndex(p => p.id === plan.id) : -1;

  const tagBadge = plan.tag && tagColor ? (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      padding: "3px 10px", borderRadius: "var(--radius-full)",
      background: plan.cover ? "rgba(0,0,0,0.45)" : tagColor + "1f",
      color: plan.cover ? "#fff" : tagColor,
      backdropFilter: plan.cover ? "blur(8px)" : undefined,
    }}>{plan.tag}</span>
  ) : null;

  return (
    <DetailPreview
      onClose={onClose}
      onPrev={onPrev} onNext={onNext}
      counter={idx >= 0 && plans.length > 1 ? `${idx + 1} / ${plans.length}` : undefined}
      width={560}
      hero={{
        cover: plan.cover,
        color: `color-mix(in srgb, ${color} 16%, var(--bg-secondary))`,
        icon: <SubsystemIcon kind={plan.sub} size={30} color={color}/>,
        height: 220,
      }}
      badges={<><SubsystemTag kind={plan.sub} size="sm"/>{tagBadge}</>}
      title={planTitle(plan)}
      body={planBody(plan)}
      footer={<>
        {onDelete && <Button variant="danger" icon="trash" onClick={() => onDelete(plan)}>刪除</Button>}
        {onEdit && <Button variant="primary" icon="edit" onClick={() => onEdit(plan)}>編輯計畫</Button>}
      </>}
    >
      {onTagChange && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
            textTransform: "uppercase", color: "var(--label-tertiary)", marginBottom: 8 }}>狀態</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PLAN_TAGS.map(tag => {
              const tc = PLAN_TAG_COLORS[tag];
              const active = plan.tag === tag;
              return (
                <button key={tag} onClick={() => onTagChange(plan.id, tag)}
                  style={{
                    padding: "5px 12px", borderRadius: "var(--radius-full)", cursor: "pointer",
                    border: active ? "none" : "0.5px solid var(--separator)",
                    background: active ? tc : "transparent",
                    color: active ? "#fff" : "var(--label-secondary)",
                    fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
                    transition: "all .15s",
                  }}>{tag}</button>
              );
            })}
          </div>
        </div>
      )}
    </DetailPreview>
  );
}

function PlanCard({ plan, draggable, dragging, dragOver, onDragStart, onDragOver, onDragEnd, onDrop, onClick, onDelete, onScaleChange }) {
  const layout = plan.layout === "portrait" || plan.layout === "a4" ? "portrait" : "landscape";
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--accent)";
  const maxScale = layout === "portrait" ? 2 : 3;
  const minScale = layout === "portrait" ? 1 : 2;
  const scale = plan.scale || minScale;
  
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onClick={onClick}
      className={`tcard hoverable large ${dragging ? "dragging" : ""} ${dragOver ? "drag-over" : ""}`}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        outline: dragOver ? "2px solid var(--accent)" : "none",
        outlineOffset: -2,
        gridColumn: `span ${scale}`,
        aspectRatio: layout === "portrait" ? "1 / 1.414" : "1.414 / 1",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector(".plan-cover-img");
        if (img) img.style.transform = "scale(1.05)";
        const handle = e.currentTarget.querySelector(".resize-handle");
        if (handle) {
          handle.style.opacity = "1";
          handle.style.transform = "none";
        }
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector(".plan-cover-img");
        if (img) img.style.transform = "none";
        const handle = e.currentTarget.querySelector(".resize-handle");
        if (handle) {
          handle.style.opacity = "0";
          handle.style.transform = "translateY(4px)";
        }
      }}
    >
      {/* 1. Background image or blueprint */}
      {plan.cover ? (
        <>
          <div
            className="plan-cover-img"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${plan.cover}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 1,
            }}
          />
          {/* Deep gradient protection for text readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.88) 100%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 100% 100%, ${color}1e 0%, transparent 60%),
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px),
              linear-gradient(135deg, #0b1a30, #040a14)
            `,
            backgroundSize: "100% 100%, 40px 40px, 40px 40px, 10px 10px, 10px 10px, 100% 100%",
            zIndex: 1,
          }}
        >
          {/* Technical drafting grid borders */}
          <div style={{
            position: "absolute",
            border: "1px dashed rgba(255,255,255,0.06)",
            inset: 12,
            borderRadius: 8,
            pointerEvents: "none",
          }} />
          
          {/* Technical labels in the background */}
          <div style={{
            position: "absolute",
            top: 50,
            left: 18,
            fontFamily: "var(--font-mono)",
            fontSize: layout === "portrait" ? 36 : 48,
            fontWeight: 900,
            color: "rgba(255, 255, 255, 0.015)",
            letterSpacing: "0.1em",
            transform: "rotate(-8deg)",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
            {plan.sub} SECTION
          </div>

          <div style={{
            position: "absolute",
            top: 18,
            right: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            color: "rgba(255, 255, 255, 0.25)",
            letterSpacing: "0.08em",
            pointerEvents: "none",
          }}>
            A4_SPEC_SYS_{plan.sub.toUpperCase()}
          </div>
        </div>
      )}

      {/* 2. Top-left drag handle and Subsystem Tag */}
      <div style={{
        position: "absolute",
        top: 12,
        left: 12,
        display: "flex",
        gap: 6,
        alignItems: "center",
        zIndex: 3,
      }}>
        <span className="drag-handle" style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          cursor: "grab",
        }}>
          <UIIcon kind="grip" size={12}/>
        </span>
        <SubsystemTag kind={plan.sub}/>
        {plan.tag && (
          <span style={{
            display: "inline-flex",
            padding: "2px 7px",
            borderRadius: 6,
            background: PLAN_TAG_COLORS[plan.tag] + "cc",
            color: "#ffffff",
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            {plan.tag}
          </span>
        )}
      </div>

      {/* 3. Top-right actions */}
      <div style={{
        position: "absolute",
        top: 12,
        right: 12,
        display: "flex",
        gap: 6,
        zIndex: 3,
      }}>
        <IconBtn icon="edit" size={26} onClick={(e) => { e.stopPropagation(); onClick(); }}/>
        <IconBtn icon="trash" size={26} danger onClick={(e) => { e.stopPropagation(); onDelete(); }}/>
      </div>

      {/* 4. Bottom Glassmorphism Title Panel */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 18px",
        zIndex: 3,
        background: "linear-gradient(180deg, rgba(10,15,30,0) 0%, rgba(10,15,30,0.65) 30%, rgba(10,15,30,0.92) 100%)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        <div style={{
          fontFamily: "var(--display-family)",
          fontSize: layout === "portrait" ? 17 : 19,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          lineHeight: 1.25,
          color: "#ffffff",
        }}>
          {planTitle(plan)}
        </div>
        <div style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.65)",
          marginTop: 4,
          lineHeight: 1.45,
          textWrap: "pretty", WebkitTextWrap: "pretty",
          display: "-webkit-box",
          WebkitLineClamp: layout === "portrait" ? 3 : 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {planBodyLines(plan, layout === "portrait" ? 3 : 2)}
        </div>
      </div>

      {/* 5. Bottom-Right Dynamic Scale Controller (Revealed on hover) */}
      <div 
        className="resize-handle"
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          zIndex: 4,
          opacity: 0,
          transform: "translateY(4px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <span 
          onClick={(e) => {
            e.stopPropagation();
            const nextScale = layout === "portrait" 
              ? (scale === 1 ? 2 : 1) 
              : (scale === 2 ? 3 : (scale === 3 ? 1 : 2));
            onScaleChange(plan.id, nextScale);
          }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.22)";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.transform = "none";
          }}
          title={`點擊切換 A4 比例卡片尺寸等級 (目前寬度 span: ${scale})`}
        >
          <UIIcon kind="resize" size={12}/>
        </span>
      </div>
    </div>
  );
}

// ─── KanbanPlanCard ───
function KanbanPlanCard({ plan, onDragStart, onClick }) {
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--accent)";
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="tcard tile hoverable"
      style={{
        padding: 12,
        cursor: "pointer",
        background: "var(--bg-secondary)",
        border: "0.5px solid var(--separator)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SubsystemTag kind={plan.sub} size="sm" withIcon={true} />
        <span className="drag-handle" style={{ opacity: 0.5 }}>
          <UIIcon kind="grip" size={11} />
        </span>
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: "var(--label-primary)",
        lineHeight: 1.3,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {planTitle(plan)}
      </div>
      <div style={{
        fontSize: 11,
        color: "var(--faint)",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        lineHeight: 1.3,
      }}>
        {planBodyLines(plan, 2)}
      </div>
    </div>
  );
}

Object.assign(window, { PlansView, PlanCard, KanbanPlanCard });

// ═══════════════════════════════════════════════════════════
//  PEOPLE
// ═══════════════════════════════════════════════════════════
// ─── Person Profile Popup (名片) ───────────────────────────────
function PersonProfilePopup({ person, onClose, onEdit, onDelete }) {
  if (!person) return null;
  const posColor = SUBSYSTEM_COLOR[person.workTypes?.[0]] || "var(--blue)";
  const hasTags = person.workTypes?.length > 0;

  return (
    <CardPreview
      onClose={onClose}
      color={posColor}
      node={<Avatar name={person.name} size={120}/>}
      badges={
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
          color: posColor,
        }}>{person.position}</span>
      }
      title={person.name}
      subtitle={
        <>
          {person.phone && <div>{person.phone}</div>}
          {person.email && <div>{person.email}</div>}
        </>
      }
      tags={hasTags
        ? person.workTypes.map(w => <SubsystemTag key={w} kind={w} size="sm"/>)
        : [<span key="none" className="pill muted">無指派子系統</span>]}
      meta={[
        { label: "系所", value: person.department || "—" },
        { label: "年級", value: person.grade || "—" },
      ]}
      actions={<>
        <IconBtn danger icon="trash" style={{ marginRight: "auto" }} onClick={() => { onDelete(person); onClose(); }} title="刪除" />
        <IconBtn icon="edit" onClick={() => onEdit(person)} title="編輯" />
      </>}
    />
  );
}

function PeopleView({ people, editPerson, newPerson, onDelete }) {
  const [filter, setFilter] = React.useState("all");
  const [profileId, setProfileId] = React.useState(null);

  const totalPeople = people.length;
  const professorCount = people.filter(p => p.position === "教授").length;
  const advisorCount = people.filter(p => p.position === "顧問").length;
  const studentCount = people.filter(p => !["教授", "顧問"].includes(p.position)).length;

  const filtered = filter === "all" ? people : people.filter(p => p.position === filter);
  const profilePerson = people.find(p => p.id === profileId) || null;

  return (
    <div className="people-view" style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      <div className="kpi-strip" style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="STUDENTS" value={studentCount} foot="學生隊員"/>
        <KPI label="ADVISORS" value={advisorCount} foot="專業顧問"/>
        <KPI label="FACULTY"  value={professorCount} foot="指導教授"/>
        <KPI label="TOTAL"    value={totalPeople} foot="團隊總人數" accent/>
      </div>
      <SectionHead title="團隊成員" hint={`${filtered.length} OF ${people.length} 人`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <SegmentedFilter className="role-filter" value={filter} onChange={setFilter} options={[
              { id: "all",   label: "全部", shortLabel: "全" },
              { id: "隊長",  label: "隊長", shortLabel: "長" },
              { id: "副隊長", label: "副隊長", shortLabel: "副" },
              { id: "組長",  label: "組長", shortLabel: "組" },
              { id: "成員",  label: "成員", shortLabel: "員" },
              { id: "教授",  label: "教授", shortLabel: "授" },
            ]}/>
            <Button variant="primary" icon="plus" className="btn-new-task" onClick={newPerson}>
              <span className="btn-label">新增成員</span>
            </Button>
          </div>
        }/>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--gap-card)",
      }}>
        {filtered.map(p => (
          <PersonCard key={p.id} person={p}
            onClick={() => setProfileId(p.id)}/>
        ))}
      </div>

      {profilePerson && (
        <PersonProfilePopup
          person={profilePerson}
          onClose={() => setProfileId(null)}
          onEdit={(p) => { setProfileId(null); editPerson(p); }}
          onDelete={(p) => { setProfileId(null); onDelete(p); }}/>
      )}
    </div>
  );
}

function PersonCard({ person, onClick }) {
  return (
    <div onClick={onClick} className="tcard hoverable large" style={{
      padding: "var(--card-pad)", cursor: "pointer",
      position: "relative",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Avatar name={person.name} size={52} dark/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--display-family)",
            fontSize: 18, fontWeight: 700, color: "var(--ink)",
            letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>{person.name}</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--faint)", marginTop: 4,
          }}>{person.email}</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: "var(--muted)", letterSpacing: "0.06em",
            textTransform: "uppercase", marginTop: 8, paddingTop: 8,
            borderTop: "0.5px solid var(--rule)",
          }}>
            {person.position} · {person.department} · {person.grade}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
            {person.workTypes?.map(w => <SubsystemTag key={w} kind={w}/>)}
            {(!person.workTypes || person.workTypes.length === 0) && (
              <span className="pill muted">無指派</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, BentoCard, PersonCard });
