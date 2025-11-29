import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { documents } from '../lib/schema';

try {
    console.log('Opening database...');
    const sqlite = new Database('local.db');
    const db = drizzle(sqlite);
    console.log('Database opened successfully.');

    const result = db.select().from(documents).all();
    console.log('Query successful. Documents count:', result.length);
} catch (error) {
    console.error('Database error:', error);
}
