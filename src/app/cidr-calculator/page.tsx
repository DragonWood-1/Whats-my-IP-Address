"use client";
import { useState } from "react";

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function cidrToInfo(cidr: string) {
  const [ip, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr);
  if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const ipInt = ipToInt(ip);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const hosts = Math.max(0, broadcast - network - 1);

  return {
    cidr,
    ip,
    prefix,
    subnetMask: intToIp(mask),
    wildcardMask: intToIp(~mask >>> 0),
    networkAddress: intToIp(network),
    broadcastAddress: intToIp(broadcast),
    firstHost: intToIp(network + 1),
    lastHost: intToIp(broadcast - 1),
    totalHosts: (broadcast - network + 1).toLocaleString(),
    usableHosts: hosts.toLocaleString(),
    // Subnets that can be split
    subnets: prefix < 30
      ? [
          `${intToIp(network)}/${prefix + 1}`,
          `${intToIp(network + (1 << (31 - prefix)))}/${prefix + 1}`,
        ]
      : [],
  };
}

const QUICK_EXAMPLES = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "192.168.1.0/24",
  "10.0.0.0/24",
  "10.0.1.128/25",
];

export default function CIDRCalculator() {
  const [cidr, setCidr] = useState("192.168.1.0/24");
  const [result, setResult] = useState<ReturnType<typeof cidrToInfo> | null>(null);
  const [error, setError] = useState("");

  function calculate(input?: string) {
    const val = input || cidr;
    const r = cidrToInfo(val.trim());
    if (!r) {
      setError("Enter valid CIDR (e.g. 192.168.1.0/24)");
      setResult(null);
      return;
    }
    setError("");
    setResult(r);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>📐</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>CIDR Calculator</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Convert CIDR notation to network details, host ranges, and subnet info</p>
          </div>
        </div>
        <div style={{ height: 2, background: "linear-gradient(90deg, #00ff88, transparent)", borderRadius: 2 }} />
      </div>

      <div className="cyber-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="cyber-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Enter CIDR (e.g. 192.168.1.0/24)"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
          />
          <button className="cyber-btn" onClick={() => calculate()}>Calculate</button>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>⚠️ {error}</p>}
      </div>

      {/* Quick examples */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {QUICK_EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => { setCidr(ex); calculate(ex); }}
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 6, color: "#00d4ff", fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "monospace" }}
          >
            {ex}
          </button>
        ))}
      </div>

      {result && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e3a5f" }}>
              <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Results for {result.cidr}</h2>
            </div>
            <table className="data-table">
              <tbody>
                {[
                  ["CIDR Block", result.cidr, "#00d4ff"],
                  ["Subnet Mask", result.subnetMask, "#00ff88"],
                  ["Wildcard Mask", result.wildcardMask],
                  ["Network Address", result.networkAddress, "#7c3aed"],
                  ["Broadcast Address", result.broadcastAddress, "#f59e0b"],
                  ["First Host", result.firstHost, "#10b981"],
                  ["Last Host", result.lastHost, "#10b981"],
                  ["Total IPs", result.totalHosts],
                  ["Usable Hosts", result.usableHosts, "#00ff88"],
                ].map(([label, value, color]) => (
                  <tr key={label as string}>
                    <td style={{ color: "#475569", fontWeight: 600, fontSize: 12, textTransform: "uppercase", width: 180 }}>{label as string}</td>
                    <td style={{ color: (color as string) || "#e2e8f0", fontFamily: "monospace", fontSize: 15, fontWeight: color ? 700 : 400 }}>{value as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.subnets.length > 0 && (
            <div className="cyber-card" style={{ padding: 20 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                Split into /{result.prefix + 1} subnets
              </div>
              {result.subnets.map((s) => (
                <div key={s} style={{ fontFamily: "monospace", color: "#00ff88", fontSize: 14, padding: "6px 0", borderBottom: "1px solid rgba(30,58,95,0.5)" }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
