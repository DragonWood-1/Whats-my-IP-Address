import { NextRequest, NextResponse } from "next/server";

const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "CAA", "PTR"];

async function dnsQuery(name: string, type: string) {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return { type, answers: data.Answer || [], status: data.Status };
  } catch {
    return { type, answers: [], status: -1 };
  }
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain") || "";
  const type = req.nextUrl.searchParams.get("type") || "ALL";

  if (!domain) {
    return NextResponse.json({ error: "Domain required" }, { status: 400 });
  }

  const types = type === "ALL" ? RECORD_TYPES : [type.toUpperCase()];
  const results = await Promise.all(types.map((t) => dnsQuery(domain, t)));

  return NextResponse.json({ domain, results });
}
