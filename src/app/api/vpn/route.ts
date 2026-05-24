import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") || "";

  if (!ip) {
    return NextResponse.json({ error: "IP address required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,proxy,hosting,isp,org,as,asname,country,countryCode,city,query`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    if (data.status === "fail") {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    const isProxy = data.proxy === true;
    const isHosting = data.hosting === true;
    const ispLower = (data.isp || "").toLowerCase();
    const orgLower = (data.org || "").toLowerCase();

    const vpnKeywords = ["vpn", "nordvpn", "expressvpn", "mullvad", "protonvpn", "torguard", "privateinternetaccess", "pia", "hidemyass", "ipvanish", "surfshark", "cyberghost"];
    const isVPN = vpnKeywords.some((k) => ispLower.includes(k) || orgLower.includes(k)) || isProxy;

    const torRes = await fetch(
      `https://check.torproject.org/torbulkexitlist`,
      { next: { revalidate: 3600 } }
    ).catch(() => null);
    let isTor = false;
    if (torRes?.ok) {
      const text = await torRes.text();
      isTor = text.includes(ip);
    }

    return NextResponse.json({
      ip: data.query,
      isVPN,
      isProxy,
      isHosting,
      isTor,
      isp: data.isp,
      org: data.org,
      asn: data.as,
      country: data.country,
      city: data.city,
      riskScore: (isVPN ? 40 : 0) + (isProxy ? 30 : 0) + (isTor ? 30 : 0),
    });
  } catch {
    return NextResponse.json({ error: "Detection failed" }, { status: 500 });
  }
}
