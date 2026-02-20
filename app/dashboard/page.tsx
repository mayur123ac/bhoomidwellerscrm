'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { 
  Users, UserMinus, FileSpreadsheet, BarChart3, 
  Settings, Bell, LayoutDashboard, Database, Link2, Download, 
  MessageSquare, LogOut, Phone, MessageCircle, Calendar, User, IndianRupee, Save,
  Network, Plus, UserCheck, X, Ticket, ChevronLeft, Send, Mic, Star, Moon, Sun,
  MapPin, Mail, Edit3, CheckCircle2, Clock, Trash2
} from 'lucide-react';

// --- CUSTOM DATE FORMATTER (DD/MM/YYYY, hh:mm:ss AM/PM) ---
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
  
  const [newLeadForm, setNewLeadForm] = useState({
    name: '', phone: '', clientEmail: '', clientAddress: '', siteAddress: '', 
    budget: 'Under 50L', callStatus: 'Pending', schedule: '', date: new Date().toISOString().split('T')[0]
  });
  
  const [editForm, setEditForm] = useState<any>({});
  const [newTeam, setNewTeam] = useState({ tlEmail: '', employees: [{ email: '' }] });
  const [editingTeam, setEditingTeam] = useState<any>(null); // State for editing an existing team

  let myTeamLead = "Unassigned";
  teams.forEach(t => {
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
  };

  const customScrollbar = `
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    ${isDarkMode 
      ? '[&::-webkit-scrollbar-thumb]:bg-[#3C4043] hover:[&::-webkit-scrollbar-thumb]:bg-[#5F6368]' 
      : '[&::-webkit-scrollbar-thumb]:bg-[#DADCE0] hover:[&::-webkit-scrollbar-thumb]:bg-[#9AA0A6]'
    }
  `;

  // --- DATE FORMATTING HELPERS ---
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
    } catch (e) {}
    return scheduleString;
  };

  // --- FETCH DATA FROM MONGODB ---
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

  // --- SAVE TICKET HANDLER ---
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
      followUps: [{ author: name, text: 'Ticket Created.', time: getFormattedCurrentDate() }]
    };
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadData) });
      if (res.ok) {
        setLeadsList([await res.json(), ...leadsList]);
        setIsAddLeadModalOpen(false);
        setNewLeadForm({ name: '', phone: '', clientEmail: '', clientAddress: '', siteAddress: '', budget: 'Under 50L', callStatus: 'Pending', schedule: '', date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) { alert("Error saving lead!"); }
  };

  // --- EDIT TICKET HANDLER ---
  const handleSaveEdit = async () => {
    const updatedData = { ...editForm, lastEditedAt: getFormattedCurrentDate() };
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, updateData: updatedData }) });
      if (res.ok) {
        const savedLead = await res.json();
        setLeadsList(leadsList.map(l => l._id === savedLead._id ? savedLead : l));
        setSelectedLead(savedLead);
        setIsEditingTicket(false);
      }
    } catch (err) { alert("Error updating ticket."); }
  };

  // --- SOLVE TICKET HANDLER ---
  const handleSolveTicket = async () => {
    if (!confirm("Are you sure you want to mark this ticket as Solved? It will be moved to the Database.")) return;
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, updateData: { isSolved: true, lastEditedAt: getFormattedCurrentDate() } }) });
      if (res.ok) {
        const savedLead = await res.json();
        setLeadsList(leadsList.map(l => l._id === savedLead._id ? savedLead : l));
        setSelectedLead(null); 
      }
    } catch (err) { alert("Error solving ticket."); }
  };

  // --- DELETE TICKET HANDLER ---
  const handleDeleteTicket = async () => {
    if (!isAdmin) return;
    if (!confirm(`Warning: Are you sure you want to permanently delete ticket ${selectedLead.ticketId}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/leads?id=${selectedLead._id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeadsList(leadsList.filter(l => l._id !== selectedLead._id));
        setSelectedLead(null);
      } else alert("Failed to delete ticket.");
    } catch (err) { alert("Error deleting ticket."); }
  };

  // --- FOLLOW UP HANDLER ---
  const handleAddFollowUp = async () => {
    if (!newFollowUpNote.trim() || !selectedLead) return;
    const followUp = { author: name, text: newFollowUpNote, time: getFormattedCurrentDate() };
    try {
      const res = await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedLead._id, followUp }) });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeadsList(leadsList.map(l => l._id === updatedLead._id ? updatedLead : l));
        setSelectedLead(updatedLead);
        setNewFollowUpNote('');
      }
    } catch (err) { alert("Error adding follow up"); }
  };

  // ==========================================
  // --- ADMIN TEAM MANAGEMENT HANDLERS ---
  // ==========================================
  
  const handleSaveNewTeam = async () => {
    if (!newTeam.tlEmail) return alert("Select a Team Lead!");
    const tlUser = registeredUsers.find(u => u.email === newTeam.tlEmail);
    const validEmployees = newTeam.employees.filter(emp => emp.email.trim() !== '').map(emp => {
      const userDetails = registeredUsers.find(u => u.email === emp.email);
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
      const userDetails = registeredUsers.find(u => u.email === emp.email);
      return { name: userDetails?.name || emp.email, email: emp.email, calls: emp.calls || 0, leads: emp.leads || 0 };
    });
    try {
      const res = await fetch('/api/teams', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ teamId: editingTeam._id, employees: validEmployees }) 
      });
      if (res.ok) {
        const updatedTeam = await res.json();
        setTeams(teams.map(t => t._id === updatedTeam._id ? updatedTeam : t));
        setIsEditTeamModalOpen(false);
        setEditingTeam(null);
      }
    } catch (err) { alert("Error updating team"); }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this entire team?")) return;
    try {
      const res = await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' });
      if (res.ok) setTeams(teams.filter(t => t._id !== teamId));
    } catch (err) { alert("Error deleting team"); }
  };

  const handleLogout = () => { sessionStorage.removeItem('loginTime'); router.push('/'); };
  const hours = Math.floor(workingMinutes / 60);
  const minutes = workingMinutes % 60;
  
  const allMyLeads = isAdmin ? leadsList : leadsList.filter(lead => lead.teamLead === myTeamLead);
  const activeTickets = allMyLeads.filter(lead => !lead.isSolved);

  // Dynamic filter arrays for creating teams
  const alreadyAssignedEmails = teams.flatMap(team => team.employees.map((emp: any) => emp.email));
  const baseAvailableEmployees = registeredUsers.filter(user => !alreadyAssignedEmails.includes(user.email) && user.email !== newTeam.tlEmail);

  return (
    <div className={`flex h-screen transition-colors duration-300 ${theme.bg} font-sans`}>
      
      {/* SIDEBAR */}
      <aside className={`w-16 flex flex-col items-center py-4 space-y-8 z-40 transition-colors duration-300 border-r ${theme.card} ${theme.divider}`}>
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer">B</div>
        <nav className="flex flex-col items-center space-y-6">
          <div title="Overview" onClick={() => {setActiveView('overview'); setSelectedLead(null);}} className="cursor-pointer">
            <LayoutDashboard className={`w-6 h-6 cursor-pointer transition-colors ${activeView === 'overview' ? 'text-purple-600' : theme.textSub} hover:text-purple-600`} />
          </div>
          <div title="Lead Tickets" onClick={() => {setActiveView('leads'); setSelectedLead(null);}} className="cursor-pointer">
            <Ticket className={`w-6 h-6 cursor-pointer transition-colors ${activeView === 'leads' ? 'text-purple-600' : theme.textSub} hover:text-purple-600`} />
          </div>
          <div title="Teams" onClick={() => {setActiveView('teams'); setSelectedLead(null);}} className="cursor-pointer">
            <Network className={`w-6 h-6 cursor-pointer transition-colors ${activeView === 'teams' ? 'text-purple-600' : theme.textSub} hover:text-purple-600`} />
          </div>
          <div title="Database" onClick={() => {setActiveView('database'); setSelectedLead(null);}} className="cursor-pointer">
            <Database className={`w-6 h-6 cursor-pointer transition-colors ${activeView === 'database' ? 'text-purple-600' : theme.textSub} hover:text-purple-600`} />
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className={`px-8 py-4 flex justify-between items-center relative z-30 transition-colors duration-300 border-b ${theme.card} ${theme.divider}`}>
          <div className="flex items-center space-x-2">
            <h1 className={`font-semibold flex items-center ${theme.textMain}`}>
              BhoomiDwellers CRM <span className={`text-sm font-normal px-2 ${theme.textSub}`}>- Workspace</span>
            </h1>
            {isAdmin && (
              <button onClick={() => setIsAddTeamModalOpen(true)} className={`cursor-pointer ml-4 flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${theme.brandSoftBg} ${theme.brandText} border-purple-500/30 hover:bg-purple-600 hover:text-white`}>
                <Plus className="w-4 h-4 mr-1" /> Add Team
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-5 relative">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`cursor-pointer p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-[#28292A] text-yellow-400 hover:bg-[#3C4043]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Toggle Theme">
              {isDarkMode ? <Sun className="w-5 h-5 cursor-pointer" /> : <Moon className="w-5 h-5 cursor-pointer" />}
            </button>
            <Bell className={`w-5 h-5 cursor-pointer transition-colors ${theme.textSub} hover:${theme.textMain}`} />
            
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-colors ${theme.greenSoftBg} ${theme.greenText} border border-transparent hover:border-green-500/50`}>
              {name.charAt(0).toUpperCase()}
            </div>

            {isProfileOpen && (
              <div className={`absolute top-12 right-0 w-72 rounded-xl shadow-lg p-5 border animate-fadeIn z-50 ${theme.card} ${theme.divider}`}>
                <div className="mb-4">
                  <h3 className={`font-semibold ${theme.textMain}`}>{name}</h3>
                  <p className={`text-xs ${theme.textSub}`}>{email}</p>
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
        <div className={`p-8 max-w-7xl mx-auto w-full overflow-y-auto ${customScrollbar}`}>
          
          {/* VIEW 1: OVERVIEW */}
          {activeView === 'overview' && (
             <div className="animate-fadeIn">
                <h2 className={`text-xl mb-6 ${theme.textMain}`}>Hi, <span className="font-semibold">{name}</span></h2>
                <h3 className={`text-lg font-semibold mb-4 ${theme.textMain}`}>Team Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {teams.map(team => (
                    <div key={team._id} className={`p-6 rounded-2xl shadow-sm border flex flex-col items-center text-center transition-colors duration-300 ${theme.card} ${theme.divider}`}>
                      <Star className="w-6 h-6 text-yellow-500 mb-2" />
                      <h4 className={`font-bold ${theme.textMain}`}>{team.tlName}'s Team</h4>
                      <p className={`text-sm mt-2 ${theme.textSub}`}>{team.employees.length} Employees</p>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* VIEW 2: TEAMS */}
          {activeView === 'teams' && (
            <div className="max-w-5xl mx-auto animate-fadeIn">
              <h1 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>Teams & Hierarchy</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <div key={team._id} className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${theme.card} ${theme.divider}`}>
                    <div className={`p-5 font-bold border-b flex justify-between items-center ${theme.brandSoftBg} ${theme.brandText} ${theme.divider}`}>
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
                    <div className="p-5 space-y-3">
                      {team.employees.map((emp: any, i: number) => (
                        <div key={i} className={`p-3 border rounded-lg flex justify-between transition-colors ${theme.inputBg} ${theme.divider}`}>
                          <span className={theme.textMain}>{emp.name}</span>
                          <span className={`text-xs font-bold ${theme.brandText}`}>{emp.calls} Calls</span>
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
              <h1 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>Client Database</h1>
              <div className={`rounded-xl shadow-sm border overflow-x-auto transition-colors ${theme.card} ${theme.divider} ${customScrollbar}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme.inputBg} ${theme.divider}`}>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Ticket #</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Assignee</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Status</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Site Visit</th>
                      <th className={`px-6 py-4 text-xs font-semibold uppercase ${theme.textSub}`}>Budget</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-[#2D2E30]' : 'divide-gray-100'}`}>
                    {allMyLeads.map((lead) => (
                      <tr key={lead._id} className={`transition-colors ${theme.hoverBg}`}>
                        <td className={`px-6 py-4 font-bold ${theme.brandText}`}>
                          {lead.ticketId || `TKT-${lead._id ? lead._id.toString().slice(-4).toUpperCase() : 'OLD'}`}
                          {lead.isSolved && <span className="ml-2 text-[10px] bg-green-900/30 text-green-500 px-2 py-0.5 rounded border border-green-500/30">SOLVED</span>}
                        </td>
                        <td className={`px-6 py-4 text-sm font-medium ${theme.textMain}`}>{lead.employeeName || 'Unassigned'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${lead.callStatus.includes('Ready') ? `${theme.greenSoftBg} ${theme.greenText} border-green-500/30` : `${theme.yellowSoftBg} ${theme.yellowText} border-yellow-500/30`}`}>
                            {lead.callStatus}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${theme.textSub}`}>{formatDisplaySchedule(lead.schedule)}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${theme.textMain}`}>{lead.budget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: TICKETING & CHAT */}
          {activeView === 'leads' && (
            <div className="max-w-7xl mx-auto animate-fadeIn h-full flex flex-col">
              {!selectedLead ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${theme.textMain}`}>Active Tickets</h1>
                    <button onClick={() => setIsAddLeadModalOpen(true)} className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                      <Plus className="w-4 h-4 inline mr-2" />Create Ticket
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeTickets.map((lead) => (
                      <div key={lead._id} onClick={() => { setSelectedLead(lead); setEditForm(lead); setIsEditingTicket(false); }} className={`cursor-pointer rounded-xl shadow-sm border p-5 transition-all hover:border-purple-500/50 ${theme.card} ${theme.divider}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${theme.brandSoftBg} ${theme.brandText}`}>
                            {lead.ticketId || `TKT-${lead._id ? lead._id.toString().slice(-4).toUpperCase() : 'OLD'}`}
                          </span>
                          <span className={`text-[10px] ${theme.textSub}`}>{lead.callStatus}</span>
                        </div>
                        <h3 className={`text-xl font-bold mt-1 ${theme.textMain}`}>{lead.name}</h3>
                        <p className={`text-sm mb-4 ${theme.textSub}`}>{lead.phone}</p>
                        <div className={`text-sm border-t pt-3 flex justify-between items-center ${theme.textSub} ${theme.divider}`}>
                          <div>Assignee: <span className={`ml-1 font-medium ${theme.textMain}`}>{lead.employeeName || 'Unassigned'}</span></div>
                          <div className="text-[10px]">{formatDisplayDate(lead.date)}</div>
                        </div>
                      </div>
                    ))}
                    {activeTickets.length === 0 && <p className={theme.textSub}>No active tickets found.</p>}
                  </div>
                </>
              ) : (
                <div className={`flex flex-col h-full rounded-2xl shadow-sm border overflow-hidden transition-colors ${theme.card} ${theme.divider}`}>
                  
                  <div className={`border-b p-4 flex justify-between items-center ${theme.inputBg} ${theme.divider}`}>
                    <div className="flex items-center">
                      <button onClick={() => setSelectedLead(null)} className={`cursor-pointer mr-4 p-2 border rounded-lg transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}><ChevronLeft className="w-5 h-5 cursor-pointer" /></button>
                      <div>
                        <h2 className={`text-xl font-bold ${theme.textMain}`}>
                          <span className={theme.brandText}>{selectedLead.ticketId || 'TKT'}</span> - {selectedLead.name}
                        </h2>
                        {selectedLead.lastEditedAt && (
                          <span className={`text-xs flex items-center mt-1 ${theme.textSub}`}><Clock className="w-3 h-3 mr-1"/> Last edited: {selectedLead.lastEditedAt}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 items-center">
                      {isEditingTicket ? (
                        <button onClick={handleSaveEdit} className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center"><Save className="w-4 h-4 mr-2"/> Save Changes</button>
                      ) : (
                        <button onClick={() => setIsEditingTicket(true)} className={`cursor-pointer px-4 py-2 border rounded-lg text-sm font-bold flex items-center transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}><Edit3 className="w-4 h-4 mr-2"/> Edit Ticket</button>
                      )}
                      <button onClick={handleSolveTicket} className="cursor-pointer px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center transition-colors"><CheckCircle2 className="w-4 h-4 mr-2"/> Mark Solved</button>
                      
                      {isAdmin && (
                        <button onClick={handleDeleteTicket} className="cursor-pointer p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors ml-2" title="Delete Ticket">
                          <Trash2 className="w-5 h-5 cursor-pointer" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-1 overflow-hidden">
                    <div className={`w-7/12 p-8 border-r overflow-y-auto ${theme.divider} ${customScrollbar}`}>
                      
                      {isEditingTicket ? (
                        <div className="space-y-4 mb-8">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className={`text-xs ${theme.textSub}`}>Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={`w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Phone</label><input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className={`w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Email</label><input type="email" value={editForm.clientEmail || ''} onChange={e => setEditForm({...editForm, clientEmail: e.target.value})} className={`w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Budget</label><select value={editForm.budget} onChange={e => setEditForm({...editForm, budget: e.target.value})} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Under 50L</option><option>50L - 1Cr</option><option>1Cr - 3Cr</option></select></div>
                            <div className="col-span-2"><label className={`text-xs ${theme.textSub}`}>Client Address</label><input type="text" value={editForm.clientAddress || ''} onChange={e => setEditForm({...editForm, clientAddress: e.target.value})} className={`w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div className="col-span-2"><label className={`text-xs ${theme.textSub}`}>Site Visit Address</label><input type="text" value={editForm.siteAddress || ''} onChange={e => setEditForm({...editForm, siteAddress: e.target.value})} className={`w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Schedule Date</label><input type="datetime-local" value={editForm.schedule || ''} onChange={e => setEditForm({...editForm, schedule: e.target.value})} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} /></div>
                            <div><label className={`text-xs ${theme.textSub}`}>Status</label><select value={editForm.callStatus} onChange={e => setEditForm({...editForm, callStatus: e.target.value})} className={`cursor-pointer w-full p-2 border rounded mt-1 outline-none ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}><option>Pending</option><option>Client Ready</option><option>Not Ready</option></select></div>
                          </div>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-2 gap-6 mb-8 p-6 rounded-xl border ${theme.inputBg} ${theme.divider}`}>
                          <div><p className={`text-xs mb-1 ${theme.textSub}`}>Email</p><p className={`font-semibold flex items-center ${theme.textMain}`}><Mail className="w-3 h-3 mr-2 text-gray-500"/>{selectedLead.clientEmail || 'N/A'}</p></div>
                          <div><p className={`text-xs mb-1 ${theme.textSub}`}>Phone</p><p className={`font-semibold flex items-center ${theme.textMain}`}><Phone className="w-3 h-3 mr-2 text-gray-500"/>{selectedLead.phone}</p></div>
                          <div><p className={`text-xs mb-1 ${theme.textSub}`}>Budget</p><p className={`font-semibold ${theme.textMain}`}>{selectedLead.budget}</p></div>
                          <div><p className={`text-xs mb-1 ${theme.textSub}`}>Status</p><p className={`font-semibold ${theme.brandText}`}>{selectedLead.callStatus}</p></div>
                          <div className="col-span-2"><p className={`text-xs mb-1 ${theme.textSub}`}>Client Address</p><p className={`font-semibold ${theme.textMain}`}>{selectedLead.clientAddress || 'N/A'}</p></div>
                          <div className="col-span-2"><p className={`text-xs mb-1 flex items-center ${theme.textSub}`}><MapPin className="w-3 h-3 mr-1"/> Site Visit Address</p><p className={`font-semibold text-blue-500`}>{selectedLead.siteAddress || 'N/A'}</p></div>
                          <div className="col-span-2"><p className={`text-xs mb-1 ${theme.textSub}`}>Scheduled Time</p><p className={`font-semibold ${theme.textMain}`}>{formatDisplaySchedule(selectedLead.schedule)}</p></div>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <button className={`cursor-pointer flex-1 py-4 rounded-xl border transition-colors hover:opacity-80 ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'}`}><Mic className="w-8 h-8 mx-auto mb-2 cursor-pointer" /><b>Call via IVR</b></button>
                        <button className={`cursor-pointer flex-1 py-4 rounded-xl border transition-colors hover:opacity-80 ${isDarkMode ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}`}><MessageCircle className="w-8 h-8 mx-auto mb-2 cursor-pointer" /><b>Send WhatsApp</b></button>
                      </div>
                    </div>
                    
                    <div className={`w-5/12 flex flex-col ${theme.inputBg}`}>
                      <div className={`flex-1 p-6 overflow-y-auto space-y-4 ${customScrollbar}`}>
                        {selectedLead.followUps?.map((note: any, i: number) => {
                          const isCurrentUser = note.author === name;
                          return (
                            <div key={i} className={`relative p-4 rounded-xl shadow-sm border transition-colors ${theme.card} ${isCurrentUser ? 'border-purple-500/50 ml-8 rounded-tr-none' : `${theme.divider} mr-8 rounded-tl-none`}`}>
                              {isCurrentUser && (
                                <svg className="absolute top-[-1px] -right-[8px] w-[9px] h-[13px]" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M0 0H9L0 12V0Z" fill={isDarkMode ? '#1E1F20' : '#ffffff'} stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1"/>
                                  <line x1="0" y1="0" x2="0" y2="13" stroke={isDarkMode ? '#1E1F20' : '#ffffff'} strokeWidth="2"/>
                                </svg>
                              )}
                              {!isCurrentUser && (
                                <svg className="absolute top-[-1px] -left-[8px] w-[9px] h-[13px]" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 0H0L9 12V0Z" fill={isDarkMode ? '#1E1F20' : '#ffffff'} stroke={isDarkMode ? '#2D2E30' : '#e5e7eb'} strokeWidth="1"/>
                                  <line x1="9" y1="0" x2="9" y2="13" stroke={isDarkMode ? '#1E1F20' : '#ffffff'} strokeWidth="2"/>
                                </svg>
                              )}
                              <div className="flex justify-between mb-2">
                                <span className={`font-bold text-sm ${theme.textMain}`}>{note.author}</span>
                                <span className={`text-xs ${theme.textSub}`}>{note.time}</span>
                              </div>
                              <p className={`text-sm ${theme.textMain}`}>{note.text}</p>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className={`p-4 border-t flex space-x-2 transition-colors ${theme.card} ${theme.divider}`}>
                        <textarea value={newFollowUpNote} onChange={(e) => setNewFollowUpNote(e.target.value)} placeholder="Add note..." className={`flex-1 p-3 border rounded-lg text-sm outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} ${customScrollbar}`} />
                        <button onClick={handleAddFollowUp} className="cursor-pointer p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"><Send className="w-5 h-5 cursor-pointer" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ADMIN TEAM MODAL - CREATE NEW TEAM */}
      {isAddTeamModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-2xl w-full max-w-lg overflow-hidden flex flex-col border shadow-2xl ${theme.card} ${theme.divider}`}>
            <div className={`p-6 border-b flex justify-between ${theme.divider} ${theme.inputBg}`}><h2 className={`text-xl font-bold ${theme.textMain}`}>Create Team</h2><button onClick={() => setIsAddTeamModalOpen(false)} className={`cursor-pointer ${theme.textSub}`}><X className="cursor-pointer" /></button></div>
            <div className={`p-6 overflow-y-auto max-h-[60vh] ${customScrollbar}`}>
              
              <label className={`block text-xs font-bold mb-2 ${theme.textSub}`}>Select Team Lead</label>
              <select value={newTeam.tlEmail} onChange={(e) => setNewTeam({...newTeam, tlEmail: e.target.value})} className={`cursor-pointer w-full p-3 border rounded-lg mb-6 outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                <option value="">-- Choose User --</option>
                {registeredUsers.map(u => <option key={u.email} value={u.email}>{u.name} - {u.email}</option>)}
              </select>

              <div className="flex justify-between mb-2">
                <label className={`text-xs font-bold ${theme.textSub}`}>Assign Employees</label>
                <button onClick={() => setNewTeam({...newTeam, employees: [...newTeam.employees, { email: '' }]})} className="cursor-pointer text-xs text-purple-500 font-bold">+ Add Row</button>
              </div>

              {newTeam.employees.map((emp, i) => {
                const currentlySelectedInOtherDropdowns = newTeam.employees.filter((_, idx) => idx !== i).map(e => e.email);
                const dropdownOptions = baseAvailableEmployees.filter(user => !currentlySelectedInOtherDropdowns.includes(user.email));

                return (
                  <div key={i} className="flex space-x-2 mb-2">
                    <select value={emp.email} onChange={(e) => {const emps = [...newTeam.employees]; emps[i].email = e.target.value; setNewTeam({...newTeam, employees: emps});}} className={`cursor-pointer flex-1 p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                      <option value="">-- Select Employee --</option>
                      {dropdownOptions.map(u => <option key={u.email} value={u.email}>{u.name} - {u.email}</option>)}
                    </select>
                    {newTeam.employees.length > 1 && (
                      <button onClick={() => {const emps = newTeam.employees.filter((_, idx) => idx !== i); setNewTeam({...newTeam, employees: emps})}} className={`cursor-pointer p-3 border rounded-lg transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.textSub} hover:text-red-500`}>
                        <X className="w-5 h-5 cursor-pointer" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={`p-6 border-t flex justify-end space-x-3 ${theme.divider} ${theme.inputBg}`}>
              <button onClick={() => setIsAddTeamModalOpen(false)} className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}>Cancel</button>
              <button onClick={handleSaveNewTeam} className="cursor-pointer px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TEAM MODAL - EDIT EXISTING TEAM */}
      {isEditTeamModalOpen && isAdmin && editingTeam && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-2xl w-full max-w-lg overflow-hidden flex flex-col border shadow-2xl ${theme.card} ${theme.divider}`}>
            <div className={`p-6 border-b flex justify-between ${theme.divider} ${theme.inputBg}`}>
              <h2 className={`text-xl font-bold ${theme.textMain}`}>Edit Team: {editingTeam.tlName}</h2>
              <button onClick={() => {setIsEditTeamModalOpen(false); setEditingTeam(null);}} className={`cursor-pointer ${theme.textSub}`}><X className="cursor-pointer" /></button>
            </div>
            
            <div className={`p-6 overflow-y-auto max-h-[60vh] ${customScrollbar}`}>
              <div className="flex justify-between mb-2">
                <label className={`text-xs font-bold ${theme.textSub}`}>Assign Employees</label>
                <button onClick={() => setEditingTeam({...editingTeam, employees: [...editingTeam.employees, { email: '' }]})} className="cursor-pointer text-xs text-purple-500 font-bold">+ Add Row</button>
              </div>

              {editingTeam.employees.map((emp: any, i: number) => {
                // For Edit Mode, we need to know who is already locked in OTHER teams to prevent duplicate assignments
                const assignedInOtherTeams = teams.filter(t => t._id !== editingTeam._id).flatMap(t => t.employees.map((e: any) => e.email));
                const currentlySelectedInOtherDropdowns = editingTeam.employees.filter((_: any, idx: number) => idx !== i).map((e: any) => e.email);
                
                // Final available list: Registered users NOT in other teams, NOT the TL, and NOT selected in another dropdown box here
                const dropdownOptions = registeredUsers.filter(user => 
                  !assignedInOtherTeams.includes(user.email) && 
                  user.email !== editingTeam.tlEmail &&
                  !currentlySelectedInOtherDropdowns.includes(user.email)
                );

                return (
                  <div key={i} className="flex space-x-2 mb-2">
                    <select value={emp.email} onChange={(e) => {const emps = [...editingTeam.employees]; emps[i].email = e.target.value; setEditingTeam({...editingTeam, employees: emps});}} className={`cursor-pointer flex-1 p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                      <option value="">-- Select Employee --</option>
                      {dropdownOptions.map(u => <option key={u.email} value={u.email}>{u.name} - {u.email}</option>)}
                    </select>
                    <button onClick={() => {const emps = editingTeam.employees.filter((_: any, idx: number) => idx !== i); setEditingTeam({...editingTeam, employees: emps})}} className={`cursor-pointer p-3 border rounded-lg transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.textSub} hover:text-red-500`}>
                      <X className="w-5 h-5 cursor-pointer" />
                    </button>
                  </div>
                );
              })}
              {editingTeam.employees.length === 0 && <p className={`text-sm ${theme.textSub}`}>No employees assigned to this team.</p>}
            </div>
            <div className={`p-6 border-t flex justify-end space-x-3 ${theme.divider} ${theme.inputBg}`}>
              <button onClick={() => {setIsEditTeamModalOpen(false); setEditingTeam(null);}} className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${theme.card} ${theme.divider} ${theme.textMain} ${theme.hoverBg}`}>Cancel</button>
              <button onClick={handleSaveEditTeam} className="cursor-pointer px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Save Updates</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-2xl w-full max-w-lg overflow-hidden flex flex-col border shadow-2xl max-h-[90vh] ${theme.card} ${theme.divider}`}>
            <div className={`p-6 border-b flex justify-between ${theme.divider} ${theme.inputBg}`}><h2 className={`text-xl font-bold ${theme.textMain}`}>Create Ticket</h2><button onClick={() => setIsAddLeadModalOpen(false)} className={`cursor-pointer ${theme.textSub}`}><X className="cursor-pointer" /></button></div>
            <form onSubmit={handleSaveSingleLead} className={`p-6 space-y-4 overflow-y-auto flex-1 ${customScrollbar}`}>
              <input type="text" required placeholder="Client Name *" value={newLeadForm.name} onChange={(e) => setNewLeadForm({...newLeadForm, name: e.target.value})} className={`w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
              <div className="grid grid-cols-2 gap-4">
                <input type="tel" required placeholder="Phone Number *" value={newLeadForm.phone} onChange={(e) => setNewLeadForm({...newLeadForm, phone: e.target.value})} className={`w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
                <input type="email" placeholder="Email Address" value={newLeadForm.clientEmail} onChange={(e) => setNewLeadForm({...newLeadForm, clientEmail: e.target.value})} className={`w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
              </div>
              <input type="text" placeholder="Client Address" value={newLeadForm.clientAddress} onChange={(e) => setNewLeadForm({...newLeadForm, clientAddress: e.target.value})} className={`w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
              <input type="text" placeholder="Proposed Site Visit Address" value={newLeadForm.siteAddress} onChange={(e) => setNewLeadForm({...newLeadForm, siteAddress: e.target.value})} className={`w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder}`} />
              
              <div className="grid grid-cols-2 gap-4">
                <select value={newLeadForm.budget} onChange={(e) => setNewLeadForm({...newLeadForm, budget: e.target.value})} className={`cursor-pointer w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                  <option value="Under 50L">Under 50L</option><option value="50L - 1Cr">50L - 1Cr</option><option value="1Cr - 3Cr">1Cr - 3Cr</option>
                </select>
                <select value={newLeadForm.callStatus} onChange={(e) => setNewLeadForm({...newLeadForm, callStatus: e.target.value})} className={`cursor-pointer w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}>
                  <option value="Pending">Pending</option><option value="Client Ready">Client Ready</option><option value="Not Ready">Not Ready</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${theme.textSub}`}>Schedule Site Visit (Optional)</label>
                <input type="datetime-local" value={newLeadForm.schedule} onChange={(e) => setNewLeadForm({...newLeadForm, schedule: e.target.value})} className={`cursor-pointer w-full p-3 border rounded-lg outline-none focus:border-purple-500 transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} />
              </div>
              <button type="submit" className="cursor-pointer w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg mt-4 font-bold transition-colors">Save Ticket</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() { return <Suspense><DashboardContent /></Suspense>; }