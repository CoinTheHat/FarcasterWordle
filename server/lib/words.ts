import { createHash } from "crypto";
import { WORD_SALT } from "../env";
import { CLEAN_TR_WORDS } from "./words-clean";

export type Language = "en" | "tr";

export const TARGET_WORDS_EN = [
  // Farcaster/Crypto themed
  "BADGE", "CHAIN", "FRAME", "MOXIE", "BUILD", "STAKE", "GRANT", "NOBLE",
  "POWER", "SHARE", "TRUST", "VALUE", "WORTH", "YIELD", "SPACE", "CASTE",
  "REACT", "BASED", "TOKEN", "MINTS", "TRADE", "REALM", "VAULT", "FORGE",
  
  // Common easy words
  "BREAD", "CLEAR", "DRAFT", "EQUAL", "FRESH", "GRACE", "HEART", "IMAGE",
  "JOINT", "LIGHT", "MAGIC", "NERDY", "OCEAN", "PRIZE", "QUEST", "REACH",
  "SCOPE", "TRACK", "UNITE", "VITAL", "WORLD", "YOUTH", "ZESTY", "ALIVE",
  "BLOOM", "CHARM", "DREAM", "EXTRA", "GLIDE", "HAPPY", "JEWEL", "KUDOS",
  "LUNAR", "MUSIC", "OXIDE", "PEACE", "QUIRK", "RAPID", "SMILE", "TOUCH",
  "VOGUE", "WHEAT", "ADAPT", "BRAVE", "CLIMB", "DANCE", "EVOKE", "FAITH",
  "GRAND", "HONOR", "IDEAL", "JOLLY", "KNACK", "LOYAL", "MERIT", "NERVE",
  "ORBIT", "PLUMB", "QUILT", "ROCKY", "SWEPT", "THYME", "URBAN", "VIGOR",
  "WIELD", "YEARN", "ZIPPY", "AGILE", "BENDY", "CRISP", "DIGIT", "EMBER",
  "FIELD", "GREAT", "HANDY", "INPUT", "JUDGE", "KNIFE", "LEGAL", "METRO",
  "OFFER", "PROUD", "QUITE", "RANGE", "SWIFT", "THEME", "VIVID", "WROTE",
  "ABYSS", "BURST", "CRANE", "DUTCH", "ENTRY", "FALSE", "GENRE", "HORSE",
  "INDEX", "JUMBO", "KARMA", "LABEL", "MAPLE", "NORTH", "OMEGA", "PARTY",
  
  // Medium difficulty
  "QUEEN", "RADIO", "SALON", "TABLE", "ULTRA", "VALVE", "WHALE", "XENON",
  "YEAST", "ABIDE", "BATCH", "CABLE", "DAILY", "EARNS", "FAVOR", "GHOST",
  "HAVEN", "IVORY", "JOUST", "KINKY", "LEMON", "MOUNT", "NASAL", "OVERT",
  "PIANO", "RAINY", "SAINT", "TRAIT", "UPSET", "VENOM", "WALTZ", "YACHT",
  "ZONAL", "ACTOR", "BENCH", "CARGO", "DEMON", "EMBED", "FIBER", "GLASS",
  "HEDGE", "INLET", "JELLY", "LATCH", "MELON", "NOVEL", "OPERA",
  "PIXEL", "RATIO", "SOLAR", "TANGO", "UNCLE", "VISIT", "WIDOW", "ZEBRA",
  "BLEND", "COACH", "DEPTH", "ERROR", "FLAME", "GUARD", "HUMOR", "ICILY",
  "JUMPS", "LAUGH", "MODAL", "QUOTA",
  
  // Harder words
  "NYMPH", "ORDER", "POLAR", "QUIET", "ROYAL", "SPORT", "THIEF", "UNION",
  "VILLA", "WASTE", "AUDIT", "BUYER", "CIVIL", "DONOR", "ELITE", "FORUM",
  "GRAIN", "ISSUE", "LABOR", "MAYOR", "NICHE", "PANEL", "RADAR", "TRIBE",
  "VIRAL", "WAGON", "ACIDS", "BEAST", "CEDAR", "DEALT", "EAGER", "FEAST",
  "GIANT", "HASTE", "IDEAS", "KILLS", "LEAST", "MINOR", "NOISE", "PLOTS",
  "QUEUE", "REIGN", "SHARK", "TIGHT", "VOTER", "WELLS", "ZONES", "ADORE",
  "CHESS", "DWELL", "FLARE", "GLAZE", "HARSH", "MOOSE", "NINTH", "PATCH",
  "QUAKE", "SETUP", "TIDAL", "VIPER", "WHEEL", "BLAZE", "CREEP", "DENSE",
  "FLOOD", "GRASP", "HELPS", "INNER", "JOLTS", "ALARM", "WRECK"
];

// Use clean, validated Turkish word list
export const TARGET_WORDS_TR = CLEAN_TR_WORDS;

export const TARGET_WORDS: Record<Language, string[]> = {
  en: TARGET_WORDS_EN,
  tr: TARGET_WORDS_TR,
};

export const ALLOWED_GUESSES_EN = [
  ...TARGET_WORDS_EN,
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

// Turkish guess list - currently using cleaned target list
// TODO: Expand with broader validated Turkish 5-letter dictionary
// For MVP: using curated list ensures no inappropriate/foreign words
export const ALLOWED_GUESSES_TR = [...TARGET_WORDS_TR];

const ALLOWED_GUESSES_EN_SET = new Set(ALLOWED_GUESSES_EN);
const ALLOWED_GUESSES_TR_SET = new Set(ALLOWED_GUESSES_TR);

export const ALLOWED_GUESSES: Record<Language, string[]> = {
  en: ALLOWED_GUESSES_EN,
  tr: ALLOWED_GUESSES_TR,
};

export function getWordOfTheDay(yyyymmdd: string, language: Language = "en"): string {
  const words = TARGET_WORDS[language];
  const hash = createHash("sha256")
    .update(WORD_SALT + yyyymmdd + language)
    .digest("hex");
  
  const index = parseInt(hash.substring(0, 8), 16) % words.length;
  return words[index];
}

// Exported version of normalizeGuess (main implementation)
export function normalizeGuess(guess: string, language: Language = 'en'): string {
  // For Turkish: Use toLocaleUpperCase('tr-TR') to handle Turkish characters properly
  // This ensures ö→Ö, ü→Ü, ğ→Ğ, ş→Ş, ç→Ç, ı→I, i→İ
  if (language === 'tr') {
    return guess.toLocaleUpperCase('tr-TR').trim();
  }
  return guess.toUpperCase().trim();
}

export function isValidGuess(guess: string, language: Language = 'en'): boolean {
  const normalized = normalizeGuess(guess, language);
  
  // Accept ANY 5-letter word (A-Z and Turkish characters: Ç, Ğ, İ, Ö, Ş, Ü)
  // The feedback system will handle coloring based on the solution
  if (normalized.length !== 5 || !/^[A-ZÇĞİÖŞÜ]{5}$/.test(normalized)) {
    return false;
  }
  
  return true;
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
  
  const multipliers = [6, 5, 4, 3, 2, 1];
  const multiplier = multipliers[attemptsUsed - 1] || 1;
  
  return Math.round(baseScore * multiplier);
}

export function calculateLossScore(feedback: ("correct" | "present" | "absent")[]): number {
  const correctCount = feedback.filter(f => f === "correct").length;
  const presentCount = feedback.filter(f => f === "present").length;
  
  // No multiplier for loss - just base score from last attempt
  const baseScore = (correctCount * 2) + (presentCount * 1);
  
  return baseScore;
}

export function calculateWinScore(attemptsUsed: number): number {
  const baseScore = 20;
  const multipliers = [6, 5, 4, 3, 2, 1];
  const multiplier = multipliers[attemptsUsed - 1] || 1;
  return Math.round(baseScore * multiplier);
}

export function getRandomWord(language: Language = "en"): string {
  const words = TARGET_WORDS[language];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

// Validate word lists at module load with proper Turkish normalization
function validateWordList(words: string[], language: string): void {
  const errors: string[] = [];
  const seen = new Set<string>();
  const lang: Language = language.toLowerCase() as Language;
  
  words.forEach((word, index) => {
    // Normalize word using proper Turkish locale + NFC composition
    const normalized = normalizeGuess(word, lang).normalize('NFC');
    
    // Check length on normalized word
    if (normalized.length !== 5) {
      errors.push(`${language}[${index}]: "${word}" has ${normalized.length} letters after normalization (must be 5)`);
    }
    
    // Check valid characters on normalized word
    if (lang === 'tr') {
      // Allow uppercase Latin + Turkish special chars (Ç, Ğ, İ, Ö, Ş, Ü)
      if (!/^[A-ZÇĞİÖŞÜ]{5}$/.test(normalized)) {
        errors.push(`${language}[${index}]: "${word}" (normalized: "${normalized}") contains invalid characters`);
      }
    } else {
      // English: only A-Z
      if (!/^[A-Z]{5}$/.test(normalized)) {
        errors.push(`${language}[${index}]: "${word}" contains invalid characters`);
      }
    }
    
    // Check for duplicates using normalized form
    if (seen.has(normalized)) {
      errors.push(`${language}[${index}]: "${word}" (normalized: "${normalized}") is duplicate`);
    }
    seen.add(normalized);
  });
  
  if (errors.length > 0) {
    console.error(`\n❌ Word list validation failed for ${language}:`);
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error(`Invalid ${language} word list: ${errors.length} error(s) found`);
  }
  
  console.log(`✅ ${language.toUpperCase()} word list validated: ${words.length} words`);
}

// Run validation on module load
validateWordList(TARGET_WORDS_EN, 'EN');
validateWordList(TARGET_WORDS_TR, 'TR');
