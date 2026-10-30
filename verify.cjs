const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(require('path').join(__dirname,'app.js'),'utf8').split('function download(')[0];
const ctx={assert,structuredClone,localStorage:{getItem:()=>null},document:{getElementById:()=>({checked:false})}};vm.createContext(ctx);
vm.runInContext(code+'\n'+fs.readFileSync(require('path').join(__dirname,'app.js'),'utf8').split('\n').filter(l=>l.startsWith('function psNew(')||l.startsWith('function launchCommand(')).join('\n')+'\n'+fs.readFileSync(require('path').join(__dirname,'app.js'),'utf8').split('function featureDefaults(type)')[1].split('palette();render();')[0].replace(/^/, 'function featureDefaults(type)')+`
render=()=>{};
add('Label',0,0);add('Button',0,0);
const label=state.controls[0];Object.assign(label,{fontFamily:'Consolas',bold:true,italic:true,underline:true,transparent:true});
for(const version of ['2.0','3.0','4.0','5.1','7.0']){state.targetVersion=version;const code=generate();assert(code.includes('FontStyle]::Bold -bor'));assert(code.includes('Color]::Transparent'));assert(code.includes('BringToFront()'));assert(code.includes(Number(version)<5?'New-Object -TypeName System.Drawing.Font':'[System.Drawing.Font]::new'));}
reorderLayer(label.id,state.controls[1].id,false);assert.equal(state.controls[1].id,label.id);
assert(generate().indexOf('# Button')<generate().indexOf('# Label'));
const saved=JSON.parse(JSON.stringify(state));assert(validate(saved).controls[1].bold);assert.equal(saved.controls[1].fontFamily,'Consolas');
const old=JSON.parse(JSON.stringify(state));for(const c of [old.form,...old.controls])for(const k of ['fontFamily','bold','italic','underline','transparent'])delete c[k];validate(old);assert.equal(old.controls[0].fontFamily,'Segoe UI');assert.equal(old.controls[0].bold,false);
state.controls[0].transparent=true;validate(state);assert.equal(state.controls[0].transparent,false);
state=fresh();selectControl(null);add('Button',20,20);add('Label',200,80);add('TextBox',400,150);
selectControl(state.controls[0].id);selectControl(state.controls[1].id,true);selectControl(state.controls[2].id,true);
arrange('top');assert(chosen().every(c=>c.y===20));arrange('centerY');assert.equal(selectionBounds(chosen()).y,183);
arrange('left');assert(chosen().every(c=>c.x===20));arrange('width');assert(chosen().every(c=>c.w===210));
const ids=chosen().map(c=>c.id);duplicate();assert.equal(state.controls.length,6);assert.equal(chosen().length,3);remove();assert.equal(state.controls.length,3);
selectControl(state.controls[0].id);Object.assign(current(),{image:'data:image/png;base64,iVBORw0KGgo=',tooltip:"L'utilisateur",textAlign:'BottomRight'});
state.targetVersion='2.0';const ps=generate();assert(ps.includes('FromBase64String'));assert(ps.includes('New-Object -TypeName System.IO.MemoryStream'));assert(ps.includes("L''utilisateur"));assert(ps.includes('BottomRight'));assert(ps.includes('$StudioStream.Dispose()'));
const unsafe=structuredClone(state);unsafe.controls[0].image='javascript:alert(1)';assert.throws(()=>validate(unsafe));

`,ctx);console.log('PASS: 5 export targets, fonts, transparency, layers, legacy migration, multi-selection, alignment, duplication, embedded images, escaping');
