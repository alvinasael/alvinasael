# GLP-1: el mensajero que tu cuerpo ya conoce

Video vertical (1080×1920), 63 s, voz narrada + música + texto en pantalla.

| Tiempo | Narración (igual al texto en pantalla) |
|---|---|
| 0.0–6.7 s | ¿Sabías que tu cuerpo ya produce GLP-1? Cada vez que comes, tu intestino lo suelta. |
| 6.7–12.5 s | Es una hormona mensajera: avisa que llegó comida. Pero la natural dura apenas unos minutos. |
| 12.5–19.0 s | El medicamento GLP-1 es una copia que dura mucho más. Por eso muchas se aplican una vez por semana. |
| 19.0–23.6 s | Al páncreas le dice: suelta insulina, pero solo cuando la glucosa está alta. |
| 23.6–26.6 s | Al hígado: suelta menos azúcar. |
| 26.6–29.7 s | Al estómago: vacíate más despacio. |
| 29.7–32.7 s | Y al cerebro: ya estás lleno. |
| 32.7–35.8 s | Tres historias que se juntan en una sola. |
| 35.8–39.5 s | Uno: más insulina, justo cuando hace falta. |
| 39.5–42.5 s | Dos: menos azúcar saliendo del hígado. |
| 42.5–45.6 s | Tres: la comida entra más despacio. |
| 45.6–50.6 s | Juntas logran lo principal: una glucosa más estable, después de comer y en ayunas. |
| 50.6–55.5 s | Y como beneficio adicional: menos apetito y, para muchas personas, menos peso. |
| 55.5–59.6 s | Algunos GLP-1 también protegen el corazón y los riñones. |
| 59.6–62.6 s | Cierre con el logo |

## Escenas 3D (Three.js)
- **0–6.7 s · Del plato al intestino:** plato de arroz con habichuelas, ensalada y tostones; la cámara baja hasta la comida y entra al intestino, donde las células (puntos ámbar) sueltan GLP-1 (hélices verdes).
- **6.7–19 s · Viaje por el vaso sanguíneo:** glóbulos rojos en 3D; el GLP-1 natural se deshace y el medicamento (hélice con marca ámbar) se queda. El reloj y el calendario van encima.
- Código en `escenas3d.js`; Three.js r149 local en `vendor/` (licencia MIT), sin depender de internet.
- Todo lo demás del video sigue en 2D, con el mismo estilo de los slides.

## Audio
- Voz: OpenAI TTS, voz **Nova**, generada con Artificial Studio (`voces/narracion-nova.mp3`).
- Música: MusicGen, clip de 8 s en bucle con fundido cruzado; baja de volumen cuando habla la voz (`voces/musica.wav`).
- Costo total en Artificial Studio: 18 créditos (prueba de 3 voces 6, narración 9, música 3).

## Cómo volver a generarlo
1. `voces/tiempos.json`: dónde empieza y termina cada frase dentro de la narración.
2. `voces/montaje.json`: en qué segundo del video va cada escena (lo calcula el ajuste en `glp1-video.html`).
3. `python3 mezcla.py` arma `voces/mezcla.m4a` (voz + música).
4. `node render.js` graba `glp1-como-funciona.mp4` con el audio (requiere Playwright y ffmpeg).

Si cambias el texto de la narración, hay que generar el audio de nuevo y actualizar `tiempos.json`.

Los valores de glucosa (156 → 138 en ayunas, 232 → 180 después de comer) son ilustrativos.
Pendiente de revisión clínica: la frase sobre corazón y riñones.
