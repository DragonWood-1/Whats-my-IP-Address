"use client";
import { useState } from "react";

interface CertInfo {
  id: number;
  logged_at: string;
  not_before: string;
  not_after: string;
  common_name: string;
  name_value: string;
  issuer_name: string;
}

export default function SSLChecker() {
  const [host, setHost] = useState("");
  const [certs, setCerts] = useState<CertInfo[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!host.trim()) return;
    setLoading(true); setError(""); setCerts(null);
    try {
      const domain = host.trim().replace(/^https?:\/\//, "").split("/")[0];
      const target = `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`;
      // crt.sh does not send CORS headers, so a direct browser fetch is blocked.
      // Try direct first (in case that ever changes), then fall back to a CORS proxy.
      let raw: CertInfo[] | null = null;
      try {
        const res = await fetch(target);
        if (res.ok) raw = await res.json();
      } catch { /* CORS / network — fall through to proxy */ }
      if (!raw) {
        const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
        const res = await fetch(proxied);
        if (!res.ok) throw new Error("crt.sh lookup failed");
        raw = await res.json();
      }
      setCerts(Array.isArray(raw) ? raw.slice(0, 10) : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "SSL check failed");
    } finally { setLoading(false); }
  }

  const isExpired = (d: string) => new Date(d) < new Date();
  const isExpiringSoon = (d: string) => (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>SSL Checker</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>View SSL/TLS certificate history and expiry dates via crt.sh</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #ef4444, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter domain (e.g. google.com)" value={host} onChange={(e) => setHost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} />
          <button className="cyber-btn" onClick={check} disabled={loading}>{loading ? "Checking..." : "Check SSL"}</button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><div>Fetching certificate transparency data...</div></div>}

      {certs && !loading && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ color: "#00d4ff", fontSize: 28, fontWeight: 800, fontFamily: "monospace" }}>{certs.length}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>Certificates Found</div>
            </div>
            <div className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ color: "#10b981", fontSize: 28, fontWeight: 800, fontFamily: "monospace" }}>{certs.filter((c) => !isExpired(c.not_after)).length}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>Valid Certs</div>
            </div>
            <div className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ color: "#ef4444", fontSize: 28, fontWeight: 800, fontFamily: "monospace" }}>{certs.filter((c) => isExpired(c.not_after)).length}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>Expired</div>
            </div>
          </div>

          {certs.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No certificates found for this domain.</div>
          ) : (
            <div>
              <h2 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Certificate History</h2>
              {certs.map((cert) => {
                const expired = isExpired(cert.not_after);
                const expiring = isExpiringSoon(cert.not_after);
                return (
                  <div key={cert.id} className="cyber-card" style={{ padding: 20, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ color: "#00d4ff", fontWeight: 700, fontSize: 15, marginBottom: 6, fontFamily: "monospace" }}>{cert.common_name}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>
                          Issuer: {cert.issuer_name?.split(",").find((s) => s.includes("O="))?.replace("O=", "").trim() || cert.issuer_name?.slice(0, 60)}
                        </div>
                        <div style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
                          {cert.not_before?.slice(0, 10)} → {cert.not_after?.slice(0, 10)}
                        </div>
                      </div>
                      <span className={`badge ${expired ? "badge-red" : expiring ? "badge-yellow" : "badge-green"}`}>
                        {expired ? "Expired" : expiring ? "Expiring Soon" : "Valid"}
                      </span>
                    </div>
                    {cert.name_value && (
                      <div style={{ marginTop: 12, color: "#475569", fontSize: 12, fontFamily: "monospace", wordBreak: "break-all" }}>
                        SANs: {cert.name_value.split("\n").slice(0, 3).join(", ")}{cert.name_value.split("\n").length > 3 ? "..." : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
