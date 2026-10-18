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
  const original = event.notification.data?.url || "./";
  // La preferenza V1/V2 risiede nel localStorage della pagina, non è accessibile dal service worker.
  // Passa sempre dall'ingresso comune: la pagina sceglie la versione senza alterare le iscrizioni push.
  const destination = new URL("./index.html", self.registration.scope);
  destination.searchParams.set("from", "push");
  try {
    const target = new URL(original, self.registration.scope);
    if (target.origin === destination.origin && target.pathname.startsWith(new URL(self.registration.scope).pathname)) {
      destination.searchParams.set("target", target.pathname + target.search + target.hash);
    }
  } catch (_) {}
  event.waitUntil(clients.openWindow(destination.href));
});
