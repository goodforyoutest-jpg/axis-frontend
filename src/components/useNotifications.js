// FILE: src/components/useNotifications.js

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Convert a base64 VAPID public key to a Uint8Array
 * required by PushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * useNotifications
 *
 * React hook that manages the full push notification subscription lifecycle.
 *
 * Returns:
 *   - permission: "default" | "granted" | "denied"
 *   - subscribed: boolean — true if this device is subscribed
 *   - loading: boolean — true while async operations are in progress
 *   - supported: boolean — false if browser lacks required APIs
 *   - error: string | null — last error message (non-throwing)
 *   - subscribe: () => Promise<void> — call to request permission + subscribe
 *   - unsubscribe: () => Promise<void> — call to unsubscribe this device
 */
export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swRef = useRef(null); // holds ServiceWorkerRegistration

  // Feature detection
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // ─── Fetch VAPID key from backend ──────────────────────────────────────────
  const getVapidKey = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/notify/vapid-public-key`);
    if (!res.ok) throw new Error("Failed to fetch VAPID key.");
    const { publicKey } = await res.json();
    if (!publicKey) throw new Error("VAPID public key missing.");
    return publicKey;
  }, []);

  // ─── Register service worker ────────────────────────────────────────────────
  const registerSW = useCallback(async () => {
    if (!supported) return null;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      // Wait for the SW to be ready
      await navigator.serviceWorker.ready;
      swRef.current = reg;
      return reg;
    } catch (err) {
      console.warn("[AXIS Push] SW registration failed:", err.message);
      return null;
    }
  }, [supported]);

  // ─── Get active PushSubscription from SW ───────────────────────────────────
  const getExistingSubscription = useCallback(async (reg) => {
    if (!reg) return null;
    try {
      return await reg.pushManager.getSubscription();
    } catch {
      return null;
    }
  }, []);

  // ─── Save subscription to backend ──────────────────────────────────────────
  const saveToBackend = useCallback(async (subscription) => {
    const res = await fetch(`${API_BASE}/api/notify/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Backend save failed.");
    }
  }, []);

  // ─── Mount: check existing subscription status ──────────────────────────────
  useEffect(() => {
    if (!supported) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const reg = await registerSW();
        if (cancelled) return;

        if (!reg) {
          setSubscribed(false);
          setLoading(false);
          return;
        }

        setPermission(Notification.permission);

        const existing = await getExistingSubscription(reg);
        if (cancelled) return;

        if (existing) {
          // Rehydrate backend silently in case it was cleared
          try {
            await saveToBackend(existing.toJSON());
          } catch {
            // Non-fatal: we still mark as subscribed locally
          }
          setSubscribed(true);
        } else {
          setSubscribed(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[AXIS Push] Init error:", err.message);
          setError(err.message);
          setSubscribed(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [supported, registerSW, getExistingSubscription, saveToBackend]);

  // ─── Subscribe ──────────────────────────────────────────────────────────────
  const subscribe = useCallback(async () => {
    if (!supported) {
      setError("Push notifications are not supported on this device.");
      return;
    }

    if (Notification.permission === "denied") {
      setError(
        "Notifications are blocked. Please enable them in browser settings."
      );
      setPermission("denied");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure SW is registered
      let reg = swRef.current;
      if (!reg) {
        reg = await registerSW();
        if (!reg) throw new Error("Service worker could not be registered.");
      }

      // Check for existing sub first
      const existing = await getExistingSubscription(reg);
      if (existing) {
        await saveToBackend(existing.toJSON());
        setSubscribed(true);
        setPermission("granted");
        setLoading(false);
        return;
      }

      // Request permission (Android Chrome: must be triggered by user gesture)
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setError("Notification permission was not granted.");
        setLoading(false);
        return;
      }

      // Get VAPID key
      const vapidKey = await getVapidKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);

      // Subscribe to push
      const pushSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Save to backend
      await saveToBackend(pushSub.toJSON());
      setSubscribed(true);
    } catch (err) {
      console.error("[AXIS Push] Subscribe error:", err.message);

      // Friendly messages for common errors
      let friendlyMsg = err.message;
      if (err.name === "NotAllowedError") {
        friendlyMsg = "Notification permission denied by user.";
      } else if (err.name === "AbortError") {
        friendlyMsg = "Subscription aborted. Please try again.";
      } else if (err.message.includes("Registration failed")) {
        friendlyMsg =
          "Service worker failed to register. Try refreshing the page.";
      }

      setError(friendlyMsg);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [
    supported,
    registerSW,
    getExistingSubscription,
    getVapidKey,
    saveToBackend,
  ]);

  // ─── Unsubscribe ────────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async () => {
    if (!supported) return;

    setLoading(true);
    setError(null);

    try {
      const reg = swRef.current || (await registerSW());
      if (!reg) {
        setSubscribed(false);
        return;
      }

      const existing = await getExistingSubscription(reg);
      if (!existing) {
        setSubscribed(false);
        return;
      }

      await existing.unsubscribe();
      setSubscribed(false);
      // Note: Backend will auto-clean on next send (410 response)
    } catch (err) {
      console.warn("[AXIS Push] Unsubscribe error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supported, registerSW, getExistingSubscription]);

  return {
    permission,
    subscribed,
    loading,
    supported,
    error,
    subscribe,
    unsubscribe,
  };
}

export default useNotifications;
