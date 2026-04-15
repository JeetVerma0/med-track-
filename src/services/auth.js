import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";

import { auth, googleProvider } from "./firebase";

// LOGIN
export const login = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

// SIGNUP
export const signup = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
};

// GOOGLE LOGIN
export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (e) {
    const code = e?.code || "";
    // Popup can hang/fail in some browsers due to cookie/privacy settings.
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw e;
  }
};

export const getGoogleRedirectUser = async () => {
  const res = await getRedirectResult(auth);
  return res?.user || null;
};

export const logout = async () => {
  await signOut(auth);
};