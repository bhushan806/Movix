'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Send, Bot, Volume2, VolumeX, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AIOrb } from './AIOrb';
import { AIPanel } from './AIPanel';
import { SmartAlerts } from './SmartAlerts';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    action?: string;
    data?: any;
    structuredData?: {
        pricing?: any;
        risk?: any;
        loadSharing?: any;
        insights?: any;
        routeAdvanced?: any;
    };
}

// Role-based welcome messages
function getWelcomeMessage(role: string | undefined): string {
    switch (role) {
        case 'CUSTOMER': return 'Namaste! 🚛 Aaj kahan bhejni hai maal?';
        case 'DRIVER': return 'Jai ho bhai! 🚛 Aaj kahan jaana hai?';
        case 'OWNER': return 'Namaste! 🚛 Aaj fleet ka kya haal hai?';
        default: return 'Namaste! Main TruckNet Dost hoon 🚛';
    }
}

// Role-based quick action buttons (enhanced with new features)
function getQuickActions(role: string | undefined): Array<{ label: string; text: string }> {
    switch (role) {
        case 'CUSTOMER':
            return [
                { label: '🚛 Book Truck', text: 'Mujhe truck book karna hai' },
                { label: '📍 Track Order', text: 'Mera order track karo' },
                { label: '💰 Price Check', text: 'Mumbai se Pune ka price bata do' },
                { label: '⚠️ Risk Check', text: 'Delivery risk kya hai Mumbai to Pune' },
            ];
        case 'DRIVER':
            return [
                { label: '📦 Find Load', text: 'Load chahiye aaj' },
                { label: '🚛 Load Share', text: 'Load share karna hai, empty run kam karo' },
                { label: '🗺️ Best Route', text: 'Best route dikhao Mumbai to Pune' },
                { label: '💰 My Earnings', text: 'Meri earnings dikhao' },
            ];
        case 'OWNER':
            return [
                { label: '📊 Fleet Insights', text: 'Fleet insights dikhao' },
                { label: '🚛 Fleet Status', text: 'Fleet status dikhao' },
                { label: '🚛 Load Sharing', text: 'Load sharing optimize karo' },
                { label: '⚠️ Risk Check', text: 'Delivery risk check karo' },
            ];
        default:
            return [
                { label: '🚛 Book Truck', text: 'Mujhe truck book karna hai' },
                { label: '📍 Track', text: 'Mera order track karo' },
                { label: '💰 Price Check', text: 'Price check karo' },
            ];
    }
}

// ── Structured Data Card Components ──

function PricingCard({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 text-xs">
            <div className="font-bold text-green-800 mb-1">💰 Dynamic Pricing</div>
            <div className="space-y-0.5 text-green-700">
                <p>📊 Range: <span className="font-semibold">₹{data.minPrice?.toLocaleString('en-IN')} – ₹{data.maxPrice?.toLocaleString('en-IN')}</span></p>
                <p>✅ Recommended: <span className="font-semibold">₹{data.recommendedPrice?.toLocaleString('en-IN')}</span></p>
                <p>📈 Confidence: <span className="font-semibold">{Math.round((data.confidence ?? 0) * 100)}%</span></p>
                {data.breakdown && (
                    <p className="text-[10px] text-green-600 mt-1">
                        Surge: {data.breakdown.demandSurgeFactor}x | Fuel: ₹{data.breakdown.fuelEstimate}
                    </p>
                )}
            </div>
        </div>
    );
}

function RiskCard({ data }: { data: any }) {
    if (!data) return null;
    const emoji = data.riskLevel === 'LOW' ? '🟢' : data.riskLevel === 'MEDIUM' ? '🟡' : '🔴';
    const bgColor = data.riskLevel === 'LOW' ? 'from-green-50 to-emerald-50 border-green-200' :
                    data.riskLevel === 'MEDIUM' ? 'from-yellow-50 to-amber-50 border-yellow-200' :
                    'from-red-50 to-rose-50 border-red-200';
    return (
        <div className={`mt-2 bg-gradient-to-r ${bgColor} border rounded-lg p-3 text-xs`}>
            <div className="font-bold mb-1">{emoji} Risk: {data.riskLevel} ({data.riskScore}/100)</div>
            <div className="space-y-0.5">
                <p>⏰ Delay: ~{data.estimatedDelayMinutes} mins ({Math.round((data.delayProbability ?? 0) * 100)}% probability)</p>
                {data.reasons?.slice(0, 2).map((r: string, i: number) => (
                    <p key={i} className="text-[10px]">• {r}</p>
                ))}
            </div>
        </div>
    );
}

function LoadSharingCard({ data }: { data: any }) {
    if (!data || !data.combinations?.length) return null;
    return (
        <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-xs">
            <div className="font-bold text-blue-800 mb-1">🚛 Load Sharing</div>
            <div className="space-y-0.5 text-blue-700">
                <p>✅ {data.combinations.length} optimized groups</p>
                <p>💰 ~{data.totalSavingsKm} km saved</p>
                {data.combinations.slice(0, 2).map((c: any, i: number) => (
                    <p key={i} className="text-[10px]">
                        Group {i + 1}: {c.loads?.length} loads → Truck {c.truckId} ({c.capacityUsed}% full)
                    </p>
                ))}
            </div>
        </div>
    );
}

function RouteOptionsCard({ data }: { data: any }) {
    if (!data?.options) return null;
    return (
        <div className="mt-2 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-3 text-xs">
            <div className="font-bold text-purple-800 mb-1">🗺️ Route Options</div>
            <div className="space-y-1 text-purple-700">
                {data.options?.map((opt: any, i: number) => (
                    <div key={i} className={`flex justify-between ${opt.recommended ? 'font-semibold' : ''}`}>
                        <span>{opt.label === 'Fastest' ? '⚡' : opt.label === 'Cheapest' ? '💰' : '⚖️'} {opt.label}</span>
                        <span>{opt.distanceKm}km • ₹{opt.totalCost} {opt.recommended ? '✅' : ''}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AIAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    // Reset state completely when user identity changes
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (user?.id !== currentUserId) {
            console.log(`[Chat Debug] User identity changed from ${currentUserId} to ${user?.id}. Clearing state.`);
            setMessages([]);
            setShowQuickActions(false);
            setCurrentUserId(user?.id);
        }
    }, [user?.id, currentUserId]);

    // Load chat history based on user
    useEffect(() => {
        if (!isOpen) return;

        if (!user?.id) {
            console.log('[Chat Debug] Chat opened but no user ID. Clearing state.');
            setMessages([]);
            setShowQuickActions(false);
            return;
        }

        const loadChatHistory = async () => {
            console.log(`[Chat Debug] Loading chat history for user: ${user.id}`);
            const localKey = `chat_${user.id}`;
            const localData = localStorage.getItem(localKey);
            
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed.length > 0) {
                    console.log(`[Chat Debug] Loaded ${parsed.length} messages from local storage mapping to ${localKey}`);
                    setMessages(parsed);
                    setShowQuickActions(false);
                }
            }

            try {
                const res = await api.get('/dost/history');
                const history = res.data.history || [];
                console.log(`[Chat Debug] Fetched ${history.length} messages from API for user: ${user.id}`);
                
                if (history.length > 0) {
                    setMessages(history);
                    localStorage.setItem(localKey, JSON.stringify(history));
                    setShowQuickActions(false);
                } else if (!localData || JSON.parse(localData).length === 0) {
                    console.log(`[Chat Debug] No history found. Setting welcome message for role: ${user.role}`);
                    setMessages([{
                        role: 'assistant',
                        content: getWelcomeMessage(user?.role)
                    }]);
                    setShowQuickActions(true);
                }
            } catch (error) {
                console.error("[Chat Debug] Failed to fetch chat history from API", error);
                if (!localData || JSON.parse(localData).length === 0) {
                    setMessages([{
                        role: 'assistant',
                        content: getWelcomeMessage(user?.role)
                    }]);
                    setShowQuickActions(true);
                }
            }
        };

        loadChatHistory();
    }, [isOpen, user?.id, user?.role]);

    // Sync messages to local storage whenever they change
    useEffect(() => {
        // SECURITY: Only sync if we have a user and we are explicitly synced to their current state
        if (user?.id && user.id === currentUserId && messages.length > 0) {
            localStorage.setItem(`chat_${user.id}`, JSON.stringify(messages));
        }
    }, [messages, user?.id, currentUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isOpen]);

    // ── Text-to-Speech Helper ──
    const speakText = useCallback((text: string) => {
        if (!ttsEnabled) return;
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();


        // Clean text: remove emojis and markdown-like formatting
        const cleanText = text
            .replace(/[\u{1F600}-\u{1F9FF}]/gu, '') // emojis
            .replace(/[•\-\*#]/g, '')                // bullets/headers
            .replace(/₹/g, 'rupees ')
            .trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Auto-detect language: check for Devanagari characters
        const hasHindi = /[\u0900-\u097F]/.test(text);
        utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    }, [ttsEnabled]);

    const handleClearChat = async () => {
        if (!user?.id) return;
        if (!window.confirm("Are you sure you want to clear your chat history?")) return;
        try {
            await api.delete('/dost/history');
            const localKey = `chat_${user.id}`;
            localStorage.removeItem(localKey);
            setMessages([{
                role: 'assistant',
                content: getWelcomeMessage(user?.role)
            }]);
            setShowQuickActions(true);
        } catch (error) {
            console.error("Failed to clear API chat history", error);
            toast.warning("Could not clear chat from server, but local view is reset.");
            setMessages([{ role: 'assistant', content: getWelcomeMessage(user?.role) }]);
            setShowQuickActions(true);
        }
    };

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        const userMsg = { role: 'user' as const, content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setShowQuickActions(false);
        setIsLoading(true);

        try {
            // Build conversation history for context
            const conversationHistory = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await api.post('/dost/chat', {
                message: messageText,
                conversationHistory
            });

            const { reply, structuredData } = res.data;
            const assistantMsg: Message = {
                role: 'assistant',
                content: reply,
                structuredData,
            };
            setMessages(prev => [...prev, assistantMsg]);

            // Auto-speak response if TTS is enabled
            speakText(reply);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "TruckNet Dost abhi available nahi hai.\nThodi der baad try karo. 🙏"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        await sendMessage(input);
    };

    const handleQuickAction = async (text: string) => {
        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Enhanced Voice Input: Hindi + English with auto-detect ──
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            // Use Hindi as primary language with English alternative
            // This enables Hinglish recognition on supported browsers
            recognition.lang = 'hi-IN';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied. Please allow microphone in browser settings.', {
                        description: 'This is required for voice commands.',
                        duration: 5000,
                    });
                } else if (event.error === 'network') {
                    toast.error('Network error during speech recognition.');
                }
            };

            recognition.onresult = (event: any) => {
                const results = event.results;
                const lastResult = results[results.length - 1];
                const transcript = lastResult[0].transcript;

                if (lastResult.isFinal) {
                    // Final result — set in input and auto-send
                    setInput(transcript);
                    // Small delay to let state update, then auto-send
                    setTimeout(() => {
                        sendMessage(transcript);
                    }, 300);
                } else {
                    // Interim result — show in input for feedback
                    setInput(transcript);
                }
            };

            recognition.start();
        } else {
            toast.warning('Voice input is not supported in this browser.', {
                description: 'Please use Chrome or Edge for the best experience.'
            });
        }
    };

    // Compute mock insights or derive from last message for the panel
    const lastStructuredData = messages.length > 0 ? messages[messages.length - 1].structuredData : null;
    const panelInsights = lastStructuredData?.risk ? {
        riskScore: lastStructuredData.risk.riskScore,
        delay: '~' + lastStructuredData.risk.estimatedDelayMinutes + ' mins',
        alternateRoute: lastStructuredData.routeAdvanced?.options?.[0]?.label || 'Route 2 via Expressway',
        explanation: 'Due to unexpected congestion, we recommend an alternate route to save fuel and time.',
    } : undefined;

    return (
        <>
            <SmartAlerts />
            <AIOrb 
                isOpen={isOpen} 
                onClick={() => setIsOpen(true)} 
                status={panelInsights?.riskScore ? (panelInsights.riskScore > 50 ? 'warning' : 'normal') : 'normal'} 
            />

            {/* AI Panel Container */}
            <div className="relative z-[9999]">
                <AIPanel isOpen={isOpen} onClose={() => setIsOpen(false)} insights={panelInsights}>
                    <div className="absolute top-2 right-4 flex gap-1 z-10 bg-white/80 backdrop-blur pb-1 px-1 rounded-b-lg shadow-sm">

                        {/* Clear Chat Button */}
                        <button
                            onClick={handleClearChat}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete entire chat history"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        {/* TTS Toggle */}
                        <button
                            onClick={() => {
                                setTtsEnabled(!ttsEnabled);
                                if (ttsEnabled) window.speechSynthesis?.cancel();
                            }}
                            className={`p-1.5 rounded-md transition-colors ${ttsEnabled ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-400'}`}
                            title={ttsEnabled ? 'Mute voice' : 'Enable voice responses'}
                        >
                            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-white border shadow-sm rounded-bl-none text-black'
                                    }`}>
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>

                                    {/* ── Structured Data Cards ── */}
                                    {msg.structuredData?.pricing && <PricingCard data={msg.structuredData.pricing} />}
                                    {msg.structuredData?.risk && <RiskCard data={msg.structuredData.risk} />}
                                    {msg.structuredData?.loadSharing && <LoadSharingCard data={msg.structuredData.loadSharing} />}
                                    {msg.structuredData?.routeAdvanced && <RouteOptionsCard data={msg.structuredData.routeAdvanced} />}

                                    {/* Existing: Render Action Data (Loads) */}
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

                        {/* Quick Action Buttons */}
                        {showQuickActions && messages.length === 1 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {getQuickActions(user?.role).map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickAction(action.text)}
                                        className="px-3 py-1.5 text-xs bg-white border border-primary/30 text-primary rounded-full hover:bg-primary/10 transition-colors shadow-sm"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border shadow-sm rounded-lg rounded-bl-none p-3 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="p-3 border-t border-border bg-slate-50 flex gap-2 items-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full shadow-sm bg-white border border-border ${isListening ? 'text-red-500 animate-pulse border-red-200' : 'text-slate-500 hover:text-primary'}`}
                            onClick={startListening}
                            title="Voice input (Hindi/English)"
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type or speak..."
                            className="flex-1 resize-none rounded-xl border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm min-h-[44px] max-h-[100px]"
                            rows={1}
                        />
                        <Button 
                            size="icon" 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()}
                            className="rounded-full h-[44px] w-[44px] shadow-sm"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </AIPanel>
            </div>
        </>
    );
}

