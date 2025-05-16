# 🚌 College Bus Live Tracking System

A real-time bus tracking system built with React, Firebase, and Google Maps. This system allows college bus drivers to share their live location and students to track the bus location in real-time.

## 🛠️ Tech Stack

- Frontend: React with TypeScript
- Backend & Real-time: Firebase Realtime Database
- Maps: Google Maps JavaScript API
- Authentication: Firebase Auth
- UI: Chakra UI
- Build Tool: Vite

## 📋 Features

### Driver Features
- Email/Password authentication
- Start/Stop location sharing
- Update driver details (name & phone number)

### Student Features
- Google Sign-in authentication
- Real-time bus location tracking on Google Maps
- View driver details and last update time

## 🚀 Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd bit-bus
```

2. Install dependencies
```bash
npm install
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password and Google Sign-in)
   - Enable Realtime Database
   - Copy your Firebase configuration

4. Get a Google Maps API Key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Maps JavaScript API
   - Create credentials (API Key)
   - Restrict the API key to your domain

5. Create a `.env` file in the project root with the following variables:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-app.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

6. Start the development server
```bash
npm run dev
```

## 📱 Usage

### For Drivers
1. Login with email: driver@college.edu and your password
2. Enter your name and phone number
3. Click "Start Sharing Location" to begin sharing your location
4. Click "Stop Sharing Location" when done

### For Students
1. Login with your Google account
2. View the bus location on the map
3. See driver details and last update time

## 🔒 Security Notes

- The driver account should be pre-created with a secure password
- Google Maps API key should be restricted to your domain
- Firebase Security Rules should be configured to restrict access

## 📝 License

MIT 