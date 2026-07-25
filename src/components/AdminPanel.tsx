import React, { useState, useEffect } from 'react';
import { 
  RentalApplication, 
  ContentSettings, 
  AuditLog, 
  SystemUser,
  ContactMessage
} from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Archive, 
  Download, 
  Printer, 
  AlertTriangle,
  Loader2,
  Lock,
  UserCheck,
  RefreshCw,
  Bell,
  Mail,
  Smartphone,
  Info,
  MessageSquare,
  Building2,
  Shield,
  Scale,
  Trash2,
  Code,
  Copy
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  // Authentication & Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);

  // Panel Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'payments' | 'content' | 'audit' | 'users' | 'chat' | 'contact_messages' | 'properties' | 'privacy_view' | 'terms_view' | 'export_code'>('overview');

  // Export Code State
  const [sourceCodeFiles, setSourceCodeFiles] = useState<{path: string, content: string}[]>([]);
  const [loadingSourceCode, setLoadingSourceCode] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Chat State
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminChatInput, setAdminChatInput] = useState<string>('');

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [replyTextInput, setReplyTextInput] = useState<string>('');
  const [contactFilter, setContactFilter] = useState<'All' | 'Pending' | 'Replied' | 'Closed'>('All');
  const [contactSearch, setContactSearch] = useState<string>('');

  // Properties State (managed mock properties in Admin Panel)
  const [properties, setProperties] = useState<any[]>([
    { id: 'prop-1', address: '124 Park Avenue, Apt 4B', type: 'Apartment', rent: 1450, beds: 2, baths: 1, status: 'Available' },
    { id: 'prop-2', address: '890 Oak Lane', type: 'Single Family', rent: 2100, beds: 3, baths: 2, status: 'Rented' },
    { id: 'prop-3', address: '557 Pine Boulevard, Apt 12', type: 'Apartment', rent: 1200, beds: 1, baths: 1, status: 'Available' },
    { id: 'prop-4', address: '12 Elm Street', type: 'Townhouse', rent: 1850, beds: 2, baths: 2.5, status: 'Available' }
  ]);

  // New property form state
  const [newPropAddress, setNewPropAddress] = useState<string>('');
  const [newPropRent, setNewPropRent] = useState<string>('');
  const [newPropBeds, setNewPropBeds] = useState<string>('');
  const [newPropBaths, setNewPropBaths] = useState<string>('');
  const [newPropType, setNewPropType] = useState<string>('Apartment');

  // Application / Settings State from API
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [settings, setSettings] = useState<ContentSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filters / Searches
  const [globalDateFilter, setGlobalDateFilter] = useState<'ALL' | 'TODAY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'>('ALL');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');

  const isWithinDateFilter = (dateStr: string | undefined | null) => {
    if (!dateStr) return true;
    if (globalDateFilter === 'ALL') return true;
    
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (globalDateFilter === 'TODAY') {
      return date.toDateString() === today.toDateString();
    }
    
    if (globalDateFilter === 'WEEKLY') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return date >= weekAgo && date <= today;
    }
    
    if (globalDateFilter === 'MONTHLY') {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      monthAgo.setHours(0, 0, 0, 0);
      return date >= monthAgo && date <= today;
    }
    
    if (globalDateFilter === 'YEARLY') {
      const yearAgo = new Date();
      yearAgo.setFullYear(today.getFullYear() - 1);
      yearAgo.setHours(0, 0, 0, 0);
      return date >= yearAgo && date <= today;
    }

    if (globalDateFilter === 'CUSTOM') {
      if (!customDateStart && !customDateEnd) return true;
      let valid = true;
      if (customDateStart) {
        const start = new Date(customDateStart);
        start.setHours(0,0,0,0);
        valid = valid && date >= start;
      }
      if (customDateEnd) {
        const end = new Date(customDateEnd);
        end.setHours(23,59,59,999);
        valid = valid && date <= end;
      }
      return valid;
    }

    return true;
  };

  const [appSearch, setAppSearch] = useState<string>('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('');
  const [appPaymentFilter, setAppPaymentFilter] = useState<string>('');
  const [paymentSearch, setPaymentSearch] = useState<string>('');

  // Selected details view
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);

  // Content Editor local state
  const [editSettings, setEditSettings] = useState<ContentSettings | null>(null);

  // Notifications Tray state
  const [notifications, setNotifications] = useState<string[]>([]);

  // Fetch Dashboard data
  const fetchAllData = async (authToken: string) => {
    setLoadingData(true);
    setDataError(null);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      // Applications
      const appRes = await fetch('/api/applications', { headers });
      if (!appRes.ok) throw new Error('Failed to load applications list');
      const appData = await appRes.json();
      setApplications(appData);

      // Contact Messages
      const contactRes = await fetch('/api/contact/messages', { headers });
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        setContactMessages(contactData);
      }

      // Settings
      const setRes = await fetch('/api/settings');
      if (!setRes.ok) throw new Error('Failed to load current settings');
      const setData = await setRes.json();
      setSettings(setData);
      setEditSettings(setData);

      // Audit Logs
      const auditRes = await fetch('/api/audit-logs', { headers });
      if (!auditRes.ok) throw new Error('Failed to load audit logs');
      const auditData = await auditRes.json();
      setAuditLogs(auditData);

      // Users
      const userRes = await fetch('/api/users', { headers });
      if (!userRes.ok) throw new Error('Failed to load portal users');
      const userData = await userRes.json();
      setUsers(userData);

      // Extract quick notifications from fresh audit logs
      const submits = auditData
        .filter((log: AuditLog) => log.action === 'Submit Application')
        .slice(0, 5)
        .map((log: AuditLog) => `${log.timestamp.slice(11, 16)}: ${log.details}`);
      setNotifications(submits);

    } catch (err: any) {
      console.error(err);
      setDataError(err.message || 'Error syncing database records.');
    } finally {
      setLoadingData(false);
    }
  };

  // Contact Message Handlers
  const handleSendContactReply = async (msgId: string, replyText: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/contact/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminReply: replyText })
      });
      if (res.ok) {
        setReplyTextInput('');
        // Refresh messages list
        const updatedRes = await fetch('/api/contact/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setContactMessages(updatedData);
        }
        // Also update audit log
        const auditRes = await fetch('/api/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (auditRes.ok) {
          setAuditLogs(await auditRes.json());
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to dispatch reply.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while dispatching reply.');
    }
  };

  const handleUpdateContactStatus = async (msgId: string, newStatus: 'Pending' | 'Replied' | 'Closed') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/contact/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedRes = await fetch('/api/contact/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setContactMessages(updatedData);
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleDeleteContactMessage = async (msgId: string) => {
    if (!token) return;
    if (!window.confirm('Are you absolutely sure you want to permanently delete this contact message thread?')) return;
    try {
      const res = await fetch(`/api/contact/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSelectedContactId('');
        const updatedRes = await fetch('/api/contact/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setContactMessages(updatedData);
        }
        const auditRes = await fetch('/api/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (auditRes.ok) {
          setAuditLogs(await auditRes.json());
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete message.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  // Property Handlers
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropAddress || !newPropRent) return;
    const newProp = {
      id: `prop-${Math.random().toString(36).substr(2, 9)}`,
      address: newPropAddress,
      type: newPropType,
      rent: Number(newPropRent) || 1000,
      beds: Number(newPropBeds) || 1,
      baths: Number(newPropBaths) || 1,
      status: 'Available'
    };
    setProperties([...properties, newProp]);
    setNewPropAddress('');
    setNewPropRent('');
    setNewPropBeds('');
    setNewPropBaths('');
    setNewPropType('Apartment');
  };

  const handleDeleteProperty = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    setProperties(properties.filter(p => p.id !== id));
  };

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser(parsedUser);
        setIsLoggedIn(true);
        fetchAllData(savedToken);
      } catch (err) {
        console.error('Failed to restore admin session:', err);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  const fetchChatSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatSessions(data);
      }
    } catch (err) {
      console.error('Error fetching chat sessions:', err);
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    if (!chatId) return;
    try {
      const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleAdminSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedChatId) return;

    const text = adminChatInput.trim();
    setAdminChatInput('');

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChatId,
          sender: 'admin',
          text
        })
      });

      if (res.ok) {
        fetchChatMessages(selectedChatId);
        fetchChatSessions();
      }
    } catch (err) {
      console.error('Error sending admin chat message:', err);
    }
  };

  // Poll for sessions
  useEffect(() => {
    if (activeTab !== 'chat' || !token) return;

    fetchChatSessions();
    const interval = setInterval(fetchChatSessions, 4000);
    return () => clearInterval(interval);
  }, [activeTab, token]);

  // Poll for active messages
  useEffect(() => {
    if (activeTab !== 'chat' || !selectedChatId) return;

    fetchChatMessages(selectedChatId);
    const interval = setInterval(() => fetchChatMessages(selectedChatId), 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedChatId]);

  // Trigger login request
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Access Denied. Verification failed.');
      }

      const result = await response.json();
      setToken(result.token);
      setCurrentUser(result.user);
      setIsLoggedIn(true);

      // Save to localStorage for device persistence
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_user', JSON.stringify(result.user));
      
      // Fetch data
      fetchAllData(result.token);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    setCurrentUser(null);
    setApplications([]);
    setSettings(null);
    setAuditLogs([]);
    setUsers([]);
    // Remove local persistence
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  // --- Actions ---
  // Status update
  const handleUpdateStatus = async (appId: string, newStatus: 'Approved' | 'Rejected' | 'Archived') => {
    if (!currentUser || currentUser.role === 'Read Only') {
      alert('Action Denied: Read Only guest users cannot modify applications.');
      return;
    }

    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let payload: any = {};
      if (newStatus === 'Archived') {
        payload.softDeleted = true;
      } else {
        payload.status = newStatus;
      }

      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update application');
      
      // Refresh
      await fetchAllData(token);
      
      // Auto update modal view if open
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, ...payload } : null);
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Refund processing
  const handleProcessRefund = async (appId: string) => {
    if (!currentUser || currentUser.role === 'Read Only') {
      alert('Action Denied: Guest users cannot initiate refunds.');
      return;
    }

    if (!confirm(`Are you sure you want to refund the application processing fee for ${appId}?`)) return;

    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ refundStatus: 'Refunded' })
      });

      if (!response.ok) throw new Error('Refund transaction failed');
      
      await fetchAllData(token);
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => prev ? { 
          ...prev, 
          payment: { ...prev.payment, refundStatus: 'Refunded', paymentStatus: 'Refunded' } 
        } : null);
      }
      alert('Refund successfully settled via mock gateway.');
    } catch (err: any) {
      alert('Refund Error: ' + err.message);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'Admin') {
      alert('Access Denied: Only portal Admins can modify settings.');
      return;
    }

    setSavingSettings(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(editSettings)
      });

      if (!response.ok) throw new Error('Failed to update settings file');
      
      const result = await response.json();
      setSettings(result.settings);
      alert('Portal settings successfully updated on server disk.');
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // User Role Change
  const handleChangeRole = async (userId: string, newRole: 'Admin' | 'Staff' | 'Read Only') => {
    if (!currentUser || currentUser.role !== 'Admin') {
      alert('Access Denied: Only Admins can modify staff authorization roles.');
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to adjust user role');
      await fetchAllData(token);
      alert('Staff authorization role updated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Exports Utilities ---
  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(head => JSON.stringify(row[head] || '')).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAppCSV = () => {
    const simplified = applications.map(app => ({
      ID: app.id,
      FirstName: app.personalInfo.firstName,
      LastName: app.personalInfo.lastName,
      Email: app.personalInfo.email,
      Phone: app.personalInfo.phone,
      DOB: app.personalInfo.dob,
      City: app.currentAddress.city,
      State: app.currentAddress.state,
      Income: app.employment.monthlyIncome,
      Status: app.status,
      DateSubmitted: app.createdAt
    }));
    exportCSV(simplified, 'rental_applications_export');
  };

  const exportPaymentsCSV = () => {
    const simplified = applications.map(app => ({
      AppID: app.id,
      Cardholder: app.payment.cardholderName,
      CardNumber: app.payment.cardNumber,
      FeeCharged: app.payment.amount,
      PaymentStatus: app.payment.paymentStatus,
      RefundStatus: app.payment.refundStatus,
      TransactionID: app.payment.transactionId,
      Timestamp: app.payment.timestamp
    }));
    exportCSV(simplified, 'rental_payments_export');
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Filters calculations ---
  const filteredApps = applications.filter(app => {
    if (!isWithinDateFilter(app.createdAt)) return false;
    const searchString = `${app.id} ${app.personalInfo.firstName} ${app.personalInfo.lastName} ${app.personalInfo.email} ${app.personalInfo.phone} ${app.currentAddress.city} ${app.currentAddress.state}`.toLowerCase();
    const matchesSearch = searchString.includes(appSearch.toLowerCase());
    const matchesStatus = appStatusFilter ? app.status === appStatusFilter : true;
    const matchesPayment = appPaymentFilter ? app.payment.paymentStatus === appPaymentFilter : true;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const filteredPayments = applications.filter(app => {
    if (!isWithinDateFilter(app.payment.timestamp)) return false;
    const searchString = `${app.id} ${app.payment.cardholderName} ${app.payment.transactionId} ${app.payment.paymentStatus}`.toLowerCase();
    return searchString.includes(paymentSearch.toLowerCase());
  });

  const dateFilteredApplications = applications.filter(a => isWithinDateFilter(a.createdAt));

  // --- Dashboard Metrics & Charts calculation ---
  const totalApps = dateFilteredApplications.length;
  const pendingApps = dateFilteredApplications.filter(a => a.status === 'Pending').length;
  const approvedApps = dateFilteredApplications.filter(a => a.status === 'Approved').length;
  const rejectedApps = dateFilteredApplications.filter(a => a.status === 'Rejected').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = dateFilteredApplications.filter(a => a.createdAt.startsWith(todayStr)).length;
  const totalRevenue = dateFilteredApplications
    .filter(a => a.payment.paymentStatus === 'Paid')
    .reduce((sum, a) => sum + a.payment.amount, 0);

  // 1. Bar Chart Data (Applications per state)
  const stateCounts: { [key: string]: number } = {};
  dateFilteredApplications.forEach(a => {
    const st = a.currentAddress.state || 'Unknown';
    stateCounts[st] = (stateCounts[st] || 0) + 1;
  });
  const barChartData = Object.keys(stateCounts).map(state => ({
    state,
    count: stateCounts[state]
  }));

  // 2. Pie Chart Data (Status Breakdown)
  const pieChartData = [
    { name: 'Pending', value: pendingApps, color: '#F59E0B' },
    { name: 'Approved', value: approvedApps, color: '#10B981' },
    { name: 'Rejected', value: rejectedApps, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // --- Render Login Modal/Screen if not authed ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" id="admin-login-screen">
        <div className="bg-white max-w-md w-full rounded-2xl border border-gray-100 shadow-xl p-8" id="login-card">
          <div className="text-center space-y-3 mb-8" id="login-header">
            <div className="inline-flex w-12 h-12 rounded-xl bg-green-50 text-green-600 items-center justify-center mb-2" id="lock-icon-container">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight" id="login-title">Secure Portal Login</h1>
            <p className="text-sm text-gray-400" id="login-subtitle">Authorization required to review applicant records.</p>
          </div>

          {loginError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2" id="login-error-alert">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5" id="login-form">
            <div className="space-y-1" id="login-username-group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" id="lbl-login-user">Username</label>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Enter username"
                id="input-login-username"
              />
            </div>

            <div className="space-y-1" id="login-pw-group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" id="lbl-login-pw">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="••••••••"
                id="input-login-password"
              />
            </div>

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer mt-2"
              id="btn-login-submit"
            >
              {loadingLogin ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4" id="login-footer">
            <button 
              onClick={onClose} 
              className="text-xs text-gray-400 hover:text-green-600 underline cursor-pointer"
              id="btn-login-cancel"
            >
              Back to Portal Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Dashboard UI if logged in ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans" id="admin-panel-root">
      
      {/* Upper Navigation Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-8 flex justify-between items-center" id="admin-header">
        <div className="flex items-center space-x-3" id="admin-title-group">
          <span className="font-black text-lg tracking-tight text-green-600 bg-green-50 px-3 py-1.5 rounded-xl" id="admin-logo-badge">
            Secure Admin
          </span>
          <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />
          <p className="text-sm font-semibold text-gray-500 hidden sm:block" id="admin-user-greetings">
            Active User: <span className="text-gray-900 font-bold">{currentUser?.name}</span> ({currentUser?.role})
          </p>
        </div>

        <div className="flex items-center space-x-3" id="admin-header-actions">
          <button 
            onClick={() => fetchAllData(token)}
            disabled={loadingData}
            className="p-2 text-gray-400 hover:text-green-600 bg-gray-50 border hover:border-green-100 rounded-lg transition-all cursor-pointer"
            id="btn-admin-refresh"
            title="Refresh database records"
          >
            {loadingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 bg-red-50 px-3.5 py-2 border border-red-100 rounded-lg font-bold transition-all cursor-pointer"
            id="btn-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container Layout: Sidebar + Canvas */}
      <div className="flex-1 flex flex-col md:flex-row" id="admin-layout">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 space-y-8 flex-shrink-0" id="admin-sidebar">
          
          <div className="space-y-1.5" id="sidebar-tabs-group">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Management</p>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-overview"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {currentUser?.role === 'Admin' ? (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'users' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                id="sidebar-tab-users"
              >
                <UserCheck className="w-4 h-4" />
                <span>Users</span>
              </button>
            ) : (
              <div className="w-full text-left flex items-center space-x-3 px-3 py-2 text-xs font-bold text-gray-300 select-none bg-slate-50/50 rounded-xl" title="Admin only access">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Users (Admin only)</span>
              </div>
            )}

            <button
              onClick={() => { setActiveTab('applications'); setSelectedApp(null); }}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'applications' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-applications"
            >
              <FileText className="w-4 h-4" />
              <span>Rental Applications</span>
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'properties' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-properties"
            >
              <Building2 className="w-4 h-4" />
              <span>Properties</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'payments' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-payments"
            >
              <DollarSign className="w-4 h-4" />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('contact_messages')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'contact_messages' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-contact-messages"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Messages</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'chat' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-chat"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Support Chats</span>
            </button>
          </div>

          <div className="space-y-1.5" id="sidebar-config-group">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Legal & Settings</p>

            <button
              onClick={() => setActiveTab('privacy_view')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy_view' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-privacy-view"
            >
              <Shield className="w-4 h-4" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('terms_view')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'terms_view' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-terms-view"
            >
              <Scale className="w-4 h-4" />
              <span>Terms & Conditions</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'content' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-content"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'audit' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-audit"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Audit History</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('export_code');
                if (sourceCodeFiles.length === 0 && !loadingSourceCode) {
                  setLoadingSourceCode(true);
                  fetch('/api/source-code', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  .then(res => res.json())
                  .then(data => {
                    setSourceCodeFiles(data.files || []);
                    setLoadingSourceCode(false);
                  })
                  .catch(err => {
                    console.error(err);
                    setLoadingSourceCode(false);
                  });
                }
              }}
              className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'export_code' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
              id="sidebar-tab-export-code"
            >
              <Code className="w-4 h-4" />
              <span>Export Code</span>
            </button>
          </div>

          {/* Quick notification alerts in sidebar */}
          <div className="pt-6 border-t border-gray-100 space-y-3" id="sidebar-notif-box">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider px-3" id="notif-header">
              <Bell className="w-3.5 h-3.5 text-green-500" />
              <span>Admin Notifications</span>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto px-3" id="notif-feed">
              {notifications.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">No incoming requests today.</p>
              ) : (
                notifications.map((msg, idx) => (
                  <p key={idx} className="text-[10px] text-gray-500 leading-tight border-b border-gray-50 pb-1.5">{msg}</p>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 text-center" id="sidebar-footer">
            <button 
              onClick={onClose}
              className="text-xs font-semibold text-green-600 hover:underline cursor-pointer"
              id="btn-sidebar-close"
            >
              ← Back to Portal Homepage
            </button>
          </div>
        </aside>

        {/* Dashboard Content Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" id="admin-workspace">
          
          {loadingData ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-2 text-green-600" id="workspace-loading">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-semibold">Syncing secure database records...</p>
            </div>
          ) : dataError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-xl mx-auto space-y-4" id="workspace-error">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-lg font-black">Database Connection Lost</h2>
              <p className="text-sm leading-relaxed">{dataError}</p>
              <button 
                onClick={() => fetchAllData(token)}
                className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-red-700 transition"
              >
                Retry Handshake
              </button>
            </div>
          ) : (
            <>
              {/* Global Date Filter UI */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" id="global-date-filter">
                <div className="bg-green-50 p-1 rounded-full flex gap-1 items-center flex-wrap">
                  {(['ALL', 'TODAY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setGlobalDateFilter(filter)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-colors cursor-pointer ${
                        globalDateFilter === filter 
                          ? 'bg-[#0f8e49] text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-green-100'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                {globalDateFilter === 'CUSTOM' && (
                  <div className="flex gap-2 items-center bg-white border border-green-100 p-1 rounded-xl shadow-xs">
                    <input 
                      type="date" 
                      value={customDateStart}
                      onChange={(e) => setCustomDateStart(e.target.value)}
                      className="text-xs p-1.5 border-none outline-none bg-transparent text-gray-700" 
                    />
                    <span className="text-gray-400 text-xs">-</span>
                    <input 
                      type="date" 
                      value={customDateEnd}
                      onChange={(e) => setCustomDateEnd(e.target.value)}
                      className="text-xs p-1.5 border-none outline-none bg-transparent text-gray-700" 
                    />
                  </div>
                )}
              </div>

              {/* TAB 1: OVERVIEW METRICS */}
              {activeTab === 'overview' && (
                <div className="space-y-8" id="tab-overview-content">
                  
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-banner">
                    
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 shadow-xs" id="stat-card-total">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Applications</p>
                      <p className="text-3xl font-black text-gray-900 mt-2">{totalApps}</p>
                      <div className="text-[10px] text-gray-400 font-semibold mt-1">Soft-preserved on disk</div>
                    </div>

                    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 shadow-xs" id="stat-card-pending">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Verification</p>
                      <p className="text-3xl font-black text-amber-500 mt-2">{pendingApps}</p>
                      <div className="text-[10px] text-amber-500 bg-amber-50 rounded px-1.5 py-0.5 inline-block font-bold mt-1">Requires Action</div>
                    </div>

                    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 shadow-xs" id="stat-card-approved">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Approved Applications</p>
                      <p className="text-3xl font-black text-green-600 mt-2">{approvedApps}</p>
                      <div className="text-[10px] text-green-600 bg-green-50 rounded px-1.5 py-0.5 inline-block font-bold mt-1">Approval Ratio: {totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(0) : 0}%</div>
                    </div>

                    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 shadow-xs" id="stat-card-revenue">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Settled</p>
                      <p className="text-3xl font-black text-green-600 mt-2">${totalRevenue.toFixed(2)}</p>
                      <div className="text-[10px] text-gray-400 font-semibold mt-1">Today: {todayApps} incoming</div>
                    </div>

                  </div>

                  {/* Dynamic Recharts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts-row">
                    
                    {/* Bar Chart: Applicants per US State */}
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-xs lg:col-span-2" id="chart-card-states">
                      <h3 className="font-extrabold text-gray-900 text-sm mb-4">Applicants Demographics (US States)</h3>
                      {barChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-xs text-gray-400 italic">No spatial metrics available yet.</div>
                      ) : (
                        <div className="h-64" id="states-rechart-container">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="state" />
                              <YAxis allowDecimals={false} />
                              <Tooltip cursor={{ fill: '#F9FAFB' }} />
                              <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} name="Applications Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Pie Chart: Status distributions */}
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-xs" id="chart-card-status">
                      <h3 className="font-extrabold text-gray-900 text-sm mb-4">Application Processing Status Breakdown</h3>
                      {pieChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-xs text-gray-400 italic">No status distribution yet.</div>
                      ) : (
                        <div className="h-64 flex flex-col justify-between" id="status-rechart-container">
                          <div className="flex-1 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieChartData}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          {/* Legends */}
                          <div className="flex justify-around text-xs font-semibold text-gray-500 mt-2" id="pie-legends">
                            {pieChartData.map(entry => (
                              <div key={entry.name} className="flex items-center space-x-1">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span>{entry.name}: {entry.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Audit Logs Preview */}
                  <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-xs" id="audit-preview-card">
                    <div className="flex justify-between items-center mb-4" id="audit-preview-header">
                      <h3 className="font-extrabold text-gray-900 text-sm">Recent Audit Activities</h3>
                      <button 
                        onClick={() => setActiveTab('audit')} 
                        className="text-xs font-bold text-green-600 hover:underline cursor-pointer"
                      >
                        View Full Logs
                      </button>
                    </div>
                    <div className="space-y-3" id="audit-preview-rows">
                      {auditLogs.slice(0, 4).map((log) => (
                        <div key={log.id} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2 last:border-0" id={`audit-row-${log.id}`}>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-800">{log.action} - <span className="text-gray-400">{log.details}</span></p>
                            <p className="text-[10px] text-gray-400">By {log.username} ({log.role}) | IP: {log.ip}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono shrink-0">{log.timestamp.replace('T', ' ').slice(0, 19)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: APPLICATIONS LIST & MANAGEMENT */}
              {activeTab === 'applications' && (
                <div className="space-y-6" id="tab-applications-content">
                  
                  {/* Title & Exports Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4" id="apps-list-header">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900" id="apps-list-title">Applicant Registries</h2>
                      <p className="text-xs text-gray-400 mt-1">Review, authorize, soft-delete, or export submitted application portfolios.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold" id="apps-export-actions">
                      <button 
                        onClick={exportAppCSV} 
                        className="bg-white border border-gray-200 text-gray-700 hover:text-green-600 hover:border-green-200 px-3 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                        id="btn-export-apps-csv"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="bg-white border border-gray-200 text-gray-700 hover:text-green-600 hover:border-green-200 px-3 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                        id="btn-print-apps"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print view</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters / Searches toolbar */}
                  <div className="bg-white border border-gray-200/50 rounded-xl p-4 flex flex-col md:flex-row gap-4" id="apps-filters-toolbar">
                    <div className="flex-1 relative" id="filter-search-container">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-[50%] -translate-y-[50%]" />
                      <input 
                        type="text"
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Search by name, email, phone, ID, city, state..."
                        id="input-search-apps"
                      />
                    </div>
                    <div className="flex gap-2 shrink-0" id="filter-dropdowns">
                      <select
                        value={appStatusFilter}
                        onChange={(e) => setAppStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        id="select-filter-status"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <select
                        value={appPaymentFilter}
                        onChange={(e) => setAppPaymentFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                        id="select-filter-payment"
                      >
                        <option value="">All Payments</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Applications Grid Table */}
                  <div className="bg-white border border-gray-200/50 rounded-2xl overflow-hidden shadow-xs" id="apps-table-container">
                    {filteredApps.length === 0 ? (
                      <div className="p-12 text-center text-sm text-gray-400 italic">No applicant records match current search queries.</div>
                    ) : (
                      <div className="overflow-x-auto" id="apps-table-scrollable">
                        <table className="w-full text-left border-collapse" id="apps-data-table">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider" id="table-head-row">
                              <th className="p-4">Reference ID</th>
                              <th className="p-4">Applicant Name</th>
                              <th className="p-4">City/State</th>
                              <th className="p-4">Monthly Income</th>
                              <th className="p-4">Payment</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Submitted Date</th>
                              <th className="p-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-xs text-gray-600" id="table-body">
                            {filteredApps.map((app) => (
                              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors" id={`table-row-${app.id}`}>
                                <td className="p-4 font-mono font-bold text-gray-900">{app.id}</td>
                                <td className="p-4">
                                  <div className="font-semibold text-gray-800" id={`name-${app.id}`}>{app.personalInfo.firstName} {app.personalInfo.lastName}</div>
                                  <div className="text-[10px] text-gray-400">{app.personalInfo.email}</div>
                                </td>
                                <td className="p-4">{app.currentAddress.city}, {app.currentAddress.state}</td>
                                <td className="p-4 font-semibold text-gray-800">${Number(app.employment.monthlyIncome).toLocaleString()}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    app.payment.paymentStatus === 'Paid' 
                                      ? 'bg-green-50 text-green-700' 
                                      : app.payment.paymentStatus === 'Refunded' 
                                        ? 'bg-red-50 text-red-600' 
                                        : 'bg-amber-50 text-amber-600'
                                  }`} id={`paybadge-${app.id}`}>
                                    {app.payment.paymentStatus}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    app.status === 'Approved' 
                                      ? 'bg-green-100 text-green-800' 
                                      : app.status === 'Rejected' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-amber-100 text-amber-800'
                                  }`} id={`statusbadge-${app.id}`}>
                                    {app.status}
                                  </span>
                                </td>
                                <td className="p-4 text-[11px] text-gray-400">{app.createdAt.replace('T', ' ').slice(0,16)}</td>
                                <td className="p-4" id={`actions-${app.id}`}>
                                  <div className="flex justify-center items-center gap-1" id={`btn-group-${app.id}`}>
                                    <button 
                                      onClick={() => setSelectedApp(app)}
                                      className="p-1.5 text-gray-400 hover:text-green-600 bg-gray-50 border rounded-lg transition cursor-pointer"
                                      title="View Portfolio"
                                      id={`btn-view-${app.id}`}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    {app.status === 'Pending' && (
                                      <>
                                        <button 
                                          onClick={() => handleUpdateStatus(app.id, 'Approved')}
                                          disabled={currentUser?.role === 'Read Only'}
                                          className="p-1.5 text-gray-400 hover:text-green-600 bg-gray-50 border rounded-lg transition cursor-pointer disabled:opacity-40"
                                          title="Approve Applicant"
                                          id={`btn-approve-${app.id}`}
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                                          disabled={currentUser?.role === 'Read Only'}
                                          className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 border rounded-lg transition cursor-pointer disabled:opacity-40"
                                          title="Reject Applicant"
                                          id={`btn-reject-${app.id}`}
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    <button 
                                      onClick={() => handleUpdateStatus(app.id, 'Archived')}
                                      disabled={currentUser?.role === 'Read Only'}
                                      className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 border rounded-lg transition cursor-pointer disabled:opacity-40"
                                      title="Archive (Soft Delete)"
                                      id={`btn-archive-${app.id}`}
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Application Detail Sliding Modal / Card view */}
                  {selectedApp && (
                    <div className="bg-white border-2 border-green-600/30 rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn" id="app-detail-card">
                      <div className="flex justify-between items-start border-b border-gray-100 pb-4" id="details-header">
                        <div>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Applicant Portfolio Info</span>
                          <h3 className="text-xl font-black text-gray-900 mt-2 font-mono flex items-center gap-2" id="detail-ref">
                            {selectedApp.id} 
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              selectedApp.status === 'Approved' 
                                ? 'bg-green-100 text-green-800' 
                                : selectedApp.status === 'Rejected' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-amber-100 text-amber-800'
                            }`} id="detail-status-badge">{selectedApp.status}</span>
                          </h3>
                        </div>
                        <button 
                          onClick={() => setSelectedApp(null)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer"
                          id="btn-close-details"
                        >
                          Close Portfolio
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm" id="detail-sections-grid">
                        
                        {/* 1. Personal & Contact info */}
                        <div className="space-y-3" id="detail-personal-sec">
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-gray-400">Personal & Contact</h4>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200/50" id="detail-personal-box">
                            <p className="font-semibold text-gray-800">First Name: <span className="font-normal text-gray-600 ml-1">{selectedApp.personalInfo.firstName}</span></p>
                            <p className="font-semibold text-gray-800">Last Name: <span className="font-normal text-gray-600 ml-1">{selectedApp.personalInfo.lastName}</span></p>
                            <p className="font-semibold text-gray-800">Email: <span className="font-normal text-gray-600 ml-1">{selectedApp.personalInfo.email}</span></p>
                            <p className="font-semibold text-gray-800">Phone: <span className="font-normal text-gray-600 ml-1">{selectedApp.personalInfo.phone}</span></p>
                            <p className="font-semibold text-gray-800">Date of Birth: <span className="font-normal text-gray-600 ml-1">{selectedApp.personalInfo.dob}</span></p>
                            {selectedApp.personalInfo.ssn && (
                              <p className="font-semibold text-gray-800">SSN: <span className="font-normal text-gray-600 ml-1">{selectedApp.personalInfo.ssn}</span></p>
                            )}
                          </div>
                        </div>

                        {/* 2. Addresses info */}
                        <div className="space-y-3" id="detail-address-sec">
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-gray-400">Current Residence Address</h4>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200/50" id="detail-address-box">
                            <p className="font-semibold text-gray-800">Street Address: <span className="font-normal text-gray-600 ml-1">{selectedApp.currentAddress.street}</span></p>
                            {selectedApp.currentAddress.apartment && (
                              <p className="font-semibold text-gray-800">Apartment/Suite: <span className="font-normal text-gray-600 ml-1">{selectedApp.currentAddress.apartment}</span></p>
                            )}
                            <p className="font-semibold text-gray-800">City: <span className="font-normal text-gray-600 ml-1">{selectedApp.currentAddress.city}</span></p>
                            <p className="font-semibold text-gray-800">State: <span className="font-normal text-gray-600 ml-1">{selectedApp.currentAddress.state}</span></p>
                            <p className="font-semibold text-gray-800">ZIP Code: <span className="font-normal text-gray-600 ml-1">{selectedApp.currentAddress.zip}</span></p>
                            <p className="font-semibold text-gray-800">Country: <span className="font-normal text-gray-600 ml-1">{selectedApp.currentAddress.country}</span></p>
                          </div>
                        </div>

                        {/* 3. Occupational info */}
                        <div className="space-y-3" id="detail-employment-sec">
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-gray-400">Employment Details</h4>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200/50" id="detail-employment-box">
                            <p className="font-semibold text-gray-800">Status: <span className="font-normal text-gray-600 ml-1">{selectedApp.employment.status}</span></p>
                            <p className="font-semibold text-gray-800">Monthly Income: <span className="font-normal text-gray-600 ml-1">${Number(selectedApp.employment.monthlyIncome).toLocaleString()} USD</span></p>
                            {selectedApp.employment.status !== 'Unemployed' && selectedApp.employment.status !== 'Retired' && selectedApp.employment.status !== 'Student' && (
                              <>
                                <p className="font-semibold text-gray-800">Employer Name: <span className="font-normal text-gray-600 ml-1">{selectedApp.employment.employerName}</span></p>
                                <p className="font-semibold text-gray-800">Employer Phone: <span className="font-normal text-gray-600 ml-1">{selectedApp.employment.employerPhone}</span></p>
                                <p className="font-semibold text-gray-800">Occupation: <span className="font-normal text-gray-600 ml-1">{selectedApp.employment.occupation}</span></p>
                                <p className="font-semibold text-gray-800">Length: <span className="font-normal text-gray-600 ml-1">{selectedApp.employment.length}</span></p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 4. Emergency Contact info */}
                        <div className="space-y-3" id="detail-emergency-sec">
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-gray-400">Emergency Contact Contact</h4>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200/50" id="detail-emergency-box">
                            <p className="font-semibold text-gray-800">Full Name: <span className="font-normal text-gray-600 ml-1">{selectedApp.emergencyContact.name}</span></p>
                            <p className="font-semibold text-gray-800">Relationship: <span className="font-normal text-gray-600 ml-1">{selectedApp.emergencyContact.relationship}</span></p>
                            <p className="font-semibold text-gray-800">Phone Number: <span className="font-normal text-gray-600 ml-1">{selectedApp.emergencyContact.phone}</span></p>
                            {selectedApp.emergencyContact.email && (
                              <p className="font-semibold text-gray-800">Email Address: <span className="font-normal text-gray-600 ml-1">{selectedApp.emergencyContact.email}</span></p>
                            )}
                          </div>
                        </div>

                        {/* 5. Documents details & Payment */}
                        <div className="space-y-3" id="detail-id-sec">
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-gray-400">Government ID & Receipts</h4>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200/50" id="detail-id-box">
                            <p className="font-semibold text-gray-800">ID Type: <span className="font-normal text-gray-600 ml-1">{selectedApp.identity.idType}</span></p>
                            <div className="flex items-center space-x-3 bg-white p-2 border rounded-lg" id="detail-file-download-box">
                              <FileText className="w-6 h-6 text-green-600 shrink-0" />
                              <div className="flex-1 truncate">
                                <p className="font-bold text-xs truncate">{selectedApp.identity.fileName}</p>
                                <p className="text-[10px] text-gray-400">{selectedApp.identity.fileSize}</p>
                              </div>
                              <a 
                                href={selectedApp.identity.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs text-green-600 hover:underline font-bold shrink-0 cursor-pointer"
                              >
                                View File
                              </a>
                            </div>

                            <p className="font-semibold text-gray-800 mt-2">Payment Details:</p>
                            <div className="text-xs space-y-1 text-gray-500" id="detail-payment-lines">
                              <p>Transaction: <span className="font-mono text-gray-700">{selectedApp.payment.transactionId}</span></p>
                              <p>Amount Paid: <span className="text-gray-700 font-bold">${selectedApp.payment.amount.toFixed(2)} USD</span></p>
                              <p>Payment Method: <span className="text-[#1B7E43] font-extrabold">{selectedApp.payment.paymentMethod || 'Debit / Credit Card'}</span></p>
                              
                              {selectedApp.payment.paymentMethod && selectedApp.payment.paymentMethod !== 'Card' ? (
                                <div className="mt-1 mb-2 space-y-1 bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-slate-800">
                                  {selectedApp.payment.paymentMethod === 'Cash App' && (
                                    <p className="font-bold text-xs">Cash App $Cashtag: <span className="font-mono text-[#1B7E43] bg-emerald-100 px-1.5 py-0.5 rounded ml-1 font-black">{selectedApp.payment.cashAppTag}</span></p>
                                  )}
                                  {selectedApp.payment.paymentMethod === 'Venmo' && (
                                    <p className="font-bold text-xs">Venmo @Username: <span className="font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded ml-1 font-black">{selectedApp.payment.venmoUsername}</span></p>
                                  )}
                                  {selectedApp.payment.paymentMethod === 'Zelle' && (
                                    <p className="font-bold text-xs">Zelle Phone/Email: <span className="font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded ml-1 font-black">{selectedApp.payment.zelleEmailPhone}</span></p>
                                  )}
                                  {selectedApp.payment.paymentMethod === 'PayPal' && (
                                    <p className="font-bold text-xs">PayPal Email: <span className="font-mono text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded ml-1 font-black">{selectedApp.payment.payPalEmail}</span></p>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <p>Cardholder: <span className="text-gray-700 font-semibold">{selectedApp.payment.cardholderName}</span></p>
                                  <p>Card Type: <span className="text-gray-700 font-semibold">{selectedApp.payment.cardType || 'Credit Card'}</span></p>
                                  <p>Card Brand: <span className="text-gray-700 font-semibold">{selectedApp.payment.cardBrand || 'Visa'}</span></p>
                                  <p>Card Number: <span className="text-gray-905 font-mono font-bold tracking-wider">{selectedApp.payment.cardNumber}</span></p>
                                  <p>Expiry Date: <span className="text-gray-700 font-mono font-semibold">{selectedApp.payment.expiry || 'MM/YY'}</span></p>
                                  <p>CVV Code: <span className="text-gray-700 font-mono font-semibold bg-gray-100 px-1 py-0.5 rounded border">{selectedApp.payment.cvv || '***'}</span></p>
                                </>
                              )}
                              <p>Payment Status: <span className="font-bold text-green-600">{selectedApp.payment.paymentStatus}</span></p>
                              {selectedApp.payment.refundStatus !== 'None' && (
                                <p>Refund status: <span className="font-bold text-red-600">{selectedApp.payment.refundStatus}</span></p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 6. Verification Operations box */}
                        <div className="space-y-3 flex flex-col justify-between" id="detail-operations-sec">
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-gray-400 font-sans">Processing Controls</h4>
                          <div className="bg-green-50/20 border border-green-600/10 rounded-xl p-5 space-y-4 flex-1 flex flex-col justify-center" id="detail-operations-box">
                            <p className="text-xs text-gray-500 font-normal leading-relaxed mb-2">Adjust applicant status below. Setting the status will update records securely and trigger auto-notifications.</p>
                            
                            <div className="grid grid-cols-2 gap-3" id="operations-action-grid">
                              <button
                                onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                                disabled={selectedApp.status === 'Approved' || currentUser?.role === 'Read Only'}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer disabled:opacity-40"
                                id="btn-details-approve"
                              >
                                Approve Applicant
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                                disabled={selectedApp.status === 'Rejected' || currentUser?.role === 'Read Only'}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer disabled:opacity-40"
                                id="btn-details-reject"
                              >
                                Reject Applicant
                              </button>
                            </div>

                            {selectedApp.payment.paymentStatus === 'Paid' && selectedApp.payment.refundStatus === 'None' && (
                              <button
                                onClick={() => handleProcessRefund(selectedApp.id)}
                                disabled={currentUser?.role === 'Read Only'}
                                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-xl text-xs transition mt-2 cursor-pointer disabled:opacity-40"
                                id="btn-details-refund"
                              >
                                Refund Processing Fee ($1.00)
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: PAYMENTS LOGS */}
              {activeTab === 'payments' && (
                <div className="space-y-6" id="tab-payments-content">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4" id="payments-header">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900" id="payments-title">Payments Records</h2>
                      <p className="text-xs text-gray-400 mt-1">Audit log of processing fee transactions, card settlements, and active refunds.</p>
                    </div>
                    <button 
                      onClick={exportPaymentsCSV}
                      className="bg-white border border-gray-200 text-gray-700 hover:text-green-600 hover:border-green-200 px-3 py-2 rounded-lg transition flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
                      id="btn-export-payments-csv"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Payments CSV</span>
                    </button>
                  </div>

                  {/* Search Payments */}
                  <div className="bg-white border border-gray-200/50 rounded-xl p-4 flex gap-4" id="payments-search-row">
                    <div className="flex-1 relative" id="search-pay-wrapper">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-[50%] -translate-y-[50%]" />
                      <input 
                        type="text"
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Search by ID, cardholder, transaction, or status..."
                        id="input-search-payments"
                      />
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="bg-white border border-gray-200/50 rounded-2xl overflow-hidden shadow-xs" id="payments-table-container">
                    {filteredPayments.length === 0 ? (
                      <div className="p-12 text-center text-sm text-gray-400 italic">No payment logs match current query.</div>
                    ) : (
                      <div className="overflow-x-auto" id="payments-table-scroll">
                        <table className="w-full text-left border-collapse" id="payments-table">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider" id="pay-thead-row">
                              <th className="p-4">App Ref</th>
                              <th className="p-4">Cardholder / Type</th>
                              <th className="p-4">Card Number / Exp / CVV</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4">Transaction ID</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Refund</th>
                              <th className="p-4">Settled Date</th>
                              <th className="p-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-xs text-gray-600" id="pay-tbody">
                            {filteredPayments.map((app) => (
                              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors" id={`pay-row-${app.id}`}>
                                <td className="p-4 font-mono font-bold text-gray-900">{app.id}</td>
                                <td className="p-4">
                                  <div className="font-semibold text-gray-800">{app.payment.cardholderName}</div>
                                  <div className="text-[10px] text-gray-400 font-medium">
                                    {app.payment.cardType || 'Credit Card'} ({app.payment.cardBrand || 'Visa'})
                                  </div>
                                </td>
                                <td className="p-4 font-mono">
                                  <div className="font-bold text-gray-900 tracking-wider text-[11px]">{app.payment.cardNumber}</div>
                                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                                    Exp: {app.payment.expiry || 'MM/YY'} | CVV: {app.payment.cvv || '***'}
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-gray-900">${app.payment.amount.toFixed(2)}</td>
                                <td className="p-4 font-mono text-gray-500">{app.payment.transactionId}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    app.payment.paymentStatus === 'Paid' 
                                      ? 'bg-green-50 text-green-700' 
                                      : 'bg-red-50 text-red-600'
                                  }`} id={`paystat-${app.id}`}>
                                    {app.payment.paymentStatus}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    app.payment.refundStatus === 'Refunded' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-50 text-gray-400'
                                  }`} id={`refstat-${app.id}`}>
                                    {app.payment.refundStatus}
                                  </span>
                                </td>
                                <td className="p-4 text-[11px] text-gray-400">{app.payment.timestamp.replace('T', ' ').slice(0,16)}</td>
                                <td className="p-4 text-center" id={`payaction-${app.id}`}>
                                  {app.payment.paymentStatus === 'Paid' && app.payment.refundStatus === 'None' ? (
                                    <button
                                      onClick={() => handleProcessRefund(app.id)}
                                      disabled={currentUser?.role === 'Read Only'}
                                      className="text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded px-2 py-1 transition cursor-pointer disabled:opacity-40"
                                      id={`btn-refund-${app.id}`}
                                    >
                                      Refund
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-gray-300">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 4: CONTENT MANAGER */}
              {activeTab === 'content' && editSettings && (
                <div className="space-y-6" id="tab-content-manager">
                  
                  <div className="border-b border-gray-200 pb-4" id="content-header">
                    <h2 className="text-xl font-extrabold text-gray-900" id="content-title">Portal Content Manager</h2>
                    <p className="text-xs text-gray-400 mt-1">Directly edit landing pages details, SMS/email templates, and fees without redeployment.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-8" id="content-settings-form">
                    
                    {/* Landing Page layout block */}
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 space-y-4" id="block-landing-text">
                      <h3 className="font-extrabold text-sm text-green-600 border-b pb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Landing Page Settings</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="landing-inputs-grid">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Logo Badge Text</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.logo}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, logo: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Browser Page Title</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.title}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, title: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-semibold text-gray-500">Hero Big Heading</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.heroHeading}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, heroHeading: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-semibold text-gray-500">Hero Small Text Description</label>
                          <textarea 
                            rows={2}
                            value={editSettings.landingPage.heroSubheading}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, heroSubheading: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Apply Button Text</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.applyButtonText}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, applyButtonText: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Application Processing Fee ($USD)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editSettings.applicationFee}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              applicationFee: Number(e.target.value)
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer text settings block */}
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 space-y-4" id="block-footer">
                      <h3 className="font-extrabold text-sm text-green-600 border-b pb-2">Footer Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="footer-inputs-grid">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Privacy Policy Label</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.footerPrivacy}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, footerPrivacy: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Terms of Service Label</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.footerTerms}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, footerTerms: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Contact Label</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.footerContact}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, footerContact: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Copyright Banner Text</label>
                          <input 
                            type="text"
                            value={editSettings.landingPage.footerCopyright}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              landingPage: { ...editSettings.landingPage, footerCopyright: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email templates editor block */}
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 space-y-4" id="block-email-templates">
                      <h3 className="font-extrabold text-sm text-green-600 border-b pb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Notifications Templates</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="email-templates-inputs">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Submitted Email Body</label>
                          <textarea 
                            rows={4}
                            value={editSettings.emailTemplates.submitted}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              emailTemplates: { ...editSettings.emailTemplates, submitted: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Approved Email Body</label>
                          <textarea 
                            rows={4}
                            value={editSettings.emailTemplates.approved}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              emailTemplates: { ...editSettings.emailTemplates, approved: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Rejected Email Body</label>
                          <textarea 
                            rows={4}
                            value={editSettings.emailTemplates.rejected}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              emailTemplates: { ...editSettings.emailTemplates, rejected: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Receipt Email Body</label>
                          <textarea 
                            rows={4}
                            value={editSettings.emailTemplates.paymentReceived}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              emailTemplates: { ...editSettings.emailTemplates, paymentReceived: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SMS template block */}
                    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 space-y-4" id="block-sms-templates">
                      <h3 className="font-extrabold text-sm text-green-600 border-b pb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>SMS Notification Templates</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="sms-templates-inputs">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Submission SMS Text</label>
                          <textarea 
                            rows={3}
                            value={editSettings.smsTemplates.submitted}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              smsTemplates: { ...editSettings.smsTemplates, submitted: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Status Update SMS Text</label>
                          <textarea 
                            rows={3}
                            value={editSettings.smsTemplates.statusChanged}
                            onChange={(e) => setEditSettings({
                              ...editSettings,
                              smsTemplates: { ...editSettings.smsTemplates, statusChanged: e.target.value }
                            })}
                            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 text-right" id="content-save-row">
                      <button
                        type="submit"
                        disabled={savingSettings || currentUser?.role !== 'Admin'}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold px-8 py-3.5 rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-40"
                        id="btn-save-content"
                      >
                        {savingSettings ? 'Writing modifications to disk...' : 'Save Settings & Update Portal'}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* EXPORT CODE */}
              {activeTab === 'export_code' && (
                <div className="space-y-6" id="panel-export-code">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Code className="w-6 h-6 text-emerald-600" />
                        Source Code Export
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        View and export the full application source code.
                      </p>
                    </div>
                    {sourceCodeFiles.length > 0 && (
                      <button
                        onClick={() => {
                          // Simple mechanism to export all as a big JSON file for easy download
                          const jsonStr = JSON.stringify(sourceCodeFiles, null, 2);
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'full_application_code.json';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
                      >
                        <Download className="w-4 h-4" />
                        Export All (JSON)
                      </button>
                    )}
                  </div>
                  
                  {loadingSourceCode ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium">Extracting workspace source files...</p>
                    </div>
                  ) : sourceCodeFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                      No files loaded.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sourceCodeFiles.map((file, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <h3 className="font-mono text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              {file.path}
                            </h3>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(file.content);
                                setCopiedPath(file.path);
                                setTimeout(() => setCopiedPath(null), 2000);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                copiedPath === file.path ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {copiedPath === file.path ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedPath === file.path ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="p-4 bg-slate-900 overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                            <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
                              <code>{file.content}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: AUDIT HISTORY LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-6" id="tab-audit-history">
                  
                  <div className="border-b border-gray-200 pb-4" id="audit-header">
                    <h2 className="text-xl font-extrabold text-gray-900" id="audit-title">Audit Log Trail</h2>
                    <p className="text-xs text-gray-400 mt-1">Immutable track history of operations, log events, administrative actions, and IP coordinates.</p>
                  </div>

                  <div className="bg-white border border-gray-200/50 rounded-2xl overflow-hidden shadow-xs" id="audit-logs-table-container">
                    <div className="overflow-x-auto" id="audit-logs-scrollable">
                      <table className="w-full text-left border-collapse" id="audit-table">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Operation User</th>
                            <th className="p-4">Authorization role</th>
                            <th className="p-4">Logged Event</th>
                            <th className="p-4">Operation description Details</th>
                            <th className="p-4">Client IP Address</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs text-gray-600" id="audit-tbody">
                          {auditLogs.filter(log => isWithinDateFilter(log.timestamp)).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors" id={`audit-row-${log.id}`}>
                              <td className="p-4 font-mono text-gray-400">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                              <td className="p-4 font-semibold text-gray-800">{log.username}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.role === 'Admin' 
                                    ? 'bg-red-50 text-red-700 border border-red-100' 
                                    : log.role === 'Staff' 
                                      ? 'bg-green-50 text-green-700' 
                                      : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {log.role}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-gray-900">{log.action}</td>
                              <td className="p-4 font-medium text-gray-500">{log.details}</td>
                              <td className="p-4 font-mono text-gray-400">{log.ip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 6: MANAGE USERS */}
              {activeTab === 'users' && currentUser?.role === 'Admin' && (
                <div className="space-y-6" id="tab-manage-users">
                  
                  <div className="border-b border-gray-200 pb-4" id="users-header">
                    <h2 className="text-xl font-extrabold text-gray-900" id="users-title">Portal Authorization Roles</h2>
                    <p className="text-xs text-gray-400 mt-1">Configure user accounts and manage access permissions (Admin, Staff, or Read Only).</p>
                  </div>

                  <div className="bg-white border border-gray-200/50 rounded-2xl overflow-hidden shadow-xs" id="users-table-container">
                    <table className="w-full text-left border-collapse" id="users-table">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-4">UserID</th>
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Login Username</th>
                          <th className="p-4">Authorization Role</th>
                          <th className="p-4 text-center">Change Permissions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs text-gray-600" id="users-tbody">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors" id={`user-row-${user.id}`}>
                            <td className="p-4 font-mono text-gray-400">{user.id}</td>
                            <td className="p-4 font-semibold text-gray-800">{user.name}</td>
                            <td className="p-4 font-mono">{user.username}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                user.role === 'Admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : user.role === 'Staff' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-center" id={`user-select-${user.id}`}>
                              {user.id === currentUser.id ? (
                                <span className="text-[10px] text-gray-400 italic">Self Account</span>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleChangeRole(user.id, e.target.value as any)}
                                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
                                  id={`select-role-${user.id}`}
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Staff">Staff</option>
                                  <option value="Read Only">Read Only</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start space-x-3 text-xs text-yellow-800" id="users-security-banner">
                    <Info className="w-5 h-5 text-yellow-600 shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wider">Role Permissions Hierarchy Info</p>
                      <ul className="list-disc pl-4 mt-2 space-y-1 font-medium leading-relaxed">
                        <li><span className="font-bold">Admin:</span> Full database privileges. Able to adjust staff roles, manage content, modify validation schemas, override statuses, and issue transactions refunds.</li>
                        <li><span className="font-bold">Staff:</span> Operational permissions. Can view full application portfolios, approve or reject applicants, and view audit history. Cannot modify system configurations or staff roles.</li>
                        <li><span className="font-bold">Read Only:</span> Inspection credentials. Can view applications, metrics, and audit history logs for verification auditing. Forbidden from editing or taking status/refund actions.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 7: SUPPORT CHATS */}
              {activeTab === 'chat' && (
                <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]" id="tab-support-chat">
                  
                  <div className="border-b border-gray-200 pb-4 shrink-0" id="chat-tab-header">
                    <h2 className="text-xl font-extrabold text-gray-900" id="chat-tab-title">Support Conversation Center</h2>
                    <p className="text-xs text-gray-400 mt-1">Communicate with active applicants and answer inquiries instantly.</p>
                  </div>

                  <div className="flex-1 flex bg-white border border-gray-200/50 rounded-2xl overflow-hidden shadow-xs min-h-[450px]" id="chat-center-container">
                    
                    {/* Left Panel: Conversation Sessions */}
                    <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30" id="chat-sessions-pane">
                      <div className="p-4 border-b border-gray-100 bg-white" id="sessions-search-header">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Channels</p>
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y divide-gray-50" id="sessions-list-container">
                        {(() => {
                          const filteredChatSessions = chatSessions.filter(session => isWithinDateFilter(session.lastTimestamp));
                          if (filteredChatSessions.length === 0) {
                            return (
                              <div className="p-8 text-center" id="chat-sessions-empty">
                                <p className="text-xs text-gray-400 italic">No incoming client chats yet.</p>
                              </div>
                            );
                          }
                          return filteredChatSessions.map((session) => {
                            const isSelected = selectedChatId === session.chatId;
                            const initials = (session.clientName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                              <button
                                key={session.chatId}
                                onClick={() => {
                                  setSelectedChatId(session.chatId);
                                  fetchChatMessages(session.chatId);
                                }}
                                className={`w-full text-left p-4 flex items-start space-x-3 transition-colors ${
                                  isSelected ? 'bg-green-50/80 border-l-4 border-green-500 font-bold' : 'hover:bg-gray-50 bg-white'
                                }`}
                                id={`session-card-${session.chatId}`}
                              >
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                                  {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline mb-0.5">
                                    <p className="text-xs font-bold text-gray-900 truncate">{session.clientName || 'Anonymous'}</p>
                                    <span className="text-[9px] text-gray-400 font-medium shrink-0">
                                      {new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-semibold truncate mb-1">{session.clientEmail || 'No email'}</p>
                                  <p className="text-xs text-gray-500 truncate font-medium">{session.lastMessage}</p>
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Right Panel: Messages View */}
                    <div className="flex-1 flex flex-col bg-white" id="chat-messages-pane">
                      {!selectedChatId ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3" id="chat-pane-empty">
                          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center" id="empty-chat-ico">
                            <MessageSquare className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-sm">No Channel Selected</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-xs">Select any incoming message channel on the left to start typing your reply.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Channel Header */}
                          {(() => {
                            const activeSession = chatSessions.find(s => s.chatId === selectedChatId);
                            return (
                              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50" id="pane-header">
                                <div>
                                  <h3 className="font-bold text-sm text-gray-900">{activeSession?.clientName || 'Support Session'}</h3>
                                  <p className="text-[10px] text-gray-400 font-semibold">{activeSession?.clientEmail || 'Support Client Channel'}</p>
                                </div>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                  Live Connect
                                </span>
                              </div>
                            );
                          })()}

                          {/* Message List */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 flex flex-col" id="pane-messages-list">
                            {chatMessages.map((msg) => {
                              const isClient = msg.sender === 'client';
                              return (
                                <div 
                                  key={msg.id} 
                                  className={`flex flex-col ${isClient ? 'items-start' : 'items-end'}`}
                                  id={`admin-msg-row-${msg.id}`}
                                >
                                  <span className="text-[9px] text-gray-400 font-bold mb-1 px-1">
                                    {isClient ? 'Applicant' : `${currentUser?.name || 'Admin'} (You)`}
                                  </span>
                                  <div 
                                    className={`max-w-[70%] rounded-2xl p-3 text-xs font-semibold leading-relaxed shadow-xs ${
                                      isClient 
                                        ? 'bg-white text-gray-900 border rounded-tl-none' 
                                        : 'bg-green-600 text-white rounded-tr-none'
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                  <span className="text-[8px] text-gray-400 font-medium mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Message Input Footer */}
                          <div className="p-4 border-t border-gray-100" id="pane-input-footer">
                            {currentUser?.role === 'Read Only' ? (
                              <div className="bg-gray-50 border text-gray-500 p-3 rounded-xl text-center text-xs font-semibold">
                                Read Only guest users are forbidden from sending chat replies.
                              </div>
                            ) : (
                              <form onSubmit={handleAdminSendMessage} className="flex space-x-2" id="form-admin-chat-send">
                                <input
                                  type="text"
                                  required
                                  value={adminChatInput}
                                  onChange={(e) => setAdminChatInput(e.target.value)}
                                  placeholder="Type your reply to client..."
                                  className="flex-1 bg-gray-50 text-gray-900 border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all font-semibold"
                                  id="input-admin-reply"
                                />
                                <button
                                  type="submit"
                                  disabled={!adminChatInput.trim()}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                                  id="btn-admin-reply-submit"
                                >
                                  Reply
                                </button>
                              </form>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 8: CONTACT MESSAGES */}
              {activeTab === 'contact_messages' && (
                <div className="space-y-6" id="tab-contact-messages-content">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4" id="contacts-header">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2" id="contacts-title">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span>Client Support Queries</span>
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">Review contact inquiries, filter by ticket status, and reply directly to applicants.</p>
                    </div>
                  </div>

                  {/* Filters & Searches Row */}
                  <div className="bg-white border border-gray-200/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between" id="contacts-filter-row">
                    <div className="relative w-full sm:w-72" id="search-contact-wrapper">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-[50%] -translate-y-[50%]" />
                      <input 
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-semibold"
                        placeholder="Search name, email, subject, or text..."
                        id="input-search-contacts"
                      />
                    </div>
                    
                    {/* Status Tabs/Buttons */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto" id="contact-status-tabs">
                      {(['All', 'Pending', 'Replied', 'Closed'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setContactFilter(st)}
                          className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            contactFilter === st 
                              ? 'bg-white text-green-700 shadow-xs' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Pane Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[450px]" id="contacts-panes">
                    
                    {/* Left Pane: Ticket Cards */}
                    <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1" id="contacts-tickets-list">
                      {(() => {
                        const filtered = contactMessages.filter(msg => {
                          if (!isWithinDateFilter(msg.createdAt)) return false;
                          const matchesSearch = contactSearch.trim() === '' || 
                            msg.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            msg.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            msg.subject.toLowerCase().includes(contactSearch.toLowerCase()) ||
                            msg.message.toLowerCase().includes(contactSearch.toLowerCase());
                          
                          const matchesStatus = contactFilter === 'All' || msg.status === contactFilter;
                          return matchesSearch && matchesStatus;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="p-12 bg-white rounded-2xl border text-center text-xs text-gray-400 font-bold italic">
                              No inquiry tickets match criteria.
                            </div>
                          );
                        }

                        return filtered.map((msg) => {
                          const isSelected = selectedContactId === msg.id;
                          return (
                            <div 
                              key={msg.id}
                              onClick={() => {
                                setSelectedContactId(msg.id);
                                setReplyTextInput(msg.adminReply || '');
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-green-50/50 border-green-500/50 shadow-xs' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                              id={`contact-card-${msg.id}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="space-y-0.5 max-w-[70%]">
                                  <h4 className="font-extrabold text-xs text-gray-900 truncate">{msg.name}</h4>
                                  <p className="text-[10px] text-gray-400 font-semibold truncate">{msg.email}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  msg.status === 'Pending' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : msg.status === 'Replied' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {msg.status}
                                </span>
                              </div>

                              <p className="font-bold text-[11px] text-gray-800 truncate mb-1">{msg.subject}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{msg.message}</p>

                              <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium pt-2 border-t border-slate-50">
                                <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                <span className="font-mono text-[9px]">ID: {msg.id.slice(-6)}</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Right Pane: Ticket Details & Action */}
                    <div className="lg:col-span-7 bg-white border border-gray-200/50 rounded-2xl p-6" id="contacts-detail-pane">
                      {(() => {
                        const activeMsg = contactMessages.find(m => m.id === selectedContactId);
                        if (!activeMsg) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                              <MessageSquare className="w-12 h-12 text-slate-200" />
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm">No Message Selected</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs">Select any incoming client ticket from the list on the left to read details and write replies.</p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-6" id="contacts-detail-active">
                            
                            {/* Contact Header info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                              <div className="space-y-1">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">{activeMsg.name}</h3>
                                <div className="text-xs text-slate-400 font-semibold space-y-0.5">
                                  <p>Email: <span className="text-gray-700 font-bold">{activeMsg.email}</span></p>
                                  {activeMsg.phone && <p>Phone: <span className="text-gray-700 font-bold">{activeMsg.phone}</span></p>}
                                </div>
                              </div>
                              <div className="flex gap-2" id="msg-head-actions">
                                {activeMsg.status !== 'Closed' && (
                                  <button
                                    onClick={() => handleUpdateContactStatus(activeMsg.id, 'Closed')}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                                  >
                                    Mark Closed
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteContactMessage(activeMsg.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Inquiry Metadata */}
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subject Title</p>
                              <p className="font-extrabold text-sm text-gray-900">{activeMsg.subject}</p>
                            </div>

                            {/* Client Message body */}
                            <div className="bg-slate-50 border rounded-2xl p-5 space-y-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Original message inquiry</span>
                              <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">{activeMsg.message}</p>
                              <p className="text-[9px] text-slate-400 text-right">
                                Received {new Date(activeMsg.createdAt).toLocaleDateString()} at {new Date(activeMsg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>

                            {/* Reply Input Box */}
                            <div className="space-y-3 pt-4 border-t" id="contact-reply-form">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Admin Reply Message</label>
                                {activeMsg.adminReply && (
                                  <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                    Status: Replied
                                  </span>
                                )}
                              </div>

                              <textarea 
                                rows={5}
                                value={replyTextInput}
                                onChange={(e) => setReplyTextInput(e.target.value)}
                                placeholder="Write your reply to the applicant here..."
                                className="w-full bg-slate-50 border rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all leading-relaxed"
                                id="textarea-contact-reply"
                              />

                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleSendContactReply(activeMsg.id, replyTextInput)}
                                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                                  id="btn-submit-contact-reply"
                                >
                                  {activeMsg.adminReply ? 'Update Response' : 'Dispatch Response'}
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 9: PROPERTIES MANAGER */}
              {activeTab === 'properties' && (
                <div className="space-y-6" id="tab-properties-content">
                  
                  <div className="border-b border-gray-200 pb-4 flex justify-between items-center" id="props-header">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900" id="props-title">Properties Manager</h2>
                      <p className="text-xs text-gray-400 mt-1">Configure and manage real estate listings, monthly rents, and availability statuses.</p>
                    </div>
                  </div>

                  {/* Add Property Form Card */}
                  <div className="bg-white border border-gray-200/50 rounded-2xl p-6 space-y-4" id="add-property-form-box">
                    <h3 className="font-extrabold text-sm text-green-600 border-b pb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>Register a New Listing Property</span>
                    </h3>

                    <form onSubmit={handleAddProperty} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end" id="form-add-property">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Street Address</label>
                        <input 
                          type="text"
                          required
                          value={newPropAddress}
                          onChange={(e) => setNewPropAddress(e.target.value)}
                          placeholder="e.g. 55 Main Street, Apt 3"
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Property Type</label>
                        <select 
                          value={newPropType}
                          onChange={(e) => setNewPropType(e.target.value)}
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 font-bold"
                        >
                          <option value="Apartment">Apartment</option>
                          <option value="Single Family">Single Family</option>
                          <option value="Townhouse">Townhouse</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monthly Rent ($)</label>
                        <input 
                          type="number"
                          required
                          value={newPropRent}
                          onChange={(e) => setNewPropRent(e.target.value)}
                          placeholder="1500"
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-1.5 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Beds</label>
                        <input 
                          type="number"
                          value={newPropBeds}
                          onChange={(e) => setNewPropBeds(e.target.value)}
                          placeholder="2"
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-1.5 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Baths</label>
                        <input 
                          type="number"
                          step="0.5"
                          value={newPropBaths}
                          onChange={(e) => setNewPropBaths(e.target.value)}
                          placeholder="1.5"
                          className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-green-500 font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <button 
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-750 text-white font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Properties List Table */}
                  <div className="bg-white border border-gray-200/50 rounded-2xl overflow-hidden shadow-xs" id="props-table-container">
                    <table className="w-full text-left border-collapse" id="properties-table">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="p-4">Property ID</th>
                          <th className="p-4">Street Address</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Layout (Beds/Baths)</th>
                          <th className="p-4">Monthly Rent</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs text-gray-600" id="properties-tbody">
                        {properties.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-400">{p.id}</td>
                            <td className="p-4 font-bold text-gray-900">{p.address}</td>
                            <td className="p-4 font-medium">{p.type}</td>
                            <td className="p-4 font-semibold">{p.beds} Bed / {p.baths} Bath</td>
                            <td className="p-4 font-extrabold text-gray-900">${p.rent.toLocaleString()}/mo</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => handleDeleteProperty(p.id)}
                                className="text-red-500 hover:text-red-700 font-semibold text-xs cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 10: PRIVACY POLICY PREVIEW */}
              {activeTab === 'privacy_view' && (
                <div className="space-y-6" id="tab-privacy-view-content">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>Privacy Policy Setup</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Review the live active Privacy Policy terms presented to application portals.</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 max-w-3xl leading-relaxed text-sm text-slate-600 font-semibold">
                    <h3 className="font-extrabold text-gray-900 text-base border-b pb-2">Active Policy Sections</h3>
                    <ul className="space-y-4 list-decimal pl-4 text-xs text-slate-500">
                      <li>We collect personal information such as your name, email address, phone number, and rental application details.</li>
                      <li>Your information is used only for processing rental applications and communicating with you.</li>
                      <li>We do not sell or share your personal information with third parties except when required by law.</li>
                      <li>We take reasonable measures to protect your personal data.</li>
                      <li>Users may request to update or delete their personal information.</li>
                      <li>Our website may use cookies to improve the user experience.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 11: TERMS & CONDITIONS PREVIEW */}
              {activeTab === 'terms_view' && (
                <div className="space-y-6" id="tab-terms-view-content">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-green-600" />
                      <span>Terms & Conditions Setup</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Review the legal terms conditions displayed for all rental applicants.</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 max-w-3xl leading-relaxed text-sm text-slate-600 font-semibold">
                    <h3 className="font-extrabold text-gray-900 text-base border-b pb-2">Active Terms Sections</h3>
                    <ul className="space-y-4 list-decimal pl-4 text-xs text-slate-500">
                      <li>All information provided by applicants must be accurate and truthful.</li>
                      <li>Submitting a rental application does not guarantee approval.</li>
                      <li>The administrator reserves the right to approve or reject any application.</li>
                      <li>Providing false or misleading information may result in rejection or account suspension.</li>
                      <li>Users agree to use the website responsibly and not engage in fraudulent activities.</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

        </main>

      </div>
    </div>
  );
}
