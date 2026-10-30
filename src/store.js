import { useEffect, useMemo, useReducer, useRef } from "react";
import { GRID, TYPES, CUPO, PACKS, MAT_PRICE, matById, DIAS, DIAS_LARGO, MESES, profeDe } from "./data.js";

/* ---------- utilidades de fecha ---------- */
export const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const weekday = (d) => (d.getDay() + 6) % 7; // 0 = lunes
export const fmtFecha = (s, largo = false) => { const d = parseYmd(s); return `${largo ? DIAS_LARGO[weekday(d)] : DIAS[weekday(d)]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
export const fmtCorta = (s) => { const d = parseYmd(s); return `${DIAS[weekday(d)]} ${d.getDate()}`; };
export const fmt = (n) => "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const hoy = () => ymd(new Date());

/* ---------- grilla real → instancias con fecha ---------- */
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); };
export function buildClases(days = 14) {
  const out = [];
  const start = new Date();
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const wd = weekday(d);
    const fecha = ymd(d);
    GRID.filter((g) => g[0] === wd).forEach(([, hora, tipo]) => {
      const h = hash(fecha + hora);
      const ocupados = h % 100 < 18 ? CUPO : 3 + (h % 7); // ~18% llenas
      out.push({ id: `${fecha}-${hora}`, fecha, hora, tipo, ocupados, profe: profeDe(wd, hora, tipo), ...TYPES[tipo] });
    });
  }
  return out;
}
export const esPasada = (c) => { const [h, m] = c.hora.split(":").map(Number); const d = parseYmd(c.fecha); d.setHours(h, m, 0, 0); return d.getTime() < Date.now(); };
export const minutosHasta = (c) => { const [h, m] = c.hora.split(":").map(Number); const d = parseYmd(c.fecha); d.setHours(h, m, 0, 0); return (d.getTime() - Date.now()) / 60000; };

/* ---------- estado ---------- */
const KEY = "loftstudio-app-v2";
const venceEn = (dias) => ymd(addDays(new Date(), dias));

export const initialState = () => ({
  user: null, // { nombre, email, tel, desde }
  reservas: [], // { id, pago: 'pack'|'suelta', rem: bool, creada }
  espera: [],
  pack: null, // { id, nombre, total, left, vence, soloYoga }
  packQueue: null,
  cart: [], // { id, qty }
  pedidos: [], // { num, items, total, entrega, pago, fecha }
  comprasPack: [],
  favs: ["barre"],
  avisos: [],
  eventos: {}, // id -> 'inscripta' | 'espera'
  notifs: [], // { id, t, s, fecha, leida, accion? }
  historial: [], // clases pasadas { fecha, hora, tipo }
  ajustes: { recordatorios: true, mail: true, push: true },
  onboarded: false,
  checkins: [], // ids de clases con check-in hecho
  invitadas: 0,
  pedidoN: 1047,
});

function demoSeed(nombre) {
  // Cuenta demo: pack activo, dos reservas y algo de historial para que la app se sienta usada.
  const clases = buildClases(14).filter((c) => !esPasada(c));
  const barre = clases.find((c) => c.tipo === "barre" && c.ocupados < CUPO);
  const yoga = clases.find((c) => (c.tipo === "vinyasa" || c.tipo === "integral") && c.ocupados < CUPO && c.id !== barre?.id);
  const llena = clases.find((c) => c.ocupados >= CUPO);
  const hist = [];
  for (let i = 1; i <= 5; i++) {
    const d = addDays(new Date(), -i * 3);
    const wd = weekday(d);
    const g = GRID.find((x) => x[0] === wd);
    if (g) hist.push({ fecha: ymd(d), hora: g[1], tipo: g[2] });
  }
  return {
    user: { nombre, email: "", tel: "", desde: "marzo de 2025" },
    onboarded: true, favs: ["barre", "vinyasa"],
    reservas: [barre, yoga].filter(Boolean).map((c, i) => ({ id: c.id, pago: "pack", rem: i === 0, creada: Date.now() })),
    espera: llena ? [llena.id] : [],
    pack: { id: "p8", nombre: "Pack 8 clases", total: 8, left: 3, vence: venceEn(12), soloYoga: false, inicio: venceEn(-18) },
    historial: hist,
    notifs: [
      { id: "n1", t: "Tu lugar está confirmado", s: `${barre ? TYPES[barre.tipo].nombre + " · " + fmtCorta(barre.fecha) + " " + barre.hora : "Barre"}`, fecha: Date.now() - 86400000 * 2, leida: true },
      { id: "n2", t: "Nuevo: Clínica de Barre", s: "Sábado 8 de noviembre · técnica desde cero. Quedan 8 lugares.", fecha: Date.now() - 86400000, leida: false, go: ["eventos"] },
      { id: "n3", t: "Te quedan 3 clases en tu pack", s: "Vence en 12 días. Podés renovarlo desde la app.", fecha: Date.now() - 3600000 * 5, leida: false, go: ["packs"] },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch { /* sin storage */ }
  return initialState();
}

let nid = 0;
const notif = (t, s, extra = {}) => ({ id: `n${Date.now()}-${nid++}`, t, s, fecha: Date.now(), leida: false, ...extra });

function reducer(st, a) {
  switch (a.type) {
    case "login": {
      const seed = a.demo ? demoSeed(a.nombre) : {};
      return { ...st, ...seed, user: { nombre: a.nombre, email: a.email || "", tel: a.tel || "", desde: seed.user?.desde || `${MESES[new Date().getMonth()]} de ${new Date().getFullYear()}`, ...(seed.user || {}), nombre: a.nombre, email: a.email || "" } };
    }
    case "logout": return initialState();
    case "reset": return initialState();
    case "user": return { ...st, user: { ...st.user, ...a.data } };
    case "ajustes": return { ...st, ajustes: { ...st.ajustes, ...a.data } };
    case "onboarded": return { ...st, onboarded: true, favs: a.favs && a.favs.length ? a.favs : st.favs };
    case "checkin": return st.checkins.includes(a.id) ? st : { ...st, checkins: [...st.checkins, a.id], notifs: [notif("¡Check-in listo!", "Buena clase. Dejá el celu en el locker y a moverse.", {}), ...st.notifs] };
    case "invitar": return { ...st, invitadas: st.invitadas + 1 };

    case "reservar": {
      const c = a.clase;
      let pack = st.pack, pago = a.pago;
      if (pago === "pack" && pack && pack.left > 0) pack = { ...pack, left: pack.left - 1 };
      const n = notif("Tu lugar está confirmado", `${c.nombre} · ${fmtCorta(c.fecha)} ${c.hora}.${a.comprobante ? ` Pago ${fmt(a.precio)} · comprobante N° ${a.comprobante}.` : a.medio === "efectivo" ? ` Abonás ${fmt(a.precio)} en efectivo al llegar.` : ""} Te esperamos en Loft.`, { go: ["detalle", { id: c.id }] });
      return { ...st, pack, reservas: [...st.reservas, { id: c.id, pago, medio: a.medio || null, precio: a.precio || 0, comprobante: a.comprobante || null, rem: st.ajustes.recordatorios, creada: Date.now() }], espera: st.espera.filter((x) => x !== c.id), liberados: (st.liberados || []).filter((x) => x !== c.id), notifs: [n, ...st.notifs] };
    }
    case "cancelar": {
      const r = st.reservas.find((x) => x.id === a.id);
      if (!r) return st;
      let pack = st.pack;
      if (r.pago === "pack" && pack) pack = { ...pack, left: Math.min(pack.total, pack.left + 1) };
      return { ...st, pack, reservas: st.reservas.filter((x) => x.id !== a.id), _undo: { r, pack: st.pack } };
    }
    case "deshacer": {
      if (!st._undo) return st;
      const { r, pack } = st._undo;
      return { ...st, pack, reservas: [...st.reservas, r], _undo: null };
    }
    case "rem": return { ...st, reservas: st.reservas.map((x) => (x.id === a.id ? { ...x, rem: !x.rem } : x)) };
    case "espera": return { ...st, espera: st.espera.includes(a.id) ? st.espera.filter((x) => x !== a.id) : [...st.espera, a.id] };
    case "liberado": {
      if (!st.espera.includes(a.clase.id)) return st;
      const n = notif("¡Se liberó un lugar!", `${a.clase.nombre} · ${fmtCorta(a.clase.fecha)} ${a.clase.hora}. Tenés 15 minutos para tomarlo.`, { go: ["detalle", { id: a.clase.id }], cta: "Reservar" });
      return { ...st, liberados: [...(st.liberados || []), a.clase.id], notifs: [n, ...st.notifs] };
    }
    case "fav": return { ...st, favs: st.favs.includes(a.id) ? st.favs.filter((x) => x !== a.id) : [...st.favs, a.id] };
    case "aviso": return { ...st, avisos: st.avisos.includes(a.id) ? st.avisos.filter((x) => x !== a.id) : [...st.avisos, a.id] };
    case "evento": {
      const cur = st.eventos[a.id];
      const next = { ...st.eventos };
      if (cur) delete next[a.id]; else next[a.id] = a.modo;
      const n = !cur && a.modo === "inscripta" ? [notif("Lugar reservado en el evento", a.titulo, { go: ["eventos"] })] : [];
      return { ...st, eventos: next, notifs: [...n, ...st.notifs] };
    }

    case "comprarPack": {
      const p = PACKS.find((x) => x.id === a.id);
      const nuevo = { id: p.id, nombre: p.nombre, total: p.clases, left: p.clases, vence: venceEn(30), inicio: hoy(), soloYoga: !!p.soloYoga, pago: a.pago, precio: p[a.pago], pendiente: a.pago === 'efectivo', comprobante: a.comprobante || null, codigo: a.pago === 'efectivo' ? 'LP-' + String(1000 + (st.pedidoN % 9000)) : null };
      const compra = { ...nuevo, fecha: Date.now(), num: `LP-${st.pedidoN}` };
      const activoVigente = st.pack && st.pack.left > 0 && st.pack.vence >= hoy();
      const n = notif(nuevo.pendiente ? "Pack reservado · pagás en Loft" : activoVigente ? "Pack comprado · queda en espera" : "¡Pack activado!", nuevo.pendiente ? `Mostrá el código ${nuevo.codigo} en recepción y abonás ${fmt(nuevo.precio)} en efectivo.` : activoVigente ? `${p.nombre} se activa cuando termines el actual.` : `${p.nombre} · ${p.clases} clases · vence el ${fmtFecha(nuevo.vence)}.${a.comprobante ? " Comprobante N° " + a.comprobante + " guardado." : ""}`, { go: ["perfil"] });
      return { ...st, pedidoN: st.pedidoN + 1, comprasPack: [compra, ...st.comprasPack], notifs: [n, ...st.notifs], ...(activoVigente ? { packQueue: nuevo } : { pack: nuevo, packQueue: null }) };
    }
    case "activarQueue": return st.packQueue ? { ...st, pack: st.packQueue, packQueue: null } : st;
    case "packPagado": {
      const fix = (p) => (p && p.pendiente ? { ...p, pendiente: false } : p);
      const n = notif("Pack confirmado", "Recepción registró tu pago en efectivo. ¡Gracias!", { go: ["perfil"] });
      return { ...st, pack: fix(st.pack), packQueue: fix(st.packQueue), notifs: [n, ...st.notifs] };
    }

    case "cart.add": return { ...st, cart: st.cart.some((l) => l.id === a.id) ? st.cart.map((l) => (l.id === a.id ? { ...l, qty: Math.min(9, l.qty + 1) } : l)) : [...st.cart, { id: a.id, qty: 1 }] };
    case "cart.qty": return { ...st, cart: a.qty < 1 ? st.cart.filter((l) => l.id !== a.id) : st.cart.map((l) => (l.id === a.id ? { ...l, qty: Math.min(9, a.qty) } : l)) };
    case "pedido": {
      const units = st.cart.reduce((s, l) => s + l.qty, 0);
      const num = `LS-${st.pedidoN}`;
      const ped = { num, items: st.cart, total: units * MAT_PRICE, entrega: a.entrega, pago: a.pago, datos: a.datos, fecha: Date.now(), estado: a.pago === "efectivo" ? "Reservado · pagás al retirar" : "Pagado", comprobante: a.comprobante || null, codigo: a.pago === "efectivo" ? "LS-" + String(2000 + (st.pedidoN % 7000)) : null };
      const n = notif("Pedido confirmado", `#${num} · ${units} ${units === 1 ? "mat" : "mats"}. ${a.entrega === "retiro" ? "Te avisamos cuando esté listo para retirar." : "Coordinamos el envío por la app."}`, { go: ["pedido", { num }] });
      return { ...st, pedidoN: st.pedidoN + 1, pedidos: [ped, ...st.pedidos], cart: [], notifs: [n, ...st.notifs] };
    }
    case "pedidoPagado": return { ...st, pedidos: st.pedidos.map((p) => (p.num === a.num ? { ...p, estado: "Pagado en el estudio · listo para retirar", pago: "efectivo" } : p)), notifs: [notif("Pago registrado", `Pedido #${a.num} pagado en recepción. ¡Llevate tu mat!`, { go: ["pedido", { num: a.num }] }), ...st.notifs] };
    case "notif.leer": return { ...st, notifs: st.notifs.map((n) => (a.id === "all" || n.id === a.id ? { ...n, leida: true } : n)) };
    case "notif.add": return { ...st, notifs: [notif(a.t, a.s, a.extra), ...st.notifs] };
    default: return st;
  }
}

export function useStore() {
  const [st, dispatch] = useReducer(reducer, null, load);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try { const { _undo, ...save } = st; localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* sin storage */ }
  }, [st]);
  const clases = useMemo(() => buildClases(14), []);
  return { st, dispatch, clases };
}

export const nombrePago = (id) => ({ efectivo: "Efectivo", transf: "Transferencia", tarjeta: "Tarjeta", mp: "Mercado Pago" }[id] || id);
export const matById_ = matById;
