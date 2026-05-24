import { NextRequest, NextResponse } from "next/server";
import * as net from "net";

const COMMON_PORTS: Record<number, string> = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  443: "HTTPS",
  445: "SMB",
  587: "SMTP/TLS",
  993: "IMAPS",
  995: "POP3S",
  1433: "MSSQL",
  3306: "MySQL",
  3389: "RDP",
  5432: "PostgreSQL",
  5900: "VNC",
  6379: "Redis",
  8080: "HTTP-Alt",
  8443: "HTTPS-Alt",
  27017: "MongoDB",
};

async function checkPort(host: string, port: number, timeout = 3000): Promise<"open" | "closed"> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (result: "open" | "closed") => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);
    socket.on("connect", () => done("open"));
    socket.on("timeout", () => done("closed"));
    socket.on("error", () => done("closed"));

    socket.connect(port, host);
  });
}

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host") || "";
  const portParam = req.nextUrl.searchParams.get("ports") || "common";

  if (!host) {
    return NextResponse.json({ error: "Host required" }, { status: 400 });
  }

  const domain = host.replace(/^https?:\/\//, "").split("/")[0];

  let ports: number[];
  if (portParam === "common") {
    ports = Object.keys(COMMON_PORTS).map(Number);
  } else {
    ports = portParam
      .split(",")
      .map((p) => parseInt(p.trim()))
      .filter((p) => !isNaN(p) && p > 0 && p < 65536)
      .slice(0, 30);
  }

  const results = await Promise.all(
    ports.map(async (port) => {
      const status = await checkPort(domain, port);
      return { port, service: COMMON_PORTS[port] || "unknown", status };
    })
  );

  const openCount = results.filter((r) => r.status === "open").length;

  return NextResponse.json({ host: domain, results, openCount, totalScanned: ports.length });
}
