# Audio del video en dibujo animado.  python3 experiencia/mezcla-dibujo.py  →  experiencia/mezcla-dibujo.m4a
# La narración es UNA sola grabación (voz/narracion-completa.mp3) cortada por frases en voz/u-*.mp3;
# tiempos-dibujo.json dice dónde va cada frase. Acto 1: música apagada (pasa-bajos). Acto 2: música abierta.
import os, subprocess, re, json
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(D); E = f'{V}/voces/elevenlabs'; TMP = f'{D}/tmp'; os.makedirs(TMP, exist_ok=True)
T = json.load(open(f'{D}/tiempos-dibujo.json')); S = lambda k: T[k][0]; EN = lambda k: T[k][1]
TOTAL = round(EN('m9') + 4.0, 1)
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
def lufs(p): return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1])
def place(items, out):
    ins, f = [], []
    for i, (p, at, g, ex) in enumerate(items):
        ins += ['-i', p]; ms = int(max(0, at) * 1000); f.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB{"," + ex if ex else ""},adelay={ms}|{ms}[p{i}]')
    f.append(''.join(f'[p{i}]' for i in range(len(items))) + f'amix=inputs={len(items)}:normalize=0,apad=whole_dur={TOTAL}[o]')
    run(*ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-t', str(TOTAL), out)
place([(f'{D}/voz/u-{k}.mp3', S(k) - .12, 0, '') for k in T], f'{TMP}/voz-cruda.wav')
run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')
fx = lambda n, at, tgt, ex='': (f'{E}/sfx/{n}.mp3', at, round(tgt - lufs(f'{E}/sfx/{n}.mp3'), 1), ex)
A1, A2 = ['d1', 's2', 's3', 's4', 's5', 's6'], ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']
ef = [fx('tic', 0.2, -30)] + [fx('tic', S(k) - .4, -30) for k in A1[1:]]
ef += [fx('pop', EN('d1') - 2.6 + i * .35, -30) for i in range(5)] + [fx('pop', S('s2') + d, -28) for d in (1.8, 2.8, 3.9)] + [fx('pop', S('s4') + .6, -28)]
ef += [fx('tic', S('s6') + .2 + i * .5, -31) for i in range(6)]                                  # reloj de la consulta
ef += [fx('zambullida', EN('s6') + .55, -24, 'areverse,atrim=0:1.6')]                             # rebobinado
ef += [fx('resuelve', S('giro') - .1, -27)] + [fx('resuelve', S(k) - .35, -28) for k in A2[1:]]
ef += [fx('pop', x, -26) for x in (S('c1') + 1.2, S('c2') + 2.2, S('c2') + 3.1, S('c4') + .4, EN('c6') - 1.3)] + [fx('pop', S('c5') + 2.4 + i * .14, -30) for i in range(8)]
ef += [fx('se-deshace', S('x7') - .4, -28), fx('resuelve', S('m8'), -26), fx('pop', S('m9') + 1.9, -24), fx('logo', EN('m9') + .5, -21)]
place(ef, f'{TMP}/efectos.wav')
M = f'{E}/musica/musica-4.mp3'; G = S('giro') - .3
run('-i', M, '-i', M, '-filter_complex', '[0:a][1:a]acrossfade=d=3[o]', '-map', '[o]', '-ar', '44100', '-ac', '2', f'{TMP}/musica-larga.wav')
run('-i', f'{TMP}/musica-larga.wav', '-filter_complex',
    f'[0:a]atrim=0:{G + .6},lowpass=f=900,volume=-4dB,asetpts=PTS-STARTPTS[a];[0:a]atrim={G}:{TOTAL + 1},asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=0.6,'
    f'loudnorm=I=-25:TP=-6,afade=t=in:d=0.8,afade=t=out:st={TOTAL - 3.5}:d=3.5,atrim=0:{TOTAL}[o]', '-map', '[o]', '-ar', '44100', '-ac', '2', f'{TMP}/musica.wav')
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica.wav', '-i', f'{TMP}/efectos.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=450[m];[v2][m][2:a]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', f'{D}/mezcla-dibujo.m4a')
print('mezcla lista', TOTAL, 's; efectos:', len(ef))
