import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase configuration object goes here
  apiKey: "AIzaSyA4d6dpluA4HdtfOzUdNQCTYMJbBDz3hVA",
  authDomain: "quickdine-d8253.firebaseapp.com",
  projectId: "quickdine-d8253",
  storageBucket: "quickdine-d8253.firebasestorage.app",
  messagingSenderId: "919109940427",
  appId: "1:919109940427:web:f784504e53602e3482d74e",
  measurementId: "G-F1L132MX3H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);

const signInWithGoogle = async () => {
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // save user info to Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid,
        }, { merge: true });

        console.log("User signed in and saved to Firestore:", user);
        return user;
    } catch (e) {
        console.error("Error signing in with Google:", e);
    }
};
export { signInWithGoogle, auth, firestore, googleProvider};
// export const auth = getAuth(app);
// export const firestore = getFirestore(app);
// export const googleProvider = new GoogleAuthProvider();

