// Questions are [prompt, answer, optional English hint].
// An array in the answer slot holds alternatives, or the tiles for an ordering exercise.
const numbersTo20 = 'null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig'.split(' ');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const letterAudio = letter => 'letter-' + letter.toLowerCase();
const alphabetGuide = [
  ['A', '“ah,” as in father'],
  ['B', '“beh,” with one steady vowel'],
  ['C', '“tsey” with the ts in cats. Keep the vowel steady.'],
  ['D', '“deh,” with the same vowel as “beh”'],
  ['E', '“eh,” held steady'],
  ['F', '“eff”'],
  ['G', '“geh,” with the hard g in go'],
  ['H', '“hah,” with a clear h'],
  ['I', '“ee,” as in see'],
  ['J', '“yot,” starting with the y in yes'],
  ['K', '“kah”'],
  ['L', '“ell”'],
  ['M', '“em”'],
  ['N', '“en”'],
  ['O', '“oh,” held steady'],
  ['P', '“peh,” with the same vowel as “beh”'],
  ['Q', '“koo,” as in cool without the l'],
  ['R', '“err,” with a German r'],
  ['S', '“ess”'],
  ['T', '“teh,” with the same vowel as “beh”'],
  ['U', '“oo,” as in food'],
  ['V', '“fow,” rhyming with cow'],
  ['W', '“veh,” starting with English v'],
  ['X', '“icks”'],
  ['Y', '“IP-si-lon” with rounded lips for the first vowel'],
  ['Z', '“tsett,” starting with the ts in cats'],
];

function audioFile(spoken) {
  const name = spoken.toLowerCase().replaceAll('ß', 'ss').normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return 'audio/' + name + '.mp3';
}
const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const hobbies = ['fotografieren', 'singen', 'kochen', 'schwimmen', 'reisen', 'tanzen', 'joggen', 'lesen'];
const preferenceRatings = [
  'nicht so gern (not much)', 'es geht so (it’s okay)', 'gern (I like it)', 'sehr gern (I really like it)',
];
const comingFromRule = 'Aus means “from” and puts the following article in the dative. Most countries have no article (aus Deutschland). Feminine die becomes der (aus der Ukraine). Plural die becomes den (aus den Niederlanden).';
const conjugation = {
  sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'],
  heißen: ['heiße', 'heißt', 'heißt', 'heißen', 'heißt', 'heißen'],
  kommen: ['komme', 'kommst', 'kommt', 'kommen', 'kommt', 'kommen'],
  wohnen: ['wohne', 'wohnst', 'wohnt', 'wohnen', 'wohnt', 'wohnen'],
  sprechen: ['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht', 'sprechen'],
  kochen: ['koche', 'kochst', 'kocht', 'kochen', 'kocht', 'kochen'],
  arbeiten: ['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten'],
  lesen: ['lese', 'liest', 'liest', 'lesen', 'lest', 'lesen'],
  haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
};

const basics = [
  {
    title: 'The alphabet A–Z',
    teaching: [{
      title: 'How to say every letter',
      text: 'Listen to each letter and repeat its German name. The pronunciation notes describe the letter names, which can differ from the sounds letters make inside words.',
      translationHeading: 'Sounds like',
      examples: alphabetGuide.map(([letter, sound]) => [letter, sound, letterAudio(letter)]),
    }],
    sections: [],
  },
  {
    title: 'Numbers 0–10',
    teaching: [{
      title: 'Count in German',
      text: 'Start at null (zero). Say each number out loud, then try counting from one to ten.',
      translationHeading: 'Number',
      examples: numbersTo20.slice(0, 11).map((word, number) => [word, String(number)]),
    }],
    sections: [],
  },
  {
    title: 'Everyday words',
    teaching: [{
      title: 'Six words you can use right away',
      text: 'Start with yes and no. Bitte can mean “please” when asking for something or “you’re welcome” after danke.',
      examples: [
        ['ja', 'yes'], ['nein', 'no'], ['bitte', 'please / you’re welcome'], ['danke', 'thank you'],
        ['ich', 'I'], ['du', 'you, when talking to one person informally'],
      ],
    }],
    sections: [],
  },
  {
    title: 'Hello and goodbye',
    teaching: [{
      title: 'Greet someone and say goodbye',
      text: 'Hallo is a handy hello. The other greetings depend on the time of day. Tschüss is a casual goodbye.',
      examples: [
        ['Hallo!', 'Hello!'], ['Guten Morgen!', 'Good morning!'], ['Guten Tag!', 'Good day!'],
        ['Guten Abend!', 'Good evening!'], ['Tschüss!', 'Bye!'],
      ],
    }],
    sections: [],
  },
  {
    title: 'Name and hometown',
    teaching: [{
      title: 'Introduce yourself in two sentences',
      text: 'Ich means “I.” Use Ich bin followed by your name, and Ich komme aus followed by the city you’re from.',
      examples: [
        ['Ich bin Anthony.', 'I am Anthony.'],
        ['Ich komme aus Berlin.', 'I am from Berlin.'],
        ['Ich bin Emma. Ich komme aus Paris.', 'I am Emma. I am from Paris.'],
      ],
    }],
    sections: [
      { title: 'Fill in the missing word.', promptLanguage: 'en', choices: ['bin', 'komme', 'aus'], questions: [
        ['I am Emma. → Ich … Emma.', 'bin', 'Ich bin means “I am.”'],
        ['I am from Paris. → Ich komme … Paris.', 'aus', 'Aus means “from.”'],
      ] },
    ],
  },
];

const chapters = [
  {
    title: 'Guten Tag!',
    intro: 'Greetings, the alphabet, numbers through 20, countries, languages, and your first verbs.',
    modules: [
      {
        title: 'Greetings and introductions',
        teaching: [
          {
            title: 'Choose a greeting',
            text: 'Hallo works with friends and classmates. Guten Tag is a polite greeting you can use with someone you’ve just met.',
            examples: [
              ['Hallo, Emma!', 'Hi, Emma!'],
              ['Guten Tag, Herr Fischer!', 'Good day, Mr. Fischer!'],
              ['Tschüss!', 'Bye! (casual)'],
              ['Auf Wiedersehen!', 'Goodbye! (polite)'],
            ],
          },
          {
            title: 'Ask how someone is',
            text: 'Du is the informal “you.” Sie, with a capital S, is the formal “you.” Dir and Ihnen are the corresponding forms in these greetings.',
            examples: [
              ['Wie geht’s dir?', 'How are you? (informal)'],
              ['Wie geht es Ihnen?', 'How are you? (formal)'],
              ['Gut, danke. Und dir?', 'Good, thanks. And you? (informal)'],
              ['Gut, danke. Und Ihnen?', 'Good, thanks. And you? (formal)'],
            ],
          },
        ],
        sections: [
          { title: 'Is the greeting formal or informal?', hint: 'Both mean “you.” Use informal du with friends and family. Use formal Sie in polite situations, such as addressing someone by title and last name.', choices: ['Informell (du)', 'Formell (Sie)'], questions: [
            ['Hallo, Mia! Wie geht’s dir?', 'Informell (du)', 'Hi, Mia! How are you? Notice the first name and casual greeting.'],
            ['Guten Tag, Herr Berg. Wie geht es Ihnen?', 'Formell (Sie)', 'Good day, Mr. Berg. How are you? Herr means “Mr.”'],
            ['Tschüss, Ben! Bis morgen!', 'Informell (du)', 'Bye, Ben! See you tomorrow! Notice the first name.'],
            ['Entschuldigung, wie heißen Sie?', 'Formell (Sie)', 'Excuse me, what’s your name? Look for the capitalized pronoun.'],
          ] },
          { title: 'Complete the conversations.', hint: 'Type the missing word. “How are you?” is Wie geht’s dir? with a friend and Wie geht es Ihnen? in a formal conversation.', questions: [
            ['Hallo, Mia! Wie geht’s …?', 'dir'],
            ['Sehr gut, danke! Und …? (du)', 'dir'],
            ['Guten Tag, Frau Schulz. Wie geht es …?', 'Ihnen'],
            ['Danke, gut! Und …? (Sie)', 'Ihnen'],
          ] },
        ],
      },
      {
        title: 'Alphabet, numbers, and email',
        teaching: [
          {
            title: 'Listen for these letter names',
            assess: true,
            text: 'When you spell a name or an email address, use the German letter names. V, W, and Z can be easy to mix up.',
            translationHeading: 'Sounds like',
            examples: alphabetGuide.filter(([letter]) => 'VWZ'.includes(letter))
              .map(([letter, sound]) => [letter, sound, letterAudio(letter)]),
          },
          {
            title: 'Count past ten',
            assess: true,
            text: 'Eleven and twelve have their own names. From thirteen to nineteen, listen for the ending -zehn.',
            translationHeading: 'Number',
            examples: numbersTo20.slice(11).map((word, index) => [word, String(index + 11)]),
          },
          {
            title: 'Spell an email address',
            assess: true,
            text: 'Say each letter separately. For mia.n@example.de, say “M I A, Punkt, N, ät, E X A M P L E, Punkt, D E.” Listen for these symbols:',
            translationHeading: 'Symbol',
            examples: [['Unterstrich', '_ (underscore)'], ['ät', '@ (at sign)'], ['minus', '- (hyphen)'], ['Punkt', '. (dot)']],
          },
        ],
        sections: [
          { title: 'Listen to the alphabet', hint: 'Choose a letter to hear its name in German.', kind: 'audio', items: alphabet.map(letter => [letter, letterAudio(letter)]) },
          { title: 'Listen to numbers from 0 to 20', kind: 'audio', items: numbersTo20.map((word, number) => [number, word]) },
          { title: 'Email dictation', kind: 'dictation', hint: 'Listen, then type the email address. You can use symbols or write out their German names: _ = Unterstrich, @ = ät, - = minus, . = Punkt.', questions: [
            ['l e a, Unterstrich, k, ät, m a i l, Punkt, d e', ['lea_k@mail.de', 'lea unterstrich k ät mail punkt de'], 'The first part uses an underscore. The address ends in .de.'],
            ['t o m, minus, b, ät, p o s t, Punkt, d e', ['tom-b@post.de', 'tom minus b ät post punkt de'], 'The first part uses a hyphen. The address ends in .de.'],
          ] },
        ],
      },
      {
        title: 'Countries and languages',
        teaching: [
          {
            title: 'Say where you’re from and what you speak',
            text: 'Use Ich komme aus for where you’re from. Use Ich spreche for a language you speak.',
            examples: [
              ['Ich komme aus Berlin.', 'I’m from Berlin.'],
              ['Ich komme aus Paris.', 'I’m from Paris.'],
              ['Ich spreche Deutsch.', 'I speak German.'],
              ['Ich spreche Französisch.', 'I speak French.'],
            ],
          },
          {
            title: 'Use the right article after aus',
            text: comingFromRule,
            examples: [
              ['aus Frankreich', 'from France'],
              ['aus der Schweiz', 'from Switzerland'],
              ['aus den USA', 'from the USA'],
            ],
          },
          {
            title: 'Learn some countries and languages',
            text: 'The words for a country and its language are often related, but there are exceptions. In Brazil, for example, the main language is Portuguese.',
            examples: [
              ['Österreich · Deutsch', 'Austria · German'], ['Spanien · Spanisch', 'Spain · Spanish'],
              ['Japan · Japanisch', 'Japan · Japanese'], ['die Türkei · Türkisch', 'Türkiye · Turkish'],
              ['Brasilien · Portugiesisch', 'Brazil · Portuguese'], ['Polen · Polnisch', 'Poland · Polish'],
            ],
          },
        ],
        sections: [
          { title: 'Match each country to a language.', kind: 'matching', choices: ['Deutsch', 'Spanisch', 'Japanisch', 'Türkisch', 'Portugiesisch', 'Polnisch'], questions: [
            ['Österreich', 'Deutsch', 'Österreich means Austria.'], ['Spanien', 'Spanisch', 'Spanien means Spain.'], ['Japan', 'Japanisch'],
            ['die Türkei', 'Türkisch', 'Die Türkei means Türkiye.'], ['Brasilien', 'Portugiesisch', 'Brasilien means Brazil. Its official language also comes from a country in Europe.'], ['Polen', 'Polnisch', 'Polen means Poland.'],
          ] },
          { title: 'Type the words that go after aus.', lesson: comingFromRule, questions: [
            ['Ich komme aus … (Spanien).', 'Spanien', 'There is no article before Spanien.'],
            ['Ich komme aus … (die Schweiz).', 'der Schweiz', 'Die Schweiz is feminine singular. Change its article.'],
            ['Ich komme aus … (die Türkei).', 'der Türkei', 'Die Türkei is feminine singular. Change its article.'],
            ['Ich komme aus … (die USA).', 'den USA', 'Die USA is plural. Use the plural dative article.'],
          ] },
        ],
      },
      {
        title: 'Verb forms and word order',
        teaching: [
          {
            title: 'Meet five useful verbs',
            text: 'Start with ich (I). A different subject often changes the verb ending. For example, ich lerne (I learn) becomes du lernst (you learn). Sein is irregular: ich bin, du bist.',
            examples: [
              ['Ich bin müde.', 'I am tired.'],
              ['Ich heiße Emma.', 'My name is Emma.'],
              ['Ich komme aus Paris.', 'I am from Paris.'],
              ['Ich wohne in Berlin.', 'I live in Berlin.'],
              ['Ich spreche Deutsch.', 'I speak German.'],
            ],
          },
          {
            title: 'Put the verb second',
            text: 'In a simple statement, put the subject first. In a question with a question word, put that word or phrase first. The verb comes right after it.',
            examples: [['Du wohnst in Berlin.', 'You live in Berlin.'], ['Wo wohnst du?', 'Where do you live?']],
          },
        ],
        sections: [
          {
            title: 'Fill in the correct verb forms.',
            hint: 'Each row is a person: ich (I), du (you, informal), er/sie (he/she), Sie (you, formal). Each column is a verb.',
            lesson: 'Regular verbs change endings with the subject: ich lerne, du lernst, er/sie lernt, Sie lernen. Sein (to be) has irregular forms. For example, “I am” is ich bin.',
            kind: 'verbs',
            verbs: ['sein', 'heißen', 'kommen', 'wohnen', 'sprechen'],
            persons: [['ich', 0], ['du', 1], ['er/sie', 2], ['Sie', 5]],
          },
          { title: 'Put the words in order. The verb goes second.', kind: 'order', promptLanguage: 'en', lesson: 'Start a W-question with its question word or phrase: Woher kommst du? (Where are you from?) Start these statements with the subject: Wir lernen Deutsch. (We’re learning German.)', questions: [
            ['Where do you live?', ['Wo', 'wohnst', 'du?'], 'Wo means “where.”'],
            ['Which languages do you speak?', ['Welche Sprachen', 'sprichst', 'du?'], 'The question phrase goes first.'],
            ['I come from Spain.', ['Ich', 'komme', 'aus Spanien.'], 'Start with “I.”'],
            ['Anna lives in Hanover.', ['Anna', 'wohnt', 'in Hannover.'], 'Start with the person.'],
          ] },
        ],
      },
    ],
  },
  {
    title: 'Freunde, Kollegen und ich',
    intro: 'Hobbies, days of the week, jobs, articles, plurals, and numbers from 20 onward.',
    modules: [
      {
        title: 'Hobbies and preferences',
        teaching: [
          {
            title: 'Learn the hobby words',
            examples: [
              ['fotografieren', 'to take photos'], ['singen', 'to sing'], ['kochen', 'to cook'], ['schwimmen', 'to swim'],
              ['reisen', 'to travel'], ['tanzen', 'to dance'], ['joggen', 'to jog'], ['lesen', 'to read'],
            ],
          },
          {
            title: 'Say what you like doing',
            assess: true,
            text: 'Put gern after the verb to say you like doing something. Use sehr gern for “really like” and nicht so gern for “don’t really like.”',
            examples: [
              ['Ich koche gern.', 'I like cooking.'],
              ['Ich schwimme sehr gern.', 'I really like swimming.'],
              ['Ich jogge nicht so gern.', 'I don’t really like jogging.'],
              ['Es geht so.', 'It’s okay.'],
            ],
          },
        ],
        sections: [
          { title: 'Choose the verb that matches each photo.', kind: 'pictures', choices: hobbies, questions: [
            ['A person with a book', 'lesen'], ['A camera photographing flowers', 'fotografieren'],
            ['A person singing into a microphone', 'singen'], ['A person in a swimming pool', 'schwimmen'],
            ['A person with a suitcase', 'reisen'], ['A person cooking at a stove', 'kochen'],
            ['A person on a dance floor', 'tanzen'], ['A person jogging', 'joggen'],
          ] },
          { title: 'How much do you like it?', kind: 'preference', hint: 'Pick a hobby, then move the slider to choose how much you enjoy it.' },
        ],
      },
      {
        title: 'Weekdays and making plans',
        teaching: [
          {
            title: 'Learn the days of the week',
            text: 'Start the week with Montag. To say “on” a day, put am before it, as in am Montag.',
            examples: weekdays.map((day, index) => [day, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]]),
          },
          {
            title: 'Invite someone and pick a day',
            text: 'Start with an invitation, suggest a day, and say whether it works for you.',
            examples: [
              ['Gehen wir ins Café?', 'Shall we go to the café?'],
              ['Am Samstag?', 'On Saturday?'],
              ['Ja, gern!', 'Yes, I’d love to!'],
              ['Ja, super!', 'Yes, great!'],
              ['Nein, das geht leider nicht.', 'No, unfortunately that doesn’t work.'],
            ],
          },
        ],
        sections: [
          { title: 'Put the seven days of the week in order.', kind: 'order', promptLanguage: 'en', questions: [['Start with Monday.', weekdays, 'Montag is Monday. Dienstag is Tuesday, and Sonntag is Sunday.']] },
          { title: 'Make plans with Mia.', kind: 'chat', hint: 'Choose a reply for each message. Open Hint for a translation.', choices: ['Ja, gern!', 'Am Freitag?', 'Nein, das geht leider nicht.', 'Ja, super!'], questions: [
            ['Gehen wir ins Kino?', 'Ja, gern!', '“Shall we go to the movies?”', 'Say you’d love to go.'],
            ['Wann gehen wir?', 'Am Freitag?', '“When shall we go?”', 'Suggest Friday.'],
            ['Geht es um 18 Uhr?', 'Nein, das geht leider nicht.', '“Does 6 p.m. work?”', 'Say that 6 p.m. doesn’t work for you.'],
            ['Dann um 20 Uhr?', 'Ja, super!', '“Then at 8 p.m.?”', 'Say that 8 p.m. works for you.'],
          ] },
        ],
      },
      {
        title: 'Jobs, articles, and plurals',
        teaching: [
          {
            title: 'Learn each noun with its article',
            text: 'Der, das, and die all mean “the.” Learn the article together with each noun. In the plural, the article is always die. The noun itself may also change, for example das Buch → die Bücher.',
            examples: [
              ['der Stift', 'the pen'], ['das Buch', 'the book'], ['die Tablette', 'the pill'],
              ['das Auto', 'the car'], ['die Rechnung', 'the bill'], ['der Schlüssel', 'the key'],
            ],
          },
          {
            title: 'Talk about jobs',
            text: 'Many job titles add -in for the feminine form. Arzt also changes its vowel to ä. Compare these pairs:',
            examples: [
              ['der Arzt / die Ärztin', 'doctor'],
              ['der Kellner / die Kellnerin', 'waiter / waitress'],
              ['der Lehrer / die Lehrerin', 'teacher'],
              ['der Krankenpfleger / die Krankenpflegerin', 'nurse'],
            ],
          },
          {
            title: 'Recognize common plural endings',
            text: 'Some plurals add -e, -en, or -s. Others add -er and may change a vowel. Learn each noun with its plural.',
            examples: [
              ['der Arzt → die Ärzte', 'doctor → doctors'],
              ['die Tablette → die Tabletten', 'pill → pills'],
              ['das Auto → die Autos', 'car → cars'],
              ['das Buch → die Bücher', 'book → books'],
            ],
          },
        ],
        sections: [
          { title: 'Sort the nouns by their article.', hint: 'Drag a noun to its article, or select the noun and then choose a bucket.', lesson: 'Der, das, and die all mean “the.” Learn each singular noun with its article: der for masculine, das for neuter, and die for feminine.', kind: 'articles', questions: [
            ['Stift', 'der', 'Stift means “pen.” It is masculine.'], ['Buch', 'das', 'Buch means “book.” It is neuter.'], ['Tablette', 'die', 'Tablette means “tablet” or “pill.” It is feminine.'],
            ['Auto', 'das', 'Auto means “car.” It is neuter.'], ['Rechnung', 'die', 'Rechnung means “bill.” Nouns ending in -ung are usually feminine.'], ['Schlüssel', 'der', 'Schlüssel means “key.” It is masculine.'],
          ] },
          { title: 'Match each job to its feminine form.', hint: 'Many job titles add -in. Some also change a vowel.', choices: ['Ärztin', 'Kellnerin', 'Lehrerin', 'Krankenpflegerin'], questions: [
            ['Arzt', 'Ärztin'], ['Kellner', 'Kellnerin'],
            ['Lehrer', 'Lehrerin'], ['Krankenpfleger', 'Krankenpflegerin'],
          ] },
          { title: 'Write the plural noun.', hint: 'Type only the missing noun. Die is already provided for every plural.', questions: [
            ['der Arzt → die …', 'Ärzte'], ['das Buch → die …', 'Bücher'],
            ['die Tablette → die …', 'Tabletten'], ['das Auto → die …', 'Autos'],
          ] },
        ],
      },
      {
        title: 'Numbers and sport club',
        teaching: [
          {
            title: 'Build numbers from 20 onward',
            text: 'For two-digit numbers like 24, say the ones, then und (“and”), then the tens. For 21, 31, etc., use ein before und. For hundreds, say the hundreds part first, then build the rest the same way. Write it all as one word.',
            examples: [
              ['vierundzwanzig', '24 = four + and + twenty'],
              ['sechsundfünfzig', '56 = six + and + fifty'],
              ['dreißig / sechzig / siebzig', '30 / 60 / 70'],
              ['dreihundertfünfundvierzig', '345 = three hundred + five + and + forty'],
            ],
          },
          {
            title: 'Read the form labels',
            assess: true,
            text: 'A club form asks for your name, date of birth, address, and your preferred class and day. Use made-up details in the practice form.',
            examples: [
              ['Vorname', 'first name'], ['Familienname', 'last name'], ['Geburtsdatum', 'date of birth'],
              ['Adresse', 'address'], ['Kurs', 'class / course'], ['Tag', 'day'],
            ],
          },
        ],
        sections: [
          { title: 'Write the number as a German word.', lesson: 'For numbers like 24, put the ones first: vier + und + zwanzig makes vierundzwanzig. Write it as one word.', questions: [
            ['22', 'zweiundzwanzig'], ['36', 'sechsunddreißig'], ['71', 'einundsiebzig'],
            ['108', ['einhundertacht', 'hundertacht']], ['480', 'vierhundertachtzig'],
          ] },
          { title: 'Sportclub “Fit” practice form', kind: 'registration' },
        ],
      },
      {
        title: 'Verb changes and yes/no questions',
        teaching: [
          {
            title: 'Notice how the verb changes',
            text: 'In lesen (to read) and sprechen (to speak), the vowel changes with du and er/sie. Haben (to have) and sein (to be) have special forms to learn.',
            examples: [
              ['ich lese → du liest', 'I read → you read'],
              ['ich spreche → er spricht', 'I speak → he speaks'],
              ['du hast / wir haben', 'you have / we have'],
              ['du bist / wir sind', 'you are / we are'],
            ],
          },
          {
            title: 'Move the verb to the front for a yes/no question',
            text: 'The words can stay the same. Put the verb first and the subject second to turn a statement into a question.',
            examples: [
              ['Du wohnst in Berlin.', 'You live in Berlin.'],
              ['Wohnst du in Berlin?', 'Do you live in Berlin?'],
            ],
          },
        ],
        sections: [
          { title: 'Fill in the correct verb form.', lesson: 'Some verbs change their stem vowel with du and er/sie. For lesen (to read), ich lese becomes er liest. Haben (to have) and sein (to be) also have irregular forms.', questions: [
            ['Du … ein Buch. (lesen)', 'liest'], ['Er … Deutsch. (sprechen)', 'spricht'],
            ['Ihr … morgen frei. (haben)', 'habt'], ['Wir … im Sportclub. (sein)', 'sind'],
            ['Sie (Singular) … heute Zeit. (haben)', 'hat'], ['Du … aus Berlin. (sein)', 'bist'],
          ] },
          { title: 'Turn the statement into a yes/no question.', kind: 'order', lesson: 'Move the verb to the first position: Du wohnst hier. (You live here.) → Wohnst du hier? (Do you live here?)', questions: [
            ['Du liest gern.', ['Liest', 'du', 'gern?'], 'Ask “Do you like reading?” Start with the form of lesen.'],
            ['Ihr habt morgen Zeit.', ['Habt', 'ihr', 'morgen Zeit?'], 'Ask “Are you all free tomorrow?” Start with the form of haben.'],
            ['Wir gehen ins Kino.', ['Gehen', 'wir', 'ins Kino?'], 'Ask “Are we going to the movies?” Start with the form of gehen.'],
          ] },
        ],
      },
    ],
  },
];

const courses = {
  Basketball: ['Dienstag', 'Donnerstag'],
  Fußball: ['Mittwoch'],
  Karate: ['Montag'],
  Tennis: ['Samstag'],
  Yoga: ['Freitag'],
  Zumba: ['Montag', 'Mittwoch'],
};

// Story details checked against Klett's transcript for scenes 1–5.
const storySource = 'https://www.klett-sprachen.es/downloads/21455/netzwerk-neu-a1-transkript-videos-kursbuch-kapitel-1-6/pdf';
const roommates = [
  ['Anna', 'Aus Hannover. Sie ist neu in der WG und studiert.', 'From Hanover. She’s a student and the newest roommate.'],
  ['Bea', 'Aus Berlin. Sie zeigt Anna die Wohnung.', 'From Berlin. She shows Anna around the apartment.'],
  ['Luca', 'Aus München. Er arbeitet als Krankenpfleger.', 'From Munich. He works as a nurse.'],
  ['Max', 'Er ist oft in der Uni und schwimmt gern.', 'He’s often at the university and likes swimming.'],
];
const storyQuiz = [
  { title: 'Scene 1 · Anna arrives', choices: ['Luca', 'Bea', 'Max'], questions: [
    ['Wer bittet Anna in die Wohnung?', 'Luca', 'Who invites Anna into the apartment? Look for Komm rein! (“Come in!”) in the transcript.'],
  ] },
  { title: 'Scene 2 · Where is each roommate from?', choices: ['Berlin', 'Hannover', 'München'], questions: [
    ['Woher kommt Anna?', 'Hannover', 'Where is Anna from? Check her profile above.'],
    ['Woher kommt Bea?', 'Berlin', 'Where is Bea from? Check her profile above.'],
    ['Woher kommt Luca?', 'München', 'Where is Luca from? Munich is München in German.'],
  ] },
  { title: 'Scene 3 · Match the phone numbers to the roommates.', choices: ['0151 89944583', '0154 76895321', '0171 341226691'], questions: [
    ['Max', '0151 89944583', 'Bea shares Max’s number first in the transcript. It starts with 0151.'],
    ['Anna', '0171 341226691', 'Anna gives her own number next. It starts with 0171.'],
    ['Bea', '0154 76895321', 'Bea’s number is printed on page 16 of the textbook. It starts with 0154.'],
  ] },
  { title: 'Scene 4 · Plans to go swimming', choices: ['Freitag', 'Samstag', 'Montag'], questions: [
    ['Wann wollen Anna und Max schwimmen gehen?', 'Montag', 'When do Anna and Max want to go swimming? Max suggests the first weekday after the weekend.'],
  ] },
  { title: 'Scene 5 · Work and free time', choices: ['Anna', 'Luca', 'Anna, Max und Luca'], questions: [
    ['Wer arbeitet im Krankenhaus?', 'Luca', 'Who works at the hospital? Look at the nurse’s profile.'],
    ['Wer macht ein Praktikum?', 'Anna', 'Who is doing an internship? The roommate who is a student mentions one.'],
    ['Wer möchte am Montag zusammen schwimmen gehen?', 'Anna, Max und Luca', 'Who wants to go swimming together on Monday? Two people made the plan in Scene 4. In Scene 5, one more joins.'],
  ] },
];

const greetingsReference = [
  ['Saying hello', 'Hallo! · Guten Morgen! · Guten Tag! · Guten Abend!'],
  ['Saying goodbye', 'Tschüss! · Ciao! · Auf Wiedersehen! · Gute Nacht!'],
  ['Introducing yourself', 'Wer bist du? → Ich bin Nina. Wie heißt du? / Wie heißen Sie? / Wie ist Ihr Name? → Ich heiße Nina. / Mein Name ist Nina Weber.'],
  ['Introducing someone', 'Wer ist das? → Das ist Herr Weber. / Das ist Frau Lang.'],
  ['Where you live', 'Wo wohnst du? / Wo wohnen Sie? → Ich wohne in Frankfurt.'],
  ['Where you’re from', 'Woher kommst du? / Woher kommen Sie? → Ich komme aus Spanien.'],
  ['Languages', 'Welche Sprachen sprichst du? / Welche Sprachen sprechen Sie? → Ich spreche Deutsch.'],
  ['Phone number', 'Wie ist deine / Ihre Telefonnummer? → 0123 456789.'],
  ['E-Mail', 'Wie ist deine / Ihre E-Mail-Adresse? → lea_k@beispiel.de.'],
  ['How you’re doing', 'Wie geht’s dir? / Wie geht es Ihnen? → Danke, sehr gut. / Gut, danke. / Ganz gut. Und dir? / Und Ihnen?'],
];
const everydayReference = [
  ['Hobbies', 'Was machst du gern? / Was machen Sie gern? → Ich reise gern.'],
  ['Preferences', 'Hörst du gern Musik? / Hören Sie gern Musik? → Ja, sehr gern. · Es geht so. · Nein, nicht so gern.'],
  ['Reading and movies', 'Liest du gern? / Lesen Sie gern? Gehst du gern ins Kino? / Gehen Sie gern ins Kino?'],
  ['Making plans', 'Gehen wir ins Kino? → Ja, gern!'],
  ['Setting a day', 'Wann gehen wir? → Am Montag. / Am Freitag? → Ja, super! / Das geht leider nicht.'],
  ['Jobs', 'Was bist du von Beruf? / Was sind Sie von Beruf? → Ich bin Studentin.'],
  ['Work', 'Was machst du? / Was machen Sie? → Ich studiere.'],
  ['Work hours', 'Wann arbeitest du? / Wann arbeiten Sie? → Ich arbeite am Montag.'],
  ['Days off', 'Wann hast du frei? / Wann haben Sie frei? → Ich habe am Freitag frei.'],
];
const numberReference = [
  ...['ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'].map((unit, index) => [String(index + 21), unit + 'undzwanzig']),
  ...['dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'].map((word, index) => [String((index + 3) * 10), word]),
  ['100', '(ein)hundert'], ['200', 'zweihundert'], ['1.000', '(ein)tausend'],
  ['3.000', 'dreitausend'], ['4.520', 'viertausendfünfhundertzwanzig'],
  ['10.000', 'zehntausend'], ['74.300', 'vierundsiebzigtausenddreihundert'],
  ['100.000', '(ein)hunderttausend'], ['500.000', 'fünfhunderttausend'],
  ['1.000.000', 'eine Million'], ['1.000.000.000', 'eine Milliarde'],
];
