import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  const { language } = useTranslation();
  const content = {
    tr: {
      title: "Nasıl Oynanır?",
      objective: "Amaç",
      objectiveText: "5 harfli kelimeyi 6 denemede tahmin et",
      rules: "Kurallar",
      rule1: "Her tahmin 5 harfli geçerli bir kelime olmalı",
      rule2: "Her denemeden sonra, harflerin rengi değişerek ipucu verir:",
      greenTitle: "Yeşil",
      greenDesc: "Harf doğru ve doğru yerde",
      yellowTitle: "Sarı",
      yellowDesc: "Harf doğru ama yanlış yerde",
      grayTitle: "Gri",
      grayDesc: "Harf kelimede yok",
      scoring: "Puanlama Sistemi",
      winScoring: "Kazandığınızda:",
      attempt1: "1. denemede: 120 puan",
      attempt2: "2. denemede: 100 puan",
      attempt3: "3. denemede: 80 puan",
      attempt4: "4. denemede: 60 puan",
      attempt5: "5. denemede: 40 puan",
      attempt6: "6. denemede: 20 puan",
      lossScoring: "Kaybettiğinizde:",
      lossDesc: "Son tahmininize göre:",
      greenPoint: "Yeşil harf: 2 puan",
      yellowPoint: "Sarı harf: 1 puan",
      maxPoint: "Maksimum: 10 puan",
      streak: "Streak (Seri)",
      streakDesc: "Ardışık günlerde oynadıkça streak'in artar. Bir gün atlarsan sıfırlanır!",
      tips: "İpuçları",
      tip1: "Yaygın harflerle başla (A, E, İ, R, L, N)",
      tip2: "Her tahmin yeni bilgi verir - renkli ipuçlarını kullan",
      tip3: "Sıralama liderini hedefle - erken çöz, yüksek puan kazan!",
    },
    en: {
      title: "How to Play",
      objective: "Objective",
      objectiveText: "Guess the 5-letter word in 6 attempts",
      rules: "Rules",
      rule1: "Each guess must be a valid 5-letter word",
      rule2: "After each guess, the color of the tiles will change:",
      greenTitle: "Green",
      greenDesc: "Letter is correct and in the right spot",
      yellowTitle: "Yellow",
      yellowDesc: "Letter is in the word but wrong spot",
      grayTitle: "Gray",
      grayDesc: "Letter is not in the word",
      scoring: "Scoring System",
      winScoring: "When you win:",
      attempt1: "1st attempt: 120 points",
      attempt2: "2nd attempt: 100 points",
      attempt3: "3rd attempt: 80 points",
      attempt4: "4th attempt: 60 points",
      attempt5: "5th attempt: 40 points",
      attempt6: "6th attempt: 20 points",
      lossScoring: "When you lose:",
      lossDesc: "Based on your last guess:",
      greenPoint: "Green letter: 2 points",
      yellowPoint: "Yellow letter: 1 point",
      maxPoint: "Maximum: 10 points",
      streak: "Streak",
      streakDesc: "Play consecutive days to build your streak. Skip a day and it resets!",
      tips: "Tips",
      tip1: "Start with common letters (A, E, R, S, T, L)",
      tip2: "Each guess gives new info - use the colored clues",
      tip3: "Aim for the leaderboard - solve early, score high!",
    },
  };

  const t = content[language];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Objective */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t.objective}</h3>
            <p className="text-muted-foreground">{t.objectiveText}</p>
          </div>

          {/* Rules */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t.rules}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• {t.rule1}</li>
              <li>• {t.rule2}</li>
            </ul>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-green-600 dark:bg-green-700 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <div className="font-semibold">{t.greenTitle}</div>
                  <div className="text-sm text-muted-foreground">{t.greenDesc}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div>
                  <div className="font-semibold">{t.yellowTitle}</div>
                  <div className="text-sm text-muted-foreground">{t.yellowDesc}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div>
                  <div className="font-semibold">{t.grayTitle}</div>
                  <div className="text-sm text-muted-foreground">{t.grayDesc}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t.scoring}</h3>
            
            <div className="mb-3">
              <div className="font-medium mb-2 text-green-600 dark:text-green-500">{t.winScoring}</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t.attempt1}</span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">120</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.attempt2}</span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">100</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.attempt3}</span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">80</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.attempt4}</span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">60</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.attempt5}</span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">40</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.attempt6}</span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">20</Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2 text-orange-600 dark:text-orange-500">{t.lossScoring}</div>
              <div className="text-sm text-muted-foreground mb-2">{t.lossDesc}</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t.greenPoint}</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t.yellowPoint}</span>
                  <Badge variant="secondary">1</Badge>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t.maxPoint}</span>
                  <Badge variant="secondary">10</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t.streak}</h3>
            <p className="text-muted-foreground">{t.streakDesc}</p>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t.tips}</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>💡 {t.tip1}</li>
              <li>💡 {t.tip2}</li>
              <li>💡 {t.tip3}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
