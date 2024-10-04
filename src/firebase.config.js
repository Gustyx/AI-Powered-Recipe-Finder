// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5fPv8G68fzCk8E8uKDqaP0N9UuWavxHM",
  authDomain: "ai-powered-recipes.firebaseapp.com",
  projectId: "ai-powered-recipes",
  storageBucket: "ai-powered-recipes.appspot.com",
  messagingSenderId: "952294244244",
  appId: "1:952294244244:web:5ec03eb0a4097640dfd981",
  measurementId: "G-VKM4HRHHKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db }