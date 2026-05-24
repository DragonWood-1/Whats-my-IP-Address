import { NextRequest, NextResponse } from "next/server";

// Major DNS-based blacklists
const DNSBL_LIST = [
  { name: "Spamhaus ZEN", host: "zen.spamhaus.org" },
  { name: "Barracuda", host: "b.barracudacentral.org" },
  { name: "SpamCop", host: "bl.spamcop.net" },
  { name: "SORBS SPAM", host: "spam.sorbs.net" },
  { name: "SORBS HTTP", host: "http.sorbs.net" },
  { name: "UCEPROTECT L1", host: "dnsbl-1.uceprotect.net" },
  { name: "UCEPROTECT L2", host: "dnsbl-2.uceprotect.net" },
  { name: "CBL Abuseat", host: "cbl.abuseat.org" },
  { name: "Lashback", host: "ubl.unsubscore.com" },
  { name: "NordSpam", host: "bl.nordspam.com" },
];

async function checkDNSBL(ip: string, dnsbl: string): Promise<boolean> {
  const reversed = ip.split(".").reverse().join(".");
  const lookup = `${reversed}.${dnsbl}`;
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(lookup)}&type=A`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return !!(data.Answer && data.Answer.length > 0);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") || "";

  if (!ip || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return NextResponse.json({ error: "Valid IPv4 address required" }, { status: 400 });
  }

  const results = await Promise.all(
    DNSBL_LIST.map(async ({ name, host }) => ({
      name,
      host,
      listed: await checkDNSBL(ip, host),
    }))
  );

  const listedCount = results.filter((r) => r.listed).length;

  return NextResponse.json({
    ip,
    listedCount,
    totalChecked: DNSBL_LIST.length,
    results,
  });
}
