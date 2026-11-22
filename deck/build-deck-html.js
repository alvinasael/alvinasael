#!/usr/bin/env node
/**
 * Nutrición.Health — Insight-to-Slide HTML Generator
 * build-deck-html.js
 *
 * Usage: node build-deck-html.js input.txt [output.html]
 *
 * Reads a .txt file with SLIDE blocks and generates a complete
 * self-contained HTML presentation with sidebar, progress bar,
 * keyboard navigation, and presenter mode.
 *
 * Supported TIPO values:
 *   Portada, Divisor, Contenido, Estadística, EstadísticaTrío,
 *   Cita, Gráfico, DosColumnas, Tabla, Actividad, Cierre,
 *   Animación (DATOS = nombre de un archivo en ./componentes/<nombre>.html;
 *              el componente puede usar {{INCLUIR:archivo}} para código compartido)
 */

const fs   = require("fs");
const path = require("path");

// ─── CLI ──────────────────────────────────────────────────────────────────────
const [,, inputFile, outputArg] = process.argv;
if (!inputFile) {
  console.error("Uso: node build-deck-html.js input.txt [output.html]");
  process.exit(1);
}
const outputFile = outputArg || inputFile.replace(/\.txt$/i, ".html");

// ─── PARSE .TXT ───────────────────────────────────────────────────────────────
function parseTxt(raw) {
  // Split on separator lines (4+ equal signs)
  const parts = raw.split(/={4,}/);
  const blocks = [];

  for (const part of parts) {
    const lines = part.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const block = { SLIDE: "", TIPO: "", INSIGHT: "", DATOS: "", NOTAS: "" };
    let currentField = null;
    let multiLines = [];

    for (const line of lines) {
      const m = line.match(/^(SLIDE|TIPO|INSIGHT|DATOS|NOTAS):\s*(.*)/);
      if (m) {
        if (currentField === "DATOS" && multiLines.length)
          block.DATOS = multiLines.join("\n");
        currentField = m[1];
        multiLines = m[2] ? [m[2]] : [];
        if (currentField !== "DATOS") block[currentField] = m[2].trim();
      } else if (currentField === "DATOS") {
        multiLines.push(line);
      }
    }
    if (currentField === "DATOS" && multiLines.length)
      block.DATOS = multiLines.join("\n").trim();

    if (block.SLIDE) blocks.push(block);
  }
  return blocks;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const esc = s => String(s)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

// Parse NOTAS for a named key: "CTA: X" → "X"
function notasKey(notas, key) {
  const re = new RegExp(`${key}:\\s*([^·\n]+)`, "i");
  const m = notas.match(re);
  return m ? m[1].trim() : "";
}

// Parse DATOS bullets (semicolon-separated)
function parseBullets(datos) {
  return datos.split(";").map(s => s.trim()).filter(Boolean);
}

// Parse two-column DATOS: "Label A: b1; b2 || Label B: b1; b2"
function parseTwoCols(datos) {
  const [left, right] = datos.split("||").map(s => s.trim());
  const parseCol = str => {
    if (!str) return { label: "", head: "", items: [] };
    const colon = str.indexOf(":");
    if (colon === -1) return { label: str, head: "", items: [] };
    const label = str.slice(0, colon).trim();
    const rest  = str.slice(colon + 1).trim();
    const parts = rest.split(";").map(s => s.trim()).filter(Boolean);
    return { label, head: parts[0] || "", items: parts.slice(1) };
  };
  return { left: parseCol(left), right: parseCol(right) };
}

// Parse table DATOS: first line = headers, remaining lines = rows (pipe-separated)
function parseTable(datos) {
  const lines = datos.split("\n").map(s => s.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split("|").map(s => s.trim());
  const rows    = lines.slice(1).map(l => l.split("|").map(s => s.trim()));
  return { headers, rows };
}

// Parse chart DATOS: "Category, value\nCategory, value" or "Cat,val; Cat,val"
function parseChart(datos, notasRaw) {
  // normalize: replace semicolons if used as row separator
  const normalized = datos.includes("\n")
    ? datos
    : datos.replace(/;/g, "\n");

  const entries = normalized.split("\n")
    .map(l => l.trim()).filter(Boolean)
    .map(l => {
      const lastComma = l.lastIndexOf(",");
      if (lastComma === -1) return null;
      return {
        label: l.slice(0, lastComma).trim(),
        value: parseFloat(l.slice(lastComma + 1).trim()) || 0
      };
    })
    .filter(Boolean);

  // Determine which bar gets amber: look for "destacar X en ámbar" in NOTAS
  const amberMatch = notasRaw.match(/destacar\s+"?([^"·\n]+?)"?\s+en\s+ámbar/i);
  const amberLabel = amberMatch ? amberMatch[1].trim().toLowerCase() : "";

  const labels = entries.map(e => e.label);
  const values = entries.map(e => e.value);
  const colors = entries.map(e =>
    amberLabel && e.label.toLowerCase().includes(amberLabel)
      ? "#C4832B" : e.value === Math.max(...values)
      ? "#C4832B" : "#2B4038"
  );

  return { labels, values, colors };
}

// Infer TIPO from content when TIPO field is empty
function inferTipo(block) {
  const datos = block.DATOS.trim();
  const notas = block.NOTAS.trim();

  if (!block.TIPO || block.TIPO === "") {
    const slideNum = parseInt(block.SLIDE);
    if (slideNum === 1) return "Portada";
    if (datos.includes("||") && datos.split("||").length === 3) return "EstadísticaTrío";
    if (datos.includes("||")) return "DosColumnas";
    if (datos.includes("|") && datos.includes("\n")) return "Tabla";
    if (datos.includes(",") && !datos.includes(";")) return "Gráfico";
    if (datos.includes(";")) return "Contenido";
    if (/^\d/.test(datos) || /^[\d.,<%]+$/.test(datos)) return "Estadística";
    if (notas.match(/CTA:/i)) return "Cierre";
    return "Contenido";
  }

  // Normalize common spellings
  const t = block.TIPO.toLowerCase().replace(/\s+/g, "").replace(/[áéíóúü]/g, c =>
    ({ á:"a", é:"e", í:"i", ó:"o", ú:"u", ü:"u" }[c] || c));
  if (t.includes("animacion") || t.includes("simulacion")) return "Animación";
  if (t.includes("portada")) return "Portada";
  if (t.includes("divisor") || t.includes("modulo")) return "Divisor";
  if (t.includes("estadisticatrio") || t.includes("trio")) return "EstadísticaTrío";
  if (t.includes("estadistica") || t.includes("estadístic")) return "Estadística";
  if (t.includes("contenido")) return "Contenido";
  if (t.includes("cita") || t.includes("testimonio")) return "Cita";
  if (t.includes("grafico") || t.includes("gráf")) return "Gráfico";
  if (t.includes("doscolumnas") || t.includes("columnas") || t.includes("dos")) return "DosColumnas";
  if (t.includes("tabla")) return "Tabla";
  if (t.includes("actividad")) return "Actividad";
  if (t.includes("cierre")) return "Cierre";
  return "Contenido";
}

// ─── SLIDE RENDERERS ──────────────────────────────────────────────────────────
const includedOnce = new Set(); // archivos compartidos ya insertados (componentes Animación)
let chartCount = 0;
const chartInits = []; // collected Chart.js init scripts

function renderSlide(block, idx) {
  const tipo = inferTipo(block);
  const ins  = esc(block.INSIGHT);
  const dat  = block.DATOS.trim();
  const not  = block.NOTAS.trim();

  switch (tipo) {

    // ── PORTADA ───────────────────────────────────────────────────────────────
    case "Portada": {
      const subtitle = notasKey(not, "Subtítulo") ||
                       not.replace(/Fecha:[^·\n]*/i, "").replace(/·/g, "").trim();
      const fecha    = notasKey(not, "Fecha") ||
                       not.match(/(\d{1,2}\s+de\s+\w+[\s\w]*\d{4}|\w+\s+\d{4})/i)?.[1] || "";
      return `<div class="slide-page slide-cover" data-index="${idx}">
  <div class="sp" style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div class="s-accent-line"></div>
    <div class="s-tag">${esc(dat || not.split("·")[0]?.trim() || "")}</div>
    <div class="s-title">${ins}</div>
    ${subtitle ? `<div class="s-sub">${esc(subtitle)}</div>` : ""}
  </div>
  <div class="s-footer">
    <span class="s-brand">Nutrición.Health</span>
    <span class="s-date">${esc(fecha)}</span>
  </div>
</div>`;
    }

    // ── DIVISOR ───────────────────────────────────────────────────────────────
    case "Divisor": {
      const modNum = not.match(/módulo\s*(\d+)/i)?.[1] ||
                     not.match(/\b(\d+)\b/)?.[1] || "2";
      return `<div class="slide-page slide-module" data-index="${idx}">
  <div class="s-module-num">${esc(modNum)}</div>
  <div class="sp" style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div class="s-mod-label">${esc(not.replace(/^\d+\s*\.?\s*/,"").trim() || `Módulo ${modNum}`)}</div>
    <div class="s-mod-title">${ins}</div>
    <div class="s-mod-line"></div>
  </div>
</div>`;
    }

    // ── CONTENIDO ─────────────────────────────────────────────────────────────
    case "Contenido": {
      const bullets  = parseBullets(dat).slice(0, 4);
      const source   = notasKey(not, "Fuente") || not;
      const introMatch = not.match(/intro:\s*([^·\n]+)/i);
      const intro    = introMatch ? introMatch[1].trim() : "";
      return `<div class="slide-page slide-content" data-index="${idx}">
  <div class="s-header">
    <div class="s-header-title">${ins}</div>
    <div class="s-header-brand">Nutrición.Health</div>
  </div>
  <div class="s-body">
    ${intro ? `<div class="s-intro">${esc(intro)}</div>` : ""}
    <div class="s-points">
      ${bullets.map(b => `<div class="s-point">
        <div class="s-point-dot"></div>
        <div class="s-point-text">${esc(b)}</div>
      </div>`).join("\n      ")}
    </div>
  </div>
  <div class="s-foot">
    <span>${source ? "Fuente: " + esc(source) : ""}</span>
    <span style="font-style:italic;">Más allá del consultorio.</span>
  </div>
</div>`;
    }

    // ── ESTADÍSTICA ───────────────────────────────────────────────────────────
    case "Estadística": {
      const source = notasKey(not, "Fuente") || not;
      return `<div class="slide-page slide-stat" data-index="${idx}">
  <div class="s-stat-top">
    <div class="s-stat-label">Dato clave${source ? " · Fuente: " + esc(source) : ""}</div>
    <div class="s-stat-brand">Nutrición.Health</div>
  </div>
  <div class="s-stat-center">
    <div class="s-big-num">${esc(dat || "—")}</div>
    <div class="s-big-label">${ins}</div>
  </div>
  <div class="s-stat-source">${source ? "Fuente: " + esc(source) : ""}</div>
</div>`;
    }

    // ── ESTADÍSTICA TRÍO ──────────────────────────────────────────────────────
    case "EstadísticaTrío": {
      const parts  = dat.split("||").map(s => s.trim());
      const label  = notasKey(not, "Label") || not.split("·")[0]?.trim() || "";
      const source = notasKey(not, "Fuente") || "";
      const trio   = parts.slice(0, 3).map(p => {
        const c = p.lastIndexOf(",");
        if (c === -1) { const sp = p.indexOf(" "); return sp === -1
          ? { num: p, lbl: "" }
          : { num: p.slice(0,sp), lbl: p.slice(sp+1) }; }
        return { num: p.slice(0, c).trim(), lbl: p.slice(c+1).trim() };
      });
      return `<div class="slide-page slide-stat-trio" data-index="${idx}">
  <div class="s-stat-top">
    <div class="s-stat-label">${esc(label)}</div>
    <div class="s-stat-brand">Nutrición.Health</div>
  </div>
  <div class="s-trio-center">
    <div class="s-trio-statement">${ins}</div>
  </div>
  <div class="s-stat-trio">
    ${trio.map(t => `<div class="s-trio-item">
      <div class="s-trio-num">${esc(t.num)}</div>
      <div class="s-trio-lbl">${esc(t.lbl)}</div>
    </div>`).join("\n    ")}
  </div>
</div>`;
    }

    // ── CITA ──────────────────────────────────────────────────────────────────
    case "Cita": {
      const attribution = not.trim();
      return `<div class="slide-page slide-quote" data-index="${idx}">
  <div class="s-quote-inner">
    <div class="s-quote-mark">"</div>
    <div class="s-quote-text">${ins}</div>
    <div class="s-quote-bar"></div>
    <div class="s-quote-source">${esc(attribution)}</div>
  </div>
</div>`;
    }

    // ── GRÁFICO ───────────────────────────────────────────────────────────────
    case "Gráfico": {
      const { labels, values, colors } = parseChart(dat, not);
      const source   = notasKey(not, "Fuente") || "";
      const intro    = notasKey(not, "Intro") || "";
      const cid      = `chart${++chartCount}`;

      // determine a key insight callout: the amber bar's label + value
      const amberIdx = colors.indexOf("#C4832B");
      const insight  = amberIdx >= 0
        ? `<strong>${esc(values[amberIdx])}%</strong> — ${esc(labels[amberIdx])}`
        : "";

      chartInits.push(`
  new Chart(document.getElementById("${cid}"), {
    type: "bar",
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [{
        data: ${JSON.stringify(values)},
        backgroundColor: ${JSON.stringify(colors)},
        hoverBackgroundColor: ${JSON.stringify(colors.map(c => c === "#C4832B" ? "#E09A3F" : "#3D5C4F"))},
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 500, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1E1C19", titleColor: "#C4832B", bodyColor: "#F7F3ED", padding: 10,
          callbacks: { label: ctx => " " + ctx.parsed.y + "%" }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false },
             ticks: { color: "#6B6760", font: { size: 11 } } },
        y: { min: 0, grid: { color: "#EDE8DF" }, border: { display: false },
             ticks: { color: "#C2C0BC", font: { size: 10 }, callback: v => v + "%" } }
      }
    }
  });`);

      return `<div class="slide-page slide-chart" data-index="${idx}">
  <div class="s-header">
    <div class="s-header-title">${ins}</div>
    <div class="s-header-brand">Nutrición.Health</div>
  </div>
  <div class="s-chart-body">
    ${intro ? `<div class="s-chart-intro">${esc(intro)}</div>` : ""}
    <div class="s-chart-area">
      <canvas id="${cid}"></canvas>
    </div>
    ${insight ? `<div class="s-chart-insight">${insight}</div>` : ""}
  </div>
  <div class="s-foot">
    <span>${source ? "Fuente: " + esc(source) : ""}</span>
    <span style="font-style:italic;">Más allá del consultorio.</span>
  </div>
</div>`;
    }

    // ── DOS COLUMNAS ──────────────────────────────────────────────────────────
    case "DosColumnas": {
      const { left, right } = parseTwoCols(dat);
      return `<div class="slide-page slide-two-col" data-index="${idx}">
  <div class="s-tc-header">
    <div class="s-tc-title">${ins}</div>
    <div class="s-tc-brand">Nutrición.Health</div>
  </div>
  <div class="s-tc-body">
    <div class="s-col">
      <div class="s-col-label">${esc(left.label)}</div>
      ${left.head ? `<div class="s-col-head">${esc(left.head)}</div>` : ""}
      ${left.items.map(i => `<div class="s-col-item">
        <div class="s-col-dot"></div>
        <div class="s-col-text">${esc(i)}</div>
      </div>`).join("\n      ")}
    </div>
    <div class="s-col">
      <div class="s-col-label">${esc(right.label)}</div>
      ${right.head ? `<div class="s-col-head">${esc(right.head)}</div>` : ""}
      ${right.items.map(i => `<div class="s-col-item">
        <div class="s-col-dot"></div>
        <div class="s-col-text">${esc(i)}</div>
      </div>`).join("\n      ")}
    </div>
  </div>
  <div class="s-tc-foot">
    <span>Nutrición.Health</span>
    <span style="font-style:italic;">Más allá del consultorio.</span>
  </div>
</div>`;
    }

    // ── TABLA ─────────────────────────────────────────────────────────────────
    case "Tabla": {
      const { headers, rows } = parseTable(dat);
      const source   = notasKey(not, "Fuente") || not;
      const subtitle = notasKey(not, "Subtítulo") || "";
      return `<div class="slide-page slide-table" data-index="${idx}">
  <div class="s-tbl-header">
    <div class="s-tbl-title">${ins}</div>
    ${subtitle ? `<div class="s-tbl-sub">${esc(subtitle)}</div>` : ""}
  </div>
  <div class="s-tbl-body">
    <table class="s-table">
      <thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row, ri) => `<tr>${row.map((cell, ci) =>
          `<td${ci === 1 ? ' class="td-highlight"' : ""}>${esc(cell)}</td>`
        ).join("")}</tr>`).join("\n        ")}
      </tbody>
    </table>
  </div>
  <div class="s-tbl-foot">${source ? "Fuente: " + esc(source) : "Nutrición.Health · Uso educativo interno"}</div>
</div>`;
    }

    // ── ACTIVIDAD ─────────────────────────────────────────────────────────────
    case "Actividad": {
      // Parse NOTAS: "Label A: ... · Hint A: ... · Label B: ... · Hint B: ..."
      const labelA = notasKey(not, "Label A") || "Lo que aprendí hoy";
      const hintA  = notasKey(not, "Hint A")  || "Escribe lo primero que se te venga a la mente";
      const labelB = notasKey(not, "Label B") || "Una pregunta que me queda";
      const hintB  = notasKey(not, "Hint B")  || "Puede ser una persona, un dato, o una pregunta";
      return `<div class="slide-page slide-activity" data-index="${idx}">
  <div class="s-act-top">
    <div class="s-act-badge">✏ Actividad práctica</div>
    <div class="s-act-brand">Nutrición.Health</div>
  </div>
  <div class="s-act-title">${ins}</div>
  <div class="s-act-body">
    <div class="s-act-col">
      <div class="s-act-col-head">${esc(labelA)}</div>
      <div class="s-act-line"></div><div class="s-act-line"></div><div class="s-act-line"></div>
      <div class="s-act-hint">${esc(hintA)}</div>
    </div>
    <div class="s-act-col">
      <div class="s-act-col-head">${esc(labelB)}</div>
      <div class="s-act-line"></div><div class="s-act-line"></div><div class="s-act-line"></div>
      <div class="s-act-hint">${esc(hintB)}</div>
    </div>
  </div>
</div>`;
    }

    // ── CIERRE ────────────────────────────────────────────────────────────────
    case "Cierre": {
      const cta      = notasKey(not, "CTA") || "Escríbela en tu tarjeta de cierre";
      const proxima  = notasKey(not, "Próxima sesión") || notasKey(not, "Proxima sesión") || notasKey(not, "Próxima") || "";
      const sub      = notasKey(not, "Sub") || "Antes de cerrar la sesión, escríbela en tu tarjeta de cierre.";
      return `<div class="slide-page slide-close" data-index="${idx}">
  <div class="s-close-inner">
    <div class="s-close-line"></div>
    <div class="s-close-label">Una acción para los próximos 7 días</div>
    <div class="s-close-title">${ins}</div>
    <div class="s-close-sub">${esc(sub)}</div>
    <div class="s-close-cta">${proxima ? "Próxima sesión: " + esc(proxima) : esc(cta)}</div>
  </div>
  <div class="s-close-footer">
    <span class="s-close-brand">Nutrición.Health</span>
    <span class="s-close-tagline">Más allá del consultorio.</span>
  </div>
</div>`;
    }

    // ── ANIMACIÓN ─────────────────────────────────────────────────────────────
    // Inserta un componente autocontenido desde ./componentes/<DATOS>.html.
    // Marcadores disponibles en el componente: {{INDEX}} {{TITULO}} {{FUENTE}}
    case "Animación": {
      const name = dat.split(/\s+/)[0] || "";
      const file = path.join(path.dirname(path.resolve(inputFile)), "componentes", name + ".html");
      if (!name || !fs.existsSync(file)) {
        console.error(`  ⚠ Slide ${block.SLIDE}: no encontré el componente ${file}`);
        return `<div class="slide-page slide-content" data-index="${idx}">
  <div class="s-header"><div class="s-header-title">${ins}</div></div>
  <div class="s-body"><div class="s-intro">Falta el componente: ${esc(name)}</div></div>
</div>`;
      }
      // {{INCLUIR:archivo}} inserta un archivo compartido de ./componentes una sola vez por deck
      const compDir = path.dirname(file);
      return fs.readFileSync(file, "utf8")
        .replace(/{{INCLUIR:([\w.-]+)}}/g, (_, inc) => {
          if (includedOnce.has(inc)) return "";
          includedOnce.add(inc);
          return fs.readFileSync(path.join(compDir, inc), "utf8");
        })
        .replace(/{{INDEX}}/g, String(idx))
        .replace(/{{TITULO}}/g, ins)
        .replace(/{{FUENTE}}/g, esc(notasKey(not, "Fuente")));
    }

    default:
      return `<div class="slide-page slide-content" data-index="${idx}">
  <div class="s-header"><div class="s-header-title">${ins}</div></div>
  <div class="s-body"><div class="s-intro">${esc(dat)}</div></div>
</div>`;
  }
}

// ─── SIDEBAR LABEL ────────────────────────────────────────────────────────────
function sidebarLabel(block) {
  const tipo = inferTipo(block);
  const typeLabels = {
    "Portada": "Portada", "Divisor": "Divisor", "Contenido": "Contenido",
    "Estadística": "Estadística", "EstadísticaTrío": "Est. Trío",
    "Cita": "Cita", "Gráfico": "Gráfica", "DosColumnas": "2 Columnas",
    "Tabla": "Tabla", "Actividad": "Actividad", "Cierre": "Cierre",
    "Animación": "Animación"
  };
  // Short title: truncate insight
  const title = block.INSIGHT.length > 38
    ? block.INSIGHT.slice(0, 36) + "…"
    : block.INSIGHT;
  return { title, type: typeLabels[tipo] || tipo, num: block.SLIDE.padStart(2,"0") };
}

// ─── DECK TITLE ───────────────────────────────────────────────────────────────
function getDeckTitle(blocks) {
  const portada = blocks.find(b => inferTipo(b) === "Portada");
  return portada ? portada.INSIGHT : path.basename(inputFile, ".txt");
}

// ─── HTML SHELL ───────────────────────────────────────────────────────────────
function buildHTML(blocks) {
  const total     = blocks.length;
  const deckTitle = getDeckTitle(blocks);
  const slidesHTML = blocks.map((b, i) => renderSlide(b, i)).join("\n\n");
  const sidebarItems = blocks.map((b, i) => {
    const { title, type, num } = sidebarLabel(b);
    return `<div class="slide-nav-item${i === 0 ? " active" : ""}" onclick="goTo(${i})">
  <span class="slide-nav-num">${esc(num)}</span>
  <span class="slide-nav-title">${esc(title)}<span class="slide-nav-type">${esc(type)}</span></span>
</div>`;
  }).join("\n");

  const chartScript = chartInits.length
    ? `\n  // ── CHARTS ────────────────────────────────────────────────────────────\n  ${chartInits.join("\n")}`
    : "";
  const chartLib = chartInits.length
    ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>\n  `
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(deckTitle)} — Nutrición.Health</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  ${chartLib}<style>
    :root {
      --green:       #2B4038;
      --green-mid:   #3D5C4F;
      --green-light: #D4E4DD;
      --green-pale:  #EBF3EF;
      --cream:       #F7F3ED;
      --cream-dark:  #EDE8DF;
      --amber:       #C4832B;
      --amber-light: #F5E8D6;
      --charcoal:    #1E1C19;
      --charcoal-60: #6B6760;
      --charcoal-30: #C2C0BC;
      --white:       #FFFFFF;
      --sans:  'DM Sans', system-ui, sans-serif;
      --serif: 'Playfair Display', Georgia, serif;
      --sidebar-w: 220px;
      --progress-h: 3px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--sans); background: #111; color: var(--charcoal); overflow: hidden; height: 100vh; display: flex; flex-direction: column; }

    /* PROGRESS BAR */
    #progress-bar { position: fixed; top:0; left:0; width:100%; height:var(--progress-h); background:rgba(255,255,255,.08); z-index:1000; }
    #progress-fill { height:100%; background:var(--amber); width:0%; transition:width .4s cubic-bezier(.4,0,.2,1); }

    /* APP SHELL */
    #app { display:flex; flex:1; height:100vh; padding-top:var(--progress-h); }

    /* SIDEBAR */
    #sidebar { width:var(--sidebar-w); min-width:var(--sidebar-w); background:var(--charcoal); display:flex; flex-direction:column; overflow:hidden; transition:width .35s cubic-bezier(.4,0,.2,1), min-width .35s cubic-bezier(.4,0,.2,1), opacity .25s ease; }
    #sidebar.hidden { width:0; min-width:0; opacity:0; }
    .sidebar-brand { padding:20px 18px 16px; border-bottom:1px solid rgba(255,255,255,.07); flex-shrink:0; }
    .sidebar-brand-name { font-size:11px; font-weight:600; color:var(--green-light); letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
    .sidebar-deck-title { font-size:10px; color:rgba(255,255,255,.25); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #slide-list { flex:1; overflow-y:auto; padding:8px 0; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,.1) transparent; }
    #slide-list::-webkit-scrollbar { width:4px; }
    #slide-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }
    .slide-nav-item { display:flex; align-items:center; gap:10px; padding:9px 18px; cursor:pointer; border-left:3px solid transparent; transition:background .15s, border-color .15s; white-space:nowrap; overflow:hidden; }
    .slide-nav-item:hover { background:rgba(255,255,255,.05); }
    .slide-nav-item.active { border-left-color:var(--amber); background:rgba(196,131,43,.08); }
    .slide-nav-num { font-size:10px; font-weight:600; color:var(--amber); min-width:18px; text-align:right; flex-shrink:0; opacity:.7; }
    .slide-nav-item.active .slide-nav-num { opacity:1; }
    .slide-nav-title { font-size:11px; color:rgba(255,255,255,.4); overflow:hidden; text-overflow:ellipsis; line-height:1.35; transition:color .15s; }
    .slide-nav-item.active .slide-nav-title { color:rgba(255,255,255,.85); }
    .slide-nav-type { font-size:9px; color:rgba(255,255,255,.2); display:block; margin-top:1px; text-transform:uppercase; letter-spacing:.06em; }
    .slide-nav-item.active .slide-nav-type { color:rgba(196,131,43,.5); }
    .sidebar-footer { padding:14px 18px; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }
    .sidebar-hint { font-size:10px; color:rgba(255,255,255,.2); line-height:1.8; }
    .sidebar-hint kbd { font-family:monospace; background:rgba(255,255,255,.08); padding:1px 5px; border-radius:3px; font-size:9px; }

    /* STAGE */
    #stage { flex:1; display:flex; align-items:center; justify-content:center; background:#0e0e0e; padding:24px; overflow:hidden; position:relative; }
    #stage-controls { position:absolute; top:12px; right:14px; display:flex; gap:8px; opacity:0; transition:opacity .2s; z-index:10; }
    #stage:hover #stage-controls { opacity:1; }
    .ctrl-btn { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.5); font-family:var(--sans); font-size:10px; padding:5px 10px; border-radius:5px; cursor:pointer; letter-spacing:.04em; transition:background .15s, color .15s; }
    .ctrl-btn:hover { background:rgba(255,255,255,.12); color:rgba(255,255,255,.85); }
    #slide-viewport { width:100%; max-width:100%; aspect-ratio:16/9; position:relative; overflow:hidden; border-radius:8px; box-shadow:0 24px 80px rgba(0,0,0,.6); }
    .slide-page { position:absolute; inset:0; opacity:0; pointer-events:none; transition:opacity .3s ease; display:flex; flex-direction:column; font-size:clamp(10px,1.45vw,20px); }
    .slide-page * { line-height:1.2; }
    .slide-page.active { opacity:1; pointer-events:auto; }
    #nav-prev, #nav-next { position:absolute; top:50%; transform:translateY(-50%); width:48px; height:80px; background:rgba(255,255,255,.04); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.3); font-size:20px; border-radius:6px; transition:background .15s, color .15s; z-index:5; }
    #nav-prev { left:-4px; }
    #nav-next { right:-4px; }
    #nav-prev:hover, #nav-next:hover { background:rgba(255,255,255,.1); color:rgba(255,255,255,.8); }
    #nav-prev:disabled, #nav-next:disabled { opacity:.2; cursor:default; }

    /* PRESENTER MODE */
    body.presenter-mode #progress-bar { display:none; }
    body.presenter-mode #stage { background:#000; padding:0; }
    body.presenter-mode #slide-viewport { border-radius:0; box-shadow:none; width:100vw; height:100vh; max-width:none; aspect-ratio:unset; }
    body.presenter-mode #nav-prev, body.presenter-mode #nav-next { display:none; }

    /* SLIDE TYPE STYLES */
    .sp  { padding:5% 6%; }
    .sp-lg { padding:6% 7%; }

    /* Portada */
    .slide-cover { background:var(--green); }
    .slide-cover .s-accent-line { width:40px; height:3px; background:var(--amber); margin-bottom:4%; }
    .slide-cover .s-tag { font-size:.85em; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--amber); margin-bottom:3%; }
    .slide-cover .s-title { font-family:var(--serif); font-size:3.2em; font-weight:400; color:var(--white); line-height:1.1; margin-bottom:3%; }
    .slide-cover .s-sub { font-size:1.1em; font-weight:300; color:var(--green-light); line-height:1.6; }
    .slide-cover .s-footer { position:absolute; bottom:0; left:0; right:0; padding:3% 6%; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,.12); }
    .slide-cover .s-brand { font-size:.8em; font-weight:600; color:rgba(255,255,255,.5); letter-spacing:.06em; }
    .slide-cover .s-date { font-size:.75em; color:rgba(255,255,255,.3); }

    /* Divisor */
    .slide-module { background:var(--charcoal); }
    .slide-module .s-module-num { font-family:var(--serif); font-size:8em; font-weight:700; color:rgba(255,255,255,.07); position:absolute; top:-5%; right:4%; line-height:1; }
    .slide-module .s-mod-label { font-size:.8em; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--amber); margin-bottom:3%; position:relative; z-index:1; }
    .slide-module .s-mod-title { font-family:var(--serif); font-size:2.6em; font-weight:400; color:var(--white); line-height:1.15; position:relative; z-index:1; max-width:70%; }
    .slide-module .s-mod-line { width:50px; height:3px; background:var(--amber); margin-top:4%; position:relative; z-index:1; }

    /* Contenido */
    .slide-content { background:var(--cream); }
    .slide-content .s-header { background:var(--green); padding:4% 6%; display:flex; justify-content:space-between; align-items:center; }
    .slide-content .s-header-title { font-family:var(--serif); font-size:1.5em; font-weight:400; color:var(--white); }
    .slide-content .s-header-brand { font-size:.7em; font-weight:600; letter-spacing:.08em; color:var(--green-light); }
    .slide-content .s-body { flex:1; padding:4% 6%; display:flex; flex-direction:column; justify-content:center; }
    .slide-content .s-intro { font-size:.95em; color:var(--charcoal-60); margin-bottom:4%; line-height:1.5; font-style:italic; }
    .slide-content .s-points { display:flex; flex-direction:column; gap:2.5%; }
    .slide-content .s-point { display:flex; gap:3%; align-items:flex-start; }
    .slide-content .s-point-dot { width:8px; height:8px; background:var(--amber); border-radius:50%; margin-top:.5%; flex-shrink:0; }
    .slide-content .s-point-text { font-size:.88em; color:var(--charcoal); line-height:1.5; }
    .slide-content .s-foot { padding:2% 6%; border-top:1px solid var(--cream-dark); display:flex; justify-content:space-between; font-size:.65em; color:var(--charcoal-30); }

    /* Estadística */
    .slide-stat { background:var(--green); }
    .slide-stat .s-stat-top { padding:5% 6% 0; display:flex; justify-content:space-between; align-items:flex-start; }
    .slide-stat .s-stat-label { font-size:.78em; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--amber); }
    .slide-stat .s-stat-brand { font-size:.72em; font-weight:600; color:rgba(255,255,255,.35); }
    .slide-stat .s-stat-center { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:0 6%; text-align:center; }
    .slide-stat .s-big-num { font-family:var(--serif); font-size:7em; font-weight:700; color:var(--amber); line-height:1; margin-bottom:3%; }
    .slide-stat .s-big-label { font-size:1.05em; color:var(--white); max-width:65%; line-height:1.4; }
    .slide-stat .s-stat-source { padding:0 6% 4%; font-size:.65em; color:rgba(255,255,255,.3); text-align:center; }

    /* Estadística Trío */
    .slide-stat-trio { background:var(--green); }
    .slide-stat-trio .s-stat-top { padding:5% 6% 0; display:flex; justify-content:space-between; align-items:flex-start; }
    .slide-stat-trio .s-stat-label { font-size:.78em; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--amber); }
    .slide-stat-trio .s-stat-brand { font-size:.72em; font-weight:600; color:rgba(255,255,255,.35); }
    .slide-stat-trio .s-trio-center { flex:1; display:flex; align-items:center; justify-content:center; padding:0 6%; text-align:center; }
    .slide-stat-trio .s-trio-statement { font-family:var(--serif); font-size:1.3em; font-weight:400; color:var(--white); line-height:1.3; max-width:70%; }
    .slide-stat-trio .s-stat-trio { display:flex; gap:2%; padding:0 6% 5%; }
    .slide-stat-trio .s-trio-item { flex:1; background:rgba(255,255,255,.07); border-radius:6px; padding:3% 4%; }
    .slide-stat-trio .s-trio-num { font-family:var(--serif); font-size:1.8em; font-weight:600; color:var(--amber); }
    .slide-stat-trio .s-trio-lbl { font-size:.65em; color:rgba(255,255,255,.5); margin-top:1%; line-height:1.4; }

    /* Cita */
    .slide-quote { background:var(--cream); display:flex; align-items:center; justify-content:center; }
    .slide-quote .s-quote-inner { padding:8% 10%; display:flex; flex-direction:column; align-items:center; text-align:center; }
    .slide-quote .s-quote-mark { font-family:var(--serif); font-size:7em; color:var(--green-light); line-height:.6; margin-bottom:4%; }
    .slide-quote .s-quote-text { font-family:var(--serif); font-size:1.6em; font-weight:400; font-style:italic; color:var(--green); line-height:1.4; margin-bottom:4%; }
    .slide-quote .s-quote-bar { width:40px; height:3px; background:var(--amber); margin:3% auto; }
    .slide-quote .s-quote-source { font-size:.78em; font-weight:600; color:var(--amber); letter-spacing:.08em; text-transform:uppercase; }

    /* Gráfico */
    .slide-chart { background:var(--cream); }
    .slide-chart .s-header { background:var(--green); padding:4% 6%; display:flex; justify-content:space-between; align-items:center; }
    .slide-chart .s-header-title { font-family:var(--serif); font-size:1.5em; font-weight:400; color:var(--white); }
    .slide-chart .s-header-brand { font-size:.7em; font-weight:600; letter-spacing:.08em; color:var(--green-light); }
    .slide-chart .s-chart-body { flex:1; display:flex; flex-direction:column; padding:3% 6% 2%; gap:2%; }
    .slide-chart .s-chart-intro { font-size:.82em; color:var(--charcoal-60); font-style:italic; line-height:1.5; }
    .slide-chart .s-chart-area { flex:1; position:relative; }
    .slide-chart .s-chart-insight { display:inline-flex; align-items:center; gap:6px; background:var(--amber-light); border-left:3px solid var(--amber); padding:1.5% 2.5%; border-radius:0 6px 6px 0; font-size:.75em; color:var(--charcoal); line-height:1.4; }
    .slide-chart .s-chart-insight strong { color:var(--amber); font-weight:700; }
    .slide-chart .s-foot { padding:1.5% 6%; border-top:1px solid var(--cream-dark); display:flex; justify-content:space-between; font-size:.62em; color:var(--charcoal-30); }

    /* Dos Columnas */
    .slide-two-col { background:var(--cream); }
    .slide-two-col .s-tc-header { background:var(--green); padding:3.5% 6%; display:flex; justify-content:space-between; align-items:center; }
    .slide-two-col .s-tc-title { font-family:var(--serif); font-size:1.3em; font-weight:400; color:var(--white); }
    .slide-two-col .s-tc-brand { font-size:.65em; color:var(--green-light); font-weight:600; letter-spacing:.06em; }
    .slide-two-col .s-tc-body { flex:1; display:grid; grid-template-columns:1fr 1fr; }
    .slide-two-col .s-col { padding:4% 5%; display:flex; flex-direction:column; gap:3%; }
    .slide-two-col .s-col:first-child { border-right:1px solid var(--cream-dark); }
    .slide-two-col .s-col-label { font-size:.7em; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--amber); margin-bottom:1%; }
    .slide-two-col .s-col-head { font-family:var(--serif); font-size:1.05em; color:var(--charcoal); margin-bottom:2%; }
    .slide-two-col .s-col-item { display:flex; gap:3%; align-items:flex-start; }
    .slide-two-col .s-col-dot { width:6px; height:6px; background:var(--green); border-radius:50%; margin-top:1%; flex-shrink:0; }
    .slide-two-col .s-col-text { font-size:.78em; color:var(--charcoal-60); line-height:1.5; }
    .slide-two-col .s-tc-foot { padding:2% 6%; border-top:1px solid var(--cream-dark); font-size:.62em; color:var(--charcoal-30); display:flex; justify-content:space-between; }

    /* Tabla */
    .slide-table { background:var(--white); }
    .slide-table .s-tbl-header { background:var(--green); padding:3.5% 6%; }
    .slide-table .s-tbl-title { font-family:var(--serif); font-size:1.3em; font-weight:400; color:var(--white); }
    .slide-table .s-tbl-sub { font-size:.72em; color:var(--green-light); margin-top:1%; }
    .slide-table .s-tbl-body { flex:1; padding:3% 6%; overflow:hidden; }
    .s-table { width:100%; border-collapse:collapse; font-size:.78em; }
    .s-table thead th { background:var(--cream); padding:2.5% 3%; text-align:left; font-size:.75em; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--charcoal-60); border-bottom:2px solid var(--cream-dark); }
    .s-table tbody td { padding:2.5% 3%; border-bottom:1px solid var(--cream-dark); color:var(--charcoal); line-height:1.4; vertical-align:top; }
    .s-table tbody tr:last-child td { border-bottom:none; }
    .s-table .td-highlight { font-weight:600; color:var(--green); }
    .slide-table .s-tbl-foot { padding:2% 6%; border-top:1px solid var(--cream-dark); font-size:.62em; color:var(--charcoal-30); }

    /* Actividad */
    .slide-activity { background:var(--amber-light); }
    .slide-activity .s-act-top { padding:4% 6%; display:flex; justify-content:space-between; align-items:center; }
    .slide-activity .s-act-badge { background:var(--amber); border-radius:20px; padding:1.5% 3.5%; font-size:.7em; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--white); display:inline-block; }
    .slide-activity .s-act-brand { font-size:.7em; font-weight:600; color:var(--charcoal-60); letter-spacing:.06em; }
    .slide-activity .s-act-title { font-family:var(--serif); font-size:1.7em; font-weight:400; color:var(--charcoal); padding:0 6% 3%; line-height:1.2; }
    .slide-activity .s-act-body { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:3%; padding:0 6% 4%; }
    .slide-activity .s-act-col { background:var(--white); border-radius:8px; padding:4% 5%; }
    .slide-activity .s-act-col-head { font-size:.75em; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--amber); margin-bottom:3%; }
    .slide-activity .s-act-line { height:2px; background:var(--cream-dark); border-radius:1px; margin-bottom:2.5%; }
    .slide-activity .s-act-hint { font-size:.72em; color:var(--charcoal-30); font-style:italic; margin-top:3%; }

    /* Cierre */
    .slide-close { background:var(--green); }
    .slide-close .s-close-inner { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6%; text-align:center; }
    .slide-close .s-close-line { width:40px; height:3px; background:var(--amber); margin-bottom:5%; }
    .slide-close .s-close-label { font-size:.78em; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--amber); margin-bottom:3%; }
    .slide-close .s-close-title { font-family:var(--serif); font-size:2.4em; font-weight:400; color:var(--white); line-height:1.15; margin-bottom:3%; max-width:70%; }
    .slide-close .s-close-sub { font-size:.9em; color:var(--green-light); margin-bottom:5%; }
    .slide-close .s-close-cta { background:var(--amber); color:var(--white); padding:2% 5%; border-radius:30px; font-size:.82em; font-weight:600; letter-spacing:.04em; display:inline-block; }
    .slide-close .s-close-footer { padding:3% 6%; border-top:1px solid rgba(255,255,255,.12); display:flex; justify-content:space-between; align-items:center; }
    .slide-close .s-close-brand { font-size:.75em; font-weight:600; color:rgba(255,255,255,.4); letter-spacing:.06em; }
    .slide-close .s-close-tagline { font-size:.72em; color:rgba(255,255,255,.3); font-style:italic; }
  </style>
</head>
<body>
  <div id="progress-bar"><div id="progress-fill"></div></div>
  <div id="app">
    <aside id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-name">Nutrición.Health</div>
        <div class="sidebar-deck-title">${esc(deckTitle)}</div>
      </div>
      <div id="slide-list">${sidebarItems}</div>
      <div class="sidebar-footer">
        <div class="sidebar-hint">
          <kbd>←</kbd> <kbd>→</kbd> &nbsp; Navegar<br>
          <kbd>P</kbd> &nbsp; Modo presentador<br>
          <kbd>Esc</kbd> &nbsp; Salir del modo
        </div>
      </div>
    </aside>
    <main id="stage">
      <div id="stage-controls">
        <button class="ctrl-btn" id="btn-presenter">⛶ Presentador</button>
        <button class="ctrl-btn" id="btn-sidebar">☰ Sidebar</button>
      </div>
      <button id="nav-prev">&#8592;</button>
      <div id="slide-viewport">
${slidesHTML}
      </div>
      <button id="nav-next">&#8594;</button>
    </main>
  </div>
  <script>
  typeof Chart !== 'undefined' && (Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif");
  const TOTAL = ${total};
  let current = 0;
  const pages   = document.querySelectorAll(".slide-page");
  const items   = document.querySelectorAll(".slide-nav-item");
  const fill    = document.getElementById("progress-fill");
  const btnPrev = document.getElementById("nav-prev");
  const btnNext = document.getElementById("nav-next");

  function goTo(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    pages[current].classList.remove("active");
    items[current].classList.remove("active");
    current = idx;
    pages[current].classList.add("active");
    items[current].classList.add("active");
    items[current].scrollIntoView({ block:"nearest", behavior:"smooth" });
    fill.style.width = (TOTAL === 1 ? 100 : current / (TOTAL - 1) * 100) + "%";
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === TOTAL - 1;
  }
  goTo(0);
  btnPrev.addEventListener("click", () => goTo(current - 1));
  btnNext.addEventListener("click", () => goTo(current + 1));

  document.addEventListener("keydown", e => {
    if (["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goTo(current + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    else if (e.key === "p" || e.key === "P") togglePresenter();
    else if (e.key === "Escape" && presenterOn) togglePresenter(false);
  });

  let presenterOn = false;
  const sidebar = document.getElementById("sidebar");
  function togglePresenter(force) {
    presenterOn = force !== undefined ? force : !presenterOn;
    document.body.classList.toggle("presenter-mode", presenterOn);
    sidebar.classList.toggle("hidden", presenterOn);
    document.getElementById("btn-presenter").textContent = presenterOn ? "✕ Salir" : "⛶ Presentador";
  }
  document.getElementById("btn-presenter").addEventListener("click", togglePresenter);

  let sidebarVisible = true;
  document.getElementById("btn-sidebar").addEventListener("click", () => {
    sidebarVisible = !sidebarVisible;
    sidebar.classList.toggle("hidden", !sidebarVisible);
  });

  let touchStartX = 0;
  const vp = document.getElementById("slide-viewport");
  vp.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive:true });
  vp.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive:true });
  ${chartScript}
  </script>
</body>
</html>`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const raw    = fs.readFileSync(inputFile, "utf8");
const blocks = parseTxt(raw);

if (!blocks.length) {
  console.error("No se encontraron bloques SLIDE en el archivo.");
  process.exit(1);
}

console.log(`Procesando ${blocks.length} slide(s)...`);
blocks.forEach(b => console.log(`  Slide ${b.SLIDE}: ${inferTipo(b)} — ${b.INSIGHT.slice(0,50)}`));

const html = buildHTML(blocks);
fs.writeFileSync(outputFile, html, "utf8");
console.log(`\n✓ Generado: ${outputFile}`);
