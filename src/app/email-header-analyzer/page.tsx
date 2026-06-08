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

interface ParsedHeaders {
  summary: Record<string, string | null>;
  receivedChain: ReceivedHop[];
  spamIndicators: SpamIndicator[];
  allHeaders: Record<string, string[]>;
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

function parseHeaders(raw: string): ParsedHeaders {
  // Unfold multi-line header values (RFC 2822: continuation lines start with whitespace)
  const unfolded = raw.replace(/\r?\n([ \t])/g, " ");

  const lines = unfolded.split(/\r?\n/);
  const allHeaders: Record<string, string[]> = {};

  for (const line of lines) {
    if (!line.trim() || !line.includes(":")) continue;
    const colon = line.indexOf(":");
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (!allHeaders[name]) allHeaders[name] = [];
    allHeaders[name].push(value);
  }

  // Summary fields
  const get = (key: string) => (allHeaders[key]?.[0] ?? null);
  const summary: Record<string, string | null> = {
    from: get("from"),
    to: get("to"),
    subject: get("subject"),
    date: get("date"),
    messageId: get("message-id"),
    replyTo: get("reply-to"),
    returnPath: get("return-path"),
    xMailer: get("x-mailer"),
    contentType: get("content-type"),
  };

  // Parse Received chain
  const receivedRaw = allHeaders["received"] ?? [];
  const receivedChain: ReceivedHop[] = receivedRaw.map((r, i) => {
    const fromMatch = r.match(/from\s+([^\s(]+)/i);
    const byMatch = r.match(/by\s+([^\s(]+)/i);
    const ipMatch = r.match(/\[(\d{1,3}(?:\.\d{1,3}){3})\]/);
    const dateMatch = r.match(/;\s*(.+)$/);
    return {
      hop: receivedRaw.length - i,
      from: fromMatch?.[1] ?? null,
      by: byMatch?.[1] ?? null,
      ip: ipMatch?.[1] ?? null,
      date: dateMatch?.[1]?.trim() ?? null,
    };
  }).reverse();

  // Parse Authentication-Results for SPF/DKIM/DMARC
  const authResults = (allHeaders["authentication-results"] ?? []).join(" ").toLowerCase();

  function extractStatus(tag: string): { value: string; status: "ok" | "warn" | "fail" } {
    const match = authResults.match(new RegExp(`${tag}=(pass|fail|neutral|none|softfail|temperror|permerror|hardfail|bestguesspass)`));
    const val = match?.[1] ?? "none";
    const status: "ok" | "warn" | "fail" =
      val === "pass" || val === "bestguesspass" ? "ok" :
      val === "none" || val === "neutral" ? "warn" : "fail";
    return { value: val, status };
  }

  const spf = extractStatus("spf");
  const dkim = extractStatus("dkim");
  const dmarc = extractStatus("dmarc");

  const spamIndicators: SpamIndicator[] = [
    { label: "SPF", ...spf },
    { label: "DKIM", ...dkim },
    { label: "DMARC", ...dmarc },
  ];

  // Check for X-Spam-Status
  const xSpam = get("x-spam-status");
  if (xSpam) {
    const isSpam = /^yes/i.test(xSpam);
    spamIndicators.push({ label: "Spam Status", value: isSpam ? "spam" : "clean", status: isSpam ? "fail" : "ok" });
  }

  return { summary, receivedChain, spamIndicators, allHeaders };
}

export default function EmailHeaderAnalyzer() {
  const [rawHeaders, setRawHeaders] = useState("");
  const [data, setData] = useState<ParsedHeaders | null>(null);
  const [error, setError] = useState("");

  function analyze() {
    if (!rawHeaders.trim()) return;
    setError("");
    setData(null);
    try {
      const result = parseHeaders(rawHeaders);
      if (Object.keys(result.allHeaders).length === 0) {
        setError("No headers found. Paste the raw email headers (e.g. from Gmail → Show original).");
        return;
      }
      setData(result);
    } catch {
      setError("Failed to parse headers. Make sure you pasted the raw email source.");
    }
  }

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
          <button className="cyber-btn" onClick={analyze}>
            Analyze Headers
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 20px", color: "#ef4444", marginBottom: 24 }}>
          ⚠️ {error}
        </div>
      )}

      {data && (
        <div style={{ display: "grid", gap: 16 }}>
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
