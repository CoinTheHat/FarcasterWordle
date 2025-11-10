import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import type { Language } from "@shared/schema";

interface LanguageModalProps {
  isOpen: boolean;
  onSelect: (language: Language) => void;
}

export function LanguageModal({ isOpen, onSelect }: LanguageModalProps) {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t.languageChoose}</DialogTitle>
          <DialogDescription className="text-center">
            {t.languageSelect}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            size="lg"
            onClick={() => onSelect("en")}
            className="h-24 flex flex-col gap-2 text-lg"
            data-testid="button-language-en"
          >
            <span className="text-4xl">🇺🇸</span>
            <span className="text-base font-semibold">English</span>
          </Button>
          <Button
            size="lg"
            onClick={() => onSelect("tr")}
            className="h-24 flex flex-col gap-2 text-lg"
            data-testid="button-language-tr"
          >
            <span className="text-4xl">🇹🇷</span>
            <span className="text-base font-semibold">Türkçe</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
