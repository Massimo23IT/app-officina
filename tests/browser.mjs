import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright'):require('playwright');
let launchOptions={headless:true};
if(process.env.CHROMIUM_PACKAGE){const mod=require(process.env.CHROMIUM_PACKAGE),binary=mod.default??mod;launchOptions={...launchOptions,executablePath:await binary.executablePath(),args:binary.args.filter(x=>!x.includes("disable-web-security")&&!x.includes("allow-running-insecure-content"))};}
const server=spawn('python3',[fileURLToPath(new URL('../avvia_locale.py',import.meta.url)),'--port','8099','--no-browser'],{stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('Server locale terminato: '+code)));});
const browser=await chromium.launch(launchOptions);
const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
const page=await context.newPage();const issues=[];page.on('pageerror',e=>issues.push(e.message));
page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('favicon'))issues.push(message.text());});
const root=process.env.OFFICINA_URL??'http://127.0.0.1:8099/';
const qaRoot=fileURLToPath(new URL('../../qa-results/',import.meta.url));await mkdir(qaRoot,{recursive:true});
const temp=await mkdtemp(path.join(qaRoot,'officina-qa-'));
try{
 const response=await page.goto(root);assert.match(response.headers()['content-security-policy'],/frame-ancestors 'none'/);assert.equal(response.headers()['x-content-type-options'],'nosniff');
 await page.locator('#splash').waitFor({state:'detached'});
 await page.getByRole('button',{name:'Nuova auto',exact:true}).click();
 await page.locator('[name=plate]').fill('ab 123-cd');await page.locator('[name=kilometers]').fill('85000');await page.locator('[name=make]').fill('Fiat');await page.locator('[name=model]').fill('Panda');
 const injection='<img src=x onerror="window.attacked=true">';await page.locator('[name=owner]').fill(injection);
 await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});await page.getByRole('heading',{name:'AB123CD',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.attacked),undefined);assert.equal(await page.locator('img[src="x"]').count(),0);
 await page.getByRole('button',{name:'Le tue auto',exact:true}).click();
 await page.getByRole('button',{name:'Nuova auto',exact:true}).click();await page.locator('[name=plate]').fill('AB123CD');await page.locator('[name=kilometers]').fill('85000');await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#form-error').filter({hasText:'duplicate'}).waitFor();await page.getByRole('button',{name:'Annulla',exact:true}).click();
 await page.getByRole('button',{name:'Apri auto AB123CD',exact:true}).click();await page.getByRole('button',{name:'Registra intervento',exact:true}).click();
 await page.locator('[value=engineOil]').check();await page.locator('[name=engineOil]').fill('5W-30');await page.locator('[name=oilLiters]').fill('3,5');await page.locator('#all-filters').check();assert.equal(await page.locator('[data-work-group="filtri"]:checked').count(),5);
 await page.locator('[value=climateFilter]').uncheck();assert.equal(await page.locator('#all-filters').isChecked(),false);
 await page.locator('[name=cost]').fill('120,50');await page.locator('[name=nextKilometers]').fill('100000');await page.locator('[name=notes]').fill('Test di persistenza');
 await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});await page.getByRole('heading',{name:'Scheda intervento',exact:true}).waitFor();
 assert.match(await page.locator('#view').innerText(),/120,50/);
 await page.reload();await page.locator('#splash').waitFor({state:'detached'});assert.equal(await page.locator('.vehicle-card').count(),1);
 await page.getByRole('button',{name:'Apri auto AB123CD',exact:true}).click();assert.equal(await page.locator('.service-card').count(),1);
 await page.getByRole('button',{name:'Modifica',exact:true}).click();await page.locator('[name=kilometers]').fill('100000');await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});assert.match(await page.locator('#view').innerText(),/Da effettuare/);
 await page.locator('[data-tab=backup]').click();await page.getByRole('button',{name:'Backup cifrato',exact:true}).click();await page.locator('[name=password]').fill('Backup-test-2026');await page.locator('[name=confirmPassword]').fill('Backup-test-2026');
 const encryptedDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Esporta backup',exact:true}).click();const downloaded=await encryptedDownload;const backupPath=path.join(temp,'backup.json');await downloaded.saveAs(backupPath);await page.locator('#modal').waitFor({state:'hidden'});
 const envelope=JSON.parse(await readFile(backupPath,'utf8'));assert.equal(envelope.format,'officina-encrypted');assert.equal(envelope.purpose,'backup');assert.equal(JSON.stringify(envelope).includes(injection),false);
 await page.getByRole('button',{name:'Attiva cifratura',exact:true}).click();await page.locator('[name=password]').fill('Vault-test-2026');await page.locator('[name=confirmPassword]').fill('Vault-test-2026');await page.getByRole('button',{name:'Cifra archivio',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});
 assert.match(await page.locator('#view').innerText(),/Archivio cifrato/);
 const record=await page.evaluate(async()=>{const {LocalStore}=await import('./storage.js');const s=new LocalStore();await s.open();return await s.read();});assert.equal(record.payload.format,'officina-encrypted');assert.equal(JSON.stringify(record).includes('AB123CD'),false);
 await page.reload();await page.locator('#splash').waitFor({state:'detached'});await page.locator('#unlock-form').waitFor();await page.locator('[name=password]').fill('errata');await page.getByRole('button',{name:'Sblocca archivio',exact:true}).click();await page.locator('#unlock-error').filter({hasText:'Password errata'}).waitFor();await page.getByRole('button',{name:'Sblocca archivio'}).waitFor();
 await page.waitForFunction(()=>!document.querySelector('#unlock-form button').disabled);await page.locator('[name=password]').fill('Vault-test-2026');await page.getByRole('button',{name:'Sblocca archivio',exact:true}).click();await page.locator('.vehicle-card').waitFor();
 // Same-origin offline app-shell reload and read/write while disconnected.
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await page.locator('#splash').waitFor({state:'detached'});await page.locator('#unlock-form').waitFor();await page.locator('[name=password]').fill('Vault-test-2026');await page.getByRole('button',{name:'Sblocca archivio',exact:true}).click();await page.locator('.vehicle-card').waitFor();
 await page.getByRole('button',{name:'Nuova auto',exact:true}).click();await page.locator('[name=plate]').fill('EF456GH');await page.locator('[name=kilometers]').fill('2000');await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});
 await context.setOffline(false);await page.locator('[data-tab=backup]').click();await page.locator('#import-file').setInputFiles(backupPath);await page.locator('[name=password]').fill('Backup-test-2026');await page.getByRole('button',{name:'Apri backup',exact:true}).click();await page.locator('#confirm').waitFor({state:'visible'});await page.locator('#confirm-yes').click();await page.locator('.vehicle-card').waitFor();assert.equal(await page.locator('.vehicle-card').count(),1);
 const safety=await page.evaluate(async()=>{const {LocalStore}=await import('./storage.js');const s=new LocalStore();await s.open();return await s.previous();});assert.equal(safety.payload.format,'officina-encrypted');
 // Modify an existing service, then delete a temporary vehicle and its service without affecting the first.
 await page.getByRole('button',{name:'Apri auto AB123CD',exact:true}).click();await page.locator('.service-main').click();await page.getByRole('button',{name:'Modifica',exact:true}).click();await page.locator('[name=notes]').fill('Intervento modificato');await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});assert.match(await page.locator('#view').innerText(),/Intervento modificato/);
 await page.locator('[data-tab=auto]').click();await page.getByRole('button',{name:'Nuova auto',exact:true}).click();await page.locator('[name=plate]').fill('TEMP001');await page.locator('[name=kilometers]').fill('2000');await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Registra intervento',exact:true}).click();await page.locator('[value=diagnostics]').check();await page.getByRole('button',{name:'Salva',exact:true}).click();await page.locator('#modal').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Elimina intervento',exact:true}).click();await page.locator('#confirm-yes').click();await page.getByRole('heading',{name:'TEMP001',exact:true}).waitFor();assert.equal(await page.locator('.service-card').count(),0);
 await page.getByRole('button',{name:'Elimina auto e storico',exact:true}).click();await page.locator('#confirm-yes').click();await page.locator('.vehicle-card').waitFor();assert.equal(await page.locator('.vehicle-card').count(),1);
 // Optimistic locking prevents silent overwrites by another window.
 const conflict=await page.evaluate(async()=>{const {LocalStore}=await import('./storage.js');const a=new LocalStore(),b=new LocalStore();await a.open();await b.open();await a.unlock('Vault-test-2026');await b.unlock('Vault-test-2026');const first=structuredClone(a.data);first.vehicles[0].notes='Primo salvataggio';await a.commit(first);try{await b.commit(b.data);return false;}catch(e){return e.message.includes('altra finestra');}});assert.equal(conflict,true);
 const failedWrite=await page.evaluate(async()=>{const {LocalStore}=await import('./storage.js');const s=new LocalStore();await s.open();await s.unlock('Vault-test-2026');const before=JSON.stringify(s.data),next=structuredClone(s.data);next.vehicles[0].notes='Modifica non salvata';s.db.close();try{await s.commit(next);return false;}catch{return JSON.stringify(s.data)===before;}});assert.equal(failedWrite,true);
 // Small screen and desktop layout must not cause horizontal overflow.
 await page.reload();await page.locator('#splash').waitFor({state:'detached'});await page.locator('[name=password]').fill('Vault-test-2026');await page.getByRole('button',{name:'Sblocca archivio',exact:true}).click();await page.locator('.vehicle-card').waitFor();
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024},{width:1440,height:1000}]){
  await page.setViewportSize(viewport);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow a ${viewport.width}`);
 }
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(temp,'desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(temp,'mobile.png'),fullPage:true});
 assert.deepEqual(issues,[]);
 console.log('PASS: UI CRUD, duplicati, XSS, persistenza, km/scadenze, backup cifrato, password, offline, ripristino, copia interna, conflitti e layout 320/390/768/1440.');
 console.log('Screenshot QA: '+temp);
}finally{await browser.close();server.kill();}
