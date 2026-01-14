const WORKER_URL = "https://menu-push-c10.egon-angeli-info.workers.dev";
const VAPID_PUBLIC_KEY = "BNjswK7hjXgdXlviYKHKOaqVQaG0Wsg1w6oIT9h8c-FrMDFqHrWh8QZonpM6VUjPW8az-fwq4Pd0uzANpq4KAGo";
const SOURCE_ID = "c10";

const out = document.getElementById("out");
const btn = document.getElementById("btn");
out.textContent = "APP LOADED ✅";
console.log("APP LOADED");

btn.onclick = async () => {
  out.textContent = "CLICK OK";
  try {
    if (!("serviceWorker" in navigator)) throw new Error("Service Worker non supportato");
    if (!("PushManager" in window)) throw new Error("Push non supportato");

    const reg = await navigator.serviceWorker.register("./sw.js");

    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error("Permesso notifiche negato");

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const res = await fetch(`${WORKER_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceId: SOURCE_ID,
        subscription: sub.toJSON()
      })
    });

    const json = await res.json();
    out.textContent = JSON.stringify(json, null, 2);
  } catch (e) {
    out.textContent = String(e);
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
