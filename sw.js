self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Menu scuola", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Menu scuola";
  const body = data.body || "";
  const url = data.url || "./";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: "menu-c10",
      renotify: true,
      data: { url }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./";
  event.waitUntil(clients.openWindow(url));
});
