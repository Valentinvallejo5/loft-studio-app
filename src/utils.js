import { STUDIO } from "./data.js";
import { parseYmd, pad } from "./store.js";

/* Archivo .ics para "Agregar al calendario" */
export function descargarICS(c) {
  const [h, m] = c.hora.split(":").map(Number);
  const d = parseYmd(c.fecha); d.setHours(h, m, 0, 0);
  const e = new Date(d.getTime() + (c.dur || 60) * 60000);
  const f = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LoftStudio//App//ES", "BEGIN:VEVENT", `UID:${c.id}@loftstudio.com.ar`, `DTSTART:${f(d)}`, `DTEND:${f(e)}`, `SUMMARY:${c.nombre} · LoftStudio`, `LOCATION:${STUDIO.direccion}, ${STUDIO.barrio}`, `DESCRIPTION:Clase reservada desde la app de LoftStudio. Cancelación sin costo hasta 2 horas antes.`, "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Tu clase en Loft empieza en 1 hora", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `loft-${c.fecha}-${c.hora.replace(":", "")}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function compartir(title, text) {
  try {
    if (navigator.share) { await navigator.share({ title, text }); return "shared"; }
    await navigator.clipboard.writeText(`${title}\n${text}`); return "copied";
  } catch { return null; }
}
export async function copiar(t) { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } }

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Loft Studio Barre & Yoga, " + STUDIO.direccion + ", " + STUDIO.barrio)}`;
export const waUrl = STUDIO.whatsapp;
export const igUrl = `https://www.instagram.com/${STUDIO.instagram}/`;
export const telUrl = `tel:+5491160502294`;

export const inicial = (n = "") => n.trim().split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase() || "L";
export const primerNombre = (n = "") => n.trim().split(/\s+/)[0] || "";
export const tiempoRel = (ts) => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "ahora"; if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24); return d === 1 ? "ayer" : `hace ${d} días`;
};
export const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
