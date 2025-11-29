'use client';

import { Send, Bot, User, Menu } from 'lucide-react';
import { useEffect, useRef, useState, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatSidebar from '@/app/components/ChatSidebar';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [refreshSidebar, setRefreshSidebar] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load last active chat from localStorage on mount
    useEffect(() => {
        const savedChatId = localStorage.getItem('lastActiveChatId');
        if (savedChatId) {
            setCurrentChatId(savedChatId);
        }
    }, []);

    // Save current chat ID to localStorage whenever it changes
    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem('lastActiveChatId', currentChatId);
        } else {
            localStorage.removeItem('lastActiveChatId');
        }
    }, [currentChatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch messages when chat ID changes
    useEffect(() => {
        if (currentChatId) {
            fetchMessages(currentChatId);
        } else {
            setMessages([]);
        }
    }, [currentChatId]);

    const fetchMessages = async (chatId: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/chats/${chatId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            } else {
                // If chat not found (e.g. deleted), clear state
                setCurrentChatId(undefined);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setCurrentChatId(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(undefined);
        setMessages([]);
        setInput('');
        localStorage.removeItem('lastActiveChatId');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    chatId: currentChatId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Check for x-chat-id header to update current chat if it was a new one
            const newChatId = response.headers.get('x-chat-id');
            if (newChatId && newChatId !== currentChatId) {
                setCurrentChatId(newChatId);
                setRefreshSidebar(prev => prev + 1); // Trigger sidebar refresh
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            if (reader) {
                const assistantId = (Date.now() + 1).toString();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        assistantMessage += chunk;

                        setMessages(prev => {
                            const lastMessage = prev[prev.length - 1];
                            if (lastMessage?.id === assistantId) {
                                return [...prev.slice(0, -1), { ...lastMessage, content: assistantMessage }];
                            } else {
                                return [...prev, { id: assistantId, role: 'assistant', content: assistantMessage }];
                            }
                        });
                    }
                } catch (streamError) {
                    console.error('Stream reading error:', streamError);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Sorry, there was an error.`,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar - hidden on mobile by default, can add toggle */}
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block h-full`}>
                <ChatSidebar
                    currentChatId={currentChatId}
                    onSelectChat={setCurrentChatId}
                    onNewChat={handleNewChat}
                    refreshTrigger={refreshSidebar}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            <p>Start a new conversation or select a chat from the history.</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-lg p-4 flex gap-3 ${m.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-800 shadow-sm'
                                    }`}
                            >
                                <div className="mt-1 shrink-0">
                                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className={`overflow-hidden ${m.role === 'user' ? 'prose-invert' : 'prose dark:prose-invert'} prose max-w-none break-words`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-800 shadow-sm max-w-[80%] rounded-lg p-4 flex gap-3">
                                <Bot size={20} className="mt-1 shrink-0" />
                                <div className="animate-pulse">Thinking...</div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
                        <input
                            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
