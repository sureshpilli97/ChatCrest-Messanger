import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJqwUxQ_NQvGv0tQ6Sc9L1VCi4lRJ9OEY",
  authDomain: "chatcrest-u.firebaseapp.com",
  projectId: "chatcrest-u",
  storageBucket: "chatcrest-u.firebasestorage.app",
  messagingSenderId: "517398586077",
  appId: "1:517398586077:web:6486ab8a259c1cdbbe7134",
  measurementId: "G-YZ4755K25K",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
};
