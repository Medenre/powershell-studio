'use strict';
const VisualScripting = (() => {
  const events = {
    Form: ['Load', 'Shown', 'FormClosing'],
    Button: ['Click', 'MouseEnter', 'MouseLeave'],
    TextBox: ['TextChanged', 'Enter', 'Leave', 'KeyDown'],
    CheckBox: ['CheckedChanged', 'Click'],
    RadioButton: ['CheckedChanged', 'Click'],
    ComboBox: ['SelectedIndexChanged', 'Click'],
    ListBox: ['SelectedIndexChanged', 'DoubleClick'],
    NumericUpDown: ['ValueChanged'],
    DateTimePicker: ['ValueChanged'],
    ProgressBar: ['Click'],
    Label: ['Click', 'MouseEnter', 'MouseLeave'],
    GroupBox: ['Click'],
    Panel: ['Click'],
    PictureBox: ['Click', 'DoubleClick']
  };
  const commonProperties = ['Text', 'Enabled', 'Visible', 'BackColor', 'ForeColor', 'Width', 'Height', 'Left', 'Top', 'Tag'];
  const specificProperties = {
    TextBox: ['ReadOnly'], CheckBox: ['Checked'], RadioButton: ['Checked'],
    ComboBox: ['SelectedIndex'], ListBox: ['SelectedIndex'],
    NumericUpDown: ['Value'], DateTimePicker: ['Value'], ProgressBar: ['Value']
  };
  const propertiesFor = type => [...commonProperties, ...(specificProperties[type] || [])];
  const definitions = [
    {kind:'message',label:'Afficher un message',group:'Interface',fields:[['value','Message','text'],['mode','Valeur','mode']]},
    {kind:'confirm',label:'Demander confirmation',group:'Interface',fields:[['value','Question','text'],['mode','Valeur','mode']],branches:['yes','no']},
    {kind:'setText',label:'Changer un texte',group:'Composants',fields:[['target','Composant','target'],['value','Nouveau texte','text'],['mode','Valeur','mode']]},
    {kind:'appendText',label:'Ajouter du texte',group:'Composants',fields:[['target','Composant','target'],['value','Texte à ajouter','text'],['mode','Valeur','mode']]},
    {kind:'setProperty',label:'Modifier une propriété',group:'Composants',fields:[['target','Composant','target'],['property','Propriété','property'],['value','Valeur','text'],['mode','Valeur','mode']]},
    {kind:'toggle',label:'Inverser un état',group:'Composants',fields:[['target','Composant','target'],['property','État','booleanProperty']]},
    {kind:'readProperty',label:'Lire une propriété',group:'Composants',fields:[['target','Composant','target'],['property','Propriété','property'],['variable','Variable','variable']]},
    {kind:'setVariable',label:'Définir une variable',group:'Variables',fields:[['variable','Nom','variable'],['value','Valeur','text'],['mode','Valeur','mode']]},
    {kind:'increment',label:'Incrémenter une variable',group:'Variables',fields:[['variable','Nom','variable'],['value','Pas','text'],['mode','Valeur','mode']]},
    {kind:'if',label:'Condition Si / Sinon',group:'Logique',fields:[['condition','Condition PowerShell','expression']],branches:['then','else']},
    {kind:'repeat',label:'Répéter N fois',group:'Boucles',fields:[['count','Nombre de répétitions','expression'],['variable','Compteur dans $StudioVars','variable']],branches:['body']},
    {kind:'foreach',label:'Pour chaque élément',group:'Boucles',fields:[['collection','Collection PowerShell','expression'],['variable','Élément dans $StudioVars','variable']],branches:['body']},
    {kind:'while',label:'Tant que',group:'Boucles',fields:[['condition','Condition PowerShell','expression'],['limit','Limite de répétitions','number']],branches:['body']},
    {kind:'tryCatch',label:'Essayer / Gérer une erreur',group:'Logique',fields:[['variable','Erreur dans $StudioVars','variable']],branches:['body','catch']},
    {kind:'delay',label:'Attendre',group:'Actions',fields:[['value','Millisecondes','expression']]},
    {kind:'writeOutput',label:'Écrire une sortie',group:'Actions',fields:[['value','Texte ou expression','text'],['mode','Valeur','mode']]},
    {kind:'startProcess',label:'Ouvrir un fichier ou URL',group:'Actions',fields:[['value','Chemin ou URL','text'],['mode','Valeur','mode']]},
    {kind:'readFile',label:'Lire un fichier UTF-8',group:'Fichiers',fields:[['variable','Variable','variable'],['path','Chemin','text'],['mode','Chemin','mode']]},
    {kind:'writeFile',label:'Écrire un fichier UTF-8',group:'Fichiers',fields:[['path','Chemin','text'],['pathMode','Chemin','mode'],['value','Contenu','text'],['mode','Contenu','mode']]},
    {kind:'chooseFile',label:'Choisir un fichier',group:'Fichiers',fields:[['variable','Variable','variable'],['filter','Filtre','text']]},
    {kind:'closeForm',label:'Fermer la fenêtre',group:'Interface',fields:[]},
    {kind:'return',label:'Arrêter cet événement',group:'Logique',fields:[]},
    {kind:'raw',label:'Code PowerShell libre',group:'Avancé',fields:[['code','Code','code']]}
  ];
  const byKind = Object.fromEntries(definitions.map(def => [def.kind, def]));
  const conditionKinds = ['if','while'];
  const conditionSources = ['variable','control','literal'];
  const conditionOperators = ['eq','ne','gt','ge','lt','le','contains','notContains'];
  const conditionTypes = ['text','number','boolean'];
  const defaultCondition = kind => ({
    join:'and',leftSource:'variable',leftVariable:kind==='while'?'continuer':'compteur',
    leftTarget:'MainForm',leftProperty:'Text',operator:kind==='while'?'eq':'gt',
    rightSource:'literal',rightValue:kind==='while'?'true':'5',valueType:kind==='while'?'boolean':'number',
    rightVariable:'valeur',rightTarget:'MainForm',rightProperty:'Text'
  });
  const defaults = {
    message:{value:'Bonjour !',mode:'literal'}, confirm:{value:'Continuer ?',mode:'literal'},
    setText:{target:'MainForm',value:'Nouveau texte',mode:'literal'},
    appendText:{target:'MainForm',value:' texte',mode:'literal'},
    setProperty:{target:'MainForm',property:'Text',value:'Nouveau texte',mode:'literal'},
    toggle:{target:'MainForm',property:'Visible'},
    readProperty:{target:'MainForm',property:'Text',variable:'valeur'},
    setVariable:{variable:'valeur',value:'0',mode:'literal'},
    increment:{variable:'compteur',value:'1',mode:'literal'},
    if:{condition:'$StudioVars[\'compteur\'] -gt 5'},
    repeat:{count:'10',variable:'i'},
    foreach:{collection:'$ctrl_ListBox1.Items',variable:'element'},
    while:{condition:'$StudioVars[\'continuer\']',limit:'1000'},
    tryCatch:{variable:'erreur'},delay:{value:'500'},
    writeOutput:{value:'Terminé',mode:'literal'},
    startProcess:{value:'https://example.com',mode:'literal'},
    readFile:{variable:'contenu',path:'C:\\temp\\exemple.txt',mode:'literal'},
    writeFile:{path:'C:\\temp\\exemple.txt',pathMode:'literal',value:'Bonjour',mode:'literal'},
    chooseFile:{variable:'fichier',filter:'Tous les fichiers (*.*)|*.*'},
    closeForm:{},return:{},raw:{code:'# Votre code PowerShell'}
  };
  let nextId = 0;
  const createStep = kind => {
    const def = byKind[kind];
    if(!def) throw Error('Bloc inconnu');
    const step = {id:`block_${Date.now().toString(36)}_${++nextId}`,kind,...defaults[kind]};
    if(conditionKinds.includes(kind)){step.conditionMode='builder';step.conditions=[defaultCondition(kind)];}
    for(const branch of def.branches || []) step[branch]=[];
    return step;
  };
  const eventsFor = type => events[type] || ['Click'];
  function normalizeEvents(owner, budget){
    const source=owner.visualEvents;
    if(source===undefined){owner.visualEvents={};return;}
    if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Événements visuels invalides');
    const result={};
    function list(items,depth){
      if(!Array.isArray(items)||depth>8||items.length>100)throw Error('Blocs visuels invalides');
      return items.map(item=>{
        if(!item||typeof item!=='object'||Array.isArray(item)||!Object.hasOwn(byKind,item.kind)||++budget.count>500)throw Error('Bloc visuel invalide');
        const def=byKind[item.kind],step={id:`block_${budget.count}`,kind:item.kind};
        for(const [key,,type] of def.fields){
          const value=item[key]===undefined?defaults[item.kind][key]:item[key];
          if(typeof value!=='string'||value.length>(type==='code'?100000:5000))throw Error('Paramètre de bloc invalide');
          if(type==='variable'&&!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value))throw Error('Nom de variable invalide');
          if(type==='target'&&!/^(MainForm|ctrl_[A-Za-z0-9_]+)$/.test(value))throw Error('Composant de bloc invalide');
          if(type==='mode'&&!['literal','expression'].includes(value))throw Error('Mode de bloc invalide');
          if(type==='property'&&!commonProperties.concat(Object.values(specificProperties).flat()).includes(value))throw Error('Propriété de bloc invalide');
          if(type==='booleanProperty'&&!['Enabled','Visible','Checked','ReadOnly'].includes(value))throw Error('État de bloc invalide');
          if(type==='number'&&(!/^\d+$/.test(value)||Number(value)>1000000))throw Error('Limite de boucle invalide');
          step[key]=value;
        }
        if(conditionKinds.includes(item.kind)){
          step.conditionMode=item.conditionMode===undefined?'code':item.conditionMode;
          if(!['builder','code'].includes(step.conditionMode))throw Error('Mode de condition invalide');
          if(step.conditionMode==='builder'){
            if(!Array.isArray(item.conditions)||!item.conditions.length||item.conditions.length>12)throw Error('Conditions visuelles invalides');
            step.conditions=item.conditions.map(row=>{
              if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Condition visuelle invalide');
              const clean={...defaultCondition(item.kind)};
              for(const key of Object.keys(clean)){
                if(row[key]!==undefined)clean[key]=row[key];
                if(typeof clean[key]!=='string'||clean[key].length>1000)throw Error('Valeur de condition invalide');
              }
              if(!['and','or'].includes(clean.join)||!['variable','control'].includes(clean.leftSource)
                ||!conditionSources.includes(clean.rightSource)||!conditionOperators.includes(clean.operator)
                ||!conditionTypes.includes(clean.valueType))throw Error('Choix de condition invalide');
              for(const key of ['leftVariable','rightVariable'])if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(clean[key]))throw Error('Variable de condition invalide');
              for(const key of ['leftTarget','rightTarget'])if(!/^(MainForm|ctrl_[A-Za-z0-9_]+)$/.test(clean[key]))throw Error('Composant de condition invalide');
              for(const key of ['leftProperty','rightProperty'])if(!commonProperties.concat(Object.values(specificProperties).flat()).includes(clean[key]))throw Error('Propriété de condition invalide');
              if(clean.rightSource==='literal'&&clean.valueType==='number'&&!/^-?\d+(?:\.\d+)?$/.test(clean.rightValue))clean.rightValue='0';
              if(clean.rightSource==='literal'&&clean.valueType==='boolean'&&!['true','false'].includes(clean.rightValue))clean.rightValue='false';
              return clean;
            });
          }
        }
        for(const branch of def.branches||[])step[branch]=list(item[branch]||[],depth+1);
        return step;
      });
    }
    for(const event of eventsFor(owner.type||'Form'))if(source[event]!==undefined)result[event]=list(source[event],0);
    owner.visualEvents=result;
  }
  const quote=value=>"'"+String(value).replace(/'/g,"''")+"'";
  const expr=(value,mode)=>mode==='expression'?`(${value.trim()||'$null'})`:quote(value);
  const targetRef=(project,name)=>name==='MainForm'?'$MainForm':project.controls.some(c=>c.name===name)?`$${name}`:null;
  const variableRef=name=>`$StudioVars[${quote(name)}]`;
  const branchLabel={then:'Alors',else:'Sinon',yes:'Si oui',no:'Si non',body:'Faire',catch:'En cas d’erreur'};
  function compileCondition(project,step){
    if(step.conditionMode!=='builder')return step.condition||'$false';
    const operand=(row,side)=>{
      const source=row[`${side}Source`];
      if(source==='variable')return variableRef(row[`${side}Variable`]);
      if(source==='control'){
        const target=targetRef(project,row[`${side}Target`]);
        return target?`${target}.${row[`${side}Property`]}`:'$null';
      }
      if(row.valueType==='boolean')return row.rightValue==='true'?'$true':'$false';
      if(row.valueType==='number')return /^-?\d+(?:\.\d+)?$/.test(row.rightValue)?row.rightValue:'0';
      return quote(row.rightValue);
    };
    const cast=(value,type)=>type==='number'?`[double](${value})`:type==='boolean'?`([string](${value}) -ieq 'true')`:`[string](${value})`;
    const operators={eq:'-eq',ne:'-ne',gt:'-gt',ge:'-ge',lt:'-lt',le:'-le'};
    const rows=step.conditions||[];
    let result='';
    for(const row of rows){
      const left=operand(row,'left'),right=operand(row,'right');
      let current;
      if(row.operator==='contains'||row.operator==='notContains'){
        current=`(${cast(left,'text')}).IndexOf(${cast(right,'text')}, [System.StringComparison]::OrdinalIgnoreCase) ${row.operator==='contains'?'-ge':'-lt'} 0`;
      }else current=`${cast(left,row.valueType)} ${operators[row.operator]||'-eq'} ${cast(right,row.valueType)}`;
      result=result?`(${result} ${row.join==='or'?'-or':'-and'} (${current}))`:`(${current})`;
    }
    return result||'$false';
  }
  function compileList(project,steps,depth=1){
    const lines=[],pad='    '.repeat(depth);
    for(const step of steps){
      const target=step.target?targetRef(project,step.target):null;
      const value=()=>expr(step.value||'',step.mode);
      const v=()=>variableRef(step.variable);
      const nested=(items)=>compileList(project,items,depth+1);
      const safeId=String(step.id).replace(/[^A-Za-z0-9_]/g,'_');
      if(step.target&&!target){lines.push(`${pad}# Composant absent : ${step.target}`);continue;}
      switch(step.kind){
        case 'message':lines.push(`${pad}[void][System.Windows.Forms.MessageBox]::Show([string]${value()})`);break;
        case 'confirm':lines.push(`${pad}if ([System.Windows.Forms.MessageBox]::Show([string]${value()}, 'Confirmation', 'YesNo') -eq 'Yes') {`,...nested(step.yes),`${pad}} else {`,...nested(step.no),`${pad}}`);break;
        case 'setText':lines.push(`${pad}${target}.Text = [string]${value()}`);break;
        case 'appendText':lines.push(`${pad}${target}.Text += [string]${value()}`);break;
        case 'setProperty':{
          let rhs=value();
          if(['Enabled','Visible','Checked','ReadOnly'].includes(step.property))rhs=step.mode==='literal'?(step.value==='true'?'$true':'$false'):`[bool]${rhs}`;
          else if(['BackColor','ForeColor'].includes(step.property))rhs=`[System.Drawing.ColorTranslator]::FromHtml([string]${rhs})`;
          else if(['Width','Height','Left','Top','SelectedIndex'].includes(step.property))rhs=`[int]${rhs}`;
          lines.push(`${pad}${target}.${step.property} = ${rhs}`);break;
        }
        case 'toggle':lines.push(`${pad}${target}.${step.property} = -not ${target}.${step.property}`);break;
        case 'readProperty':lines.push(`${pad}${v()} = ${target}.${step.property}`);break;
        case 'setVariable':lines.push(`${pad}${v()} = ${value()}`);break;
        case 'increment':lines.push(`${pad}${v()} = [int]${v()} + [int]${value()}`);break;
        case 'if':lines.push(`${pad}if (${compileCondition(project,step)}) {`,...nested(step.then),`${pad}} else {`,...nested(step.else),`${pad}}`);break;
        case 'repeat':lines.push(`${pad}$StudioCount_${safeId} = [Math]::Max(0, [int](${step.count||'0'}))`,`${pad}for ($StudioIndex_${safeId} = 0; $StudioIndex_${safeId} -lt $StudioCount_${safeId}; $StudioIndex_${safeId}++) {`,`${pad}    ${v()} = $StudioIndex_${safeId}`,...nested(step.body),`${pad}}`);break;
        case 'foreach':lines.push(`${pad}foreach ($StudioItem_${safeId} in (${step.collection||'@()'})) {`,`${pad}    ${v()} = $StudioItem_${safeId}`,...nested(step.body),`${pad}}`);break;
        case 'while':lines.push(`${pad}$StudioGuard_${safeId} = 0`,`${pad}while ((${compileCondition(project,step)}) -and ($StudioGuard_${safeId} -lt ${step.limit})) {`,`${pad}    $StudioGuard_${safeId}++`,...nested(step.body),`${pad}}`);break;
        case 'tryCatch':lines.push(`${pad}try {`,...nested(step.body),`${pad}} catch {`,`${pad}    ${v()} = $_.Exception.Message`,...nested(step.catch),`${pad}}`);break;
        case 'delay':lines.push(`${pad}Start-Sleep -Milliseconds ([Math]::Max(0, [int](${step.value||'0'})))`);break;
        case 'writeOutput':lines.push(`${pad}Write-Output ${value()}`);break;
        case 'startProcess':lines.push(`${pad}Start-Process -FilePath ([string]${value()})`);break;
        case 'readFile':lines.push(`${pad}${v()} = [System.IO.File]::ReadAllText([string]${expr(step.path,step.mode)}, [System.Text.Encoding]::UTF8)`);break;
        case 'writeFile':lines.push(`${pad}[System.IO.File]::WriteAllText([string]${expr(step.path,step.pathMode)}, [string]${value()}, [System.Text.Encoding]::UTF8)`);break;
        case 'chooseFile':{
          const dialog=`$StudioFileDialog_${safeId}`;
          lines.push(`${pad}${dialog} = New-Object -TypeName System.Windows.Forms.OpenFileDialog`,`${pad}${dialog}.Filter = ${quote(step.filter)}`,`${pad}try {`,`${pad}    if (${dialog}.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { ${v()} = ${dialog}.FileName }`,`${pad}} finally { ${dialog}.Dispose() }`);break;
        }
        case 'closeForm':lines.push(`${pad}$MainForm.Close()`);break;
        case 'return':lines.push(`${pad}return`);break;
        case 'raw':lines.push(...(step.code||'').split(/\r?\n/).map(line=>pad+line));break;
      }
    }
    return lines;
  }
  function compileHandlers(project){
    const lines=['$StudioVars = @{}',''];
    for(const owner of [project.form,...project.controls]){
      const name=owner===project.form?'MainForm':owner.name;
      for(const event of eventsFor(owner.type||'Form')){
        const blocks=owner.visualEvents?.[event]||[];
        const manual=event==='Click'&&owner.type==='Button'?owner.action:'';
        if(!blocks.length&&!manual&&!(owner.type==='Button'&&event==='Click'))continue;
        lines.push(`$${name}.Add_${event}({`);
        if(blocks.length)lines.push(...compileList(project,blocks));
        if(manual)lines.push(...manual.split(/\r?\n/).map(line=>'    '+line));
        if(!blocks.length&&!manual)lines.push('    # Ajoutez votre action PowerShell ici');
        lines.push('})','');
      }
    }
    return lines;
  }
  function renameTarget(project,oldName,newName){
    function visit(steps){
      for(const step of steps){
        if(step.target===oldName)step.target=newName;
        if(step.conditionMode==='builder')for(const row of step.conditions||[]){
          if(row.leftTarget===oldName)row.leftTarget=newName;
          if(row.rightTarget===oldName)row.rightTarget=newName;
        }
        for(const branch of byKind[step.kind]?.branches||[])visit(step[branch]||[]);
      }
    }
    for(const owner of [project.form,...project.controls]){
      for(const steps of Object.values(owner.visualEvents||{}))visit(steps);
    }
  }
  return {eventsFor,propertiesFor,definitions,byKind,branchLabel,createStep,defaultCondition,normalizeEvents,compileCondition,compileList,compileHandlers,renameTarget};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=VisualScripting;
