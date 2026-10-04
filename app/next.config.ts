import type { NextConfig } from "next";
import path from "path";

// ─── Content Security Policy ─────────────────────────────────────────────────
// Allows essential assets and connections for Clerk, Vapi (voice/WebRTC),
// Daily.co (audio workers/signaling), Cloudinary, Google Gemini, and fonts.

function getClerkFrontendHost(): string | null {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) return null;
  try {
    const b64 = pk.replace(/^pk_(test|live)_/, "");
    const decoded = Buffer.from(b64, "base64").toString("utf8").replace(/\$$/, "");
    return decoded || null;
  } catch {
    return null;
  }
}

const defaultClerkHost = "concise-sole-2.clerk.accounts.dev";
const frontendHost = getClerkFrontendHost() || defaultClerkHost;
const instanceHosts = Array.from(
  new Set([
    `https://${frontendHost}`,
    `wss://${frontendHost}`,
    `https://${defaultClerkHost}`,
    `wss://${defaultClerkHost}`,
  ]),
);

const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "https://*.clerk.accounts.dev",
    "https://*.accounts.dev",
    "https://accounts.dev",
    "https://*.clerk.com",
    "https://*.clerk.dev",
    "https://clerk.com",
    "https://challenges.cloudflare.com",
    "https://*.protect.clerk.com",
    "https://*.vapi.ai",
    "https://*.daily.co",
    ...instanceHosts.filter((h) => h.startsWith("https://")),
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  [
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "https://*.clerk.accounts.dev",
    "https://*.accounts.dev",
    "https://accounts.dev",
    "https://*.clerk.com",
    "https://*.clerk.dev",
    "https://images.clerk.dev",
    "https://img.clerk.com",
    "https://images.unsplash.com",
    "https://lh3.googleusercontent.com",
    ...instanceHosts.filter((h) => h.startsWith("https://")),
  ].join(" "),
  "media-src 'self' blob: data: https://res.cloudinary.com https://*.vapi.ai https://*.daily.co",
  [
    "connect-src 'self'",
    "https://*.clerk.accounts.dev",
    "https://*.accounts.dev",
    "https://accounts.dev",
    "wss://*.clerk.accounts.dev",
    "wss://*.accounts.dev",
    "https://*.clerk.com",
    "https://*.clerk.dev",
    "https://clerk.com",
    "https://api.clerk.com",
    "https://challenges.cloudflare.com",
    "https://*.protect.clerk.com",
    "https://*.vapi.ai",
    "https://api.vapi.ai",
    "wss://*.vapi.ai",
    "https://*.daily.co",
    "wss://*.daily.co",
    "https://res.cloudinary.com",
    "https://api.cloudinary.com",
    "https://generativelanguage.googleapis.com",
    "https://*.sentry.io",
    "https://*.upstash.io",
    "ws://localhost:*",
    "http://localhost:*",
    "ws://127.0.0.1:*",
    "http://127.0.0.1:*",
    ...instanceHosts,
  ].join(" "),
  "worker-src 'self' blob:",
  [
    "frame-src 'self'",
    "https://*.clerk.accounts.dev",
    "https://*.accounts.dev",
    "https://accounts.dev",
    "https://*.clerk.com",
    "https://*.clerk.dev",
    "https://clerk.com",
    "https://challenges.cloudflare.com",
    "https://*.vapi.ai",
    "https://*.daily.co",
    ...instanceHosts.filter((h) => h.startsWith("https://")),
  ].join(" "),
  "frame-ancestors 'none'",
  [
    "form-action 'self'",
    "https://*.clerk.accounts.dev",
    "https://*.accounts.dev",
    "https://*.clerk.com",
    ...instanceHosts.filter((h) => h.startsWith("https://")),
  ].join(" "),
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self \"https://*.vapi.ai\" \"https://*.daily.co\"), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "*.clerk.accounts.dev",
      },
      {
        protocol: "https",
        hostname: "concise-sole-2.clerk.accounts.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Allow large resume PDF uploads via server actions
    },
  },
};

import { withSentryConfig } from "@sentry/nextjs/config";

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
