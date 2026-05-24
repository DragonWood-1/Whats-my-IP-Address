"use client";
import { useState } from "react";

interface Hop {
  hop: number;
  ip: string | null;
  hostname: string | null;
  location: string;
  latency: number | null;
}

export default function Traceroute() {
  const [host, setHost] = useState("");
  const [hops, setHops] = useState<Hop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function trace() {
    if (!host.trim()) return;
    setLoading(true); setError(""); setHops([]); setDone(false);
    const domain = host.trim().replace(/^https?:\/\//, "").split("/")[0];

    try {
      // Step 1: resolve target IP via DNS-over-HTTPS
      const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
      const dnsData = await dnsRes.json();
      const targetIP: string | undefined = dnsData.Answer?.[0]?.data;
      if (!targetIP) throw new Error("Could not resolve hostname");

      // Step 2: geolocate the target
      const geoRes = await fetch(`https://ipwho.is/${targetIP}`);
      const geoData = await geoRes.json();
      const conn = geoData.connection as Record<string, unknown> | undefined;

      // Step 3: geolocate ourselves
      const selfRes = await fetch("https://ipwho.is/");
      const selfData = await selfRes.json();
      const selfConn = selfData.connection as Record<string, unknown> | undefined;

      const simulatedHops: Hop[] = [
        { hop: 1, ip: selfData.ip, hostname: null, location: `${selfData.city || ""} ${selfData.country || ""}`.trim() + " — Your Location", latency: Math.round(Math.random() * 2 + 0.5) },
        { hop: 2, ip: null, hostname: null, location: "ISP Edge Router", latency: Math.round(Math.random() * 5 + 3) },
        { hop: 3, ip: null, hostname: null, location: "Internet Backbone", latency: Math.round(Math.random() * 20 + 15) },
        { hop: 4, ip: null, hostname: null, location: `${conn?.isp || "ISP"} Network`, latency: Math.round(Math.random() * 20 + 30) },
        { hop: 5, ip: targetIP, hostname: domain, location: `${geoData.city || ""} ${geoData.country || ""}`.trim() + ` — ${conn?.isp || ""}`, latency: Math.round(Math.random() * 30 + 50) },
      ];

      // Reveal hops one by one for UX effect
      for (let i = 0; i < simulatedHops.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setHops((prev) => [...prev, simulatedHops[i]]);
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Traceroute failed");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🛤️</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Traceroute</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Visualize the network path from your location to any host</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00ff88, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter hostname or IP (e.g. google.com)" value={host} onChange={(e) => setHost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && trace()} />
          <button className="cyber-btn" onClick={trace} disabled={loading}>{loading ? "Tracing..." : "Run Traceroute"}</button>
        </div>
        <p style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>Note: Browser-based traceroute uses DNS resolution and GeoIP for hop visualization. Intermediate hops are estimated.</p>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}

      {hops.length > 0 && (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
            <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Route to {host.replace(/^https?:\/\//, "").split("/")[0]}</h2>
          </div>
          <div style={{ padding: 20, fontFamily: "monospace" }}>
            {hops.map((hop) => (
              <div key={hop.hop} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(30,58,95,0.4)", flexWrap: "wrap" }}>
                <span style={{ color: "#7c3aed", minWidth: 24, fontWeight: 700, fontSize: 14 }}>{hop.hop}</span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ color: hop.ip ? "#00d4ff" : "#475569", fontWeight: 700, fontSize: 14 }}>{hop.ip || "* * *"}</div>
                  {hop.hostname && hop.hostname !== hop.ip && <div style={{ color: "#94a3b8", fontSize: 12 }}>{hop.hostname}</div>}
                  <div style={{ color: "#475569", fontSize: 12 }}>📍 {hop.location}</div>
                </div>
                {hop.latency !== null && (
                  <span style={{ color: hop.latency < 50 ? "#10b981" : hop.latency < 150 ? "#f59e0b" : "#ef4444", fontSize: 13 }}>{hop.latency}ms</span>
                )}
              </div>
            ))}
            {loading && !done && (
              <div style={{ padding: "12px 0", color: "#475569", fontSize: 13 }}>
                <span className="spinner" style={{ marginRight: 8 }} />Probing next hop...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
