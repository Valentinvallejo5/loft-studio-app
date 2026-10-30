import React, { useMemo, useState } from "react";
import { Btn, Eyebrow, Icon, Sheet, Tag } from "../ui.jsx";
import { PACKS, STUDIO, TYPES } from "../data.js";
import { fmt, fmtFecha, minutosHasta, parseYmd } from "../store.js";
import { compartir, inicial } from "../utils.js";

/* ---------- Onboarding: elegí tus favoritas (solo cuentas nuevas) ---------- */
export function Onboarding({ app }) {
  const [sel, setSel] = useState([]);
  const [paso, setPaso] = useState(0);
  const nombre = (app.st.user?.nombre || "").split(" ")[0];
  const t = (k) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  return (
    <Sheet open onClose={() => app.dispatch({ type: "onboarded", favs: sel })}>
      {paso === 0 ? (
        <>
          <Eyebrow>Bienvenida a Loft, {nombre}</Eyebrow>
          <h2 className="display h2" style={{ fontSize: 21 }}>¿Qué te gustaría practicar?</h2>
          <p className="small muted" style={{ margin: 0 }}>Lo usamos para ordenarte la grilla y recomendarte horarios. Después lo cambiás desde Perfil.</p>
          <div className="col g8">
            {Object.entries(TYPES).map(([k, ty]) => (
              <button key={k} className="radio" aria-pressed={sel.includes(k)} onClick={() => t(k)}>
                <span className="dot" />
                <span className="col grow" style={{ gap: 1 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{ty.nombreLargo || ty.nombre}</span><span className="xs muted">{ty.nivel} · {ty.dur} min</span></span>
              </button>
            ))}
          </div>
          <Btn onClick={() => setPaso(1)} disabled={!sel.length}>Seguir</Btn>
          <Btn kind="ghost" onClick={() => app.dispatch({ type: "onboarded", favs: [] })}>Saltar por ahora</Btn>
        </>
      ) : (
        <>
          <Eyebrow>Tu primera clase</Eyebrow>
          <h2 className="display h2" style={{ fontSize: 21 }}>Así funciona Loft</h2>
          <div className="col g10">
            {[["cal", "Reservás desde la grilla", "Elegís día y horario. El cupo es de 10 por clase."], ["card", "Pagás con pack o clase suelta", `Los packs duran 30 días. Desde ${fmt(PACKS[1].efectivo)} las 4 clases.`], ["bell", "Te recordamos 1 hora antes", "Y si una clase está llena, te avisamos cuando se libera un lugar."], ["pin", "Venís a Loft", `${STUDIO.direccion}, ${STUDIO.barrio}. Medias antideslizantes para Barre; lo demás está en el estudio.`]].map(([ic, t1, t2]) => (
              <div key={t1} className="row g12" style={{ alignItems: "flex-start" }}><span className="avatar" style={{ width: 38, height: 38 }}><Icon name={ic} size={18} /></span><div className="col" style={{ gap: 1 }}><span className="small b">{t1}</span><span className="xs muted">{t2}</span></div></div>
            ))}
          </div>
          <Btn onClick={() => { app.dispatch({ type: "onboarded", favs: sel }); app.tab("clases"); }}>Ver la grilla</Btn>
          <Btn kind="ghost" onClick={() => app.dispatch({ type: "onboarded", favs: sel })}>Ir al inicio</Btn>
        </>
      )}
    </Sheet>
  );
}

/* ---------- Check-in con QR (próxima clase dentro de los 45 min) ---------- */
function QR({ seed }) {
  // patrón determinístico, puramente visual
  let h = 2166136261; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const N = 21, cells = [];
  const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (finder(x, y)) { const ix = x % 14, iy = y % 14; const on = ix === 0 || ix === 6 || iy === 0 || iy === 6 || (ix >= 2 && ix <= 4 && iy >= 2 && iy <= 4); if (on) cells.push([x, y]); continue; }
    h = Math.imul(h ^ (x * 31 + y * 17), 16777619); if ((h >>> 0) % 100 < 46) cells.push([x, y]);
  }
  return <svg viewBox={`0 0 ${N} ${N}`} width="200" height="200" aria-label="Código QR de check-in" style={{ background: "#fff", borderRadius: 12, padding: 10, boxSizing: "border-box" }}>{cells.map(([x, y]) => <rect key={x + "-" + y} x={x} y={y} width="1" height="1" fill="#3b3836" />)}</svg>;
}
export function CheckIn({ app, prox, onClose }) {
  const hecho = app.st.checkins.includes(prox.c.id);
  const m = minutosHasta(prox.c);
  return (
    <Sheet open onClose={onClose} title={hecho ? "Check-in listo" : "Tu check-in"}>
      <div className="col center g12 tc">
        {hecho ? <span className="check-anim row center" style={{ width: 84, height: 84, borderRadius: 42, background: "var(--sage-700)" }}><Icon name="check" size={36} stroke={2.8} color="#fff" /></span> : <QR seed={prox.c.id + (app.st.user?.email || "")} />}
        <div className="col g4"><span className="h3">{prox.c.nombre} · {prox.c.hora}</span><span className="small muted">{hecho ? "Ya quedaste registrada. ¡Buena clase!" : m > 0 ? `Mostrá este código en recepción. Empieza en ${Math.round(m)} min.` : "La clase ya empezó. Mostrá el código en recepción."}</span></div>
        <div className="card soft p row g12" style={{ width: "100%", textAlign: "left" }}><span className="avatar">{inicial(app.st.user?.nombre)}</span><div className="col" style={{ gap: 1 }}><span className="small b">{app.st.user?.nombre}</span><span className="xs muted">{prox.r.pago === "pack" ? `${app.packActivo?.nombre || "Pack"} · quedan ${app.packActivo?.left ?? "-"}` : "Clase suelta"}</span></div></div>
      </div>
      {!hecho && <Btn onClick={() => { app.dispatch({ type: "checkin", id: prox.c.id }); app.toast("¡Check-in listo! Buena clase."); }}>Simular lectura en recepción</Btn>}
      <Btn kind="ghost" onClick={onClose}>Cerrar</Btn>
    </Sheet>
  );
}

/* ---------- Mi práctica: métricas de la alumna ---------- */
export function MiPractica({ app }) {
  const { pasadas, proximas, st } = app;
  const stats = useMemo(() => {
    const hoy = new Date(); const d30 = new Date(hoy); d30.setDate(d30.getDate() - 30);
    const mes = pasadas.filter((p) => parseYmd(p.fecha) >= d30).length;
    const porTipo = {}; pasadas.forEach((p) => { porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1; });
    const fav = Object.entries(porTipo).sort((a, b) => b[1] - a[1])[0];
    // racha: semanas consecutivas con al menos una clase
    const semanas = new Set(pasadas.map((p) => { const d = parseYmd(p.fecha); const s = new Date(d); s.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return s.toISOString().slice(0, 10); }));
    let racha = 0; const cur = new Date(hoy); cur.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    for (let i = 0; i < 52 && pasadas.length; i++) { const k = cur.toISOString().slice(0, 10); if (semanas.has(k) || (i === 0 && proximas.length)) racha++; else break; cur.setDate(cur.getDate() - 7); }
    const hora = {}; pasadas.forEach((p) => { const h = +p.hora.slice(0, 2); const k = h < 13 ? "mañana" : "tarde"; hora[k] = (hora[k] || 0) + 1; });
    const franja = (hora["mañana"] || 0) >= (hora["tarde"] || 0) ? "de mañana" : "de tarde";
    const minutos = pasadas.reduce((a, p) => a + (TYPES[p.tipo]?.dur || 55), 0);
    return { mes, total: pasadas.length, fav, racha, franja, minutos };
  }, [pasadas, proximas]);
  const objetivo = 8;
  const pct = Math.min(100, (stats.mes / objetivo) * 100);
  return (
    <div className="col g10">
      <div className="row between" style={{ alignItems: "baseline" }}><h2 className="display h2">Mi práctica</h2><span className="xs muted">últimos 30 días</span></div>
      <div className="card p col g12">
        <div className="row between" style={{ alignItems: "flex-end" }}>
          <div className="col"><span className="display" style={{ fontSize: 34, color: "var(--sage-800)", lineHeight: 1 }}>{stats.mes}</span><span className="xs muted">clases este mes · objetivo {objetivo}</span></div>
          <Tag>{stats.mes >= objetivo ? "¡Objetivo cumplido!" : `Faltan ${objetivo - stats.mes}`}</Tag>
        </div>
        <div className="bar"><div style={{ width: `${pct}%` }} /></div>
        <div className="hr" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[[stats.racha, stats.racha === 1 ? "semana seguida" : "semanas seguidas"], [stats.total, "clases en total"], [Math.round(stats.minutos / 60 * 10) / 10 + " h", "de movimiento"]].map(([n, l]) => <div key={l} className="col"><span className="display" style={{ fontSize: 18 }}>{n}</span><span className="xs muted">{l}</span></div>)}
        </div>
        {stats.fav ? <div className="row g10 small" style={{ color: "var(--ink-2)", alignItems: "flex-start" }}><Icon name="heart" size={16} color="var(--sage-700)" fill="var(--sage-700)" style={{ marginTop: 2 }} /><span>Tu clase más repetida es <b>{TYPES[stats.fav[0]].nombre}</b> y solés venir {stats.franja}.</span></div> : <span className="xs muted">Cuando tomes tu primera clase, acá vas a ver tu progreso.</span>}
      </div>
    </div>
  );
}

/* ---------- Invitá a una amiga ---------- */
export function Invitar({ app }) {
  const n = app.st.invitadas;
  const codigo = ("LOFT-" + (app.st.user?.nombre || "AMIGA").split(" ")[0].toUpperCase().slice(0, 6));
  return (
    <div className="card sage col g10" style={{ padding: 18 }}>
      <div className="row between"><Eyebrow style={{ color: "#dfe5db" }}>Traé a una amiga</Eyebrow>{n > 0 && <Tag tone="white">{n} invitación{n > 1 ? "es" : ""}</Tag>}</div>
      <span className="display h2" style={{ fontSize: 19, color: "#fff" }}>Su primera clase, de regalo</span>
      <span className="small" style={{ color: "#e7ebe3" }}>Compartí tu código <b style={{ color: "#fff" }}>{codigo}</b>. Cuando venga, vos sumás una clase a tu pack.</span>
      <Btn kind="light" size="sm" style={{ alignSelf: "flex-start" }} onClick={async () => { const r = await compartir("Vení a Loft conmigo", `Te regalo tu primera clase de Barre o Yoga en LoftStudio (${STUDIO.barrio}). Usá mi código ${codigo} en la app.`); if (r) { app.dispatch({ type: "invitar" }); app.toast(r === "copied" ? "Invitación copiada, mandásela por donde quieras." : "¡Invitación enviada!"); } }}><Icon name="share" size={18} /> Invitar</Btn>
    </div>
  );
}

/* ---------- Recomendador de pack ---------- */
export function PackSugerido({ app }) {
  const { pasadas } = app;
  const hoy = new Date(); const d30 = new Date(hoy); d30.setDate(d30.getDate() - 30);
  const mes = pasadas.filter((p) => parseYmd(p.fecha) >= d30).length;
  const soloYoga = pasadas.length > 0 && pasadas.every((p) => p.tipo === "vinyasa" || p.tipo === "integral");
  const id = soloYoga ? "yoga8" : mes <= 3 ? "p4" : mes <= 8 ? "p8" : mes <= 12 ? "p12" : "p18";
  const p = PACKS.find((x) => x.id === id);
  return (
    <div className="card soft p row g12">
      <Icon name="spark" color="var(--sage-800)" />
      <div className="col" style={{ gap: 2 }}><span className="small b">Para vos: {p.nombre}</span><span className="xs muted">{pasadas.length ? `Venís ${mes} ${mes === 1 ? "vez" : "veces"} por mes${soloYoga ? " y solo a yoga" : ""}. ` : "Para arrancar, "}{p.clases === 1 ? "" : `Te sale ${fmt(p.efectivo / p.clases)} la clase en efectivo.`}</span></div>
    </div>
  );
}
