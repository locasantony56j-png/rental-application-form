import React from 'react';
import { LandingPageSettings } from '../types';
import { ShieldCheck, ChevronRight, MessageSquare, Lock, Heart } from 'lucide-react';

interface LandingPageProps {
  settings: LandingPageSettings;
  onApply: () => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
}

export default function LandingPage({ 
  settings, 
  onApply, 
  onOpenAdmin,
  onOpenLogin,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FCFAF7] text-gray-800 flex flex-col font-sans relative" id="landing-page-root">
      {/* Background Decorative Gradient Spots for rich colors */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-amber-200/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-200/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="border-b border-amber-500/10 py-4 px-6 md:px-12 flex justify-between items-center bg-[#FCFAF7]/95 sticky top-0 z-50 backdrop-blur-md shadow-2xs" id="navbar">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} id="logo-container">
          <img 
            src="/images/app_logo_no_text_1784304357219.jpg" 
            alt="Logo" 
            className="w-9 h-9 object-cover rounded-xl border border-amber-500/30 shadow-xs"
            referrerPolicy="no-referrer"
            id="img-navbar-logo"
          />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#112217]" id="logo-text">
            Rental Application Form
          </span>
        </div>
        <div className="flex items-center space-x-3" id="nav-actions">
          <button 
            onClick={onApply} 
            className="bg-[#1B7E43] hover:bg-[#145E31] text-white font-extrabold text-xs tracking-wider uppercase px-5 py-3 rounded-xl transition-all duration-200 shadow-sm shadow-emerald-800/10 hover:shadow-md cursor-pointer"
            id="btn-nav-apply"
          >
            Apply
          </button>
        </div>
      </header>

      {/* Hero Section Container with subtle architectural background image fade */}
      <main className="flex-1 flex flex-col relative overflow-hidden" id="main-content">
        {/* Background Image of Tall Building on the right with custom masks */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-right md:bg-center pointer-events-none opacity-[0.05]"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')" 
          }}
          id="hero-bg-image"
        />
        {/* Warm masks to fade image beautifully */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FCFAF7] via-[#FCFAF7]/95 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCFAF7] via-transparent to-[#FCFAF7] z-0 pointer-events-none" />

        {/* Hero Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-16 text-center max-w-4xl mx-auto" id="hero-section">
          <div className="space-y-6 sm:space-y-8" id="hero-content">
            {/* Elegant Golden Brand Logo */}
            <div className="flex flex-col items-center animate-fade-in" id="hero-logo-wrapper">
              <img 
                src="/images/app_logo_no_text_1784304357219.jpg" 
                alt="Rental Application Gold Logo" 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-xl border-2 border-amber-500/30 object-cover"
                referrerPolicy="no-referrer"
                id="img-hero-logo"
              />
            </div>

            {/* Title / Heading */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none flex flex-col space-y-1 sm:space-y-3" id="hero-title">
              <span className="text-[#1A2E22]" id="title-line-1">Complete your</span>
              <span className="text-[#1B7E43]" id="title-line-2">Rental Application</span>
            </h1>

            {/* Subheading text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed" id="hero-subtitle">
              Tell us what you're looking for and our specialists will match you with the best available apartments and houses in your preferred location — at the best price.
            </p>

            {/* CTA Button Group */}
            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4" id="hero-actions">
              <button 
                onClick={onApply} 
                className="w-full sm:w-auto bg-[#1B7E43] hover:bg-[#145E31] text-white font-extrabold text-sm tracking-wide px-8 py-4.5 rounded-2xl transition-all duration-200 shadow-[0_6px_20px_rgba(27,126,67,0.25)] hover:shadow-[0_8px_25px_rgba(27,126,67,0.35)] flex items-center justify-center space-x-2 cursor-pointer"
                id="btn-hero-apply"
              >
                <span>Apply Now</span>
              </button>
              <button 
                onClick={onApply}
                className="w-full sm:w-auto bg-white hover:bg-amber-50/20 text-[#1A2E22] font-extrabold text-sm tracking-wide px-8 py-4.5 rounded-2xl border border-amber-500/10 shadow-xs hover:border-amber-500/25 transition-all duration-200 flex items-center justify-center cursor-pointer"
                id="btn-hero-how-it-works"
              >
                <span>How it works</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section exactly as shown in screenshot but with ultra-premium emerald/gold luxury colors */}
        <section className="relative z-10 border-t border-amber-500/10 bg-[#0B2516]" id="stats-section">
          <div className="max-w-5xl mx-auto py-12 px-6 sm:px-12" id="stats-container">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center" id="stats-grid">
              
              <div className="space-y-1.5" id="stat-renters">
                <p className="text-4xl font-black text-amber-400" id="stat-renters-num">50K+</p>
                <p className="text-[10px] font-bold text-emerald-100/70 tracking-widest uppercase" id="stat-renters-lbl">Renters Helped</p>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-x border-emerald-800/40 pt-6 sm:pt-0" id="stat-rating">
                <p className="text-4xl font-black text-amber-400 flex items-center justify-center space-x-1" id="stat-rating-num">
                  <span>4.9</span>
                  <span className="text-amber-400 text-3xl">★</span>
                </p>
                <p className="text-[10px] font-bold text-emerald-100/70 tracking-widest uppercase" id="stat-rating-lbl">Avg. Rating</p>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 pt-6 sm:pt-0" id="stat-response">
                <p className="text-4xl font-black text-amber-400" id="stat-response-num">48 hr</p>
                <p className="text-[10px] font-bold text-emerald-100/70 tracking-widest uppercase" id="stat-response-lbl">Avg. Response</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer strictly matching screenshots but with high-end dark-emerald/charcoal colors */}
      <footer className="border-t border-emerald-950/20 bg-[#06110A] py-12 px-6 md:px-12 relative z-10" id="footer">
        <div className="max-w-5xl mx-auto space-y-8" id="footer-container">
          
          {/* Top row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-emerald-950/30 pb-6" id="footer-top-row">
            {/* Logo */}
            <div className="flex items-center space-x-3.5" id="footer-logo">
              <img 
                src="/images/app_logo_no_text_1784304357219.jpg" 
                alt="Logo" 
                className="w-7 h-7 object-cover rounded-lg border border-amber-500/20 shadow-xs"
                referrerPolicy="no-referrer"
                id="img-footer-logo"
              />
              <span className="font-extrabold text-sm tracking-tight text-emerald-100/80" id="footer-logo-text">
                Rental Application Form
              </span>
            </div>

            {/* All-caps modern uppercase links */}
            <div className="flex justify-center space-x-8 text-xs font-extrabold tracking-widest text-emerald-100/60" id="footer-nav-links">
              <a 
                href="#privacy" 
                onClick={(e) => { e.preventDefault(); onOpenPrivacy?.(); }} 
                className="hover:text-amber-400 transition-colors duration-150" 
                id="link-privacy"
              >
                PRIVACY
              </a>
              <a 
                href="#terms" 
                onClick={(e) => { e.preventDefault(); onOpenTerms?.(); }} 
                className="hover:text-amber-400 transition-colors duration-150" 
                id="link-terms"
              >
                TERMS
              </a>
              <a 
                href="#contact" 
                onClick={(e) => { e.preventDefault(); onOpenContact?.(); }} 
                className="hover:text-amber-400 transition-colors duration-150" 
                id="link-contact"
              >
                CONTACT
              </a>
            </div>

            {/* SSL Badge */}
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400" id="ssl-badge">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span id="ssl-badge-text">Secured by SSL</span>
            </div>
          </div>

          {/* Bottom row copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left pt-2" id="footer-bottom-row">
            <div className="order-2 sm:order-1 mt-4 sm:mt-0" id="footer-login-link-container">
              <button 
                onClick={onOpenLogin}
                className="text-[10px] font-bold text-emerald-100/40 hover:text-amber-400 tracking-widest uppercase transition-colors duration-150 cursor-pointer bg-transparent border-none"
                id="btn-footer-login"
              >
                Login
              </button>
            </div>
            <p className="text-[10px] font-bold text-emerald-100/40 tracking-widest uppercase order-1 sm:order-2 w-full sm:w-auto text-center sm:text-right" id="footer-copyright-text">
              © 2026 RENTAL APPLICATION FORM SYSTEM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

