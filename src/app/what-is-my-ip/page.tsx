"use client";
import { useEffect, useState } from "react";

interface GeoData {
  ip: string;
  version: string;
  city: string;
  region: string;
  country: string;       // 2-letter code
  country_name: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  asn: string;           // e.g. "AS15169"
  org: string;           // e.g. "AS15169 Google LLC"
  continent_code: string;
  error?: boolean;
  reason?: string;
}

interface SecData {
  proxy: string;         // "yes" | "no"
  type: string | null;   // "VPN" | "TOR" | null
}

export default function WhatIsMyIP() {
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [sec, setSec] = useState<SecData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then(async (d: GeoData) => {
        if (d.error) throw new Error(d.reason || "Failed");
        setGeo(d);
        // Best-effort security check
        try {
          const sr = await fetch(`https://proxycheck.io/v2/${d.ip}?vpn=1`);
          const sj = await sr.json();
          if (sj.status === "ok" && sj[d.ip]) setSec(sj[d.ip] as SecData);
        } catch { /* ignore */ }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const flag = geo?.country
    ? String.fromCodePoint(...geo.country.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";

  const isVPN   = sec?.type === "VPN";
  const isTor   = sec?.type === "TOR";
  const isProxy = sec?.proxy === "yes" && !isVPN && !isTor;
  const isp     = geo?.org?.replace(/^AS\d+\s*/, "") || "";

  const rows: [string, string | undefined, string?][] = geo
    ? [
        ["IP Address",   geo.ip,                              "#00d4ff"],
        ["Type",         geo.version],
        ["Country",      `${flag} ${geo.country_name} (${geo.country})`],
        ["Continent",    geo.continent_code],
        ["Region",       geo.region],
        ["City",         geo.city],
        ["Postal Code",  geo.postal],
        ["Coordinates",  `${geo.latitude}, ${geo.longitude}`],
        ["Timezone",     geo.timezone],
        ["ISP",          isp],
        ["Organization", geo.org],
        ["ASN",          geo.asn],
        ["VPN/Proxy",    sec ? (isVPN || isProxy ? "⚠️ Detected" : "✅ Not detected") : "—"],
        ["Tor Exit Node",sec ? (isTor             ? "⚠️ Detected" : "✅ No")          : "—"],
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
      ) : !geo ? (
        <div style={{ textAlign: "center", padding: 40, color: "#ef4444" }}>Failed to detect IP address.</div>
      ) : (
        <>
          <div className="cyber-card" style={{ padding: "40px 32px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#475569", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Your Public IP Address</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, color: "#00d4ff", letterSpacing: 3, textShadow: "0 0 40px rgba(0,212,255,0.5)", marginBottom: 16 }}>
              {geo.ip}
            </div>
            {geo.country_name && (
              <div style={{ color: "#94a3b8", fontSize: 15 }}>
                📍 {geo.city && `${geo.city}, `}{geo.region && `${geo.region}, `}{geo.country_name}
              </div>
            )}
          </div>

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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { label: "VPN / Proxy", icon: isVPN || isProxy ? "⚠️" : "✅", msg: isVPN || isProxy ? "Detected" : sec ? "Not detected" : "Unknown", color: isVPN || isProxy ? "#f59e0b" : "#10b981" },
              { label: "Tor Exit Node", icon: isTor ? "🧅" : "✅", msg: isTor ? "Tor Detected" : sec ? "Not Tor" : "Unknown", color: isTor ? "#ef4444" : "#10b981" },
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
