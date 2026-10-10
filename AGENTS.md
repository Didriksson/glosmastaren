# GlosMästaren — Agent Guide

A vocabulary learning SPA (svenska ↔ engelska). Deployed to glosmästaren.se via GitHub Pages.

## Tech Stack

- **Framework:** Vue 3 with Composition API (`<script setup lang="ts">`)
- **Language:** TypeScript ~5.9
- **Build tool:** Vite 7
- **State management:** Pinia 3
- **Styling:** Tailwind CSS v3 (utility-first, no CSS modules)
- **Animations:** Custom `@keyframes` in `<style scoped>` blocks + `canvas-confetti`
- **Storage:** localStorage only — no backend

## Project Structure

```
src/
  App.vue                  # Root: navigation pill, view switching, layout
  main.ts                  # Vue + Pinia init
  style.css                # Tailwind directives only
  components/
    WordInput.vue          # Add/manage vocabulary
    QuizMode.vue           # Quiz/test mode (typed answers, scored)
    StudyMode.vue          # Study/familiarization mode (unscored)
    MatchMode.vue          # Tap-to-match word pairs
    RewardMiniGame.vue     # Bubble-pop reward shown on perfect quiz score
  stores/
    glossaryStore.ts       # Pinia store, localStorage persistence
    types.ts               # Word interface
```

## Architecture

**No router.** Navigation is a single `currentView` ref in `App.vue`:

```ts
type ViewState = "input" | "quiz" | "study" | "match";
const currentView = ref<ViewState>("input");
```

Child components signal navigation changes via `$emit` (e.g. `emit('back-to-input')`). `App.vue` handles these by updating `currentView`.

**Adding a new view:**
1. Add its string literal to `ViewState` in `App.vue`.
2. Import the component and add a `v-if="currentView === 'newview'"` block in `<main>`.
3. Add a nav button in the pill row inside `<nav>`.

## Data Model

```ts
// src/stores/types.ts
interface Word {
  id: string;       // crypto.randomUUID() or timestamp fallback
  native: string;   // Swedish
  foreign: string;  // English
  learned: boolean; // reserved, currently unused
}
```

The store exposes: `words`, `count`, `addWord(native, foreign)`, `removeWord(id)`, `swapWordLanguages(id)`.

Words are deep-watched and auto-synced to `localStorage` under the key `"glossary-words"`.

## Component Conventions

- All components use `<script setup lang="ts">`.
- No props from `App.vue` to child views — children read from the Pinia store directly.
- Navigation back to a parent view is done with `defineEmits` + `emit('back-to-input')`.
- Scoped `<style scoped>` blocks for custom keyframe animations (`shake-horizontal`, `pop-border`, `bubble-float`, etc.).
- Color scheme: indigo/purple for primary actions, slate for neutral, green for success, red for error.

## Styling Conventions

- Tailwind utility classes everywhere. No custom CSS classes except for animation keyframes.
- Custom animation classes applied via `:class="animClass"` (a string ref).
- Responsive: `hidden sm:inline` pattern for label text in the nav pill.

## Key Patterns

**Checking an answer (QuizMode/StudyMode):**
```ts
const correct = targetAnswer.value.toLowerCase();
const answer = userAnswer.value.toLowerCase().trim();
if (answer === correct) { /* handle correct */ }
```

**Shuffling the quiz queue:**
```ts
quizQueue.value = [...store.words].sort(() => Math.random() - 0.5);
```

**Confetti burst:**
```ts
import confetti from "canvas-confetti";
confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
```

## Build & Dev

```bash
npm run dev       # dev server
npm run build     # type-check + vite build
npm run preview   # preview production build
```

Node requirement: `^20.19.0 || >=22.12.0`

## Deployment

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`). Custom domain via `public/CNAME`.
