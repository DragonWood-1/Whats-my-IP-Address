"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface IPWhoData {
  ip: string; type: string; continent: string; continent_code: string;
  country: string; country_code: string; region: string; city: string;
  postal: string; latitude: number; longitude: number;
  connection: { asn: number; org: string; isp: string; domain: string };
  timezone: { id: string };
  security: { proxy: boolean; vpn: boolean; tor: boolean; hosting: boolean };
  success: boolean; message?: string;
}

function IPLookupInner() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("ip") || "");
  const [data, setData] = useState<IPWhoData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(ip?: string) {
    const target = (ip || input).trim();
    if (!target) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(target)}`);
      const json: IPWhoData = await res.json();
      if (!json.success) throw new Error(json.message || "Lookup failed");
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally { setLoading(false); }
  }

  useEffect(() => { const ip = searchParams.get("ip"); if (ip) lookup(ip); }, []);

  const flag = data?.country_code
    ? String.fromCodePoint(...data.country_code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";

  const rows = data ? [
    ["IP Address", data.ip, "#00d4ff"],
    ["Type", data.type],
    ["Country", `${flag} ${data.country} (${data.country_code})`],
    ["Continent", `${data.continent} (${data.continent_code})`],
    ["Region", data.region],
    ["City", data.city],
    ["ZIP Code", data.postal],
    ["Coordinates", `${data.latitude}, ${data.longitude}`],
    ["Timezone", data.timezone?.id],
    ["ISP", data.connection?.isp],
    ["Organization", data.connection?.org],
    ["ASN", data.connection?.asn ? `AS${data.connection.asn}` : undefined],
    ["Domain", data.connection?.domain],
    ["VPN/Proxy", data.security?.vpn || data.security?.proxy ? "⚠️ Detected" : "✅ Not detected"],
    ["Tor", data.security?.tor ? "⚠️ Tor exit node" : "✅ Not detected"],
    ["Hosting", data.security?.hosting ? "Yes (datacenter)" : "No (residential)"],
  ] : [];

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

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter IP address (e.g. 8.8.8.8)" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()} />
          <button className="cyber-btn" onClick={() => lookup()} disabled={loading}>{loading ? "Looking up..." : "Lookup IP"}</button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><div>Querying IP database...</div></div>}

      {data && !loading && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className={`badge ${data.security?.vpn || data.security?.proxy ? "badge-yellow" : "badge-green"}`}>{data.security?.vpn || data.security?.proxy ? "⚠️ VPN/Proxy" : "✅ Clean IP"}</span>
            <span className={`badge ${data.security?.hosting ? "badge-cyan" : "badge-green"}`}>{data.security?.hosting ? "☁️ Hosting" : "🏠 Residential"}</span>
            {data.security?.tor && <span className="badge badge-red">🧅 Tor</span>}
          </div>
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Results for {data.ip}</h2>
            </div>
            <table className="data-table">
              <tbody>
                {rows.filter(([, v]) => v).map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, width: 160 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.latitude && data.longitude && (
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <a href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=10`} target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff", fontSize: 13, textDecoration: "none" }}>📍 View on Map →</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function IPLookupPage() {
  return <Suspense><IPLookupInner /></Suspense>;
}
