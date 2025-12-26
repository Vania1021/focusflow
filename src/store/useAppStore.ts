import { create } from 'zustand';

export interface UserPreferences {
  // Attention & Focus
  focusSessionLength: string;
  breakLength: string;
  focusBreakers: string[];
  
  // Content Format Preference
  preferredOutput: string;
  detailLevel: string;
  
  // Sensory Comfort
  colorTheme: string;
  audioSpeed: string;
  videoSpeed: string;
  
  // Learning Rhythm
  sessionStyle: string;
  progressTracking: string;
  
  // Self-Awareness
  energyLevel: string;
  scrollSpeed: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  studyGoal?: string;
  dailyGoalMinutes?: number;
  preferredSubjects?: string[];
  preferences?: UserPreferences;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  weeklyProgress: number[];
}

export interface StudyContent {
  id: string;
  type: 'text' | 'video';
  title: string;
  source: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  duration?: number;
  progress?: number;
}

export interface StudySession {
  id: string;
  contentId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  isActive: boolean;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  streak: StudyStreak;
  contents: StudyContent[];
  currentSession: StudySession | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Content actions
  addContent: (content: Omit<StudyContent, 'id' | 'uploadedAt' | 'status'>) => void;
  updateContentStatus: (id: string, status: StudyContent['status']) => void;
  removeContent: (id: string) => void;
  
  // Session actions
  startSession: (contentId: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  },
  contents: [],
  currentSession: null,

  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any login
    set({
      user: {
        id: '1',
        email,
        name: email.split('@')[0],
      },
      isAuthenticated: true,
      streak: {
        currentStreak: 7,
        longestStreak: 14,
        lastStudyDate: new Date().toISOString(),
        weeklyProgress: [45, 30, 60, 25, 50, 40, 55],
      },
    });
    return true;
  },

  signup: async (email: string, password: string, name: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      user: {
        id: '1',
        email,
        name,
      },
      isAuthenticated: true,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: '',
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      },
    });
    return true;
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: '',
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      },
      contents: [],
      currentSession: null,
    });
  },

  updateProfile: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  addContent: (content) => {
    const newContent: StudyContent = {
      ...content,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      progress: 0,
    };
    set((state) => ({ contents: [...state.contents, newContent] }));
    
    // Simulate processing
    setTimeout(() => {
      get().updateContentStatus(newContent.id, 'ready');
    }, 3000);
  },

  updateContentStatus: (id, status) => {
    set((state) => ({
      contents: state.contents.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    }));
  },

  removeContent: (id) => {
    set((state) => ({
      contents: state.contents.filter((c) => c.id !== id),
    }));
  },

  startSession: (contentId) => {
    set({
      currentSession: {
        id: Math.random().toString(36).substr(2, 9),
        contentId,
        startTime: new Date().toISOString(),
        duration: 0,
        isActive: true,
      },
    });
  },

  pauseSession: () => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, isActive: false }
        : null,
    }));
  },

  resumeSession: () => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, isActive: true }
        : null,
    }));
  },

  endSession: () => {
    const { currentSession, streak } = get();
    if (currentSession) {
      const today = new Date().getDay();
      const newWeeklyProgress = [...streak.weeklyProgress];
      newWeeklyProgress[today] += Math.floor(currentSession.duration / 60);
      
      set({
        currentSession: null,
        streak: {
          ...streak,
          currentStreak: streak.currentStreak + 1,
          longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
          lastStudyDate: new Date().toISOString(),
          weeklyProgress: newWeeklyProgress,
        },
      });
    }
  },
}));
