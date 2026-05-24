"use client";
import { useState } from "react";

export default function GeoIPFinder() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!ip.trim()) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip.trim())}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Lookup failed");
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "GeoIP lookup failed");
    } finally { setLoading(false); }
  }

  const cc = (data?.country_code as string) || "";
  const flag = cc ? String.fromCodePoint(...cc.toUpperCase().split("").map((c: string) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "";
  const conn = data?.connection as Record<string, unknown> | undefined;
  const tz = data?.timezone as Record<string, unknown> | undefined;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>📍</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>GeoIP Finder</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Geolocate any IP address to country, region, city, and coordinates</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00ff88, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter IP address (e.g. 1.1.1.1)" value={ip} onChange={(e) => setIp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} />
          <button className="cyber-btn" onClick={lookup} disabled={loading}>{loading ? "Locating..." : "Find Location"}</button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><div>Locating IP...</div></div>}

      {data && !loading && (
        <>
          <div className="cyber-card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{flag}</div>
            <div style={{ color: "#00ff88", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              {data.city as string && `${data.city}, `}{data.region as string && `${data.region}, `}{data.country as string}
            </div>
            <div style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 14 }}>
              {(data.latitude as number)?.toFixed(4)}°N, {(data.longitude as number)?.toFixed(4)}°E
            </div>
          </div>

          <div className="cyber-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Location Details — {data.ip as string}</h2>
            </div>
            <table className="data-table">
              <tbody>
                {[
                  ["IP Address", data.ip as string, "#00d4ff"],
                  ["Country", `${flag} ${data.country} (${data.country_code})`],
                  ["Region", data.region as string],
                  ["City", data.city as string],
                  ["ZIP Code", data.postal as string],
                  ["Latitude", (data.latitude as number)?.toString()],
                  ["Longitude", (data.longitude as number)?.toString()],
                  ["Timezone", tz?.id as string],
                  ["ISP", conn?.isp as string],
                  ["Organization", conn?.org as string],
                  ["ASN", conn?.asn ? `AS${conn.asn}` : undefined],
                ].filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.latitude && data.longitude && (
            <div style={{ textAlign: "right" }}>
              <a href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=10`} target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff", fontSize: 13, textDecoration: "none" }}>📍 View on Map →</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
