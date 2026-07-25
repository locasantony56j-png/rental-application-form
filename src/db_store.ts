import * as fs from 'fs';
import * as path from 'path';
import { 
  RentalApplication, 
  ContentSettings, 
  AuditLog, 
  SystemUser,
  ChatMessage,
  ContactMessage
} from './types';

const DB_FILE = path.join(process.cwd(), 'database_store.json');

interface DatabaseSchema {
  applications: RentalApplication[];
  settings: ContentSettings;
  auditLogs: AuditLog[];
  users: SystemUser[];
  chatMessages?: ChatMessage[];
  contactMessages?: ContactMessage[];
}

const DEFAULT_SETTINGS: ContentSettings = {
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
  emailTemplates: {
    submitted: 'Dear {{firstName}},\n\nYour rental application has been successfully received (Ref: {{id}}). We are currently reviewing your details.\n\nBest regards,\nRental Team',
    approved: 'Dear {{firstName}},\n\nGreat news! Your rental application (Ref: {{id}}) has been APPROVED. We will contact you shortly with the lease details.\n\nBest regards,\nRental Team',
    rejected: 'Dear {{firstName}},\n\nWe regret to inform you that your rental application (Ref: {{id}}) was not accepted at this time. Thank you for your interest.\n\nBest regards,\nRental Team',
    paymentReceived: 'Dear {{firstName}},\n\nThank you for your payment of ${{amount}} for your rental application (Ref: {{id}}). Your receipt transaction ID is {{transactionId}}.\n\nBest regards,\nRental Team'
  },
  smsTemplates: {
    submitted: 'Your application {{id}} has been received! We are reviewing it. Fee of ${{amount}} paid.',
    statusChanged: 'Your application {{id}} status has been updated to {{status}}.'
  },
  fieldLabels: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    dob: 'Date of Birth',
    ssn: 'Social Security Number (SSN)'
  }
};

const DEFAULT_USERS: SystemUser[] = [
  { id: 'usr-1', username: 'apartment.comofficial@gmail.com', role: 'Admin', name: 'System Administrator' }
];

// Simple helper to create a default DB
function loadOrCreateDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const db = JSON.parse(data);
      if (!db.chatMessages) {
        db.chatMessages = [];
      }
      if (!db.contactMessages) {
        db.contactMessages = [];
      }
      // Force users to contain ONLY the single admin user
      db.users = [
        { id: 'usr-1', username: 'apartment.comofficial@gmail.com', role: 'Admin', name: 'System Administrator' }
      ];
      saveDatabase(db);
      return db;
    }
  } catch (err) {
    console.error('Error reading database file, resetting to defaults:', err);
  }

  // Create default schema with a few realistic initial rental applications (no property mentions)
  const initialApplications: RentalApplication[] = [
    {
      id: 'APP-84920482',
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.j@example.com',
        phone: '(555) 123-4567',
        dob: '1992-04-12',
        ssn: '***-**-6789'
      },
      currentAddress: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        zip: '62704',
        country: 'United States'
      },
      employment: {
        status: 'Employed',
        employerName: 'Springfield General Hospital',
        employerPhone: '(555) 987-6543',
        monthlyIncome: '6200',
        occupation: 'Registered Nurse',
        length: '3 Years, 2 Months'
      },
      emergencyContact: {
        name: 'Mark Jenkins',
        relationship: 'Spouse',
        phone: '(555) 234-5678',
        email: 'mark.j@example.com'
      },
      identity: {
        idType: 'Driver License',
        fileName: 'sarah_license_placeholder.png',
        fileUrl: '/uploads/sample-license.png',
        fileSize: '1.2 MB'
      },
      payment: {
        amount: 1.00,
        cardholderName: 'Sarah Jenkins',
        cardNumber: '**** **** **** 4242',
        expiry: '12/28',
        cvv: '***',
        paymentStatus: 'Paid',
        refundStatus: 'None',
        transactionId: 'TXN-93820482',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString() // 36 hours ago
      },
      status: 'Pending',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      softDeleted: false
    },
    {
      id: 'APP-10293847',
      personalInfo: {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen.tech@example.com',
        phone: '(555) 456-7890',
        dob: '1988-11-23',
        ssn: '***-**-1234'
      },
      currentAddress: {
        street: '120 San Francisco Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        country: 'United States'
      },
      employment: {
        status: 'Employed',
        employerName: 'Pixel Tech Solutions Inc',
        employerPhone: '(555) 321-4567',
        monthlyIncome: '10500',
        occupation: 'Software Engineer',
        length: '5 Years'
      },
      emergencyContact: {
        name: 'Linda Chen',
        relationship: 'Mother',
        phone: '(555) 654-3210',
        email: 'linda.chen@example.com'
      },
      identity: {
        idType: 'Passport',
        fileName: 'michael_passport.jpg',
        fileUrl: '/uploads/sample-passport.jpg',
        fileSize: '2.4 MB'
      },
      payment: {
        amount: 1.00,
        cardholderName: 'Michael Chen',
        cardNumber: '**** **** **** 1111',
        expiry: '06/29',
        cvv: '***',
        paymentStatus: 'Paid',
        refundStatus: 'None',
        transactionId: 'TXN-10294829',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString() // 12 hours ago
      },
      status: 'Approved',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
      softDeleted: false
    }
  ];

  const defaultAuditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      userId: 'usr-1',
      username: 'apartment.comofficial@gmail.com',
      role: 'Admin',
      action: 'System Init',
      details: 'Rental Application Portal database initialized with default configurations.',
      ip: '127.0.0.1'
    }
  ];

  const db: DatabaseSchema = {
    applications: initialApplications,
    settings: DEFAULT_SETTINGS,
    auditLogs: defaultAuditLogs,
    users: DEFAULT_USERS,
    chatMessages: [],
    contactMessages: []
  };

  saveDatabase(db);
  return db;
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// Memory database instance
let dbInstance = loadOrCreateDatabase();

export const DB = {
  getApplications(): RentalApplication[] {
    return dbInstance.applications.filter(app => !app.softDeleted);
  },

  getAllApplicationsIncludingDeleted(): RentalApplication[] {
    return dbInstance.applications;
  },

  addApplication(app: RentalApplication): void {
    dbInstance.applications.push(app);
    saveDatabase(dbInstance);
  },

  updateApplication(id: string, updates: Partial<RentalApplication>): boolean {
    const idx = dbInstance.applications.findIndex(app => app.id === id);
    if (idx !== -1) {
      dbInstance.applications[idx] = {
        ...dbInstance.applications[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveDatabase(dbInstance);
      return true;
    }
    return false;
  },

  getSettings(): ContentSettings {
    return dbInstance.settings;
  },

  updateSettings(settings: ContentSettings): void {
    dbInstance.settings = settings;
    saveDatabase(dbInstance);
  },

  getAuditLogs(): AuditLog[] {
    return dbInstance.auditLogs;
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    dbInstance.auditLogs.unshift(newLog); // Newest first
    saveDatabase(dbInstance);
  },

  getUsers(): SystemUser[] {
    return dbInstance.users;
  },

  updateUserRole(userId: string, newRole: 'Admin' | 'Staff' | 'Read Only'): boolean {
    const user = dbInstance.users.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      saveDatabase(dbInstance);
      return true;
    }
    return false;
  },

  getChatMessages(chatId?: string): ChatMessage[] {
    const msgs = dbInstance.chatMessages || [];
    if (chatId) {
      return msgs.filter(m => m.chatId === chatId);
    }
    return msgs;
  },

  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    if (!dbInstance.chatMessages) {
      dbInstance.chatMessages = [];
    }
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-msg-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    dbInstance.chatMessages.push(newMsg);
    saveDatabase(dbInstance);
    return newMsg;
  },

  getChatSessions() {
    const msgs = dbInstance.chatMessages || [];
    const sessionsMap = new Map<string, { chatId: string, lastMessage: string, lastTimestamp: string, clientName?: string, clientEmail?: string }>();
    
    // Process messages chronologically so last updates overwrite
    msgs.forEach(m => {
      sessionsMap.set(m.chatId, {
        chatId: m.chatId,
        lastMessage: m.text,
        lastTimestamp: m.timestamp,
        clientName: m.clientName || sessionsMap.get(m.chatId)?.clientName,
        clientEmail: m.clientEmail || sessionsMap.get(m.chatId)?.clientEmail
      });
    });

    return Array.from(sessionsMap.values()).sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
  },

  getContactMessages(): ContactMessage[] {
    return dbInstance.contactMessages || [];
  },

  addContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt'>): ContactMessage {
    if (!dbInstance.contactMessages) {
      dbInstance.contactMessages = [];
    }
    const newMsg: ContactMessage = {
      ...msg,
      id: `contact-msg-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbInstance.contactMessages.push(newMsg);
    saveDatabase(dbInstance);
    return newMsg;
  },

  updateContactMessage(id: string, updates: Partial<Pick<ContactMessage, 'adminReply' | 'status'>>): ContactMessage | null {
    if (!dbInstance.contactMessages) return null;
    const idx = dbInstance.contactMessages.findIndex(m => m.id === id);
    if (idx === -1) return null;
    
    dbInstance.contactMessages[idx] = {
      ...dbInstance.contactMessages[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(dbInstance);
    return dbInstance.contactMessages[idx];
  },

  deleteContactMessage(id: string): boolean {
    if (!dbInstance.contactMessages) return false;
    const lengthBefore = dbInstance.contactMessages.length;
    dbInstance.contactMessages = dbInstance.contactMessages.filter(m => m.id !== id);
    if (dbInstance.contactMessages.length !== lengthBefore) {
      saveDatabase(dbInstance);
      return true;
    }
    return false;
  }
};
