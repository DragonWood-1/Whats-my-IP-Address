import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") || "";

  if (!ip) {
    return NextResponse.json({ error: "IP address required" }, { status: 400 });
  }

  try {
    // Build PTR query from IP
    const ptr = ip.split(".").reverse().join(".") + ".in-addr.arpa";
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(ptr)}&type=PTR`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    const hostnames = (data.Answer || []).map((r: { data: string }) =>
      r.data.replace(/\.$/, "")
    );

    return NextResponse.json({ ip, ptr, hostnames, raw: data });
  } catch {
    return NextResponse.json({ error: "Reverse DNS lookup failed" }, { status: 500 });
  }
}
