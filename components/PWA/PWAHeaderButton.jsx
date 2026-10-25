"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Check, Share2, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const logo = "/logo.svg";

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

export default function PWAHeaderButton({ variant = "header", onAction }) {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [platform, setPlatform] = useState("other");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsStandalone(standaloneMode);

    if (detectedPlatform === "ios") {
      const isSafari =
        /safari/.test(window.navigator.userAgent.toLowerCase()) &&
        !/crios|fxios/.test(window.navigator.userAgent.toLowerCase());
      setIsIOS(isSafari);
    }

    if (window.__pwa_deferred_prompt) {
      setCanInstall(true);
    }

    const onPwaReady = () => setCanInstall(true);
    const onPwaInstalled = () => {
      setCanInstall(false);
      setInstalled(true);
      setTimeout(() => setInstalled(false), 3000);
    };

    window.addEventListener("pwa_ready", onPwaReady);
    window.addEventListener("pwa_installed", onPwaInstalled);

    return () => {
      window.removeEventListener("pwa_ready", onPwaReady);
      window.removeEventListener("pwa_installed", onPwaInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (isStandalone) {
      alert("Tronics App is already installed and running in app mode!");
      return;
    }

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (window.__pwa_deferred_prompt) {
      const prompt = window.__pwa_deferred_prompt;
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        fetch("/api/pwa/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "install",
            platform,
            source: "header_icon",
          }),
        }).catch(() => {});
        setCanInstall(false);
      }
      window.__pwa_deferred_prompt = null;
    } else {
      setShowIOSModal(true);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {variant === "sidebar" ? (
        <button
          type="button"
          onClick={() => {
            handleClick();
            if (onAction) onAction();
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--foreground)]/[0.05] transition-all group text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 flex items-center justify-center transition-all relative shrink-0">
              {installed ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Download size={14} />
              )}
              {canInstall && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--foreground)] leading-none group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
                <span>{installed ? "App Installed" : "Download App"}</span>
                {canInstall && (
                  <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    APP
                  </span>
                )}
              </div>
              <div className="text-[9px] text-[var(--muted)] font-medium mt-0.5">
                {installed ? "Running on your device" : "Install for instant access"}
              </div>
            </div>
          </div>
          <ChevronRight size={13} className="text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[var(--card)] hover:bg-[var(--accent)] hover:text-black border border-[var(--border)] hover:border-[var(--accent)] text-[var(--foreground)] transition-colors duration-200 cursor-pointer shadow-sm group"
          title="Download / Install Tronics App"
          aria-label="Install App"
        >
          {installed ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Download className="w-4 h-4" />
          )}

          {canInstall && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          )}
        </button>
      )}

      {/* iOS / Browser Install Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] shadow-2xl space-y-4"
            >
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Image src={logo} alt="Tronics" width={28} height={28} className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight">Install Tronics App</h3>
                  <p className="text-xs text-[var(--muted)]">Add to your Home Screen</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2.5 text-xs text-[var(--foreground)]">
                {isIOS ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-black text-[10px]">1</span>
                      <span>Tap the <strong>Share</strong> button <Share2 className="inline w-3.5 h-3.5 text-[var(--accent)]" /> in Safari</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-black text-[10px]">2</span>
                      <span>Scroll down and select <strong>'Add to Home Screen'</strong></span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-black text-[10px]">1</span>
                      <span>Open your browser menu (<strong>⋮</strong> or <strong>⋯</strong>)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-black text-[10px]">2</span>
                      <span>Select <strong>'Install App'</strong> or <strong>'Add to Home Screen'</strong></span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black font-black text-xs shadow-md transition-transform active:scale-95"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
