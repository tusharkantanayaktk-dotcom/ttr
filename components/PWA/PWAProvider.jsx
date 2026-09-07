"use client";

import { useEffect } from "react";

function detectPlatform() {
  if (typeof window === "undefined") return "other";
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/windows/.test(userAgent)) return "windows";
  if (/macintosh|mac os x/.test(userAgent)) return "mac";
  if (/linux/.test(userAgent)) return "linux";
  return "other";
}

export default function PWAProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const platform = detectPlatform();

    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {})
        .catch((err) => {
          console.warn("SW registration error:", err);
        });
    }

    // 2. Check if running as Standalone PWA
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (standaloneMode) {
      const hasLoggedLaunch = sessionStorage.getItem("pwa_launch_logged");
      if (!hasLoggedLaunch) {
        sessionStorage.setItem("pwa_launch_logged", "true");
        fetch("/api/pwa/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "launch",
            platform,
            source: "standalone",
          }),
        }).catch(() => {});
      }
      return;
    }

    // 3. Capture beforeinstallprompt globally
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.__pwa_deferred_prompt = e;
      window.dispatchEvent(new Event("pwa_ready"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Handle app installed event
    const handleAppInstalled = () => {
      window.__pwa_deferred_prompt = null;
      window.dispatchEvent(new Event("pwa_installed"));
      fetch("/api/pwa/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "install",
          platform,
          source: "prompt",
        }),
      }).catch(() => {});
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
