import { create } from "zustand";
import axios from "axios";
import { useFocusStore } from "./useFocusStore";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

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

  // Quiz State
  activeQuiz: any | null;
  showQuiz: boolean;

  setCurrentContent: (id: string, type: InputType) => void;
  setProcessingStarted: (value: boolean) => void;

  // Quiz Actions
  setQuiz: (quiz: any) => void;
  setShowQuiz: (val: boolean) => void;
  fetchQuiz: (content: string) => Promise<void>;

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
  endSession: () => Promise<void>; // Updated to Promise
  startSession: (contentId: string) => Promise<void>; // Updated to Promise
}

export const useStudyStore = create<StudyTempState>((set, get) => ({
  /* ---------------- CURRENT ---------------- */
  currentSession: null,
  currentContentId: null,
  currentInputType: null,
  processingStarted: false,

  activeQuiz: null,
  showQuiz: false,

  setQuiz: (quiz) => set({ activeQuiz: quiz }),
  setShowQuiz: (val) => set({ showQuiz: val }),

  fetchQuiz: async (content) => {
    console.log("[Study Store] fetchQuiz Triggered");
    try {
      const response = await axios.post(`${API_URL}/api/content/generate-quiz`, { content });
      console.log("[Study Store] Quiz received:", response.data);
      set({ activeQuiz: response.data, showQuiz: true });
    } catch (error) {
      console.error("[Study Store] fetchQuiz Error:", error);
    }
  },

  setCurrentContent: (id, type) =>
    set({
      currentContentId: id,
      currentInputType: type,
      processingStarted: false, 
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

  pauseSession: () => {
    console.log("[Study Store] pauseSession Triggered");
  },
  
  resumeSession: () => {
    console.log("[Study Store] resumeSession Triggered");
  },

  /* ---------------- SESSION LOGIC UPDATES ---------------- */

  startSession: async (contentId) => {
    console.log(`[Study Store] startSession Triggered for contentId: ${contentId}`);
    try {
      // 1. Reset focus tracking for the new session
      useFocusStore.getState().resetFocus();
      console.log("[Study Store] focusStore reset successful");

      // 2. Notify backend to create or resume a session
      const response = await axios.post(
        `${API_URL}/api/session/createOrUpdateSession`, 
        { contentId },
        { withCredentials: true }
      );

      console.log("[Study Store] Backend createOrUpdateSession response:", response.data);

      set({ 
        currentSession: { 
          ...response.data, 
          isActive: true 
        } 
      });
      
    } catch (error) {
      console.error("[Study Store] startSession Error:", error instanceof Error ? error.message : error);
    }
  },

  endSession: async () => {
    const { currentSession } = get();
    if (!currentSession) {
      console.warn("[Study Store] endSession called but no active session found");
      return;
    }

    const finalFocusScore = useFocusStore.getState().score;
    console.log(`[Study Store] endSession Triggered. Final Score: ${finalFocusScore}`);

    // MOTIVATION TRIGGER: Trigger a "Success" toast for high scores
  if (finalFocusScore >= 80) {
    // You can trigger your useToast here
    console.log("[Dopamine Hit] Achievement Unlocked: High Flow State Session");
  }

    try {
      // 1. Send final focus score to backend to finalize the session record
      const response = await axios.post(
        `${API_URL}/api/session/endSession`,
        { focusScore: finalFocusScore },
        { withCredentials: true }
      );

      console.log("[Study Store] Backend endSession response:", response.data);

      // 2. Clear current session state
      set({ currentSession: null, activeQuiz: null, showQuiz: false });
      console.log("[Study Store] currentSession cleared locally");

    } catch (error) {
      console.error("[Study Store] endSession Error:", error instanceof Error ? error.message : error);
    }
  },
}));