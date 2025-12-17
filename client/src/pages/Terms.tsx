import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  const { language } = useTranslation();
  const isEnglish = language === "en";

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEnglish ? "Back" : "Geri"}
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle data-testid="text-terms-title">
              {isEnglish ? "Terms of Service" : "Kullanım Koşulları"}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {isEnglish ? (
              <div className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Last Updated:</strong> December 2024</p>

                <h3 className="text-foreground font-semibold">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using WordCast ("the Game"), you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use the Game.
                </p>

                <h3 className="text-foreground font-semibold">2. Description of Service</h3>
                <p>
                  WordCast is a daily word puzzle game available as a Mini-App on the Farcaster protocol. 
                  Players can guess a 5-letter word within 6 attempts, with the word changing daily.
                </p>

                <h3 className="text-foreground font-semibold">3. Eligibility</h3>
                <p>
                  You must have a valid Farcaster account to use the Game. You must be at least 13 years 
                  of age to use this service.
                </p>

                <h3 className="text-foreground font-semibold">4. Weekly Rewards</h3>
                <p>
                  The Game offers weekly USDC rewards to top players on the Base network. Rewards are 
                  distributed at our discretion and are subject to change or discontinuation without notice. 
                  To be eligible for rewards, players must complete blockchain transactions to record their scores.
                </p>

                <h3 className="text-foreground font-semibold">5. User Conduct</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use automated tools, bots, or scripts to play the Game</li>
                  <li>Attempt to exploit bugs or vulnerabilities</li>
                  <li>Interfere with other players' experience</li>
                  <li>Manipulate scores or streak counts</li>
                </ul>

                <h3 className="text-foreground font-semibold">6. Blockchain Transactions</h3>
                <p>
                  Score submissions require blockchain transactions on the Base network. You are responsible 
                  for any gas fees associated with these transactions. We are not responsible for failed 
                  transactions or network issues.
                </p>

                <h3 className="text-foreground font-semibold">7. Intellectual Property</h3>
                <p>
                  All content, design, and code of the Game are owned by WordCast. You may not copy, 
                  modify, or distribute any part of the Game without permission.
                </p>

                <h3 className="text-foreground font-semibold">8. Disclaimer of Warranties</h3>
                <p>
                  The Game is provided "as is" without warranties of any kind. We do not guarantee 
                  uninterrupted service or error-free operation.
                </p>

                <h3 className="text-foreground font-semibold">9. Limitation of Liability</h3>
                <p>
                  We are not liable for any damages arising from your use of the Game, including but 
                  not limited to lost rewards, failed transactions, or data loss.
                </p>

                <h3 className="text-foreground font-semibold">10. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of the Game 
                  after changes constitutes acceptance of the new terms.
                </p>

                <h3 className="text-foreground font-semibold">11. Contact</h3>
                <p>
                  For questions about these terms, please contact us through Farcaster.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Son Güncelleme:</strong> Aralık 2024</p>

                <h3 className="text-foreground font-semibold">1. Koşulların Kabulü</h3>
                <p>
                  WordCast'e ("Oyun") erişerek ve kullanarak bu Kullanım Koşullarına bağlı olmayı kabul 
                  etmiş olursunuz. Bu koşulları kabul etmiyorsanız, lütfen Oyunu kullanmayın.
                </p>

                <h3 className="text-foreground font-semibold">2. Hizmet Açıklaması</h3>
                <p>
                  WordCast, Farcaster protokolünde Mini-App olarak sunulan günlük kelime bulmaca oyunudur. 
                  Oyuncular, her gün değişen 5 harfli bir kelimeyi 6 deneme içinde tahmin etmeye çalışır.
                </p>

                <h3 className="text-foreground font-semibold">3. Uygunluk</h3>
                <p>
                  Oyunu kullanmak için geçerli bir Farcaster hesabınız olmalıdır. Bu hizmeti kullanmak 
                  için en az 13 yaşında olmalısınız.
                </p>

                <h3 className="text-foreground font-semibold">4. Haftalık Ödüller</h3>
                <p>
                  Oyun, Base ağında en iyi oyunculara haftalık USDC ödülleri sunar. Ödüller kendi 
                  takdirimize bağlı olarak dağıtılır ve önceden haber verilmeksizin değiştirilebilir 
                  veya durdurulabilir. Ödüllere hak kazanmak için oyuncuların puanlarını kaydetmek 
                  üzere blockchain işlemleri tamamlaması gerekir.
                </p>

                <h3 className="text-foreground font-semibold">5. Kullanıcı Davranışı</h3>
                <p>Şunları yapmamayı kabul ediyorsunuz:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Oyunu oynamak için otomatik araçlar, botlar veya scriptler kullanmak</li>
                  <li>Hataları veya güvenlik açıklarını istismar etmeye çalışmak</li>
                  <li>Diğer oyuncuların deneyimini engellemek</li>
                  <li>Puanları veya seri sayılarını manipüle etmek</li>
                </ul>

                <h3 className="text-foreground font-semibold">6. Blockchain İşlemleri</h3>
                <p>
                  Puan gönderimleri, Base ağında blockchain işlemleri gerektirir. Bu işlemlerle 
                  ilişkili gas ücretlerinden siz sorumlusunuz. Başarısız işlemlerden veya ağ 
                  sorunlarından sorumlu değiliz.
                </p>

                <h3 className="text-foreground font-semibold">7. Fikri Mülkiyet</h3>
                <p>
                  Oyunun tüm içeriği, tasarımı ve kodu WordCast'e aittir. İzin almadan Oyunun 
                  herhangi bir bölümünü kopyalayamaz, değiştiremez veya dağıtamazsınız.
                </p>

                <h3 className="text-foreground font-semibold">8. Garanti Reddi</h3>
                <p>
                  Oyun hiçbir garanti olmaksızın "olduğu gibi" sağlanmaktadır. Kesintisiz hizmet 
                  veya hatasız çalışma garanti etmiyoruz.
                </p>

                <h3 className="text-foreground font-semibold">9. Sorumluluk Sınırlaması</h3>
                <p>
                  Oyunu kullanımınızdan kaynaklanan herhangi bir zarardan, kayıp ödüller, başarısız 
                  işlemler veya veri kaybı dahil ancak bunlarla sınırlı olmamak üzere sorumlu değiliz.
                </p>

                <h3 className="text-foreground font-semibold">10. Koşullardaki Değişiklikler</h3>
                <p>
                  Bu koşulları istediğimiz zaman değiştirme hakkını saklı tutuyoruz. Değişikliklerden 
                  sonra Oyunu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
                </p>

                <h3 className="text-foreground font-semibold">11. İletişim</h3>
                <p>
                  Bu koşullarla ilgili sorularınız için lütfen Farcaster üzerinden bizimle iletişime geçin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
