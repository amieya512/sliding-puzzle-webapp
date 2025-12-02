# TileRush – Sliding Puzzle Webapp

TileRush is a sliding-puzzle game built with React and Vite.  
It supports:

- Progression-based **standard puzzles** with unlockable grid sizes
- **Custom puzzles** using your own images (upload, camera, or random photos)
- A **Race a Bot** mode where you compete against personality-based AI opponents
- **Hints**, **timers**, **move counters**, and simple **player stats**
- **Firebase authentication** (email/password + Google) and optional **guest mode**

---

## Table of Contents

1. Tech Stack  
2. Key Features  
3. Project Structure  
4. Environment Variables  
5. Getting Started  
6. Running the App  
7. Game Modes & Logic  
8. Authentication & Data  
9. Bot Racing & Dialogue  
10. Testing (Vitest / Cursor)  
11. Known Limitations / Future Work

---

## Tech Stack

**Frontend**
- React  
- Vite  
- React Router (`react-router-dom`)  
- Tailwind-like utility classes  
- Lucide Icons (`lucide-react`)

**Backend / Services**
- Firebase Auth  
- Firebase Realtime Database  
- Pexels API

**Tooling**
- Node.js & npm  
- Vitest  
- Cursor (prompt files stored in `/Prompts/`)

---

## Key Features

### 1. Standard Play Mode
- Sliding puzzle with numbered tiles and image backgrounds.  
- Difficulty progression:
  - Start at **3×3**
  - Unlock 4×4, 5×5, etc.  
- Game state persisted per user:
  - Stage progression  
  - Current puzzle  
  - Best/average time  
- **Hints** (max 3 per puzzle)
- **Give Up / Demotion** behavior

### 2. Custom Puzzles
- Upload image / use camera / fetch random from Pexels.  
- Uses `splitImageIntoTiles` + `newSolvableBoard`.  
- Tracks moves/time but does not affect progression.

### 3. Race a Bot
- Pick your bot:
  - Benji  
  - Oliver  
  - Ms. Maple  
  - Foxy  
- Pick difficulty (Easy, Medium, Hard, Adaptive).  
- Player and bot start with same **3×3** board.  
- Bot uses BFS solver + difficulty-based distortions.  
- Winner screen shows times and moves.

---

## Project Structure

```
sliding-puzzle-webapp/
├─ .env.example
├─ package.json
├─ vite.config.js
└─ src/
   ├─ App.jsx
   ├─ firebase.js
   ├─ context/
   │  └─ AuthContext.jsx
   ├─ utils/
   │  ├─ shuffle.js
   │  ├─ splitImage.js
   │  ├─ fetchRandomImage.js
   │  ├─ gameState.js
   │  ├─ profanity.js
   │  └─ getHintMove.js
   ├─ bots/
   │  ├─ dialogue.js
   │  ├─ Inquizitive Blond Man.svg
   │  ├─ Serious Hipster.svg
   │  ├─ Grandma.svg
   │  └─ FoxGuy.svg
   ├─ components/
   │  ├─ Tile.jsx
   │  ├─ Timer.jsx
   │  ├─ SettingsModal.jsx
   │  ├─ AvatarSelectorModal.jsx
   │  ├─ CameraCapture.jsx
   │  └─ RaceBotModal.jsx
   ├─ Menu.jsx
   ├─ Login.jsx
   ├─ Account.jsx
   ├─ Username.jsx
   ├─ Dashboard.jsx
   ├─ Puzzle.jsx
   ├─ CreatePuzzle.jsx
   ├─ CustomPuzzle.jsx
   └─ Race.jsx
```

---

## Environment Variables

Create a `.env` in the project root.

### 1. Pexels API Key
Used in `src/utils/fetchRandomImage.js`.

```
# .env
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

Copy example:

```
cp .env.example .env
```

### 2. Firebase Config

Defined in `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "YOUR_DB_URL"
};
```

(In production you would move these into `.env` as well.)

---

## Getting Started

### 1. Prerequisites
- Node.js v18+  
- npm  
- Firebase project with:
  - Email/Password and Google Auth  
  - Realtime Database  
- Pexels API key  

### 2. Clone the Repo

```
git clone https://github.com/<your-username>/sliding-puzzle-webapp.git
cd sliding-puzzle-webapp
```

### 3. Install Dependencies

```
npm install
```

Installed packages include React, Router, Firebase, lucide-react, Vitest, and Vite.

### 4. Configure `.env`

```
cp .env.example .env
```

Then edit `.env`:

```
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

### 5. Configure Firebase

Edit `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/"
};
```

Make sure:
- Email/Password + Google enabled in Firebase Auth  
- DB rules permit your intended read/write behavior

---

## Running the App

### Development Mode

```
npm run dev
```

Visit:

```
http://localhost:5173
```

### Production Build

```
npm run build
npm run preview
```

---

## Game Modes & Logic

### Standard Puzzle (`/puzzle`)
Primary files:
- `Puzzle.jsx`
- `utils/gameState.js`
- `utils/shuffle.js`

`newSolvableBoard(size)`:
- Generates solvable layout via inversion/blank Position rules.

Images:
- `fetchRandomImage.js` → Pexels  
- `splitImage.js` → slices into tiles  

Hints:
- `getHintMove.js` determines next reasonable tile move  
- Max 3 hints  
- Highlighting done in `Tile.jsx`

### Custom Puzzle (`/create` → `/custom-puzzle`)
`CreatePuzzle.jsx`:
- Upload  
- Camera  
- Random Pexels  
- Choose size  

`CustomPuzzle.jsx`:
- Build solvable board  
- Slice image  
- Render puzzle  

Custom puzzles do *not* affect progression.

### Race a Bot (`/race`)
Flow:
- Dashboard → RaceBotModal → Race.jsx  

`Race.jsx`:
- Shared 3×3 solvable board  
- Player + bot timers  
- Bot computed path:
  - BFS via `computeBotMoves`
  - Adjusted by difficulty (`applyDifficultyDistortion`)  

Bot moves via interval determined by difficulty.

Race ends when either solves; overlay appears.

---

## Authentication & Data

### AuthContext
`src/context/AuthContext.jsx` manages:
- Firebase user  
- Guest sessions  
- Login / logout  
- Providers (Google, Email/Password)

### Usernames & Avatars
- Editable username  
- Avatar picker  
- Stored locally  
- Username profanity filtered via `utils/profanity.js`

### Game State
`utils/gameState.js`:
- Current stage  
- Current puzzle  
- Best/avg times  
- Attempts and unlock logic  
- Supports Firebase DB or local storage fallback

---

## Bot Racing & Dialogue

### Bot Avatars
Located in `/src/bots/`  
- Benji — “Inquizitive Blond Man.svg”  
- Oliver — “Serious Hipster.svg”  
- Ms. Maple — “Grandma.svg”  
- Foxy — “FoxGuy.svg”  

### Dialogue System
`src/bots/dialogue.js` contains:
- Lines per bot  
- Lines per difficulty  

Used in `Race.jsx` for:
- Start messages  
- Mid-race comments  
- Win/Loss messages  

Bubbles auto-hide after a short delay.

---

## Testing (Vitest / Cursor)

### Running Tests

```
npm run test
```

or:

```
npx vitest
```

### What to Test

`utils/shuffle.js`:
- Single blank  
- Unique numbers  
- Solvable configurations  

`utils/gameState.js`:
- Updates stats correctly  
- Unlocks/demotions at correct thresholds  

`utils/getHintMove.js`:
- Always suggests legal board moves  
- Handles sizes correctly  

Cursor prompt history stored in `/Prompts/` for instructor review.

---

## Known Limitations / Future Work

- Firebase config lives in source instead of environment variables.  
- Race mode locked to 3×3 (larger boards require faster solver).  
- Dialogue limited to predefined lines.  
- Custom puzzles do not contribute to progression.  
- Accessibility improvements (keyboard navigation/ARIA) still needed.

---

## Summary

TileRush demonstrates:
- React + Vite SPA architecture  
- Use of Firebase + Pexels APIs  
- A solvable sliding-puzzle engine  
- Multiple game modes (standard, custom, bot races)  
- Stats, hints, avatars, and user profiles  

This README explains how to:
- Install dependencies  
- Configure environment variables  
- Run the project  
- Understand core logic and file structure  

