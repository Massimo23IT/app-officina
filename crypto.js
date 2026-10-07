import {MAX_BYTES} from './core.js';
const encoder=new TextEncoder(),decoder=new TextDecoder();
const ITERATIONS=310000;
function b64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
function unb64(text,max){
 if(typeof text!=='string'||text.length>max||!/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw Error('Formato cifrato non valido.');
 try{return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}catch{throw Error('Formato cifrato non valido.');}
}
function secure(){if(!globalThis.crypto?.subtle)throw Error('La cifratura richiede HTTPS oppure localhost.');}
async function derive(password,salt){secure();const base=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function newSession(password){
 if(typeof password!=='string'||password.length<10||password.length>256)throw Error('Usa una password di almeno 10 caratteri (massimo 256).');
 const salt=crypto.getRandomValues(new Uint8Array(16));return {key:await derive(password,salt),salt};
}
function aad(purpose){return encoder.encode('Officina|1|'+purpose);}
export async function seal(value,session,purpose='vault'){
 secure();const iv=crypto.getRandomValues(new Uint8Array(12));
 const bytes=encoder.encode(JSON.stringify(value));if(bytes.length>MAX_BYTES)throw Error('Archivio troppo grande.');
 const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(purpose)},session.key,bytes));
 return {format:'officina-encrypted',version:1,purpose,cipher:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:b64(session.salt),iv:b64(iv),data:b64(ciphertext)};
}
export async function unseal(raw,password,purpose='vault'){
 if(raw?.format!=='officina-encrypted'||raw.version!==1||raw.purpose!==purpose||raw.cipher!=='AES-256-GCM'||raw.kdf!=='PBKDF2-SHA256'||raw.iterations!==ITERATIONS)throw Error('Formato cifrato non supportato.');
 if(typeof password!=='string'||password.length>256)throw Error('Password non valida.');
 const salt=unb64(raw.salt,24),iv=unb64(raw.iv,16),data=unb64(raw.data,Math.ceil((MAX_BYTES+32)*4/3));
 if(salt.length!==16||iv.length!==12||data.length<16)throw Error('Formato cifrato non valido.');
 const session={key:await derive(password,salt),salt};
 try{const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad(purpose)},session.key,data);return {value:JSON.parse(decoder.decode(clear)),session};}
 catch{throw Error('Password errata oppure archivio cifrato danneggiato.');}
}
