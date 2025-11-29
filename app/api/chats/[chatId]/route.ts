import { db } from '@/lib/db';
import { chats, messages } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { chatId } = await params;

        // Verify chat belongs to user
        const chat = await db.select().from(chats).where(eq(chats.id, chatId)).get();
        if (!chat || chat.userId !== userId) {
            return new NextResponse('Not Found', { status: 404 });
        }

        const chatMessages = await db.select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(asc(messages.createdAt))
            .all();

        return NextResponse.json(chatMessages);
    } catch (error) {
        console.error('[CHAT_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { chatId } = await params;

        // Verify chat belongs to user
        const chat = await db.select().from(chats).where(eq(chats.id, chatId)).get();
        if (!chat || chat.userId !== userId) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Delete messages first (cascade usually handles this but good to be explicit if not set up)
        await db.delete(messages).where(eq(messages.chatId, chatId));
        await db.delete(chats).where(eq(chats.id, chatId));

        return new NextResponse('OK');
    } catch (error) {
        console.error('[CHAT_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
