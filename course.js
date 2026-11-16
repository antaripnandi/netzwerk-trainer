const courseGroups = [
  { route: 'basics', title: 'German from zero', intro: 'Learn the examples, then check what you know.', topics: basics, prefix: 'b' },
  ...chapters.map((chapter, index) => ({
    route: 'kapitel-' + (index + 1),
    title: chapter.title,
    intro: chapter.intro,
    number: index + 1,
    topics: chapter.modules,
    prefix: 'c' + index,
  })),
];

for (const group of courseGroups) {
  group.lessons = group.topics.map((topic, index) => ({
    ...topic, group, index,
    route: group.route + '/' + (index + 1),
    prefix: group.prefix + '-' + index,
  }));
}
const coursePath = courseGroups.flatMap(group => group.lessons);

function vocabularyQuestions(blocks) {
  return blocks.flatMap(({ examples, translationHeading }) => {
    const choices = examples.map(([word]) => word);
    return examples.map(([word, meaning, audio]) => {
      if (translationHeading === 'Sounds like') {
        return {
          heading: 'Identify the German letter.',
          prompt: 'Which letter has the name ' + meaning.split(' · ')[0] + '?',
          answer: word, audio, choices: alphabet, hint: meaning, english: true,
        };
      }
      return {
        heading: 'Choose the German translation.',
        prompt: meaning,
        answer: word,
        choices,
        english: true,
      };
    });
  });
}

function lessonQuestions(lesson) {
  const activities = lesson.sections.flatMap(section => {
    if (section.kind === 'verbs') {
      return section.persons.flatMap(([person, index]) => section.verbs.map(verb => ({
        heading: section.title,
        prompt: person + ' · ' + verb,
        answer: conjugation[verb][index],
      })));
    }
    return (section.questions || []).map(([prompt, answer, hint]) => ({
      heading: section.title,
      prompt: section.kind === 'dictation' ? 'Listen, then type the email address.' : prompt,
      answer,
      hint,
      choices: section.kind === 'articles' ? ['der', 'das', 'die'] : section.choices,
      audio: section.kind === 'dictation' ? prompt : undefined,
      picture: section.kind === 'pictures' ? 'photos/' + answer + '.webp' : undefined,
      order: section.kind === 'order',
      english: section.promptLanguage === 'en' || section.kind === 'dictation',
    }));
  });
  const basicsLesson = lesson.group.route === 'basics';
  const examples = vocabularyQuestions(basicsLesson ? lesson.teaching : lesson.teaching.filter(block => block.assess));
  const questions = basicsLesson && lesson.index !== 4 ? examples : [...activities, ...examples];
  return questions.map((question, index) => ({ ...question, id: index + 1 }));
}

function quizRounds(questions) {
  const count = Math.ceil(questions.length / 10);
  return Array.from({ length: count }, (_, i) =>
    questions.slice(Math.floor(i * questions.length / count), Math.floor((i + 1) * questions.length / count)));
}

function testQuestions(questions) {
  const count = Math.min(10, questions.length);
  // Spread the questions across the lesson so a test checks more than its first topic.
  return Array.from({ length: count }, (_, i) => questions[Math.floor((i + Math.random()) * questions.length / count)]);
}
