import React, { useEffect, useRef, useState } from "react";
import { Btn, Empty, Eyebrow, Field, Header, Icon, Option, Photo, Pill, Radio, Sheet, Tag, TopBar } from "../ui.jsx";
import { MATS, MAT_PRICE, PAGOS, PROPS, STUDIO, dimsOf, matById, matKey, matTitle } from "../data.js";
import { fmt, fmtFecha, hoy } from "../store.js";
import { emailOk } from "../utils.js";
import { PagoSim, CodigoEfectivo } from "./pago.jsx";

const CartBtn = ({ app }) => (
  <button className="icon-btn white" aria-label={`Carrito, ${app.cartCount} productos`} onClick={() => app.go("carrito")}><Icon name="cart" />{app.cartCount > 0 && <span className="badge">{app.cartCount}</span>}</button>
);

/* ---------- Tienda ---------- */
export function Tienda({ app }) {
  const [filtro, setFiltro] = useState("all");
  const [q, setQ] = useState("");
  const [buscando, setBuscando] = useState(false);
  const lista = MATS.filter((m) => filtro === "all" || (filtro === "frase" ? m.ed !== "logo" : m.shape === filtro)).filter((m) => !q || (matTitle(m) + " " + m.tag).toLowerCase().includes(q.toLowerCase()));
  const { st } = app;
  return (
    <div className="screen">
      <div className="scroll"><div className="pad">
        <Header title="Tienda" sub="Mats & más" right={<><button className="icon-btn white" aria-label="Buscar" aria-pressed={buscando} onClick={() => setBuscando(!buscando)}><Icon name="search" /></button><CartBtn app={app} /></>} />
        {buscando && <div className="field"><input autoFocus placeholder="Buscar: ovalado, verde, be kind…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar en la tienda" /></div>}

        <div className="hero" style={{ minHeight: 210 }}>
          <Photo name="mats-plantas" alt="" cover h="100%" radius={0} style={{ position: "absolute", inset: 0 }} />
          <div className="shade" />
          <div className="txt">
            <Eyebrow style={{ color: "#dfe5db" }}>Mats Loft</Eyebrow>
            <span className="display h2" style={{ fontSize: 21, maxWidth: 260 }}>No es solo un mat, cambia tu práctica</span>
            <span className="small" style={{ color: "#e8ece5" }}>PU + caucho natural · 5 mm · agarre antideslizante. Los mismos que usamos en el estudio.</span>
          </div>
        </div>

        <div className="col g12">
          <div className="row between" style={{ alignItems: "baseline" }}><h2 className="display h2">Mats de yoga</h2><span className="xs muted">{fmt(MAT_PRICE)} c/u</span></div>
          <div className="chips">{[["all", "Todos"], ["rect", "Rectangular"], ["oval", "Ovalado"], ["frase", "Con frase"]].map(([k, l]) => <Pill key={k} on={filtro === k} onClick={() => setFiltro(k)}>{l}</Pill>)}</div>
          {lista.length === 0 && <Empty icon="search" title="Sin resultados" text="Probá con “ovalado”, “verde” o “be kind”." action={<Btn kind="outline" size="sm" onClick={() => { setQ(""); setFiltro("all"); }}>Ver todos</Btn>} />}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, alignItems: "start" }}>
            {lista.map((m) => (
              <button key={m.id} className="card tap btn-reset col g8" style={{ padding: 10 }} onClick={() => app.go("producto", { id: m.id })}>
                <Photo name={m.img} alt={`${matTitle(m)} ${m.tag}`} h={150} cover={!!m.fit} radius={12} />
                <div className="col" style={{ gap: 2, padding: "0 2px" }}>
                  <span className="small b">{matTitle(m).replace("Yoga Mat ", "")}</span>
                  <span className="xs" style={{ color: m.tag ? "var(--sage-800)" : "var(--gris)", fontWeight: m.tag ? 500 : 400 }}>{m.tag || "liso · PU + caucho"}</span>
                  <span className="xs muted">{dimsOf(m.shape)}</span>
                </div>
                <div className="row between" style={{ padding: "0 2px 2px" }}>
                  <span className="display" style={{ fontSize: 15 }}>{fmt(MAT_PRICE)}</span>
                  <span className="row center" aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 17, background: "var(--sage-700)", color: "#fff" }}><Icon name="plus" size={18} stroke={2.2} /></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card dark p col g10">
          <Eyebrow style={{ color: "#cfd6cb" }}>Loft Online</Eyebrow>
          <span className="display h2" style={{ fontSize: 20, color: "#fff" }}>Entrená en casa con la energía de Loft</span>
          <span className="small muted">Clases de 10 a 50 minutos, pensadas según tu ciclo o tu nivel de energía. Plataforma en preparación.</span>
          <Btn kind="light" size="sm" onClick={() => { app.dispatch({ type: "aviso", id: "online" }); app.toast(st.avisos.includes("online") ? "Aviso cancelado." : "Te avisamos cuando abra Loft Online."); }}>{st.avisos.includes("online") ? <><Icon name="check" size={18} /> Te avisamos</> : "Avisarme cuando abra"}</Btn>
        </div>

        <div className="col g12">
          <div className="row g8 wrap"><h2 className="display h2">Accesorios para tu práctica</h2><Tag tone="clay">Propuesta</Tag></div>
          <p className="xs muted" style={{ margin: 0 }}>Hoy el estudio vende solo mats. Proponemos sumar los accesorios que ya se usan en las clases, con reserva desde la app.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, alignItems: "start" }}>
            {PROPS.map((p) => (
              <div key={p.id} className="card col g8" style={{ padding: 10 }}>
                <Photo name={p.img} alt={p.name} h={150} cover radius={12} bg="var(--arena)" pos={p.crop === "bottom" ? "50% 20%" : p.id === "mancuernas" ? "50% 70%" : undefined} />
                <div className="col" style={{ gap: 2, padding: "0 2px" }}><span className="small b">{p.name}</span><span className="xs muted">{p.sub}</span></div>
                <Btn kind={st.avisos.includes(p.id) ? "neutral" : "outline"} size="xs" style={{ width: "100%", minHeight: 38 }} onClick={() => { app.dispatch({ type: "aviso", id: p.id }); app.toast(st.avisos.includes(p.id) ? "Aviso cancelado." : `Te avisamos cuando ${p.name.toLowerCase()} estén disponibles.`); }}>{st.avisos.includes(p.id) ? <><Icon name="check" size={16} /> Te avisamos</> : "Avisarme"}</Btn>
              </div>
            ))}
          </div>
          <span className="xs" style={{ color: "var(--gris-2)" }}>Precios a definir con el estudio. Fotos de mancuernas y pelota: LoftStudio; medias, bandas y bloques: Unsplash.</span>
        </div>

        {st.pedidos.length > 0 && <button className="card tap btn-reset row g12 p" onClick={() => app.go("pedidos")}><Icon name="bag" color="var(--sage-800)" /><div className="col grow"><span className="small b">Mis pedidos</span><span className="xs muted">{st.pedidos.length} {st.pedidos.length === 1 ? "pedido" : "pedidos"} · último #{st.pedidos[0].num}</span></div><Icon name="next" color="var(--gris-2)" /></button>}
      </div></div>
    </div>
  );
}

/* ---------- Producto ---------- */
export function Producto({ app, params }) {
  const base = matById(params.id) || MATS[1];
  const [shape, setShape] = useState(base.shape);
  const [color, setColor] = useState(base.color);
  const [ed, setEd] = useState(base.ed);
  const e = color === "verde" ? "logo" : ed;
  const m = matById(matKey(shape, color, e));
  const [added, setAdded] = useState(false);
  const sub = color === "verde" ? "Liso · PU + caucho natural 5 mm" : e === "logo" ? "Con logo LoftStudio" : e === "kind" ? "Edición “Be kind to your mind”" : "Edición “Be the energy you want to attract”";
  const spec = (a, b) => <div className="row between g12 small"><span className="muted">{a}</span><span className="b" style={{ textAlign: "right" }}>{b}</span></div>;
  const add = () => { app.dispatch({ type: "cart.add", id: m.id }); setAdded(true); setTimeout(() => setAdded(false), 1800); app.toast("Agregado al carrito."); };
  return (
    <div className="screen">
      <TopBar transparent onBack={app.back} right={<button className="icon-btn white" aria-label={`Carrito, ${app.cartCount} productos`} onClick={() => app.go("carrito")}><Icon name="cart" />{app.cartCount > 0 && <span className="badge">{app.cartCount}</span>}</button>} />
      <div className="scroll">
        <Galeria fotos={[[m.img, `${matTitle(m)} ${m.tag}`, !!m.fit], [m.color === "verde" ? "yoga-mats" : "mats-plantas", "Mats Loft en el estudio", true], ["accesorios-loft", "Mat con accesorios de clase", true]]} />
        <div className="pad" style={{ paddingTop: 20 }}>
          <div className="col g6">
            <Eyebrow>Mats Loft</Eyebrow>
            <h1 className="display h1" style={{ fontSize: 22 }}>{matTitle(m)}</h1>
            <span className="small muted">{sub}</span>
            <span className="display" style={{ fontSize: 24, color: "var(--sage-800)" }}>{fmt(MAT_PRICE)}</span>
          </div>
          <div className="col g8"><span className="eyebrow">Forma</span><div className="row g10"><Option on={shape === "rect"} l="Rectangular" s="183 × 61 cm" onClick={() => setShape("rect")} /><Option on={shape === "oval"} l="Ovalado" s="183 × 68 cm" onClick={() => setShape("oval")} /></div></div>
          <div className="col g8"><span className="eyebrow">Color</span><div className="row g10"><Option on={color === "verde"} l="Verde" s="Liso" onClick={() => setColor("verde")} /><Option on={color === "gris"} l="Gris" s="Con logo o frase" onClick={() => setColor("gris")} /></div></div>
          {color === "gris" && <div className="col g8"><span className="eyebrow">Edición</span><div className="row g8"><Option on={e === "logo"} l="Logo" s="LoftStudio" onClick={() => setEd("logo")} /><Option on={e === "kind"} l="Be kind" s="Frase" onClick={() => setEd("kind")} /><Option on={e === "the"} l="Be the energy" s="Frase" onClick={() => setEd("the")} /></div></div>}
          <div className="card p col g10">{spec("Material", "PU + caucho natural")}<div className="hr" />{spec("Espesor", "5 mm")}<div className="hr" />{spec("Medidas", dimsOf(shape))}<div className="hr" />{spec("Peso aprox.", shape === "rect" ? "2,3 kg" : "2,5 kg")}</div>
          <div className="col g8">
            {["Excelente agarre y superficie antideslizante.", "Ideal para yoga, barre, pilates y entrenamiento.", "Es el mismo mat que usamos en las clases de Loft."].map((t) => <div key={t} className="row g10 small" style={{ alignItems: "flex-start" }}><Icon name="check" size={18} stroke={2.2} color="var(--sage-800)" /><span>{t}</span></div>)}
          </div>
          <div className="card soft p row g12"><Icon name="store" color="var(--sage-800)" /><div className="col" style={{ gap: 1 }}><span className="small b">Retirá gratis en el estudio</span><span className="xs muted">{STUDIO.direccion}, {STUDIO.barrio} · o te lo llevás después de tu clase</span></div></div>
          <div className="card soft p row g12"><Icon name="info" color="var(--sage-800)" /><div className="col" style={{ gap: 1 }}><span className="small b">Cuidado</span><span className="xs muted">Limpialo con un paño húmedo y dejalo secar a la sombra. Evitá dejarlo al sol.</span></div></div>
        </div>
      </div>
      <div className="footer">
        <div className="row g8">
          <Btn kind={added ? "neutral" : "primary"} className="grow" onClick={add}>{added ? <><Icon name="check" size={18} stroke={2.4} /> Agregado</> : `Agregar al carrito · ${fmt(MAT_PRICE)}`}</Btn>
          {app.cartCount > 0 && <Btn kind="outline" size="sm" style={{ minHeight: 52 }} onClick={() => app.go("carrito")}>Ver carrito ({app.cartCount})</Btn>}
        </div>
      </div>
    </div>
  );
}

function Galeria({ fotos }) {
  const ref = useRef(null); const [i, setI] = useState(0);
  useEffect(() => { const el = ref.current; if (!el) return; const on = () => setI(Math.round(el.scrollLeft / el.clientWidth)); el.addEventListener("scroll", on, { passive: true }); return () => el.removeEventListener("scroll", on); }, []);
  useEffect(() => { if (ref.current) ref.current.scrollTo({ left: 0 }); }, [fotos[0][0]]);
  return (
    <div className="gallery">
      <div className="track" ref={ref}>{fotos.map(([n, alt, cover], k) => <div key={k}><Photo name={n} alt={alt} cover={cover} h="100%" radius={0} /></div>)}</div>
      <div className="dots" aria-hidden="true">{fotos.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}</div>
    </div>
  );
}

/* ---------- Carrito ---------- */
export function Carrito({ app }) {
  const items = app.st.cart.map((l) => ({ ...l, m: matById(l.id) }));
  const units = items.reduce((a, l) => a + l.qty, 0);
  const total = units * MAT_PRICE;
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Tu carrito" />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        {items.length === 0 && <Empty icon="cart" title="Tu carrito está vacío" text="Los mats de Loft te esperan." action={<Btn size="sm" onClick={() => app.tab("tienda")}>Ir a la tienda</Btn>} />}
        <div className="col g10">
          {items.map(({ id, qty, m }) => (
            <div key={id} className="card col g10" style={{ padding: 12 }}>
              <div className="row g12">
                <div style={{ width: 80, flex: "none" }}><Photo name={m.img} alt={matTitle(m)} h={80} cover={!!m.fit} radius={12} /></div>
                <div className="col grow" style={{ gap: 2 }}>
                  <span className="small b">{matTitle(m)}</span>
                  <span className="xs muted">{m.tag ? `${m.tag[0].toUpperCase()}${m.tag.slice(1)} · ` : ""}{dimsOf(m.shape)}</span>
                  <span className="small b" style={{ marginTop: 2 }}>{fmt(MAT_PRICE * qty)}</span>
                </div>
              </div>
              <div className="row between">
                <button className="link xs" style={{ color: "var(--gris)", minHeight: 36 }} onClick={() => { app.dispatch({ type: "cart.qty", id, qty: 0 }); app.toast("Quitado del carrito."); }}><Icon name="trash" size={16} style={{ marginRight: 4 }} /> Quitar</button>
                <div className="row" style={{ background: "var(--arena)", borderRadius: 22 }}>
                  <button className="icon-btn" aria-label="Quitar una unidad" onClick={() => app.dispatch({ type: "cart.qty", id, qty: qty - 1 })}><Icon name="minus" size={16} stroke={2.4} /></button>
                  <span className="b" style={{ minWidth: 18, textAlign: "center" }} aria-live="polite">{qty}</span>
                  <button className="icon-btn" aria-label="Agregar una unidad" onClick={() => app.dispatch({ type: "cart.qty", id, qty: qty + 1 })}><Icon name="plus" size={16} stroke={2.4} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {units > 0 && <>
          <button className="link small" style={{ alignSelf: "flex-start" }} onClick={() => app.tab("tienda")}><Icon name="plus" size={16} style={{ marginRight: 6 }} /> Seguir comprando</button>
          <div className="card p col g10">
            <div className="row between small muted"><span>Subtotal · {units} {units === 1 ? "mat" : "mats"}</span><span>{fmt(total)}</span></div>
            <div className="row between small muted"><span>Retiro en el estudio</span><span>Gratis</span></div>
            <div className="hr" />
            <div className="row between" style={{ alignItems: "baseline" }}><span className="b">Total</span><span className="display" style={{ fontSize: 22 }}>{fmt(total)}</span></div>
          </div>
        </>}
      </div></div>
      {units > 0 && <div className="footer"><Btn onClick={() => app.go("checkout")}>Continuar · {fmt(total)}</Btn></div>}
    </div>
  );
}

/* ---------- Checkout ---------- */
export function Checkout({ app }) {
  const { st } = app;
  const [entrega, setEntrega] = useState("retiro");
  const [pago, setPago] = useState("mp");
  const [f, setF] = useState({ nombre: st.user?.nombre || "", email: st.user?.email || "", tel: st.user?.tel || "", dir: "", cp: "" });
  const [err, setErr] = useState({});
  const [cargando, setCargando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [cuotas, setCuotas] = useState(1);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const items = st.cart.map((l) => ({ ...l, m: matById(l.id) }));
  const units = items.reduce((a, l) => a + l.qty, 0);
  const envio = entrega === "envio" ? 6500 : 0;
  const total = units * MAT_PRICE + envio;
  const pagos = entrega === "retiro" ? PAGOS : PAGOS.filter((p) => p.id !== "efectivo");
  const pagoOk = pagos.some((p) => p.id === pago) ? pago : "mp";
  const confirmar = () => {
    const e = {};
    if (f.nombre.trim().length < 2) e.nombre = "Necesitamos tu nombre.";
    if (!emailOk(f.email)) e.email = "Revisá el email.";
    if (f.tel.trim().length < 6) e.tel = "Dejanos un teléfono para coordinar.";
    if (entrega === "envio" && f.dir.trim().length < 5) e.dir = "Ingresá la dirección completa.";
    if (entrega === "envio" && f.cp.trim().length < 4) e.cp = "Código postal.";
    setErr(e);
    if (Object.keys(e).length) { app.toast("Revisá los datos marcados."); return; }
    if (pagoOk === "efectivo") return finalizar(null);
    setPagando(true);
  };
  const finalizar = (comprobante) => {
    setCargando(true);
    setTimeout(() => { const num = `LS-${st.pedidoN}`; app.dispatch({ type: "pedido", entrega, pago: pagoOk, datos: { ...f, envio }, comprobante, cuotas: pagoOk === "tarjeta" || pagoOk === "mp" ? cuotas : 1 }); if (!st.user?.tel && f.tel) app.dispatch({ type: "user", data: { tel: f.tel } }); setCargando(false); app.reset("pedido", { num }); }, 600);
  };
  const Sec = ({ n, t }) => <div className="row g10"><span className="row center" style={{ width: 26, height: 26, borderRadius: 13, background: "var(--sage-700)", color: "#fff", fontSize: 13, fontWeight: 700 }}>{n}</span><h2 className="display h2">{t}</h2></div>;
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Finalizar compra" />
      {pagando && <PagoSim metodo={pagoOk} monto={(pagoOk === "tarjeta" || pagoOk === "mp") && cuotas === 6 ? Math.round(total * 1.12) : total} concepto={`Pedido Mats · LoftStudio${cuotas > 1 && (pagoOk === "tarjeta" || pagoOk === "mp") ? ` · ${cuotas} cuotas` : ""}`} onClose={() => setPagando(false)} onDone={(r) => { setPagando(false); finalizar(r.comprobante); }} />}
      <div className="scroll"><div className="pad g24" style={{ paddingTop: 4 }}>
        <div className="col g10">
          <Sec n={1} t="Entrega" />
          <Radio on={entrega === "retiro"} onClick={() => setEntrega("retiro")} title="Retiro en el estudio" sub={`${STUDIO.direccion}, ${STUDIO.barrio} · listo en 24 h`} right="Gratis" />
          <Radio on={entrega === "envio"} onClick={() => setEntrega("envio")} title="Envío a domicilio" sub="Zona norte y CABA · 2 a 4 días hábiles" right={fmt(6500)} />
          {entrega === "envio" && <div className="col g10" style={{ marginTop: 4 }}><Field label="Dirección" value={f.dir} onChange={set("dir")} err={err.dir} placeholder="Calle, número, piso" autoComplete="street-address" /><div className="row g10"><div className="grow"><Field label="Código postal" value={f.cp} onChange={set("cp")} err={err.cp} inputMode="numeric" placeholder="1636" /></div><div className="grow"><Field label="Localidad" defaultValue="La Lucila" /></div></div></div>}
        </div>
        <div className="col g10">
          <Sec n={2} t="Tus datos" />
          <Field label="Nombre y apellido" value={f.nombre} onChange={set("nombre")} err={err.nombre} autoComplete="name" />
          <Field label="Email" type="email" value={f.email} onChange={set("email")} err={err.email} autoComplete="email" inputMode="email" hint="Te mandamos el comprobante acá." />
          <Field label="Teléfono" type="tel" value={f.tel} onChange={set("tel")} err={err.tel} autoComplete="tel" inputMode="tel" placeholder="11 2345 6789" />
        </div>
        <div className="col g10">
          <Sec n={3} t="Medio de pago" />
          {pagos.map((p) => <Radio key={p.id} on={pagoOk === p.id} onClick={() => setPago(p.id)} title={p.t} sub={p.s} />)}
          <div className="card soft p xs" style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>{PAGOS.find((p) => p.id === pagoOk).n}</div>
          {(pagoOk === "tarjeta" || pagoOk === "mp") && <div className="col g8"><span className="eyebrow">Cuotas</span><div className="row g8">{[1, 3, 6].map((n) => <Option key={n} on={cuotas === n} l={n === 1 ? "1 pago" : `${n} cuotas`} s={n === 1 ? fmt(total) : n === 3 ? `${fmt(Math.round(total / 3))} sin interés` : `${fmt(Math.round((total * 1.12) / 6))} c/u`} onClick={() => setCuotas(n)} />)}</div></div>}
        </div>
        <div className="card p col g10">
          <h2 className="display h2">Resumen</h2>
          {items.map(({ id, qty, m }) => <div key={id} className="row between g12 small"><span>{matTitle(m)}{qty > 1 ? ` × ${qty}` : ""}</span><span className="muted">{fmt(MAT_PRICE * qty)}</span></div>)}
          <div className="hr" />
          <div className="row between small muted"><span>Envío</span><span>{entrega === "retiro" ? "Gratis · retiro en Loft" : fmt(envio)}</span></div>
          <div className="row between" style={{ alignItems: "baseline" }}><span className="b">Total</span><span className="display" style={{ fontSize: 22 }}>{fmt(total)}</span></div>
        </div>
      </div></div>
      <div className="footer">
        <Btn onClick={confirmar} disabled={cargando || !units}>{cargando ? <span className="spin" /> : pagoOk === "mp" ? `Pagar con Mercado Pago · ${fmt(total)}` : pagoOk === "tarjeta" ? `Pagar ${fmt(total)}` : pagoOk === "transf" ? `Ir a transferir · ${fmt(total)}` : `Reservar · pago en Loft`}</Btn>
        <span className="xs muted tc">Tus datos se usan solo para gestionar este pedido.</span>
      </div>
    </div>
  );
}

/* ---------- Pedido confirmado / detalle ---------- */
export function Pedido({ app, params }) {
  const o = app.st.pedidos.find((p) => p.num === params.num) || app.st.pedidos[0];
  if (!o) return <div className="screen"><TopBar onBack={() => app.tab("tienda")} title="Pedido" /><div className="pad"><Empty title="Todavía no hiciste pedidos" action={<Btn size="sm" onClick={() => app.tab("tienda")}>Ir a la tienda</Btn>} /></div></div>;
  const msg = { mp: `Pagaste con Mercado Pago${o.comprobante ? ` · comprobante N° ${o.comprobante}` : ""}.`, tarjeta: `Pagaste con tarjeta${o.comprobante ? ` · comprobante N° ${o.comprobante}` : ""}.`, transf: `Transferencia acreditada${o.comprobante ? ` · comprobante N° ${o.comprobante}` : ""}. Quedó guardado en la app.`, efectivo: o.estado.startsWith("Pagado") ? "Pagaste en efectivo en el estudio." : "Pagás en efectivo cuando retirás." }[o.pago];
  const pendiente = o.pago === "efectivo" && !o.estado.startsWith("Pagado");
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((x) => x + 1), 5000); return () => clearInterval(id); }, []);
  const min = (Date.now() - o.fecha) / 60000;
  const etapa = pendiente ? 0 : min < 0.5 ? 1 : min < 2 ? 2 : 3; // simulación acelerada: 30 s preparando, 2 min listo
  const pasos = o.entrega === "retiro"
    ? [["Pedido recibido", "Te mandamos el detalle por mail"], ["Pago confirmado", o.pago === "efectivo" ? "Lo pagás al retirar" : "Comprobante guardado en la app"], ["Preparando tu pedido", "Lo dejamos listo en recepción"], ["Listo para retirar", `${STUDIO.direccion} · lun a vie 8 a 13 y 15:30 a 20`]]
    : [["Pedido recibido", "Te mandamos el detalle por mail"], ["Pago confirmado", "Comprobante guardado en la app"], ["Preparando el envío", "Coordinamos el horario por la app"], ["En camino", "2 a 4 días hábiles"]];
  return (
    <div className="screen">
      <TopBar onBack={() => app.tab("tienda")} title={`Pedido #${o.num}`} right={<button className="icon-btn" aria-label="Mis pedidos" onClick={() => app.go("pedidos")}><Icon name="bag" /></button>} />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        <div className="col center g12 tc" style={{ padding: "12px 0 4px" }}>
          <span className="check-anim row center" style={{ width: 84, height: 84, borderRadius: 42, background: "var(--sage-50)" }}><span className="row center" style={{ width: 58, height: 58, borderRadius: 29, background: pendiente ? "var(--rosa)" : "var(--sage-700)" }}><Icon name={pendiente ? "clock" : "check"} size={30} stroke={2.6} color="#fff" /></span></span>
          <h1 className="display h1" style={{ fontSize: 23 }}>{pendiente ? "Pedido reservado" : "¡Pedido confirmado!"}</h1>
          <p className="small muted" style={{ margin: 0 }}>{pendiente ? `Te lo guardamos 48 h. Lo pagás en efectivo cuando venís a retirarlo a ${STUDIO.direccion}.` : `Te mandamos el detalle a ${o.datos.email}. ${o.entrega === "retiro" ? "Te avisamos por la app cuando esté listo para retirar." : "Coordinamos el envío por la app."}`}</p>
        </div>
        {pendiente && <><CodigoEfectivo codigo={o.codigo} monto={o.total} vence="próximas 48 h" /><Btn kind="neutral" onClick={() => { app.dispatch({ type: "pedidoPagado", num: o.num }); app.toast("Pago registrado en recepción."); }}><Icon name="store" size={18} /> Simular pago en recepción</Btn></>}
        <div className="card p col g12">
          <h2 className="display h2" style={{ fontSize: 16 }}>Seguimiento</h2>
          <div className="timeline">
            {pasos.map(([t, sub], k) => { const done = k < etapa; const now = k === etapa; return (
              <div key={t} className={"step" + (done ? " done" : "") + (now ? " now" : "")}><span className="dot">{done && <Icon name="check" size={13} stroke={3} color="#fff" />}</span><div className="col" style={{ gap: 1 }}><span className="small" style={{ fontWeight: done || now ? 600 : 500, color: done || now ? "var(--ink)" : "var(--gris-2)" }}>{t}</span><span className="xs muted">{sub}</span></div></div>
            ); })}
          </div>
          {etapa < 3 && !pendiente && <span className="xs" style={{ color: "var(--gris-2)" }}>Simulación acelerada: el pedido avanza solo en los próximos minutos.</span>}
        </div>
        <div className="card p col g12">
          <div className="row between xs muted"><span>Pedido</span><span className="b" style={{ color: "var(--ink)" }}>#{o.num}</span></div>
          <div className="row between xs muted"><span>Estado</span><Tag tone={pendiente ? "clay" : ""}>{o.estado}</Tag></div>
          <div className="hr" />
          {o.items.map(({ id, qty }) => { const m = matById(id); return <div key={id} className="row g12"><div style={{ width: 52, flex: "none" }}><Photo name={m.img} alt={matTitle(m)} h={52} radius={10} cover={!!m.fit} /></div><span className="grow small b">{matTitle(m)}{qty > 1 ? ` × ${qty}` : ""}</span><span className="small b">{fmt(MAT_PRICE * qty)}</span></div>; })}
          {o.datos.envio > 0 && <div className="row between small muted"><span>Envío</span><span>{fmt(o.datos.envio)}</span></div>}
          <div className="hr" />
          <div className="row between" style={{ alignItems: "baseline" }}><span className="b">Total</span><span className="display" style={{ fontSize: 20 }}>{fmt(o.total)}</span></div>
          <div className="hr" />
          <div className="row g12"><Icon name="store" color="var(--sage-800)" /><div className="col" style={{ gap: 1 }}><span className="small b">{o.entrega === "retiro" ? "Retiro en el estudio" : "Envío a domicilio"}</span><span className="xs muted">{o.entrega === "retiro" ? `${STUDIO.direccion}, ${STUDIO.barrio} · lun a vie 8 a 13 y 15:30 a 20` : `${o.datos.dir} (${o.datos.cp}) · 2 a 4 días hábiles`}</span></div></div>
          <div className="row g12"><Icon name="card" color="var(--sage-800)" /><span className="xs muted">{msg}{o.cuotas > 1 ? ` En ${o.cuotas} cuotas.` : ""}</span></div>
        </div>
      </div></div>
      <div className="footer"><Btn onClick={() => app.tab("tienda")}>Volver a la tienda</Btn><Btn kind="ghost" onClick={() => app.tab("inicio")}>Ir al inicio</Btn></div>
    </div>
  );
}

export function Pedidos({ app }) {
  const { st } = app;
  return (
    <div className="screen">
      <TopBar onBack={app.back} title="Mis pedidos" />
      <div className="scroll"><div className="pad" style={{ paddingTop: 4 }}>
        {st.pedidos.length === 0 && <Empty icon="bag" title="Sin pedidos todavía" action={<Btn size="sm" onClick={() => app.tab("tienda")}>Ir a la tienda</Btn>} />}
        {st.pedidos.map((o) => (
          <button key={o.num} className="card tap btn-reset p row g12" onClick={() => app.go("pedido", { num: o.num })}>
            <div className="col grow" style={{ gap: 2 }}><span className="small b">#{o.num} · {o.items.reduce((a, l) => a + l.qty, 0)} {o.items.reduce((a, l) => a + l.qty, 0) === 1 ? "mat" : "mats"}</span><span className="xs muted">{new Date(o.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long" })} · {o.estado}</span></div>
            <span className="small b">{fmt(o.total)}</span><Icon name="next" color="var(--gris-2)" />
          </button>
        ))}
        {st.comprasPack.length > 0 && <div className="col g10"><h2 className="display h2">Packs comprados</h2>{st.comprasPack.map((c) => <div key={c.num} className="card p row g12"><div className="col grow" style={{ gap: 2 }}><span className="small b">{c.nombre}</span><span className="xs muted">{new Date(c.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long" })} · vence el {fmtFecha(c.vence)}</span></div><span className="small b">{fmt(c.precio)}</span></div>)}</div>}
      </div></div>
    </div>
  );
}
