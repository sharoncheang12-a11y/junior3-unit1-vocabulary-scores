import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const status = document.getElementById('save-status');
const retryButton = document.getElementById('retry-save');
const practice = window.UNIT2_PRACTICE;
const config = window.UNIT1_FIREBASE_CONFIG;
const configured = config && ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => config[key] && !config[key].includes('REPLACE_WITH'));
let db, auth, saving = false;
const pending = [];

function showStatus(message, error = false) {
  status.textContent = message;
  status.classList.toggle('error', error);
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
window.addEventListener('unit2-score-ready', event => {
  if (!db || !auth?.currentUser) {
    showStatus('Score tracker is unavailable. Your score was not saved.', true);
    return;
  }
  const detail = event.detail;
  if (detail.exerciseId !== practice.exerciseId || detail.collection !== practice.collection || detail.total !== practice.total) {
    showStatus('Exercise configuration error. Your score was not saved.', true);
    return;
  }
  const reference = doc(collection(db, practice.collection));
  pending.push({reference, data: {
    exerciseId: practice.exerciseId,
    classCode: detail.classCode,
    studentNumber: detail.studentNumber,
    score: detail.score,
    total: detail.total,
    correctQuestions: detail.correctQuestions,
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
