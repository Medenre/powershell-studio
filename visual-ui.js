'use strict';
(() => {
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const targets=()=>[state.form,...state.controls];
  let selectedTarget='MainForm';
  let selectedEvent='Load';
  const owner=()=>targets().find(item=>item.name===selectedTarget)||state.form;
  const eventList=()=>{const item=owner();item.visualEvents ||= {};item.visualEvents[selectedEvent] ||= [];return item.visualEvents[selectedEvent];};
  function findLocation(list,id){
    for(let i=0;i<list.length;i++){
      const step=list[i];
      if(step.id===id)return {list,index:i,step};
      for(const branch of VisualScripting.byKind[step.kind].branches||[]){
        const found=findLocation(step[branch],id);
        if(found)return found;
      }
    }
    return null;
  }
  const targetType=name=>name==='MainForm'?'Form':state.controls.find(c=>c.name===name)?.type||'Form';
  const option=(value,label,selected)=>`<option value="${escapeHtml(value)}" ${value===selected?'selected':''}>${escapeHtml(label)}</option>`;
  const targetOptions=value=>targets().map(item=>option(item.name,item.name==='MainForm'?'Fenêtre principale':`${item.name} · ${item.type}`,value)).join('')+(targets().some(item=>item.name===value)?'':option(value,`${value} (supprimé)`,value));
  function fieldHtml(step,[key,label,type]){
    const value=step[key]??'';
    let control;
    if(type==='target')control=`<select data-field="${key}">${targetOptions(value)}</select>`;
    else if(type==='property'||type==='booleanProperty'){
      const available=type==='booleanProperty'?['Enabled','Visible',...(targetType(step.target)==='CheckBox'||targetType(step.target)==='RadioButton'?['Checked']:[]),...(targetType(step.target)==='TextBox'?['ReadOnly']:[])]:VisualScripting.propertiesFor(targetType(step.target));
      control=`<select data-field="${key}">${available.map(item=>option(item,item,value)).join('')}${available.includes(value)?'':option(value,`${value} (incompatible)`,value)}</select>`;
    }else if(type==='mode')control=`<select data-field="${key}">${option('literal','Texte fixe',value)}${option('expression','Expression PowerShell',value)}</select>`;
    else if(type==='text'||type==='code')control=`<textarea data-field="${key}" ${type==='code'?'spellcheck="false"':''}>${escapeHtml(value)}</textarea>`;
    else control=`<input data-field="${key}" value="${escapeHtml(value)}" ${type==='expression'?'spellcheck="false"':''} ${type==='number'?'type="number" min="1" max="1000000"':'type="text"'}>`;
    return `<label class="vs-field"><span>${escapeHtml(label)}</span>${control}</label>`;
  }
  function kindPicker(){return `<select class="vs-kind-picker">${VisualScripting.definitions.map(def=>option(def.kind,`${def.group} · ${def.label}`,'' )).join('')}</select>`;}
  function renderList(list,depth=0){
    if(depth>9)return '';
    return list.map(step=>{
      const def=VisualScripting.byKind[step.kind];
      if(!def)return '';
      const branches=(def.branches||[]).map(branch=>`<div class="vs-branch"><div class="vs-branch-title">${escapeHtml(VisualScripting.branchLabel[branch])}</div>${renderList(step[branch],depth+1)}<div class="vs-add-nested">${kindPicker()}<button data-add-branch="${branch}" data-parent="${step.id}">+ Ajouter</button></div></div>`).join('');
      return `<article class="vs-block vs-${escapeHtml(def.group.toLowerCase())}" data-step-id="${escapeHtml(step.id)}"><div class="vs-block-head"><strong>${escapeHtml(def.label)}</strong><div><button data-move="up" title="Monter">↑</button><button data-move="down" title="Descendre">↓</button><button data-delete title="Supprimer">×</button></div></div><div class="vs-fields">${def.fields.map(field=>fieldHtml(step,field)).join('')}</div>${branches}</article>`;
    }).join('');
  }
  function render(){
    if(!targets().some(item=>item.name===selectedTarget))selectedTarget='MainForm';
    const allowed=VisualScripting.eventsFor(owner().type||'Form');
    if(!allowed.includes(selectedEvent))selectedEvent=allowed[0];
    $('visualTarget').innerHTML=targets().map(item=>option(item.name,item.name==='MainForm'?'Fenêtre principale':`${item.name} · ${item.type}`,selectedTarget)).join('');
    $('visualEvent').innerHTML=allowed.map(name=>option(name,name,selectedEvent)).join('');
    const blocks=eventList();
    $('visualBlocks').innerHTML=blocks.length?renderList(blocks):'<p class="vs-empty">Aucun bloc pour cet événement. Choisissez une action dans la colonne de gauche.</p>';
    const manual=owner().type==='Button'&&selectedEvent==='Click'&&owner().action;
    $('visualManual').textContent=manual?'Le code manuel du bouton est exécuté après ces blocs.':'Les blocs s’exécutent dans l’ordre, lors de cet événement.';
    updatePreview();
  }
  function updatePreview(){
    const blocks=eventList();
    const manual=owner().type==='Button'&&selectedEvent==='Click'&&owner().action;
    $('visualCode').textContent=`$${owner().name}.Add_${selectedEvent}({\n${VisualScripting.compileList(state,blocks).join('\n')}${manual?'\n    # Puis code manuel du bouton':''}\n})`;
  }
  function commit(){
    $('code').textContent=generate();persist();render();
  }
  $('visualTarget').onchange=e=>{selectedTarget=e.target.value;selectedEvent=VisualScripting.eventsFor(owner().type||'Form')[0];render();};
  $('visualEvent').onchange=e=>{selectedEvent=e.target.value;render();};
  $('visualPalette').innerHTML=[...new Set(VisualScripting.definitions.map(def=>def.group))].map(group=>`<div class="vs-palette-group"><h3>${escapeHtml(group)}</h3>${VisualScripting.definitions.filter(def=>def.group===group).map(def=>`<button data-add-kind="${def.kind}">+ ${escapeHtml(def.label)}</button>`).join('')}</div>`).join('');
  $('visualPalette').onclick=e=>{
    const button=e.target.closest('[data-add-kind]');if(!button)return;
    checkpoint();eventList().push(VisualScripting.createStep(button.dataset.addKind));commit();
  };
  $('visualBlocks').onclick=e=>{
    const nested=e.target.closest('[data-add-branch]');
    if(nested){
      const parent=findLocation(eventList(),nested.dataset.parent)?.step;
      if(!parent)return;
      const kind=nested.parentElement.querySelector('select').value;
      checkpoint();parent[nested.dataset.addBranch].push(VisualScripting.createStep(kind));commit();return;
    }
    const button=e.target.closest('[data-delete],[data-move]');
    if(!button)return;
    const location=findLocation(eventList(),button.closest('[data-step-id]').dataset.stepId);
    if(!location)return;
    checkpoint();
    if(button.hasAttribute('data-delete'))location.list.splice(location.index,1);
    else{const next=location.index+(button.dataset.move==='up'?-1:1);if(next>=0&&next<location.list.length){const [step]=location.list.splice(location.index,1);location.list.splice(next,0,step);}}
    commit();
  };
  $('visualBlocks').oninput=e=>{
    const field=e.target.closest('[data-field]');if(!field||field.tagName==='SELECT')return;
    const step=findLocation(eventList(),field.closest('[data-step-id]').dataset.stepId)?.step;if(!step)return;
    beginTextEdit(field);step[field.dataset.field]=field.value;
    scheduleTypingUpdate();updatePreview();
  };
  $('visualBlocks').onchange=e=>{
    const field=e.target.closest('select[data-field]');if(!field)return;
    const step=findLocation(eventList(),field.closest('[data-step-id]').dataset.stepId)?.step;if(!step)return;
    checkpoint();step[field.dataset.field]=field.value;
    if(field.dataset.field==='target'){
      const available=VisualScripting.propertiesFor(targetType(field.value));
      if(step.property&&!available.includes(step.property))step.property=available[0];
    }
    commit();
  };
  $('visualBlocks').addEventListener('focusout',finishTextEdit);
  window.VisualEditor={render,updatePreview};
})();
