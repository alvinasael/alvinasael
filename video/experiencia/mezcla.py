# Audio del video "Dos experiencias": voz (x1..x7, m8, m9), música 4 y efectos existentes.  python3 experiencia/mezcla.py
import os, subprocess, re
D = os.path.dirname(os.path.abspath(__file__)); V = os.path.dirname(D); E = f'{V}/voces/elevenlabs'; TMP = f'{D}/tmp'; os.makedirs(TMP, exist_ok=True)
TOTAL = 77.0
VOZ = [('x1', .5), ('x2', 12.0), ('x3', 22.2), ('x4', 31.6), ('x5', 40.3), ('x6', 50.8), ('x7', 58.9), ('m8', 64.6), ('m9', 68.9)]
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)
def lufs(p): return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1])
def place(items, out):
    ins, f = [], []
    for i, (p, at, g) in enumerate(items):
        ins += ['-i', p]; ms = int(at * 1000); f.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB,adelay={ms}|{ms}[p{i}]')
    f.append(''.join(f'[p{i}]' for i in range(len(items))) + f'amix=inputs={len(items)}:normalize=0,apad=whole_dur={TOTAL}[o]')
    run(*ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-t', str(TOTAL), out)
place([(f'{D}/voz/{n}.mp3', at, 0) for n, at in VOZ], f'{TMP}/voz-cruda.wav')
run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')
fx = lambda n, at, tgt: (f'{E}/sfx/{n}.mp3', at, round(tgt - lufs(f'{E}/sfx/{n}.mp3'), 1))
ef = []
for a, s, cn in [(.5, .6, 8.63), (12.0, 12.2, 18.03), (22.2, 22.3, 27.43), (31.6, 31.8, 36.15), (40.3, 40.5, 45.1), (50.8, 50.9, 54.32)]:
    ef += [fx('tic', s, -30), fx('resuelve', cn, -26)]
ef += [fx('pop', 4.6 + i * .25, -29) for i in range(5)] + [fx('pop', 28.6, -26), fx('pop', 55.8, -25)]
ef += [fx('resuelve', 61.3, -25), fx('resuelve', 64.7, -27), fx('pop', 70.8, -24), fx('logo', 73.1, -21)]
place(ef, f'{TMP}/efectos.wav')
run('-i', f'{E}/musica/musica-4.mp3', '-t', str(TOTAL), '-af', f'loudnorm=I=-25:TP=-6,afade=t=in:d=0.8,afade=t=out:st={TOTAL - 3.5}:d=3.5', '-ar', '44100', '-ac', '2', f'{TMP}/musica.wav')
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica.wav', '-i', f'{TMP}/efectos.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=450[m];[v2][m][2:a]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', f'{D}/mezcla.m4a')
print('mezcla lista', TOTAL, 's; efectos:', len(ef))
