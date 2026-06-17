"use client";
import { useState } from "react";

interface PingResult { attempt: number; latency: number | null; status: string; }

export default function PingTest() {
  const [host, setHost] = useState("");
  const [results, setResults] = useState<PingResult[]>([]);
  const [stats, setStats] = useState<{ avg: number | null; min: number | null; max: number | null; loss: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ping() {
    if (!host.trim()) return;
    setLoading(true); setError(""); setResults([]); setStats(null);
    const domain = host.trim().replace(/^https?:\/\//, "").split("/")[0];
    const attempts: PingResult[] = [];

    for (let i = 1; i <= 4; i++) {
      const start = Date.now();
      try {
        await fetch(`https://${domain}`, { method: "HEAD", mode: "no-cors", signal: AbortSignal.timeout(5000) });
        attempts.push({ attempt: i, latency: Date.now() - start, status: "success" });
      } catch {
        attempts.push({ attempt: i, latency: null, status: "timeout" });
      }
      setResults([...attempts]);
      if (i < 4) await new Promise((r) => setTimeout(r, 300));
    }

    const successful = attempts.filter((r) => r.latency !== null);
    setStats({
      avg: successful.length ? Math.round(successful.reduce((a, r) => a + r.latency!, 0) / successful.length) : null,
      min: successful.length ? Math.min(...successful.map((r) => r.latency!)) : null,
      max: successful.length ? Math.max(...successful.map((r) => r.latency!)) : null,
      loss: Math.round(((4 - successful.length) / 4) * 100),
    });
    setLoading(false);
  }

  const latencyColor = (ms: number | null) => !ms ? "#ef4444" : ms < 100 ? "#10b981" : ms < 300 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🏓</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Ping Test</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Test connectivity and measure round-trip latency to any host</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter hostname or IP (e.g. google.com)" value={host} onChange={(e) => setHost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && ping()} />
          <button className="cyber-btn" onClick={ping} disabled={loading}>{loading ? "Pinging..." : "Send Ping"}</button>
        </div>
        <p style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>Latency measured via HTTPS probe from your browser to the target.</p>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Avg Latency", value: stats.avg ? `${stats.avg}ms` : "—", color: latencyColor(stats.avg) },
            { label: "Min Latency", value: stats.min ? `${stats.min}ms` : "—", color: "#10b981" },
            { label: "Max Latency", value: stats.max ? `${stats.max}ms` : "—", color: "#f59e0b" },
            { label: "Packet Loss", value: `${stats.loss}%`, color: stats.loss === 0 ? "#10b981" : stats.loss < 50 ? "#f59e0b" : "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ color: s.color, fontSize: 24, fontWeight: 800, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
            <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Ping Results — {host.replace(/^https?:\/\//, "").split("/")[0]}</h2>
          </div>
          <div style={{ padding: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
            {results.map((r) => (
              <div key={r.attempt} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: "#475569", width: 60 }}>Probe {r.attempt}</span>
                <span style={{ color: "#94a3b8", flex: 1 }}>{host.replace(/^https?:\/\//, "").split("/")[0]}</span>
                {r.latency !== null
                  ? <span style={{ color: latencyColor(r.latency), fontWeight: 700, width: 80, textAlign: "right" }}>{r.latency}ms</span>
                  : <span style={{ color: "#ef4444", width: 80, textAlign: "right" }}>timeout</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
