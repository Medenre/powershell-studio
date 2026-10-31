const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const core = require('./core.js');

const versions = ['2.0', '3.0', '4.0', '5.1', '7.0'];
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==';

function control(type, index) {
  const [,, width, height, text] = core.types[type];
  return {
    id: `ctrl_${type}${index}`, name: `ctrl_${type}${index}`, type, text,
    x: 0, y: 0, w: width, h: height, font: 10, fontFamily: 'Segoe UI',
    bold: false, italic: false, underline: false, transparent: false,
    bg: '#f6f7f9', fg: '#273142', items: 'Un\nDeux', checked: false,
    enabled: true, value: 40, action: '', ...core.featureDefaults(type)
  };
}

const project = core.fresh();
project.controls = Object.keys(core.types).map((type, i) => control(type, i + 1));
project.controls[0].text = "L'utilisateur";
project.controls[0].action = '$MainForm.Text = "Action"';
project.controls[0].image = png;
project.controls[0].imageSize = 24;
project.controls[0].tooltip = 'Une infobulle';
project.controls[1].bold = true;
project.controls[1].italic = true;
project.controls[1].underline = true;
project.controls[1].transparent = true;
project.controls.at(-1).image = png;

assert.equal(Object.keys(core.types).length, 13);
assert.deepEqual(core.selectionBounds([{x:20,y:30,w:100,h:40},{x:160,y:80,w:50,h:60}]),{x:20,y:30,w:190,h:110});
const resized = core.resizedRect({x:40,y:40,w:100,h:80},'nw',24,16,{minW:20,minH:16,left:0,top:0,right:600,bottom:400},8);
assert.deepEqual(resized,{x:60,y:56,w:80,h:64});
const before = JSON.stringify(project);
for (const version of versions) {
  project.targetVersion = version;
  const script = core.generate(project);
  assert.match(script, new RegExp(`#requires -Version ${version.replace('.', '\\.')}`));
  assert.match(script, /L''utilisateur/);
  assert.match(script, /FontStyle\]::Bold -bor/);
  assert.match(script, /Color\]::Transparent/);
  assert.match(script, /FromBase64String/);
  assert.match(script, /StudioStream\.Dispose\(\)/);
  assert.match(script, /UseSystemPasswordChar/);
  assert.match(script, /TabIndex/);
  assert.match(script, /BringToFront\(\)/);
  assert.ok(script.indexOf('SetThreadDpiAwarenessContext') < script.indexOf('Add-Type -AssemblyName System.Windows.Forms'));
  assert.match(script, /GetAwarenessFromDpiAwarenessContext/);
  assert.match(script, /SetProcessDPIAware/);
  assert.match(script, /if \(\$StudioPreviousDpiContext -ne \[IntPtr\]::Zero\)/);
  assert.equal(script.includes('::new('), Number(version) >= 5);
  assert.equal(script.includes('New-Object -TypeName'), Number(version) < 5);
  for (const type of Object.keys(core.types)) assert.ok(script.includes(`# ${type} —`), type);
}
project.targetVersion = '5.1';
assert.equal(JSON.stringify(project), before);

const legacy = JSON.parse(JSON.stringify(project));
for (const c of [legacy.form, ...legacy.controls]) {
  for (const key of ['fontFamily', 'bold', 'italic', 'underline', 'transparent', 'image', 'tabIndex']) delete c[key];
}
legacy.controls[0].x = 590;
legacy.controls[0].w = 120;
const migrated = core.validate(legacy);
assert.equal(migrated.controls[0].x, 480);
assert.equal(migrated.controls[0].fontFamily, 'Segoe UI');
assert.equal(migrated.controls[0].bold, false);

function invalid(change) {
  const copy = JSON.parse(JSON.stringify(project));
  change(copy);
  assert.throws(() => core.validate(copy));
}
invalid(p => p.controls[0].type = '__proto__');
invalid(p => p.controls[1].name = p.controls[0].name.toUpperCase());
invalid(p => p.controls[0].image = 'javascript:alert(1)');
invalid(p => p.controls[0].action = 'x'.repeat(100001));
invalid(p => p.form.text = 'x'.repeat(1001));

console.log('PASS: 13 contrôles, 5 cibles, import ancien, limites, images et génération');

if (process.argv.includes('--native')) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'psstudio-verify-'));
  try {
    for (const version of versions) {
      project.targetVersion = version;
      const code = core.generate(project);
      const marker = '\r\ntry {\r\n    [void]$MainForm.ShowDialog()';
      assert.ok(code.includes(marker));
      const smoke = code.replace(marker, '\r\nif ([Environment]::OSVersion.Version.Build -ge 14393) {\r\n    $StudioSmokeDpi = [PowerShellStudio.DpiNative]::GetAwarenessFromDpiAwarenessContext([PowerShellStudio.DpiNative]::GetThreadDpiAwarenessContext())\r\n    if ($StudioSmokeDpi -eq 0) { throw "Formulaire encore flou : contexte DPI non déclaré" }\r\n}\r\n$StudioSmokeTimer = New-Object -TypeName System.Windows.Forms.Timer\r\n$StudioSmokeTimer.Interval = 150\r\n$StudioSmokeTimer.Add_Tick({ $StudioSmokeTimer.Stop(); $MainForm.Close() })\r\n$StudioSmokeTimer.Start()' + marker);
      fs.writeFileSync(path.join(temp, `interface-${version}.ps1`), '\ufeff' + smoke);
    }
    const result = spawnSync('powershell.exe', ['-NoProfile', '-STA', '-NonInteractive', '-File', path.join(__dirname, 'verify-native.ps1'), '-FixtureDir', temp], {
      encoding: 'utf8', timeout: 90000
    });
    if (result.error) throw result.error;
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    assert.equal(result.status, 0, `Vérification native échouée (${result.status})`);
  } finally {
    const root = path.resolve(os.tmpdir()) + path.sep;
    if (path.resolve(temp).startsWith(root)) fs.rmSync(temp, { recursive: true, force: true });
  }
}
