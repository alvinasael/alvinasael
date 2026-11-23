# GLP-1: el mensajero que tu cuerpo ya conoce

Video vertical (1080×1920), 80 s, con voz, música, efectos de sonido y texto en pantalla.

| Tiempo | Narración (igual al texto en pantalla) |
|---|---|
| 0.0–7.1 s | ¿Sabías que tu cuerpo ya produce GLP-1? Cada vez que comes, tu intestino lo suelta. |
| 7.1–14.6 s | Es una hormona mensajera: avisa que llegó comida. Pero la natural dura apenas unos minutos. |
| 14.6–22.9 s | El medicamento GLP-1 es una copia que dura mucho más. Por eso muchas se aplican una vez por semana. |
| 22.9–29.5 s | Al páncreas le dice: suelta insulina, pero solo cuando la glucosa está alta. |
| 29.5–33.2 s | Al hígado: suelta menos azúcar. |
| 33.2–37.3 s | Al estómago: vacíate más despacio. |
| 37.3–40.8 s | Y al cerebro: ya estás lleno. |
| 40.8–44.7 s | Tres historias que se juntan en una sola. |
| 44.7–49.5 s | Uno: más insulina, justo cuando hace falta. |
| 49.5–53.6 s | Dos: menos azúcar saliendo del hígado. |
| 53.6–57.7 s | Tres: la comida entra más despacio. |
| 57.7–64.7 s | Juntas logran lo principal: una glucosa más estable, después de comer y en ayunas. |
| 64.7–71.6 s | Y como beneficio adicional: menos apetito y, para muchas personas, menos peso. |
| 71.6–77.0 s | Algunos GLP-1 también protegen el corazón y los riñones. |
| 77.0–80.0 s | Cierre con el logo |

## Escenas 3D (Three.js)
- **Del plato al intestino:** plato de arroz con habichuelas, ensalada y tostones; la cámara entra al intestino, donde las células (puntos ámbar) sueltan GLP-1 (hélices verdes).
- **Viaje por el vaso sanguíneo:** glóbulos rojos en 3D; el GLP-1 natural se deshace y el medicamento (hélice con marca ámbar) se queda.
- Código en `escenas3d.js`; Three.js r149 local en `vendor/` (licencia MIT). El resto del video es 2D.

## Audio (ElevenLabs)
- **Voz:** "Nutrición.Health – Educadora", voz puertorriqueña diseñada en ElevenLabs y guardada en la cuenta (`voice_id 3Hh6aIdDpasRtIYLDdKL`). Modelo eleven_v4, una frase por archivo (`voces/elevenlabs/frases/`). "GLP-1" se escribe "G L P uno" para que lo lea en español.
- **Música:** Eleven Music v2.5, 80 s instrumental (cuatro puertorriqueño, marimba, percusión suave), con secciones que siguen las escenas. Hay 4 versiones en `voces/elevenlabs/musica/`; se usa la 1, la que mejor sigue la curva de energía pedida.
- **Efectos:** ElevenLabs Sound Effects v3 (`voces/elevenlabs/sfx/`), ubicados según `voces/elevenlabs/momentos.json`. El tic-tac del reloj se arma con el clic suave, porque el efecto de reloj salió casi mudo.
- Créditos usados en ElevenLabs: unos 7,200 de 131,000 del mes.
- La versión anterior con la voz Nova (Artificial Studio) quedó en `voces/mezcla-nova.m4a`.

## Cómo volver a generarlo
1. `voces/montaje.json`: en qué segundo va cada frase y cada escena.
2. `python3 mezcla_elevenlabs.py [1-4]`: arma `voces/mezcla.m4a` (el número elige la música).
3. `node render.js` graba el video con ese audio, o une `glp1-mudo.mp4` con la mezcla:
   `ffmpeg -i glp1-mudo.mp4 -i voces/mezcla.m4a -map 0:v -map 1:a -c copy -shortest glp1-como-funciona.mp4`

Los valores de glucosa son ilustrativos. Pendiente de revisión clínica: la frase sobre corazón y riñones.
