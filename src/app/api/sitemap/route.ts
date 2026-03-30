import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://surgeonatlas.com";

export async function GET() {
  // Fetch all doctor slugs
  const { data: doctors } = await supabase
    .from("doctors")
    .select("slug, updated_at");

  // Fetch all specialties
  const { data: specialties } = await supabase
    .from("specialties")
    .select("slug");

  // Fetch unique cities
  const { data: cities } = await supabase
    .from("doctors")
    .select("city")
    .not("city", "is", null);

  const uniqueCities = [...new Set(cities?.map((c) => c.city) || [])];

  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily" },
    { url: "/doctors", priority: "0.9", changefreq: "daily" },
    { url: "/find-surgeon", priority: "0.8", changefreq: "weekly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // Static pages (both locales)
  for (const page of staticPages) {
    for (const locale of ["tr", "en"]) {
      const prefix = locale === "tr" ? "" : "/en";
      xml += `
  <url>
    <loc>${SITE_URL}${prefix}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="${SITE_URL}${page.url}" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en${page.url}" />
  </url>`;
    }
  }

  // Doctor profiles
  for (const doc of doctors || []) {
    const lastmod = doc.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0];
    for (const locale of ["tr", "en"]) {
      const prefix = locale === "tr" ? "" : "/en";
      xml += `
  <url>
    <loc>${SITE_URL}${prefix}/doctors/${doc.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="${SITE_URL}/doctors/${doc.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en/doctors/${doc.slug}" />
  </url>`;
    }
  }

  // City pages
  for (const city of uniqueCities) {
    const slug = city.toLowerCase().replace(/\s+/g, "-");
    for (const locale of ["tr", "en"]) {
      const prefix = locale === "tr" ? "" : "/en";
      xml += `
  <url>
    <loc>${SITE_URL}${prefix}/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  }

  // Specialty pages
  for (const spec of specialties || []) {
    for (const locale of ["tr", "en"]) {
      const prefix = locale === "tr" ? "" : "/en";
      xml += `
  <url>
    <loc>${SITE_URL}${prefix}/specialties/${spec.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
