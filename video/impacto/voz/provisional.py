# Tiempos PROVISIONALES (sin voz): el inicio nuevo se estima al ritmo de la voz v1; el resto usa los tiempos reales de v1.
#   python3 voz/provisional.py  →  voz/habladas.json   (se reemplaza cuando grabemos la voz nueva y la transcribamos)
import json, os
D = os.path.dirname(os.path.abspath(__file__))
V1 = json.load(open(f'{D}/habladas-v1.json'))
cut = next(i for i, w in enumerate(V1) if w['text'] == 'pero' and V1[i + 1]['text'] == 'estudios')
old = V1[:cut]; rate = (old[-1]['end'] - old[0]['start']) / len(old)          # segundos por palabra en v1
intro = ('Tu médico te habla de tu A uno C… pero ¿sabes cuánto puede cambiar tu vida reducirla en un uno por ciento? '
         'La A uno C es un análisis de sangre que muestra tu promedio de azúcar de los últimos tres meses, no solo lo de un día. Parece poco…').split()
out, t = [], old[0]['start']
for w in intro:
    d = rate * .8; out.append({'text': w, 'start': round(t, 3), 'end': round(t + d, 3)}); t += rate
    if w[-1] in '?.…,': t += .35 if w[-1] == ',' else .55
shift = t + .2 - V1[cut]['start']
out += [{'text': w['text'], 'start': round(w['start'] + shift, 3), 'end': round(w['end'] + shift, 3)} for w in V1[cut:]]
json.dump(out, open(f'{D}/habladas.json', 'w'), ensure_ascii=False)
print('palabras', len(out), 'ritmo', round(rate, 3), 'desplazamiento', round(shift, 2), 'fin', out[-1]['end'])
