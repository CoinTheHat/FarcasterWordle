import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Language } from "@shared/schema";

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
  gameOverTryAgain: string;
  gameOverScore: string;
  gameOverAttempts: string;
  gameOverSolution: string;
  gameOverShareTitle: string;
  gameOverShareDesc: string;
  gameOverShare: string;
  gameOverCopied: string;
  gameOverSaveScore: string;
  gameOverSaving: string;
  gameOverConnectWallet: string;
  gameOverConnecting: string;
  gameOverClose: string;
  
  // Stats Modal
  statsTitle: string;
  statsStreak: string;
  statsMaxStreak: string;
  statsTodayScore: string;
  statsClose: string;
  
  // Settings Modal
  settingsTitle: string;
  settingsColorBlind: string;
  settingsColorBlindDesc: string;
  settingsUsername: string;
  settingsUsernamePlaceholder: string;
  settingsSave: string;
  settingsSaving: string;
  settingsClose: string;
  
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
    gameOverCongrats: "Congratulations!",
    gameOverTryAgain: "Try Again Tomorrow",
    gameOverScore: "Score",
    gameOverAttempts: "Attempts",
    gameOverSolution: "Solution",
    gameOverShareTitle: "Share your result",
    gameOverShareDesc: "Share your achievement on Farcaster",
    gameOverShare: "Share to Cast",
    gameOverCopied: "Copied to clipboard!",
    gameOverSaveScore: "Save Score to Leaderboard",
    gameOverSaving: "Saving...",
    gameOverConnectWallet: "Connect Wallet",
    gameOverConnecting: "Connecting...",
    gameOverClose: "Close",
    
    // Stats Modal
    statsTitle: "Statistics",
    statsStreak: "Current Streak",
    statsMaxStreak: "Max Streak",
    statsTodayScore: "Today's Score",
    statsClose: "Close",
    
    // Settings Modal
    settingsTitle: "Settings",
    settingsColorBlind: "Color Blind Mode",
    settingsColorBlindDesc: "High contrast colors",
    settingsUsername: "Username",
    settingsUsernamePlaceholder: "Enter username",
    settingsSave: "Save",
    settingsSaving: "Saving...",
    settingsClose: "Close",
    
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
    gameOverCongrats: "Tebrikler!",
    gameOverTryAgain: "Yarın Tekrar Dene",
    gameOverScore: "Skor",
    gameOverAttempts: "Deneme",
    gameOverSolution: "Çözüm",
    gameOverShareTitle: "Sonucunu paylaş",
    gameOverShareDesc: "Başarını Farcaster'da paylaş",
    gameOverShare: "Cast'e Paylaş",
    gameOverCopied: "Panoya kopyalandı!",
    gameOverSaveScore: "Skoru Liderlik Tablosuna Kaydet",
    gameOverSaving: "Kaydediliyor...",
    gameOverConnectWallet: "Cüzdan Bağla",
    gameOverConnecting: "Bağlanıyor...",
    gameOverClose: "Kapat",
    
    // Stats Modal
    statsTitle: "İstatistikler",
    statsStreak: "Güncel Seri",
    statsMaxStreak: "Maksimum Seri",
    statsTodayScore: "Bugünün Skoru",
    statsClose: "Kapat",
    
    // Settings Modal
    settingsTitle: "Ayarlar",
    settingsColorBlind: "Renk Körlüğü Modu",
    settingsColorBlindDesc: "Yüksek kontrastlı renkler",
    settingsUsername: "Kullanıcı Adı",
    settingsUsernamePlaceholder: "Kullanıcı adı girin",
    settingsSave: "Kaydet",
    settingsSaving: "Kaydediliyor...",
    settingsClose: "Kapat",
    
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
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("wordcast-ui-language") as Language;
    return saved || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("wordcast-ui-language", lang);
  };

  useEffect(() => {
    // Sync game language with UI language if not set
    const gameLanguage = localStorage.getItem("wordcast-language");
    if (!gameLanguage) {
      localStorage.setItem("wordcast-language", language);
    }
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, t: translations[language], setLanguage }}>
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
