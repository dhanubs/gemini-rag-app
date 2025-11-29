import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

import { Header } from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gemini RAG App",
  description: "Chat with your documents using Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning>
          <Header />
          <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
