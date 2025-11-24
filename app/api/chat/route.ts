import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages } = await req.json();

        if (!messages || messages.length === 0) {
            return new Response('Missing messages', { status: 400 });
        }

        console.log('[chat] received', messages?.length ?? 0, 'messages from', userId);
        console.log('[chat] API Key present:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

        // Get all documents with Gemini URIs
        const docs = await db.select().from(documents);
        const docsWithUri = docs.filter((doc) => doc.geminiUri);
        
        console.log('[chat] found', docsWithUri.length, 'documents with Gemini URIs');

        // Build a comprehensive system message with file references
        const fileReferences = docsWithUri
            .map((doc) => `File: ${doc.filename}\nGemini URI: ${doc.geminiUri}\nType: ${doc.mimeType}\nUploaded: ${doc.uploadDate}`)
            .join('\n\n');

        const systemMessage = `You are a helpful AI assistant with access to the user's document knowledge base.

The following files have been uploaded to the Gemini File API:

${fileReferences}

Important: These files are available to you through the Gemini File API. When answering questions, search through these documents for relevant information. Reference specific files when you use information from them.

If the answer cannot be found in the uploaded documents, you may use your general knowledge, but always indicate when you're doing so.`;

        console.log('[chat] streaming response with', docsWithUri.length, 'file references');

        try {
            // Use streamText with Google AI SDK
            // Using gemini-2.5-flash (stable, latest flash model)
            const result = streamText({
                model: google('gemini-2.5-flash'),
                messages,
                system: systemMessage,
            });

            console.log('[chat] streamText initiated, creating response');
            
            // Return the streaming text response (compatible with useChat)
            const response = result.toTextStreamResponse();
            console.log('[chat] response created, streaming to client');
            
            return response;
        } catch (streamError) {
            console.error('[chat] streamText error:', streamError);
            throw streamError;
        }
    } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        console.error('Error details:', { message: errorMessage, stack: errorStack });
        
        return new Response(JSON.stringify({ 
            error: 'Internal Server Error', 
            details: errorMessage,
            stack: errorStack
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
