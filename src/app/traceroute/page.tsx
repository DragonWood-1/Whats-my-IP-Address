"use client";
import { useState } from "react";

interface Hop {
  hop: number;
  ip: string;
  hostname: string | null;
  latency: (number | null)[];
  location: string;
}

export default function Traceroute() {
  const [host, setHost] = useState("");
  const [data, setData] = useState<{
    host: string;
    targetIP: string;
    hops: Hop[];
    note: string;
    targetInfo: Record<string, string>;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function trace() {
    if (!host.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/traceroute?host=${encodeURIComponent(host.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Traceroute failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🛤️</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Traceroute</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Trace the network path from our server to any host</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00ff88, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter hostname or IP (e.g. google.com)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && trace()}
          />
          <button className="cyber-btn" onClick={trace} disabled={loading}>
            {loading ? "Tracing..." : "Run Traceroute"}
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
          <div style={{ fontFamily: "monospace" }}>Tracing route to {host}...</div>
        </div>
      )}

      {data && !loading && (
        <>
          {data.note && (
            <div style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 10, padding: "12px 20px", color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>
              ℹ️ {data.note}
            </div>
          )}

          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>
                Route to {data.host} ({data.targetIP})
              </h2>
            </div>
            <div style={{ padding: 20, fontFamily: "monospace" }}>
              {data.hops.map((hop) => (
                <div
                  key={hop.hop}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(30,58,95,0.4)",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#475569", minWidth: 24, fontWeight: 700 }}>{hop.hop}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: hop.ip === "***" ? "#475569" : "#00d4ff", fontWeight: 700 }}>{hop.ip}</div>
                    {hop.hostname && hop.hostname !== hop.ip && (
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>{hop.hostname}</div>
                    )}
                    {hop.location && <div style={{ color: "#475569", fontSize: 12 }}>📍 {hop.location}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {hop.latency.map((l, i) =>
                      l !== null ? (
                        <span key={i} style={{ color: l < 100 ? "#10b981" : l < 300 ? "#f59e0b" : "#ef4444", fontSize: 13 }}>{l}ms</span>
                      ) : (
                        <span key={i} style={{ color: "#475569", fontSize: 13 }}>*</span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
