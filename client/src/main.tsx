import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Disable stale PWA caches to avoid serving outdated UI after deploys.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith("rhnet-"))
            .map((key) => caches.delete(key))
        );
      }
    } catch (error) {
      console.warn("Failed to clear legacy service worker caches:", error);
    }
  });
}
