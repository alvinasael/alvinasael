# Plan: "Dos experiencias" en dibujo animado (versión 2)

Estado: **plan para aprobar. No se ha generado nada.**

## 1. Estructura (dos actos)

| Parte | Tiempo aprox. | Contenido |
|---|---|---|
| Acto 1 · Sin acompañamiento | 0–32 s | 6 escenas seguidas. Colores apagados, indicador de confianza baja |
| Giro | 32–37 s | Rebobinado visual hasta la escena 1 + voz: "¿Y si lo hacemos diferente?" |
| Acto 2 · Con Nutrición.Health | 37–68 s | Las mismas 6 escenas, con color. La confianza sube |
| Cierre | 68–80 s | "Entiende tu diabetes. Vive con confianza." → registro → logo |

Voz: se recortan las frases actuales (x1–x6) en su parte "sin" y su parte "con" (sin costo).
Nuevo: "¿Y si lo hacemos diferente?" (~60 créditos). Si "Con nosotros…" repetido 6 veces suena
pesado, se regraban 6 frases del acto 2 sin esa entrada (~600 créditos, opcional).

## 2. Personaje propuesto

- Mujer puertorriqueña de unos 52 años: la versión ilustrada de la protagonista del video GLP-1,
  para que haya continuidad entre los videos.
- Pelo rizo oscuro con algunas canas, piel trigueña, aretes pequeños dorados.
- Ropa fija en todas las escenas: blusa verde salvia y pantalón crema (así es más fácil que la IA
  la mantenga igual).
- No tiene nombre: el video habla en "tú".

## 3. Estilo visual

- Ilustración plana (vector), formas suaves, textura de grano muy leve, sin contornos gruesos.
- Paleta de la marca: verde #2B4038, crema #F7F3ED, ámbar #C4832B, verde salvia, tonos tierra.
- Caras simples y expresivas (cejas y boca), manos sencillas.
- **Sin texto dentro de las imágenes** (todo el texto lo pone el código, para evitar letras deformes).
- Formato vertical 9:16. La acción ocurre en los 2/3 de arriba; el tercio de abajo queda limpio
  para los subtítulos.
- El tono triste del acto 1 se logra en código (desaturar y oscurecer la misma ilustración), no
  generando otra imagen. Así ambas versiones se ven idénticas en estilo.

## 4. Escenas (12 imágenes)

Mismos escenarios en ambos actos (consultorio, sala de noche, cocina, sala de día), para que se
note que es la misma vida contada de dos formas.

| # | Acto 1 · Sin | Acto 2 · Con |
|---|---|---|
| 1 Diagnóstico | Sentada frente al escritorio del médico (médico de espaldas o de perfil), mira una receta, preocupada | Misma escena: tiene la receta y una tarjeta en la mano, se ve esperanzada |
| 2 Esa noche | En el sofá a oscuras, la cara iluminada por el celular, confundida | En la mesa con su laptop en videollamada (la pantalla se ve de lado, sin mostrar a nadie real), toma notas, tranquila |
| 3 La comida | En la cocina, aparta un plato de arroz y habichuelas, mira una lista pegada en la nevera, triste | En la misma cocina, come un plato balanceado de arroz, habichuelas y ensalada, sonríe |
| 4 Glucómetro | En la mesa, mira el glucómetro con preocupación | En la misma mesa, mira el glucómetro tranquila, con una libreta de apuntes |
| 5 Los meses | Sola en el sofá, un calendario en la pared, pensativa | En la sala con la laptop: videollamada con un grupo pequeño de personas ilustradas genéricas, sonríe |
| 6 La cita | En el consultorio, el médico mira una carpeta casi vacía, ella insegura | En el consultorio, el médico le muestra un informe, ambos sonríen |

Giovanna (persona real) **no se dibuja**. Aparece solo como nombre o iniciales en el código.

## 5. Movimiento en código (sin costo)

- Acercamientos y paneos lentos en cada escena.
- Luces que cambian (la luz del celular de noche, la luz del sol en el acto 2).
- Detalles animados encima: el celular vibra, aparecen signos de pregunta, palomitas de aprobado,
  el indicador de confianza.
- Transición del giro: la imagen se "rebobina" (pasan rápidas al revés) y vuelve a la escena 1 en color.

## 6. Proceso por fases (con aprobación en cada una)

| Fase | Qué se hace | Créditos aprox. | Aprobación |
|---|---|---|---|
| 0 | Recortar la voz, fijar tiempos, revisar el modelo y su formato con un estimado (sin generar) | 0 | — |
| 1 | Hoja de personaje: 2 propuestas del personaje (de frente, con 3 expresiones) | ~600 | **Tú escoges el personaje** |
| 2 | 1 escena de prueba (cocina, acto 2) usando el personaje como referencia | ~300 | **Tú apruebas estilo y parecido** |
| 3 | Las 11 escenas restantes, 1 variación cada una | ~3,000 | Revisas las 12 juntas |
| 4 | Rehacer hasta 3 escenas que salgan mal | ~900 (reserva) | — |
| 5 | Animación en código, cuadros de prueba y luego el video completo | 0 | **Apruebas el video** |

Total estimado: unos 4,800 créditos como máximo (te quedan ~13,400). Me detengo si el gasto llega
a 5,000 sin terminar.

## 7. Riesgos y cómo los evito

| Riesgo | Cómo lo evito |
|---|---|
| Que salga horizontal o en baja resolución (pasó con la pluma) | Fijar formato 9:16 en el nodo y confirmarlo con la escena de prueba antes de generar el resto |
| Que la persona cambie entre escenas | Usar la hoja de personaje como referencia en todas, la misma descripción y la misma ropa |
| Letras deformes dentro de la imagen | Pedir "sin texto"; nada de letreros. El texto lo pone el código |
| Bloqueo por filtro de contenido | Sin agujas ni procedimientos; el glucómetro se ve de lejos |
| Manos o caras raras | 1 variación por escena y reserva para rehacer las que fallen |
| Gastar en pruebas que no sirven | Estimado antes de cada fase; 1 variación (no 4) salvo en la hoja de personaje |
| Que la IA "imite" un estilo de una marca existente | Describir el estilo con palabras propias (ilustración plana, paleta de la marca), sin nombrar estudios |

## 8. Resultado

Video vertical de ~80 s en `video/experiencia/`, aparte del actual. "Dos experiencias" en
pantalla dividida se conserva tal cual.

## 9. Guion (versión aprobada en revisión)

**Acto 1 · Sin acompañamiento**
1. Te diagnostican diabetes en una breve consulta. Sin acompañamiento, sales con una receta, una orientación breve y muchas dudas.
2. Esa noche, sin guía, buscas en internet y encuentras respuestas que se contradicen.
3. A la hora de comer, te dan una lista de prohibidos y dejas tu arroz con habichuelas.
4. Tu glucómetro marca números que no entiendes, y te preocupan.
5. Los próximos meses los enfrentas sin apoyo, hasta tu próxima cita.
6. En tu próxima cita, el médico empieza de cero.

**Giro:** ¿Y si lo hacemos diferente? *(nueva)*

**Acto 2 · Con Nutrición.Health** *(nuevas)*
1. Sales de la consulta con algo más: un camino.
2. Esa noche, en Nutrición punto Health evaluamos tu caso y te damos un plan.
3. A la hora de comer, aprendes a comer sin renunciar a tu comida.
4. Entiendes tus números y sabes qué hacer.
5. Y no lo enfrentas sin apoyo: tienes ocho sesiones en grupo, con personas que viven lo mismo que tú.
6. En tu próxima cita, tu médico ya recibió tu progreso. Llegan alineados.

**Cierre:** Es la misma diabetes. Pero dos experiencias muy distintas. · Entiende tu diabetes. Vive con confianza. · ¿Quieres ser de los primeros? Regístrate y te avisamos.

Voz por grabar: frase 1 del acto 1, el giro y las 6 del acto 2 (~800 créditos).

## 10. Resultado
- Video: `dos-experiencias-dibujo.mp4` (86 s). Animación: `dibujo-animado.html`. Audio: `python3 mezcla-dibujo.py` → `mezcla-dibujo.m4a`.
- Grabar (desde `video/`): `PAGE=experiencia/dibujo-animado.html AUDIO=experiencia/mezcla-dibujo.m4a node render.js salida.mp4`
- Imágenes en `dibujo/` (hoja de personaje, 12 escenas). Música del acto 1 con filtro pasa-bajos; se abre en el acto 2.
- Créditos usados: ~5,455 (voces ~680, personaje ~380, escenas ~4,395).


## 11. Revisión: perspectiva del médico y una sola grabación
- El problema es el tiempo de la consulta, no el médico. El médico es aliado en ambos actos (refiere y recibe el progreso).
- Etiqueta del acto 1: "Por tu cuenta" (antes "Sin acompañamiento").
- Toda la narración se grabó en UNA toma (`voz/narracion-completa.mp3`) y se cortó por frases (`voz/u-*.mp3`);
  `tiempos-dibujo.json` guarda dónde va cada frase y la animación se sincroniza sola a partir de ahí. Duración: 92.9 s.

Guion final:
1. Te diagnostican diabetes. Tu médico te orienta, pero el tiempo de la consulta no alcanza para todo, y sales con muchas dudas.
2. Esa noche, sin guía, buscas en internet y encuentras respuestas que se contradicen.
3. A la hora de comer, sigues una lista de prohibidos que encontraste por ahí, y dejas tu arroz con habichuelas.
4. Tu glucómetro marca números que no entiendes, y te preocupan.
5. Los próximos meses los enfrentas por tu cuenta, hasta tu próxima cita.
6. En tu próxima cita, el tiempo vuelve a ser corto para ponerse al día. (reloj de 15 min en pantalla)
Giro: ¿Y si lo hacemos diferente?
1. Esta vez, tu médico te refiere, y sales con algo más: un camino.
2. Esa noche, en Nutrición punto Health evaluamos tu caso y te damos un plan.
3. A la hora de comer, aprendes a comer sin renunciar a tu comida.
4. Entiendes tus números y sabes qué hacer.
5. Y no lo enfrentas por tu cuenta: tienes ocho sesiones en grupo, con personas que viven lo mismo que tú.
6. En tu próxima cita, tu médico ya recibió tu progreso. Llegan alineados.
Cierre: Es la misma diabetes. Pero dos experiencias muy distintas. · Entiende tu diabetes. Vive con confianza. · ¿Quieres ser de los primeros? Regístrate y te avisamos.

## 12. Personaje masculino (para el próximo video de la serie)
`dibujo/personaje-hombre.jpg`: puertorriqueño de unos 56 años, bigote canoso, guayabera azul clara. Mismo estilo que ella; podría ser su esposo.

## 13. Él y ella se alternan
Ella vive los momentos 1, 3 y 5; él, los momentos 2, 4 y 6 (`dibujo/m-e2-*`, `m-e4-*`, `m-e6-*`), en ambos actos.
La cocina de él usa la escena de prueba como referencia; el consultorio usa la misma descripción. Costo: ~2,320 créditos.
