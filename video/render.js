// Graba glp1-video.html cuadro a cuadro y lo codifica en MP4 con ffmpeg.
// Uso: node render.js [salida.mp4]   ·   node render.js --stills 3,10,24   (cuadros sueltos en ./stills)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const FPS = 30, args = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'glp1-video.html') + '?t=0');
  await p.waitForFunction('window.ready === true');
  await p.evaluate(() => Promise.all(['600 62px "Playfair Display"', 'italic 400 42px "Playfair Display"', '400 92px "Playfair Display"', '500 54px "DM Sans"', '600 36px "DM Sans"', '700 28px "DM Sans"', '400 28px "DM Sans"'].map(f => document.fonts.load(f))));
  console.log('fuentes:', await p.evaluate(() => [document.fonts.check('62px "Playfair Display"'), document.fonts.check('54px "DM Sans"')]));
  const DUR = await p.evaluate('DUR');
  if (args[0] === '--stills') {
    fs.mkdirSync(path.join(__dirname, 'stills'), { recursive: true });
    for (const t of args[1].split(',')) fs.writeFileSync(path.join(__dirname, 'stills', `t${t}.jpg`), Buffer.from(await p.evaluate(t => frameJPEG(t), +t), 'base64'));
  } else {
    const out = args[0] || path.join(__dirname, 'glp1-como-funciona.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(DUR * FPS);
    for (let i = 0; i < N; i++) { const buf = Buffer.from(await p.evaluate(t => frameJPEG(t), i / FPS), 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 300 === 0) console.log(`cuadro ${i}/${N}`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('listo:', out);
  }
  console.log('errores:', errs.length ? errs : 'ninguno'); await b.close();
})();
