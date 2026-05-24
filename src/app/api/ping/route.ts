import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host") || "";

  if (!host) {
    return NextResponse.json({ error: "Host required" }, { status: 400 });
  }

  const domain = host.replace(/^https?:\/\//, "").split("/")[0];
  const results: { attempt: number; latency: number | null; status: string }[] = [];

  // Simulate ping via HTTP HEAD requests (server-side)
  for (let i = 1; i <= 4; i++) {
    const start = Date.now();
    try {
      const res = await fetch(`https://${domain}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      });
      const latency = Date.now() - start;
      results.push({ attempt: i, latency, status: res.ok ? "success" : `HTTP ${res.status}` });
    } catch {
      results.push({ attempt: i, latency: null, status: "timeout" });
    }
    // Small delay between pings
    if (i < 4) await new Promise((r) => setTimeout(r, 200));
  }

  const successful = results.filter((r) => r.latency !== null);
  const avgLatency =
    successful.length > 0
      ? Math.round(successful.reduce((a, r) => a + r.latency!, 0) / successful.length)
      : null;
  const minLatency = successful.length > 0 ? Math.min(...successful.map((r) => r.latency!)) : null;
  const maxLatency = successful.length > 0 ? Math.max(...successful.map((r) => r.latency!)) : null;
  const packetLoss = Math.round(((4 - successful.length) / 4) * 100);

  return NextResponse.json({
    host: domain,
    results,
    avgLatency,
    minLatency,
    maxLatency,
    packetLoss,
    sent: 4,
    received: successful.length,
  });
}
