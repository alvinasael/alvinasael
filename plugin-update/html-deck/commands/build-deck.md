---
description: Genera un deck HTML de Nutrición.Health desde un archivo .txt estructurado. Lee el .txt, propone los layouts, y corre el generador build-deck-html.js para producir la presentación lista para usar.
allowed-tools:
  - Read
  - Write
  - Edit
  - mcp__workspace__bash
---

# /build-deck

Ejecuta el flujo completo Insight-to-Slide: lee el .txt de input, propone los layouts al usuario, y genera el archivo .html de presentación.

## Pasos

### 1 — Localizar el archivo de input

Si el usuario proporcionó el nombre del archivo, buscarlo en la carpeta del workspace.
Si no lo especificó, pedirle que indique el nombre del archivo `.txt`.

### 2 — Leer el skill y preparar el contexto

Lee el archivo `SKILL.md` de este plugin para cargar el flujo completo.
Lee también `references/slide-layouts.md` para el árbol de decisión de layouts.

### 3 — Analizar el .txt y proponer layouts

Parsea cada bloque `SLIDE:` del archivo.
Para cada bloque sin `TIPO` especificado, aplica el árbol de decisión de `slide-layouts.md`.
Presenta al usuario una tabla con la propuesta de layouts antes de continuar:

```
He analizado tu documento. Aquí está mi propuesta de layouts:

| Slide | Tipo propuesto    | Razón                              |
|-------|-------------------|------------------------------------|
| 01    | Portada           | Primer slide del deck              |
| 02    | Estadística       | DATOS contiene un único número     |
| ...   | ...               | ...                                |

¿Ajustas algún tipo antes de continuar?
```

Esperar confirmación explícita del usuario antes de avanzar.

### 4 — Preparar el generador

Copiar `references/build-deck-html.js` al directorio de trabajo si no existe:

```bash
cp [ruta-plugin]/references/build-deck-html.js [workspace]/build-deck-html.js
```

Si algún slide es `TIPO: Animación`, copiar también los componentes junto al `.txt`:

```bash
cp -r [ruta-plugin]/references/componentes [carpeta-del-txt]/componentes
```

### 5 — Ejecutar el generador

```bash
node build-deck-html.js [archivo-input].txt [archivo-output].html
```

### 6 — QA y entrega

Confirmar que el generador corrió sin errores.
Entregar al usuario el link al archivo `.html` generado.
Mencionar brevemente cuántos slides se generaron y si hay algún tipo que requiera revisión.
