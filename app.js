const WORKER_URL = "https://menu-push-c10.egon-angeli-info.workers.dev";
const VAPID_PUBLIC_KEY = "BNjswK7hjXgdXlviYKHKOaqVQaG0Wsg1w6oIT9h8c-FrMDFqHrWh8QZonpM6VUjPW8az-fwq4Pd0uzANpq4KAGo";
const SOURCE_ID = "c10";

function getOutEl() {
  return document.getElementById("out");
}

// Espone la funzione che index.html chiama dopo aver ottenuto il permesso
window.enablePush = async function enablePush() {
  const out = getOutEl();

  try {
    if (!("serviceWorker" in navigator)) throw new Error("Service Worker non supportato");
    if (!("PushManager" in window)) throw new Error("Push non supportato");

    // registra SW (se già registrato, lo riusa)
    const reg = await navigator.serviceWorker.register("./sw.js");

    // qui il permesso è già granted (lo chiede index.html), ma facciamo un check
    if (!("Notification" in window)) throw new Error("Notification API non supportata");
    if (Notification.permission !== "granted") {
      throw new Error("Permesso notifiche non concesso");
    }

    // subscribe push
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // invio al Worker
    const res = await fetch(`${WORKER_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceId: SOURCE_ID,
        subscription: sub.toJSON()
      })
    });

    const json = await res.json();
    if (out) out.textContent = JSON.stringify(json, null, 2);

    if (!res.ok || !json?.ok) {
      throw new Error(`Subscribe failed: ${res.status} ${JSON.stringify(json)}`);
    }

    return json; // utile per debug
  } catch (e) {
    if (out) out.textContent = String(e);
    throw e;
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
