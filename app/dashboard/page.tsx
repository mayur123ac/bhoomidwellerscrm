'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import {
  Users, UserMinus, FileSpreadsheet, BarChart3,
  Settings, Bell, LayoutDashboard, Database, Link2, Download,
  MessageSquare, LogOut, Phone, MessageCircle, Calendar, User, IndianRupee, Save,
  Network, Plus, UserCheck, X, Ticket, ChevronLeft, Send, Mic, Star, Moon, Sun,
  MapPin, Mail, Edit3, CheckCircle2, Clock, Trash2, ClipboardList, Search, Filter,
  ShoppingCart, Package, UserPlus, Video, PhoneOff
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- CUSTOM DATE FORMATTER ---
const getFormattedCurrentDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${day}/${month}/${year}, ${strHours}:${minutes}:${seconds} ${ampm}`;
};

// --- DYNAMIC STATUS BADGE COLORS ---
const getStatusStyles = (status: string, isDarkMode: boolean) => {
  switch (status) {
    case 'RNR': return isDarkMode ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-red-100 text-red-800 border-red-200';
    case 'Interested': return isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Site visit Scheduled': return isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Site Visit Done': return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Proposal Shared': return isDarkMode ? 'bg-pink-900/30 text-pink-400 border-pink-500/30' : 'bg-pink-100 text-pink-800 border-pink-200';
    case 'Negotiation Stage': return isDarkMode ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Partial Payment Received': return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200';
    case 'Proposal Preparation': return isDarkMode ? 'bg-teal-900/30 text-teal-400 border-teal-500/30' : 'bg-teal-100 text-teal-800 border-teal-200';
    default: return isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const CHART_COLORS = ['#8B5CF6', '#10B981', '#FBBF24', '#EF4444', '#EC4899', '#06B6D4', '#3B82F6', '#F97316'];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get('role') || 'employee';
  const name = searchParams.get('name') || 'User';
  const email = searchParams.get('email') || 'user@bhoomidwellers.com';
  const isAdmin = role === 'admin';

  // --- UI & SESSION STATE ---
  const [activeView, setActiveView] = useState('overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [workingMinutes, setWorkingMinutes] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- DATABASE STATES ---
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // --- FORM STATES ---
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [newFollowUpNote, setNewFollowUpNote] = useState('');
  
  // Search Query State
  const [searchQuery, setSearchQuery] = useState('');

  // --- TWILIO BROWSER PHONE STATES ---
  const [callStatus, setCallStatus] = useState('Idle'); // 'Idle', 'Calling', 'In Progress'
  const [isCallOverlayOpen, setIsCallOverlayOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const deviceRef = useRef<any>(null); // Holds the active Twilio call session

  // New Expanded Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '', phone: '', clientEmail: '', alternatePhone: '', preferredLocation: '',
    budget: 'Under 50L', typeOfUse: 'Select', approxPurchaseDate: '', siteVisitNeeded: 'Select',
    clientAddress: '', siteAddress: '', callStatus: 'Interested', schedule: '', date: new Date().toISOString().split('T')[0]
  });

  // Salesform State
  const [isSalesformOpen, setIsSalesformOpen] = useState(false);
  const [salesForm, setSalesForm] = useState({
    propertyType: '', preferredLocation: '', budget: '', typeOfUse: 'Select',
    purchaseDate: '', decisionMaker: 'Select', loan: 'Select', loanType: '', scheduleVisit: 'Select'
  });

  const [editForm, setEditForm] = useState<any>({});
  const [newTeam, setNewTeam] = useState({ tlEmail: '', employees: [{ email: '' }] });
  const [editingTeam, setEditingTeam] = useState<any>(null);

  // Auto-scroll ref for History
  const historyEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => historyEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (selectedLead) scrollToBottom();
  }, [selectedLead?.followUps]);

  // CALL TIMER EFFECT
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'In Progress') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  let myTeamLead = "Unassigned";
  teams.forEach((t: any) => {
    if (t.employees.some((e: any) => e.email === email)) myTeamLead = t.tlName;
  });

  // --- THEME CONFIGURATION ---
  const theme = {
    bg: isDarkMode ? 'bg-[#131314]' : 'bg-[#F0F2F5]',
    card: isDarkMode ? 'bg-[#1E1F20]' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-[#202124]',
    textSub: isDarkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]',
    inputBg: isDarkMode ? 'bg-[#28292A]' : 'bg-white',
    inputBorder: isDarkMode ? 'border-[#3C4043]' : 'border-[#DADCE0]',
    inputText: isDarkMode ? 'text-white' : 'text-[#202124]',
    inputPlaceholder: isDarkMode ? 'placeholder-[#5F6368]' : 'placeholder-gray-400',
    divider: isDarkMode ? 'border-[#2D2E30]' : 'border-gray-200',
    hoverBg: isDarkMode ? 'hover:bg-[#28292A]' : 'hover:bg-gray-50',
    brandSoftBg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
    brandText: isDarkMode ? 'text-purple-400' : 'text-purple-700',
    greenSoftBg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
    greenText: isDarkMode ? 'text-green-400' : 'text-green-700',
    yellowSoftBg: isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
    yellowText: isDarkMode ? 'text-yellow-400' : 'text-yellow-700',
    alertBg: isDarkMode ? 'bg-[#3B1F1F]' : 'bg-red-50',
    alertText: isDarkMode ? 'text-[#F28B82]' : 'text-red-700',
    iconBg: isDarkMode ? 'bg-[#2D2E30]' : 'bg-gray-100',
  };

  const customScrollbar = `[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkMode ? '[&::-webkit-scrollbar-thumb]:bg-[#3C4043] hover:[&::-webkit-scrollbar-thumb]:bg-[#5F6368]' : '[&::-webkit-scrollbar-thumb]:bg-[#DADCE0] hover:[&::-webkit-scrollbar-thumb]:bg-[#9AA0A6]'}`;

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const formatDisplaySchedule = (scheduleString: string) => {
    if (!scheduleString || scheduleString === 'Not Scheduled') return 'Not Scheduled';
    try {
      const dateObj = new Date(scheduleString);
      if (!isNaN(dateObj.getTime())) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day}/${month}/${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      }
    } catch (e) { }
    return scheduleString;
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const userRes = await fetch('/api/users');
          if (userRes.ok) setRegisteredUsers(await userRes.json());
        }
        const teamRes = await fetch('/api/teams');
        if (teamRes.ok) setTeams(await teamRes.json());
        const leadRes = await fetch('/api/leads');
        if (leadRes.ok) setLeadsList(await leadRes.json());
      } catch (err) { console.error(err); }
    };
    fetchData();

    if (!sessionStorage.getItem('loginTime')) sessionStorage.setItem('loginTime', Date.now().toString());
    const interval = setInterval(() => setWorkingMinutes(Math.floor((Date.now() - parseInt(sessionStorage.getItem('loginTime')!)) / 60000)), 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // --- TICKET HANDLERS ---
  const handleSaveSingleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return alert("Client Name and Phone required!");
    const ticketId = `A-${leadsList.length + 1}`;
    const leadData = {
      ...newLeadForm,
      ticketId,
      employeeName: name,
      teamLead: myTeamLead,
      schedule: newLeadForm.schedule ? newLeadForm.schedule.replace('T', ' ') : 'Not Scheduled',
      lastEditedAt: getFormattedCurrentDate(),
      isSolved: false,
      followUps: [{ author: name, text: 'Site Visit Created.', time: getFormattedCurrentDate() }]
    };
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadData) });
      if (res.ok) {
        setLeadsList([await res.json(), ...leadsList]);
        setIsAddLeadModalOpen(false);
        setNewLeadForm({
          name: '', phone: '', clientEmail: '', alternatePhone: '', preferredLocation: '',
          budget: 'Under 50L', typeOfUse: 'Select', approxPurchaseDate: '', siteVisitNeeded: 'Select',
          clientAddress: '', siteAddress: '', callStatus: 'Interested', schedule: '', date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) { alert("Error saving lead!"); }
  };

  const handleSaveEdit = async () => {
    const updatedData = { ...editForm, lastEditedAt: getFormattedCurrentDate() };
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, updateData: updatedData }) });
      if (res.ok) {
        const savedLead = await res.json();
        setLeadsList(leadsList.map((l: any) => l._id === savedLead._id ? savedLead : l));
        setSelectedLead(savedLead);
        setIsEditingTicket(false);
      }
    } catch (err) { alert("Error updating ticket."); }
  };

  const handleSolveTicket = async () => {
    if (!confirm("Are you sure you want to mark this ticket as Solved?")) return;
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, updateData: { isSolved: true, lastEditedAt: getFormattedCurrentDate() } }) });
      if (res.ok) {
        const savedLead = await res.json();
        setLeadsList(leadsList.map((l: any) => l._id === savedLead._id ? savedLead : l));
        setSelectedLead(null);
      }
    } catch (err) { alert("Error solving ticket."); }
  };

  const handleDeleteTicket = async () => {
    if (!isAdmin) return;
    if (!confirm(`Warning: Are you sure you want to permanently delete ticket ${selectedLead.ticketId}?`)) return;
    try {
      const res = await fetch(`/api/leads?id=${selectedLead._id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeadsList(leadsList.filter((l: any) => l._id !== selectedLead._id));
        setSelectedLead(null);
      } else alert("Failed to delete ticket.");
    } catch (err) { alert("Error deleting ticket."); }
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUpNote.trim() || !selectedLead) return;
    const followUp = { author: name, text: newFollowUpNote, time: getFormattedCurrentDate() };
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, followUp }) });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeadsList(leadsList.map((l: any) => l._id === updatedLead._id ? updatedLead : l));
        setSelectedLead(updatedLead);
        setNewFollowUpNote('');
      }
    } catch (err) { alert("Error adding follow up"); }
  };

  const handleSubmitSalesform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    const formattedText = `📝 Detailed Salesform Submitted:\n• Property Type: ${salesForm.propertyType || 'N/A'}\n• Location: ${salesForm.preferredLocation || 'N/A'}\n• Budget: ${salesForm.budget || 'N/A'}\n• Use Type: ${salesForm.typeOfUse}\n• Purchase Date: ${salesForm.purchaseDate || 'N/A'}\n• Decision Maker: ${salesForm.decisionMaker}\n• Loan Planned: ${salesForm.loan}${salesForm.loan === 'Yes' ? ` (${salesForm.loanType})` : ''}\n• Site Visit Requested: ${salesForm.scheduleVisit}`;
    const followUp = { author: name, text: formattedText, time: getFormattedCurrentDate() };
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, followUp, updateData: { lastEditedAt: getFormattedCurrentDate() } }) });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeadsList(leadsList.map((l: any) => l._id === updatedLead._id ? updatedLead : l));
        setSelectedLead(updatedLead);
        setIsSalesformOpen(false);
        setSalesForm({ propertyType: '', preferredLocation: '', budget: '', typeOfUse: 'Select', purchaseDate: '', decisionMaker: 'Select', loan: 'Select', loanType: '', scheduleVisit: 'Select' });
      }
    } catch (err) { alert("Error submitting salesform"); }
  };

  // --- TEAM HANDLERS ---
  const handleSaveNewTeam = async () => {
    if (!newTeam.tlEmail) return alert("Select a Team Lead!");
    const tlUser = registeredUsers.find((u: any) => u.email === newTeam.tlEmail);
    const validEmployees = newTeam.employees.filter((emp: any) => emp.email.trim() !== '').map((emp: any) => {
      const userDetails = registeredUsers.find((u: any) => u.email === emp.email);
      return { name: userDetails?.name || emp.email, email: emp.email, calls: 0, leads: 0 };
    });
    try {
      const res = await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tlName: tlUser?.name || newTeam.tlEmail, tlEmail: newTeam.tlEmail, employees: validEmployees }) });
      if (res.ok) {
        setTeams([await res.json(), ...teams]);
        setIsAddTeamModalOpen(false);
        setNewTeam({ tlEmail: '', employees: [{ email: '' }] });
      }
    } catch (err) { alert("Error creating team"); }
  };

  const handleSaveEditTeam = async () => {
    const validEmployees = editingTeam.employees.filter((emp: any) => emp.email.trim() !== '').map((emp: any) => {
      const userDetails = registeredUsers.find((u: any) => u.email === emp.email);
      return { name: userDetails?.name || emp.email, email: emp.email, calls: emp.calls || 0, leads: emp.leads || 0 };
    });
    try {
      const res = await fetch('/api/teams', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId: editingTeam._id, employees: validEmployees }) });
      if (res.ok) {
        const updatedTeam = await res.json();
        setTeams(teams.map((t: any) => t._id === updatedTeam._id ? updatedTeam : t));
        setIsEditTeamModalOpen(false);
        setEditingTeam(null);
      }
    } catch (err) { alert("Error updating team"); }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this entire team?")) return;
    try {
      const res = await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' });
      if (res.ok) setTeams(teams.filter((t: any) => t._id !== teamId));
    } catch (err) { alert("Error deleting team"); }
  };

  const handleLogout = () => { sessionStorage.removeItem('loginTime'); router.push('/'); };
  const hours = Math.floor(workingMinutes / 60);
  const minutes = workingMinutes % 60;

  // --- DYNAMIC DATA AGGREGATION & SEARCH FILTERING ---
  const activeTickets = leadsList.filter((lead: any) => !lead.isSolved);
  
  const filteredActiveTickets = activeTickets.filter((lead: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (lead.name && lead.name.toLowerCase().includes(query)) ||
      (lead.ticketId && lead.ticketId.toLowerCase().includes(query)) ||
      (lead.date && lead.date.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.includes(query)) ||
      (lead.schedule && lead.schedule.toLowerCase().includes(query))
    );
  });

  const solvedTicketsCount = leadsList.filter((l:any) => l.isSolved).length;
  const canEditOrSolve = isAdmin || (selectedLead?.employeeName === name);
  const alreadyAssignedEmails = teams.flatMap((team: any) => team.employees.map((emp: any) => emp.email));
  const baseAvailableEmployees = registeredUsers.filter((user: any) => !alreadyAssignedEmails.includes(user.email) && user.email !== newTeam.tlEmail);

  const statusCounts = leadsList.reduce((acc: any, lead: any) => {
    acc[lead.callStatus] = (acc[lead.callStatus] || 0) + 1;
    return acc;
  }, {});
  const dynamicStatusData = Object.keys(statusCounts).map(key => ({
    name: key, value: statusCounts[key]
  }));

  const budgetCounts = leadsList.reduce((acc: any, lead: any) => {
    const b = lead.budget || 'Unknown';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});
  const dynamicBudgetData = Object.keys(budgetCounts).map(key => ({
    name: key, total: budgetCounts[key]
  }));

  return (
    <div className={`flex flex-col md:flex-row h-screen transition-colors duration-300 ${theme.bg} font-sans`}>

      {/* --- RESPONSIVE SIDEBAR --- */}
      <aside className={`fixed bottom-0 w-full md:relative md:w-16 h-16 md:h-full flex flex-row md:flex-col items-center justify-around md:justify-start md:py-4 z-40 transition-colors duration-300 border-t md:border-t-0 md:border-r ${theme.card} ${theme.divider}`}>
        <div className="hidden md:flex w-8 h-8 bg-purple-600 rounded-lg items-center justify-center text-white font-bold cursor-pointer mb-8">B</div>
        <nav className="flex flex-row md:flex-col items-center justify-around w-full md:w-auto md:space-y-6">
          <div onClick={() => { setActiveView('overview'); setSelectedLead(null); }} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'overview' ? 'text-purple-600 bg-purple-500/10' : theme.textSub} hover:text-purple-600`}>
            <LayoutDashboard className="w-6 h-6 cursor-pointer" />
          </div>
          <div onClick={() => { setActiveView('leads'); setSelectedLead(null); }} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'leads' ? 'text-purple-600 bg-purple-500/10' : theme.textSub} hover:text-purple-600`}>
            <Ticket className="w-6 h-6 cursor-pointer" />
          </div>
          <div onClick={() => { setActiveView('teams'); setSelectedLead(null); }} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'teams' ? 'text-purple-600 bg-purple-500/10' : theme.textSub} hover:text-purple-600`}>
            <Network className="w-6 h-6 cursor-pointer" />
          </div>
          <div onClick={() => { setActiveView('database'); setSelectedLead(null); }} className={`p-2 rounded-lg cursor-pointer transition-colors ${activeView === 'database' ? 'text-purple-600 bg-purple-500/10' : theme.textSub} hover:text-purple-600`}>
            <Database className="w-6 h-6 cursor-pointer" />
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-screen w-full overflow-hidden min-w-0">

        {/* RESPONSIVE TOP NAVBAR */}
        <header className={`px-4 md:px-8 py-3 md:py-4 flex justify-between items-center relative z-30 transition-colors duration-300 border-b ${theme.card} ${theme.divider}`}>
          <div className="flex items-center space-x-2">
            <div className="md:hidden flex w-8 h-8 bg-purple-600 rounded-lg items-center justify-center text-white font-bold cursor-pointer">B</div>
            <h1 className={`font-semibold flex items-center text-lg md:text-base ${theme.textMain}`}>
              <span className="hidden sm:inline">BhoomiDwellers</span> CRM <span className={`hidden md:inline text-sm font-normal px-2 ${theme.textSub}`}>- Workspace</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5 relative">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`cursor-pointer p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-[#28292A] text-yellow-400 hover:bg-[#3C4043]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Toggle Theme">
              {isDarkMode ? <Sun className="w-5 h-5 cursor-pointer" /> : <Moon className="w-5 h-5 cursor-pointer" />}
            </button>
            <Bell className={`hidden sm:block w-5 h-5 cursor-pointer transition-colors ${theme.textSub} hover:${theme.textMain}`} />

            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-colors ${theme.greenSoftBg} ${theme.greenText} border border-transparent hover:border-green-500/50`}>
              {name.charAt(0).toUpperCase()}
            </div>

            {isProfileOpen && (
              <div className={`absolute top-12 right-0 w-64 md:w-72 rounded-xl shadow-lg p-4 md:p-5 border animate-fadeIn z-50 ${theme.card} ${theme.divider}`}>
                <div className="mb-4 overflow-hidden">
                  <h3 className={`font-semibold ${theme.textMain} truncate`}>{name}</h3>
                  <p className={`text-xs ${theme.textSub} truncate`}>{email}</p>
                </div>
                <hr className={`mb-4 border-t ${theme.divider}`} />
                <p className={`text-sm mb-2 ${theme.textSub}`}>Role: <b className={theme.textMain}>{role}</b></p>
                <p className={`text-sm mb-4 ${theme.textSub}`}>Team Lead: <b className={theme.textMain}>{isAdmin ? 'Admin' : myTeamLead}</b></p>
                <button onClick={handleLogout} className={`cursor-pointer w-full py-2 rounded-lg text-sm font-medium transition-colors ${theme.alertBg} ${theme.alertText} hover:opacity-80`}>Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <div className={`p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto pb-20 md:pb-8 ${customScrollbar}`}>

          {/* VIEW 1: OVERVIEW */}
          {activeView === 'overview' && (
            <div className="animate-fadeIn space-y-8">
              
              {/* GET STARTED HERO SECTION */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className={`text-xl md:text-2xl font-bold ${theme.textMain}`}>Hi, <span className="font-semibold">{name}</span></h2>
                    <h3 className={`text-lg font-bold mt-4 ${theme.textMain}`}>Get started</h3>
                  </div>
                  <button className="text-purple-600 text-sm font-semibold flex items-center hover:underline cursor-pointer">
                    <Video className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Setup Guide</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {isAdmin && (
                    <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 shadow-sm ${theme.card} ${theme.divider}`}>
                       <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                         <Users className="w-6 h-6" />
                       </div>
                       <h4 className={`font-bold mb-1 ${theme.textMain}`}>Add Team</h4>
                       <p className={`text-xs mb-5 h-8 ${theme.textSub}`}>Collaborate with team at one location</p>
                       <button onClick={() => setIsAddTeamModalOpen(true)} className="cursor-pointer px-6 py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white text-sm font-bold rounded-full transition-colors w-full">+ Add Team</button>
                    </div>
                  )}
                  <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 shadow-sm ${theme.card} ${theme.divider}`}>
                     <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                       <UserPlus className="w-6 h-6" />
                     </div>
                     <h4 className={`font-bold mb-1 ${theme.textMain}`}>Lead</h4>
                     <p className={`text-xs mb-5 h-8 ${theme.textSub}`}>Connect with potential customers</p>
                     <button onClick={() => { setActiveView('leads'); setIsAddLeadModalOpen(true); }} className="cursor-pointer px-6 py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white text-sm font-bold rounded-full transition-colors w-full">+ Add site visit</button>
                  </div>
                  <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 shadow-sm ${theme.card} ${theme.divider}`}>
                     <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                       <BarChart3 className="w-6 h-6" />
                     </div>
                     <h4 className={`font-bold mb-1 ${theme.textMain}`}>Report</h4>
                     <p className={`text-xs mb-5 h-8 ${theme.textSub}`}>Analyse your performance</p>
                     <button onClick={() => document.getElementById('reports-section')?.scrollIntoView({behavior: 'smooth'})} className="cursor-pointer px-6 py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white text-sm font-bold rounded-full transition-colors w-full">Check reports</button>
                  </div>
                </div>
              </div>

              {/* REAL CRM METRICS */}
              <div>
                <h3 className={`text-lg font-bold mb-4 ${theme.textMain}`} id="reports-section">Current Data Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className={`p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className={`text-sm font-medium ${theme.textSub} mb-1`}>Total Leads</p>
                        <h3 className={`text-3xl font-bold ${theme.textMain}`}>{leadsList.length}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${theme.iconBg} ${theme.textMain}`}><Users className="w-6 h-6" /></div>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className={`text-sm font-medium ${theme.textSub} mb-1`}>Active Site Visits</p>
                        <h3 className={`text-3xl font-bold text-yellow-500`}>{activeTickets.length}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${theme.iconBg} text-yellow-500`}><Ticket className="w-6 h-6" /></div>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className={`text-sm font-medium ${theme.textSub} mb-1`}>Solved Tickets</p>
                        <h3 className={`text-3xl font-bold text-green-500`}>{solvedTicketsCount}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${theme.iconBg} text-green-500`}><CheckCircle2 className="w-6 h-6" /></div>
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className={`text-sm font-medium ${theme.textSub} mb-1`}>Active Teams</p>
                        <h3 className={`text-3xl font-bold text-purple-500`}>{teams.length}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${theme.iconBg} text-purple-500`}><Network className="w-6 h-6" /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL CRM CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                
                {/* Leads by Budget Chart */}
                <div className={`col-span-2 p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                  <h3 className={`text-lg font-bold mb-4 ${theme.textMain}`}>Leads by Budget Map</h3>
                  <div className="h-80">
                    {dynamicBudgetData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dynamicBudgetData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB', color: isDarkMode ? '#FFFFFF' : '#000000', borderRadius: '8px' }}
                            itemStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                            formatter={(value: any) => [value, 'Total Leads']}
                          />
                          <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center"><p className={theme.textSub}>No data available yet.</p></div>
                    )}
                  </div>
                </div>

                {/* Leads Status Distribution */}
                <div className={`p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                  <h3 className={`text-lg font-bold mb-4 ${theme.textMain}`}>Lead Status Tracking</h3>
                  <div className="h-80">
                    {dynamicStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dynamicStatusData}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {dynamicStatusData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB', color: isDarkMode ? '#FFFFFF' : '#000000', borderRadius: '8px' }}
                            itemStyle={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                            formatter={(value: any) => <span className={theme.textMain}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center"><p className={theme.textSub}>No data available yet.</p></div>
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT TICKETS TABLE */}
              <div className={`p-6 rounded-2xl shadow-sm border ${theme.card} ${theme.divider}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-bold ${theme.textMain}`}>Recent Leads Added</h3>
                  <button onClick={() => setActiveView('database')} className={`cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors`}>View Database</button>
                </div>
                <div className={`overflow-x-auto ${customScrollbar}`}>
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className={`border-b ${theme.divider}`}>
                        <th className={`px-4 py-3 text-xs font-semibold uppercase ${theme.textSub}`}>Ticket ID</th>
                        <th className={`px-4 py-3 text-xs font-semibold uppercase ${theme.textSub}`}>Client</th>
                        <th className={`px-4 py-3 text-xs font-semibold uppercase ${theme.textSub}`}>Assignee</th>
                        <th className={`px-4 py-3 text-xs font-semibold uppercase ${theme.textSub}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.divider}`}>
                      {leadsList.slice(0, 5).map((lead: any) => (
                        <tr key={lead._id} className={`hover:${theme.hoverBg} transition-colors`}>
                          <td className={`px-4 py-3 text-sm font-bold ${theme.brandText}`}>{lead.ticketId}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${theme.textMain}`}>{lead.name}</td>
                          <td className={`px-4 py-3 text-sm ${theme.textMain}`}>{lead.employeeName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(lead.callStatus, isDarkMode)}`}>
                              {lead.callStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {leadsList.length === 0 && <tr><td colSpan={4} className={`px-4 py-4 text-center text-sm ${theme.textSub}`}>No recent tickets found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: TEAMS */}
          {activeView === 'teams' && (
            <div className="max-w-5xl mx-auto animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h1 className={`text-xl md:text-2xl font-bold ${theme.textMain}`}>Teams & Hierarchy</h1>
                {isAdmin && (
                  <button onClick={() => setIsAddTeamModalOpen(true)} className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Create Team
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {teams.map((team: any) => (
                  <div key={team._id} className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${theme.card} ${theme.divider}`}>
                    <div className={`p-4 md:p-5 font-bold border-b flex justify-between items-center text-sm md:text-base ${theme.brandSoftBg} ${theme.brandText} ${theme.divider}`}>
                      <span>TL: {team.tlName}</span>
                      {isAdmin && (
                        <div className="flex space-x-3">
                          <button onClick={() => { setEditingTeam({...team, employees: [...team.employees]}); setIsEditTeamModalOpen(true); }} className="cursor-pointer hover:opacity-70" title="Edit Team">
                            <Edit3 className="w-4 h-4 cursor-pointer" />
                          </button>
                          <button onClick={() => handleDeleteTeam(team._id)} className="cursor-pointer text-red-500 hover:text-red-700 transition-colors" title="Delete Team">
                            <Trash2 className="w-4 h-4 cursor-pointer" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-5 space-y-2 md:space-y-3">
                      {team.employees.map((emp: any, i: number) => (
                        <div key={i} className={`p-2.5 md:p-3 border rounded-lg flex justify-between items-center transition-colors text-sm md:text-base ${theme.inputBg} ${theme.divider}`}>
                          <span className={`${theme.textMain} truncate pr-2`}>{emp.name}</span>
                          <span className={`text-xs font-bold whitespace-nowrap ${theme.brandText}`}>{emp.calls} Calls</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: DATABASE TABLE */}
          {activeView === 'database' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <h1 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${theme.textMain}`}>Client Database</h1>
              <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${theme.card} ${theme.divider}`}>
                <div className={`overflow-x-auto w-full ${customScrollbar}`}>
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className={`border-b ${theme.inputBg} ${theme.divider}`}>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Ticket #</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Assignee</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Status</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Site Visit</th>
                        <th className={`px-4 md:px-6 py-3 md:py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Budget</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#2D2E30]' : 'divide-gray-100'}`}>
                      {leadsList.map((lead: any) => (
                        <tr key={lead._id} className={`transition-colors ${theme.hoverBg}`}>
                          <td className={`px-4 md:px-6 py-3 md:py-4 font-bold text-sm ${theme.brandText}`}>
                            {lead.ticketId || `TKT-${lead._id ? lead._id.toString().slice(-4).toUpperCase() : 'OLD'}`}
                            {lead.isSolved && <span className="ml-2 inline-block text-[10px] bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded border border-green-500/30">SOLVED</span>}
                          </td>
                          <td className={`px-4 md:px-6 py-3 md:py-4 text-sm font-medium ${theme.textMain}`}>
                            {lead.employeeName || 'Unassigned'}
                            {lead.teamLead && lead.teamLead !== 'Unassigned' && (
                              <span className={`block text-[10px] mt-0.5 ${theme.textSub}`}>TL: {lead.teamLead}</span>
                            )}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(lead.callStatus, isDarkMode)}`}>
                              {lead.callStatus}
                            </span>
                          </td>
                          <td className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm ${theme.textSub}`}>{formatDisplaySchedule(lead.schedule)}</td>
                          <td className={`px-4 md:px-6 py-3 md:py-4 text-sm font-medium ${theme.textMain}`}>{lead.budget}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: TICKETING & CHAT */}
          {activeView === 'leads' && (
            <div className="max-w-7xl mx-auto animate-fadeIn h-full flex flex-col">
              {!selectedLead ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                    <h1 className={`text-xl md:text-2xl font-bold ${theme.textMain}`}>Site Visits</h1>
                    <div className="flex w-full sm:w-auto space-x-3">
                       <div className={`relative flex-1 sm:w-64 flex items-center ${theme.card} rounded-lg border ${theme.divider} px-3 py-2`}>
                         <Search className={`w-4 h-4 ${theme.textSub} mr-2`} />
                         <input
                           type="text"
                           placeholder="Search name, ID, date..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className={`w-full bg-transparent outline-none text-sm ${theme.inputText} placeholder:${theme.textSub}`}
                         />
                       </div>
                       <button onClick={() => setIsAddLeadModalOpen(true)} className="cursor-pointer px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors shadow-sm flex items-center flex-shrink-0">
                         <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden sm:inline">Site Visit</span>
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredActiveTickets.map((lead: any) => (
                      <div key={lead._id} onClick={() => { setSelectedLead(lead); setEditForm(lead); setIsEditingTicket(false); setIsSalesformOpen(false); }} className={`cursor-pointer rounded-xl shadow-sm border p-4 md:p-5 transition-all hover:border-purple-500/50 ${theme.card} ${theme.divider}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${theme.brandSoftBg} ${theme.brandText}`}>
                            {lead.ticketId || `TKT-${lead._id ? lead._id.toString().slice(-4).toUpperCase() : 'OLD'}`}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 border rounded-full ${getStatusStyles(lead.callStatus, isDarkMode)}`}>{lead.callStatus}</span>
                        </div>
                        <h3 className={`text-lg md:text-xl font-bold mt-1 ${theme.textMain} truncate`}>{lead.name}</h3>
                        <p className={`text-xs md:text-sm mb-4 ${theme.textSub} truncate`}>{lead.phone}</p>

                        <div className={`text-[10px] md:text-xs border-t pt-3 flex justify-between items-center ${theme.textSub} ${theme.divider}`}>
                          <div className="flex flex-col truncate pr-2">
                            <span className="truncate">Assigned to: <b className={theme.textMain}>{lead.employeeName || 'Unassigned'}</b></span>
                            {lead.teamLead && lead.teamLead !== 'Unassigned' && (
                              <span className="truncate">Team Lead: <b className={theme.textMain}>{lead.teamLead}</b></span>
                            )}
                          </div>
                          <div className="whitespace-nowrap flex-shrink-0 ml-2 text-right">
                            {formatDisplayDate(lead.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredActiveTickets.length === 0 && <p className={theme.textSub}>No site visits found matching "{searchQuery}".</p>}
                  </div>
                </>
              ) : (
                <div className={`flex flex-col flex-1 rounded-2xl shadow-sm border overflow-hidden transition-colors ${theme.card} ${theme.divider}`}>

                  <div className={`border-b p-3 md:p-4 flex justify-between items-center ${theme.inputBg} ${theme.divider}`}>
                    <div className="flex items-center overflow-hidden">
                      <button onClick={() => setSelectedLead(null)} className={`cursor-pointer mr-3 md:mr-4 p-1.5 md:p-2 border rounded-lg transition-colors flex-shrink-0 ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}><ChevronLeft className="w-5 h-5 cursor-pointer" /></button>
                      <div className="truncate pr-2">
                        <h2 className={`text-lg md:text-xl font-bold ${theme.textMain} truncate`}>
                          <span className={theme.brandText}>{selectedLead.ticketId || 'TKT'}</span> <span className="hidden sm:inline">- {selectedLead.name}</span>
                        </h2>
                        {selectedLead.lastEditedAt && (
                          <span className={`hidden xs:flex text-[10px] md:text-xs items-center mt-0.5 md:mt-1 ${theme.textSub}`}><Clock className="w-3 h-3 mr-1" /> {selectedLead.lastEditedAt}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1.5 md:space-x-3 items-center flex-shrink-0">
                      {canEditOrSolve && (
                        <>
                          {!isSalesformOpen ? (
                            <button onClick={() => { setIsSalesformOpen(true); setIsEditingTicket(false); }} className={`cursor-pointer p-1.5 md:px-4 md:py-2 border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 rounded-lg text-xs md:text-sm font-bold flex items-center transition-colors`} title="Salesform">
                              <ClipboardList className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">+ Salesform</span>
                            </button>
                          ) : (
                            <button onClick={() => setIsSalesformOpen(false)} className={`cursor-pointer p-1.5 md:px-4 md:py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-xs md:text-sm font-bold flex items-center transition-colors`} title="Close Salesform">
                              <X className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Close Form</span>
                            </button>
                          )}

                          {isEditingTicket ? (
                            <button onClick={handleSaveEdit} className="cursor-pointer p-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg text-xs md:text-sm font-bold flex items-center" title="Save"><Save className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Save Changes</span></button>
                          ) : (
                            <button onClick={() => { setIsEditingTicket(true); setIsSalesformOpen(false); }} className={`cursor-pointer p-1.5 md:px-4 md:py-2 border rounded-lg text-xs md:text-sm font-bold flex items-center transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`} title="Edit"><Edit3 className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Edit</span></button>
                          )}

                          <button onClick={handleSolveTicket} className="cursor-pointer p-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs md:text-sm font-bold flex items-center transition-colors" title="Solve"><CheckCircle2 className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Solve</span></button>
                        </>
                      )}

                      {isAdmin && (
                        <button onClick={handleDeleteTicket} className="cursor-pointer p-1.5 md:p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors md:ml-2" title="Delete">
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5 cursor-pointer" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden ${customScrollbar}`}>
                    
                    <div className={`w-full md:w-7/12 flex-shrink-0 md:flex-shrink p-4 md:p-8 border-b md:border-b-0 md:border-r md:overflow-y-auto ${theme.divider} ${customScrollbar}`}>

                      {!isEditingTicket && !isSalesformOpen && (
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-6 rounded-xl border ${theme.brandSoftBg} border-purple-500/20`}>
                          <div className="flex items-center mb-2 sm:mb-0">
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3 shadow-sm flex-shrink-0">
                              {(selectedLead.employeeName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`text-[10px] md:text-xs font-semibold ${theme.brandText} uppercase tracking-wider`}>Assigned To</p>
                              <p className={`text-sm md:text-base font-bold ${theme.textMain}`}>{selectedLead.employeeName || 'Unassigned'}</p>
                            </div>
                          </div>

                          {selectedLead.teamLead && selectedLead.teamLead !== 'Unassigned' && (
                            <div className={`sm:border-l pl-0 sm:pl-4 ${theme.divider}`}>
                              <p className={`text-[10px] md:text-xs font-semibold ${theme.textSub} uppercase tracking-wider`}>Team Lead</p>
                              <p className={`text-sm font-medium ${theme.textMain}`}>{selectedLead.teamLead}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {isSalesformOpen ? (
                        <form onSubmit={handleSubmitSalesform} className="space-y-4 mb-6 md:mb-8 animate-fadeIn">
                          <h3 className={`text-lg font-bold mb-4 ${theme.textMain}`}>Fill Detail Capturing Salesform</h3>
                          <div className={`p-5 rounded-xl border ${theme.inputBg} ${theme.divider} space-y-4`}>
                            <h4 className={`text-sm font-semibold border-b pb-2 ${theme.textMain} ${theme.divider}`}>Section 1</h4>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>What Property Type are you looking for?</label><input type="text" placeholder="e.g. Villa, Apartment" value={salesForm.propertyType} onChange={(e: any) => setSalesForm({ ...salesForm, propertyType: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>What is your Preferred Location?</label><input type="text" placeholder="e.g. Delhi, Mumbai" value={salesForm.preferredLocation} onChange={(e: any) => setSalesForm({ ...salesForm, preferredLocation: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>What is the approximate budget?</label><input type="text" placeholder="e.g. 5 cr" value={salesForm.budget} onChange={(e: any) => setSalesForm({ ...salesForm, budget: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>Is this for self-use or investment?</label><select value={salesForm.typeOfUse} onChange={(e: any) => setSalesForm({ ...salesForm, typeOfUse: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Select</option><option>Self</option><option>Investment</option></select></div>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>When are you planning to purchase?</label><input type="date" value={salesForm.purchaseDate} onChange={(e: any) => setSalesForm({ ...salesForm, purchaseDate: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>Are you the Decision Maker?</label><select value={salesForm.decisionMaker} onChange={(e: any) => setSalesForm({ ...salesForm, decisionMaker: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Select</option><option>Yes</option><option>No</option></select></div>
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>Are you planning to go for a loan?</label><select value={salesForm.loan} onChange={(e: any) => setSalesForm({ ...salesForm, loan: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Select</option><option>Yes</option><option>No</option></select></div>
                            {salesForm.loan === 'Yes' && (
                              <div className="pl-4 border-l-2 border-purple-500 animate-fadeIn"><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>Which type of loan will you be looking for?</label><input type="text" placeholder="e.g. Property Loan" value={salesForm.loanType} onChange={(e: any) => setSalesForm({ ...salesForm, loanType: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            )}
                            <div><label className={`block text-xs font-semibold mb-1 ${theme.textSub}`}>Would you like to schedule a site visit?</label><select value={salesForm.scheduleVisit} onChange={(e: any) => setSalesForm({ ...salesForm, scheduleVisit: e.target.value })} className={`w-full p-2 border rounded outline-none text-sm focus:ring-1 focus:ring-purple-500 ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Select</option><option>Yes</option><option>No</option></select></div>
                          </div>
                          <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-md">Submit Salesform to History</button>
                        </form>
                      ) : isEditingTicket ? (
                        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <div><label className={`text-xs ${theme.textSub}`}>Name</label><input type="text" value={editForm.name} onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Phone</label><input type="text" value={editForm.phone} onChange={(e: any) => setEditForm({ ...editForm, phone: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Alternate Phone</label><input type="text" value={editForm.alternatePhone || ''} onChange={(e: any) => setEditForm({ ...editForm, alternatePhone: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Email</label><input type="email" value={editForm.clientEmail || ''} onChange={(e: any) => setEditForm({ ...editForm, clientEmail: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Preferred Location</label><input type="text" value={editForm.preferredLocation || ''} onChange={(e: any) => setEditForm({ ...editForm, preferredLocation: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Budget</label><select value={editForm.budget} onChange={(e: any) => setEditForm({ ...editForm, budget: e.target.value })} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Under 50L</option><option>50L - 1Cr</option><option>1Cr - 3Cr</option></select></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Type of Use</label><select value={editForm.typeOfUse || 'Select'} onChange={(e: any) => setEditForm({ ...editForm, typeOfUse: e.target.value })} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Select</option><option>Self</option><option>Investment</option></select></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Approx. Purchase Date</label><input type="date" value={editForm.approxPurchaseDate || ''} onChange={(e: any) => setEditForm({ ...editForm, approxPurchaseDate: e.target.value })} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Site Visit Needed</label><select value={editForm.siteVisitNeeded || 'Select'} onChange={(e: any) => setEditForm({ ...editForm, siteVisitNeeded: e.target.value })} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Select</option><option>Yes</option><option>No</option></select></div>
                            <div>
                              <label className={`text-xs ${theme.textSub}`}>Status</label>
                              <select value={editForm.callStatus} onChange={(e: any) => setEditForm({ ...editForm, callStatus: e.target.value })} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                                <option value="RNR">RNR</option>
                                <option value="Interested">Interested</option>
                                <option value="Site visit Scheduled">Site visit Scheduled</option>
                                <option value="Site Visit Done">Site Visit Done</option>
                                <option value="Proposal Shared">Proposal Shared</option>
                                <option value="Negotiation Stage">Negotiation Stage</option>
                                <option value="Partial Payment Received">Partial Payment Received</option>
                                <option value="Proposal Preparation">Proposal Preparation</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2"><label className={`text-xs ${theme.textSub}`}>Client Address</label><input type="text" value={editForm.clientAddress || ''} onChange={(e: any) => setEditForm({ ...editForm, clientAddress: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div className="sm:col-span-2"><label className={`text-xs ${theme.textSub}`}>Site Visit Address</label><input type="text" value={editForm.siteAddress || ''} onChange={(e: any) => setEditForm({ ...editForm, siteAddress: e.target.value })} className={`w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div className="sm:col-span-2"><label className={`text-xs ${theme.textSub}`}>Schedule Date</label><input type="datetime-local" value={editForm.schedule || ''} onChange={(e: any) => setEditForm({ ...editForm, schedule: e.target.value })} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                          </div>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 p-4 md:p-6 rounded-xl border animate-fadeIn ${theme.inputBg} ${theme.divider}`}>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Email</p><p className={`text-sm md:text-base font-semibold flex items-center ${theme.textMain} truncate`}><Mail className="w-3 h-3 mr-2 text-gray-500 flex-shrink-0" />{selectedLead.clientEmail || 'N/A'}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Phone</p><p className={`text-sm md:text-base font-semibold flex items-center ${theme.textMain} truncate`}><Phone className="w-3 h-3 mr-2 text-gray-500 flex-shrink-0" />{selectedLead.phone}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Alternate Phone</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{selectedLead.alternatePhone || 'N/A'}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Budget</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{selectedLead.budget}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Type of Use</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{selectedLead.typeOfUse || 'N/A'}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Preferred Location</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{selectedLead.preferredLocation || 'N/A'}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Approx. Purchase Date</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{selectedLead.approxPurchaseDate ? formatDisplayDate(selectedLead.approxPurchaseDate) : 'N/A'}</p></div>
                          <div><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Status</p><p className={`text-sm md:text-base font-semibold ${theme.brandText}`}>{selectedLead.callStatus}</p></div>
                          <div className="sm:col-span-2"><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Client Address</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{selectedLead.clientAddress || 'N/A'}</p></div>
                          <div className="sm:col-span-2"><p className={`text-[10px] md:text-xs mb-1 flex items-center ${theme.textSub}`}><MapPin className="w-3 h-3 mr-1" /> Site Visit Address</p><p className={`text-sm md:text-base font-semibold text-blue-500`}>{selectedLead.siteAddress || 'N/A'}</p></div>
                          <div className="sm:col-span-2"><p className={`text-[10px] md:text-xs mb-1 ${theme.textSub}`}>Scheduled Time</p><p className={`text-sm md:text-base font-semibold ${theme.textMain}`}>{formatDisplaySchedule(selectedLead.schedule)}</p></div>
                        </div>
                      )}

                      {/* --- LAPTOP SOFTPHONE CALL BUTTON --- */}
                      <div className="flex space-x-2 md:space-x-4">
                        <button 
                          onClick={async () => {
                            if (!selectedLead?.phone) return alert("No phone number found!");
                            
                            setCallStatus('Calling');
                            setIsCallOverlayOpen(true);
                            
                            try {
                              // 1. Fetch token and check for server errors
                              const res = await fetch('/api/token');
                              if (!res.ok) {
                                const errText = await res.text();
                                throw new Error(`Backend Error (${res.status}): ${errText}`);
                              }
                              
                              const data = await res.json();
                              if (!data.token) {
                                throw new Error("Backend did not return a Twilio token.");
                              }

                              // 2. Initialize Device
                              const { Device } = await import('@twilio/voice-sdk');
                              const device = new Device(data.token);
                              await device.register();
                              deviceRef.current = device;

                              // 3. Format Phone
                              let formattedPhone = selectedLead.phone.replace(/\s+/g, '').replace(/-/g, '');
                              if (!formattedPhone.startsWith('+')) {
                                formattedPhone = formattedPhone.startsWith('0') ? `+91${formattedPhone.substring(1)}` : `+91${formattedPhone}`;
                              }

                              // 4. Connect
                              const call = await device.connect({ params: { To: formattedPhone } });

                              call.on('accept', () => setCallStatus('In Progress'));
                              call.on('disconnect', () => {
                                setCallStatus('Idle');
                                setTimeout(() => setIsCallOverlayOpen(false), 2000);
                              });
                              call.on('error', (err: any) => {
                                throw new Error(`Twilio Call Error: ${err.message}`);
                              });

                            } catch (err: any) {
                              console.error("Full Error:", err);
                              // THIS WILL NOW SHOW THE EXACT REASON IT FAILED
                              alert(`Failed to connect: ${err.message}`); 
                              setCallStatus('Idle');
                              setIsCallOverlayOpen(false);
                            }
                          }}
                          className={`cursor-pointer flex-1 py-3 md:py-4 rounded-xl border transition-colors hover:opacity-80 flex flex-col items-center justify-center text-sm md:text-base ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                        >
                          <Mic className="w-5 h-5 md:w-8 h-8 mb-1 md:mb-2" />
                          <b>Browser Call</b>
                        </button>

                        <button className={`cursor-pointer flex-1 py-3 md:py-4 rounded-xl border transition-colors hover:opacity-80 flex flex-col items-center justify-center text-sm md:text-base ${isDarkMode ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          <MessageCircle className="w-5 h-5 md:w-8 h-8 mb-1 md:mb-2 cursor-pointer" />
                          <b>Send WhatsApp</b>
                        </button>
                      </div>
                    </div>

                    <div className={`w-full md:w-5/12 flex flex-col h-[400px] md:h-auto flex-shrink-0 md:flex-shrink ${theme.inputBg}`}>
                      <div className={`flex-1 p-4 md:p-6 overflow-y-auto space-y-3 md:space-y-4 ${customScrollbar}`}>
                        {selectedLead.followUps?.map((note: any, i: number) => {
                          const isCurrentUser = note.author === name;
                          const isSystemForm = note.text.startsWith('📝 Detailed Salesform Submitted:');

                          return (
                            <div key={i} className={`relative p-3 md:p-4 rounded-xl shadow-sm border transition-colors ${theme.card} ${isCurrentUser ? 'border-purple-500/50 ml-6 md:ml-8 rounded-tr-none' : `${theme.divider} mr-6 md:mr-8 rounded-tl-none`} ${isSystemForm ? 'bg-purple-900/10 border-purple-500/30' : ''}`}>
                              {isCurrentUser && (
                                <svg className="absolute top-[-1px] -right-[8px] w-[9px] h-[13px]" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M0 0H9L0 12V0Z" fill={isDarkMode ? (isSystemForm ? '#231c33' : '#1E1F20') : (isSystemForm ? '#f3e8ff' : '#ffffff')} stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                                  <line x1="0" y1="0" x2="0" y2="13" stroke={isDarkMode ? (isSystemForm ? '#231c33' : '#1E1F20') : (isSystemForm ? '#f3e8ff' : '#ffffff')} strokeWidth="2" />
                                </svg>
                              )}
                              {!isCurrentUser && (
                                <svg className="absolute top-[-1px] -left-[8px] w-[9px] h-[13px]" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 0H0L9 12V0Z" fill={isDarkMode ? '#1E1F20' : '#ffffff'} stroke={isDarkMode ? '#2D2E30' : '#e5e7eb'} strokeWidth="1" />
                                  <line x1="9" y1="0" x2="9" y2="13" stroke={isDarkMode ? '#1E1F20' : '#ffffff'} strokeWidth="2" />
                                </svg>
                              )}
                              <div className="flex justify-between mb-1 md:mb-2">
                                <span className={`font-bold text-xs md:text-sm ${theme.textMain}`}>{note.author}</span>
                                <span className={`text-[10px] md:text-xs ${theme.textSub}`}>{note.time}</span>
                              </div>
                              <p className={`text-xs md:text-sm whitespace-pre-wrap ${theme.textMain}`}>{note.text}</p>
                            </div>
                          );
                        })}
                        <div ref={historyEndRef} />
                      </div>

                      <div className={`p-3 md:p-4 border-t flex space-x-2 transition-colors ${theme.card} ${theme.divider}`}>
                        <textarea value={newFollowUpNote} onChange={(e: any) => setNewFollowUpNote(e.target.value)} placeholder="Add note..." className={`flex-1 p-2 md:p-3 border rounded-lg text-xs md:text-sm outline-none focus:border-purple-500 transition-colors h-10 md:h-auto resize-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} ${customScrollbar}`} />
                        <button onClick={handleAddFollowUp} className="cursor-pointer p-2 md:p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center"><Send className="w-4 h-4 md:w-5 md:h-5 cursor-pointer" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* FULL SCREEN ACTIVE CALL OVERLAY */}
      {isCallOverlayOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4 animate-fadeIn">
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white mb-8 shadow-lg ${callStatus === 'Calling' ? 'bg-purple-600 animate-pulse' : 'bg-green-500'}`}>
            {selectedLead.name.charAt(0).toUpperCase()}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">{selectedLead.name}</h2>
          <p className="text-gray-400 text-lg md:text-xl mb-12 tracking-wider">{selectedLead.phone}</p>
          
          <div className="text-xl md:text-2xl text-white mb-16 font-medium text-center h-10">
            {callStatus === 'Calling' && <span className="text-yellow-400 animate-pulse">Ringing...</span>}
            {callStatus === 'In Progress' && <span className="text-green-400">Connected • {formatDuration(callDuration)}</span>}
            {callStatus === 'Idle' && <span className="text-red-400">Call Ended</span>}
          </div>

          <div className="flex space-x-6">
            <button 
               onClick={() => {
                 if (deviceRef.current) {
                   deviceRef.current.disconnectAll();
                 }
                 setCallStatus('Idle');
                 setIsCallOverlayOpen(false);
               }}
               className="cursor-pointer w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105"
            >
               <PhoneOff className="w-8 h-8" />
            </button>
          </div>
          
        </div>
      )}

      {/* ADMIN TEAM MODALS */}
      {isAddTeamModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-2xl w-[95%] sm:w-full max-w-lg overflow-hidden flex flex-col border shadow-2xl ${theme.card} ${theme.divider}`}>
            <div className={`p-4 md:p-6 border-b flex justify-between ${theme.divider} ${theme.inputBg}`}>
              <h2 className={`text-lg md:text-xl font-bold ${theme.textMain}`}>Create Team</h2>
              <button onClick={() => setIsAddTeamModalOpen(false)} className={`cursor-pointer ${theme.textSub}`}><X className="w-5 h-5 cursor-pointer" /></button>
            </div>
            <div className={`p-4 md:p-6 overflow-y-auto max-h-[60vh] ${customScrollbar}`}>
              <label className={`block text-xs font-bold mb-2 ${theme.textSub}`}>Select Team Lead</label>
              <select value={newTeam.tlEmail} onChange={(e: any) => setNewTeam({ ...newTeam, tlEmail: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg mb-6 outline-none focus:border-purple-500 transition-colors text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                <option value="">-- Choose User --</option>
                {registeredUsers.map((u: any) => <option key={u.email} value={u.email}>{u.name}</option>)}
              </select>
              <div className="flex justify-between mb-2">
                <label className={`text-xs font-bold ${theme.textSub}`}>Assign Employees</label>
                <button onClick={() => setNewTeam({ ...newTeam, employees: [...newTeam.employees, { email: '' }] })} className="cursor-pointer text-xs text-purple-500 font-bold">+ Add Row</button>
              </div>
              {newTeam.employees.map((emp, i) => {
                const currentlySelectedInOtherDropdowns = newTeam.employees.filter((_, idx) => idx !== i).map(e => e.email);
                const dropdownOptions = baseAvailableEmployees.filter((user: any) => !currentlySelectedInOtherDropdowns.includes(user.email));
                return (
                  <div key={i} className="flex space-x-2 mb-2">
                    <select value={emp.email} onChange={(e: any) => { const emps = [...newTeam.employees]; emps[i].email = e.target.value; setNewTeam({ ...newTeam, employees: emps }); }} className={`cursor-pointer flex-1 p-2.5 md:p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                      <option value="">-- Select Employee --</option>
                      {dropdownOptions.map((u: any) => <option key={u.email} value={u.email}>{u.name}</option>)}
                    </select>
                    {newTeam.employees.length > 1 && (
                      <button onClick={() => { const emps = newTeam.employees.filter((_, idx) => idx !== i); setNewTeam({ ...newTeam, employees: emps }) }} className={`cursor-pointer p-2.5 md:p-3 border rounded-lg transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.textSub} hover:text-red-500`}>
                        <X className="w-4 h-4 md:w-5 md:h-5 cursor-pointer" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={`p-4 md:p-6 border-t flex justify-end space-x-3 ${theme.divider} ${theme.inputBg}`}>
              <button onClick={() => setIsAddTeamModalOpen(false)} className={`cursor-pointer px-4 md:px-6 py-2 border rounded-lg text-sm transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}>Cancel</button>
              <button onClick={handleSaveNewTeam} className="cursor-pointer px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {isEditTeamModalOpen && isAdmin && editingTeam && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-2xl w-[95%] md:w-full max-w-lg overflow-hidden flex flex-col border shadow-2xl ${theme.card} ${theme.divider}`}>
            <div className={`p-4 md:p-6 border-b flex justify-between ${theme.divider} ${theme.inputBg}`}>
              <h2 className={`text-lg md:text-xl font-bold ${theme.textMain}`}>Edit Team: {editingTeam.tlName}</h2>
              <button onClick={() => { setIsEditTeamModalOpen(false); setEditingTeam(null); }} className={`cursor-pointer ${theme.textSub}`}><X className="w-5 h-5 cursor-pointer" /></button>
            </div>
            <div className={`p-4 md:p-6 overflow-y-auto max-h-[60vh] ${customScrollbar}`}>
              <div className="flex justify-between mb-2">
                <label className={`text-xs font-bold ${theme.textSub}`}>Assign Employees</label>
                <button onClick={() => setEditingTeam({ ...editingTeam, employees: [...editingTeam.employees, { email: '' }] })} className="cursor-pointer text-xs text-purple-500 font-bold">+ Add Row</button>
              </div>
              {editingTeam.employees.map((emp: any, i: number) => {
                const assignedInOtherTeams = teams.filter((t: any) => t._id !== editingTeam._id).flatMap((t: any) => t.employees.map((e: any) => e.email));
                const currentlySelectedInOtherDropdowns = editingTeam.employees.filter((_: any, idx: number) => idx !== i).map((e: any) => e.email);
                const dropdownOptions = registeredUsers.filter((user: any) => !assignedInOtherTeams.includes(user.email) && user.email !== editingTeam.tlEmail && !currentlySelectedInOtherDropdowns.includes(user.email));
                return (
                  <div key={i} className="flex space-x-2 mb-2">
                    <select value={emp.email} onChange={(e: any) => { const emps = [...editingTeam.employees]; emps[i].email = e.target.value; setEditingTeam({ ...editingTeam, employees: emps }); }} className={`cursor-pointer flex-1 p-2.5 md:p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors text-sm ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                      <option value="">-- Select Employee --</option>
                      {dropdownOptions.map((u: any) => <option key={u.email} value={u.email}>{u.name}</option>)}
                    </select>
                    <button onClick={() => { const emps = editingTeam.employees.filter((_: any, idx: number) => idx !== i); setEditingTeam({ ...editingTeam, employees: emps }) }} className={`cursor-pointer p-2.5 md:p-3 border rounded-lg transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.textSub} hover:text-red-500`}>
                      <X className="w-4 h-4 md:w-5 md:h-5 cursor-pointer" />
                    </button>
                  </div>
                );
              })}
              {editingTeam.employees.length === 0 && <p className={`text-sm ${theme.textSub}`}>No employees assigned to this team.</p>}
            </div>
            <div className={`p-4 md:p-6 border-t flex justify-end space-x-3 ${theme.divider} ${theme.inputBg}`}>
              <button onClick={() => { setIsEditTeamModalOpen(false); setEditingTeam(null); }} className={`cursor-pointer px-4 md:px-6 py-2 border rounded-lg text-sm transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}>Cancel</button>
              <button onClick={handleSaveEditTeam} className="cursor-pointer px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">Save Updates</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED CREATE LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-2xl w-[95%] sm:w-full max-w-2xl overflow-hidden flex flex-col border shadow-2xl max-h-[90vh] ${theme.card} ${theme.divider}`}>
            <div className={`p-4 md:p-6 border-b flex justify-between ${theme.divider} ${theme.inputBg}`}>
              <h2 className={`text-lg md:text-xl font-bold ${theme.textMain}`}>Create Site Visit Ticket</h2>
              <button onClick={() => setIsAddLeadModalOpen(false)} className={`cursor-pointer ${theme.textSub}`}><X className="w-5 h-5 cursor-pointer" /></button>
            </div>

            <form onSubmit={handleSaveSingleLead} className={`p-4 md:p-6 space-y-4 overflow-y-auto flex-1 ${customScrollbar}`}>
              <div>
                <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Client Name *</label>
                <input type="text" required placeholder="John Doe" value={newLeadForm.name} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, name: e.target.value })} className={`w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Phone Number *</label>
                  <input type="tel" required placeholder="+91 9876543210" value={newLeadForm.phone} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })} className={`w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
                </div>
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Alternate Phone</label>
                  <input type="tel" placeholder="+91 0123456789" value={newLeadForm.alternatePhone} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, alternatePhone: e.target.value })} className={`w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Email Address</label>
                  <input type="email" placeholder="client@example.com" value={newLeadForm.clientEmail} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, clientEmail: e.target.value })} className={`w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
                </div>
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Preferred Location</label>
                  <input type="text" placeholder="e.g. Malad, Mumbai" value={newLeadForm.preferredLocation} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, preferredLocation: e.target.value })} className={`w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Budget</label>
                  <select value={newLeadForm.budget} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                    <option value="Under 50L">Under 50L</option><option value="50L - 1Cr">50L - 1Cr</option><option value="1Cr - 3Cr">1Cr - 3Cr</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Type of Use</label>
                  <select value={newLeadForm.typeOfUse} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, typeOfUse: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                    <option value="Select">Select</option><option value="Self">Self</option><option value="Investment">Investment</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Approximate Date of Purchase</label>
                  <input type="date" value={newLeadForm.approxPurchaseDate} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, approxPurchaseDate: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} />
                </div>
                <div>
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Site Visit Needed</label>
                  <select value={newLeadForm.siteVisitNeeded} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, siteVisitNeeded: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                    <option value="Select">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Status</label>
                  <select value={newLeadForm.callStatus} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, callStatus: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                    <option value="RNR">RNR</option>
                    <option value="Interested">Interested</option>
                    <option value="Site visit Scheduled">Site visit Scheduled</option>
                    <option value="Site Visit Done">Site Visit Done</option>
                    <option value="Proposal Shared">Proposal Shared</option>
                    <option value="Negotiation Stage">Negotiation Stage</option>
                    <option value="Partial Payment Received">Partial Payment Received</option>
                    <option value="Proposal Preparation">Proposal Preparation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] md:text-xs font-bold mb-1 ${theme.textSub}`}>Schedule Site Visit (Optional)</label>
                <input type="datetime-local" value={newLeadForm.schedule} onChange={(e: any) => setNewLeadForm({ ...newLeadForm, schedule: e.target.value })} className={`cursor-pointer w-full p-2.5 md:p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} />
              </div>
              <button type="submit" className="cursor-pointer w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mt-4 font-bold text-sm transition-colors shadow-md">Create Ticket</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() { return <Suspense><DashboardContent /></Suspense>; }