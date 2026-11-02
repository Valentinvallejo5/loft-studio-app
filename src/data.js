/* ============================================================
   Datos de LoftStudio. Todo lo marcado [REAL] sale de
   loftstudio.com.ar, su Instagram (@loftstudioar) y Google Maps
   (octubre 2026). Lo marcado [SIMULADO] es relleno del prototipo.
   ============================================================ */

export const STUDIO = {
  nombre: "LoftStudio",
  tagline: "Barre & Yoga", // [REAL] logo
  claim: "Donde entrenar se vuelve tu Ritual", // [REAL] linktree
  claimIg: "El mejor Studio de Barre en ZN", // [REAL] bio Instagram
  descripcion: "Primer Studio especializado en Clases de Barre en Buenos Aires.", // [REAL] home
  direccion: "Av. Ada Elflein 4025", // [REAL]
  barrio: "La Lucila", // [REAL]
  lat: -34.4956085, // [REAL] Google Maps
  lng: -58.4902617,
  telefono: "011 15-6050-2294", // [REAL] Google Maps
  whatsapp: "https://wa.link/mw4afi", // [REAL]
  instagram: "loftstudioar", // [REAL]
  web: "loftstudio.com.ar", // [REAL]
  seguidores: "17,9 mil", // [REAL] Instagram
  rating: 4.7, // [REAL] Google
  opiniones: 140, // [REAL] Google
  alias: "loftestudio", // [REAL] alias MP para transferencias
  fundadora: "Flor Méndez", // [REAL]
  historia:
    "Descubrí el Barre y enseguida sentí que había encontrado algo que me hacía bien. Me daba energía, me ayudaba a despejarme y en un momento personal, se convirtió en una forma de volver a conectar conmigo. Me gustó tanto que no quise dejar de hacerlo. Y quise compartirlo con otras mujeres. Así nació Loft Studio.", // [REAL] home
  politicaPack:
    "El pack de clases dura 30 días desde el día de la compra. Los packs no son transferibles a otras personas y tampoco se puede extender la fecha del mismo si no pudiste venir a las clases.", // [REAL]
  testimonios: [
    // [REAL] home
    { n: "Julieta P.", t: "Un lugar único en La Lucila. Cálido, agradable. Las profes son lo más! Te sentís realmente parte de una comunidad de mujeres." },
    { n: "Indigo S.", t: "Amo Loft. En muy poco tiempo se convirtió en un refugio para mí. Las profesoras súper amorosas. Todas te conocen por nombre." },
    { n: "Clara M.", t: "El lugar es lindísimo, lleno de plantas, con una energía súper especial desde que entrás hasta que salís." },
  ],
};

/* ---------- Tipos de clase [REAL] (descripciones de la web) ---------- */
export const TYPES = {
  barre: {
    nombre: "Barre",
    dur: 55,
    nivel: "Todos los niveles",
    color: "sage",
    desc: "Entrenamiento de cuerpo completo, enfocado en piernas, glúteos, core y brazos. Inspirado en Ballet, Pilates y entrenamiento funcional: las posturas de ballet se adaptan al trabajo de fuerza para mejorar la postura, el equilibrio y tonificar. Es una clase dinámica donde usamos distintos elementos.",
    traer: "Medias antideslizantes. Mancuernas, bandas y pelota las tenés en el estudio.",
  },
  integral: {
    nombre: "Yoga Integral",
    dur: 60,
    nivel: "Suave",
    color: "clay",
    desc: "Práctica completa donde trabajamos el cuerpo, la respiración y la relajación en una misma clase. Buscamos fuerza, movilidad y equilibrio sin exigencia, con bloques, cintos o bolsters como parte central de la experiencia. Un espacio para moverte con presencia, dejarte sostener y bajar un cambio.",
    traer: "Ropa cómoda. Mats y elementos los tenés en el estudio.",
  },
  vinyasa: {
    nombre: "Hatha Vinyasa",
    nombreLargo: "Yoga Hatha Vinyasa",
    dur: 60,
    nivel: "Intermedio",
    color: "clay",
    desc: "Nos movemos al ritmo de la respiración: las posturas se conectan una con otra, sin pausas largas. Es una clase más dinámica, trabajamos fuerza, movilidad y equilibrio, pero siempre escuchando el cuerpo. No se trata de hacerlo perfecto, sino de moverse, sentir y disfrutar.",
    traer: "Ropa cómoda y una botella de agua.",
  },
  stretching: {
    nombre: "Stretching",
    dur: 50,
    nivel: "Todos los niveles",
    color: "sand",
    desc: "Clase enfocada en estirar el cuerpo de forma consciente y progresiva. Trabajamos la movilidad, liberamos tensiones y mejoramos la flexibilidad. Ideal si te sentís cargada, contracturada o simplemente querés moverte más suave y salir liviana.",
    traer: "Ropa cómoda. Ideal para después de una semana cargada.",
  },
};

/* ---------- Grilla semanal [REAL] (web, oct 2026) ---------- */
// dia: 0 = lunes … 5 = sábado
export const GRID = [
  [0, "08:30", "barre"], [0, "09:30", "barre"], [0, "18:30", "barre"], [0, "19:30", "barre"],
  [1, "08:00", "barre"], [1, "09:00", "integral"], [1, "17:30", "barre"], [1, "18:30", "barre"], [1, "19:30", "vinyasa"],
  [2, "08:30", "barre"], [2, "09:30", "barre"], [2, "17:30", "barre"], [2, "18:30", "barre"], [2, "19:30", "barre"],
  [3, "08:00", "barre"], [3, "09:00", "integral"], [3, "17:30", "barre"], [3, "18:30", "barre"], [3, "19:30", "vinyasa"],
  [4, "08:30", "barre"], [4, "09:30", "stretching"], [4, "11:00", "barre"], [4, "17:30", "barre"], [4, "18:30", "barre"],
  [5, "10:00", "barre"], [5, "11:00", "barre"],
];

/* ---------- Profes ----------
   [REAL] Flor Méndez es la creadora y profe de Barre (@soyflormendez).
   El resto del equipo no está publicado con nombre: usamos "Equipo Loft". */
export const PROFES = {
  flor: { nombre: "Flor Méndez", rol: "Creadora de LoftStudio · Barre", ini: "FM", ig: "soyflormendez", real: true },
  loft: { nombre: "Equipo Loft", rol: "Profes de LoftStudio", ini: "L", real: false },
};
// [SIMULADO] qué horarios da Flor
export const profeDe = (dia, hora, tipo) => (tipo === "barre" && ["18:30", "19:30", "10:00"].includes(hora) ? "flor" : "loft");

export const CUPO = 10; // [SIMULADO] lugares por clase

/* ---------- Packs y precios [REAL] ---------- */
export const PACKS = [
  { id: "suelta", nombre: "Clase suelta", clases: 1, efectivo: 28000, transf: 28000, tarjeta: 32000 },
  { id: "p4", nombre: "Pack 4 clases", clases: 4, efectivo: 80000, transf: 83000, tarjeta: 88000 },
  { id: "p8", nombre: "Pack 8 clases", clases: 8, efectivo: 90000, transf: 92000, tarjeta: 96000, destacado: true },
  { id: "p12", nombre: "Pack 12 clases", clases: 12, efectivo: 95000, transf: 97000, tarjeta: 101000 },
  { id: "p18", nombre: "Pack 18 clases", clases: 18, efectivo: 112000, transf: 120000, tarjeta: 125000 },
  { id: "yoga8", nombre: "Pack YOGA 8 clases", clases: 8, soloYoga: true, efectivo: 77000, transf: 80000, tarjeta: 85000 },
];

/* ---------- Tienda [REAL] mats ---------- */
export const MAT_PRICE = 130000;
export const MATS = [
  { id: "rect-gris-logo", shape: "rect", color: "gris", ed: "logo", tag: "con logo", img: "mat-rect-gris" },
  { id: "rect-verde", shape: "rect", color: "verde", ed: "logo", tag: "", img: "mat-rect-verde" },
  { id: "oval-verde", shape: "oval", color: "verde", ed: "logo", tag: "", img: "mat-oval-verde" },
  { id: "oval-gris-logo", shape: "oval", color: "gris", ed: "logo", tag: "con logo", img: "mat-oval-gris" },
  { id: "rect-gris-the", shape: "rect", color: "gris", ed: "the", tag: "edición “be the energy”", img: "mat-rect-gris-bethe" },
  { id: "rect-gris-kind", shape: "rect", color: "gris", ed: "kind", tag: "edición “be kind”", img: "mat-rect-gris-bekind" },
  { id: "oval-gris-the", shape: "oval", color: "gris", ed: "the", tag: "edición “be the energy”", img: "mat-oval-gris-bethe", fit: "cover" },
  { id: "oval-gris-kind", shape: "oval", color: "gris", ed: "kind", tag: "edición “be kind”", img: "mat-oval-gris-bekind" },
];
export const matById = (id) => MATS.find((m) => m.id === id);
export const matKey = (s, c, e) => (c === "verde" ? `${s}-verde` : `${s}-gris-${e}`);
export const dimsOf = (shape) => (shape === "rect" ? "183 × 61 cm" : "183 × 68 cm");
export const matTitle = (m) => `Yoga Mat ${m.shape === "rect" ? "Rectangular" : "Ovalado"} ${m.color === "verde" ? "Verde" : "Gris"}`;

// [PROPUESTA] accesorios que hoy no se venden en la web
export const PROPS = [
  { id: "medias", name: "Medias antideslizantes", sub: "Con agarre · par", img: "prop-medias", src: "Unsplash" },
  { id: "mancuernas", name: "Mancuernas Loft", sub: "1 kg · par (las de las clases)", img: "accesorios-loft", src: "LoftStudio" },
  { id: "pelota", name: "Pelota de pilates", sub: "La que usamos en Barre", img: "accesorios-loft", src: "LoftStudio", crop: "bottom" },
  { id: "bandas", name: "Bandas elásticas", sub: "Distintas resistencias", img: "prop-bandas", src: "Unsplash" },
  { id: "bloques", name: "Bloques de yoga", sub: "Corcho · par", img: "prop-bloques", src: "Unsplash" },
];

export const PAGOS = [
  { id: "mp", t: "Mercado Pago", s: "Dinero en cuenta, tarjetas y más", n: "Te llevamos a Mercado Pago para completar el pago de forma segura y volvés a la app." },
  { id: "tarjeta", t: "Tarjeta de crédito o débito", s: "Pagás en la app", n: "Ingresás los datos de tu tarjeta en un formulario seguro. Aceptamos crédito y débito." },
  { id: "transf", t: "Transferencia bancaria", s: `Alias ${STUDIO.alias} · subís el comprobante acá`, n: `Al confirmar te mostramos el alias ${STUDIO.alias} para transferir. Subí el comprobante desde la app, sin mandarlo por WhatsApp.` },
  { id: "efectivo", t: "Efectivo en el estudio", s: "Pagás cuando venís", n: "Reservamos tu compra y la abonás en efectivo cuando pasás por Loft." },
];

/* ---------- Eventos ---------- */
export const EVENTOS = [
  {
    id: "clinica",
    tag: "CLÍNICA BARRE", // [REAL] existe como destacado de IG
    titulo: "Clínica de Barre: técnica desde cero",
    fecha: "Sábado 8 de noviembre", hora: "12:30", dur: "90 min", lugares: 8, precio: 32000, // [SIMULADO]
    desc: "Un encuentro para entender el método: alineación, pulsos chiquitos, control y cómo activar cada grupo muscular. Ideal si empezaste hace poco o querés pulir tu técnica.",
    img: "hero-barre", dark: true,
  },
  {
    id: "encuentro",
    tag: "ENCUENTROS 🧚", // [REAL] destacado de IG
    titulo: "Barre + Sound Healing + brunch",
    fecha: "Domingo 23 de noviembre", hora: "10:30", dur: "2 h 30", lugares: 6, precio: 45000, // [SIMULADO] replica el formato real del Día de la Madre (25/10)
    desc: "Repetimos el formato del Día de la Madre: una clase de Barre, un cierre de Sound Healing y un brunch para compartir entre todas. Cupos limitados.",
    img: "yoga-mats", dark: false,
  },
  {
    id: "reset",
    tag: "LOFT RESET", // [REAL] destacado de IG; escapada con @makaku.house
    titulo: "Loft Reset: escapada de un día",
    fecha: "Sábado 13 de diciembre", hora: "09:00", dur: "Todo el día", lugares: 0, precio: 0,
    desc: "Un día fuera de la ciudad para moverte, respirar y desconectar, con clases al aire libre y almuerzo. Como el Reset que hicimos en Makaku House.",
    img: "mats-plantas", dark: false, listaEspera: true,
  },
];

export const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DIAS_LARGO = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/* ---------- Novedades [REAL] últimos posts de @loftstudioar ---------- */
export const NOVEDADES = [
  { fecha: "27 oct", t: "Así vivimos el Día de la Madre en Loft", s: "Clase de barre + sound healing + brunch, sorpresas y regalitos para compartir. Gracias a @organicareal y @zapateriafebo.", img: "yoga-mats", likes: 96 },
  { fecha: "7 oct", t: "Diccionario de Barre, parte 2", s: "Palabras que escuchás en Barre y no sabés qué significan: pulsos chiquitos, tuck, relevé…", img: "hero-barre", likes: 138 },
  { fecha: "7 oct", t: "TIPS si te estás por comprar tu primer mat", s: "Los Mats de LoftStudio podés encontrarlos en la app o pedirlos en Loft.", img: "mats-plantas", likes: 50 },
  { fecha: "23 sep", t: "¿Barre y Pilates son lo mismo?", s: "Te contamos las diferencias y qué podés encontrar en una clase de Barre, para que sepas si es para vos.", img: "accesorios-loft", likes: 246 },
  { fecha: "21 sep", t: "Loft Reset con Makaku House", s: "Nos llevamos momentos, nuevas conexiones y ganas de repetirlo. Así vivimos este día de RESET.", img: "mats-plantas", likes: 85 },
];

/* ---------- Preguntas frecuentes (políticas reales del estudio) ---------- */
export const FAQ = [
  { q: "¿Cuánto dura un pack?", a: "30 días desde el día de la compra. No son transferibles a otras personas y no se puede extender la fecha si no pudiste venir." },
  { q: "¿Hasta cuándo puedo cancelar una clase?", a: "Sin costo hasta 2 horas antes. Después de ese horario la clase se descuenta igual del pack." },
  { q: "¿Qué tengo que llevar a Barre?", a: "Medias antideslizantes y ropa cómoda. Mancuernas, bandas, pelota y mats los tenés en el estudio." },
  { q: "¿Puedo venir sin pack?", a: "Sí, con clase suelta: $28.000 en efectivo o transferencia y $32.000 con tarjeta o Mercado Pago." },
  { q: "¿Cómo pago por transferencia?", a: `Desde la app te llevamos a tu banco con el alias ${STUDIO.alias} ya cargado. El comprobante queda guardado acá, no hace falta mandarlo por WhatsApp.` },
  { q: "¿Qué pasa si una clase está llena?", a: "Te anotás en la lista de espera. Si se libera un lugar te avisamos por la app y por mail, y tenés 15 minutos para tomarlo." },
  { q: "¿Se puede alquilar el Loft?", a: "Sí, para talleres, constelaciones y encuentros. Escribinos por WhatsApp y coordinamos." },
];
