"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface GeoData {
  ip: string;
  version: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  asn: string;
  org: string;
  continent_code: string;
  error?: boolean;
  reason?: string;
}

interface SecData {
  proxy: string;
  type: string | null;
}

function IPLookupInner() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("ip") || "");
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [sec, setSec] = useState<SecData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(ip?: string) {
    const target = (ip || input).trim();
    if (!target) return;
    setLoading(true); setError(""); setGeo(null); setSec(null);
    try {
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(target)}/json/`);
      const json: GeoData = await res.json();
      if (json.error) throw new Error(json.reason || "Lookup failed");
      setGeo(json);
      // Best-effort security check
      try {
        const sr = await fetch(`https://proxycheck.io/v2/${encodeURIComponent(json.ip)}?vpn=1`);
        const sj = await sr.json();
        if (sj.status === "ok" && sj[json.ip]) setSec(sj[json.ip] as SecData);
      } catch { /* ignore */ }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally { setLoading(false); }
  }

  useEffect(() => { const ip = searchParams.get("ip"); if (ip) lookup(ip); }, []);

  const flag = geo?.country
    ? String.fromCodePoint(...geo.country.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";

  const isVPN   = sec?.type === "VPN";
  const isTor   = sec?.type === "TOR";
  const isProxy = sec?.proxy === "yes" && !isVPN && !isTor;
  const isp     = geo?.org?.replace(/^AS\d+\s*/, "") || "";

  const rows = geo ? [
    ["IP Address",   geo.ip,                                       "#00d4ff"],
    ["Type",         geo.version],
    ["Country",      `${flag} ${geo.country_name} (${geo.country})`],
    ["Continent",    geo.continent_code],
    ["Region",       geo.region],
    ["City",         geo.city],
    ["ZIP Code",     geo.postal],
    ["Coordinates",  `${geo.latitude}, ${geo.longitude}`],
    ["Timezone",     geo.timezone],
    ["ISP",          isp],
    ["Organization", geo.org],
    ["ASN",          geo.asn],
    ["VPN/Proxy",    sec ? (isVPN || isProxy ? "⚠️ Detected" : "✅ Not detected") : "—"],
    ["Tor",          sec ? (isTor             ? "⚠️ Tor exit node" : "✅ Not detected") : "—"],
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

      {geo && !loading && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className={`badge ${isVPN || isProxy ? "badge-yellow" : "badge-green"}`}>{isVPN || isProxy ? "⚠️ VPN/Proxy" : "✅ Clean IP"}</span>
            {isTor && <span className="badge badge-red">🧅 Tor</span>}
          </div>
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Results for {geo.ip}</h2>
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
          {geo.latitude && geo.longitude && (
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <a href={`https://www.openstreetmap.org/?mlat=${geo.latitude}&mlon=${geo.longitude}&zoom=10`} target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff", fontSize: 13, textDecoration: "none" }}>📍 View on Map →</a>
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
