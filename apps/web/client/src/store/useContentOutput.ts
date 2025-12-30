import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export interface ContentOutput {
    contentId: string;
    createContentOutput: (inputType: string, storageRef: string) => Promise<string | undefined>;
    getContentOutputById: (contentId: string) => Promise<any>;
    triggerProcessingPDF: (contentId: string) => Promise<any>;
    triggerProcessingLink: (contentId: string) => Promise<any>;
    triggerProcessingText: (contentId: string) => Promise<any>;
}

export const useContentOutputStore = create<ContentOutput>((set) => ({
    contentId: "",
    createContentOutput: async(inputType: string, storageRef: string) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs`, {
                inputType,
                rawStorageRef: storageRef,
            });
            const newContentId = response.data.contentId;
            set({
                contentId: newContentId,
            });
            return newContentId;
        } catch (error) {
            console.error("Error creating content output:", error);
        }
    }, 
    getContentOutputById: async(contentId: string) => {
        try{
            const response = await axios.get(`${API_URL}/api/content_outputs/${contentId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting content output:", error);
        }
    },
    triggerProcessingPDF: async(contentId: string) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs/pdf/${contentId}/process`);
            return response.data;
        } catch (error) {
            console.error("Error triggering PDF processing:", error);
        }
    },
    triggerProcessingLink: async(contentId: string) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs/link/${contentId}/process`);
            return response.data;
        } catch (error) {
            console.error("Error triggering Link processing:", error);
        }
    },
    triggerProcessingText: async(contentId: string) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs/text/${contentId}/process`);
            return response.data;
        } catch (error) {
            console.error("Error triggering Text processing:", error);
        }
    },
}))