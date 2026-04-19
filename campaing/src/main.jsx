import React, { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// 1. Import the Provider
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./components/hooks/useAuth.jsx";
import { initPwaInstallListener } from "./utils/pwaInstall.js";

// Initialize PWA install listener early
initPwaInstallListener();

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("🚀 [SW]: Registered", reg.scope))
        .catch((err) => console.error("❌ [SW]: Registration failed", err));
    });
  }
};

const markAsLoaded = () => {
  queueMicrotask(() => {
    document.body.classList.add("loaded");
  });
};

registerServiceWorker();

const rootElement = document.getElementById("root");

if (rootElement) {
  const content = (
    <StrictMode>
      <HelmetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HelmetProvider>
    </StrictMode>
  );

  if (rootElement.hasChildNodes()) {
    hydrateRoot(rootElement, content);
  } else {
    createRoot(rootElement).render(content);
  }

  markAsLoaded();
}
