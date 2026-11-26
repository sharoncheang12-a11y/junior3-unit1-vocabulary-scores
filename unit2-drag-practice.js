'use strict';
const practice = window.UNIT2_PRACTICE;
const items = practice.groups.flatMap(group => group.items);
const itemByNumber = new Map(items.map(item => [item.number, item]));
const groupByNumber = new Map(practice.groups.flatMap((group, index) => group.items.map(item => [item.number, index])));
const $ = id => document.getElementById(id);
const shuffled = values => { const copy = [...values]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
window.scoreTrackingAvailable = false;
let questionOrders = [], bankOrders = [], responses = {}, locked = new Set(), selectedWord = null, checked = false, drag = null, ghost = null, dragTarget = null;

function usedWords() { return new Set(Object.values(responses)); }
function updateProgress() {
  const filled = Object.keys(responses).length;
  const identified = $('class-code').value.trim() && $('student-number').value.trim();
  $('progress').textContent = `${filled} / ${items.length} filled`;
  $('check').disabled = checked || filled !== items.length || !identified || !window.scoreTrackingAvailable;
  $('remaining').textContent = checked ? '' : filled < items.length ? `${items.length - filled} left` : !identified ? 'Enter class and student number' : window.scoreTrackingAvailable ? 'Ready to check!' : 'Connecting to score tracker…';
}
window.refreshCheckAvailability = updateProgress;
$('class-code').addEventListener('input', updateProgress);
$('student-number').addEventListener('input', updateProgress);

function assign(number, wordNumber) {
  if (checked || locked.has(number) || groupByNumber.get(number) !== groupByNumber.get(wordNumber)) return;
  if (usedWords().has(wordNumber) && responses[number] !== wordNumber) return;
  responses[number] = wordNumber;
  selectedWord = null;
  render();
}
function renderBank(index) {
  const bank = $(`bank-${index}`); bank.replaceChildren();
  const used = usedWords();
  for (const number of bankOrders[index]) {
    const item = itemByNumber.get(number);
    const wrapper = document.createElement('div');
    wrapper.className = 'word' + (used.has(number) ? ' used' : '') + (selectedWord === number ? ' selected' : '');
    const pick = document.createElement('button');
    pick.type = 'button'; pick.className = 'pick'; pick.textContent = item.word;
    pick.disabled = checked || used.has(number);
    pick.setAttribute('aria-pressed', selectedWord === number ? 'true' : 'false');
    pick.addEventListener('click', () => { selectedWord = selectedWord === number ? null : number; renderBank(index); });
    const handle = document.createElement('button');
    handle.type = 'button'; handle.className = 'handle'; handle.textContent = '☰';
    handle.disabled = checked || used.has(number);
    handle.setAttribute('aria-label', 'Drag ' + item.word);
    handle.addEventListener('pointerdown', event => startDrag(event, number));
    wrapper.append(pick, handle); bank.append(wrapper);
  }
}
function makeBlank(number) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'drop'; button.dataset.number = String(number);
  const chosen = responses[number];
  button.textContent = chosen ? itemByNumber.get(chosen).word : `No. ${number} · drop here`;
  if (chosen) button.classList.add('filled');
  if (checked || locked.has(number)) button.classList.add(chosen === number ? 'correct' : 'incorrect');
  button.disabled = checked || locked.has(number);
  button.setAttribute('aria-label', 'Blank ' + number + (chosen ? ', ' + itemByNumber.get(chosen).word : ', empty'));
  button.addEventListener('click', () => {
    if (checked || locked.has(number)) return;
    if (selectedWord !== null) assign(number, selectedWord);
    else if (responses[number]) { delete responses[number]; render(); }
  });
  return button;
}
function renderCards(index) {
  const container = $(`cards-${index}`); container.replaceChildren();
  for (const number of questionOrders[index]) {
    const item = itemByNumber.get(number);
    const card = document.createElement('article'); card.className = 'card';
    const label = document.createElement('span'); label.className = 'card-number'; label.textContent = 'QUESTION ' + number;
    card.append(label);
    if (item.prompt) {
      const word = document.createElement('strong'); word.className = 'source-word'; word.textContent = item.prompt;
      const context = document.createElement('p'); context.className = 'context'; context.textContent = item.context;
      card.append(word, context, makeBlank(number));
    } else {
      const sentence = document.createElement('p'); sentence.className = 'sentence';
      const marker = `{{${number}}}`;
      const position = item.sentence.indexOf(marker);
      sentence.append(document.createTextNode(item.sentence.slice(0, position)), makeBlank(number), document.createTextNode(item.sentence.slice(position + marker.length)));
      card.append(sentence);
    }
    container.append(card);
  }
}
function render() {
  practice.groups.forEach((_, index) => { renderBank(index); renderCards(index); });
  $('retry').hidden = !checked;
  updateProgress();
}
function clearDrag() {
  drag = null;
  if (ghost) { ghost.remove(); ghost = null; }
  if (dragTarget) { dragTarget.classList.remove('target'); dragTarget = null; }
}
function startDrag(event, number) {
  if (checked || usedWords().has(number) || event.button !== 0) return;
  event.preventDefault();
  drag = { pointerId: event.pointerId, number, x: event.clientX, y: event.clientY, moved: false };
  event.currentTarget.setPointerCapture(event.pointerId);
}
function dragMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
  drag.moved = true;
  if (!ghost) { ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.textContent = itemByNumber.get(drag.number).word; document.body.append(ghost); }
  ghost.style.left = event.clientX + 'px'; ghost.style.top = event.clientY + 'px';
  if (dragTarget) dragTarget.classList.remove('target');
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.drop:not(:disabled)');
  dragTarget = target && groupByNumber.get(Number(target.dataset.number)) === groupByNumber.get(drag.number) ? target : null;
  if (dragTarget) dragTarget.classList.add('target');
  if (event.clientY > innerHeight - 75) window.scrollBy(0, 18);
  else if (event.clientY < 75) window.scrollBy(0, -18);
}
function dragEnd(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const wordNumber = drag.number, moved = drag.moved;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.drop:not(:disabled)');
  clearDrag();
  if (moved && target) assign(Number(target.dataset.number), wordNumber);
  else if (!moved) { selectedWord = selectedWord === wordNumber ? null : wordNumber; renderBank(groupByNumber.get(wordNumber)); }
}
document.addEventListener('pointermove', dragMove);
document.addEventListener('pointerup', dragEnd);
document.addEventListener('pointercancel', clearDrag);

function restart() {
  clearDrag();
  questionOrders = practice.groups.map(group => shuffled(group.items.map(item => item.number)));
  bankOrders = practice.groups.map(group => shuffled(group.items.map(item => item.number)));
  responses = {}; locked = new Set(); selectedWord = null; checked = false;
  $('result').hidden = true; render();
  practice.groups.forEach((_, index) => { $(`bank-${index}`).scrollTop = 0; });
  window.scrollTo(0, 0);
}
$('check').addEventListener('click', () => {
  if ($('check').disabled || checked) return;
  checked = true; selectedWord = null;
  const correctQuestions = items.filter(item => responses[item.number] === item.number).map(item => item.number);
  const score = correctQuestions.length;
  render();
  const headline = document.createElement('strong'); headline.textContent = `Score ${score}/${items.length}`;
  const message = document.createElement('p');
  message.textContent = score === items.length ? 'Excellent! All answers are correct. Tap Restart for a new order.' : 'Tap Try Again to redo the incorrect answers. Correct answers stay in place.';
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
  if (items.every(item => responses[item.number] === item.number)) { restart(); return; }
  for (const item of items) {
    if (responses[item.number] === item.number) locked.add(item.number);
    else delete responses[item.number];
  }
  checked = false; selectedWord = null; $('result').hidden = true; render();
  const first = document.querySelector('.drop:not(:disabled)');
  if (first) { first.focus(); first.scrollIntoView({block: 'center'}); }
});
$('restart').addEventListener('click', restart);
restart();
