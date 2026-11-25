# Tiempos de escenas y subtítulos a partir de la transcripción por palabra de la narración (una sola toma).
#   python3 tiempos.py  →  tiempos.json  y lo inserta en impacto.html (línea "const D = ...")
import json, re
W = json.load(open('voz/habladas.json'))      # solo palabras pronunciadas (sin etiquetas [..])
OFF = 0.4                                      # la voz empieza en 0.4 s
tt = lambda t: round(t + OFF, 3)
norm = lambda s: s.lower().strip('¿?,.…:')
txt = [norm(w['text']) for w in W]
def find(seq, start=0):
    seq = [norm(s) for s in seq.split()]
    for i in range(start, len(txt) - len(seq) + 1):
        if txt[i:i + len(seq)] == seq: return i
    raise Exception(seq)
cues = [('g1', 'Tu médico'), ('g2', 'La A uno'), ('i1', 'pero estudios'), ('q', 'Y cómo'), ('e1', 'Se ha'), ('e2', 'Ahora'), ('e3', 'Según'), ('c1', 'Esto es'), ('f', 'Porque')]
idx = []; p = 0
for k, s in cues: i = find(s, p); idx.append(i); p = i + 1
T = {k: [tt(W[idx[n]]['start']), tt(W[(idx[n + 1] - 1) if n + 1 < len(idx) else len(W) - 1]['end'])] for n, (k, _) in enumerate(cues)}
def at(seq, after=None): return tt(W[find(seq, find(after) if after else 0)]['start'])
X = {'punto': at('reducirla'), 'analisis': at('análisis de sangre'), 'promedio': at('muestra tu promedio'), 'meses': at('últimos tres meses'), 'dia': at('no solo lo'), 'poco': at('Parece poco'), 'veintiun': at('veintiún'), 'catorce': at('catorce'),
     'treinta7': at('treinta y siete'), 'treinta4': at('treinta y cuatro'), 'uno1': at('hasta un uno'), 'medicamento': at('tanto como'),
     'mas': at('más que recibir'), 'camino': at('Es un camino'), 'entiendes': at('entiendes'), 'decisiones': at('aprendes a tomar'), 'habitos': at('las conviertes'),
     'uno2': at('uno punto uno'), 'tres': at('tres décimas'), 'ocho': at('programa completo de ocho'), 'vivo': at('en vivo'), 'casa': at('desde tu casa'),
     'plan': at('con un plan'), 'seguimiento': at('y siempre en complemento'), 'cambiarlo': at('puede cambiarlo')}
caps_def = [('Tu médico te habla de tu A1c… pero ¿sabes cuánto puede cambiar tu vida reducirla en un 1%?', 'Tu médico', 'ciento'),
 ('La A1c es un análisis de sangre que muestra tu promedio de azúcar de los últimos tres meses,', 'La A uno', 'meses'),
 ('no solo lo de un día. Parece poco…', 'no solo', 'poco'),
 ('pero estudios con miles de personas encontraron que, por cada 1% menos, hay:', 'pero estudios', 'hay'),
 ('21% menos muertes relacionadas con la diabetes,', 'veintiún', 'diabetes'),
 ('14% menos infartos,', 'catorce', 'infartos'),
 ('37% menos daño en tus ojos, tus riñones y tus nervios,', 'treinta y siete', 'nervios'),
 ('y 34% de reducción en las hospitalizaciones.', 'y treinta y cuatro', 'hospitalizaciones'),
 ('Se ha encontrado que una educación estructurada en diabetes baja la A1c hasta un 1%:', 'Se ha', 'ciento'),
 ('tanto como un medicamento.', 'tanto como', 'medicamento'),
 ('Ahora, ¿qué es una educación estructurada?', 'Ahora', 'estructurada'),
 ('Hablar de una educación estructurada es más que recibir información.', 'Hablar', 'información'),
 ('Es un camino con un orden: primero entiendes tu diabetes,', 'Es un camino', 'diabetes'),
 ('luego aprendes a tomar decisiones en tu día a día,', 'luego', 'día'),
 ('y después las conviertes en hábitos que se quedan contigo.', 'y después', 'contigo'),
 ('Según las investigaciones en este tema, aquellos quienes participaron en un programa de este tipo', 'Según', 'tipo'),
 ('bajaron 1.1%… frente a solo tres décimas con el cuidado usual.', 'bajaron', 'usual'),
 ('Esto es lo que te ofrecemos en Nutrición.Health:', 'Esto es', 'Health'),
 ('un programa completo de ocho semanas, en vivo, desde tu casa,', 'un programa completo', 'casa'),
 ('con un plan nutricional hecho para ti…', 'con un plan', 'ti'),
 ('y siempre en complemento con el seguimiento de tu médico.', 'y siempre', 'médico'),
 ]
CAPS = []; p = 0
caps_def = [c for c in caps_def]   # la pregunta y el cierre ya están en pantalla (sin subtítulo)
for c in caps_def:
    a = find(c[1], p); b = find(c[2], a); p = b + 1
    CAPS.append([tt(W[a]['start']), tt(W[b]['end']), c[0], c[3] if len(c) > 3 else 0])
for i in range(len(CAPS) - 1): CAPS[i][1] = round(min(CAPS[i][1] + 0.35, CAPS[i + 1][0] - 0.08), 3)
END = round(T['f'][1] + 2.6, 2)      # cierre con logo después del resumen
D = {'T': T, 'X': X, 'CAPS': CAPS, 'off': OFF, 'end': END, 'total': round(END + 3.6, 2)}
json.dump(D, open('tiempos.json', 'w'), ensure_ascii=False, indent=1)
h = open('impacto.html').read()
h = re.sub(r'const D = .*?;   // tiempos.json', 'const D = ' + json.dumps(D, ensure_ascii=False) + ';   // tiempos.json', h, count=1)
open('impacto.html', 'w').write(h)
print('total', D['total'], T)
