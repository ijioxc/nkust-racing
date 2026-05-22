// icons.jsx — SubsystemIcon (7 hand-drawn) + UIIcon (Lucide style)

function SubsystemIcon({ kind, size = 16, color = "currentColor" }) {
  const c = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: 1.5,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (kind) {
    case "車體": return (
      <svg {...c}>
        <path d="M3 13l2-6h14l2 6"/>
        <path d="M3 13v5h18v-5"/>
        <circle cx="7" cy="18" r="2" fill={color}/>
        <circle cx="17" cy="18" r="2" fill={color}/>
      </svg>);
    case "引擎": return (
      <svg {...c}>
        <rect x="6" y="8" width="12" height="10" rx="1.5"/>
        <path d="M9 8V5h6v3"/>
        <path d="M6 12h-3M21 12h-3M6 16h-2M20 16h-2"/>
      </svg>);
    case "懸吊": return (
      <svg {...c}>
        <circle cx="12" cy="20" r="2.5"/>
        <path d="M12 17.5V14M9 14h6M9 14l-2-9M15 14l2-9M7 5h10"/>
      </svg>);
    case "煞車": return (
      <svg {...c}>
        <circle cx="12" cy="12" r="8"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>
      </svg>);
    case "電裝": return (
      <svg {...c}><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>);
    case "空力": return (
      <svg {...c}>
        <path d="M3 8h13a3 3 0 1 0-3-3"/>
        <path d="M3 12h17a3 3 0 1 1-3 3"/>
        <path d="M3 16h11"/>
      </svg>);
    default: return (
      <svg {...c}>
        <circle cx="6" cy="12" r="1.5" fill={color}/>
        <circle cx="12" cy="12" r="1.5" fill={color}/>
        <circle cx="18" cy="12" r="1.5" fill={color}/>
      </svg>);
  }
}

function UIIcon({ kind, size = 14, color = "currentColor", strokeWidth = 1.5 }) {
  const c = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (kind) {
    case "search":   return <svg {...c}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "plus":     return <svg {...c}><path d="M12 5v14M5 12h14"/></svg>;
    case "minus":    return <svg {...c}><path d="M5 12h14"/></svg>;
    case "upload":   return <svg {...c}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>;
    case "download": return <svg {...c}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
    case "clock":    return <svg {...c}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case "calendar": return <svg {...c}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "users":    return <svg {...c}><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/><path d="M19 8l3 3-3 3"/></svg>;
    case "user":     return <svg {...c}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>;
    case "arrow":    return <svg {...c}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "x":        return <svg {...c}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "edit":     return <svg {...c}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case "trash":    return <svg {...c}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>;
    case "grip":     return <svg {...c} strokeWidth={2}><circle cx="9" cy="5" r="0.6" fill={color}/><circle cx="15" cy="5" r="0.6" fill={color}/><circle cx="9" cy="12" r="0.6" fill={color}/><circle cx="15" cy="12" r="0.6" fill={color}/><circle cx="9" cy="19" r="0.6" fill={color}/><circle cx="15" cy="19" r="0.6" fill={color}/></svg>;
    case "filter":   return <svg {...c}><path d="M3 4h18l-7 8v6l-4 2v-8z"/></svg>;
    case "chevron-right": return <svg {...c}><path d="m9 18 6-6-6-6"/></svg>;
    case "chevron-down":  return <svg {...c}><path d="m6 9 6 6 6-6"/></svg>;
    case "rotate":   return <svg {...c}><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 3v6h6"/></svg>;
    case "target":   return <svg {...c}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>;
    case "wrench":   return <svg {...c}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
    case "book":     return <svg {...c}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case "flag":     return <svg {...c}><path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/></svg>;
    case "factory":  return <svg {...c}><path d="M3 21V9l6 4V9l6 4V9l6 4v8z"/><path d="M3 21h18"/></svg>;
    case "info":     return <svg {...c}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
    case "more":     return <svg {...c}><circle cx="5" cy="12" r="1" fill={color}/><circle cx="12" cy="12" r="1" fill={color}/><circle cx="19" cy="12" r="1" fill={color}/></svg>;
    case "check":    return <svg {...c}><path d="M5 12l5 5L20 7"/></svg>;
    case "external": return <svg {...c}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>;
    default: return null;
  }
}

Object.assign(window, { SubsystemIcon, UIIcon });
