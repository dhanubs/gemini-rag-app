'use client';

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Chat = {
    id: string;
    title: string;
    createdAt: string;
};

interface ChatSidebarProps {
    currentChatId?: string;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    refreshTrigger?: number;
}

export default function ChatSidebar({ currentChatId, onSelectChat, onNewChat, refreshTrigger = 0 }: ChatSidebarProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchChats();
    }, [searchQuery, refreshTrigger]);

    const fetchChats = async () => {
        try {
            const url = searchQuery
                ? `/api/chats?query=${encodeURIComponent(searchQuery)}`
                : '/api/chats';
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setChats(data);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this chat?')) return;

        try {
            const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
            if (res.ok) {
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (currentChatId === chatId) {
                    onNewChat();
                }
            }
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    return (
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
            <div className="p-4 space-y-4">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>New Chat</span>
                </button>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8 text-sm">
                        No chats found
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare size={18} className="shrink-0" />
                                    <span className="truncate text-sm font-medium">
                                        {chat.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
