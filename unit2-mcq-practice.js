'use strict';
const practice = window.UNIT2_PRACTICE;
const items = practice.items;
const itemByNumber = new Map(items.map(item => [item.number, item]));
const $ = id => document.getElementById(id);
const shuffled = values => { const copy = [...values]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
window.scoreTrackingAvailable = false;
let order = [], responses = {}, locked = new Set(), checked = false;

function updateProgress() {
  const answered = Object.keys(responses).length;
  const identified = $('class-code').value.trim() && $('student-number').value.trim();
  $('progress').textContent = `${answered} / ${items.length} answered`;
  $('check').disabled = checked || answered !== items.length || !identified || !window.scoreTrackingAvailable;
  $('remaining').textContent = checked ? '' : answered < items.length ? `${items.length - answered} left` : !identified ? 'Enter class and student number' : window.scoreTrackingAvailable ? 'Ready to check!' : 'Connecting to score tracker…';
}
window.refreshCheckAvailability = updateProgress;
$('class-code').addEventListener('input', updateProgress);
$('student-number').addEventListener('input', updateProgress);

function render() {
  const container = $('cards'); container.replaceChildren();
  for (const number of order) {
    const item = itemByNumber.get(number);
    const assessed = checked || locked.has(number);
    const card = document.createElement('article'); card.className = 'card mcq-card';
    const label = document.createElement('span'); label.className = 'card-number'; label.textContent = 'QUESTION ' + number;
    const sentence = document.createElement('p'); sentence.className = 'sentence';
    const [before, after] = item.sentence.split('{{}}');
    const blank = document.createElement('strong'); blank.textContent = '________';
    sentence.append(document.createTextNode(before), blank, document.createTextNode(after));
    const options = document.createElement('div'); options.className = 'options';
    for (const [letter, word] of Object.entries(item.options)) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'option' + (responses[number] === letter ? ' selected' : '');
      if (assessed && responses[number] === letter) button.classList.add(letter === item.answer ? 'correct' : 'incorrect');
      button.textContent = `${letter}. ${word}`;
      button.setAttribute('aria-pressed', responses[number] === letter ? 'true' : 'false');
      button.disabled = assessed;
      button.addEventListener('click', () => {
        if (checked || locked.has(number)) return;
        responses[number] = letter;
        render();
      });
      options.append(button);
    }
    card.append(label, sentence, options); container.append(card);
  }
  $('retry').hidden = !checked;
  updateProgress();
}
function restart() {
  order = shuffled(items.map(item => item.number));
  responses = {}; locked = new Set(); checked = false;
  $('result').hidden = true; render(); window.scrollTo(0, 0);
}
$('check').addEventListener('click', () => {
  if ($('check').disabled || checked) return;
  checked = true;
  const correctQuestions = items.filter(item => responses[item.number] === item.answer).map(item => item.number);
  const score = correctQuestions.length;
  render();
  const headline = document.createElement('strong'); headline.textContent = `Score ${score}/${items.length}`;
  const message = document.createElement('p');
  message.textContent = score === items.length ? 'Excellent! All answers are correct. Tap Restart for a new order.' : 'Tap Try Again to redo the incorrect questions. Correct answers stay in place.';
  $('result').replaceChildren(headline, message); $('result').hidden = false;
  $('result').focus(); $('result').scrollIntoView({block: 'nearest'});
  window.dispatchEvent(new CustomEvent('unit2-score-ready', { detail: {
    exerciseId: practice.exerciseId, collection: practice.collection,
    classCode: $('class-code').value.trim(), studentNumber: $('student-number').value.trim(),
    score, total: items.length, correctQuestions
  }}));
});
$('retry').addEventListener('click', () => {
  if (!checked) return;
  if (items.every(item => responses[item.number] === item.answer)) { restart(); return; }
  for (const item of items) {
    if (responses[item.number] === item.answer) locked.add(item.number);
    else delete responses[item.number];
  }
  checked = false; $('result').hidden = true; render();
  const first = $('cards').querySelector('.option:not(:disabled)');
  if (first) { first.focus(); first.scrollIntoView({block:'center'}); }
});
$('restart').addEventListener('click', restart);
restart();
