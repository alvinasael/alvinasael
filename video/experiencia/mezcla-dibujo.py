# Audio del video en dibujo animado.  python3 experiencia/mezcla-dibujo.py  →  experiencia/mezcla-dibujo.m4a
# Acto 1: música apagada (filtro pasa-bajos). Giro: efecto de rebobinado. Acto 2: música abierta.
import os, subprocess, re
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(D); E = f'{V}/voces/elevenlabs'; TMP = f'{D}/tmp'; os.makedirs(TMP, exist_ok=True)
TOTAL = 86.0
VOZ = [('d1', .4), ('s2', 10.6), ('s3', 16.9), ('s4', 22.4), ('s5', 27.2), ('s6', 32.3), ('giro', 37.3), ('c1', 39.8), ('c2', 43.9), ('c3', 48.1), ('c4', 52.8), ('c5', 56.3), ('c6', 63.0), ('x7', 68.8), ('m8', 74.4), ('m9', 78.6)]
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
def lufs(p): return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1])
def place(items, out):
    ins, f = [], []
    for i, (p, at, g, ex) in enumerate(items):
        ins += ['-i', p]; ms = int(at * 1000); f.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB{"," + ex if ex else ""},adelay={ms}|{ms}[p{i}]')
    f.append(''.join(f'[p{i}]' for i in range(len(items))) + f'amix=inputs={len(items)}:normalize=0,apad=whole_dur={TOTAL}[o]')
    run(*ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-t', str(TOTAL), out)
place([(f'{D}/voz/{n}.mp3', at, 0, '') for n, at in VOZ], f'{TMP}/voz-cruda.wav')
run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')
fx = lambda n, at, tgt, ex='': (f'{E}/sfx/{n}.mp3', at, round(tgt - lufs(f'{E}/sfx/{n}.mp3'), 1), ex)
ef = [fx('tic', a + .2, -30) for a in (0, 10.3, 16.6, 22.1, 26.9, 32.0)]
ef += [fx('pop', 5.5 + i * .35, -30) for i in range(5)] + [fx('pop', x, -28) for x in (12.4, 13.4, 14.5, 23.0)]
ef += [fx('zambullida', 35.95, -24, 'areverse,atrim=0:1.6')]                                    # rebobinado
ef += [fx('resuelve', a + .25, -27) for a in (37.4, 43.6, 47.8, 52.5, 56.0, 62.7)]
ef += [fx('pop', x, -26) for x in (41.4, 45.0, 45.9, 53.3, 66.4)] + [fx('pop', 58.2 + i * .14, -30) for i in range(8)]
ef += [fx('se-deshace', 69.2, -28), fx('resuelve', 74.5, -26), fx('pop', 80.8, -24), fx('logo', 83.1, -21)]
place(ef, f'{TMP}/efectos.wav')
M = f'{E}/musica/musica-4.mp3'
run('-i', M, '-i', M, '-filter_complex', '[0:a][1:a]acrossfade=d=3[o]', '-map', '[o]', '-ar', '44100', '-ac', '2', f'{TMP}/musica-larga.wav')
run('-i', f'{TMP}/musica-larga.wav', '-filter_complex',
    f'[0:a]atrim=0:37.6,lowpass=f=900,volume=-4dB,asetpts=PTS-STARTPTS[a];[0:a]atrim=37.0:{TOTAL + 1},asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=0.6,'
    f'loudnorm=I=-25:TP=-6,afade=t=in:d=0.8,afade=t=out:st={TOTAL - 3.5}:d=3.5,atrim=0:{TOTAL}[o]', '-map', '[o]', '-ar', '44100', '-ac', '2', f'{TMP}/musica.wav')
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica.wav', '-i', f'{TMP}/efectos.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=450[m];[v2][m][2:a]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', f'{D}/mezcla-dibujo.m4a')
print('mezcla lista', TOTAL, 's; efectos:', len(ef))
