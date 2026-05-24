"use client";
import { useState } from "react";

interface CertInfo {
  id: number;
  loggedAt: string;
  notBefore: string;
  notAfter: string;
  commonName: string;
  sans: string;
  issuer: string;
}

export default function SSLChecker() {
  const [host, setHost] = useState("");
  const [data, setData] = useState<{
    domain: string;
    isReachable: boolean;
    httpsOk: boolean;
    certificates: CertInfo[];
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!host.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/ssl?host=${encodeURIComponent(host.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "SSL check failed");
    } finally {
      setLoading(false);
    }
  }

  const isExpiringSoon = (date: string) => {
    const days = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days < 30;
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>SSL Checker</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Analyze SSL/TLS certificates and check HTTPS connectivity</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #ef4444, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter domain (e.g. google.com)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
          />
          <button className="cyber-btn" onClick={check} disabled={loading}>
            {loading ? "Checking..." : "Check SSL"}
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
          <div>Fetching SSL certificate data...</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Status */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "HTTPS Reachable", ok: data.isReachable, icon: "🌐" },
              { label: "HTTPS Valid", ok: data.httpsOk, icon: "🔐" },
              { label: "Certificates Found", ok: data.certificates.length > 0, icon: "📜", value: data.certificates.length.toString() },
            ].map((s) => (
              <div key={s.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>{s.label}</div>
                {s.value ? (
                  <div style={{ color: "#00d4ff", fontWeight: 800, fontSize: 22, fontFamily: "monospace" }}>{s.value}</div>
                ) : (
                  <span className={`badge ${s.ok ? "badge-green" : "badge-red"}`}>{s.ok ? "OK" : "Failed"}</span>
                )}
              </div>
            ))}
          </div>

          {/* Certificates */}
          {data.certificates.length > 0 && (
            <div>
              <h2 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                Certificate History ({data.domain})
              </h2>
              {data.certificates.slice(0, 5).map((cert) => {
                const expired = isExpired(cert.notAfter);
                const expiring = isExpiringSoon(cert.notAfter);
                return (
                  <div key={cert.id} className="cyber-card" style={{ padding: 20, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ color: "#00d4ff", fontWeight: 700, fontSize: 15, marginBottom: 6, fontFamily: "monospace" }}>
                          {cert.commonName}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>
                          Issuer: {cert.issuer?.split(",").find((s) => s.includes("O="))?.replace("O=", "").trim() || cert.issuer?.slice(0, 60)}
                        </div>
                        <div style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>
                          {cert.notBefore?.slice(0, 10)} → {cert.notAfter?.slice(0, 10)}
                        </div>
                      </div>
                      <span className={`badge ${expired ? "badge-red" : expiring ? "badge-yellow" : "badge-green"}`}>
                        {expired ? "Expired" : expiring ? "Expiring Soon" : "Valid"}
                      </span>
                    </div>
                    {cert.sans && (
                      <div style={{ marginTop: 12, color: "#475569", fontSize: 12, fontFamily: "monospace", wordBreak: "break-all" }}>
                        SANs: {cert.sans.split("\n").slice(0, 3).join(", ")}
                        {cert.sans.split("\n").length > 3 && "..."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
