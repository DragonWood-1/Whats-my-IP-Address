"use client";
import { useState } from "react";

export default function GeoIPFinder() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<{
    query: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!ip.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/geoip?ip=${encodeURIComponent(ip.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "GeoIP lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const COUNTRY_FLAGS: Record<string, string> = {};
  const flag = data?.countryCode
    ? String.fromCodePoint(
        ...(data.countryCode.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
      )
    : "";

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
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter IP address (e.g. 1.1.1.1)"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button className="cyber-btn" onClick={lookup} disabled={loading}>
            {loading ? "Locating..." : "Find Location"}
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
          <div>Locating IP...</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Location hero */}
          <div className="cyber-card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{flag}</div>
            <div style={{ color: "#00ff88", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              {data.city && `${data.city}, `}{data.regionName && `${data.regionName}, `}{data.country}
            </div>
            <div style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 14 }}>
              {data.lat.toFixed(4)}°N, {data.lon.toFixed(4)}°E
            </div>
          </div>

          {/* Details */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Location Details — {data.query}</h2>
            </div>
            <table className="data-table">
              <tbody>
                {[
                  ["IP Address", data.query, "#00d4ff"],
                  ["Country", `${flag} ${data.country} (${data.countryCode})`],
                  ["Region", data.regionName],
                  ["City", data.city],
                  ["ZIP Code", data.zip],
                  ["Latitude", data.lat?.toString()],
                  ["Longitude", data.lon?.toString()],
                  ["Timezone", data.timezone],
                  ["ISP", data.isp],
                  ["Organization", data.org],
                  ["ASN", data.as],
                ].filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.lat && data.lon && (
            <div style={{ textAlign: "right" }}>
              <a
                href={`https://www.openstreetmap.org/?mlat=${data.lat}&mlon=${data.lon}&zoom=10`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#00d4ff", fontSize: 13, textDecoration: "none" }}
              >
                📍 View on Map →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
