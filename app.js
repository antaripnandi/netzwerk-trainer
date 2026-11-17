const content = document.querySelector('#content');
const reference = document.querySelector('#reference');
const referenceLink = document.querySelector('#reference-link');
let currentPage = '';
let currentLesson = null;
let quiz = null;
let drill = [];

const progressKey = 'netzwerk-a1-progress';
const courseKey = 'netzwerk-a1-course';
function readProgress(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
const oldAnswers = readProgress(progressKey);
const solved = new Set(Array.isArray(oldAnswers) ? oldAnswers : []);

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

const savedCourse = readProgress(courseKey);
const migrated = coursePath.filter(lesson => {
  // Older Basics lessons were much shorter. Keep their XP and start the new Basics path fresh.
  if (!lesson.group.number) return false;
  const keys = lesson.sections.flatMap((section, index) => sectionKeys(section, `${lesson.prefix}-${index}`));
  return keys.length && keys.every(key => solved.has(key));
});
const passed = new Set(Array.isArray(savedCourse?.passed) ? savedCourse.passed : migrated.map(lesson => lesson.route));

function rememberCourse() {
  try { localStorage.setItem(courseKey, JSON.stringify({ passed: [...passed] })); } catch {}
}
if (!savedCourse) rememberCourse();

function nextLesson() {
  return coursePath.find(lesson => !passed.has(lesson.route));
}

function unlocked(lesson) {
  return passed.has(lesson.route) || lesson === nextLesson();
}

function updateProgress() {
  const group = (currentLesson || nextLesson() || coursePath.at(-1)).group;
  const count = group.lessons.filter(lesson => passed.has(lesson.route)).length;
  const percent = Math.round(100 * count / group.lessons.length);
  document.querySelector('#xp').textContent = `${solved.size * 10} XP`;
  document.querySelector('#progress-label').textContent = group.number ?
    `Chapter ${group.number} · ${percent}%` : `Basics · ${count}/${group.lessons.length}`;
  document.querySelector('#progress').value = percent;
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

function questionRow(section, [prompt, answer, hint, instruction], index, prefix) {
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
    const language = section.promptLanguage || (kind === 'pictures' ? 'en' : 'de');
    label = `<label for="${key}" lang="${language}">${label}${instruction ?
      `<span class="question-direction" lang="en">${escapeHtml(instruction)}</span>` : ''}</label>`;
  }
  const input = section.choices ? choice(key, section.choices, field) :
    `<input id="${key}" type="text" lang="de" autocomplete="off" spellcheck="false" ${field}>`;
  const response = input + questionHint(labelText, answer, hint) + feedback(key);
  if (kind === 'matching') return [label, response];
  return `<div class="question">${label}<div>${response}</div></div>`;
}

function ordering([prompt, words, hint], index, prefix, showHint = true, language = 'de') {
  const key = questionKey(prefix, index);
  const shuffled = shuffle(words);
  if (shuffled.join(' ') === words.join(' ')) shuffled.push(shuffled.shift());
  return `<div class="order">
    <p id="prompt-${key}" lang="${language}">${escapeHtml(prompt)}</p>
    ${showHint ? questionHint(`word order question ${index + 1}`, words, hint) : ''}
    <div class="tiles order-output" role="group" aria-label="Your word order" aria-describedby="feedback-${key}"></div>
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

function listenButton(label, spoken, text = label) {
  return `<button class="tile" type="button" data-say="${escapeHtml(spoken)}" aria-label="Listen to ${escapeHtml(label)}">${escapeHtml(text)}</button>`;
}

function audioSpeedPicker() {
  return `<fieldset class="audio-speed">
    <legend>Playback speed</legend>
    <label><input type="radio" name="audio-speed" value="1" ${audioRate === 1 ? 'checked' : ''}> Normal</label>
    <label><input type="radio" name="audio-speed" value="${slowRate}" ${audioRate === slowRate ? 'checked' : ''}> Slow</label>
  </fieldset>`;
}

function sectionHtml(section, prefix) {
  let body;
  if (section.kind === 'preference') {
    body = preference();
  } else if (section.kind === 'articles') {
    body = articles(section.questions, prefix);
  } else if (section.kind === 'order') {
    body = section.questions.map((question, index) => ordering(question, index, prefix, true, section.promptLanguage)).join('');
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

function teachingHtml(blocks, audio) {
  return `<section class="lesson" aria-label="Learn">
    ${audioSpeedPicker()}
    <p class="status audio-status" role="status"></p>
    ${blocks.map(({ title, text, examples, translationHeading = 'English' }) => `<section class="lesson-block">
      <h3>${title}</h3>
      ${text ? `<p>${escapeHtml(text)}</p>` : ''}
      <div class="table-scroll" tabindex="0" role="region" aria-label="${escapeHtml(title)} vocabulary">
      ${table('', ['German', translationHeading, 'Audio'], examples.map(([word, translation, spoken = word]) =>
        [german(word), translationHeading === 'Number' ? `<span class="lesson-number">${escapeHtml(translation)}</span>` :
          escapeHtml(translation), listenButton(word, spoken, 'Listen')]))}
      </div>
    </section>`).join('')}
    ${audio.map(section => `<details class="lesson-audio">
      <summary>${section.title}</summary>
      ${section.hint ? `<p class="hint">${escapeHtml(section.hint)}</p>` : ''}
      <div class="tiles">${section.items.map(([label, spoken]) => listenButton(label, spoken)).join('')}</div>
    </details>`).join('')}
  </section>`;
}

function exercise(title, sections, prefix) {
  const hasPracticeAudio = sections.some(section => section.kind === 'dictation');
  return `<section class="activity">
    <h2>${title}</h2>
    <p class="hint">Stuck on a question? Open its hint for a translation or a clue.</p>
    ${hasPracticeAudio ? audioSpeedPicker() : ''}
    <form class="exercise">
      ${sections.map((section, index) => ['registration', 'audio'].includes(section.kind) ? '' :
        sectionHtml(section, `${prefix}-${index}`)).join('')}
      ${hasPracticeAudio ? '<p class="status audio-status" role="status"></p>' : ''}
      <button class="primary" type="submit">Check answers</button>
      <p class="status score-status" role="status"></p>
    </form>
    ${sections.map((section, index) => section.kind === 'registration' ?
      registration(section.title, `${prefix}-${index}`) : '').join('')}
  </section>`;
}

function homePage() {
  const next = nextLesson();
  const action = !next ? 'Review the course' :
    passed.size || [...solved].some(key => key.startsWith('quiz-')) ? 'Continue learning' : 'Start from zero';
  return `<section class="hero">
    <div>
      <h1 lang="de">Hallo, <span>Deutsch!</span></h1>
      <p>Learn the German alphabet, numbers, and everyday words. Practice each lesson to unlock the next one.</p>
      <a class="primary hero-start" href="#${next?.route || 'basics/1'}">${action} →</a>
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

function lessonPage(lesson) {
  const { group, title } = lesson;
  const next = nextLesson();
  const finished = passed.has(lesson.route);
  const open = unlocked(lesson);
  const view = open ? `${teachingHtml(lesson.teaching, lesson.sections.filter(section => section.kind === 'audio'))}
    <div class="row lesson-actions">
      <button type="button" class="primary" data-course="practice">${finished ? 'Review lesson' : 'Start practice'}</button>
      ${finished && group.number ? '<button type="button" class="secondary" data-course="extra">Extra activities</button>' : ''}
      ${finished && next ? `<a class="secondary" href="#${next.route}">Continue course →</a>` : ''}
    </div>` : `<p class="intro">This lesson unlocks after you complete ${escapeHtml(next.title)}.</p>
      <a class="primary" href="#${next.route}">Go to ${escapeHtml(next.title)} →</a>`;
  return `<div class="course-shell">
    <h1 class="page-title">${group.number ? `Chapter ${group.number} · ${german(group.title)}` : group.title}</h1>
    <p class="intro">${group.intro}</p>
    <div class="workspace">
      <nav class="topics" aria-label="Lessons">
        ${group.lessons.map(item => `<a href="#${item.route}" ${item === lesson ? 'aria-current="page"' : ''}>
          ${item.index + 1}. ${item.title}
          ${passed.has(item.route) ? '<span aria-label="Complete">✓</span>' : unlocked(item) ? '' : '<small>Locked</small>'}
        </a>`).join('')}
      </nav>
      <section class="activity lesson-main">
        <div class="lesson-heading">
          <h2>${title}</h2>
          ${open && !finished ? '<button type="button" class="secondary" data-course="test">Test out</button>' : ''}
        </div>
        ${view}
      </section>
    </div>
  </div>`;
}

function storyPage(index) {
  const scene = storyScenes[index];
  const number = index + 1;
  const quizSection = {
    ...scene,
    title: scene.quizTitle || 'What happened in this scene?',
    keys: scene.questions.map((_, question) => questionKey(`wg-${index}`, question)),
  };
  return `<h1 class="page-title" lang="de">Die Netzwerk-WG</h1>
    <p class="intro">WG stands for ${german('Wohngemeinschaft')}, a shared apartment. Read each German line with its English translation underneath, then try the scene quiz.</p>
    <div class="story-reader">
      <div class="story-picker">
        <label for="story-scene">Choose a scene</label>
        <select id="story-scene">
          ${Array.from({ length: 6 }, (_, i) => `<optgroup label="Chapter ${i + 1}">
            ${storyScenes.map((item, sceneIndex) => item.chapter !== i + 1 ? '' :
              `<option value="${sceneIndex + 1}" ${sceneIndex === index ? 'selected' : ''}>${sceneIndex + 1}. ${escapeHtml(item.title)}</option>`).join('')}
          </optgroup>`).join('')}
        </select>
      </div>
      <section class="activity" aria-labelledby="scene-title">
        <h2 id="scene-title">Scene ${number} · ${escapeHtml(scene.title)}</h2>
        <ol class="dialogue" role="list">
          ${scene.lines.map(([speaker, line, translation]) => {
            const portrait = speakerPortraits[speaker.split(' (')[0]];
            return `<li>
              ${portrait ? `<img class="speaker-portrait" src="photos/${portrait}.webp" alt="" width="48" height="48">` : ''}
              <div class="dialogue-copy">
                <strong>${escapeHtml(speaker)}</strong>
                <p lang="de">${escapeHtml(line)}</p>
                <p class="translation">${escapeHtml(translation)}</p>
              </div>
            </li>`;
          }).join('')}
        </ol>
        ${scene.note ? `<p class="hint">${escapeHtml(scene.note)}</p>` : ''}
      </section>
      <details class="story-quiz">
        <summary class="primary">Start scene quiz</summary>
        ${exercise('Scene quiz', [quizSection], `wg-scene-${index}`)}
      </details>
      <nav class="story-steps" aria-label="Scene navigation">
        ${index > 0 ? `<a class="secondary" href="#wg-story/${number - 1}">← Previous scene</a>` : ''}
        ${number < storyScenes.length ? `<a class="secondary" href="#wg-story/${number + 1}">Next scene →</a>` : ''}
      </nav>
    </div>
    <details class="story-cast">
      <summary>Meet the roommates</summary>
      <div class="people">${roommates.map(([name, bio, translation]) => `<article class="person">
        <img src="photos/${speakerPortraits[name]}.webp" alt="" width="162" height="184">
        <h2>${name}</h2><p lang="de">${bio}</p><p class="translation">${translation}</p>
      </article>`).join('')}</div>
    </details>
    <p class="reference-source">Practice dialogues adapted from ${german('Netzwerk neu A1')}, Chapters 1–6. Portraits from the coursebook, © Ernst Klett Sprachen.
      <a href="${storySource}" target="_blank" rel="noopener">Klett’s original German transcript (PDF)</a>
    </p>`;
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

const player = new Audio();
let playback = 0;
const slowRate = .72;
let audioRate = 1;

function stopAudio() {
  playback++;
  player.pause();
}

function focusContent() {
  window.scrollTo(0, 0);
  content.focus({ preventScroll: true });
}

function showLesson(moveFocus = true) {
  quiz = null;
  referenceLink.hidden = false;
  content.innerHTML = lessonPage(currentLesson);
  const selected = content.querySelector('.topics [aria-current="page"]');
  const topics = selected.parentElement;
  topics.scrollLeft = selected.offsetLeft - (topics.clientWidth - selected.offsetWidth) / 2;
  if (moveFocus) focusContent();
}

function showPage(moveFocus = true) {
  const requested = location.hash.slice(1);
  const showReference = requested === 'cheat-sheet';
  if (showReference && quiz) {
    history.replaceState(null, '', '#' + currentPage);
    return;
  }
  const route = showReference ? (currentPage || 'home') : requested;
  const group = courseGroups.find(group => group.route === route);
  const lesson = group ? group.lessons.find(lesson => !passed.has(lesson.route)) || group.lessons[0] :
    coursePath.find(lesson => lesson.route === route);
  const storyRoute = route.match(/^wg-story(?:\/([1-9]\d*))?$/);
  const scene = storyRoute ? Math.min(Number(storyRoute[1] || 1), storyScenes.length) : 0;
  const page = lesson?.route || (scene ? `wg-story/${scene}` : route === 'daily-drill' ? route : 'home');
  if (page !== currentPage) {
    stopAudio();
    referenceLink.hidden = false;
    currentPage = page;
    currentLesson = lesson;
    quiz = null;
    if (lesson) {
      showLesson(false);
    } else {
      content.innerHTML = scene ? storyPage(scene - 1) : page === 'daily-drill' ? drillPage() : homePage();
    }
    const parentPage = lesson?.group.route || (scene ? 'wg-story' : page);
    document.querySelectorAll('.header-inner nav a').forEach(link => {
      if (link.hash === `#${parentPage}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    updateProgress();
    if (moveFocus && !showReference) focusContent();
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
reference.addEventListener('click', event => {
  if (event.target !== reference) return;
  const bounds = reference.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) reference.close();
});
window.addEventListener('hashchange', () => showPage());
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  focusContent();
});
showPage(false);

const progressOptions = document.querySelector('.progress-options');
document.querySelector('#reset-progress').addEventListener('click', () => {
  progressOptions.open = false;
  if (!window.confirm('Reset all XP and completed lessons? You will start again from the first lesson.')) {
    document.querySelector('#xp').focus();
    return;
  }
  try {
    localStorage.removeItem(progressKey);
    localStorage.removeItem(courseKey);
  } catch {
    window.alert('Progress could not be cleared. Check your browser storage settings and try again.');
    return;
  }
  stopAudio();
  location.hash = 'home';
  location.reload();
});
document.addEventListener('click', event => {
  if (!progressOptions.contains(event.target)) progressOptions.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && progressOptions.open) {
    progressOptions.open = false;
    document.querySelector('#xp').focus();
  }
});

function normalize(value) {
  return value.normalize('NFC').trim().toLocaleLowerCase('de').replace(/\s+/g, ' ').replace(/[.!?]$/, '');
}

function isAnswerCorrect(answer, expected) {
  return [expected].flat().some(word => normalize(word) === normalize(answer));
}

function pickOptions(question) {
  const others = question.choices.filter(option => option !== question.answer);
  return shuffle([question.answer, ...shuffle(others).slice(0, 3)]);
}

function startQuiz(test) {
  if (!currentLesson || !unlocked(currentLesson)) return;
  const bank = lessonQuestions(currentLesson);
  const questions = shuffle(sampleQuestions(bank, test ? 10 : 8));
  quiz = { test, questions, total: questions.length, index: 0, correct: [], waiting: false };
  renderQuiz();
}

function renderQuiz() {
  stopAudio();
  referenceLink.hidden = true;
  const { questions, index, total, test } = quiz;
  const question = questions[index];
  const isNumber = /^\d+$/.test(question.prompt);
  let response;
  if (question.order) {
    response = ordering([question.prompt, question.answer, question.hint], 0, 'quiz', false, question.english ? 'en' : 'de');
  } else if (question.choices) {
    response = `<fieldset class="quiz-options"><legend class="visually-hidden">Choose an answer</legend>
      ${pickOptions(question).map(choice => `<label><input type="radio" name="answer" value="${escapeHtml(choice)}">
        ${german(choice)}</label>`).join('')}</fieldset>`;
  } else {
    response = '<label for="quiz-answer" class="visually-hidden">Your answer</label><input id="quiz-answer" lang="de" type="text" name="answer" placeholder="Type your answer" autocomplete="off" spellcheck="false">';
  }
  const label = `Question ${index + 1} of ${total} · 80% to pass`;
  content.innerHTML = `<section class="activity quiz-card">
    <div class="lesson-heading">
      <p>${test ? 'Test out' : 'Practice'} · ${currentLesson.title}</p>
      <button class="secondary" type="button" data-course="learn">Back to lesson</button>
    </div>
    <p id="quiz-progress">${label}</p>
    <progress aria-labelledby="quiz-progress" max="${total}" value="${index}"></progress>
    <h1>${question.heading}</h1>
    <form class="quiz-form">
      ${question.picture ? `<img class="quiz-photo" src="${question.picture}" alt="${escapeHtml(question.prompt)}">` :
        question.prompt && !question.order ? `<p class="quiz-prompt${isNumber ? ' quiz-number' : ''}">${isNumber || question.english ?
          escapeHtml(question.prompt) : german(question.prompt)}</p>` : ''}
      ${question.instruction ? `<p class="question-direction">${escapeHtml(question.instruction)}</p>` : ''}
      ${question.audio ? `<div class="row" role="group" aria-label="Play audio">
        <button class="tile" type="button" data-say="${escapeHtml(question.audio)}" data-rate="1">Play normal</button>
        <button class="tile" type="button" data-say="${escapeHtml(question.audio)}" data-rate="${slowRate}">Play slow</button>
        </div>
        <p class="status audio-status" role="status"></p>` : ''}
      ${response}
      ${test ? '' : questionHint('this question', question.order ? question.answer.join(' ') : question.answer, question.hint)}
      <p class="status quiz-feedback" role="status"></p>
      <button class="primary" type="submit">${test ? 'Submit answer' : 'Check answer'}</button>
    </form>
  </section>`;
  focusContent();
  const replay = content.querySelector(`.quiz-form [data-rate="${audioRate}"]`);
  if (replay) speak(replay);
}

function advanceQuiz() {
  quiz.index++;
  quiz.waiting = false;
  if (quiz.index < quiz.questions.length) renderQuiz();
  else finishQuiz();
}

function gradeQuiz(form) {
  if (quiz.waiting) {
    advanceQuiz();
    return;
  }
  const question = quiz.questions[quiz.index];
  const submitted = question.order ? form.querySelector('[data-answer]').value : new FormData(form).get('answer');
  const answer = submitted?.trim();
  const feedback = form.querySelector('.quiz-feedback');
  if (!answer) {
    feedback.textContent = 'Give an answer to continue.';
    return;
  }
  const expected = question.order ? [question.answer.join(' ')] : [question.answer].flat();
  const ok = isAnswerCorrect(answer, expected);
  if (ok) quiz.correct.push(question.id);
  if (quiz.test) {
    advanceQuiz();
    return;
  }
  if (ok) {
    solved.add(`quiz-${currentLesson.prefix}-${question.id}`);
    rememberProgress();
  }
  quiz.waiting = true;
  feedback.dataset.result = ok ? 'correct' : 'wrong';
  feedback.innerHTML = ok ? 'Correct!' : `Correct answer: ${german(expected[0])}`;
  form.querySelectorAll('input, [data-word]').forEach(control => { control.disabled = true; });
  const submit = form.querySelector('[type="submit"]');
  submit.textContent = 'Continue';
  submit.focus();
}

function finishQuiz() {
  stopAudio();
  const { test, correct, total } = quiz;
  const success = correct.length >= Math.ceil(total * .8);
  const reviewing = passed.has(currentLesson.route);
  if (success && !passed.has(currentLesson.route)) {
    passed.add(currentLesson.route);
    rememberCourse();
  }
  if (test && success) {
    correct.forEach(id => solved.add(`quiz-${currentLesson.prefix}-${id}`));
    rememberProgress();
  }
  updateProgress();
  const next = nextLesson();
  const heading = success ? 'Lesson complete' : test ? 'Test not passed' : reviewing ? 'Review complete' : 'Practice complete';
  const goal = test ? ' Score at least 80% to test out.' : reviewing ?
    ' Score at least 80% to pass this review.' : ' Score at least 80% to unlock the next lesson.';
  const action = !success ? `<button class="primary" type="button" data-course="${test ? 'test' : 'practice'}">Try again</button>` :
    next ? `<a class="primary" href="#${next.route}">Next: ${next.title} →</a>` : '<a class="primary" href="#home">Back to home</a>';
  quiz = null;
  referenceLink.hidden = false;
  content.innerHTML = `<section class="activity quiz-card">
    <h1>${heading}</h1>
    <p>${correct.length} of ${total} correct.${success ? '' : goal}</p>
    <div class="row lesson-actions">${action}
      <button class="secondary" type="button" data-course="learn">${success ? 'Back to lesson' : 'Review the lesson'}</button></div>
  </section>`;
  focusContent();
}

function checkAnswers(form) {
  const inputs = [...form.querySelectorAll('[data-answer]')];
  let correct = 0;
  let unanswered = 0;
  inputs.forEach(input => {
    const expected = [JSON.parse(input.dataset.answer)].flat();
    const answer = input.value.trim();
    const ok = isAnswerCorrect(answer, expected);
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

function clearFeedback(input) {
  if (!input.dataset.key) return;
  const message = document.getElementById(`feedback-${input.dataset.key}`);
  message.textContent = '';
  message.removeAttribute('data-result');
  const control = input.type === 'hidden' ? input.parentElement.querySelector('.noun, .order-output') : input;
  control?.removeAttribute('aria-invalid');
  input.closest('form').querySelector('.score-status')?.replaceChildren();
}

content.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (form.matches('.quiz-form')) {
    gradeQuiz(form);
  } else if (form.matches('.exercise')) {
    checkAnswers(form);
  } else if (form.matches('.registration')) {
    form.querySelectorAll('input[type="text"]').forEach(input => {
      input.setCustomValidity(input.value.trim() ? '' : 'Please fill in this field.');
    });
    if (!form.reportValidity()) return;
    solved.add(form.dataset.registration);
    const status = form.querySelector('.status');
    status.innerHTML = `Practice form complete! ${german(form.querySelector('#course').value)} on ${german(form.querySelector('#course-day').value)}.`;
    status.dataset.result = 'correct';
    rememberProgress();
  }
});

function speak(button) {
  const status = button.closest('form, .lesson')?.querySelector('.audio-status');
  const request = ++playback;
  if (status) status.textContent = '';
  if (button.dataset.rate) audioRate = Number(button.dataset.rate);
  const source = new URL(audioFile(button.dataset.say) + '?v=2', document.baseURI).href;
  if (player.src === source) player.currentTime = 0;
  else player.src = source;
  player.defaultPlaybackRate = audioRate;
  player.playbackRate = audioRate;
  player.play().catch(error => {
    if (request === playback && status?.isConnected) {
      const action = button.textContent.trim();
      status.textContent = error.name === 'NotAllowedError' ?
        `Select “${action}” to play the audio.` : `The audio could not play. Select “${action}” to try again.`;
    }
  });
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
  const input = order.querySelector('input');
  input.value = [...output.children].map(word => word.textContent).join(' ');
  clearFeedback(input);
}

function putInBucket(noun, bucket, moveFocus = false) {
  const fieldset = bucket.closest('fieldset');
  if (!noun || noun.closest('fieldset') !== fieldset) return;
  const input = document.getElementById(noun.dataset.noun);
  input.value = bucket.dataset.bucket;
  clearFeedback(input);
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
  const courseAction = button.dataset.course;
  if (courseAction === 'practice' || courseAction === 'test') {
    startQuiz(courseAction === 'test');
  } else if (courseAction === 'learn') {
    stopAudio();
    showLesson();
  } else if (courseAction === 'extra' && passed.has(currentLesson?.route)) {
    stopAudio();
    const { title, sections, prefix } = currentLesson;
    content.innerHTML = `<div class="quiz-card"><div class="row">
      <button class="secondary" type="button" data-course="learn">Back to lesson</button>
    </div>${exercise(title, sections, prefix)}</div>`;
    focusContent();
  } else if (button.matches('[data-drill]')) {
    newDrill();
    if (currentPage === 'daily-drill') {
      content.innerHTML = drillPage();
      focusContent();
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
  clearFeedback(input);
  input.closest('.registration')?.querySelector('.status').replaceChildren();
  if (input.name === 'audio-speed') {
    audioRate = Number(input.value);
    player.playbackRate = audioRate;
  } else if (input.id === 'story-scene') {
    location.hash = `wg-story/${input.value}`;
  } else if (input.id === 'hobby' || input.id === 'preference') {
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
