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
    setLoading(true); setError(""); setData(null);
    try {
      const isASN = /^(as)?\d+$/i.test(query.trim());
      if (isASN) {
        const asnNum = query.trim().replace(/^as/i, "");
        const res = await fetch(`https://api.bgpview.io/asn/${asnNum}`, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("ASN not found");
        const json = await res.json();
        setData(json);
        setMode("asn");
      } else {
        const res = await fetch(`https://ipapi.co/${encodeURIComponent(query.trim())}/json/`);
        const json = await res.json();
        if (json.error) throw new Error(json.reason || "Lookup failed");
        setData(json);
        setMode("ip");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ASN lookup failed");
    } finally { setLoading(false); }
  }

  const asnData = (data?.data || data) as Record<string, unknown> | undefined;
  const isp = mode === "ip" ? (data?.org as string)?.replace(/^AS\d+\s*/, "") || "" : "";

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
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter ASN (e.g. AS15169) or IP address" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} />
          <button className="cyber-btn" onClick={lookup} disabled={loading}>{loading ? "Looking up..." : "Lookup ASN"}</button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><div>Querying ASN database...</div></div>}

      {data && !loading && (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}><h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>ASN Information</h2></div>
          <table className="data-table">
            <tbody>
              {mode === "ip" ? (
                [
                  ["IP Address",   data.ip as string,  "#00d4ff"],
                  ["ASN",          data.asn as string, "#7c3aed"],
                  ["ISP",          isp],
                  ["Organization", data.org as string],
                  ["Country",      data.country_name as string],
                ].filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))
              ) : (
                [
                  ["ASN",         asnData?.asn ? `AS${asnData.asn}` : undefined, "#7c3aed"],
                  ["Name",        asnData?.name as string],
                  ["Description", asnData?.description_short as string],
                  ["Country",     asnData?.country_code as string],
                  ["Website",     asnData?.website as string],
                ].filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
