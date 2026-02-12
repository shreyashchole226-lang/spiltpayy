import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

const userNameSpan = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// 🔐 Protect dashboard + Show user name
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    userNameSpan.textContent = user.displayName || user.email;
  }
});

// 🚪 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
