import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // Clerk User ID
    email: text('email').notNull(),
    role: text('role').default('user'), // 'admin' | 'user'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const documents = sqliteTable('documents', {
    id: text('id').primaryKey(),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    originalPath: text('original_path').notNull(),
    geminiUri: text('gemini_uri'),
    uploadDate: integer('upload_date', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const chats = sqliteTable('chats', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(), // Foreign key to users.id (managed by Clerk)
    title: text('title').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    chatId: text('chat_id').references(() => chats.id).notNull(),
    role: text('role').notNull(), // 'user' | 'assistant'
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
