'use strict';
const StudioCore = (() => {
const types={Button:['Bouton','▭',120,34,'Action'],Label:['Libellé','T',160,26,'Votre texte'],TextBox:['Champ texte','▤',210,30,''],CheckBox:['Case à cocher','☑',160,26,'Activer cette option'],RadioButton:['Bouton radio','◉',160,26,'Option'],ListBox:['Liste','☷',210,120,''],ComboBox:['Liste déroulante','▾',210,30,''],NumericUpDown:['Nombre','↕',120,30,''],DateTimePicker:['Date','▦',210,30,''],ProgressBar:['Progression','▰',230,22,''],GroupBox:['Groupe visuel','▣',260,140,'Groupe'],Panel:['Panneau visuel','□',260,140,''],PictureBox:['Image','▧',160,120,'']};
const fonts=['Segoe UI','Arial','Calibri','Cambria','Consolas','Courier New','Georgia','Tahoma','Times New Roman','Trebuchet MS','Verdana'];
const transparentTypes=['Label','CheckBox','RadioButton','GroupBox','Panel'];
const typography=()=>({...featureDefaults(),fontFamily:'Segoe UI',bold:false,italic:false,underline:false,transparent:false});
function normalizeAppearance(c){normalizeFeatures(c);c.fontFamily=fonts.includes(c.fontFamily)?c.fontFamily:'Segoe UI';for(const k of ['bold','italic','underline'])c[k]=c[k]===true;c.transparent=transparentTypes.includes(c.type)&&c.transparent===true;}
const fresh=()=>({version:1,targetVersion:'5.1',form:{name:'MainForm',text:'Mon interface',w:600,h:400,bg:'#f6f7f9',fg:'#273142',font:10,...typography()},controls:[]});
function validate(s){
 if(!s||s.version!==1||!s.form||Array.isArray(s.form)||!Array.isArray(s.controls)||s.controls.length>500)throw Error('Projet non reconnu');
 const num=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 const color=v=>typeof v==='string'&&/^#[\da-f]{6}$/i.test(v);
 const names=new Set(['mainform']);
 if(!num(s.form.w,240,2000)||!num(s.form.h,160,1600)||typeof s.form.text!=='string'||s.form.text.length>1000||!color(s.form.bg)||!color(s.form.fg)||!num(s.form.font,6,48))throw Error('Fenêtre invalide');
 s.targetVersion=['2.0','3.0','4.0','5.1','7.0'].includes(s.targetVersion)?s.targetVersion:'5.1';
 s.form.name='MainForm';normalizeAppearance(s.form);
 for(const c of s.controls){
  if(!c||typeof c!=='object'||Array.isArray(c)||!Object.prototype.hasOwnProperty.call(types,c.type)||!/^ctrl_[A-Za-z0-9_]+$/.test(c.name)||names.has(c.name.toLowerCase())||typeof c.text!=='string'||c.text.length>10000||typeof c.items!=='string'||c.items.length>50000||typeof c.action!=='string'||c.action.length>100000||!num(c.x,0,2000)||!num(c.y,0,1600)||!num(c.w,20,2000)||!num(c.h,16,1600)||!num(c.font,6,48)||!color(c.bg)||!color(c.fg)||!num(c.value,0,100)||typeof c.checked!=='boolean'||typeof c.enabled!=='boolean')throw Error('Composant invalide');
  names.add(c.name.toLowerCase());c.id=c.name;
  // Les anciens projets peuvent contenir un contrôle dépassant la fenêtre.
  c.w=Math.min(c.w,s.form.w);c.h=Math.min(c.h,s.form.h);
  c.x=Math.min(c.x,s.form.w-c.w);c.y=Math.min(c.y,s.form.h-c.h);
  normalizeAppearance(c);
 }
 return s;
}
function launchCommand(version='5.1'){return (version==='7.0'?'pwsh.exe':'powershell.exe')+' -STA -File .\\interface.ps1';}
function featureDefaults(type){return {textAlign:type==='Button'?'MiddleCenter':'MiddleLeft',image:'',imageName:'',imageSize:24,imagePosition:'ImageBeforeText',tooltip:'',tabIndex:0,readOnly:false,password:false};}
function normalizeFeatures(c){const d=featureDefaults(c.type);for(const [k,v] of Object.entries(d))if(c[k]===undefined)c[k]=v;
 if(!['TopLeft','TopCenter','TopRight','MiddleLeft','MiddleCenter','MiddleRight','BottomLeft','BottomCenter','BottomRight'].includes(c.textAlign))c.textAlign=d.textAlign;
 if(typeof c.image!=='string'||c.image.length>1500000|| (c.image&&!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(c.image)))throw Error('Image de projet invalide');
 if(!['Button','PictureBox'].includes(c.type))c.image='';
 c.imageSize=Math.max(12,Math.min(128,Number(c.imageSize)||24));
 if(!['ImageBeforeText','TextBeforeImage','ImageAboveText','TextAboveImage','Overlay'].includes(c.imagePosition))c.imagePosition=d.imagePosition;
 c.imageName=typeof c.imageName==='string'?c.imageName.slice(0,150):'';c.tooltip=typeof c.tooltip==='string'?c.tooltip.slice(0,500):'';
 c.tabIndex=Math.max(0,Math.min(999,Math.round(Number(c.tabIndex)||0)));c.readOnly=c.readOnly===true;c.password=c.password===true;
}
function generate(state) {
const quote=v=>"'"+String(v).replace(/'/g,"''")+"'";
function psNew(type,args=[]){return Number(state.targetVersion)>=5?`[${type}]::new(${args.join(', ')})`:`New-Object -TypeName ${type}${args.length?' -ArgumentList '+args.join(', '):''}`;}
function psFont(c){const styles=['bold','italic','underline'].filter(k=>c[k]).map(k=>'[System.Drawing.FontStyle]::'+({bold:'Bold',italic:'Italic',underline:'Underline'}[k]));const args=[quote(c.fontFamily),c.font,styles.length?'('+styles.join(' -bor ')+')':'([System.Drawing.FontStyle]::Regular)'];if(Number(state.targetVersion)<5)args.push('([System.Drawing.GraphicsUnit]::Point)');return psNew('System.Drawing.Font',args);}
function extraControlLines(c,v){let l=[`${v}.TabIndex = ${c.tabIndex}`];if(c.tooltip)l.push(`$StudioToolTip.SetToolTip(${v}, ${quote(c.tooltip)})`);
 if(['Button','Label','CheckBox','RadioButton'].includes(c.type))l.push(`${v}.TextAlign = [System.Drawing.ContentAlignment]::${c.textAlign}`);
 if(c.type==='TextBox')l.push(`${v}.TextAlign = [System.Windows.Forms.HorizontalAlignment]::${c.textAlign.endsWith('Right')?'Right':c.textAlign.endsWith('Center')?'Center':'Left'}`,`${v}.ReadOnly = $${c.readOnly}`,`${v}.Multiline = $${!c.password}`,`${v}.UseSystemPasswordChar = $${c.password}`);
 if(c.type==='PictureBox')l.push(`${v}.SizeMode = [System.Windows.Forms.PictureBoxSizeMode]::Zoom`,`${v}.TabStop = $false`);
 if(c.image){l.push(`$StudioBytes = [System.Convert]::FromBase64String(${quote(c.image.split(',')[1])})`,`$StudioStream = ${psNew('System.IO.MemoryStream')}`,'$StudioStream.Write($StudioBytes, 0, $StudioBytes.Length)','$StudioStream.Position = 0','try {','    $StudioSourceImage = [System.Drawing.Image]::FromStream($StudioStream)','    try {',`        ${v}.Image = ${psNew('System.Drawing.Bitmap',['$StudioSourceImage',...(c.type==='Button'?[c.imageSize,c.imageSize]:[])])}`,'    } finally { $StudioSourceImage.Dispose() }','} finally { $StudioStream.Dispose() }',`[void]$StudioImages.Add(${v}.Image)`);if(c.type==='Button')l.push(`${v}.ImageAlign = [System.Drawing.ContentAlignment]::MiddleCenter`,`${v}.TextImageRelation = [System.Windows.Forms.TextImageRelation]::${c.imagePosition}`);}
 return l;
}
const f=state.form;let lines=[`#requires -Version ${state.targetVersion||'5.1'}`,'# Interface créée avec PowerShell Studio',`# Windows uniquement · Version minimale : PowerShell ${state.targetVersion||'5.1'}`,`# Exécution : ${launchCommand(state.targetVersion)}`,`# Génération : ${Number(state.targetVersion)>=5?'constructeurs ::new()':'constructeurs New-Object (compatibilité ancienne)'}. Actions personnalisées à vérifier.`,'# Les actions personnalisées sont exécutées lors du clic sur un bouton.','',"Add-Type -AssemblyName System.Windows.Forms","Add-Type -AssemblyName System.Drawing",'[System.Windows.Forms.Application]::EnableVisualStyles()','', `$MainForm = ${psNew('System.Windows.Forms.Form')}`,`$MainForm.Text = ${quote(f.text)}`,`$MainForm.ClientSize = ${psNew('System.Drawing.Size',[f.w,f.h])}`,"$MainForm.StartPosition = 'CenterScreen'","$MainForm.FormBorderStyle = 'FixedSingle'",'$MainForm.MaximizeBox = $false',"$MainForm.AutoScaleMode = 'None'",`$MainForm.BackColor = [System.Drawing.ColorTranslator]::FromHtml(${quote(f.bg)})`,`$MainForm.ForeColor = [System.Drawing.ColorTranslator]::FromHtml(${quote(f.fg)})`,`$MainForm.Font = ${psFont(f)}`,`$StudioToolTip = ${psNew('System.Windows.Forms.ToolTip')}`,`$StudioImages = ${psNew('System.Collections.ArrayList')}`,''];for(const c of state.controls){let v='$'+c.name;lines.push(`# ${c.type} — ${c.name}`,`${v} = ${psNew('System.Windows.Forms.'+c.type)}`,`${v}.Name = ${quote(c.name)}`,`${v}.Text = ${quote(c.text)}`,`${v}.Location = ${psNew('System.Drawing.Point',[c.x,c.y])}`,`${v}.Size = ${psNew('System.Drawing.Size',[c.w,c.h])}`,`${v}.Font = ${psFont(c)}`,`${v}.BackColor = ${c.transparent?'[System.Drawing.Color]::Transparent':`[System.Drawing.ColorTranslator]::FromHtml(${quote(c.bg)})`}`,`${v}.ForeColor = [System.Drawing.ColorTranslator]::FromHtml(${quote(c.fg)})`,`${v}.Enabled = $${c.enabled}`);if(['Label','CheckBox','RadioButton','Button'].includes(c.type))lines.push(`${v}.AutoSize = $false`);if(c.type==='TextBox')lines.push(`${v}.AutoSize = $false`,`${v}.Multiline = $true`);if(c.type==='ListBox')lines.push(`${v}.IntegralHeight = $false`);if(['Button','CheckBox','RadioButton'].includes(c.type))lines.push(`${v}.UseVisualStyleBackColor = $false`);if(['CheckBox','RadioButton'].includes(c.type))lines.push(`${v}.Checked = $${c.checked}`);if(['ComboBox','ListBox'].includes(c.type)){c.items.split('\n').filter(Boolean).forEach(item=>lines.push(`[void]${v}.Items.Add(${quote(item)})`));if(c.type==='ComboBox'){lines.push(`${v}.DropDownStyle = 'DropDownList'`);if(c.items.split('\n').some(Boolean))lines.push(`${v}.SelectedIndex = 0`);}}if(['NumericUpDown','ProgressBar'].includes(c.type))lines.push(`${v}.Minimum = 0`,`${v}.Maximum = 100`,`${v}.Value = ${c.value}`);if(c.type==='DateTimePicker')lines.push(`${v}.Format = 'Short'`);if(c.type==='Panel')lines.push(`${v}.BorderStyle = 'FixedSingle'`);lines.push(...extraControlLines(c,v));lines.push(`$MainForm.Controls.Add(${v})`,`${v}.BringToFront()`,'');}for(const c of state.controls.filter(c=>c.type==='Button'))lines.push(`$${c.name}.Add_Click({`,c.action?c.action.split('\n').map(l=>'    '+l).join('\n'):'    # Ajoutez votre action PowerShell ici','})','');lines.push('try {','    [void]$MainForm.ShowDialog()','} finally {','    $MainForm.Dispose()','    $StudioToolTip.Dispose()','    foreach ($StudioImage in $StudioImages) { $StudioImage.Dispose() }','}');return lines.join('\r\n');
}
function selectionBounds(controls){const x=Math.min(...controls.map(c=>c.x)),y=Math.min(...controls.map(c=>c.y));return {x,y,w:Math.max(...controls.map(c=>c.x+c.w))-x,h:Math.max(...controls.map(c=>c.y+c.h))-y};}
function resizedRect(start,dir,dx,dy,limits,gridStep=1){
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
 const snap=n=>Math.round(n/gridStep)*gridStep;
 let {x,y,w,h}=start;
 if(dir.includes('e'))w=clamp(snap(start.w+dx),limits.minW,limits.right-start.x);
 if(dir.includes('s'))h=clamp(snap(start.h+dy),limits.minH,limits.bottom-start.y);
 if(dir.includes('w')){w=clamp(snap(start.w-dx),limits.minW,start.x+start.w-limits.left);x=start.x+start.w-w;}
 if(dir.includes('n')){h=clamp(snap(start.h-dy),limits.minH,start.y+start.h-limits.top);y=start.y+start.h-h;}
 return {x,y,w,h};
}
return { types, fonts, transparentTypes, typography, fresh, validate, featureDefaults, generate, launchCommand, selectionBounds, resizedRect };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = StudioCore;
