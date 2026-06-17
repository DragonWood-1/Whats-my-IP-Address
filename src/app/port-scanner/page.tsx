"use client";
import { useState } from "react";

const COMMON_PORTS: Record<number, string> = {
  21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
  80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 445: "SMB",
  587: "SMTP/TLS", 993: "IMAPS", 995: "POP3S", 3306: "MySQL",
  3389: "RDP", 5432: "PostgreSQL", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
};

async function probePort(host: string, port: number): Promise<"open" | "closed"> {
  // For HTTPS ports, try a fetch; for others, attempt an image load trick
  const isHttps = port === 443 || port === 8443;
  const isHttp = port === 80 || port === 8080;
  if (isHttps || isHttp) {
    const proto = isHttps ? "https" : "http";
    try {
      await fetch(`${proto}://${host}:${port}`, { method: "HEAD", mode: "no-cors", signal: AbortSignal.timeout(3000) });
      return "open";
    } catch { return "closed"; }
  }
  // For non-HTTP ports, use WebSocket probe
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://${host}:${port}`);
      const timer = setTimeout(() => { ws.close(); resolve("closed"); }, 2000);
      ws.onopen = () => { clearTimeout(timer); ws.close(); resolve("open"); };
      ws.onerror = () => { clearTimeout(timer); resolve("closed"); };
    } catch { resolve("closed"); }
  });
}

export default function PortScanner() {
  const [host, setHost] = useState("");
  const [results, setResults] = useState<{ port: number; service: string; status: "open" | "closed" }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  async function scan() {
    if (!host.trim()) return;
    setScanning(true); setResults([]); setProgress(0);
    const domain = host.trim().replace(/^https?:\/\//, "").split("/")[0];
    const ports = Object.keys(COMMON_PORTS).map(Number);
    const all: typeof results = [];

    for (let i = 0; i < ports.length; i++) {
      const port = ports[i];
      const status = await probePort(domain, port);
      all.push({ port, service: COMMON_PORTS[port], status });
      setResults([...all]);
      setProgress(Math.round(((i + 1) / ports.length) * 100));
    }
    setScanning(false);
  }

  const openPorts = results.filter((r) => r.status === "open");
  const closedPorts = results.filter((r) => r.status === "closed");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🚪</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Port Scanner</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Probe common ports on any host from your browser</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #f59e0b, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input className="cyber-input" style={{ flex: 1, minWidth: 200 }} placeholder="Enter hostname (e.g. example.com)" value={host} onChange={(e) => setHost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !scanning && scan()} />
          <button className="cyber-btn" onClick={scan} disabled={scanning}>{scanning ? `Scanning ${progress}%` : "Scan Ports"}</button>
        </div>
        <p style={{ color: "#475569", fontSize: 12, marginTop: 12 }}>⚠️ Only scan hosts you own or have explicit permission to test. Browser-based probing checks HTTP/HTTPS ports most reliably.</p>
      </div>

      {scanning && (
        <div className="cyber-card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Scanning ports...</span>
            <span style={{ color: "#00d4ff", fontSize: 13, fontFamily: "monospace" }}>{progress}%</span>
          </div>
          <div style={{ height: 4, background: "#1e3a5f", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #0ea5e9, #00d4ff)", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Open Ports", value: openPorts.length, color: "#10b981" },
              { label: "Closed", value: closedPorts.length, color: "#475569" },
              { label: "Scanned", value: results.length, color: "#00d4ff" },
            ].map((s) => (
              <div key={s.label} className="cyber-card" style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: s.color, fontSize: 28, fontWeight: 800, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {openPorts.length > 0 && (
            <div className="cyber-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#10b981", fontSize: 16 }}>●</span>
                <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Open Ports</h2>
              </div>
              <table className="data-table">
                <thead><tr><th>Port</th><th>Service</th><th>Status</th></tr></thead>
                <tbody>
                  {openPorts.map((r) => (
                    <tr key={r.port}>
                      <td style={{ color: "#00d4ff", fontFamily: "monospace", fontWeight: 700, fontSize: 15 }}>{r.port}</td>
                      <td style={{ color: "#e2e8f0", fontSize: 14 }}>{r.service}</td>
                      <td><span className="badge badge-green">OPEN</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="cyber-card" style={{ padding: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Closed / Filtered</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {closedPorts.map((r) => (
                <div key={r.port} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1e3a5f", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontFamily: "monospace" }}>
                  <span style={{ color: "#475569" }}>{r.port}</span>
                  <span style={{ color: "#1e3a5f", marginLeft: 4 }}>{r.service}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
