import React from 'react';
import { ArrowLeft, Scale, AlertTriangle, FileCheck, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export default function TermsAndConditions({ onBack }: TermsAndConditionsProps) {
  return (
    <div className="min-h-screen bg-[#FCFAF7] py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center relative" id="terms-conditions-root">
      {/* Decorative glows */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-amber-200/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] w-[400px] h-[400px] bg-emerald-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo banner */}
      <div className="flex flex-col items-center mb-8 relative z-10" id="terms-logo-box">
        <img 
          src="/images/app_logo_no_text_1784304357219.jpg" 
          alt="Rental Application Gold Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl shadow-lg border border-amber-500/30 object-cover"
          referrerPolicy="no-referrer"
          id="img-terms-logo"
        />
      </div>

      <div className="max-w-3xl w-full bg-white rounded-[32px] border border-amber-500/10 shadow-[0_12px_42px_rgba(212,175,55,0.06)] p-8 sm:p-12 space-y-8 relative z-10" id="terms-card">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6" id="terms-header">
          <button 
            onClick={onBack}
            className="group flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-[#1B7E43] tracking-wider uppercase transition-colors cursor-pointer"
            id="btn-terms-back"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Portal</span>
          </button>
          <span className="bg-amber-50 text-amber-800 border border-amber-200/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Legal Terms
          </span>
        </div>

        <div className="space-y-4" id="terms-title-area">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight" id="terms-main-title">Terms & Conditions</h1>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Effective Date: July 2026. Please read these portal usage conditions thoroughly before registering or submitting a rental application.
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-slate-600 text-sm font-semibold leading-relaxed" id="terms-sections">
          
          <div className="flex gap-4 items-start" id="term-accuracy">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0" id="ico-term-accuracy">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-term-accuracy">Information Accuracy & Truthfulness</h3>
              <p className="text-slate-500 text-xs">
                All information, credentials, and uploaded files provided by applicants during any step of the application or submission must be strictly accurate, correct, and truthful.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="term-guarantee">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0" id="ico-term-guarantee">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-term-guarantee">No Guarantee of Approval</h3>
              <p className="text-slate-500 text-xs">
                The act of submitting a completed rental application form and depositing application fees does not guarantee approval, tenancy offer, or reservation priority of any properties or listings.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="term-discretion">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0" id="ico-term-discretion">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-term-discretion">Administrator Discretion & Decision Right</h3>
              <p className="text-slate-500 text-xs">
                The portal administrator reserves the absolute right to evaluate, verify, approve, decline, archive, or reject any rental application at their sole discretion based on system criteria and policy compliance.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="term-suspension">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0" id="ico-term-suspension">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-term-suspension">Rejection & Account Suspension Consequences</h3>
              <p className="text-slate-500 text-xs">
                Providing false, modified, fraudulent, or intentionally misleading credentials or information will trigger instant application rejection, fee forfeiture, and absolute suspension of portal access.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start" id="term-conduct">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0" id="ico-term-conduct">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-900 text-base" id="lbl-term-conduct">Responsible Portal Usage & Fraud Prohibition</h3>
              <p className="text-slate-500 text-xs">
                Users explicitly agree to use this portal responsibly, only for legitimate rental applications, and never engage in fraudulent, automated, system-taxing, or deceptive behaviors that undermine portal security or integrity.
              </p>
            </div>
          </div>

        </div>

        {/* Closing Action */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-bold" id="terms-footer">
          <p>© 2026 Rental Application Portal. All rights reserved.</p>
          <button 
            onClick={onBack}
            className="bg-[#1B7E43] hover:bg-[#145E31] text-white px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            id="btn-terms-footer-back"
          >
            Agree & Proceed
          </button>
        </div>

      </div>
    </div>
  );
}
