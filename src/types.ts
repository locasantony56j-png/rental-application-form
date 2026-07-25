export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  ssn?: string;
  ssnVisible?: boolean;
}

export interface CurrentAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface EmploymentInfo {
  status: string; // 'Employed' | 'Unemployed' | 'Self-Employed' | 'Student' | 'Retired' | 'Other'
  employerName: string;
  employerPhone: string;
  monthlyIncome: string;
  occupation: string;
  length: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface IdentityInfo {
  idType: string; // 'Driver License' | 'Passport' | 'State ID'
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
}

export interface PaymentInfo {
  amount: number;
  cardholderName: string;
  cardNumber: string; // Saved fully
  expiry: string;
  cvv: string; // Saved fully
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  refundStatus: 'None' | 'Requested' | 'Refunded';
  transactionId: string;
  timestamp: string;
  cardType?: string;
  cardBrand?: string;
  paymentMethod?: string; // 'Card' | 'Cash App' | 'Venmo' | 'Zelle' | 'Apple Pay' | 'Google Pay' | 'PayPal'
  cashAppTag?: string;
  venmoUsername?: string;
  zelleEmailPhone?: string;
  payPalEmail?: string;
}

export interface RentalApplication {
  id: string; // APP-XXXXXXXX
  personalInfo: PersonalInfo;
  currentAddress: CurrentAddress;
  employment: EmploymentInfo;
  emergencyContact: EmergencyContact;
  identity: IdentityInfo;
  payment: PaymentInfo;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Archived';
  createdAt: string;
  updatedAt: string;
  softDeleted: boolean;
}

export interface LandingPageSettings {
  logo: string;
  title: string;
  heroHeading: string;
  heroSubheading: string;
  applyButtonText: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  footerCopyright: string;
}

export interface EmailTemplates {
  submitted: string;
  approved: string;
  rejected: string;
  paymentReceived: string;
}

export interface SmsTemplates {
  submitted: string;
  statusChanged: string;
}

export interface ContentSettings {
  landingPage: LandingPageSettings;
  applicationFee: number;
  successMessage: {
    heading: string;
    message: string;
    buttonText: string;
  };
  emailTemplates: EmailTemplates;
  smsTemplates: SmsTemplates;
  fieldLabels: {
    [key: string]: string;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  details: string;
  ip: string;
}

export interface SystemUser {
  id: string;
  username: string;
  role: 'Admin' | 'Staff' | 'Read Only' | 'Applicant';
  name: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: string;
  clientName?: string;
  clientEmail?: string;
}

export interface ContactMessage {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  adminReply?: string;
  status: 'Pending' | 'Replied' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

