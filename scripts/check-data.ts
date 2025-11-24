import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { documents } from '../lib/schema.ts';
import * as fs from 'fs';
import * as path from 'path';

try {
    console.log('Checking database...');
    const sqlite = new Database('local.db');
    const db = drizzle(sqlite);

    const docs = db.select().from(documents).all();
    console.log('Documents in DB:', docs.length);
    docs.forEach(d => console.log(`- ${d.filename} (ID: ${d.id})`));

    console.log('\nChecking uploads directory...');
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        console.log('Files in uploads/:', files.length);
        files.forEach(f => console.log(`- ${f}`));
    } else {
        console.log('uploads directory does not exist.');
    }

} catch (error) {
    console.error('Error:', error);
}
