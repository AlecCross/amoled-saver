import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

// Declare types for injection point (precache manifest)
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // Автоматичний precache всіх ассетів з білду
  skipWaiting: true, // Активуй SW одразу після install
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true, // Вимкни логи в dev
  precacheOptions: {
    cleanupOutdatedCaches: true, // Очищай старі кеші
    ignoreURLParametersMatching: [/.*/], // Ігноруй параметри в URL для кешування
  },
  fallbacks: {
    entries: [
      {
        url: "/~offline", // Fallback-сторінка для offline (app/~offline/page.tsx)
        matcher({ request }) {
          return request.destination === "document"; // Тільки для навігаційних запитів
        },
      },
    ],
  },
  runtimeCaching: [
    ...defaultCache, // Стандартне кешування
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/") || url.pathname.endsWith(".webm"), // Для API та відео (hidden.webm)
      handler: new StaleWhileRevalidate({
        cacheName: "dynamic-cache",
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24, // 1 день
          }),
        ],
      }),
    },
  ],
});

// Ручне кешування ключових URL під час install (для надійності offline одразу після установки)
const urlsToCache = ["/", "/~offline", "/hidden.webm", "/manifest.json"] as const; // Видалили /index.html

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all(
      urlsToCache.map((entry) => {
        const request = serwist.handleRequest({
          request: new Request(entry),
          event,
        });
        return request;
      })
    ).catch((error) => {
      console.error("Precache failed:", error);
    }) // Логування помилок, але не скасовуємо установку
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Додай активацію для очищення старих кешів
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== "pwa-cache").map((name) => caches.delete(name))
      );
    })
  );
});

// Перехоплення всіх запитів до start_url
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/").then((response) => {
        if (response) return response;
        return caches.match("/~offline").then((fallbackResponse) => {
          return fallbackResponse || fetch(event.request);
        });
      })
    );
  }
});

serwist.addEventListeners();