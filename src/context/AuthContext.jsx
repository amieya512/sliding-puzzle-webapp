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
} from "firebase/auth";
import { ref, get, set, child } from "firebase/database";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

setPersistence(auth, browserLocalPersistence);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser ?? null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email, password) =>
    await createUserWithEmailAndPassword(auth, email, password);

  const signIn = async (email, password) =>
    await signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;

    // Create Realtime DB node only if missing
    const userRef = child(ref(db), "users/" + user.uid);
    const snap = await get(userRef);
    if (!snap.exists()) {
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        username: null,
        createdAt: Date.now(),
      });
    }
    return user;
  };

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
      signOutUser,
      resetPassword,
      signInWithGoogle,
      startGuest,
    }),
    [user, guest, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
