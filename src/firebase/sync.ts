import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';

export function watchAuth(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  signInAnonymously(auth).catch((e) => console.warn('Connexion Firebase anonyme échouée', e));
  return onAuthStateChanged(auth, callback);
}

export async function pullRemoteData(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export function watchRemoteData(uid: string, callback: (data: any) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function pushRemoteData(uid: string, data: any) {
  await setDoc(doc(db, 'users', uid), data, { merge: false });
}
