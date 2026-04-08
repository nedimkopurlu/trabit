import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserDoc {
  identitySentence: string;
  createdAt: Timestamp;
  theme: "light" | "dark";
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function createUserDoc(
  uid: string,
  identitySentence: string
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    identitySentence,
    createdAt: serverTimestamp(),
    theme: "light",
  });
}

export async function updateIdentitySentence(
  uid: string,
  sentence: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { identitySentence: sentence });
}
