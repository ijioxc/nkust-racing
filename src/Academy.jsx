// Academy.jsx — 學院：分級課程（取代原本的「車體圖解」與「技術手冊」）
// 課程內容寫死在 ACADEMY_LEVELS：改文字、增刪投影片、加一課，都只要改這個陣列。
//
// 等級 → 課 → 投影片。每課最後自動接一張測驗，全部答對才算完成。
// 投影片種類（kind）：
//   lead    開場：eyebrow / title / body
//   stats   數字卡：stats: [{ label, value, unit, text }]
//   formula 公式：expr / where / body
//   widget  互動元件：widget（EssayWidgets.jsx 裡的元件名稱）/ body
//   text    說明：body，可加 quote: { text, src }
// 3D 車：每課的 focus 標亮哪一組（DECK_GROUPINGS.system 的組名：輪胎／空力／煞車／動力／懸吊／車體），
//        單張投影片可用 car: { focus, zoom } 覆寫；focus: null＝整台車不標亮。
// 進度存在這台裝置的瀏覽器（localStorage），換裝置不會同步。

const ACADEMY_LEVELS = [
  {
    id: "L1", title: "汽車基礎", sub: "車怎麼動起來",
    planned: ["車怎麼動起來：引擎 → 傳動 → 車輪", "轉向", "懸吊", "煞車", "輪胎"],
  },
  {
    id: "L2", title: "賽車知識", sub: "怎麼跑得快",
    lessons: [
      {
        id: "l2-system", title: "把賽車當成系統", focus: null,
        summary: "圈速是整台車的輸出，不是單一零件的成績",
        slides: [
          { kind: "lead", eyebrow: "L2 · 導論", title: "把賽車當成系統",
            body: "圈速不是某個零件的成績，是整個系統的輸出。輪胎、配重、空力、煞車、動力，每個環節的上限，決定下一個環節能發揮多少。" },
          { kind: "widget", title: "五個子系統互相牽動", widget: "SystemDiagram",
            body: "把游標移到任一節點，看它和其他子系統怎麼耦合。改一個地方，其他四個都會跟著變。" },
          { kind: "text", title: "這一級的閱讀順序",
            body: "輪胎 → 重量 → 空力 → 煞車 → 動力。\n\n動力排最後，因為馬力是放大器：前面四個環節沒做好，再多馬力也傳不到地面。" },
        ],
        quiz: [
          { q: "為什麼說圈速是「系統的輸出」？",
            options: ["因為只要引擎夠強，圈速就會快", "因為每個子系統的上限會限制其他子系統能發揮多少", "因為圈速只看車手技術"],
            answer: 1, why: "例如輪胎抓地力不夠，煞車和動力再強也用不出來。" },
          { q: "這一級為什麼把「動力」排在最後？",
            options: ["因為動力不重要", "因為動力是放大器，前面的環節沒做好就傳不到地面", "因為動力最難學"],
            answer: 1, why: "馬力要透過輪胎才能變成推力，前面的環節決定它能用掉多少。" },
        ],
      },
      {
        id: "l2-tire", title: "輪胎：抓地力先於一切", focus: "輪胎",
        summary: "摩擦圓、工作溫度、負荷敏感度",
        slides: [
          { kind: "lead", eyebrow: "L2 · 01 輪胎", title: "抓地力先於一切",
            body: "轉向、煞車、加速，車手感覺到的所有回饋，都來自橡膠和柏油之間那幾平方公分的摩擦。輪胎不工作，其他設計全部無效。" },
          { kind: "stats", title: "輪胎要熱才會抓",
            stats: [{ label: "Hoosier R25B 最佳工作溫度", value: "70–95", unit: "°C",
                      text: "低於下限，橡膠太硬；超過上限，表面開始脫塊。溫度管理是設計前提，不是調校選項。" }] },
          { kind: "formula", title: "摩擦圓", expr: "√(Fx² + Fy²) ≤ μ · Fz",
            where: "Fx：縱向力（煞車／加速）\nFy：橫向力（過彎）\nμ：摩擦係數　Fz：垂直負荷",
            body: "輪胎只有一份「力的預算」。煞車用掉多少，過彎能用的就少多少。" },
          { kind: "widget", title: "動手試：摩擦圓", widget: "FrictionCircle",
            body: "拖曳藍點模擬輪胎受力。點碰到圓的邊緣，輪胎就在極限；再多一點力就會打滑。" },
          { kind: "text", title: "負荷敏感度",
            body: "摩擦係數會隨垂直負荷增加而變小。把重量壓到某一顆輪胎上，抓地力不會等比例增加，超過某個點反而讓總合力的上限下降。\n\n防傾桿、阻尼、後傾角，都是用來分配這份負荷的工具。" },
        ],
        quiz: [
          { q: "車子一邊過彎、一邊重踩煞車，依摩擦圓會發生什麼？",
            options: ["過彎能用的抓地力變少", "過彎能用的抓地力變多", "兩者互不影響"],
            answer: 0, why: "煞車（Fx）和過彎（Fy）共用同一份預算 μ·Fz。" },
          { q: "讓賽車減速、轉彎的力，最後是從哪裡來的？",
            options: ["卡鉗夾住碟盤", "方向機", "輪胎和地面的摩擦"], answer: 2,
            why: "卡鉗和方向機只是下指令，真正把力傳到地面的是輪胎。" },
          { q: "把更多重量壓到某一顆輪胎上，它的抓地力會？",
            options: ["等比例增加", "增加，但增加得越來越少", "完全消失"], answer: 1,
            why: "這就是負荷敏感度：μ 隨 Fz 增加而下降。" },
        ],
      },
      {
        id: "l2-weight", title: "重量：每一克都是決策", focus: null,
        summary: "減重、配重比例、重心高度",
        car: { focus: null },
        slides: [
          { kind: "lead", eyebrow: "L2 · 02 重量", title: "每一克都是決策",
            body: "車有多重、重量放在哪裡，決定了車的反應速度和極限抓地力。每一克的位置，都在影響過彎時四顆輪胎各分到多少負荷。" },
          { kind: "stats", title: "重量的代價",
            stats: [
              { label: "每多 1 kg，每圈損失", value: "0.03", unit: "秒" },
              { label: "多 20 kg × 22 圈，累計", value: "~13", unit: "秒" },
              { label: "後驅慢速場建議配重", value: "47:53", unit: "前:後",
                text: "偏後的配重讓出彎加速時後輪有更多負荷，比較不容易打滑。" },
            ] },
          { kind: "formula", title: "前軸分到多少重量", expr: "前軸重量 = (b ÷ L) × M",
            where: "b：質心到後軸的距離\nL：軸距　M：整車重（含車手）",
            body: "質心越靠前（b 越大），前軸分到的重量越多。" },
          { kind: "widget", title: "動手試：重量分配", widget: "WeightDistribution",
            body: "調整前配重和重心高度，看過彎時輪胎負荷怎麼轉移。" },
          { kind: "text", title: "設計準則",
            body: "如果只能改一件事，先降低重心；還能改第二件事，才是減重。重心越低，過彎時轉移到外側輪胎的負荷越少，四顆輪胎都能出力。" },
        ],
        quiz: [
          { q: "公式「前軸重量 = (b ÷ L) × M」中，b 代表什麼？",
            options: ["質心到前軸的距離", "質心到後軸的距離", "車寬"], answer: 1,
            why: "b 是質心到後軸的距離，所以 b 越大、質心越靠前，前軸越重。" },
          { q: "軸距 1.6 m，質心到後軸 0.8 m，前軸分到多少比例的重量？",
            options: ["40%", "50%", "60%"], answer: 1, why: "0.8 ÷ 1.6 = 0.5，也就是 50%。" },
          { q: "後驅賽車為什麼常把配重稍微偏後？",
            options: ["出彎加速時後輪負荷較大，比較不會打滑", "讓車頭比較好看", "讓煞車距離變短"], answer: 0,
            why: "驅動輪上的負荷越大，能傳到地面的驅動力越多。" },
        ],
      },
      {
        id: "l2-aero", title: "空力：下壓力不計入慣性", focus: "空力",
        summary: "下壓力公式、速度平方、升阻比",
        slides: [
          { kind: "lead", eyebrow: "L2 · 03 空力", title: "下壓力不計入慣性",
            body: "下壓力增加輪胎的垂直負荷，卻不增加車的質量，物理上接近作弊。但 FSAE 場地速度低（30–90 km/h），翼片帶來的重量和阻力，可能比它換到的抓地力更貴。" },
          { kind: "formula", title: "下壓力從哪裡來", expr: "L = ½ · ρ · V² · S · CL",
            where: "ρ ≈ 1.225 kg/m³（空氣密度）\nV：車速（m/s）　S：翼面面積\nCL：升力係數",
            body: "速度是平方項：車速翻倍，下壓力變成 4 倍。" },
          { kind: "stats", title: "兩個關鍵數字",
            stats: [
              { label: "速度翻倍，下壓力變成", value: "×4",
                text: "直線太短，翼片必須在 50 km/h 就開始有效，否則阻力先吃掉加速的收益。" },
              { label: "優秀 FSAE 翼面的升阻比目標", value: "2–3", unit: "L/D",
                text: "L/D 小於 1，代表每 1 N 下壓力，同時拖著超過 1 N 的阻力。" },
            ] },
          { kind: "widget", title: "動手試：下壓力曲線", widget: "DownforceCurve",
            body: "調整升力係數 CL、翼面面積和車速，看下壓力怎麼隨車速變化。" },
        ],
        quiz: [
          { q: "車速從 40 km/h 提高到 80 km/h，下壓力大約變成幾倍？",
            options: ["2 倍", "4 倍", "8 倍"], answer: 1, why: "下壓力和 V² 成正比，速度 2 倍 → 下壓力 2² = 4 倍。" },
          { q: "升阻比 L/D = 0.8 代表什麼？",
            options: ["阻力比下壓力大", "下壓力比阻力大", "沒有阻力"], answer: 0,
            why: "L/D < 1：每 1 N 下壓力，要付出超過 1 N 的阻力。" },
          { q: "為什麼說下壓力「物理上接近作弊」？",
            options: ["它讓引擎馬力變大", "它增加輪胎負荷，卻不增加車的質量", "它讓車變輕"], answer: 1,
            why: "抓地力變大，但加速、煞車、過彎要推動的質量沒變。" },
        ],
      },
      {
        id: "l2-brake", title: "煞車：其實是熱管理", focus: "煞車",
        summary: "動能變熱能、前後配比、熱衰退",
        slides: [
          { kind: "lead", eyebrow: "L2 · 04 煞車", title: "煞車是熱管理題",
            body: "讓車減速的是輪胎，不是卡鉗。煞車系統真正在做的，是把動能變成碟盤的熱。設計核心是「熱去哪裡」，不是「力道夠不夠大」。" },
          { kind: "stats", title: "一次煞車有多少能量",
            stats: [
              { label: "280 kg，100 → 0 km/h", value: "108", unit: "kJ",
                text: "½ × 280 × (27.8 m/s)² ≈ 108,000 J，約 2.5 秒內全部變成熱。" },
              { label: "前後制動配比", value: "65:35", unit: "前:後",
                text: "煞車時重量往前移，前輪負荷變大，能承受更大的制動力而不鎖死。" },
            ] },
          { kind: "widget", title: "動手試：煞車能量", widget: "BrakeEnergy",
            body: "調整車重、起始車速和終速，看一次煞車要吸收多少能量。" },
          { kind: "text", title: "熱太多會怎樣",
            body: "碟盤散熱不夠快，熱會傳到煞車油，讓油沸騰產生氣泡（氣阻），踩下去變軟；或是來令片超過工作溫度，摩擦力下降（熱衰退）。\n\n所以碟盤的通風孔和材質，比卡鉗的夾緊力更重要。" },
        ],
        quiz: [
          { q: "煞車系統本質上把車的動能轉換成什麼？",
            options: ["電能", "熱能", "位能"], answer: 1, why: "摩擦把動能變成碟盤和來令片的熱。" },
          { q: "為什麼前輪分到的制動力比後輪大？",
            options: ["前輪比較大", "煞車時重量前移，前輪負荷變大", "規則規定"], answer: 1,
            why: "負荷越大的輪胎能承受越大的制動力（回想摩擦圓的 μ·Fz）。" },
          { q: "280 kg 的車從 100 km/h 煞停，大約要吸收多少能量？",
            options: ["10.8 kJ", "108 kJ", "1080 kJ"], answer: 1, why: "½mv² = ½ × 280 × 27.8² ≈ 108 kJ。" },
        ],
      },
      {
        id: "l2-power", title: "動力：馬力是放大器", focus: "動力",
        summary: "進氣限流閥、扭力曲線、換檔",
        slides: [
          { kind: "lead", eyebrow: "L2 · 05 動力", title: "動力是放大器",
            body: "在規則限制下，動力輸出「平不平順」比峰值馬力更關鍵。輪胎負荷穩定、扭力曲線平坦，每一匹馬力才能變成確實的推力。" },
          { kind: "stats", title: "FSAE 的動力限制",
            stats: [
              { label: "汽油車進氣限流閥直徑", value: "20", unit: "mm",
                text: "所有進氣都要通過這個孔，各隊引擎的上限因此相近。" },
              { label: "FSAE 場地主要工作轉速", value: "6–10k", unit: "rpm",
                text: "中段扭力寬而平，比高轉的峰值更實用。" },
            ] },
          { kind: "widget", title: "動手試：扭力與馬力", widget: "TorqueCurve",
            body: "調整峰值轉速和進氣歧管長度，看扭力曲線的形狀怎麼改變。" },
          { kind: "text", title: "換檔策略",
            body: "慢速彎用 3–4 檔，5 檔只在直線末段出現。每換一次檔，驅動力會短暫中斷，這一瞬間的輪胎負荷變化，是過彎最不穩的時刻。\n\n歧管長度、凸輪正時、進氣腔體積，都在塑造扭力曲線的形狀。",
            quote: { text: "我們不是輸在馬力。我們輸在從來沒把那些馬力，穩定地傳到地面上。", src: "NKUST Racing 2025 賽後總結" } },
        ],
        quiz: [
          { q: "FSAE 汽油引擎的進氣限流閥直徑是多少？",
            options: ["20 mm", "30 mm", "沒有限制"], answer: 0, why: "所有進氣都必須通過 20 mm 的限流閥。" },
          { q: "為什麼寬而平的扭力曲線比高峰值更實用？",
            options: ["比較省油", "換檔次數少，驅動力中斷少", "引擎聲音比較好聽"], answer: 1,
            why: "少換檔＝少中斷，輪胎負荷也比較穩定。" },
          { q: "換檔的瞬間發生什麼事？",
            options: ["驅動力短暫中斷", "馬力瞬間變大", "煞車自動作動"], answer: 0,
            why: "離合器分離時引擎和車輪斷開，驅動力歸零一瞬間。" },
        ],
      },
    ],
  },
  {
    id: "L3", title: "FSAE 比賽規則", sub: "怎麼拿分、怎麼過車檢",
    planned: ["賽事總覽與配分", "靜態項目：設計、成本、商業簡報", "動態項目：加速、八字、繞錐、耐久、效率", "車檢流程", "安全規定"],
  },
];

// ── 進度（這台裝置） ─────────────────────────────────────
const ACADEMY_STORE = "academyProgress";
function readAcademyProgress() {
  try { return JSON.parse(localStorage.getItem(ACADEMY_STORE)) || {}; } catch { return {}; }
}
function useAcademyProgress() {
  const [done, setDone] = React.useState(readAcademyProgress);
  const markDone = React.useCallback((id) => {
    setDone(prev => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      try { localStorage.setItem(ACADEMY_STORE, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return [done, markDone];
}

const ALL_LESSONS = ACADEMY_LEVELS.flatMap(l => (l.lessons || []).map(ls => ({ ...ls, level: l })));

// ── 頁面 ─────────────────────────────────────────────────
function Academy() {
  const [done, markDone] = useAcademyProgress();
  const [openId, setOpenId] = React.useState(null);
  const lesson = ALL_LESSONS.find(l => l.id === openId);

  if (lesson) {
    const i = ALL_LESSONS.indexOf(lesson);
    const next = ALL_LESSONS[i + 1];
    return (
      <AcademyLesson key={lesson.id} lesson={lesson} done={!!done[lesson.id]}
        onPass={() => markDone(lesson.id)}
        onExit={() => setOpenId(null)}
        onNext={next ? () => setOpenId(next.id) : null}/>
    );
  }
  return <AcademyHome done={done} onOpen={setOpenId}/>;
}

function AcademyHome({ done, onOpen }) {
  const total = ALL_LESSONS.length;
  const finished = ALL_LESSONS.filter(l => done[l.id]).length;
  const resume = ALL_LESSONS.find(l => !done[l.id]);
  return (
    <div className="ac-home">
      <header className="ac-home-head">
        <div>
          <div className="ac-eyebrow">NKUST Racing 學院</div>
          <h1 className="ac-home-title">從一台車，到一場比賽</h1>
          <p className="ac-home-lead">三個等級：先懂車怎麼動，再懂怎麼跑得快，最後懂 FSAE 怎麼拿分。每課最後有小測驗，全部答對才算完成。</p>
        </div>
        <div className="ac-home-progress">
          <div className="ac-home-count"><strong>{finished}</strong> / {total} 課完成</div>
          <div className="ac-bar"><div className="ac-bar-fill" style={{ width: `${total ? finished / total * 100 : 0}%` }}/></div>
          {resume && (
            <button type="button" className="ac-btn ac-btn--primary" onClick={() => onOpen(resume.id)}>
              {finished ? "繼續" : "開始"}：{resume.title}
            </button>
          )}
        </div>
      </header>

      <div className="ac-levels">
        {ACADEMY_LEVELS.map(level => {
          const lessons = level.lessons || [];
          const n = lessons.filter(l => done[l.id]).length;
          return (
            <section key={level.id} className={`ac-level${lessons.length ? "" : " is-planned"}`}>
              <div className="ac-level-head">
                <span className="ac-level-badge">{level.id}</span>
                <div>
                  <h2 className="ac-level-title">{level.title}</h2>
                  <div className="ac-level-sub">{level.sub}</div>
                </div>
                <span className="ac-level-count">{lessons.length ? `${n} / ${lessons.length}` : "準備中"}</span>
              </div>
              <ol className="ac-lessons">
                {lessons.map((l, i) => (
                  <li key={l.id}>
                    <button type="button" className={`ac-lesson${done[l.id] ? " is-done" : ""}`} onClick={() => onOpen(l.id)}>
                      <span className="ac-lesson-num">{done[l.id] ? <UIIcon kind="check" size={14} strokeWidth={2.4}/> : String(i + 1).padStart(2, "0")}</span>
                      <span className="ac-lesson-text">
                        <span className="ac-lesson-title">{l.title}</span>
                        <span className="ac-lesson-sum">{l.summary}</span>
                      </span>
                      <UIIcon kind="chevron-right" size={16}/>
                    </button>
                  </li>
                ))}
                {(level.planned || []).map((t, i) => (
                  <li key={t}>
                    <div className="ac-lesson is-planned">
                      <span className="ac-lesson-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ac-lesson-text"><span className="ac-lesson-title">{t}</span></span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── 上課 ─────────────────────────────────────────────────
function AcademyLesson({ lesson, done, onPass, onExit, onNext }) {
  const slides = React.useMemo(() => [...lesson.slides, { kind: "quiz", title: "小測驗" }], [lesson]);
  const [index, setIndex] = React.useState(0);
  const [passed, setPassed] = React.useState(done);
  const [carStatus, setCarStatus] = React.useState("loading");
  const bodyRef = React.useRef(null);
  const total = slides.length;
  const slide = slides[index];
  const isQuiz = slide.kind === "quiz";
  const go = React.useCallback(i => setIndex(Math.max(0, Math.min(total - 1, i))), [total]);

  React.useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [index]);

  React.useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); setIndex(i => Math.min(total - 1, i + 1)); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); }
      if (e.key === "Escape")     { e.preventDefault(); onExit(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, onExit]);

  const car = { ...(lesson.car || {}), ...(slide.car || {}) };
  const focus = "focus" in car ? car.focus : lesson.focus;
  const pose = { x: 0.5, y: 0.5, w: 0.95, zoom: car.zoom ?? (focus ? 0.85 : 1.15), ...(focus ? { focus } : {}) };

  return (
    <div className="ac-player">
      <div className="ac-topbar">
        <button type="button" className="ac-back" onClick={onExit}>
          <span className="ac-back-icon"><UIIcon kind="chevron-right" size={16}/></span>課程列表
        </button>
        <div className="ac-topbar-title">
          <span className="ac-level-badge ac-level-badge--sm">{lesson.level.id}</span>{lesson.title}
        </div>
        <span className="ac-counter">{index + 1} / {total}</span>
      </div>

      <div className="ac-main">
        <div className="ac-car">
          <DeckStageCar pose={pose} grouping="system" onStatus={setCarStatus}/>
          {carStatus !== "ready" && (
            <div className="ac-car-status">{carStatus === "error" ? "3D 模型載入失敗" : "載入 3D 模型…"}</div>
          )}
          {focus && carStatus === "ready" && <div className="ac-car-tag">標亮：{focus}</div>}
        </div>

        <div ref={bodyRef} className="ac-body">
          <AcademySlide key={index} slide={slide} lesson={lesson}
            passed={passed} onPass={() => { setPassed(true); onPass(); }}/>
        </div>
      </div>

      <div className="ac-controls">
        <button type="button" className="ac-btn" onClick={() => go(index - 1)} disabled={index === 0}>上一張</button>
        <div className="ac-dots">
          {slides.map((s, i) => (
            <button key={i} type="button" className={`ac-dot${i === index ? " is-active" : ""}${s.kind === "quiz" ? " is-quiz" : ""}`}
              onClick={() => go(i)} aria-label={`第 ${i + 1} 張：${s.title}`} title={s.title}/>
          ))}
        </div>
        {!isQuiz ? (
          <button type="button" className="ac-btn ac-btn--primary" onClick={() => go(index + 1)}>下一張</button>
        ) : passed && onNext ? (
          <button type="button" className="ac-btn ac-btn--primary" onClick={onNext}>下一課</button>
        ) : (
          <button type="button" className="ac-btn" onClick={onExit} disabled={!passed}>完成</button>
        )}
      </div>
    </div>
  );
}

function AcademySlide({ slide, lesson, passed, onPass }) {
  const paras = (text) => (text || "").split("\n\n").map((t, i) => <p key={i} className="ac-p">{t}</p>);
  switch (slide.kind) {
    case "lead":
      return (
        <div className="ac-slide ac-slide--lead">
          <div className="ac-eyebrow">{slide.eyebrow}</div>
          <h1 className="ac-title-xl">{slide.title}</h1>
          <p className="ac-lead">{slide.body}</p>
        </div>
      );
    case "stats":
      return (
        <div className="ac-slide">
          <h2 className="ac-title">{slide.title}</h2>
          <div className="ac-stats">
            {slide.stats.map(s => (
              <div key={s.label} className="ac-stat">
                <div className="ac-stat-label">{s.label}</div>
                <div className="ac-stat-value">{s.value}{s.unit && <span className="ac-stat-unit">{s.unit}</span>}</div>
                {s.text && <p className="ac-stat-text">{s.text}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case "formula":
      return (
        <div className="ac-slide">
          <h2 className="ac-title">{slide.title}</h2>
          <div className="ac-formula">
            <div className="ac-formula-expr">{slide.expr}</div>
            <div className="ac-formula-where">{slide.where}</div>
          </div>
          {paras(slide.body)}
        </div>
      );
    case "widget": {
      const W = window[slide.widget];
      return (
        <div className="ac-slide">
          <h2 className="ac-title">{slide.title}</h2>
          {slide.body && <p className="ac-p ac-p--muted">{slide.body}</p>}
          <div className="ac-widget">{W ? <W/> : <p className="ac-p">找不到互動元件 {slide.widget}</p>}</div>
        </div>
      );
    }
    case "text":
      return (
        <div className="ac-slide">
          <h2 className="ac-title">{slide.title}</h2>
          {paras(slide.body)}
          {slide.quote && (
            <blockquote className="ac-quote">
              <p>{slide.quote.text}</p>
              <cite>{slide.quote.src}</cite>
            </blockquote>
          )}
        </div>
      );
    case "quiz":
      return <AcademyQuiz questions={lesson.quiz} passed={passed} onPass={onPass}/>;
    default:
      return <div className="ac-slide"><h2 className="ac-title">{slide.title}</h2></div>;
  }
}

// 每題選一次就顯示對錯；答錯可以重選。全部答對 → 完成本課。
function AcademyQuiz({ questions, passed, onPass }) {
  const [picked, setPicked] = React.useState({});
  const correct = questions.filter((q, i) => picked[i] === q.answer).length;
  const allRight = correct === questions.length;
  React.useEffect(() => { if (allRight && !passed) onPass(); }, [allRight, passed, onPass]);

  return (
    <div className="ac-slide">
      <div className="ac-eyebrow">小測驗</div>
      <h2 className="ac-title">{passed && !allRight ? "這課已完成，可以再練習一次" : `答對 ${correct} / ${questions.length}`}</h2>
      <ol className="ac-quiz">
        {questions.map((q, i) => {
          const p = picked[i];
          const answered = p != null;
          const right = p === q.answer;
          return (
            <li key={i} className="ac-q">
              <div className="ac-q-text">{i + 1}. {q.q}</div>
              <div className="ac-q-options" role="radiogroup" aria-label={q.q}>
                {q.options.map((opt, j) => {
                  const state = !answered || p !== j ? "" : right ? " is-right" : " is-wrong";
                  return (
                    <button key={j} type="button" role="radio" aria-checked={p === j}
                      className={`ac-q-opt${state}`}
                      disabled={answered && right}
                      onClick={() => setPicked(prev => ({ ...prev, [i]: j }))}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className={`ac-q-why${right ? " is-right" : " is-wrong"}`}>
                  {right ? "答對了。" : "再想想，換一個選項試試。"}{right && q.why ? q.why : ""}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {allRight && <div className="ac-pass"><UIIcon kind="check" size={16} strokeWidth={2.4}/>本課完成</div>}
    </div>
  );
}

Object.assign(window, { Academy, ACADEMY_LEVELS });
