const GAMES = window.GAMES = [];

const Memo = window.Memo = {
  byId: (id) => {
    return document.getElementById(id);
  },

  storage: {
    getJSON: (key, fallback, validate) => {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored === null) return fallback;

        const value = JSON.parse(stored);
        if (typeof validate !== "function" || !validate(value)) return fallback;
        return value;
      } catch (error) {
        return fallback;
      }
    },

    setJSON: (key, value, validate) => {
      try {
        if (typeof validate !== "function" || !validate(value)) return false;
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    }
  },

  start: () => {
    const homeScreen = Memo.byId("home-screen");
    const gameScreen = Memo.byId("game-screen");
    const gameList = Memo.byId("game-list");
    const gameContent = Memo.byId("game-content");
    let activeCleanup = null;
    let lastButton = null;

    function showHome() {
      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
      }
      gameContent.textContent = "";
      gameScreen.classList.add("hidden");
      homeScreen.classList.remove("hidden");
      if (lastButton) lastButton.focus();
    }

    function openGame(game, button) {
      if (activeCleanup) activeCleanup();
      lastButton = button;
      homeScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      gameContent.textContent = "";
      activeCleanup = game.launch(gameContent, showHome);
    }

    gameList.textContent = "";
    GAMES.forEach((game) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      const title = document.createElement("span");
      const description = document.createElement("span");

      button.type = "button";
      button.className = "flex w-full flex-col items-start gap-1 rounded-lg border border-slate-300 bg-white p-4 text-left text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:outline-blue-300";
      title.className = "font-semibold";
      description.className = "text-sm text-slate-600 dark:text-slate-400";
      title.textContent = game.title;
      description.textContent = game.description;
      button.appendChild(title);
      button.appendChild(description);
      button.addEventListener("click", () => {
        openGame(game, button);
      });
      item.appendChild(button);
      gameList.appendChild(item);
    });
  }
};
