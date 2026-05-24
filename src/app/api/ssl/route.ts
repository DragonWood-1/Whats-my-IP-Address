import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host") || "";

  if (!host) {
    return NextResponse.json({ error: "Hostname required" }, { status: 400 });
  }

  const domain = host.replace(/^https?:\/\//, "").split("/")[0];

  try {
    // Use crt.sh for certificate info
    const crtRes = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`,
      { next: { revalidate: 3600 } }
    );

    let certs: Array<{
      id: number;
      logged_at: string;
      not_before: string;
      not_after: string;
      common_name: string;
      name_value: string;
      issuer_name: string;
    }> = [];
    if (crtRes.ok) {
      const raw = await crtRes.json().catch(() => []);
      certs = Array.isArray(raw) ? raw.slice(0, 10) : [];
    }

    // Check SSL via SSL Labs (async, may not be instant)
    // Fall back to basic connectivity check
    const checkRes = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);

    const isReachable = checkRes !== null;
    const httpsOk = isReachable && checkRes!.ok;

    return NextResponse.json({
      domain,
      isReachable,
      httpsOk,
      certificates: certs.map((c) => ({
        id: c.id,
        loggedAt: c.logged_at,
        notBefore: c.not_before,
        notAfter: c.not_after,
        commonName: c.common_name,
        sans: c.name_value,
        issuer: c.issuer_name,
      })),
    });
  } catch {
    return NextResponse.json({ error: "SSL check failed" }, { status: 500 });
  }
}
