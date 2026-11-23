# Pista de audio con ElevenLabs: voz (Nutrición.Health – Educadora) + música compuesta + efectos.
#   python3 mezcla_elevenlabs.py [numero_de_musica]     (por defecto la 1)
# Lee voces/montaje.json (dónde va cada frase) y voces/elevenlabs/momentos.json (dónde va cada efecto).
import json, os, subprocess, sys, re
D = os.path.dirname(os.path.abspath(__file__)); E = f'{D}/voces/elevenlabs'; TMP = f'{E}/tmp'; os.makedirs(TMP, exist_ok=True)
M = json.load(open(f'{D}/voces/montaje.json')); T = json.load(open(f'{E}/momentos.json')); TOTAL = M['total']
MUSICA = sys.argv[1] if len(sys.argv) > 1 else '1'
run = lambda *a: subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *a], check=True)

def lufs(path):
    log = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', log)[-1])

def place(items, out, target=None):
    """items: [(archivo, segundo, ganancia_dB, filtros_extra)] → una pista de TOTAL segundos."""
    ins, f = [], []
    for i, (path, at, gain, extra) in enumerate(items):
        ins += ['-i', path]; ms = int(max(0, at) * 1000)
        f.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={gain}dB{("," + extra) if extra else ""},adelay={ms}|{ms}[p{i}]')
    f.append(''.join(f'[p{i}]' for i in range(len(items))) + f'amix=inputs={len(items)}:normalize=0,apad=whole_dur={TOTAL}[o]')
    run(*ins, '-filter_complex', ';'.join(f), '-map', '[o]', '-t', str(TOTAL), out)

# 1) Voz: cada frase en su escena, normalizada
voz = [(f'{D}/{s["archivo"]}', s['en'], 0, '') for s in M['segmentos']]
place(voz, f'{TMP}/voz-cruda.wav')
run('-i', f'{TMP}/voz-cruda.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', f'{TMP}/voz.wav')

# 2) Efectos: cada uno llevado a un nivel objetivo (dB LUFS) por debajo de la voz
S = f'{E}/sfx'
def fx(name, at, target, extra=''):
    p = f'{S}/{name}.mp3'; return (p, at, round(target - lufs(p), 1), extra)
efectos = [
    fx('plato', T['plato'], -27),
    fx('zambullida', T['zambullida'] - .5, -25),
    fx('burbujas', T['glp1_sale'], -27),
    fx('flujo', T['vaso'] - .3, -31, f'afade=t=in:d=1,afade=t=out:st={T["fin_vaso"] - T["vaso"] - 1.2:.2f}:d=1.5,atrim=0:{T["fin_vaso"] - T["vaso"] + .3:.2f}'),
    fx('se-deshace', T['se_deshace'], -26),
    fx('resuelve', T['resuelve'], -23),
    fx('logo', T['logo'], -21),
]
# tic-tac del reloj: el clic suave una vez por segundo mientras se ve el reloj
t = T['reloj']
while t < T['fin_reloj'] - .3: efectos.append(fx('tic', t, -31)); t += 1.0
efectos += [fx('tic', x, -26) for x in T['calendario']]
efectos += [fx('pop', T[k], -24) for k in ('pancreas', 'higado', 'estomago', 'cerebro')]
efectos += [fx('escalon', x, -25) for x in T['escalon']]
efectos += [fx('pop', x, -24) for x in T['iconos']]
place(efectos, f'{TMP}/efectos.wav')

# 3) Música compuesta (80 s), más baja que la voz y con desvanecido final
mus = f'{E}/musica/musica-{MUSICA}.mp3'
run('-i', mus, '-t', str(TOTAL), '-af', f'loudnorm=I=-25:TP=-6,afade=t=in:d=0.8,afade=t=out:st={TOTAL - 3}:d=3', '-ar', '44100', '-ac', '2', f'{TMP}/musica.wav')

# 4) Mezcla: la música baja cuando habla la voz; efectos encima
run('-i', f'{TMP}/voz.wav', '-i', f'{TMP}/musica.wav', '-i', f'{TMP}/efectos.wav', '-filter_complex',
    '[0:a]asplit=2[v1][v2];[1:a][v1]sidechaincompress=threshold=0.035:ratio=5:attack=25:release=450[m];'
    '[v2][m][2:a]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.89[o]',
    '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', f'{D}/voces/mezcla.m4a')
print(f'mezcla lista ({TOTAL} s) con musica-{MUSICA}; efectos colocados: {len(efectos)}')
