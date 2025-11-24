import { NextRequest, NextResponse } from 'next/server';
import { mkdir, unlink } from 'fs/promises';
import { appendFileSync, createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import Busboy from 'busboy';
import { db } from '@/lib/db';
import { documents } from '@/lib/schema';
import { uploadToGemini } from '@/lib/gemini';
import { randomUUID } from 'crypto';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const config = {
    api: {
        bodyParser: false,
    },
};

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type SavedUpload = {
    filepath: string;
    filename: string;
    mimeType: string;
};

async function persistMultipartFile(request: NextRequest): Promise<SavedUpload> {
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    return new Promise((resolve, reject) => {
        const headers = Object.fromEntries(request.headers.entries());
        const busboy = Busboy({
            headers,
            limits: {
                files: 1,
                fileSize: MAX_FILE_SIZE_BYTES,
            },
        });

        let settled = false;
        let fileReceived = false;
        const safeResolve = (value: SavedUpload) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };
        const safeReject = (error: Error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };

        busboy.on('file', (fieldname, file, info) => {
            if (fieldname !== 'file') {
                file.resume();
                return;
            }

            appendFileSync('upload-debug.log', `Busboy received file field ${fieldname} name=${info.filename}\n`);
            fileReceived = true;
            const originalFilename = info.filename || 'upload';
            const uniqueFilename = `${randomUUID()}-${originalFilename}`;
            const filepath = join(uploadDir, uniqueFilename);
            const mimeType = info.mimeType || 'application/octet-stream';
            const writeStream = createWriteStream(filepath);

            file.on('limit', () => {
                file.unpipe(writeStream);
                writeStream.destroy();
                void removeIfExists(filepath);
                file.resume();
                safeReject(new Error(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`));
            });

            let totalBytes = 0;
            file.on('data', (chunk) => {
                totalBytes += chunk.length;
                if (totalBytes % (5 * 1024 * 1024) < chunk.length) {
                    appendFileSync('upload-debug.log', `Streaming ${originalFilename}: ${totalBytes} bytes written\n`);
                }
            });

            void pipeline(file, writeStream)
                .then(() => {
                    appendFileSync('upload-debug.log', `Pipeline finished for ${originalFilename} (${totalBytes} bytes)\n`);
                    safeResolve({ filepath, filename: originalFilename, mimeType });
                })
                .catch((streamError) => {
                    appendFileSync('upload-debug.log', `Pipeline error for ${originalFilename}: ${streamError}\n`);
                    file.unpipe(writeStream);
                    writeStream.destroy();
                    void removeIfExists(filepath);
                    safeReject(streamError as Error);
                });
        });

        busboy.on('error', (busboyError) => safeReject(busboyError as Error));

        busboy.on('finish', () => {
            if (!settled && !fileReceived) {
                appendFileSync('upload-debug.log', 'Busboy finished but no file field was provided\n');
                safeReject(new Error('No file uploaded'));
            }
        });

        const webBody = request.body;
        if (!webBody) {
            safeReject(new Error('Request body is not available'));
            return;
        }

        const nodeStream = webStreamToNodeReadable(webBody);
        nodeStream.on('error', (streamErr) => safeReject(streamErr as Error));
        nodeStream.pipe(busboy);
    });
}

function webStreamToNodeReadable(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader();
    const nodeStream = new Readable({
        read() { /* push handled manually */ },
    });

    (async function pump() {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    nodeStream.push(null);
                    break;
                }
                if (value) {
                    nodeStream.push(Buffer.from(value));
                }
            }
        } catch (error) {
            nodeStream.destroy(error as Error);
        }
    })();

    return nodeStream;
}

async function removeIfExists(path: string) {
    try {
        await unlink(path);
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code !== 'ENOENT') {
            console.error(`Failed to remove temp file ${path}`, err);
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        appendFileSync('upload-debug.log', `Request received at ${new Date().toISOString()}\n`);

        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Log headers
        const headers = Object.fromEntries(request.headers.entries());
        console.log('Request headers:', headers);
        appendFileSync('upload-debug.log', `Headers: ${JSON.stringify(headers)}\n`);

        const savedUpload = await persistMultipartFile(request);

        console.log(`File saved locally to: ${savedUpload.filepath}`);

        // Upload to Gemini
        console.log('Uploading to Gemini...');
        const geminiFile = await uploadToGemini(savedUpload.filepath, savedUpload.mimeType);
        console.log(`Uploaded to Gemini: ${geminiFile.uri}`);

        // Save metadata to DB
        await db.insert(documents).values({
            id: randomUUID(),
            filename: savedUpload.filename,
            mimeType: savedUpload.mimeType,
            originalPath: savedUpload.filepath,
            geminiUri: geminiFile.uri,
        });

        return NextResponse.json({ success: true, message: 'File uploaded successfully' });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Upload error details:', error);
        appendFileSync('upload-error.log', `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`);
        const message = err.message || String(error);
        const status =
            message === 'No file uploaded'
                ? 400
                : message.includes('exceeds')
                    ? 413
                    : 500;
        return NextResponse.json({
            success: false,
            message: 'Upload failed',
            error: message
        }, { status });
    }
}
