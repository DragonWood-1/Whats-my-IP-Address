import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host") || "";

  if (!host) {
    return NextResponse.json({ error: "Host required" }, { status: 400 });
  }

  const domain = host.replace(/^https?:\/\//, "").split("/")[0];

  // Simulate traceroute using DNS + IP lookups for educational display
  // Real traceroute requires OS-level ICMP which isn't available in serverless
  try {
    const dnsRes = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { next: { revalidate: 300 } }
    );
    const dnsData = await dnsRes.json();
    const targetIP = dnsData.Answer?.[0]?.data || null;

    if (!targetIP) {
      return NextResponse.json({ error: "Could not resolve hostname" }, { status: 400 });
    }

    // Get target geolocation
    const geoRes = await fetch(
      `http://ip-api.com/json/${targetIP}?fields=country,city,isp,org,as`,
      { next: { revalidate: 3600 } }
    );
    const geoData = await geoRes.json();

    // Simulate hops (educational demonstration)
    const hops = [
      { hop: 1, ip: "192.168.1.1", hostname: "gateway.local", latency: [0.4, 0.5, 0.4], location: "Local Gateway" },
      { hop: 2, ip: "10.0.0.1", hostname: "isp-edge.local", latency: [3.2, 3.1, 3.3], location: "ISP Edge Router" },
      { hop: 3, ip: "***", hostname: null, latency: [null, null, null], location: "Hidden hop" },
      { hop: 4, ip: targetIP, hostname: domain, latency: [null, null, null], location: `${geoData.city || ""} ${geoData.country || ""}`.trim() },
    ];

    return NextResponse.json({
      host: domain,
      targetIP,
      hops,
      note: "Traceroute simulation — real ICMP traceroute requires system access.",
      targetInfo: geoData,
    });
  } catch {
    return NextResponse.json({ error: "Traceroute failed" }, { status: 500 });
  }
}
