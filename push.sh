#!/bin/bash
# SurgeonAtlas - Push all files to GitHub
# Run this from inside the surgeonatlas folder:
#   cd /path/to/surgeonatlas
#   bash push.sh

set -e

echo "=== SurgeonAtlas GitHub Push Script ==="

# Check if we're in the right folder
if [ ! -f "package.json" ]; then
  echo "ERROR: Run this script from inside the surgeonatlas folder"
  exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
  echo "ERROR: git is not installed"
  exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git branch -M main
fi

# Set remote
if ! git remote get-url origin &> /dev/null; then
  echo "Adding remote origin..."
  git remote add origin https://github.com/mertkara-kuzu/surgeonatlas.git
else
  git remote set-url origin https://github.com/mertkara-kuzu/surgeonatlas.git
fi

# Stage all files
echo "Staging all files..."
git add -A

# Show what will be committed
echo ""
echo "Files to commit:"
git status --short
echo ""

# Commit
echo "Committing..."
git commit -m "Initial commit: SurgeonAtlas - Turkey surgeon directory

Next.js 15, Supabase, Claude AI chatbot, i18n (TR/EN)
Demo mode with mock data when env vars not configured"

# Push (force to overwrite the README-only commit)
echo ""
echo "Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "=== Done! Code is now on GitHub ==="
echo "Next step: Go to https://vercel.com/new to deploy"
