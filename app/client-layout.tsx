"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
          registration.waiting?.postMessage("SKIP_WAITING");
          navigator.serviceWorker.ready.then(() => {
            setIsOfflineReady(true); // SW готовий, кешування завершено
          });
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  return (
    <>
      {isOfflineReady && (
        <div style={{ position: "absolute", top: "10px", right: "10px", color: "lime" }}>
          Offline-ready
        </div>
      )}
      {children}
    </>
  );
}
