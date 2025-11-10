// Clean Turkish word list - ONLY 5-letter family-friendly words with proper diacritics
// Removed based on comprehensive user analysis:
// - Wrong length: KURŞUN(6), AFACAN(6), BUĞDAY(6)
// - Inappropriate: CIRIT, CUCUK
// - Foreign/nonsense: BOCAK, BOSUN, BUCUR, CEHIL, CİGAR, CILIK, DADLI, DEREK, FASOL, TORON
// - Non-standard: DONAM, DOLAM, DIRIL
// - Proper names: SONER
// Fixed diacritics: PURUZ→PÜRÜZ, TORON→TORUN
// All words have proper Turkish diacritics (Ç, Ğ, İ, Ö, Ş, Ü) and NFC normalization

export const CLEAN_TR_WORDS = [
  "AFYON", "ASLAN", "BAHÇE", "BAHAR", "BALIK", "BALTA", "BALON", "BASMA",
  "BATAK", "BAZEN", "BEKAR", "BELGE", "BERAT", "BETON", "BEYAZ", "BIÇAK",
  "BİDON", "BİRAZ", "BOMBA", "BONUS", "BORSA", "BOYLU", "BOZUK", "BUGÜN",
  "BULUT", "BURMA", "BURUN", "BUHAR", "BUZUL", "CADDE", "CESET", "CEVAP",
  "CEVİZ", "CUMBA", "DALAK", "DALGA", "DAMAR", "DAMGA", "DAMLA", "DARBE",
  "DAVET", "DAYAK", "DELİK", "DENGE", "DERGİ", "DERİM", "DERME", "DERYA",
  "DESEN", "DESTE", "DEVAM", "DEVRE", "DİKEN", "DİKME", "DİLCİ", "DİNAR",
  "DİREK", "DİZGE", "DİZGİ", "DOLAP", "DOLMA", "DONUK", "DOSYA", "DOSTU",
  "DOYUM", "DUDAK", "DUMAN", "DURAK", "DURUM", "DUYGU", "DUYUM", "EKLEM",
  "EKMEK", "EKRAN", "EKSEN", "EJDER", "ELMAS", "EMSAL", "EMRİN", "ENGİN",
  "ENLEM", "ENGEL", "ENZİM", "EPOPE", "ERİME", "ERKEN", "ERKEK", "ERMEN",
  "ESANS", "EVRAK", "EVREN", "EYLEM", "FAKAT", "FALAN", "FARKI", "FASİL",
  "FAYDA", "FAZLA", "FENER", "FERDİ", "FİRMA", "FIRIN", "FORMA", "FORUM",
  "GAMZE", "GONCA", "HABER", "HALAT", "HALEN", "HAMAM", "HAMUR", "HANGİ",
  "HATIR", "HAVLU", "HAYIR", "HAYAL", "HAZIR", "HEVES", "HIZIR", "HIZLI",
  "HUZUR", "KABLO", "KADER", "KADRO", "KALEM", "KALIN", "KAPAK", "KARAR",
  "KARNE", "KAVGA", "KAVUN", "KAYIP", "KEFEN", "KEMER", "KESEN", "KESİK",
  "KEYİF", "KIRMA", "KISIM", "KIYMA", "KONUK", "KOPYA", "KORKU", "KUDUZ",
  "KURAL", "LAFİZ", "LAMBA", "LEVHA", "LİMON", "LODOS", "MADDE", "MADEN",
  "MAKAM", "MAKAS", "MALUM", "MAMUL", "MARUL", "MECAZ", "MESAJ", "MEYVE",
  "MEZAR", "MODEL", "MOTOR", "MUTLU", "NABIZ", "NAKİL", "NAMAZ", "NEFES",
  "NOKTA", "NOTER", "OKUMA", "OLMAZ", "ORGAN", "ORTAM", "PAZAR", "PASTA",
  "PETEK", "PİLOT", "PLAKA", "POSTA", "PÜRÜZ", "RAHAT", "RAKAM", "RAPOR",
  "REFAH", "RENGİ", "ROMAN", "SABAH", "SAHTE", "SALON", "SAPAN", "SARAY",
  "SATEN", "SAZAN", "SEBEP", "SEMİZ", "SICAK", "SIFIR", "SİRKE", "SİTEM",
  "SOFRA", "SOKAK", "SOMUT", "SORUN", "SUYLA", "SÜPER", "TABLO", "TARAF",
  "TARAK", "TARİH", "TARIM", "TATLI", "TAVUK", "TAYİN", "TEMEL", "TENTE",
  "TERZİ", "TOKAT", "TOPAL", "TÖREN", "TORTU", "TORUN", "TUHAF", "TUTAR",
  "TUTUM", "TUZLU", "ULAMA", "UYARI", "UYGUN", "UZMAN", "VAKİT", "VAPUR",
  "VATAN", "VEFAT", "VEKİL", "VERİM", "YALAN", "YAPAR", "YARAR", "YARIN",
  "YATAY", "YATAK", "YAYLA", "YEMEK", "YEMİN", "YORUM", "YUDUM", "ZAFER",
  "ZAHİR", "ZAMAN", "ZARAR", "ZATEN", "ZİHİN", "ZİYAN", "ZİMBA", "ZİRVE",
  "ZURNA", "ADANA", "ADRES", "AHALİ", "AHBAP", "AHLAK", "AHRET", "AHENK",
  "AİDAT", "AJANS", "ALBAY", "ALKOL", "ALTIN", "AMBAR", "ANANE", "ANCAK",
  "ANKET", "ANLAM", "ANLIK", "ANSIZ", "ANTEP", "ARABA", "ARADA", "ARACI",
  "ARIZA", "ASKER", "ASTAR", "ATAMA", "ATLET", "ATLAS", "AVANS", "AVARE",
  "AYRAN", "AZMAN", "BAGAJ", "BALCI", "BANKO", "BASIN", "BASİT", "BEBEK",
  "BEDEL", "BENİZ", "BESİN", "BESLE", "BEYAN", "BEYİN", "BİBER", "BİLGE",
  "BOYUN", "BUDAK", "BULGU", "BURUK", "BUYUR", "CEMAL", "CESUR", "CİHAN"
];

console.log(`Total clean TR words: ${CLEAN_TR_WORDS.length}`);
