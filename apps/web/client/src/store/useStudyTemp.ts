import { create } from "zustand";

export type InputType = "text" | "pdf" | "link" | "video";

interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number[];
}

interface StudyTempState {
  /* ---------------- CURRENT CONTEXT ---------------- */
  currentSession: any;
  currentContentId: string | null;
  currentInputType: InputType | null;

  processingStarted: boolean;

  setCurrentContent: (id: string, type: InputType) => void;
  setProcessingStarted: (value: boolean) => void;
  resetProcessing: () => void;

  /* ---------------- CONTENT LIST ---------------- */
  contents: any[];

  addContent: (content: {
    contentId: string;
    inputType: InputType;
    title: string;
    storageRef: string;
    blobName: string;
    status: string;
    uploadedAt: string;
  }) => void;

  removeContent: (contentId: string) => void;

  /* ---------------- STUDY SESSION ---------------- */
  streak: StudyStreak;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  startSession: (contentId: string) => void;
}

export const useStudyStore = create<StudyTempState>((set) => ({
  /* ---------------- CURRENT ---------------- */
  currentSession: null,
  currentContentId: null,
  currentInputType: null,
  processingStarted: false,

  setCurrentContent: (id, type) =>
    set({
      currentContentId: id,
      currentInputType: type,
      processingStarted: false, // reset when switching content
    }),

  setProcessingStarted: (value) =>
    set({ processingStarted: value }),

  resetProcessing: () =>
    set({
      processingStarted: false,
      currentContentId: null,
      currentInputType: null,
    }),

  /* ---------------- CONTENT LIST ---------------- */
  contents: [],

  addContent: (content) =>
    set((state) => ({
      contents: [...state.contents, content],
    })),

  removeContent: (contentId) =>
    set((state) => ({
      contents: state.contents.filter(
        (c: any) => c.contentId !== contentId
      ),
    })),

  /* ---------------- STREAK ---------------- */
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  },

  pauseSession: () => {},
  resumeSession: () => {},
  endSession: () => {},

  startSession: (contentId) =>
    set({ currentSession: { contentId, isActive: true } }),
}));
