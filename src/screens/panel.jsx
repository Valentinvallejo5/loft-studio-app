import React, { useMemo, useState } from "react";
import { Btn, Eyebrow, Icon, Tag, TopBar } from "../ui.jsx";
import { CUPO, PACKS, STUDIO, TYPES, FAQ } from "../data.js";
import { fmt, hoy, parseYmd, weekday } from "../store.js";

/* ============================================================
   Panel del estudio (vista de Flor / recepción).
   Métricas calculadas sobre la grilla real y la ocupación
   simulada del prototipo, más supuestos marcados como tales.
   ============================================================ */
export function Panel({ app }) {
  const { clases, st } = app;
  const [rango, setRango] = useState("semana");
  const m = useMemo(() => {
    const h = hoy();
    const d7 = clases.filter((c) => c.fecha >= h).slice(0, 60);
    const semana = d7.filter((c) => { const d = parseYmd(c.fecha); const dh = parseYmd(h); return (d - dh) / 86400000 < 7; });
    const hoyC = clases.filter((c) => c.fecha === h);
    const set = rango === "hoy" ? hoyC : semana;
    const ocup = set.reduce((a, c) => a + Math.min(CUPO, c.ocupados + (app.esMia(c.id) ? 1 : 0)), 0);
    const cap = set.length * CUPO;
    const llenas = set.filter((c) => c.ocupados >= CUPO).length;
    const porTipo = {}; set.forEach((c) => { const k = c.tipo; porTipo[k] = porTipo[k] || { n: 0, o: 0 }; porTipo[k].n++; porTipo[k].o += Math.min(CUPO, c.ocupados); });
    const porDia = [0, 1, 2, 3, 4, 5].map((wd) => { const cs = semana.filter((c) => weekday(parseYmd(c.fecha)) === wd); const o = cs.reduce((a, c) => a + Math.min(CUPO, c.ocupados), 0); return { wd, pct: cs.length ? o / (cs.length * CUPO) : 0, n: cs.length }; });
    const porHora = {}; set.forEach((c) => { const k = +c.hora.slice(0, 2) < 13 ? "Mañana" : "Tarde"; porHora[k] = porHora[k] || { n: 0, o: 0 }; porHora[k].n++; porHora[k].o += Math.min(CUPO, c.ocupados); });
    // supuestos [SIMULADO] para el mes: 120 socias activas, mix de packs
    const socias = 120, packsMes = 92;
    const mix = { p8: 0.46, p12: 0.2, p4: 0.18, yoga8: 0.1, p18: 0.06 };
    const ingresos = Object.entries(mix).reduce((a, [id, pct]) => a + PACKS.find((p) => p.id === id).transf * packsMes * pct, 0) + 14 * 28000 + st.pedidos.reduce((a, p) => a + p.total, 0);
    const espera = set.filter((c) => c.ocupados >= CUPO).length * 2 + st.espera.length;
    const horas = {}; semana.forEach((c) => { horas[c.hora] = horas[c.hora] || { n: 0, o: 0 }; horas[c.hora].n++; horas[c.hora].o += Math.min(CUPO, c.ocupados); });
    const rank = Object.entries(horas).map(([h, v]) => [h, v.o / (v.n * CUPO)]).sort((a, b) => b[1] - a[1]);
    const top = rank.slice(0, 2).map((x) => x[0]), low = rank[rank.length - 1]?.[0];
    return { ocup, cap, pct: cap ? ocup / cap : 0, llenas, n: set.length, porTipo, porDia, porHora, socias, packsMes, ingresos, espera, top, low };
  }, [clases, rango, st, app]);
  const D = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const kpi = (t, v, sub, delta, down) => (
    <div className="card col g6" style={{ padding: 14 }}>
      <div className="row between"><span className="xs muted">{t}</span>{delta && <span className={"delta" + (down ? " down" : "")}>{delta}</span>}</div>
      <span className="display" style={{ fontSize: 24, lineHeight: 1 }}>{v}</span>
      <span className="xs muted">{sub}</span>
    </div>
  );
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Panel del estudio" right={<Tag tone="clay">Vista Loft</Tag>} />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        <p className="xs muted" style={{ margin: 0 }}>Lo que vería Flor o recepción. Ocupación calculada sobre la grilla real y las reservas del prototipo; ingresos y socias con supuestos marcados.</p>
        <div className="segmented">{[["hoy", "Hoy"], ["semana", "Esta semana"]].map(([k, l]) => <button key={k} aria-current={rango === k ? "page" : undefined} onClick={() => setRango(k)}>{l}</button>)}</div>

        <div className="card sage col g10" style={{ padding: 18 }}>
          <div className="row between"><Eyebrow style={{ color: "#e3e8df" }}>Ocupación {rango === "hoy" ? "de hoy" : "de la semana"}</Eyebrow><Tag tone="white">{m.n} clases</Tag></div>
          <div className="row" style={{ alignItems: "baseline", gap: 8 }}><span className="display" style={{ fontSize: 44, lineHeight: 1, color: "#fff" }}>{Math.round(m.pct * 100)}%</span><span className="small" style={{ color: "#e3e8df" }}>{m.ocup} de {m.cap} lugares</span></div>
          <div className="bar inv"><div style={{ width: `${m.pct * 100}%` }} /></div>
          <div className="row g14 xs" style={{ color: "#e3e8df" }}><span><b style={{ color: "#fff" }}>{m.llenas}</b> completas</span><span><b style={{ color: "#fff" }}>{m.espera}</b> en lista de espera</span></div>
        </div>

        <div className="card p col g12">
          <div className="row between"><span className="small b">Ocupación por día</span><span className="xs muted">% promedio</span></div>
          <div className="bars">{m.porDia.map((d) => <div key={d.wd} className={"b" + (d.pct >= 0.8 ? " hi" : "")}><i style={{ height: `${Math.max(4, d.pct * 100)}%` }} /><span>{D[d.wd]}</span></div>)}</div>
          <span className="xs muted">Los horarios de {m.top.join(" y ")} son los que más se llenan; el de {m.low} es el que tiene más margen.</span>
        </div>

        <div className="kpi">
          {Object.entries(m.porTipo).map(([k, v]) => kpi(TYPES[k].nombre, `${Math.round((v.o / (v.n * CUPO)) * 100)}%`, `${v.n} clases · ${v.o} lugares`))}
          {Object.entries(m.porHora).map(([k, v]) => kpi(k, `${Math.round((v.o / (v.n * CUPO)) * 100)}%`, `${v.n} clases`))}
        </div>

        <div className="col g10">
          <div className="row between" style={{ alignItems: "baseline" }}><h2 className="display h2">Negocio del mes</h2><span className="xs muted">supuestos</span></div>
          <div className="kpi">
            {kpi("Ingresos estimados", fmt(Math.round(m.ingresos / 1000) * 1000), "packs + sueltas + tienda", "+8%")}
            {kpi("Socias activas", m.socias, "con pack vigente", "+5")}
            {kpi("Packs vendidos", m.packsMes, "46% elige Pack 8", "+11%")}
            {kpi("Mats vendidos", 6 + st.pedidos.reduce((a, p) => a + p.items.reduce((x, l) => x + l.qty, 0), 0), `${fmt(130000)} c/u`)}
          </div>
        </div>

        <div className="col g10">
          <h2 className="display h2">Impacto de la app</h2>
          <div className="card p col g12">
            {[["Reservas por la app", 78, "vs. 22% por WhatsApp / Siguefit"], ["Pagos sin comprobante manual", 64, "transferencias con comprobante automático"], ["Lugares liberados recuperados", 71, "lista de espera que terminó en reserva"], ["Activación: nuevas que reservan en 7 días", 58, "métrica operativa del TP"], ["Retención: 2+ clases en 30 días", 67, "métrica estratégica del TP"]].map(([t, v, sub]) => (
              <div key={t} className="col g6"><div className="row between small"><span style={{ fontWeight: 500 }}>{t}</span><span className="b">{v}%</span></div><div className="bar"><div style={{ width: `${v}%` }} /></div><span className="xs muted">{sub}</span></div>
            ))}
            <span className="xs" style={{ color: "var(--gris-2)" }}>Valores simulados para la presentación; son los indicadores que la app permitiría medir.</span>
          </div>
        </div>

        <div className="card soft p col g8">
          <span className="small b">Próximas acciones sugeridas</span>
          {[`Abrir un segundo horario de Barre a las ${m.top[0]} (es el que más se completa).`, "Promo de mañana: 2 clases extra en el Pack 8 para horarios antes de las 10.", "Recordar vencimiento a las 14 socias cuyo pack vence esta semana."].map((t) => <div key={t} className="row g8 xs" style={{ alignItems: "flex-start", color: "var(--ink-2)" }}><Icon name="spark" size={14} color="var(--sage-800)" style={{ marginTop: 2 }} />{t}</div>)}
        </div>
      </div></div>
    </div>
  );
}

/* ---------- Ayuda / preguntas frecuentes ---------- */
export function Ayuda({ app }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Ayuda" />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        <p className="small muted" style={{ margin: 0 }}>Las políticas del estudio, claras y a mano. Si no encontrás lo que buscás, escribinos.</p>
        <div className="card list">
          {FAQ.map((f, i) => (
            <div key={f.q} style={{ borderTop: i ? "1px solid var(--linea)" : 0 }}>
              <button className="btn-reset row between g12" style={{ width: "100%", padding: "14px 16px", cursor: "pointer" }} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="small b">{f.q}</span><Icon name="down" size={18} color="var(--gris-2)" style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {open === i && <p className="small" style={{ margin: 0, padding: "0 16px 14px", color: "var(--ink-2)", lineHeight: 1.55 }}>{f.a}</p>}
            </div>
          ))}
        </div>
        <a className="btn primary" href={STUDIO.whatsapp} target="_blank" rel="noreferrer"><Icon name="wa" size={18} /> Escribirnos por WhatsApp</a>
      </div></div>
    </div>
  );
}
