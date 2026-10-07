export const VERSION = 1;
export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_IMPORT_BYTES = 32 * 1024 * 1024;
export const WORKS = [
 ['frontShocks','Ammortizzatori anteriori','lavori'],['rearShocks','Ammortizzatori posteriori','lavori'],['frontLights','Luci anteriori','lavori'],['rearLights','Luci posteriori','lavori'],
 ['engineOil','Olio motore','olio'],['transmissionOil','Olio trasmissione','olio'],
 ['oilFilter','Filtro olio','filtri'],['airFilter','Filtro aria','filtri'],['fuelFilter','Filtro carburante','filtri'],['pollenFilter','Filtro polline','filtri'],['climateFilter','Filtro climatizzatore','filtri'],
 ['plugs','Candele','lavori'],['frontBrakes','Freni anteriori','lavori'],['rearBrakes','Freni posteriori','lavori'],['timing','Distribuzione completa','lavori'],['coolant','Liquido refrigerante','lavori'],['tires','Gomme','lavori'],['climateRecharge','Ricarica climatizzatore','lavori'],['accessoryBelts','Cinghie ausiliarie','lavori'],['battery','Batteria','lavori'],['clutch','Frizione','lavori'],['suspension','Sospensioni / ammortizzatori','lavori'],['diagnostics','Diagnosi elettronica','lavori'],['alignment','Convergenza / equilibratura','lavori'],['brakeFluid','Liquido freni','lavori'],['inspection','Controllo generale','lavori']
 ,["differentialOil","Olio differenziale","lavori"],
 ["powerSteeringFluid","Olio servosterzo","lavori"],
 ["gearboxFilter","Filtro cambio automatico","lavori"],
 ["beltOilService","Tagliando completo","lavori"],
 ["oilPump","Pompa olio","lavori"],
 ["oilLeaks","Perdite olio / guarnizioni","lavori"],
 ["headGasket","Guarnizione testata","lavori"],
 ["cylinderHead","Testata / valvole","lavori"],
 ["engineOverhaul","Revisione / sostituzione motore","lavori"],
 ["engineMounts","Supporti motore / cambio","lavori"],
 ["timingChain","Catena distribuzione / tenditori","lavori"],
 ["beltTensioners","Rulli / tenditori cinghie","lavori"],
 ["turbo","Turbocompressore","lavori"],
 ["intake","Collettore aspirazione","lavori"],
 ["throttle","Corpo farfallato","lavori"],
 ["injectors","Iniettori","lavori"],
 ["fuelPump","Pompa carburante / alta pressione","lavori"],
 ["fuelLines","Serbatoio / tubazioni carburante","lavori"],
 ["glowPlugs","Candelette / centralina preriscaldo","lavori"],
 ["ignitionCoils","Bobine / cavi accensione","lavori"],
 ["airflowSensors","Debimetro / sensori motore","lavori"],
 ["radiator","Radiatore / manicotti","lavori"],
 ["thermostat","Termostato","lavori"],
 ["waterPump","Pompa acqua","lavori"],
 ["coolingFan","Ventola raffreddamento","lavori"],
 ["expansionTank","Vaschetta liquido refrigerante","lavori"],
 ["gearbox","Cambio manuale / automatico","lavori"],
 ["automaticService","Manutenzione cambio automatico","lavori"],
 ["flywheel","Volano","lavori"],
 ["clutchHydraulics","Pompa / cilindretto frizione","lavori"],
 ["driveshafts","Semiassi / giunti omocinetici","lavori"],
 ["differential","Differenziale / ripartitore","lavori"],
 ["wheelBearings","Cuscinetti ruota / mozzi","lavori"],
 ["brakePads","Pastiglie freni","lavori"],
 ["brakeDiscs","Dischi freni","lavori"],
 ["brakeDrums","Tamburi / ganasce","lavori"],
 ["brakeCalipers","Pinze / cilindretti freni","lavori"],
 ["brakeHoses","Tubi / flessibili freni","lavori"],
 ["brakeMaster","Pompa freni / servofreno","lavori"],
 ["abs","ABS / ESP / sensori ruota","lavori"],
 ["parkingBrake","Freno a mano / freno elettrico","lavori"],
 ["brakeBleeding","Spurgo impianto freni","lavori"],
 ["steeringRack","Scatola sterzo / cremagliera","lavori"],
 ["steeringPump","Pompa servosterzo","lavori"],
 ["steeringLinks","Testine / tiranti sterzo","lavori"],
 ["electricSteering","Servosterzo elettrico","lavori"],
 ["controlArms","Bracci / silent block / snodi","lavori"],
 ["springs","Molle / supporti ammortizzatori","lavori"],
 ["stabilizer","Barra stabilizzatrice / biellette","lavori"],
 ["airSuspension","Sospensioni pneumatiche","lavori"],
 ["tireRepair","Riparazione pneumatici","lavori"],
 ["seasonalTires","Cambio gomme stagionale","lavori"],
 ["tpms","Sensori pressione gomme (TPMS)","lavori"],
 ["exhaust","Scarico / marmitta","lavori"],
 ["catalyst","Catalizzatore","lavori"],
 ["dpf","Filtro antiparticolato / rigenerazione","lavori"],
 ["egr","Valvola EGR","lavori"],
 ["adblue","Sistema AdBlue / SCR","lavori"],
 ["lambda","Sonda lambda / sensori scarico","lavori"],
 ["alternator","Alternatore","lavori"],
 ["starter","Motorino avviamento","lavori"],
 ["lights","Lampade / fari / regolazione luci","lavori"],
 ["wiring","Cablaggi / fusibili / relè","lavori"],
 ["ecu","Centraline / codifica / aggiornamento","lavori"],
 ["airbag","Airbag / sistema SRS","lavori"],
 ["adas","Calibrazione ADAS / telecamere / radar","lavori"],
 ["windows","Alzacristalli / serrature","lavori"],
 ["wipers","Tergicristalli / lavavetri","lavori"],
 ["acCompressor","Compressore climatizzatore","lavori"],
 ["acCondenser","Condensatore / evaporatore clima","lavori"],
 ["acLeaks","Ricerca perdite climatizzatore","lavori"],
 ["cabinHeating","Riscaldamento abitacolo / ventola","lavori"],
 ["acCleaning","Pulizia impianto climatizzazione","lavori"],
 ["glass","Parabrezza / vetri","lavori"],
 ["bodywork","Carrozzeria / verniciatura","lavori"],
 ["mirrors","Specchi / paraurti / finiture","lavori"],
 ["doors","Porte / cerniere / guarnizioni","lavori"],
 ["interior","Sedili / cinture / interni","lavori"],
 ["hybridDiagnosis","Diagnosi sistema ibrido / elettrico","lavori"],
 ["tractionBattery","Batteria di trazione / alta tensione","lavori"],
 ["charging","Sistema ricarica veicolo elettrico","lavori"],
 ["electricDrive","Motore elettrico / inverter","lavori"],
 ["hvCooling","Raffreddamento batteria / inverter","lavori"],
 ["roadTest","Prova su strada","lavori"],
 ["preInspection","Controllo pre-revisione","lavori"],
 ["prePurchase","Controllo pre-acquisto","lavori"],
 ["leakCheck","Ricerca perdite / infiltrazioni","lavori"],
 ["compression","Test compressione / tenuta cilindri","lavori"]
];
const workIDs = new Set(WORKS.map(w=>w[0]));
const nativeNames = {...Object.fromEntries(WORKS.map(w=>[w[1],w[0]])),'Distribuzione / pompa acqua':'timing','Filtro antipolline':'pollenFilter'};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function newID(){
 if(globalThis.crypto?.randomUUID)return crypto.randomUUID();
 if(!globalThis.crypto?.getRandomValues)throw Error('Il browser non offre un generatore sicuro per gli identificativi.');
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const h=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
 return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
export function emptyDatabase(){ return {version:VERSION,vehicles:[],services:[]}; }
export function normalizePlate(value){ return String(value).toUpperCase().replace(/[\s-]/g,''); }
export function integer(value,label='Km'){
 const text=String(value).trim();
 if(!/^\d{1,7}$/.test(text)) throw Error(`${label}: inserisci un intero tra 0 e 9.999.999, senza punti o virgole.`);
 return Number(text);
}
export function amount(value){
 const text=String(value).trim().replace(',','.');
 if(!text) return null;
 if(!/^\d{1,9}(\.\d{1,2})?$/.test(text)||Number(text)>999999999) throw Error('Importo non valido. Esempio: 120,50, senza separatori delle migliaia.');
 return Math.round(Number(text)*100)/100;
}
export function today(now=new Date()){
 return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function validDate(s){
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
 const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;
}
export function sortedServices(db,id){return db.services.filter(s=>s.vehicleID===id).sort((a,b)=>b.date.localeCompare(a.date)||b.kilometers-a.kilometers||b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));}
export function currentKM(db,v){return Math.max(v.kilometers,...db.services.filter(s=>s.vehicleID===v.id).map(s=>s.kilometers));}
export function latest(db,v){return sortedServices(db,v.id)[0];}
export function due(db,v,day=today()){
 const s=latest(db,v);return !!s&&((s.nextKilometers!==null&&currentKM(db,v)>=s.nextKilometers)||(s.nextDate!==null&&s.nextDate<=day));
}
function text(x,key,max=2000){if(typeof x[key]!=='string'||x[key].length>max)throw Error(`Campo ${key} non valido.`);return x[key];}
function id(value){if(typeof value!=='string'||!UUID.test(value))throw Error('Identificativo non valido.');return value.toLowerCase();}
function kmNumber(n){if(!Number.isInteger(n)||n<0||n>9999999)throw Error('Chilometraggio non valido.');return n;}
function timestamp(s){if(typeof s!=='string'||s.length>40||!Number.isFinite(Date.parse(s)))throw Error('Data di creazione non valida.');return new Date(s).toISOString();}
export function validateDatabase(raw){
 if(!raw||raw.version!==VERSION||!Array.isArray(raw.vehicles)||!Array.isArray(raw.services))throw Error('Formato o versione del backup non supportati.');
 if(raw.vehicles.length>20000||raw.services.length>100000)throw Error('Archivio troppo grande.');
 const vehicles=raw.vehicles.map(v=>{
  if(!v||typeof v!=='object')throw Error('Scheda auto non valida.');
  const plate=normalizePlate(text(v,'plate',24));if(!plate)throw Error('Targa obbligatoria.');
  const plannedWorks=v.plannedWorks??[];if(!Array.isArray(plannedWorks)||new Set(plannedWorks).size!==plannedWorks.length||plannedWorks.some(w=>!workIDs.has(w)))throw Error('Interventi da fare non validi.');
  const plannedOther=v.plannedOther??'';if(typeof plannedOther!=='string'||plannedOther.length>2000)throw Error('Altri interventi da fare non validi.');
  return {photo:validatedPhoto(v.photo),plannedWorks:[...plannedWorks],plannedOther,id:id(v.id),plate,make:text(v,'make',100),model:text(v,'model',100),owner:text(v,'owner',200),phone:text(v,'phone',80),kilometers:kmNumber(v.kilometers),notes:text(v,'notes',10000),createdAt:timestamp(v.createdAt)};
 });
 const vehicleIDs=new Set(vehicles.map(v=>v.id));
 if(vehicleIDs.size!==vehicles.length||new Set(vehicles.map(v=>v.plate)).size!==vehicles.length)throw Error('Auto o targhe duplicate: questa targa è già presente nell’archivio.');
 const services=raw.services.map(s=>{
  if(!s||typeof s!=='object')throw Error('Scheda intervento non valida.');
  const vehicleID=id(s.vehicleID);if(!vehicleIDs.has(vehicleID))throw Error('Intervento senza auto associata.');
  if(!validDate(s.date))throw Error('Data intervento non valida.');
  if(!Array.isArray(s.works)||new Set(s.works).size!==s.works.length||s.works.some(w=>!workIDs.has(w)))throw Error('Lavori non validi.');
  const otherWork=text(s,'otherWork',2000);if(!s.works.length&&!otherWork.trim())throw Error('Seleziona almeno un lavoro o descrivine uno personalizzato.');
  const kilometers=kmNumber(s.kilometers);
  const nextKilometers=s.nextKilometers??null;
  if(nextKilometers!==null&&(kmNumber(nextKilometers)<=kilometers))throw Error('Il prossimo controllo deve avere km superiori a quelli dell’intervento.');
  const nextDate=s.nextDate??null;
  if(nextDate!==null&&(!validDate(nextDate)||nextDate<s.date))throw Error('Data prossimo controllo non valida.');
  const cost=s.cost??null;if(cost!==null&&(typeof cost!=='number'||!Number.isFinite(cost)||cost<0||cost>999999999||Math.abs(cost*100-Math.round(cost*100))>0.0001))throw Error('Costo non valido.');
  const oilLiters=text(s,'oilLiters',20);
  if(oilLiters){const liters=amount(oilLiters);if(liters===null||liters<=0||liters>100)throw Error('Quantità olio non valida.');}
  const photo=validatedPhoto(s.photo);
  return {photo,id:id(s.id),vehicleID,date:s.date,kilometers,works:[...s.works],engineOil:text(s,'engineOil',300),oilLiters,transmissionOil:text(s,'transmissionOil',300),parts:text(s,'parts',5000),otherWork,notes:text(s,'notes',10000),cost,nextKilometers,nextDate,createdAt:timestamp(s.createdAt)};
 });
 if(new Set(services.map(s=>s.id)).size!==services.length)throw Error('Interventi duplicati nel backup.');
 return {version:VERSION,vehicles,services};
}
export function validateChronology(db,service){
 const others=db.services.filter(s=>s.vehicleID===service.vehicleID&&s.id!==service.id);
 if(others.some(s=>s.date<service.date&&s.kilometers>service.kilometers))throw Error('Km inferiori a quelli di un intervento precedente. Controlla data e km.');
 if(others.some(s=>s.date>service.date&&s.kilometers<service.kilometers))throw Error('Km superiori a quelli di un intervento successivo. Controlla data e km.');
}
export function serviceTitle(s){return [...s.works.map(k=>WORKS.find(w=>w[0]===k)?.[1]??k),...(s.otherWork?[s.otherWork]:[])].join(', ');}
export function parseBackup(text){
 if(new TextEncoder().encode(text).byteLength>MAX_IMPORT_BYTES)throw Error('Backup troppo grande: massimo 32 MB.');
 let raw;try{raw=JSON.parse(text);}catch{throw Error('Il file non contiene un JSON valido.');}
 if(raw?.format==='officina-backup')return validateDatabase(raw.database);
 // Migration from the SwiftUI app in this conversation. Distinct work raw values identify it.
 if(raw?.version===1&&Array.isArray(raw.services)&&raw.services.some(s=>s.works?.some(w=>nativeNames[w])||String(s.date).includes('T'))){
  raw={...raw,services:raw.services.map(s=>({...s,date:String(s.date).slice(0,10),nextDate:s.nextDate?String(s.nextDate).slice(0,10):null,works:s.works.map(w=>nativeNames[w]??w),cost:s.cost==null?null:Number(s.cost)}))};
 }
 return validateDatabase(raw);
}
export function backupObject(db){return {format:'officina-backup',version:1,exportedAt:new Date().toISOString(),database:validateDatabase(db)};}
export function demoDatabase(){
 const now=new Date().toISOString();const vehicleID=newID();
 const v={id:vehicleID,plate:'DEMO001',make:'Fiat',model:'Panda',owner:'Cliente di esempio',phone:'',kilometers:85000,notes:'Dati dimostrativi, eliminabili.',createdAt:now};
 const s={id:newID(),vehicleID,date:today(),kilometers:85000,works:['engineOil','oilFilter','airFilter','inspection'],engineOil:'5W-30 • esempio, verificare specifiche veicolo',oilLiters:'3,5',transmissionOil:'',parts:'Ricambi di esempio',otherWork:'',notes:'Intervento dimostrativo.',cost:150,nextKilometers:100000,nextDate:null,createdAt:now};
 return {version:1,vehicles:[v],services:[s]};
}

function validatedPhoto(value){const photo=value??'';if(typeof photo!=='string'||photo.length>700000||(photo&&!/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(photo)))throw Error('Foto non valida.');return photo;}
