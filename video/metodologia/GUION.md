# Video: Cómo funciona el programa de Nutrición.Health

Para pacientes · vertical 1080×1920 · 66 s · voz "Nutrición.Health – Educadora" · **sin protagonista: todo animado en código** (como la versión 1 del video GLP-1).

Archivos: `metodologia.html` (animación), `voz/m1..m9.mp3`, `mezcla.py` → `mezcla.m4a`, video final `como-funciona-el-programa.mp4`.
Grabar: `PAGE=metodologia/metodologia.html AUDIO=metodologia/mezcla.m4a node render.js salida.mp4` (desde `video/`).

> La tabla de abajo es el borrador original; las escenas finales usan íconos y gráficas en vez de imágenes de la protagonista. Cierre final: "¿Quieres ser de los primeros? Regístrate y te avisamos." → logo y nutricion.health. Costo real: ~1,000 créditos (solo voz).
Fuente del contenido: www.nutricion.health (repositorio Nutricion-Health/home).

| # | Tiempo | Narración | Qué se ve |
|---|---|---|---|
| 1 | 0–6 s | Tu cita con el médico dura unos quince minutos. ¿Te alcanza para entender tu diabetes? | Ella en el consultorio (imagen nueva, con movimiento en código). Un reloj que corre de 0 a 15 min. Texto: "13–16 min por consulta"¹ |
| 2 | 6–12 s | Tu médico trata la enfermedad. Nosotros te enseñamos a vivir con ella, todos los días. | Transición a su cocina (clip de la persona comiendo, ya existe) |
| 3 | 12–21 s | Son ocho sesiones de una hora, en grupo pequeño, de no más de diez personas. Por Zoom, desde tu casa, y en español. | Ella en la mesa con el celular en videollamada (imagen nueva). En código: 8 puntos que se llenan y 10 figuras en círculo |
| 4 | 21–28 s | Las guía Giovanna Gierbolini, nutricionista-dietista registrada y especialista en diabetes. | Tarjeta con nombre y credenciales: RDN, DSMES, credencial Medicare (foto real de Giovanna si la envían; no se genera con IA) |
| 5 | 28–40 s | Aprendes a leer tu glucómetro y a entender tus números. A comer sin renunciar a tu comida. Y tienes tiempo de verdad para preguntar todo. | Ella mirando su glucómetro (imagen nueva) → clip del plato boricua (ya existe) → íconos de pregunta |
| 6 | 40–54 s | Funciona así: tu médico te da la tarjeta de referido. Tú nos contactas. Te unes al grupo. Y tu médico recibe un resumen de tu progreso. | Los 4 pasos animados en código, uno por frase, con línea que regresa al médico |
| 7 | 54–60 s | No reemplazamos a tu médico. Lo complementamos. | Médico + paciente conectados (código). Dato opcional: "–1.0% HbA1c con educación estructurada"¹ |
| 8 | 60–67 s | Entiende tu diabetes. Vive con confianza. | Clip de ella caminando frente al mar (ya existe) |
| 9 | 67–72 s | ¿Quieres ser de los primeros? Regístrate y te avisamos. | Clip de cierre (ya existe) → logo, nutricion.health y botón "Quiero ser notificado" |

¹ Fuentes pendientes (las añade Nutrición.Health). Se muestran en letra pequeña en pantalla.

## Presupuesto (créditos ElevenLabs disponibles: ~16,000)
- 3 imágenes nuevas de la protagonista (consultorio, videollamada, glucómetro), 1 toma cada una a 2K: ~7,300
- Voz: 9 frases, 2 tomas: ~1,500
- Música nueva (opcional; si no, se reusa la del video GLP-1): ~1,000–2,000
- Clips de video nuevos: ninguno (se reusan 4 clips ya pagados)
- Total estimado: ~10,000–11,000

## Versión 2 (con consultas individuales) · 74 s
Igual que la versión 1, más una escena de 8 s después de "Lo complementamos" (53.35 s):
> ¿Prefieres atención individual? También ofrecemos consultas uno a uno con Giovanna, y con Medicare pueden ser sin costo.

En pantalla: "Consultas individuales · uno a uno con Giovanna · MNT", con evaluación nutricional, plan de alimentación personalizado, seguimiento continuo y "$0 con Medicare en casos elegibles".
Archivos: `metodologia-v2.html`, `voz/m7b.mp3`, `python3 mezcla.py v2` → `mezcla-v2.m4a`, video `como-funciona-el-programa-v2.mp4`.
