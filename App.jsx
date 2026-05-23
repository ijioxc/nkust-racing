// App.jsx — top-level router + state + tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "glass",
  "density": "default",
  "showWeekRuler": true,
  "blurStrength": 24
}/*EDITMODE-END*/;

function App() {
  const [page, _setPage] = React.useState("dashboard");
  const [subTab, _setSubTab] = React.useState("overview");

  // Wrap state change in a View Transition, swallowing the "aborted" rejection
  // that fires when a new transition starts before the previous one settles
  // (e.g. rapid tab clicks). Otherwise it bubbles as an unhandledrejection.
  const withViewTransition = (apply) => {
    if (document.startViewTransition) {
      const t = document.startViewTransition(apply);
      t.ready?.catch(() => {});
      t.finished?.catch(() => {});
      t.updateCallbackDone?.catch(() => {});
    } else {
      apply();
    }
  };

  const setPage   = (newPage)   => withViewTransition(() => _setPage(newPage));
  const setSubTab = (newSubTab) => withViewTransition(() => _setSubTab(newSubTab));

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Appearance: "auto" | "light" | "dark" — persisted, resolves auto via system
  const [appearance, setAppearance] = React.useState(() => {
    try { return localStorage.getItem("appearance") || "auto"; } catch { return "auto"; }
  });
  React.useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = appearance === "auto"
        ? (mq.matches ? "dark" : "light")
        : appearance;
      root.setAttribute("data-appearance", resolved);
    };
    apply();
    try { localStorage.setItem("appearance", appearance); } catch {}
    if (appearance === "auto") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [appearance]);

  // Live data state — synced to Firebase RTDB, live across devices/users
  const [tasks,     setTasks]     = useRtdbState("tasks",     INITIAL_TASKS);
  const [people,    setPeople]    = useRtdbState("people",    INITIAL_PEOPLE);
  const [plans,     setPlans]     = useRtdbState("plans",     INITIAL_PLANS);
  const [suppliers, setSuppliers] = useRtdbState("suppliers", INITIAL_SUPPLIERS);
  const [resources, setResources] = useRtdbState("resources", INITIAL_RESOURCES);

  // Apply theme + density on root
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-density", t.density);
    // Optional blur override
    document.documentElement.style.setProperty(
      "--card-blur",
      `blur(${t.blurStrength}px) saturate(${t.theme === "flat" ? 100 : 160}%)`,
    );
  }, [t.theme, t.density, t.blurStrength]);

  const dashTabs = [
    { id: "overview",  label: "總覽",   icon: "target",   count: undefined },
    { id: "worklog",   label: "工作日誌", icon: "calendar", count: tasks.length },
    { id: "plans",     label: "計畫",   icon: "wrench",   count: plans.length },
    { id: "people",    label: "人員",   icon: "users",    count: people.length },
    { id: "parts",     label: "零件",   icon: "factory",  count: suppliers.length },
    { id: "resources", label: "資源",   icon: "book",     count: resources.length },
  ];

  return (
    <div data-screen-label={`${page === "dashboard" ? subTab : page}`}
         style={{ minHeight: "100vh" }}>
      <Header
        page={page} onPageChange={setPage}
        subTab={subTab} onSubTabChange={setSubTab}
        dashTabs={dashTabs}
        appearance={appearance} onAppearanceChange={setAppearance}/>

      <main style={{
        maxWidth: 1440, margin: "0 auto",
        padding: "32px 40px 80px",
      }}>
        {page === "dashboard" && (
          <Dashboard
            tab={subTab}
            tasks={tasks}         setTasks={setTasks}
            people={people}       setPeople={setPeople}
            plans={plans}         setPlans={setPlans}
            suppliers={suppliers} setSuppliers={setSuppliers}
            resources={resources} setResources={setResources}/>
        )}
        {page === "blueprint" && <Blueprint/>}
        {page === "essay"     && <Essay/>}
      </main>

      <TweaksPanel title="Tweaks · 統一視覺">
        <TweakSection label="VISUAL DIRECTION"/>
        <TweakRadio label="Theme" value={t.theme}
          options={["glass", "flat", "editorial"]}
          onChange={v => setTweak("theme", v)}/>
        <TweakRadio label="Density" value={t.density}
          options={["compact", "default", "spacious"]}
          onChange={v => setTweak("density", v)}/>
        <TweakSlider label="Glass blur" value={t.blurStrength}
          min={0} max={48} step={2} unit="px"
          onChange={v => setTweak("blurStrength", v)}/>
        <TweakSection label="QUICK NAVIGATION"/>
        <TweakSelect label="Open page" value={page}
          options={[
            { value: "dashboard", label: "工作台" },
            { value: "blueprint", label: "車體圖解" },
            { value: "essay",     label: "技術手冊" },
          ]}
          onChange={v => setPage(v)}/>
        {page === "dashboard" && (
          <TweakSelect label="Sub-tab" value={subTab}
            options={[
              { value: "overview",  label: "總覽" },
              { value: "worklog",   label: "工作日誌" },
              { value: "plans",     label: "計畫" },
              { value: "people",    label: "人員" },
              { value: "parts",     label: "零件" },
              { value: "resources", label: "資源" },
            ]}
            onChange={v => setSubTab(v)}/>
        )}
      </TweaksPanel>
    </div>
  );
}

window.App = App;
