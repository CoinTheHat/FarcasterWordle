import { Tile } from "./Tile";
import type { TileFeedback } from "@shared/schema";

interface BoardProps {
  guesses: string[];
  currentGuess: string;
  feedback: TileFeedback[][];
  colorBlindMode?: boolean;
  revealingRow?: number;
}

export function Board({ guesses, currentGuess, feedback, colorBlindMode, revealingRow }: BoardProps) {
  const rows = Array.from({ length: 6 }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      return {
        letters: guesses[rowIndex].padEnd(5, " ").split(""),
        feedback: feedback[rowIndex] || Array(5).fill("empty" as TileFeedback),
        isRevealing: revealingRow === rowIndex,
      };
    }
    
    if (rowIndex === guesses.length) {
      return {
        letters: currentGuess.padEnd(5, " ").split(""),
        feedback: Array(5).fill("empty" as TileFeedback),
        isRevealing: false,
      };
    }

    return {
      letters: Array(5).fill(" "),
      feedback: Array(5).fill("empty" as TileFeedback),
      isRevealing: false,
    };
  });

  return (
    <div className="bg-card/60 backdrop-blur-md border border-card-border rounded-2xl p-2 md:p-4 shadow-2xl max-w-sm mx-auto" data-testid="game-board">
      <div className="flex flex-col gap-1 md:gap-1.5">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 md:gap-1.5 justify-center">
            {row.letters.map((letter, colIndex) => (
              <Tile
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                feedback={row.feedback[colIndex]}
                position={colIndex}
                isRevealing={row.isRevealing}
                colorBlindMode={colorBlindMode}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
