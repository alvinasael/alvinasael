# GLP-1: el mensajero que tu cuerpo ya conoce

Video vertical (1080×1920), 77 s (versión 2; la versión 1 dura 83 s), con voz, música, efectos de sonido y texto en pantalla.

| Tiempo | Narración (igual al texto en pantalla) |
|---|---|
| 0.0–7.1 s | ¿Sabías que tu cuerpo ya produce GLP-1? Cada vez que comes, tu intestino lo suelta. |
| 7.1–14.6 s | Es una hormona mensajera: avisa que llegó comida. Pero la natural dura apenas unos minutos. |
| 14.6–22.9 s | El medicamento GLP-1 es una copia que dura mucho más. Por eso muchas se aplican una vez por semana. |
| 22.9–29.5 s | Al páncreas le dice: suelta insulina, pero solo cuando la glucosa está alta. |
| 29.5–33.2 s | Al hígado: suelta menos azúcar. |
| 33.2–37.3 s | Al estómago: vacíate más despacio. |
| 37.3–40.8 s | Y al cerebro: ya estás lleno. |
| 40.8–44.3 s | Cuatro factores que trabajan juntos. |
| 44.3–49.1 s | Uno: más insulina, justo cuando hace falta. |
| 49.1–53.2 s | Dos: menos azúcar saliendo del hígado. |
| 53.2–57.3 s | Tres: la comida entra más despacio. |
| 57.3–62.0 s | Cuatro: menos hambre, así que se come menos. |
| 62.0–69.1 s | Juntos logran lo principal: una glucosa más estable, después de comer y en ayunas. |
| 69.1–74.0 s | ¿Tienes dudas sobre tu tratamiento? Contáctanos. |
| 74.0–77.0 s | Logo, con "¿Dudas sobre tu tratamiento? Contáctanos" |

En la versión 2 se quitaron las frases de beneficios adicionales (peso, corazón y riñones); siguen en la versión 1.

## Escenas 3D (Three.js)
- **Del plato al intestino:** plato de arroz con habichuelas, ensalada y tostones; la cámara entra al intestino, donde las células (puntos ámbar) sueltan GLP-1 (hélices verdes).
- **Viaje por el vaso sanguíneo:** glóbulos rojos en 3D; el GLP-1 natural se deshace y el medicamento (hélice con marca ámbar) se queda.
- Código en `escenas3d.js`; Three.js r149 local en `vendor/` (licencia MIT). El resto del video es 2D.

## Audio (ElevenLabs)
- **Voz:** "Nutrición.Health – Educadora", voz puertorriqueña diseñada en ElevenLabs y guardada en la cuenta (`voice_id 3Hh6aIdDpasRtIYLDdKL`). Modelo eleven_v4, una frase por archivo (`voces/elevenlabs/frases/`). "GLP-1" se escribe "G L P uno" para que lo lea en español.
- **Música:** Eleven Music v2.5, 80 s instrumental (cuatro puertorriqueño, marimba, percusión suave), con secciones que siguen las escenas. Hay 4 versiones en `voces/elevenlabs/musica/`; se usa la 4, elegida por Nutrición.Health.
- **Efectos:** ElevenLabs Sound Effects v3 (`voces/elevenlabs/sfx/`), ubicados según `voces/elevenlabs/momentos.json`. El tic-tac del reloj se arma con el clic suave, porque el efecto de reloj salió casi mudo.
- Créditos usados en ElevenLabs: unos 7,700 de 131,000 del mes.
- Estructura: cuatro factores (páncreas, hígado, estómago y cerebro) bajan la glucosa; el peso, el corazón y los riñones son beneficios adicionales.
- La versión anterior con la voz Nova (Artificial Studio) quedó en `voces/mezcla-nova.m4a`.

## Versión 2: imágenes y clips de ElevenCreative
La versión 1 quedó congelada en `version-1/`. Esta versión usa la misma voz, música y efectos (mismo audio y mismos tiempos) y cambia la imagen:

| Tiempo | Qué se ve |
|---|---|
| 0.0–1.9 s | Clip del plato boricua (arroz, habichuelas, tostones, ensalada) |
| 1.5–3.8 s | Clip de la protagonista comiendo; acercamiento que entra al túnel del intestino 3D |
| 19.3–22.8 s | Clip de la protagonista con la pluma semanal, con el calendario encima |
| 22.9–69 s | La ilustración del cuerpo (atlas médico) con los órganos iluminándose en ámbar |
| 68.9–72.1 s | Clip de la protagonista caminando frente al mar |
| 71.6–74.9 s | Clip de cierre: se detiene, respira y sonríe; luego el logo |

- Kit de marca en ElevenLabs: "Nutrición.Health" (paleta, tipografía y reglas).
- Imágenes: plato y persona con GPT Image 2.5; pluma y caminata con Gemini 3 Pro Image usando a la protagonista como referencia; cuerpo con GPT Image 2.5 (fondo quitado: `imagenes-ia/elegidas/cuerpo-recorte.png`).
- Clips: Seedance 2.5, 5 s, 720p, sin audio (`clips/*.mp4`). `bash clips/extraer.sh` los convierte en cuadros antes de grabar.
- `render.js` sirve la carpeta con un servidor local para poder leer las imágenes en el canvas.
- Costo aproximado en ElevenLabs: imágenes ~33,800 créditos, clips ~84,000 créditos.

## Cómo volver a generarlo
1. `voces/montaje.json`: en qué segundo va cada frase y cada escena.
2. `python3 mezcla_elevenlabs.py [1-4]`: arma `voces/mezcla.m4a` (el número elige la música).
3. `bash clips/extraer.sh` y luego `node render.js` graba el video con ese audio, o une `glp1-mudo.mp4` con la mezcla:
   `ffmpeg -i glp1-mudo.mp4 -i voces/mezcla.m4a -map 0:v -map 1:a -c copy -shortest glp1-como-funciona.mp4`

Los valores de glucosa son ilustrativos. Pendiente de revisión clínica (solo versión 1): la frase sobre corazón y riñones.
