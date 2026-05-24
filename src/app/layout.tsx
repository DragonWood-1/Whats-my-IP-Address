import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "IPToolkit – Free IP Tools, Lookup & Network Diagnostics",
    template: "%s | IPToolkit",
  },
  description:
    "Free IP lookup, Whois, DNS checker, port scanner, SSL checker, GeoIP, ASN lookup, subnet calculator and 16+ network tools. Instant results, no registration.",
  keywords: [
    "ip lookup",
    "whois lookup",
    "dns checker",
    "port scanner",
    "ip address",
    "geoip",
    "asn lookup",
    "subnet calculator",
    "ssl checker",
    "vpn detector",
  ],
  openGraph: {
    type: "website",
    siteName: "IPToolkit",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
