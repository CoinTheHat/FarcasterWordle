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
  "AFYON", "ASLAN", "BEKÇİ", "BİLGİ", "BÖCEK", "BOMBA", "BUDUN", "BULUT",
  "CAMİZ", "ÇELİK", "CEVAP", "ÇIKAR", "DAMLA", "DEDİK", "DOĞRU", "DURUM",
  "EKSEN", "ENLEM", "FASIL", "FİKİR", "FİYAT", "GARİP", "GEÇİT", "GİZLİ",
  "GÜRUH", "HAYIR", "HEVES", "HİKAY", "İMZAÇ", "İŞLEM", "İZLEK", "KABUK",
  "KADRO", "KALIN", "KAŞIK", "KAVGA", "KAYIP", "KESİK", "KILIÇ", "KIYMA",
  "KÖMÜR", "KORKU", "KURAL", "KUŞAK", "LABEL", "LODOS", "MAKAM", "MALUM",
  "MARUL", "MECAZ", "MELOD", "MUCİZ", "NABIZ", "NAKİT", "NESİL", "NİYET",
  "OBJEK", "ÖDÜNÇ", "OLMAZ", "ORGAN", "ORTAÇ", "OYNAK", "ÖZLEM", "PARÇA",
  "PİLAV", "RAKAM", "RANGU", "RESMİ", "RUTİN", "SABAH", "SAKİN", "SAPAN",
  "SEBEP", "SEMİZ", "SICAK", "SIFIR", "SİNEK", "SOMUT", "SORUN", "SUYLA",
  "TALAN", "TAPİR", "TEMEL", "TOKAT", "TOPAL", "TORUN", "TUTAR", "ÜCRET",
  "UMUMİ", "ÜREME", "VAPUR", "VERİM", "YAKUT", "YAYLA", "YETKİ", "YİĞİT",
  "YORUM", "YUDUM", "ZAFER", "ZİMBA", "ZİRVE", "ZURNA"
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
  "ACEMİ", "AÇIKIZ", "AÇILIŞ", "ADRES", "AFACAN", "AĞACI", "AHALİ", "AHBAP",
  "AHLAK", "AHRET", "AİDAT", "AJANS", "AKLIN", "AKŞAM", "AKSİYON", "AKTİF",
  "ALBAY", "ALÇAK", "ALFABE", "ALICI", "ALINTI", "ALKOL", "AMBAR", "AMİR",
  "ANANE", "ANCAK", "ANKET", "ANLIK", "ANLAM", "ANSIZ", "ANTİK", "ARADA",
  "ARACI", "ARAZİ", "ARİFE", "ARKAÇ", "AŞAĞI", "AŞAMA", "ASAYİŞ", "AŞIIR",
  "ASTAR", "ATAMA", "ATLET", "ATLAS", "AVANS", "AVARE", "AYINÇ", "AYRAÇ",
  "AZAMİ", "BABAÇ", "BAGAJ", "BAĞIM", "BAKAÇ", "BAKIÇ", "BALCI", "BALKA",
  "BANKO", "BASIN", "BASİT", "BASMA", "BATAÇ", "BATIK", "BAZEN", "BEKAR",
  "BEKÇİ", "BENİZ", "BERAT", "BEYAN", "BEYAZ", "BIÇAK", "BİDON", "BİLGE",
  "BİLİN", "BİLİM", "BİRAZ", "BİREY", "BİRİM", "BOCAK", "BOHEM", "BOYLU",
  "BONUS", "BORAÇ", "BORSA", "BOSUN", "BOZUK", "BUCUR", "BUDUN", "BUGÜN"
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
