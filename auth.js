// // ============================================
// // AUTHENTICATION & USER MANAGEMENT SYSTEM
// // ============================================

// class AuthSystem {
//   constructor() {
//     this.currentUser = null;
//     this.init();
//   }

//   // Initialize auth system
//   init() {
//     // Check if user is already logged in
//     const session = localStorage.getItem('splitpay_session');
//     if (session) {
//       try {
//         const sessionData = JSON.parse(session);
//         // Check if session is still valid (24 hours)
//         if (Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000) {
//           this.currentUser = sessionData.user;
//           return true;
//         } else {
//           this.logout();
//         }
//       } catch (e) {
//         console.error('Invalid session data');
//         this.logout();
//       }
//     }
//     return false;
//   }

//   // Register new user
//   register(username, email, password) {
//     // Get existing users
//     const users = this.getAllUsers();
    
//     // Check if user already exists
//     if (users.find(u => u.username === username || u.email === email)) {
//       throw new Error('User already exists');
//     }

//     // Create new user
//     const newUser = {
//       id: this.generateUserId(),
//       username,
//       email,
//       password: this.hashPassword(password), // In production, use proper hashing
//       createdAt: Date.now(),
//       profile: {
//         avatar: username.charAt(0).toUpperCase(),
//         name: username
//       }
//     };

//     // Save user
//     users.push(newUser);
//     localStorage.setItem('splitpay_users', JSON.stringify(users));

//     // Auto login after registration
//     return this.login(username, password);
//   }

//   // Login user
//   login(username, password) {
//     const users = this.getAllUsers();
//     const hashedPassword = this.hashPassword(password);
    
//     const user = users.find(u => 
//       (u.username === username || u.email === username) && 
//       u.password === hashedPassword
//     );

//     if (!user) {
//       throw new Error('Invalid username or password');
//     }

//     // Create session
//     this.currentUser = {
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       profile: user.profile
//     };

//     // Save session
//     const session = {
//       user: this.currentUser,
//       timestamp: Date.now()
//     };
//     localStorage.setItem('splitpay_session', JSON.stringify(session));

//     return this.currentUser;
//   }

//   // Logout user
//   logout() {
//     this.currentUser = null;
//     localStorage.removeItem('splitpay_session');
//   }

//   // Check if user is logged in
//   isLoggedIn() {
//     return this.currentUser !== null;
//   }

//   // Get current user
//   getCurrentUser() {
//     return this.currentUser;
//   }

//   // Get all users (admin only)
//   getAllUsers() {
//     const users = localStorage.getItem('splitpay_users');
//     return users ? JSON.parse(users) : [];
//   }

//   // Simple hash function (use bcrypt in production)
//   hashPassword(password) {
//     let hash = 0;
//     for (let i = 0; i < password.length; i++) {
//       const char = password.charCodeAt(i);
//       hash = ((hash << 5) - hash) + char;
//       hash = hash & hash;
//     }
//     return hash.toString();
//   }

//   // Generate unique user ID
//   generateUserId() {
//     return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//   }
// }

// // ============================================
// // USER DATA MANAGEMENT
// // ============================================

// class UserDataManager {
//   constructor(authSystem) {
//     this.auth = authSystem;
//   }

//   // Get user-specific key
//   getUserKey(key) {
//     const user = this.auth.getCurrentUser();
//     if (!user) throw new Error('No user logged in');
//     return `splitpay_${user.id}_${key}`;
//   }

//   // Save user data
//   saveData(key, data) {
//     const userKey = this.getUserKey(key);
//     localStorage.setItem(userKey, JSON.stringify(data));
//   }

//   // Get user data
//   getData(key) {
//     const userKey = this.getUserKey(key);
//     const data = localStorage.getItem(userKey);
//     return data ? JSON.parse(data) : null;
//   }

//   // Delete user data
//   deleteData(key) {
//     const userKey = this.getUserKey(key);
//     localStorage.removeItem(userKey);
//   }

//   // ============================================
//   // TRANSACTION MANAGEMENT
//   // ============================================

//   // Save transaction
//   saveTransaction(transaction) {
//     const transactions = this.getTransactions();
//     transaction.id = transaction.id || this.generateId('trans');
//     transaction.userId = this.auth.getCurrentUser().id;
//     transaction.createdAt = transaction.createdAt || Date.now();
    
//     transactions.push(transaction);
//     this.saveData('transactions', transactions);
//     return transaction;
//   }

//   // Get all transactions
//   getTransactions() {
//     return this.getData('transactions') || [];
//   }

//   // Get transaction by ID
//   getTransaction(id) {
//     const transactions = this.getTransactions();
//     return transactions.find(t => t.id === id);
//   }

//   // Update transaction
//   updateTransaction(id, updates) {
//     const transactions = this.getTransactions();
//     const index = transactions.findIndex(t => t.id === id);
    
//     if (index === -1) throw new Error('Transaction not found');
    
//     transactions[index] = { ...transactions[index], ...updates, updatedAt: Date.now() };
//     this.saveData('transactions', transactions);
//     return transactions[index];
//   }

//   // Delete transaction
//   deleteTransaction(id) {
//     let transactions = this.getTransactions();
//     transactions = transactions.filter(t => t.id !== id);
//     this.saveData('transactions', transactions);
//   }

//   // ============================================
//   // GROUP MANAGEMENT
//   // ============================================

//   // Save group
//   saveGroup(group) {
//     const groups = this.getGroups();
//     group.id = group.id || this.generateId('group');
//     group.userId = this.auth.getCurrentUser().id;
//     group.createdAt = group.createdAt || Date.now();
    
//     groups.push(group);
//     this.saveData('groups', groups);
//     return group;
//   }

//   // Get all groups
//   getGroups() {
//     return this.getData('groups') || [];
//   }

//   // Get group by ID
//   getGroup(id) {
//     const groups = this.getGroups();
//     return groups.find(g => g.id === id);
//   }

//   // Update group
//   updateGroup(id, updates) {
//     const groups = this.getGroups();
//     const index = groups.findIndex(g => g.id === id);
    
//     if (index === -1) throw new Error('Group not found');
    
//     groups[index] = { ...groups[index], ...updates, updatedAt: Date.now() };
//     this.saveData('groups', groups);
//     return groups[index];
//   }

//   // Delete group
//   deleteGroup(id) {
//     let groups = this.getGroups();
//     groups = groups.filter(g => g.id !== id);
//     this.saveData('groups', groups);
//   }

//   // ============================================
//   // FRIENDS MANAGEMENT
//   // ============================================

//   // Save friend
//   saveFriend(friend) {
//     const friends = this.getFriends();
//     friend.id = friend.id || this.generateId('friend');
//     friend.userId = this.auth.getCurrentUser().id;
//     friend.createdAt = friend.createdAt || Date.now();
    
//     friends.push(friend);
//     this.saveData('friends', friends);
//     return friend;
//   }

//   // Get all friends
//   getFriends() {
//     return this.getData('friends') || [];
//   }

//   // Delete friend
//   deleteFriend(id) {
//     let friends = this.getFriends();
//     friends = friends.filter(f => f.id !== id);
//     this.saveData('friends', friends);
//   }

//   // ============================================
//   // SETTINGS MANAGEMENT
//   // ============================================

//   // Save settings
//   saveSettings(settings) {
//     this.saveData('settings', settings);
//   }

//   // Get settings
//   getSettings() {
//     return this.getData('settings') || {
//       currency: 'INR',
//       language: 'en',
//       defaultTip: 10,
//       notifications: {
//         email: true,
//         reminders: true,
//         payments: true
//       }
//     };
//   }

//   // ============================================
//   // UTILITY FUNCTIONS
//   // ============================================

//   // Generate unique ID
//   generateId(prefix) {
//     return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   // Clear all user data
//   clearAllData() {
//     const user = this.auth.getCurrentUser();
//     if (!user) return;

//     const keys = ['transactions', 'groups', 'friends', 'settings'];
//     keys.forEach(key => this.deleteData(key));
//   }

//   // Export all user data
//   exportData() {
//     return {
//       transactions: this.getTransactions(),
//       groups: this.getGroups(),
//       friends: this.getFriends(),
//       settings: this.getSettings()
//     };
//   }

//   // Import user data
//   importData(data) {
//     if (data.transactions) this.saveData('transactions', data.transactions);
//     if (data.groups) this.saveData('groups', data.groups);
//     if (data.friends) this.saveData('friends', data.friends);
//     if (data.settings) this.saveData('settings', data.settings);
//   }
// }

// // ============================================
// // INITIALIZE GLOBAL INSTANCES
// // ============================================

// // Create global instances
// const authSystem = new AuthSystem();
// const userDataManager = new UserDataManager(authSystem);

// // Export for use in other files
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = { AuthSystem, UserDataManager, authSystem, userDataManager };
// }

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "XXXX",
//   appId: "XXXX"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// console.log("Firebase connected successfully!");

// import { initializeApp } from "firebase/app";
// import {
//   getAuth,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   sendPasswordResetEmail,
//   onAuthStateChanged
// } from "firebase/auth";

// // 🔥 Replace with your REAL Firebase config
// // const firebaseConfig = {
// //   apiKey: "YOUR_API_KEY",
// //   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
// //   projectId: "YOUR_PROJECT_ID",
// //   storageBucket: "YOUR_PROJECT_ID.appspot.com",
// //   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
// //   appId: "YOUR_APP_ID"
// // };

// const firebaseConfig = {
//   apiKey: "AIzaSyDT6RQVTRCnFGQu2I6CUx7LAXYvnwrib28",
//   authDomain: "splitpay-96240.firebaseapp.com",
//   projectId: "splitpay-96240",
//   storageBucket: "splitpay-96240.firebasestorage.app",
//   messagingSenderId: "960303140957",
//   appId: "1:960303140957:web:aeec8cac7460823a7abdb4",
//   measurementId: "G-6744Z73JMF"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// const googleProvider = new GoogleAuthProvider();
// const facebookProvider = new FacebookAuthProvider();

// // DOM
// const loginForm = document.getElementById("loginForm");
// const emailInput = document.getElementById("email");
// const passwordInput = document.getElementById("password");
// const loginBtn = document.getElementById("loginBtn");
// const googleBtn = document.getElementById("googleBtn");
// const facebookBtn = document.getElementById("facebookBtn");
// const forgotPasswordLink = document.getElementById("forgotPasswordLink");

// // 🔁 Already logged in
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     window.location.href = "dashboard.html";
//   }
// });

// // 📧 Email Login
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const email = emailInput.value;
//   const password = passwordInput.value;

//   try {
//     await signInWithEmailAndPassword(auth, email, password);
//     alert("Login successful!");
//     window.location.href = "dashboard.html";
//   } catch (error) {
//     alert(error.message);
//   }
// });

// // 🔵 Google Login
// googleBtn.addEventListener("click", async () => {
//   try {
//     await signInWithPopup(auth, googleProvider);
//     window.location.href = "dashboard.html";
//   } catch (error) {
//     alert(error.message);
//   }
// });

// // 🔵 Facebook Login
// facebookBtn.addEventListener("click", async () => {
//   try {
//     await signInWithPopup(auth, facebookProvider);
//     window.location.href = "dashboard.html";
//   } catch (error) {
//     alert(error.message);
//   }
// });

// // 🔐 Forgot Password
// forgotPasswordLink.addEventListener("click", async (e) => {
//   e.preventDefault();

//   const email = emailInput.value;

//   if (!email) {
//     alert("Enter your email first");
//     return;
//   }

//   try {
//     await sendPasswordResetEmail(auth, email);
//     alert("Password reset email sent!");
//   } catch (error) {
//     alert(error.message);
//   }
// });

// import {
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   sendPasswordResetEmail,
//   onAuthStateChanged
// } from "firebase/auth";

// import { auth } from "./firebase.js";

// const googleProvider = new GoogleAuthProvider();
// const facebookProvider = new FacebookAuthProvider();

// // DOM
// const loginForm = document.getElementById("loginForm");
// const emailInput = document.getElementById("email");
// const passwordInput = document.getElementById("password");
// const googleBtn = document.getElementById("googleBtn");
// const facebookBtn = document.getElementById("facebookBtn");
// const forgotPasswordLink = document.getElementById("forgotPasswordLink");

// // 🔁 Already logged in
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     window.location.href = "dashboard.html";
//   }
// });

// // 📧 Email Login
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   try {
//     await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
//     window.location.href = "dashboard.html";
//   } catch (error) {
//     alert(error.message);
//   }
// });

// // 🔵 Google Login
// googleBtn.addEventListener("click", async () => {
//   try {
//     await signInWithPopup(auth, googleProvider);
//     window.location.href = "dashboard.html";
//   } catch (error) {
//     alert(error.message);
//   }
// });

// // 🔵 Facebook Login
// facebookBtn.addEventListener("click", async () => {
//   try {
//     await signInWithPopup(auth, facebookProvider);
//     window.location.href = "dashboard.html";
//   } catch (error) {
//     alert(error.message);
//   }
// });

// // 🔐 Forgot Password
// forgotPasswordLink.addEventListener("click", async (e) => {
//   e.preventDefault();

//   if (!emailInput.value) {
//     alert("Enter your email first");
//     return;
//   }

//   try {
//     await sendPasswordResetEmail(auth, emailInput.value);
//     alert("Password reset email sent!");
//   } catch (error) {
//     alert(error.message);
//   }
// });

// import {
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   sendPasswordResetEmail,
//   onAuthStateChanged
// } from "firebase/auth";

// import {
//   doc,
//   setDoc,
//   getDoc,
//   serverTimestamp
// } from "firebase/firestore";

// import { auth, db } from "./firebase.js";

// // Providers
// const googleProvider = new GoogleAuthProvider();
// const facebookProvider = new FacebookAuthProvider();

// // DOM Elements
// const loginForm = document.getElementById("loginForm");
// const emailInput = document.getElementById("email");
// const passwordInput = document.getElementById("password");
// const googleBtn = document.getElementById("googleBtn");
// const facebookBtn = document.getElementById("facebookBtn");
// const forgotPasswordLink = document.getElementById("forgotPasswordLink");


// // 🔥 SAVE USER TO FIRESTORE
// async function saveUserToFirestore(user) {
//   const userRef = doc(db, "users", user.uid);
//   const userSnap = await getDoc(userRef);

//   if (!userSnap.exists()) {
//     await setDoc(userRef, {
//       uid: user.uid,
//       name: user.displayName || "No Name",
//       email: user.email,
//       provider: user.providerData[0].providerId,
//       createdAt: serverTimestamp()
//     });

//     console.log("✅ User saved to Firestore");
//   } else {
//     console.log("ℹ️ User already exists");
//   }
// }


// // 🔁 Redirect if already logged in
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     window.location.href = "dashboard.html";
//   }
// });


// // 📧 Email Login
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       emailInput.value,
//       passwordInput.value
//     );

//     await saveUserToFirestore(userCredential.user);

//     window.location.href = "dashboard.html";

//   } catch (error) {
//     alert(error.message);
//   }
// });


// // 🔵 Google Login
// googleBtn.addEventListener("click", async () => {
//   try {
//     const result = await signInWithPopup(auth, googleProvider);

//     await saveUserToFirestore(result.user);

//     window.location.href = "dashboard.html";

//   } catch (error) {
//     alert(error.message);
//   }
// });


// // 🔵 Facebook Login
// facebookBtn.addEventListener("click", async () => {
//   try {
//     const result = await signInWithPopup(auth, facebookProvider);

//     await saveUserToFirestore(result.user);

//     window.location.href = "dashboard.html";

//   } catch (error) {
//     alert(error.message);
//   }
// });


// // 🔐 Forgot Password
// forgotPasswordLink.addEventListener("click", async (e) => {
//   e.preventDefault();

//   if (!emailInput.value) {
//     alert("Enter your email first");
//     return;
//   }

//   try {
//     await sendPasswordResetEmail(auth, emailInput.value);
//     alert("Password reset email sent!");
//   } catch (error) {
//     alert(error.message);
//   }
// });

// ══════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════

const API_BASE_URL = 'http://127.0.0.1:5000';

// ══════════════════════════════════════════
//  DOM ELEMENTS
// ══════════════════════════════════════════

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleBtn');
const facebookBtn = document.getElementById('facebookBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// ══════════════════════════════════════════
//  CHECK IF ALREADY LOGGED IN
// ══════════════════════════════════════════

// window.addEventListener('DOMContentLoaded', () => {
//     const token = localStorage.getItem('splitpay_token');
    
//     if (token) {
//         // Verify token is still valid
//         verifyToken(token);
//     }
// });

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Token is valid, redirect to dashboard
            showSuccess('Already logged in! Redirecting...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Token is invalid, clear it
            localStorage.removeItem('splitpay_token');
            localStorage.removeItem('splitpay_user');
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('splitpay_token');
        localStorage.removeItem('splitpay_user');
    }
}

// ══════════════════════════════════════════
//  EMAIL/PASSWORD LOGIN
// ══════════════════════════════════════════

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    // Basic email validation
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    try {
        setLoading(true);
        hideMessages();

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save token and user data
            localStorage.setItem('splitpay_token', data.token);
            localStorage.setItem('splitpay_user', JSON.stringify(data.user));

            showSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showError(data.error || 'Login failed. Please try again.');
        }

    } catch (error) {
        console.error('Login error:', error);
        showError('Cannot connect to server. Please check your connection.');
    } finally {
        setLoading(false);
    }
});

// ══════════════════════════════════════════
//  SOCIAL LOGIN (DISABLED - NOT IMPLEMENTED)
// ══════════════════════════════════════════

googleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showError('Google login is not available yet. Please use email/password.');
});

facebookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showError('Facebook login is not available yet. Please use email/password.');
});

// ══════════════════════════════════════════
//  FORGOT PASSWORD
// ══════════════════════════════════════════

forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showError('Please enter your email address first');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    // For now, just show a message (you can implement password reset later)
    showSuccess('Password reset feature coming soon! Please contact support.');
    
    // TODO: Implement password reset endpoint in Flask backend
    // try {
    //     const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ email })
    //     });
    //     
    //     if (response.ok) {
    //         showSuccess('Password reset email sent! Check your inbox.');
    //     } else {
    //         const data = await response.json();
    //         showError(data.error || 'Failed to send reset email.');
    //     }
    // } catch (error) {
    //     showError('Cannot connect to server. Please try again.');
    // }
});

// ══════════════════════════════════════════
//  HELPER FUNCTIONS
// ══════════════════════════════════════════

function setLoading(loading) {
    loginBtn.disabled = loading;
    if (loading) {
        loginBtn.classList.add('loading');
        loginBtn.textContent = 'Logging in...';
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Login';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.add('show');
}

function hideMessages() {
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ══════════════════════════════════════════
//  LOGOUT FUNCTION (for use in other pages)
// ══════════════════════════════════════════

async function logout() {
    const token = localStorage.getItem('splitpay_token');
    
    if (token) {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Clear local storage
    localStorage.removeItem('splitpay_token');
    localStorage.removeItem('splitpay_user');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Make logout available globally
window.logout = logout;

