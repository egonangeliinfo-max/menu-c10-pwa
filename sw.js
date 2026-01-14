self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Menu scuola";
  const body = data.body || "";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url: data.url || "./" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./";
  event.waitUntil(clients.openWindow(url));
});
