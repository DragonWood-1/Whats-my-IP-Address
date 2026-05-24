"use client";
import { useState } from "react";

interface PingResult {
  attempt: number;
  latency: number | null;
  status: string;
}

export default function PingTest() {
  const [host, setHost] = useState("");
  const [data, setData] = useState<{
    host: string;
    results: PingResult[];
    avgLatency: number | null;
    minLatency: number | null;
    maxLatency: number | null;
    packetLoss: number;
    sent: number;
    received: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ping() {
    if (!host.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/ping?host=${encodeURIComponent(host.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ping failed");
    } finally {
      setLoading(false);
    }
  }

  const latencyColor = (ms: number | null) => {
    if (!ms) return "#ef4444";
    if (ms < 100) return "#10b981";
    if (ms < 300) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🏓</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Ping Test</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Test connectivity and measure latency to any host</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter hostname or IP (e.g. google.com)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ping()}
          />
          <button className="cyber-btn" onClick={ping} disabled={loading}>
            {loading ? "Pinging..." : "Send Ping"}
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
          <div style={{ fontFamily: "monospace" }}>Pinging {host}...</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Avg Latency", value: data.avgLatency ? `${data.avgLatency}ms` : "—", color: latencyColor(data.avgLatency) },
              { label: "Min Latency", value: data.minLatency ? `${data.minLatency}ms` : "—", color: "#10b981" },
              { label: "Max Latency", value: data.maxLatency ? `${data.maxLatency}ms` : "—", color: "#f59e0b" },
              { label: "Packet Loss", value: `${data.packetLoss}%`, color: data.packetLoss === 0 ? "#10b981" : data.packetLoss < 50 ? "#f59e0b" : "#ef4444" },
            ].map((s) => (
              <div key={s.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: s.color, fontSize: 24, fontWeight: 800, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Individual results */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>
                Ping Results — {data.host} ({data.received}/{data.sent} received)
              </h2>
            </div>
            <div style={{ padding: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
              {data.results.map((r) => (
                <div key={r.attempt} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ color: "#475569", width: 60 }}>Probe {r.attempt}</span>
                  <span style={{ color: "#94a3b8", flex: 1 }}>{data.host}</span>
                  {r.latency !== null ? (
                    <span style={{ color: latencyColor(r.latency), fontWeight: 700, width: 80, textAlign: "right" }}>
                      {r.latency}ms
                    </span>
                  ) : (
                    <span style={{ color: "#ef4444", width: 80, textAlign: "right" }}>timeout</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
