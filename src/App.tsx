import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ApplicationForm from './components/ApplicationForm';
import AdminPanel from './components/AdminPanel';
import ClientChatWidget from './components/ClientChatWidget';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import ContactPage from './components/ContactPage';
import LoginModal from './components/LoginModal';
import ApplicantDashboard from './components/ApplicantDashboard';
import { ContentSettings } from './types';
import { ShieldCheck, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'apply' | 'success' | 'admin' | 'privacy' | 'terms' | 'contact' | 'applicant-portal'>('landing');
  const [settings, setSettings] = useState<ContentSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successRefNum, setSuccessRefNum] = useState<string>('');
  
  // Auth states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string; name: string } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Fetch settings from server on mount
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        // Set document title dynamically based on Content settings
        if (data.landingPage?.title) {
          document.title = data.landingPage.title;
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    
    // Check for existing session on load
    const savedToken = localStorage.getItem('applicant_token');
    const savedUser = localStorage.getItem('applicant_user');
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin')) {
      setView('admin');
    } else if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setSessionToken(savedToken);
        setCurrentUser(parsedUser);
        if (parsedUser.username === 'apartment.comofficial@gmail.com') {
          setView('admin');
        } else {
          setView('applicant-portal');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('applicant_token');
        localStorage.removeItem('applicant_user');
      }
    }
  }, []);

  const handleApplyClick = () => {
    setView('apply');
  };

  const handleAdminClick = () => {
    setView('admin');
  };

  const handleLoginSuccess = (token: string, user: { id: string; username: string; role: string; name: string }) => {
    setSessionToken(token);
    setCurrentUser(user);
    
    // Persist sessions
    localStorage.setItem('applicant_token', token);
    localStorage.setItem('applicant_user', JSON.stringify(user));

    if (user.username === 'apartment.comofficial@gmail.com') {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setView('admin');
    } else {
      setView('applicant-portal');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSessionToken(null);
    localStorage.removeItem('applicant_token');
    localStorage.removeItem('applicant_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setView('landing');
  };

  const handleFormSubmitted = (refNum: string) => {
    setSuccessRefNum(refNum);
    setView('success');
  };

  const handleReturnHome = () => {
    // Refresh settings dynamically to reflect any changes made in Admin Panel Content Manager
    fetchSettings();
    if (currentUser) {
      if (currentUser.username === 'apartment.comofficial@gmail.com') {
        setView('admin');
      } else {
        setView('applicant-portal');
      }
    } else {
      setView('landing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 text-green-600 font-sans" id="app-loading-screen">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-sm font-bold tracking-tight text-gray-500">Securing application portal connection...</p>
      </div>
    );
  }

  // Fallback default settings if fetch fails
  const currentSettings: ContentSettings = settings || {
    landingPage: {
      logo: '🟢 SecurityFirst',
      title: 'Rental Application Form',
      heroHeading: 'Rental Application Form',
      heroSubheading: 'Complete your rental application securely.',
      applyButtonText: 'Apply Now',
      footerPrivacy: 'Privacy Policy',
      footerTerms: 'Terms of Service',
      footerContact: 'Contact Us',
      footerCopyright: '© 2026 Rental Application Portal. All rights reserved.'
    },
    applicationFee: 1.00,
    successMessage: {
      heading: 'Application Submitted Successfully',
      message: 'Thank you. Your application has been received. Our administrator will review it shortly.',
      buttonText: 'Return Home'
    },
    emailTemplates: { submitted: '', approved: '', rejected: '', paymentReceived: '' },
    smsTemplates: { submitted: '', statusChanged: '' },
    fieldLabels: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dob: 'Date of Birth',
      ssn: 'Social Security Number (SSN)'
    }
  };

  return (
    <div className="min-h-screen bg-white" id="main-app-container">
      {view !== 'admin' && <ClientChatWidget />}
      
      {view === 'landing' && (
        <LandingPage 
          settings={currentSettings.landingPage} 
          onApply={handleApplyClick} 
          onOpenAdmin={handleAdminClick} 
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenPrivacy={() => setView('privacy')}
          onOpenTerms={() => setView('terms')}
          onOpenContact={() => setView('contact')}
        />
      )}

      {view === 'apply' && (
        <ApplicationForm 
          settings={currentSettings} 
          onCancel={handleReturnHome} 
          onSubmitSuccess={handleFormSubmitted} 
          prefilledEmail={currentUser?.username}
        />
      )}

      {view === 'admin' && (
        <AdminPanel 
          onClose={handleLogout} 
        />
      )}

      {view === 'applicant-portal' && currentUser && sessionToken && (
        <ApplicantDashboard 
          email={currentUser.username}
          token={sessionToken}
          onLogout={handleLogout}
          onStartApplication={() => setView('apply')}
        />
      )}

      {view === 'privacy' && (
        <PrivacyPolicy 
          onBack={handleReturnHome}
        />
      )}

      {view === 'terms' && (
        <TermsAndConditions 
          onBack={handleReturnHome}
        />
      )}

      {view === 'contact' && (
        <ContactPage 
          onBack={handleReturnHome}
        />
      )}

      {view === 'success' && (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 font-sans" id="success-screen">
          <div className="bg-white max-w-xl w-full rounded-[32px] border border-slate-100 shadow-[0_12px_42px_rgba(15,23,42,0.03)] p-8 sm:p-12 text-center space-y-8" id="success-card">
            
            {/* Success Graphic */}
            <div className="flex flex-col items-center space-y-3" id="success-graphic">
              <div className="w-16 h-16 rounded-full bg-[#EEFDF4] text-[#16A34A] flex items-center justify-center shadow-xs animate-bounce" id="success-circle">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight" id="success-title">
                {currentSettings.successMessage.heading}
              </h1>
            </div>

            {/* Reference Number Box */}
            <div className="bg-[#EEFDF4]/40 border border-green-100 rounded-2xl p-6 space-y-1.5" id="reference-box">
              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Application Reference ID</p>
              <p className="text-2xl font-black font-mono text-[#22C55E] tracking-tight" id="text-reference-number">
                {successRefNum || 'APP-00000000'}
              </p>
              <div className="flex justify-center items-center space-x-1.5 text-[10px] text-slate-400 font-semibold" id="sec-badge">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Safely persistent on server node</span>
              </div>
            </div>

            {/* Custom Success Message */}
            <p className="text-sm font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed" id="success-message">
              {currentSettings.successMessage.message}
            </p>

            <div className="pt-4 border-t border-slate-100" id="success-action-group">
              <button
                onClick={handleReturnHome}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-4 rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.2)] hover:shadow-[0_6px_18px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                id="btn-return-home"
              >
                <span>{currentSettings.successMessage.buttonText}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Unified Passwordless Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
