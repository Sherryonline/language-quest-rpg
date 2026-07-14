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

- Only the Greeting quest has full playable content for English and Chinese.
- Other quests still have metadata and will be expanded in Sprint 4.
- Quest progress inside a quest is not saved on browser refresh yet.
- Vocabulary is shown on quest completion, but the full Vocabulary Book will be added in a later sprint.
- Developer test tools are temporary and remain inside a collapsible section.
- Data is saved only in the current browser's localStorage.
- There is no AI NPC, voice, sound, login, backend, database, or leaderboard yet.
- Battles, full vocabulary books, and full map movement are not implemented.

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
