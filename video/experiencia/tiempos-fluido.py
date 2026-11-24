# Calcula cuándo cambia cada escena y cada subtítulo a partir de los tiempos por palabra de la narración.
#   python3 tiempos-fluido.py  →  tiempos-fluido.json  y  voz/narracion-fluida-montada.wav
import json, subprocess
W = json.load(open('voz/narracion-fluida-habladas.json'))      # solo palabras pronunciadas (sin etiquetas [..])
OFF, CUT, GAP = 0.4, 29.2, 1.5    # la voz empieza en 0.4 s; 1.5 s de silencio extra en la pausa antes del giro
tt = lambda t: round(t + OFF + (GAP if t > CUT else 0), 3)
txt = [w['text'] for w in W]
def find(seq, start=0):
    seq = seq.split()
    for i in range(start, len(txt) - len(seq) + 1):
        if all(txt[i + j].lower().strip('¿?,.…:') == seq[j].lower() for j in range(len(seq))): return i
    raise Exception(seq)
cues = [('d1', 'Te diagnostican'), ('s2', 'Esa noche'), ('s3', 'Entonces'), ('s4', 'Te mides'), ('s5', 'Y así pasan'), ('s6', 'hasta la próxima'), ('giro', 'Y si lo'),
        ('c1', 'Ahora'), ('c2', 'Esa misma semana'), ('c3', 'Aprendes'), ('c4', 'por fin'), ('c5', 'Con nosotros'), ('c6', 'Esta vez'), ('x7', 'Es la misma'), ('m8', 'Entiende'), ('m9', 'Quieres')]
idx = []; p = 0
for k, s in cues: i = find(s, p); idx.append(i); p = i + 1
T = {k: [tt(W[idx[n]]['start']), tt(W[(idx[n + 1] - 1) if n + 1 < len(idx) else len(W) - 1]['end'])] for n, (k, _) in enumerate(cues)}
caps_def = [('Te diagnostican diabetes. Tu médico te orienta,', 'Te diagnostican', 'orienta'),
 ('pero sales con preguntas, porque el tiempo de la consulta no alcanza para todo.', 'pero sales', 'todo'),
 ('Esa noche buscas en internet, y cada página dice algo distinto.', 'Esa noche', 'distinto'),
 ('Entonces, por si acaso, dejas de comer tus comidas favoritas.', 'Entonces', 'favoritas'),
 ('Te mides la glucosa, pero los números no te dicen mucho… solo te preocupan.', 'Te mides', 'preocupan'),
 ('Y así pasan los meses, por tu cuenta,', 'Y así pasan', 'cuenta'),
 ('hasta la próxima cita… donde el tiempo, otra vez, no alcanza.', 'hasta la próxima', 'alcanza'),
 ('¿Y si lo hacemos diferente?', 'Y si lo', 'diferente', 1),
 ('Ahora, tu médico te refiere a Nutrición.Health.', 'Ahora', 'Health'),
 ('Esa misma semana nos contactas, evaluamos tu caso y te damos un plan hecho para ti.', 'Esa misma semana', 'ti'),
 ('Aprendes a comer sin renunciar a tus comidas favoritas,', 'Aprendes', 'favoritas'),
 ('y por fin entiendes tus números… y sabes qué hacer.', 'y por fin', 'hacer'),
 ('Con nosotros, no lo enfrentas por tu cuenta:', 'Con nosotros', 'cuenta'),
 ('son ocho sesiones en grupo, con personas que viven lo mismo que tú.', 'son ocho', 'tú'),
 ('Esta vez, cuando llega tu próxima cita, tu médico ya conoce tu progreso.', 'Esta vez', 'progreso'),
 ('Llegan alineados.', 'Llegan', 'alineados'),
 ('Es la misma diabetes… pero una experiencia muy distinta.', 'Es la misma', 'distinta', 1),
 ('¿Quieres ser de los primeros? Regístrate y te avisamos.', 'Quieres', 'avisamos', 1)]
CAPS = []; p = 0
for c in caps_def:
    a = find(c[1], p); b = find(c[2], a); p = b + 1
    CAPS.append([tt(W[a]['start']), tt(W[b]['end']), c[0], c[3] if len(c) > 3 else 0])
for i in range(len(CAPS) - 1): CAPS[i][1] = round(min(CAPS[i][1] + 0.35, CAPS[i + 1][0] - 0.08), 3)
CAPS[-1][1] = round(CAPS[-1][1] + 0.4, 3)
X = {k: tt(W[find(s)]['start']) for k, s in [('registrate', 'Regístrate'), ('vive', 'Vive'), ('ocho', 'ocho sesiones'), ('evaluamos', 'evaluamos'),
     ('plan', 'plan hecho'), ('preguntas', 'preguntas'), ('dos', 'pero una'), ('alineados', 'Llegan alineados')]}
json.dump({'T': T, 'CAPS': CAPS, 'X': X, 'off': OFF, 'cut': CUT, 'gap': GAP}, open('tiempos-fluido.json', 'w'), ensure_ascii=False, indent=1)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voz/narracion-fluida.mp3', '-filter_complex',
  f'[0:a]atrim=0:{CUT},asetpts=PTS-STARTPTS[a];[0:a]atrim={CUT},asetpts=PTS-STARTPTS[b];anullsrc=r=44100:cl=mono,atrim=0:{GAP}[s];[a][s][b]concat=n=3:v=0:a=1[o]',
  '-map', '[o]', '-ar', '44100', 'voz/narracion-fluida-montada.wav'], check=True)
print(json.dumps(T)); print(X)
