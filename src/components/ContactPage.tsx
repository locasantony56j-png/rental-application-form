import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Search, Inbox, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ContactMessage } from '../types';

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  // Form fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // UI States
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Status Lookup States
  const [lookupEmail, setLookupEmail] = useState<string>('');
  const [lookupResults, setLookupResults] = useState<ContactMessage[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          subject,
          message
        })
      });

      if (res.ok) {
        setSuccess(true);
        // Clear fields
        setFullName('');
        setSubject('');
        setMessage('');
        // If lookup email is empty, prefill with the submitted email to show status instantly
        if (!lookupEmail) {
          setLookupEmail(email);
          handleLookup(email);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Failed to dispatch message to administration system.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while dispatching contact message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Lookup for responses
  const handleLookup = async (lookupTargetEmail: string) => {
    const emailToSearch = lookupTargetEmail || lookupEmail;
    if (!emailToSearch.trim()) return;

    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/contact/messages?email=${encodeURIComponent(emailToSearch.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResults(data);
      }
    } catch (err) {
      console.error('Error looking up message history:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center relative" id="contact-page-root">
      {/* Decorative glows */}
      <div className="absolute top-[5%] left-[-10%] w-[450px] h-[450px] bg-amber-200/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[450px] h-[450px] bg-emerald-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo banner */}
      <div className="flex flex-col items-center mb-8 relative z-10" id="contact-logo-box">
        <img 
          src="/src/assets/images/app_logo_no_text_1784304357219.jpg" 
          alt="Rental Application Gold Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl shadow-lg border border-amber-500/30 object-cover"
          referrerPolicy="no-referrer"
          id="img-contact-logo"
        />
      </div>

      <div className="max-w-5xl w-full bg-white rounded-[32px] border border-amber-500/10 shadow-[0_12px_42px_rgba(212,175,55,0.06)] p-8 sm:p-12 space-y-8 relative z-10" id="contact-card">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6" id="contact-header">
          <button 
            onClick={onBack}
            className="group flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-[#1B7E43] tracking-wider uppercase transition-colors cursor-pointer"
            id="btn-contact-back"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Portal</span>
          </button>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Client Center
          </span>
        </div>

        <div className="space-y-3" id="contact-title-area">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight" id="contact-main-title">Contact Support</h1>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-2xl">
            Have questions about application steps or processing timelines? Drop a message to our Security Coordinator or verify support replies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10" id="contact-grid">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6" id="contact-form-col">
            <h2 className="text-lg font-black text-gray-900 tracking-tight" id="form-heading">Send a New Query</h2>

            {success && (
              <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-2xl text-xs font-semibold flex items-start space-x-3" id="contact-success-alert">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="font-extrabold mb-1">Message Transmitted Successfully!</p>
                  <p className="text-slate-500 leading-relaxed">Our support administration has received your ticket as <span className="font-bold">Pending</span>. You can track status or read reply panels instantly on the right using your email.</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2" id="contact-error-alert">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4" id="form-contact-msg">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="row-personal">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-semibold"
                    id="contact-field-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah.j@example.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-semibold"
                    id="contact-field-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="row-phone-subject">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-semibold"
                    id="contact-field-phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subject</label>
                  <input 
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Verification status inquiry"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-semibold"
                    id="contact-field-subject"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Message Description</label>
                <textarea 
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or support details in full..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-semibold leading-relaxed"
                  id="contact-field-message"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1B7E43] hover:bg-[#145E31] text-white font-extrabold text-xs tracking-wider uppercase py-4 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:bg-gray-300"
                id="btn-contact-submit"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting Ticket...' : 'Send Message'}</span>
              </button>

            </form>
          </div>

          {/* Right Column: Live Status & Reply lookup - styled with beautiful matching forest dark green theme */}
          <div className="lg:col-span-5 bg-[#0B2516] text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 flex flex-col justify-start" id="contact-lookup-col">
            <div className="space-y-2 mb-6" id="lookup-header-box">
              <h3 className="text-base font-extrabold text-amber-400 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Live Admin Response Room</span>
              </h3>
              <p className="text-[11px] text-emerald-100/70 font-semibold leading-relaxed">
                Enter your email address to check real-time processing states and read direct administrator responses instantly.
              </p>
            </div>

            {/* Email search field */}
            <div className="flex gap-2 mb-6" id="lookup-search-container">
              <input 
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="Enter email to search replies..."
                className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-semibold text-gray-900 shadow-2xs"
                id="lookup-input-email"
              />
              <button
                onClick={() => handleLookup(lookupEmail)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl transition-all cursor-pointer"
                id="btn-lookup-search"
                title="Search Messages"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Output */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] pr-1" id="lookup-results-list">
              {searching ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold animate-pulse">
                  Querying server database nodes...
                </div>
              ) : !searched ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2" id="lookup-state-fresh">
                  <Inbox className="w-8 h-8 text-slate-300" />
                  <p className="text-[10px] uppercase tracking-wider font-extrabold">Waiting for search</p>
                </div>
              ) : lookupResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2" id="lookup-state-empty">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <p className="text-[11px] font-bold">No registered message threads found for this email address.</p>
                </div>
              ) : (
                lookupResults.map((msg) => {
                  const isPending = msg.status === 'Pending';
                  const isReplied = msg.status === 'Replied';
                  return (
                    <div key={msg.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-2xs" id={`lookup-card-${msg.id}`}>
                      <div className="flex justify-between items-start" id="lookup-card-header">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-gray-900 truncate max-w-[150px]" title={msg.subject}>{msg.subject}</p>
                          <span className="text-[9px] text-gray-400 font-medium">
                            {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {/* Status pill */}
                        {isPending && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isReplied && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>Replied</span>
                          </span>
                        )}
                        {msg.status === 'Closed' && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            Closed
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 text-[11px] font-semibold text-slate-500 leading-relaxed" id="lookup-client-msg-box">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Your Query</span>
                        {msg.message}
                      </div>

                      {msg.adminReply ? (
                        <div className="bg-green-50/70 border border-green-100 rounded-xl p-3 text-[11px] font-semibold text-green-800 leading-relaxed" id="lookup-admin-reply-box">
                          <span className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest block mb-1">Admin Response</span>
                          {msg.adminReply}
                          <p className="text-[8px] text-slate-400 font-medium mt-1.5 text-right">
                            Replied at {new Date(msg.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[10px] font-bold text-amber-800 text-center italic" id="lookup-wait-reply">
                          Our support team is reviewing your ticket and will post their response shortly.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
