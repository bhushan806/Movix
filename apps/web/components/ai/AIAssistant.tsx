'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mic, Send, X, Bot, User } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    action?: string;
    data?: any;
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your TruckNet AI. Ask me to find loads, track vehicles, or help with breakdowns." }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await api.post('/assistant/ask-ai', { message: input, role: 'Driver' });
            const { reply } = res.data;

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

            // Handle Actions (Optional/Legacy check)
            // if (action === 'NAVIGATE_ROADSIDE') { ... }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server." }]);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                // Optional: Auto-send
                // handleSend(); 
            };

            recognition.start();
        } else {
            alert('Voice input is not supported in this browser.');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <Button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-[9999] animate-bounce-subtle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-bottom-10 fade-in">
                    <CardHeader className="bg-primary text-primary-foreground rounded-t-xl py-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            TruckNet AI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-white border shadow-sm rounded-bl-none text-black'
                                    }`}>
                                    <p>{msg.content}</p>
                                    {/* Render Action Data */}
                                    {msg.action === 'SHOW_LOADS' && msg.data && (
                                        <div className="mt-2 space-y-1">
                                            {msg.data.map((load: any) => (
                                                <div key={load.id} className="bg-gray-100 p-2 rounded text-xs text-black">
                                                    <p className="font-bold">{load.origin} ➝ {load.destination}</p>
                                                    <p>₹{load.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <div className="p-3 border-t bg-white rounded-b-xl flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={isListening ? 'text-red-500 animate-pulse' : ''}
                            onClick={startListening}
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type or say a command..."
                            className="flex-1"
                        />
                        <Button size="icon" onClick={handleSend}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card >
            )
            }
        </>
    );
}
