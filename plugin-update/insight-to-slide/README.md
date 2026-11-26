# Insight-to-Slide Plugin
## Nutrición.Health · Presentaciones Educativas HTML

Genera presentaciones HTML autocontenidas para sesiones educativas grupales a partir de un archivo `.txt` estructurado.

---

## Cómo usar

### Comando principal
Escribe `/build-deck` en cualquier sesión para iniciar el flujo completo.

Claude analizará tu archivo `.txt`, propondrá los layouts de cada slide, y generará el `.html` listo para presentar en Zoom.

### Activación automática
El skill también se activa automáticamente cuando compartes un archivo `.txt` con bloques `SLIDE/TIPO/INSIGHT/DATOS/NOTAS` o cuando dices:
- "construir deck"
- "generar slides"
- "quiero mis slides"
- "editar slide X"

---

## Formato del archivo de input

```
====
SLIDE: 1
TIPO: Portada
INSIGHT: Alimentación, Glucosa y Diabetes Tipo 2
DATOS: Sesión 1 de 4
NOTAS: Subtítulo: Cómo los alimentos impactan tu azúcar · Fecha: Abril 2026

====
SLIDE: 2
TIPO: Contenido
INSIGHT: Los carbohidratos elevan la glucosa en sangre
DATOS: Todo carbohidrato se convierte en glucosa;El páncreas libera insulina;Sin insulina, la glucosa se acumula
NOTAS: Fuente: American Diabetes Association, 2024
```

---

## Tipos de slide

| Tipo | Uso |
|---|---|
| Portada | Primer slide — siempre |
| Divisor | Transición entre módulos |
| Contenido | Puntos de contenido (máx. 4 bullets) |
| Estadística | Un número protagonista |
| EstadísticaTrío | Tres datos en tarjetas |
| Cita | Testimonio o cita atribuida |
| Gráfico | Visualización Chart.js |
| DosColumnas | Comparación lado a lado |
| Tabla | Datos tabulares |
| Actividad | Ejercicio participativo |
| Cierre | Llamada a la acción — siempre el último |
| Animación | Ilustración animada por pasos (glucosa, insulina, medicamentos) |

---

## Stack técnico

- **Generador:** Node.js (`build-deck-html.js`) — incluido en el plugin
- **Gráficos:** Chart.js 4.4.1 (CDN)
- **Fuentes:** Google Fonts — Playfair Display + DM Sans
- **Animaciones:** Canvas, sin librerías externas (`references/componentes/`)
- **Escala:** todo el slide escala con su propio ancho (16:9 en cualquier pantalla)
- **Output:** Un único archivo `.html` autocontenido

---

*Nutrición.Health · Insight-to-Slide v0.2.0*
