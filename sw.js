// Torna a app instalável no telemóvel e deixa-a abrir mesmo sem rede.
// Vai sempre primeiro à rede (para ter a versão mais recente); só usa a cópia guardada se a rede falhar.
// Os dados não passam por aqui: vão diretamente para o Supabase.
const CACHE = 'gestao-formacao-v1';
const ESSENCIAL = ['gestao-formacao.html', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'icone-180.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESSENCIAL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('gestao-formacao.html'))));
});
