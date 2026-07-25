import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  FileText, 
  User, 
  MapPin, 
  Briefcase, 
  Phone, 
  FileUp, 
  MessageSquare, 
  Send,
  Loader2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { RentalApplication, ChatMessage } from '../types';

interface ApplicantDashboardProps {
  email: string;
  token: string;
  onLogout: () => void;
  onStartApplication: () => void;
}

export default function ApplicantDashboard({ email, token, onLogout, onStartApplication }: ApplicantDashboardProps) {
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatId, setChatId] = useState('');

  // Fetch applications on mount
  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await fetch('/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, [token]);

  // Set up personal chatId from email
  useEffect(() => {
    if (email) {
      const sanitizedId = 'chat-' + email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      setChatId(sanitizedId);
    }
  }, [email]);

  // Fetch and poll chat messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatId) return;

    const text = chatInput.trim();
    setChatInput('');

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sender: 'client',
          text,
          clientName: email.split('@')[0],
          clientEmail: email
        })
      });
      // Immediately refresh messages
      const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Approved</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-red-100 text-red-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Review Pending</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex flex-col justify-center items-center space-y-4" id="dashboard-loading">
        <Loader2 className="w-12 h-12 text-[#1B7E43] animate-spin" />
        <p className="text-sm font-bold text-slate-500">Retrieving secure rental application files...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-gray-800 flex flex-col font-sans" id="applicant-dashboard-root">
      
      {/* Premium Private Navigation */}
      <header className="border-b border-emerald-950/5 py-5 px-6 md:px-12 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-2xs" id="dashboard-nav">
        <div className="flex items-center space-x-3" id="dash-logo">
          <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#1A2E22]" id="dash-logo-text">
            Applicant Portal
          </span>
        </div>
        <div className="flex items-center space-x-4" id="dash-nav-actions">
          <span className="hidden sm:inline-block text-xs font-black text-slate-400 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl font-mono">
            {email}
          </span>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 text-xs font-extrabold text-slate-500 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 border border-slate-100 hover:border-red-100 px-4 py-2.5 rounded-xl cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="dashboard-main">
        
        {/* Left Column (Main content / applications tracker) */}
        <div className="lg:col-span-2 space-y-8" id="dash-left-column">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-[#0B2516] to-[#06140C] text-white p-8 md:p-10 rounded-[32px] border border-emerald-950/20 shadow-lg relative overflow-hidden" id="dash-welcome">
            <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3" id="welcome-text-group">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-emerald-900/40 border border-emerald-700/20 px-3 py-1 rounded-lg">
                Secure Account Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Hello, {email.split('@')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/70 max-w-lg leading-relaxed">
                Check your application status, manage verification records, and securely correspond with the property management office in real-time.
              </p>
            </div>
          </div>

          {/* Applications list */}
          <div className="space-y-6" id="applications-section">
            <div className="flex justify-between items-center" id="apps-header">
              <h2 className="text-lg font-black text-[#1A2E22] tracking-tight flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Your Rental Applications</span>
              </h2>
              {applications.length > 0 && (
                <button
                  onClick={onStartApplication}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                  id="btn-apply-another"
                >
                  New Application
                </button>
              )}
            </div>

            {applications.length === 0 ? (
              /* State: No application submitted */
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-xs p-10 sm:p-12 text-center space-y-6" id="no-apps-state">
                <div className="inline-flex w-16 h-16 bg-amber-50 text-amber-500 rounded-full items-center justify-center border border-amber-500/10" id="alert-icon-wrapper">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto" id="no-apps-info">
                  <h3 className="text-xl font-black text-[#1A2E22] tracking-tight">No Active Submission</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    You haven't submitted any rental applications using this email account yet. Ready to start your search?
                  </p>
                </div>
                <button
                  onClick={onStartApplication}
                  className="inline-flex items-center space-x-2 bg-[#1B7E43] hover:bg-[#145E31] text-white font-black text-sm px-8 py-4 rounded-2xl shadow-md transition-all duration-150 cursor-pointer"
                  id="btn-start-app"
                >
                  <span>Start Rental Application</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* State: Applications tracking cards */
              <div className="space-y-6" id="apps-list">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.015)] p-6 sm:p-8 space-y-6"
                    id={`app-card-${app.id}`}
                  >
                    {/* Card Top Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-5" id="card-header">
                      <div className="space-y-1" id="card-meta">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Application ID</p>
                        <h4 className="text-lg font-black text-[#1A2E22] font-mono tracking-tight">{app.id}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">
                          Submitted on {new Date(app.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                      </div>
                      <div id="card-status-badge">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    {/* Quick Overview Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600" id="card-fields-overview">
                      <div className="bg-slate-50/50 p-4.5 rounded-2xl border border-slate-50 space-y-2.5" id="group-personal">
                        <div className="flex items-center space-x-2 font-black text-[#1A2E22] text-[10px] uppercase tracking-widest text-slate-400" id="group-personal-lbl">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Primary Applicant</span>
                        </div>
                        <p className="font-bold text-sm text-[#1A2E22]">
                          {app.personalInfo.firstName} {app.personalInfo.lastName}
                        </p>
                        <p className="font-medium text-slate-500">{app.personalInfo.phone}</p>
                      </div>

                      <div className="bg-slate-50/50 p-4.5 rounded-2xl border border-slate-50 space-y-2.5" id="group-employment">
                        <div className="flex items-center space-x-2 font-black text-[#1A2E22] text-[10px] uppercase tracking-widest text-slate-400" id="group-employment-lbl">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>Occupation & Income</span>
                        </div>
                        <p className="font-bold text-sm text-[#1A2E22]">{app.employment.occupation || 'N/A'}</p>
                        <p className="font-medium text-slate-500">
                          {app.employment.employerName} — ${Number(app.employment.monthlyIncome).toLocaleString()}/mo
                        </p>
                      </div>
                    </div>

                    {/* Accordion / Details */}
                    <div className="bg-emerald-50/30 border border-emerald-100/40 rounded-2xl p-5 flex items-start space-x-3 text-xs text-emerald-800" id="card-security-banner">
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#1B7E43]" />
                      <div className="space-y-0.5">
                        <p className="font-black text-[#1A2E22]">Application Safe & Secure</p>
                        <p className="text-[#1B7E43]/80 font-medium">
                          Your application is locked and secured with high-grade cryptographic encryption. Our administrators will call you shortly if any clarifications are needed.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Secure real-time correspondence chat) */}
        <div className="space-y-6" id="dash-right-column">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_12px_42px_rgba(15,23,42,0.02)] overflow-hidden flex flex-col h-[520px]" id="secure-chat-card">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#0B2516] to-[#06140C] text-white p-5 flex items-center space-x-3" id="chat-header">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0" id="chat-header-meta">
                <h3 className="font-black text-xs uppercase tracking-widest text-amber-400 leading-none">Property Management</h3>
                <h4 className="text-xs font-bold text-emerald-100/80 truncate mt-1">Direct Chat Support</h4>
              </div>
              <div className="flex items-center space-x-1.5" id="chat-status">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />
                <span className="text-[10px] font-extrabold text-emerald-100/60 uppercase">Live</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30" id="chat-messages-container">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400" id="empty-chat-state">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Direct Live Chat</p>
                  <p className="text-[10px] font-medium text-slate-400 max-w-[180px]">
                    No messages yet. Send a message to contact our leasing officers directly.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                      id={`chat-msg-${msg.id}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isAdmin 
                          ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-3xs' 
                          : 'bg-[#1B7E43] text-white rounded-tr-none'
                      }`}>
                        <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400/80 mt-1 uppercase tracking-wider">
                        {isAdmin ? 'Property Officer' : 'You'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-50 bg-white flex items-center space-x-2" id="chat-input-form">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/5 transition-all text-slate-800"
                id="input-chat-text"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-[#1B7E43] hover:bg-[#145E31] disabled:bg-slate-100 text-white disabled:text-slate-400 p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                id="btn-chat-send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </main>
    </div>
  );
}
