import { create } from 'zustand';
import axios from 'axios';
import { UserPreferences } from './useAuthStore';

const API_URL = "http://localhost:3001";
axios.defaults.withCredentials = true;

// Aligning frontend interface with the backend aiEvaluation model
export interface AiEvaluation {
    adhdLevel: number;
    focusIntensity: "low" | "moderate" | "high";
    sensoryNeeds: string[];
    recommendedPomodoro: number;
    personalizedInsight: string;
}

interface PreferencesStore {
    preferences: (UserPreferences & { aiEvaluation?: AiEvaluation }) | null;
    isLoading: boolean;
    getPreferences: () => Promise<boolean>;
    savePreferences: (preferences: UserPreferences) => Promise<boolean>;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
    preferences: null,
    isLoading: false,
    getPreferences: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/api/preferences/get`);
            set({ preferences: response.data, isLoading: false });
            return true;
        } catch(error) {
            set({ isLoading: false });
            return false;
        }
    },
    savePreferences: async (preferences) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/api/preferences/save`, preferences);
            set({ preferences: response.data, isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    }
}));