import { createHash } from "crypto";
import { WORD_SALT } from "../env";

export const TARGET_WORDS = [
  "BADGE", "CHAIN", "FRAME", "WARPCAST", "MOXIE", "BUILD", "STAKE", "GRANT",
  "NOBLE", "POWER", "SHARE", "TRUST", "VALUE", "WORTH", "YIELD", "SPACE",
  "CASTE", "REACT", "BASED", "BREAD", "CLEAR", "DRAFT", "EQUAL", "FRESH",
  "GRACE", "HEART", "IMAGE", "JOINT", "KREWE", "LIGHT", "MAGIC", "NERDY",
  "OCEAN", "PRIZE", "QUEST", "REACH", "SCOPE", "TRACK", "UNITE", "VITAL",
  "WORLD", "YOUTH", "ZESTY", "ALIVE", "BLOOM", "CHARM", "DREAM", "EXTRA",
  "FORGE", "GLIDE", "HAPPY", "JEWEL", "KUDOS", "LUNAR", "MUSIC", "OXIDE",
  "PEACE", "QUIRK", "RAPID", "SMILE", "TOUCH", "VOGUE", "WHEAT", "ADAPT",
  "BRAVE", "CLIMB", "DANCE", "EVOKE", "FAITH", "GRAND", "HONOR", "IDEAL",
  "JOLLY", "KNACK", "LOYAL", "MERIT", "NERVE", "ORBIT", "PLUMB", "QUILT",
  "ROCKY", "SWEPT", "THYME", "URBAN", "VIGOR", "WIELD", "YEARN", "ZIPPY",
  "AGILE", "BENDY", "CRISP", "DIGIT", "EMBER", "FIELD", "GREAT", "HANDY",
  "INPUT", "JUDGE", "KNIFE", "LEGAL", "METRO", "NOBLE", "OFFER", "PROUD",
  "QUITE", "RANGE", "SWIFT", "THEME", "VIVID", "WROTE", "ABYSS", "BURST",
  "CRANE", "DUTCH", "ENTRY", "FALSE", "GENRE", "HORSE", "INDEX", "JUMBO"
];

export const ALLOWED_GUESSES = [
  ...TARGET_WORDS,
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT",
  "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT",
  "ALIEN", "ALIGN", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "ANGEL",
  "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE",
  "ARISE", "ARRAY", "ARROW", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID",
  "AWAIT", "AWARD", "AWARE", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN",
  "BEING", "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLADE", "BLAME",
  "BLANK", "BLAST", "BLEED", "BLESS", "BLIND", "BLOCK", "BLOOD", "BLOWN",
  "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRASS", "BRAVE",
  "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUDGET", "BUNCH",
  "BUYER", "CABLE", "CALIF", "CARRY", "CARVE", "CATCH", "CAUSE", "CEASE",
  "CHAIR", "CHAOS", "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST",
  "CHIEF", "CHILD", "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN",
  "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COULD",
  "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAZY", "CREAM",
  "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CURVE", "CYCLE", "DAILY",
  "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN", "DRAFT",
  "DRAMA", "DRANK", "DRAWN", "DREAM", "DRESS", "DRIED", "DRINK", "DRIVE",
  "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY",
  "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY",
  "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD",
  "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLESH", "FLOAT",
  "FLOOD", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM",
  "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY",
  "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE",
  "GRAIN", "GRAND", "GRANT", "GRASS", "GRAVE", "GREAT", "GREEN", "GROSS",
  "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY", "HARRY",
  "HEART", "HEAVY", "HENCE", "HENRY", "HORSE", "HOTEL", "HOUSE", "HUMAN",
  "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JAPAN", "JIMMY"
];

export function getWordOfTheDay(yyyymmdd: string): string {
  const hash = createHash("sha256")
    .update(WORD_SALT + yyyymmdd)
    .digest("hex");
  
  const index = parseInt(hash.substring(0, 8), 16) % TARGET_WORDS.length;
  return TARGET_WORDS[index];
}

export function isValidGuess(guess: string): boolean {
  const normalized = guess.toUpperCase().trim();
  // Accept any 5-letter word with A-Z characters
  return normalized.length === 5 && /^[A-Z]{5}$/.test(normalized);
}

export function calculateFeedback(guess: string, solution: string): ("correct" | "present" | "absent")[] {
  const feedback: ("correct" | "present" | "absent")[] = Array(5).fill("absent");
  const solutionLetters = solution.split("");
  const guessLetters = guess.split("");
  const usedIndices = new Set<number>();

  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === solutionLetters[i]) {
      feedback[i] = "correct";
      usedIndices.add(i);
    }
  }

  for (let i = 0; i < 5; i++) {
    if (feedback[i] === "correct") continue;

    for (let j = 0; j < 5; j++) {
      if (!usedIndices.has(j) && guessLetters[i] === solutionLetters[j]) {
        feedback[i] = "present";
        usedIndices.add(j);
        break;
      }
    }
  }

  return feedback;
}

export function calculateScore(feedback: ("correct" | "present" | "absent")[], attemptsUsed: number): number {
  const correctCount = feedback.filter(f => f === "correct").length;
  const presentCount = feedback.filter(f => f === "present").length;
  
  const baseScore = (correctCount * 2) + (presentCount * 1);
  
  const multipliers = [5, 4, 3, 2, 1.5, 1];
  const multiplier = multipliers[attemptsUsed - 1] || 1;
  
  return Math.round(baseScore * multiplier);
}

export function getRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * TARGET_WORDS.length);
  return TARGET_WORDS[randomIndex];
}
