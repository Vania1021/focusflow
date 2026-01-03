import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export type InputType = "text" | "pdf" | "link"| "video";
export type OutputStyle = "summary" | "visual" | "flowchart" | "flashcards";

export interface ContentOutput {
    contentId: string;
    contentOutputs: any[];
    createContentOutput: (inputType: string, storageRef: string) => Promise<string | undefined>;
    getContentOutputById: (contentId: string) => Promise<any>;
    triggerProcessingPDF: (contentId: string,  outputStyle: OutputStyle) => Promise<any>;
    triggerProcessingLink: (contentId: string, outputStyle: OutputStyle) => Promise<any>;
    triggerProcessingText: (contentId: string, outputStyle: OutputStyle) => Promise<any>;
    triggerProcessingVideo: (contentId: string, outputStyle: OutputStyle) => Promise<any>;
    getMyContentOutputs: () => Promise<any[]>;
}

export const useContentOutputStore = create<ContentOutput>((set) => ({
    contentId: "",
    contentOutputs: [],
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
    triggerProcessingPDF: async(contentId: string, outputStyle) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs/pdf/${contentId}/process`, {outputStyle});
            return response.data;
        } catch (error) {
            console.error("Error triggering PDF processing:", error);
        }
    },
    triggerProcessingLink: async(contentId: string, outputStyle) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs/link/${contentId}/process`,{outputStyle});
            return response.data;
        } catch (error) {
            console.error("Error triggering Link processing:", error);
        }
    },
    triggerProcessingVideo: async(contentId: string, outputStyle) => {
        try{
            console.log("Triggering Video processing for contentId:", contentId);
            const response = await axios.post(`${API_URL}/api/content/video/process/${contentId}`,{outputStyle});
            console.log("Video processing triggered successfully for contentId:", contentId);
            return response.data;
        } catch (error) {
            console.error("Error triggering Video processing:", error);
        }
    },
    triggerProcessingText: async(contentId: string, outputStyle) => {
        try{
            const response = await axios.post(`${API_URL}/api/content_outputs/text/${contentId}/process`,{outputStyle});
            return response.data;
        } catch (error) {
            console.error("Error triggering Text processing:", error);
        }
    },
    getMyContentOutputs: async() => {
        try{
            const response = await axios.get(`${API_URL}/api/content_outputs/myContentOutputs`);
            set({
                contentOutputs: response.data.data,
            });
            return response.data.data;
        } catch(error) {
            console.error("Error getting my content outputs:", error);
        }
    }
}))