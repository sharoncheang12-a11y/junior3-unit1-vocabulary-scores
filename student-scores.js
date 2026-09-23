import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const status = document.getElementById('save-status');
const retryButton = document.getElementById('retry-save');
const config = window.UNIT1_FIREBASE_CONFIG;
const configured = config && ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => config[key] && !config[key].includes('REPLACE_WITH'));
let db;
let auth;
let saving = false;
const pending = [];

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

async function savePending() {
  if (saving || !pending.length || !db) return;
  saving = true;
  retryButton.hidden = true;
  while (pending.length) {
    showStatus(`Saving ${pending.length} attempt${pending.length === 1 ? '' : 's'}…`);
    try {
      await setDoc(pending[0].reference, pending[0].data);
      pending.shift();
    } catch (error) {
      showStatus('Score was not saved. Check your connection and tap Retry score submission.', true);
      retryButton.hidden = false;
      console.error('Score submission failed:', error.code || error.message);
      break;
    }
  }
  if (!pending.length) showStatus('Score saved for your teacher.');
  saving = false;
}

retryButton.addEventListener('click', savePending);
window.addEventListener('unit1-score-ready', event => {
  if (!db || !auth?.currentUser) {
    showStatus('Score tracker is unavailable. Your score was not saved.', true);
    return;
  }
  const detail = event.detail;
  const reference = doc(collection(db, 'unit1Attempts'));
  pending.push({ reference, data: {
    exerciseId: 'unit1-part-b-11-24',
    classCode: detail.classCode,
    studentNumber: detail.studentNumber,
    score: detail.score,
    total: 14,
    studentUid: auth.currentUser.uid,
    createdAt: Timestamp.now()
  }});
  savePending();
});

if (!configured) {
  showStatus('Score tracker has not been configured by the teacher yet.', true);
} else {
  try {
    const app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    const existingUser = await new Promise(resolve => {
      const stop = onAuthStateChanged(auth, user => { stop(); resolve(user); }, () => resolve(null));
    });
    if (!existingUser) await signInAnonymously(auth);
    window.scoreTrackingAvailable = true;
    window.refreshCheckAvailability();
    showStatus('Score tracker connected. Your result will be saved when you check answers.');
  } catch (error) {
    showStatus('Could not connect to the score tracker. Please ask your teacher.', true);
    console.error('Firebase connection failed:', error.code || error.message);
  }
}
