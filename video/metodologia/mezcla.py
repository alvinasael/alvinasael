# Audio del video de metodología: voz (9 frases), música 4 del video GLP-1 y efectos ya existentes.
#   python3 metodologia/mezcla.py   →   metodologia/mezcla.m4a
import os, subprocess, re, sys
V2 = len(sys.argv) > 1 and sys.argv[1] == 'v2'   # v2: añade la escena de consultas individuales (8 s después de 53.35 s)
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(D); E = f'{V}/voces/elevenlabs'; TMP = f'{D}/tmp'; os.makedirs(TMP, exist_ok=True)
TOTAL = 74.0 if V2 else 66.0
sh = lambda x: x + 8 if V2 and x >= 53.35 else x
VOZ = [(1, .5), (2, 6.4), (3, 13.35), (4, 22.0), (5, 28.6), (6, 38.8), (7, 49.3), (8, 53.6), (9, 57.9)]
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
def lufs(p): return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1])
def place(items, out):
    ins, f = [], []
    for i, (p, at, g) in enumerate(items):
        ins += ['-i', p]; ms = int(at * 1000); f.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB,adelay={ms}|{ms}[p{i}]')
    f.append(''.join(f'[p{i}]' for i in range(len(items))) + f'amix=inputs={len(items)}:normalize=0,apad=whole_dur={TOTAL}[o]')
    run(*ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-t', str(TOTAL), out)
place([(f'{D}/voz/m{n}.mp3', sh(at), 0) for n, at in VOZ] + ([(f'{D}/voz/m7b.mp3', 53.75, 0)] if V2 else []), f'{TMP}/voz-cruda.wav')
run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')
fx = lambda n, at, tgt: (f'{E}/sfx/{n}.mp3', at, round(tgt - lufs(f'{E}/sfx/{n}.mp3'), 1))
ef = [fx('tic', .9 + i * .55, -31) for i in range(5)]                                   # reloj
ef += [fx('pop', x, -26) for x in (3.7, 4.14, 4.58, 5.02)]                               # preguntas
ef += [fx('pop', x, -25) for x in (6.4, 8.6)]                                            # tarjetas
ef += [fx('tic', 10.7 + i * .16, -29) for i in range(7)]                                 # días
ef += [fx('pop', 13.4 + i * .2, -28) for i in range(8)]                                  # 8 sesiones
ef += [fx('pop', x, -25) for x in (21.9, 24.3, 25.1, 25.9)]                              # Giovanna
ef += [fx('pop', x, -25) for x in (28.6, 32.2, 34.6)]                                    # aprendes
ef += [fx('escalon', x, -25) for x in (38.85, 42.9, 44.5, 45.8)]                         # 4 pasos
ef += [fx('pop', 49.3, -25), fx('resuelve', 51.5, -24), fx('resuelve', 53.6, -26), fx('pop', 59.8, -24), fx('logo', 62.1, -21)]
ef = [(p, sh(at), g) for p, at, g in ef]
if V2: ef += [fx('pop', 53.65, -25)] + [fx('pop', 53.35 + x, -27) for x in (2.6, 3.3, 4.0)] + [fx('resuelve', 53.35 + 5.5, -24)]
place(ef, f'{TMP}/efectos.wav')
run('-i', f'{E}/musica/musica-4.mp3', '-t', str(TOTAL), '-af', f'loudnorm=I=-25:TP=-6,afade=t=in:d=0.8,afade=t=out:st={TOTAL - 3.5}:d=3.5', '-ar', '44100', '-ac', '2', f'{TMP}/musica.wav')
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica.wav', '-i', f'{TMP}/efectos.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=450[m];[v2][m][2:a]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', f'{D}/mezcla-v2.m4a' if V2 else f'{D}/mezcla.m4a')
print('mezcla lista', TOTAL, 's; efectos:', len(ef))
