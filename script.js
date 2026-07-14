"use strict";

const STORAGE_KEY = "linguaLifeSave";
const screenIds = {
  start: "startScreen",
  character: "characterScreen",
  main: "mainGameScreen",
  quest: "questScreen",
  vocabulary: "vocabularyScreen"
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
let activeQuest = null;
let currentStepIndex = 0;
let selectedAnswerState = null;
let currentVocabularyFilter = "all";
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

function normalizePlayer(player) {
  if (!player || typeof player !== "object") {
    return null;
  }

  const learningLanguage = player.learningLanguage || "en";

  return {
    ...player,
    level: Number.isFinite(Number(player.level)) ? Number(player.level) : 1,
    exp: Number.isFinite(Number(player.exp)) ? Number(player.exp) : 0,
    coins: Number.isFinite(Number(player.coins)) ? Number(player.coins) : 0,
    currentMap: player.currentMap || "daily_life_town",
    currentQuestId: player.currentQuestId || (learningLanguage === "zh" ? "zh_greeting_001" : "greeting_001"),
    completedQuests: Array.isArray(player.completedQuests) ? player.completedQuests : [],
    learnedWords: normalizeLearnedWords(player.learnedWords, learningLanguage),
    badges: Array.isArray(player.badges) ? player.badges : [],
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
  const player = currentPlayer || loadPlayer();

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
  renderDailyLifeTownMap();
  navigateTo("main");
}

function renderDailyLifeTownMap() {
  const questCards = document.getElementById("questCards");
  const quests = getQuestsByLanguage(currentPlayer.learningLanguage);
  const completedCount = quests.filter((quest) => isQuestCompleted(quest.id, currentPlayer)).length;

  questCards.replaceChildren();
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
  const addedVocabularyCount = addVocabularyFromQuest(activeQuest);
  const completionResult = addCompletedQuest(activeQuest.id);
  currentPlayer = completionResult.player;

  if (!rewardAlreadyClaimed) {
    currentPlayer = applyQuestReward(activeQuest);
  } else {
    currentPlayer = savePlayer(currentPlayer) || currentPlayer;
  }

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

function applyQuestReward(quest) {
  const claimedQuestRewards = Array.isArray(currentPlayer.claimedQuestRewards)
    ? [...currentPlayer.claimedQuestRewards]
    : [];

  if (!claimedQuestRewards.includes(quest.id)) {
    claimedQuestRewards.push(quest.id);
  }

  return savePlayer({
    ...currentPlayer,
    exp: Number(currentPlayer.exp || 0) + Number(quest.rewardExp || 0),
    coins: Number(currentPlayer.coins || 0) + Number(quest.rewardCoins || 0),
    claimedQuestRewards
  }) || currentPlayer;
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
  const words = getLearnedWordsByLanguage(currentPlayer.learningLanguage);
  const filteredWords = getFilteredVocabularyWords(words);
  const favoriteCount = words.filter((item) => item.isFavorite).length;
  const reviewedCount = words.filter((item) => Number(item.reviewCount) > 0).length;

  setText("vocabularyLanguage", `Learning: ${languageLabels[currentPlayer.learningLanguage] || currentPlayer.learningLanguage}`);
  setText("vocabularyTotal", words.length);
  setText("vocabularyFavorites", favoriteCount);
  setText("vocabularyReviewed", reviewedCount);
  updateVocabularyFilterButtons();
  renderVocabularyList(filteredWords);
  navigateTo("vocabulary");
}

function getLearnedWordsByLanguage(language) {
  return (currentPlayer && Array.isArray(currentPlayer.learnedWords)
    ? currentPlayer.learnedWords
    : [])
    .filter((item) => item.language === language)
    .sort((first, second) => first.word.localeCompare(second.word));
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
  const words = getFilteredVocabularyWords(getLearnedWordsByLanguage(currentPlayer.learningLanguage));

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
document.getElementById("mainBackButton").addEventListener("click", renderStartScreen);
document.getElementById("mainResetButton").addEventListener("click", resetGame);
document.getElementById("returnToMapButton").addEventListener("click", returnToMap);
document.getElementById("returnToMapCompleteButton").addEventListener("click", returnToMap);
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
document.getElementById("markQuestCompleteButton").addEventListener("click", markCurrentQuestCompletedForTest);
document.getElementById("clearCompletedQuestsButton").addEventListener("click", clearCompletedQuestsForTest);

renderStartScreen();
