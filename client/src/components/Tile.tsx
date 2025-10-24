import { type TileFeedback } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TileProps {
  letter: string;
  feedback: TileFeedback;
  position: number;
  isRevealing?: boolean;
  colorBlindMode?: boolean;
}

export function Tile({ letter, feedback, position, isRevealing, colorBlindMode }: TileProps) {
  const isEmpty = feedback === "empty";
  const hasLetter = letter.length > 0;

  const getTileClasses = () => {
    const base = "w-14 h-14 md:w-16 md:h-16 border-2 rounded-sm flex items-center justify-center font-mono text-3xl font-bold uppercase transition-all duration-200";
    
    if (isEmpty && !hasLetter) {
      return cn(base, "border-border bg-background text-foreground");
    }
    
    if (isEmpty && hasLetter) {
      return cn(base, "border-foreground bg-background text-foreground animate-bounce-in");
    }

    const feedbackClasses = {
      correct: "bg-primary border-primary text-primary-foreground",
      present: "bg-[hsl(48_96%_53%)] border-[hsl(48_96%_45%)] text-foreground dark:text-background",
      absent: "bg-muted border-muted-border text-muted-foreground",
      empty: "border-border bg-background text-foreground",
    };

    return cn(
      base,
      feedbackClasses[feedback],
      isRevealing && "animate-flip",
      colorBlindMode && feedback === "present" && "pattern-diagonal",
      colorBlindMode && feedback === "correct" && "pattern-solid",
      colorBlindMode && feedback === "absent" && "pattern-dots"
    );
  };

  return (
    <div
      className={getTileClasses()}
      style={{
        animationDelay: isRevealing ? `${position * 100}ms` : "0ms",
      }}
      data-testid={`tile-${position}`}
    >
      {letter}
    </div>
  );
}
