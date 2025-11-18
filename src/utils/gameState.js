// src/utils/gameState.js

// --- Game configuration constants ---
export const STAGES = [3, 4, 5]; // 3x3, 4x4, 5x5
export const PUZZLES_PER_STAGE = 50;
export const SOLVES_TO_UNLOCK = 5;
export const GIVEUPS_TO_DEMOTE = 5;
export const BASE_STAGE = 3; // starting size

const STORAGE_KEY_PREFIX = "tilerush_state_";

// --- Helpers to pick storage based on user/guest ---
function getStorage(user) {
  if (typeof window === "undefined") return null;
  // Logged-in users -> localStorage (persistent)
  // Guests -> sessionStorage (reset when they leave)
  return user ? window.localStorage : window.sessionStorage;
}

function getStorageKey(user) {
  const id = user?.uid || "guest";
  return `${STORAGE_KEY_PREFIX}${id}`;
}

// --- Default per-stage stats ---
function createEmptyStageStats() {
  const stats = {};
  STAGES.forEach((stage) => {
    stats[String(stage)] = {
      completed: 0,   // number of solved puzzles
      totalTime: 0,   // total time in seconds (for averages)
      bestTime: null, // best solve time in seconds
      puzzlesSeen: [],// indices of puzzles already given (0..49)
    };
  });
  return stats;
}

// --- Default full game state ---
export function getDefaultGameState() {
  return {
    currentStage: BASE_STAGE,      // stage currently being played
    maxUnlockedStage: BASE_STAGE,  // highest stage unlocked so far
    solvedStreak: 0,               // consecutive solves at currentStage
    giveUpStreak: 0,               // consecutive give-ups at currentStage
    perStage: createEmptyStageStats(),
    // currentPuzzle will be filled by Puzzle.jsx later
    currentPuzzle: null,           // { stage, tiles, startTiles, moves, startedAt }
  };
}

// Merge loaded state with defaults so adding new fields later won't break old saves
function mergeWithDefaults(loaded) {
  const defaults = getDefaultGameState();
  return {
    ...defaults,
    ...loaded,
    perStage: {
      ...defaults.perStage,
      ...(loaded.perStage || {}),
    },
  };
}

// --- Load / Save state ---

export function loadGameState(user) {
  const storage = getStorage(user);
  if (!storage) return getDefaultGameState();

  const key = getStorageKey(user);
  const raw = storage.getItem(key);
  if (!raw) return getDefaultGameState();

  try {
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(parsed);
  } catch (e) {
    console.warn("Failed to parse saved game state, resetting.", e);
    return getDefaultGameState();
  }
}

export function saveGameState(user, state) {
  const storage = getStorage(user);
  if (!storage) return;
  const key = getStorageKey(user);
  try {
    storage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save game state:", e);
  }
}

// --- Clear guest state when leaving to menu (Puzzle/Dashboard will call this) ---
export function clearGuestState() {
  if (typeof window === "undefined") return;
  const storage = window.sessionStorage;
  Object.keys(storage).forEach((key) => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      storage.removeItem(key);
    }
  });
}

// --- Progression & stats updates ---

/**
 * Record a solved puzzle.
 * @param {object} state - current game state
 * @param {number} timeSeconds - time taken to solve (seconds)
 * @param {number} stage - stage size (3,4,5)
 * @returns {object} { state: newState, unlockedStage: number|null, promoted: boolean }
 */
export function recordSolve(state, timeSeconds, stage) {
  const newState = { ...state };
  const stageKey = String(stage);

  // Reset give-up streak, increment solved streak
  newState.giveUpStreak = 0;
  newState.solvedStreak = (newState.solvedStreak || 0) + 1;

  // Update per-stage stats
  const stageStats = { ...(newState.perStage?.[stageKey] || {}) };
  stageStats.completed = (stageStats.completed || 0) + 1;
  stageStats.totalTime = (stageStats.totalTime || 0) + timeSeconds;

  if (
    stageStats.bestTime == null ||
    timeSeconds < stageStats.bestTime
  ) {
    stageStats.bestTime = timeSeconds;
  }

  newState.perStage = {
    ...newState.perStage,
    [stageKey]: stageStats,
  };

  let unlockedStage = null;
  let promoted = false;

  // Check if we should unlock next stage
  const currentIndex = STAGES.indexOf(stage);
  const hasNextStage = currentIndex >= 0 && currentIndex < STAGES.length - 1;

  if (hasNextStage && newState.solvedStreak >= SOLVES_TO_UNLOCK) {
    const nextStage = STAGES[currentIndex + 1];

    if (nextStage > newState.maxUnlockedStage) {
      newState.maxUnlockedStage = nextStage;
      unlockedStage = nextStage;
    }

    // Auto-promote to the next stage for gameplay
    newState.currentStage = nextStage;
    newState.solvedStreak = 0; // reset streak after promotion
    promoted = true;
  } else {
    // Stay on same stage
    newState.currentStage = stage;
  }

  return { state: newState, unlockedStage, promoted };
}

/**
 * Record a give-up.
 * @param {object} state - current game state
 * @param {number} stage - stage size (3,4,5)
 * @returns {object} { state: newState, demoted: boolean, newStage: number }
 */
export function recordGiveUp(state, stage) {
  const newState = { ...state };
  newState.solvedStreak = 0;
  newState.giveUpStreak = (newState.giveUpStreak || 0) + 1;

  let demoted = false;
  let newStage = stage;

  const currentIndex = STAGES.indexOf(stage);
  const hasLowerStage =
    currentIndex > 0 && currentIndex < STAGES.length;

  if (
    hasLowerStage &&
    newState.giveUpStreak >= GIVEUPS_TO_DEMOTE
  ) {
    // Demote to previous stage
    const lowerStage = STAGES[currentIndex - 1];
    newStage = lowerStage;
    newState.currentStage = lowerStage;
    newState.giveUpStreak = 0; // reset after demotion
    demoted = true;
  } else {
    newState.currentStage = stage;
  }

  return { state: newState, demoted, newStage };
}

/**
 * Allow user to manually choose any unlocked stage from dashboard.
 */
export function setCurrentStage(state, stage) {
  const newState = { ...state };
  if (!STAGES.includes(stage)) return newState;
  if (stage > newState.maxUnlockedStage) return newState; // can't select locked
  newState.currentStage = stage;
  // Do not change streaks here; this is a manual choice
  return newState;
}

/**
 * Helper to compute average time (in seconds) for a given stage.
 */
export function getAverageTimeForStage(state, stage) {
  const stageStats = state.perStage?.[String(stage)];
  if (!stageStats || !stageStats.completed) return null;
  return stageStats.totalTime / stageStats.completed;
}
