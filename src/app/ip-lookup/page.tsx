"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface IPData {
  query: string;
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  asname: string;
  reverse: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
  continent: string;
  currency: string;
}

function IPLookupInner() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("ip") || "");
  const [data, setData] = useState<IPData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(ip?: string) {
    const target = (ip || input).trim();
    if (!target) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(target)}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ip = searchParams.get("ip");
    if (ip) lookup(ip);
  }, []);

  const rows = data
    ? [
        ["IP Address", data.query, "#00d4ff"],
        ["Hostname", data.reverse],
        ["Country", `${data.country} (${data.countryCode})`],
        ["Continent", data.continent],
        ["Region", data.regionName],
        ["City", data.city],
        ["ZIP Code", data.zip],
        ["Coordinates", `${data.lat}, ${data.lon}`],
        ["Timezone", data.timezone],
        ["Currency", data.currency],
        ["ISP", data.isp],
        ["Organization", data.org],
        ["ASN", data.as],
        ["AS Name", data.asname],
        ["Mobile", data.mobile ? "Yes" : "No"],
        ["VPN/Proxy", data.proxy ? "⚠️ Detected" : "✅ Not detected"],
        ["Hosting", data.hosting ? "Yes (datacenter)" : "No (residential)"],
      ]
    : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🌐</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>IP Lookup</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Get detailed geolocation and network info for any IP address</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      {/* Input */}
      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter IP address (e.g. 8.8.8.8)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button className="cyber-btn" onClick={() => lookup()} disabled={loading}>
            {loading ? "Looking up..." : "Lookup IP"}
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
          <div>Querying IP database...</div>
        </div>
      )}

      {data && (
        <>
          {/* Quick badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className={`badge ${data.proxy ? "badge-yellow" : "badge-green"}`}>
              {data.proxy ? "⚠️ VPN/Proxy" : "✅ Clean IP"}
            </span>
            <span className={`badge ${data.hosting ? "badge-cyan" : "badge-green"}`}>
              {data.hosting ? "☁️ Hosting" : "🏠 Residential"}
            </span>
            {data.mobile && <span className="badge badge-cyan">📱 Mobile</span>}
          </div>

          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Results for {data.query}</h2>
            </div>
            <table className="data-table">
              <tbody>
                {rows.map(([label, value, color]) =>
                  value ? (
                    <tr key={label}>
                      <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, width: 160 }}>{label}</td>
                      <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{value as string}</td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>

          {/* Map link */}
          {data.lat && data.lon && (
            <div style={{ marginTop: 16, textAlign: "right" }}>
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

export default function IPLookupPage() {
  return (
    <Suspense>
      <IPLookupInner />
    </Suspense>
  );
}
