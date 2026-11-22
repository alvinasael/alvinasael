---
name: html-deck
description: >
  Skill para construir decks educativos de Nutrición.Health en formato .html
  a partir de un documento .txt estructurado con bloques SLIDE/TIPO/INSIGHT/DATOS/NOTAS.
  Usar SIEMPRE cuando el usuario proporcione un archivo .txt con bloques de slides,
  pida editar un slide individual, o use los triggers: "construir deck", "generar slides",
  "html-deck", "quiero mis slides", "editar slide X", "build deck".
---

# Insight-to-Slide
## Nutrición.Health · Sistema de Presentaciones Educativas

Genera presentaciones HTML autocontenidas a partir de un `.txt` estructurado.
Output: un único `.html` con sidebar, barra de progreso, gráficos Chart.js, y modo presentador.

---

## Componentes disponibles en este plugin

| Archivo | Ubicación | Leerlo cuando... |
|---|---|---|
| Árbol de decisión de layouts | `references/slide-layouts.md` | Paso 1 — siempre |
| Tipos de gráfico Chart.js | `references/chart-types.md` | Solo si hay slides Gráfico |
| Sistema de marca (colores/tipografía) | `references/brand-guide.md` | Si hay duda de color o diseño |
| Generador Node.js | `references/build-deck-html.js` | Copiar al workspace y ejecutar |
| Componentes animados | `references/componentes/` | Si hay slides Animación — copiar la carpeta junto al .txt |

---

## MODO 1 — Deck Completo desde .txt

### Paso 0 — Verificar Node.js
```bash
node --version
```

### Paso 1 — Analizar y proponer layouts
1. Leer el `.txt` completo
2. Extraer todos los bloques `SLIDE:` y sus campos
3. Leer `references/slide-layouts.md` — aplicar árbol de decisión a cada slide sin `TIPO`
4. Si `TIPO` está especificado → respetar sin cuestionar

Presentar tabla de propuesta y **esperar confirmación antes de continuar.**

### Paso 2 — Revisar gráficos (si aplica)
Si hay slides con `TIPO: Gráfico`:
1. Leer `references/chart-types.md`
2. Confirmar tipo de gráfico Chart.js y el dato que va en ámbar
3. Verificar que `NOTAS` tiene `destacar "X" en ámbar`

### Paso 3 — Preparar el generador
Copiar el generador al directorio de trabajo si no existe:
```bash
cp [ruta-plugin]/references/build-deck-html.js ./build-deck-html.js
```

Si el deck tiene slides `TIPO: Animación`, copiar también la carpeta de componentes
**junto al .txt** (el generador la busca en la misma carpeta del archivo de input):
```bash
cp -r [ruta-plugin]/references/componentes ./componentes
```

### Paso 4 — Ejecutar
```bash
node build-deck-html.js input.txt output.html
```

### Paso 5 — QA y entrega

Revisar en browser. Checklist mínimo:
- [ ] Sidebar con número y título de cada slide
- [ ] Barra de progreso ámbar en el tope
- [ ] Fondo correcto por tipo de slide
- [ ] Gráficos con dato protagonista en ámbar
- [ ] Modo presentador con `P` funcional
- [ ] Sin texto desbordado
- [ ] Slides Animación: la flecha recorre los 4 pasos antes de pasar al siguiente slide
- [ ] Slides Animación: clic en un panel lo amplía; Esc o "× Ver ambos" vuelve

Copiar el `.html` al workspace y entregar al usuario.

---

## MODO 2 — Editar Slide Individual

1. Identificar el bloque en el `.txt` (por número o contenido)
2. Confirmar qué campos cambian: `INSIGHT`, `DATOS`, `NOTAS`, o `TIPO` completo
3. Proponer el cambio y esperar confirmación
4. Editar el `.txt` y re-ejecutar el generador

---

## Formato del .txt de Input

Bloques separados por `====`. Cinco campos por bloque:

```
====
SLIDE: 1
TIPO: Portada
INSIGHT: Título del deck
DATOS: Sesión 1 de 4
NOTAS: Subtítulo: Descripción · Fecha: Abril 2026

====
SLIDE: 2
TIPO: Contenido
INSIGHT: El mensaje central del slide
DATOS: Punto uno;Punto dos;Punto tres
NOTAS: Fuente: Nombre, año
```

### Tipos disponibles

| Tipo | Fondo | DATOS |
|---|---|---|
| Portada | Verde `#2B4038` | Tag/categoría del deck |
| Divisor | Carbón `#1E1C19` | Vacío |
| Contenido | Crema `#F7F3ED` | Bullets separados por `;` (máx. 4) |
| Estadística | Verde `#2B4038` | Un solo número |
| EstadísticaTrío | Verde `#2B4038` | Tres valores separados por `\|\|` |
| Cita | Crema `#F7F3ED` | Vacío |
| Gráfico | Crema `#F7F3ED` | `Categoría, valor` por línea |
| DosColumnas | Crema `#F7F3ED` | `Label: items;items \|\| Label: items;items` |
| Tabla | Crema `#F7F3ED` | Primera línea = headers con `\|`; resto = filas |
| Actividad | Ámbar Claro `#F5E8D6` | Vacío — instrucciones van en NOTAS |
| Cierre | Verde `#2B4038` | Vacío |
| Animación | Crema `#F7F3ED` | Nombre del componente en `references/componentes/` (ej. `glucosa-insulina`) |

### Claves de NOTAS frecuentes

| Clave | Tipo | Ejemplo |
|---|---|---|
| `Fuente:` | Todos | `Fuente: CDC, 2023` |
| `Subtítulo:` | Portada | `Subtítulo: Descripción breve` |
| `Fecha:` | Portada | `Fecha: Abril 2026` |
| `intro:` | Contenido | `intro: Frase de apertura.` |
| `Label A/B/C:` | EstadísticaTrío | `Label A: descripción dato 1` |
| `destacar "X" en ámbar` | Gráfico | `destacar "DSME" en ámbar` |
| `Hint A:` / `Hint B:` | Actividad | `Hint A: Escribe aquí` |
| `Sub:` | Cierre | `Sub: Tu compromiso esta semana:` |
| `CTA:` | Cierre | `CTA: ¡Nos vemos pronto!` |

---

### Slides Animación

`DATOS` es el nombre de un componente de `references/componentes/` (sin `.html`).
`INSIGHT` es el título del slide y `Fuente:` en `NOTAS` va al pie.

| Componente | Qué muestra |
|---|---|
| `glucosa-comparacion` | Persona sana vs. diabetes tipo 2 con el mismo plato (músculo) |
| `glucosa-insulina` | DM2 sin vs. con insulina inyectada (músculo + hígado) |
| `glucosa-metformina` | DM2 sin vs. con metformina (músculo + hígado) |
| `glucosa-glp1` | DM2 sin vs. con GLP-1 (músculo + estómago, hígado, apetito) |
| `glucosa-sglt2` | DM2 sin vs. con SGLT2 (túbulo del riñón + orina) |

Cada componente compara dos paneles lado a lado y avanza en 4 pasos (flecha, control
remoto, deslizar en celular o botones numerados). Clic en un panel lo amplía a todo el
slide, con pestañas para cambiar de panel. Todos comparten `_motor-celula.js`, que el
generador inserta una sola vez por deck. Nunca editar los valores clínicos de un
componente sin revisión del equipo clínico.

---

## Reglas Críticas

1. **Nunca inventar contenido** — si un campo está vacío, el generador usa placeholders
2. **El INSIGHT de Cierre es siempre una acción** concreta en 7 días — nunca un resumen
3. **Citas sin comillas** en `INSIGHT` — el CSS las agrega automáticamente
4. **Límites estrictos**: Contenido máx. 4 bullets · DosColumnas máx. 4 por columna · Tabla máx. 3 cols × 4 filas
5. **Un dato ámbar por gráfico** — siempre especificado en `NOTAS`
6. **Animación solo con componentes existentes** — si `DATOS` no coincide con un archivo de `componentes/`, el generador avisa y deja un slide de Contenido con el aviso

---

*Nutrición.Health · Insight-to-Slide · SKILL.md v1.1*
