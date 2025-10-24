import { Button } from "@/components/ui/button";
import { Delete, CornerDownLeft } from "lucide-react";
import type { TileFeedback } from "@shared/schema";
import { cn } from "@/lib/utils";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  letterStates: Map<string, TileFeedback>;
  colorBlindMode?: boolean;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"],
];

export function Keyboard({ onKeyPress, onEnter, onDelete, letterStates, colorBlindMode, disabled }: KeyboardProps) {
  const getKeyClasses = (key: string) => {
    const state = letterStates.get(key);
    
    if (!state || state === "empty") {
      return "bg-card/80 backdrop-blur-sm text-card-foreground hover:bg-card shadow-md";
    }

    const stateClasses = {
      correct: "bg-primary text-primary-foreground hover:bg-primary shadow-lg shadow-primary/30",
      present: "bg-[hsl(45_100%_55%)] text-gray-900 dark:text-gray-900 hover:bg-[hsl(45_100%_55%)] shadow-md shadow-yellow-500/30",
      absent: "bg-secondary text-secondary-foreground hover:bg-secondary opacity-50",
      empty: "bg-card/80 backdrop-blur-sm text-card-foreground hover:bg-card shadow-md",
    };

    return cn(
      stateClasses[state],
      colorBlindMode && state === "present" && "pattern-diagonal-sm",
      colorBlindMode && state === "correct" && "pattern-solid"
    );
  };

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    
    if (key === "ENTER") {
      onEnter();
    } else if (key === "DELETE") {
      onDelete();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 pb-2 md:pb-3 bg-card/40 backdrop-blur-md rounded-2xl p-2 md:p-3 border border-card-border shadow-xl" data-testid="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 md:gap-1.5 justify-center mb-1 md:mb-1.5">
          {row.map((key) => {
            const isAction = key === "ENTER" || key === "DELETE";
            
            return (
              <Button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={cn(
                  "h-10 md:h-11 font-semibold text-xs md:text-sm rounded-lg transition-all duration-150",
                  isAction ? "min-w-12 md:min-w-14 px-1.5 md:px-2" : "min-w-6 w-6 md:min-w-8 md:w-9 px-0.5 md:px-1",
                  !isAction && getKeyClasses(key),
                  isAction && "bg-card/90 backdrop-blur-sm text-card-foreground hover:bg-card shadow-lg border border-card-border"
                )}
                data-testid={`key-${key.toLowerCase()}`}
              >
                {key === "DELETE" ? (
                  <Delete className="w-5 h-5" />
                ) : key === "ENTER" ? (
                  <CornerDownLeft className="w-5 h-5" />
                ) : (
                  key
                )}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
