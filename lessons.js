// Each question is [prompt, answer]. Use an array for equally valid answers.
const numbersTo20 = 'null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig'.split(' ');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const letterNames = 'a be tse de e eff ge ha i jot ka ell emm enn o pe ku err ess te u fau we iks ypsilon tset'.split(' ');
const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const hobbies = ['fotografieren', 'singen', 'kochen', 'schwimmen', 'reisen', 'tanzen', 'joggen', 'lesen'];
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
    intro: 'Begrüßungen, Alphabet, Zahlen bis 20, Länder, Sprachen und erste Verben.',
    modules: [
      {
        title: 'Hallo oder Guten Tag?',
        sections: [
          { title: 'Du oder Sie? Sortiere die Sätze.', choices: ['Informell (du)', 'Formell (Sie)'], questions: [
            ['Hallo, Mia! Wie geht’s dir?', 'Informell (du)'],
            ['Guten Tag, Herr Berg. Wie geht es Ihnen?', 'Formell (Sie)'],
            ['Tschüss, Ben! Bis morgen!', 'Informell (du)'],
            ['Entschuldigung, wie heißen Sie?', 'Formell (Sie)'],
          ] },
          { title: 'Ergänze die Gespräche.', questions: [
            ['Hallo, Mia! Wie geht’s …?', 'dir'],
            ['Sehr gut, danke! Und …? (du)', 'dir'],
            ['Guten Tag, Frau Schulz. Wie geht es …?', 'Ihnen'],
            ['Danke, gut! Und …? (Sie)', 'Ihnen'],
          ] },
        ],
      },
      {
        title: 'Alphabet, Zahlen & E-Mail',
        sections: [
          { title: 'Das Alphabet hören', kind: 'audio', items: alphabet.map((letter, index) => [letter, letterNames[index]]) },
          { title: 'Zahlen von 0 bis 20 hören', kind: 'audio', items: numbersTo20.map((word, number) => [number, word]) },
          { title: 'E-Mail-Diktat', kind: 'dictation', hint: 'Schreibe die Adresse mit Sonderzeichen. Du kannst sie auch in Wörtern eingeben. _ = Unterstrich, @ = ät, - = minus, . = Punkt.', questions: [
            ['l e a, Unterstrich, k, ät, m a i l, Punkt, d e', ['lea_k@mail.de', 'lea unterstrich k ät mail punkt de']],
            ['t o m, minus, b, ät, p o s t, Punkt, d e', ['tom-b@post.de', 'tom minus b ät post punkt de']],
          ] },
        ],
      },
      {
        title: 'Länder & Sprachen',
        sections: [
          { title: 'Ordne jedem Land eine Sprache zu.', kind: 'matching', choices: ['Deutsch', 'Spanisch', 'Japanisch', 'Türkisch', 'Portugiesisch', 'Polnisch'], questions: [
            ['Österreich', 'Deutsch'], ['Spanien', 'Spanisch'], ['Japan', 'Japanisch'],
            ['die Türkei', 'Türkisch'], ['Brasilien', 'Portugiesisch'], ['Polen', 'Polnisch'],
          ] },
          { title: 'Woher kommst du?', hint: 'Ergänze nur die Wörter nach „aus“.', questions: [
            ['Ich komme aus … (Spanien).', 'Spanien'],
            ['Ich komme aus … (die Schweiz).', 'der Schweiz'],
            ['Ich komme aus … (die Türkei).', 'der Türkei'],
            ['Ich komme aus … (die USA).', 'den USA'],
          ] },
        ],
      },
      {
        title: 'Grammatik-Trainer',
        sections: [
          {
            title: 'Setze die richtige Verbform ein.',
            kind: 'verbs',
            verbs: ['sein', 'heißen', 'kommen', 'wohnen', 'sprechen'],
            persons: [['ich', 0], ['du', 1], ['er/sie', 2], ['Sie', 5]],
          },
          { title: 'Baue die Sätze. Das Verb steht an Position 2.', kind: 'order', questions: [
            ['W-Frage', ['Wo', 'wohnst', 'du?']],
            ['W-Frage', ['Welche Sprachen', 'sprichst', 'du?']],
            ['Aussagesatz', ['Ich', 'komme', 'aus Spanien.']],
            ['Aussagesatz', ['Anna', 'wohnt', 'in Hannover.']],
          ] },
        ],
      },
    ],
  },
  {
    title: 'Freunde, Kollegen und ich',
    intro: 'Hobbys, Wochentage, Berufe, Artikel, Plural und Zahlen ab 20.',
    modules: [
      {
        title: 'Hobbys & Vorlieben',
        sections: [
          { title: 'Welches Verb passt zum Bild?', kind: 'pictures', choices: hobbies, questions: [
            ['Person mit einem Buch', 'lesen'], ['Person mit einem Fotoapparat', 'fotografieren'],
            ['Person singt ins Mikrofon', 'singen'], ['Person im Schwimmbecken', 'schwimmen'],
            ['Person mit Reisekoffer', 'reisen'], ['Person am Herd', 'kochen'],
            ['Person auf der Tanzfläche', 'tanzen'], ['Person läuft im Park', 'joggen'],
          ] },
          { title: 'Wie gern machst du das?', kind: 'preference' },
        ],
      },
      {
        title: 'Wochentage & Verabredungen',
        sections: [
          { title: 'Ordne die sieben Wochentage.', kind: 'order', questions: [['Beginne mit Montag.', weekdays]] },
          { title: 'Du verabredest dich im Chat.', kind: 'chat', choices: ['Ja, gern!', 'Am Freitag?', 'Nein, das geht leider nicht.', 'Ja, super!'], questions: [
            ['Gehen wir ins Kino? (Du hast Lust.)', 'Ja, gern!'],
            ['Wann gehen wir? (Du schlägst Freitag vor.)', 'Am Freitag?'],
            ['Geht es um 18 Uhr? (Du hast keine Zeit.)', 'Nein, das geht leider nicht.'],
            ['Dann um 20 Uhr? (Das passt.)', 'Ja, super!'],
          ] },
        ],
      },
      {
        title: 'Berufe, Artikel & Plural',
        sections: [
          { title: 'Sortiere die Nomen nach Artikel.', kind: 'articles', questions: [
            ['Stift', 'der'], ['Buch', 'das'], ['Tablette', 'die'],
            ['Auto', 'das'], ['Rechnung', 'die'], ['Schlüssel', 'der'],
          ] },
          { title: 'Finde die passende Berufsbezeichnung.', choices: ['Ärztin', 'Kellnerin', 'Lehrerin', 'Krankenpflegerin'], questions: [
            ['Arzt', 'Ärztin'], ['Kellner', 'Kellnerin'],
            ['Lehrer', 'Lehrerin'], ['Krankenpfleger', 'Krankenpflegerin'],
          ] },
          { title: 'Schreibe den Plural.', questions: [
            ['der Arzt → die …', 'Ärzte'], ['das Buch → die …', 'Bücher'],
            ['die Tablette → die …', 'Tabletten'], ['das Auto → die …', 'Autos'],
          ] },
        ],
      },
      {
        title: 'Zahlen & Sportclub',
        sections: [
          { title: 'Schreibe die Zahl als Wort.', questions: [
            ['22', 'zweiundzwanzig'], ['36', 'sechsunddreißig'], ['71', 'einundsiebzig'],
            ['108', ['einhundertacht', 'hundertacht']], ['480', 'vierhundertachtzig'],
          ] },
          { title: 'Übungsformular für den Sportclub „Fit“', kind: 'registration' },
        ],
      },
      {
        title: 'Grammatik-Trainer',
        sections: [
          { title: 'Setze die richtige Verbform ein.', questions: [
            ['Du … ein Buch. (lesen)', 'liest'], ['Er … Deutsch. (sprechen)', 'spricht'],
            ['Ihr … morgen frei. (haben)', 'habt'], ['Wir … im Sportclub. (sein)', 'sind'],
            ['Sie (Singular) … heute Zeit. (haben)', 'hat'], ['Du … aus Berlin. (sein)', 'bist'],
          ] },
          { title: 'Bilde Ja-/Nein-Fragen. Das Verb steht an Position 1.', kind: 'order', questions: [
            ['Du liest gern.', ['Liest', 'du', 'gern?']],
            ['Ihr habt morgen Zeit.', ['Habt', 'ihr', 'morgen Zeit?']],
            ['Wir gehen ins Kino.', ['Gehen', 'wir', 'ins Kino?']],
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
  ['Anna', 'Aus Hannover. Sie ist neu in der WG und studiert.'],
  ['Bea', 'Aus Berlin. Sie zeigt Anna die Wohnung.'],
  ['Luca', 'Aus München. Er arbeitet als Krankenpfleger.'],
  ['Max', 'Er ist oft in der Uni und schwimmt gern.'],
];
const storyQuiz = [
  { title: 'Szene 1 · Anna kommt an', choices: ['Luca', 'Bea', 'Max'], questions: [
    ['Wer bittet Anna in die Wohnung?', 'Luca'],
  ] },
  { title: 'Szene 2 · Willkommen in München', choices: ['Berlin', 'Hannover', 'München'], questions: [
    ['Woher kommt Anna?', 'Hannover'], ['Woher kommt Bea?', 'Berlin'], ['Woher kommt Luca?', 'München'],
  ] },
  { title: 'Szene 3 · Handynummern', choices: ['0151 89944583', '0154 76895321', '0171 341226691'], questions: [
    ['Max', '0151 89944583'], ['Anna', '0171 341226691'], ['Bea', '0154 76895321'],
  ] },
  { title: 'Szene 4 · Pläne fürs Schwimmbad', choices: ['Freitag', 'Samstag', 'Montag'], questions: [
    ['Wann wollen Anna und Max schwimmen gehen?', 'Montag'],
  ] },
  { title: 'Szene 5 · Arbeit und Freizeit', choices: ['Anna', 'Luca', 'Anna, Max und Luca'], questions: [
    ['Wer arbeitet im Krankenhaus?', 'Luca'],
    ['Wer macht ein Praktikum?', 'Anna'],
    ['Wer möchte am Montag zusammen schwimmen gehen?', 'Anna, Max und Luca'],
  ] },
];

const greetingsReference = [
  ['Begrüßen', 'Hallo! · Guten Morgen! · Guten Tag! · Guten Abend!'],
  ['Verabschieden', 'Tschüss! · Ciao! · Auf Wiedersehen! · Gute Nacht!'],
  ['Sich vorstellen', 'Wer bist du? → Ich bin Nina. Wie heißt du? / Wie heißen Sie? / Wie ist Ihr Name? → Ich heiße Nina. / Mein Name ist Nina Weber.'],
  ['Jemanden vorstellen', 'Wer ist das? → Das ist Herr Weber. / Das ist Frau Lang.'],
  ['Wohnort', 'Wo wohnst du? / Wo wohnen Sie? → Ich wohne in Frankfurt.'],
  ['Herkunft', 'Woher kommst du? / Woher kommen Sie? → Ich komme aus Spanien.'],
  ['Sprachen', 'Welche Sprachen sprichst du? / Welche Sprachen sprechen Sie? → Ich spreche Deutsch.'],
  ['Telefon', 'Wie ist deine / Ihre Telefonnummer? → 0123 456789.'],
  ['E-Mail', 'Wie ist deine / Ihre E-Mail-Adresse? → lea_k@beispiel.de.'],
  ['Befinden', 'Wie geht’s dir? / Wie geht es Ihnen? → Danke, sehr gut. / Gut, danke. / Ganz gut. Und dir? / Und Ihnen?'],
];
const everydayReference = [
  ['Hobbys', 'Was machst du gern? / Was machen Sie gern? → Ich reise gern.'],
  ['Vorlieben', 'Hörst du gern Musik? / Hören Sie gern Musik? → Ja, sehr gern. · Es geht so. · Nein, nicht so gern.'],
  ['Lesen und Kino', 'Liest du gern? / Lesen Sie gern? Gehst du gern ins Kino? / Gehen Sie gern ins Kino?'],
  ['Verabredung', 'Gehen wir ins Kino? → Ja, gern!'],
  ['Termin', 'Wann gehen wir? → Am Montag. / Am Freitag? → Ja, super! / Das geht leider nicht.'],
  ['Beruf', 'Was bist du von Beruf? / Was sind Sie von Beruf? → Ich bin Studentin.'],
  ['Arbeit', 'Was machst du? / Was machen Sie? → Ich studiere.'],
  ['Arbeitszeiten', 'Wann arbeitest du? / Wann arbeiten Sie? → Ich arbeite am Montag.'],
  ['Freie Tage', 'Wann hast du frei? / Wann haben Sie frei? → Ich habe am Freitag frei.'],
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
