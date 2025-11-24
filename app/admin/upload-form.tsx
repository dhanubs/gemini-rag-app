'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
export default function UploadForm() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log('Form submitted');
        const formData = new FormData(e.currentTarget);
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            console.log('No file selected');
            return;
        }

        setUploading(true);
        setMessage('');
        setError('');
        try {
            console.log('Sending request to /api/upload ...');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const payload = await response.json().catch(() => null);
            const success = response.ok && payload?.success;

            if (!success) {
                const errorMessage = payload?.error || payload?.message || 'Upload failed';
                console.error('Upload failed:', errorMessage);
                throw new Error(errorMessage);
            }

            console.log('Upload success');
            (e.target as HTMLFormElement).reset();
            setMessage('File uploaded successfully!');
            router.refresh();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Action error:', error);
            setError(error instanceof Error ? error.message : 'Error uploading file');
        } finally {
            setUploading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select File (PDF, DOCX, TXT)
                </label>
                <input
                    type="file"
                    name="file"
                    accept=".pdf,.docx,.txt,.csv"
                    required
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
            </div>
            <div className="flex flex-col items-start gap-2">
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {message && <p className="text-sm text-green-600">{message}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        </form>
    );
}
