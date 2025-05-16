import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAlG7GmGiHVG_J0KyjR35PTxYH-mKQ0yo0",
  authDomain: "bitbus-77c95.firebaseapp.com",
  databaseURL: "https://bitbus-77c95-default-rtdb.firebaseio.com",
  projectId: "bitbus-77c95",
  storageBucket: "bitbus-77c95.firebasestorage.app",
  messagingSenderId: "17457960794",
  appId: "1:17457960794:web:41d665b10d976187014563",
  measurementId: "G-PDQ71P8X06"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create driver account
createUserWithEmailAndPassword(auth, 'driver@college.edu', 'driver123')
  .then((userCredential) => {
    console.log('Driver account created successfully:', userCredential.user.uid);
  })
  .catch((error) => {
    console.error('Error creating driver account:', error.message);
  }); 