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
  assert.match(result.stdout, /ps-token--keyword/);
  assert.match(result.stdout, /id="showPalette"/);
  const source = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  let probe = source;
  for (const asset of ['style.css', 'responsive.css', 'visual.css', 'themes.css', 'syntax.css', 'features.css', 'visual-core.js', 'core.js', 'syntax.js', 'storage.js', 'diagnostics.js', 'app.js', 'visual-ui.js', 'settings.js', 'i18n.js']) {
    probe = probe.replace(`"${asset}"`, `"${pathToFileURL(path.join(__dirname, asset)).href}"`);
  }
  probe = probe.replace('</body>', `<script>
    (() => {
    const viewport = document.getElementById('viewport');
    const wrap = document.getElementById('scaleWrap');
    const tabsRect = document.querySelector('nav .tabs').getBoundingClientRect();
    const headingRect = document.querySelector('.workspace-heading').getBoundingClientRect();
    const tabsCentered = window.innerWidth <= 780 || Math.abs(tabsRect.x + tabsRect.width / 2 - headingRect.x - headingRect.width / 2) < 2;
    const tabsClear = window.innerWidth <= 780 || (document.querySelector('nav>div:first-child').getBoundingClientRect().right < tabsRect.left
      && tabsRect.right < document.getElementById('help').getBoundingClientRect().left);
    const tipRemoved = !document.querySelector('.tip');
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
    const formHandleSmall = getComputedStyle(document.querySelector('#formHandles .handle-e')).width === '10px';
    const codePane = document.getElementById('code');
    const codeUnchanged = codePane.textContent === generate();
    const codeTokens = ['comment','keyword','variable','string','command'].every(kind=>!!codePane.querySelector('.ps-token--'+kind));
    const lightSyntax = getComputedStyle(codePane.querySelector('.ps-token--variable')).color === 'rgb(255, 69, 0)'
      && getComputedStyle(codePane.querySelector('.ps-token--comment')).color === 'rgb(0, 100, 0)';
    const isolatedCode = document.createElement('pre');
    PowerShellSyntax.render(isolatedCode, '<script>alert(1)');
    const codeEscaped = isolatedCode.textContent === '<script>alert(1)' && !isolatedCode.querySelector('script');
    document.getElementById('settings').click();
    const dialogOpened = document.getElementById('settingsDialog').open;
    const languageSelect = document.getElementById('settingsLanguage');
    const flagsAvailable = languageSelect.options[0].textContent.includes('🇫🇷') && languageSelect.options[1].textContent.includes('🇬🇧')
      && getComputedStyle(document.getElementById('languageFlag')).backgroundImage.includes('linear-gradient');
    const scriptBeforeLanguage = generate();
    languageSelect.value = 'en';
    languageSelect.dispatchEvent(new Event('change', {bubbles:true}));
    const frenchFragments = [];
    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while(textWalker.nextNode()){
      const node = textWalker.currentNode;
      if(node.parentElement.closest('#window,#projectTitle,#code,#visualCode,#settingsLanguage,textarea,script,style'))continue;
      if(/[éèêàùûôîïçÉÈÊÀÙÔÇ]/.test(node.textContent))frenchFragments.push(node.textContent.trim().slice(0,90));
    }
    const englishSelected = document.documentElement.lang === 'en' && document.getElementById('languageFlag').dataset.language === 'en'
      && localStorage.getItem('ps-studio-language') === 'en'
      && document.getElementById('designTab').textContent.includes('Designer')
      && document.querySelector('#settingsDialog h2').textContent === 'Site settings'
      && generate() === scriptBeforeLanguage && document.getElementById('windowTitle').textContent === state.form.text
      && frenchFragments.length === 0;
    languageSelect.value = 'fr';
    languageSelect.dispatchEvent(new Event('change', {bubbles:true}));
    const frenchRestored = document.documentElement.lang === 'fr' && document.getElementById('languageFlag').dataset.language === 'fr'
      && document.getElementById('designTab').textContent.includes('Conception');
    const eightPalettes = document.querySelectorAll('[data-palette-choice]').length === 8;
    document.querySelector('[data-palette-choice="ocean"]').click();
    const paletteChanged = document.documentElement.dataset.palette === 'ocean';
    const mode = document.getElementById('settingsMode');
    mode.value = 'dark';
    mode.dispatchEvent(new Event('change', {bubbles:true}));
    const darkChanged = document.documentElement.dataset.theme === 'dark';
    const darkSyntax = getComputedStyle(codePane.querySelector('.ps-token--variable')).color === 'rgb(255, 173, 120)';
    const accentPicker = document.getElementById('settingsAccent');
    accentPicker.value = '#123456';
    accentPicker.dispatchEvent(new Event('input', {bubbles:true}));
    const accentChanged = document.documentElement.style.getPropertyValue('--accent') === '#123456'
      && localStorage.getItem('ps-studio-accent') === '#123456';
    document.getElementById('settingsReset').click();
    const accentReset = !document.documentElement.style.getPropertyValue('--accent');
    document.getElementById('closeSettings').click();
    StudioI18n.setLanguage('en');
    document.getElementById('help').click();
    const englishGuide = document.getElementById('dialogBody').textContent.includes('Build your interface in a few steps');
    document.getElementById('closeDialog').click();
    StudioI18n.setLanguage('fr');
    document.querySelector('.component[data-type="Button"]').click();
    const addedButton = state.controls.at(-1);
    const controlHandleSmall = getComputedStyle(document.querySelector('.control .handle-e')).width === '10px'
      && getComputedStyle(document.querySelector('.control .handle-se')).width === '12px';
    const layoutButtons = [...document.querySelectorAll('#inspector .layout-actions button')];
    const layoutIcons = layoutButtons.length === 10 && layoutButtons.every(button=>button.querySelector('svg.layout-icon') && button.title && button.getAttribute('aria-label'))
      && layoutButtons.filter(button=>button.disabled).length === 8;
    StudioI18n.setLanguage('en');
    const layoutTranslated = layoutButtons[0].textContent.includes('Center') && layoutButtons[0].getAttribute('aria-label').includes('Center');
    StudioI18n.setLanguage('fr');
    document.querySelector('.component[data-type="CheckBox"]').click();
    const addedCheckBox = state.controls.at(-1);
    document.querySelector('.component[data-type="GroupBox"]').click();
    const addedGroup = state.controls.at(-1);
    document.querySelector('#layers [data-layer="' + addedButton.name + '"]').click();
    const parentSelect = document.querySelector('#inspector [data-key="parent"]');
    parentSelect.value = addedGroup.name;
    parentSelect.dispatchEvent(new Event('change', {bubbles:true}));
    const dollar=String.fromCharCode(36);
    const childAttached = addedButton.parent === addedGroup.name
      && generate().includes(dollar + addedGroup.name + '.Controls.Add(' + dollar + addedButton.name + ')');
    document.querySelector('#layers [data-layer="' + addedGroup.name + '"]').click();
    const childBeforeMove = {x:addedButton.x,y:addedButton.y};
    moveSelection(8,8);
    const childFollowsParent = addedButton.x === childBeforeMove.x + 8 && addedButton.y === childBeforeMove.y + 8;
    render();
    document.getElementById('visualTab').click();
    const visualOpened = !document.getElementById('visualView').hidden;
    const search = document.getElementById('visualSearch');
    search.value='Répéter';search.dispatchEvent(new Event('input',{bubbles:true}));
    const paletteSearch = document.querySelectorAll('#visualPalette [data-add-kind]').length === 1
      && document.querySelector('#visualPalette [data-add-kind="repeat"]');
    document.getElementById('visualSearch').value='';
    document.getElementById('visualSearch').dispatchEvent(new Event('input',{bubbles:true}));
    const visualFrameRemoved = ['borderLeftWidth','borderRightWidth','borderBottomWidth'].every(key=>getComputedStyle(document.getElementById('visualView'))[key]==='0px')
      && getComputedStyle(document.getElementById('visualPalette')).borderRightWidth === '0px'
      && getComputedStyle(document.querySelector('.vs-preview')).borderLeftWidth === '0px';
    const helpButtons = document.querySelectorAll('#visualPalette [data-help-kind]');
    const allTooltips = helpButtons.length === VisualScripting.definitions.length
      && [...helpButtons].every(button=>button.title.length > 20);
    document.querySelector('#visualPalette [data-help-kind="repeat"]').click();
    const tooltipOpens = document.getElementById('toast').textContent.includes('Répète');
    StudioI18n.setLanguage('en');
    const englishTooltip = document.querySelector('#visualPalette [data-help-kind="repeat"]').title.startsWith('Repeats')
      && document.querySelector('[data-add-kind="repeat"]').textContent.includes('Repeat N times');
    StudioI18n.setLanguage('fr');
    const visualTarget = document.getElementById('visualTarget');
    visualTarget.value = addedButton.name;
    visualTarget.dispatchEvent(new Event('change', {bubbles:true}));
    const targetTooltip = document.getElementById('visualTargetHelp').title.includes('Bouton');
    document.getElementById('visualTargetHelp').click();
    const targetHelpOpens = document.getElementById('toast').textContent.includes('Bouton');
    document.querySelector('[data-add-kind="repeat"]').click();
    const nestedKind = document.querySelector('.vs-add-nested .vs-kind-picker');
    nestedKind.value = 'setText';
    document.querySelector('[data-add-branch="body"]').click();
    const visualAdded = addedButton.visualEvents.Click[0].kind === 'repeat'
      && addedButton.visualEvents.Click[0].body[0].kind === 'setText'
      && document.getElementById('visualBlocks').querySelectorAll('.vs-block').length === 2
      && document.getElementById('code').textContent.includes('Add_Click');
    const firstVisualCard=document.querySelector('#visualBlocks [data-step-id]');
    firstVisualCard.querySelector('[data-collapse]').click();
    const blockCollapsed=firstVisualCard.classList.contains('is-collapsed')
      && getComputedStyle(firstVisualCard.querySelector('.vs-branch')).display === 'none';
    firstVisualCard.querySelector('[data-collapse]').click();
    const flowSearch=document.getElementById('visualFind');
    flowSearch.value='Répéter';flowSearch.dispatchEvent(new Event('input',{bubbles:true}));
    const existingBlockFound=document.getElementById('visualFindCount').textContent==='1/1'
      && !!document.querySelector('#visualBlocks .vs-search-match');
    flowSearch.value='';flowSearch.dispatchEvent(new Event('input',{bubbles:true}));
    document.querySelector('[data-add-kind="if"]').click();
    const conditionBlock = addedButton.visualEvents.Click.at(-1);
    const conditionElement = () => document.querySelector('[data-step-id="' + conditionBlock.id + '"]');
    const choose = (key,value,index=0) => {
      const select = conditionElement().querySelectorAll('[data-condition-index]')[index].querySelector('[data-condition-key="' + key + '"]');
      select.value = value;
      select.dispatchEvent(new Event('change', {bubbles:true}));
    };
    choose('leftSource','control');
    choose('leftTarget',addedButton.name);
    choose('operator','eq');
    choose('valueType','text');
    const conditionValue = conditionElement().querySelector('input[data-condition-key="rightValue"]');
    conditionValue.value = 'Action';
    conditionValue.dispatchEvent(new Event('input', {bubbles:true}));
    conditionElement().querySelector('[data-condition-add]').click();
    choose('join','or',1);
    choose('leftSource','control',1);
    choose('leftTarget',addedCheckBox.name,1);
    choose('leftProperty','Checked',1);
    const conditionConfigured = conditionBlock.conditionMode === 'builder'
      && conditionBlock.conditions.length === 2
      && conditionBlock.conditions[0].leftTarget === addedButton.name
      && conditionBlock.conditions[0].rightValue === 'Action'
      && conditionBlock.conditions[1].leftTarget === addedCheckBox.name
      && conditionBlock.conditions[1].valueType === 'boolean'
      && conditionBlock.conditions[1].rightValue === 'true'
      && conditionBlock.conditions[1].join === 'or'
      && document.getElementById('code').textContent.includes(addedButton.name + '.Text');
    addedCheckBox.text = 'Choix personnalisé';
    StudioI18n.setLanguage('en');
    const englishTargetTooltip = document.getElementById('visualTargetHelp').title.startsWith('Button that');
    const projectTextPreserved = [...document.getElementById('visualTarget').options]
      .some(item=>item.textContent.includes('Check box') && item.textContent.includes('Choix personnalisé'));
    const visualFrenchFragments = [];
    const visualWalker = document.createTreeWalker(document.getElementById('visualView'), NodeFilter.SHOW_TEXT);
    while(visualWalker.nextNode()){
      const node = visualWalker.currentNode;
      if(node.parentElement.closest('pre,textarea,[data-i18n-skip]'))continue;
      if(/[éèêàùûôîïçÉÈÊÀÙÔÇ]/.test(node.textContent))visualFrenchFragments.push(node.textContent.trim().slice(0,90));
    }
    const englishVisualComplete = visualFrenchFragments.length === 0;
    StudioI18n.setLanguage('fr');
    const advancedMode = conditionElement().querySelector('[data-condition-mode]');
    advancedMode.value = 'code';
    advancedMode.dispatchEvent(new Event('change', {bubbles:true}));
    const advancedAvailable = conditionBlock.conditionMode === 'code'
      && !!conditionElement().querySelector('[data-field="condition"]');
    const listMode = conditionElement().querySelector('[data-condition-mode]');
    listMode.value = 'builder';
    listMode.dispatchEvent(new Event('change', {bubbles:true}));
    document.querySelector('[data-add-kind="while"]').click();
    const whileBlock = addedButton.visualEvents.Click.at(-1);
    const whileUsesLists = whileBlock.conditionMode === 'builder'
      && !!document.querySelector('[data-step-id="' + whileBlock.id + '"] .vs-condition-row');
    const brokenStep=VisualScripting.createStep('setText');brokenStep.target='ctrl_Missing';
    addedButton.visualEvents.Click.push(brokenStep);
    showDiagnostics();
    const diagnosticsBlockExport=document.getElementById('diagnosticsDialog').open
      && document.getElementById('diagnosticsExport').disabled
      && document.querySelector('#diagnosticsList .diagnostic-item.error');
    document.getElementById('diagnosticsClose').click();
    StudioI18n.setLanguage('en');showDiagnostics();
    const englishDiagnostics=document.querySelector('#diagnosticsList .diagnostic-item.error strong')?.textContent.includes('no longer exists')
      && document.querySelector('#diagnosticsDialog h2').textContent==='Project check';
    document.querySelector('#diagnosticsList .diagnostic-item.error').click();
    const issueNavigates=document.querySelector('#visualBlocks .vs-issue-focus[data-step-id="' + brokenStep.id + '"]')
      && document.getElementById('visualTarget').value===addedButton.name;
    StudioI18n.setLanguage('fr');
    addedButton.visualEvents.Click.pop();VisualEditor.render();
    showDiagnostics(true);
    const warningsCanExport=document.getElementById('diagnosticsDialog').open
      && !document.getElementById('diagnosticsExport').disabled;
    document.getElementById('diagnosticsClose').click();
    for(let i=0;i<16;i++)addedButton.visualEvents.Click.push(VisualScripting.createStep('message'));
    VisualEditor.render();
    const palettePane = document.getElementById('visualPalette');
    const flowPane = document.querySelector('.vs-flow');
    const scrollPanels = getComputedStyle(palettePane).overflowY === 'auto'
      && getComputedStyle(flowPane).overflowY === 'auto'
      && flowPane.scrollHeight > flowPane.clientHeight && flowPane.clientHeight > 0;
    const pageFixed = getComputedStyle(document.body).overflow === 'hidden'
      && document.documentElement.scrollHeight <= window.innerHeight + 1;
    const headingsRemoved = getComputedStyle(document.querySelector('.workspace-heading')).display === 'none'
      && getComputedStyle(document.querySelector('.workspace footer')).display === 'none';
    document.getElementById('designTab').click();
    const designRestored = !document.body.classList.contains('visual-active')
      && getComputedStyle(document.querySelector('.workspace-heading')).display !== 'none';
    selectControl(addedGroup.name);duplicate();
    const duplicatedGroup=state.controls.find(item=>item.name===addedGroup.name+'_2');
    const duplicatedChild=state.controls.find(item=>item.name===addedButton.name+'_2');
    const subtreeDuplicated=duplicatedGroup && duplicatedChild && duplicatedChild.parent===duplicatedGroup.name
      && duplicatedChild.visualEvents.Click[0].id!==addedButton.visualEvents.Click[0].id
      && duplicatedChild.visualEvents.Click.find(step=>step.kind==='if').conditions[0].leftTarget===duplicatedChild.name;
    selectControl(addedGroup.name);remove();
    const childReparented=addedButton.parent==='MainForm' && !state.controls.includes(addedGroup);
    const features = tabsCentered && tabsClear && tipRemoved && dialogOpened && flagsAvailable && englishSelected && frenchRestored && englishGuide
      && eightPalettes && paletteChanged && darkChanged && accentChanged && accentReset
      && visualOpened && visualAdded && conditionConfigured && englishVisualComplete && projectTextPreserved && advancedAvailable && whileUsesLists
      && visualFrameRemoved && allTooltips && tooltipOpens && englishTooltip && targetTooltip && targetHelpOpens && englishTargetTooltip
      && formHandleSmall && controlHandleSmall && scrollPanels && pageFixed && headingsRemoved && designRestored
      && childAttached && childFollowsParent && subtreeDuplicated && childReparented && paletteSearch && blockCollapsed && existingBlockFound && diagnosticsBlockExport && englishDiagnostics && issueNavigates && warningsCanExport
      && codeUnchanged && codeTokens && lightSyntax && darkSyntax && codeEscaped && layoutIcons && layoutTranslated;
    const diagnostics = {moved, centered, aligned, noPanInsideForm, unchanged,
      tabsCentered, tabsClear, navLeftRight:document.querySelector('nav>div:first-child').getBoundingClientRect().right,
      tabsLeft:tabsRect.left,tabsRight:tabsRect.right,helpLeft:document.getElementById('help').getBoundingClientRect().left,
      tipRemoved, dialogOpened, flagsAvailable, englishSelected, frenchFragments, frenchRestored, englishGuide,
      eightPalettes, paletteChanged, darkChanged, accentChanged, accentReset, visualOpened, visualAdded, conditionConfigured, englishVisualComplete, projectTextPreserved, visualFrenchFragments, advancedAvailable, whileUsesLists,
      visualFrameRemoved, allTooltips, tooltipOpens, englishTooltip, targetTooltip, targetHelpOpens, englishTargetTooltip,
      formHandleSmall, controlHandleSmall, scrollPanels, pageFixed, headingsRemoved, designRestored,
      childAttached, childFollowsParent, subtreeDuplicated:!!subtreeDuplicated, childReparented, paletteSearch:!!paletteSearch, blockCollapsed, existingBlockFound, diagnosticsBlockExport:!!diagnosticsBlockExport, englishDiagnostics, issueNavigates:!!issueNavigates, warningsCanExport,
      codeUnchanged, codeTokens, lightSyntax, darkSyntax, codeEscaped, layoutIcons, layoutTranslated,
      pageHeight:document.documentElement.scrollHeight,windowHeight:window.innerHeight,
      flowHeight:flowPane.clientHeight,flowScrollHeight:flowPane.scrollHeight,
      xOffset: centeredRect.x + centeredRect.width / 2 - viewRect.x - viewRect.width / 2,
      yOffset: centeredRect.y + centeredRect.height / 2 - viewRect.y - viewRect.height / 2,
      viewWidth:viewRect.width,clientWidth:viewport.clientWidth,scrollWidth:viewport.scrollWidth,
      scrollLeft:viewport.scrollLeft,formLeft:centeredRect.x,formWidth:centeredRect.width};
    document.body.insertAdjacentHTML('beforeend', '<output id="gestureResult">' + (moved && centered && aligned && noPanInsideForm && unchanged ? 'PASS' : JSON.stringify(diagnostics)) + '</output>');
    document.body.insertAdjacentHTML('beforeend', '<output id="featureResult">' + (features ? 'PASS' : JSON.stringify(diagnostics)) + '</output>');
    })();
  </script></body>`);
  const probeFile = path.join(profile, 'gesture.html');
  fs.writeFileSync(probeFile, probe);
  const scriptFile=path.join(profile,'probe.js');
  fs.writeFileSync(scriptFile,probe.slice(probe.indexOf('<script>\n    (() => {')+8,probe.lastIndexOf('</script>')));
  const syntaxCheck=spawnSync(process.execPath,['--check',scriptFile],{encoding:'utf8'});
  assert.equal(syntaxCheck.status,0,syntaxCheck.stderr);
  const gesture = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${path.join(profile, 'gesture-profile')}`, '--dump-dom', pathToFileURL(probeFile).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (gesture.error) throw gesture.error;
  assert.equal(gesture.status, 0, gesture.stderr);
  const gestureResult = [...gesture.stdout.matchAll(/<output id="gestureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(gestureResult, 'PASS', gestureResult || gesture.stderr);
  const featureResult = [...gesture.stdout.matchAll(/<output id="featureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(featureResult, 'PASS', featureResult || gesture.stderr);
  const desktop = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--window-size=1500,1000', `--user-data-dir=${path.join(profile, 'desktop-profile')}`,
    '--dump-dom', pathToFileURL(probeFile).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (desktop.error) throw desktop.error;
  assert.equal(desktop.status, 0, desktop.stderr);
  const desktopResult = [...desktop.stdout.matchAll(/<output id="gestureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(desktopResult, 'PASS', desktopResult || desktop.stderr);
  const desktopFeatures = [...desktop.stdout.matchAll(/<output id="featureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(desktopFeatures, 'PASS', desktopFeatures || desktop.stderr);
  const laptop = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--window-size=1200,800', `--user-data-dir=${path.join(profile, 'laptop-profile')}`,
    '--dump-dom', pathToFileURL(probeFile).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (laptop.error) throw laptop.error;
  assert.equal(laptop.status, 0, laptop.stderr);
  const laptopFeatures = [...laptop.stdout.matchAll(/<output id="featureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(laptopFeatures, 'PASS', laptopFeatures || laptop.stderr);
  const mobile = spawnSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--window-size=600,900', `--user-data-dir=${path.join(profile, 'mobile-profile')}`,
    '--dump-dom', pathToFileURL(probeFile).href
  ], { encoding: 'utf8', timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  if (mobile.error) throw mobile.error;
  assert.equal(mobile.status, 0, mobile.stderr);
  const mobileFeatures = [...mobile.stdout.matchAll(/<output id="featureResult">([^<]*)<\/output>/g)].at(-1)?.[1];
  assert.equal(mobileFeatures, 'PASS', mobileFeatures || mobile.stderr);
  console.log('PASS: conteneurs natifs dans l’export, déplacement, duplication et rattachement des enfants');
  console.log('PASS: diagnostics avant export, navigation vers les erreurs, avertissements et français/anglais');
  console.log('PASS: recherche dans les blocs, repli des branches et onglets centrés sur mobile et bureau');
  console.log('PASS: onglets centrés sans chevauchement, cadre retiré, aides des blocs et français/anglais');
  console.log('PASS: conditions sans code, listes de composants, mode avancé et boucle Tant que sur mobile et bureau');
  console.log('PASS: poignées réduites et défilement limité aux panneaux Visual scripting sur mobile et bureau');
  console.log('PASS: réglages, huit palettes et boucle visuelle imbriquée sur mobile et bureau');
  console.log('PASS: page statique chargée dans le navigateur, éditeur et code généré visibles');
  console.log('PASS: déplacement sur le fond, recentrage molette, formulaire préservé sur mobile et bureau');
} finally {
  const root = path.resolve(os.tmpdir()) + path.sep;
  if (path.resolve(profile).startsWith(root)) fs.rmSync(profile, { recursive: true, force: true });
}
