import React, { useEffect, useId, useState } from "react";

/* ---------- iconos ---------- */
const P = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  calplus: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" /></>,
  bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  back: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></>,
  check: <path d="m5 12 5 5L20 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  video: <><path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
  spark: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />,
  store: <><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11h16V9" /><path d="M3 9h18" /><path d="M10 20v-6h4v6" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z" />,
  ig: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  wa: <><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2Z" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m10.9 12.1 9.1-9.1M15 5l3 3M18 2l3 3" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5M12 3v12" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
};
export function Icon({ name, size = 22, stroke = 1.8, color = "currentColor", fill = "none", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", ...style }}>
      {P[name]}
    </svg>
  );
}

/* ---------- logo real ---------- */
export function Logo({ h = 30, white }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <span className="logo-text" style={white ? { color: "#fff" } : undefined}>LoftStudio<span style={{ fontSize: 12, verticalAlign: "top" }}>✦</span></span>;
  return <img src={white ? "/img/logo-white.png" : "/img/logo.png"} alt="LoftStudio · Barre & Yoga" height={h} onError={() => setOk(false)} style={{ height: h, width: "auto", alignSelf: "flex-start", flex: "none" }} />;
}

export function Photo({ name, alt, h, cover, radius, bg, style, pos }) {
  const [ok, setOk] = useState(true);
  return (
    <div className={"photo" + (cover ? " cover" : "")} style={{ height: h, borderRadius: radius, background: ok ? bg : "var(--arena)", ...style }}>
      {ok ? <img src={`/img/${name}.jpg`} alt={alt} loading="lazy" onError={() => setOk(false)} style={pos ? { objectPosition: pos } : undefined} /> : <span className="alt">{alt}</span>}
    </div>
  );
}

export const Btn = ({ kind = "primary", size, className = "", children, ...p }) => (
  <button className={`btn ${kind} ${size || ""} ${className}`} {...p}>{children}</button>
);
export const Pill = ({ on, children, sage, ...p }) => <button className={"pill" + (sage ? " sage" : "")} aria-pressed={!!on} {...p}>{children}</button>;
export const Tag = ({ tone = "", children }) => <span className={`tag ${tone}`}>{children}</span>;
export const Eyebrow = ({ children, style }) => <span className="eyebrow" style={style}>{children}</span>;
export const Bar = ({ v, inv }) => <div className={"bar" + (inv ? " inv" : "")} aria-hidden="true"><div style={{ width: `${Math.max(0, Math.min(100, v))}%` }} /></div>;
export const Switch = ({ on, onChange, label }) => <button className="switch" role="switch" aria-checked={!!on} aria-label={label} onClick={() => onChange(!on)} />;
export const DateBox = ({ d, h, tone = "" }) => <div className={`datebox ${tone}`}><span className="d">{d}</span><span className="h">{h}</span></div>;
export function Radio({ on, title, sub, right, ...p }) {
  return (
    <button className="radio" aria-pressed={!!on} {...p}>
      <span className="dot" />
      <span className="col grow" style={{ gap: 1 }}>
        <span style={{ fontSize: 14, fontWeight: on ? 600 : 500 }}>{title}</span>
        {sub && <span className="xs muted">{sub}</span>}
      </span>
      {right && <span className="small b" style={{ color: "var(--sage-800)", flex: "none" }}>{right}</span>}
    </button>
  );
}
export const Option = ({ on, l, s, ...p }) => <button className="option" aria-pressed={!!on} {...p}><span className="l">{l}</span>{s && <span className="s">{s}</span>}</button>;
export function Field({ label, hint, err, ...p }) {
  const id = useId();
  return (
    <div className={"field" + (err ? " err" : "")}>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...p} aria-invalid={!!err} aria-describedby={err || hint ? id + "-h" : undefined} />
      {(err || hint) && <span id={id + "-h"} className={"hint" + (err ? " err" : "")}>{err || hint}</span>}
    </div>
  );
}
export const Avatar = ({ children, lg, rosa }) => <span className={`avatar ${lg ? "lg" : ""} ${rosa ? "rosa" : ""}`}>{children}</span>;

export function TopBar({ onBack, title, right, transparent }) {
  return (
    <div className="row between" style={{ padding: "4px 12px 4px 10px", minHeight: 52, position: transparent ? "absolute" : "relative", left: 0, right: 0, zIndex: 2 }}>
      <div className="row g4 grow">
        {onBack && <button className={"icon-btn" + (transparent ? " white" : "")} aria-label="Volver" onClick={onBack}><Icon name="back" size={24} /></button>}
        {title && <h1 className="display h2 ellipsis" style={{ fontSize: 17 }}>{title}</h1>}
      </div>
      <div className="row g4 none">{right}</div>
    </div>
  );
}
export function Header({ title, right, sub }) {
  return (
    <div className="row between" style={{ padding: "12px 0 0", alignItems: "flex-end" }}>
      <div className="col g4">{sub && <Eyebrow>{sub}</Eyebrow>}<h1 className="display h1">{title}</h1></div>
      <div className="row g6 none">{right}</div>
    </div>
  );
}

export function Sheet({ open, onClose, children, title }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title || "Panel"} onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        {title && <h2 className="display h2">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Toast({ t, k, onAction, label = "Deshacer", onClose }) {
  const closeRef = React.useRef(onClose); closeRef.current = onClose;
  const hasAction = !!onAction;
  useEffect(() => {
    if (!t) return;
    const id = setTimeout(() => closeRef.current(), hasAction ? 5000 : 2800);
    return () => clearTimeout(id);
  }, [t, k, hasAction]);
  if (!t) return null;
  return (
    <div className="toast" role="status">
      <span className="grow">{t}</span>
      {onAction && <button onClick={onAction}>{label}</button>}
    </div>
  );
}

export function Empty({ icon = "spark", title, text, action }) {
  return (
    <div className="card p col g12 center tc" style={{ padding: "28px 20px" }}>
      <span className="avatar lg" style={{ background: "var(--arena)", color: "var(--gris)" }}><Icon name={icon} size={26} /></span>
      <div className="col g4"><span className="h3">{title}</span>{text && <span className="small muted">{text}</span>}</div>
      {action}
    </div>
  );
}

export const Stars = ({ v = 5 }) => <span className="stars" aria-label={`${v} estrellas`}>{"★★★★★".slice(0, Math.round(v))}{"☆☆☆☆☆".slice(0, 5 - Math.round(v))}</span>;
