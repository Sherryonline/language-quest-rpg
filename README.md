# Lingua Life RPG

Lingua Life RPG is a browser-based RPG language learning game for daily-life English and Chinese practice. It is built with plain HTML, CSS, and vanilla JavaScript.

There is no build step, backend, login system, or external library dependency.

## Current MVP Features

- Player profile creation and validation
- Local save, continue, and reset using `linguaLifeSave`
- Daily Life Town map
- Five playable English quests
- Five playable Chinese quests
- Dialogue and multiple-choice quest engine
- Wrong-answer hints and retry flow
- One-time quest rewards with replay protection
- EXP, coins, levels, daily streak, badges, and achievement summary
- Vocabulary Book with favorites, review count, review filters, and language filter
- Flashcard review
- Safe English and Chinese learning language switching
- Vietnamese learning mode prepared in config, but not playable yet
- Cozy Adventure UI theme
- Mute/unmute sound setting using `linguaLifeSettings`
- Safe generated fallback tones when local sound files are missing or blocked
- Mobile responsive layout

## Completed Sprints

- Sprint 1: Player profile, save/load/reset
- Sprint 2: Daily Life Town map and quest unlock logic
- Sprint 3: Reusable quest engine
- Sprint 4: English and Chinese MVP quest content
- Sprint 5: Vocabulary Book and flashcards
- Sprint 6: Levels, rewards, streak, badges, and achievement summary
- Sprint 7: Language settings, safe switching, and language-specific progress
- Sprint 8: Cozy Adventure polish, responsive UI, animations, and sound fallback
- Sprint 9: MVP stabilization, data safety, validation, release checklist, and GitHub Pages readiness

## How to Run Locally

1. Clone or download the repository.
2. Open `index.html` directly in a browser.
3. Or open the folder in VS Code and run `index.html` with Live Server.

No install command is required.

## GitHub Pages Deployment

1. Push the code to GitHub.
2. Go to repository Settings.
3. Open Pages.
4. Select Deploy from branch.
5. Select the `main` branch and root folder.
6. Save.
7. Open the GitHub Pages URL after deployment finishes.

After GitHub Pages deployment is enabled successfully, the game will be available at:

```text
https://sherryonline.github.io/language-quest-rpg/
```

This URL assumes GitHub Pages is configured to deploy the repository root from the `main` branch.

## Playable Quests

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

## Save Data

Player progress is saved in browser localStorage under:

```text
linguaLifeSave
```

User settings are saved separately under:

```text
linguaLifeSettings
```

Sprint 9 includes defensive save migration for older local data. Missing fields are safely initialized without resetting existing progress.

## Sound System

The game looks for optional local files in `assets/sounds/`:

- `click.mp3`
- `correct.mp3`
- `wrong.mp3`
- `quest-complete.mp3`
- `level-up.mp3`

If files are missing or playback is blocked, the game uses short generated Web Audio tones when available. If audio is unavailable, sound is skipped without blocking gameplay.

## Testing Notes

- Reset Game clears local player progress.
- Developer Test Tools are for testing only and stay collapsed by default.
- Test desktop and mobile widths, especially 360px, 390px, 414px, and 768px.
- Quest rewards should only be granted once per quest.
- Replaying a completed quest should not duplicate EXP, coins, vocabulary, reward history, or badges.
- Switching language should preserve all existing progress.

## Known Limitations

- Data is saved only in browser localStorage.
- No backend account sync yet.
- No login or cloud save yet.
- No AI NPC yet.
- No voice recognition yet.
- No leaderboard yet.
- Vietnamese learning mode is prepared but not playable yet.
- Only English and Chinese quests are playable.
- Vocabulary review does not give EXP or coins yet.
- No spaced repetition algorithm yet.
- Sound quality depends on local sound files or browser fallback tones.
- No professional game art assets yet.

## Project Structure

```text
language-quest-rpg/
├── index.html
├── style.css
├── script.js
├── README.md
├── data/
│   ├── quests.js
│   └── languages.js
└── assets/
    └── sounds/
```

## Release Status

Sprint 9 completed. The MVP is ready for browser testing and GitHub Pages deployment.
