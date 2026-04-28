import React, { useState, useEffect, useRef } from 'react';
import './KanaTypist.css';

const KanaTypist = () => {
  // State management
  const [currentScreen, setCurrentScreen] = useState('setup');
  const [alphabet, setAlphabet] = useState('hiragana');
  const [mode, setMode] = useState('text');
  const [typingState, setTypingState] = useState({
    tokens: [],
    pos: 0,
    typedInToken: 0,
    errored: false,
    errors: 0,
    correctKeys: 0,
    totalKeys: 0,
    startTime: null,
    sessionCount: 0
  });
  const [readingState, setReadingState] = useState({
    currentDifficulty: 'beginner',
    currentSentenceIndex: 0,
    romajiVisible: true,
    translationVisible: false,
    currentStep: 1
  });

  // Refs for DOM elements
  const hiddenInputRef = useRef(null);

  // Romaji maps
  const HIRA = {
    'あ':'a','い':'i','う':'u','え':'e','お':'o',
    'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
    'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
    'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
    'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
    'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
    'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
    'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
    'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
    'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
    'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
    'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
    'や':'ya','ゆ':'yu','よ':'yo',
    'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
    'わ':'wa','を':'wo','ん':'n'
  };

  const YOON = {
    'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
    'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
    'しゃ':'sha','しゅ':'shu','しょ':'sho',
    'じゃ':'ja','じゅ':'ju','じょ':'jo',
    'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
    'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
    'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
    'びゃ':'bya','びゅ':'byu','びょ':'byo',
    'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
    'みゃ':'mya','みゅ':'myu','みょ':'myo',
    'りゃ':'rya','りゅ':'ryu','りょ':'ryo'
  };

  const SMALL_TSU = 'っ';
  const PUNCT = '。、！？・「」『』 　';

  // Reading sentences data
  const READING_SENTENCES = {
    beginner: [
      {
        japanese: '私は学生です。',
        words: [
          { text: '私', type: 'subject', romaji: 'watashi', tooltip: 'I, me (formal/polite)' },
          { text: 'は', type: 'particle', romaji: 'wa', tooltip: 'Topic marker particle' },
          { text: '学生', type: 'object', romaji: 'gakusei', tooltip: 'Student' },
          { text: 'です', type: 'verb', romaji: 'desu', tooltip: 'is/am/are (polite copula)' },
          { text: '。', type: 'punctuation', romaji: '', tooltip: '' }
        ],
        translation: 'I am a student.'
      },
      {
        japanese: 'これは本です。',
        words: [
          { text: 'これ', type: 'subject', romaji: 'kore', tooltip: 'This (thing close to speaker)' },
          { text: 'は', type: 'particle', romaji: 'wa', tooltip: 'Topic marker particle' },
          { text: '本', type: 'object', romaji: 'hon', tooltip: 'Book' },
          { text: 'です', type: 'verb', romaji: 'desu', tooltip: 'is/am/are (polite copula)' },
          { text: '。', type: 'punctuation', romaji: '', tooltip: '' }
        ],
        translation: 'This is a book.'
      },
      {
        japanese: '日本語を勉強します。',
        words: [
          { text: '日本語', type: 'object', romaji: 'nihongo', tooltip: 'Japanese language' },
          { text: 'を', type: 'particle', romaji: 'o', tooltip: 'Direct object marker particle' },
          { text: '勉強', type: 'verb', romaji: 'benkyou', tooltip: 'Study' },
          { text: 'します', type: 'verb', romaji: 'shimasu', tooltip: 'do/does (polite verb ending)' },
          { text: '。', type: 'punctuation', romaji: '', tooltip: '' }
        ],
        translation: 'I study Japanese.'
      }
    ],
    intermediate: [
      {
        japanese: '昨日、図書館で本を読みました。',
        words: [
          { text: '昨日', type: 'object', romaji: 'kinou', tooltip: 'Yesterday' },
          { text: '、', type: 'punctuation', romaji: '', tooltip: '' },
          { text: '図書館', type: 'object', romaji: 'toshokan', tooltip: 'Library' },
          { text: 'で', type: 'particle', romaji: 'de', tooltip: 'Location marker particle' },
          { text: '本', type: 'object', romaji: 'hon', tooltip: 'Book' },
          { text: 'を', type: 'particle', romaji: 'o', tooltip: 'Direct object marker particle' },
          { text: '読み', type: 'verb', romaji: 'yomi', tooltip: 'Read (verb stem)' },
          { text: 'ました', type: 'verb', romaji: 'mashita', tooltip: 'did (past tense polite)' },
          { text: '。', type: 'punctuation', romaji: '', tooltip: '' }
        ],
        translation: 'I read a book at the library yesterday.'
      },
      {
        japanese: '友達と一緒に映画を見に行きます。',
        words: [
          { text: '友達', type: 'subject', romaji: 'tomodachi', tooltip: 'Friend' },
          { text: 'と', type: 'particle', romaji: 'to', tooltip: 'With particle' },
          { text: '一緒', type: 'object', romaji: 'issho', tooltip: 'Together' },
          { text: 'に', type: 'particle', romaji: 'ni', tooltip: 'Purpose particle' },
          { text: '映画', type: 'object', romaji: 'eiga', tooltip: 'Movie' },
          { text: 'を', type: 'particle', romaji: 'o', tooltip: 'Direct object marker particle' },
          { text: '見', type: 'verb', romaji: 'mi', tooltip: 'See/look (verb stem)' },
          { text: 'に', type: 'particle', romaji: 'ni', tooltip: 'Direction/purpose particle' },
          { text: '行き', type: 'verb', romaji: 'iki', tooltip: 'Go (verb stem)' },
          { text: 'ます', type: 'verb', romaji: 'masu', tooltip: 'do/does (polite verb ending)' },
          { text: '。', type: 'punctuation', romaji: '', tooltip: '' }
        ],
        translation: 'I will go to see a movie with my friend.'
      }
    ],
    advanced: [
      {
        japanese: '新しい技術の発展によって、私たちの生活はますます便利になっています。',
        words: [
          { text: '新しい', type: 'object', romaji: 'atarashii', tooltip: 'New (i-adjective)' },
          { text: '技術', type: 'object', romaji: 'gijutsu', tooltip: 'Technology' },
          { text: 'の', type: 'particle', romaji: 'no', tooltip: 'Possessive particle' },
          { text: '発展', type: 'object', romaji: 'hatten', tooltip: 'Development/progress' },
          { text: 'に', type: 'particle', romaji: 'ni', tooltip: 'Cause/agent particle' },
          { text: 'よっ', type: 'verb', romaji: 'yot', tooltip: 'By (passive form)' },
          { text: 'て', type: 'particle', romaji: 'te', tooltip: 'Te-form connector' },
          { text: '、', type: 'punctuation', romaji: '', tooltip: '' },
          { text: '私たち', type: 'subject', romaji: 'watashitachi', tooltip: 'We/us' },
          { text: 'の', type: 'particle', romaji: 'no', tooltip: 'Possessive particle' },
          { text: '生活', type: 'object', romaji: 'seikatsu', tooltip: 'Life/lifestyle' },
          { text: 'は', type: 'particle', romaji: 'wa', tooltip: 'Topic marker particle' },
          { text: 'ますます', type: 'object', romaji: 'masumasu', tooltip: 'More and more' },
          { text: '便利', type: 'object', romaji: 'benri', tooltip: 'Convenient (na-adjective)' },
          { text: 'に', type: 'particle', romaji: 'ni', tooltip: 'Adverbial particle' },
          { text: 'なっ', type: 'verb', romaji: 'nat', tooltip: 'Become (verb stem)' },
          { text: 'て', type: 'particle', romaji: 'te', tooltip: 'Te-form connector' },
          { text: 'い', type: 'verb', romaji: 'i', tooltip: 'Are (present continuous)' },
          { text: 'ます', type: 'verb', romaji: 'masu', tooltip: 'Polite verb ending' },
          { text: '。', type: 'punctuation', romaji: '', tooltip: '' }
        ],
        translation: 'Due to the development of new technology, our lives are becoming more and more convenient.'
      }
    ]
  };

  // Utility functions
  function hiraToKata(s) {
    let out = '';
    for (const c of s) {
      const cc = c.charCodeAt(0);
      if (cc >= 0x3041 && cc <= 0x3096) out += String.fromCharCode(cc + 0x60);
      else out += c;
    }
    return out;
  }

  function kataToHira(s) {
    let out = '';
    for (const c of s) {
      const cc = c.charCodeAt(0);
      if (cc >= 0x30A1 && cc <= 0x30F6) out += String.fromCharCode(cc - 0x60);
      else out += c;
    }
    return out;
  }

  function tokenize(text) {
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      if (PUNCT.includes(char)) {
        tokens.push({ kana: char, romaji: '', isPunct: true });
        i++;
      } else if (char === SMALL_TSU) {
        tokens.push({ kana: char, romaji: '', isPunct: false });
        i++;
      } else {
        let matched = false;
        // Check yoon first (longer patterns)
        const twoChar = text.slice(i, i + 2);
        if (YOON[twoChar]) {
          tokens.push({ kana: twoChar, romaji: YOON[twoChar], isPunct: false });
          i += 2;
          matched = true;
        }
        if (!matched) {
          const hiraChar = kataToHira(char);
          if (HIRA[hiraChar]) {
            tokens.push({ kana: char, romaji: HIRA[hiraChar], isPunct: false });
            i++;
            matched = true;
          }
        }
        if (!matched) {
          tokens.push({ kana: char, romaji: '', isPunct: false });
          i++;
        }
      }
    }
    return tokens;
  }

  function generateLetters(alph) {
    const chars = alph === 'hiragana' ? Object.keys(HIRA) : Object.keys(HIRA).map(hiraToKata);
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 60).join('');
  }

  function generateWords(alph) {
    // Simple word list - in real app would be more comprehensive
    const hiraWords = ['こんにちは', 'ありがとう', 'さようなら', 'おはよう', 'こんばんは', '学生', '先生', '学校', '図書館', '日本語'];
    const kataWords = hiraWords.map(hiraToKata);
    const words = alph === 'hiragana' ? hiraWords : kataWords;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20).join('、');
  }

  function generateText(alph) {
    // Simple sentence generation - in real app would be more sophisticated
    const sentences = alph === 'hiragana' 
      ? ['こんにちは、元気ですか。', '今日はいい天気ですね。', '日本語を勉強しています。']
      : ['こんにちは、元気ですか。', '今日はいい天気ですね。', '日本語を勉強しています。'].map(hiraToKata);
    return sentences.join(' ');
  }

  // Event handlers
  const startSession = () => {
    if (mode === 'reading') {
      // Start reading practice mode
      setReadingState({
        currentDifficulty: 'beginner',
        currentSentenceIndex: 0,
        romajiVisible: true,
        translationVisible: false,
        currentStep: 1
      });
      setCurrentScreen('reading');
      return;
    }

    // Start typing session
    let text;
    if (mode === 'letters') text = generateLetters(alphabet);
    else if (mode === 'words') text = generateWords(alphabet);
    else text = generateText(alphabet);
    
    const tokens = tokenize(text);
    
    setTypingState({
      tokens,
      pos: 0,
      typedInToken: 0,
      errored: false,
      errors: 0,
      correctKeys: 0,
      totalKeys: 0,
      startTime: null,
      sessionCount: typingState.sessionCount + 1
    });
    
    setCurrentScreen('typing');
  };

  const handleKeyDown = (e) => {
    if (currentScreen !== 'typing') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) return;
    
    const key = e.key.toLowerCase();
    if (!/^[a-z\-']$/.test(key)) return;
    
    e.preventDefault();
    handleTypingKey(key);
  };

  const handleTypingKey = (key) => {
    let newState = { ...typingState };
    
    // Start timer on first valid keystroke
    if (!newState.startTime) {
      newState.startTime = Date.now();
    }

    // Skip punctuation tokens
    while (newState.pos < newState.tokens.length && newState.tokens[newState.pos].isPunct) {
      newState.pos++;
    }
    if (newState.pos >= newState.tokens.length) return;

    const tok = newState.tokens[newState.pos];
    const expected = tok.romaji[newState.typedInToken];

    newState.totalKeys++;

    if (key === expected) {
      newState.correctKeys++;
      newState.typedInToken++;
      newState.errored = false;

      // Finished this token
      if (newState.typedInToken >= tok.romaji.length) {
        newState.pos++;
        newState.typedInToken = 0;
        // Skip punctuation
        while (newState.pos < newState.tokens.length && newState.tokens[newState.pos].isPunct) newState.pos++;
      }
    } else {
      // Wrong key
      if (!newState.errored) {
        newState.errors++;
      }
      newState.errored = true;
    }

    setTypingState(newState);

    // Check if session is complete
    if (newState.pos >= newState.tokens.length) {
      finishSession();
    }
  };

  const finishSession = () => {
    // Calculate stats and show results
    setCurrentScreen('stats');
  };

  const toggleRomaji = () => {
    setReadingState(prev => ({ ...prev, romajiVisible: !prev.romajiVisible }));
  };

  const toggleTranslation = () => {
    setReadingState(prev => ({ 
      ...prev, 
      translationVisible: !prev.translationVisible,
      currentStep: prev.translationVisible ? prev.currentStep : Math.min(prev.currentStep + 1, 4)
    }));
  };

  const changeDifficulty = (level) => {
    setReadingState(prev => ({
      ...prev,
      currentDifficulty: level,
      currentSentenceIndex: 0,
      currentStep: 1
    }));
  };

  const nextSentence = () => {
    const sentences = READING_SENTENCES[readingState.currentDifficulty];
    if (readingState.currentSentenceIndex < sentences.length - 1) {
      setReadingState(prev => ({
        ...prev,
        currentSentenceIndex: prev.currentSentenceIndex + 1,
        currentStep: 1
      }));
    }
  };

  const prevSentence = () => {
    if (readingState.currentSentenceIndex > 0) {
      setReadingState(prev => ({
        ...prev,
        currentSentenceIndex: prev.currentSentenceIndex - 1,
        currentStep: 1
      }));
    }
  };

  const backToSetup = () => {
    setCurrentScreen('setup');
  };

  // Calculate stats
  const calculateStats = () => {
    if (!typingState.startTime) return { cpm: 0, acc: 100 };
    
    const elapsedSec = (Date.now() - typingState.startTime) / 1000;
    const elapsedMin = Math.max(elapsedSec / 60, 1 / 60);
    const kanaTotal = typingState.tokens.filter(t => !t.isPunct).length;
    const cpm = Math.round(kanaTotal / elapsedMin);
    const acc = typingState.totalKeys > 0
      ? Math.round((typingState.correctKeys / typingState.totalKeys) * 100)
      : 100;
    
    return { cpm, acc };
  };

  const { cpm, acc } = calculateStats();

  // Render functions
  const renderSetupScreen = () => (
    <section className="screen active" data-testid="screen-setup">
      <div className="setup-hero">
        <div className="eyebrow">
          <span className="dot"></span> kana typing, the daily kind
        </div>
        <h1>Type your way through <span className="accent">かな</span>.</h1>
        <p>
          Pick a syllabary, pick a mode, and start drilling. Mistakes get flagged in real time — and the kana you keep tripping on quietly come back more often.
        </p>
      </div>

      <div className="card panel" data-testid="setup-panel">
        <div>
          <div className="field-label">
            <span className="num">1</span> Syllabary
            <span className="ja-mini">字</span>
          </div>
          <div className="options" role="radiogroup" aria-label="Alphabet">
            <button 
              className={`option ${alphabet === 'hiragana' ? 'active' : ''}`}
              role="radio" 
              aria-checked={alphabet === 'hiragana'}
              onClick={() => setAlphabet('hiragana')}
              data-testid="option-hiragana"
            >
              <span className="label">
                <span className="ja">ひらがな</span>
                <span className="meta">
                  <span className="en">Hiragana</span>
                  <span className="desc">smooth, rounded — native script</span>
                </span>
              </span>
              <span className="dot" aria-hidden="true"></span>
            </button>
            <button 
              className={`option ${alphabet === 'katakana' ? 'active' : ''}`}
              role="radio" 
              aria-checked={alphabet === 'katakana'}
              onClick={() => setAlphabet('katakana')}
              data-testid="option-katakana"
            >
              <span className="label">
                <span className="ja">カタカナ</span>
                <span className="meta">
                  <span className="en">Katakana</span>
                  <span className="desc">angular — used for foreign words</span>
                </span>
              </span>
              <span className="dot" aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div>
          <div className="field-label">
            <span className="num">2</span> Mode
            <span className="ja-mini">形式</span>
          </div>
          <div className="options" role="radiogroup" aria-label="Mode">
            <button 
              className={`option ${mode === 'text' ? 'active' : ''}`}
              role="radio" 
              aria-checked={mode === 'text'}
              onClick={() => setMode('text')}
              data-testid="option-mode-text"
            >
              <span className="label">
                <span className="ja">文章</span>
                <span className="meta">
                  <span className="en">Text</span>
                  <span className="desc">200–400 kana of fresh sentences</span>
                </span>
              </span>
              <span className="dot" aria-hidden="true"></span>
            </button>
            <button 
              className={`option ${mode === 'letters' ? 'active' : ''}`}
              role="radio" 
              aria-checked={mode === 'letters'}
              onClick={() => setMode('letters')}
              data-testid="option-mode-letters"
            >
              <span className="label">
                <span className="ja">文字</span>
                <span className="meta">
                  <span className="en">Letters</span>
                  <span className="desc">60-kana drill, weak-char weighted</span>
                </span>
              </span>
              <span className="dot" aria-hidden="true"></span>
            </button>
            <button 
              className={`option ${mode === 'words' ? 'active' : ''}`}
              role="radio" 
              aria-checked={mode === 'words'}
              onClick={() => setMode('words')}
              data-testid="option-mode-words"
            >
              <span className="label">
                <span className="ja">単語</span>
                <span className="meta">
                  <span className="en">Words</span>
                  <span className="desc">20 words, weak-char weighted</span>
                </span>
              </span>
              <span className="dot" aria-hidden="true"></span>
            </button>
            <button 
              className={`option ${mode === 'reading' ? 'active' : ''}`}
              role="radio" 
              aria-checked={mode === 'reading'}
              onClick={() => setMode('reading')}
              data-testid="option-mode-reading"
            >
              <span className="label">
                <span className="ja">読解</span>
                <span className="meta">
                  <span className="en">Reading</span>
                  <span className="desc">Practice reading comprehension & grammar</span>
                </span>
              </span>
              <span className="dot" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="start-row">
        <div className="stats-mini">
          <span className="ja-mini">準備完了</span>
          <span>No sessions yet — let's start one.</span>
        </div>
        <button className="btn btn--accent" onClick={startSession} data-testid="start-btn">
          Begin session <span className="arrow">→</span>
        </button>
      </div>
    </section>
  );

  const renderTypingScreen = () => {
    const currentToken = typingState.tokens[typingState.pos];
    const romajiTarget = currentToken ? currentToken.romaji : '';
    const typed = romajiTarget.slice(0, typingState.typedInToken);
    const pending = romajiTarget.slice(typingState.typedInToken);
    
    const totalRel = typingState.tokens.filter(t => !t.isPunct).length || 1;
    const doneRel = typingState.tokens.slice(0, typingState.pos).filter(t => !t.isPunct).length;
    const progress = ((doneRel / totalRel) * 100);

    return (
      <section className="screen active" data-testid="screen-typing">
        <div className="topbar">
          <div className="crumbs">
            <span>{alphabet === 'hiragana' ? 'Hiragana' : 'Katakana'}</span>
            <span className="sep">›</span>
            <span className="cur">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
          </div>
          <div className="meters">
            <div className="meter">
              <span className="num">{cpm}</span>
              <span className="lbl">cpm</span>
            </div>
            <div className="meter acc">
              <span className="num">{acc}</span>
              <span className="lbl">acc</span>
            </div>
            <div className="meter err">
              <span className="num">{typingState.errors}</span>
              <span className="lbl">err</span>
            </div>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="card typing-card">
          <div className="text-box">
            {typingState.tokens.map((token, idx) => {
              let className = 'ch';
              if (token.isPunct) className += ' punct';
              if (idx < typingState.pos) className += ' done';
              else if (idx === typingState.pos) {
                className += ' cur';
                if (typingState.errored) className += ' err';
              }
              return (
                <span key={idx} className={className}>
                  {token.kana}
                </span>
              );
            })}
          </div>

          <div className="romaji-strip">
            <div className="roma-target">
              <span className="typed">{typed}</span>
              {typingState.errored && pending.length > 0 && (
                <span className="typed err">{pending[0]}</span>
              )}
              <span className="pending">
                {typingState.errored ? pending.slice(1) : pending}
              </span>
              {currentToken && (
                <span className="ja-hint">{currentToken.kana}</span>
              )}
            </div>
            <div className="roma-hint">Type the romaji above</div>
          </div>

          <input 
            ref={hiddenInputRef}
            className="hidden-input" 
            autoComplete="off" 
            autoCapitalize="off" 
            autoCorrect="off" 
            spellCheck="false" 
            inputMode="text"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="typing-actions">
          <button className="btn btn--ghost" onClick={backToSetup}>Quit</button>
          <button className="btn btn--ghost" onClick={startSession}>New session</button>
        </div>
      </section>
    );
  };

  const renderReadingScreen = () => {
    const sentences = READING_SENTENCES[readingState.currentDifficulty];
    const currentSentence = sentences[readingState.currentSentenceIndex];

    if (!currentSentence) return null;

    return (
      <section className="screen active" data-testid="screen-reading">
        <div className="topbar">
          <div className="crumbs">
            <span>{alphabet === 'hiragana' ? 'Hiragana' : 'Katakana'}</span>
            <span className="sep">›</span>
            <span className="cur">Reading Practice</span>
          </div>
          <div className="meters">
            <div className="meter">
              <span className="num">{readingState.currentSentenceIndex + 1}/{sentences.length}</span>
              <span className="lbl">sentence</span>
            </div>
          </div>
        </div>

        <div className="card reading-card">
          <div className="reading-controls">
            <div className="toggle-group">
              <button 
                className={`toggle-btn ${readingState.romajiVisible ? 'active' : ''}`}
                onClick={toggleRomaji}
              >
                <span className="ja-mini">ローマ字</span>
                Romaji
              </button>
              <button 
                className={`toggle-btn ${readingState.translationVisible ? 'active' : ''}`}
                onClick={toggleTranslation}
              >
                <span className="ja-mini">英語</span>
                Translation
              </button>
            </div>
            
            <div className="difficulty-selector">
              <span className="label">Level:</span>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button 
                  key={level}
                  className={`difficulty-btn ${readingState.currentDifficulty === level ? 'active' : ''}`}
                  onClick={() => changeDifficulty(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="sentence-container">
            <div className="sentence-text">
              {currentSentence.words.map((word, idx) => (
                <span key={idx} className={`sentence-word ${word.type}`}>
                  {word.text}
                  <div className={`romaji-reading ${!readingState.romajiVisible ? 'hidden' : ''}`}>
                    {word.romaji}
                  </div>
                  {word.tooltip && (
                    <div className="grammar-tooltip">{word.tooltip}</div>
                  )}
                </span>
              ))}
            </div>
            <div className={`translation-text ${!readingState.translationVisible ? 'hidden' : ''}`}>
              {currentSentence.translation}
            </div>
          </div>

          <div className="practice-steps">
            <h3>
              <span className="ja-mini">練習</span>
              Practice Steps
            </h3>
            <div className="step-list">
              {[
                'Read the sentence and hover over words to see grammar explanations',
                'Identify the subject, particles, and verb structure',
                'Check the translation to confirm understanding',
                'Practice saying the sentence aloud'
              ].map((step, idx) => (
                <div 
                  key={idx} 
                  className={`step-item ${
                    idx + 1 < readingState.currentStep ? 'completed' : 
                    idx + 1 === readingState.currentStep ? 'active' : ''
                  }`}
                >
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-content">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="reading-actions">
            <button 
              className="btn btn--ghost" 
              onClick={prevSentence}
              disabled={readingState.currentSentenceIndex === 0}
            >
              ← Previous
            </button>
            <button 
              className="btn btn--accent" 
              onClick={nextSentence}
              disabled={readingState.currentSentenceIndex === sentences.length - 1}
            >
              Next Sentence →
            </button>
            <button className="btn" onClick={backToSetup}>
              Back to Setup
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderStatsScreen = () => (
    <section className="screen active" data-testid="screen-stats">
      <div className="card stats-card">
        <div className="stats-eyebrow">
          <span className="dot"></span> Session complete
        </div>
        <h1 className="stats-title">
          おつかれ
          <span className="en">Nice run — here's how it went.</span>
        </h1>

        <div className="stats-grid">
          <div className="stat-box accent">
            <div className="num">{cpm}</div>
            <div className="lbl">
              <span className="ja-mini">文字</span>
              CPM
            </div>
          </div>
          <div className="stat-box green">
            <div className="num">{acc}%</div>
            <div className="lbl">
              <span className="ja-mini">正確</span>
              Accuracy
            </div>
          </div>
          <div className="stat-box error">
            <div className="num">{typingState.errors}</div>
            <div className="lbl">
              <span className="ja-mini">ミス</span>
              Errors
            </div>
          </div>
        </div>

        <div className="reading-actions">
          <button className="btn btn--accent" onClick={startSession}>
            Try Again
          </button>
          <button className="btn" onClick={backToSetup}>
            Back to Setup
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="mark">か</div>
          <div className="name">Kana <span>Typist</span></div>
        </div>
        <div className="meta">
          <div className="pill">
            <b>かな</b> typing trainer
            <span className="ja-mini">練習</span>
          </div>
        </div>
      </header>

      <main>
        <div className="stage">
          {currentScreen === 'setup' && renderSetupScreen()}
          {currentScreen === 'typing' && renderTypingScreen()}
          {currentScreen === 'reading' && renderReadingScreen()}
          {currentScreen === 'stats' && renderStatsScreen()}
        </div>
      </main>
    </div>
  );
};

export default KanaTypist;
