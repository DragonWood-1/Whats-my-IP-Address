"use client";
import Link from "next/link";

const toolLinks = [
  { label: "IP Lookup", href: "/ip-lookup" },
  { label: "Whois Lookup", href: "/whois-lookup" },
  { label: "DNS Checker", href: "/dns-checker" },
  { label: "Port Scanner", href: "/port-scanner" },
  { label: "Ping Test", href: "/ping-test" },
  { label: "Traceroute", href: "/traceroute" },
  { label: "SSL Checker", href: "/ssl-checker" },
  { label: "GeoIP Finder", href: "/geoip-finder" },
  { label: "ASN Lookup", href: "/asn-lookup" },
  { label: "Subnet Calculator", href: "/subnet-calculator" },
  { label: "CIDR Calculator", href: "/cidr-calculator" },
  { label: "Blacklist Checker", href: "/blacklist-checker" },
  { label: "VPN Detector", href: "/vpn-detector" },
  { label: "Proxy Detector", href: "/proxy-detector" },
  { label: "Reverse DNS", href: "/reverse-dns" },
  { label: "Email Header Analyzer", href: "/email-header-analyzer" },
  { label: "What Is My IP", href: "/what-is-my-ip" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#030810",
        borderTop: "1px solid #1e3a5f",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#000",
                }}
              >
                IP
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                ip-space.com
              </span>
            </div>
            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
              Free professional network tools for developers, sysadmins, and security professionals.
            </p>
          </div>

          {/* Tools 1 */}
          <div>
            <h3
              style={{
                color: "#00d4ff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              IP Tools
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {toolLinks.slice(0, 6).map((t) => (
                <li key={t.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={t.href}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: 13,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools 2 */}
          <div>
            <h3
              style={{
                color: "#00ff88",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Network Tools
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {toolLinks.slice(6, 12).map((t) => (
                <li key={t.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={t.href}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: 13,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff88")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools 3 */}
          <div>
            <h3
              style={{
                color: "#7c3aed",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Security Tools
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {toolLinks.slice(12).map((t) => (
                <li key={t.href} style={{ marginBottom: 8 }}>
                  <Link
                    href={t.href}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: 13,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7c3aed")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #1e3a5f",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: "#475569", fontSize: 13 }}>
            © {new Date().getFullYear()} ip-space.com. Free network tools for everyone.
          </p>
          <p style={{ color: "#475569", fontSize: 12 }}>
            Results are for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
