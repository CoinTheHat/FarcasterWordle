import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import type { Language } from "@shared/schema";

interface TranslationFunctions {
  solvedIn: (attempts: number) => string;
  triesLabel: (attempts: number) => string;
}

interface Translations {
  // Header
  headerTitle: string;
  headerScore: string;
  headerStats: string;
  headerHelp: string;
  headerSettings: string;
  
  // Game
  gameEnterGuess: string;
  gameSubmit: string;
  gameHint: string;
  gameHintUsed: string;
  gameInvalidWord: string;
  gameSessionExpired: string;
  gameSessionExpiredDesc: string;
  
  // GameOver Modal
  gameOverCongrats: string;
  gameOverGameOver: string;
  gameOverTryAgain: string;
  gameOverSolvedIn: string;
  gameOverTry: string;
  gameOverTries: string;
  gameOverBetterLuck: string;
  gameOverTheWordWas: string;
  gameOverStreak: string;
  gameOverScore: string;
  gameOverTryCount: string;
  gameOverSaveWarning: string;
  gameOverSaveWarningDesc: string;
  gameOverSaveToBlockchain: string;
  gameOverSaving: string;
  gameOverShareResult: string;
  gameOverSaved: string;
  gameOverSavedDesc: string;
  gameOverComeBackTomorrow: string;
  
  // Stats Modal
  statsTitle: string;
  statsDescription: string;
  statsCurrentStreak: string;
  statsMaxStreak: string;
  statsLastPlayed: string;
  
  // Settings Modal
  settingsTitle: string;
  settingsDescription: string;
  settingsColorBlind: string;
  settingsColorBlindDesc: string;
  settingsUsername: string;
  settingsUsernameDesc: string;
  settingsUsernamePlaceholder: string;
  settingsUsernameButton: string;
  settingsUsernameUpdating: string;
  settingsUsernameEmpty: string;
  settingsUsernameFailed: string;
  settingsUsernameSuccess: string;
  settingsWallet: string;
  settingsWalletDesc: string;
  settingsWalletConnected: string;
  settingsWalletSaved: string;
  settingsWalletConnect: string;
  settingsWalletConnecting: string;
  settingsOn: string;
  settingsOff: string;
  
  // How to Play Modal
  howToPlayTitle: string;
  howToPlayGuess: string;
  howToPlayGuessDesc: string;
  howToPlayFeedback: string;
  howToPlayCorrect: string;
  howToPlayWrongSpot: string;
  howToPlayNotInWord: string;
  howToPlayScoring: string;
  howToPlayScoringDesc: string;
  howToPlayHints: string;
  howToPlayHintsDesc: string;
  howToPlayGotIt: string;
  
  // Language Modal
  languageChoose: string;
  languageSelect: string;
  
  // Leaderboard
  leaderboardTitle: string;
  leaderboardDesc: string;
  leaderboardDaily: string;
  leaderboardWeekly: string;
  leaderboardBestScores: string;
  leaderboardTopPlayers: string;
  leaderboardLastWeek: string;
  leaderboardLastWeekDesc: string;
  leaderboardPrizeWinner: string;
  leaderboardNoWallet: string;
  leaderboardPoints: string;
  leaderboardCopied: string;
  leaderboardCopyDesc: string;
  leaderboardClickToCopy: string;
  leaderboardPlayer: string;
  leaderboardBestScore: string;
  leaderboardWin: string;
  leaderboardWins: string;
  leaderboardNoWins: string;
  leaderboardAttempt: string;
  leaderboardAttempts: string;
  leaderboardPrize: string;
  leaderboardNoScores: string;
  leaderboard1st: string;
  leaderboard2nd: string;
  leaderboard3rd: string;
  leaderboardTh: string;
  
  // Wallet
  walletConnect: string;
  walletConnected: string;
  walletFarcaster: string;
  
  // Errors
  errorGeneric: string;
  errorNetwork: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header
    headerTitle: "WordCast",
    headerScore: "Score",
    headerStats: "Stats",
    headerHelp: "Help",
    headerSettings: "Settings",
    
    // Game
    gameEnterGuess: "Enter your guess",
    gameSubmit: "Submit",
    gameHint: "Get Hint",
    gameHintUsed: "Hint Used",
    gameInvalidWord: "Not a valid word",
    gameSessionExpired: "Session Expired",
    gameSessionExpiredDesc: "Your game session has expired. Starting a new game...",
    
    // GameOver Modal
    gameOverCongrats: "🎉 Congratulations!",
    gameOverGameOver: "😔 Game Over",
    gameOverTryAgain: "Try Again Tomorrow",
    gameOverSolvedIn: "You solved it in",
    gameOverTry: "try",
    gameOverTries: "tries",
    gameOverBetterLuck: "Better luck tomorrow!",
    gameOverTheWordWas: "The word was:",
    gameOverStreak: "Streak",
    gameOverScore: "Score",
    gameOverTryCount: "Tries",
    gameOverSaveWarning: "⚠️ Save to blockchain to count for leaderboards & streaks!",
    gameOverSaveWarningDesc: "Without saving, you can play again with a new word",
    gameOverSaveToBlockchain: "Save Score to Blockchain",
    gameOverSaving: "Saving...",
    gameOverShareResult: "Share Result",
    gameOverSaved: "✅ Score saved to blockchain! Come back tomorrow for a new word.",
    gameOverSavedDesc: "Come back tomorrow for a new word.",
    gameOverComeBackTomorrow: "Come back tomorrow for a new word!",
    
    // Stats Modal
    statsTitle: "Statistics",
    statsDescription: "Your WordCast performance",
    statsCurrentStreak: "Current Streak",
    statsMaxStreak: "Max Streak",
    statsLastPlayed: "Last played:",
    
    // Settings Modal
    settingsTitle: "Settings",
    settingsDescription: "Customize your experience",
    settingsColorBlind: "Color Blind Mode",
    settingsColorBlindDesc: "High contrast colors",
    settingsUsername: "Username",
    settingsUsernameDesc: "Display name for leaderboard (letters, numbers, -, _)",
    settingsUsernamePlaceholder: "Enter your username",
    settingsUsernameButton: "Update Username",
    settingsUsernameUpdating: "Updating...",
    settingsUsernameEmpty: "Username cannot be empty",
    settingsUsernameFailed: "Failed to update username",
    settingsUsernameSuccess: "✓ Username updated successfully",
    settingsWallet: "Wallet",
    settingsWalletDesc: "Connect wallet for weekly leaderboard prizes",
    settingsWalletConnected: "Connected:",
    settingsWalletSaved: "✓ Wallet saved for prize distribution",
    settingsWalletConnect: "Connect Wallet",
    settingsWalletConnecting: "Connecting...",
    settingsOn: "On",
    settingsOff: "Off",
    
    // How to Play Modal
    howToPlayTitle: "How to Play",
    howToPlayGuess: "Guess the word in 6 attempts",
    howToPlayGuessDesc: "Each guess must be a valid 5-letter word. Hit submit to check your guess.",
    howToPlayFeedback: "After each guess, the color of the tiles will change:",
    howToPlayCorrect: "Letter is in the correct position",
    howToPlayWrongSpot: "Letter is in the word but wrong position",
    howToPlayNotInWord: "Letter is not in the word",
    howToPlayScoring: "Scoring",
    howToPlayScoringDesc: "Win faster to earn more points! Each win earns 20 points × multiplier based on attempts.",
    howToPlayHints: "Hints",
    howToPlayHintsDesc: "You can use one hint per game, but it reduces your score by 50%.",
    howToPlayGotIt: "Got it!",
    
    // Language Modal
    languageChoose: "Choose Language",
    languageSelect: "Select your preferred language",
    
    // Leaderboard
    leaderboardTitle: "Leaderboard",
    leaderboardDesc: "See how you rank against other players",
    leaderboardDaily: "Daily",
    leaderboardWeekly: "Weekly",
    leaderboardBestScores: "Best Scores",
    leaderboardTopPlayers: "Top Players",
    leaderboardLastWeek: "Last Week's Winners",
    leaderboardLastWeekDesc: "Top 3 players from previous week",
    leaderboardPrizeWinner: "Prize Winner",
    leaderboardNoWallet: "No wallet connected",
    leaderboardPoints: "points",
    leaderboardCopied: "Copied!",
    leaderboardCopyDesc: "Wallet address copied to clipboard",
    leaderboardClickToCopy: "Click to copy full address",
    leaderboardPlayer: "Player",
    leaderboardBestScore: "Best Score",
    leaderboardWin: "win",
    leaderboardWins: "wins",
    leaderboardNoWins: "No wins",
    leaderboardAttempt: "attempt",
    leaderboardAttempts: "attempts",
    leaderboardPrize: "Prize",
    leaderboardNoScores: "No scores yet. Be the first to play!",
    leaderboard1st: "1st",
    leaderboard2nd: "2nd",
    leaderboard3rd: "3rd",
    leaderboardTh: "th",
    
    // Wallet
    walletConnect: "Connect Wallet",
    walletConnected: "Connected",
    walletFarcaster: "Farcaster Wallet",
    
    // Errors
    errorGeneric: "Something went wrong",
    errorNetwork: "Network error. Please try again.",
  },
  tr: {
    // Header
    headerTitle: "WordCast",
    headerScore: "Skor",
    headerStats: "İstatistikler",
    headerHelp: "Yardım",
    headerSettings: "Ayarlar",
    
    // Game
    gameEnterGuess: "Tahmininizi girin",
    gameSubmit: "Gönder",
    gameHint: "İpucu Al",
    gameHintUsed: "İpucu Kullanıldı",
    gameInvalidWord: "Geçerli bir kelime değil",
    gameSessionExpired: "Oturum Süresi Doldu",
    gameSessionExpiredDesc: "Oyun oturumunuz sona erdi. Yeni oyun başlatılıyor...",
    
    // GameOver Modal
    gameOverCongrats: "🎉 Tebrikler!",
    gameOverGameOver: "😔 Oyun Bitti",
    gameOverTryAgain: "Yarın Tekrar Dene",
    gameOverSolvedIn: "Kelimeyi çözdün:",
    gameOverTry: "denemede",
    gameOverTries: "denemede",
    gameOverBetterLuck: "Yarın daha iyi şans!",
    gameOverTheWordWas: "Kelime buydu:",
    gameOverStreak: "Seri",
    gameOverScore: "Skor",
    gameOverTryCount: "Deneme",
    gameOverSaveWarning: "⚠️ Sıralama ve serilere sayılması için blockchain'e kaydet!",
    gameOverSaveWarningDesc: "Kaydetmeden yeni bir kelime ile tekrar oynayabilirsin",
    gameOverSaveToBlockchain: "Skoru Blockchain'e Kaydet",
    gameOverSaving: "Kaydediliyor...",
    gameOverShareResult: "Sonucu Paylaş",
    gameOverSaved: "✅ Skor blockchain'e kaydedildi! Yeni kelime için yarın gel.",
    gameOverSavedDesc: "Yeni kelime için yarın gel.",
    gameOverComeBackTomorrow: "Yeni kelime için yarın gel!",
    
    // Stats Modal
    statsTitle: "İstatistikler",
    statsDescription: "WordCast performansın",
    statsCurrentStreak: "Mevcut Seri",
    statsMaxStreak: "En Uzun Seri",
    statsLastPlayed: "Son oynanma:",
    
    // Settings Modal
    settingsTitle: "Ayarlar",
    settingsDescription: "Deneyiminizi özelleştirin",
    settingsColorBlind: "Renk Körlüğü Modu",
    settingsColorBlindDesc: "Yüksek kontrastlı renkler",
    settingsUsername: "Kullanıcı Adı",
    settingsUsernameDesc: "Sıralama için görünen ad (harf, rakam, -, _)",
    settingsUsernamePlaceholder: "Kullanıcı adınızı girin",
    settingsUsernameButton: "Kullanıcı Adını Güncelle",
    settingsUsernameUpdating: "Güncelleniyor...",
    settingsUsernameEmpty: "Kullanıcı adı boş olamaz",
    settingsUsernameFailed: "Kullanıcı adı güncellenemedi",
    settingsUsernameSuccess: "✓ Kullanıcı adı başarıyla güncellendi",
    settingsWallet: "Cüzdan",
    settingsWalletDesc: "Haftalık sıralama ödülleri için cüzdan bağlayın",
    settingsWalletConnected: "Bağlandı:",
    settingsWalletSaved: "✓ Cüzdan ödül dağıtımı için kaydedildi",
    settingsWalletConnect: "Cüzdan Bağla",
    settingsWalletConnecting: "Bağlanıyor...",
    settingsOn: "Açık",
    settingsOff: "Kapalı",
    
    // How to Play Modal
    howToPlayTitle: "Nasıl Oynanır",
    howToPlayGuess: "Kelimeyi 6 denemede tahmin et",
    howToPlayGuessDesc: "Her tahmin geçerli 5 harfli bir kelime olmalıdır. Tahmininizi kontrol etmek için göndere basın.",
    howToPlayFeedback: "Her tahminden sonra, karoların rengi değişecek:",
    howToPlayCorrect: "Harf doğru konumda",
    howToPlayWrongSpot: "Harf kelimede var ama yanlış konumda",
    howToPlayNotInWord: "Harf kelimede yok",
    howToPlayScoring: "Puanlama",
    howToPlayScoringDesc: "Daha hızlı kazanarak daha fazla puan kazan! Her kazanç, deneme sayısına göre çarpan × 20 puan getirir.",
    howToPlayHints: "İpuçları",
    howToPlayHintsDesc: "Oyun başına bir ipucu kullanabilirsiniz, ancak skorunuzu %50 azaltır.",
    howToPlayGotIt: "Anladım!",
    
    // Language Modal
    languageChoose: "Dil Seçin",
    languageSelect: "Tercih ettiğiniz dili seçin",
    
    // Leaderboard
    leaderboardTitle: "Liderlik Tablosu",
    leaderboardDesc: "Diğer oyunculara karşı sıralamanızı görün",
    leaderboardDaily: "Günlük",
    leaderboardWeekly: "Haftalık",
    leaderboardBestScores: "En İyi Skorlar",
    leaderboardTopPlayers: "En İyi Oyuncular",
    leaderboardLastWeek: "Geçen Haftanın Kazananları",
    leaderboardLastWeekDesc: "Geçen haftanın ilk 3 oyuncusu",
    leaderboardPrizeWinner: "Ödül Kazanan",
    leaderboardNoWallet: "Cüzdan bağlanmadı",
    leaderboardPoints: "puan",
    leaderboardCopied: "Kopyalandı!",
    leaderboardCopyDesc: "Cüzdan adresi panoya kopyalandı",
    leaderboardClickToCopy: "Tam adresi kopyalamak için tıklayın",
    leaderboardPlayer: "Oyuncu",
    leaderboardBestScore: "En İyi Skor",
    leaderboardWin: "galibiyet",
    leaderboardWins: "galibiyet",
    leaderboardNoWins: "Galibiyet yok",
    leaderboardAttempt: "deneme",
    leaderboardAttempts: "deneme",
    leaderboardPrize: "Ödül",
    leaderboardNoScores: "Henüz skor yok. İlk oynayan sen ol!",
    leaderboard1st: "1.",
    leaderboard2nd: "2.",
    leaderboard3rd: "3.",
    leaderboardTh: ".",
    
    // Wallet
    walletConnect: "Cüzdan Bağla",
    walletConnected: "Bağlandı",
    walletFarcaster: "Farcaster Cüzdanı",
    
    // Errors
    errorGeneric: "Bir şeyler yanlış gitti",
    errorNetwork: "Ağ hatası. Lütfen tekrar deneyin.",
  },
};

interface I18nContextType {
  language: Language;
  t: Translations;
  tf: TranslationFunctions;
  setLanguage: (lang: Language) => void;
  registerLanguageChange: (callback: (lang: Language) => void) => () => void;
}

const translationFunctions: Record<Language, TranslationFunctions> = {
  en: {
    solvedIn: (attempts: number) => `You solved it in ${attempts} ${attempts === 1 ? "try" : "tries"}!`,
    triesLabel: (attempts: number) => attempts === 1 ? "try" : "tries",
  },
  tr: {
    solvedIn: (attempts: number) => `${attempts} denemede çözdün!`,
    triesLabel: (attempts: number) => "deneme",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("wordcast-ui-language") as Language;
    return saved || "en";
  });
  
  // Use ref to store callbacks so they persist across renders without causing re-renders
  const callbacksRef = useRef<Set<(lang: Language) => void>>(new Set());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("wordcast-ui-language", lang);
    localStorage.setItem("wordcast-language", lang);
    
    // Trigger all callbacks
    callbacksRef.current.forEach(callback => callback(lang));
  }, []);

  const registerLanguageChange = useCallback((callback: (lang: Language) => void) => {
    callbacksRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    // Sync game language with UI language if not set
    const gameLanguage = localStorage.getItem("wordcast-language");
    if (!gameLanguage) {
      localStorage.setItem("wordcast-language", language);
    }
  }, [language]);

  return (
    <I18nContext.Provider value={{ 
      language, 
      t: translations[language], 
      tf: translationFunctions[language],
      setLanguage,
      registerLanguageChange 
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
