import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Is My IP Address",
  description: "Find your current IP address, location, ISP, and more. Free IP lookup tool.",
};

async function getIPData() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "127.0.0.1";

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
      { cache: "no-store" }
    );
    return await res.json();
  } catch {
    return { query: ip };
  }
}

export default async function WhatIsMyIP() {
  const data = await getIPData();

  const rows: [string, string | undefined, string?][] = [
    ["IP Address", data.query, "#00d4ff"],
    ["Hostname", data.reverse],
    ["Country", data.country ? `${data.country} (${data.countryCode})` : undefined],
    ["Region", data.regionName],
    ["City", data.city],
    ["Postal Code", data.zip],
    ["Coordinates", data.lat && data.lon ? `${data.lat}, ${data.lon}` : undefined],
    ["Timezone", data.timezone],
    ["ISP", data.isp],
    ["Organization", data.org],
    ["ASN", data.as],
    ["Mobile", data.mobile !== undefined ? (data.mobile ? "Yes" : "No") : undefined],
    ["VPN/Proxy", data.proxy !== undefined ? (data.proxy ? "Yes" : "No") : undefined],
    ["Hosting", data.hosting !== undefined ? (data.hosting ? "Yes" : "No") : undefined],
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🌐</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
              What Is My IP Address?
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Your public IP address and network information</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      {/* Big IP display */}
      <div className="cyber-card" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 24 }}>
        <div style={{ color: "#475569", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
          Your Public IP Address
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, color: "#00d4ff", letterSpacing: 3, textShadow: "0 0 40px rgba(0,212,255,0.5)", marginBottom: 16 }}>
          {data.query || "Detecting..."}
        </div>
        {data.country && (
          <div style={{ color: "#94a3b8", fontSize: 15 }}>
            📍 {data.city && `${data.city}, `}{data.regionName && `${data.regionName}, `}{data.country}
          </div>
        )}
      </div>

      {/* Details table */}
      <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
          <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>IP Details</h2>
        </div>
        <table className="data-table">
          <tbody>
            {rows.map(([label, value, color]) =>
              value ? (
                <tr key={label}>
                  <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, width: 160 }}>
                    {label}
                  </td>
                  <td style={{ color: color || "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                    {value}
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>

      {/* Privacy indicators */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 24 }}>
        {[
          { label: "VPN / Proxy", value: data.proxy, icon: data.proxy ? "⚠️" : "✅", msg: data.proxy ? "Detected" : "Not detected", color: data.proxy ? "#f59e0b" : "#10b981" },
          { label: "Mobile Network", value: data.mobile, icon: data.mobile ? "📱" : "🖥️", msg: data.mobile ? "Mobile" : "Broadband", color: data.mobile ? "#00d4ff" : "#94a3b8" },
          { label: "Hosting/Cloud", value: data.hosting, icon: data.hosting ? "☁️" : "🏠", msg: data.hosting ? "Hosting IP" : "Residential", color: data.hosting ? "#7c3aed" : "#94a3b8" },
        ].map((item) => (
          <div key={item.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: item.color, fontWeight: 700, fontSize: 15 }}>{item.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
