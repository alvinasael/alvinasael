# Audio del video "El poder de un 1%".  python3 impacto/mezcla.py  →  impacto/mezcla.m4a
# Narración = UNA grabación continua (voz/narracion.mp3) colocada en tiempos.json['off']; música suave con ducking; efectos en cada dato.
import os, subprocess, re, json
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(D); E = f'{V}/voces/elevenlabs'; TMP = f'{D}/tmp'; os.makedirs(TMP, exist_ok=True)
J = json.load(open(f'{D}/tiempos.json')); T = J['T']; X = J['X']; S = lambda k: T[k][0]; EN = lambda k: T[k][1]
TOTAL = J['total']
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
def lufs(p): return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1])
def place(items, out):
    ins, f = [], []
    for i, (p, at, g, ex) in enumerate(items):
        ins += ['-i', p]; ms = int(max(0, at) * 1000); f.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB{"," + ex if ex else ""},adelay={ms}|{ms}[p{i}]')
    f.append(''.join(f'[p{i}]' for i in range(len(items))) + f'amix=inputs={len(items)}:normalize=0,apad=whole_dur={TOTAL}[o]')
    run(*ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-t', str(TOTAL), out)
SIN_VOZ = not os.path.exists(f'{D}/voz/narracion.mp3')      # versión provisional: solo música, efectos y subtítulos
if SIN_VOZ: run('-f', 'lavfi', '-i', f'anullsrc=r=44100:cl=stereo', '-t', str(TOTAL), f'{TMP}/voz.wav')
else:
    place([(f'{D}/voz/narracion.mp3', J['off'], 0, '')], f'{TMP}/voz-cruda.wav')
    run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')
fx = lambda n, at, tgt, ex='': (f'{E}/sfx/{n}.mp3', at, round(tgt - lufs(f'{E}/sfx/{n}.mp3'), 1), ex)
ef = [fx('tic', 0.2, -30), fx('pop', X['poco'] + 1.4, -27)]
ef += [fx('escalon', X[k] - .15, -27) for k in ('veintiun', 'catorce', 'treinta7', 'treinta4')]
ef += [fx('se-deshace', S('q') - .3, -29), fx('resuelve', S('e1') - .1, -27), fx('pop', X['uno1'] - .2, -26), fx('pop', X['medicamento'] - .4, -28)]
ef += [fx('tic', X[k] - .2, -30) for k in ('entiendes', 'decisiones', 'habitos')]
ef += [fx('flujo', X['uno2'] - .3, -31), fx('flujo', X['tres'] - .3, -33), fx('resuelve', S('c1'), -27)]
ef += [fx('pop', X[k] - .25, -29) for k in ('ocho', 'vivo', 'casa', 'plan', 'seguimiento')]
ef += [fx('resuelve', S('f') - .2, -25)] + [fx('pop', S('f') + .3 + i * .25, -30) for i in range(4)] + [fx('logo', J['end'] + .3, -21)]
place(ef, f'{TMP}/efectos.wav')
M = f'{E}/musica/musica-4.mp3'
run('-i', M, '-i', M, '-filter_complex', '[0:a][1:a]acrossfade=d=3[o]', '-map', '[o]', '-ar', '44100', '-ac', '2', f'{TMP}/musica-larga.wav')
run('-i', f'{TMP}/musica-larga.wav', '-af', f'loudnorm=I=-25:TP=-6,afade=t=in:d=0.8,afade=t=out:st={TOTAL - 3.5}:d=3.5,atrim=0:{TOTAL}', '-ar', '44100', '-ac', '2', f'{TMP}/musica.wav')
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica.wav', '-i', f'{TMP}/efectos.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=450[m];[v2][m][2:a]amix=inputs=3:normalize=0,loudnorm=I=' + ('-20' if SIN_VOZ else '-16') + ':TP=-1.5:LRA=11,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', f'{D}/' + ('mezcla-sin-voz.m4a' if SIN_VOZ else 'mezcla.m4a'))
print('mezcla lista', TOTAL, 's; efectos:', len(ef))
