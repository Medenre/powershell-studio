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
  console.log('PASS: page statique chargée dans le navigateur, éditeur et code généré visibles');
} finally {
  const root = path.resolve(os.tmpdir()) + path.sep;
  if (path.resolve(profile).startsWith(root)) fs.rmSync(profile, { recursive: true, force: true });
}
