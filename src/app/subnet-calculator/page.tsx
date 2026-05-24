"use client";
import { useState } from "react";

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function calcSubnet(ip: string, prefix: number) {
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const hosts = Math.max(0, broadcast - network - 1);
  const firstHost = hosts > 0 ? network + 1 : network;
  const lastHost = hosts > 0 ? broadcast - 1 : broadcast;

  return {
    ip,
    prefix,
    subnetMask: intToIp(mask),
    networkAddress: intToIp(network),
    broadcastAddress: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts: (broadcast - network + 1).toLocaleString(),
    usableHosts: hosts.toLocaleString(),
    wildcardMask: intToIp(~mask >>> 0),
    ipClass: prefix <= 8 ? "A" : prefix <= 16 ? "B" : prefix <= 24 ? "C" : "D/E",
  };
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState(24);
  const [result, setResult] = useState<ReturnType<typeof calcSubnet> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      setError("Enter a valid IPv4 address");
      return;
    }
    const parts = ip.split(".").map(Number);
    if (parts.some((p) => p < 0 || p > 255)) {
      setError("IP octets must be 0–255");
      return;
    }
    setError("");
    setResult(calcSubnet(ip, prefix));
  }

  const rows = result
    ? [
        ["IP Address", result.ip, "#00d4ff"],
        ["Subnet Mask", result.subnetMask, "#00ff88"],
        ["Wildcard Mask", result.wildcardMask],
        ["Network Address", result.networkAddress, "#7c3aed"],
        ["Broadcast Address", result.broadcastAddress, "#f59e0b"],
        ["First Usable Host", result.firstHost, "#10b981"],
        ["Last Usable Host", result.lastHost, "#10b981"],
        ["Total Hosts", result.totalHosts],
        ["Usable Hosts", result.usableHosts, "#00ff88"],
        ["CIDR Notation", `${result.networkAddress}/${result.prefix}`, "#00d4ff"],
        ["IP Class", `Class ${result.ipClass}`],
      ]
    : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>🧮</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Subnet Calculator</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Calculate network address, broadcast, host range, and more from IP + prefix</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00d4ff, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 8 }}>IP ADDRESS</label>
            <input
              className="cyber-input"
              placeholder="192.168.1.0"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 8 }}>PREFIX LENGTH (/{prefix})</label>
            <input
              type="range"
              min={1}
              max={32}
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#00d4ff" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: 11 }}>
              <span>/1</span><span style={{ color: "#00d4ff", fontWeight: 700 }}>/{prefix}</span><span>/32</span>
            </div>
          </div>
          <button className="cyber-btn" onClick={calculate}>Calculate</button>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>⚠️ {error}</p>}
      </div>

      {result && (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 16 }}>
            <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Subnet Results</h2>
            <span className="badge badge-cyan">/{result.prefix}</span>
          </div>
          <table className="data-table">
            <tbody>
              {rows.map(([label, value, color]) => (
                <tr key={label as string}>
                  <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 200 }}>{label as string}</td>
                  <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 15, fontWeight: color ? 700 : 400 }}>{value as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
