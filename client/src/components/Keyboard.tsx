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
      return "bg-muted text-muted-foreground hover:bg-muted";
    }

    const stateClasses = {
      correct: "bg-primary text-primary-foreground hover:bg-primary",
      present: "bg-[hsl(48_96%_53%)] text-foreground dark:text-background hover:bg-[hsl(48_96%_53%)]",
      absent: "bg-secondary text-secondary-foreground hover:bg-secondary opacity-60",
      empty: "bg-muted text-muted-foreground hover:bg-muted",
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
    <div className="w-full max-w-md mx-auto px-2 pb-4" data-testid="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center mb-2">
          {row.map((key) => {
            const isAction = key === "ENTER" || key === "DELETE";
            
            return (
              <Button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={cn(
                  "h-12 font-semibold text-sm rounded-md transition-all",
                  isAction ? "min-w-16 px-2" : "min-w-8 w-8 md:w-10 px-1",
                  !isAction && getKeyClasses(key),
                  isAction && "bg-accent text-accent-foreground hover:bg-accent"
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
