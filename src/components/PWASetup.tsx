"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWASetup() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem("pwa-dismissed");
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setInstallPrompt(null);
  }

  function dismiss() {
    setShowBanner(false);
    sessionStorage.setItem("pwa-dismissed", "1");
  }

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: 16,
        right: 16,
        background: "linear-gradient(135deg, #0d1f3c, #112240)",
        border: "1px solid rgba(0,212,255,0.4)",
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        zIndex: 200,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.1)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: "linear-gradient(135deg, #00d4ff, #00ff88)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 900,
          color: "#000",
          flexShrink: 0,
        }}
      >
        IP
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>Install ip-space.com</div>
        <div style={{ color: "#94a3b8", fontSize: 12 }}>Add to home screen for instant access</div>
      </div>
      <button
        onClick={install}
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #00d4ff)",
          border: "none",
          borderRadius: 8,
          color: "#000",
          fontWeight: 700,
          fontSize: 13,
          padding: "8px 16px",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={dismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "#475569",
          fontSize: 20,
          cursor: "pointer",
          padding: "4px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
