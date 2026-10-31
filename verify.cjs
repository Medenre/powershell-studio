const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const core = require('./core.js');
const visualCore = require('./visual-core.js');
const syntax = require('./syntax.js');

const syntaxSample = '# commentaire\r\n$nom = "valeur # texte"\r\nif ($true) { Write-Host $nom }';
const syntaxTokens = syntax.tokenize(syntaxSample);
assert.equal(syntaxTokens.map(token => token.text).join(''), syntaxSample);
for (const kind of ['comment', 'variable', 'string', 'keyword', 'constant', 'command']) {
  assert.ok(syntaxTokens.some(token => token.kind === kind), `Coloration absente : ${kind}`);
}

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

const visualProject = core.fresh();
visualProject.controls = [control('Button', 1), control('Label', 2), control('CheckBox', 3)];
visualProject.controls[2].checked = true;
const writeValue = visualCore.createStep('writeFile');
writeValue.path = 'C:\\temp\\rapport.txt';
writeValue.value = "$StudioVars['contenu']";
writeValue.mode = 'expression';
assert.match(visualCore.compileList(visualProject, [writeValue]).join('\n'), /WriteAllText\(\[string\]'C:\\temp\\rapport\.txt', \[string\]\(\$StudioVars\['contenu'\]\)/);
const repeat = visualCore.createStep('repeat');
repeat.count = '3';
repeat.variable = 'i';
const setText = visualCore.createStep('setText');
setText.target = visualProject.controls[1].name;
setText.mode = 'expression';
setText.value = "$StudioVars['i']";
const condition = visualCore.createStep('if');
condition.conditions[0].leftVariable = 'i';
condition.conditions[0].operator = 'ge';
condition.conditions[0].rightValue = '2';
condition.then.push(setText);
repeat.body.push(condition);
const combined = visualCore.createStep('if');
combined.conditions[0].leftSource = 'control';
combined.conditions[0].leftTarget = visualProject.controls[2].name;
combined.conditions[0].leftProperty = 'Checked';
combined.conditions[0].operator = 'eq';
combined.conditions[0].valueType = 'boolean';
combined.conditions[0].rightValue = 'true';
const labelIsTwo = visualCore.defaultCondition('if');
labelIsTwo.join = 'and';
labelIsTwo.leftSource = 'control';
labelIsTwo.leftTarget = visualProject.controls[1].name;
labelIsTwo.leftProperty = 'Text';
labelIsTwo.operator = 'eq';
labelIsTwo.valueType = 'text';
labelIsTwo.rightValue = '2';
combined.conditions.push(labelIsTwo);
const successText = visualCore.createStep('setText');
successText.target = visualProject.controls[1].name;
successText.value = 'OK';
combined.then.push(successText);
visualProject.controls[0].visualEvents = {Click:[repeat,combined]};
visualProject.controls[1].visualEvents = {Click:visualCore.definitions.map(def => visualCore.createStep(def.kind))};
for (const version of versions) {
  visualProject.targetVersion = version;
  const script = core.generate(visualProject);
  assert.match(script, /for \(\$StudioIndex_/);
  assert.match(script, /\$StudioVars\['i'\] = \$StudioIndex_/);
  assert.match(script, /-ge \[double\]\(2\)/);
  assert.match(script, /\$ctrl_Label2\.Text = \[string\]/);
  assert.match(script, /\$StudioVars = @\{\}/);
  assert.match(script, /\$ctrl_CheckBox3\.Checked/);
  assert.match(script, / -and /);
}
const visualSaved = JSON.parse(JSON.stringify(visualProject));
core.validate(visualSaved);
assert.equal(visualSaved.controls[0].visualEvents.Click[0].body[0].kind, 'if');
assert.equal(visualSaved.controls[0].visualEvents.Click[0].body[0].conditionMode, 'builder');
assert.equal(visualSaved.controls[0].visualEvents.Click[0].body[0].then[0].kind, 'setText');
visualCore.renameTarget(visualSaved, 'ctrl_Label2', 'ctrl_Renamed');
assert.equal(visualSaved.controls[0].visualEvents.Click[0].body[0].then[0].target, 'ctrl_Renamed');
const propertyCondition = visualCore.createStep('if');
propertyCondition.conditions[0].leftSource = 'control';
propertyCondition.conditions[0].leftTarget = 'ctrl_Label2';
propertyCondition.conditions[0].leftProperty = 'Text';
propertyCondition.conditions[0].operator = 'eq';
propertyCondition.conditions[0].valueType = 'text';
propertyCondition.conditions[0].rightValue = "L'utilisateur";
assert.match(visualCore.compileCondition(visualProject,propertyCondition), /\$ctrl_Label2\.Text/);
assert.match(visualCore.compileCondition(visualProject,propertyCondition), /L''utilisateur/);
const secondCondition = visualCore.defaultCondition('if');
secondCondition.join = 'or';
secondCondition.operator = 'contains';
secondCondition.valueType = 'text';
secondCondition.rightValue = "O'Reilly";
propertyCondition.conditions.push(secondCondition);
assert.match(visualCore.compileCondition(visualProject,propertyCondition), / -or /);
assert.match(visualCore.compileCondition(visualProject,propertyCondition), /\.IndexOf\(/);
assert.match(visualCore.compileCondition(visualProject,propertyCondition), /O''Reilly/);
const booleanCondition = visualCore.createStep('while');
assert.match(visualCore.compileCondition(visualProject,booleanCondition), /-ieq 'true'/);
visualCore.renameTarget({form:visualProject.form,controls:[{...visualProject.controls[0],visualEvents:{Click:[propertyCondition]}}]}, 'ctrl_Label2', 'ctrl_Nouveau');
assert.equal(propertyCondition.conditions[0].leftTarget, 'ctrl_Nouveau');
const legacyCondition = visualCore.createStep('while');
delete legacyCondition.conditionMode;
delete legacyCondition.conditions;
visualSaved.form.visualEvents = {Load:[legacyCondition]};
core.validate(visualSaved);
assert.equal(visualSaved.form.visualEvents.Load[0].conditionMode, 'code');
assert.match(visualCore.compileCondition(visualSaved,visualSaved.form.visualEvents.Load[0]), /\$StudioVars\['continuer'\]/);
const invalidVisual = JSON.parse(JSON.stringify(visualProject));
invalidVisual.controls[0].visualEvents.Click[0].kind = '__proto__';
assert.throws(() => core.validate(invalidVisual));
const invalidCondition = JSON.parse(JSON.stringify(visualProject));
invalidCondition.controls[0].visualEvents.Click[0].body[0].conditions[0].operator = 'Invoke-Expression';
assert.throws(() => core.validate(invalidCondition));
const partialNumber = JSON.parse(JSON.stringify(visualProject));
partialNumber.controls[0].visualEvents.Click[0].body[0].conditions[0].rightValue = '';
core.validate(partialNumber);
assert.equal(partialNumber.controls[0].visualEvents.Click[0].body[0].conditions[0].rightValue, '0');

console.log('PASS: 13 contrôles, 5 cibles, anciens projets, images et blocs visuels');

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
    visualProject.targetVersion = '2.0';
    const visualScript = core.generate(visualProject);
    const visualMarker = '\r\ntry {\r\n    [void]$MainForm.ShowDialog()';
    const visualSmoke = visualScript.replace(visualMarker, '\r\n$MainForm.Add_Shown({\r\n    $ctrl_Button1.PerformClick()\r\n    if ($ctrl_Label2.Text -ne "OK") { throw "Les conditions visuelles n’ont pas mis à jour le libellé" }\r\n    $MainForm.Close()\r\n})' + visualMarker);
    fs.writeFileSync(path.join(temp, 'interface-visual-2.0.ps1'), '\ufeff' + visualSmoke);
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
