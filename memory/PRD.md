# Kana Typist — Japanese Typing Trainer

## Original Problem Statement
Build a single-page web application (vanilla HTML, CSS, JavaScript only — no frameworks, no build tools) that helps users practice typing Japanese using romaji input for hiragana and katakana. Convert kana into romaji typing sequences, track progress in real time, prevent skipping incorrect characters, highlight current character, show end-of-session stats, and generate new random training texts every session.

## User Choices (from initial ask_human)
- Scope: Single standalone `index.html` (vanilla HTML/CSS/JS, no frameworks)
- Text generation: Procedural sentence templates with randomized vocabulary (offline)
- Error learning system: Yes — track weak chars in localStorage and bias future texts
- Romaji style: Hepburn (shi, chi, tsu)

## Architecture
- **Single file**: `/app/index.html` is the canonical deliverable. A copy at `/app/frontend/public/typing.html` is served by the React dev server so the preview URL works. `App.js` redirects `/` → `/typing.html`.
- **No backend, no build tools, no dependencies.** Pure vanilla HTML/CSS/JS embedded in one file.
- Modules inside the IIFE: romaji maps (HIRA, YOON), tokenizer (handles yōon, sokuon, ん rules, punctuation passthrough), procedural text generator with weighted weak-char biasing, three-screen state machine (setup / typing / stats).

## Implemented (2026-02)
- Setup screen: alphabet toggle (Hiragana / Katakana), mode toggle (**Text + Letters + Words** all active)
- Procedural sentence generator with 12 templates and 7 vocabulary pools — different text every session, 200–400 kana, trims at sentence boundary
- **Letters mode**: 60-kana drill from a 95-entry pool (basic + dakuten + handakuten + yōon). Weighted random picker uses the same `localStorage` weak store — each weak count adds 1.8× weight, so a kana with 3 mistakes is ~6× more likely than a fresh one. Avoids the same kana twice in a row. Bigger glyphs and centred grid layout via `.letters-mode` CSS.
- **Words mode**: 20-word drill from a ~120-entry pool (all VOCAB pools merged + curated common everyday words like こんにちは, ありがとう, がんばって, きょうしつ, etc.). Uses the same word-level weighted picker as Text mode (weak chars contained in a word add 2.5× weight). Renders words as **chip cards** with `is-current` (coral border + lift) and `is-done` (mint background) states.
- **Session history + chart**: every finished session is appended to `localStorage` (capped at 50). Stats screen renders an inline SVG chart of the last 12 sessions with two lines (coral CPM + dashed mint accuracy), area fill under CPM, larger ringed dot on the latest entry, summary line with total sessions / best CPM / last-N delta. Header pill shows current session count + best CPM. Setup screen shows last session result.
- **Modern youth-oriented redesign** (Feb 2026 v2):
  - New palette: warm coral `#ff6d63` accent (gradient on CTA), mint `#2bb673` for success/done, honey `#f4a83a` for errors stat, cream `#fbfaf6` background with three soft tinted blob gradients
  - Typography: **Plus Jakarta Sans** for UI (modern, friendly, geometric without being corporate) + **Zen Maru Gothic** for Japanese (rounded, gentle, gen-Z-friendly — replaces the old mincho serif) + JetBrains Mono for romaji
  - Pill-shaped meters/crumbs/header chips, gradient CTA with arrow nudge on hover, options have lift+shadow on hover + 3px coral ring when selected, soft scale + shadow growth on stat boxes
  - Hero h1 "Type your way through かな." with a coral skewed swash under "かな", friendly eyebrow chip with pulsing dot, descriptive option meta text instead of just `kana / en` pair
  - Smooth 300–500ms `cubic-bezier(0.34, 1.56, 0.64, 1)` "pop" easing on interactive elements, 500ms fadeUp on screen transitions
  - Brand mark is a rotated rounded coral gradient tile with the kana か, header includes a streak/best-CPM pill that updates live
- Tokenizer covering: basic kana, yōon, sokuon (incl. っち → "tchi"), ん with vowel/y/n disambiguation, punctuation auto-skip
- Real-time typing engine: blocks on wrong keys, highlights current kana, shows romaji target + kana hint, shake on error
- Live meters: CPM, accuracy %, error count, gradient progress bar
- Mobile-responsive layout (single-column stack at <640px), hidden auto-focused input, click-to-refocus, Esc to quit

## Verified E2E (testing in preview)
- Setup → typing → stats flow completes in **all three** modes (Text, Letters, Words)
- Words mode: 20 chip-cards rendered, current word lifts with coral shadow, weighted picker biases toward weak characters
- History chart: with 9 seeded sessions, both trend lines render correctly with no axis-label overlap; summary shows "9 sessions · best 1516 cpm · last 9: +1336 cpm"; empty state with Japanese 記録なし / もう一回 messaging when fewer than 2 sessions exist
- Header pill updates after sessions ("記録 8 sessions · best 360 cpm"); setup screen last-info pill shows previous-run summary
- Mobile (420px): single column, all elements remain readable, no overflow
- Existing flows still work: Text mode, Letters mode, Katakana toggle, error blocking, weak-char tracking, "Generate new text" / "New session" buttons

## Backlog (P1 / future)
- P2: Optional 30s "warm-up drill" on setup screen built only from current top-3 weak chars
- P2: Sound on keystroke / completion (off by default)
- P2: Configurable text length and per-mode count
- P2: Export / clear weak-char and history data from UI
- P2: Streak by calendar day ("3 days in a row")

## Files
- `/app/index.html` — standalone deliverable (open directly in any browser)
- `/app/frontend/public/typing.html` — identical copy served at preview URL
- `/app/frontend/src/App.js` — minimal redirect shell to /typing.html
