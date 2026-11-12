"use client";

import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg);
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch(() => {
        // Service worker registration failed, app still works
      });
  }, []);

  function applyUpdate() {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }

  function clearUserCache() {
    navigator.serviceWorker.controller?.postMessage({
      type: "CLEAR_USER_CACHE",
    });
  }

  return { registration, updateAvailable, applyUpdate, clearUserCache };
}
