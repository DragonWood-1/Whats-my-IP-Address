"use client";
import { useState } from "react";

export default function WhoisLookup() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/whois?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Whois lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const events = (data?.events as Array<{ eventAction: string; eventDate: string }>) || [];
  const nameservers = (data?.nameservers as string[]) || [];
  const status = (data?.status as string[]) || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Whois Lookup</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Domain registration, ownership, and expiry information via RDAP</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00ff88, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter domain or IP (e.g. google.com)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button className="cyber-btn" onClick={lookup} disabled={loading}>
            {loading ? "Looking up..." : "Whois Lookup"}
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
          <div>Fetching registration data...</div>
        </div>
      )}

      {data && !loading && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Basic info */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Domain Information</h2>
            </div>
            <table className="data-table">
              <tbody>
                {[
                  ["Domain", data.name as string, "#00ff88"],
                  ["Handle", data.handle as string],
                ].filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status */}
          {status.length > 0 && (
            <div className="cyber-card" style={{ padding: 20 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Domain Status</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {status.map((s) => (
                  <span key={s} className="badge badge-cyan">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {events.length > 0 && (
            <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
                <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Registration Events</h2>
              </div>
              <table className="data-table">
                <thead><tr><th>Event</th><th>Date</th></tr></thead>
                <tbody>
                  {events.map((e, i) => (
                    <tr key={i}>
                      <td style={{ color: "#94a3b8", fontWeight: 600, fontSize: 13 }}>{e.eventAction}</td>
                      <td style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: 13 }}>
                        {new Date(e.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Nameservers */}
          {nameservers.length > 0 && (
            <div className="cyber-card" style={{ padding: 20 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Nameservers</div>
              {nameservers.map((ns) => (
                <div key={ns} style={{ fontFamily: "monospace", color: "#00d4ff", fontSize: 14, padding: "6px 0", borderBottom: "1px solid rgba(30,58,95,0.5)" }}>
                  {ns}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
