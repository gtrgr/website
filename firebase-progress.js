import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// --------------------------------------------------
// AUTH CHECK + ROLE REDIRECT
// --------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const role = data.role;

  const page = window.location.pathname;

  // Redirect rules
  if (page.includes("player-tracker") && role !== "player") {
    window.location.href = "login.html";
  }
  if (page.includes("coach-dashboard") && role !== "coach") {
    window.location.href = "login.html";
  }
  if (page.includes("parent-view") && role !== "parent") {
    window.location.href = "login.html";
  }

  // Load correct data
  if (role === "player" && page.includes("player-tracker")) {
    loadPlayerProgress(uid);
  }

  if (role === "coach" && page.includes("coach-dashboard")) {
    loadAllPlayers();
  }

  if (role === "parent" && page.includes("parent-view")) {
    loadParentView(data.childId);
  }
});


// --------------------------------------------------
// PLAYER: LOAD PROGRESS
// --------------------------------------------------
async function loadPlayerProgress(uid) {
  const progressRef = doc(db, "progress", uid);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) return;

  const data = progressSnap.data();

  document.getElementById("drill1").checked = data.drill1 || false;
  document.getElementById("drill2").checked = data.drill2 || false;
  document.getElementById("drill3").checked = data.drill3 || false;
  document.getElementById("drill4").checked = data.drill4 || false;
}


// --------------------------------------------------
// PLAYER: SAVE PROGRESS
// --------------------------------------------------
const saveBtn = document.getElementById("saveProgressBtn");

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;

    const progressData = {
      drill1: document.getElementById("drill1").checked,
      drill2: document.getElementById("drill2").checked,
      drill3: document.getElementById("drill3").checked,
      drill4: document.getElementById("drill4").checked
    };

    await setDoc(doc(db, "progress", uid), progressData);

    alert("Progress saved!");
  });
}


// --------------------------------------------------
// COACH: LOAD ALL PLAYERS
// --------------------------------------------------
async function loadAllPlayers() {
  const playersList = document.getElementById("playersList");
  playersList.innerHTML = "Loading players...";

  const q = query(collection(db, "users"), where("role", "==", "player"));
  const playersSnap = await getDocs(q);

  playersList.innerHTML = "";

  playersSnap.forEach(async (playerDoc) => {
    const player = playerDoc.data();
    const playerId = playerDoc.id;

    // Load progress
    const progressSnap = await getDoc(doc(db, "progress", playerId));
    const progress = progressSnap.exists() ? progressSnap.data() : {};

    // Create card
    const card = document.createElement("div");
    card.classList.add("player-card");

    card.innerHTML = `
      <h3>${player.firstName} ${player.lastName}</h3>
      <p><strong>Progress:</strong></p>
      <ul>
        <li>Cone Dribbling: ${progress.drill1 ? "✔" : "✘"}</li>
        <li>Gate Passing: ${progress.drill2 ? "✔" : "✘"}</li>
        <li>1v1 Attacking: ${progress.drill3 ? "✔" : "✘"}</li>
        <li>Shooting Accuracy: ${progress.drill4 ? "✔" : "✘"}</li>
      </ul>

      <textarea id="note-${playerId}" placeholder="Add coach notes..."></textarea>
      <button onclick="saveCoachNote('${playerId}')">Save Note</button>
    `;

    playersList.appendChild(card);
  });
}


// --------------------------------------------------
// COACH: SAVE NOTES
// --------------------------------------------------
window.saveCoachNote = async function (playerId) {
  const noteText = document.getElementById(`note-${playerId}`).value.trim();
  if (!noteText) {
    alert("Note cannot be empty.");
    return;
  }

  await addDoc(collection(db, "users", playerId, "notes"), {
    text: noteText,
    date: new Date().toISOString()
  });

  alert("Note saved!");
};


// --------------------------------------------------
// PARENT: LOAD CHILD PROGRESS + NOTES
// --------------------------------------------------
async function loadParentView(childId) {
  const progressList = document.getElementById("progressList");
  const notesList = document.getElementById("notesList");

  // Load progress
  const progressSnap = await getDoc(doc(db, "progress", childId));
  const progress = progressSnap.exists() ? progressSnap.data() : {};

  progressList.innerHTML = `
    <li>Cone Dribbling: ${progress.drill1 ? "✔" : "✘"}</li>
    <li>Gate Passing: ${progress.drill2 ? "✔" : "✘"}</li>
    <li>1v1 Attacking: ${progress.drill3 ? "✔" : "✘"}</li>
    <li>Shooting Accuracy: ${progress.drill4 ? "✔" : "✘"}</li>
  `;

  // Load notes
  const notesSnap = await getDocs(collection(db, "users", childId, "notes"));

  notesList.innerHTML = "";

  notesSnap.forEach((noteDoc) => {
    const note = noteDoc.data();

    const div = document.createElement("div");
    div.classList.add("note");
    div.innerHTML = `
      <strong>${new Date(note.date).toLocaleString()}</strong><br>
      ${note.text}
    `;

    notesList.appendChild(div);
  });
}
