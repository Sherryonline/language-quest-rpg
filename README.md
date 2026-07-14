# Lingua Life RPG

Lingua Life RPG is a browser-based language learning RPG built with plain HTML, CSS, and vanilla JavaScript. It has no build step, backend, or external dependencies.

## Completed features

### Sprint 1 — Player profile

- Start, Continue, and Reset Game actions
- Character creation and validation
- English and Chinese learning profiles
- Player profile saved under the `linguaLifeSave` localStorage key
- Responsive player status screen

### Sprint 2 — Daily Life Town

- Daily Life Town map overview
- English and Chinese quest metadata in `data/quests.js`
- Language-specific quest filtering
- Available, Locked, and Completed quest states
- Sequential unlock requirements
- Quest cards with EXP and coin reward previews
- Start Quest opens the playable quest engine for quests with step content
- Developer tools for marking the current quest complete and clearing completed quests
- Quest selection and completion status persisted in localStorage

### Sprint 3 - Quest engine

- Reusable quest play screen
- Dialogue quest steps with speaker names and Next flow
- Multiple-choice quest steps with correct/wrong feedback
- Hint display for wrong answers without restarting the quest
- Quest completion screen with EXP, coin, and vocabulary summary
- Rewards are claimed only once per quest, even when replayed
- Completed quests unlock the next quest on the Daily Life Town map
- Back to Map flow from active and completed quests
- Backward-compatible save loading for older Sprint 1 and Sprint 2 localStorage data

### Sprint 4 - MVP quest content

- Five fully playable English Daily Life Town quests
- Five fully playable Chinese Daily Life Town quests
- Complete vocabulary, dialogue, choices, hints, and rewards for every MVP quest
- Chinese vocabulary includes word, pinyin, Vietnamese meaning, and example sentence
- English vocabulary includes word, Vietnamese meaning, and example sentence
- Sequential quest unlock chain for both English and Chinese paths

### Sprint 5 - Vocabulary Book

- Vocabulary Book button on the Main Game Screen
- Learned words saved from completed quests into `player.learnedWords`
- Duplicate vocabulary prevention by language and word
- Vocabulary cards with word, meaning, example, source quest, and review count
- Chinese vocabulary cards include pinyin when available
- Filters for all words, favorites, not reviewed, and reviewed words
- Favorite toggle for learned words
- Mark Reviewed action with review count and last reviewed timestamp
- Simple flashcard review mode with front/back cards
- Flashcard review supports I Remember and Need Review outcomes
- Backward-compatible migration for older save data

### Sprint 6 - Motivation systems

- Level calculation from total EXP
- Level progress bar on the Main Game Screen
- Reward popup after quest completion
- Reward history saved for first-time quest rewards
- Daily streak tracking with browser local dates
- Badge unlocking and badge display
- Achievement summary with level, EXP, coins, streak, quests, vocabulary, reviews, and badges
- Replay-safe reward, badge, and reward history behavior

### Sprint 7 - Language mode management

- Shared language configuration in `data/languages.js`
- Main-screen Language Settings section
- Safe learning language switching between English and Chinese
- Current quest selection updates to the latest available quest for the selected language
- Language-specific quest and vocabulary progress summary
- Vocabulary Book language filter for current language, English, Chinese, and all learned words
- Chinese display support with pinyin and Chinese-friendly font stack
- Vietnamese prepared in config as a future non-playable learning mode

## Playable quests

English:

- Greeting (`greeting_001`)
- Order Coffee (`coffee_001`)
- Buy Food (`food_001`)
- Ask for Directions (`direction_001`)
- Introduce Yourself (`introduce_001`)

Chinese:

- 问候 (`zh_greeting_001`)
- 点咖啡 (`zh_coffee_001`)
- 买食物 (`zh_food_001`)
- 问路 (`zh_direction_001`)
- 自我介绍 (`zh_introduce_001`)

## How to play a quest

1. Create or continue a player.
2. Open the Daily Life Town map.
3. Click Start Quest on an Available quest.
4. Read dialogue steps and click Next.
5. Answer choice steps. Wrong answers show a hint and can be retried.
6. Finish the quest to claim rewards and unlock the next quest.
7. Click Return to Map to see the updated quest board.

## Quest engine step types

- `dialogue`: Shows an NPC speaker and dialogue text, then advances with Next.
- `choice`: Shows a question and answer buttons, checks the correct answer, and shows hints for wrong answers.

## Quest unlocks

Quests unlock in order for the selected learning language only. Completing Quest 1 unlocks Quest 2, completing Quest 2 unlocks Quest 3, and so on until all five Daily Life Town quests are complete. Replaying a completed quest does not add duplicate EXP or coins.

## Vocabulary Book

Completing a quest adds that quest's vocabulary to the player's Vocabulary Book. Each learned word stores its source quest, language, word, optional pinyin, Vietnamese meaning, example sentence, review count, last reviewed date, and favorite state.

Replaying a quest does not duplicate vocabulary. Existing review counts, favorite state, and last reviewed dates are preserved.

## Flashcard review

Flashcard Review uses the current Vocabulary Book filter. The front shows the word, and Chinese cards also show pinyin when available. The back shows meaning, example sentence, and source quest. Choosing I Remember increases review count and updates the last reviewed date. Choosing Need Review moves on without adding review credit.

## Level system

Player level is calculated from total EXP. Level thresholds are 0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, and 4600 EXP. Quest rewards can trigger level-ups, and replayed quests do not grant duplicate EXP or coins.

## Daily streak

The streak uses the browser's local date. Opening the Main Game Screen for the first time starts a 1-day streak. Opening again on the same day keeps the streak unchanged. Opening on the next day increases it by 1. Missing more than one day resets the streak to 1.

## Badges

- First Step
- Daily Learner
- 5-Day Hero
- Vocabulary Collector
- Flashcard Starter
- English Beginner
- Chinese Beginner
- Level 2 Adventurer
- Level 5 Scholar

Badges unlock from quest completion, streak progress, vocabulary collection, flashcard review, and level progress. They are saved in localStorage and do not duplicate.

## Reward popup and history

First-time quest completion shows a reward popup with EXP, coins, level-up information, newly unlocked badges, and vocabulary status. A reward history item is saved only when rewards are actually granted. Replaying a completed quest shows that rewards were already claimed and does not create duplicate reward history.

## Language settings

The Main Game Screen shows the player's native language and current learning language with readable labels and flags. Changing learning language switches the visible quest map and default vocabulary view while keeping completed quests, learned words, EXP, coins, level, streak, badges, and reward history.

English and Chinese are playable in Sprint 7. Vietnamese is present in the language configuration for future support, but it is marked as coming soon and is not selectable as a learning mode yet.

## Language-specific progress

The achievement area shows English and Chinese progress separately. Completed quests are counted by quest language, and learned words are counted by vocabulary language, so progress from one mode is not mixed into the other.

## Vocabulary language filters

The Vocabulary Book supports a language filter and a review filter at the same time. For example, Chinese plus Favorites shows only favorite Chinese words. Chinese cards display pinyin when available, while English cards omit pinyin.

## Run locally

1. Open the `language-quest-rpg` folder in VS Code.
2. Run `index.html` with the Live Server extension, or serve the folder with another static HTTP server.
3. Open the local URL shown by the server.

No installation or build command is required.

## GitHub Pages

After GitHub Pages deployment is enabled successfully, the game will be available at:

```text
https://sherryonline.github.io/language-quest-rpg/
```

This URL assumes GitHub Pages is configured to deploy the repository root from the `main` branch.

## Current limitations

- Only dialogue and multiple-choice gameplay are supported.
- Quest progress inside a quest is not saved on browser refresh yet.
- Vocabulary review does not give EXP or coins yet.
- There is no spaced repetition algorithm yet.
- There is no pronunciation audio yet.
- Daily streak uses browser local date.
- Vietnamese learning mode is prepared but not playable yet.
- Only English and Chinese quests are playable.
- Switching language keeps shared player level, EXP, coins, streak, and badges.
- There is no server sync yet.
- There is no login or cloud save yet.
- There is no leaderboard yet.
- There are no sound or animation reward effects yet.
- Developer test tools are temporary and remain inside a collapsible section.
- Data is saved only in the current browser's localStorage.
- There is no voice recognition yet.
- There is no AI NPC yet.
- There is no backend, login, account sync, database, or leaderboard yet.
- Battles and full map movement are not implemented.

## Project structure

```text
language-quest-rpg/
├── index.html
├── style.css
├── script.js
├── README.md
└── data/
    └── quests.js
```
