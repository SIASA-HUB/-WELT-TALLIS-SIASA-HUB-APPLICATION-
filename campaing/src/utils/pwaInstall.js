// src/utils/pwaInstall.js
// PWA Install Prompt + Backend Install Tracking

const USERS_API_BASE = "http://localhost:8002/api/v1/users";

let deferredPrompt = null;

/**
 * Initialize the PWA install listener.
 * Call this once in your app entry point (main.jsx or App.jsx).
 */
export function initPwaInstallListener() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    

    // Dispatch custom event so UI components can react
    window.dispatchEvent(new CustomEvent("pwa-install-available"));
  });

  window.addEventListener("appinstalled", () => {
    
    deferredPrompt = null;
    trackAppInstall();
  });
}

/**
 * Check if the PWA install prompt is available.
 */
export function canInstall() {
  return deferredPrompt !== null;
}

/**
 * Trigger the PWA install prompt.
 * Returns true if the user accepted, false otherwise.
 */
export async function promptInstall() {
  if (!deferredPrompt) {
    console.warn("No install prompt available");
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  

  if (outcome === "accepted") {
    deferredPrompt = null;
    await trackAppInstall();
    return true;
  }

  return false;
}

/**
 * Track the install on the backend.
 */
async function trackAppInstall() {
  try {
    const storedUser = localStorage.getItem("user_data");
    let userId = null;
    if (storedUser) {
      try {
        userId = JSON.parse(storedUser)?.user_id;
      } catch (e) {}
    }

    const response = await fetch(`${USERS_API_BASE}/install/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    if (data.success) {
      
    }
  } catch (error) {
    console.error("Failed to track install:", error);
  }
}

/**
 * Fetch the current install count from the backend.
 */
export async function getInstallCount() {
  try {
    const response = await fetch(`${USERS_API_BASE}/install/count`);
    const data = await response.json();
    return data.data?.install_count || 0;
  } catch (error) {
    console.error("Failed to get install count:", error);
    return 0;
  }
}
