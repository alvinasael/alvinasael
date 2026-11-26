# CHART-TYPES.MD
# Nutrición.Health · Sistema Insight-to-Slide · v2.0 (Chart.js)

Este archivo define la lógica de selección de gráfico y los patrones de código Chart.js con los colores del brand. Consúltalo en el **Paso 2 del Modo 1** cuando el tipo de slide sea `Gráfico` (Tipo 07) o `Tabla` (Tipo 09).

El generador `build-deck-html.js` implementa estos patrones en las funciones `parseChart()` y `renderSlide()`. Este documento sirve como referencia cuando el skill debe razonar sobre gráficos — por ejemplo para proponer qué tipo usar o qué dato destacar.

---

## 1. ÁRBOL DE DECISIÓN — TIPO DE GRÁFICO

Analiza los `DATOS` del bloque de input y responde las preguntas en orden:

```
¿Las categorías muestran evolución en el tiempo (meses, semanas, sesiones)?
  → SÍ → ¿Importa más la tendencia que los valores puntuales?
              → SÍ → Línea (line)
              → NO → Barras verticales agrupadas (bar — vertical)

¿Comparo categorías sin relación temporal?
  → ¿Son 4 o más categorías, o los nombres son largos?
      → SÍ → Barras horizontales (bar — horizontal, indexAxis: 'y')
      → NO → Barras verticales simples (bar — vertical)

¿Son 2–3 categorías que suman un todo (proporción)?
  → SÍ → Torta (doughnut)

¿Son 4+ categorías que forman un todo?
  → SÍ → Barras apiladas 100% (bar — stacked)
```

**Regla de oro:** En sesiones educativas, priorizar claridad sobre sofisticación. Una barra simple bien ejecutada supera a cualquier gráfico complejo mal entendido.

---

## 2. REGLAS DE COLOR EN GRÁFICOS

Estas reglas aplican a todos los tipos de gráfico sin excepción:

| Elemento | Color | Hex |
|---|---|---|
| Dato que soporta el insight | **Ámbar** | `#C4832B` |
| Resto de datos | **Verde Profundo** | `#2B4038` |
| Datos de menor relevancia (si hay 3+ series) | **Verde Claro** | `#D4E4DD` |
| Líneas de cuadrícula | **Crema Oscuro** | `#EDE8DF` |
| Texto de ejes | **Carbón 60%** | `#6B6760` |
| Data labels | **Blanco** (sobre barra) o **Carbón** (fuera) | `#FFFFFF` / `#1E1C19` |
| Fondo del canvas | **Transparente** | — |

**Regla absoluta:** Un solo dato en ámbar por gráfico. Si el usuario especifica en `NOTAS` qué dato destacar (con la clave `destacar "X" en ámbar`), ese es el ámbar. Si no especifica, elegir el dato que más directamente soporta el `INSIGHT`.

---

## 3. CÓMO ESPECIFICAR EL DATO ÁMBAR EN EL .TXT

En el campo `NOTAS`, usar esta sintaxis:

```
NOTAS: destacar "DSME Medicare" en ámbar · Fuente: ADCES, 2022 · Eje Y: Reducción HbA1c (%)
```

El generador detecta esta clave con regex `/destacar\s+"?([^"·\n]+?)"?\s+en\s+ámbar/i` y aplica `#C4832B` a la barra/segmento cuya etiqueta coincide (comparación case-insensitive, búsqueda por `.includes()`).

Si ninguna categoría coincide, el generador asigna ámbar automáticamente al **valor más alto** del dataset.

---

## 4. PATRONES DE CÓDIGO CHART.JS

El generador implementa estos patrones. Esta sección es una referencia para entender cómo funciona cada tipo y para ajustes manuales al HTML si son necesarios.

---

### 4A — Barras verticales (bar)
**Usar cuando:** comparación entre 2–5 categorías sin relación temporal.

```javascript
// Contexto: dentro de renderSlide(), caso "Gráfico"
const { labels, values, colors } = parseChart(dat, not);
const cid = `chart${++chartCount}`;

// HTML generado:
// <canvas id="${cid}"></canvas>

// Init inyectado al final del <script>:
chartInits.push(`
new Chart(document.getElementById('${cid}'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(labels)},
    datasets: [{
      data: ${JSON.stringify(values)},
      backgroundColor: ${JSON.stringify(colors)},
      borderRadius: 4,
      borderSkipped: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B6760', font: { family: 'DM Sans', size: 12 } }
      },
      y: {
        display: false,
        grid: { color: '#EDE8DF' }
      }
    }
  }
});
`);
```

**Nota:** El eje Y está oculto por defecto porque los valores van como data labels sobre las barras. Si el usuario necesita el eje Y visible (p.ej. para un gráfico con muchas categorías), cambiar `display: false` a `display: true`.

---

### 4B — Barras horizontales (bar con indexAxis: 'y')
**Usar cuando:** 4+ categorías o nombres de categoría largos.

```javascript
// Diferencia respecto a 4A: agregar indexAxis en options
options: {
  indexAxis: 'y',   // <-- esto convierte barras verticales en horizontales
  // ... mismo resto de configuración
}
```

Para activar este comportamiento en el `.txt`, agregar en NOTAS:
```
NOTAS: horizontal · destacar "Categoría X" en ámbar
```

El generador detecta la clave `horizontal` en NOTAS y ajusta el tipo automáticamente.

---

### 4C — Línea (line)
**Usar cuando:** evolución en el tiempo; la tendencia es el mensaje principal.

```javascript
new Chart(document.getElementById('${cid}'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(labels)},  // ej: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4']
    datasets: [{
      data: ${JSON.stringify(values)},
      borderColor: '#C4832B',    // línea en ámbar si es la serie protagonista
      backgroundColor: 'rgba(196,131,43,0.1)',
      pointBackgroundColor: '#C4832B',
      pointRadius: 5,
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6B6760' }, grid: { color: '#EDE8DF' } },
      y: { ticks: { color: '#6B6760' }, grid: { color: '#EDE8DF' } }
    }
  }
});
```

Para múltiples series, extender `datasets` con una entrada por serie. La serie protagonista lleva `borderColor: '#C4832B'`; el resto `borderColor: '#2B4038'` o `borderColor: '#D4E4DD'`.

---

### 4D — Torta / Doughnut (doughnut)
**Usar cuando:** 2–3 categorías que suman un todo y la proporción es el mensaje.

```javascript
new Chart(document.getElementById('${cid}'), {
  type: 'doughnut',
  data: {
    labels: ${JSON.stringify(labels)},
    datasets: [{
      data: ${JSON.stringify(values)},
      backgroundColor: ${JSON.stringify(colors)},  // ámbar en dato protagonista
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#6B6760', font: { family: 'DM Sans', size: 12 }, padding: 16 }
      }
    }
  }
});
```

**Máximo 3 categorías.** Si hay más, usar barras apiladas 100%.

---

### 4E — Barras apiladas 100% (bar stacked)
**Usar cuando:** 4+ categorías que forman un todo o composición porcentual.

```javascript
new Chart(document.getElementById('${cid}'), {
  type: 'bar',
  data: {
    labels: [''],  // una sola categoría — el stack es vertical
    datasets: labels.map((label, i) => ({
      label: label,
      data: [values[i]],
      backgroundColor: colors[i]
    }))
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#6B6760', font: { family: 'DM Sans', size: 11 } }
      }
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, display: false }
    }
  }
});
```

---

## 5. FORMATO DE DATOS POR TIPO DE GRÁFICO

### Barras verticales / horizontales (más común)

```
DATOS: Categoría A, 33
Categoría B, 72
Categoría C, 45
Categoría D, 19
```

Una categoría por línea. Separador `,` entre nombre y valor numérico.
También acepta separación por `;` si el usuario no usa saltos de línea:
```
DATOS: Categoría A, 33; Categoría B, 72; Categoría C, 45
```

### Línea (serie en el tiempo)

```
DATOS: Mes 1, 7.2
Mes 2, 6.9
Mes 3, 6.5
Mes 4, 6.1
```

El generador trata las etiquetas como categorías del eje X.

### Torta / Doughnut

```
DATOS: Controla su glucosa, 28
No controla, 58
Sin diagnóstico, 14
```

Los porcentajes no necesitan sumar 100 — Chart.js los normaliza automáticamente en modo doughnut.

---

## 6. POSICIONAMIENTO EN EL SLIDE HTML

El Tipo 07 (Gráfico) tiene un header verde de ~18% de alto. El canvas vive debajo:

```
┌─────────────────────────────────────┐
│  HEADER VERDE — INSIGHT como título │  ← ~18% del slide
├─────────────────────────────────────┤
│                                     │
│     <canvas> Chart.js              │  ← flex 1, margin auto
│                                     │
├─────────────────────────────────────┤
│  Fuente · · · Nutrición.Health     │  ← footer ~6% del slide
└─────────────────────────────────────┘
```

El canvas tiene `max-height: 55vh` para evitar que se desborde en pantallas pequeñas.

---

## 7. SELECCIÓN RÁPIDA POR NATURALEZA DEL DATO

| Naturaleza del dato | Tipo Chart.js | Nota |
|---|---|---|
| Categorías comparadas, ≤5, nombres cortos | `bar` (vertical) | Más común en sesiones |
| Categorías comparadas, ≥4 o nombres largos | `bar` + `indexAxis: 'y'` | Horizontal |
| Evolución temporal | `line` | `tension: 0.3` para curva suave |
| Proporción de un todo, ≤3 categorías | `doughnut` | `cutout: '55%'` |
| Composición porcentual, 4+ | `bar` stacked | Datasets múltiples |

---

## 8. REGLAS DE CONTENIDO PARA GRÁFICOS

- **Máximo 6 categorías** por gráfico. Si hay más, agrupar las menores en "Otros".
- **Siempre un dato en ámbar** — nunca dejar todo en verde sin destacar nada.
- **Sin título de gráfico** — el header del slide cumple esa función (`chart.has_title = false`).
- **Fuente siempre en footer** — nunca dentro del área del gráfico.
- **Leyenda solo si hay 2+ series** — posición inferior, nunca lateral.
- **Data labels:** activar con el plugin `datalabels` si el deck requiere valores sobre barras (no incluido por defecto en Chart.js CDN base — requiere `chartjs-plugin-datalabels`).

---

*Nutrición.Health · Sistema Insight-to-Slide · CHART-TYPES.MD v2.0 — Chart.js*
