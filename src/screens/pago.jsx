import React, { useEffect, useState } from "react";
import { Btn, Icon } from "../ui.jsx";
import { STUDIO } from "../data.js";
import { fmt } from "../store.js";

/* ============================================================
   Simulador de pago. Imita la ida a una app externa (banco,
   Mercado Pago, pasarela de tarjeta) y la vuelta a Loft.
   Es todo de mentira: no hay ninguna API real detrás.
   ============================================================ */
const SALDO = 1240500;
const CUIT = "27-28xxxxxx-4";
const nro = () => String(Math.floor(100000000 + Math.random() * 899999999));

function Pasos({ pasos, idx }) {
  return (
    <div className="col g10" style={{ width: "100%" }}>
      {pasos.map((p, i) => (
        <div key={p} className="row g10 small" style={{ color: i < idx ? "var(--sage-800)" : i === idx ? "var(--ink)" : "var(--gris-2)" }}>
          <span className="row center" style={{ width: 22, height: 22 }}>{i < idx ? <Icon name="check" size={18} stroke={2.6} color="var(--sage-700)" /> : i === idx ? <span className="spin" style={{ width: 16, height: 16, borderWidth: 2, borderColor: "var(--linea)", borderTopColor: "var(--sage-700)" }} /> : <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--linea)" }} />}</span>
          {p}
        </div>
      ))}
    </div>
  );
}

export function PagoSim({ metodo, monto, concepto, onDone, onClose }) {
  const [fase, setFase] = useState("abriendo"); // abriendo → app → procesando → ok
  const [idx, setIdx] = useState(0);
  const [comp] = useState(nro);
  const ext = { transf: { nombre: "Tu banco", color: "#1d3557", icon: "card", titulo: "Transferir dinero" }, mp: { nombre: "Mercado Pago", color: "#009ee3", icon: "card", titulo: "Pagar a LoftStudio" }, tarjeta: { nombre: "Pago seguro", color: "#3b3836", icon: "card", titulo: "Datos de la tarjeta" } }[metodo];
  const pasos = metodo === "transf" ? ["Validando destinatario", "Verificando saldo", "Enviando transferencia", "Transferencia acreditada"] : metodo === "mp" ? ["Verificando tu cuenta", "Procesando el pago", "Pago aprobado"] : ["Validando la tarjeta", "Autorizando con el banco", "Pago aprobado"];
  useEffect(() => { if (fase === "abriendo") { const t = setTimeout(() => setFase("app"), 1300); return () => clearTimeout(t); } }, [fase]);
  useEffect(() => {
    if (fase !== "procesando") return;
    if (idx >= pasos.length) { const t = setTimeout(() => setFase("ok"), 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setIdx(idx + 1), 900 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [fase, idx, pasos.length]);
  const [cvv, setCvv] = useState("");

  const marco = (children) => (
    <div className="sheet-bg" onClick={fase === "app" ? onClose : undefined}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={ext.nombre} onClick={(e) => e.stopPropagation()} style={{ borderRadius: 0, height: "100%", maxHeight: "100%", padding: 0, background: "#f4f5f7", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1b1b1f" }}>
        {children}
      </div>
    </div>
  );
  const barra = (
    <div className="row between" style={{ background: ext.color, color: "#fff", padding: "14px 16px", minHeight: 56 }}>
      <div className="row g10"><span className="row center" style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.2)" }}><Icon name={ext.icon} size={18} /></span><span style={{ fontWeight: 600, fontSize: 15 }}>{ext.nombre}</span></div>
      <span style={{ fontSize: 11, opacity: 0.8 }}>Simulación</span>
    </div>
  );
  const fila = (a, b, strong) => <div className="row between" style={{ padding: "10px 0", borderBottom: "1px solid #e6e7eb", fontSize: 14 }}><span style={{ color: "#6b6f78" }}>{a}</span><span style={{ fontWeight: strong ? 700 : 500, textAlign: "right" }}>{b}</span></div>;

  if (fase === "abriendo") return marco(
    <div className="col center g14" style={{ flex: 1, justifyContent: "center", textAlign: "center", padding: 24 }}>
      <span className="row center" style={{ width: 64, height: 64, borderRadius: 18, background: ext.color, color: "#fff" }}><Icon name={ext.icon} size={30} /></span>
      <span style={{ fontWeight: 600 }}>Abriendo {ext.nombre}…</span>
      <span className="spin" style={{ borderColor: "#e6e7eb", borderTopColor: ext.color }} />
      <span style={{ fontSize: 12, color: "#6b6f78" }}>Te llevamos a pagar y volvés a Loft automáticamente.</span>
    </div>
  );
  if (fase === "app") return marco(
    <>
      {barra}
      <div className="col g14" style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{ext.titulo}</span>
        <div style={{ background: "#fff", borderRadius: 14, padding: "4px 16px", border: "1px solid #e6e7eb" }}>
          {fila("Para", "LoftStudio Barre & Yoga")}
          {metodo === "transf" && fila("Alias", STUDIO.alias)}
          {metodo === "transf" && fila("CUIT", CUIT)}
          {metodo === "transf" && fila("Banco", "Mercado Pago")}
          {fila("Concepto", concepto)}
          {fila("Importe", fmt(monto), true)}
        </div>
        {metodo === "tarjeta" ? (
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e6e7eb" }} className="col g12">
            <div className="row between"><span style={{ fontSize: 12, color: "#6b6f78" }}>Tarjeta guardada</span><span style={{ fontSize: 12, fontWeight: 700, color: "#1a1f71" }}>VISA</span></div>
            <span style={{ fontFamily: "monospace", fontSize: 18, letterSpacing: 2 }}>•••• •••• •••• 4417</span>
            <div className="row g10"><div className="col grow"><span style={{ fontSize: 11, color: "#6b6f78" }}>Vence</span><span style={{ fontSize: 14 }}>08/29</span></div><div className="col"><span style={{ fontSize: 11, color: "#6b6f78" }}>CVV</span><input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" placeholder="•••" aria-label="Código de seguridad" style={{ width: 70, height: 40, border: "1px solid #d8dae0", borderRadius: 8, padding: "0 10px", fontSize: 16, letterSpacing: 3 }} /></div></div>
            <span style={{ fontSize: 11, color: "#6b6f78" }}>Hasta 3 cuotas sin interés con tarjetas bancarias.</span>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e6e7eb" }} className="row between">
            <div className="col"><span style={{ fontSize: 12, color: "#6b6f78" }}>{metodo === "mp" ? "Dinero disponible" : "Caja de ahorro en pesos"}</span><span style={{ fontSize: 15, fontWeight: 600 }}>{metodo === "mp" ? "Cuenta de Mercado Pago" : "···· 4417"}</span></div>
            <div className="col" style={{ alignItems: "flex-end" }}><span style={{ fontSize: 12, color: "#6b6f78" }}>Saldo</span><span style={{ fontSize: 15, fontWeight: 700 }}>{fmt(SALDO)}</span></div>
          </div>
        )}
        <span style={{ fontSize: 12, color: "#6b6f78", lineHeight: 1.5 }}>Esto es una simulación del prototipo: no se mueve dinero real ni se conecta con ningún banco.</span>
      </div>
      <div className="col g8" style={{ padding: "12px 20px 24px", background: "#fff", borderTop: "1px solid #e6e7eb" }}>
        <button onClick={() => { setIdx(0); setFase("procesando"); }} disabled={metodo === "tarjeta" && cvv.length < 3} style={{ minHeight: 50, borderRadius: 12, border: 0, background: ext.color, color: "#fff", fontWeight: 700, fontSize: 15, opacity: metodo === "tarjeta" && cvv.length < 3 ? 0.5 : 1 }}>{metodo === "transf" ? `Transferir ${fmt(monto)}` : `Pagar ${fmt(monto)}`}</button>
        <button onClick={onClose} style={{ minHeight: 44, border: 0, background: "transparent", color: "#6b6f78", fontWeight: 600 }}>Cancelar y volver a Loft</button>
      </div>
    </>
  );
  if (fase === "procesando") return marco(
    <>
      {barra}
      <div className="col center g20" style={{ flex: 1, justifyContent: "center", padding: 28 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Procesando {fmt(monto)}</span>
        <Pasos pasos={pasos} idx={idx} />
        <span style={{ fontSize: 12, color: "#6b6f78" }}>No cierres esta pantalla.</span>
      </div>
    </>
  );
  return marco(
    <>
      {barra}
      <div className="col center g12" style={{ flex: 1, justifyContent: "center", padding: 24, textAlign: "center" }}>
        <span className="check-anim row center" style={{ width: 76, height: 76, borderRadius: 38, background: "#2e7d4f" }}><Icon name="check" size={34} stroke={2.8} color="#fff" /></span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>{metodo === "transf" ? "Transferencia realizada" : "Pago aprobado"}</span>
        <span style={{ fontSize: 14, color: "#6b6f78" }}>{fmt(monto)} a LoftStudio Barre & Yoga</span>
        <div style={{ background: "#fff", borderRadius: 14, padding: "4px 16px", border: "1px solid #e6e7eb", width: "100%", textAlign: "left" }}>
          {fila("Comprobante", `N° ${comp}`)}
          {fila("Fecha", new Date().toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }))}
          {fila("Estado", "Acreditado", true)}
        </div>
        <span style={{ fontSize: 12, color: "#6b6f78" }}>El comprobante ya quedó guardado en Loft. No hace falta mandarlo por WhatsApp.</span>
      </div>
      <div style={{ padding: "12px 20px 24px", background: "#fff", borderTop: "1px solid #e6e7eb" }}>
        <button onClick={() => onDone({ comprobante: comp, metodo })} style={{ minHeight: 50, width: "100%", borderRadius: 12, border: 0, background: "var(--sage-700)", color: "#fff", fontWeight: 700, fontSize: 15 }}>Volver a Loft</button>
      </div>
    </>
  );
}

/* Código para pagar en efectivo en recepción */
export function CodigoEfectivo({ codigo, monto, vence }) {
  return (
    <div className="card p col center g8 tc" style={{ border: "2px dashed var(--linea)", boxShadow: "none" }}>
      <span className="eyebrow">Mostrá este código en recepción</span>
      <span className="display" style={{ fontSize: 30, letterSpacing: "0.12em" }}>{codigo}</span>
      <span className="small b">{fmt(monto)} en efectivo</span>
      <span className="xs muted">Te guardamos la reserva hasta el {vence}. Si no venís, se libera.</span>
    </div>
  );
}
