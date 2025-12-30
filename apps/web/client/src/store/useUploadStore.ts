import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export const inputType = {
    Audio: "audio",
    Video: "video",
    Text: "text",
}

interface UploadStore {
    storageRef: string;
    blobName: string;
    uploadFile: (file: File, inputType: string) => Promise<{ message: string, storageRef: string, blobName: string, inputType: string }>;
    getDownloadUrl: (inputType: string, blobName?: string) => Promise<{ downloadUrl: string }>;
    getBlobContent: (inputType: string, blobName: string) => Promise<string>;
}

export const useUploadStore = create<UploadStore>((set,get) => ({
    storageRef: "",
    blobName: "",
    uploadFile: async (file: File, inputType: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("inputType", inputType);

        const response = await axios.post(`${API_URL}/api/storage/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        set({
            storageRef: response.data.storageRef,
            blobName: response.data.blobName,
        });
        return response.data;
    },
    getDownloadUrl: async (inputType: string, blobName?: string) => {
        const targetBlobName = blobName || get().blobName;
        const response = await axios.post(`${API_URL}/api/storage/download_url`, {
                inputType,
                blobName: targetBlobName,
        });
        return response.data;
    },
    getBlobContent: async (inputType: string, blobName: string) => {
        const response = await axios.post(`${API_URL}/api/storage/content`, {
            inputType,
            blobName,
        }, {
            responseType: 'text'
        });
        return response.data;
    },
}))