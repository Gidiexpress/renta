'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import styles from './SupportWidget.module.css';

export default function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Renta AI. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: messages })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.widgetWrapper}>
            {/* Toggle Button */}
            <button
                className={`${styles.toggleBtn} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Support Chat"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && messages.length === 1 && <span className={styles.badge}>1</span>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={`${styles.chatWindow} fade-in`}>
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <div className={styles.botIcon}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3>Renta Support</h3>
                                <p>AI Assistant • Always Online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.messagesContainer} ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                                <div className={styles.avatar}>
                                    {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className={styles.bubble}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.avatar}><Bot size={14} /></div>
                                <div className={`${styles.bubble} ${styles.loading}`}>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>AI is thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={!input.trim() || isLoading}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
