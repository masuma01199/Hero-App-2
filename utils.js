// --- Global DOM References ---
// We declare these globally but initialize them in DOMContentLoaded to ensure they exist.
let loadingOverlay = null;
let toastContainer = null;

// --- Utility Functions ---

/**
 * Formats a raw number of downloads into a human-readable string (e.g., 1200 -> 1.2K).
 * @param {number} num - The download count.
 * @returns {string} The formatted string.
 */
function formatDownloads(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
}

// --- LocalStorage Functions ---
const INSTALLED_APPS_KEY = "installedApps";

function getInstalledApps() {
  try {
    const installed = localStorage.getItem(INSTALLED_APPS_KEY);
    return installed ? JSON.parse(installed) : [];
  } catch (e) {
    console.error("Error reading localStorage:", e);
    return [];
  }
}

function saveInstalledApps(apps) {
  try {
    localStorage.setItem(INSTALLED_APPS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error("Error writing to localStorage:", e);
  }
}

/**
 * Checks if a specific app is installed.
 * @param {number} appId - The ID of the app.
 * @returns {boolean} True if installed, false otherwise.
 */
function isAppInstalled(appId) {
  return getInstalledApps().includes(appId);
}

// --- Toast Notification Implementation ---

function showToast(message, type = "success") {
  if (!toastContainer) return; // Use the correctly initialized global variable

  const toast = document.createElement("div");
  const iconClass =
    type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${message}`;

  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add("show"), 50);

  // Animate out and remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// --- Simple Loading Animation Control ---

function showLoading(state) {
  if (!loadingOverlay) return; // Use the correctly initialized global variable

  if (state) {
    loadingOverlay.classList.add("show");
  } else {
    // Slight delay to ensure the loading animation has time to display
    setTimeout(() => {
      loadingOverlay.classList.remove("show");
    }, 100);
  }
}

// Simple Page Navigation Helper (for loading animation challenge)
function navigateTo(url) {
  showLoading(true);
  // Simulate navigation/load delay
  setTimeout(() => {
    window.location.href = url;
  }, 500);
}

// --- Installation Logic ---

let isInstalling = false; // Simple flag to prevent rapid double-click installations

/**
 * Installs an app by adding its ID to localStorage.
 * @param {number} appId - The ID of the app to install.
 * @param {function} onComplete - Callback to run after installation (e.g., update UI).
 */
function installApp(appId, onComplete) {
  if (isInstalling) return;

  if (isAppInstalled(appId)) {
    showToast("App is already installed.", "error");
    return;
  }

  isInstalling = true;
  showLoading(true);

  setTimeout(() => {
    try {
      const installedApps = getInstalledApps();
      installedApps.push(appId);
      saveInstalledApps(installedApps);

      showToast("Installation successful!");
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Installation error:", error);
      showToast("Installation failed. Please try again.", "error");
    } finally {
      showLoading(false);
      isInstalling = false;
    }
  }, 500); // Simulated network delay
}

/**
 * Uninstalls an app by removing its ID from localStorage.
 * @param {number} appId - The ID of the app to uninstall.
 * @param {function} onComplete - Callback to run after uninstallation (e.g., update UI).
 */
function uninstallApp(appId, onComplete) {
  showLoading(true);

  setTimeout(() => {
    try {
      let installedApps = getInstalledApps();
      const initialLength = installedApps.length;

      // Filter out the specific appId
      installedApps = installedApps.filter((id) => id !== appId);

      if (installedApps.length < initialLength) {
        saveInstalledApps(installedApps);
        showToast("App uninstalled successfully.");
        if (onComplete) {
          onComplete();
        }
      } else {
        showToast("App was not found installed.", "error");
      }
    } catch (error) {
      console.error("Uninstallation error:", error);
      showToast("Uninstallation failed.", "error");
    } finally {
      showLoading(false);
    }
  }, 500); // Simulated network delay
}

// Initialize utilities and attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  // CRITICAL FIX: Initialize the global DOM references here when the elements are guaranteed to exist.
  loadingOverlay = document.getElementById("loadingOverlay");
  toastContainer = document.getElementById("toastContainer");

  // CRITICAL: Intercept internal link clicks to show loading animation
  document.querySelectorAll("a").forEach((link) => {
    const url = link.getAttribute("href");

    // Only intercept valid, internal-looking links
    if (url && url !== "#" && !url.startsWith("javascript:")) {
      // Check if it's an external link or a link that matches the current origin
      const isExternal =
        url.startsWith("http") && !url.includes(window.location.origin);

      if (!isExternal) {
        link.addEventListener("click", (e) => {
          e.preventDefault(); // Stop the default navigation
          navigateTo(url); // Use the custom function to show loading and navigate
        });
      }
    }
  });
});

// Expose necessary functions globally for use in HTML script blocks
window.formatDownloads = formatDownloads;
window.showLoading = showLoading;
window.showToast = showToast;
window.getInstalledApps = getInstalledApps;
window.isAppInstalled = isAppInstalled;
window.installApp = installApp;
window.uninstallApp = uninstallApp;
window.navigateTo = navigateTo; // Expose navigateTo
