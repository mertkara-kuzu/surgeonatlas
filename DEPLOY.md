# SurgeonAtlas Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free at vercel.com)
- Supabase project (free at supabase.com)
- Claude API key (from console.anthropic.com)
- Domain: surgeonatlas.com (registered at any registrar)

## Step 1: Push to GitHub

```bash
cd surgeonatlas
git init
git add .
git commit -m "Initial commit: SurgeonAtlas MVP"
git remote add origin https://github.com/YOUR_USERNAME/surgeonatlas.git
git push -u origin main
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and paste the contents of `surgeonatlas-enrichment/output/supabase_schema.sql`
3. Click **Run** to create all tables
4. Go to **Settings > API** and copy:
   - Project URL (e.g., `https://abcdefgh.supabase.co`)
   - `anon` public key
5. Go to **Authentication > Providers** and enable:
   - Email (enabled by default)
   - Google (add your OAuth credentials)

## Step 3: Deploy to Vercel

### Option A: One-Click Deploy
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Add environment variables (see below)
5. Click **Deploy**

### Option B: CLI Deploy
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Environment Variables

Set these in Vercel Dashboard > Project > Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |
| `ANTHROPIC_API_KEY` | Your Claude API key | All |
| `NEXT_PUBLIC_SITE_URL` | `https://surgeonatlas.com` | All |
| `CRON_SECRET` | Random string for cron auth | All |

Generate CRON_SECRET with: `openssl rand -hex 32`

## Step 4: Connect Custom Domain

### In Vercel:
1. Go to Project > Settings > Domains
2. Add `surgeonatlas.com`
3. Add `www.surgeonatlas.com` (redirects to apex)
4. Vercel shows you the required DNS records

### In Your Domain Registrar (or Cloudflare):
Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

If using **Cloudflare** (recommended for free CDN + DDoS protection):
1. Add your domain to Cloudflare (free plan)
2. Update nameservers at your registrar to Cloudflare's
3. Add the DNS records above
4. Set SSL/TLS to **Full (strict)**
5. Enable **Always Use HTTPS**

SSL certificate is automatically provisioned by Vercel (takes 1-5 minutes).

## Step 5: Populate Data

Run the enrichment pipeline and import to Supabase:

```bash
cd surgeonatlas-enrichment

# 1. Export Airtable CSVs into data/ folder
# 2. Add your Claude API key to config.py
# 3. Run the pipeline
python enrich.py

# 4. Import to Supabase (use the Supabase Dashboard CSV import
#    or the Supabase client in a script)
```

## Step 6: Submit to Search Engines

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `surgeonatlas.com`
3. Verify via DNS TXT record
4. Submit sitemap: `https://surgeonatlas.com/sitemap.xml`
5. Repeat for [Bing Webmaster Tools](https://www.bing.com/webmasters)

## Post-Launch Checklist

- [ ] Verify all pages load correctly
- [ ] Test language switching (TR/EN)
- [ ] Test search functionality
- [ ] Test AI chatbot
- [ ] Verify sitemap.xml renders correctly
- [ ] Verify robots.txt renders correctly
- [ ] Check mobile responsiveness
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Vercel Analytics (free tier)
- [ ] Monitor Supabase usage (free tier limits)
- [ ] Set up error monitoring (Sentry free tier)

## Costs Summary

| Service | Monthly Cost |
|---------|-------------|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| Claude API | ~$5-20 (usage-based) |
| Cloudflare DNS | $0 |
| Domain | ~$1 (amortized) |
| **Total** | **$1-21/month** |
