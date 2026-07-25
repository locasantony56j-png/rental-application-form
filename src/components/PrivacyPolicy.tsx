import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, RefreshCw, Cookie } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-[#FCFAF7] py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center relative" id="privacy-policy-root">
      {/* Decorative glows */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-amber-200/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] w-[400px] h-[400px] bg-emerald-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo banner */}
      <div className="flex flex-col items-center mb-8 relative z-10" id="privacy-logo-box">
        <img 
          src="/src/assets/images/app_logo_no_text_1784304357219.jpg" 
          alt="Rental Application Gold Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl shadow-lg border border-amber-500/30 object-cover"
          referrerPolicy="no-referrer"
          id="img-privacy-logo"
        />
      </div>

      <div className="max-w-3xl w-full bg-white rounded-[32px] border border-amber-500/10 shadow-[0_12px_42px_rgba(212,175,55,0.06)] p-8 sm:p-12 space-y-8 relative z-10" id="privacy-card">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6" id="privacy-header">
          <button 
            onClick={onBack}
            className="group flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-[#1B7E43] tracking-wider uppercase transition-colors cursor-pointer"
            id="btn-privacy-back"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Portal</span>
          </button>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Active Policy
          </span>
        </div>

        <div className="space-y-4" id="privacy-title-area">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight" id="privacy-main-title">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Last Updated: July 2026. This policy details how our secure rental application network protects and processes your sensitive credentials.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-slate-600 text-sm font-semibold leading-relaxed" id="privacy-sections">
          
          <div className="flex gap-4 items-start" id="sec-collect">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0" id="ico-collect">
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-collect">Information We Collect</h3>
              <p className="text-slate-500 text-xs">
                We collect essential personal information necessary to assess your rental status, which includes your full name, email address, phone number, and all associated rental application details (such as current address, employment records, emergency contacts, and government ID documents).
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="sec-usage">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0" id="ico-usage">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-usage">How We Use Your Information</h3>
              <p className="text-slate-500 text-xs">
                Your collected credentials and information are strictly utilized for processing your rental application and facilitating direct communication with you regarding updates, status assessments, and application resolution.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="sec-share">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0" id="ico-share">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-share">Zero-Sharing & Non-Disclosure Commitment</h3>
              <p className="text-slate-500 text-xs">
                We respect your trust. We do not sell, distribute, rent, or share your personal information with any third-party marketing networks or external companies, except in strict accordance with the law or when explicitly required by official legal processes.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="sec-security">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0" id="ico-security">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-security">Data Security Measures</h3>
              <p className="text-slate-500 text-xs">
                We take comprehensive, industry-leading technical and organizational security measures to shield your personal data against unauthorized access, loss, manipulation, or disclosure.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="sec-rights">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0" id="ico-rights">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-rights">Your Rights (Update & Deletion)</h3>
              <p className="text-slate-500 text-xs">
                You maintain complete command over your personal records. Registered users can contact the administration center at any time to request updates, rectifications, or complete deletion of their personal information and file records from our database system.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="sec-cookies">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0" id="ico-cookies">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-cookies">Cookies & Analytics Usage</h3>
              <p className="text-slate-500 text-xs">
                Our application portal may leverage browser cookies and local storage tokens to enhance navigation flow, preserve session status safely, and continuously elevate the general user experience.
              </p>
            </div>
          </div>

        </div>

        {/* Closing Action */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-bold" id="privacy-footer">
          <p>© 2026 Rental Application Portal. All rights reserved.</p>
          <button 
            onClick={onBack}
            className="bg-[#1B7E43] hover:bg-[#145E31] text-white px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            id="btn-privacy-footer-back"
          >
            Acknowledge & Back
          </button>
        </div>

      </div>
    </div>
  );
}
