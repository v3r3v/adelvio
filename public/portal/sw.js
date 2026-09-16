// Network-only portal: no cache storage, no offline customer data, no background sync.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate')return;
  event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Adelvio · Sin conexión</title><body style="font:18px system-ui;background:#f5f3ec;color:#242421;padding:40px;max-width:600px"><h1>Volvemos a conectar.</h1><p>El portal necesita internet para mostrar información actualizada. Por privacidad, no guardamos datos de clientes sin conexión.</p><p>Comprueba tu conexión y vuelve a cargar la página.</p></body></html>',{status:503,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}})));
});
