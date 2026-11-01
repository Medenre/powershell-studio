'use strict';
const DiagnosticBlocks=typeof module!=='undefined'&&module.exports?require('./visual-core.js'):VisualScripting;
const StudioDiagnostics = (() => {
  const writers=new Set(['setVariable','increment','readProperty','readFile','chooseFile']);
  const required={repeat:['count','Nombre de répétitions','Repeat count'],foreach:['collection','Collection','Collection'],readFile:['path','Chemin','Path'],writeFile:['path','Chemin','Path'],startProcess:['value','Chemin ou URL','Path or URL']};
  function writesVariable(steps,name){
    return steps.some(step=>{
      if((writers.has(step.kind)||step.kind==='tryCatch'||step.kind==='repeat'||step.kind==='foreach')&&step.variable===name)return true;
      return (DiagnosticBlocks.byKind[step.kind]?.branches||[]).some(branch=>writesVariable(step[branch]||[],name));
    });
  }
  function inspect(project,language='fr'){
    const issues=[],targets=new Map([['MainForm','Form'],...project.controls.map(c=>[c.name,c.type])]);
    const tr=(fr,en)=>language==='en'?en:fr;
    const issue=(severity,message,owner,event,step)=>issues.push({severity,message,owner,event,stepId:step.id});
    const read=(name,known,owner,event,step)=>{
      if(name&&!known.has(name))issue('warning',tr(`La variable « ${name} » peut ne pas être définie à cet endroit.`,`The variable “${name}” may not be defined here.`),owner,event,step);
    };
    const expression=(value,known,owner,event,step)=>{
      for(const match of String(value||'').matchAll(/\$StudioVars\s*\[\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\s*\]/gi))read(match[1],known,owner,event,step);
    };
    function walk(steps,known,owner,event){
      let available=new Set(known);
      for(const step of steps){
        const kind=step.kind,need=required[kind];
        if(need&&!String(step[need[0]]||'').trim())issue('error',tr(`Renseignez le champ « ${need[1]} » du bloc.`,`Fill in the “${need[2]}” field in this block.`),owner,event,step);
        if(step.target){
          const type=targets.get(step.target);
          if(!type)issue('error',tr(`Le composant « ${step.target} » n’existe plus.`,`The component “${step.target}” no longer exists.`),owner,event,step);
          else if(step.property&&!DiagnosticBlocks.propertiesFor(type).includes(step.property))issue('error',tr(`La propriété « ${step.property} » n’est pas disponible sur ce composant.`,`The property “${step.property}” is not available on this component.`),owner,event,step);
        }
        if(kind==='if'||kind==='while'){
          if(step.conditionMode==='builder'){
            for(const row of step.conditions||[]){
              for(const side of ['left','right']){
                const source=row[side+'Source'];
                if(source==='variable')read(row[side+'Variable'],available,owner,event,step);
                if(source==='control'){
                  const target=row[side+'Target'],type=targets.get(target);
                  if(!type)issue('error',tr(`Le composant « ${target} » utilisé par la condition n’existe plus.`,`The component “${target}” used in the condition no longer exists.`),owner,event,step);
                  else if(!DiagnosticBlocks.propertiesFor(type).includes(row[side+'Property']))issue('error',tr(`La propriété « ${row[side+'Property']} » est incompatible avec « ${target} ».`,`The property “${row[side+'Property']}” cannot be used on “${target}”.`),owner,event,step);
                }
              }
            }
          }else if(!String(step.condition||'').trim())issue('error',tr('La condition PowerShell est vide.','The PowerShell condition is empty.'),owner,event,step);
          else expression(step.condition,available,owner,event,step);
        }
        if(kind==='increment')read(step.variable,available,owner,event,step);
        for(const key of ['count','collection','value','path','code']){
          if(key==='value'&&step.mode!=='expression')continue;
          if(key==='path'&&step.pathMode!=='expression'&&step.mode!=='expression')continue;
          if(key==='code'&&kind!=='raw')continue;
          expression(step[key],available,owner,event,step);
        }
        if(kind==='if'||kind==='confirm'){
          const left=walk(step[kind==='if'?'then':'yes']||[],available,owner,event);
          const right=walk(step[kind==='if'?'else':'no']||[],available,owner,event);
          available=new Set([...left].filter(name=>right.has(name)));
        }else if(kind==='tryCatch'){
          const body=walk(step.body||[],available,owner,event);
          const catchKnown=new Set([...available,step.variable]);
          const caught=walk(step.catch||[],catchKnown,owner,event);
          available=new Set([...body].filter(name=>caught.has(name)));
        }else if(kind==='repeat'||kind==='foreach'){
          walk(step.body||[],new Set([...available,step.variable]),owner,event);
        }else if(kind==='while'){
          if(!step.body?.length)issue('warning',tr('La boucle est vide ; elle s’arrêtera seulement à sa limite de tours.','This loop is empty and will stop only at its iteration limit.'),owner,event,step);
          else if(step.conditionMode==='builder')for(const row of step.conditions||[]){
            if(row.leftSource==='variable'&&!writesVariable(step.body,row.leftVariable))issue('warning',tr(`La variable « ${row.leftVariable} » ne change pas dans cette boucle ; vérifiez la condition.`,`The variable “${row.leftVariable}” does not change in this loop; check its condition.`),owner,event,step);
          }
          walk(step.body||[],available,owner,event);
        }
        if(writers.has(kind)&&step.variable)available.add(step.variable);
      }
      return available;
    }
    for(const owner of [project.form,...project.controls]){
      for(const event of DiagnosticBlocks.eventsFor(owner.type||'Form')){
        const steps=owner.visualEvents?.[event]||[];
        walk(steps,new Set(),owner.name||'MainForm',event);
      }
    }
    return issues;
  }
  return {inspect};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=StudioDiagnostics;
