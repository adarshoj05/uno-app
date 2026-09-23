import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCcT427DwEAUhz3vZjaRJ7hiU7aH36M7fA",
  authDomain: "uno-app-9a915.firebaseapp.com",
  projectId: "uno-app-9a915",
  storageBucket: "uno-app-9a915.firebasestorage.app",
  messagingSenderId: "398650862278",
  appId: "1:398650862278:web:6ce09d497f4ab44d68c5c7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export function ensureSignedIn() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                unsubscribe();
                resolve(user);
            }
            else{
                signInAnonymously(auth).catch(reject);
            }
        });
    });
}