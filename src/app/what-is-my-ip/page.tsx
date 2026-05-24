"use client";
import { useEffect, useState } from "react";

interface IPWhoData {
  ip: string;
  type: string;
  continent: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
  connection: { asn: number; org: string; isp: string };
  timezone: { id: string };
  security: { proxy: boolean; vpn: boolean; tor: boolean; hosting: boolean };
}

export default function WhatIsMyIP() {
  const [data, setData] = useState<IPWhoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ipwho.is/")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const flag = data?.country_code
    ? String.fromCodePoint(...data.country_code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";

  const rows: [string, string | undefined, string?][] = data
    ? [
        ["IP Address", data.ip, "#00d4ff"],
        ["Type", data.type],
        ["Country", `${flag} ${data.country} (${data.country_code})`],
        ["Continent", data.continent],
        ["Region", data.region],
        ["City", data.city],
        ["Postal Code", data.postal],
        ["Coordinates", `${data.latitude}, ${data.longitude}`],
        ["Timezone", data.timezone?.id],
        ["ISP", data.connection?.isp],
        ["Organization", data.connection?.org],
        ["ASN", data.connection?.asn ? `AS${data.connection.asn}` : undefined],
        ["VPN/Proxy", data.security?.vpn || data.security?.proxy ? "⚠️ Detected" : "✅ Not detected"],
        ["Tor Exit Node", data.security?.tor ? "⚠️ Detected" : "✅ No"],
        ["Hosting/DC", data.security?.hosting ? "Yes (datacenter)" : "No (residential)"],
      ]
    : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🌐</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>What Is My IP Address?</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Your public IP address and network information</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div>Detecting your IP...</div>
        </div>
      ) : !data ? (
        <div style={{ textAlign: "center", padding: 40, color: "#ef4444" }}>Failed to detect IP address.</div>
      ) : (
        <>
          {/* Big IP display */}
          <div className="cyber-card" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#475569", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Your Public IP Address</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, color: "#00d4ff", letterSpacing: 3, textShadow: "0 0 40px rgba(0,212,255,0.5)", marginBottom: 16 }}>
              {data.ip}
            </div>
            {data.country && (
              <div style={{ color: "#94a3b8", fontSize: 15 }}>
                📍 {data.city && `${data.city}, `}{data.region && `${data.region}, `}{data.country}
              </div>
            )}
          </div>

          {/* Details table */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>IP Details</h2>
            </div>
            <table className="data-table">
              <tbody>
                {rows.filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, width: 160 }}>{label}</td>
                    <td style={{ color: color || "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Privacy indicators */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { label: "VPN / Proxy", detected: data.security?.vpn || data.security?.proxy, icon: data.security?.vpn || data.security?.proxy ? "⚠️" : "✅", msg: data.security?.vpn || data.security?.proxy ? "Detected" : "Not detected", color: data.security?.vpn || data.security?.proxy ? "#f59e0b" : "#10b981" },
              { label: "Tor Exit Node", detected: data.security?.tor, icon: data.security?.tor ? "🧅" : "✅", msg: data.security?.tor ? "Tor Detected" : "Not Tor", color: data.security?.tor ? "#ef4444" : "#10b981" },
              { label: "Hosting/Cloud", detected: data.security?.hosting, icon: data.security?.hosting ? "☁️" : "🏠", msg: data.security?.hosting ? "Hosting IP" : "Residential", color: data.security?.hosting ? "#7c3aed" : "#94a3b8" },
            ].map((item) => (
              <div key={item.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: item.color, fontWeight: 700, fontSize: 15 }}>{item.msg}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
