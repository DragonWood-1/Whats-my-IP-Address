"use client";
import { useState } from "react";

interface SpamIndicator {
  label: string;
  value: string;
  status: "ok" | "warn" | "fail";
}

interface ReceivedHop {
  hop: number;
  from: string | null;
  by: string | null;
  ip: string | null;
  date: string | null;
}

const SAMPLE_HEADERS = `Received: from mail.example.com (mail.example.com [203.0.113.1])
        by mx.google.com with ESMTPS id x1si1234.2023.10.01.12.00.00
        for <user@gmail.com>; Sun, 01 Oct 2023 12:00:00 -0700
Received: from [192.168.1.100] (helo=desktop.local)
        by mail.example.com with ESMTP id a1234
        for <user@gmail.com>; Sun, 01 Oct 2023 19:00:00 +0000
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com;
       spf=pass (google.com: domain of sender@example.com) smtp.mailfrom=sender@example.com;
       dmarc=pass (p=NONE) header.from=example.com
From: Sender Name <sender@example.com>
To: user@gmail.com
Subject: Test Email
Date: Sun, 01 Oct 2023 19:00:00 +0000
Message-ID: <12345@example.com>`;

export default function EmailHeaderAnalyzer() {
  const [rawHeaders, setRawHeaders] = useState("");
  const [data, setData] = useState<{
    summary: Record<string, string | null>;
    receivedChain: ReceivedHop[];
    spamIndicators: SpamIndicator[];
    allHeaders: Record<string, string[]>;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!rawHeaders.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/email-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers: rawHeaders }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = (s: "ok" | "warn" | "fail") =>
    s === "ok" ? "#10b981" : s === "warn" ? "#f59e0b" : "#ef4444";
  const statusBadge = (s: "ok" | "warn" | "fail") =>
    s === "ok" ? "badge-green" : s === "warn" ? "badge-yellow" : "badge-red";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>📧</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Email Header Analyzer</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Parse email headers to check SPF, DKIM, DMARC, and trace the delivery path</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ color: "#94a3b8", fontSize: 13 }}>Paste raw email headers below</label>
          <button
            onClick={() => setRawHeaders(SAMPLE_HEADERS)}
            style={{ background: "transparent", border: "1px solid #1e3a5f", borderRadius: 6, color: "#94a3b8", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
          >
            Load Sample
          </button>
        </div>
        <textarea
          className="cyber-input"
          style={{ minHeight: 160, resize: "vertical", lineHeight: 1.5 }}
          placeholder="Paste email headers here..."
          value={rawHeaders}
          onChange={(e) => setRawHeaders(e.target.value)}
        />
        <div style={{ marginTop: 12 }}>
          <button className="cyber-btn" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Headers"}
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
          <div>Parsing headers...</div>
        </div>
      )}

      {data && !loading && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Spam indicators */}
          {data.spamIndicators.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {data.spamIndicators.map((ind) => (
                <div key={ind.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{ind.label}</div>
                  <span className={`badge ${statusBadge(ind.status)}`} style={{ fontSize: 13 }}>
                    {ind.value.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Email Summary</h2>
            </div>
            <table className="data-table">
              <tbody>
                {Object.entries(data.summary).filter(([, v]) => v).map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 140 }}>{key.replace(/([A-Z])/g, " $1").trim()}</td>
                    <td style={{ color: "#e2e8f0", fontSize: 13, wordBreak: "break-all" }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Received chain */}
          {data.receivedChain.length > 0 && (
            <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
                <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Mail Delivery Path ({data.receivedChain.length} hops)</h2>
              </div>
              <div style={{ padding: 20 }}>
                {data.receivedChain.map((hop) => (
                  <div key={hop.hop} style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                    <div style={{ background: "#7c3aed", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {hop.hop}
                    </div>
                    <div style={{ flex: 1 }}>
                      {hop.from && <div style={{ color: "#94a3b8", fontSize: 12 }}>From: <span style={{ color: "#00d4ff", fontFamily: "monospace" }}>{hop.from}</span></div>}
                      {hop.by && <div style={{ color: "#94a3b8", fontSize: 12 }}>By: <span style={{ color: "#00ff88", fontFamily: "monospace" }}>{hop.by}</span></div>}
                      {hop.ip && <div style={{ color: "#94a3b8", fontSize: 12 }}>IP: <span style={{ color: "#f59e0b", fontFamily: "monospace" }}>{hop.ip}</span></div>}
                      {hop.date && <div style={{ color: "#475569", fontSize: 11 }}>{hop.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
