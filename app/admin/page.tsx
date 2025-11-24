import { db } from '@/lib/db';
import { documents } from '@/lib/schema';
import UploadForm from './upload-form';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

async function getDocuments() {
    return await db.select().from(documents).orderBy(desc(documents.uploadDate));
}

export default async function AdminPage() {
    const docs = await getDocuments();

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                <UploadForm />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {docs.map((doc) => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.filename}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadDate?.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                        {doc.geminiUri ? 'Synced to Gemini' : 'Local Only'}
                                    </td>
                                </tr>
                            ))}
                            {docs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No documents found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
