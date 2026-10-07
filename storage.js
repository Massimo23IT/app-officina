import {emptyDatabase,validateDatabase,MAX_BYTES} from './core.js';
import {seal,unseal} from './crypto.js';
const DB_NAME='officina-local-v1';
export class LocalStore {
 constructor(){this.db=null;this.data=null;this.revision=0;this.session=null;this.record=null;this.encrypted=false;}
 async open(){
  if(!globalThis.indexedDB)throw Error('Archivio locale non disponibile in questo browser.');
  this.db=await new Promise((resolve,reject)=>{
   const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore('archive');
   r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Chiudi le altre finestre di Officina e riprova.'));
  });
  await this.refresh();
 }
 async read(key='current'){
  return new Promise((resolve,reject)=>{const tx=this.db.transaction('archive','readonly');const r=tx.objectStore('archive').get(key);tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Lettura annullata.'));});
 }
 async refresh(){
  const record=await this.read();this.record=record??null;this.revision=record?.revision??0;
  if(!record){this.encrypted=false;this.session=null;this.data=emptyDatabase();return;}
  if(!Number.isSafeInteger(record.revision)||record.revision<1)throw Error('Archivio locale non valido. Esporta l’originale prima di ripristinare.');
  this.encrypted=record.payload?.format==='officina-encrypted';
  if(this.encrypted){this.data=null;this.session=null;}
  else {this.data=validateDatabase(record.payload);this.session=null;}
 }
 async unlock(password){
  const record=await this.read();if(!record?.payload)throw Error('Archivio non disponibile.');
  const result=await unseal(record.payload,password,'vault');const valid=validateDatabase(result.value);
  this.record=record;this.revision=record.revision;this.session=result.session;this.encrypted=true;this.data=valid;
 }
 lock(){if(this.encrypted){this.session=null;this.data=null;}}
 async commit(candidate,{session=this.session,encrypted=this.encrypted,preserve=false,purgePrevious=false}={}){
  const valid=validateDatabase(candidate);if(new TextEncoder().encode(JSON.stringify(valid)).length>MAX_BYTES)throw Error('Archivio oltre il limite di 20 MB.');
  if(encrypted&&!session)throw Error('Archivio bloccato. Inserisci la password.');
  const payload=encrypted?await seal(valid,session,'vault'):valid;
  const expected=this.revision;const next={revision:expected+1,updatedAt:new Date().toISOString(),payload};
  await new Promise((resolve,reject)=>{
   const tx=this.db.transaction('archive','readwrite');const object=tx.objectStore('archive');const r=object.get('current');let problem;
   r.onsuccess=()=>{
    if((r.result?.revision??0)!==expected){problem=Error('L’archivio è cambiato in un’altra finestra. Ricarica Officina prima di salvare.');tx.abort();return;}
    if(purgePrevious)object.delete('previous');
    else if(preserve&&r.result)object.put(r.result,'previous');object.put(next,'current');
   };
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(problem??tx.error??Error('Salvataggio non riuscito.'));tx.onabort=()=>reject(problem??tx.error??Error('Salvataggio annullato.'));
  });
  this.record=next;this.revision=next.revision;this.session=session;this.encrypted=encrypted;this.data=valid;
 }
 async recover(candidate){
  // Preserve original bytes/record even if it could not be validated on startup.
  const current=await this.read();this.revision=current?.revision??0;
  if(!Number.isSafeInteger(this.revision)||this.revision<0)throw Error('Archivio non recuperabile automaticamente. Esporta l’originale.');
  await this.commit(candidate,{encrypted:false,session:null,preserve:true});
 }
 async original(){return {format:'officina-original-archive',version:1,record:await this.read()};}
 async previous(){return this.read('previous');}
 async removePrevious(){await new Promise((resolve,reject)=>{const tx=this.db.transaction('archive','readwrite');tx.objectStore('archive').delete('previous');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
}
