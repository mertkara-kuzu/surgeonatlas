#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Removing stale lock file ==="
rm -f .git/index.lock

echo "=== Staging changes ==="
git add -A

echo "=== Committing ==="
git commit -m "Fix build errors: route conflicts, imports, null safety, missing pages

- Move (doctors)/ route group to doctors/ to resolve URL conflicts
- Fix DoctorCard named import in find-surgeon page
- Fix Specialty object rendering in JSX
- Add null checks for supabase client in auth pages
- Add null safety for nullable first_name/last_name in search
- Add missing translation keys (search, findSurgeon, auth, specialties)
- Create specialties listing page
- Add root layout.tsx required by next-intl"

echo "=== Pushing ==="
git push origin main

echo "=== Done! Vercel should auto-deploy. Check your Vercel dashboard. ==="
