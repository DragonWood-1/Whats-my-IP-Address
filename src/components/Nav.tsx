"use client";
import Link from "next/link";
import { useState } from "react";

const tools = [
  { label: "IP Lookup", href: "/ip-lookup" },
  { label: "Whois", href: "/whois-lookup" },
  { label: "DNS Checker", href: "/dns-checker" },
  { label: "Port Scanner", href: "/port-scanner" },
  { label: "SSL Checker", href: "/ssl-checker" },
  { label: "GeoIP", href: "/geoip-finder" },
  { label: "ASN Lookup", href: "/asn-lookup" },
  { label: "Subnet Calc", href: "/subnet-calculator" },
  { label: "Ping Test", href: "/ping-test" },
  { label: "Blacklist", href: "/blacklist-checker" },
  { label: "VPN Detect", href: "/vpn-detector" },
  { label: "Email Headers", href: "/email-header-analyzer" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        background: "rgba(5, 11, 20, 0.95)",
        borderBottom: "1px solid #1e3a5f",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #00d4ff, #00ff88)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: "#000",
            }}
          >
            IP
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: -0.5,
            }}
          >
            Toolkit
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "nowrap",
            overflow: "hidden",
          }}
          className="hidden md:flex"
        >
          {tools.slice(0, 7).map((t) => (
            <Link
              key={t.href}
              href={t.href}
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 6,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, {
                  color: "#00d4ff",
                  background: "rgba(0,212,255,0.08)",
                })
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, {
                  color: "#94a3b8",
                  background: "transparent",
                })
              }
            >
              {t.label}
            </Link>
          ))}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                color: "#94a3b8",
                background: "transparent",
                border: "none",
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              More ▾
            </button>
            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "#0d1f3c",
                  border: "1px solid #1e3a5f",
                  borderRadius: 10,
                  padding: 8,
                  minWidth: 160,
                  zIndex: 100,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                {tools.slice(7).map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block",
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: 13,
                      padding: "8px 12px",
                      borderRadius: 6,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      Object.assign(e.currentTarget.style, {
                        color: "#00d4ff",
                        background: "rgba(0,212,255,0.08)",
                      })
                    }
                    onMouseLeave={(e) =>
                      Object.assign(e.currentTarget.style, {
                        color: "#94a3b8",
                        background: "transparent",
                      })
                    }
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* My IP button */}
        <Link
          href="/what-is-my-ip"
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #00d4ff)",
            color: "#000",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 16px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            letterSpacing: 0.3,
          }}
        >
          My IP
        </Link>
      </div>
    </header>
  );
}
