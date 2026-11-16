// Questions are [prompt, answer, optional English hint].
// An array in the answer slot holds alternatives, or the tiles for an ordering exercise.
const numbersTo20 = 'null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig'.split(' ');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const letterNames = 'a be tse de e eff ge ha i jot ka ell emm enn o pe ku err ess te u fau we iks ypsilon tset'.split(' ');
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

const chapters = [
  {
    title: 'Guten Tag!',
    intro: 'Greetings, the alphabet, numbers through 20, countries, languages, and your first verbs.',
    modules: [
      {
        title: 'Greetings and introductions',
        sections: [
          { title: 'Du or Sie? Sort the greetings.', hint: 'Both mean “you.” Use informal du with friends and family. Use formal Sie in polite situations, such as addressing someone by title and last name.', choices: ['Informell (du)', 'Formell (Sie)'], questions: [
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
        sections: [
          { title: 'Listen to the alphabet', hint: 'Choose a letter to hear its name in German.', kind: 'audio', items: alphabet.map((letter, index) => [letter, letterNames[index]]) },
          { title: 'Listen to numbers from 0 to 20', kind: 'audio', items: numbersTo20.map((word, number) => [number, word]) },
          { title: 'Email dictation', kind: 'dictation', hint: 'Listen, then type the email address. You can use symbols or write out their German names: _ = Unterstrich, @ = ät, - = minus, . = Punkt.', questions: [
            ['l e a, Unterstrich, k, ät, m a i l, Punkt, d e', ['lea_k@mail.de', 'lea unterstrich k ät mail punkt de'], 'The first part uses an underscore. The address ends in .de.'],
            ['t o m, minus, b, ät, p o s t, Punkt, d e', ['tom-b@post.de', 'tom minus b ät post punkt de'], 'The first part uses a hyphen. The address ends in .de.'],
          ] },
        ],
      },
      {
        title: 'Countries and languages',
        sections: [
          { title: 'Match each country to a language.', kind: 'matching', choices: ['Deutsch', 'Spanisch', 'Japanisch', 'Türkisch', 'Portugiesisch', 'Polnisch'], questions: [
            ['Österreich', 'Deutsch', 'Österreich means Austria.'], ['Spanien', 'Spanisch', 'Spanien means Spain.'], ['Japan', 'Japanisch'],
            ['die Türkei', 'Türkisch', 'Die Türkei means Türkiye.'], ['Brasilien', 'Portugiesisch', 'Brasilien means Brazil. Its official language also comes from a country in Europe.'], ['Polen', 'Polnisch', 'Polen means Poland.'],
          ] },
          { title: 'Where are you from?', hint: 'Type only the words that go after aus.', lesson: comingFromRule, questions: [
            ['Ich komme aus … (Spanien).', 'Spanien', 'There is no article before Spanien.'],
            ['Ich komme aus … (die Schweiz).', 'der Schweiz', 'Die Schweiz is feminine singular. Change its article.'],
            ['Ich komme aus … (die Türkei).', 'der Türkei', 'Die Türkei is feminine singular. Change its article.'],
            ['Ich komme aus … (die USA).', 'den USA', 'Die USA is plural. Use the plural dative article.'],
          ] },
        ],
      },
      {
        title: 'Verb forms and word order',
        sections: [
          {
            title: 'Fill in the correct verb forms.',
            hint: 'Each row is a person: ich (I), du (you, informal), er/sie (he/she), Sie (you, formal). Each column is a verb.',
            lesson: 'Regular verbs change endings with the subject: ich lerne, du lernst, er/sie lernt, Sie lernen. Sein (to be) has irregular forms. For example, “I am” is ich bin.',
            kind: 'verbs',
            verbs: ['sein', 'heißen', 'kommen', 'wohnen', 'sprechen'],
            persons: [['ich', 0], ['du', 1], ['er/sie', 2], ['Sie', 5]],
          },
          { title: 'Build sentences with the verb second.', kind: 'order', lesson: 'Start a W-question with its question word or phrase: Woher kommst du? (Where are you from?) Start these statements with the subject: Wir lernen Deutsch. (We’re learning German.)', questions: [
            ['W-Frage', ['Wo', 'wohnst', 'du?'], 'Ask “Where do you live?” Wo means “where.”'],
            ['W-Frage', ['Welche Sprachen', 'sprichst', 'du?'], 'Ask “Which languages do you speak?” The question phrase goes first.'],
            ['Aussagesatz', ['Ich', 'komme', 'aus Spanien.'], 'Say “I come from Spain.” Start with “I.”'],
            ['Aussagesatz', ['Anna', 'wohnt', 'in Hannover.'], 'Say “Anna lives in Hanover.” Start with the person.'],
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
        sections: [
          { title: 'Put the seven days of the week in order.', kind: 'order', questions: [['Beginne mit Montag.', weekdays, 'Start with Montag (Monday). Dienstag is Tuesday, and Sonntag is Sunday.']] },
          { title: 'Make plans with Mia.', kind: 'chat', hint: 'Choose a reply for each message. Open Hint for a translation and what you want to say.', choices: ['Ja, gern!', 'Am Freitag?', 'Nein, das geht leider nicht.', 'Ja, super!'], questions: [
            ['Gehen wir ins Kino? (Du hast Lust.)', 'Ja, gern!', '“Shall we go to the movies?” Say you’d love to.'],
            ['Wann gehen wir? (Du schlägst Freitag vor.)', 'Am Freitag?', '“When shall we go?” Suggest Friday.'],
            ['Geht es um 18 Uhr? (Du hast keine Zeit.)', 'Nein, das geht leider nicht.', '“Does 6 p.m. work?” Say it doesn’t.'],
            ['Dann um 20 Uhr? (Das passt.)', 'Ja, super!', '“Then at 8 p.m.?” Say that works for you.'],
          ] },
        ],
      },
      {
        title: 'Jobs, articles, and plurals',
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
        sections: [
          { title: 'Write each number in German.', lesson: 'For numbers like 24, put the ones first: vier + und + zwanzig makes vierundzwanzig. Write it as one word.', questions: [
            ['22', 'zweiundzwanzig'], ['36', 'sechsunddreißig'], ['71', 'einundsiebzig'],
            ['108', ['einhundertacht', 'hundertacht']], ['480', 'vierhundertachtzig'],
          ] },
          { title: 'Sportclub “Fit” practice form', kind: 'registration' },
        ],
      },
      {
        title: 'Verb changes and yes/no questions',
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
