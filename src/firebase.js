// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBBgzO4LTnytbMGRbk3VZ96UlBTOwi5oHU",
  authDomain: "slide-puzzle-d0211.firebaseapp.com",
  projectId: "slide-puzzle-d0211",
  storageBucket: "slide-puzzle-d0211.appspot.com",
  messagingSenderId: "322224800649",
  appId: "1:322224800649:web:dc16199a9a5d26987cd758",
  measurementId: "G-BT5LBG79T2",
  databaseURL: "https://slide-puzzle-d0211-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export default app;
