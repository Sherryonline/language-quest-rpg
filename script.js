"use strict";

const STORAGE_KEY = "linguaLifeSave";
const screenIds = {
  start: "startScreen",
  character: "characterScreen",
  main: "mainGameScreen"
};

const languageLabels = { vi: "Vietnamese", en: "English", zh: "Chinese" };
const difficultyLabels = { beginner: "Beginner", elementary: "Elementary" };
const avatarLabels = {
  scholar: { label: "Scholar", icon: "📚" },
  traveler: { label: "Traveler", icon: "🧭" },
  worker: { label: "Worker", icon: "🛠️" },
  student: { label: "Student", icon: "🎒" }
};
const learningGoalLabels = {
  daily_life: "Daily Life",
  travel: "Travel",
  work: "Work",
  culture: "Culture",
  all_purpose: "All Purpose"
};

let currentPlayer = null;

function savePlayer(player) {
  if (!player || typeof player !== "object") {
    return null;
  }

  const savedPlayer = {
    ...player,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlayer));
    currentPlayer = savedPlayer;
    return savedPlayer;
  } catch (error) {
    console.warn("Lingua Life RPG could not save player data.", error);
    return null;
  }
}

function loadPlayer() {
  try {
    const rawPlayer = localStorage.getItem(STORAGE_KEY);

    if (!rawPlayer) {
      return null;
    }

    const player = JSON.parse(rawPlayer);
    return player && typeof player === "object" ? player : null;
  } catch (error) {
    console.warn("Lingua Life RPG could not load player data.", error);
    return null;
  }
}

function resetGame() {
  const confirmed = window.confirm("Reset your Lingua Life RPG save? This cannot be undone.");

  if (!confirmed) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Lingua Life RPG could not clear player data.", error);
  }

  currentPlayer = null;
  document.getElementById("characterForm").reset();
  renderStartScreen();
  return true;
}

function createPlayer(formData) {
  const now = new Date().toISOString();
  const learningLanguage = String(formData.get("learningLanguage"));

  return {
    id: `player_${Date.now()}`,
    name: String(formData.get("playerName")).trim(),
    nativeLanguage: String(formData.get("nativeLanguage") || "vi"),
    learningLanguage,
    difficulty: String(formData.get("difficulty")),
    avatar: String(formData.get("avatar")),
    learningGoal: String(formData.get("learningGoal")),
    dailyGoalMinutes: Number(formData.get("dailyGoalMinutes")),
    level: 1,
    exp: 0,
    coins: 0,
    currentMap: "daily_life_town",
    currentQuestId: learningLanguage === "zh" ? "zh_greeting_001" : "greeting_001",
    completedQuests: [],
    learnedWords: [],
    badges: [],
    streak: 0,
    lastPlayedDate: "",
    createdAt: now,
    updatedAt: now
  };
}

function renderStartScreen() {
  const savedPlayer = loadPlayer();
  const continueButton = document.getElementById("continueGameButton");
  const startStatus = document.getElementById("startStatus");

  continueButton.disabled = !savedPlayer;
  startStatus.textContent = savedPlayer
    ? `Saved character: ${savedPlayer.name}`
    : "No saved character found.";
  navigateTo("start");
}

function renderCreateCharacterScreen() {
  document.getElementById("characterForm").reset();
  clearValidationMessages();
  navigateTo("character");
  document.getElementById("playerName").focus();
}

function renderMainGameScreen(player = currentPlayer) {
  if (!player) {
    renderStartScreen();
    return;
  }

  currentPlayer = player;
  const avatar = avatarLabels[player.avatar] || avatarLabels.scholar;

  setText("welcomeMessage", `Welcome, ${player.name}!`);
  setText("mainAvatar", avatar.icon);
  setText("mainAvatarName", avatar.label);
  setText("mainNativeLanguage", languageLabels[player.nativeLanguage] || player.nativeLanguage);
  setText("mainLearningLanguage", languageLabels[player.learningLanguage] || player.learningLanguage);
  setText("mainDifficulty", difficultyLabels[player.difficulty] || player.difficulty);
  setText("mainLearningGoal", learningGoalLabels[player.learningGoal] || player.learningGoal);
  setText("mainDailyGoal", `${player.dailyGoalMinutes} minutes/day`);
  setText("mainLevel", player.level);
  setText("mainExp", player.exp);
  setText("mainCoins", player.coins);
  setText("mainMap", formatIdentifier(player.currentMap));
  setText("mainQuest", player.currentQuestId);
  setText("mainStreak", `${player.streak} ${player.streak === 1 ? "day" : "days"}`);
  navigateTo("main");
}

function validateCharacterForm() {
  clearValidationMessages();
  const form = document.getElementById("characterForm");
  const formData = new FormData(form);
  const rawName = String(formData.get("playerName") || "");
  let isValid = true;
  let firstInvalidField = null;

  function invalidate(fieldId, errorId, message) {
    isValid = false;
    document.getElementById(errorId).textContent = message;
    document.getElementById(fieldId).setAttribute("aria-invalid", "true");
    firstInvalidField ||= document.getElementById(fieldId);
  }

  if (rawName.length === 0) {
    invalidate("playerName", "playerNameError", "Please enter your character name.");
  } else if (rawName.trim().length === 0) {
    invalidate("playerName", "playerNameError", "Please enter a valid character name.");
  } else if (rawName.trim().length > 20) {
    invalidate("playerName", "playerNameError", "Name must be 20 characters or less.");
  }

  if (!formData.get("learningLanguage")) {
    invalidate("learningLanguage", "learningLanguageError", "Please select a language to learn.");
  }

  if (!formData.get("difficulty")) {
    invalidate("difficulty", "difficultyError", "Please select your starting level.");
  }

  if (!formData.get("avatar")) {
    invalidate("avatarScholar", "avatarError", "Please select your avatar.");
  }

  if (!formData.get("learningGoal")) {
    invalidate("learningGoal", "learningGoalError", "Please select your learning goal.");
  }

  if (!formData.get("dailyGoalMinutes")) {
    invalidate("dailyGoalMinutes", "dailyGoalError", "Please select your daily study goal.");
  }

  if (firstInvalidField) {
    firstInvalidField.focus();
  }

  return isValid;
}

function navigateTo(screenName) {
  Object.entries(screenIds).forEach(([name, id]) => {
    document.getElementById(id).classList.toggle("hidden", name !== screenName);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearValidationMessages() {
  document.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
  document.querySelectorAll("[aria-invalid]").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function setText(elementId, value) {
  document.getElementById(elementId).textContent = String(value);
}

function formatIdentifier(value) {
  return String(value || "")
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function handleCharacterSubmit(event) {
  event.preventDefault();

  if (!validateCharacterForm()) {
    return;
  }

  const player = createPlayer(new FormData(event.currentTarget));
  const savedPlayer = savePlayer(player);

  if (savedPlayer) {
    renderMainGameScreen(savedPlayer);
  }
}

function continueGame() {
  const savedPlayer = loadPlayer();

  if (savedPlayer) {
    renderMainGameScreen(savedPlayer);
  } else {
    renderStartScreen();
  }
}

document.getElementById("startGameButton").addEventListener("click", renderCreateCharacterScreen);
document.getElementById("continueGameButton").addEventListener("click", continueGame);
document.getElementById("startResetButton").addEventListener("click", resetGame);
document.getElementById("characterBackButton").addEventListener("click", renderStartScreen);
document.getElementById("formBackButton").addEventListener("click", renderStartScreen);
document.getElementById("characterForm").addEventListener("submit", handleCharacterSubmit);
document.getElementById("mainBackButton").addEventListener("click", renderStartScreen);
document.getElementById("mainResetButton").addEventListener("click", resetGame);

renderStartScreen();
