#!/bin/bash

# Display Node version
echo "Node version:"
node -v

# Install dependencies
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

# Build project
npm run build

# Ensure _redirects file exists
cp -f public/_redirects dist/ || echo "/* /index.html 200" > dist/_redirects

echo "Build completed successfully!" 