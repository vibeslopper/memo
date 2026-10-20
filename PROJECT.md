# Overview

Memo is a static, client-side collection of small memorisation games. The current game is Number Memory. The site is designed for GitHub Pages and can also be opened from `file://`.

# Design goals

- Fast, keyboard-friendly play with no delay beyond the game's short ready timer and display timer.
- Low page weight: no frameworks, libraries, web fonts, icons or images.
- Simple JavaScript that is easy to read and extend with another game.
- Mobile-first, centred single-column layout with light and dark colour schemes.

# Hard technical constraints

- Use plain HTML, ES2015-level JavaScript and compiled Tailwind CSS v4. Do not use frameworks, libraries, a bundler, TypeScript, ES modules or the Tailwind Play CDN.
- Use relative asset paths and make no runtime network requests.
- Keep persisted data in `localStorage`; wrap access in `try`/`catch`, validate loaded data and fall back to defaults.
- Use a system font stack, Tailwind `dark:` variants with the `prefers-color-scheme` media setting, and accessible labels and focus handling.
- No animations, transitions, modals, pop-ups, toasts, autocomplete or suggestions.
- Keep `.opencode/` as OpenCode tooling; it is not product code.

# Project structure

- `index.html` — the single-page shell, home screen, local asset links and plain script tags.
- `common.js` — the global `GAMES` registry, generic home-screen launcher, DOM lookup and validated `localStorage` helpers.
- `games/number-memory.js` — Number Memory settings, round flow, results, records and game registration.
- `src/input.css` — Tailwind v4 import and configuration directive.
- `tailwind.config.js` — minimal Tailwind content paths and media-based dark mode, loaded from `src/input.css`.
- `.gitignore` — excludes the local Tailwind CLI binary.
- `tailwindcss` — local standalone Tailwind CSS v4.3.3 build CLI, ignored by Git and not loaded by the webpage.
- `output.css` — minified compiled stylesheet generated from `src/input.css`; commit this file for deployment.
- `.nojekyll` — empty GitHub Pages marker to skip Jekyll processing.
- `README.md` — build, local run and GitHub Pages instructions for people.
- `AGENTS.md` — stable instructions for future coding agents.
- `PROJECT.md` — this living project description.
- `.opencode/` — OpenCode tooling when present; not product code and should be left alone.

# Build, run and deploy

With the local standalone Tailwind CSS v4.3.3 CLI available as `./tailwindcss`, build the minified stylesheet from the project root:

```sh
./tailwindcss -i ./src/input.css -o ./output.css --minify
```

`src/input.css` imports Tailwind with `@import "tailwindcss"` and loads `tailwind.config.js` with `@config`. The CLI binary is ignored by Git and used only for builds; commit the generated `output.css`.

Run locally after building the CSS:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The plain scripts and relative paths also support opening `index.html` directly from `file://`.

For GitHub Pages, include `output.css` and the site files in the repository, then open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save. Keep the empty `.nojekyll` file at the root.

# How it works

## Site and game registry

`index.html` contains a generic home screen and an initially hidden game screen. `common.js` defines `GAMES` and creates one plain button per registry entry. A game's `launch(container, backToGames)` function renders and owns its screen; it returns a cleanup function for timers and global listeners. To add a game, add a file under `games/` that registers its metadata and launch function, then add its relative script tag to `index.html`. The shared helper and home screen do not depend on any game's subject.

## Number Memory

The settings screen starts a run. Each round makes a string of uniformly random digits (including a possible leading zero), shows “Get ready” for the fixed `READY_DELAY` of 500 ms before the first question, then displays the number. Timed display uses one timeout; the untimed option waits for Enter or the Ready button. Throughout an active round, a fixed-height number/message box stays above the always-visible answer form. The box displays the digits or a short status message during the ready, inter-question and answer-entry delays; positive inter-question delays show one static duration message rather than a ticking countdown. The input and submit button remain disabled until the number is hidden and any configured answer-entry delay ends; during that delay, the box states that input is disabled and when it unlocks. The input is focused when enabled. Whitespace in the answer is ignored, and comparison is string-based so leading zeros matter. Auto-submit submits when at least the target number of digits has been typed. After a correct answer, the next question starts immediately or waits for Enter/Continue before an optional inter-question delay. A correct answer on the last fixed question goes straight to the summary. The first incorrect answer ends the run and shows an intermediate comparison of the target and typed answer, including differing positions; Enter or See summary then opens the summary.

Fixed runs end after the chosen number of submitted answers or the first incorrect answer. Endless runs continue until an incorrect answer or **End game and view summary**. Escape discards the current run and returns to the game's settings screen; Escape from settings returns to the game list. The back button always returns to the game list. An unfinished round is not counted in a summary.

The summary reports rounds played, fully correct answers, accuracy, the longest correctly recalled number in that run, and missed rounds with shown and typed strings. When enabled, difficulty ramping adds one digit after each correct answer, up to 50 digits. A miss ends the run, so difficulty is not reduced after an incorrect answer. Grouping affects display only; the answer can be typed without spaces. Grouping uses sets of three or four digits from the right.

## Settings and records

- `memo:number-memory:settings` stores `digits`, `displaySeconds`, `untilEnter`, `questions`, `endless`, `increaseDifficulty` (increase after correct answers), `grouping`, `autoSubmit`, `betweenQuestionsSeconds`, `requireContinue` and `answerDelaySeconds`. Defaults are 5 digits, 3 seconds, 10 questions, groups of 3, zero seconds between questions, no required continuation and no answer-entry delay; the five boolean options are off. Digit count is 1–50; display time is 0.5–30 seconds or untimed; question count is a positive safe integer; grouping is 0, 3 or 4; inter-question delay is a non-negative safe integer number of seconds; answer delay is a non-negative decimal number of seconds within the browser timeout limit.
- `memo:number-memory:records` stores `longest`, the longest fully recalled number across runs, from 0–50 digits.

Both values are loaded through the shared `localStorage` helper and checked against their expected types and bounds. Missing, malformed, inaccessible or outdated values use the in-code defaults. Writes are also wrapped in `try`/`catch` and validated. In-progress rounds are not saved.

# Design decisions and rationale

- Use compiled Tailwind instead of the Play CDN to keep the deployed page lightweight.
- Use plain scripts instead of ES modules so the page works from `file://`.
- Make no runtime `fetch()` calls so the game needs no network after loading.
- Compare answers as strings to preserve leading zeros.
- Do not save in-progress games because the games are short.
- End a run on the first incorrect answer so correct answers can advance directly without an intermediate result screen.
- Increase difficulty only after correct answers; an incorrect answer ends the run and has no next round to affect.
- Default to no inter-question delay or required keypress to favour the requested quickfire, low-friction play.
- Place the optional answer-entry delay after the digits disappear so players can test recall before typing.
- Default the answer-entry delay to zero so it does not add waiting unless the player chooses it.
- Keep the number/message box and answer form fixed in place during a round, using the box for delay messages to avoid panel swaps and repeated countdown updates.
- Keep one file per game and a simple registry so another game is easy to add.
- Keep the project scoped to memorisation generally, not just numbers, so shared code stays game-agnostic.
- Keep Escape as a discard-to-settings action and provide a separate endless end button for the summary, preserving both requested quit behaviours.

# Known limitations and ideas

- Only Number Memory is implemented.
- Personal best records one overall longest correctly recalled number, not separate display-time records.
- Possible future games: words, sequences, grid positions and playing cards.
