import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

export default function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => reg.pushManager.getSubscription())
        .then(sub => { if (sub) setSubscribed(true); })
        .catch(() => {});
    }
  }, []);

  const subscribe = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        alert('Service workers not supported in this browser');
        return false;
      }
      if (!('PushManager' in window)) {
        alert('Push notifications not supported');
        return false;
      }
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const keyRes = await axios.get(`${API}/api/notify/vapid-public-key`);
      const publicKey = keyRes.data.publicKey;
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      await axios.post(`${API}/api/notify/subscribe`, subscription.toJSON());
      setSubscribed(true);
      return true;
    } catch (e) {
      console.error('Subscription error:', e.message);
      return false;
    }
  };

  return { permission, subscribed, subscribe };
}
