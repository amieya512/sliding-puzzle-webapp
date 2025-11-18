// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

setPersistence(auth, browserLocalPersistence);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ?? null);
      if (fbUser) setGuest(false); // ← ensure guest mode is off after sign-in
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signOutUser = async () => {
    setGuest(false);
    await signOut(auth);
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const startGuest = () => setGuest(true);

  const value = useMemo(
    () => ({
      user,
      guest,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOutUser,
      resetPassword,
      startGuest,
    }),
    [user, guest, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
