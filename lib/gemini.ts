import { GoogleAIFileManager } from "@google/generative-ai/server";
import { basename } from "path";

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function uploadToGemini(path: string, mimeType: string) {
    try {
        const uploadResult = await fileManager.uploadFile(path, {
            mimeType,
            displayName: basename(path),
        });
        return uploadResult.file;
    } catch (error) {
        console.error("Error uploading to Gemini:", error);
        throw error;
    }
}
