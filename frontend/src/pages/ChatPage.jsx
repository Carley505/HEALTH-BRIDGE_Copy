import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowLeft, Send, Sparkles, RotateCcw } from 'lucide-react';
import api from '../services/api';

const INITIAL_MESSAGE = {
    role: 'assistant',
    content: "Hello! I'm your AI health coach powered by HealthBridge AI. I'm here to help you understand your preventive health and provide personalized recommendations for hypertension and diabetes risk reduction. How can I assist you today?"
};

export default function ChatPage() {
    const { user } = useSelector((state) => state.auth);
    const uid = user?.uid;
    const storageKey = uid ? `chatSessionId_${uid}` : null;

    const [sessionId, setSessionId] = useState(() => storageKey ? localStorage.getItem(storageKey) : null);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);
    const sessionInitialized = useRef(false);
    const lastUidRef = useRef(uid);

    // Reset session when user identity changes
    useEffect(() => {
        if (uid && uid !== lastUidRef.current) {
            lastUidRef.current = uid;
            const key = `chatSessionId_${uid}`;
            const savedSession = localStorage.getItem(key);
            setSessionId(savedSession);
            setMessages([INITIAL_MESSAGE]);
            setError(null);
            sessionInitialized.current = false;
        }
    }, [uid]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Initialize or restore session
    const initializeSession = useCallback(async () => {
        if (sessionInitialized.current) return;
        sessionInitialized.current = true;

        try {
            if (sessionId) {
                // Try fetching previous messages if available
                try {
                    const res = await api.get(`/chat/session/${sessionId}/messages`);
                    if (res.data?.messages?.length > 0) {
                        setMessages(res.data.messages.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })));
                        return;
                    }
                } catch {
                    // If session expired or not found, start fresh
                }
            }

            // Create new session
            const res = await api.post('/chat/session', { session_type: 'general' });
            if (res.data?.session_id) {
                const newId = res.data.session_id;
                setSessionId(newId);
                if (storageKey) localStorage.setItem(storageKey, newId);
            }
        } catch (err) {
            console.error('Failed to initialize session:', err);
        }
    }, [sessionId, storageKey]);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const messageText = input.trim();
        const userMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            let activeSessionId = sessionId;
            if (!activeSessionId) {
                const sessionRes = await api.post('/chat/session', { session_type: 'general' });
                activeSessionId = sessionRes.data?.session_id || `session_${Date.now()}`;
                setSessionId(activeSessionId);
                if (storageKey) localStorage.setItem(storageKey, activeSessionId);
            }

            const response = await api.post('/chat/message', {
                session_id: activeSessionId,
                content: messageText,
            });

            const assistantReply = response.data?.content || "I have received your message and updated your health context.";
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: assistantReply,
            }]);
        } catch (err) {
            console.error('Chat error:', err);
            setError('Failed to get a response. Please try again.');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I apologize, but I encountered an issue reaching the health coach service. Please try sending your message again.",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = async () => {
        try {
            if (storageKey) localStorage.removeItem(storageKey);
            setSessionId(null);
            setMessages([INITIAL_MESSAGE]);
            setError(null);
            sessionInitialized.current = false;

            const response = await api.post('/chat/session', { session_type: 'general' });
            if (response.data?.session_id) {
                const newId = response.data.session_id;
                setSessionId(newId);
                if (storageKey) localStorage.setItem(storageKey, newId);
            }
        } catch (err) {
            console.error('Failed to create new session:', err);
            setError('Failed to start new chat. Please try again.');
        }
    };

    return (
        <div className="h-screen h-[100dvh] flex flex-col w-full max-w-full overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 flex-shrink-0"
                style={{
                    background: 'var(--nav-bg)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Link to="/dashboard"
                        className="p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 hover:opacity-80"
                        style={{ color: 'var(--text-primary)' }}
                        title="Back to Dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>AI Health Coach</h1>
                            <p className="text-[11px] sm:text-xs truncate font-medium" style={{ color: 'var(--text-muted)' }}>Always here to help</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                        onClick={handleNewChat}
                        className="p-2 rounded-lg transition-colors hover:opacity-80 active:scale-95"
                        style={{ color: 'var(--text-primary)' }}
                        title="New Chat"
                    >
                        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3.5 sm:space-y-4 w-full">
                {messages.map((message, idx) => (
                    <div key={idx}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn w-full`}>
                        <div className={`flex items-start gap-2 sm:gap-3 max-w-[88%] sm:max-w-[78%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: message.role === 'user'
                                        ? 'var(--color-primary)'
                                        : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                                }}>
                                {message.role === 'user'
                                    ? (user?.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span className="text-white text-xs sm:text-sm font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
                                    ))
                                    : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                }
                            </div>
                            {/* Message Bubble */}
                            <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm break-anywhere overflow-hidden"
                                style={{
                                    background: message.role === 'user'
                                        ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)'
                                        : 'var(--bg-surface)',
                                    color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                                    border: message.role === 'user' ? 'none' : '1px solid var(--border-color)',
                                    borderRadius: message.role === 'user'
                                        ? '1.25rem 1.25rem 0.25rem 1.25rem'
                                        : '1.25rem 1.25rem 1.25rem 0.25rem'
                                }}>
                                {message.role === 'user' ? (
                                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                    <div className="text-xs sm:text-sm leading-relaxed space-y-2">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 sm:pl-5 my-1.5 sm:my-2 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-4 sm:pl-5 my-1.5 sm:my-2 space-y-1.5 font-medium">{children}</ol>,
                                                li: ({ children }) => <li className="pl-1 leading-relaxed font-normal">{children}</li>,
                                                strong: ({ children }) => <strong className="font-semibold text-[var(--color-primary)]">{children}</strong>,
                                                h1: ({ children }) => <h1 className="text-sm sm:text-base font-bold my-1.5 text-[var(--text-primary)]">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-xs sm:text-sm font-bold my-1.5 text-[var(--text-primary)]">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-xs sm:text-sm font-semibold my-1 text-[var(--text-primary)]">{children}</h3>,
                                                code: ({ children }) => <code className="px-1.5 py-0.5 rounded text-[11px] sm:text-xs bg-black/10 dark:bg-white/10 font-mono break-all">{children}</code>,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-fadeIn w-full">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem'
                                }}>
                                <div className="flex gap-1 py-1">
                                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="flex justify-center animate-fadeIn w-full">
                        <div className="px-4 py-2 rounded-lg text-xs sm:text-sm"
                            style={{
                                background: 'var(--color-error, #ef4444)',
                                color: 'white',
                                opacity: 0.95
                            }}>
                            {error}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Footer */}
            <footer className="p-2.5 sm:p-4 pb-safe flex-shrink-0 w-full" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
                <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3 w-full">
                    <div className="flex-1 relative min-w-0">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="input w-full text-xs sm:text-sm py-2.5 sm:py-3 px-3.5 sm:px-4"
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0 shadow-md"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                            boxShadow: '0 4px 14px rgba(var(--color-primary-rgb), 0.3)'
                        }}>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
