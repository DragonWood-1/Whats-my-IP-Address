import { NextRequest, NextResponse } from "next/server";

function parseEmailHeaders(raw: string) {
  const lines = raw.split(/\r?\n/);
  const headers: Record<string, string[]> = {};
  let currentKey = "";
  let currentVal = "";

  for (const line of lines) {
    if (/^\s/.test(line)) {
      currentVal += " " + line.trim();
    } else {
      if (currentKey) {
        headers[currentKey] = headers[currentKey] || [];
        headers[currentKey].push(currentVal.trim());
      }
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        currentKey = line.slice(0, colonIdx).toLowerCase();
        currentVal = line.slice(colonIdx + 1).trim();
      } else {
        currentKey = "";
        currentVal = "";
      }
    }
  }
  if (currentKey) {
    headers[currentKey] = headers[currentKey] || [];
    headers[currentKey].push(currentVal.trim());
  }

  return headers;
}

function extractReceivedChain(headers: Record<string, string[]>) {
  const received = headers["received"] || [];
  return received.map((r, i) => {
    const fromMatch = r.match(/from\s+([^\s(]+)/i);
    const byMatch = r.match(/by\s+([^\s(]+)/i);
    const ipMatch = r.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
    const dateMatch = r.match(/;\s*(.+)$/);
    return {
      hop: i + 1,
      from: fromMatch?.[1] || null,
      by: byMatch?.[1] || null,
      ip: ipMatch?.[1] || null,
      date: dateMatch?.[1]?.trim() || null,
      raw: r,
    };
  });
}

function checkSpamIndicators(headers: Record<string, string[]>) {
  const indicators: { label: string; value: string; status: "ok" | "warn" | "fail" }[] = [];

  const spf = headers["received-spf"]?.[0] || headers["x-google-dkim-signature"]?.[0] || "";
  const authResults = headers["authentication-results"]?.[0] || "";

  indicators.push({
    label: "SPF",
    value: authResults.match(/spf=(\w+)/i)?.[1] || "not found",
    status: authResults.includes("spf=pass") ? "ok" : authResults.includes("spf=fail") ? "fail" : "warn",
  });

  indicators.push({
    label: "DKIM",
    value: authResults.match(/dkim=(\w+)/i)?.[1] || "not found",
    status: authResults.includes("dkim=pass") ? "ok" : authResults.includes("dkim=fail") ? "fail" : "warn",
  });

  indicators.push({
    label: "DMARC",
    value: authResults.match(/dmarc=(\w+)/i)?.[1] || "not found",
    status: authResults.includes("dmarc=pass") ? "ok" : authResults.includes("dmarc=fail") ? "fail" : "warn",
  });

  const spamScore = headers["x-spam-score"]?.[0] || headers["x-spam-status"]?.[0] || "";
  if (spamScore) {
    const score = parseFloat(spamScore.match(/[\d.]+/)?.[0] || "0");
    indicators.push({
      label: "Spam Score",
      value: spamScore,
      status: score > 5 ? "fail" : score > 2 ? "warn" : "ok",
    });
  }

  return indicators;
}

export async function POST(req: NextRequest) {
  try {
    const { headers: rawHeaders } = await req.json();

    if (!rawHeaders || typeof rawHeaders !== "string") {
      return NextResponse.json({ error: "Raw email headers required" }, { status: 400 });
    }

    const parsed = parseEmailHeaders(rawHeaders);
    const receivedChain = extractReceivedChain(parsed);
    const spamIndicators = checkSpamIndicators(parsed);

    const summary = {
      from: parsed["from"]?.[0] || null,
      to: parsed["to"]?.[0] || null,
      subject: parsed["subject"]?.[0] || null,
      date: parsed["date"]?.[0] || null,
      messageId: parsed["message-id"]?.[0] || null,
      replyTo: parsed["reply-to"]?.[0] || null,
      xMailer: parsed["x-mailer"]?.[0] || null,
      contentType: parsed["content-type"]?.[0] || null,
    };

    return NextResponse.json({
      summary,
      receivedChain,
      spamIndicators,
      allHeaders: parsed,
    });
  } catch {
    return NextResponse.json({ error: "Failed to parse headers" }, { status: 500 });
  }
}
