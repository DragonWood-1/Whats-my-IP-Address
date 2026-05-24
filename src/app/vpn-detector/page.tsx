"use client";
import { useState } from "react";

export default function VPNDetector() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function detect() {
    if (!ip.trim()) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip.trim())}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Detection failed");
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Detection failed");
    } finally { setLoading(false); }
  }

  const sec = data?.security as Record<string, boolean> | undefined;
  const conn = data?.connection as Record<string, unknown> | undefined;
  const isVPN = sec?.vpn || false;
  const isProxy = sec?.proxy || false;
  const isTor = sec?.tor || false;
  const isHosting = sec?.hosting || false;
  const riskScore = (isVPN ? 40 : 0) + (isProxy ? 30 : 0) + (isTor ? 30 : 0);
  const riskColor = riskScore === 0 ? "#10b981" : riskScore <= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🔒</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>VPN & Proxy Detector</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Detect VPN, proxy, Tor, and hosting/datacenter IPs</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #f59e0b, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter IP address to analyze" value={ip} onChange={(e) => setIp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && detect()} />
          <button className="cyber-btn" onClick={detect} disabled={loading}>{loading ? "Detecting..." : "Detect"}</button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><div>Analyzing IP...</div></div>}

      {data && !loading && (
        <>
          <div className="cyber-card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Risk Score</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: riskColor, fontFamily: "monospace", textShadow: `0 0 30px ${riskColor}60` }}>{riskScore}</div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>out of 100</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "VPN", detected: isVPN, icon: "🔒" },
              { label: "Proxy", detected: isProxy, icon: "🔀" },
              { label: "Tor", detected: isTor, icon: "🧅" },
              { label: "Hosting/DC", detected: isHosting, icon: "☁️" },
            ].map((item) => (
              <div key={item.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{item.label}</div>
                <span className={`badge ${item.detected ? "badge-red" : "badge-green"}`}>{item.detected ? "Detected" : "Clean"}</span>
              </div>
            ))}
          </div>

          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}><h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Network Information</h2></div>
            <table className="data-table">
              <tbody>
                {[
                  ["IP Address", data.ip as string, "#00d4ff"],
                  ["ISP", conn?.isp as string],
                  ["Organization", conn?.org as string],
                  ["ASN", conn?.asn ? `AS${conn.asn}` : undefined],
                  ["Country", data.country as string],
                  ["City", data.city as string],
                ].filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
