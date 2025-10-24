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

export function normalizeGuess(guess: string, language: string = 'en'): string {
  // Use Turkish locale only for Turkish language to handle i → İ properly
  // Use standard uppercase for English to avoid İ issues
  if (language === 'tr') {
    return guess.toLocaleUpperCase('tr-TR').trim();
  }
  return guess.toUpperCase().trim();
}

export function isValidGuess(guess: string, language: string = 'en'): boolean {
  const normalized = normalizeGuess(guess, language);
  // Accept any 5-letter word with A-Z and Turkish characters (Ç, Ğ, İ, Ö, Ş, Ü)
  return normalized.length === 5 && /^[A-ZÇĞİÖŞÜ]{5}$/.test(normalized);
}
