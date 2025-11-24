'use client';

import { Send, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState, FormEvent } from 'react';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            console.log('Response received, starting to read stream...');
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            if (reader) {
                const assistantId = (Date.now() + 1).toString();
                
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            console.log('Stream complete, final message length:', assistantMessage.length);
                            break;
                        }
                        
                        const chunk = decoder.decode(value, { stream: true });
                        console.log('Received chunk:', chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
                        assistantMessage += chunk;
                        
                        // Update the assistant's message as it streams in
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
                    throw streamError;
                }
            } else {
                throw new Error('No response body available');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Sorry, there was an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow p-4">
                <h1 className="text-xl font-bold text-gray-800">Chat with Documents</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No messages yet. Start by asking a question about your uploaded documents!</p>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 flex gap-3 ${m.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-800 shadow-sm'
                                }`}
                        >
                            <div className="mt-1 shrink-0">
                                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="whitespace-pre-wrap">{m.content}</div>
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
                        onChange={handleInputChange}
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
    );
}
