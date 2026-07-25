import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

export default function ClientChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing chat session on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem('client_chat_id');
    const savedName = localStorage.getItem('client_chat_name');
    const savedEmail = localStorage.getItem('client_chat_email');

    if (savedChatId && savedName && savedEmail) {
      setChatId(savedChatId);
      setName(savedName);
      setEmail(savedEmail);
      setIsRegistered(true);
    }
  }, []);

  // Poll for new messages every 4 seconds if chat is open and registered
  useEffect(() => {
    if (!chatId || !isOpen || !isRegistered) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [chatId, isOpen, isRegistered]);

  // Scroll to bottom when messages update or chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newChatId = 'chat-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('client_chat_id', newChatId);
    localStorage.setItem('client_chat_name', name.trim());
    localStorage.setItem('client_chat_email', email.trim());

    setChatId(newChatId);
    setIsRegistered(true);

    // Send a system message or welcome message right away
    sendSystemWelcome(newChatId, name.trim(), email.trim());
  };

  const sendSystemWelcome = async (id: string, clientName: string, clientEmail: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: id,
          sender: 'admin',
          text: `Hello ${clientName}! Thanks for reaching out. An administrator is online and will reply to you here. How can we help you today?`,
          clientName,
          clientEmail
        })
      });
      fetchMessages();
    } catch (err) {
      console.error('Failed to send welcome message:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sender: 'client',
          text,
          clientName: name,
          clientEmail: email
        })
      });

      if (res.ok) {
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetSession = () => {
    if (window.confirm('Are you sure you want to clear your chat history and start a new session?')) {
      localStorage.removeItem('client_chat_id');
      localStorage.removeItem('client_chat_name');
      localStorage.removeItem('client_chat_email');
      setChatId('');
      setName('');
      setEmail('');
      setIsRegistered(false);
      setMessages([]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="client-chat-widget">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white p-4 rounded-full shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:shadow-[0_8px_30px_rgb(34,197,94,0.5)] transform hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer"
          id="btn-chat-toggle-open"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div 
          className="bg-white w-[360px] sm:w-[380px] h-[500px] rounded-3xl shadow-[0_12px_42px_rgba(15,23,42,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
          id="chat-popup"
        >
          {/* Header */}
          <div className="bg-[#0F172A] p-4.5 text-white flex justify-between items-center" id="chat-header">
            <div className="flex items-center space-x-2.5" id="chat-header-info">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" id="chat-online-dot" />
              <div>
                <h4 className="font-bold text-sm tracking-tight">Support Chat</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin is Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              id="btn-chat-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Registration / Input Name Form */}
          {!isRegistered ? (
            <div className="flex-1 p-6 flex flex-col justify-center space-y-6" id="chat-registration">
              <div className="text-center space-y-2" id="chat-intro">
                <div className="w-12 h-12 rounded-full bg-[#EEFDF4] text-[#16A34A] flex items-center justify-center mx-auto" id="chat-icon-box">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h5 className="font-extrabold text-[#0F172A] text-base">Chat with Administrator</h5>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                  Provide your details to start a live support conversation directly with the property manager.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4" id="form-chat-register">
                <div className="space-y-1.5" id="chat-reg-name">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Your Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all"
                    id="input-chat-reg-name"
                  />
                </div>

                <div className="space-y-1.5" id="chat-reg-email">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all"
                    id="input-chat-reg-email"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-3 rounded-xl shadow-xs transition-colors text-xs tracking-wider uppercase cursor-pointer"
                  id="btn-chat-start"
                >
                  Start Conversation
                </button>
              </form>
            </div>
          ) : (
            /* Active Chat Window */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50" id="chat-active-window">
              {/* Message History area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5" id="chat-messages-container">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-1.5 p-6" id="chat-empty-state">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Connecting to server session...</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isClient = msg.sender === 'client';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                        id={`chat-msg-row-${msg.id}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow-xs ${
                            isClient 
                              ? 'bg-[#22C55E] text-white rounded-tr-none' 
                              : 'bg-white text-[#0F172A] border border-slate-100 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold tracking-tight mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Session utility bar */}
              <div className="bg-white border-t border-slate-100 px-4 py-1.5 flex justify-between items-center text-[10px] text-slate-400" id="chat-utility-bar">
                <span className="flex items-center space-x-1 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                  <span>Encrypted</span>
                </span>
                <button 
                  onClick={handleResetSession} 
                  className="hover:text-red-500 font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  id="btn-chat-new"
                >
                  New Chat
                </button>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-100 p-3 flex items-center space-x-2" id="form-chat-send">
                <input
                  type="text"
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all"
                  id="input-chat-text"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-[#22C55E] cursor-pointer"
                  id="btn-chat-send-submit"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
