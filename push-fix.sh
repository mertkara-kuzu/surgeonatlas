#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Pushing build fixes ==="

git add -A
git commit -m "Fix build errors: imports, missing functions, property mismatches"
git push origin main

echo "=== Done! Go to Vercel dashboard and click Redeploy ==="
