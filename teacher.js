import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const $ = id => document.getElementById(id);
const config = window.UNIT1_FIREBASE_CONFIG;
const teacherUid = window.UNIT1_TEACHER_UID;
const configured = config && ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => config[key] && !config[key].includes('REPLACE_WITH'));
let auth;
let db;
let attempts = [];
let lastDocument = null;
let canLoadMore = false;
let loading = false;

function showStatus(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}

function render() {
  const classFilter = $('filter-class').value.trim().toLowerCase();
  const studentFilter = $('filter-number').value.trim().toLowerCase();
  const visible = attempts.filter(attempt =>
    attempt.classCode.toLowerCase().includes(classFilter) && attempt.studentNumber.toLowerCase().includes(studentFilter));
  $('rows').replaceChildren();
  for (const attempt of visible) {
    const tr = document.createElement('tr');
    const date = attempt.createdAt?.toDate ? attempt.createdAt.toDate() : null;
    for (const value of [date ? date.toLocaleString() : '—', attempt.classCode, attempt.studentNumber, `${attempt.score}/${attempt.total}`]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    tr.lastElementChild.className = 'score';
    $('rows').append(tr);
  }
  $('summary').textContent = `${visible.length} shown · ${attempts.length} loaded${canLoadMore ? ' · more available' : ''}`;
  $('more').hidden = !canLoadMore;
}

async function loadAttempts(reset = false) {
  if (loading || !db) return;
  loading = true;
  $('refresh').disabled = true;
  $('more').disabled = true;
  showStatus('Loading attempts…');
  try {
    if (reset) { attempts = []; lastDocument = null; canLoadMore = false; }
    const base = [collection(db, 'unit1Attempts'), orderBy('createdAt', 'desc'), limit(100)];
    if (lastDocument) base.push(startAfter(lastDocument));
    const snapshot = await getDocs(query(...base));
    for (const document of snapshot.docs) {
      const data = document.data();
      if (data.exerciseId === 'unit1-part-b-11-24') attempts.push(data);
    }
    lastDocument = snapshot.docs.at(-1) || lastDocument;
    canLoadMore = snapshot.docs.length === 100;
    render();
    showStatus('Scores are private to this teacher account.');
  } catch (error) {
    showStatus('Could not load scores. Check the teacher UID and Firestore rules.', true);
    console.error('Score load failed:', error.code || error.message);
  } finally {
    loading = false;
    $('refresh').disabled = false;
    $('more').disabled = false;
  }
}

$('filter-class').addEventListener('input', render);
$('filter-number').addEventListener('input', render);
$('refresh').addEventListener('click', () => loadAttempts(true));
$('more').addEventListener('click', () => loadAttempts(false));

if (!configured) {
  $('sign-in').disabled = true;
  showStatus('Firebase web app configuration is not set up yet.', true);
} else {
  try {
    const app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    $('sign-in').addEventListener('click', async () => {
      try { await signInWithPopup(auth, new GoogleAuthProvider()); }
      catch (error) { showStatus('Google sign-in failed. Check the allowed domain in Firebase Authentication.', true); console.error(error.code || error.message); }
    });
    $('sign-out').addEventListener('click', () => signOut(auth));
    onAuthStateChanged(auth, user => {
      const signedIn = !!user && !user.isAnonymous;
      $('sign-in').hidden = signedIn;
      $('sign-out').hidden = !signedIn;
      $('results').hidden = true;
      $('uid-help').hidden = !signedIn;
      if (!signedIn) { showStatus('Sign in with the teacher’s Google account to see scores.'); return; }
      $('teacher-uid').textContent = user.uid;
      if (!teacherUid || teacherUid.includes('REPLACE_WITH')) {
        showStatus('Signed in. Finish the teacher UID setup to unlock the score panel.');
      } else if (user.uid !== teacherUid) {
        showStatus('This Google account is not authorized as the teacher.', true);
      } else {
        $('uid-help').hidden = true;
        $('results').hidden = false;
        loadAttempts(true);
      }
    }, error => showStatus('Authentication failed: ' + error.message, true));
  } catch (error) {
    showStatus('Could not connect to Firebase. Check firebase-config.js.', true);
    console.error(error);
  }
}
