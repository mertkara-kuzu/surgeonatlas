import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://surgeonatlas.com";

export async function GET() {
  let doctors: { slug: string; updated_at?: string }[] = [];
  let specialties: { slug: string }[] = [];
  let uniqueCities: string[] = [];

  if (supabase) {
    const { data: d } = await supabase.from("doctors").select("slug, updated_at");
    const { data: s } = await supabase.from("specialties").select("slug");
    const { data: c } = await supabase.from("doctors").select("city").not("city", "is", null);

    doctors = d || [];
    specialties = s || [];
    uniqueCities = [...new Set((c || []).map((r: { city: string }) => r.city))];
  }

  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily" },
    { url: "/doctors", priority: "0.9", changefreq: "daily" },
    { url: "/find-surgeon", priority: "0.8", changefreq: "weekly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  for (const page of staticPages) {
    for (const locale of ["tr", "en"]) {
      const prefix = locale === "tr" ? "" : "/en";
      xml += `
  <url>
    <loc>${SITE_URL}${prefix}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }
  }

  for (const doc of doctors) {
    const lastmod = doc.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0];
    for (const locale of ["tr", "en"]) {
      const prefix = locale === "tr" ? "" : "/en";
      xml += `
  <url>
    <loc>${SITE_URL}${prefix}/doctors/${doc.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
