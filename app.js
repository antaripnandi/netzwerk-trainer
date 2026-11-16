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

function german(text) {
  return `<span lang="de">${escapeHtml(text)}</span>`;
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
  document.querySelector('#progress-label').textContent = `Chapter ${chapterIndex + 1} · ${percent}%`;
  document.querySelector('#progress').value = percent;
  content.querySelectorAll('[data-done]').forEach(label => {
    const keys = chapterKeys[chapterIndex][Number(label.dataset.done)];
    label.textContent = keys.every(key => solved.has(key)) ? '✓' : '';
    label.setAttribute('aria-label', label.textContent ? 'Complete' : '');
  });
}

function rememberProgress() {
  updateProgress();
  try { localStorage.setItem(progressKey, JSON.stringify([...solved])); } catch {}
}

function options(items, placeholder = 'Choose…') {
  return `<option value="">${placeholder}</option>` + items
    .map(item => `<option lang="de">${escapeHtml(item)}</option>`).join('');
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

function questionHint(label, answer, hint) {
  const firstAnswer = Array.isArray(answer) ? answer[0] : answer;
  const start = firstAnswer.length < 5 ? firstAnswer[0] : firstAnswer.slice(0, 2);
  return `<details class="question-hint">
    <summary aria-label="Hint for ${escapeHtml(label)}">Hint</summary>
    <p>${hint ? escapeHtml(hint) : `The answer starts with ${german(start + '…')}.`}</p>
  </details>`;
}

function questionRow(section, [prompt, answer, hint], index, prefix) {
  const key = section.keys?.[index] || questionKey(prefix, index);
  const kind = section.kind;
  const field = answerField(key, answer);
  let label = escapeHtml(prompt);
  const labelText = kind === 'dictation' ? `email ${index + 1}` : prompt;
  if (kind === 'pictures') {
    label = `<img src="photos/${answer}.webp" alt="${label}" width="250" height="172">`;
  }
  if (kind === 'dictation') {
    label = `<button class="secondary" type="button" data-say="${label}">Listen to email ${index + 1}</button>
      <label class="visually-hidden" for="${key}">Email ${index + 1}</label>`;
  } else {
    label = `<label for="${key}"${kind === 'pictures' ? '' : ' lang="de"'}>${label}</label>`;
  }
  const input = section.choices ? choice(key, section.choices, field) :
    `<input id="${key}" type="text" lang="de" autocomplete="off" spellcheck="false" ${field}>`;
  const response = input + questionHint(labelText, answer, hint) + feedback(key);
  if (kind === 'matching') return [label, response];
  return `<div class="question">${label}<div>${response}</div></div>`;
}

function ordering([prompt, words, hint], index, prefix) {
  const key = questionKey(prefix, index);
  const shuffled = shuffle(words);
  if (shuffled.join(' ') === words.join(' ')) shuffled.push(shuffled.shift());
  return `<div class="order">
    <p id="prompt-${key}" lang="de">${escapeHtml(prompt)}</p>
    ${questionHint(`word order question ${index + 1}`, words, hint)}
    <div class="tiles order-output" role="group" aria-label="Your word order"></div>
    <div class="tiles order-choices" role="group" aria-labelledby="prompt-${key}">
      ${shuffled.map((word, i) => `<button type="button" class="tile" data-word="${i}" lang="de">${escapeHtml(word)}</button>`).join('')}
    </div>
    <input type="hidden" ${answerField(key, words.join(' '))}>
    ${feedback(key)}
  </div>`;
}

function articles(questions, prefix) {
  return `<div class="article-words">
      ${questions.map(([noun, article, hint], index) => {
        const key = questionKey(prefix, index);
        return `<div><button type="button" class="tile noun" draggable="true" lang="de" data-noun="${key}" data-label="${escapeHtml(noun)}" aria-pressed="false" aria-describedby="feedback-${key}">${escapeHtml(noun)}</button>
          <input id="${key}" type="hidden" ${answerField(key, article)}>
          ${questionHint(noun, article, hint)}${feedback(key)}</div>`;
      }).join('')}
    </div>
    <div class="buckets">
      ${['der', 'das', 'die'].map(article => `<button class="tile bucket" type="button" lang="de" data-bucket="${article}"><strong>${article}</strong><small></small></button>`).join('')}
    </div>`;
}

function preference() {
  return `<div class="question">
    <label for="hobby">Hobby</label>${choice('hobby', hobbies)}
    <label for="preference">Preference</label>
    <div>
      <input type="range" id="preference" min="0" max="3" value="2" aria-valuetext="${preferenceRatings[2]}">
      <p><output id="preference-text" for="hobby preference">${preferenceRatings[2]}</output></p>
    </div>
  </div>`;
}

function registration(title, prefix) {
  const fields = [
    ['First name', 'Vorname', 'text'], ['Last name', 'Familienname', 'text'],
    ['Birth date', 'Geburtsdatum', 'date'], ['Address', 'Adresse', 'text'],
  ];
  return `<form class="registration" data-registration="${questionKey(prefix, 0)}" autocomplete="off">
    <fieldset>
      <legend>${title}</legend>
      <p class="hint">Use made-up details. This practice form does not send your information.</p>
      <p class="hint" lang="de">Verwende Beispieldaten für die Anmeldung.</p>
      <div class="questions">
        ${fields.map(([label, translation, type], index) => `<div class="question">
          <label for="register-${index}">${label} (${german(translation)})</label>
          <input id="register-${index}" type="${type}" required></div>`).join('')}
        <div class="question"><label for="course">Course (${german('Kurs')})</label>${choice('course', Object.keys(courses), 'required')}</div>
        <div class="question"><label for="course-day">Day (${german('Tag')})</label>${choice('course-day', [], 'required disabled')}</div>
      </div>
    </fieldset>
    <button class="secondary" type="submit">Check practice form</button>
    <p class="status" role="status"></p>
  </form>`;
}

function sectionHtml(section, prefix) {
  let body;
  if (section.kind === 'audio') {
    body = `<div class="tiles">${section.items.map(([label, spoken]) =>
      `<button class="tile" type="button" data-say="${spoken}" aria-label="Listen to ${label}">${label}</button>`).join('')}</div>`;
  } else if (section.kind === 'preference') {
    body = preference();
  } else if (section.kind === 'articles') {
    body = articles(section.questions, prefix);
  } else if (section.kind === 'order') {
    body = section.questions.map((question, index) => ordering(question, index, prefix)).join('');
  } else if (section.kind === 'verbs') {
    const rows = section.persons.map(([person, verbIndex], row) => [german(person), ...section.verbs.map((verb, column) => {
      const key = questionKey(prefix, row * section.verbs.length + column);
      const answer = conjugation[verb][verbIndex];
      return `<input type="text" autocomplete="off" spellcheck="false" lang="de" aria-label="${person} · ${verb}" ${answerField(key, answer)}>
        ${questionHint(`${person} · ${verb}`, answer)}${feedback(key)}`;
    })]);
    body = `<div class="table-scroll verb-practice" tabindex="0" role="region" aria-label="Verb forms">
      ${table('', ['Person', ...section.verbs.map(german)], rows)}</div>`;
  } else {
    const rows = section.questions.map((question, index) => questionRow(section, question, index, prefix));
    const style = { pictures: 'hobby-grid', chat: 'chat' }[section.kind] || '';
    body = section.kind === 'matching' ? table('', ['Country', 'Language'], rows) :
      `<div class="questions ${style}">${rows.join('')}</div>`;
  }
  return `<fieldset><legend>${section.title}</legend>
    ${section.lesson ? `<p class="lesson-note">${escapeHtml(section.lesson)}</p>` : ''}
    ${section.hint ? `<p class="hint">${section.hint}</p>` : ''}
    ${body}</fieldset>`;
}

function exercise(title, sections, prefix) {
  const hasAudio = sections.some(section => ['audio', 'dictation'].includes(section.kind));
  return `<section class="activity">
    <h2>${title}</h2>
    <p class="hint">Stuck on a question? Open its hint for a translation or a clue.</p>
    <form class="exercise">
      ${sections.map((section, index) => section.kind === 'registration' ? '' :
        sectionHtml(section, `${prefix}-${index}`)).join('')}
      ${hasAudio ? '<p class="status audio-status" role="status"></p>' : ''}
      <button class="primary" type="submit">Check answers</button>
      <p class="status score-status" role="status"></p>
    </form>
    ${sections.map((section, index) => section.kind === 'registration' ?
      registration(section.title, `${prefix}-${index}`) : '').join('')}
  </section>`;
}

function homePage() {
  return `<section class="hero">
    <div>
      <h1 lang="de">Hallo, <span>Deutsch!</span></h1>
      <p>Start learning German with Chapters 1 and 2 of Netzwerk neu A1.1. Practice saying hello, introducing yourself, and making plans with friends.</p>
    </div>
    <div class="word-art" aria-hidden="true"><span>Guten Tag!</span><span>Hallo!</span></div>
  </section>
  <section aria-labelledby="chapters-title">
    <h2 class="section-title" id="chapters-title">Choose a chapter</h2>
    <div class="chapters">
      ${chapters.map(({ title, intro }, index) => `<article class="chapter">
        <small>Chapter ${index + 1}</small><h3 lang="de">${title}</h3><p>${intro}</p>
        <a class="primary" href="#kapitel-${index + 1}">Start Chapter ${index + 1} →</a>
      </article>`).join('')}
    </div>
  </section>
  <section class="daily">
    <div><h2>Quick review</h2><p>Five random questions from both chapters.</p></div>
    <button class="secondary" type="button" data-drill>Start 5-question mix →</button>
  </section>`;
}

function chapterPage(chapter, topic) {
  const { title, intro, modules } = chapters[chapter];
  return `<h1 class="page-title">Chapter ${chapter + 1} · ${german(title)}</h1><p class="intro">${intro}</p>
    <div class="workspace">
      <nav class="topics" aria-label="Topics in Chapter ${chapter + 1}">
        ${modules.map((module, index) => `<a href="#kapitel-${chapter + 1}/${index + 1}" ${index === topic ? 'aria-current="page"' : ''}>
          ${chapter + 1}.${index + 1} ${module.title}<span data-done="${index}"></span></a>`).join('')}
      </nav>
      ${exercise(modules[topic].title, modules[topic].sections, `c${chapter}-${topic}`)}
    </div>`;
}

function storyPage() {
  return `<h1 class="page-title" lang="de">Die Netzwerk-WG</h1>
    <p class="intro">WG stands for ${german('Wohngemeinschaft')}, a shared apartment. Meet the roommates and answer questions about their first five scenes.
      <a href="${storySource}" target="_blank" rel="noopener">Read the German transcript (PDF)</a>
    </p>
    <div class="people">${roommates.map(([name, bio, translation]) => `<article class="person">
      <img src="photos/${name.toLowerCase()}.webp" alt="" width="162" height="184">
      <h2>${name}</h2><p lang="de">${bio}</p><p class="translation">${translation}</p>
    </article>`).join('')}</div>
    ${exercise('Roommate quiz', storyQuiz, 'wg')}
    <p class="reference-source">Photos from ${german('Netzwerk neu A1, Kursbuch')}, © Ernst Klett Sprachen.</p>`;
}

function newDrill() {
  const [first, second] = chapters.map((chapter, index) => {
    const questions = [];
    chapter.modules.forEach((module, topic) => module.sections.forEach((section, part) => {
      if (section.kind && !['matching', 'chat'].includes(section.kind)) return;
      section.questions.forEach((question, position) => questions.push({
        title: `Chapter ${index + 1} · ${section.title}`,
        choices: section.choices,
        hint: section.hint,
        lesson: section.lesson,
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
  return `<h1 class="page-title">5-question mix</h1>
    <p class="intro">Review questions from both chapters.</p>
    ${exercise('Quick review', drill, 'drill')}
    <div class="row"><button class="secondary" type="button" data-drill>New mix</button><a class="secondary" href="#home">Back to home</a></div>`;
}

function table(title, headings, rows) {
  return `<table>${title ? `<caption>${title}</caption>` : ''}
    <thead><tr>${headings.map(heading => `<th scope="col">${heading}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([label, ...items]) => `<tr><th scope="row">${label}</th>${items.map(item =>
      `<td>${item}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

function verbTable(verbs, persons) {
  return table('Pronouns and verb forms', ['Person', ...verbs.map(german)], persons.map(([person, index]) =>
    [german(person), ...verbs.map(verb => german(conjugation[verb][index]))]));
}

document.querySelector('#reference-content').innerHTML = `<section class="reference-section">
  <h3>Chapter 1 · ${german('Guten Tag!')}</h3>
  <div class="reference-grid">
    ${table('Useful phrases', ['Situation', 'German example'], greetingsReference.map(([topic, example]) => [topic, german(example)]))}
    <div>
      ${table('Grammar', ['Rule', 'How it works'], [
        ['W-question', `Question word + verb + subject. ${german('Wo wohnst du?')} (Where do you live?)`],
        ['Statement', `Subject + verb + the rest of the sentence. ${german('Ich wohne in Zürich.')} (I live in Zurich.)`],
        ['Pronouns', `${german('Frau Lang → sie; Jan → er.')} Use ${german('Sie')} for formal “you.”`],
        [`Where you’re from with ${german('aus')}`, `${escapeHtml(comingFromRule)}<br>${german('aus Spanien · aus der Schweiz · aus der Türkei · aus den USA')}`],
      ])}
      <div class="table-scroll" tabindex="0" role="region" aria-label="Chapter 1 verb forms">
        ${verbTable(['sein', 'heißen', 'kommen', 'wohnen', 'sprechen'], [['ich', 0], ['du', 1], ['er/sie', 2], ['Sie', 5]])}
      </div>
    </div>
  </div>
</section>
<section class="reference-section">
  <h3>Chapter 2 · ${german('Freunde, Kollegen und ich')}</h3>
  <div class="reference-grid">
    <div>
      ${table('Useful phrases', ['Situation', 'German example'], everydayReference.map(([topic, example]) => [topic, german(example)]))}
      ${table('Numbers from 20 onward', ['Number', 'German word'], numberReference.map(([number, word]) => [number, german(word)]))}
    </div>
    <div>
      ${table('Grammar', ['Rule', 'How it works'], [
        ['Yes/no question', `Verb + subject + the rest of the sentence. ${german('Gehen wir ins Kino? → Ja. / Nein.')}`],
        ['Definite article', `${german('der Stift')} (masculine), ${german('das Buch')} (neuter), ${german('die Tablette')} (feminine). The plural article is always ${german('die')}.`],
        ['Plural without an ending', `${german('der Kilometer → die Kilometer')}. Some nouns add an umlaut.`],
        ['Plural -(e)n', german('die Stunde → die Stunden')],
        ['Plural -e (sometimes with an umlaut)', german('der Tag → die Tage · der Arzt → die Ärzte')],
        ['Plural -er (sometimes with an umlaut)', german('das Buch → die Bücher')],
        ['Plural -s', german('das Auto → die Autos')],
      ])}
      <div class="table-scroll" tabindex="0" role="region" aria-label="Chapter 2 verb forms">${verbTable(['kochen', 'arbeiten', 'lesen', 'sprechen', 'sein', 'haben'],
        [['ich', 0], ['du', 1], ['er/es/sie', 2], ['wir', 3], ['ihr', 4], ['sie/Sie', 5]])}</div>
    </div>
  </div>
</section>
<p class="reference-source">Adapted from ${german('Netzwerk neu A1, Kursbuch')}, pages 17 and 27.</p>`;

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
  let unanswered = 0;
  inputs.forEach(input => {
    const expected = [JSON.parse(input.dataset.answer)].flat();
    const answer = input.value.trim();
    const ok = expected.some(word => normalize(word) === normalize(answer));
    const message = document.getElementById(`feedback-${input.dataset.key}`);
    message.innerHTML = ok ? 'Correct!' : answer ? `Answer: ${german(expected[0])}` : 'No answer yet. Try the hint.';
    message.dataset.result = ok ? 'correct' : answer ? 'wrong' : '';
    const control = input.type === 'hidden' ? input.parentElement.querySelector('.noun, .order-output') : input;
    control?.setAttribute('aria-invalid', String(Boolean(answer) && !ok));
    if (ok) {
      solved.add(input.dataset.key);
      correct++;
    }
    if (!answer) unanswered++;
  });
  const status = form.querySelector('.score-status');
  status.textContent = `${correct} of ${inputs.length} correct.${correct === inputs.length ? ' Well done!' : ''}${unanswered ? ` ${unanswered} unanswered.` : ''}`;
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
      invalid.setCustomValidity('Please fill in this field.');
      invalid.reportValidity();
      return;
    }
    solved.add(form.dataset.registration);
    const status = form.querySelector('.status');
    status.innerHTML = `Practice form complete! ${german(form.querySelector('#course').value)} on ${german(form.querySelector('#course-day').value)}.`;
    status.dataset.result = 'correct';
    rememberProgress();
  }
});

function speak(button) {
  const status = button.closest('form').querySelector('.audio-status');
  const hint = 'To play the audio, enable a German voice in your browser or device settings.';
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
    const rating = preferenceRatings[slider.value];
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
