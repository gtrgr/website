import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGVnwdOmx1hw3hlUqTLToYVlXckYymnS0",
  authDomain: "winger-training-app.firebaseapp.com",
  projectId: "winger-training-app",
  storageBucket: "winger-training-app.appspot.com",
  messagingSenderId: "1083020465037",
  appId: "1:1083020465037:web:7c8f5ebf3fdc2afbaaa3c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
