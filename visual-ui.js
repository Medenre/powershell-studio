'use strict';
(() => {
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const help={
    message:['Affiche une boîte de dialogue avec un message.','Shows a message dialog.'],
    confirm:['Pose une question et exécute la branche Oui ou Non.','Asks a question and runs the Yes or No branch.'],
    setText:['Remplace le texte du composant choisi.','Replaces the text of the selected component.'],
    appendText:['Ajoute du texte après le texte existant.','Appends text to the existing text.'],
    setProperty:['Modifie une propriété du composant choisi.','Changes a property of the selected component.'],
    toggle:['Inverse un état comme Visible ou Activé.','Toggles a state such as Visible or Enabled.'],
    readProperty:['Copie une propriété dans une variable visuelle.','Copies a property into a visual variable.'],
    setVariable:['Crée ou remplace une variable visuelle.','Creates or replaces a visual variable.'],
    increment:['Augmente une variable numérique du pas choisi.','Increases a numeric variable by the chosen amount.'],
    if:['Exécute Alors ou Sinon selon une condition créée avec les listes.','Runs Then or Else based on a condition built with the menus.'],
    repeat:['Répète les blocs de la branche Faire un nombre défini de fois.','Repeats the Do branch a specified number of times.'],
    foreach:['Exécute les blocs pour chaque élément d’une collection.','Runs the blocks for each item in a collection.'],
    while:['Répète la branche Faire tant que la condition est vraie, dans la limite fixée.','Repeats the Do branch while the condition is true, up to the set limit.'],
    tryCatch:['Exécute une action et traite une éventuelle erreur.','Runs an action and handles any error.'],
    delay:['Suspend le script pendant le nombre de millisecondes indiqué.','Pauses the script for the chosen number of milliseconds.'],
    writeOutput:['Envoie un texte ou une valeur dans la sortie PowerShell.','Writes text or a value to PowerShell output.'],
    startProcess:['Ouvre une URL, un document ou un programme.','Opens a URL, document, or program.'],
    readFile:['Lit un fichier UTF-8 et range son contenu dans une variable.','Reads a UTF-8 file into a variable.'],
    writeFile:['Écrit du texte ou une variable dans un fichier UTF-8.','Writes text or a variable to a UTF-8 file.'],
    chooseFile:['Demande à l’utilisateur de choisir un fichier.','Lets the user choose a file.'],
    closeForm:['Ferme la fenêtre créée par le script.','Closes the window created by the script.'],
    return:['Arrête les blocs de cet événement.','Stops the blocks for this event.'],
    raw:['Ajoute du code PowerShell pour un besoin particulier.','Adds custom PowerShell code for a specific need.']
  };
  const componentHelp={
    Form:['Fenêtre principale qui contient les composants et reçoit les événements d’ouverture et de fermeture.','Main window containing the components and receiving open and close events.'],
    Button:['Bouton qui lance des actions quand l’utilisateur clique dessus.','Button that runs actions when the user clicks it.'],
    Label:['Texte affiché dans la fenêtre, utile pour une information ou un résultat.','Text shown in the window for information or results.'],
    TextBox:['Zone dans laquelle l’utilisateur peut saisir du texte.','Field where the user can type text.'],
    CheckBox:['Case que l’utilisateur peut cocher ou décocher.','Box that the user can check or uncheck.'],
    RadioButton:['Choix à sélectionner parmi plusieurs options.','Choice to select among several options.'],
    ListBox:['Liste d’éléments parmi lesquels l’utilisateur choisit.','List of items from which the user chooses.'],
    ComboBox:['Liste déroulante permettant de choisir un élément.','Drop-down list for choosing an item.'],
    NumericUpDown:['Champ numérique avec flèches pour augmenter ou diminuer la valeur.','Numeric field with arrows to increase or decrease its value.'],
    DateTimePicker:['Champ permettant de choisir une date.','Field for choosing a date.'],
    ProgressBar:['Barre qui affiche une progression de 0 à 100.','Bar showing progress from 0 to 100.'],
    GroupBox:['Cadre visuel pour regrouper des éléments dans l’éditeur.','Visual frame for grouping items in the editor.'],
    Panel:['Zone visuelle pour organiser l’interface.','Visual area for organizing the interface.'],
    PictureBox:['Zone qui affiche une image.','Area that displays an image.']
  };
  const description=kind=>help[kind]?.[document.documentElement.lang==='en'?1:0]||'';
  const componentDescription=item=>componentHelp[item.type||'Form']?.[document.documentElement.lang==='en'?1:0]||'';
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
  const targetLabel=item=>item.name==='MainForm'
    ?(window.StudioI18n?.translate('Fenêtre principale')||'Fenêtre principale')
    :`${window.StudioI18n?.translate(types[item.type]?.[0]||item.type)||types[item.type]?.[0]||item.type} · ${(item.text||item.name).replace(/\s+/g,' ').slice(0,26)} (${item.name})`;
  const targetOption=(item,value)=>`<option data-i18n-skip value="${escapeHtml(item.name)}" ${item.name===value?'selected':''}>${escapeHtml(targetLabel(item))}</option>`;
  const targetOptions=value=>targets().map(item=>targetOption(item,value)).join('')+(targets().some(item=>item.name===value)?'':option(value,`${value} (supprimé)`,value));
  const propertyLabels={Text:'Texte',Enabled:'Activé',Visible:'Visible',BackColor:'Couleur de fond',ForeColor:'Couleur du texte',Width:'Largeur',Height:'Hauteur',Left:'Position X',Top:'Position Y',Tag:'Étiquette libre',ReadOnly:'Lecture seule',Checked:'Coché',SelectedIndex:'Choix sélectionné',Value:'Valeur'};
  const propertyLabel=name=>propertyLabels[name]||name;
  const propertyValueType=name=>['Checked','Enabled','Visible','ReadOnly'].includes(name)?'boolean':['Width','Height','Left','Top','SelectedIndex','Value'].includes(name)?'number':'text';
  const eventLabels={Load:'À l’ouverture',Shown:'Fenêtre affichée',FormClosing:'Avant fermeture',Click:'Au clic',DoubleClick:'Au double clic',TextChanged:'Texte modifié',CheckedChanged:'Case modifiée',SelectedIndexChanged:'Choix modifié',ValueChanged:'Valeur modifiée',MouseEnter:'Début du survol',MouseLeave:'Fin du survol',Enter:'Entrée dans le champ',Leave:'Sortie du champ',KeyDown:'Touche pressée'};
  function availableVariables(){
    const names=new Set();
    const visit=steps=>{for(const step of steps){
      if(VisualScripting.byKind[step.kind]?.fields.some(([key,,type])=>key==='variable'&&type==='variable')&&step.variable)names.add(step.variable);
      for(const branch of VisualScripting.byKind[step.kind]?.branches||[])visit(step[branch]||[]);
    }};
    for(const item of targets())for(const steps of Object.values(item.visualEvents||{}))visit(steps);
    return [...names].sort((a,b)=>a.localeCompare(b,'fr'));
  }
  const variableOptions=value=>{
    const names=availableVariables();
    return names.map(name=>option(name,name,value)).join('')+(names.includes(value)?'':option(value,`${value} (à définir)`,value));
  };
  const conditionField=(label,html)=>`<label class="vs-field"><span>${escapeHtml(label)}</span>${html}</label>`;
  const conditionSelect=(key,items,value)=>`<select data-condition-key="${key}">${items.map(([id,label])=>option(id,label,value)).join('')}</select>`;
  const propertyOptions=(target,value)=>{
    const names=VisualScripting.propertiesFor(targetType(target));
    return names.map(name=>option(name,propertyLabel(name),value)).join('')+(names.includes(value)?'':option(value,`${value} (incompatible)`,value));
  };
  function conditionRowHtml(row,index,total){
    const left=conditionField('Comparer',conditionSelect('leftSource',[['variable','Variable'],['control','Propriété d’un composant']],row.leftSource));
    const leftDetails=row.leftSource==='control'
      ?conditionField('Composant',`<select data-condition-key="leftTarget">${targetOptions(row.leftTarget)}</select>`)+conditionField('Propriété',`<select data-condition-key="leftProperty">${propertyOptions(row.leftTarget,row.leftProperty)}</select>`)
      :conditionField('Variable',`<select data-condition-key="leftVariable">${variableOptions(row.leftVariable)}</select>`);
    const operators=[['eq','est égal à'],['ne','est différent de'],['gt','est supérieur à'],['ge','est supérieur ou égal à'],['lt','est inférieur à'],['le','est inférieur ou égal à'],['contains','contient'],['notContains','ne contient pas']];
    const right=conditionField('Avec',conditionSelect('rightSource',[['literal','Valeur fixe'],['variable','Variable'],['control','Propriété d’un composant']],row.rightSource));
    const rightDetails=row.rightSource==='control'
      ?conditionField('Composant',`<select data-condition-key="rightTarget">${targetOptions(row.rightTarget)}</select>`)+conditionField('Propriété',`<select data-condition-key="rightProperty">${propertyOptions(row.rightTarget,row.rightProperty)}</select>`)
      :row.rightSource==='variable'?conditionField('Variable',`<select data-condition-key="rightVariable">${variableOptions(row.rightVariable)}</select>`)
      :conditionField('Valeur',row.valueType==='boolean'?conditionSelect('rightValue',[['true','Vrai'],['false','Faux']],row.rightValue):`<input data-condition-key="rightValue" type="${row.valueType==='number'?'number':'text'}" value="${escapeHtml(row.rightValue)}" ${row.valueType==='number'?'step="any"':''}>`);
    const join=index?conditionField('Lien',conditionSelect('join',[['and','ET'],['or','OU']],row.join)):'<span class="vs-condition-join">SI</span>';
    return `<div class="vs-condition-row" data-condition-index="${index}">${join}${left}${leftDetails}${conditionField('Comparaison',conditionSelect('operator',operators,row.operator))}${right}${conditionField('Type de valeur',conditionSelect('valueType',[['text','Texte'],['number','Nombre'],['boolean','Vrai / Faux']],row.valueType))}${rightDetails}${total>1?'<button type="button" data-condition-remove title="Retirer cette condition">Retirer</button>':''}</div>`;
  }
  function conditionEditorHtml(step){
    const mode=step.conditionMode||'code';
    const chooser=conditionField('Mode de condition',`<select data-condition-mode>${option('builder','Listes de choix (sans code)',mode)}${option('code','PowerShell avancé',mode)}</select>`);
    const content=mode==='builder'
      ?`<div class="vs-condition-list">${(step.conditions||[]).map((row,index,all)=>conditionRowHtml(row,index,all.length)).join('')}</div><button type="button" data-condition-add ${step.conditions?.length>=12?'disabled':''}>+ Ajouter une condition (ET / OU)</button><p class="vs-condition-help">Les variables proposées viennent des autres blocs. Pour en créer une, ajoutez « Définir une variable » avant cette condition.</p>`
      :fieldHtml(step,['condition','Condition PowerShell','expression']);
    return `<div class="vs-condition-editor">${chooser}${content}${step.kind==='while'?fieldHtml(step,['limit','Nombre maximal de tours','number']):''}</div>`;
  }
  function fieldHtml(step,[key,label,type]){
    const value=step[key]??'';
    let control;
    if(type==='target')control=`<select data-field="${key}">${targetOptions(value)}</select>`;
    else if(type==='property'||type==='booleanProperty'){
      const available=type==='booleanProperty'?['Enabled','Visible',...(targetType(step.target)==='CheckBox'||targetType(step.target)==='RadioButton'?['Checked']:[]),...(targetType(step.target)==='TextBox'?['ReadOnly']:[])]:VisualScripting.propertiesFor(targetType(step.target));
      control=`<select data-field="${key}">${available.map(item=>option(item,propertyLabel(item),value)).join('')}${available.includes(value)?'':option(value,`${value} (incompatible)`,value)}</select>`;
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
      const fields=['if','while'].includes(step.kind)?conditionEditorHtml(step):`<div class="vs-fields">${def.fields.map(field=>fieldHtml(step,field)).join('')}</div>`;
      return `<article class="vs-block vs-${escapeHtml(def.group.toLowerCase())}" data-step-id="${escapeHtml(step.id)}"><div class="vs-block-head"><strong>${escapeHtml(def.label)}</strong><div><button type="button" data-help-kind="${step.kind}" title="${escapeHtml(description(step.kind))}" aria-label="${escapeHtml(description(step.kind))}">ⓘ</button><button data-move="up" title="Monter">↑</button><button data-move="down" title="Descendre">↓</button><button data-delete title="Supprimer">×</button></div></div>${fields}${branches}</article>`;
    }).join('');
  }
  function render(){
    if(!targets().some(item=>item.name===selectedTarget))selectedTarget='MainForm';
    const allowed=VisualScripting.eventsFor(owner().type||'Form');
    if(!allowed.includes(selectedEvent))selectedEvent=allowed[0];
    $('visualTarget').innerHTML=targets().map(item=>targetOption(item,selectedTarget)).join('');
    $('visualTarget').title=componentDescription(owner());
    $('visualTargetHelp').title=componentDescription(owner());
    $('visualTargetHelp').setAttribute('aria-label',componentDescription(owner()));
    $('visualEvent').innerHTML=allowed.map(name=>option(name,`${eventLabels[name]||name} (${name})`,selectedEvent)).join('');
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
    renderCode();persist();render();
  }
  $('visualTarget').onchange=e=>{selectedTarget=e.target.value;selectedEvent=VisualScripting.eventsFor(owner().type||'Form')[0];render();};
  $('visualTargetHelp').onclick=()=>toast(componentDescription(owner()));
  $('visualEvent').onchange=e=>{selectedEvent=e.target.value;render();};
  function renderPalette(){
    $('visualPalette').innerHTML=[...new Set(VisualScripting.definitions.map(def=>def.group))].map(group=>`<div class="vs-palette-group"><h3>${escapeHtml(group)}</h3>${VisualScripting.definitions.filter(def=>def.group===group).map(def=>`<div class="vs-palette-item"><button data-add-kind="${def.kind}" title="${escapeHtml(description(def.kind))}">+ ${escapeHtml(def.label)}</button><button type="button" data-help-kind="${def.kind}" class="vs-help-button" title="${escapeHtml(description(def.kind))}" aria-label="${escapeHtml(description(def.kind))}">ⓘ</button></div>`).join('')}</div>`).join('');
  }
  renderPalette();
  $('visualPalette').onclick=e=>{
    const helpButton=e.target.closest('[data-help-kind]');if(helpButton){toast(description(helpButton.dataset.helpKind));return;}
    const button=e.target.closest('[data-add-kind]');if(!button)return;
    checkpoint();eventList().push(VisualScripting.createStep(button.dataset.addKind));commit();
  };
  $('visualBlocks').onclick=e=>{
    const helpButton=e.target.closest('[data-help-kind]');if(helpButton){toast(description(helpButton.dataset.helpKind));return;}
    const addCondition=e.target.closest('[data-condition-add]');
    if(addCondition){
      const step=findLocation(eventList(),addCondition.closest('[data-step-id]').dataset.stepId)?.step;
      if(!step||step.conditions.length>=12)return;
      checkpoint();step.conditions.push(VisualScripting.defaultCondition(step.kind));commit();return;
    }
    const removeCondition=e.target.closest('[data-condition-remove]');
    if(removeCondition){
      const step=findLocation(eventList(),removeCondition.closest('[data-step-id]').dataset.stepId)?.step;
      if(!step||step.conditions.length<=1)return;
      checkpoint();step.conditions.splice(Number(removeCondition.closest('[data-condition-index]').dataset.conditionIndex),1);commit();return;
    }
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
    const conditionField=e.target.closest('input[data-condition-key]');
    if(conditionField){
      const step=findLocation(eventList(),conditionField.closest('[data-step-id]').dataset.stepId)?.step;
      const row=step?.conditions?.[Number(conditionField.closest('[data-condition-index]').dataset.conditionIndex)];
      if(!row)return;
      beginTextEdit(conditionField);row[conditionField.dataset.conditionKey]=conditionField.value;
      scheduleTypingUpdate();updatePreview();return;
    }
    const field=e.target.closest('[data-field]');if(!field||field.tagName==='SELECT')return;
    const step=findLocation(eventList(),field.closest('[data-step-id]').dataset.stepId)?.step;if(!step)return;
    beginTextEdit(field);step[field.dataset.field]=field.value;
    scheduleTypingUpdate();updatePreview();
  };
  $('visualBlocks').onchange=e=>{
    const modeField=e.target.closest('select[data-condition-mode]');
    if(modeField){
      const step=findLocation(eventList(),modeField.closest('[data-step-id]').dataset.stepId)?.step;
      if(!step)return;
      checkpoint();step.conditionMode=modeField.value;
      if(step.conditionMode==='builder'&&!step.conditions?.length)step.conditions=[VisualScripting.defaultCondition(step.kind)];
      commit();return;
    }
    const conditionField=e.target.closest('select[data-condition-key]');
    if(conditionField){
      const step=findLocation(eventList(),conditionField.closest('[data-step-id]').dataset.stepId)?.step;
      const row=step?.conditions?.[Number(conditionField.closest('[data-condition-index]').dataset.conditionIndex)];
      if(!row)return;
      checkpoint();const key=conditionField.dataset.conditionKey;row[key]=conditionField.value;
      if(key==='leftTarget')row.leftProperty=VisualScripting.propertiesFor(targetType(row.leftTarget))[0];
      if(key==='rightTarget')row.rightProperty=VisualScripting.propertiesFor(targetType(row.rightTarget))[0];
      if(row.leftSource==='control'&&['leftSource','leftTarget','leftProperty'].includes(key))row.valueType=propertyValueType(row.leftProperty);
      if(key==='valueType'){
        if(row.valueType==='boolean'&&!['true','false'].includes(row.rightValue))row.rightValue='true';
        if(row.valueType==='number'&&!/^-?\d+(?:\.\d+)?$/.test(row.rightValue))row.rightValue='0';
      }
      if(row.rightSource==='literal'&&row.valueType==='boolean'&&!['true','false'].includes(row.rightValue))row.rightValue='true';
      if(row.rightSource==='literal'&&row.valueType==='number'&&!/^-?\d+(?:\.\d+)?$/.test(row.rightValue))row.rightValue='0';
      commit();return;
    }
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
  window.VisualEditor={render,renderPalette,updatePreview};
})();
