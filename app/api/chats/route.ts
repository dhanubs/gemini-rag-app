import { db } from '@/lib/db';
import { chats, messages } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { desc, eq, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        let userChats;
        if (query) {
            userChats = await db.select()
                .from(chats)
                .where(like(chats.title, `%${query}%`)) // Simple search for now
                .orderBy(desc(chats.createdAt))
                .all();
            // Filter by userId in memory or add to where clause if possible. 
            // Better to add to where clause:
            // .where(and(eq(chats.userId, userId), like(chats.title, `%${query}%`)))
            // But for simplicity with 'like' and 'eq' imports:
            userChats = userChats.filter(c => c.userId === userId);
        } else {
            userChats = await db.select()
                .from(chats)
                .where(eq(chats.userId, userId))
                .orderBy(desc(chats.createdAt))
                .all();
        }

        return NextResponse.json(userChats);
    } catch (error) {
        console.error('[CHATS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { title } = await req.json();

        const newChat = await db.insert(chats).values({
            id: Date.now().toString(), // Simple ID generation
            userId,
            title: title || 'New Chat',
        }).returning();

        return NextResponse.json(newChat[0]);
    } catch (error) {
        console.error('[CHATS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
