# SLIDE-LAYOUTS.MD
# Nutrición.Health · Sistema Insight-to-Slide · v2.0 (stack HTML)

Este archivo define la lógica de decisión para seleccionar el tipo de slide correcto según el contenido del bloque de input. Consúltalo en el **Paso 1 del Modo 1** (propuesta de layouts para deck completo) y en el **Paso 1 del Modo 2** (edición de slide individual).

Los tipos descritos aquí mapean directamente al campo `TIPO` del archivo `.txt` y al switch de `renderSlide()` en `build-deck-html.js`.

---

## REGLA PRINCIPAL

Si el campo `TIPO` está especificado por el usuario → respétalo sin cuestionar.

Si el campo `TIPO` está vacío → aplica el árbol de decisión de esta guía, analiza `INSIGHT` y `DATOS`, y elige el tipo más apropiado. Explica brevemente la razón en la tabla de propuesta.

---

## ÁRBOL DE DECISIÓN

Sigue las preguntas en orden. La primera que aplique determina el tipo.

```
¿Es el primer slide del deck?
  → SÍ → Portada

¿Es el último slide del deck?
  → SÍ → Cierre

¿El INSIGHT es una transición entre secciones temáticas y no contiene información?
  → SÍ → Divisor

¿El DATOS contiene exactamente 3 valores separados por ||?
  → SÍ → EstadísticaTrío

¿El DATOS contiene un único número (sin categorías ni separadores)?
  → SÍ → Estadística

¿El INSIGHT es una cita directa entrecomillada o atribuida a una persona?
  → SÍ → Cita

¿El DATOS usa el separador || con exactamente 2 lados?
  → SÍ → DosColumnas

¿El DATOS está en líneas múltiples con separador | (estructura de tabla)?
  → SÍ → Tabla

¿El INSIGHT describe un ejercicio, reflexión o participación activa?
  → SÍ → Actividad

¿El DATOS contiene pares categoría,valor separados por saltos de línea o ; sin texto largo?
  → SÍ → Gráfico
         → Consultar CHART-TYPES.MD para selección del tipo de gráfico

¿El DATOS contiene puntos de texto separados por ; o está vacío?
  → SÍ → Contenido
```

---

## ESPECIFICACIONES POR TIPO

### Portada
**Señal:** Primer slide. El `INSIGHT` es el título del deck completo.
**Fondo:** Verde Profundo `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-cover">`
**Estructura:**
- Línea decorativa ámbar (40px ancho, 3px alto)
- Tag en ámbar: extraer de `DATOS`
- Título: `INSIGHT` — Playfair Display 400 · blanco
- Subtítulo: extraer de `NOTAS` con clave `Subtítulo:` — verde claro
- Footer: Brand name izquierda · Fecha derecha (clave `Fecha:` en NOTAS)

**Palabras clave en INSIGHT:** nombre del programa, número de sesión, título de módulo temático general.

---

### Divisor
**Señal:** Transición entre bloques temáticos. El `INSIGHT` es el nombre del nuevo módulo.
**Fondo:** Carbón `#1E1C19`
**Elemento HTML:** `<div class="slide-page slide-module">`
**Estructura:**
- Número de módulo decorativo (muy baja opacidad): extraer de `NOTAS` con patrón `Módulo N` o número solo
- Label de módulo en ámbar
- Título: `INSIGHT` — Playfair Display · blanco
- Línea ámbar debajo del título

**DATOS:** siempre vacío. Número de módulo va en `NOTAS`.
**Palabras clave en INSIGHT:** "Módulo", "Bloque", "Sección", "Parte".

---

### Contenido
**Señal:** El insight se desarrolla en puntos de texto. Sin datos numéricos para graficar.
**Fondo:** Crema `#F7F3ED` con header Verde `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-content">`
**Estructura:**
- Header verde: Título (`INSIGHT`) — Playfair Display · blanco + Brand name derecha
- Frase introductoria opcional: clave `intro:` en NOTAS — itálica carbón
- Cuerpo crema: bullets (dot ámbar) separados por `;` en `DATOS`
- Footer: Fuente (clave `Fuente:` en NOTAS)

**Límite:** Máximo 4 bullets. Si `DATOS` tiene más de 4 puntos → dividir en dos slides de Contenido.
**Palabras clave:** "Las barreras son…", "Los factores clave…", "Tres razones…", "Cómo funciona…"

---

### Estadística
**Señal:** El dato es el mensaje. Un único número que no necesita comparación.
**Fondo:** Verde Profundo `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-stat">`
**Estructura:**
- Label en ámbar (parte superior): clave `Etiqueta:` en NOTAS o construir desde INSIGHT
- Número protagonista: `DATOS` — Playfair Display 700 · ámbar · grande
- Descripción contextual: `INSIGHT` — DM Sans · blanco · centrado · máx. 2 líneas
- Footer: Fuente obligatoria

**Señales en DATOS que confirman este tipo:** un solo valor (`72%`, `-1.0%`, `1 de cada 3`, `96 millones`). Sin comas ni categorías adicionales.

---

### EstadísticaTrío
**Señal:** Exactamente 3 estadísticas relacionadas que deben mostrarse juntas.
**Fondo:** Verde Profundo `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-stat-trio">`
**Estructura:**
- Título: `INSIGHT` — Playfair Display · blanco · centrado
- 3 tarjetas en fila: cada una con número en ámbar + descripción en blanco
- Números: extraer de `DATOS` separados por `||`
- Descripciones: extraer de `NOTAS` con claves `Label A:`, `Label B:`, `Label C:`

**Parseo de DATOS:** `537M || 1 de 5 || $966B` → los tres valores van en cada tarjeta.
**Notas:** `Label A: personas con diabetes · Label B: proporción · Label C: costo`

---

### Cita
**Señal:** El INSIGHT es una declaración atribuida a una persona.
**Fondo:** Crema `#F7F3ED`
**Elemento HTML:** `<div class="slide-page slide-quote">`
**Estructura:**
- Comillas decorativas grandes en verde pálido (CSS — no texto)
- Texto de la cita: `INSIGHT` — Playfair Display · carbón · centrado
- Barra ámbar decorativa debajo del texto
- Atribución: extraer de `NOTAS` con clave `Fuente:` — DM Sans · ámbar · centrado

**Regla:** No incluir comillas `"..."` en el campo `INSIGHT` — el CSS las agrega como decoración.
**DATOS:** siempre vacío para este tipo.

---

### Gráfico
**Señal:** `DATOS` contiene múltiples categorías con valores numéricos.
**Fondo:** Crema `#F7F3ED` con header Verde `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-chart">`
**Tecnología:** Chart.js 4.4.1 (cargado por CDN, embebido en el HTML)
**Estructura:**
- Header verde: `INSIGHT` como título + Brand name derecha
- Canvas Chart.js: ocupa el cuerpo del slide
- Footer: Fuente obligatoria (clave `Fuente:` en NOTAS)

**Acción requerida:** Consultar `CHART-TYPES.MD` para determinar el tipo de gráfico apropiado.
**Clave en NOTAS:** `destacar "Nombre categoría" en ámbar` — indica qué barra/segmento va en `#C4832B`.

**Formato de DATOS:**
```
Categoría A, 33
Categoría B, 72
Categoría C, 45
```
Una categoría por línea. Separador `,` entre nombre y valor.

---

### DosColumnas
**Señal:** `DATOS` usa el separador `||` con exactamente dos lados.
**Fondo:** Crema `#F7F3ED` con header Verde `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-two-col">`
**Estructura:**
- Header verde: `INSIGHT` como título + Brand name derecha
- Dos columnas con divisor central:
  - Cada columna: Label en ámbar + bullets con dot ámbar
- Footer: Brand tagline

**Parseo:** `Label Izq: item1;item2;item3 || Label Der: item1;item2;item3`
**Límite:** Máximo 3–4 bullets por columna.
**Patrones comunes:** Antes / Después · Mito / Realidad · Simple / Complejo · Paciente / Médico

---

### Tabla
**Señal:** `DATOS` en líneas múltiples con separador `|`. Primera línea = headers.
**Fondo:** Crema `#F7F3ED` con header Verde `#2B4038`
**Elemento HTML:** `<div class="slide-page slide-table">`
**Estructura:**
- Header verde: `INSIGHT` como título + Brand name derecha
- Tabla HTML: headers con fondo verde · filas alternadas blanco/crema
- Footer: Fuente (clave `Fuente:` en NOTAS)

**Formato de DATOS:**
```
Columna A | Columna B | Columna C
Valor 1   | Valor 2   | Valor 3
Valor 4   | Valor 5   | Valor 6
```

**Límites:** Máximo 3 columnas · Máximo 4 filas de datos (sin contar headers).

---

### Actividad
**Señal:** El INSIGHT describe una tarea que el participante debe realizar.
**Fondo:** Ámbar Claro `#F5E8D6`
**Elemento HTML:** `<div class="slide-page slide-activity">`
**Estructura:**
- Badge "✏ ACTIVIDAD PRÁCTICA" en ámbar oscuro
- Título: `INSIGHT` — DM Sans 600 · carbón
- Dos tarjetas blancas side-by-side:
  - Cada tarjeta: label (pregunta/instrucción) + hint (texto de apoyo pequeño) + líneas para escribir
- Labels: claves `Label A:` / `Label B:` en NOTAS
- Hints: claves `Hint A:` / `Hint B:` en NOTAS

**Palabras clave en INSIGHT:** "Escribe", "Reflexiona", "Completa", "Identifica", "Discute", "Mi mapa de…"

---

### Cierre
**Señal:** Último slide del deck. Siempre termina con una acción concreta.
**Fondo:** Verde Profundo `#2B4038` (simetría con Portada)
**Elemento HTML:** `<div class="slide-page slide-close">`
**Estructura:**
- Label en ámbar (parte superior)
- Acción protagonista: `INSIGHT` — Playfair Display · blanco · centrado
- Frase puente: clave `Sub:` en NOTAS — DM Sans · verde claro · sobre la píldora
- Píldora ámbar con CTA: clave `CTA:` en NOTAS — DM Sans 600 · carbón

**Regla absoluta:** El `INSIGHT` de este slide SIEMPRE debe ser una acción que el participante puede tomar en los próximos 7 días — nunca un resumen del contenido.

---

### Animación
**Señal:** El slide explica un mecanismo del cuerpo (glucosa, insulina, medicamentos) con una ilustración animada por pasos. Solo se usa cuando el usuario lo pide o escribe `TIPO: Animación` — el árbol de decisión nunca lo elige solo.
**Fondo:** Crema `#F7F3ED` con header Verde `#2B4038` (igual que Contenido)
**Elemento HTML:** `<div class="slide-page slide-anim">` — viene del componente
**Estructura:**
- Header verde: `INSIGHT` — Playfair Display · blanco + Brand name derecha
- Dos paneles ilustrados lado a lado, cada uno con su lectura de glucosa (mg/dL); un solo número en ámbar
- Indicadores de órganos bajo cada panel cuando aplica (hígado, estómago, apetito, orina)
- Leyenda, 4 pasos numerados y texto del paso (alto fijo de 2 líneas)
- Footer: Fuente (clave `Fuente:` en NOTAS)

**DATOS:** nombre del componente: `glucosa-comparacion`, `glucosa-insulina`, `glucosa-metformina`, `glucosa-glp1` o `glucosa-sglt2`.
**Ejemplo:**
```
====
SLIDE: 3
TIPO: Animación
INSIGHT: Qué hace la insulina inyectada
DATOS: glucosa-insulina
NOTAS: Fuente: ADA, Standards of Care in Diabetes 2025
```

---

## FORMATO DE PROPUESTA AL USUARIO (MODO 1)

Cuando el sistema procesa un deck completo, presenta los layouts propuestos en este formato antes de construir:

```
He analizado tu documento. Aquí está mi propuesta de layouts:

| Slide | Tipo propuesto       | Razón                                              |
|-------|----------------------|----------------------------------------------------|
| 01    | Portada              | Primer slide del deck                              |
| 02    | Estadística          | DATOS contiene un único número (72%)               |
| 03    | Contenido            | DATOS tiene 3 puntos de texto separados por ;      |
| 04    | Gráfico              | DATOS tiene 4 pares categoría,valor                |
| 05    | Actividad            | INSIGHT contiene "Escribe" — modo participativo    |
| 06    | Cierre               | Último slide del deck                              |

¿Ajustas algún tipo antes de continuar?
```

Espera confirmación explícita antes de avanzar al análisis de gráficos o construcción.

---

*Nutrición.Health · Sistema Insight-to-Slide · SLIDE-LAYOUTS.MD v2.0 — stack HTML*
