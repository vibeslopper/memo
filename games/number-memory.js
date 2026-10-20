(() => {
  "use strict";

  const SETTINGS_KEY = "memo:number-memory:settings";
  const RECORDS_KEY = "memo:number-memory:records";
  const READY_DELAY = 500;
  const MAX_TIMEOUT_SECONDS = 2147483.647;

  function defaultSettings() {
    return {
      digits: 5, displaySeconds: 3, untilEnter: false, questions: 10, endless: false,
      increaseDifficulty: false, grouping: 3, autoSubmit: false, betweenQuestionsSeconds: 0,
      requireContinue: false, answerDelaySeconds: 0
    };
  }

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isValidSettings(value) {
    return isObject(value) && Number.isInteger(value.digits) && value.digits >= 1 && value.digits <= 50 &&
      Number.isFinite(value.displaySeconds) && value.displaySeconds >= 0.5 && value.displaySeconds <= 30 &&
      typeof value.untilEnter === "boolean" && Number.isSafeInteger(value.questions) && value.questions >= 1 &&
      typeof value.endless === "boolean" && typeof value.increaseDifficulty === "boolean" &&
      (value.grouping === 0 || value.grouping === 3 || value.grouping === 4) && typeof value.autoSubmit === "boolean" &&
      Number.isSafeInteger(value.betweenQuestionsSeconds) && value.betweenQuestionsSeconds >= 0 &&
      typeof value.requireContinue === "boolean" && Number.isFinite(value.answerDelaySeconds) &&
      value.answerDelaySeconds >= 0 && value.answerDelaySeconds <= MAX_TIMEOUT_SECONDS;
  }

  function isValidRecords(value) {
    return isObject(value) && Number.isInteger(value.longest) && value.longest >= 0 && value.longest <= 50;
  }

  function copySettings(value) {
    return {
      digits: value.digits, displaySeconds: value.displaySeconds, untilEnter: value.untilEnter,
      questions: value.questions, endless: value.endless, increaseDifficulty: value.increaseDifficulty,
      grouping: value.grouping, autoSubmit: value.autoSubmit,
      betweenQuestionsSeconds: value.betweenQuestionsSeconds, requireContinue: value.requireContinue,
      answerDelaySeconds: value.answerDelaySeconds
    };
  }

  function makeDigits(length) {
    let digits = "";
    for (let i = 0; i < length; i += 1) digits += String(Math.floor(Math.random() * 10));
    return digits;
  }

  function groupDigits(digits, size) {
    if (!size || digits.length <= size) return digits;
    const firstSize = digits.length % size || size;
    const groups = [digits.slice(0, firstSize)];
    for (let i = firstSize; i < digits.length; i += size) groups.push(digits.slice(i, i + size));
    return groups.join(" ");
  }

  function normalizeAnswer(value) {
    return value.replace(/\s/g, "");
  }

  GAMES.push({
    id: "number-memory",
    title: "Number Memory",
    description: "Remember a number of digits, then type it back.",

    launch: (container, backToGames) => {
      let settings = Memo.storage.getJSON(SETTINGS_KEY, defaultSettings(), isValidSettings);
      const records = Memo.storage.getJSON(RECORDS_KEY, { longest: 0 }, isValidRecords);

      container.innerHTML = `
        <button id="back-button" type="button" class="mb-6 min-h-11 rounded-md px-3 py-2 text-sm font-semibold text-blue-800 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:text-blue-300 dark:focus-visible:outline-blue-300">Back to games</button>
        <header><h2 class="text-2xl font-bold">Number Memory</h2><p class="mt-2 text-slate-600 dark:text-slate-400">Look at the digits, then recall them in order.</p></header>
        <section id="settings-panel" aria-labelledby="settings-title">
          <h3 id="settings-title" class="mt-6 text-lg font-semibold">Settings</h3>
          <form id="settings-form" class="mt-4 space-y-4" autocomplete="off" novalidate>
            <div class="grid gap-4 sm:grid-cols-2">
              <div><label for="digits-input" class="block text-sm font-medium">Digits per number (1–50)</label><input id="digits-input" class="mt-1 block min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300" type="number" inputmode="numeric" min="1" max="50" step="1"></div>
              <div><label for="time-input" class="block text-sm font-medium">Display time (seconds)</label><input id="time-input" class="mt-1 block min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300" type="number" inputmode="decimal" min="0.5" max="30" step="0.1"></div>
              <div><label for="questions-input" class="block text-sm font-medium">Number of questions</label><input id="questions-input" class="mt-1 block min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300" type="number" inputmode="numeric" min="1" step="1"></div>
              <div><label for="between-seconds-input" class="block text-sm font-medium">Countdown between questions (seconds; 0 = none)</label><input id="between-seconds-input" class="mt-1 block min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300" type="number" inputmode="numeric" min="0" step="1"></div>
              <div><label for="answer-delay-input" class="block text-sm font-medium">Delay before typing (seconds; 0 = none)</label><input id="answer-delay-input" class="mt-1 block min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300" type="number" inputmode="decimal" min="0" max="2147483.647" step="0.1"></div>
              <div><label for="grouping-input" class="block text-sm font-medium">Group digits</label><select id="grouping-input" class="mt-1 block min-h-11 w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300"><option value="0">None</option><option value="3">Groups of 3</option><option value="4">Groups of 4</option></select></div>
            </div>
            <div class="space-y-3">
              <label for="until-enter-input" class="flex min-h-11 items-center gap-3 text-sm"><input id="until-enter-input" class="h-4 w-4 accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:accent-blue-400 dark:focus-visible:outline-blue-300" type="checkbox"><span>Show until I press Enter</span></label>
              <label for="require-continue-input" class="flex min-h-11 items-center gap-3 text-sm"><input id="require-continue-input" class="h-4 w-4 accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:accent-blue-400 dark:focus-visible:outline-blue-300" type="checkbox"><span>Wait for Enter or Continue before the next question</span></label>
              <label for="endless-input" class="flex min-h-11 items-center gap-3 text-sm"><input id="endless-input" class="h-4 w-4 accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:accent-blue-400 dark:focus-visible:outline-blue-300" type="checkbox"><span>Endless</span></label>
              <label for="difficulty-input" class="flex min-h-11 items-center gap-3 text-sm"><input id="difficulty-input" class="h-4 w-4 accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:accent-blue-400 dark:focus-visible:outline-blue-300" type="checkbox"><span>Increase difficulty after each correct answer</span></label>
              <label for="auto-submit-input" class="flex min-h-11 items-center gap-3 text-sm"><input id="auto-submit-input" class="h-4 w-4 accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:accent-blue-400 dark:focus-visible:outline-blue-300" type="checkbox"><span>Auto-submit after all digits are typed</span></label>
            </div>
            <p id="settings-error" class="hidden text-sm font-medium text-red-800 dark:text-red-300" role="alert"></p>
            <button type="submit" class="min-h-11 w-full rounded-md bg-blue-800 px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-blue-700 dark:focus-visible:outline-blue-300">Start</button>
          </form>
          <p id="personal-best" class="mt-4 text-sm font-medium"></p>
        </section>
        <section id="round-panel" class="hidden" aria-labelledby="round-heading">
          <h3 id="round-heading" class="h-7 truncate text-lg font-semibold"></h3>
          <div id="number-container" class="mt-8 flex h-48 w-full flex-col items-center rounded-lg border border-slate-300 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
            <p id="number-display" class="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden break-all text-center font-mono text-xl font-bold leading-7 tracking-normal tabular-nums max-[240px]:text-base max-[240px]:leading-6 sm:text-3xl sm:leading-9 sm:tracking-wide" role="status" aria-atomic="true" tabindex="-1"></p>
            <div class="grid h-11 w-full shrink-0 grid-cols-1 place-items-center">
              <button id="ready-button" class="invisible col-start-1 row-start-1 min-h-11 rounded-md border border-slate-400 px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:focus-visible:outline-blue-300" type="button" disabled>Ready</button>
              <button id="between-continue-button" class="invisible col-start-1 row-start-1 min-h-11 rounded-md border border-slate-400 px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:focus-visible:outline-blue-300" type="button" disabled>Continue</button>
            </div>
          </div>
          <form id="answer-form" class="mt-4 space-y-4" autocomplete="off" novalidate><label for="answer-input" class="block text-sm font-medium">Type the number</label><input id="answer-input" class="block min-h-12 w-full rounded-md border border-slate-400 bg-white px-3 py-2 font-mono text-xl text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:outline-blue-300" type="text" inputmode="numeric" autocomplete="off" autocapitalize="off" spellcheck="false" disabled><button id="answer-submit-button" type="submit" class="min-h-11 w-full rounded-md bg-blue-800 px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-700 dark:focus-visible:outline-blue-300" disabled>Submit answer</button></form>
          <section id="result-panel" class="hidden mt-8 space-y-3" aria-live="polite"><p id="result-status" class="text-lg font-semibold" tabindex="-1"></p><p class="break-all">Correct number: <code id="result-number" class="font-mono text-lg"></code></p><p class="break-all">Your answer: <code id="result-answer" class="font-mono text-lg"></code></p><p class="break-words text-sm"><span class="font-semibold">Differences:</span> <span id="result-differences"></span></p><button id="continue-button" class="min-h-11 w-full rounded-md bg-blue-800 px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-blue-700 dark:focus-visible:outline-blue-300" type="button">See summary</button></section>
          <button id="end-game-button" class="hidden mt-6 min-h-11 rounded-md border border-slate-400 px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:focus-visible:outline-blue-300" type="button">End game and view summary</button>
        </section>
        <section id="summary-panel" class="hidden" aria-labelledby="summary-title">
          <h3 id="summary-title" class="text-xl font-semibold" tabindex="-1">Game summary</h3>
          <dl class="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-slate-300 p-4 dark:border-slate-700">
            <div><dt class="text-sm text-slate-600 dark:text-slate-400">Rounds played</dt><dd id="summary-rounds" class="mt-1 font-semibold"></dd></div>
            <div><dt class="text-sm text-slate-600 dark:text-slate-400">Fully correct</dt><dd id="summary-correct" class="mt-1 font-semibold"></dd></div>
            <div><dt class="text-sm text-slate-600 dark:text-slate-400">Accuracy</dt><dd id="summary-accuracy" class="mt-1 font-semibold"></dd></div>
            <div><dt class="text-sm text-slate-600 dark:text-slate-400">Longest number recalled</dt><dd id="summary-longest" class="mt-1 font-semibold"></dd></div>
          </dl>
          <h4 class="mt-6 font-semibold">Missed rounds</h4><ol id="missed-list" class="mt-3 list-decimal space-y-3 pl-6"></ol>
          <div class="mt-6 grid gap-3 sm:grid-cols-2"><button id="play-again-button" class="min-h-11 rounded-md bg-blue-800 px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:bg-blue-700 dark:focus-visible:outline-blue-300" type="button">Play again with the same settings</button><button id="change-settings-button" class="min-h-11 rounded-md border border-slate-400 px-4 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-600 dark:focus-visible:outline-blue-300" type="button">Change settings</button></div>
        </section>
        <p id="keyboard-hint" class="mt-6 text-sm text-slate-600 dark:text-slate-400"></p>
      `;

      const byId = Memo.byId;
      const backButton = byId("back-button"), settingsPanel = byId("settings-panel");
      const settingsForm = byId("settings-form"), settingsError = byId("settings-error");
      const digitsInput = byId("digits-input"), timeInput = byId("time-input"), untilEnterInput = byId("until-enter-input");
      const questionsInput = byId("questions-input"), betweenSecondsInput = byId("between-seconds-input");
      const answerDelayInput = byId("answer-delay-input");
      const requireContinueInput = byId("require-continue-input"), endlessInput = byId("endless-input"), difficultyInput = byId("difficulty-input");
      const groupingInput = byId("grouping-input"), autoSubmitInput = byId("auto-submit-input"), personalBest = byId("personal-best");
      const roundPanel = byId("round-panel"), roundHeading = byId("round-heading");
      const numberDisplay = byId("number-display"), betweenContinueButton = byId("between-continue-button");
      const readyButton = byId("ready-button"), answerForm = byId("answer-form"), answerInput = byId("answer-input");
      const answerSubmitButton = byId("answer-submit-button");
      const resultPanel = byId("result-panel"), resultStatus = byId("result-status"), resultNumber = byId("result-number");
      const resultAnswer = byId("result-answer"), resultDifferences = byId("result-differences"), continueButton = byId("continue-button");
      const endGameButton = byId("end-game-button"), summaryPanel = byId("summary-panel"), summaryTitle = byId("summary-title");
      const summaryRounds = byId("summary-rounds");
      const summaryCorrect = byId("summary-correct"), summaryAccuracy = byId("summary-accuracy"), summaryLongest = byId("summary-longest");
      const missedList = byId("missed-list"), playAgainButton = byId("play-again-button");
      const changeSettingsButton = byId("change-settings-button"), keyboardHint = byId("keyboard-hint");
      let state = "settings", sessionSettings = null, currentDigits = settings.digits, target = "";
      let history = [], correctCount = 0, runLongest = 0, timerId = null, timerVersion = 0;

      const NUMBER_DISPLAY_CLASSES = "flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden break-all text-center font-mono text-xl font-bold leading-7 tracking-normal tabular-nums max-[240px]:text-base max-[240px]:leading-6 sm:text-3xl sm:leading-9 sm:tracking-wide";
      const MESSAGE_DISPLAY_CLASSES = "flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden break-words px-2 text-center font-sans text-sm font-medium leading-5 tracking-normal sm:text-base sm:leading-6";

      function readSettings() {
        const value = {
          digits: Number(digitsInput.value), displaySeconds: Number(timeInput.value), untilEnter: untilEnterInput.checked,
          questions: Number(questionsInput.value), betweenQuestionsSeconds: betweenSecondsInput.value === "" ? NaN : Number(betweenSecondsInput.value),
          answerDelaySeconds: answerDelayInput.value === "" ? NaN : Number(answerDelayInput.value),
          requireContinue: requireContinueInput.checked, endless: endlessInput.checked, increaseDifficulty: difficultyInput.checked,
          grouping: Number(groupingInput.value), autoSubmit: autoSubmitInput.checked
        };
        return isValidSettings(value) ? value : null;
      }

      function saveSettings(showError) {
        timeInput.disabled = untilEnterInput.checked;
        questionsInput.disabled = endlessInput.checked;
        const nextSettings = readSettings();
        if (!nextSettings) {
          if (showError) {
            settingsError.textContent = "Check the digit count, display time, question count, countdown and answer delay values.";
            settingsError.classList.remove("hidden");
            digitsInput.focus();
          }
          return false;
        }
        settings = nextSettings;
        Memo.storage.setJSON(SETTINGS_KEY, settings, isValidSettings);
        settingsError.classList.add("hidden");
        return true;
      }

      function fillSettings() {
        digitsInput.value = settings.digits;
        timeInput.value = settings.displaySeconds;
        untilEnterInput.checked = settings.untilEnter;
        questionsInput.value = settings.questions;
        betweenSecondsInput.value = settings.betweenQuestionsSeconds;
        answerDelayInput.value = settings.answerDelaySeconds;
        requireContinueInput.checked = settings.requireContinue;
        endlessInput.checked = settings.endless;
        difficultyInput.checked = settings.increaseDifficulty;
        groupingInput.value = String(settings.grouping);
        autoSubmitInput.checked = settings.autoSubmit;
        saveSettings(false);
      }

      function updatePersonalBest() {
        personalBest.textContent = records.longest ? "Personal best: " + records.longest + (records.longest === 1 ? " digit" : " digits") : "No personal best yet.";
      }

      function setDisplayMessage(message) {
        numberDisplay.className = MESSAGE_DISPLAY_CLASSES;
        numberDisplay.textContent = message;
      }

      function setDisplayedNumber(digits) {
        numberDisplay.className = NUMBER_DISPLAY_CLASSES;
        numberDisplay.textContent = digits;
      }

      function setButtonVisible(button, visible) {
        button.classList.toggle("invisible", !visible);
        button.disabled = !visible;
      }

      function setAnswerEnabled(enabled) {
        answerInput.disabled = !enabled;
        answerSubmitButton.disabled = !enabled;
      }

      function cancelTimer() {
        if (timerId !== null) window.clearTimeout(timerId);
        timerId = null;
        timerVersion += 1;
      }

      function schedule(callback, delay, expectedState) {
        const version = timerVersion;
        timerId = window.setTimeout(() => {
          if (version !== timerVersion || state !== expectedState) return;
          timerId = null;
          callback();
        }, delay);
      }

      function scheduleAfterSeconds(callback, seconds, expectedState) {
        const chunkSeconds = Math.min(seconds, Math.floor(MAX_TIMEOUT_SECONDS));
        schedule(() => {
          const remainingSeconds = seconds - chunkSeconds;
          if (remainingSeconds > 0) scheduleAfterSeconds(callback, remainingSeconds, expectedState);
          else callback();
        }, chunkSeconds * 1000, expectedState);
      }

      function updateRoundHeading() {
        const round = history.length + 1;
        const label = sessionSettings.endless ? "Round " + round : "Round " + round + " of " + sessionSettings.questions;
        roundHeading.textContent = label + " · " + currentDigits + (currentDigits === 1 ? " digit" : " digits");
      }

      function displayNumber() {
        cancelTimer();
        target = makeDigits(currentDigits);
        state = "showing";
        setAnswerEnabled(false);
        answerInput.value = "";
        setButtonVisible(betweenContinueButton, false);
        setButtonVisible(readyButton, sessionSettings.untilEnter);
        setDisplayedNumber(groupDigits(target, sessionSettings.grouping));
        numberDisplay.focus();
        if (sessionSettings.untilEnter) {
          keyboardHint.textContent = "Enter or Ready: hide the number. Escape: return to settings.";
        } else {
          keyboardHint.textContent = "Watch the number; it hides when time is up. Escape: return to settings.";
          schedule(hideDigits, sessionSettings.displaySeconds * 1000, "showing");
        }
      }

      function revealFirstNumber() {
        if (state === "ready") displayNumber();
      }

      function startInitialRound() {
        cancelTimer();
        settingsPanel.classList.add("hidden");
        summaryPanel.classList.add("hidden");
        roundPanel.classList.remove("hidden");
        resultPanel.classList.add("hidden");
        if (sessionSettings.endless) endGameButton.classList.remove("hidden");
        else endGameButton.classList.add("hidden");
        state = "ready";
        updateRoundHeading();
        setAnswerEnabled(false);
        answerInput.value = "";
        setButtonVisible(readyButton, false);
        setButtonVisible(betweenContinueButton, false);
        setDisplayMessage("Get ready");
        keyboardHint.textContent = "Escape: return to settings.";
        numberDisplay.focus();
        schedule(revealFirstNumber, READY_DELAY, "ready");
      }

      function countdownText(seconds) {
        return "Next question in " + seconds + (seconds === 1 ? " second." : " seconds.");
      }

      function beginCountdown() {
        if (state !== "waiting") return;
        setButtonVisible(betweenContinueButton, false);
        const seconds = sessionSettings.betweenQuestionsSeconds;
        if (seconds === 0) {
          displayNumber();
          return;
        }
        state = "countdown";
        setDisplayMessage(countdownText(seconds));
        keyboardHint.textContent = "Escape: return to settings.";
        numberDisplay.focus();
        scheduleAfterSeconds(displayNumber, seconds, "countdown");
      }

      function startNextQuestion() {
        updateRoundHeading();
        state = "waiting";
        setAnswerEnabled(false);
        answerInput.value = "";
        setButtonVisible(readyButton, false);
        setButtonVisible(betweenContinueButton, false);
        if (sessionSettings.requireContinue) {
          const action = sessionSettings.betweenQuestionsSeconds === 0 ? "Press Enter or Continue for the next number." : "Press Enter or Continue to start the countdown.";
          setDisplayMessage(action);
          keyboardHint.textContent = "Escape: return to settings.";
          setButtonVisible(betweenContinueButton, true);
          betweenContinueButton.focus();
        } else {
          beginCountdown();
        }
      }

      function showAnswerInput() {
        if (state !== "answer-delay") return;
        state = "answer";
        setAnswerEnabled(true);
        answerInput.value = "";
        setDisplayMessage("");
        keyboardHint.textContent = "Enter: submit your answer. Escape: return to settings.";
        answerInput.focus();
      }

      function hideDigits() {
        if (state !== "showing") return;
        cancelTimer();
        state = "answer-delay";
        setButtonVisible(readyButton, false);
        setButtonVisible(betweenContinueButton, false);
        setAnswerEnabled(false);
        answerInput.value = "";
        if (sessionSettings.answerDelaySeconds === 0) {
          showAnswerInput();
          return;
        }
        const duration = sessionSettings.answerDelaySeconds;
        setDisplayMessage("Input disabled — unlocks in " + duration + (duration === 1 ? " second." : " seconds."));
        keyboardHint.textContent = "Escape: return to settings.";
        numberDisplay.focus();
        scheduleAfterSeconds(showAnswerInput, duration, "answer-delay");
      }

      function differenceText(shown, typed) {
        const differences = [];
        for (let i = 0; i < Math.max(shown.length, typed.length); i += 1) {
          if (shown.charAt(i) !== typed.charAt(i)) {
            differences.push("position " + (i + 1) + " (shown " + (shown.charAt(i) || "no digit") + ", typed " + (typed.charAt(i) || "no digit") + ")");
          }
        }
        return differences.length ? differences.join("; ") : "No differing positions.";
      }

      function submitAnswer() {
        if (state !== "answer") return;
        cancelTimer();
        const answer = normalizeAnswer(answerInput.value);
        answerInput.value = answer;
        const correct = answer === target;
        history.push({ shown: target, typed: answer, correct: correct });
        if (correct) {
          correctCount += 1;
          runLongest = Math.max(runLongest, target.length);
          records.longest = Math.max(records.longest, target.length);
          Memo.storage.setJSON(RECORDS_KEY, records, isValidRecords);
          updatePersonalBest();
          if (sessionSettings.increaseDifficulty) currentDigits = Math.min(50, currentDigits + 1);
          if (!sessionSettings.endless && history.length >= sessionSettings.questions) showSummary();
          else startNextQuestion();
          return;
        }
        state = "result";
        setAnswerEnabled(false);
        resultPanel.classList.remove("hidden");
        endGameButton.classList.add("hidden");
        resultStatus.textContent = "Incorrect — the game has ended. Differences are listed by position.";
        resultNumber.textContent = groupDigits(target, sessionSettings.grouping);
        resultAnswer.textContent = answer ? groupDigits(answer, sessionSettings.grouping) : "No digits entered.";
        resultDifferences.textContent = differenceText(target, answer);
        continueButton.textContent = "See summary";
        keyboardHint.textContent = "Enter or See summary: view your results. Escape: return to settings.";
        resultStatus.focus();
      }

      function showSummary() {
        cancelTimer();
        state = "summary";
        roundPanel.classList.add("hidden");
        settingsPanel.classList.add("hidden");
        summaryPanel.classList.remove("hidden");
        summaryRounds.textContent = String(history.length);
        summaryCorrect.textContent = String(correctCount);
        summaryAccuracy.textContent = (history.length ? Math.round(correctCount * 100 / history.length) : 0) + "%";
        summaryLongest.textContent = runLongest ? runLongest + (runLongest === 1 ? " digit" : " digits") : "None";
        missedList.textContent = "";
        let missed = 0;
        history.forEach((round, index) => {
          if (round.correct) return;
          missed += 1;
          const item = document.createElement("li");
          item.className = "break-words rounded-lg border border-slate-300 p-3 dark:border-slate-700";
          item.textContent = "Round " + (index + 1) + " — shown: " + groupDigits(round.shown, sessionSettings.grouping) + "; typed: " + (round.typed ? groupDigits(round.typed, sessionSettings.grouping) : "no digits entered");
          missedList.appendChild(item);
        });
        if (!missed) {
          const item = document.createElement("li");
          item.textContent = "No missed rounds.";
          missedList.appendChild(item);
        }
        keyboardHint.textContent = "Escape: return to settings.";
        summaryTitle.focus();
      }

      function startGame() {
        if (state !== "settings" && state !== "summary") return;
        if (!saveSettings(true)) return;
        sessionSettings = copySettings(settings);
        currentDigits = sessionSettings.digits;
        history = [];
        correctCount = 0;
        runLongest = 0;
        startInitialRound();
      }

      function finishFromResult() {
        if (state !== "result") return;
        showSummary();
      }

      function showSettings(focusInput) {
        cancelTimer();
        state = "settings";
        sessionSettings = null;
        currentDigits = settings.digits;
        target = "";
        history = [];
        correctCount = 0;
        runLongest = 0;
        answerInput.value = "";
        setAnswerEnabled(false);
        setButtonVisible(readyButton, false);
        setButtonVisible(betweenContinueButton, false);
        setDisplayMessage("");
        resultStatus.textContent = "";
        resultNumber.textContent = "";
        resultAnswer.textContent = "";
        resultDifferences.textContent = "";
        resultPanel.classList.add("hidden");
        missedList.textContent = "";
        summaryRounds.textContent = "";
        summaryCorrect.textContent = "";
        summaryAccuracy.textContent = "";
        summaryLongest.textContent = "";
        roundPanel.classList.add("hidden");
        summaryPanel.classList.add("hidden");
        settingsPanel.classList.remove("hidden");
        updatePersonalBest();
        keyboardHint.textContent = "Enter: start. Escape: return to games.";
        if (focusInput) digitsInput.focus();
      }

      function handleKeydown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          if (state === "settings") backToGames();
          else showSettings(true);
        } else if (event.key === "Enter" && state === "showing" && sessionSettings.untilEnter) {
          event.preventDefault();
          if (!event.repeat) hideDigits();
        } else if (event.key === "Enter" && state === "result") {
          event.preventDefault();
          if (!event.repeat) finishFromResult();
        } else if (event.key === "Enter" && state === "waiting") {
          event.preventDefault();
          if (!event.repeat) beginCountdown();
        }
      }

      function endEndlessGame() {
        if (sessionSettings && sessionSettings.endless && state !== "summary" && state !== "disposed") showSummary();
      }

      backButton.addEventListener("click", backToGames);
      settingsForm.addEventListener("input", () => saveSettings(false));
      settingsForm.addEventListener("change", () => saveSettings(false));
      settingsForm.addEventListener("submit", (event) => { event.preventDefault(); startGame(); });
      readyButton.addEventListener("click", hideDigits);
      betweenContinueButton.addEventListener("click", beginCountdown);
      answerInput.addEventListener("input", () => {
        const answer = normalizeAnswer(answerInput.value);
        if (answer !== answerInput.value) answerInput.value = answer;
        if (sessionSettings && sessionSettings.autoSubmit && answer.replace(/[^0-9]/g, "").length >= currentDigits) submitAnswer();
      });
      answerForm.addEventListener("submit", (event) => { event.preventDefault(); submitAnswer(); });
      continueButton.addEventListener("click", finishFromResult);
      endGameButton.addEventListener("click", endEndlessGame);
      playAgainButton.addEventListener("click", startGame);
      changeSettingsButton.addEventListener("click", () => showSettings(true));
      document.addEventListener("keydown", handleKeydown);

      fillSettings();
      updatePersonalBest();
      keyboardHint.textContent = "Enter: start. Escape: return to games.";
      digitsInput.focus();

      return () => {
        cancelTimer();
        state = "disposed";
        target = "";
        history = [];
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  });
})();
