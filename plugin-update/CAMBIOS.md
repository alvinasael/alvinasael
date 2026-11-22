# Actualización de plugins de decks · v0.2.0

Aplica a **html-deck** y a **insight-to-slide** (los dos traen su propia copia del generador).
Cada carpeta de aquí es el plugin completo, listo para reemplazar al actual.

## Qué cambia

### Generador (`references/build-deck-html.js`)
1. **Nuevo tipo `Animación`.** `DATOS` es el nombre de un componente de
   `componentes/`; el generador lo inserta en el slide. Si el componente no existe,
   avisa en consola y deja un slide de Contenido con el aviso.
   Marcadores disponibles en un componente: `{{INDEX}}`, `{{TITULO}}`, `{{FUENTE}}` y
   `{{INCLUIR:archivo}}` (inserta código compartido una sola vez por deck).
2. **Todo el slide escala con su propio ancho**, no con el de la ventana (unidades
   `cqw`). Se ve igual en proyector, laptop o celular, solo más grande o más pequeño.
   Navegadores anteriores a 2023 usan el comportamiento anterior.
3. **El slide siempre es 16:9 y cabe completo en la pantalla**, también en modo
   presentador (antes se estiraba a la forma de la pantalla o se recortaba abajo).
4. **Celular:** pellizcar para hacer zoom o mover la vista con zoom ya no cambia de
   slide. Solo un deslizamiento claramente horizontal con un dedo navega.
5. **Navegación por pasos:** flechas del teclado, flechas en pantalla y deslizamiento
   recorren primero los pasos de un slide Animación y después pasan de slide.
6. **Solo insight-to-slide:** arregla un error previo que impedía navegar en decks
   sin gráficas (`Chart is not defined`). html-deck ya lo tenía bien.

La diferencia que ya existía entre los dos plugins en cómo leen los slides de
**Actividad** se conserva tal cual.

### Componentes nuevos (`references/componentes/`)
| Archivo | Qué es |
|---|---|
| `_motor-celula.js` | Motor compartido: dibujo, pasos, ampliar panel, pestañas |
| `glucosa-comparacion.html` | Persona sana vs. diabetes tipo 2 |
| `glucosa-insulina.html` | DM2 sin vs. con insulina |
| `glucosa-metformina.html` | DM2 sin vs. con metformina |
| `glucosa-glp1.html` | DM2 sin vs. con GLP-1 |
| `glucosa-sglt2.html` | DM2 sin vs. con SGLT2 (riñón) |

### Documentación
- `SKILL.md`: tipo Animación en la tabla, paso para copiar `componentes/`, lista de
  componentes, checklist de QA y regla nueva (n.º 6).
- `references/slide-layouts.md`: especificación del tipo Animación con ejemplo.
- `commands/build-deck.md`: copiar `componentes/` junto al `.txt`.
- `README.md` y `plugin.json`: versión 0.2.0.

`build-deck-html.patch` tiene solo el cambio del generador, por si prefieres
aplicarlo a mano sobre tu copia (`patch build-deck-html.js < build-deck-html.patch`).

## Cómo instalar

1. Reemplaza la carpeta del plugin en su fuente (el repositorio o el lugar donde
   publicas los plugins de la organización) por la carpeta de aquí, o sube el `.zip`
   de `dist/` si tu panel de plugins acepta archivos.
2. Confirma que la versión publicada sea **0.2.0**.
3. Abre una sesión nueva para que se sincronice.

## Cómo probar

En una carpeta con un `.txt` que tenga un slide `TIPO: Animación`, corre `/build-deck`
y revisa:
- [ ] La flecha recorre los 4 pasos y luego pasa de slide.
- [ ] Clic en un panel lo amplía; las pestañas cambian de panel; Esc vuelve.
- [ ] En celular, pellizcar no cambia de slide.
- [ ] Un deck sin animaciones ni gráficas navega normal.

Probado aquí: con cada plugin se generaron el deck de glucosa (7 slides) y un deck
simple (Portada, Contenido, Cierre); ambos se recorren completos sin errores.

## Antes de presentar a pacientes

Los valores de las animaciones son ilustrativos. Conviene que el equipo clínico revise
en especial: el dato de 60 a 80 g de glucosa al día en la orina (SGLT2), y si añadir
náuseas (GLP-1), vitamina B12 (metformina) y cetoacidosis (SGLT2).
