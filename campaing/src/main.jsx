import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// 1. Import the Provider

import { AuthProvider } from "./components/hooks/useAuth.jsx";

// Only enable HMR in development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept();
}

const markAsLoaded = () => {
  queueMicrotask(() => {
    document.body.classList.add("loaded");
  });
};

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );

  markAsLoaded();
}
