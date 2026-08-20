const CACHE='quizapp-v3';
const ASSETS=[
  './index.html','./manifest.json','./icon-192.png','./icon-512.png','./sample-data.js',
  'https://cdn.jsdelivr.net/npm/yakuhanjp@4.1.0/dist/css/yakuhanjp.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>
    // 各アセットを個別に取得。外部CDNが失敗してもinstall全体は成功させる
    Promise.all(ASSETS.map(u=>c.add(u).catch(()=>{})))
  ).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
