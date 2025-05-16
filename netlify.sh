#!/bin/bash

# Exit on error
set -e

# Display Node and NPM versions
echo "Node version:"
node -v
echo "NPM version:"
npm -v

# Clean install dependencies
echo "Installing dependencies..."
npm ci

# Create environment variables file
echo "Creating .env file..."
cat > .env << EOF
VITE_FIREBASE_API_KEY=AIzaSyAlG7GmGiHVG_J0KyjR35PTxYH-mKQ0yo0
VITE_FIREBASE_AUTH_DOMAIN=bitbus-77c95.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://bitbus-77c95-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=bitbus-77c95
VITE_FIREBASE_STORAGE_BUCKET=bitbus-77c95.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=17457960794
VITE_FIREBASE_APP_ID=1:17457960794:web:41d665b10d976187014563
VITE_FIREBASE_MEASUREMENT_ID=G-PDQ71P8X06
EOF

# Ensure dist directory doesn't exist
rm -rf dist

# Build project
echo "Building project..."
npm run build

# Verify dist directory was created
if [ ! -d "dist" ]; then
  echo "Error: dist directory was not created during build"
  exit 1
fi

# Create _redirects file for SPA routing
echo "Creating _redirects file..."
echo "/* /index.html 200" > dist/_redirects

# Copy static assets
echo "Copying static assets..."
cp -r public/* dist/ 2>/dev/null || :

echo "Build completed successfully!"
ls -la dist/ 