'use strict';
const PowerShellSyntax = (() => {
  const keywords = new Set(['begin','break','catch','class','continue','data','do','dynamicparam','else','elseif','end','enum','exit','filter','finally','for','foreach','from','function','hidden','if','in','param','process','return','switch','throw','trap','try','until','using','while']);
  const operators = new Set(['-and','-as','-band','-bnot','-bor','-bxor','-contains','-eq','-f','-ge','-gt','-icontains','-ieq','-ige','-igt','-iin','-ile','-ilt','-imatch','-in','-ine','-inotcontains','-inotlike','-inotmatch','-is','-isnot','-join','-le','-like','-lt','-match','-ne','-not','-notcontains','-notin','-notlike','-notmatch','-or','-replace','-shl','-shr','-split','-xor']);
  const constants = new Set(['$true','$false','$null','$_','$this','$?']);
  const variable = /\$(?:\{[^}]*\}|[A-Za-z_?^][A-Za-z0-9_:]*|\d+)/y;
  const type = /\[[A-Za-z_][A-Za-z0-9_.]*\]/y;
  const number = /(?:0x[0-9a-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?:[kmgpt]b)?/iy;
  const dashWord = /-[A-Za-z][A-Za-z0-9_-]*/y;
  const word = /[A-Za-z_][A-Za-z0-9_-]*/y;
  function tokenize(source) {
    const result=[];
    const add=(kind,text)=>{
      if(!text)return;
      const last=result.at(-1);
      if(last&&last.kind===kind)last.text+=text;
      else result.push({kind,text});
    };
    const matchAt=(expression,index)=>{expression.lastIndex=index;return expression.exec(source)?.[0]||'';};
    let index=0;
    while(index<source.length){
      const start=index,ch=source[index],next=source[index+1];
      if(ch==='<'&&next==='#'){
        const end=source.indexOf('#>',index+2);
        index=end<0?source.length:end+2;
        add('comment',source.slice(start,index));continue;
      }
      if(ch==='#'){
        if(source.slice(index,index+9).toLowerCase()==='#requires'){
          index+=9;add('keyword',source.slice(start,index));continue;
        }
        const end=source.indexOf('\n',index);
        index=end<0?source.length:end;
        add('comment',source.slice(start,index));continue;
      }
      if(ch==='@'&&(next==='\''||next==='"')){
        const closing='\n'+next+'@';
        const end=source.indexOf(closing,index+2);
        index=end<0?source.length:end+closing.length;
        add('string',source.slice(start,index));continue;
      }
      if(ch==='\''||ch==='"'){
        const quote=ch;
        index++;
        while(index<source.length){
          if(source[index]==='`'&&quote==='"'){index+=Math.min(2,source.length-index);continue;}
          if(source[index]===quote){
            if(source[index+1]===quote){index+=2;continue;}
            index++;break;
          }
          index++;
        }
        add('string',source.slice(start,index));continue;
      }
      if(ch==='$'){
        const value=matchAt(variable,index);
        if(value){index+=value.length;add(constants.has(value.toLowerCase())?'constant':'variable',value);continue;}
      }
      if(ch==='['){
        const value=matchAt(type,index);
        if(value){index+=value.length;add('type',value);continue;}
      }
      if(/[0-9]/.test(ch)){
        const value=matchAt(number,index);
        if(value){index+=value.length;add('number',value);continue;}
      }
      if(ch==='-'){
        const value=matchAt(dashWord,index);
        if(value){index+=value.length;add(operators.has(value.toLowerCase())?'operator':'parameter',value);continue;}
      }
      if(/[A-Za-z_]/.test(ch)){
        const value=matchAt(word,index);
        if(value){
          index+=value.length;
          const previous=source[start-1]||'';
          const member=previous==='.'||(previous===':'&&source[start-2]===':');
          const kind=keywords.has(value.toLowerCase())?'keyword':member?(source[index]==='('? 'command':'property'):value.includes('-')?'command':'plain';
          add(kind,value);continue;
        }
      }
      index++;
      add('plain',ch);
    }
    return result;
  }
  function render(element,source){
    const fragment=document.createDocumentFragment();
    for(const token of tokenize(source)){
      if(token.kind==='plain')fragment.appendChild(document.createTextNode(token.text));
      else{
        const span=document.createElement('span');
        span.className='ps-token ps-token--'+token.kind;
        span.textContent=token.text;
        fragment.appendChild(span);
      }
    }
    element.replaceChildren(fragment);
  }
  return {tokenize,render};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=PowerShellSyntax;
