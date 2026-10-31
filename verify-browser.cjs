const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const candidates = process.platform === 'win32' ? [
  path.join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge/Application/msedge.exe')
] : ['google-chrome', 'chromium'];
const browser = candidates.find(candidate => fs.existsSync(candidate));
if (!browser) throw new Error('Chrome ou Edge est nécessaire pour cette vérification facultative.');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'psstudio-browser-'));
try {
  const result = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, '--dump-dom', pathToFileURL(path.join(__dirname, 'index.html')).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /data-type="Button"/);
  assert.match(result.stdout, /data-type="PictureBox"/);
  assert.match(result.stdout, /#requires -Version 5\.1/);
  assert.match(result.stdout, /id="showPalette"/);
  const source = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  let probe = source;
  for (const asset of ['style.css', 'responsive.css', 'core.js', 'app.js']) {
    probe = probe.replace(`"${asset}"`, `"${pathToFileURL(path.join(__dirname, asset)).href}"`);
  }
  probe = probe.replace('</body>', `<script>
    (() => {
    const viewport = document.getElementById('viewport');
    const wrap = document.getElementById('scaleWrap');
    const before = wrap.getBoundingClientRect();
    const width = state.form.w;
    const historyCount = undoStack.length;
    const pointer = (target, type, options) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerType: 'mouse', pointerId: 17, ...options
    }));
    pointer(viewport, 'pointerdown', {button: 0, clientX: 100, clientY: 100});
    pointer(window, 'pointermove', {button: 0, buttons: 1, clientX: 180, clientY: 145});
    pointer(window, 'pointerup', {button: 0, clientX: 180, clientY: 145});
    const panned = wrap.getBoundingClientRect();
    const moved = Math.abs(panned.x - before.x - 80) < 1 && Math.abs(panned.y - before.y - 45) < 1;
    pointer(document.getElementById('canvas'), 'pointerdown', {button: 1, clientX: 200, clientY: 200});
    const centered = panOffset.x === 0 && panOffset.y === 0;
    const viewRect = viewport.getBoundingClientRect();
    const centeredRect = wrap.getBoundingClientRect();
    const aligned = Math.abs(centeredRect.x + centeredRect.width / 2 - viewRect.x - viewRect.width / 2) < 2
      && Math.abs(centeredRect.y + centeredRect.height / 2 - viewRect.y - viewRect.height / 2) < 2;
    pointer(document.getElementById('canvas'), 'pointerdown', {button: 0, clientX: 200, clientY: 200});
    pointer(window, 'pointermove', {button: 0, buttons: 1, clientX: 250, clientY: 250});
    pointer(window, 'pointerup', {button: 0, clientX: 250, clientY: 250});
    const noPanInsideForm = panOffset.x === 0 && panOffset.y === 0;
    const unchanged = state.form.w === width && undoStack.length === historyCount;
    const diagnostics = {moved, centered, aligned, noPanInsideForm, unchanged,
      xOffset: centeredRect.x + centeredRect.width / 2 - viewRect.x - viewRect.width / 2,
      yOffset: centeredRect.y + centeredRect.height / 2 - viewRect.y - viewRect.height / 2,
      viewWidth:viewRect.width,clientWidth:viewport.clientWidth,scrollWidth:viewport.scrollWidth,
      scrollLeft:viewport.scrollLeft,formLeft:centeredRect.x,formWidth:centeredRect.width};
    document.body.insertAdjacentHTML('beforeend', '<output id="gestureResult">' + (moved && centered && aligned && noPanInsideForm && unchanged ? 'PASS' : JSON.stringify(diagnostics)) + '</output>');
    })();
  </script></body>`);
  const probeFile = path.join(profile, 'gesture.html');
  fs.writeFileSync(probeFile, probe);
  const gesture = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${path.join(profile, 'gesture-profile')}`, '--dump-dom', pathToFileURL(probeFile).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (gesture.error) throw gesture.error;
  assert.equal(gesture.status, 0, gesture.stderr);
  const gestureResult = [...gesture.stdout.matchAll(/<output id="gestureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(gestureResult, 'PASS', gestureResult || gesture.stderr);
  const desktop = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--window-size=1500,1000', `--user-data-dir=${path.join(profile, 'desktop-profile')}`,
    '--dump-dom', pathToFileURL(probeFile).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (desktop.error) throw desktop.error;
  assert.equal(desktop.status, 0, desktop.stderr);
  const desktopResult = [...desktop.stdout.matchAll(/<output id="gestureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(desktopResult, 'PASS', desktopResult || desktop.stderr);
  console.log('PASS: page statique chargée dans le navigateur, éditeur et code généré visibles');
  console.log('PASS: déplacement sur le fond, recentrage molette, formulaire préservé sur mobile et bureau');
} finally {
  const root = path.resolve(os.tmpdir()) + path.sep;
  if (path.resolve(profile).startsWith(root)) fs.rmSync(profile, { recursive: true, force: true });
}
