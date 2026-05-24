const CACHE = "iptoolkit-v1";
const STATIC = [
  "/",
  "/what-is-my-ip",
  "/ip-lookup",
  "/dns-checker",
  "/whois-lookup",
  "/port-scanner",
  "/ping-test",
  "/traceroute",
  "/ssl-checker",
  "/geoip-finder",
  "/asn-lookup",
  "/subnet-calculator",
  "/cidr-calculator",
  "/reverse-dns",
  "/blacklist-checker",
  "/vpn-detector",
  "/proxy-detector",
  "/email-header-analyzer",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // External APIs: network-first, no cache
  if (!url.origin.includes(self.location.origin)) {
    e.respondWith(fetch(e.request).catch(() => new Response("Offline", { status: 503 })));
    return;
  }

  // App pages: cache-first with network update
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});
