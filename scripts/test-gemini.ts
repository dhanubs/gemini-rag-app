import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function testGemini() {
    try {
        console.log('Checking API Key...');
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is missing');
        }
        console.log('API Key present (length: ' + apiKey.length + ')');

        const fileManager = new GoogleAIFileManager(apiKey);
        console.log('FileManager initialized.');

        // List files to verify connection
        const result = await fileManager.listFiles();
        console.log('List files success. Count:', result.files?.length || 0);

        // Test Upload
        console.log('Testing upload...');
        const testFile = path.join(process.cwd(), 'test.txt');
        if (!fs.existsSync(testFile)) {
            fs.writeFileSync(testFile, 'Test content for Gemini upload');
        }

        const uploadResult = await fileManager.uploadFile(testFile, {
            mimeType: 'text/plain',
            displayName: 'Test Doc',
        });
        console.log('Upload success. URI:', uploadResult.file.uri);

    } catch (error) {
        console.error('Gemini error:', error);
    }
}

testGemini();
