"use client";
import { useState } from "react";

export default function ReverseDNS() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<{
    ip: string;
    ptr: string;
    hostnames: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!ip.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/reverse-dns?ip=${encodeURIComponent(ip.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Reverse DNS lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🔗</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Reverse DNS Lookup</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Find the hostname for any IP address via PTR record lookup</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #f59e0b, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter IP address (e.g. 8.8.8.8)"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button className="cyber-btn" onClick={lookup} disabled={loading}>
            {loading ? "Looking up..." : "Reverse Lookup"}
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
          <div>Looking up PTR record...</div>
        </div>
      )}

      {data && !loading && (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
            <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Reverse DNS Results</h2>
          </div>
          <table className="data-table">
            <tbody>
              <tr>
                <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>IP Address</td>
                <td style={{ color: "#00d4ff", fontFamily: "monospace", fontSize: 14 }}>{data.ip}</td>
              </tr>
              <tr>
                <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>PTR Query</td>
                <td style={{ color: "#475569", fontFamily: "monospace", fontSize: 12 }}>{data.ptr}</td>
              </tr>
              <tr>
                <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Hostnames</td>
                <td>
                  {data.hostnames.length > 0 ? (
                    data.hostnames.map((h) => (
                      <div key={h} style={{ color: "#00ff88", fontFamily: "monospace", fontSize: 14, marginBottom: 4 }}>
                        {h}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: "#475569", fontSize: 13 }}>No PTR record found</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
