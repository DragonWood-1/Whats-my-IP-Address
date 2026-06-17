"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const tools = [
  { label: "What Is My IP", href: "/what-is-my-ip", icon: "🌐", color: "#00d4ff" },
  { label: "IP Lookup", href: "/ip-lookup", icon: "🔍", color: "#00d4ff" },
  { label: "GeoIP Finder", href: "/geoip-finder", icon: "📍", color: "#00ff88" },
  { label: "Whois Lookup", href: "/whois-lookup", icon: "📋", color: "#00ff88" },
  { label: "DNS Checker", href: "/dns-checker", icon: "📡", color: "#7c3aed" },
  { label: "Port Scanner", href: "/port-scanner", icon: "🚪", color: "#f59e0b" },
  { label: "Ping Test", href: "/ping-test", icon: "🏓", color: "#00d4ff" },
  { label: "Traceroute", href: "/traceroute", icon: "🛤️", color: "#00ff88" },
  { label: "SSL Checker", href: "/ssl-checker", icon: "🛡️", color: "#ef4444" },
  { label: "Blacklist Checker", href: "/blacklist-checker", icon: "🚫", color: "#ef4444" },
  { label: "VPN Detector", href: "/vpn-detector", icon: "🔒", color: "#f59e0b" },
  { label: "Proxy Detector", href: "/proxy-detector", icon: "👻", color: "#00d4ff" },
  { label: "ASN Lookup", href: "/asn-lookup", icon: "🏢", color: "#7c3aed" },
  { label: "Reverse DNS", href: "/reverse-dns", icon: "🔗", color: "#f59e0b" },
  { label: "Subnet Calculator", href: "/subnet-calculator", icon: "🧮", color: "#00d4ff" },
  { label: "CIDR Calculator", href: "/cidr-calculator", icon: "📐", color: "#00ff88" },
  { label: "Email Headers", href: "/email-header-analyzer", icon: "📧", color: "#7c3aed" },
];

const DESKTOP_LINKS = tools.slice(1, 7);

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        style={{
          background: "rgba(5, 11, 20, 0.97)",
          borderBottom: "1px solid #1e3a5f",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 16px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: "#000",
                flexShrink: 0,
              }}
            >
              IP
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", letterSpacing: -0.5 }}>ip-space.com</span>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: "none", gap: 2, flex: 1, justifyContent: "center" }} className="desktop-nav">
            {DESKTOP_LINKS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  color: pathname === t.href ? "#00d4ff" : "#94a3b8",
                  textDecoration: "none",
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 6,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  background: pathname === t.href ? "rgba(0,212,255,0.08)" : "transparent",
                }}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link
              href="/what-is-my-ip"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #00d4ff)",
                color: "#000",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                padding: "8px 14px",
                borderRadius: 8,
                whiteSpace: "nowrap",
                letterSpacing: 0.3,
              }}
            >
              My IP
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 8,
                width: 40,
                height: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s",
              }}
            >
              <span style={{ width: 18, height: 2, background: menuOpen ? "#00d4ff" : "#94a3b8", borderRadius: 1, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
              <span style={{ width: 18, height: 2, background: menuOpen ? "transparent" : "#94a3b8", borderRadius: 1, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: 18, height: 2, background: menuOpen ? "#00d4ff" : "#94a3b8", borderRadius: 1, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          top: 60,
          background: "rgba(5, 11, 20, 0.98)",
          backdropFilter: "blur(20px)",
          zIndex: 49,
          overflowY: "auto",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          paddingBottom: 80,
        }}
      >
        <div style={{ padding: "24px 20px" }}>
          <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            All Tools
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {tools.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  style={{
                    textDecoration: "none",
                    background: active ? "rgba(0,212,255,0.1)" : "rgba(13,31,60,0.8)",
                    border: `1px solid ${active ? "rgba(0,212,255,0.4)" : "#1e3a5f"}`,
                    borderRadius: 12,
                    padding: "14px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ color: active ? "#00d4ff" : "#94a3b8", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                    {t.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            top: 60,
            zIndex: 48,
            background: "transparent",
          }}
        />
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
