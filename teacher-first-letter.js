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
let loading = false;
const answers = [
  'problem-solving', 'phrases', 'organisation', 'figure out',
  'switch off', 'focus on', 'compare', 'points of view'
];

function showStatus(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}

function filterAttempts() {
  const classFilter = $('filter-class').value.trim().toLowerCase();
  const studentFilter = $('filter-number').value.trim().toLowerCase();
  return attempts.filter(attempt =>
    attempt.classCode.toLowerCase().includes(classFilter) &&
    attempt.studentNumber.toLowerCase().includes(studentFilter));
}

function renderScores(visible) {
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
  $('summary').textContent = `${visible.length} shown · ${attempts.length} loaded`;
}

function renderErrorRates(visible) {
  const firstByStudent = new Map();
  // The query is newest first; walking backwards keeps each student's first attempt.
  for (let i = visible.length - 1; i >= 0; i--) {
    const attempt = visible[i];
    const key = attempt.classCode.trim().toLowerCase() + '\u0000' + attempt.studentNumber.trim().toLowerCase();
    if (!firstByStudent.has(key)) firstByStudent.set(key, attempt);
  }
  const firstAttempts = [...firstByStudent.values()];
  const usable = firstAttempts.filter(attempt => Array.isArray(attempt.correctQuestions) &&
    attempt.correctQuestions.every(number => Number.isInteger(number) && number >= 1 && number <= 8));
  const excluded = firstAttempts.length - usable.length;
  $('accuracy-summary').textContent = usable.length
    ? `${usable.length} 位學生的首次交卷${excluded ? ` · ${excluded} 位缺少逐題資料` : ''}`
    : '尚無可計算的逐題資料。';
  $('accuracy-rows').replaceChildren();
  if (!usable.length) return;

  const rates = Array.from({length: 8}, (_, index) => {
    const number = index + 1;
    const wrong = usable.filter(attempt => !attempt.correctQuestions.includes(number)).length;
    return {number, wrong, percent: Math.round(wrong * 100 / usable.length)};
  }).sort((a, b) => b.percent - a.percent || a.number - b.number);

  for (const item of rates) {
    const tr = document.createElement('tr');
    if (item.percent >= 40) tr.className = 'needs-review';
    for (const value of [String(item.number), answers[item.number - 1], `${item.wrong} / ${usable.length}`, `${item.percent}%`]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    tr.lastElementChild.className = 'rate';
    $('accuracy-rows').append(tr);
  }
}

function render() {
  const visible = filterAttempts();
  renderScores(visible);
  renderErrorRates(visible);
}

async function loadAttempts() {
  if (loading || !db) return;
  loading = true;
  $('refresh').disabled = true;
  showStatus('Loading attempts…');
  try {
    const loaded = [];
    let lastDocument = null;
    while (true) {
      const constraints = [orderBy('createdAt', 'desc'), limit(100)];
      if (lastDocument) constraints.push(startAfter(lastDocument));
      const snapshot = await getDocs(query(collection(db, 'unit1FirstLetterMidTestAttempts'), ...constraints));
      for (const document of snapshot.docs) {
        const data = document.data();
        if (data.exerciseId === 'unit1-first-letter-midtest') loaded.push(data);
      }
      if (snapshot.docs.length < 100) break;
      lastDocument = snapshot.docs.at(-1);
      showStatus(`Loading attempts… ${loaded.length}`);
    }
    attempts = loaded;
    render();
    showStatus('Scores are private to this teacher account.');
  } catch (error) {
    showStatus('Could not load scores. Check the teacher UID and Firestore rules.', true);
    console.error('Score load failed:', error.code || error.message);
  } finally {
    loading = false;
    $('refresh').disabled = false;
  }
}

$('filter-class').addEventListener('input', render);
$('filter-number').addEventListener('input', render);
$('refresh').addEventListener('click', loadAttempts);

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
      $('accuracy').hidden = true;
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
        $('accuracy').hidden = false;
        loadAttempts();
      }
    }, error => showStatus('Authentication failed: ' + error.message, true));
  } catch (error) {
    showStatus('Could not connect to Firebase. Check firebase-config.js.', true);
    console.error(error);
  }
}
