import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { documents, messages as messagesTable, chats } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages, chatId } = await req.json();

        if (!messages || messages.length === 0) {
            return new Response('Missing messages', { status: 400 });
        }

        // Ensure chatId is provided or handle new chat creation on client side first
        // For this implementation, we assume client provides a valid chatId or we create one if missing?
        // Better to enforce chatId.
        let activeChatId = chatId;
        if (!activeChatId) {
            // Create a new chat if no ID provided (fallback)
            const newChat = await db.insert(chats).values({
                id: Date.now().toString(),
                userId,
                title: messages[0].content.substring(0, 50) + '...',
            }).returning();
            activeChatId = newChat[0].id;
        }

        // Save the latest user message
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
            await db.insert(messagesTable).values({
                id: Date.now().toString(),
                chatId: activeChatId,
                role: 'user',
                content: lastUserMessage.content,
            });
        }

        console.log('[chat] received', messages?.length ?? 0, 'messages from', userId);

        // Get all documents with Gemini URIs
        const docs = await db.select().from(documents);
        const docsWithUri = docs.filter((doc) => doc.geminiUri);

        // Build a comprehensive system message with file references
        const fileReferences = docsWithUri
            .map((doc) => `File: ${doc.filename}\nGemini URI: ${doc.geminiUri}\nType: ${doc.mimeType}\nUploaded: ${doc.uploadDate}`)
            .join('\n\n');

        const systemMessage = `You are a helpful AI assistant with access to the user's document knowledge base.

The following files have been uploaded to the Gemini File API:

${fileReferences}

Important: These files are available to you through the Gemini File API. When answering questions, search through these documents for relevant information. Reference specific files when you use information from them.

If the answer cannot be found in the uploaded documents, you may use your general knowledge, but always indicate when you're doing so.`;

        try {
            const result = streamText({
                model: google('gemini-2.5-flash'),
                messages,
                system: systemMessage,
                onFinish: async (completion) => {
                    // Save assistant response
                    await db.insert(messagesTable).values({
                        id: Date.now().toString(),
                        chatId: activeChatId,
                        role: 'assistant',
                        content: completion.text,
                    });
                },
            });

            // Return the streaming text response with the chatId header so client knows where to save
            return result.toTextStreamResponse({
                headers: {
                    'x-chat-id': activeChatId
                }
            });
        } catch (streamError) {
            console.error('[chat] streamText error:', streamError);
            throw streamError;
        }
    } catch (error) {
        console.error('Chat error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
