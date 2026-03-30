import { GAMES } from "@/lib/games";

import GameCard from "./GameCard";

export default function GameGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {GAMES.map((game, index) => (
        <GameCard key={game.slug} game={game} index={index} />
      ))}
    </div>
  );
}
