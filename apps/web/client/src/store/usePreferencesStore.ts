import { create } from 'zustand';
import axios from 'axios';
import { UserPreferences } from './useAuthStore';

const API_URL = "http://localhost:3001";
axios.defaults.withCredentials = true;

interface PreferencesStore {
    preferences: UserPreferences | null;
    getPreferences: () => Promise<boolean>;
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
    savePreferences: (preferences: UserPreferences) => Promise<boolean>;
}


export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
    preferences: null,
    // setPreferences: (preferences: UserPreferences) => set({ preferences }),
    getPreferences: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/preferences/get`);
            set({ preferences: response.data });
            return true;
        } catch(error){
            console.log("Failed to fetch User Preferences", error);
            return false;
        }
    },
    updatePreferences: async (preferences: Partial<UserPreferences>) => {
        try{
            const prefs = get().preferences;
            const response = await axios.put(`${API_URL}/api/preferences/update`, { ...prefs, ...preferences });
            set({ preferences: response.data });
            return true;
        } catch(error){
            console.error("Failed to update preferences:", error);
            return false;
        }
    },
    savePreferences: async (preferences: UserPreferences) => {
        try {
            const response = await axios.post(`${API_URL}/api/preferences/save`, preferences);
            set({ preferences: response.data });
            return true;
        } catch (error) {
            console.error("Failed to save preferences:", error);
            return false;
        }
    }
}));
