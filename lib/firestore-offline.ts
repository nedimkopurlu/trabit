import { enableIndexedDbPersistence } from "firebase/firestore";
import { db } from "./firebase";

let enabled = false;

export async function enableFirestoreOffline(): Promise<void> {
  if (enabled || typeof window === "undefined") return;
  enabled = true;
  try {
    await enableIndexedDbPersistence(db);
  } catch (err: any) {
    if (err.code === "failed-precondition")
      console.warn("Firestore offline: multiple tabs open");
    else if (err.code === "unimplemented")
      console.warn("Firestore offline: browser unsupported");
    else throw err;
  }
}
