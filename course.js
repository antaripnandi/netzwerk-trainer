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
          heading: 'Which letter did you hear?',
          answer: word, audio, choices: alphabet, hint: meaning,
        };
      }
      return {
        heading: translationHeading === 'Number' ? 'How do you say this number in German?' :
          translationHeading === 'Symbol' ? 'What is this symbol called in German?' : 'Choose the German translation.',
        prompt: meaning,
        answer: word,
        choices,
        english: true,
      };
    });
  });
}

function lessonQuestions(lesson) {
  const directions = {
    articles: 'Choose the article for this noun.',
    chat: 'Choose a reply to Mia.',
    dictation: 'Listen and type the email address.',
    matching: 'Choose a language spoken in this country.',
    pictures: 'Choose the German verb that matches the photo.',
  };
  const activities = lesson.sections.flatMap(section => {
    if (section.kind === 'verbs') {
      return section.persons.flatMap(([person, index]) => section.verbs.map(verb => ({
        heading: 'Type the missing form of the verb.',
        prompt: person + ' … (' + verb + ')',
        answer: conjugation[verb][index],
      })));
    }
    return (section.questions || []).map(([prompt, answer, hint, instruction]) => ({
      heading: directions[section.kind] || section.title,
      prompt: section.kind === 'dictation' ? '' : prompt,
      answer,
      hint,
      instruction,
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

function sampleQuestions(questions, limit) {
  const count = Math.min(limit, questions.length);
  // Sample from across the lesson so a short quiz still covers different topics.
  return Array.from({ length: count }, (_, i) => questions[Math.floor((i + Math.random()) * questions.length / count)]);
}
