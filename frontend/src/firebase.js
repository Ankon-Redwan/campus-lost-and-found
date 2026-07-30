import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAleR20lkZ3yqFUM8w2NcfzeRVY1g7DWtc",
  authDomain: "campus-lost-found-bd1.firebaseapp.com",
  projectId: "campus-lost-found-bd1",
  storageBucket: "campus-lost-found-bd1.firebasestorage.app",
  messagingSenderId: "177473598725",
  appId: "1:177473598725:web:8d4376d74c4ef700cb336c",
  measurementId: "G-GPR7WCFERZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
