import { create } from "zustand";

type FocusState = "FOCUSED" | "AT_RISK" | "LOST";

interface FocusStore {
  score: number;
  state: FocusState;
  companionMessage: string;
  lastNudgeTime: number;
  setScore: (score: number) => void;
  decreaseScore: (amount: number) => void;
  increaseScore: (amount: number) => void;
  resetFocus: () => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  score: 100,
  state: "FOCUSED",
  companionMessage: "I am here to help you stay focused.",
  lastNudgeTime: 0,

  setScore: (score) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    let newState: FocusState = "FOCUSED";
    let message = "You are doing great. Keep going.";

    if (clampedScore < 40) {
      newState = "LOST";
      message = "I noticed you might be struggling to focus. Let's try a different view or take a 60-second break.";
    } else if (clampedScore < 70) {
      newState = "AT_RISK";
      message = "Your focus is dipping. Try to finish this section before your mind wanders.";
    }

    set({ score: clampedScore, state: newState, companionMessage: message });
    console.log(`[Focus Store] Score: ${clampedScore}, State: ${newState}`);
  },

  decreaseScore: (amount) => {
    console.log(`[Focus Store] Decreasing score by: ${amount}`);
    get().setScore(get().score - amount);
  },

  increaseScore: (amount) => {
    console.log(`[Focus Store] Increasing score by: ${amount}`);
    get().setScore(get().score + amount);
  },

  resetFocus: () => {
    console.log("[Focus Store] Resetting focus state");
    set({ score: 100, state: "FOCUSED", companionMessage: "Let's start fresh. I'm watching out for you." });
  },
}));