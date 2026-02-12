// Firebase Configuration
// Replace these values with your Firebase project credentials
// Get these from Firebase Console > Project Settings > Your Apps > Web App

const firebaseConfig = {
  apiKey: "AIzaSyDT6RQVTRCnFGQu2I6CUx7LAXYvnwrib28",
  authDomain: "splitpay-96240.firebaseapp.com",
  projectId: "splitpay-96240",
  storageBucket: "splitpay-96240.firebasestorage.app",
  messagingSenderId: "960303140957",
  appId: "1:960303140957:web:aeec8cac7460823a7abdb4",
  measurementId: "G-6744Z73JMF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Configure Google Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Facebook Provider
const facebookProvider = new firebase.auth.FacebookAuthProvider();
facebookProvider.setCustomParameters({
  'display': 'popup'
});