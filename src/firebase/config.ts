import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 1) Allez sur https://console.firebase.google.com -> Créer un projet (gratuit, plan Spark)
// 2) Dans "Paramètres du projet" -> "Vos applications" -> ajouter une app Web (icône </>)
// 3) Copiez les valeurs ci-dessous depuis l'objet firebaseConfig fourni par Firebase
// 4) Activez Firestore Database (mode production) et Authentication -> méthode "Anonyme"
const firebaseConfig = {
  apiKey: 'REMPLACER_API_KEY',
  authDomain: 'REMPLACER_PROJECT_ID.firebaseapp.com',
  projectId: 'REMPLACER_PROJECT_ID',
  storageBucket: 'REMPLACER_PROJECT_ID.appspot.com',
  messagingSenderId: 'REMPLACER_SENDER_ID',
  appId: 'REMPLACER_APP_ID',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'REMPLACER_API_KEY';
