"use client";
import { useState } from "react";

interface PortResult {
  port: number;
  service: string;
  status: "open" | "closed";
}

export default function PortScanner() {
  const [host, setHost] = useState("");
  const [data, setData] = useState<{ host: string; results: PortResult[]; openCount: number; totalScanned: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function scan() {
    if (!host.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/port-scan?host=${encodeURIComponent(host.trim())}&ports=common`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Port scan failed");
    } finally {
      setLoading(false);
    }
  }

  const openPorts = data?.results.filter((r) => r.status === "open") || [];
  const closedPorts = data?.results.filter((r) => r.status === "closed") || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🚪</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Port Scanner</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Scan common ports on any host. Checks 23 common ports including SSH, HTTP, HTTPS, FTP, RDP, and more.</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #f59e0b, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter hostname or IP (e.g. example.com)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && scan()}
          />
          <button className="cyber-btn" onClick={scan} disabled={loading}>
            {loading ? "Scanning..." : "Scan Ports"}
          </button>
        </div>
        <p style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>
          ⚠️ Only scan hosts you own or have permission to test.
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "monospace", fontSize: 13 }}>Scanning ports... this may take 10-20 seconds</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Open Ports", value: data.openCount, color: "#10b981" },
              { label: "Closed Ports", value: closedPorts.length, color: "#475569" },
              { label: "Total Scanned", value: data.totalScanned, color: "#00d4ff" },
            ].map((s) => (
              <div key={s.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: s.color, fontSize: 28, fontWeight: 800, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Open ports */}
          {openPorts.length > 0 && (
            <div className="cyber-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#10b981", fontSize: 16 }}>●</span>
                <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Open Ports</h2>
              </div>
              <table className="data-table">
                <thead><tr><th>Port</th><th>Service</th><th>Status</th></tr></thead>
                <tbody>
                  {openPorts.map((r) => (
                    <tr key={r.port}>
                      <td style={{ color: "#00d4ff", fontFamily: "monospace", fontWeight: 700, fontSize: 15 }}>{r.port}</td>
                      <td style={{ color: "#e2e8f0", fontSize: 14 }}>{r.service}</td>
                      <td><span className="badge badge-green">OPEN</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Closed ports */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#94a3b8", fontSize: 16, fontWeight: 700 }}>Closed / Filtered Ports</h2>
            </div>
            <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {closedPorts.map((r) => (
                <div key={r.port} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1e3a5f", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontFamily: "monospace" }}>
                  <span style={{ color: "#475569" }}>{r.port}</span>
                  <span style={{ color: "#1e3a5f", marginLeft: 4 }}>{r.service}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
