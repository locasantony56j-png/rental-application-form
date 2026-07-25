import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { DB } from './src/db_store';
import { RentalApplication, AuditLog, ContentSettings } from './src/types';

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Static files for uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Helper middleware for auth tokens
  const authenticateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    // Standard static tokens for roles
    if (token === 'admin-token-123') {
      req.user = { id: 'usr-1', username: 'apartment.comofficial@gmail.com', role: 'Admin', name: 'System Administrator' };
    } else if (token.startsWith('user-token-')) {
      const userId = token.replace('user-token-', '');
      const user = DB.getUsers().find(u => u.id === userId);
      if (user) {
        req.user = user;
      } else {
        return res.status(403).json({ message: 'Invalid or expired session token' });
      }
    } else {
      return res.status(403).json({ message: 'Invalid or expired session token' });
    }
    next();
  };

  // Login via Email Endpoint (Secure Admin credentials)
  app.post('/api/login-email', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'apartment.comofficial@gmail.com' && password === 'Nahid123Bristy') {
      DB.addAuditLog({
        userId: 'usr-1',
        username: 'apartment.comofficial@gmail.com',
        role: 'Admin',
        action: 'Login Success',
        details: 'Admin user logged in via secure email & password verification.',
        ip: req.ip || '127.0.0.1'
      });
      return res.json({
        token: 'admin-token-123',
        role: 'Admin',
        user: { id: 'usr-1', username: 'apartment.comofficial@gmail.com', role: 'Admin', name: 'System Administrator' }
      });
    }

    return res.status(401).json({ message: 'Invalid email or password. Access is restricted strictly to the administrator.' });
  });

  // Login Endpoint (Retained for standard compatibility)
  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const cleanUsername = (username || '').trim().toLowerCase();
    
    // Primary Admin verification
    if (cleanUsername === 'apartment.comofficial@gmail.com' && password === 'Nahid123Bristy') {
      DB.addAuditLog({
        userId: 'usr-1',
        username: 'apartment.comofficial@gmail.com',
        role: 'Admin',
        action: 'Login Success',
        details: 'Admin user successfully logged in to dashboard via standard login.',
        ip: req.ip || '127.0.0.1'
      });
      return res.json({
        token: 'admin-token-123',
        user: { id: 'usr-1', username: 'apartment.comofficial@gmail.com', role: 'Admin', name: 'System Administrator' }
      });
    }

    DB.addAuditLog({
      userId: 'unknown',
      username: username || 'anonymous',
      role: 'Guest',
      action: 'Login Failure',
      details: `Failed login attempt with username: ${username}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.status(401).json({ message: 'Access Denied: Invalid administrator credentials.' });
  });

  // Export Source Code
  app.get('/api/source-code', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Permission denied. Only Admins can access source code.' });
    }

    try {
      const arrayOfFiles: { path: string, content: string }[] = [];
      const readFilesRecursively = (dirPath: string) => {
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
          const fullPath = path.join(dirPath, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (!['node_modules', 'dist', '.git', 'uploads', '.cache'].includes(file)) {
              readFilesRecursively(fullPath);
            }
          } else {
            const ext = path.extname(file);
            const validExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md'];
            if ((validExts.includes(ext) || file === '.env.example') && file !== 'database_store.json' && file !== 'package-lock.json') {
              const content = fs.readFileSync(fullPath, 'utf8');
              const relativePath = path.relative(process.cwd(), fullPath);
              // limit file size to avoid sending giant files (e.g. database_store.json)
              if (stat.size < 500 * 1024) { 
                arrayOfFiles.push({ path: relativePath, content });
              }
            }
          }
        });
      };
      
      readFilesRecursively(process.cwd());
      res.json({ files: arrayOfFiles });
    } catch (error) {
      console.error('Error reading source code:', error);
      res.status(500).json({ message: 'Failed to read source code' });
    }
  });

  // Get Content Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(DB.getSettings());
  });

  // Update Content Settings
  app.post('/api/settings', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Permission denied. Only Admins can modify settings.' });
    }

    const newSettings = req.body as ContentSettings;
    DB.updateSettings(newSettings);

    DB.addAuditLog({
      userId: user.id,
      username: user.username,
      role: user.role,
      action: 'Update Settings',
      details: 'Modified general content and application settings.',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ message: 'Settings successfully updated', settings: newSettings });
  });

  // Upload Government ID
  app.post('/api/upload', upload.single('idFile'), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSizeMb = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    
    res.json({
      fileUrl,
      fileName: req.file.originalname,
      fileSize: fileSizeMb
    });
  });

  // Submit Application Form
  app.post('/api/applications', (req: Request, res: Response) => {
    const rawData = req.body;
    
    // Auto-generate reference ID
    const refNum = 'APP-' + Math.floor(10000000 + Math.random() * 90000000);
    
    const newApp: RentalApplication = {
      id: refNum,
      personalInfo: rawData.personalInfo,
      currentAddress: rawData.currentAddress,
      employment: rawData.employment,
      emergencyContact: rawData.emergencyContact,
      identity: rawData.identity,
      payment: {
        ...rawData.payment,
        transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
        timestamp: new Date().toISOString()
      },
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      softDeleted: false
    };

    DB.addApplication(newApp);

    // Audit Log
    DB.addAuditLog({
      userId: 'public',
      username: `${newApp.personalInfo.firstName} ${newApp.personalInfo.lastName}`,
      role: 'Applicant',
      action: 'Submit Application',
      details: `New rental application ${newApp.id} submitted. Fee of $${newApp.payment.amount.toFixed(2)} paid successfully.`,
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      id: refNum,
      application: newApp
    });
  });

  // Get All Applications (Admin / Staff / Applicant)
  app.get('/api/applications', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const list = DB.getApplications();
    if (user.role === 'Admin' || user.role === 'Staff' || user.role === 'Read Only') {
      res.json(list);
    } else {
      // It's an Applicant! Filter by their logged in email (user.username is their email)
      const filtered = list.filter(app => 
        app.personalInfo && 
        app.personalInfo.email && 
        app.personalInfo.email.trim().toLowerCase() === user.username.trim().toLowerCase()
      );
      res.json(filtered);
    }
  });

  // Update Application Status (Approve / Reject / Archive / Refund)
  app.patch('/api/applications/:id', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, paymentStatus, refundStatus, softDeleted } = req.body;

    const apps = DB.getApplications();
    const app = apps.find(a => a.id === id);

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Role verification: Read only cannot edit anything
    if (user.role === 'Read Only') {
      return res.status(403).json({ message: 'Permission denied. Guest users are read-only.' });
    }

    const updates: Partial<RentalApplication> = {};
    const auditDetails: string[] = [];

    if (status !== undefined) {
      updates.status = status;
      auditDetails.push(`changed status to ${status}`);
    }

    if (paymentStatus !== undefined) {
      updates.payment = {
        ...app.payment,
        paymentStatus
      };
      auditDetails.push(`changed payment status to ${paymentStatus}`);
    }

    if (refundStatus !== undefined) {
      updates.payment = {
        ...app.payment,
        refundStatus,
        paymentStatus: refundStatus === 'Refunded' ? 'Refunded' : app.payment.paymentStatus
      };
      auditDetails.push(`changed refund status to ${refundStatus}`);
    }

    if (softDeleted !== undefined) {
      updates.softDeleted = softDeleted;
      auditDetails.push(softDeleted ? 'moved to archive (soft delete)' : 'restored from archive');
    }

    DB.updateApplication(id, updates);

    // Audit Log Entry
    DB.addAuditLog({
      userId: user.id,
      username: user.username,
      role: user.role,
      action: 'Update Application',
      details: `Modified application ${id}: ${auditDetails.join(', ')}.`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Application updated successfully' });
  });

  // Get Audit Logs (Admin / Staff)
  app.get('/api/audit-logs', authenticateToken, (req: Request, res: Response) => {
    res.json(DB.getAuditLogs());
  });

  // Get Users (Admin / Staff)
  app.get('/api/users', authenticateToken, (req: Request, res: Response) => {
    res.json(DB.getUsers());
  });

  // Change User Role (Admin only)
  app.patch('/api/users/:id', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Permission denied. Only Admins can modify user roles.' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'Admin' && role !== 'Staff' && role !== 'Read Only') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const success = DB.updateUserRole(id, role);
    if (success) {
      DB.addAuditLog({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'Update User Role',
        details: `Changed role of user ${id} to ${role}`,
        ip: req.ip || '127.0.0.1'
      });
      res.json({ success: true, message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  // Get Chat Messages (Public by chatId or Admin for sessions)
  app.get('/api/chat/messages', (req: Request, res: Response) => {
    const { chatId } = req.query;
    if (!chatId) {
      return res.status(400).json({ message: 'chatId query parameter is required' });
    }
    const messages = DB.getChatMessages(chatId as string);
    res.json(messages);
  });

  // Post a Chat Message (Public for both Client and Admin)
  app.post('/api/chat/messages', (req: Request, res: Response) => {
    const { chatId, sender, text, clientName, clientEmail } = req.body;
    if (!chatId || !sender || !text) {
      return res.status(400).json({ message: 'Missing required fields (chatId, sender, text)' });
    }

    const newMessage = DB.addChatMessage({
      chatId,
      sender,
      text,
      clientName,
      clientEmail
    });

    res.status(201).json(newMessage);
  });

  // Get Chat Sessions (Admin/Staff only)
  app.get('/api/chat/sessions', authenticateToken, (req: Request, res: Response) => {
    const sessions = DB.getChatSessions();
    res.json(sessions);
  });

  // GET Contact Messages: Admin gets all, public can filter by email/phone to check response status
  app.get('/api/contact/messages', (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    const allMessages = DB.getContactMessages();

    // If admin token is valid, return all
    if (token === 'admin-token-123') {
      return res.json(allMessages);
    }

    // Otherwise, check for public filters (email / phone)
    const { email, phone } = req.query;
    if (email || phone) {
      const filtered = allMessages.filter(msg => {
        const matchesEmail = email ? msg.email.toLowerCase() === (email as string).toLowerCase() : false;
        const matchesPhone = phone ? msg.phone.replace(/\D/g, '') === (phone as string).replace(/\D/g, '') : false;
        return matchesEmail || matchesPhone;
      });
      return res.json(filtered);
    }

    // Default to empty array or require parameters
    return res.json([]);
  });

  // POST Contact Message (Public)
  app.post('/api/contact/messages', (req: Request, res: Response) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields (name, email, subject, message)' });
    }

    const newMessage = DB.addContactMessage({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      adminReply: '',
      status: 'Pending'
    });

    res.status(201).json(newMessage);
  });

  // PATCH Contact Message (Reply/Update Status - Admin/Staff only)
  app.patch('/api/contact/messages/:id', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { adminReply, status } = req.body;

    const currentMsg = DB.getContactMessages().find(m => m.id === id);
    if (!currentMsg) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Guests/ReadOnly can look but cannot reply/modify
    if (user.role === 'Read Only') {
      return res.status(403).json({ message: 'Guest auditors are forbidden from replying or updating message status.' });
    }

    const updates: any = {};
    if (adminReply !== undefined) {
      updates.adminReply = adminReply;
      // Auto transition to Replied if there is a reply text
      if (adminReply.trim() !== '') {
        updates.status = 'Replied';
      }
    }
    if (status !== undefined) {
      updates.status = status;
    }

    const updated = DB.updateContactMessage(id, updates);
    if (updated) {
      DB.addAuditLog({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'Reply Contact Message',
        details: `Replied/Updated status of message ${id} to ${updated.status}`,
        ip: req.ip || '127.0.0.1'
      });
      res.json(updated);
    } else {
      res.status(500).json({ message: 'Failed to update contact message' });
    }
  });

  // DELETE Contact Message (Admin only)
  app.delete('/api/contact/messages/:id', authenticateToken, (req: Request, res: Response) => {
    const user = req.user;
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Permission denied. Only Admins can delete contact messages.' });
    }

    const { id } = req.params;
    const success = DB.deleteContactMessage(id);
    if (success) {
      DB.addAuditLog({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: 'Delete Contact Message',
        details: `Deleted contact message: ${id}`,
        ip: req.ip || '127.0.0.1'
      });
      res.json({ success: true, message: 'Contact message deleted successfully' });
    } else {
      res.status(404).json({ message: 'Contact message not found' });
    }
  });

  // Global error handler to prevent HTML error pages
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({ 
      success: false,
      message: err.message || 'Internal Server Error' 
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rental Application Server running at http://0.0.0.0:${PORT}`);
  });
}

// Add User interface to Express namespace to avoid ts errors
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: 'Admin' | 'Staff' | 'Read Only' | 'Applicant';
        name: string;
      };
    }
  }
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
