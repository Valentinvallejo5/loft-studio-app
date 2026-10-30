import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { useStore, esPasada, hoy, fmtCorta } from "./store.js";
import { CUPO, STUDIO } from "./data.js";
import { Icon, Toast } from "./ui.jsx";
import { Bienvenida, Login } from "./screens/auth.jsx";
import { Clases, Detalle, Eventos, Packs } from "./screens/clases.jsx";
import { Carrito, Checkout, Pedido, Pedidos, Producto, Tienda } from "./screens/tienda.jsx";
import { Estudio, Inicio, Notifs, Perfil } from "./screens/inicio.jsx";

const SCREENS = { bienvenida: Bienvenida, login: Login, inicio: Inicio, clases: Clases, detalle: Detalle, packs: Packs, eventos: Eventos, tienda: Tienda, producto: Producto, carrito: Carrito, checkout: Checkout, pedido: Pedido, pedidos: Pedidos, perfil: Perfil, notifs: Notifs, estudio: Estudio };
const TABS = [["inicio", "Inicio", "home"], ["clases", "Clases", "cal"], ["tienda", "Tienda", "bag"], ["perfil", "Perfil", "user"]];
const CON_TABS = new Set(TABS.map((t) => t[0]));

/* Navegación con historial del navegador (botón atrás del celu funciona) */
function useNav(initial) {
  const [stack, setStack] = useState([initial]);
  const ignore = useRef(false);
  useEffect(() => {
    const onPop = () => { if (ignore.current) { ignore.current = false; return; } setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)); };
    window.addEventListener("popstate", onPop);
    history.replaceState({ i: 0 }, "");
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = useCallback((name, params = {}) => { setStack((s) => [...s, { name, params }]); history.pushState({}, ""); }, []);
  const replace = useCallback((name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params }]), []);
  const back = useCallback(() => { setStack((s) => { if (s.length > 1) { ignore.current = true; history.back(); return s.slice(0, -1); } return s; }); }, []);
  const reset = useCallback((name, params = {}) => setStack([{ name, params }]), []);
  return { stack, go, replace, back, reset };
}

export default function App() {
  const { st, dispatch, clases } = useStore();
  const nav = useNav({ name: st.user ? "inicio" : "bienvenida", params: {} });
  const cur = nav.stack[nav.stack.length - 1];
  const [toast, setToastRaw] = useState(null);
  const setToast = useCallback((v) => setToastRaw(v ? { ...v, k: Date.now() } : null), []);
  const scrollRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => { if (window.innerWidth <= 520) return setScale(1); setScale(Math.min(1, (window.innerHeight - 40) / 884, (window.innerWidth - 40) / 430)); };
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => { const el = scrollRef.current?.querySelector(".scroll"); if (el) el.scrollTop = 0; }, [cur.name, JSON.stringify(cur.params)]);
  useEffect(() => { document.title = `LoftStudio · ${cur.name === "inicio" ? "Barre & Yoga" : cur.name[0].toUpperCase() + cur.name.slice(1)}`; }, [cur.name]);

  // Lista de espera: simulamos que se libera un lugar a los ~20 s de anotarse
  const timers = useRef({});
  const anotarEspera = useCallback((c) => {
    dispatch({ type: "espera", id: c.id });
    setToast({ t: "Estás en la lista de espera. Te avisamos si se libera un lugar." });
    timers.current[c.id] = setTimeout(() => { dispatch({ type: "liberado", clase: c }); setToast({ t: `¡Se liberó un lugar en ${c.nombre} ${fmtCorta(c.fecha)} ${c.hora}!`, go: ["detalle", { id: c.id }] }); }, 20000);
  }, [dispatch]);
  // El pack en cola se activa solo cuando el actual se termina o vence
  useEffect(() => { if (st.packQueue && st.pack && (st.pack.left <= 0 || st.pack.vence < hoy())) dispatch({ type: "activarQueue" }); }, [st.pack, st.packQueue, dispatch]);

  const proximas = useMemo(() => st.reservas.map((r) => ({ r, c: clases.find((c) => c.id === r.id) })).filter((x) => x.c && !esPasada(x.c)).sort((a, b) => (a.c.fecha + a.c.hora).localeCompare(b.c.fecha + b.c.hora)), [st.reservas, clases]);
  const pasadas = useMemo(() => [...st.historial, ...st.reservas.map((r) => clases.find((c) => c.id === r.id)).filter((c) => c && esPasada(c)).map((c) => ({ fecha: c.fecha, hora: c.hora, tipo: c.tipo }))].sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1)), [st.historial, st.reservas, clases]);
  const packActivo = st.pack && st.pack.vence >= hoy() ? st.pack : st.pack ? { ...st.pack, left: 0 } : null;

  const app = useMemo(() => ({
    st, dispatch, clases, proximas, pasadas, packActivo,
    cartCount: st.cart.reduce((a, l) => a + l.qty, 0),
    ...nav, tab: (n) => nav.reset(n),
    toast: (t) => setToast({ t }),
    clase: (id) => clases.find((c) => c.id === id),
    esMia: (id) => st.reservas.some((r) => r.id === id),
    libres: (c) => { const mia = st.reservas.some((r) => r.id === c.id); const lib = (st.liberados || []).includes(c.id) && !mia ? 1 : 0; return Math.max(0, CUPO - c.ocupados - (mia ? 1 : 0) + lib); },
    anotarEspera,
    cancelar: (id, tarde) => { const c = clases.find((x) => x.id === id); dispatch({ type: "cancelar", id }); setToast({ t: tarde ? "Reserva cancelada. La clase se descontó igual del pack." : `Cancelaste ${c?.nombre || "la clase"}. Te devolvimos la clase al pack.`, undo: true }); },
  }), [st, dispatch, clases, proximas, pasadas, packActivo, nav, anotarEspera]);

  const View = SCREENS[cur.name] || Inicio;
  const conTabs = CON_TABS.has(cur.name) && st.user;

  return (
    <div className="stage">
      <aside className="aside">
        <h2>LoftStudio · App</h2>
        <p>Prototipo de la app oficial de <b>Loft Studio Barre & Yoga</b> ({STUDIO.barrio}). Centraliza reservas, packs, eventos y tienda, que hoy están repartidos entre Siguefit, WhatsApp, Instagram y la web.</p>
        <p>Datos reales: grilla, packs y precios, dirección, teléfono, mats, eventos y testimonios del estudio. Profe con nombre: solo Flor Méndez (la única pública).</p>
        <p><span className="k">Ingresar como socia</span> carga una cuenta demo con pack y reservas. <span className="k">Quiero empezar</span> arranca de cero.</p>
        <p>Probá: reservar y cancelar (deshacer), lista de espera (se libera un lugar a los 20 s), comprar un pack o un mat pagando con transferencia, Mercado Pago, tarjeta o efectivo (pagos simulados), check-in con QR, agendar en el calendario.</p>
        <p style={{ color: "#8a857f" }}>Gestión de Productos Digitales 2 · UdeSA · Equipo 5</p>
      </aside>
      <div className="iphone" style={{ transform: `scale(${scale})` }}>
        <span className="btn-side mute" /><span className="btn-side volu" /><span className="btn-side vold" /><span className="btn-side power" />
      <div className="phone" ref={scrollRef}>
        <StatusBar />
        <div className="notch-pad" />
        <View key={cur.name + JSON.stringify(cur.params)} app={app} params={cur.params} />
        {conTabs && (
          <nav className="tabbar" aria-label="Navegación principal">
            {TABS.map(([k, l, ic]) => <button key={k} aria-current={cur.name === k ? "page" : undefined} onClick={() => nav.reset(k)}><Icon name={ic} />{l}{k === "tienda" && app.cartCount > 0 && <span className="badge" style={{ top: 4, right: "calc(50% - 22px)" }}>{app.cartCount}</span>}</button>)}
          </nav>
        )}
        <div className="home-ind" />
        <Toast t={toast?.t} k={toast?.k} label={toast?.undo ? "Deshacer" : "Ver"} onAction={toast?.undo ? () => { dispatch({ type: "deshacer" }); setToast({ t: "Listo, tu lugar sigue reservado." }); } : toast?.go ? () => { nav.go(...toast.go); setToast(null); } : undefined} onClose={() => setToast(null)} />
      </div>
      </div>
    </div>
  );
}

function StatusBar() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 15000); return () => clearInterval(id); }, []);
  const hh = `${t.getHours()}:${String(t.getMinutes()).padStart(2, "0")}`;
  return (
    <div className="statusbar" aria-hidden="true">
      <span>{hh}</span>
      <span className="island" />
      <span className="right">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="0.8" fill="currentColor" /><rect x="5" y="5.5" width="3" height="6.5" rx="0.8" fill="currentColor" /><rect x="10" y="3" width="3" height="9" rx="0.8" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 9.6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Zm0-3.6c1.7 0 3.2.7 4.3 1.8l-1.3 1.3a4.3 4.3 0 0 0-6 0L4.2 7.8A6.1 6.1 0 0 1 8.5 6Zm0-3.6c2.7 0 5.1 1.1 6.9 2.9L14.1 6.6a7.9 7.9 0 0 0-11.2 0L1.6 5.3A9.7 9.7 0 0 1 8.5 2.4Z" fill="currentColor" transform="translate(0,-1.4)" /></svg>
        <svg width="28" height="13" viewBox="0 0 28 13"><rect x="0.5" y="0.5" width="24" height="12" rx="3.5" stroke="currentColor" opacity="0.4" fill="none" /><rect x="2" y="2" width="19" height="9" rx="2" fill="currentColor" /><path d="M26 4.5v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.5" /></svg>
      </span>
    </div>
  );
}
