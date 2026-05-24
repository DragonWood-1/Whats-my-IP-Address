import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json({ error: "Domain or IP required" }, { status: 400 });
  }

  try {
    // Use whois.domaintools.com API (free tier) or rdap
    const domain = query.replace(/^https?:\/\//, "").split("/")[0];

    // RDAP lookup (open standard, no key needed)
    const rdapUrl = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)
      ? `https://rdap.arin.net/registry/ip/${encodeURIComponent(domain)}`
      : `https://rdap.org/domain/${encodeURIComponent(domain)}`;

    const res = await fetch(rdapUrl, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Whois lookup failed: ${res.status}` }, { status: 400 });
    }

    const data = await res.json();

    // Parse RDAP response
    const registrant = data.entities?.find(
      (e: { roles?: string[] }) => e.roles?.includes("registrant")
    );
    const registrar = data.entities?.find(
      (e: { roles?: string[] }) => e.roles?.includes("registrar")
    );

    return NextResponse.json({
      query: domain,
      handle: data.handle,
      name: data.ldh_name || data.name || domain,
      status: data.status || [],
      nameservers: (data.nameservers || []).map((ns: { ldhName?: string }) => ns.ldhName),
      events: data.events || [],
      registrant: registrant?.vcardArray?.[1] || null,
      registrar: registrar?.vcardArray?.[1] || null,
      raw: data,
    });
  } catch {
    return NextResponse.json({ error: "Whois lookup failed" }, { status: 500 });
  }
}
