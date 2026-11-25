# Video: "El poder de un 1%" — guion v15 (v1 en historial git)

Formato: 9:16 · ~65 s · voz Educadora (una sola toma) · animación de números (estilo videos anteriores)

| # | Narración | En pantalla |
|---|-----------|-------------|
| 1 | Tu médico te habla de tu A1c… pero ¿sabes cuánto puede cambiar tu vida reducirla en un uno por ciento? | "A1c" grande · "¿Cuánto cambia tu vida bajarla 1%?" |
| 2 | La A1c es un análisis de sangre que muestra tu promedio de azúcar de los últimos tres meses, no solo lo de un día. Bajar un uno por ciento parece poco… | Tubo de sangre → calendario de 3 meses → medidor 8% → 7% |
| 3 | …pero estudios con miles de personas encontraron que, por cada uno por ciento menos, hay: | "Por cada 1% menos de A1c:" |
| 4 | veintiún por ciento menos muertes relacionadas con la diabetes, | **–21%** muertes por diabetes |
| 5 | catorce por ciento menos infartos, | **–14%** infartos |
| 6 | treinta y siete por ciento menos daño en tus ojos, tus riñones y tus nervios, | **–37%** daño en ojos, riñones y nervios (iconos) |
| 6b | y treinta y cuatro por ciento de reducción en las hospitalizaciones. | **–34%** hospitalizaciones |
| 7 | ¿Y cómo podemos bajar un uno por ciento de A1c? *(pausa ~1 s)* | Slide propio: "¿Y cómo bajamos un 1% de A1c?" centrado |
| 8 | Se ha encontrado que una educación estructurada en diabetes baja la A1c hasta un uno por ciento: tanto como un medicamento. | **hasta –1%** · "comparable a un medicamento" |
| 8b | Ahora, ¿qué es una educación estructurada? Hablar de una educación estructurada es más que recibir información. Es un camino con un orden: primero entiendes tu diabetes, luego aprendes a tomar decisiones en tu día a día, y después las conviertes en hábitos que se quedan contigo. | Camino de 3 pasos: Entender → Decidir → Mantener |
| 9 | Según las investigaciones en este tema, aquellos quienes participaron en un programa de este tipo bajaron uno punto uno por ciento… frente a solo tres décimas con el cuidado usual. | Barras: –1.1% vs –0.3% |
| 11 | Esto es lo que te ofrecemos en Nutrición punto Health: un programa completo de ocho semanas, en vivo, desde tu casa, con un plan nutricional hecho para ti… y siempre en complemento con el seguimiento de tu médico. | Logo · "Programa completo · 8 semanas · en vivo · desde tu casa" · "Plan nutricional personalizado" · "+ tu médico" |
| 12 | Porque un uno por ciento… puede cambiarlo todo. | Resumen visual: "–1% A1c" al centro, rodeado de –21% muertes · –14% infartos · –37% ojos/riñones/nervios · –34% hospitalizaciones · "1% puede cambiarlo todo." (tono de cierre) |

## Fuentes (nota al pie del video)
- –21% / –14% / –37%: Stratton et al., UKPDS 35, BMJ 2000 (asociación por cada 1% de A1c).
- Hasta –1%: ADA Standards of Care 2025; Health Affairs Scholar 2024.
- –1.1% vs –0.3%: Latino Health Access, PMC9831659.
- –34% hospitalizaciones: CDC (DSMES).

## Producción (v11)
- Voz: `voz/narracion.mp3` (90.6 s, una sola toma, voz Educadora). Transcripción por palabra: `voz/palabras.json` → `voz/habladas.json`.
- Tiempos: `python3 tiempos.py` → `tiempos.json` (y los inserta en `impacto.html`).
- Audio: `python3 mezcla.py` → `mezcla.m4a` (música 4 con ducking + efectos).
- Video: `PAGE=impacto/impacto.html AUDIO=impacto/mezcla.m4a node render.js impacto/el-poder-de-un-1.mp4` (97 s).

## v13 provisional (sin voz) — créditos agotados hasta el 22 dic 2026
- `voz/provisional.py` estima los tiempos: el inicio nuevo al ritmo de la voz v1, el resto con los tiempos reales de v1.
- `mezcla.py` sin `voz/narracion.mp3` → `mezcla-sin-voz.m4a` (música + efectos). Video: `el-poder-de-un-1-v2-sin-voz.mp4`.
- Para agregar la voz: generar la narración v13 → `voz/narracion.mp3`, transcribir → `voz/palabras.json` → `voz/habladas.json`,
  luego `python3 tiempos.py && python3 mezcla.py` y renderizar `el-poder-de-un-1-v2.mp4`.
