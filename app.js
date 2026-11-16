const content = document.querySelector('#content');
const reference = document.querySelector('#reference');
const referenceLink = document.querySelector('#reference-link');
const keyboard = document.querySelector('.keyboard');
const moduleChoices = [0, 0];
let chapterIndex = 0;
let currentPage = '';
let activeInput;
let drill = [];

const progressKey = 'netzwerk-a1-progress';
const solved = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(progressKey));
  if (Array.isArray(saved)) saved.forEach(key => solved.add(key));
} catch {
  // The exercises still work if browser storage is unavailable.
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function questionKey(prefix, index) {
  return `${prefix}-${index + 1}`;
}

function sectionKeys(section, prefix) {
  if (section.kind === 'registration') return [questionKey(prefix, 0)];
  if (section.kind === 'verbs') {
    return section.persons.flatMap((_, row) => section.verbs.map((_, column) =>
      questionKey(prefix, row * section.verbs.length + column)));
  }
  return (section.questions || []).map((_, index) => questionKey(prefix, index));
}

const chapterKeys = chapters.map((chapter, index) =>
  chapter.modules.map((module, topic) =>
    module.sections.flatMap((section, part) => sectionKeys(section, `c${index}-${topic}-${part}`))));

function updateProgress() {
  const keys = chapterKeys[chapterIndex].flat();
  const percent = Math.round(100 * keys.filter(key => solved.has(key)).length / keys.length);
  document.querySelector('#xp').textContent = `${solved.size * 10} XP`;
  document.querySelector('#progress-label').textContent = `Kapitel ${chapterIndex + 1} · ${percent} %`;
  document.querySelector('#progress').value = percent;
  content.querySelectorAll('[data-done]').forEach(label => {
    const keys = chapterKeys[chapterIndex][Number(label.dataset.done)];
    label.textContent = keys.every(key => solved.has(key)) ? '✓' : '';
    label.setAttribute('aria-label', label.textContent ? 'Abgeschlossen' : '');
  });
}

function rememberProgress() {
  updateProgress();
  try { localStorage.setItem(progressKey, JSON.stringify([...solved])); } catch {}
}

function options(items, placeholder = 'Bitte wählen') {
  return `<option value="">${placeholder}</option>` + items
    .map(item => `<option>${escapeHtml(item)}</option>`).join('');
}

function choice(id, items, extra = '') {
  return `<select id="${id}" ${extra}>${options(items)}</select>`;
}

function answerField(key, answer) {
  return `data-key="${key}" data-answer="${escapeHtml(JSON.stringify(answer))}" aria-describedby="feedback-${key}"`;
}

function feedback(key) {
  return `<p id="feedback-${key}" class="feedback"></p>`;
}

function questionRow(section, [prompt, answer], index, prefix) {
  const key = section.keys?.[index] || questionKey(prefix, index);
  const kind = section.kind;
  const field = answerField(key, answer);
  let label = escapeHtml(prompt);
  if (kind === 'pictures') {
    label = `<img src="photos/${answer}.webp" alt="${label}" width="250" height="172">`;
  }
  if (kind === 'dictation') {
    label = `<button class="secondary" type="button" data-say="${label}">Adresse ${index + 1} anhören</button>
      <label class="visually-hidden" for="${key}">Adresse ${index + 1}</label>`;
  } else {
    label = `<label for="${key}">${label}</label>`;
  }
  const input = section.choices ? choice(key, section.choices, field) :
    `<input id="${key}" type="text" autocomplete="off" spellcheck="false" ${field}>`;
  if (kind === 'matching') return [label, input + feedback(key)];
  return `<div class="question">${label}${input}${feedback(key)}</div>`;
}

function ordering([prompt, words], index, prefix) {
  const key = questionKey(prefix, index);
  const shuffled = shuffle(words);
  if (shuffled.join(' ') === words.join(' ')) shuffled.push(shuffled.shift());
  return `<div class="order">
    <p id="prompt-${key}">${escapeHtml(prompt)}</p>
    <div class="tiles order-output" role="group" aria-label="Deine Reihenfolge"></div>
    <div class="tiles order-choices" role="group" aria-labelledby="prompt-${key}">
      ${shuffled.map((word, i) => `<button type="button" class="tile" data-word="${i}">${escapeHtml(word)}</button>`).join('')}
    </div>
    <input type="hidden" ${answerField(key, words.join(' '))}>
    ${feedback(key)}
  </div>`;
}

function articles(questions, prefix) {
  return `<p class="hint">Ziehe ein Wort in das passende Feld oder wähle zuerst das Wort und dann den Artikel.</p>
    <div class="tiles row">
      ${questions.map(([noun, article], index) => {
        const key = questionKey(prefix, index);
        return `<span><button type="button" class="tile noun" draggable="true" data-noun="${key}" data-label="${escapeHtml(noun)}" aria-pressed="false" aria-describedby="feedback-${key}">${escapeHtml(noun)}</button>
          <input id="${key}" type="hidden" ${answerField(key, article)}>
          ${feedback(key)}</span>`;
      }).join('')}
    </div>
    <div class="buckets">
      ${['der', 'das', 'die'].map(article => `<button class="tile bucket" type="button" data-bucket="${article}"><strong>${article}</strong><small></small></button>`).join('')}
    </div>`;
}

function preference() {
  return `<div class="question">
    <label for="hobby">Hobby</label>${choice('hobby', hobbies)}
    <label for="preference">Wie gern?</label>
    <input type="range" id="preference" min="0" max="3" value="2" aria-valuetext="gern">
  </div>
  <p class="status"><output id="preference-text" for="hobby preference">gern</output></p>`;
}

function registration(title, prefix) {
  const fields = [['Vorname', 'text'], ['Familienname', 'text'], ['Geburtsdatum', 'date'], ['Adresse', 'text']];
  return `<form class="registration" data-registration="${questionKey(prefix, 0)}" autocomplete="off">
    <fieldset>
      <legend>${title}</legend>
      <p class="hint">Verwende Beispieldaten für die Anmeldung.</p>
      <div class="questions">
        ${fields.map(([label, type], index) => `<div class="question"><label for="register-${index}">${label}</label><input id="register-${index}" type="${type}" required></div>`).join('')}
        <div class="question"><label for="course">Kurs</label>${choice('course', Object.keys(courses), 'required')}</div>
        <div class="question"><label for="course-day">Tag</label>${choice('course-day', [], 'required disabled')}</div>
      </div>
    </fieldset>
    <button class="secondary" type="submit">Anmeldung prüfen</button>
    <p class="status" role="status"></p>
  </form>`;
}

function sectionHtml(section, prefix) {
  let body;
  if (section.kind === 'audio') {
    body = `<div class="tiles">${section.items.map(([label, spoken]) =>
      `<button class="tile" type="button" data-say="${spoken}" aria-label="${label} anhören">${label}</button>`).join('')}</div>`;
  } else if (section.kind === 'preference') {
    body = preference();
  } else if (section.kind === 'articles') {
    body = articles(section.questions, prefix);
  } else if (section.kind === 'order') {
    body = section.questions.map((question, index) => ordering(question, index, prefix)).join('');
  } else if (section.kind === 'verbs') {
    const rows = section.persons.map(([person, verbIndex], row) => [person, ...section.verbs.map((verb, column) => {
      const key = questionKey(prefix, row * section.verbs.length + column);
      const field = answerField(key, conjugation[verb][verbIndex]);
      return `<input type="text" autocomplete="off" spellcheck="false" aria-label="${person} · ${verb}" ${field}>${feedback(key)}`;
    })]);
    body = `<div class="table-scroll verb-practice" tabindex="0" role="region" aria-label="Verbformen">
      ${table('', ['Person', ...section.verbs], rows)}</div>`;
  } else {
    const rows = section.questions.map((question, index) => questionRow(section, question, index, prefix));
    const style = { pictures: 'hobby-grid', chat: 'chat' }[section.kind] || '';
    body = section.kind === 'matching' ? table('', ['Land', 'Sprache'], rows) :
      `<div class="questions ${style}">${rows.join('')}</div>`;
  }
  return `<fieldset><legend>${section.title}</legend>
    ${section.hint ? `<p class="hint">${section.hint}</p>` : ''}
    ${body}</fieldset>`;
}

function exercise(title, sections, prefix) {
  const hasAudio = sections.some(section => ['audio', 'dictation'].includes(section.kind));
  return `<section class="activity">
    <h2>${title}</h2>
    <form class="exercise">
      ${sections.map((section, index) => section.kind === 'registration' ? '' :
        sectionHtml(section, `${prefix}-${index}`)).join('')}
      ${hasAudio ? '<p class="status audio-status" role="status"></p>' : ''}
      <button class="primary" type="submit">Antworten prüfen</button>
      <p class="status score-status" role="status"></p>
    </form>
    ${sections.map((section, index) => section.kind === 'registration' ?
      registration(section.title, `${prefix}-${index}`) : '').join('')}
  </section>`;
}

function homePage() {
  return `<section class="hero">
    <div>
      <h1>Hallo, <span>Deutsch!</span></h1>
      <p>Übe Deutsch mit Kapitel 1 und 2 von Netzwerk neu A1.1. Vom ersten „Guten Tag“ bis zur Verabredung mit Freunden.</p>
    </div>
    <div class="word-art" aria-hidden="true"><span>Guten Tag!</span><span>Hallo!</span></div>
  </section>
  <section aria-labelledby="chapters-title">
    <h2 class="section-title" id="chapters-title">Deine Kapitel</h2>
    <div class="chapters">
      ${chapters.map(({ title, intro }, index) => `<article class="chapter">
        <small>Kapitel ${index + 1}</small><h3>${title}</h3><p>${intro}</p>
        <a class="primary" href="#kapitel-${index + 1}">Start Kapitel ${index + 1} →</a>
      </article>`).join('')}
    </div>
  </section>
  <section class="daily">
    <div><h2>Schnell wiederholen</h2><p>Fünf zufällige Fragen aus beiden Kapiteln.</p></div>
    <button class="secondary" type="button" data-drill>5-Fragen-Mix starten →</button>
  </section>`;
}

function chapterPage(chapter, topic) {
  const { title, intro, modules } = chapters[chapter];
  return `<h1 class="page-title">Kapitel ${chapter + 1} · ${title}</h1><p class="intro">${intro}</p>
    <div class="workspace">
      <nav class="topics" aria-label="Themen in Kapitel ${chapter + 1}">
        ${modules.map((module, index) => `<a href="#kapitel-${chapter + 1}/${index + 1}" ${index === topic ? 'aria-current="page"' : ''}>
          ${chapter + 1}.${index + 1} ${module.title}<span data-done="${index}"></span></a>`).join('')}
      </nav>
      ${exercise(modules[topic].title, modules[topic].sections, `c${chapter}-${topic}`)}
    </div>`;
}

function storyPage() {
  return `<h1 class="page-title">Die Netzwerk-WG</h1>
    <p class="intro">Lerne die WG kennen und beantworte Fragen zu den ersten fünf Szenen.
      <a href="${storySource}" target="_blank" rel="noopener">Szenen nachlesen bei Klett</a>
    </p>
    <div class="people">${roommates.map(([name, bio]) => `<article class="person">
      <img src="photos/${name.toLowerCase()}.webp" alt="" width="162" height="184">
      <h2>${name}</h2><p>${bio}</p>
    </article>`).join('')}</div>
    ${exercise('Was weißt du über die WG?', storyQuiz, 'wg')}
    <p class="reference-source">Fotos aus Netzwerk neu A1, Kursbuch, © Ernst Klett Sprachen.</p>`;
}

function newDrill() {
  const [first, second] = chapters.map((chapter, index) => {
    const questions = [];
    chapter.modules.forEach((module, topic) => module.sections.forEach((section, part) => {
      if (section.kind && !['matching', 'chat'].includes(section.kind)) return;
      section.questions.forEach((question, position) => questions.push({
        title: `Kapitel ${index + 1} · ${section.title}`,
        choices: section.choices,
        questions: [question],
        keys: [questionKey(`c${index}-${topic}-${part}`, position)],
      }));
    }));
    return shuffle(questions);
  });
  // Start with one from each chapter, then draw the remaining three together.
  drill = shuffle([first.pop(), second.pop(), ...shuffle([...first, ...second]).slice(0, 3)]);
}

function drillPage() {
  if (!drill.length) newDrill();
  return `<h1 class="page-title">5-Fragen-Mix</h1>
    <p class="intro">Ein kurzer Rückblick auf beide Kapitel.</p>
    ${exercise('Teste dein Wissen', drill, 'drill')}
    <div class="row"><button class="secondary" type="button" data-drill>Neuer Mix</button><a class="secondary" href="#home">Zurück zur Übersicht</a></div>`;
}

function table(title, headings, rows) {
  return `<table>${title ? `<caption>${title}</caption>` : ''}
    <thead><tr>${headings.map(heading => `<th scope="col">${heading}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([label, ...items]) => `<tr><th scope="row">${label}</th>${items.map(item =>
      `<td>${item}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

function verbTable(verbs, persons) {
  return table('Personalpronomen und Verben', ['Person', ...verbs], persons.map(([person, index]) =>
    [person, ...verbs.map(verb => conjugation[verb][index])]));
}

document.querySelector('#reference-content').innerHTML = `<section class="reference-section">
  <h3>Kapitel 1 · Guten Tag!</h3>
  <div class="reference-grid">
    ${table('Redemittel', ['Situation', 'Beispiel'], greetingsReference)}
    <div>
      ${table('Grammatik', ['Regel', 'Beispiel'], [
        ['W-Frage', 'Fragewort + Verb + Subjekt: Wo wohnst du?'],
        ['Aussagesatz', 'Subjekt + Verb + Ergänzung: Ich wohne in Zürich.'],
        ['Personalpronomen', 'Frau Lang → sie. Jan → er. Formelle Anrede → Sie.'],
        ['Herkunft mit aus', 'aus Spanien · aus der Schweiz · aus der Türkei · aus den USA'],
      ])}
      <div class="table-scroll" tabindex="0" role="region" aria-label="Verbformen Kapitel 1">
        ${verbTable(['sein', 'heißen', 'kommen', 'wohnen'], [['ich', 0], ['du', 1], ['er/sie', 2], ['Sie', 5]])}
      </div>
    </div>
  </div>
</section>
<section class="reference-section">
  <h3>Kapitel 2 · Freunde, Kollegen und ich</h3>
  <div class="reference-grid">
    <div>
      ${table('Redemittel', ['Situation', 'Beispiel'], everydayReference)}
      ${table('Zahlen ab 20', ['Zahl', 'Wort'], numberReference)}
    </div>
    <div>
      ${table('Grammatik', ['Regel', 'Beispiel'], [
        ['Ja-/Nein-Frage', 'Verb + Subjekt + Ergänzung: Gehen wir ins Kino? → Ja. / Nein.'],
        ['Bestimmter Artikel', 'der Stift (maskulin), das Buch (neutrum), die Tablette (feminin). Im Plural immer die.'],
        ['Plural ohne Endung', 'der Kilometer → die Kilometer. Bei manchen Nomen mit Umlaut.'],
        ['Plural -(e)n', 'die Stunde → die Stunden'],
        ['Plural -e (ggf. mit Umlaut)', 'der Tag → die Tage · der Arzt → die Ärzte'],
        ['Plural -er (ggf. mit Umlaut)', 'das Buch → die Bücher'],
        ['Plural -s', 'das Auto → die Autos'],
      ])}
      <div class="table-scroll" tabindex="0" role="region" aria-label="Verbformen Kapitel 2">${verbTable(['kochen', 'arbeiten', 'lesen', 'sprechen', 'sein', 'haben'],
        [['ich', 0], ['du', 1], ['er/es/sie', 2], ['wir', 3], ['ihr', 4], ['sie/Sie', 5]])}</div>
    </div>
  </div>
</section>
<p class="reference-source">Nach Netzwerk neu A1, Kursbuch, S. 17 und 27.</p>`;

function showPage(moveFocus = true) {
  const requested = location.hash.slice(1);
  const showReference = requested === 'cheat-sheet';
  const route = showReference ? (currentPage || 'home') : requested;
  const chapter = route.match(/^kapitel-([12])(?:\/([1-5]))?$/);
  const page = chapter ? route : ['wg-story', 'daily-drill'].includes(route) ? route : 'home';
  if (page !== currentPage) {
    currentPage = page;
    activeInput = undefined;
    if (chapter) {
      chapterIndex = Number(chapter[1]) - 1;
      const lastTopic = chapters[chapterIndex].modules.length - 1;
      const topic = chapter[2] ? Math.min(Number(chapter[2]) - 1, lastTopic) : moduleChoices[chapterIndex];
      moduleChoices[chapterIndex] = topic;
      content.innerHTML = chapterPage(chapterIndex, topic);
    } else {
      content.innerHTML = page === 'wg-story' ? storyPage() : page === 'daily-drill' ? drillPage() : homePage();
    }
    const parentPage = chapter ? `kapitel-${chapter[1]}` : page;
    document.querySelectorAll('.header-inner nav a').forEach(link => {
      if (link.hash === `#${parentPage}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    updateProgress();
    if (moveFocus && !showReference) {
      window.scrollTo(0, 0);
      content.focus({ preventScroll: true });
    }
  }
  if (showReference && !reference.open) reference.showModal();
  else if (!showReference && reference.open) reference.close();
}

reference.addEventListener('close', () => {
  if (location.hash === '#cheat-sheet') {
    history.replaceState(null, '', `#${currentPage}`);
    referenceLink.focus();
  }
});
window.addEventListener('hashchange', () => showPage());
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  content.focus();
});
showPage(false);

function normalize(value) {
  return value.normalize('NFC').trim().toLocaleLowerCase('de').replace(/\s+/g, ' ').replace(/[.!?]$/, '');
}

function checkAnswers(form) {
  const inputs = [...form.querySelectorAll('[data-answer]')];
  let correct = 0;
  inputs.forEach(input => {
    const expected = [JSON.parse(input.dataset.answer)].flat();
    const answer = input.value;
    const ok = expected.some(word => normalize(word) === normalize(answer));
    const message = document.getElementById(`feedback-${input.dataset.key}`);
    message.textContent = ok ? 'Richtig!' : answer ? `Lösung: ${expected[0]}` : 'Deine Antwort fehlt.';
    message.dataset.result = ok ? 'correct' : 'wrong';
    const control = input.type === 'hidden' ? input.parentElement.querySelector('.noun, .order-output') : input;
    control?.setAttribute('aria-invalid', String(!ok));
    if (ok) {
      solved.add(input.dataset.key);
      correct++;
    }
  });
  const status = form.querySelector('.score-status');
  status.textContent = `${correct} von ${inputs.length} richtig.${correct === inputs.length ? ' Gut gemacht!' : ''}`;
  status.dataset.result = correct === inputs.length ? 'correct' : '';
  rememberProgress();
}

content.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (form.matches('.exercise')) {
    checkAnswers(form);
  } else if (form.matches('.registration')) {
    const invalid = [...form.querySelectorAll('input[type="text"]')].find(input => !input.value.trim());
    if (invalid) {
      invalid.setCustomValidity('Bitte fülle dieses Feld aus.');
      invalid.reportValidity();
      return;
    }
    solved.add(form.dataset.registration);
    const status = form.querySelector('.status');
    status.textContent = `Alles ausgefüllt! ${form.querySelector('#course').value} am ${form.querySelector('#course-day').value}.`;
    status.dataset.result = 'correct';
    rememberProgress();
  }
});

function speak(button) {
  const status = button.closest('form').querySelector('.audio-status');
  const hint = 'Aktiviere eine deutsche Stimme in deinem Browser oder Betriebssystem.';
  if (!('speechSynthesis' in window)) {
    status.textContent = hint;
    return;
  }
  status.textContent = '';
  const speech = new SpeechSynthesisUtterance(button.dataset.say);
  const voices = speechSynthesis.getVoices();
  const germanVoice = voices.find(voice => voice.lang === 'de-DE') ||
    voices.find(voice => /^de\b/i.test(voice.lang));
  if (voices.length && !germanVoice) {
    status.textContent = hint;
    return;
  }
  speech.lang = 'de-DE';
  if (germanVoice) speech.voice = germanVoice;
  speech.rate = .78;
  speech.onerror = event => {
    if (!['canceled', 'interrupted'].includes(event.error) && status.isConnected) status.textContent = hint;
  };
  speechSynthesis.cancel();
  speechSynthesis.speak(speech);
}

function moveWord(button) {
  const order = button.closest('.order');
  const output = order.querySelector('.order-output');
  if (button.parentElement === output) {
    const original = order.querySelector(`.order-choices [data-word="${button.dataset.word}"]`);
    button.remove();
    original.disabled = false;
    original.focus();
  } else {
    const pick = button.cloneNode(true);
    output.append(pick);
    button.disabled = true;
    (order.querySelector('.order-choices button:not(:disabled)') || pick).focus();
  }
  order.querySelector('input').value = [...output.children].map(word => word.textContent).join(' ');
}

function putInBucket(noun, bucket, moveFocus = false) {
  const fieldset = bucket.closest('fieldset');
  if (!noun || noun.closest('fieldset') !== fieldset) return;
  document.getElementById(noun.dataset.noun).value = bucket.dataset.bucket;
  const nouns = [...fieldset.querySelectorAll('.noun')];
  nouns.forEach(button => {
    const article = document.getElementById(button.dataset.noun).value;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = article ? `${button.dataset.label} · ${article}` : button.dataset.label;
  });
  fieldset.querySelectorAll('.bucket').forEach(button => {
    button.querySelector('small').textContent = nouns.filter(noun =>
      document.getElementById(noun.dataset.noun).value === button.dataset.bucket)
      .map(noun => noun.dataset.label).join(', ');
  });
  if (moveFocus) noun.focus();
}

content.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.matches('[data-drill]')) {
    newDrill();
    if (currentPage === 'daily-drill') {
      content.innerHTML = drillPage();
      content.focus();
    } else location.hash = 'daily-drill';
  } else if (button.matches('[data-say]')) {
    speak(button);
  } else if (button.matches('[data-word]')) {
    moveWord(button);
  } else if (button.matches('.noun')) {
    const selected = button.getAttribute('aria-pressed') === 'true';
    button.closest('fieldset').querySelectorAll('.noun').forEach(noun => {
      noun.setAttribute('aria-pressed', String(noun === button && !selected));
    });
  } else if (button.matches('.bucket')) {
    putInBucket(button.closest('fieldset').querySelector('.noun[aria-pressed="true"]'), button, true);
  }
});

content.addEventListener('dragstart', event => {
  const noun = event.target.closest('.noun');
  if (!noun) return;
  event.dataTransfer.setData('text/plain', noun.dataset.noun);
  event.dataTransfer.effectAllowed = 'move';
});
content.addEventListener('dragover', event => {
  if (event.target.closest('.bucket')) event.preventDefault();
});
content.addEventListener('drop', event => {
  const bucket = event.target.closest('.bucket');
  if (!bucket) return;
  event.preventDefault();
  const key = event.dataTransfer.getData('text/plain');
  const noun = [...bucket.closest('fieldset').querySelectorAll('.noun')].find(button => button.dataset.noun === key);
  putInBucket(noun, bucket);
});

content.addEventListener('input', event => {
  const input = event.target;
  if (input.id === 'hobby' || input.id === 'preference') {
    const slider = document.querySelector('#preference');
    const rating = ['nicht so gern', 'es geht so', 'gern', 'sehr gern'][slider.value];
    const hobby = document.querySelector('#hobby').value;
    slider.setAttribute('aria-valuetext', rating);
    document.querySelector('#preference-text').value = hobby ? `${hobby} · ${rating}` : rating;
  } else if (input.id === 'course') {
    const day = document.querySelector('#course-day');
    day.innerHTML = options(courses[input.value] || []);
    day.disabled = !input.value;
  } else if (input.matches('.registration input')) {
    input.setCustomValidity('');
  }
});

// Remember the last text box so the floating keyboard works after a click or Tab.
document.addEventListener('focusin', event => {
  if (event.target.matches('input[type="text"], textarea')) activeInput = event.target;
  else if (!keyboard.contains(event.target)) activeInput = undefined;
});
keyboard.addEventListener('pointerdown', event => {
  if (event.target.matches('button') && activeInput) event.preventDefault();
});
keyboard.addEventListener('click', event => {
  if (!event.target.matches('button') || !activeInput?.isConnected) return;
  const input = activeInput;
  const start = input.selectionStart;
  input.setRangeText(event.target.textContent, start, input.selectionEnd, 'end');
  input.focus();
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
