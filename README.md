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
- Temporary Start Quest placeholder for Sprint 3
- Developer tools for marking the current quest complete and clearing completed quests
- Quest selection and completion status persisted in localStorage

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

- Quest cards are clickable, but real quest gameplay is not implemented yet.
- The quest engine will be added in Sprint 3.
- Developer test tools are temporary and will be removed or hidden after Sprint 3.
- Data is saved only in the current browser's localStorage.
- There is no backend, login, AI, sound, or voice support.
- Battles, vocabulary books, rewards, and full map movement are not implemented.

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
