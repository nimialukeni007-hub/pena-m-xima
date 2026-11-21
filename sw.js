/* Pena Máxima: abre rápido e mesmo com a ligação fraca */
const C='pm-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;if(/admin|adm-sw/.test(u.pathname))return;
 if(r.mode==='navigate'){e.respondWith(new Promise(res=>{let done=0;const fb=()=>caches.match('index.html').then(m=>m||caches.match('./')).then(m=>{if(!done&&m){done=1;res(m)}});
   const t=setTimeout(fb,4000);fetch(r).then(n=>{clearTimeout(t);if(!done){done=1;res(n.clone());caches.open(C).then(c=>c.put('index.html',n.clone()))}else caches.open(C).then(c=>c.put('index.html',n))}).catch(()=>{clearTimeout(t);fb();if(!done)res(Response.error())})}));return}
 e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{const f=fetch(r).then(n=>{if(n&&n.ok)c.put(r,n.clone());return n}).catch(()=>m);return m||f})))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return self.clients.openWindow&&self.clients.openWindow('./admin.html')}))});
