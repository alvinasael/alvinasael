// Graba glp1-video.html cuadro a cuadro y lo codifica en MP4 con ffmpeg.
// Otra página: PAGE=metodologia/metodologia.html AUDIO=metodologia/mezcla.m4a node render.js salida.mp4
// Uso: node render.js [salida.mp4]   ·   node render.js --stills 3,10,24   (cuadros sueltos en ./stills)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const FPS = 30, args = process.argv.slice(2);
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  // servidor local: las imágenes y los clips no pueden leerse desde file:// sin bloquear el canvas
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };
  const srv = require('http').createServer((q, s) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(__dirname) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  await p.goto(`http://127.0.0.1:${srv.address().port}/${process.env.PAGE || 'glp1-video.html'}?t=0`);
  await p.waitForFunction('window.ready === true');
  await p.evaluate(() => Promise.all(['600 62px "Playfair Display"', 'italic 400 42px "Playfair Display"', '400 92px "Playfair Display"', '500 54px "DM Sans"', '600 36px "DM Sans"', '700 28px "DM Sans"', '400 28px "DM Sans"'].map(f => document.fonts.load(f))));
  console.log('fuentes:', await p.evaluate(() => [document.fonts.check('62px "Playfair Display"'), document.fonts.check('54px "DM Sans"')]));
  const DUR = await p.evaluate('window.DUR');
  if (args[0] === '--stills') {
    fs.mkdirSync(path.join(__dirname, 'stills'), { recursive: true });
    for (const t of args[1].split(',')) fs.writeFileSync(path.join(__dirname, 'stills', `t${t}.jpg`), Buffer.from(await p.evaluate(async t => { await prepare(t); return frameJPEG(t); }, +t), 'base64'));
  } else {
    const out = args[0] || path.join(__dirname, 'glp1-como-funciona.mp4');
    // Audio: voces/mezcla.m4a (python3 mezcla.py) o, si no existe, silencio
    const mix = path.join(__dirname, process.env.AUDIO || 'voces/mezcla.m4a'), hasMix = fs.existsSync(mix);
    const audioIn = hasMix ? ['-i', mix] : ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', ...audioIn, '-map', '0:v', '-map', '1:a', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-c:a', hasMix ? 'copy' : 'aac', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    console.log('audio:', hasMix ? 'voz + música' : 'silencio');
    const done = new Promise(r => ff.on('close', r));
    const N = Math.round(DUR * FPS);
    for (let i = 0; i < N; i++) { const buf = Buffer.from(await p.evaluate(async t => { await prepare(t); return frameJPEG(t); }, i / FPS), 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 60 === 0) console.log(`cuadro ${i}/${N}  ${new Date().toISOString().slice(11,19)}`); }
    ff.stdin.end(); await done; console.log('listo:', out);
  }
  console.log('errores:', errs.length ? errs : 'ninguno'); await b.close(); srv.close();
})();
