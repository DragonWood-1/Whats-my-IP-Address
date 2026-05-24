import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PWASetup from "@/components/PWASetup";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00d4ff",
};

export const metadata: Metadata = {
  title: {
    default: "ip-space.com – Free IP Tools, Lookup & Network Diagnostics",
    template: "%s | ip-space.com",
  },
  description:
    "Free IP lookup, Whois, DNS checker, port scanner, SSL checker, GeoIP, ASN lookup, subnet calculator and 16+ network tools. Instant results, no registration.",
  keywords: [
    "ip lookup", "whois lookup", "dns checker", "port scanner",
    "ip address", "geoip", "asn lookup", "subnet calculator", "ssl checker", "vpn detector",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ip-space.com",
  },
  openGraph: {
    type: "website",
    siteName: "ip-space.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4240246726849925"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div className="relative z-10 flex flex-col min-h-screen" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <Nav />
          <main className="flex-1 page-content">{children}</main>
          <Footer />
        </div>
        <BottomNav />
        <PWASetup />
      </body>
    </html>
  );
}
