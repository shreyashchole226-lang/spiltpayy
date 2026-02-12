// Import Firebase core
import { initializeApp } from "firebase/app";

// Import services you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDT6RQVTRCnFGQu2I6CUx7LAXYvnwrib28",
  authDomain: "splitpay-96240.firebaseapp.com",
  projectId: "splitpay-96240",
  storageBucket: "splitpay-96240.firebasestorage.app",
  messagingSenderId: "960303140957",
  appId: "1:960303140957:web:aeec8cac7460823a7abdb4",
  measurementId: "G-6744Z73JMF"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export so other files can use it
export { auth, db };
