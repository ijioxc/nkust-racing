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
          openTask={(t) => setTaskModal({ open: true, initial: t })}
          openPlan={(p) => setPlanDetail({ open: true, target: p })}/>
      )}
      {tab === "worklog" && (
        <WorklogView tasks={tasks}
          openTask={(t) => setTaskModal({ open: true, initial: t })}
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

      <PlanDetailPanel open={planDetail.open} plan={planDetail.target}
        onClose={() => setPlanDetail({ open: false, target: null })}
        onEdit={(p) => { setPlanDetail({ open: false, target: null }); setPlanModal({ open: true, initial: p }); }}
        onDelete={(p) => { setPlanDetail({ open: false, target: null }); setConfirm({ kind: "plan", target: p }); }}/>

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
      <div style={{
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
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 0",
            borderBottom: i < items.length - 1 ? "0.5px solid var(--rule)" : "none",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: "var(--muted)", width: 28,
              letterSpacing: "0.04em", flexShrink: 0,
            }}>{it.date}</span>
            <span style={{
              flex: 1, fontSize: 12.5, color: "var(--ink)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{it.label}</span>
            <PriorityPill priority={it.priority}/>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* KPI strip */}
      <div style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="ACTIVE"  value={active}  unit={`/ ${tasks.length}`} foot="IN PROGRESS"/>
        <KPI label="ON TIME" value={onTime}  unit={`/ ${active}`}  foot="OF ACTIVE" accent/>
        <KPI label="OVERDUE" value={overdue} foot="ACT BY EOW"/>
        <KPI label="AVG"     value={donePct} unit="%" foot="ALL TASKS"/>
      </div>

      {/* Filter + view toggle */}
      <SectionHead
        title={view === "gantt" ? "甘特圖 · Gantt" : "Bento Board"}
        hint={`${filtered.length} OF ${tasks.length} TASKS`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <SegmentedFilter value={filter} onChange={setFilter} options={[
              { id: "all", label: "全部" },
              ...SUBSYSTEMS.map(s => ({ id: s, label: s })),
            ]}/>
            <div style={{ width: 1, background: "var(--rule)" }}/>
            <SegmentedFilter value={view} onChange={setView} options={[
              { id: "gantt", label: "甘特" },
              { id: "bento", label: "Bento" },
            ]}/>
            <Button variant="primary" icon="plus" onClick={newTask}>新增工作</Button>
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

function SegmentedFilter({ options, value, onChange }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 2,
      padding: 2, background: "rgba(0,0,0,0.04)",
      borderRadius: 999, height: 28,
    }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: "0 11px", height: 24, borderRadius: 999,
          background: value === o.id ? "#fff" : "transparent",
          border: 0, fontSize: 11.5, color: value === o.id ? "var(--ink)" : "var(--faint)",
          fontWeight: value === o.id ? 600 : 500, cursor: "pointer",
          boxShadow: value === o.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          transition: "all .15s", fontFamily: "inherit",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ─── Gantt ─────────────────────────────────────────────────
function GanttChart({ tasks, onTaskClick, onDelete }) {
  const colW = 100 / TOTAL_WEEKS;
  return (
    <div className="tcard large" style={{ padding: "16px 14px 18px" }}>
      {/* week ruler */}
      <div style={{ display: "flex", paddingLeft: 220, marginBottom: 8 }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
      <div style={{ width: 214, display: "flex", alignItems: "center", gap: 8, paddingRight: 10 }}>
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
      <div style={{ width: 60, display: "flex", justifyContent: "flex-end", gap: 0 }}>
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
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
      gridAutoRows: "var(--bento-row-h)", gap: 10, gridAutoFlow: "dense",
    }}>
      {sortedTasks.map(t => <BentoCard key={t.id} task={t} onClick={() => onTaskClick(t)}/>)}
    </div>
  );
}

function BentoCard({ task, onClick }) {
  const { subsystem, title, progress, start, span, size = "1x1", state, owner } = task;
  const isFocus = state === "focus";
  const isDone = state === "done";
  const isLarge = size === "2x2" || size === "3x2";
  const isWide = size === "2x1";

  const sizeStyle = {
    "1x1": { gridColumn: "span 1", gridRow: "span 1" },
    "2x1": { gridColumn: "span 2", gridRow: "span 1" },
    "2x2": { gridColumn: "span 2", gridRow: "span 2" },
    "3x2": { gridColumn: "span 3", gridRow: "span 2" },
  }[size];

  const daysToEnd = start + span - 5;
  const daysLabel = daysToEnd === 0 ? "TODAY"
                  : daysToEnd < 0 ? `OVERDUE ${-daysToEnd}W` : `T-${daysToEnd}W`;

  return (
    <div onClick={onClick} className="tcard tile hoverable" style={{
      ...sizeStyle,
      padding: "12px 14px", cursor: "pointer", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: isFocus ? "var(--accent)" : "var(--card-fill)",
      borderColor: isFocus ? "var(--accent)" : undefined,
      opacity: isDone ? 0.66 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span className="eyebrow" style={{
          color: isFocus ? "rgba(255,255,255,0.78)" : "var(--muted)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <SubsystemIcon kind={subsystem} size={11}/>
          {subsystem}
        </span>
        {!isLarge && (
          <span style={{
            fontFamily: "var(--display-family)",
            fontWeight: 700, lineHeight: 1,
            color: isFocus ? "#fff" : isDone ? "var(--muted)" : "var(--ink)",
            fontSize: isWide ? 22 : 15,
            fontFeatureSettings: "'tnum'",
          }}>{progress}%</span>
        )}
      </div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {isLarge && (
          <DisplayNumber value={progress} unit="%" size={48} color={isFocus ? "#fff" : "var(--ink)"}/>
        )}
        <div style={{
          fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em",
          color: isFocus ? "#fff" : "var(--ink)",
          fontSize: isLarge ? 16 : isWide ? 14 : 13,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{title}</div>
        <ProgressBar value={progress} height={2} dark={isFocus}/>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.04em",
          color: isFocus ? "rgba(255,255,255,0.78)" : "var(--muted)",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>{daysLabel}</span>
          <span>{owner}</span>
        </div>
      </div>
    </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: "var(--gap-card)" }}>
        <KPI label="TOTAL PROPOSALS" value={total} foot="計畫提案總數" />
        <KPI label="IN PROGRESS" value={inProgress} foot="進行中優化案" accent />
        <KPI label="COMPLETED" value={completed} foot="已完成評審驗證" />
        <KPI label="PENDING / BLOCKED" value={pending} foot="待討論或擱置項目" />
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

    {/* Lightbox — renders outside main div so it can be fixed-positioned */}
    {lightboxId && lbPlan && (
      <PlanLightbox
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

// ─── PlanLightbox — full-screen viewer with inline body + ⋯ action bubble ───
function PlanLightbox({ plan, plans, onClose, onPrev, onNext, onEdit, onDelete, onTagChange }) {
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--accent)";
  const tagColor = PLAN_TAG_COLORS[plan.tag] || null;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const body = planBody(plan);

  // Keyboard nav
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { if (menuOpen) setMenuOpen(false); else onClose(); }
      if (e.key === "ArrowLeft")  { setMenuOpen(false); onPrev(); }
      if (e.key === "ArrowRight") { setMenuOpen(false); onNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, menuOpen]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }} onClick={() => menuOpen ? setMenuOpen(false) : onClose()}>

      {/* Close */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <IconBtn icon="x" onClick={onClose} title="關閉 (Esc)"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}/>
      </div>

      {/* Prev / Next arrows */}
      {plans.length > 1 && <>
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onPrev(); }} style={{
          position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
          width: 44, height: 44, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", zIndex: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onNext(); }} style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          width: 44, height: 44, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", zIndex: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </>}

      {/* Main card */}
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: "min(780px, 90vw)", width: "100%",
        display: "flex", flexDirection: "column",
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Cover image */}
        <div style={{
          width: "100%", aspectRatio: "16 / 9",
          background: plan.cover
            ? `url('${plan.cover}') center/cover`
            : `linear-gradient(135deg, ${color}cc, ${color}44)`,
          position: "relative",
        }}>
          {!plan.cover && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.14)", fontFamily: "var(--font-mono)",
              fontSize: 13, fontWeight: 800, letterSpacing: "0.15em",
            }}>{plan.sub.toUpperCase()} SPECIFICATION</div>
          )}
        </div>

        {/* Info strip */}
        <div style={{ padding: "18px 20px 22px", background: "rgba(18,18,20,0.97)" }}>

          {/* Top row: tags + nav hint + ⋯ button */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <SubsystemTag kind={plan.sub} size="sm"/>
            {plan.tag && tagColor && (
              <span style={{
                padding: "3px 9px", borderRadius: 20,
                background: tagColor + "28", color: tagColor,
                fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                border: `0.5px solid ${tagColor}55`,
              }}>{plan.tag}</span>
            )}
            <span style={{
              color: "rgba(255,255,255,0.22)", fontSize: 10,
              fontFamily: "var(--font-mono)", letterSpacing: "0.06em", marginLeft: "auto",
            }}>← → 切換</span>

            {/* ⋯ Action bubble trigger */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                title="更多操作"
                style={{
                  width: 32, height: 32, borderRadius: 10, border: "none",
                  background: menuOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.10)",
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => !menuOpen && (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
                onMouseLeave={e => !menuOpen && (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>
                </svg>
              </button>

              {/* ─── Bubble Menu ─── */}
              {menuOpen && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: "absolute", bottom: "calc(100% + 10px)", right: 0,
                    background: "rgba(22,22,26,0.97)",
                    backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                    border: "0.5px solid rgba(255,255,255,0.11)",
                    borderRadius: 18, padding: "14px 12px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
                    minWidth: 210, display: "flex", flexDirection: "column", gap: 4, zIndex: 20,
                  }}
                >
                  {/* Status section */}
                  <div style={{
                    fontSize: 8.5, color: "rgba(255,255,255,0.28)",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                    textTransform: "uppercase", marginBottom: 6, paddingLeft: 4,
                  }}>狀態</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                    {PLAN_TAGS.map(tag => {
                      const tc = PLAN_TAG_COLORS[tag];
                      const active = plan.tag === tag;
                      return (
                        <button key={tag}
                          onClick={() => { onTagChange(plan.id, tag); setMenuOpen(false); }}
                          style={{
                            padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                            border: active ? "none" : "0.5px solid rgba(255,255,255,0.14)",
                            background: active ? tc : "rgba(255,255,255,0.06)",
                            color: active ? "#fff" : "rgba(255,255,255,0.6)",
                            fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sans)",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                          onMouseLeave={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        >{tag}</button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)", margin: "2px 0 6px" }}/>

                  {/* Actions */}
                  {[
                    { label: "編輯計畫", color: "#fff", hoverBg: "rgba(255,255,255,0.07)",
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
                      onClick: () => { onEdit(); setMenuOpen(false); },
                    },
                    { label: "刪除計畫", color: "rgb(255,90,90)", hoverBg: "rgba(255,80,80,0.12)",
                      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
                      onClick: () => { onDelete(); setMenuOpen(false); },
                    },
                  ].map(action => (
                    <button key={action.label}
                      onClick={action.onClick}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 10px", borderRadius: 10, border: "none",
                        background: "transparent", color: action.color,
                        fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                        textAlign: "left", width: "100%", fontFamily: "inherit",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = action.hoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div style={{
            color: "#fff", fontSize: 18, fontWeight: 700,
            letterSpacing: "-0.018em", lineHeight: 1.3,
            marginBottom: body ? 10 : 0,
          }}>{planTitle(plan)}</div>

          {/* Full body text */}
          {body && (
            <div style={{
              color: "rgba(255,255,255,0.58)", fontSize: 13, lineHeight: 1.65,
              whiteSpace: "pre-wrap", textWrap: "pretty", WebkitTextWrap: "pretty",
            }}>{body}</div>
          )}
        </div>
      </div>

      {/* Page counter */}
      <div style={{
        position: "absolute", bottom: 22,
        color: "rgba(255,255,255,0.3)", fontSize: 10,
        fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
      }}>
        {plans.findIndex(p => p.id === plan.id) + 1} / {plans.length}
      </div>
    </div>
  );
}

// ─── PlanDetailPopup — compact centered dialog (replaces slide-over) ───
function PlanDetailPopup({ plan, onClose, onEdit, onDelete }) {
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--accent)";
  const tagColor = PLAN_TAG_COLORS[plan.tag] || null;

  React.useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480,
        background: "rgba(255,255,255,0.94)",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        animation: "modal-pop .45s var(--ease-out)",
      }}>
        {/* Cover */}
        {plan.cover ? (
          <div style={{
            height: 200,
            background: `url('${plan.cover}') center/cover`,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)",
            }}/>
            <div style={{
              position: "absolute", bottom: 14, left: 18,
              display: "flex", gap: 6, alignItems: "center",
            }}>
              <SubsystemTag kind={plan.sub} size="sm"/>
              {plan.tag && tagColor && (
                <span style={{
                  padding: "2px 8px", borderRadius: 6,
                  background: tagColor + "cc", color: "#fff",
                  fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
                }}>{plan.tag}</span>
              )}
            </div>
            <button onClick={onClose} style={{
              position: "absolute", top: 12, right: 12,
              width: 30, height: 30, borderRadius: "50%", border: "none",
              background: "rgba(0,0,0,0.35)", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <div className="blueprint-draft-grid" style={{ height: 140, borderRadius: 0, position: "relative" }}>
            <div style={{ color: "rgba(255,255,255,0.12)", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "0.15em" }}>
              {plan.sub.toUpperCase()} SPECIFICATION
            </div>
            <button onClick={onClose} style={{
              position: "absolute", top: 12, right: 12,
              width: 28, height: 28, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style={{ position: "absolute", bottom: 10, left: 14, display: "flex", gap: 6 }}>
              <SubsystemTag kind={plan.sub} size="sm"/>
              {plan.tag && tagColor && (
                <span style={{
                  padding: "2px 8px", borderRadius: 6,
                  background: tagColor + "cc", color: "#fff",
                  fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
                }}>{plan.tag}</span>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "18px 22px 8px" }}>
          <h2 style={{
            fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em",
            color: "var(--ink)", margin: 0, lineHeight: 1.25,
          }}>{planTitle(plan)}</h2>
          {planBody(plan) && (
            <p style={{
              fontSize: 13.5, color: "var(--faint)", lineHeight: 1.65,
              marginTop: 10, marginBottom: 0,
              whiteSpace: "pre-wrap", textWrap: "pretty", WebkitTextWrap: "pretty",
            }}>{planBody(plan)}</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 22px 18px", borderTop: "0.5px solid var(--rule)", marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Button variant="danger" icon="trash" onClick={onDelete}>刪除</Button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>關閉</Button>
            <Button variant="primary" icon="edit" onClick={onEdit}>編輯計畫</Button>
          </div>
        </div>
      </div>
    </div>
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
        padding: 10,
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.85)",
        border: "0.5px solid rgba(0,0,0,0.06)",
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
        fontSize: 12.5,
        fontWeight: 700,
        color: "var(--ink)",
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

// ─── PlanDetailPanel (Slide-over) ───
function PlanDetailPanel({ open, plan, onClose, onEdit, onDelete }) {
  if (!plan) return null;
  const color = SUBSYSTEM_COLOR[plan.sub] || "var(--accent)";
  return (
    <>
      <div className={`slide-over-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`slide-over-panel ${open ? "open" : ""}`}>
        <div className="slide-over-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SubsystemIcon kind={plan.sub} size={14} color={color}/>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: color }}>{plan.sub.toUpperCase()}</span>
          </div>
          <IconBtn icon="x" onClick={onClose} title="關閉" />
        </div>
        
        <div className="slide-over-content">
          {plan.cover ? (
            <div style={{
              width: "100%", height: 180, borderRadius: 12,
              backgroundImage: `url('${plan.cover}')`,
              backgroundSize: "cover", backgroundPosition: "center",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)"
            }}/>
          ) : (
            <div className="blueprint-draft-grid" style={{ height: 180 }}>
              <div style={{ color: "rgba(255, 255, 255, 0.12)", fontSize: 20, fontWeight: 900, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                {plan.sub.toUpperCase()} SPECIFICATION
              </div>
            </div>
          )}
          
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)", marginTop: 0, lineHeight: 1.25 }}>
              {planTitle(plan)}
            </h2>
          </div>

          <div style={{ borderTop: "0.5px solid var(--rule)", paddingTop: 16 }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)",
              lineHeight: 1.6, whiteSpace: "pre-wrap", textWrap: "pretty", WebkitTextWrap: "pretty"
            }}>
              {planBody(plan) || "無詳細內容描述。"}
            </div>
          </div>
        </div>
        
        <div className="slide-over-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Button variant="danger" icon="trash" onClick={() => onDelete(plan)}>刪除</Button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>關閉</Button>
            <Button variant="primary" icon="edit" onClick={() => onEdit(plan)}>編輯計畫</Button>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { PlansView, PlanCard, KanbanPlanCard, PlanDetailPanel });

// ═══════════════════════════════════════════════════════════
//  PEOPLE
// ═══════════════════════════════════════════════════════════
// ─── Person Profile Popup (名片) ───────────────────────────────
function PersonProfilePopup({ person, onClose, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // ESC to close
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (menuOpen) setMenuOpen(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen, onClose]);

  if (!person) return null;
  const posColor = SUBSYSTEM_COLOR[person.workTypes?.[0]] || "var(--ink)";

  return (
    <div className="modal-back" onClick={onClose}
      style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
      <div className="modal-card" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 380, padding: 0, overflow: "hidden", borderRadius: 20 }}>

        {/* Top banner */}
        <div style={{
          height: 80,
          background: `linear-gradient(135deg, ${posColor}22 0%, ${posColor}08 100%)`,
          borderBottom: `0.5px solid ${posColor}22`,
          position: "relative",
        }}>
          {/* ⋯ bubble menu trigger */}
          <div style={{ position: "absolute", top: 12, right: 12 }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                border: "0.5px solid rgba(0,0,0,0.08)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "var(--ink)", fontWeight: 700,
                letterSpacing: "0.08em", lineHeight: 1,
                boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                transition: "background .15s",
              }}
              title="更多操作"
            >···</button>

            {/* Bubble menu */}
            {menuOpen && (
              <div style={{
                position: "absolute", top: 38, right: 0, zIndex: 200,
                background: "rgba(30,30,32,0.92)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                borderRadius: 14,
                padding: "6px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset",
                minWidth: 140,
                display: "flex", flexDirection: "column", gap: 2,
              }}>
                <button onClick={() => { setMenuOpen(false); onEdit(person); }}
                  style={bubbleItemStyle}>
                  <UIIcon kind="edit" size={12}/> 編輯名片
                </button>
                <div style={{ height: "0.5px", background: "rgba(255,255,255,0.10)", margin: "2px 0" }}/>
                <button onClick={() => { setMenuOpen(false); onDelete(person); onClose(); }}
                  style={{ ...bubbleItemStyle, color: "#ff6b6b" }}>
                  <UIIcon kind="trash" size={12}/> 移除成員
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avatar — overlaps banner */}
        <div style={{ position: "relative", marginTop: -40, paddingLeft: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--ink)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700,
            border: "3px solid var(--surface)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.16)",
            letterSpacing: 0,
          }}>{person.name?.[0] || "?"}</div>
        </div>

        {/* Card body */}
        <div style={{ padding: "12px 28px 28px" }}>
          {/* Name + position */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div style={{
              fontFamily: "var(--display-family)",
              fontSize: 24, fontWeight: 700, color: "var(--ink)",
              letterSpacing: "-0.025em", lineHeight: 1.1,
            }}>{person.name}</div>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: posColor,
              background: posColor + "18",
              borderRadius: 6, padding: "2px 8px",
              letterSpacing: "0.02em",
            }}>{person.position}</span>
          </div>

          {/* Email */}
          {person.email && (
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11.5,
              color: "var(--muted)", marginTop: 6,
              letterSpacing: "-0.01em",
            }}>{person.email}</div>
          )}

          {/* Divider */}
          <div style={{ height: "0.5px", background: "var(--rule)", margin: "14px 0" }}/>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {[
              { label: "系所", value: person.department },
              { label: "年級", value: person.grade },
            ].map(({ label, value }) => value ? (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                  color: "var(--ink)", letterSpacing: "-0.01em" }}>{value}</div>
              </div>
            ) : null)}
          </div>

          {/* Subsystem tags */}
          {person.workTypes?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
              {person.workTypes.map(w => <SubsystemTag key={w} kind={w} size="sm"/>)}
            </div>
          )}
          {(!person.workTypes || person.workTypes.length === 0) && (
            <div style={{ marginTop: 16 }}>
              <span className="pill muted">無指派子系統</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const bubbleItemStyle = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 12px", borderRadius: 8,
  background: "transparent", border: "none",
  color: "rgba(255,255,255,0.88)", cursor: "pointer",
  fontSize: 13, fontWeight: 500, textAlign: "left",
  transition: "background .12s",
  width: "100%",
};

// ─── PeopleView ────────────────────────────────────────────────
function PeopleView({ people, editPerson, newPerson, onDelete }) {
  const [filter, setFilter] = React.useState("all");
  const [profileId, setProfileId] = React.useState(null);
  const filtered = filter === "all" ? people : people.filter(p => p.position === filter);
  const profilePerson = people.find(p => p.id === profileId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-zone)" }}>
      <SectionHead title="團隊成員" hint={`${filtered.length} OF ${people.length} 人`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <SegmentedFilter value={filter} onChange={setFilter} options={[
              { id: "all", label: "全部" },
              { id: "隊長", label: "隊長" },
              { id: "副隊長", label: "副隊長" },
              { id: "組長", label: "組長" },
              { id: "成員", label: "成員" },
              { id: "教授", label: "教授" },
            ]}/>
            <Button variant="primary" icon="plus" onClick={newPerson}>新增成員</Button>
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
