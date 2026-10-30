# LoftStudio · App (prototipo)

Prototipo de la app oficial de **Loft Studio Barre & Yoga** (Ada Elflein 4025, La Lucila).
Trabajo práctico de Gestión de Productos Digitales 2 · UdeSA · Equipo 5.

## Correr en local
```bash
npm install
npm run dev
```

## Subir a Vercel
1. Subí esta carpeta a un repo de GitHub.
2. En Vercel: **Add New → Project → importá el repo**. Detecta Vite solo (build `npm run build`, salida `dist`).
3. Deploy. Listo.

## Qué es real y qué es simulado
- **Real** (web, Instagram y Google del estudio, oct 2026): logo, grilla semanal, tipos de clase y descripciones, packs y precios por medio de pago, política de packs, alias de transferencia, dirección, teléfono, rating de Google, seguidores, mats (8 modelos a $130.000), eventos del estudio (Clínica Barre, Encuentros, Loft Reset), alquiler del Loft, testimonios y la historia de Flor Méndez.
- **Simulado**: cupos por clase (10), qué horarios da cada profe (solo Flor es pública; el resto figura como "Equipo Loft"), fechas y precios de los próximos eventos, envío a domicilio, la cuenta demo (Caro) y todo lo que pasa "del lado del estudio" (pagos, comprobantes, lugares liberados).
- Todo el estado se guarda en el navegador (localStorage). "Reiniciar demo" en Perfil lo borra.
