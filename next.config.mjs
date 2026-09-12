// @ts-check

/**
 * Response headers.
 *
 * `script-src` and `default-src` are deliberately absent. Next.js emits inline scripts for the
 * hydration payload, and this site is statically prerendered, so the documented nonce approach
 * would force every route to render per request. Restricting what a page can be framed in,
 * where forms can post, and what a rewritten `<base>` could do is available without that
 * tradeoff, so those directives ship and the script policy does not.
 *
 * Verified against production on 2026-09-12: the host sent none of these, leaving the site
 * without HSTS, without clickjacking protection and without MIME-sniffing protection.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Two years, subdomains included. `preload` is deliberately omitted: submitting to the
  // preload list is effectively irreversible and is the domain owner's decision, not a build's.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: ["camera=()", "microphone=()", "geolocation=()", "payment=()", "usb=()"].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
