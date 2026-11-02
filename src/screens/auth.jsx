import React, { useEffect, useRef, useState } from "react";
import { Btn, Field, Icon, Logo, Photo, TopBar, Eyebrow, Stars } from "../ui.jsx";
import { STUDIO } from "../data.js";
import { emailOk } from "../utils.js";

/* ---------- Bienvenida ---------- */
export function Bienvenida({ app }) {
  const [i, setI] = useState(0);
  const slides = [
    { img: "hero-barre", t: "Donde entrenar se vuelve tu Ritual", s: "Primer studio especializado en Barre en Buenos Aires. Barre & Yoga en La Lucila." },
    { img: "yoga-mats", t: "Reservá tu clase en dos toques", s: "Horarios, lugares disponibles y tu pack, siempre a mano. Sin preguntar por WhatsApp." },
    { img: "mats-plantas", t: "Todo Loft en un solo lugar", s: "Clases, eventos, mats y avisos del estudio en una misma app." },
  ];
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % slides.length), 4200); return () => clearInterval(id); }, [slides.length]);
  const s = slides[i];
  return (
    <div className="screen" style={{ background: "var(--sage-800)" }}>
      <div className="grow" style={{ position: "relative", minHeight: 0 }}>
        {slides.map((sl, k) => (
          <div key={sl.img} style={{ position: "absolute", inset: 0, opacity: k === i ? 1 : 0, transition: "opacity 0.6s" }}>
            <Photo name={sl.img} alt="" cover h="100%" radius={0} bg="var(--sage-800)" />
          </div>
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(60,70,55,0.15) 0%, rgba(60,70,55,0) 35%, rgba(50,58,47,0.92) 100%)" }} />
        <div style={{ position: "absolute", top: 16, left: 24 }}><Logo h={30} white /></div>
        <div className="col g10" style={{ position: "absolute", left: 24, right: 24, bottom: 24, color: "#fff" }}>
          <Eyebrow style={{ color: "#d7dfd2" }}>{STUDIO.barrio} · {STUDIO.direccion}</Eyebrow>
          <h1 className="display h1" style={{ fontSize: 28, lineHeight: 1.05 }}>{s.t}</h1>
          <p style={{ margin: 0, color: "#e3e8df", fontSize: 14.5, lineHeight: 1.45 }}>{s.s}</p>
          <div className="row g6" aria-hidden="true">{slides.map((_, k) => <span key={k} style={{ width: k === i ? 22 : 6, height: 6, borderRadius: 3, background: k === i ? "#fff" : "rgba(255,255,255,0.45)", transition: "width 0.3s" }} />)}</div>
        </div>
      </div>
      <div className="footer" style={{ background: "var(--crema)", borderTop: 0, padding: "18px 20px calc(18px + env(safe-area-inset-bottom, 0px))" }}>
        <Btn onClick={() => app.go("login", { modo: "nueva" })}>Quiero empezar</Btn>
        <Btn kind="outline" onClick={() => app.go("login", { modo: "socia" })}>Ya soy socia, ingresar</Btn>
        <div className="row center g6 xs muted"><Stars v={5} /><span>{STUDIO.rating} en Google · {STUDIO.opiniones} opiniones</span></div>
      </div>
    </div>
  );
}

function DemoAviso({ texto }) {
  return (
    <div className="row g10" style={{ background: "var(--rosa-50)", border: "1px solid #ecd3d5", borderRadius: 14, padding: "10px 12px", alignItems: "flex-start" }}>
      <Icon name="info" size={18} color="#9a5a5e" style={{ marginTop: 1 }} />
      <span className="xs" style={{ color: "#7a4a4e", lineHeight: 1.45 }}>{texto}</span>
    </div>
  );
}

/* ---------- Login / registro (email + código, sin contraseña) ---------- */
export function Login({ app, params }) {
  const socia = params.modo === "socia";
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [err, setErr] = useState({});
  const [enviando, setEnviando] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  const seguir = () => {
    const e = {};
    if (!socia && nombre.trim().length < 2) e.nombre = "Contanos cómo te llamás.";
    if (!emailOk(email)) e.email = "Revisá el email, parece incompleto.";
    setErr(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    setTimeout(() => { setEnviando(false); setPaso(1); setTimeout(() => refs[0].current?.focus(), 50); }, 900);
  };
  const onCode = (k, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const n = [...code]; n[k] = d; setCode(n);
    if (d && k < 3) refs[k + 1].current?.focus();
    if (n.every((x) => x)) {
      setEnviando(true);
      setTimeout(() => {
        const nm = socia ? "Caro" : nombre.trim();
        app.dispatch({ type: "login", nombre: nm, email, tel, demo: socia });
        app.reset("inicio");
        app.toast(socia ? `¡Hola de nuevo, ${nm}!` : `¡Bienvenida a Loft, ${nm.split(" ")[0]}! Tu primera clase te espera.`);
      }, 900);
    }
  };
  const social = (prov) => {
    setEnviando(true);
    setTimeout(() => {
      const nm = socia ? "Caro" : (nombre.trim() || "Valentina Pérez");
      app.dispatch({ type: "login", nombre: nm, email: email || `${nm.split(" ")[0].toLowerCase()}@${prov.toLowerCase()}.com`, tel, demo: socia });
      app.reset("inicio");
      app.toast(`Ingresaste con ${prov} (simulado). ¡Hola, ${nm.split(" ")[0]}!`);
    }, 1100);
  };
  const onKey = (k, e) => { if (e.key === "Backspace" && !code[k] && k > 0) refs[k - 1].current?.focus(); };

  return (
    <div className="screen">
      <TopBar onBack={() => (paso ? setPaso(0) : app.back())} />
      <div className="scroll"><div className="pad" style={{ paddingTop: 8 }}>
        <Logo h={28} />
        {paso === 0 ? (
          <>
            <div className="col g6">
              <h1 className="display h1">{socia ? "Qué bueno verte" : "Creá tu cuenta"}</h1>
              <p className="muted" style={{ margin: 0 }}>{socia ? "Ingresá con el mismo email que usás para reservar. Te mandamos un código, sin contraseñas." : "Es gratis y te lleva un minuto. Después elegís tu primera clase."}</p>
            </div>
            <div className="col g14">
              {!socia && <Field label="Nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} err={err.nombre} autoComplete="name" placeholder="Tu nombre" />}
              <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} err={err.email} autoComplete="email" placeholder="vos@email.com" inputMode="email" />
              {!socia && <Field label="Celular (opcional)" type="tel" value={tel} onChange={(e) => setTel(e.target.value)} hint="Solo para avisarte si cambia una clase." inputMode="tel" placeholder="11 2345 6789" />}
            </div>
            <Btn onClick={seguir} disabled={enviando}>{enviando ? <span className="spin" /> : "Enviarme el código"}</Btn>
            <div className="or">o continuá con</div>
            <div className="row g10">
              <button className="social" onClick={() => social("Apple")}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.8zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.5z" /></svg> Apple</button>
              <button className="social" onClick={() => social("Google")}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z" /><path fill="#FBBC05" d="M5.3 14.3c-.5-1.5-.5-3.1 0-4.6V6.6H1.3c-1.7 3.4-1.7 7.4 0 10.8l4-3.1z" /><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.1 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" /></svg> Google</button>
            </div>
            <DemoAviso texto={socia ? "Prototipo: no se envía ningún mail. Poné cualquier email y después cualquier código de 4 números; entra con la cuenta de ejemplo (Caro)." : "Prototipo: no se envía ningún mail. Después del email, cualquier código de 4 números te deja entrar."} />
            {!socia && <p className="xs muted tc" style={{ margin: 0 }}>Al continuar aceptás la política de packs del estudio: duran 30 días y no son transferibles.</p>}
          </>
        ) : (
          <>
            <div className="col g6">
              <h1 className="display h1">Revisá tu mail</h1>
              <p className="muted" style={{ margin: 0 }}>Te mandamos un código de 4 dígitos a <b style={{ color: "var(--ink)" }}>{email}</b>.</p>
            </div>
            <DemoAviso texto="Prototipo: el código es de mentira. No llegó ningún mail; escribí 4 números cualesquiera (por ejemplo 1 2 3 4) y entrás." />
            <div className="row g10 center">
              {code.map((v, k) => (
                <input key={k} ref={refs[k]} value={v} onChange={(e) => onCode(k, e.target.value)} onKeyDown={(e) => onKey(k, e)} inputMode="numeric" aria-label={`Dígito ${k + 1}`} disabled={enviando}
                  style={{ width: 60, height: 68, textAlign: "center", fontFamily: "var(--display)", fontSize: 28, fontWeight: 600, border: `2px solid ${v ? "var(--sage-700)" : "var(--linea)"}`, borderRadius: 16, background: "#fff", outline: "none" }} />
              ))}
            </div>
            {enviando && <div className="row center g8 small muted"><span className="spin" style={{ borderColor: "var(--linea)", borderTopColor: "var(--sage-700)" }} /> Verificando…</div>}
            <button className="link" style={{ alignSelf: "center" }} onClick={() => app.toast("Te reenviamos el código.")}>No me llegó, reenviar</button>
          </>
        )}
      </div></div>
    </div>
  );
}
