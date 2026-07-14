"use client";

import { useEffect } from "react";

// Registra el service worker (necesario para poder instalar la app).
export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker la app sigue funcionando; solo no será instalable.
      });
    }
  }, []);

  return null;
}
