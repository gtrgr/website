// IMPORTS
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ------------------------------
// SIGNUP LOGIC
// ------------------------------
const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const childEmail = document.getElementById("parent-child-email")?.value.trim();

    if (!firstName || !lastName || !role || !email || !password) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Build user profile object
      const userData = {
        firstName,
        lastName,
        email,
        role
      };

      // If parent, link to child
      if (role === "parent") {
        if (!childEmail) {
          alert("Parents must enter their child's email.");
          return;
        }

        // Find child by email
        const playersRef = collection(db, "users");
        const q = query(playersRef, where("email", "==", childEmail), where("role", "==", "player"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("No player found with that email.");
          return;
        }

        const childDoc = querySnapshot.docs[0];
        userData.childId = childDoc.id;
      }

      // Save user profile to Firestore
      await setDoc(doc(db, "users", uid), userData);

      // Redirect based on role
      if (role === "player") window.location.href = "player-tracker.html";
      if (role === "coach") window.location.href = "got-you.html";
      if (role === "parent") window.location.href = "parent-view.html";

    } catch (error) {
      alert(error.message);
    }
  });
}



// ------------------------------
// LOGIN LOGIC
// ------------------------------
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Get user profile
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        alert("User profile not found.");
        return;
      }

      const data = userDoc.data();

      // Redirect based on role
      if (data.role === "player") window.location.href = "player-tracker.html";
      if (data.role === "coach") window.location.href = "got-you.html";
      if (data.role === "parent") window.location.href = "parent-view.html";

    } catch (error) {
      alert(error.message);
    }
  });
}
