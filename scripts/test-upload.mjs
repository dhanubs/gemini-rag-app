import { readFileSync } from 'fs';
import { join } from 'path';

async function testUpload() {
    const filePath = join(process.cwd(), 'test.txt');
    // Ensure test file exists
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Test content');
    }

    const fileBlob = new Blob([readFileSync(filePath)], { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', fileBlob, 'test.txt');

    try {
        console.log('Sending request to http://localhost:3000/api/upload...');
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testUpload();
