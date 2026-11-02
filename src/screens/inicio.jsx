import React, { useState } from "react";
import { Avatar, Bar, Btn, DateBox, Empty, Eyebrow, Field, Icon, Logo, Photo, Sheet, Stars, Switch, Tag, TopBar } from "../ui.jsx";
import { DIAS, EVENTOS, NOVEDADES, PACKS, PROFES, STUDIO, TYPES } from "../data.js";
import { esPasada, fmt, fmtFecha, hoy, minutosHasta, parseYmd, weekday } from "../store.js";
import { descargarICS, igUrl, inicial, mapsUrl, primerNombre, telUrl, tiempoRel, waUrl } from "../utils.js";
import { ClaseRow } from "./clases.jsx";
import { CheckIn, Invitar, MiPractica, Onboarding } from "./extras.jsx";
import { CodigoEfectivo } from "./pago.jsx";

const saludo = () => { const h = new Date().getHours(); return h < 12 ? "Buen día" : h < 19 ? "Buenas tardes" : "Buenas noches"; };

/* ---------- Inicio ---------- */
export function Inicio({ app }) {
  const { st } = app;
  const prox = app.proximas[0];
  const pack = app.packActivo;
  const sinLeer = st.notifs.filter((n) => !n.leida).length;
  const recos = app.clases.filter((c) => !esPasada(c) && !app.esMia(c.id) && app.libres(c) > 0)
    .sort((a, b) => (st.favs.includes(b.tipo) - st.favs.includes(a.tipo)) || (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .filter((c, i, arr) => arr.findIndex((x) => x.tipo === c.tipo) === i).slice(0, 3);
  const ev = EVENTOS.find((e) => !st.eventos[e.id]) || EVENTOS[0];
  const diasPack = pack ? Math.round((parseYmd(pack.vence) - new Date()) / 86400000) : 0;
  const vencido = pack && (pack.vence < hoy() || pack.left <= 0);
  const m = prox && minutosHasta(prox.c);
  const [qr, setQr] = useState(false);
  const checkinOk = prox && app.st.checkins.includes(prox.c.id);
  return (
    <div className="screen">
      {!st.onboarded && <Onboarding app={app} />}
      {qr && prox && <CheckIn app={app} prox={prox} onClose={() => setQr(false)} />}
      <div className="scroll"><div className="pad" style={{ paddingTop: 10 }}>
        <div className="row between" style={{ minHeight: 40 }}>
          <Logo h={28} />
          <div className="row g4">
            <button className="icon-btn" aria-label={`Notificaciones${sinLeer ? `, ${sinLeer} sin leer` : ""}`} onClick={() => app.go("notifs")}><Icon name="bell" />{sinLeer > 0 && <span className="badge dot" />}</button>
            <button className="icon-btn" aria-label="Mi perfil" onClick={() => app.tab("perfil")}>{st.user?.foto ? <img src={st.user.foto} alt="" style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover" }} /> : <Avatar>{inicial(st.user?.nombre)}</Avatar>}</button>
          </div>
        </div>

        <div className="col g4">
          <span className="small muted">{saludo()}, {primerNombre(st.user?.nombre)}</span>
          <h1 className="display h1">{prox && m < 180 ? "Hoy tenés clase" : "¿Lista para moverte?"}</h1>
        </div>

        {prox ? (
          <div className="card col" style={{ padding: 18, gap: 14 }}>
            <div className="row between"><Eyebrow>Tu próxima clase</Eyebrow>{m < 180 && <Tag>{m < 60 ? `En ${Math.max(1, Math.round(m))} min` : `En ${Math.round(m / 60)} h`}</Tag>}</div>
            <button className="btn-reset row g14" style={{ width: "100%" }} onClick={() => app.go("detalle", { id: prox.c.id })}>
              <DateBox d={prox.c.fecha === hoy() ? "Hoy" : DIAS[weekday(parseYmd(prox.c.fecha))]} h={prox.c.hora} tone={TYPES[prox.c.tipo].color === "clay" ? "clay" : ""} />
              <div className="col grow" style={{ gap: 3 }}>
                <span className="display" style={{ fontSize: 19, letterSpacing: 0 }}>{prox.c.nombre}</span>
                <span className="small muted">{PROFES[prox.c.profe].nombre} · {prox.c.dur} min</span>
                <span className="row g6 xs muted"><Icon name="pin" size={13} />{STUDIO.direccion}, {STUDIO.barrio}</span>
              </div>
              <Icon name="next" color="var(--gris-2)" />
            </button>
            <div className="hr" />
            <div className="row between g12">
              <span className="row g10 small"><Icon name="bell" size={19} color={prox.r.rem ? "var(--sage-800)" : "var(--gris-2)"} />Recordarme 1 hora antes</span>
              <Switch on={prox.r.rem} onChange={() => app.dispatch({ type: "rem", id: prox.r.id })} label="Recordatorio" />
            </div>
            {m < 45 && m > -60 ? (
              <Btn kind={checkinOk ? "neutral" : "primary"} onClick={() => setQr(true)}>{checkinOk ? <><Icon name="check" size={18} stroke={2.4} /> Check-in hecho</> : <><Icon name="spark" size={18} /> Hacer check-in</>}</Btn>
            ) : (
              <div className="row g8">
                <Btn kind="neutral" size="sm" className="grow" onClick={() => descargarICS(prox.c)}><Icon name="calplus" size={18} /> Agendar</Btn>
                <a className="btn neutral sm grow" href={mapsUrl} target="_blank" rel="noreferrer"><Icon name="map" size={18} /> Mapa</a>
              </div>
            )}
          </div>
        ) : (
          <div className="card col" style={{ padding: 18, gap: 12 }}>
            <Eyebrow>Tu próxima clase</Eyebrow>
            <span className="display" style={{ fontSize: 19, letterSpacing: 0 }}>Todavía no reservaste ninguna</span>
            <span className="small muted">Elegí un horario y lo dejamos agendado con recordatorio.</span>
            <Btn onClick={() => app.tab("clases")}>Reservar una clase</Btn>
          </div>
        )}

        <button className={"card tap btn-reset p row g12" + (vencido ? "" : " soft")} style={vencido ? { border: "1.5px solid var(--rosa)" } : undefined} onClick={() => app.go("packs")}>
          <div className="col grow g6">
            <div className="row between"><Eyebrow>Mi pack</Eyebrow>{pack && !vencido && <span className="xs b" style={{ color: diasPack <= 7 ? "var(--rojo)" : "var(--gris)" }}>{diasPack <= 0 ? "Vence hoy" : `Vence en ${diasPack} días`}</span>}</div>
            {pack ? <>
              <span className="small b">{pack.nombre} · te queda{pack.left === 1 ? "" : "n"} {pack.left}</span>
              <Bar v={(pack.left / pack.total) * 100} />
              <span className="xs" style={{ color: vencido || pack.pendiente ? "var(--rojo)" : "var(--gris)" }}>{vencido ? "Sin clases disponibles. Tocá para renovar." : pack.pendiente ? `Pago pendiente: mostrá el código ${pack.codigo} en recepción.` : st.packQueue ? `Después sigue tu ${st.packQueue.nombre}.` : `Vence el ${fmtFecha(pack.vence)}. Tocá para ver los packs.`}</span>
            </> : <><span className="small b">No tenés un pack activo</span><span className="xs muted">Desde {fmt(PACKS[1].efectivo)} las 4 clases. Tocá para ver los packs.</span></>}
          </div>
          <Icon name="next" color="var(--gris-2)" />
        </button>

        <div className="col g10">
          <div className="row between" style={{ alignItems: "baseline" }}><div className="col"><h2 className="display h2">Para vos esta semana</h2><span className="xs muted">Según tus favoritas y tu historial</span></div><button className="link small" onClick={() => app.tab("clases")}>Ver todo</button></div>
          {recos.length === 0 ? <Empty icon="cal" title="No quedan clases con lugar esta semana" action={<Btn size="sm" onClick={() => app.tab("clases")}>Ver la próxima</Btn>} /> : recos.map((c) => <ClaseRow key={c.id} c={c} app={app} onClick={() => app.go("detalle", { id: c.id })} />)}
        </div>

        <button className="hero btn-reset tap" style={{ width: "100%", minHeight: 210 }} onClick={() => app.go("eventos")}>
          <Photo name={ev.img} alt="" cover h="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
          <div className="shade" />
          <div className="txt" style={{ width: "100%" }}>
            <div className="row g6"><Tag tone="white">{ev.tag}</Tag></div>
            <span className="display h2" style={{ fontSize: 20 }}>{ev.titulo}</span>
            <span className="small" style={{ color: "#e8ece5" }}>{ev.fecha} · {ev.hora}</span>
            <span className="row g6 xs b" style={{ color: "#fff" }}>Ver eventos <Icon name="next" size={14} stroke={2.4} /></span>
          </div>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[["Reservar", "calplus", () => app.tab("clases")], ["Tienda", "bag", () => app.tab("tienda")], ["El estudio", "pin", () => app.go("estudio")]].map(([l, ic, fn]) => (
            <button key={l} className="card tap btn-reset col" style={{ minHeight: 96, padding: 12, justifyContent: "space-between", gap: 8 }} onClick={fn}>
              <span className="avatar" style={{ width: 38, height: 38 }}><Icon name={ic} size={19} /></span><span className="small b">{l}</span>
            </button>
          ))}
        </div>

        <div className="col g10">
          <div className="row between" style={{ alignItems: "baseline" }}><h2 className="display h2">Novedades de Loft</h2><a className="xs b" href={igUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sage-800)" }}>@{STUDIO.instagram}</a></div>
          <div className="scroll-x">
            {NOVEDADES.map((n) => (
              <a key={n.t} href={igUrl} target="_blank" rel="noreferrer" className="card col" style={{ width: 230, textDecoration: "none", color: "inherit", overflow: "hidden" }}>
                <Photo name={n.img} alt="" cover h={130} radius={0} />
                <div className="col g4" style={{ padding: 12 }}>
                  <span className="xs muted">{n.fecha} · ♥ {n.likes}</span>
                  <span className="small b" style={{ lineHeight: 1.3 }}>{n.t}</span>
                  <span className="xs muted" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.s}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <Invitar app={app} />

        <div className="card soft col g10" style={{ padding: 18 }}>
          <Eyebrow>Comunidad Loft</Eyebrow>
          <span className="small" style={{ lineHeight: 1.55, color: "var(--ink-2)" }}>“{STUDIO.testimonios[0].t}”</span>
          <div className="row between"><span className="xs muted">{STUDIO.testimonios[0].n} · <Stars v={5} /></span><a className="xs b" href={igUrl} target="_blank" rel="noreferrer" style={{ color: "var(--sage-800)" }}>@{STUDIO.instagram} ↗</a></div>
        </div>
      </div></div>
    </div>
  );
}

/* ---------- Notificaciones ---------- */
export function Notifs({ app }) {
  const { st } = app;
  const sinLeer = st.notifs.filter((n) => !n.leida).length;
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Avisos" right={sinLeer > 0 && <button className="link small" onClick={() => app.dispatch({ type: "notif.leer", id: "all" })}>Marcar leídos</button>} />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        {st.notifs.length === 0 && <Empty icon="bell" title="Sin avisos por ahora" text="Acá vas a ver confirmaciones, recordatorios y novedades del estudio." />}
        <div className="col g8">
          {st.notifs.map((n) => (
            <button key={n.id} className="card tap btn-reset row g12" style={{ padding: 14, alignItems: "flex-start", borderLeft: n.leida ? "4px solid transparent" : "4px solid var(--sage-700)" }} onClick={() => { app.dispatch({ type: "notif.leer", id: n.id }); if (n.go) app.go(n.go[0], n.go[1] || {}); }}>
              <Avatar rosa={!!n.cta}><Icon name={n.cta ? "spark" : n.t.includes("Pedido") ? "bag" : n.t.includes("Pack") || n.t.includes("pack") ? "card" : "bell"} size={20} /></Avatar>
              <div className="col grow" style={{ gap: 2 }}>
                <span className="small" style={{ fontWeight: n.leida ? 500 : 600 }}>{n.t}</span>
                <span className="xs muted">{n.s}</span>
                <span className="xs" style={{ color: "var(--gris-2)" }}>{tiempoRel(n.fecha)}</span>
              </div>
              {n.cta && <Btn size="xs">{n.cta}</Btn>}
            </button>
          ))}
        </div>
      </div></div>
    </div>
  );
}

/* ---------- Perfil ---------- */
export function Perfil({ app }) {
  const { st } = app;
  const pack = app.packActivo;
  const [edit, setEdit] = useState(false);
  const [salir, setSalir] = useState(false);
  const [f, setF] = useState({ nombre: st.user?.nombre || "", email: st.user?.email || "", tel: st.user?.tel || "" });
  const total = app.pasadas.length;
  const Row = ({ ic, t, s, onClick, href, right }) => {
    const inner = <><span className="avatar" style={{ width: 38, height: 38, background: "var(--arena)", color: "var(--ink-2)" }}><Icon name={ic} size={18} /></span><div className="col grow" style={{ gap: 1 }}><span className="small b">{t}</span>{s && <span className="xs muted">{s}</span>}</div>{right || <Icon name="next" size={18} color="var(--gris-2)" />}</>;
    return href ? <a className="item" href={href} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{inner}</a> : <button className="item" onClick={onClick}>{inner}</button>;
  };
  return (
    <div className="screen">
      <div className="scroll"><div className="pad">
        <div className="row between" style={{ paddingTop: 12 }}><h1 className="display h1">Mi perfil</h1><button className="icon-btn white" aria-label="Editar datos" onClick={() => setEdit(true)}><Icon name="edit" size={20} /></button></div>
        <div className="row g14">
          <label style={{ position: "relative", cursor: "pointer" }} title="Cambiar foto">
            {st.user?.foto ? <img src={st.user.foto} alt="" style={{ width: 64, height: 64, borderRadius: 32, objectFit: "cover", display: "block" }} /> : <Avatar lg>{inicial(st.user?.nombre)}</Avatar>}
            <span className="row center" style={{ position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, background: "var(--sage-700)", color: "#fff", border: "2px solid var(--crema)" }}><Icon name="edit" size={12} stroke={2.2} /></span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); const S = 160; c.width = S; c.height = S; const r = Math.max(S / img.width, S / img.height); const w = img.width * r, h = img.height * r; c.getContext("2d").drawImage(img, (S - w) / 2, (S - h) / 2, w, h); app.dispatch({ type: "avatar", foto: c.toDataURL("image/jpeg", 0.8) }); app.toast("Foto actualizada."); URL.revokeObjectURL(img.src); }; img.src = URL.createObjectURL(f); }} />
          </label>
          <div className="col" style={{ gap: 2 }}><span className="h3" style={{ fontSize: 18 }}>{st.user?.nombre}</span><span className="xs muted">{st.user?.email || "Sin email"}</span><span className="xs muted">Socia desde {st.user?.desde}</span></div>
        </div>
        <div className="row g10">
          {[[total, "clases"], [st.favs.length, "favoritas"], [st.pedidos.length, "pedidos"]].map(([n, l]) => <div key={l} className="card p col center grow" style={{ padding: 12 }}><span className="display" style={{ fontSize: 22, color: "var(--sage-800)" }}>{n}</span><span className="xs muted">{l}</span></div>)}
        </div>

        <div className="card dark col g12" style={{ padding: 18 }}>
          <div className="row between"><Eyebrow style={{ color: "#cfd6cb" }}>Mi pack</Eyebrow>{pack && <Tag tone={pack.pendiente ? "clay" : "white"}>{pack.pendiente ? "Pago pendiente en recepción" : "Activo"}</Tag>}</div>
          {pack ? <>
            <div className="col" style={{ gap: 2 }}><span className="display h2" style={{ fontSize: 20, color: "#fff" }}>{pack.nombre}</span><span className="small muted">Te queda{pack.left === 1 ? "" : "n"} {pack.left} de {pack.total} · vence el {fmtFecha(pack.vence)}</span></div>
            <Bar v={(pack.left / pack.total) * 100} inv />
            {st.packQueue && <span className="xs" style={{ color: "#cfd6cb" }}>Próximo: {st.packQueue.nombre}, se activa al terminar este.</span>}
          </> : <span className="small muted">No tenés un pack activo.</span>}
          {pack?.pendiente && <><CodigoEfectivo codigo={pack.codigo} monto={pack.precio} vence="próximas 48 h" /><Btn kind="light" size="sm" style={{ alignSelf: "flex-start" }} onClick={() => { app.dispatch({ type: "packPagado" }); app.toast("Pago registrado en recepción. ¡Pack activo!"); }}>Simular pago en recepción</Btn></>}
          <div className="row g8"><Btn kind="light" size="sm" onClick={() => app.go("packs")}>{pack ? "Renovar pack" : "Ver packs"}</Btn>{pack && pack.left === 0 && st.packQueue && <Btn kind="light" size="sm" onClick={() => { app.dispatch({ type: "activarQueue" }); app.toast("Pack activado."); }}>Activar el siguiente</Btn>}</div>
        </div>

        <MiPractica app={app} />

        <div className="col g10">
          <h2 className="display h2">Mis favoritas</h2>
          <div className="row g8 wrap">{Object.entries(TYPES).map(([k, t]) => { const on = st.favs.includes(k); return <button key={k} className="pill" aria-pressed={on} onClick={() => app.dispatch({ type: "fav", id: k })}><Icon name="heart" size={15} fill={on ? "currentColor" : "none"} style={{ marginRight: 6 }} />{t.nombre}</button>; })}</div>
          <span className="xs muted">Usamos tus favoritas y tu historial para ordenar las recomendaciones de Inicio.</span>
        </div>

        <div className="col g10">
          <h2 className="display h2">Avisos</h2>
          <div className="card list">
            {[["recordatorios", "Recordatorio 1 h antes de cada clase", "bell"], ["push", "Lugares liberados y novedades", "spark"], ["mail", "Comprobantes y confirmaciones por mail", "mail"]].map(([k, t, ic]) => (
              <div key={k} className="item"><span className="avatar" style={{ width: 38, height: 38, background: "var(--arena)", color: "var(--ink-2)" }}><Icon name={ic} size={18} /></span><span className="grow small">{t}</span><Switch on={st.ajustes[k]} onChange={(v) => app.dispatch({ type: "ajustes", data: { [k]: v } })} label={t} /></div>
            ))}
          </div>
        </div>

        <div className="col g10">
          <h2 className="display h2">Loft</h2>
          <div className="card list">
            <Row ic="pin" t="El estudio" s={`${STUDIO.direccion}, ${STUDIO.barrio}`} onClick={() => app.go("estudio")} />
            <Row ic="bag" t="Mis pedidos y packs" s={st.pedidos.length ? `${st.pedidos.length} ${st.pedidos.length === 1 ? "pedido" : "pedidos"}` : "Todavía no compraste"} onClick={() => app.go("pedidos")} />
            <Row ic="spark" t="Encuentros & eventos" s="Clínica Barre, Encuentros, Loft Reset" onClick={() => app.go("eventos")} />
            <Row ic="info" t="Ayuda y políticas" s="Packs, cancelaciones, qué traer" onClick={() => app.go("ayuda")} />
            <Row ic="wa" t="Escribinos por WhatsApp" s="Lun a vie, 8 a 20 h" href={waUrl} right={<Icon name="share" size={16} color="var(--gris-2)" />} />
            <Row ic="ig" t={`@${STUDIO.instagram}`} s={`${STUDIO.seguidores} seguidoras`} href={igUrl} right={<Icon name="share" size={16} color="var(--gris-2)" />} />
          </div>
        </div>

        <div className="col g10">
          <div className="row g8"><h2 className="display h2">Modo estudio</h2><Tag tone="clay">Demo</Tag></div>
          <button className="card tap btn-reset p row g12 dark" style={{ color: "var(--crema)" }} onClick={() => app.go("panel")}>
            <span className="avatar" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}><Icon name="star" size={20} /></span>
            <div className="col grow" style={{ gap: 2 }}><span className="small b" style={{ color: "#fff" }}>Panel del estudio</span><span className="xs" style={{ color: "#cfd6cb" }}>Ocupación, ingresos, lista de espera y métricas del TP</span></div>
            <Icon name="next" color="#cfd6cb" />
          </button>
        </div>

        <div className="card list">
          <Row ic="out" t="Cerrar sesión" onClick={() => setSalir(true)} right={<span />} />
          <Row ic="refresh" t="Reiniciar demo" s="Vuelve la app al estado inicial" onClick={() => { app.dispatch({ type: "reset" }); app.reset("bienvenida"); }} right={<span />} />
        </div>
        <span className="xs tc" style={{ color: "var(--gris-2)" }}>Prototipo · Gestión de Productos Digitales 2 · UdeSA · Equipo 5</span>
      </div></div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Mis datos">
        <Field label="Nombre y apellido" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <Field label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field label="Celular" type="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} />
        <Btn onClick={() => { app.dispatch({ type: "user", data: f }); setEdit(false); app.toast("Datos actualizados."); }}>Guardar</Btn>
      </Sheet>
      <Sheet open={salir} onClose={() => setSalir(false)} title="¿Cerrar sesión?">
        <p className="small muted" style={{ margin: 0 }}>Tus reservas quedan guardadas en el estudio. Volvés a entrar con tu email.</p>
        <Btn kind="danger" onClick={() => { app.dispatch({ type: "logout" }); app.reset("bienvenida"); }}>Cerrar sesión</Btn>
        <Btn kind="ghost" onClick={() => setSalir(false)}>Quedarme</Btn>
      </Sheet>
    </div>
  );
}

/* ---------- El estudio ---------- */
export function Estudio({ app }) {
  return (
    <div className="screen">
      <TopBar transparent onBack={app.back} />
      <div className="scroll">
        <div style={{ position: "relative", height: 260 }}>
          <Photo name="hero-barre" alt="Clase de Barre en LoftStudio" cover h="100%" radius={0} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(50,58,47,0.85))" }} />
          <div className="col g6" style={{ position: "absolute", left: 20, right: 20, bottom: 18, color: "#fff" }}><Logo h={30} white /><span className="small" style={{ color: "#e8ece5" }}>{STUDIO.descripcion}</span></div>
        </div>
        <div className="pad" style={{ paddingTop: 20 }}>
          <div className="row g10">
            <div className="card p col grow" style={{ padding: 12 }}><span className="display" style={{ fontSize: 20 }}>{STUDIO.rating}</span><span className="xs muted"><Stars v={5} /> · {STUDIO.opiniones} opiniones en Google</span></div>
            <div className="card p col grow" style={{ padding: 12 }}><span className="display" style={{ fontSize: 20 }}>{STUDIO.seguidores}</span><span className="xs muted">seguidoras en Instagram</span></div>
          </div>
          <div className="card list">
            <a className="item" href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}><span className="avatar" style={{ width: 38, height: 38 }}><Icon name="pin" size={18} /></span><div className="col grow" style={{ gap: 1 }}><span className="small b">{STUDIO.direccion}</span><span className="xs muted">{STUDIO.barrio}, Zona Norte · Cómo llegar</span></div><Icon name="map" size={18} color="var(--gris-2)" /></a>
            <div className="item"><span className="avatar" style={{ width: 38, height: 38 }}><Icon name="clock" size={18} /></span><div className="col grow" style={{ gap: 1 }}><span className="small b">Lun a vie 8:00 a 13:00 y 15:30 a 20:00</span><span className="xs muted">Sábados 10:00 a 12:00 · Domingos cerrado</span></div></div>
            <a className="item" href={telUrl} style={{ color: "inherit", textDecoration: "none" }}><span className="avatar" style={{ width: 38, height: 38 }}><Icon name="phone" size={18} /></span><div className="col grow" style={{ gap: 1 }}><span className="small b">{STUDIO.telefono}</span><span className="xs muted">Llamar</span></div></a>
            <a className="item" href={waUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}><span className="avatar" style={{ width: 38, height: 38 }}><Icon name="wa" size={18} /></span><div className="col grow" style={{ gap: 1 }}><span className="small b">WhatsApp</span><span className="xs muted">Consultas y alquiler del Loft</span></div></a>
            <a className="item" href={igUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}><span className="avatar" style={{ width: 38, height: 38 }}><Icon name="ig" size={18} /></span><div className="col grow" style={{ gap: 1 }}><span className="small b">@{STUDIO.instagram}</span><span className="xs muted">{STUDIO.claimIg}</span></div></a>
          </div>
          <div className="card p col g12">
            <div className="row g12"><Avatar>FM</Avatar><div className="col" style={{ gap: 1 }}><span className="h3" style={{ fontSize: 15 }}>{STUDIO.fundadora}</span><span className="xs muted">Creadora de LoftStudio · @{PROFES.flor.ig}</span></div></div>
            <p className="small" style={{ margin: 0, lineHeight: 1.6, color: "var(--ink-2)" }}>“{STUDIO.historia}”</p>
          </div>
          <div className="col g10">
            <h2 className="display h2">Nuestras clases</h2>
            {Object.entries(TYPES).map(([k, t]) => <div key={k} className="card p col g4"><div className="row between"><span className="h3" style={{ fontSize: 15 }}>{t.nombreLargo || t.nombre}</span><Tag tone={t.color === "clay" ? "clay" : t.color === "sand" ? "sand" : ""}>{t.dur} min</Tag></div><span className="xs" style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>{t.desc}</span></div>)}
          </div>
          <div className="col g10">
            <h2 className="display h2">Lo que dicen las alumnas</h2>
            {STUDIO.testimonios.map((t) => <div key={t.n} className="card soft p col g6"><span className="small" style={{ lineHeight: 1.55, color: "var(--ink-2)" }}>“{t.t}”</span><span className="xs b">{t.n} · <Stars v={5} /></span></div>)}
          </div>
          <div className="card p col g8">
            <span className="h3" style={{ fontSize: 15 }}>Alquiler del Loft</span>
            <span className="xs muted">El espacio se alquila para talleres, constelaciones y encuentros. Consultá disponibilidad por WhatsApp.</span>
            <a className="btn neutral sm" href={waUrl} target="_blank" rel="noreferrer" style={{ alignSelf: "flex-start" }}><Icon name="wa" size={18} /> Consultar</a>
          </div>
        </div>
      </div>
    </div>
  );
}
