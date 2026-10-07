const CACHE='officina-shell-v1.2.4-only-smilzo';
const ASSETS=['./','./index.html','./app.css','./app.js','./core.js','./reports.js','./crypto.js','./storage.js','./manifest.webmanifest','./assets/meccanico.webp','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('officina-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){event.respondWith(caches.match('./index.html').then(hit=>hit||fetch(request)));return;}
 // Only the app shell is cached; no backups or customer records enter the HTTP cache.
 if(ASSETS.some(path=>new URL(path,self.registration.scope).href===url.href))event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
