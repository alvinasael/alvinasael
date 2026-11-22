# Arma la pista de audio del video en tres pasos simples:
#   1) voz: cada frase en el momento de su escena (voces/montaje.json)
#   2) música: el clip de 8 s en bucle con fundido cruzado
#   3) mezcla: la música baja cuando habla la voz
import json, subprocess, os
D = os.path.dirname(os.path.abspath(__file__)); V = f'{D}/voces'; TMP = f'{V}/tmp'; os.makedirs(TMP, exist_ok=True)
M = json.load(open(f'{V}/montaje.json')); TOTAL = M['total']; segs = M['segmentos']
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)

# 1) voz
parts = []
for i, s in enumerate(segs):
    a, b = s['voz']; out = f'{TMP}/frase{i:02d}.wav'
    run('-ss', f'{max(0, a - 0.06):.3f}', '-to', f'{b + 0.15:.3f}', '-i', f'{V}/narracion-nova.mp3',
        '-af', f'afade=t=out:st={b - a + 0.1:.3f}:d=0.1', '-ar', '44100', '-ac', '2', out)
    parts.append((out, s['en'] - 0.06))
inputs = sum([['-i', p] for p, _ in parts], [])
f = ';'.join(f'[{i}:a]adelay={int(t * 1000)}|{int(t * 1000)}[d{i}]' for i, (_, t) in enumerate(parts))
f += ';' + ''.join(f'[d{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={TOTAL}[v]'
run(*inputs, '-filter_complex', f, '-map', '[v]', '-t', str(TOTAL), f'{TMP}/voz-cruda.wav')
run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')

# 2) música en bucle
clip = f'{TMP}/clip.wav'; run('-i', f'{V}/musica.wav', '-ar', '44100', '-ac', '2', clip)
cur = clip; k = 0
while float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', cur])) < TOTAL + 1:
    k += 1; nxt = f'{TMP}/bucle{k}.wav'
    run('-i', cur, '-i', clip, '-filter_complex', 'acrossfade=d=1.5:c1=qsin:c2=qsin', nxt); cur = nxt
run('-i', cur, '-t', str(TOTAL), '-af', f'loudnorm=I=-30:TP=-8,afade=t=in:d=1.5,afade=t=out:st={TOTAL - 2.5}:d=2.5', '-ar', '44100', f'{TMP}/musica-larga.wav')

# 3) mezcla con ducking
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica-larga.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.04:ratio=6:attack=30:release=400[m];[v2][m]amix=inputs=2:normalize=0,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '160k', f'{V}/mezcla.m4a')
print('mezcla lista:', TOTAL, 's')
