'use strict';
(() => {
  const palettes=[
    ['violet','Violet','#6655d9','#ab9aff'],['ocean','Océan','#1570bd','#74beff'],
    ['emerald','Émeraude','#138369','#6bdbb6'],['sunset','Coucher de soleil','#b95726','#ffab76'],
    ['rose','Rose','#b34478','#f4a0c4'],['amber','Ambre','#906300','#f1cc6a'],
    ['teal','Turquoise','#087d90','#6ad7d7'],['slate','Ardoise','#4b6687','#b8cae5']
  ];
  const root=document.documentElement;
  let palette='violet',accent='';
  try{
    const stored=localStorage.getItem('ps-studio-palette');
    if(palettes.some(item=>item[0]===stored))palette=stored;
    const color=localStorage.getItem('ps-studio-accent');
    if(/^#[0-9a-f]{6}$/i.test(color||''))accent=color;
  }catch{}
  const current=()=>palettes.find(item=>item[0]===palette);
  function apply(){
    root.dataset.palette=palette;
    if(accent)root.style.setProperty('--accent',accent);
    else root.style.removeProperty('--accent');
    $('settingsMode').value=root.dataset.theme;
    $('settingsAccent').value=accent||current()[root.dataset.theme==='dark'?3:2];
    document.querySelectorAll('[data-palette-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.paletteChoice===palette)));
  }
  $('settingsPalettes').innerHTML=palettes.map(([id,label,light,dark])=>`<button type="button" class="settings-palette" data-palette-choice="${id}" aria-pressed="false" title="${label} : version claire et sombre"><span class="settings-swatch" style="--swatch:${light}"></span><span class="settings-swatch" style="--swatch:${dark}"></span>${label}</button>`).join('');
  $('settingsPalettes').onclick=e=>{
    const button=e.target.closest('[data-palette-choice]');if(!button)return;
    palette=button.dataset.paletteChoice;accent='';
    try{localStorage.setItem('ps-studio-palette',palette);localStorage.removeItem('ps-studio-accent');}catch{}
    apply();
  };
  $('settingsMode').onchange=e=>{setTheme(e.target.value==='dark');apply();};
  $('settingsAccent').oninput=e=>{
    accent=e.target.value;
    try{localStorage.setItem('ps-studio-accent',accent);}catch{}
    apply();
  };
  $('settingsReset').onclick=()=>{accent='';try{localStorage.removeItem('ps-studio-accent');}catch{}apply();};
  $('settings').onclick=()=>{$('settingsDialog').showModal();apply();};
  $('closeSettings').onclick=()=>$('settingsDialog').close();
  apply();
})();
