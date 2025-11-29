import Image from "next/image";

import Link from "next/link";
import { ArrowRight, Upload, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 md:p-24">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-0">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 pb-2">
            Chat with your Docs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your documents and get instant answers using the power of Gemini AI.
          </p>
        </div>
      </div>

      <div className="mt-16 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-2 lg:text-left gap-8">
        <Link
          href="/admin"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-blue-800"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-900/20" />
          <div className="relative z-10">
            <h2 className={`mb-3 text-2xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white`}>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Upload className="w-6 h-6" />
              </div>
              Admin Upload
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-blue-500">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm text-gray-500 dark:text-gray-400`}>
              Upload PDF, DOCX, and other files to the knowledge base.
            </p>
          </div>
        </Link>

        <Link
          href="/chat"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl hover:border-cyan-200 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-cyan-800"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-cyan-900/20" />
          <div className="relative z-10">
            <h2 className={`mb-3 text-2xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white`}>
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              Start Chat
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none text-cyan-500">
                <ArrowRight className="w-5 h-5" />
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm text-gray-500 dark:text-gray-400`}>
              Chat with the uploaded documents using Gemini 1.5 Pro.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
