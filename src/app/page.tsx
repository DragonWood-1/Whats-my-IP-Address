import Link from "next/link";
import { headers } from "next/headers";

const tools = [
  { icon: "🌐", label: "IP Lookup", desc: "Get detailed info about any IP address", href: "/ip-lookup", color: "#00d4ff" },
  { icon: "🔍", label: "Whois Lookup", desc: "Domain registration & ownership data", href: "/whois-lookup", color: "#00ff88" },
  { icon: "📡", label: "DNS Checker", desc: "Query DNS records: A, MX, TXT, CNAME", href: "/dns-checker", color: "#7c3aed" },
  { icon: "🚪", label: "Port Scanner", desc: "Check open ports on any host", href: "/port-scanner", color: "#f59e0b" },
  { icon: "🏓", label: "Ping Test", desc: "Test reachability and latency", href: "/ping-test", color: "#00d4ff" },
  { icon: "🛤️", label: "Traceroute", desc: "Trace the path packets take to a host", href: "/traceroute", color: "#00ff88" },
  { icon: "📧", label: "Email Header Analyzer", desc: "Parse and analyze email headers", href: "/email-header-analyzer", color: "#7c3aed" },
  { icon: "🚫", label: "Blacklist Checker", desc: "Check if IP is on spam blacklists", href: "/blacklist-checker", color: "#ef4444" },
  { icon: "🔒", label: "VPN Detector", desc: "Detect VPN, proxy, and Tor usage", href: "/vpn-detector", color: "#f59e0b" },
  { icon: "👻", label: "Proxy Detector", desc: "Identify proxy and anonymizer IPs", href: "/proxy-detector", color: "#00d4ff" },
  { icon: "📍", label: "GeoIP Finder", desc: "Geolocate any IP to city and country", href: "/geoip-finder", color: "#00ff88" },
  { icon: "🏢", label: "ASN Lookup", desc: "Find Autonomous System Number info", href: "/asn-lookup", color: "#7c3aed" },
  { icon: "🧮", label: "Subnet Calculator", desc: "Calculate network ranges and masks", href: "/subnet-calculator", color: "#00d4ff" },
  { icon: "📐", label: "CIDR Calculator", desc: "Convert and calculate CIDR notation", href: "/cidr-calculator", color: "#00ff88" },
  { icon: "🔗", label: "Reverse DNS", desc: "PTR record lookup for IP addresses", href: "/reverse-dns", color: "#f59e0b" },
  { icon: "🛡️", label: "SSL Checker", desc: "Analyze SSL/TLS certificates", href: "/ssl-checker", color: "#ef4444" },
];

async function getMyIP() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "—"
  );
}

export default async function Home() {
  const myIP = await getMyIP();

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: "#00ff88", borderRadius: "50%", display: "inline-block" }} />
            <span style={{ color: "#00d4ff", fontSize: 13, fontWeight: 600 }}>16 Professional Network Tools — Free Forever</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1.5 }}>
            <span style={{ color: "#e2e8f0" }}>The Ultimate</span>
            <br />
            <span style={{ background: "linear-gradient(135deg, #00d4ff, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              IP Tools Platform
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Free, instant network diagnostics. IP lookup, Whois, DNS, port scanning, SSL analysis, GeoIP and more — no registration required.
          </p>

          {/* My IP display */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 16, padding: "28px 32px", maxWidth: 480, margin: "0 auto 64px", boxShadow: "0 0 40px rgba(0,212,255,0.08)" }}>
            <div style={{ color: "#475569", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Your IP Address</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#00d4ff", letterSpacing: 2, textShadow: "0 0 30px rgba(0,212,255,0.5)", marginBottom: 16 }}>
              {myIP}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/what-is-my-ip" style={{ background: "linear-gradient(135deg, #0ea5e9, #00d4ff)", color: "#000", textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 8, letterSpacing: 0.5 }}>
                Full IP Details →
              </Link>
              <Link href={`/ip-lookup?ip=${myIP}`} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "10px 20px", borderRadius: 8 }}>
                Analyze IP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>All Tools</h2>
        <p style={{ color: "#475569", textAlign: "center", marginBottom: 40, fontSize: 14 }}>Click any tool to get started instantly</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} style={{ textDecoration: "none" }}>
              <div className="cyber-card" style={{ padding: 24, cursor: "pointer", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ fontSize: 28, lineHeight: 1, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {tool.icon}
                  </div>
                  <div>
                    <div style={{ color: tool.color, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{tool.label}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>{tool.desc}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid #1e3a5f", borderBottom: "1px solid #1e3a5f", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>Why IPToolkit?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
            {[
              { icon: "⚡", title: "Instant Results", desc: "No waiting. Results appear in seconds using real-time APIs." },
              { icon: "🔓", title: "100% Free", desc: "No registration, no limits on basic lookups, no paywalls." },
              { icon: "🛡️", title: "Privacy First", desc: "We don't log your queries or sell your data." },
              { icon: "🌍", title: "Global Coverage", desc: "Accurate geolocation and network data worldwide." },
            ].map((f) => (
              <div key={f.title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
