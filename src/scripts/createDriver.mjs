import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

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
const database = getDatabase(app);

const email = 'driver@college.edu';
const password = 'driver123';

// First try to sign in
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log('Driver already exists:', userCredential.user.uid);
    process.exit(0);
  })
  .catch(() => {
    // If sign in fails, create new account
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Driver account created:', userCredential.user.uid);
        
        // Set initial driver data in the database
        return set(ref(database, `users/${userCredential.user.uid}`), {
          email: email,
          role: 'driver',
          createdAt: Date.now()
        });
      })
      .then(() => {
        console.log('Driver data saved to database');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Error creating driver:', error.message);
        process.exit(1);
      });
  }); 