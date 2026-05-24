import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json({ error: "ASN or IP required" }, { status: 400 });
  }

  try {
    // Use ip-api for IP->ASN, and bgpview for ASN details
    const isASN = /^(as)?\d+$/i.test(query.trim());

    if (isASN) {
      const asnNum = query.replace(/^as/i, "");
      const res = await fetch(`https://api.bgpview.io/asn/${asnNum}`, {
        next: { revalidate: 3600 },
        headers: { "Accept": "application/json" },
      });
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      // IP lookup
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,country,countryCode,isp,org,as,asname,query`,
        { next: { revalidate: 3600 } }
      );
      const data = await res.json();
      if (data.status === "fail") {
        return NextResponse.json({ error: data.message }, { status: 400 });
      }
      return NextResponse.json(data);
    }
  } catch {
    return NextResponse.json({ error: "ASN lookup failed" }, { status: 500 });
  }
}
