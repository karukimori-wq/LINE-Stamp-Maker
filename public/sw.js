const CACHE_NAME='line-stamp-maker-shell-v2';
const APP_SHELL=['/','/projects/new','/settings','/icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  // HTML navigation: always prefer the latest deployed app, use cache only when offline.
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      const clone=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(request,clone));
      return response;
    }).catch(()=>caches.match(request).then(hit=>hit||caches.match('/'))));
    return;
  }

  // Avoid persisting dynamic Next.js/RSC responses as app data.
  if(url.pathname.startsWith('/_next/')||request.headers.get('RSC')==='1'){
    event.respondWith(fetch(request).catch(()=>caches.match(request)));
    return;
  }

  // Static same-origin assets: cache-first, then refresh cache from network.
  event.respondWith(caches.match(request).then(cached=>{
    const network=fetch(request).then(response=>{
      if(response.ok){const clone=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,clone));}
      return response;
    });
    return cached||network;
  }));
});
