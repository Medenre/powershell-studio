'use strict';
const StudioStorage = (() => {
  const key='ps-studio', modeKey='ps-studio-storage', largeAt=2_000_000;
  let databasePromise;
  function database(){
    if(databasePromise)return databasePromise;
    databasePromise=new Promise((resolve,reject)=>{
      if(!globalThis.indexedDB){reject(Error('IndexedDB indisponible'));return;}
      const request=indexedDB.open('powershell-studio',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('projects');
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||Error('IndexedDB indisponible'));
      request.onblocked=()=>reject(Error('IndexedDB bloqué par un autre onglet'));
    });
    return databasePromise;
  }
  async function readLarge(){
    const db=await database();
    return new Promise((resolve,reject)=>{
      const request=db.transaction('projects','readonly').objectStore('projects').get(key);
      request.onsuccess=()=>resolve(request.result||null);
      request.onerror=()=>reject(request.error||Error('Lecture impossible'));
    });
  }
  async function writeLarge(content){
    const db=await database();
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction('projects','readwrite');
      transaction.objectStore('projects').put(content,key);
      transaction.oncomplete=()=>resolve();
      transaction.onerror=()=>reject(transaction.error||Error('Écriture impossible'));
      transaction.onabort=()=>reject(transaction.error||Error('Écriture interrompue'));
    });
  }
  async function load(){
    let small=null,mode=null;
    try{small=localStorage.getItem(key);mode=localStorage.getItem(modeKey);}catch{}
    if(mode!=='idb'&&small)return small;
    try{
      const large=await readLarge();
      if(mode==='idb'&&!large&&!small)throw Error('Sauvegarde IndexedDB manquante');
      return large||small;
    }catch(error){if(mode==='idb'&&!small)throw error;return small;}
  }
  async function save(content){
    if(content.length<largeAt){
      try{
        localStorage.setItem(key,content);
        localStorage.removeItem(modeKey);
        localStorage.setItem(modeKey,'local');
        return 'local';
      }catch{}
    }
    try{
      await writeLarge(content);
      try{localStorage.removeItem(key);localStorage.setItem(modeKey,'idb');}catch{}
      return 'idb';
    }catch(error){
      try{
        localStorage.setItem(key,content);
        localStorage.removeItem(modeKey);
        localStorage.setItem(modeKey,'local');
        return 'local';
      }catch{throw error;}
    }
  }
  return {load,save};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=StudioStorage;
