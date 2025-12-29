import { create } from "zustand";

interface StudyStreak {
    currentStreak: number;
    longestStreak: number;
    weeklyProgress: number[];
}

interface StudyTempState {
    currentSession: any;
    contents: any[];
    streak: StudyStreak; // Changed from any to interface for better type safety
    pauseSession: () => void;
    resumeSession: () => void;
    endSession: () => void;
    addContent: (content: any) => void;
    removeContent: (contentId: string) => void;
    startSession: (contentId: string) => void;
}

export const useStudyStore = create<StudyTempState>((set, get) => ({
    currentSession: null,
    contents: [],
    // Initializing with default values to prevent "reading property of null" errors
    streak: {
        currentStreak: 0,
        longestStreak: 0,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    },
    pauseSession: () => {},
    resumeSession: () => {},
    endSession: () => {},
    addContent: (content: any) => {
        set((state) => ({ contents: [...state.contents, content] }));
    },
    removeContent: (contentId: string) => {
        set((state) => ({
            contents: state.contents.filter((c: any) => c.id !== contentId)
        }));
    },
    startSession: (contentId: string) => {
        set({ currentSession: { contentId, isActive: true } });
    },
}));