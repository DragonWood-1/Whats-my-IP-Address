"use client";
import { useState } from "react";

export default function ProxyDetector() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<{
    ip: string;
    isVPN: boolean;
    isProxy: boolean;
    isHosting: boolean;
    isTor: boolean;
    isp: string;
    org: string;
    asn: string;
    country: string;
    city: string;
    riskScore: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function detect() {
    if (!ip.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/vpn?ip=${encodeURIComponent(ip.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Detection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>👻</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Proxy Detector</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Identify if an IP is a proxy, anonymizer, or relay node</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter IP address to check"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && detect()}
          />
          <button className="cyber-btn" onClick={detect} disabled={loading}>
            {loading ? "Detecting..." : "Detect Proxy"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div>Analyzing proxy indicators...</div>
        </div>
      )}

      {data && !loading && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Proxy", detected: data.isProxy, icon: "🔀", desc: "Open/transparent proxy" },
              { label: "VPN", detected: data.isVPN, icon: "🔒", desc: "VPN service node" },
              { label: "Tor", detected: data.isTor, icon: "🧅", desc: "Tor exit node" },
              { label: "Datacenter", detected: data.isHosting, icon: "☁️", desc: "Cloud/hosting IP" },
            ].map((item) => (
              <div key={item.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: "#475569", fontSize: 11, marginBottom: 10 }}>{item.desc}</div>
                <span className={`badge ${item.detected ? "badge-red" : "badge-green"}`}>
                  {item.detected ? "Detected" : "Clean"}
                </span>
              </div>
            ))}
          </div>

          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Network Details</h2>
            </div>
            <table className="data-table">
              <tbody>
                {[
                  ["IP Address", data.ip, "#00d4ff"],
                  ["Risk Score", `${data.riskScore}/100`, data.riskScore === 0 ? "#10b981" : data.riskScore <= 40 ? "#f59e0b" : "#ef4444"],
                  ["ISP", data.isp],
                  ["Organization", data.org],
                  ["ASN", data.asn],
                  ["Country", data.country],
                  ["City", data.city],
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
