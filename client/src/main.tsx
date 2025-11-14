import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// DESABILITADO TEMPORARIAMENTE - Service Worker pode estar causando problemas
// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  // Desregistrar todos os service workers existentes
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('[RHNet] Service Worker desregistrado:', registration.scope);
    }
  });
}
