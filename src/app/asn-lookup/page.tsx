"use client";
import { useState } from "react";

export default function ASNLookup() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"ip" | "asn">("ip");

  async function lookup() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/asn?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setMode(/^(as)?\d+$/i.test(query.trim()) ? "asn" : "ip");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ASN lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🏢</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>ASN Lookup</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Look up Autonomous System Numbers by ASN (e.g. AS15169) or IP address</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter ASN (e.g. AS15169) or IP address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button className="cyber-btn" onClick={lookup} disabled={loading}>
            {loading ? "Looking up..." : "Lookup ASN"}
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
          <div>Querying ASN database...</div>
        </div>
      )}

      {data && !loading && (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
            <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>ASN Information</h2>
          </div>
          <table className="data-table">
            <tbody>
              {mode === "ip" ? (
                <>
                  {[
                    ["IP Address", data.query as string, "#00d4ff"],
                    ["ASN", data.as as string, "#7c3aed"],
                    ["AS Name", data.asname as string],
                    ["ISP", data.isp as string],
                    ["Organization", data.org as string],
                    ["Country", data.country as string],
                  ].filter(([, v]) => v).map(([label, value, color]) => (
                    <tr key={label as string}>
                      <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                      <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  {(() => {
                    const d = (data.data || data) as Record<string, unknown>;
                    return [
                      ["ASN", d.asn as string, "#7c3aed"],
                      ["Name", d.name as string],
                      ["Description", d.description_short as string],
                      ["Country", (d.country_code as string)],
                      ["Email", d.email_contacts as string],
                      ["Website", d.website as string],
                    ].filter(([, v]) => v).map(([label, value, color]) => (
                      <tr key={label as string}>
                        <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                        <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                      </tr>
                    ));
                  })()}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
