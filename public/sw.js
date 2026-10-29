// Service worker mínimo: só serve para exibir notificações no celular (Android/PWA).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.navigate('/admin/vendas'); return c.focus(); }
      }
      return self.clients.openWindow('/admin/vendas');
    })
  );
});
