"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "My IP", icon: "🌐", href: "/what-is-my-ip" },
  { label: "IP Lookup", icon: "🔍", href: "/ip-lookup" },
  { label: "DNS", icon: "📡", href: "/dns-checker" },
  { label: "Whois", icon: "📋", href: "/whois-lookup" },
  { label: "All Tools", icon: "⚡", href: "/" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(5, 11, 20, 0.97)",
        borderTop: "1px solid #1e3a5f",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "stretch",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="mobile-bottom-nav"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              textDecoration: "none",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: 2,
                  background: "linear-gradient(90deg, #00d4ff, #00ff88)",
                  borderRadius: "0 0 2px 2px",
                }}
              />
            )}
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.3,
                color: active ? "#00d4ff" : "#475569",
                transition: "color 0.2s",
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
