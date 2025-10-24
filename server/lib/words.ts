import { createHash } from "crypto";
import { WORD_SALT } from "../env";

export type Language = "en" | "tr";

export const TARGET_WORDS_EN = [
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

export const TARGET_WORDS_TR = [
  "AFYON", "ASLAN", "BEKCI", "BILGI", "BOCEK", "BOMBA", "BUDUN", "BULUT",
  "CAMIZ", "CELIK", "CEVAP", "CIKAR", "DAMLA", "DEDIK", "DOGRU", "DURUM",
  "EKSEN", "ENLEM", "FASIL", "FIKIR", "FIYAT", "GARIP", "GECIT", "GIZLI",
  "GURUH", "HAYIR", "HEVES", "HIKAY", "IMZAC", "ISLEM", "IZLEK", "KABUK",
  "KADRO", "KALIN", "KASIK", "KAVGA", "KAYIP", "KESIK", "KILIC", "KIYMA",
  "KOMUR", "KORKU", "KURAL", "KUSAK", "LABEL", "LODOS", "MAKAM", "MALUM",
  "MARUL", "MECAZ", "MELOD", "MUCIZ", "NABIZ", "NAKIT", "NESIL", "NIYET",
  "OBJEK", "ODUNC", "OLMAZ", "ORGAN", "ORTAC", "OYNAK", "OZLEM", "PARCA",
  "PILAV", "RAKAM", "RANGU", "RESMI", "RUTIN", "SABAH", "SAKIN", "SAPAN",
  "SEBEP", "SEMIZ", "SICAK", "SIFIR", "SINEK", "SOMUT", "SORUN", "SUYLA",
  "TALAN", "TAPIR", "TEMEL", "TOKAT", "TOPAL", "TORUN", "TUTAR", "UCRET",
  "UMUMI", "UREME", "VAPUR", "VERIM", "YAKUT", "YAYLA", "YETKI", "YIGIT",
  "YORUM", "YUDUM", "ZAFER", "ZIMBA", "ZIRVE", "ZURNA"
];

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

export const ALLOWED_GUESSES_TR = [
  ...TARGET_WORDS_TR,
  "ACEMI", "ACIKIZ", "ACILIS", "ADRES", "AFACAN", "AGACI", "AHALI", "AHBAP",
  "AHLAK", "AHRET", "AIDAT", "AJANS", "AKLIN", "AKSAM", "AKSIYON", "AKTIF",
  "ALBAY", "ALCAK", "ALFABE", "ALICI", "ALINTI", "ALKOL", "AMBAR", "AMIR",
  "ANANE", "ANCAK", "ANKET", "ANLIK", "ANLAM", "ANSIZ", "ANTIK", "ARADA",
  "ARACI", "ARAZI", "ARIFE", "ARKAC", "ASAGI", "ASAMA", "ASAYIS", "ASIIR",
  "ASTAR", "ATAMA", "ATLET", "ATLAS", "AVANS", "AVARE", "AYINC", "AYRAC",
  "AZAMI", "BABAC", "BAGAJ", "BAGIM", "BAKAC", "BAKIC", "BALCI", "BALKA",
  "BANKO", "BASIN", "BASIT", "BASMA", "BATAC", "BATIK", "BAZEN", "BEKAR",
  "BEKCI", "BENIZ", "BERAT", "BEYAN", "BEYAZ", "BICAK", "BIDON", "BILGE",
  "BILIN", "BILIM", "BIRAZ", "BIREY", "BIRIM", "BOCAK", "BOHEM", "BOYLU",
  "BONUS", "BORAC", "BORSA", "BOSUN", "BOZUK", "BUCUR", "BUDUN", "BUGUN"
];

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

export function isValidGuess(guess: string, language: Language = 'en'): boolean {
  // Use Turkish locale for proper uppercase conversion (i → İ)
  const normalized = guess.toLocaleUpperCase('tr-TR').trim();
  
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
  
  const multipliers = [5, 4, 3, 2, 1.5, 1];
  const multiplier = multipliers[attemptsUsed - 1] || 1;
  
  return Math.round(baseScore * multiplier);
}

export function getRandomWord(language: Language = "en"): string {
  const words = TARGET_WORDS[language];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}
