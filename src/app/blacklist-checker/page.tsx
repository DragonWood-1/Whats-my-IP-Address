"use client";
import { useState } from "react";

const DNSBL_LIST = [
  { name: "Spamhaus ZEN", host: "zen.spamhaus.org" },
  { name: "Barracuda", host: "b.barracudacentral.org" },
  { name: "SpamCop", host: "bl.spamcop.net" },
  { name: "SORBS SPAM", host: "spam.sorbs.net" },
  { name: "SORBS HTTP", host: "http.sorbs.net" },
  { name: "UCEPROTECT L1", host: "dnsbl-1.uceprotect.net" },
  { name: "UCEPROTECT L2", host: "dnsbl-2.uceprotect.net" },
  { name: "CBL Abuseat", host: "cbl.abuseat.org" },
  { name: "Lashback", host: "ubl.unsubscore.com" },
  { name: "NordSpam", host: "bl.nordspam.com" },
];

async function checkDNSBL(ip: string, dnsbl: string): Promise<boolean> {
  const reversed = ip.split(".").reverse().join(".");
  const lookup = `${reversed}.${dnsbl}`;
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(lookup)}&type=A`);
    const data = await res.json();
    return !!(data.Answer && data.Answer.length > 0);
  } catch { return false; }
}

export default function BlacklistChecker() {
  const [ip, setIp] = useState("");
  const [data, setData] = useState<{ ip: string; listedCount: number; results: { name: string; host: string; listed: boolean }[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!ip.trim()) return;
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip.trim())) { setError("Valid IPv4 address required"); return; }
    setLoading(true); setError(""); setData(null);
    try {
      const results = await Promise.all(DNSBL_LIST.map(async ({ name, host }) => ({ name, host, listed: await checkDNSBL(ip.trim(), host) })));
      setData({ ip: ip.trim(), listedCount: results.filter((r) => r.listed).length, results });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Blacklist check failed");
    } finally { setLoading(false); }
  }

  const isClean = data && data.listedCount === 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🚫</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>IP Blacklist Checker</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Check if an IP is listed on 10 major spam and abuse blacklists</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #ef4444, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter IPv4 address (e.g. 8.8.8.8)" value={ip} onChange={(e) => setIp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} />
          <button className="cyber-btn" onClick={check} disabled={loading}>{loading ? "Checking..." : "Check Blacklists"}</button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>⚠️ {error}</div>}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}><div className="spinner" style={{ margin: "0 auto 16px" }} /><div>Checking 10 blacklists...</div></div>}

      {data && !loading && (
        <>
          <div style={{ background: isClean ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${isClean ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 12, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 40 }}>{isClean ? "✅" : "🚫"}</div>
            <div>
              <div style={{ color: isClean ? "#10b981" : "#ef4444", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{isClean ? "Clean — Not Blacklisted" : `Listed on ${data.listedCount} blacklist${data.listedCount !== 1 ? "s" : ""}`}</div>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>Checked {data.ip} against {DNSBL_LIST.length} DNS blacklists</div>
            </div>
          </div>

          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}><h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Blacklist Results</h2></div>
            <table className="data-table">
              <thead><tr><th>Blacklist</th><th>Host</th><th>Status</th></tr></thead>
              <tbody>
                {data.results.map((r) => (
                  <tr key={r.host}>
                    <td style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{r.name}</td>
                    <td style={{ color: "#475569", fontFamily: "monospace", fontSize: 12 }}>{r.host}</td>
                    <td><span className={`badge ${r.listed ? "badge-red" : "badge-green"}`}>{r.listed ? "LISTED" : "CLEAN"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
