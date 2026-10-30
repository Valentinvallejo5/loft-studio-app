import React, { useMemo, useState } from "react";
import { Btn, DateBox, Empty, Eyebrow, Header, Icon, Pill, Radio, Sheet, Switch, Tag, TopBar, Avatar, Bar, Photo } from "../ui.jsx";
import { CUPO, DIAS, PACKS, PROFES, STUDIO, TYPES, EVENTOS } from "../data.js";
import { esPasada, fmt, fmtCorta, fmtFecha, hoy, minutosHasta, parseYmd, weekday } from "../store.js";
import { compartir, copiar, descargarICS, mapsUrl } from "../utils.js";
import { PackSugerido } from "./extras.jsx";
import { PagoSim, CodigoEfectivo } from "./pago.jsx";

const toneOf = (c) => (TYPES[c.tipo].color === "clay" ? "clay" : TYPES[c.tipo].color === "sand" ? "sand" : "");
const esYoga = (c) => c.tipo === "vinyasa" || c.tipo === "integral";

/* ---------- fila de clase ---------- */
export function ClaseRow({ c, app, onClick }) {
  const libres = app.libres(c);
  const mia = app.esMia(c.id);
  const espera = app.st.espera.includes(c.id);
  const pasada = esPasada(c);
  const llena = libres <= 0 && !mia;
  const prof = PROFES[c.profe];
  return (
    <button className="card tap btn-reset row g12" style={{ width: "100%", padding: 12, opacity: pasada ? 0.5 : 1 }} onClick={onClick} disabled={pasada}>
      <DateBox d={DIAS[weekday(parseYmd(c.fecha))]} h={c.hora} tone={llena ? "full" : toneOf(c)} />
      <div className="col grow" style={{ gap: 2 }}>
        <span className="h3" style={{ fontSize: 15 }}>{c.nombre}</span>
        <span className="xs muted">{c.dur} min · {prof.nombre}</span>
      </div>
      <span className="none small b tc" style={{ color: llena ? "var(--rojo)" : mia ? "var(--sage-800)" : "var(--ink)", lineHeight: 1.2 }}>
        {pasada ? "Ya pasó" : mia ? <><Icon name="check" size={14} stroke={2.6} style={{ verticalAlign: -2 }} /> Reservada</> : espera ? "En lista" : llena ? <>Completa<br /><span className="xs" style={{ fontWeight: 500 }}>lista de espera</span></> : libres <= 2 ? <>{libres} {libres === 1 ? "lugar" : "lugares"}<br /><span className="xs" style={{ fontWeight: 500, color: "var(--rojo)" }}>¡últimos!</span></> : `${libres} lugares`}
      </span>
    </button>
  );
}

/* ---------- Clases: explorar / mis reservas ---------- */
export function Clases({ app, params }) {
  const sub = params.sub || "explorar";
  const dias = useMemo(() => [...new Set(app.clases.map((c) => c.fecha))].slice(0, 14), [app.clases]);
  const primerDiaConClases = dias.find((f) => app.clases.some((c) => c.fecha === f && !esPasada(c))) || dias[0];
  const [dia, setDia] = useState(params.fecha || primerDiaConClases);
  const [filtro, setFiltro] = useState("todas");
  const [soloLibres, setSoloLibres] = useState(false);
  const filtros = [["todas", "Todas"], ["barre", "Barre"], ["yoga", "Yoga"], ["stretching", "Stretching"], ["manana", "Mañana"], ["tarde", "Tarde"]];
  const lista = app.clases.filter((c) => c.fecha === dia).filter((c) => {
    if (filtro === "yoga") return esYoga(c);
    if (filtro === "manana") return +c.hora.slice(0, 2) < 13;
    if (filtro === "tarde") return +c.hora.slice(0, 2) >= 13;
    return filtro === "todas" || c.tipo === filtro;
  }).filter((c) => !soloLibres || app.libres(c) > 0 || app.esMia(c.id));
  const esHoy = dia === hoy();
  const semana = dias.slice(0, 7), semana2 = dias.slice(7, 14);
  const [sem, setSem] = useState(semana.includes(dia) ? 0 : 1);
  const visibles = sem === 0 ? semana : semana2;

  return (
    <div className="screen">
      <div className="scroll"><div className="pad">
        <Header title="Clases" sub="Grilla semanal" right={<button className="icon-btn white" aria-label="Eventos" onClick={() => app.go("eventos")}><Icon name="star" /></button>} />
        <div className="segmented" role="tablist">
          <button role="tab" aria-current={sub === "explorar" ? "page" : undefined} onClick={() => app.replace("clases", { sub: "explorar" })}>Explorar</button>
          <button role="tab" aria-current={sub === "reservas" ? "page" : undefined} onClick={() => app.replace("clases", { sub: "reservas" })}>Mis reservas{app.proximas.length ? ` · ${app.proximas.length}` : ""}</button>
        </div>
        {sub === "explorar" ? (
          <>
            <div className="col g8">
              <div className="row between">
                <span className="small b">{sem === 0 ? "Esta semana" : "Próxima semana"}</span>
                <div className="row g4">
                  <button className="icon-btn" aria-label="Semana anterior" disabled={sem === 0} style={{ opacity: sem === 0 ? 0.3 : 1, width: 36, height: 36 }} onClick={() => { setSem(0); setDia(semana[0]); }}><Icon name="back" /></button>
                  <button className="icon-btn" aria-label="Semana siguiente" disabled={sem === 1} style={{ opacity: sem === 1 ? 0.3 : 1, width: 36, height: 36 }} onClick={() => { setSem(1); setDia(semana2[0]); }}><Icon name="next" /></button>
                </div>
              </div>
              <div className="row g6">
                {visibles.map((f) => {
                  const d = parseYmd(f); const hay = app.clases.some((c) => c.fecha === f); const mias = app.proximas.some((r) => r.c.fecha === f);
                  return (
                    <button key={f} className="day" aria-pressed={dia === f} disabled={!hay} onClick={() => setDia(f)} aria-label={fmtFecha(f, true)}>
                      <span className="w">{f === hoy() ? "Hoy" : DIAS[weekday(d)]}</span><span className="n">{d.getDate()}</span>{mias ? <span className="dotm" /> : <span style={{ height: 4 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="chips">
              {filtros.map(([k, l]) => <Pill key={k} on={filtro === k} onClick={() => setFiltro(k)}>{l}</Pill>)}
              <Pill on={soloLibres} sage onClick={() => setSoloLibres(!soloLibres)}>Con lugar</Pill>
            </div>
            <div className="col g10">
              <div className="row between"><span className="eyebrow">{esHoy ? "Hoy" : fmtFecha(dia, true)}</span><span className="xs muted">{lista.length} {lista.length === 1 ? "clase" : "clases"}</span></div>
              {lista.length === 0 && <Empty icon="cal" title="Nada por acá" text={weekday(parseYmd(dia)) === 6 ? "Los domingos Loft descansa. Mirá el sábado o el lunes." : "Probá con otro filtro u otro día."} action={<Btn kind="outline" size="sm" onClick={() => { setFiltro("todas"); setSoloLibres(false); }}>Limpiar filtros</Btn>} />}
              {lista.map((c) => <ClaseRow key={c.id} c={c} app={app} onClick={() => app.go("detalle", { id: c.id })} />)}
            </div>
            <div className="card soft p col g6">
              <span className="small b">Horarios de Loft</span>
              <span className="xs muted">Lun a vie de 8:00 a 19:30 · Sáb 10:00 y 11:00 · Domingos cerrado. La grilla es la publicada por el estudio en {STUDIO.web}.</span>
            </div>
          </>
        ) : <Reservas app={app} />}
      </div></div>
    </div>
  );
}

/* ---------- Mis reservas ---------- */
export function Reservas({ app }) {
  const { st } = app;
  const [cancelando, setCancelando] = useState(null);
  const prox = app.proximas;
  const historial = app.pasadas;
  const target = cancelando && app.clase(cancelando);
  const tarde = target && minutosHasta(target) < 120;
  return (
    <>
      <div className="col g10">
        <div className="row between"><h2 className="display h2">Próximas clases</h2>{prox.length > 0 && <span className="xs muted">{prox.length} reservada{prox.length > 1 ? "s" : ""}</span>}</div>
        {prox.length === 0 && <Empty icon="calplus" title="Todavía no tenés clases reservadas" text="Elegí un horario y lo dejamos agendado con recordatorio." action={<Btn size="sm" onClick={() => app.replace("clases", { sub: "explorar" })}>Ver la grilla</Btn>} />}
        {prox.map(({ r, c }) => {
          const m = minutosHasta(c);
          const pronto = m < 180;
          return (
            <div key={r.id} className="card col" style={{ padding: 14, gap: 12 }}>
              <button className="btn-reset row g12" onClick={() => app.go("detalle", { id: c.id })} style={{ width: "100%" }}>
                <DateBox d={c.fecha === hoy() ? "Hoy" : DIAS[weekday(parseYmd(c.fecha))]} h={c.hora} tone={toneOf(c)} />
                <div className="col grow" style={{ gap: 2 }}>
                  <span className="h3" style={{ fontSize: 15 }}>{c.nombre}</span>
                  <span className="xs muted">{fmtFecha(c.fecha)} · {PROFES[c.profe].nombre}</span>
                  {pronto && <span className="xs b" style={{ color: "var(--sage-800)" }}>Empieza en {m < 60 ? `${Math.max(1, Math.round(m))} min` : `${Math.round(m / 60)} h`}</span>}
                </div>
                <Icon name="next" color="var(--gris-2)" />
              </button>
              <div className="hr" />
              <div className="row between g8">
                <div className="row g8 small"><Icon name="bell" size={18} color={r.rem ? "var(--sage-800)" : "var(--gris-2)"} /> Recordatorio 1 h antes</div>
                <Switch on={r.rem} onChange={() => app.dispatch({ type: "rem", id: r.id })} label="Recordatorio" />
              </div>
              <div className="row g8">
                <Btn kind="neutral" size="sm" className="grow" onClick={() => descargarICS(c)}><Icon name="calplus" size={18} /> Calendario</Btn>
                <Btn kind="neutral" size="sm" className="grow" onClick={() => setCancelando(c.id)}>Cancelar</Btn>
              </div>
            </div>
          );
        })}
        {prox.length > 0 && <span className="xs muted">Cancelación sin costo hasta 2 horas antes. Después, la clase se descuenta igual del pack.</span>}
      </div>

      {st.espera.length > 0 && (
        <div className="col g10">
          <h2 className="display h2">Lista de espera</h2>
          {st.espera.map((id) => { const c = app.clase(id); if (!c) return null; const liberado = (st.liberados || []).includes(id); return (
            <div key={id} className={"card p row g12" + (liberado ? "" : " soft")} style={liberado ? { border: "2px solid var(--sage-700)" } : undefined}>
              <DateBox d={DIAS[weekday(parseYmd(c.fecha))]} h={c.hora} tone={liberado ? "" : "sand"} />
              <div className="col grow" style={{ gap: 2 }}>
                <span className="h3" style={{ fontSize: 15 }}>{c.nombre}</span>
                <span className="xs" style={{ color: liberado ? "var(--sage-800)" : "var(--gris)", fontWeight: liberado ? 600 : 400 }}>{liberado ? "¡Se liberó un lugar! Tenés 15 min." : "Te avisamos si se libera un lugar"}</span>
              </div>
              {liberado ? <Btn size="xs" onClick={() => app.go("detalle", { id })}>Tomar</Btn> : <button className="link small" onClick={() => { app.dispatch({ type: "espera", id }); app.toast("Saliste de la lista de espera."); }}>Salir</button>}
            </div>
          ); })}
        </div>
      )}

      <div className="col g10">
        <h2 className="display h2">Historial</h2>
        {historial.length === 0 ? <span className="small muted">Acá van a aparecer las clases que ya tomaste.</span> : (
          <div className="card list">
            {historial.slice(0, 6).map((h, i) => (
              <div key={i} className="item">
                <span className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}><Icon name="check" size={16} stroke={2.4} /></span>
                <div className="col grow" style={{ gap: 1 }}><span className="small b">{TYPES[h.tipo].nombre}</span><span className="xs muted">{fmtFecha(h.fecha)} · {h.hora}</span></div>
                <button className="icon-btn" aria-label="Reservar de nuevo" onClick={() => { const next = app.clases.find((c) => c.tipo === h.tipo && !esPasada(c) && app.libres(c) > 0 && !app.esMia(c.id)); if (next) app.go("detalle", { id: next.id }); else app.toast("No hay próximos horarios con lugar."); }}><Icon name="refresh" size={20} color="var(--gris)" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="card soft p row g12">
          <span className="display" style={{ fontSize: 30, color: "var(--sage-800)" }}>{historial.length}</span>
          <div className="col"><span className="small b">{historial.length === 1 ? "clase tomada" : "clases tomadas"} en Loft</span><span className="xs muted">Socia desde {st.user?.desde}</span></div>
        </div>
      </div>

      <Sheet open={!!cancelando} onClose={() => setCancelando(null)} title="¿Cancelar la reserva?">
        {target && <>
          <p className="small muted" style={{ margin: 0 }}>{target.nombre} · {fmtFecha(target.fecha)} {target.hora}.{tarde ? " Faltan menos de 2 horas: la clase se descuenta igual del pack." : " Te devolvemos la clase al pack."}</p>
          <Btn kind="danger" onClick={() => { app.cancelar(cancelando, tarde); setCancelando(null); }}>{tarde ? "Cancelar igual" : "Sí, cancelar"}</Btn>
          <Btn kind="neutral" onClick={() => setCancelando(null)}>Mantener mi lugar</Btn>
        </>}
      </Sheet>
    </>
  );
}

/* ---------- Detalle de clase ---------- */
export function Detalle({ app, params }) {
  const c = app.clase(params.id);
  const { st } = app;
  if (!c) return <div className="screen"><TopBar onBack={app.back} title="Clase" /><div className="pad"><Empty title="No encontramos esta clase" action={<Btn size="sm" onClick={() => app.tab("clases")}>Ver la grilla</Btn>} /></div></div>;
  const mia = app.esMia(c.id);
  const enEspera = st.espera.includes(c.id);
  const liberado = (st.liberados || []).includes(c.id);
  const libres = app.libres(c);
  const llena = libres <= 0 && !mia;
  const pasada = esPasada(c);
  const pack = app.packActivo;
  const packSirve = pack && pack.left > 0 && (!pack.soloYoga || esYoga(c));
  const suelta = PACKS[0];
  const [pago, setPago] = useState(packSirve ? "pack" : "tarjeta");
  const [sheet, setSheet] = useState(null); // 'confirmar' | 'ok'
  const [cargando, setCargando] = useState(false);
  const prof = PROFES[c.profe];
  const d = parseYmd(c.fecha);
  const ocup = CUPO - Math.max(libres, 0);
  const fav = st.favs.includes(c.tipo);
  const tone = TYPES[c.tipo].color;
  const headBg = tone === "clay" ? "var(--rosa-50)" : tone === "sand" ? "var(--arena)" : "var(--sage-50)";
  const headInk = tone === "clay" ? "#9a5a5e" : tone === "sand" ? "var(--ink-2)" : "var(--sage-800)";
  const otras = app.clases.filter((x) => x.tipo === c.tipo && x.id !== c.id && !esPasada(x) && app.libres(x) > 0).slice(0, 3);

  const reservar = () => {
    setCargando(true);
    setTimeout(() => { app.dispatch({ type: "reservar", clase: c, pago: pago === "pack" ? "pack" : "suelta" }); setCargando(false); setSheet("ok"); }, 900);
  };
  const share = async () => { const r = await compartir(`${c.nombre} en LoftStudio`, `${fmtFecha(c.fecha, true)} a las ${c.hora} · ${STUDIO.direccion}, ${STUDIO.barrio}. ¿Venís?`); app.toast(r === "copied" ? "Copiado para compartir." : r ? "Compartido." : "No se pudo compartir."); };

  const footer = pasada ? <Btn kind="neutral" onClick={app.back}>Esta clase ya pasó</Btn>
    : mia ? <><div className="row center g6 small b" style={{ color: "var(--sage-800)" }}><Icon name="check" size={18} stroke={2.4} /> Tenés tu lugar en esta clase</div>{minutosHasta(c) < 45 && minutosHasta(c) > -60 && <Btn onClick={() => app.tab("inicio")}><Icon name="spark" size={18} /> Hacer check-in desde Inicio</Btn>}<div className="row g8"><Btn kind="neutral" size="sm" className="grow" onClick={() => descargarICS(c)}><Icon name="calplus" size={18} /> Agendar</Btn><Btn kind="neutral" size="sm" className="grow" onClick={share}><Icon name="share" size={18} /> Invitar</Btn></div><Btn kind="ghost" onClick={() => app.reset("clases", { sub: "reservas" })}>Ver mis reservas</Btn></>
    : llena && !liberado ? <>{enEspera ? <Btn kind="neutral" onClick={() => { app.dispatch({ type: "espera", id: c.id }); app.toast("Saliste de la lista de espera."); }}>Salir de la lista de espera</Btn> : <Btn onClick={() => app.anotarEspera(c)}><Icon name="bell" size={18} /> Anotarme en la lista de espera</Btn>}<Btn kind="ghost" onClick={() => app.reset("clases", { sub: "explorar", fecha: c.fecha })}>Ver otros horarios</Btn></>
    : <><Btn onClick={() => setSheet("confirmar")} disabled={cargando}>{pago === "pack" ? "Reservar con mi pack" : `Reservar · clase suelta ${fmt(suelta.tarjeta)}`}</Btn><span className="xs muted tc">Cancelación sin costo hasta 2 horas antes de la clase.</span></>;

  return (
    <div className="screen">
      <TopBar onBack={app.back} right={<><button className="icon-btn" aria-label="Compartir" onClick={share}><Icon name="share" /></button><button className="icon-btn" aria-pressed={fav} aria-label={fav ? "Quitar de favoritas" : "Marcar favorita"} onClick={() => { app.dispatch({ type: "fav", id: c.tipo }); app.toast(fav ? "Quitada de tus favoritas." : "Guardada en favoritas. La vas a ver primero en Inicio."); }}><Icon name="heart" fill={fav ? "var(--sage-700)" : "none"} color={fav ? "var(--sage-700)" : "currentColor"} /></button></>} />
      <div className="scroll"><div className="pad" style={{ paddingTop: 0 }}>
        <div className="col g14" style={{ background: headBg, borderRadius: 22, padding: 20 }}>
          <div className="row g6 wrap"><Tag tone="white">{c.nivel}</Tag><Tag tone="white">{c.dur} min</Tag><Tag tone="white">Presencial</Tag>{liberado && <Tag tone="alert">Lugar liberado para vos</Tag>}</div>
          <h1 className="display h1" style={{ fontSize: 30 }}>{c.nombreLargo || c.nombre}</h1>
          <div className="col g8 small">
            <span className="row g8"><Icon name="clock" size={18} color={headInk} />{c.fecha === hoy() ? "Hoy" : fmtFecha(c.fecha, true)} · {c.hora} a {sumar(c.hora, c.dur)}</span>
            <a className="row g8" href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}><Icon name="pin" size={18} color={headInk} />{STUDIO.direccion}, {STUDIO.barrio} <span className="xs b" style={{ color: headInk, textDecoration: "underline" }}>Cómo llegar</span></a>
          </div>
        </div>

        <div className="col g8">
          <div className="row between" style={{ alignItems: "baseline" }}>
            <h2 className="display h2">Lugares</h2>
            <span className="small b" style={{ color: llena ? "var(--rojo)" : "var(--ink)" }}>{llena ? `Completa · ${CUPO} de ${CUPO}` : `${libres} ${libres === 1 ? "libre" : "libres"} de ${CUPO}`}</span>
          </div>
          <div className="bar"><div style={{ width: `${(ocup / CUPO) * 100}%`, background: llena ? "var(--rojo)" : undefined }} /></div>
          <div className="row g6" aria-hidden="true">{Array.from({ length: CUPO }).map((_, i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 11, background: i < ocup ? (i === ocup - 1 && mia ? "var(--sage-700)" : "var(--sage-100)") : "#fff", border: "1.5px solid var(--linea)", display: "flex", alignItems: "center", justifyContent: "center" }}>{i === ocup - 1 && mia && <Icon name="check" size={12} stroke={3} color="#fff" />}</span>)}</div>
          {llena && !mia && <div className="card p row g12" style={{ marginTop: 4 }}><Avatar rosa><Icon name="bell" size={20} /></Avatar><div className="col" style={{ gap: 2 }}><span className="small b">{enEspera ? "Estás en la lista de espera" : "Te avisamos si se libera un lugar"}</span><span className="xs muted">Notificación en la app y mail. Tenés 15 minutos para tomarlo.</span></div></div>}
        </div>

        <div className="col g8"><h2 className="display h2">Sobre la clase</h2><p style={{ margin: 0, lineHeight: 1.55, color: "var(--ink-2)" }}>{c.desc}</p></div>
        <div className="card soft p row g12"><Icon name="info" color="var(--sage-800)" /><div className="col" style={{ gap: 2 }}><span className="small b">Qué traer</span><span className="xs muted">{c.traer}</span></div></div>

        <div className="card p row g12">
          <Avatar>{prof.ini}</Avatar>
          <div className="col grow" style={{ gap: 2 }}>
            <Eyebrow>Tu profe</Eyebrow>
            <span className="h3" style={{ fontSize: 15 }}>{prof.nombre}</span>
            <span className="xs muted">{prof.rol}</span>
          </div>
          {prof.ig && <a className="icon-btn" href={`https://www.instagram.com/${prof.ig}/`} target="_blank" rel="noreferrer" aria-label="Instagram de la profe"><Icon name="ig" color="var(--gris)" /></a>}
        </div>

        {!mia && !llena && !pasada && (
          <div className="col g10">
            <h2 className="display h2">Cómo querés pagar</h2>
            <Radio on={pago === "pack"} disabled={!packSirve} onClick={() => setPago("pack")} title={pack ? `Con mi ${pack.nombre}` : "Con un pack"} sub={!pack ? "No tenés un pack activo" : pack.left <= 0 ? "Ya no te quedan clases en este pack" : pack.soloYoga && !esYoga(c) ? "Tu Pack YOGA no incluye Barre" : `Te quedan ${pack.left} ${pack.left === 1 ? "clase" : "clases"} · vence el ${fmtFecha(pack.vence)}${pack.pendiente ? " · pago pendiente" : ""}`} right={packSirve ? "Incluida" : undefined} />
            <Radio on={pago === "tarjeta"} onClick={() => setPago("tarjeta")} title="Clase suelta con tarjeta" sub="Pagás en la app, sin mandar comprobantes" right={fmt(suelta.tarjeta)} />
            {!packSirve && <button className="link small" style={{ alignSelf: "flex-start" }} onClick={() => app.go("packs")}>Ver packs · desde {fmt(PACKS[1].efectivo)} las 4 clases</button>}
          </div>
        )}

        {otras.length > 0 && (
          <div className="col g10">
            <h2 className="display h2">Otros horarios de {c.nombre}</h2>
            {otras.map((o) => <ClaseRow key={o.id} c={o} app={app} onClick={() => app.replace("detalle", { id: o.id })} />)}
          </div>
        )}
      </div></div>
      <div className="footer">{footer}</div>

      <Sheet open={sheet === "confirmar"} onClose={() => setSheet(null)} title="Confirmar reserva">
        <div className="card p col g10">
          <div className="row g12"><DateBox d={DIAS[weekday(d)]} h={c.hora} tone={toneOf(c)} /><div className="col grow" style={{ gap: 2 }}><span className="h3">{c.nombre}</span><span className="xs muted">{fmtFecha(c.fecha, true)} · {prof.nombre}</span></div></div>
          <div className="hr" />
          <div className="row between small"><span className="muted">Pago</span><span className="b">{pago === "pack" ? `${pack.nombre} · queda${pack.left - 1 === 1 ? "" : "n"} ${pack.left - 1}` : `Clase suelta · ${fmt(suelta.tarjeta)}`}</span></div>
          <div className="row between small"><span className="muted">Recordatorio</span><span className="b">{st.ajustes.recordatorios ? "1 hora antes" : "Desactivado"}</span></div>
        </div>
        <Btn onClick={reservar} disabled={cargando}>{cargando ? <span className="spin" /> : "Confirmar"}</Btn>
        <Btn kind="ghost" onClick={() => setSheet(null)}>Volver</Btn>
      </Sheet>

      <Sheet open={sheet === "ok"} onClose={() => setSheet(null)}>
        <div className="col center g12 tc" style={{ padding: "8px 0" }}>
          <span className="check-anim" style={{ width: 76, height: 76, borderRadius: 38, background: "var(--sage-700)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={34} stroke={2.8} color="#fff" /></span>
          <h2 className="display h1" style={{ fontSize: 22 }}>¡Lugar confirmado!</h2>
          <p className="small muted" style={{ margin: 0 }}>{c.nombre} · {fmtFecha(c.fecha)} a las {c.hora}. Te mandamos la confirmación por mail{st.ajustes.recordatorios ? " y te recordamos 1 hora antes." : "."}</p>
        </div>
        <div className="row g8"><Btn kind="neutral" size="sm" className="grow" onClick={() => descargarICS(c)}><Icon name="calplus" size={18} /> Agendar</Btn><Btn kind="neutral" size="sm" className="grow" onClick={share}><Icon name="share" size={18} /> Invitar</Btn></div>
        <Btn onClick={() => { setSheet(null); app.reset("clases", { sub: "reservas" }); }}>Ver mis reservas</Btn>
      </Sheet>
    </div>
  );
}
function sumar(hora, min) { const [h, m] = hora.split(":").map(Number); const t = h * 60 + m + min; return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; }

/* ---------- Packs ---------- */
export function Packs({ app }) {
  const [pago, setPago] = useState("transf");
  const [sel, setSel] = useState(null);
  const pack = app.packActivo;
  const cols = [["efectivo", "Efectivo"], ["transf", "Transferencia"], ["tarjeta", "Tarjeta"]];
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Packs & precios" />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        {pack && pack.left > 0 && pack.vence >= hoy() && <div className="card sage p col g6"><Eyebrow style={{ color: "#dfe5db" }}>Tu pack actual</Eyebrow><span className="h3" style={{ color: "#fff" }}>{pack.nombre} · te quedan {pack.left}</span><span className="xs muted">Vence el {fmtFecha(pack.vence)}. Si comprás otro ahora, se activa cuando termines este.</span></div>}
        <PackSugerido app={app} />
        <div className="col g8">
          <span className="small b">¿Cómo vas a pagar?</span>
          <div className="segmented">{cols.map(([k, l]) => <button key={k} aria-current={pago === k ? "page" : undefined} onClick={() => setPago(k)}>{l}</button>)}</div>
          <span className="xs muted">{pago === "tarjeta" ? "El pago se hace automático desde la app." : pago === "transf" ? `Transferís al alias ${STUDIO.alias} y subís el comprobante acá, sin WhatsApp.` : "Reservás el pack y lo abonás en el estudio."}</span>
        </div>
        <div className="col g10">
          {PACKS.map((p) => {
            const porClase = p[pago] / p.clases;
            return (
              <button key={p.id} className="card tap btn-reset row g12" style={{ width: "100%", padding: 14, border: p.destacado ? "2px solid var(--sage-700)" : "2px solid transparent" }} onClick={() => setSel(p)}>
                <div className="col grow" style={{ gap: 3 }}>
                  <div className="row g8"><span className="h3" style={{ fontSize: 15 }}>{p.nombre}</span>{p.destacado && <Tag>Más elegido</Tag>}{p.soloYoga && <Tag tone="clay">Solo yoga</Tag>}</div>
                  <span className="xs muted">{p.clases === 1 ? "Para probar o sumar una clase" : `${p.clases} clases · ${fmt(porClase)} por clase · 30 días`}</span>
                </div>
                <div className="col none" style={{ alignItems: "flex-end" }}><span className="display" style={{ fontSize: 18 }}>{fmt(p[pago])}</span><Icon name="next" size={16} color="var(--gris-2)" /></div>
              </button>
            );
          })}
        </div>
        <div className="card soft p col g6"><span className="small b">Política de packs</span><span className="xs muted">{STUDIO.politicaPack}</span></div>
      </div></div>
      <Sheet open={!!sel} onClose={() => setSel(null)} title={sel?.nombre}>
        {sel && <PackCheckout app={app} p={sel} pago={pago} onClose={() => setSel(null)} />}
      </Sheet>
    </div>
  );
}
function PackCheckout({ app, p, pago, onClose }) {
  const [paso, setPaso] = useState(0); // 0 resumen · 1 pagando (sim) · 2 listo
  const [res, setRes] = useState(null);
  const precio = p[pago];
  const confirmar = () => { if (pago === "efectivo") { app.dispatch({ type: "comprarPack", id: p.id, pago }); setPaso(2); } else setPaso(1); };
  const pack = app.st.packQueue || app.st.pack;
  if (paso === 1) return <PagoSim metodo={pago} monto={precio} concepto={`${p.nombre} · LoftStudio`} onClose={() => setPaso(0)} onDone={(r) => { app.dispatch({ type: "comprarPack", id: p.id, pago, comprobante: r.comprobante }); setRes(r); setPaso(2); }} />;
  if (paso === 2) return (
    <>
      <div className="col center g10 tc"><span className="check-anim row center" style={{ width: 68, height: 68, borderRadius: 34, background: pago === "efectivo" ? "var(--rosa)" : "var(--sage-700)" }}><Icon name={pago === "efectivo" ? "store" : "check"} size={30} stroke={2.6} color="#fff" /></span><span className="h3">{pago === "efectivo" ? "Pack reservado" : "¡Pack activado!"}</span><span className="small muted">{pago === "efectivo" ? `Lo abonás en efectivo cuando venís a Loft. Mientras tanto ya podés reservar tu primera clase.` : `${p.clases} ${p.clases === 1 ? "clase" : "clases"} por 30 días.${res ? ` Comprobante N° ${res.comprobante} guardado en la app.` : ""}`}</span></div>
      {pago === "efectivo" && pack?.codigo && <CodigoEfectivo codigo={pack.codigo} monto={precio} vence={fmtFecha(pack.vence > hoy() ? ymdMas(2) : pack.vence)} />}
      <Btn onClick={() => { onClose(); app.reset("clases"); }}>Reservar una clase</Btn>
      <Btn kind="ghost" onClick={onClose}>Listo</Btn>
    </>
  );
  return (
    <>
      <div className="card p col g10">
        <div className="row between small"><span className="muted">Pack</span><span className="b">{p.nombre}</span></div>
        <div className="row between small"><span className="muted">Vigencia</span><span className="b">30 días desde hoy</span></div>
        <div className="row between small"><span className="muted">Medio de pago</span><span className="b">{{ efectivo: "Efectivo en el estudio", transf: `Transferencia · alias ${STUDIO.alias}`, tarjeta: "Tarjeta de crédito o débito" }[pago]}</span></div>
        <div className="hr" />
        <div className="row between" style={{ alignItems: "baseline" }}><span className="b">Total</span><span className="display" style={{ fontSize: 22 }}>{fmt(precio)}</span></div>
      </div>
      <div className="card soft p row g12"><Icon name={pago === "efectivo" ? "store" : "card"} color="var(--sage-800)" /><span className="xs" style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>{pago === "transf" ? "Te llevamos a tu banco con los datos ya cargados y volvés a Loft con el comprobante guardado. Sin WhatsApp." : pago === "tarjeta" ? "Pagás en un formulario seguro. El pack se activa al instante." : "Reservamos el pack y te damos un código para pagar en recepción. Tenés 48 h."}</span></div>
      <Btn onClick={confirmar}>{pago === "transf" ? "Ir a transferir" : pago === "tarjeta" ? `Pagar ${fmt(precio)}` : "Reservar y pagar en Loft"}</Btn>
      <Btn kind="ghost" onClick={onClose}>Volver</Btn>
    </>
  );
}
function ymdMas(n) { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function AliasBox({ app }) {
  return (
    <div className="card soft p row between g10">
      <div className="col" style={{ gap: 2 }}><span className="xs muted">Alias de Mercado Pago</span><span className="display" style={{ fontSize: 18, textTransform: "none", letterSpacing: 0 }}>{STUDIO.alias}</span></div>
      <Btn kind="neutral" size="xs" onClick={async () => app.toast((await copiar(STUDIO.alias)) ? "Alias copiado." : "No se pudo copiar.")}><Icon name="copy" size={16} /> Copiar</Btn>
    </div>
  );
}

/* ---------- Eventos ---------- */
export function Eventos({ app }) {
  const { st } = app;
  const [sel, setSel] = useState(null);
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Encuentros & eventos" />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        <p className="small muted" style={{ margin: 0 }}>Además de las clases, en Loft armamos encuentros para compartir entre todas. Reservás tu lugar desde acá, sin DM.</p>
        {EVENTOS.map((e) => {
          const est = st.eventos[e.id];
          const agotado = e.lugares === 0 && !e.listaEspera;
          return (
            <button key={e.id} className="hero btn-reset tap" style={{ width: "100%", minHeight: 230 }} onClick={() => setSel(e)}>
              <Photo name={e.img} alt="" cover h="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
              <div className="shade" />
              <div className="txt" style={{ width: "100%" }}>
                <div className="row g6"><Tag tone="white">{e.tag}</Tag>{est && <Tag>{est === "inscripta" ? "Tu lugar está reservado" : "En lista de espera"}</Tag>}</div>
                <span className="display h2" style={{ fontSize: 20 }}>{e.titulo}</span>
                <span className="small" style={{ color: "#e8ece5" }}>{e.fecha} · {e.hora} · {e.dur}</span>
                <span className="xs b" style={{ color: "#fff" }}>{e.listaEspera ? "Próximamente · anotate para enterarte primero" : agotado ? "Sin lugares" : `${e.lugares} lugares · ${fmt(e.precio)}`}</span>
              </div>
            </button>
          );
        })}
        <div className="card soft p col g8">
          <span className="h3" style={{ fontSize: 15 }}>¿Querés alquilar el Loft?</span>
          <span className="xs muted">El estudio se alquila para talleres y encuentros (yoga, constelaciones, charlas). Escribinos y lo coordinamos.</span>
          <a className="btn neutral sm" href={STUDIO.whatsapp} target="_blank" rel="noreferrer" style={{ alignSelf: "flex-start" }}><Icon name="wa" size={18} /> Consultar por WhatsApp</a>
        </div>
      </div></div>
      <Sheet open={!!sel} onClose={() => setSel(null)}>
        {sel && <EventoSheet app={app} e={sel} onClose={() => setSel(null)} />}
      </Sheet>
    </div>
  );
}
function EventoSheet({ app, e, onClose }) {
  const est = app.st.eventos[e.id];
  const [cargando, setCargando] = useState(false);
  const act = (modo) => { setCargando(true); setTimeout(() => { app.dispatch({ type: "evento", id: e.id, modo, titulo: e.titulo }); setCargando(false); app.toast(est ? "Listo, cancelamos tu lugar." : modo === "inscripta" ? "¡Tu lugar está reservado! Te mandamos los detalles por mail." : "Te avisamos apenas abramos la inscripción."); onClose(); }, 800); };
  return (
    <>
      <Photo name={e.img} alt="" cover h={160} radius={18} />
      <div className="col g6"><Tag>{e.tag}</Tag><h2 className="display h2" style={{ fontSize: 21 }}>{e.titulo}</h2><span className="small muted">{e.fecha} · {e.hora} · {e.dur}</span></div>
      <p className="small" style={{ margin: 0, lineHeight: 1.55, color: "var(--ink-2)" }}>{e.desc}</p>
      <div className="card p row between small"><span className="muted">{e.listaEspera ? "Inscripción" : "Lugares"}</span><span className="b">{e.listaEspera ? "Próximamente" : `${e.lugares} disponibles`}</span></div>
      {!e.listaEspera && <div className="card p row between small"><span className="muted">Valor</span><span className="display" style={{ fontSize: 18 }}>{fmt(e.precio)}</span></div>}
      {est ? <Btn kind="danger" onClick={() => act(est)} disabled={cargando}>{est === "inscripta" ? "Cancelar mi lugar" : "Salir de la lista"}</Btn>
        : <Btn onClick={() => act(e.listaEspera ? "espera" : "inscripta")} disabled={cargando}>{cargando ? <span className="spin" /> : e.listaEspera ? "Avisarme cuando abra" : `Reservar mi lugar · ${fmt(e.precio)}`}</Btn>}
      <Btn kind="ghost" onClick={onClose}>Cerrar</Btn>
    </>
  );
}
