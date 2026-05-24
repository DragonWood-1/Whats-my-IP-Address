import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") || "";

  if (!ip) {
    return NextResponse.json({ error: "IP address required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    if (data.status === "fail") {
      return NextResponse.json({ error: data.message || "Lookup failed" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch IP data" }, { status: 500 });
  }
}
