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
            {socia && <p className="xs muted tc" style={{ margin: 0 }}>Demo: cualquier email entra con la cuenta de ejemplo.</p>}
            {!socia && <p className="xs muted tc" style={{ margin: 0 }}>Al continuar aceptás la política de packs del estudio: duran 30 días y no son transferibles.</p>}
          </>
        ) : (
          <>
            <div className="col g6">
              <h1 className="display h1">Revisá tu mail</h1>
              <p className="muted" style={{ margin: 0 }}>Te mandamos un código de 4 dígitos a <b style={{ color: "var(--ink)" }}>{email}</b>. En esta demo, cualquier código sirve.</p>
            </div>
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
