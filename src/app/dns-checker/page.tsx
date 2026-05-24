"use client";
import { useState } from "react";

const RECORD_TYPES = ["ALL", "A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "CAA"];

interface DNSAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DNSResult {
  type: string;
  answers: DNSAnswer[];
  status: number;
}

const TYPE_COLORS: Record<string, string> = {
  A: "#00d4ff",
  AAAA: "#00ff88",
  MX: "#7c3aed",
  NS: "#f59e0b",
  TXT: "#00d4ff",
  CNAME: "#00ff88",
  SOA: "#94a3b8",
  CAA: "#ef4444",
  PTR: "#f59e0b",
};

export default function DNSChecker() {
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("ALL");
  const [results, setResults] = useState<DNSResult[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(`/api/dns?domain=${encodeURIComponent(domain.trim())}&type=${type}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResults(json.results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "DNS lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const hasRecords = results?.some((r) => r.answers.length > 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>📡</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>DNS Checker</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Query DNS records for any domain — A, MX, TXT, CNAME, NS, SOA and more</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter domain (e.g. google.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #1e3a5f", borderRadius: 8, color: "#e2e8f0", padding: "12px 16px", fontSize: 14, outline: "none" }}
          >
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button className="cyber-btn" onClick={check} disabled={loading}>
            {loading ? "Checking..." : "Check DNS"}
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
          <div>Querying DNS servers...</div>
        </div>
      )}

      {results && !loading && (
        <div>
          {!hasRecords && (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>No DNS records found.</div>
          )}
          {results.filter((r) => r.answers.length > 0).map((result) => (
            <div key={result.type} className="cyber-card" style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ background: TYPE_COLORS[result.type] || "#94a3b8", color: "#000", fontWeight: 800, fontSize: 11, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.5 }}>
                  {result.type}
                </span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>{result.answers.length} record{result.answers.length !== 1 ? "s" : ""}</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>TTL</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {result.answers.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: 13 }}>{a.name}</td>
                      <td style={{ fontFamily: "monospace", color: "#475569", fontSize: 13 }}>{a.TTL}s</td>
                      <td style={{ fontFamily: "monospace", color: TYPE_COLORS[result.type] || "#e2e8f0", fontSize: 13, wordBreak: "break-all" }}>{a.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
