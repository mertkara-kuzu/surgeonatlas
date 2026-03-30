import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://surgeonatlas.com";

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: { "Content-Type": "text/plain" },
  });
}
