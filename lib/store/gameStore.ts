import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameStoreState {
  isMuted: boolean;
  playerName: string;
  toggleMute: () => void;
  setPlayerName: (name: string) => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set) => ({
      isMuted: false,
      playerName: "",
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      setPlayerName: (name) => set({ playerName: name.trim().slice(0, 24) }),
    }),
    { name: "arcadia-game-settings" },
  ),
);
