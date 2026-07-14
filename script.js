"use strict";

const STORAGE_KEY = "linguaLifeSave";
const screenIds = {
  start: "startScreen",
  character: "characterScreen",
  main: "mainGameScreen",
  quest: "questScreen",
  vocabulary: "vocabularyScreen",
  languageSwitch: "languageSwitchScreen"
};

const fallbackLanguageConfig = {
  vi: { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳", direction: "ltr", learningAvailable: false },
  en: { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", direction: "ltr", learningAvailable: true },
  zh: { code: "zh", label: "Chinese", nativeLabel: "中文", flag: "🇨🇳", direction: "ltr", showPinyin: true, learningAvailable: true }
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
const levelThresholds = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600];

let currentPlayer = null;
let activeQuest = null;
let currentStepIndex = 0;
let selectedAnswerState = null;
let currentVocabularyFilter = "all";
let currentVocabularyLanguageFilter = "current";
let activeFlashcards = [];
let currentFlashcardIndex = 0;
let isFlashcardFlipped = false;
let flashcardReviewedCount = 0;

function normalizeVocabularyId(word, language) {
  const rawWord = String(word || "");
  let normalizedWord = rawWord
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalizedWord) {
    normalizedWord = Array.from(rawWord)
      .map((character) => character.codePointAt(0).toString(16))
      .join("_");
  }

  return `${language}_${normalizedWord || "word"}`;
}

function normalizeLearnedWord(wordItem, fallbackLanguage) {
  if (!wordItem) {
    return null;
  }

  if (typeof wordItem === "string") {
    return {
      id: normalizeVocabularyId(wordItem, fallbackLanguage),
      questId: "",
      language: fallbackLanguage,
      word: wordItem,
      meaning: "",
      example: "",
      reviewCount: 0,
      lastReviewedAt: "",
      isFavorite: false
    };
  }

  if (typeof wordItem !== "object" || !wordItem.word) {
    return null;
  }

  const language = wordItem.language || fallbackLanguage;

  return {
    id: wordItem.id || normalizeVocabularyId(wordItem.word, language),
    questId: wordItem.questId || "",
    language,
    word: wordItem.word,
    pinyin: wordItem.pinyin || "",
    meaning: wordItem.meaning || "",
    example: wordItem.example || "",
    reviewCount: Number.isFinite(Number(wordItem.reviewCount)) ? Number(wordItem.reviewCount) : 0,
    lastReviewedAt: wordItem.lastReviewedAt || "",
    isFavorite: Boolean(wordItem.isFavorite)
  };
}

function normalizeLearnedWords(learnedWords, fallbackLanguage) {
  if (!Array.isArray(learnedWords)) {
    return [];
  }

  const seen = new Set();
  const normalizedWords = [];

  learnedWords.forEach((wordItem) => {
    const normalizedWord = normalizeLearnedWord(wordItem, fallbackLanguage);

    if (!normalizedWord) {
      return;
    }

    const duplicateKey = `${normalizedWord.language}::${normalizedWord.word}`;
    if (seen.has(duplicateKey)) {
      return;
    }

    seen.add(duplicateKey);
    normalizedWords.push(normalizedWord);
  });

  return normalizedWords;
}

function getLanguageConfig(languageCode) {
  const configs = typeof languageConfig === "object" && languageConfig
    ? languageConfig
    : fallbackLanguageConfig;
  return configs[languageCode] || configs.en || fallbackLanguageConfig.en;
}

function getLanguageLabel(languageCode) {
  return getLanguageConfig(languageCode).label;
}

function formatLanguageDisplay(languageCode) {
  const config = getLanguageConfig(languageCode);
  return `${config.label} ${config.flag || ""}`.trim();
}

function getAvailableLearningLanguages() {
  const configs = typeof languageConfig === "object" && languageConfig
    ? languageConfig
    : fallbackLanguageConfig;
  return Object.values(configs).filter((config) => config.learningAvailable);
}

function isValidLearningLanguage(languageCode) {
  return getAvailableLearningLanguages().some((config) => config.code === languageCode);
}

function getFirstQuestIdByLanguage(languageCode) {
  const firstQuest = getQuestsByLanguage(languageCode)[0];
  return firstQuest ? firstQuest.id : "";
}

function getLatestAvailableQuestIdByLanguage(languageCode) {
  const quests = getQuestsByLanguage(languageCode);
  const availableQuests = quests.filter((quest) => isQuestAvailable(quest, currentPlayer));
  const latestQuest = availableQuests[availableQuests.length - 1] || quests[0];
  return latestQuest ? latestQuest.id : "";
}

function isQuestLanguage(questId, languageCode) {
  const quest = getQuestById(questId);
  return Boolean(quest && quest.language === languageCode);
}

function getPlayerProgressByLanguage(languageCode) {
  return {
    language: languageCode,
    completedQuests: getCompletedQuestCountByLanguage(languageCode),
    totalQuests: getTotalQuestCountByLanguage(languageCode),
    learnedWords: getLearnedWordsCountByLanguage(languageCode)
  };
}

function getBadgeDefinitions() {
  return [
    {
      id: "first_quest",
      title: "First Step",
      description: "Complete your first quest.",
      icon: "🌟",
      conditionType: "completedQuestCount",
      conditionValue: 1
    },
    {
      id: "daily_learner",
      title: "Daily Learner",
      description: "Reach a 3-day learning streak.",
      icon: "🔥",
      conditionType: "streak",
      conditionValue: 3
    },
    {
      id: "five_day_hero",
      title: "5-Day Hero",
      description: "Reach a 5-day learning streak.",
      icon: "🏆",
      conditionType: "streak",
      conditionValue: 5
    },
    {
      id: "vocabulary_collector",
      title: "Vocabulary Collector",
      description: "Learn 10 words.",
      icon: "📚",
      conditionType: "learnedWordsCount",
      conditionValue: 10
    },
    {
      id: "flashcard_starter",
      title: "Flashcard Starter",
      description: "Review 5 words total.",
      icon: "🧠",
      conditionType: "reviewCount",
      conditionValue: 5
    },
    {
      id: "english_beginner",
      title: "English Beginner",
      description: "Complete all 5 English MVP quests.",
      icon: "🇬🇧",
      conditionType: "completedQuestSet",
      conditionValue: ["greeting_001", "coffee_001", "food_001", "direction_001", "introduce_001"]
    },
    {
      id: "chinese_beginner",
      title: "Chinese Beginner",
      description: "Complete all 5 Chinese MVP quests.",
      icon: "🇨🇳",
      conditionType: "completedQuestSet",
      conditionValue: ["zh_greeting_001", "zh_coffee_001", "zh_food_001", "zh_direction_001", "zh_introduce_001"]
    },
    {
      id: "level_2_adventurer",
      title: "Level 2 Adventurer",
      description: "Reach Level 2.",
      icon: "⚔️",
      conditionType: "level",
      conditionValue: 2
    },
    {
      id: "level_5_scholar",
      title: "Level 5 Scholar",
      description: "Reach Level 5.",
      icon: "🎓",
      conditionType: "level",
      conditionValue: 5
    }
  ];
}

function normalizePlayer(player) {
  if (!player || typeof player !== "object") {
    return null;
  }

  const configs = typeof languageConfig === "object" && languageConfig
    ? languageConfig
    : fallbackLanguageConfig;
  const nativeLanguage = configs[player.nativeLanguage] ? player.nativeLanguage : "vi";
  const learningLanguage = isValidLearningLanguage(player.learningLanguage)
    ? player.learningLanguage
    : "en";

  return {
    ...player,
    nativeLanguage,
    learningLanguage,
    level: Math.max(Number.isFinite(Number(player.level)) ? Number(player.level) : 1, getLevelFromExp(player.exp)),
    exp: Number.isFinite(Number(player.exp)) ? Number(player.exp) : 0,
    coins: Number.isFinite(Number(player.coins)) ? Number(player.coins) : 0,
    currentMap: player.currentMap || "daily_life_town",
    currentQuestId: player.currentQuestId || (learningLanguage === "zh" ? "zh_greeting_001" : "greeting_001"),
    completedQuests: Array.isArray(player.completedQuests) ? player.completedQuests : [],
    learnedWords: normalizeLearnedWords(player.learnedWords, learningLanguage),
    badges: Array.isArray(player.badges) ? player.badges : [],
    rewardHistory: Array.isArray(player.rewardHistory) ? player.rewardHistory : [],
    claimedQuestRewards: Array.isArray(player.claimedQuestRewards) ? player.claimedQuestRewards : [],
    streak: Number.isFinite(Number(player.streak)) ? Number(player.streak) : 0
  };
}

function savePlayer(player) {
  if (!player || typeof player !== "object") {
    return null;
  }

  const savedPlayer = normalizePlayer({
    ...player,
    updatedAt: new Date().toISOString()
  });

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

    return normalizePlayer(JSON.parse(rawPlayer));
  } catch (error) {
    console.warn("Lingua Life RPG could not load player data.", error);
    return null;
  }
}

function getLevelFromExp(exp) {
  const safeExp = Number(exp || 0);
  let level = 1;

  levelThresholds.forEach((threshold, index) => {
    if (safeExp >= threshold) {
      level = index + 1;
    }
  });

  return Math.min(level, levelThresholds.length);
}

function getCurrentLevelInfo(exp) {
  const level = getLevelFromExp(exp);
  const currentLevelExp = levelThresholds[level - 1];
  const nextLevelExp = getNextLevelExp(level);
  const isMaxLevel = level >= levelThresholds.length;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, ((Number(exp || 0) - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100));

  return {
    level,
    currentLevelExp,
    nextLevelExp,
    isMaxLevel,
    progressPercent
  };
}

function getNextLevelExp(level) {
  return level >= levelThresholds.length
    ? levelThresholds[levelThresholds.length - 1]
    : levelThresholds[level];
}

function checkLevelUp(oldLevel, newLevel) {
  return Number(newLevel) > Number(oldLevel);
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateDailyStreak() {
  if (!currentPlayer) {
    return [];
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  let streak = Number(currentPlayer.streak || 0);

  if (!currentPlayer.lastPlayedDate) {
    streak = Math.max(1, streak);
  } else if (currentPlayer.lastPlayedDate === today) {
    return [];
  } else if (currentPlayer.lastPlayedDate === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  currentPlayer = savePlayer({
    ...currentPlayer,
    streak,
    lastPlayedDate: today
  }) || currentPlayer;

  return checkAndUnlockBadges();
}

function renderStreakInfo() {
  if (!currentPlayer) {
    return;
  }

  const streak = Number(currentPlayer.streak || 0);
  setText("mainStreak", `${streak} ${streak === 1 ? "day" : "days"}`);
  setText("summaryStreak", `${streak} ${streak === 1 ? "day" : "days"}`);

  if (streak >= 7) {
    setText("streakMessage", "Amazing! You are building a strong habit.");
  } else if (streak >= 2) {
    setText("streakMessage", "Great streak! Keep learning every day.");
  } else {
    setText("streakMessage", "Your language journey starts today.");
  }
}

function renderLevelProgressBar() {
  if (!currentPlayer) {
    return;
  }

  const levelInfo = getCurrentLevelInfo(currentPlayer.exp);
  const progressFill = document.getElementById("levelProgressFill");

  setText("mainLevel", levelInfo.level);
  progressFill.style.width = `${levelInfo.progressPercent}%`;

  if (levelInfo.isMaxLevel) {
    setText("levelProgressText", "Max Level Reached");
  } else {
    setText("levelProgressText", `EXP: ${currentPlayer.exp} / ${levelInfo.nextLevelExp}`);
  }
}

function addRewardHistory(quest, exp, coins) {
  const rewardHistory = Array.isArray(currentPlayer.rewardHistory)
    ? [...currentPlayer.rewardHistory]
    : [];

  rewardHistory.push({
    id: `reward_${Date.now()}`,
    type: "quest",
    questId: quest.id,
    title: quest.title,
    exp,
    coins,
    createdAt: new Date().toISOString()
  });

  currentPlayer = savePlayer({ ...currentPlayer, rewardHistory }) || currentPlayer;
}

function getRewardHistory() {
  return currentPlayer && Array.isArray(currentPlayer.rewardHistory)
    ? currentPlayer.rewardHistory
    : [];
}

function showRewardPopup(rewardData) {
  const popup = document.getElementById("rewardPopup");
  const rewards = document.getElementById("rewardPopupRewards");
  const level = document.getElementById("rewardPopupLevel");
  const badges = document.getElementById("rewardPopupBadges");

  rewards.replaceChildren();
  level.replaceChildren();
  badges.replaceChildren();

  setText("rewardPopupTitle", rewardData.isReplay ? "Quest replay completed." : "Quest Completed!");
  setText("rewardPopupQuestTitle", rewardData.quest.title);
  setText("rewardPopupVocabulary", rewardData.isReplay
    ? "Rewards were already claimed."
    : rewardData.vocabularyMessage);

  if (rewardData.isReplay) {
    const replayMessage = document.createElement("span");
    replayMessage.textContent = "Rewards were already claimed.";
    rewards.appendChild(replayMessage);
  } else {
    const exp = document.createElement("span");
    const coins = document.createElement("span");
    exp.textContent = `+${rewardData.exp} EXP`;
    coins.textContent = `+${rewardData.coins} Coins`;
    rewards.append(exp, coins);
  }

  if (rewardData.leveledUp) {
    const title = document.createElement("h3");
    const message = document.createElement("p");
    title.textContent = "Level Up!";
    message.textContent = `You reached Level ${rewardData.newLevel}.`;
    level.append(title, message);
  }

  if (rewardData.newBadges && rewardData.newBadges.length) {
    const title = document.createElement("h3");
    const list = document.createElement("div");
    title.textContent = "New Badge Unlocked:";
    list.className = "reward-badge-list";
    rewardData.newBadges.forEach((badge) => {
      const item = document.createElement("span");
      item.textContent = `${badge.icon} ${badge.title}`;
      list.appendChild(item);
    });
    badges.append(title, list);
  }

  popup.classList.remove("hidden");
}

function closeRewardPopup() {
  document.getElementById("rewardPopup").classList.add("hidden");
  returnToMap();
}

function getCompletedQuestCount() {
  return currentPlayer && Array.isArray(currentPlayer.completedQuests)
    ? currentPlayer.completedQuests.length
    : 0;
}

function getLearnedWordsCount() {
  return currentPlayer && Array.isArray(currentPlayer.learnedWords)
    ? currentPlayer.learnedWords.length
    : 0;
}

function getTotalVocabularyReviewCount() {
  return currentPlayer && Array.isArray(currentPlayer.learnedWords)
    ? currentPlayer.learnedWords.reduce((total, item) => total + Number(item.reviewCount || 0), 0)
    : 0;
}

function getUnlockedBadgeCount() {
  return currentPlayer && Array.isArray(currentPlayer.badges)
    ? currentPlayer.badges.length
    : 0;
}

function hasBadge(badgeId) {
  return Boolean(
    currentPlayer &&
    Array.isArray(currentPlayer.badges) &&
    currentPlayer.badges.includes(badgeId)
  );
}

function unlockBadge(badge) {
  if (!badge || hasBadge(badge.id)) {
    return false;
  }

  const badges = Array.isArray(currentPlayer.badges)
    ? [...currentPlayer.badges]
    : [];
  badges.push(badge.id);
  currentPlayer = savePlayer({ ...currentPlayer, badges }) || currentPlayer;
  return true;
}

function checkAndUnlockBadges() {
  if (!currentPlayer) {
    return [];
  }

  const newlyUnlocked = [];

  getBadgeDefinitions().forEach((badge) => {
    if (hasBadge(badge.id) || !isBadgeConditionMet(badge)) {
      return;
    }

    if (unlockBadge(badge)) {
      newlyUnlocked.push(badge);
    }
  });

  return newlyUnlocked;
}

function isBadgeConditionMet(badge) {
  if (badge.conditionType === "completedQuestCount") {
    return getCompletedQuestCount() >= badge.conditionValue;
  }

  if (badge.conditionType === "streak") {
    return Number(currentPlayer.streak || 0) >= badge.conditionValue;
  }

  if (badge.conditionType === "learnedWordsCount") {
    return getLearnedWordsCount() >= badge.conditionValue;
  }

  if (badge.conditionType === "reviewCount") {
    return getTotalVocabularyReviewCount() >= badge.conditionValue;
  }

  if (badge.conditionType === "completedQuestSet") {
    return badge.conditionValue.every((questId) => currentPlayer.completedQuests.includes(questId));
  }

  if (badge.conditionType === "level") {
    return Number(currentPlayer.level || 1) >= badge.conditionValue;
  }

  return false;
}

function getUnlockedBadges() {
  return getBadgeDefinitions().filter((badge) => hasBadge(badge.id));
}

function renderAchievementSummary() {
  const badgeTotal = getBadgeDefinitions().length;
  const unlockedBadgeCount = getUnlockedBadgeCount();

  setText("summaryLevel", currentPlayer.level);
  setText("summaryExp", currentPlayer.exp);
  setText("summaryCoins", currentPlayer.coins);
  setText("summaryCompletedQuests", getCompletedQuestCount());
  setText("summaryLearnedWords", getLearnedWordsCount());
  setText("summaryReviewedWords", getTotalVocabularyReviewCount());
  setText("summaryBadges", `${unlockedBadgeCount} / ${badgeTotal}`);
  setText("achievementBadgeCount", `Badges: ${unlockedBadgeCount} / ${badgeTotal}`);
}

function renderBadgesSection() {
  const badgesGrid = document.getElementById("badgesGrid");
  badgesGrid.replaceChildren();

  getBadgeDefinitions().forEach((badge) => {
    const card = document.createElement("article");
    const icon = document.createElement("span");
    const title = document.createElement("h4");
    const description = document.createElement("p");
    const status = document.createElement("strong");
    const isUnlocked = hasBadge(badge.id);

    card.className = `badge-card${isUnlocked ? " badge-unlocked" : " badge-locked"}`;
    icon.className = "badge-icon";
    icon.textContent = isUnlocked ? badge.icon : "🔒";
    title.textContent = badge.title;
    description.textContent = badge.description;
    status.textContent = isUnlocked ? "Status: Unlocked" : "Status: Locked";

    card.append(icon, title, description, status);
    badgesGrid.appendChild(card);
  });
}

function renderLanguageSettings() {
  if (!currentPlayer) {
    return;
  }

  setText("languageNativeDisplay", formatLanguageDisplay(currentPlayer.nativeLanguage));
  setText("languageLearningDisplay", formatLanguageDisplay(currentPlayer.learningLanguage));
}

function renderLanguageSwitchScreen() {
  if (!currentPlayer) {
    renderStartScreen();
    return;
  }

  const options = document.getElementById("languageSwitchOptions");
  options.replaceChildren();
  setText("currentLanguageSwitchLabel", `Current language: ${formatLanguageDisplay(currentPlayer.learningLanguage)}`);

  Object.values(typeof languageConfig === "object" && languageConfig ? languageConfig : fallbackLanguageConfig)
    .forEach((config) => {
      const button = document.createElement("button");
      button.className = config.learningAvailable ? "button button-secondary" : "button button-quiet";
      button.type = "button";
      button.disabled = !config.learningAvailable || config.code === currentPlayer.learningLanguage;
      button.textContent = config.learningAvailable
        ? `Switch to ${formatLanguageDisplay(config.code)}`
        : `${formatLanguageDisplay(config.code)} - Coming Soon`;

      if (config.learningAvailable) {
        button.addEventListener("click", () => switchLearningLanguage(config.code));
      }

      options.appendChild(button);
    });

  navigateTo("languageSwitch");
}

function switchLearningLanguage(languageCode) {
  if (!currentPlayer || !isValidLearningLanguage(languageCode)) {
    return;
  }

  const latestQuestId = getLatestAvailableQuestIdByLanguage(languageCode) || getFirstQuestIdByLanguage(languageCode);
  currentPlayer = savePlayer({
    ...currentPlayer,
    learningLanguage: languageCode,
    currentQuestId: isQuestLanguage(currentPlayer.currentQuestId, languageCode)
      ? currentPlayer.currentQuestId
      : latestQuestId
  }) || currentPlayer;
  currentVocabularyLanguageFilter = "current";
  renderMainGameScreen();
}

function getCompletedQuestCountByLanguage(languageCode) {
  return getQuestsByLanguage(languageCode)
    .filter((quest) => currentPlayer.completedQuests.includes(quest.id))
    .length;
}

function getTotalQuestCountByLanguage(languageCode) {
  return getQuestsByLanguage(languageCode).length;
}

function getLearnedWordsCountByLanguage(languageCode) {
  return currentPlayer && Array.isArray(currentPlayer.learnedWords)
    ? currentPlayer.learnedWords.filter((word) => word.language === languageCode).length
    : 0;
}

function renderLanguageProgressSummary() {
  const grid = document.getElementById("languageProgressGrid");
  grid.replaceChildren();

  ["en", "zh"].forEach((languageCode) => {
    const progress = getPlayerProgressByLanguage(languageCode);
    const card = document.createElement("article");
    const title = document.createElement("h4");
    const quests = document.createElement("p");
    const words = document.createElement("p");

    card.className = "language-progress-card";
    title.textContent = formatLanguageDisplay(languageCode);
    quests.textContent = `Completed Quests: ${progress.completedQuests} / ${progress.totalQuests}`;
    words.textContent = `Learned Words: ${progress.learnedWords}`;
    card.append(title, quests, words);
    grid.appendChild(card);
  });
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
  activeQuest = null;
  currentStepIndex = 0;
  selectedAnswerState = null;
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
    rewardHistory: [],
    claimedQuestRewards: [],
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

function getQuestById(questId) {
  return questData.find((quest) => quest.id === questId) || null;
}

function getQuestsByLanguage(language) {
  return questData
    .filter((quest) => quest.language === language && quest.mapId === "daily_life_town")
    .sort((first, second) => first.order - second.order);
}

function isQuestCompleted(questId, player) {
  return Boolean(
    player &&
    Array.isArray(player.completedQuests) &&
    player.completedQuests.includes(questId)
  );
}

function isQuestAvailable(quest, player) {
  return Boolean(
    quest &&
    player &&
    (quest.requiredQuestId === null || isQuestCompleted(quest.requiredQuestId, player))
  );
}

function getQuestStatus(quest, player) {
  if (isQuestCompleted(quest.id, player)) {
    return "Completed";
  }

  return isQuestAvailable(quest, player) ? "Available" : "Locked";
}

function renderMainGameScreen() {
  let player = currentPlayer || loadPlayer();

  if (!player) {
    renderStartScreen();
    return;
  }

  currentPlayer = player;
  updateDailyStreak();
  player = currentPlayer;
  const avatar = avatarLabels[player.avatar] || avatarLabels.scholar;

  setText("welcomeMessage", `Welcome, ${player.name}!`);
  setText("mainAvatar", avatar.icon);
  setText("mainAvatarName", avatar.label);
  setText("mainNativeLanguage", formatLanguageDisplay(player.nativeLanguage));
  setText("mainLearningLanguage", formatLanguageDisplay(player.learningLanguage));
  setText("mainDifficulty", difficultyLabels[player.difficulty] || player.difficulty);
  setText("mainLearningGoal", learningGoalLabels[player.learningGoal] || player.learningGoal);
  setText("mainDailyGoal", `${player.dailyGoalMinutes} minutes/day`);
  setText("mainExp", player.exp);
  setText("mainCoins", player.coins);
  setText("mainMap", formatIdentifier(player.currentMap));
  setText("mainQuest", player.currentQuestId);
  renderLevelProgressBar();
  renderStreakInfo();
  renderAchievementSummary();
  renderBadgesSection();
  renderLanguageSettings();
  renderLanguageProgressSummary();
  renderDailyLifeTownMap();
  navigateTo("main");
}

function renderDailyLifeTownMap() {
  const questCards = document.getElementById("questCards");
  const quests = getQuestsByLanguage(currentPlayer.learningLanguage);
  const completedCount = quests.filter((quest) => isQuestCompleted(quest.id, currentPlayer)).length;

  questCards.replaceChildren();
  if (!quests.length) {
    setText("questProgress", "0 of 0 completed");
    setText("questMessage", "No quests are available for this language yet.");
    return;
  }

  quests.forEach((quest) => {
    questCards.appendChild(renderQuestCard(quest));
  });

  setText("questProgress", `${completedCount} of ${quests.length} completed`);
  setText("questMessage", "Choose an available quest to prepare your next adventure.");
}

function renderQuestCard(quest) {
  const status = getQuestStatus(quest, currentPlayer);
  const card = document.createElement("article");
  const cardHeader = document.createElement("div");
  const order = document.createElement("span");
  const statusBadge = document.createElement("span");
  const title = document.createElement("h4");
  const description = document.createElement("p");
  const rewards = document.createElement("div");
  const expReward = document.createElement("span");
  const coinReward = document.createElement("span");
  const actionButton = document.createElement("button");

  card.className = `quest-card quest-${status.toLowerCase()}`;
  cardHeader.className = "quest-card-header";
  order.className = "quest-order";
  statusBadge.className = "quest-status";
  rewards.className = "quest-rewards";
  actionButton.className = status === "Available"
    ? "button button-primary"
    : "button button-secondary";

  order.textContent = `Quest ${quest.order}`;
  statusBadge.textContent = status;
  title.textContent = quest.title;
  description.textContent = quest.description;
  expReward.textContent = `+${quest.rewardExp} EXP`;
  coinReward.textContent = `+${quest.rewardCoins} Coins`;
  actionButton.type = "button";

  if (status === "Locked") {
    actionButton.textContent = "Locked";
    actionButton.disabled = true;
  } else {
    actionButton.textContent = status === "Completed" ? "Replay" : "Start Quest";
    actionButton.addEventListener("click", () => startQuest(quest.id));
  }

  cardHeader.append(order, statusBadge);
  rewards.append(expReward, coinReward);
  card.append(cardHeader, title, description, rewards, actionButton);
  return card;
}

function startQuest(questId) {
  const quest = getQuestById(questId);

  if (
    !quest ||
    !currentPlayer ||
    quest.language !== currentPlayer.learningLanguage ||
    getQuestStatus(quest, currentPlayer) === "Locked"
  ) {
    return;
  }

  if (!Array.isArray(quest.steps) || quest.steps.length === 0) {
    currentPlayer = savePlayer({
      ...currentPlayer,
      currentQuestId: quest.id
    }) || currentPlayer;
    setText("mainQuest", currentPlayer.currentQuestId);
    setText("questMessage", "This quest is not ready yet.");
    return;
  }

  currentPlayer = savePlayer({
    ...currentPlayer,
    currentQuestId: quest.id
  }) || currentPlayer;
  activeQuest = quest;
  currentStepIndex = 0;
  selectedAnswerState = null;
  renderQuestScreen();
}

function renderQuestScreen() {
  if (!activeQuest || !currentPlayer) {
    returnToMap();
    return;
  }

  setText("questScreenTitle", activeQuest.title);
  setText("questScreenDescription", activeQuest.description);
  setText("questPlayerName", currentPlayer.name);
  setText("questPlayerExp", currentPlayer.exp);
  setText("questPlayerCoins", currentPlayer.coins);
  setText("questRewardPreview", `+${activeQuest.rewardExp} EXP / +${activeQuest.rewardCoins} Coins`);
  document.getElementById("questStepPanel").classList.remove("hidden");
  document.getElementById("questCompletePanel").classList.add("hidden");
  renderQuestStep();
  navigateTo("quest");
}

function renderQuestStep() {
  if (!activeQuest || !Array.isArray(activeQuest.steps)) {
    returnToMap();
    return;
  }

  const step = activeQuest.steps[currentStepIndex];

  if (!step) {
    completeQuest();
    return;
  }

  const stepContent = document.getElementById("questStepContent");
  const choiceOptions = document.getElementById("questChoiceOptions");
  const stepActions = document.getElementById("questStepActions");

  setText("questStepProgress", `Step ${currentStepIndex + 1} of ${activeQuest.steps.length}`);
  setText("questFeedback", "");
  setText("questHint", "");
  document.getElementById("questFeedback").className = "quest-feedback";
  choiceOptions.replaceChildren();
  stepActions.replaceChildren();
  stepContent.replaceChildren();

  if (step.type === "dialogue") {
    setText("questSpeakerLabel", `${step.speaker || "Guide"}:`);
    const dialogue = document.createElement("p");
    const nextButton = document.createElement("button");

    dialogue.className = "quest-dialogue-text";
    dialogue.textContent = step.text || "";
    nextButton.className = "button button-primary";
    nextButton.type = "button";
    nextButton.textContent = currentStepIndex === activeQuest.steps.length - 1 ? "Finish" : "Next";
    nextButton.addEventListener("click", handleDialogueNext);

    stepContent.appendChild(dialogue);
    stepActions.appendChild(nextButton);
    return;
  }

  if (step.type === "choice") {
    setText("questSpeakerLabel", "Question:");
    const question = document.createElement("p");

    question.className = "quest-question-text";
    question.textContent = step.question || "";
    stepContent.appendChild(question);

    (step.options || []).forEach((option) => {
      const optionButton = document.createElement("button");
      optionButton.className = "button button-quiet quest-choice-button";
      optionButton.type = "button";
      optionButton.textContent = option;
      optionButton.addEventListener("click", () => handleChoiceAnswer(option));
      choiceOptions.appendChild(optionButton);
    });
    return;
  }

  showQuestHint("This quest step type is not supported yet.");
}

function handleDialogueNext() {
  currentStepIndex += 1;
  selectedAnswerState = null;
  renderQuestStep();
}

function handleChoiceAnswer(selectedAnswer) {
  if (!activeQuest) {
    return;
  }

  const step = activeQuest.steps[currentStepIndex];

  if (!step || step.type !== "choice") {
    return;
  }

  selectedAnswerState = selectedAnswer;

  if (selectedAnswer === step.correctAnswer) {
    const continueButton = document.createElement("button");

    setText("questFeedback", "Correct!");
    document.getElementById("questFeedback").className = "quest-feedback quest-feedback-correct";
    setText("questHint", "");
    continueButton.className = "button button-primary";
    continueButton.type = "button";
    continueButton.textContent = currentStepIndex === activeQuest.steps.length - 1 ? "Finish Quest" : "Continue";
    continueButton.addEventListener("click", handleDialogueNext);
    document.getElementById("questStepActions").replaceChildren(continueButton);
    document.querySelectorAll(".quest-choice-button").forEach((button) => {
      button.disabled = true;
      button.classList.toggle("choice-selected", button.textContent === selectedAnswer);
    });
    return;
  }

  document.getElementById("questFeedback").className = "quest-feedback quest-feedback-wrong";
  showQuestHint(step.hint || "Try a different answer.");
}

function showQuestHint(message) {
  setText("questFeedback", "Not quite. Try again.");
  setText("questHint", message);
}

function completeQuest() {
  if (!activeQuest || !currentPlayer) {
    returnToMap();
    return;
  }

  const rewardAlreadyClaimed = hasRewardAlreadyClaimed(activeQuest.id);
  const oldLevel = Number(currentPlayer.level || 1);
  const addedVocabularyCount = addVocabularyFromQuest(activeQuest);
  const completionResult = addCompletedQuest(activeQuest.id);
  currentPlayer = completionResult.player;
  let rewardData = {
    quest: activeQuest,
    exp: 0,
    coins: 0,
    isReplay: rewardAlreadyClaimed,
    oldLevel,
    newLevel: oldLevel,
    leveledUp: false,
    newBadges: [],
    vocabularyMessage: addedVocabularyCount > 0
      ? "These words were added to your Vocabulary Book."
      : "These words are already in your Vocabulary Book."
  };

  if (!rewardAlreadyClaimed) {
    rewardData = {
      ...rewardData,
      ...applyQuestReward(activeQuest, oldLevel)
    };
  } else {
    currentPlayer = savePlayer(currentPlayer) || currentPlayer;
  }

  rewardData.newBadges = checkAndUnlockBadges();

  const vocabulary = Array.isArray(activeQuest.vocabulary) ? activeQuest.vocabulary : [];
  const vocabularyList = document.getElementById("questVocabularyList");

  setText("questCompleteTitle", activeQuest.title);
  setText("questCompleteMessage", rewardAlreadyClaimed
    ? "Quest replay completed. Rewards were already claimed."
    : "Quest completed! Rewards claimed.");
  document.getElementById("questCompleteMessage").textContent += addedVocabularyCount > 0
    ? " These words were added to your Vocabulary Book."
    : " These words are already in your Vocabulary Book.";
  setText("questCompleteExp", `+${activeQuest.rewardExp} EXP`);
  setText("questCompleteCoins", `+${activeQuest.rewardCoins} Coins`);
  setText("questPlayerExp", currentPlayer.exp);
  setText("questPlayerCoins", currentPlayer.coins);
  vocabularyList.replaceChildren();

  vocabulary.forEach((item) => {
    const listItem = document.createElement("li");
    const pinyin = item.pinyin ? ` (${item.pinyin})` : "";
    const example = item.example ? ` Example: ${item.example}` : "";
    listItem.textContent = `${item.word}${pinyin} = ${item.meaning}.${example}`;
    vocabularyList.appendChild(listItem);
  });

  document.getElementById("questStepPanel").classList.add("hidden");
  document.getElementById("questCompletePanel").classList.remove("hidden");
  setText("questStepProgress", `Step ${activeQuest.steps.length} of ${activeQuest.steps.length}`);
  showRewardPopup(rewardData);
}

function addCompletedQuest(questId) {
  const completedQuests = Array.isArray(currentPlayer.completedQuests)
    ? [...currentPlayer.completedQuests]
    : [];
  const wasAlreadyCompleted = completedQuests.includes(questId);

  if (!wasAlreadyCompleted) {
    completedQuests.push(questId);
  }

  const savedPlayer = savePlayer({ ...currentPlayer, completedQuests }) || {
    ...currentPlayer,
    completedQuests
  };

  return { player: savedPlayer, wasAlreadyCompleted };
}

function applyQuestReward(quest, oldLevel = Number(currentPlayer.level || 1)) {
  const claimedQuestRewards = Array.isArray(currentPlayer.claimedQuestRewards)
    ? [...currentPlayer.claimedQuestRewards]
    : [];
  const newExp = Number(currentPlayer.exp || 0) + Number(quest.rewardExp || 0);
  const newCoins = Number(currentPlayer.coins || 0) + Number(quest.rewardCoins || 0);
  const newLevel = Math.max(Number(currentPlayer.level || 1), getLevelFromExp(newExp));

  if (!claimedQuestRewards.includes(quest.id)) {
    claimedQuestRewards.push(quest.id);
  }

  currentPlayer = savePlayer({
    ...currentPlayer,
    exp: newExp,
    coins: newCoins,
    level: newLevel,
    claimedQuestRewards
  }) || currentPlayer;

  addRewardHistory(quest, Number(quest.rewardExp || 0), Number(quest.rewardCoins || 0));

  return {
    exp: Number(quest.rewardExp || 0),
    coins: Number(quest.rewardCoins || 0),
    oldLevel,
    newLevel,
    leveledUp: checkLevelUp(oldLevel, newLevel)
  };
}

function hasRewardAlreadyClaimed(questId) {
  return Boolean(
    currentPlayer &&
    Array.isArray(currentPlayer.claimedQuestRewards) &&
    currentPlayer.claimedQuestRewards.includes(questId)
  );
}

function addVocabularyFromQuest(quest) {
  if (!quest || !Array.isArray(quest.vocabulary) || !currentPlayer) {
    return 0;
  }

  let addedCount = 0;

  quest.vocabulary.forEach((wordItem) => {
    if (addLearnedWord(wordItem, quest)) {
      addedCount += 1;
    }
  });

  return addedCount;
}

function addLearnedWord(wordItem, quest) {
  if (!wordItem || !wordItem.word || !quest || isWordAlreadyLearned(wordItem.word, quest.language)) {
    return false;
  }

  const learnedWords = Array.isArray(currentPlayer.learnedWords)
    ? [...currentPlayer.learnedWords]
    : [];
  const learnedWord = normalizeLearnedWord({
    ...wordItem,
    id: normalizeVocabularyId(wordItem.word, quest.language),
    questId: quest.id,
    language: quest.language,
    reviewCount: 0,
    lastReviewedAt: "",
    isFavorite: false
  }, quest.language);

  learnedWords.push(learnedWord);
  currentPlayer = savePlayer({ ...currentPlayer, learnedWords }) || currentPlayer;
  return true;
}

function isWordAlreadyLearned(word, language) {
  return Boolean(
    currentPlayer &&
    Array.isArray(currentPlayer.learnedWords) &&
    currentPlayer.learnedWords.some((item) => item.language === language && item.word === word)
  );
}

function openVocabularyBook() {
  activeQuest = null;
  currentStepIndex = 0;
  selectedAnswerState = null;
  currentVocabularyFilter = "all";
  currentVocabularyLanguageFilter = "current";
  finishFlashcardReview(false);
  renderVocabularyBookScreen();
}

function renderVocabularyBookScreen() {
  const player = currentPlayer || loadPlayer();

  if (!player) {
    renderStartScreen();
    return;
  }

  currentPlayer = player;
  const allWords = getAllLearnedWords();
  const languageWords = getVocabularyByLanguageFilter(allWords, currentVocabularyLanguageFilter);
  const filteredWords = getFilteredVocabularyWords(languageWords);
  const favoriteCount = languageWords.filter((item) => item.isFavorite).length;
  const reviewedCount = languageWords.filter((item) => Number(item.reviewCount) > 0).length;

  setText("vocabularyLanguage", `Showing: ${getVocabularyLanguageFilterLabel(currentVocabularyLanguageFilter)}`);
  setText("vocabularyTotal", languageWords.length);
  setText("vocabularyFavorites", favoriteCount);
  setText("vocabularyReviewed", reviewedCount);
  renderVocabularyLanguageFilter();
  updateVocabularyFilterButtons();
  renderVocabularyList(filteredWords);
  navigateTo("vocabulary");
}

function getAllLearnedWords() {
  return (currentPlayer && Array.isArray(currentPlayer.learnedWords)
    ? currentPlayer.learnedWords
    : [])
    .slice()
    .sort((first, second) => first.word.localeCompare(second.word));
}

function getLearnedWordsByLanguage(language) {
  return getAllLearnedWords()
    .filter((item) => item.language === language)
    .sort((first, second) => first.word.localeCompare(second.word));
}

function setVocabularyLanguageFilter(languageCode) {
  currentVocabularyLanguageFilter = languageCode;
  finishFlashcardReview(false);
  renderVocabularyBookScreen();
}

function getVocabularyByLanguageFilter(words, languageFilter) {
  if (languageFilter === "all") {
    return words;
  }

  if (languageFilter === "current") {
    return words.filter((item) => item.language === currentPlayer.learningLanguage);
  }

  return words.filter((item) => item.language === languageFilter);
}

function renderVocabularyLanguageFilter() {
  document.querySelectorAll(".vocabulary-language-button").forEach((button) => {
    const isActive = button.dataset.languageFilter === currentVocabularyLanguageFilter;
    button.classList.toggle("button-secondary", isActive);
    button.classList.toggle("button-quiet", !isActive);
  });
}

function getVocabularyLanguageFilterLabel(languageFilter) {
  if (languageFilter === "all") {
    return "All Learned Words";
  }

  if (languageFilter === "current") {
    return `Current Language (${formatLanguageDisplay(currentPlayer.learningLanguage)})`;
  }

  return formatLanguageDisplay(languageFilter);
}

function getFilteredVocabularyWords(words) {
  if (currentVocabularyFilter === "favorites") {
    return words.filter((item) => item.isFavorite);
  }

  if (currentVocabularyFilter === "notReviewed") {
    return words.filter((item) => Number(item.reviewCount) === 0);
  }

  if (currentVocabularyFilter === "reviewed") {
    return words.filter((item) => Number(item.reviewCount) > 0);
  }

  return words;
}

function renderVocabularyList(words) {
  const vocabularyList = document.getElementById("vocabularyList");
  vocabularyList.replaceChildren();

  if (!words.length) {
    setText("vocabularyMessage", "No vocabulary learned yet. Complete quests to add words to your Vocabulary Book.");
    return;
  }

  setText("vocabularyMessage", `${words.length} word${words.length === 1 ? "" : "s"} shown.`);
  words.forEach((wordItem) => {
    vocabularyList.appendChild(renderVocabularyCard(wordItem));
  });
}

function renderVocabularyCard(wordItem) {
  const card = document.createElement("article");
  const title = document.createElement("h3");
  const pinyin = document.createElement("p");
  const meaning = document.createElement("p");
  const example = document.createElement("p");
  const quest = document.createElement("p");
  const review = document.createElement("p");
  const actions = document.createElement("div");
  const favoriteButton = document.createElement("button");
  const reviewedButton = document.createElement("button");

  card.className = `vocabulary-card${wordItem.isFavorite ? " vocabulary-card-favorite" : ""}`;
  actions.className = "vocabulary-card-actions";
  title.textContent = wordItem.word;
  meaning.innerHTML = `<strong>Meaning:</strong> ${wordItem.meaning || "No meaning available."}`;
  example.innerHTML = `<strong>Example:</strong> ${wordItem.example || "No example available."}`;
  quest.innerHTML = `<strong>Quest:</strong> ${getQuestTitle(wordItem.questId)}`;
  review.innerHTML = `<strong>Reviewed:</strong> ${wordItem.reviewCount} ${wordItem.reviewCount === 1 ? "time" : "times"}`;

  if (wordItem.pinyin) {
    pinyin.innerHTML = `<strong>Pinyin:</strong> ${wordItem.pinyin}`;
    card.append(title, pinyin, meaning, example, quest, review);
  } else {
    card.append(title, meaning, example, quest, review);
  }

  favoriteButton.className = wordItem.isFavorite
    ? "button button-primary"
    : "button button-quiet";
  favoriteButton.type = "button";
  favoriteButton.textContent = wordItem.isFavorite ? "Favorite" : "Add Favorite";
  favoriteButton.addEventListener("click", () => toggleFavoriteWord(wordItem.id));

  reviewedButton.className = "button button-secondary";
  reviewedButton.type = "button";
  reviewedButton.textContent = "Mark Reviewed";
  reviewedButton.addEventListener("click", () => markWordReviewed(wordItem.id));

  actions.append(favoriteButton, reviewedButton);
  card.appendChild(actions);
  return card;
}

function toggleFavoriteWord(wordId) {
  updateLearnedWord(wordId, (wordItem) => ({
    ...wordItem,
    isFavorite: !wordItem.isFavorite
  }));
  renderVocabularyBookScreen();
}

function markWordReviewed(wordId) {
  updateLearnedWord(wordId, (wordItem) => ({
    ...wordItem,
    reviewCount: Number(wordItem.reviewCount || 0) + 1,
    lastReviewedAt: new Date().toISOString()
  }));
  checkAndUnlockBadges();
  renderVocabularyBookScreen();
}

function clearVocabularyReviewFilters() {
  currentVocabularyFilter = "all";
  renderVocabularyBookScreen();
}

function updateLearnedWord(wordId, updater) {
  if (!currentPlayer || !Array.isArray(currentPlayer.learnedWords)) {
    return;
  }

  const learnedWords = currentPlayer.learnedWords.map((wordItem) => {
    if (wordItem.id !== wordId) {
      return wordItem;
    }

    return normalizeLearnedWord(updater(wordItem), wordItem.language);
  });

  currentPlayer = savePlayer({ ...currentPlayer, learnedWords }) || currentPlayer;
}

function updateVocabularyFilterButtons() {
  document.querySelectorAll(".vocabulary-filter-button").forEach((button) => {
    const isActive = button.dataset.filter === currentVocabularyFilter;
    button.classList.toggle("button-secondary", isActive);
    button.classList.toggle("button-quiet", !isActive);
  });
}

function getQuestTitle(questId) {
  const quest = getQuestById(questId);
  return quest ? quest.title : (questId || "Unknown Quest");
}

function startFlashcardReview() {
  const words = getFilteredVocabularyWords(getVocabularyByLanguageFilter(getAllLearnedWords(), currentVocabularyLanguageFilter));

  if (!words.length) {
    setText("vocabularyMessage", "No vocabulary available for this review.");
    return;
  }

  activeFlashcards = words;
  currentFlashcardIndex = 0;
  isFlashcardFlipped = false;
  flashcardReviewedCount = 0;
  document.getElementById("flashcardCompletePanel").classList.add("hidden");
  document.getElementById("flashcardPanel").classList.remove("hidden");
  renderFlashcard();
}

function renderFlashcard() {
  const wordItem = activeFlashcards[currentFlashcardIndex];

  if (!wordItem) {
    finishFlashcardReview(true);
    return;
  }

  setText("flashcardProgress", `Card ${currentFlashcardIndex + 1} of ${activeFlashcards.length}`);
  setText("flashcardSideLabel", isFlashcardFlipped ? "Back" : "Front");
  setText("flashcardWord", wordItem.word);
  setText("flashcardPinyin", wordItem.pinyin || "");
  setText("flashcardMeaning", wordItem.meaning || "No meaning available.");
  setText("flashcardExample", wordItem.example || "No example available.");
  setText("flashcardQuest", getQuestTitle(wordItem.questId));
  setText("flashcardMessage", "");

  document.getElementById("flashcardBackContent").classList.toggle("hidden", !isFlashcardFlipped);
  document.getElementById("flipFlashcardButton").classList.toggle("hidden", isFlashcardFlipped);
  document.getElementById("rememberFlashcardButton").classList.toggle("hidden", !isFlashcardFlipped);
  document.getElementById("needReviewFlashcardButton").classList.toggle("hidden", !isFlashcardFlipped);
  document.getElementById("previousFlashcardButton").disabled = currentFlashcardIndex === 0;
  document.getElementById("nextFlashcardButton").disabled = currentFlashcardIndex >= activeFlashcards.length - 1;
}

function flipFlashcard() {
  isFlashcardFlipped = true;
  renderFlashcard();
}

function nextFlashcard() {
  if (currentFlashcardIndex >= activeFlashcards.length - 1) {
    finishFlashcardReview(true);
    return;
  }

  currentFlashcardIndex += 1;
  isFlashcardFlipped = false;
  renderFlashcard();
}

function previousFlashcard() {
  if (currentFlashcardIndex === 0) {
    return;
  }

  currentFlashcardIndex -= 1;
  isFlashcardFlipped = false;
  renderFlashcard();
}

function finishFlashcardReview(showComplete = true) {
  document.getElementById("flashcardPanel").classList.add("hidden");
  document.getElementById("flashcardCompletePanel").classList.toggle("hidden", !showComplete);
  setText("flashcardReviewedCount", flashcardReviewedCount);

  if (showComplete) {
    renderVocabularyBookScreen();
    document.getElementById("flashcardCompletePanel").classList.remove("hidden");
  }
}

function returnToVocabularyBookFromReview() {
  document.getElementById("flashcardCompletePanel").classList.add("hidden");
  document.getElementById("flashcardPanel").classList.add("hidden");
  renderVocabularyBookScreen();
}

function rememberFlashcard() {
  const wordItem = activeFlashcards[currentFlashcardIndex];

  if (!wordItem) {
    finishFlashcardReview(true);
    return;
  }

  updateLearnedWord(wordItem.id, (item) => ({
    ...item,
    reviewCount: Number(item.reviewCount || 0) + 1,
    lastReviewedAt: new Date().toISOString()
  }));
  checkAndUnlockBadges();
  flashcardReviewedCount += 1;
  nextFlashcard();
}

function needReviewFlashcard() {
  setText("flashcardMessage", "No problem. You can review it again later.");
  nextFlashcard();
}

function returnToMap() {
  activeQuest = null;
  currentStepIndex = 0;
  selectedAnswerState = null;
  activeFlashcards = [];
  currentFlashcardIndex = 0;
  isFlashcardFlipped = false;
  flashcardReviewedCount = 0;
  renderMainGameScreen();
}

function markCurrentQuestCompletedForTest() {
  if (!currentPlayer) {
    return;
  }

  const quest = getQuestsByLanguage(currentPlayer.learningLanguage)
    .find((item) => item.id === currentPlayer.currentQuestId);

  if (!quest) {
    setText("questMessage", "Select an available quest before marking it completed.");
    return;
  }

  const completedQuests = Array.isArray(currentPlayer.completedQuests)
    ? [...currentPlayer.completedQuests]
    : [];

  if (!completedQuests.includes(quest.id)) {
    completedQuests.push(quest.id);
  }

  currentPlayer = savePlayer({ ...currentPlayer, completedQuests }) || currentPlayer;
  renderDailyLifeTownMap();
  setText("questMessage", `${quest.title} marked as completed. The next quest is now available.`);
}

function clearCompletedQuestsForTest() {
  if (!currentPlayer) {
    return;
  }

  const firstQuestId = currentPlayer.learningLanguage === "zh"
    ? "zh_greeting_001"
    : "greeting_001";
  currentPlayer = savePlayer({
    ...currentPlayer,
    completedQuests: [],
    currentQuestId: firstQuestId
  }) || currentPlayer;
  setText("mainQuest", currentPlayer.currentQuestId);
  renderDailyLifeTownMap();
  setText("questMessage", "Completed quests cleared. The first quest is available again.");
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
    currentPlayer = savedPlayer;
    renderMainGameScreen();
  }
}

function continueGame() {
  const savedPlayer = loadPlayer();

  if (savedPlayer) {
    currentPlayer = savedPlayer;
    renderMainGameScreen();
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
document.getElementById("vocabularyBookButton").addEventListener("click", openVocabularyBook);
document.getElementById("changeLanguageButton").addEventListener("click", renderLanguageSwitchScreen);
document.getElementById("cancelLanguageSwitchButton").addEventListener("click", renderMainGameScreen);
document.getElementById("mainBackButton").addEventListener("click", renderStartScreen);
document.getElementById("mainResetButton").addEventListener("click", resetGame);
document.getElementById("returnToMapButton").addEventListener("click", returnToMap);
document.getElementById("returnToMapCompleteButton").addEventListener("click", returnToMap);
document.getElementById("closeRewardPopupButton").addEventListener("click", closeRewardPopup);
document.getElementById("returnToMapFromVocabularyButton").addEventListener("click", returnToMap);
document.getElementById("returnToMapFromReviewButton").addEventListener("click", returnToMap);
document.getElementById("startFlashcardButton").addEventListener("click", startFlashcardReview);
document.getElementById("clearVocabularyFiltersButton").addEventListener("click", clearVocabularyReviewFilters);
document.getElementById("backToVocabularyButton").addEventListener("click", returnToVocabularyBookFromReview);
document.getElementById("flipFlashcardButton").addEventListener("click", flipFlashcard);
document.getElementById("rememberFlashcardButton").addEventListener("click", rememberFlashcard);
document.getElementById("needReviewFlashcardButton").addEventListener("click", needReviewFlashcard);
document.getElementById("previousFlashcardButton").addEventListener("click", previousFlashcard);
document.getElementById("nextFlashcardButton").addEventListener("click", nextFlashcard);
document.getElementById("finishFlashcardButton").addEventListener("click", () => finishFlashcardReview(true));
document.querySelectorAll(".vocabulary-filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentVocabularyFilter = button.dataset.filter || "all";
    finishFlashcardReview(false);
    renderVocabularyBookScreen();
  });
});
document.querySelectorAll(".vocabulary-language-button").forEach((button) => {
  button.addEventListener("click", () => {
    setVocabularyLanguageFilter(button.dataset.languageFilter || "current");
  });
});
document.getElementById("markQuestCompleteButton").addEventListener("click", markCurrentQuestCompletedForTest);
document.getElementById("clearCompletedQuestsButton").addEventListener("click", clearCompletedQuestsForTest);
document.getElementById("devSwitchEnglishButton").addEventListener("click", () => switchLearningLanguage("en"));
document.getElementById("devSwitchChineseButton").addEventListener("click", () => switchLearningLanguage("zh"));

renderStartScreen();
