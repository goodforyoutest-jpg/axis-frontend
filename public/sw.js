// FILE: public/sw.js

const CACHE_NAME = "axis-shell-v1";
const OFFLINE_URL = "/offline.html";

// App shell files to cache on install
const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/badge-72x72.png",
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── FETCH (Cache-first for shell, network-first for API) ─────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension requests
  if (event.request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // API requests: network-first, no cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          JSON.stringify({ error: "Offline. Please check your connection." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  // Navigation requests: network-first, fallback to cached index, then offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("/index.html");
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached || new Response("", { status: 404 }));
    })
  );
});

// ─── PUSH ─────────────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: "AXIS",
        body: event.data.text() || "You have a new notification.",
        url: "/",
      };
    }
  }

  const title = data.title || "AXIS";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    vibrate: data.vibrate || [100, 50, 100, 50, 200],
    tag: data.tag || `axis-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    silent: false,
    timestamp: data.timestamp || Date.now(),
    data: {
      url: data.url || "/",
      type: data.type || "general",
      ...data,
    },
    actions: data.actions || [
      {
        action: "open",
        title: "Open",
        icon: "/icons/action-open.png",
      },
      {
        action: "snooze",
        title: "Snooze 10m",
        icon: "/icons/action-snooze.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/action-dismiss.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  const targetUrl = data.url || "/";

  notification.close();

  if (action === "dismiss") {
    // Just close — already done above
    return;
  }

  if (action === "snooze") {
    event.waitUntil(
      (async () => {
        await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
        await self.registration.showNotification(notification.title, {
          body: `(Snoozed) ${notification.body}`,
          icon: notification.icon || "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          tag: `snooze-${notification.tag}`,
          data: notification.data,
          actions: notification.actions,
          vibrate: [200, 100, 200],
        });
      })()
    );
    return;
  }

  // action === "open" or no action (body tap)
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Try to focus an existing window at the target URL
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          const target = new URL(targetUrl, self.location.origin);

          if (
            clientUrl.pathname === target.pathname &&
            "focus" in client
          ) {
            return client.focus().then((c) => {
              if (c && "navigate" in c) {
                return c.navigate(targetUrl);
              }
            });
          }
        }

        // Try to focus any open AXIS window and navigate
        for (const client of windowClients) {
          if ("focus" in client) {
            return client.focus().then((c) => {
              if (c && "navigate" in c) {
                return c.navigate(targetUrl);
              }
            });
          }
        }

        // No window found — open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── NOTIFICATION CLOSE ───────────────────────────────────────────────────────
self.addEventListener("notificationclose", (event) => {
  // Analytics hook — can POST to /api/notify/analytics if needed
  const data = event.notification.data || {};
  console.log("[AXIS SW] Notification dismissed:", data.type || "general");
});

// ─── BACKGROUND SYNC ──────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "axis-sync-checkin") {
    event.waitUntil(syncCheckin());
  }

  if (event.tag === "axis-sync-timetable") {
    event.waitUntil(syncTimetable());
  }
});

async function syncCheckin() {
  try {
    const cache = await caches.open("axis-offline-queue");
    const keys = await cache.keys();

    for (const request of keys) {
      if (!request.url.includes("/api/checkin")) continue;
      const cached = await cache.match(request);
      const body = await cached.json();

      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await cache.delete(request);
        console.log("[AXIS SW] Synced offline check-in.");
      }
    }
  } catch (err) {
    console.error("[AXIS SW] Background sync error:", err.message);
  }
}

async function syncTimetable() {
  try {
    const cache = await caches.open("axis-offline-queue");
    const keys = await cache.keys();

    for (const request of keys) {
      if (!request.url.includes("/api/timetable")) continue;
      const cached = await cache.match(request);
      const body = await cached.json();

      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await cache.delete(request);
        console.log("[AXIS SW] Synced offline timetable entry.");
      }
    }
  } catch (err) {
    console.error("[AXIS SW] Timetable sync error:", err.message);
  }
}

// ─── MESSAGE HANDLER (from app to SW) ────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_URLS":
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
          const urls = event.data.urls || [];
          return cache.addAll(urls);
        })
      );
      break;

    case "CLEAR_CACHE":
      event.waitUntil(
        caches.keys().then((keys) =>
          Promise.all(keys.map((key) => caches.delete(key)))
        )
      );
      break;

    default:
      break;
  }
});
