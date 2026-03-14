#!/bin/bash
# Deploy Musamar Hub — auto-generates version timestamp
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="/tmp/musamar-deploy"
TS="t$(date +%s)"

# Update version in index.html and version.txt
sed -i "s/var APP_V='[^']*'/var APP_V='$TS'/" "$DIR/index.html"
echo -n "$TS" > "$DIR/version.txt"

# Copy to deploy repo
cp "$DIR/index.html" "$DEPLOY/"
cp "$DIR/version.txt" "$DEPLOY/"
cp "$DIR/manifest.json" "$DEPLOY/" 2>/dev/null || true
cp "$DIR/firebase-messaging-sw.js" "$DEPLOY/" 2>/dev/null || true
cp "$DIR/sw.js" "$DEPLOY/" 2>/dev/null || true

# Push
cd "$DEPLOY"
git add -A
git commit -m "deploy: $TS" --allow-empty
git push

echo "Deployed: $TS"
