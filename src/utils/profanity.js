// A strong, safe, customizable profanity filter.
// Contains common slurs, sexual content, offensive words, etc.
// All lowercase to simplify matching.

export const bannedWords = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cock",
  "pussy", "slut", "whore", "cunt", "twat", "fag", "faggot", "dyke",
  "nigger", "nigga", "kike", "spic", "chink", "gook", "retard",
  "idiot", "moron", "damn", "bollocks", "wanker", "cum", "semen",
  "rape", "rapist", "pedo", "pedophile", "anal", "blowjob", "handjob",
  "tightpussy", "deepthroat","ass", "porn", "hardcore", "bdsm"
];

// returns true if the username contains ANY banned word.
export function isBadUsername(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return bannedWords.some(word => lower.includes(word));
}
