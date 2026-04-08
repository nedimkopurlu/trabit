"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "./firebase";
import { getUserDoc, createUserDoc, updateIdentitySentence } from "./user-doc";

export interface AuthState {
  user: User | null;
  loading: boolean;
  identitySentence: string | null;
  hasOnboarded: boolean;
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setIdentitySentence: (s: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isIOSOrPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [identitySentence, setIdentitySentenceState] = useState<string | null>(
    null
  );
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    // Complete iOS redirect sign-in if pending (D-01)
    getRedirectResult(auth).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getUserDoc(firebaseUser.uid);
        if (userDoc && userDoc.identitySentence) {
          setIdentitySentenceState(userDoc.identitySentence);
          setHasOnboarded(true);
        } else {
          setIdentitySentenceState(null);
          setHasOnboarded(false);
        }
      } else {
        setUser(null);
        setIdentitySentenceState(null);
        setHasOnboarded(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (isIOSOrPWA()) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/login");
  };

  const setIdentitySentence = async (s: string) => {
    if (!user) return;
    if (!hasOnboarded) {
      await createUserDoc(user.uid, s);
    } else {
      await updateIdentitySentence(user.uid, s);
    }
    setIdentitySentenceState(s);
    setHasOnboarded(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        identitySentence,
        hasOnboarded,
        signInWithGoogle,
        signOut,
        setIdentitySentence,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
