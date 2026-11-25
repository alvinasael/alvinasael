# Narración v5 = voz v4 hasta "…de tu médico." + cierre de la voz v3 ("Porque un uno por ciento… puede cambiarlo todo.").
# Ambos cortes caen en silencio (pausa natural antes de "Porque"), así que no hay salto audible.
#   python3 voz/empalme-cierre.py  →  voz/narracion.mp3 y voz/habladas.json
import json, subprocess, os
D = os.path.dirname(os.path.abspath(__file__))
A_FIN, B_INI = 93.30, 92.85          # corte en v4 (silencio tras "médico") y en v3 (silencio antes de "Porque")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{D}/narracion-v4.mp3', '-i', f'{D}/narracion-v3.mp3', '-filter_complex',
  f'[0:a]atrim=0:{A_FIN},asetpts=PTS-STARTPTS[a];[1:a]atrim={B_INI},asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=0.02[o]',
  '-map', '[o]', '-c:a', 'libmp3lame', '-b:a', '128k', f'{D}/narracion.mp3'], check=True)
a, b = json.load(open(f'{D}/habladas-v4.json')), json.load(open(f'{D}/habladas-v3.json'))
ia = [k for k, x in enumerate(a) if x['text'] == 'Porque'][0]; ib = [k for k, x in enumerate(b) if x['text'] == 'Porque'][0]
sh = A_FIN - 0.02 - B_INI
out = a[:ia] + [{'text': x['text'], 'start': round(x['start'] + sh, 3), 'end': round(x['end'] + sh, 3)} for x in b[ib:]]
json.dump(out, open(f'{D}/habladas.json', 'w'), ensure_ascii=False)
print('palabras', len(out), 'Porque en', out[ia]['start'], 'fin', out[-1]['end'])
