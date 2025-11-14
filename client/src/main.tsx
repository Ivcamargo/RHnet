import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('[RHNet] Starting application...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('[RHNet] Root element not found!');
  throw new Error('Root element not found');
}

console.log('[RHNet] Root element found, creating React root...');

try {
  const root = createRoot(rootElement);
  console.log('[RHNet] React root created, rendering App...');
  root.render(<App />);
  console.log('[RHNet] App rendered successfully!');
} catch (error) {
  console.error('[RHNet] Error during render:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; max-width: 600px; margin: 50px auto; background: #fee; border: 2px solid #c00; border-radius: 8px;">
      <h1 style="color: #c00; margin-top: 0;">Erro ao Carregar Aplicação</h1>
      <p>Ocorreu um erro ao inicializar o RHNet.</p>
      <details style="margin-top: 20px; padding: 10px; background: white; border-radius: 4px;">
        <summary style="cursor: pointer; font-weight: bold;">Detalhes do erro</summary>
        <pre style="overflow: auto; font-size: 12px; margin-top: 10px;">${error instanceof Error ? error.stack : String(error)}</pre>
      </details>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Recarregar Página
      </button>
    </div>
  `;
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
