import {reportData,reportCSV,reportHTML} from './reports.js';
import {WORKS,MAX_IMPORT_BYTES,newID,emptyDatabase,normalizePlate,integer,amount,today,currentKM,latest,due,sortedServices,serviceTitle,validateDatabase,validateChronology,parseBackup,backupObject,demoDatabase} from './core.js';
import {LocalStore} from './storage.js';
import {newSession,seal,unseal} from './crypto.js';
const selectableWorks=new Set(['engineOil','oilFilter','airFilter','pollenFilter','timing','frontShocks','rearShocks','frontBrakes','rearBrakes','frontLights','rearLights','brakeDiscs']);
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={car:'M3 10l2-6h14l2 6M3 10h18v9H3zM6 19v2m12-2v2M6 14h2m8 0h2',wrench:'M14 4a6 6 0 0 0-7 7l-4 4a3 3 0 0 0 4 4l4-4a6 6 0 0 0 7-7l-4 3-3-3z',clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6',plus:'M12 5v14M5 12h14',search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',back:'M15 5l-7 7 7 7',arrow:'M9 5l7 7-7 7',edit:'M15 4l5 5M4 20l1-5L16 4a2 2 0 0 1 4 4L9 19z',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',close:'M6 6l12 12M18 6L6 18',download:'M12 3v12M7 10l5 5 5-5M4 17v4h16v-4',upload:'M12 17V5M7 10l5-5 5 5M4 17v4h16v-4',lock:'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3',share:'M8 12l8-7M8 12l8 7M8 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0M22 20a3 3 0 1 1-6 0 3 3 0 0 1 6 0',check:'M4 12l5 5L20 6',alert:'M12 8v5m0 3v1M12 3L2 21h20z',file:'M5 2h9l5 5v15H5zM14 2v6h5M8 12h8m-8 4h8'};
const icon=name=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]??paths.car}"/></svg>`;
const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
const km=n=>new Intl.NumberFormat('it-IT').format(n)+' km';
const date=s=>new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short',year:'numeric'}).format(new Date(s+'T12:00:00'));
const name=v=>[v.make,v.model].filter(Boolean).join(' ')||'Auto senza modello';
const store=new LocalStore();
let tab='auto',selectedVehicle=null,selectedService=null,query='',fatal=null,pendingImport=null,submitting=false,lastActivity=Date.now(),toastTimer,updateWaiting=null;
let servicePhoto='',photoProcessing=false,photoGeneration=0;
let previousFocus,installPrompt=null,offlineReady=false;
function data(){return store.data??emptyDatabase();}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,6000);}
function heading(title,subtitle,action=''){return `<div class="page-heading"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${action}</div>`;}
function button(text,action,symbol='plus',cls='',attrs=''){return `<button type="button" class="button ${cls}" data-action="${action}" ${attrs}>${icon(symbol)}${esc(text)}</button>`;}
function empty(symbol,title,message,action=''){return `<div class="empty">${icon(symbol)}<h2>${esc(title)}</h2><p>${esc(message)}</p>${action}</div>`;}
function plate(v){return `<span class="plate"><span>${esc(v.plate)}</span></span>`;}
function info(label,value){return `<div class="info"><small>${esc(label)}</small><strong>${esc(value||'—')}</strong></div>`;}
function vehicleCard(v){
 const db=data(),count=sortedServices(db,v.id).length;
 return `<article class="vehicle-card"><button class="vehicle-open" data-action="open-vehicle" data-id="${v.id}" aria-label="Apri auto ${esc(v.plate)}"><div class="card-top">${plate(v)}${icon('arrow')}</div><h3>${esc(name(v))}</h3><p class="muted">${esc(v.owner||'Cliente non indicato')}</p></button>${due(db,v)?'<p><span class="pill due-pill">Controllo da effettuare</span></p>':''}<div class="card-foot"><span>${km(currentKM(db,v))}</span><span>${count} ${count===1?'intervento':'interventi'}</span></div></article>`;
}
function serviceCard(s,showPlate=false){
 const v=data().vehicles.find(v=>v.id===s.vehicleID);
 return `<article class="service-card"><button class="service-main" data-action="open-service" data-id="${s.id}"><span class="date">${showPlate?esc(v?.plate)+' · ':''}${date(s.date)} · ${km(s.kilometers)}</span><h3>${esc(serviceTitle(s))}</h3><p>${s.cost!==null?money(s.cost):'Costo non indicato'}</p></button><div class="service-actions"><button class="icon-button" data-action="edit-service" data-id="${s.id}" aria-label="Modifica intervento del ${date(s.date)}">${icon('edit')}</button></div></article>`;
}
function nextCard(v){
 const s=latest(data(),v);
 if(!s||s.nextKilometers===null&&s.nextDate===null)return '<p class="muted">Nessuna scadenza nell’ultimo intervento.</p><p class="help">Puoi indicarla mentre registri un lavoro.</p>';
 return `${due(data(),v)?'<span class="pill due-pill">Da effettuare</span>':'<span class="pill good-pill">Programmato</span>'}${s.nextKilometers!==null?`<p class="next-big">${km(s.nextKilometers)}</p>`:''}${s.nextDate?`<p>Entro il <strong>${date(s.nextDate)}</strong></p>`:''}<p class="help">Aggiorna i km dell’auto per verificare la scadenza chilometrica.</p>`;
}
function autoPage(){
 const db=data(),cars=db.vehicles.filter(v=>!query||[v.plate,name(v),v.owner].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())||v.plate.includes(normalizePlate(query))).sort((a,b)=>a.plate.localeCompare(b.plate));
 return heading('La tua officina','Auto, lavori e manutenzione. Tutto in un posto.',button('Nuova auto','new-vehicle'))+
 `<section class="hero"><div class="hero-copy"><p class="eyebrow">IL REGISTRO DEL MECCANICO</p><h2>Ogni auto ha una storia.<br>Conservala qui.</h2><p>Dall’olio ai freni, una scheda semplice per ogni lavoro. I dati rimangono su questo dispositivo.</p></div><img src="assets/meccanico.webp" alt="Il meccanico di Officina"></section>
 <div class="metrics"><div class="metric">${icon('car')}<div><strong>${db.vehicles.length}</strong><span>Auto in archivio</span></div></div><div class="metric">${icon('wrench')}<div><strong>${db.services.length}</strong><span>Interventi registrati</span></div></div><div class="metric">${icon('clock')}<div><strong>${db.vehicles.filter(v=>due(db,v)).length}</strong><span>Controlli da fare</span></div></div></div>
 <div class="list-top"><h2>Le tue auto</h2><label class="search">${icon('search')}<input id="search" type="search" value="${esc(query)}" placeholder="Targa, auto o cliente" aria-label="Cerca auto"></label></div>
 <div id="results">${carResults(cars)}</div>${installGuide()}`;
}
function installGuide(){
 const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 return `<section class="panel home-install"><p class="eyebrow">IPHONE · ANDROID · COMPUTER</p><h2>${installed?'Officina è installata':'Installa Officina sul tuo dispositivo'}</h2><p class="muted">Un’unica app, con icona del meccanico e dati salvati su questo dispositivo.</p>${!installed&&installPrompt?button('Installa Officina','install-app','download'):''}<div class="install-platforms"><div><h3>iPhone / iPad</h3><p>Apri l’indirizzo HTTPS in Safari → Condividi → Aggiungi alla schermata Home. Se presente, attiva Apri come app web e premi Aggiungi.</p></div><div><h3>Android</h3><p>Apri l’indirizzo HTTPS in Chrome → menu ⋮ → Aggiungi alla schermata Home → Installa. Puoi usare anche il pulsante Installa Officina quando disponibile.</p></div><div><h3>Windows / Mac</h3><p>Apri l’app in Chrome o Edge e usa l’icona di installazione nella barra degli indirizzi, oppure la voce di installazione nel menu del browser.</p></div></div><p class="help" id="offline-status">${offlineMessage()}</p><p class="help">Ogni dispositivo ha un archivio separato. Per spostare i dati usa Backup → Backup JSON e Importa backup. Prima di passare dal file locale all’indirizzo web, esporta un backup.</p>${location.protocol==='file:'?'<p class="help">Questa copia HTML si apre sul computer. Per installare la PWA sul telefono usa l’indirizzo HTTPS dell’app.</p>':''}</section>`;
}
function offlineMessage(){return offlineReady?'Modalità offline pronta: auto, promemoria e interventi funzionano anche senza connessione. Le ricerche ricambi richiedono Internet.':location.protocol==='file:'?'Copia locale aperta dal file. L’installazione PWA richiede l’indirizzo HTTPS.':'Attendi il primo caricamento completo con connessione per preparare la modalità offline.';}
function carResults(cars){return cars.length?`<div class="cards">${cars.map(vehicleCard).join('')}</div>`:empty('car',data().vehicles.length?'Nessuna auto trovata':'La prima auto, il primo lavoro',data().vehicles.length?'Prova un’altra targa o un altro cliente.':'Aggiungi una scheda auto oppure prova Officina con dati dimostrativi.',data().vehicles.length?'':`<div class="button-row">${button('Aggiungi auto','new-vehicle')}${button('Prova un esempio','demo','car','secondary')}</div>`);}
function partsURL(engine,query){
 const bases={google:'https://www.google.com/search?q=',bing:'https://www.bing.com/search?q=',duckduckgo:'https://duckduckgo.com/?q='};return bases[engine]+encodeURIComponent(query);
}
function partsSearch(v){
 const part=WORKS.find(w=>w[0]===v.plannedWorks?.[0])?.[1]??'',context=[v.make,v.model].filter(Boolean).join(' '),q=['ricambi',part,context].filter(Boolean).join(' ');
 return `<section class="panel parts-panel"><p class="eyebrow">RICAMBI</p><h2>Cerca ricambi online</h2><div class="field-grid"><label class="field"><span>Pezzo o codice ricambio</span><input id="parts-query" value="${esc(part)}" maxlength="300" placeholder="Es. filtro olio oppure codice OEM"></label><label class="field"><span>Auto / motore / anno</span><input id="parts-context" value="${esc(context)}" maxlength="300" placeholder="Es. Fiat Panda 1.2 2018"></label><label class="field full"><span>Scelta rapida intervento</span><select id="parts-preset"><option value="">Scegli una voce…</option>${WORKS.map(w=>`<option value="${esc(w[1])}">${esc(w[1])}</option>`).join('')}</select></label></div><div class="button-row parts-links">${[['google','Google'],['bing','Bing'],['duckduckgo','DuckDuckGo']].map(([key,label])=>`<a class="button secondary" data-parts-engine="${key}" href="${esc(partsURL(key,q))}" target="_blank" rel="noopener noreferrer">${icon('search')}${label}</a>`).join('')}</div><p class="help">Si apre il motore di ricerca scelto; serve Internet. Vengono cercati solo il testo del pezzo e i dati auto qui indicati. Verifica la compatibilità con motore, anno e codice del ricambio.</p></section>`;
}
function updatePartsLinks(){
 const q=['ricambi',$('#parts-query').value.trim(),$('#parts-context').value.trim()].filter(Boolean).join(' ');
 document.querySelectorAll('[data-parts-engine]').forEach(link=>link.href=partsURL(link.dataset.partsEngine,q));
}
function vehiclePage(v){
 const jobs=sortedServices(data(),v.id);
 return `<button class="back" data-action="back">${icon('back')}Le tue auto</button>`+heading(v.plate,name(v),`<div class="heading-actions">${button('Scarica report','export-report','download','secondary',`data-id="${v.id}"`)}${button('Modifica','edit-vehicle','edit','secondary',`data-id="${v.id}"`)}</div>`)+
 `<div class="detail-grid"><section class="panel"><p class="eyebrow">SCHEDA AUTO</p>${v.photo?`<figure class="vehicle-photo"><img src="${esc(v.photo)}" alt="Foto principale dell’auto ${esc(v.plate)}"></figure>`:''}<div class="detail-data">${info('Chilometraggio attuale',km(currentKM(data(),v)))}${info('Cliente',v.owner)}${info('Marca / modello',name(v))}${info('Telefono',v.phone)}</div>${v.notes?`<p class="help preline">${esc(v.notes)}</p>`:''}<div class="button-row">${button('Aggiorna km','update-km','edit','secondary',`data-id="${v.id}"`)}${button(v.photo?'Modifica foto':'Aggiungi foto','vehicle-photo','car','secondary',`data-id="${v.id}"`)}${button('Cerca auto dalla targa','edit-vehicle','search','secondary',`data-id="${v.id}"`)}</div></section><section class="panel"><p class="eyebrow">PROSSIMO CONTROLLO</p>${nextCard(v)}<div class="button-row">${button('Indica prossimo controllo',latest(data(),v)?'edit-service':'new-service','clock','secondary',`data-id="${latest(data(),v)?.id??v.id}"`)}</div></section></div>
 <section class="panel planned-panel"><div class="section-title"><div><p class="eyebrow">PROMEMORIA AUTO</p><h2>Interventi da fare</h2></div>${button('Scegli interventi','plan-works','wrench','secondary',`data-id="${v.id}"`)}</div>${v.plannedWorks?.length?`<div class="work-tags">${v.plannedWorks.map(k=>`<span>${esc(WORKS.find(w=>w[0]===k)[1])}</span>`).join('')}</div>`:''}${v.plannedOther?`<p class="preline">${esc(v.plannedOther)}</p>`:''}${!v.plannedWorks?.length&&!v.plannedOther?'<p class="muted">Scegli olio, filtri, freni e gli altri lavori da effettuare su questa auto.</p>':'<p class="help">Le voci saranno proposte quando registri un nuovo intervento.</p>'}</section>
 ${partsSearch(v)}
 <div class="section-title"><h2>Storico interventi <small>(${jobs.length})</small></h2>${button('Registra intervento','new-service','plus','',`data-id="${v.id}"`)}</div>
 <div class="services">${jobs.length?jobs.map(s=>serviceCard(s)).join(''):empty('wrench','Nessun lavoro registrato','Registra il primo intervento per costruire lo storico di questa auto.')}</div>
 <div class="footer-note">${button('Elimina auto e storico','delete-vehicle','trash','secondary',`data-id="${v.id}"`)}</div>`;
}
function servicePage(s){
 const v=data().vehicles.find(v=>v.id===s.vehicleID);
 return `<button class="back" data-action="back-service">${icon('back')}Torna allo storico</button>`+heading('Scheda intervento',`${v?.plate??''} · ${date(s.date)}`,button('Modifica','edit-service','edit','secondary',`data-id="${s.id}"`))+
 `<section class="panel"><p class="eyebrow">INTERVENTO COMPLETATO</p><div class="detail-data">${info('Auto',`${v?.plate??''} · ${v?name(v):''}`)}${info('Cliente',v?.owner)}${info('Data',date(s.date))}${info('Chilometraggio',km(s.kilometers))}${info('Costo',s.cost===null?'Non indicato':money(s.cost))}</div>
 ${s.photo?`<figure class="vehicle-photo"><img src="${esc(s.photo)}" alt="Foto del veicolo per questo intervento"></figure>`:''}<div class="section-title"><h2>Lavori eseguiti</h2></div><div class="work-tags">${s.works.map(k=>`<span>${esc(WORKS.find(w=>w[0]===k)[1])}</span>`).join('')}</div>${s.otherWork?`<p class="preline">${esc(s.otherWork)}</p>`:''}
 <div class="detail-data">${s.engineOil?info('Olio motore / specifica',s.engineOil):''}${s.oilLiters?info('Litri olio motore',s.oilLiters):''}${s.transmissionOil?info('Olio trasmissione',s.transmissionOil):''}${s.parts?info('Ricambi e filtri: marche / codici',s.parts):''}</div>
 ${s.notes?`<div class="section-title"><h2>Note</h2></div><p class="preline">${esc(s.notes)}</p>`:''}
 ${s.nextKilometers!==null||s.nextDate?`<div class="section-title"><h2>Prossimo controllo</h2></div><div class="detail-data">${s.nextKilometers!==null?info('A km',km(s.nextKilometers)):''}${s.nextDate?info('Entro il',date(s.nextDate)):''}</div>`:''}
 <div class="section-title button-row">${button('Condividi scheda','share-service','share','',`data-id="${s.id}"`)}${button('Scarica testo','download-service','download','secondary',`data-id="${s.id}"`)}</div></section>
 <p class="footer-note">${button('Elimina intervento','delete-service','trash','secondary',`data-id="${s.id}"`)}</p>`;
}
function controlsPage(){
 const db=data(),vehicles=db.vehicles.filter(v=>{const s=latest(db,v);return (s&&(s.nextKilometers!==null||s.nextDate!==null))||v.plannedWorks?.length||v.plannedOther;}).sort((a,b)=>Number(due(db,b))-Number(due(db,a))||(latest(db,a)?.nextDate??'9999').localeCompare(latest(db,b)?.nextDate??'9999')||a.plate.localeCompare(b.plate));
 return heading('Controlli e lavori programmati','Scadenze e interventi da fare, per ogni auto.')+`<div class="notice">${icon('clock')} Aggiorna i km quando l’auto torna in officina. Un controllo è da effettuare quando raggiunge la data o i km indicati.</div>`+
 (vehicles.length?`<div class="cards">${vehicles.map(v=>`<article class="panel"><button class="vehicle-open" data-action="open-vehicle" data-id="${v.id}"><div class="card-top">${plate(v)}${icon('arrow')}</div><h3>${esc(name(v))}</h3></button><p>Km attuali: <strong>${km(currentKM(db,v))}</strong></p>${nextCard(v)}${v.plannedWorks?.length||v.plannedOther?`<h3>Interventi da fare</h3><div class="work-tags">${(v.plannedWorks??[]).map(k=>`<span>${esc(WORKS.find(w=>w[0]===k)[1])}</span>`).join('')}</div>${v.plannedOther?`<p class="preline">${esc(v.plannedOther)}</p>`:''}`:''}<div class="button-row">${button('Aggiorna km','update-km','edit','secondary',`data-id="${v.id}"`)}${button('Scegli interventi','plan-works','wrench','secondary',`data-id="${v.id}"`)}${button('Registra intervento','new-service','plus','',`data-id="${v.id}"`)}</div></article>`).join('')}</div>`:empty('clock','Nessun lavoro programmato','Apri una scheda Auto e premi Scegli interventi. Quando registri un lavoro, indica il prossimo controllo in km o per data.'));
}

function allServicesPage(){
 const list=[...data().services].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
 return heading('Tutti gli interventi',`${list.length} lavori nello storico della tua officina.`,button('Scarica report','export-report','download'))+`<div class="services">${list.length?list.map(s=>serviceCard(s,true)).join(''):empty('wrench','Uno storico ancora da scrivere','Apri la scheda di un’auto per registrare un lavoro.')}</div>`;
}
function backupPage(){
 const services=[...data().services].sort((a,b)=>b.date.localeCompare(a.date));
 return heading('Backup e interventi','Salva una copia dei tuoi dati e consulta i lavori effettuati.')+
 `<section class="panel"><h2>Backup dei dati</h2><p class="muted">Il file JSON contiene auto, clienti, interventi e foto. Conservalo in un posto sicuro: non è protetto da password.</p><div class="button-row">${button('Scarica backup','export','download')}${button('Importa backup','import','upload','secondary')}</div><p class="help">Importare un backup sostituisce l’archivio attuale, dopo la tua conferma. Salva una copia prima di cambiare dispositivo o cancellare i dati del browser.</p>${store.encrypted?`<p class="help">Questo dispositivo usa ancora la protezione della versione precedente.</p>${button('Rimuovi password locale','disable-vault','shield','secondary')}`:''}</section>
 <div class="list-top"><h2>Interventi effettuati (${services.length})</h2>${services.length?button('Scarica report','export-report','download','secondary'):''}</div>
 ${services.length?`<div class="service-list">${services.map(s=>serviceCard(s,true)).join('')}</div>`:'<p class="muted">Nessun intervento registrato.</p>'}
 ${updateWaiting?`<div class="notice">È disponibile una nuova versione. Salva le modifiche prima di aggiornare. ${button('Aggiorna app','update','download','secondary')}</div>`:''}
 <p class="footer-note">Officina · Dati e foto salvati solo su questo dispositivo.</p>`;
}

function lockedPage(){
 return `<section class="panel locked"><img src="assets/icon-192.png" alt="Meccanico di Officina"><h1>La tua officina è protetta.</h1><p class="muted">Inserisci la password per aprire l’archivio su questo dispositivo.</p><form id="unlock-form"><label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" required maxlength="256" autofocus></label><p class="dialog-error" id="unlock-error" hidden role="alert"></p><p><button class="button" type="submit">${icon('lock')}Sblocca archivio</button></p></form><p class="help">La password non è recuperabile. Se la dimentichi, puoi sostituire l’archivio con un backup di cui conosci la password.</p><div class="button-row">${button('Esporta originale','export-original','download','secondary')}${button('Ripristina backup','import','upload','secondary')}</div></section>`;
}
function fatalPage(){return heading('Archivio non disponibile','I dati originali non vengono sovrascritti.')+`<section class="panel"><div class="notice warning">${esc(fatal)}</div><p>Prova a riaprire l’app oppure esporta l’originale prima di ripristinare un backup valido.</p><div class="button-row">${button('Esporta originale','export-original','download','secondary')}${button('Ripristina backup','import','upload','secondary')}</div></section>`;}
function render(){
 const locked=store.encrypted&&!store.data;
 const nav=[['auto','car','Auto'],['interventi','wrench','Interventi'],['controlli','clock','Controlli'],['backup','shield','Backup']];
 $('#tabs').innerHTML=nav.map(([key,symbol,title])=>`<button class="tab" data-tab="${key}" ${tab===key?'aria-current="page"':''}>${icon(symbol)}<span>${title}</span></button>`).join('');
 $('#tabs').hidden=locked||!!fatal;$('#lock-button').hidden=!store.encrypted||locked;$('#lock-button').innerHTML=icon('lock');
 $('#local-status').textContent=store.encrypted?'Archivio cifrato':'Solo su questo dispositivo';
 const v=data().vehicles.find(v=>v.id===selectedVehicle),s=data().services.find(s=>s.id===selectedService);
 $('#view').innerHTML=(!isSecureContext&&!fatal?'<div class="notice warning">Modalità HTTP: puoi inserire i dati locali. Per usare la cifratura e installare la PWA, apri Officina da HTTPS oppure localhost.</div>':'')+(fatal?fatalPage():locked?lockedPage():s?servicePage(s):v?vehiclePage(v):({auto:autoPage,interventi:allServicesPage,controlli:controlsPage,backup:backupPage}[tab]??autoPage)());
}
function navigate(newTab){tab=newTab;selectedVehicle=null;selectedService=null;query='';render();window.scrollTo(0,0);$('#view').focus({preventScroll:true});}
function modal(title,eyebrow,body,formType,id='',saveText='Salva'){
 previousFocus=document.activeElement;const d=$('#modal');d.dataset.form=formType;d.dataset.id=id;
 d.innerHTML=`<form class="modal-form" id="modal-form"><div class="dialog-header"><div><p class="eyebrow">${esc(eyebrow)}</p><h2 id="modal-title">${esc(title)}</h2></div><button class="icon-button" type="button" data-action="close-modal" aria-label="Chiudi">${icon('close')}</button></div><div class="form-body">${body}</div><div class="dialog-error form-error" id="form-error" role="alert"></div><div class="form-actions"><button type="button" class="button secondary" data-action="close-modal">Annulla</button><button type="submit" class="button">${icon('check')}${esc(saveText)}</button></div></form>`;
 d.showModal();
}
function closeModal(){if(submitting)return;photoGeneration++;$('#modal').close();$('#modal').innerHTML='';pendingImport=null;previousFocus?.focus();}
function field(label,key,value='',type='text',options=''){return `<label class="field"><span>${esc(label)}</span><input name="${key}" type="${type}" value="${esc(value)}" ${options}></label>`;}
function area(label,key,value='',max=10000){return `<label class="field full"><span>${esc(label)}</span><textarea name="${key}" rows="3" maxlength="${max}">${esc(value)}</textarea></label>`;}
function section(title,body){return `<section class="form-section"><h3>${esc(title)}</h3>${body}</section>`;}
function reportForm(id=''){
 const v=data().vehicles.find(v=>v.id===id);
 modal('Scarica report',v?v.plate:'TUTTA L’OFFICINA',`<p class="muted">Esporta i lavori effettuati ${v?'su questa auto':'su tutte le auto'}. Lascia le date vuote per includere tutto lo storico.</p><div class="field-grid">${field('Dal (facoltativo)','from','','date')}${field('Al (facoltativo)','to','','date')}</div><label class="field"><span>Formato</span><select name="format"><option value="html">Report leggibile e stampabile (HTML)</option><option value="csv">Tabella per Excel / Numbers (CSV)</option></select></label><p class="help">Il report HTML si apre nel browser e può essere salvato in PDF dal menu Stampa. Include i costi registrati e il totale.</p>`,'export-report',id,'Scarica report');
}
function plannedMenu(v){
 return `<details class="planned-menu"><summary>Scegli gli interventi da fare</summary><p class="help">Seleziona una o più voci. Verranno salvate come promemoria nella scheda auto.</p>${section('Olio',checks('olio',v?.plannedWorks??[]))}${section('Filtri',checks('filtri',v?.plannedWorks??[]))}${section('Altri interventi',checks('lavori',v?.plannedWorks??[]))}${area('Altri lavori da fare','plannedOther',v?.plannedOther,2000)}</details>`;
}
function planForm(id){
 const v=data().vehicles.find(v=>v.id===id);if(!v)throw Error('Auto non trovata.');
 modal('Interventi da fare',v.plate,plannedMenu(v),'plan-works',id,'Salva interventi');$('#modal details').open=true;syncFilters();
}
function vehicleForm(id){
 const v=data().vehicles.find(v=>v.id===id);servicePhoto=v?.photo??'';photoProcessing=false;photoGeneration++;modal(v?'Modifica auto':'Nuova auto','SCHEDA AUTO',
 section('Identificazione',`<div class="field-grid">${field('Targa *','plate',v?.plate,'text','required maxlength="24" autocapitalize="characters" autocomplete="off" autofocus')}${field('Km attuali *','kilometers',v?currentKM(data(),v):'','text','required inputmode="numeric" pattern="[0-9]{1,7}" maxlength="7"')}${field('Marca','make',v?.make,'text','maxlength="100"')}${field('Modello','model',v?.model,'text','maxlength="100"')}</div>`)+
 section('Ricerca gratuita dalla targa',`<div class="button-row">${button('Copia targa','copy-plate','file','secondary')}<a class="button secondary" href="https://www.auto-doc.it/" target="_blank" rel="noopener noreferrer">${icon('search')}Cerca auto dalla targa</a></div><p class="help">1. Copia la targa. 2. Apri AUTODOC e incollala nella ricerca per targa. 3. Torna qui e inserisci marca e modello nei campi sopra, verificandoli sul libretto. La ricerca si svolge sul sito esterno e non compila automaticamente la scheda.</p>`)+
 photoFields()+
 section('Cliente',`<div class="field-grid">${field('Nome / azienda','owner',v?.owner,'text','maxlength="200" autocomplete="name"')}${field('Telefono','phone',v?.phone,'tel','maxlength="80" autocomplete="tel"')}</div>`)+
 section('Interventi da fare',plannedMenu(v))+
 section('Note auto',area('Motore, anno, telaio o altre informazioni','notes',v?.notes))+'<p class="help">* Campi obbligatori. Inserisci i km senza punti o virgole. Aggiornali quando l’auto torna in officina.</p>','vehicle',id??'');syncFilters();
}
function checks(group,selected){return `<div class="checks">${group==='filtri'?'<label class="check all"><input type="checkbox" id="all-filters">Tutti i filtri della scheda</label>':''}${WORKS.filter(w=>w[2]===group&&selectableWorks.has(w[0])).map(w=>`<label class="check"><input type="checkbox" name="works" value="${w[0]}" data-work-group="${group}" ${selected.includes(w[0])?'checked':''}>${esc(w[1])}</label>`).join('')}</div>${legacyWorks(group,selected)}`;}
function serviceForm(vehicleID,serviceID){
 const s=data().services.find(s=>s.id===serviceID),v=data().vehicles.find(v=>v.id===(s?.vehicleID??vehicleID));if(!v)throw Error('Auto non trovata.');
 servicePhoto=s?.photo??'';photoProcessing=false;photoGeneration++;
 const selected=s?.works??v.plannedWorks??[];
 modal(s?'Modifica intervento':'Nuovo intervento',v.plate,
 (!s&&(v.plannedWorks?.length||v.plannedOther)?'<p class="notice">Sono proposti gli interventi da fare salvati nella scheda auto.</p><label class="check"><input type="checkbox" name="completePlanned" checked>Al salvataggio, rimuovi dal promemoria i lavori qui registrati.</label>':'')+
 section('Data e chilometraggio',`<div class="field-grid">${field('Data *','date',s?.date??today(),'date',`required max="${today()}"`)}${field('Km all’intervento *','kilometers',s?.kilometers??currentKM(data(),v),'text','required inputmode="numeric" pattern="[0-9]{1,7}" maxlength="7"')}</div>`)+
 section('Olio',checks('olio',selected)+`<div class="field-grid oil-fields" id="engine-fields" ${selected.includes('engineOil')?'':'hidden'}>${oilChoice(s?.engineOil)}${field('Litri olio motore','oilLiters',s?.oilLiters,'text','inputmode="decimal" maxlength="20"')}</div><div class="oil-fields" id="transmission-fields" ${selected.includes('transmissionOil')?'':'hidden'}>${field('Tipo olio trasmissione / specifica','transmissionOil',s?.transmissionOil,'text','maxlength="300"')}</div>`)+
 section('Filtri',checks('filtri',selected))+
 section('Altri lavori',checks('lavori',selected)+`<div class="oil-fields">${area('Altri lavori / interventi personalizzati','otherWork',s?.otherWork??v.plannedOther,2000)}</div>`)+
 photoFields()+
 section('Ricambi, note e costo',`<div class="field-grid">${area('Marche / codici ricambi e filtri','parts',s?.parts,5000)}${area('Note intervento','notes',s?.notes)}${field('Costo totale € (facoltativo)','cost',s?.cost===null?'':s?.cost??'','text','inputmode="decimal" maxlength="13"')}</div>`)+
 section('Prossimo controllo',`<div class="field-grid">${field('A km (facoltativo)','nextKilometers',s?.nextKilometers??'','text','inputmode="numeric" maxlength="7"')}${field('Entro il (facoltativo)','nextDate',s?.nextDate??'','date')}</div><p class="help">La scadenza attiva è quella dell’ultimo intervento. Per mantenerne una precedente, riportala qui.</p>`),'service',s?.id??'');
 $('#modal').dataset.vehicle=v.id;syncFilters();
}
function syncFilters(){const items=[...$('#modal').querySelectorAll('[data-work-group="filtri"]')];if($('#all-filters')){$('#all-filters').checked=items.every(x=>x.checked);$('#all-filters').indeterminate=items.some(x=>x.checked)&&!items.every(x=>x.checked);}}
function passwordForm(kind){
 const backup=kind==='encrypted-export',changing=kind==='change-vault';
 modal(backup?'Backup cifrato':changing?'Cambia password':'Proteggi l’archivio',backup?'COPIA ESTERNA':'SICUREZZA LOCALE',
 `<p class="muted">${backup?'Scegli la password di questo backup. Per ripristinarlo sarà necessaria la stessa password.':'I dati saranno cifrati sul dispositivo. La password non viene salvata e non può essere recuperata.'}</p><div class="field-grid">${field('Password (almeno 10 caratteri)','password','','password','required minlength="10" maxlength="256" autocomplete="new-password" autofocus')}${field('Ripeti password','confirmPassword','','password','required minlength="10" maxlength="256" autocomplete="new-password"')}</div>${backup?'':'<div class="notice warning">Conserva la password e un backup esterno. Eventuali copie interne precedenti al ripristino vengono eliminate durante questa operazione.</div>'}`,kind,'',backup?'Esporta backup':'Cifra archivio');
}
async function ask(title,message,yes='Conferma'){
 const d=$('#confirm');$('#confirm-title').textContent=title;$('#confirm-message').textContent=message;$('#confirm-yes').textContent=yes;$('#confirm-error').hidden=true;d.showModal();
 return new Promise(resolve=>{let done=false;const finish=result=>{if(done)return;done=true;d.close();$('#confirm-yes').onclick=null;$('#confirm-no').onclick=null;d.removeEventListener('cancel',cancel);resolve(result);};const cancel=e=>{e.preventDefault();finish(false);};$('#confirm-yes').onclick=()=>finish(true);$('#confirm-no').onclick=()=>finish(false);d.addEventListener('cancel',cancel);});
}
function download(value,filename,type='application/json'){
 const content=typeof value==='string'?value:JSON.stringify(value,null,2);const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function report(s){const v=data().vehicles.find(v=>v.id===s.vehicleID);return ['OFFICINA • SCHEDA INTERVENTO',`Targa: ${v?.plate??''}`,`Auto: ${v?name(v):''}`,`Cliente: ${v?.owner??''}`,`Data: ${date(s.date)}`,`Km: ${km(s.kilometers)}`,'','LAVORI ESEGUITI',...s.works.map(k=>'• '+WORKS.find(w=>w[0]===k)[1]),s.otherWork&&'Altri lavori: '+s.otherWork,s.engineOil&&'Olio motore: '+s.engineOil,s.oilLiters&&'Litri olio motore: '+s.oilLiters,s.transmissionOil&&'Olio trasmissione: '+s.transmissionOil,s.parts&&'Ricambi / filtri: '+s.parts,s.notes&&'Note: '+s.notes,s.cost!==null&&'Costo: '+money(s.cost),s.nextKilometers!==null&&'Prossimo controllo: '+km(s.nextKilometers),s.nextDate&&'Entro il: '+date(s.nextDate)].filter(x=>x!==false&&x!==null).join('\n');}
async function doImport(raw){
 if(raw?.format==='officina-original-archive'){
  if(!raw.record?.payload)throw Error('Copia di recupero non valida.');raw=raw.record.payload;
 }
 if(raw?.format==='officina-encrypted'){
  if(!['vault','backup'].includes(raw.purpose))throw Error('Formato cifrato non valido.');pendingImport=raw;
  modal('Apri il backup cifrato','RIPRISTINO',`<p class="muted">Inserisci la password usata per cifrare questo file.</p>${field('Password backup','password','','password','required maxlength="256" autocomplete="off" autofocus')}`,'decrypt-import','','Apri backup');return;
 }
 await restoreCandidate(parseBackup(JSON.stringify(raw)));
}
async function restoreCandidate(candidate){
 if(!await ask('Sostituire tutto l’archivio?',`Il backup contiene ${candidate.vehicles.length} auto e ${candidate.services.length} interventi. Sostituirà i dati attuali. Esporta un backup prima di proseguire.`,'Sostituisci archivio'))return;
 if(fatal||!store.data){await store.recover(candidate);fatal=null;}
 else await store.commit(candidate,{preserve:true});
 selectedVehicle=null;selectedService=null;tab='auto';render();toast('Archivio ripristinato.');
}
async function submit(form){
 const fields=new FormData(form),get=key=>String(fields.get(key)??'').trim();const kind=$('#modal').dataset.form,id=$('#modal').dataset.id;
 if(kind==='export-report'){
  const r=reportData(data(),{vehicleID:id,from:get('from'),to:get('to')}),csv=get('format')==='csv';
  download(csv?reportCSV(r):reportHTML(r),`Officina-report-${r.scope.replace(/[^a-zA-Z0-9_-]/g,'_')}-${today()}.${csv?'csv':'html'}`,csv?'text/csv;charset=utf-8':'text/html;charset=utf-8');
  return 'Report preparato. Salvalo in File o sul computer.';
 }
 if(kind==='update-km'){
 const candidate=structuredClone(data()),v=candidate.vehicles.find(v=>v.id===id);if(!v)throw Error('Auto non trovata.');
 const value=integer(get('kilometers'),'Km attuali');if(value<currentKM(data(),v))throw Error('I km non possono essere inferiori a quelli già registrati.');
 v.kilometers=value;await store.commit(candidate);return 'Km aggiornati. Scadenze ricalcolate.';
 }
 if(kind==='plan-works'){
  const candidate=structuredClone(data()),v=candidate.vehicles.find(v=>v.id===id);if(!v)throw Error('Auto non trovata.');
  v.plannedWorks=fields.getAll('works');v.plannedOther=get('plannedOther');await store.commit(candidate);return 'Interventi da fare salvati.';
 }
 if(kind==='vehicle-photo'){
  if(photoProcessing)throw Error('Attendi la preparazione della foto.');
  const candidate=structuredClone(data()),v=candidate.vehicles.find(v=>v.id===id);if(!v)throw Error('Auto non trovata.');v.photo=servicePhoto;await store.commit(candidate);return 'Foto auto salvata.';
 }
 if(kind==='vehicle'){
  if(photoProcessing)throw Error('Attendi la preparazione della foto.');
  const existing=data().vehicles.find(v=>v.id===id);const v={photo:servicePhoto,plannedWorks:fields.getAll('works'),plannedOther:get('plannedOther'),id:existing?.id??newID(),plate:normalizePlate(get('plate')),make:get('make'),model:get('model'),owner:get('owner'),phone:get('phone'),kilometers:integer(get('kilometers'),'Km attuali'),notes:get('notes'),createdAt:existing?.createdAt??new Date().toISOString()};
  if(data().services.some(s=>s.vehicleID===v.id&&s.kilometers>v.kilometers))throw Error('I km attuali non possono essere inferiori a quelli già registrati negli interventi.');
  const candidate=structuredClone(data());candidate.vehicles=candidate.vehicles.filter(x=>x.id!==v.id);candidate.vehicles.push(v);await store.commit(candidate);
  selectedVehicle=v.id;selectedService=null;return 'Auto salvata.';
 }
 if(kind==='service'){
  const old=data().services.find(s=>s.id===id),works=fields.getAll('works');
  if(photoProcessing)throw Error('Attendi la preparazione della foto.');
 const s={photo:servicePhoto,id:old?.id??newID(),vehicleID:$('#modal').dataset.vehicle,date:get('date'),kilometers:integer(get('kilometers'),'Km all’intervento'),works,engineOil:works.includes('engineOil')?get('engineOil'):'',oilLiters:works.includes('engineOil')?get('oilLiters'):'',transmissionOil:works.includes('transmissionOil')?get('transmissionOil'):'',parts:get('parts'),otherWork:get('otherWork'),notes:get('notes'),cost:amount(get('cost')),nextKilometers:get('nextKilometers')?integer(get('nextKilometers'),'Prossimo controllo'):null,nextDate:get('nextDate')||null,createdAt:old?.createdAt??new Date().toISOString()};
  if(s.date>today())throw Error('La data di un lavoro eseguito non può essere futura.');validateChronology(data(),s);
  const candidate=structuredClone(data());candidate.services=candidate.services.filter(x=>x.id!==s.id);candidate.services.push(s);
  if(!old&&fields.has('completePlanned')){const v=candidate.vehicles.find(v=>v.id===s.vehicleID);v.plannedWorks=(v.plannedWorks??[]).filter(k=>!s.works.includes(k));if(v.plannedOther?.trim()===s.otherWork.trim())v.plannedOther='';}
  await store.commit(candidate);
  selectedVehicle=s.vehicleID;selectedService=s.id;return 'Intervento salvato.';
 }
 if(['enable-vault','change-vault','encrypted-export'].includes(kind)){
  const password=String(fields.get('password')??'');if(password!==String(fields.get('confirmPassword')??''))throw Error('Le password non coincidono.');
  const session=await newSession(password);
  if(kind==='encrypted-export'){const value=await seal(backupObject(data()),session,'backup');download(value,`Officina-backup-cifrato-${today()}.json`);return 'Backup cifrato preparato. Conservalo insieme alla password in un luogo sicuro.';}
  await store.commit(data(),{session,encrypted:true,purgePrevious:true});lastActivity=Date.now();return 'Archivio cifrato. La password sarà richiesta alla prossima apertura.';
 }
 if(kind==='decrypt-import'){
  const result=await unseal(pendingImport,String(fields.get('password')??''),pendingImport.purpose);const candidate=parseBackup(JSON.stringify(result.value));
  // Close the password form before the destructive confirmation and clear sensitive inputs.
  $('#modal').close();$('#modal').innerHTML='';pendingImport=null;await restoreCandidate(candidate);return '';
 }
}
async function action(nameAction,element){
 const id=element.dataset.id;
 switch(nameAction){
 case 'install-app':if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();const result=await prompt.userChoice;render();toast(result.outcome==='accepted'?'Installazione avviata. Apri Officina dalla nuova icona.':'Puoi installare Officina in seguito dal menu del browser.');}break;
 case 'copy-plate':{const input=$('#modal input[name="plate"]'),value=normalizePlate(input?.value??'');if(!value)throw Error('Inserisci prima la targa.');if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(value);toast('Targa copiata. Apri AUTODOC e incollala nella ricerca per targa.');break;}catch{}}input.focus();input.select();toast('Targa selezionata: copiala e incollala nella ricerca AUTODOC.');break;}
 case 'plan-works':planForm(id);break;
 case 'export-report':reportForm(id);break;
 case 'new-vehicle':vehicleForm();break;
 case 'edit-vehicle':vehicleForm(id);break;
 case 'open-vehicle':selectedVehicle=id;selectedService=null;render();window.scrollTo(0,0);break;
 case 'update-km':kilometersForm(id);break;
 case 'vehicle-photo':vehiclePhotoForm(id);break;
 case 'new-service':serviceForm(id);break;
 case 'edit-service':serviceForm(null,id);break;
 case 'open-service':selectedService=id;render();window.scrollTo(0,0);break;
 case 'back':selectedVehicle=null;selectedService=null;render();break;
 case 'back-service':selectedService=null;render();break;
 case 'close-modal':closeModal();break;
 case 'delete-vehicle':
  if(await ask('Eliminare auto e storico?','Saranno eliminati anche tutti gli interventi di questa auto. L’operazione non può essere annullata senza un backup.','Elimina auto')){
   const c=structuredClone(data());c.vehicles=c.vehicles.filter(v=>v.id!==id);c.services=c.services.filter(s=>s.vehicleID!==id);await store.commit(c);selectedVehicle=null;selectedService=null;render();toast('Auto e storico eliminati.');
  }break;
 case 'delete-service':
  if(await ask('Eliminare questo intervento?','Il lavoro sarà rimosso dallo storico. Anche il prossimo controllo potrebbe cambiare.','Elimina intervento')){
   const c=structuredClone(data());c.services=c.services.filter(s=>s.id!==id);await store.commit(c);selectedService=null;render();toast('Intervento eliminato.');
  }break;
 case 'demo':
  if(data().vehicles.some(v=>v.plate==='DEMO001')){toast('L’auto di esempio è già presente.');break;}
  if(await ask('Aggiungere un esempio?','Verrà aggiunta l’auto DEMO001 con un intervento dimostrativo, eliminabile dalla sua scheda.','Aggiungi esempio')){const demo=demoDatabase(),c=structuredClone(data());c.vehicles.push(...demo.vehicles);c.services.push(...demo.services);await store.commit(c);render();toast('Auto di esempio aggiunta.');}break;
 case 'export':download(backupObject(data()),`Officina-backup-${today()}.json`);toast('Backup JSON preparato. Salvalo in File o sul computer.');break;
 case 'encrypted-export':passwordForm('encrypted-export');break;
 case 'import':if(!store.db)throw Error('Archivio non disponibile. Riapri l’app in un browser con IndexedDB abilitato.');$('#import-file').click();break;
 case 'enable-vault':passwordForm('enable-vault');break;
 case 'change-vault':passwordForm('change-vault');break;
 case 'disable-vault':if(await ask('Disattivare la cifratura?','I dati locali saranno salvati in chiaro. La password non sarà più richiesta.','Disattiva')){await store.commit(data(),{encrypted:false,session:null,purgePrevious:true});render();toast('Cifratura disattivata.');}break;
 case 'lock':lockNow();break;
 case 'persist':if(!navigator.storage?.persist)throw Error('Questo browser non offre la richiesta di spazio persistente. Conserva backup esterni.');toast(await navigator.storage.persist()?'Spazio persistente concesso. Continua comunque a fare backup.':'Il browser non ha concesso lo spazio persistente. Conserva backup esterni.');break;
 case 'export-original':download(await store.original(),`Officina-originale-${today()}.json`);toast('Archivio originale preparato.');break;
 case 'export-previous':{const record=await store.previous();if(!record)throw Error('Nessuna copia interna precedente disponibile.');download({format:'officina-original-archive',version:1,record},`Officina-prima-ripristino-${today()}.json`);toast('Copia precedente preparata.');break;}
 case 'delete-previous':if(await ask('Eliminare la copia interna?','Verrà eliminata soltanto la copia di recupero prima dell’ultimo ripristino. L’archivio attuale rimane disponibile.','Elimina copia')){await store.removePrevious();toast('Copia interna eliminata.');}break;
 case 'download-service':{const s=data().services.find(s=>s.id===id);download(report(s),`Officina-${data().vehicles.find(v=>v.id===s.vehicleID).plate}-${s.date}.txt`,'text/plain;charset=utf-8');break;}
 case 'share-service':{const s=data().services.find(s=>s.id===id);if(navigator.share){try{await navigator.share({title:'Officina • Scheda intervento',text:report(s)});}catch(e){if(e.name!=='AbortError')throw e;}}else{download(report(s),`Officina-intervento-${s.date}.txt`,'text/plain;charset=utf-8');toast('Scheda scaricata come testo.');}break;}
 case 'update':if(updateWaiting&&!$('#modal').open)updateWaiting.postMessage({type:'SKIP_WAITING'});else toast('Chiudi il modulo dopo aver salvato prima di aggiornare.');break;
 }
}
function lockNow(){if(!store.encrypted)return;store.lock();pendingImport=null;$('#modal').close();$('#modal').innerHTML='';$('#confirm').close();render();toast('Archivio bloccato.');}
let unlockFailures=0;
document.addEventListener('click',event=>{
 const tabElement=event.target.closest('[data-tab]');if(tabElement){navigate(tabElement.dataset.tab);return;}
 const element=event.target.closest('[data-action]');if(element&&!submitting){action(element.dataset.action,element).catch(e=>toast(e.message));}
});
document.addEventListener('input',event=>{
 if(['parts-query','parts-context'].includes(event.target.id))updatePartsLinks();
 if(event.target.id==='search'){query=event.target.value;const q=query.toLocaleLowerCase(),normalized=normalizePlate(query);const cars=data().vehicles.filter(v=>!query||[v.plate,name(v),v.owner].join(' ').toLocaleLowerCase().includes(q)||v.plate.includes(normalized)).sort((a,b)=>a.plate.localeCompare(b.plate));$('#results').innerHTML=carResults(cars);}
});
document.addEventListener('change',event=>{
 if(event.target.id==='parts-preset'&&event.target.value){$('#parts-query').value=event.target.value;updatePartsLinks();}
 if(event.target.id==='all-filters'){$('#modal').querySelectorAll('[data-work-group="filtri"]').forEach(x=>x.checked=event.target.checked);syncFilters();}
 if(event.target.matches('[data-work-group="filtri"]'))syncFilters();
 if(event.target.name==='works'){if($('#engine-fields'))$('#engine-fields').hidden=!$('#modal').querySelector('[value="engineOil"]').checked;if($('#transmission-fields'))$('#transmission-fields').hidden=!$('#modal').querySelector('[value="transmissionOil"]')?.checked;}
});
document.addEventListener('submit',async event=>{
 const form=event.target;if(!['modal-form','unlock-form'].includes(form.id))return;event.preventDefault();if(submitting)return;
 submitting=true;const submitButton=form.querySelector('button[type="submit"]');submitButton.disabled=true;
 try{
  if(form.id==='unlock-form'){const password=String(new FormData(form).get('password')??'');await store.unlock(password);unlockFailures=0;lastActivity=Date.now();render();}
  else{const result=await submit(form);submitting=false;if($('#modal').open)closeModal();render();if(result)toast(result);}
 }catch(e){
  if(form.id==='unlock-form'){unlockFailures++;const error=$('#unlock-error');error.textContent=e.message;error.hidden=false;await new Promise(resolve=>setTimeout(resolve,Math.min(unlockFailures*500,5000)));}
  else{const error=$('#form-error');if(error){error.textContent=e.message;error.scrollIntoView({block:'nearest'});}else toast(e.message);}
 }finally{submitting=false;if(submitButton.isConnected)submitButton.disabled=false;}
});
$('#modal').addEventListener('cancel',event=>{event.preventDefault();closeModal();});
$('#import-file').addEventListener('change',async event=>{
 const file=event.target.files?.[0];event.target.value='';if(!file)return;
 try{if(file.size>MAX_IMPORT_BYTES)throw Error('Backup troppo grande: massimo 32 MB.');let raw;try{raw=JSON.parse(await file.text());}catch{throw Error('File JSON non valido.');}await doImport(raw);}catch(e){toast(e.message);}
});
for(const nameEvent of ['pointerdown','keydown'])document.addEventListener(nameEvent,()=>lastActivity=Date.now(),{passive:true});
setInterval(()=>{if(store.encrypted&&store.data&&!submitting&&Date.now()-lastActivity>600000)lockNow();},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&store.encrypted&&store.data&&Date.now()-lastActivity>600000)lockNow();});
window.addEventListener('pageshow',event=>{if(event.persisted&&store.encrypted)lockNow();});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;if(!$('#modal').open)render();});
window.addEventListener('appinstalled',()=>{installPrompt=null;if(!$('#modal').open)render();toast('Officina installata.');});
async function init(){
 try{await store.open();}catch(e){fatal=e.message;}
 render();setTimeout(()=>$('#splash').remove(),1200);
 if('serviceWorker' in navigator&&isSecureContext&&location.protocol!=='file:'){
  try{const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});if(registration.waiting){updateWaiting=registration.waiting;toast('Nuova versione disponibile in Backup.');}
   registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){updateWaiting=worker;toast('Nuova versione disponibile in Backup.');if(tab==='backup')render();}});});
   navigator.serviceWorker.ready.then(()=>{offlineReady=true;if($('#offline-status'))$('#offline-status').textContent=offlineMessage();});
   let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updateWaiting&&!refreshing){refreshing=true;location.reload();}});
  }catch{toast('Modalità offline non pronta. Riapri l’app con connessione e riprova.');}
 }
}
init();

function photoPreview(){return servicePhoto?`<figure class="vehicle-photo"><img src="${esc(servicePhoto)}" alt="Foto del veicolo"></figure>${button('Rimuovi foto','remove-photo','trash','secondary')}`:'<p class="muted">Nessuna foto aggiunta.</p>';}
async function preparePhoto(file){
 if(!file||file.size>20*1024*1024)throw Error('Scegli una foto fino a 20 MB.');
 if(!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type))throw Error('Scegli una foto JPG, PNG, WebP o HEIC.');
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;await img.decode();
  const scale=Math.min(1,1280/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
  for(const quality of [.82,.65,.45,.25]){const result=canvas.toDataURL('image/jpeg',quality);if(result.length<=700000)return result;}
  throw Error('Foto troppo dettagliata: scegli una foto più piccola.');
 }finally{URL.revokeObjectURL(url);}
}
document.addEventListener('click',event=>{
 const action=event.target.closest('[data-action]')?.dataset.action;
 if(action==='take-photo')$('#service-photo-camera')?.click();
 if(action==='choose-photo')$('#service-photo-file')?.click();
 if(action==='remove-photo'){photoGeneration++;photoProcessing=false;servicePhoto='';$('#service-photo-preview').innerHTML=photoPreview();$('#photo-status').textContent='Foto rimossa. Premi Salva per confermare.';}
});
document.addEventListener('change',async event=>{
 if(!['service-photo-camera','service-photo-file'].includes(event.target.id))return;
 const file=event.target.files?.[0];if(!file)return;
 const generation=++photoGeneration;photoProcessing=true;$('#photo-status').textContent='Preparazione della foto…';
 try{const photo=await preparePhoto(file);if(generation!==photoGeneration)return;servicePhoto=photo;$('#service-photo-preview').innerHTML=photoPreview();$('#photo-status').textContent='Foto pronta. Premi Salva per conservarla.';}
 catch(error){if(generation===photoGeneration)$('#photo-status').textContent='Foto non aggiunta: '+error.message;}
 finally{if(generation===photoGeneration)photoProcessing=false;event.target.value='';}
});

function photoFields(){return section('Foto del veicolo',`<div id="service-photo-preview">${photoPreview()}</div><div class="button-row">${button('Scatta foto','take-photo','car','secondary')}${button('Scegli foto','choose-photo','upload','secondary')}</div><input id="service-photo-camera" type="file" accept="image/*" capture="environment" hidden><input id="service-photo-file" type="file" accept="image/*" hidden><p class="help" id="photo-status">Una foto per intervento, salvata sul dispositivo e inclusa nel backup.</p>`);}
function vehiclePhotoForm(id){
 const v=data().vehicles.find(v=>v.id===id);if(!v)throw Error('Auto non trovata.');
 servicePhoto=v.photo??'';photoProcessing=false;photoGeneration++;
 modal('Foto auto',v.plate,photoFields(),'vehicle-photo',id,'Salva foto');
}

function kilometersForm(id){
 const v=data().vehicles.find(v=>v.id===id);if(!v)throw Error('Auto non trovata.');
 modal('Aggiorna km',v.plate,field('Km attuali *','kilometers',currentKM(data(),v),'text','required inputmode="numeric" pattern="[0-9]{1,7}" maxlength="7"')+'<p class="help">Inserisci i km senza punti o virgole. Le scadenze vengono aggiornate al salvataggio.</p>','update-km',id,'Salva km');
}

function oilChoice(value=''){
 return `<label class="field"><span>Olio motore</span><select name="engineOil"><option value="">Scegli olio</option>${['5W-30','5W-40',...(value&&!['5W-30','5W-40'].includes(value)?[value]:[])].map(o=>`<option value="${esc(o)}" ${value===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
}
function legacyWorks(group,selected){
 const old=WORKS.filter(w=>w[2]===group&&selected.includes(w[0])&&!selectableWorks.has(w[0]));
 return old.length?`<details><summary>Lavori già salvati nella versione precedente</summary><div class="checks">${old.map(w=>`<label class="check"><input type="checkbox" name="works" value="${w[0]}" checked>${esc(w[1])}</label>`).join('')}</div></details>`:'';
}
