import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export interface UserPreferences {
  focusSessionLength: string;
  breakLength: string;
  focusBreakers: string[];
  preferredOutput: string;
  detailLevel: string;
  colorTheme: string;
  audioSpeed: string;
  videoSpeed: string;
  sessionStyle: string;
  progressTracking: string;
  energyLevel: string;
  scrollSpeed: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences?: UserPreferences;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,

  checkAuth: async() => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false
      });
      return false;
    }
  },
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      set({
        user: response.data.user,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  },

  signup: async (email, password, name) => {
    try {
      // Mapping 'name' to 'fullName' as expected by your backend controller
      const response = await axios.post(`${API_URL}/api/auth/register`, { 
        email, 
        password, 
        fullName: name 
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      return false;
    }
  },
  

  logout: async () => {
    try {
        await axios.post(`${API_URL}/api/auth/logout`);
        set({ user: null, isAuthenticated: false });
        console.log("Logout successful");
    } catch (error) {
        console.error("Logout failed:", error);
    }
  }
}));