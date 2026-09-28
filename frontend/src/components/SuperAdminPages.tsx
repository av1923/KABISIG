import { useState } from 'react';
import { 
  LayoutDashboard, Building2, BarChart3, History, 
  Plus, Edit2, Search, Filter, Download, FileSpreadsheet,
  CheckCircle2, AlertTriangle, Users, Wallet, Calendar,
  ArrowUpRight, Lock, Eye, ShieldCheck, FileText, Check,
  X, ChevronDown, RefreshCw, Layers, Award, TrendingUp, LogOut, Menu,
  Upload, Image as ImageIcon, Trash2, Mail, Loader2, Settings, AlertCircle,
  Copy, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarangayTenant, Program, SystemAuditLog } from '../types';
import { DEFAULT_BARANGAY_LOGOS, BARANGAY_DISTRICTS } from '../data';
import { KabisigLogo } from './PublicPages';
import { UserMenu } from './UserMenu';
import ProgramTrendD3 from './charts/ProgramTrendD3';
import { kabisigApi } from '../lib/api';

interface SuperAdminPagesProps {
  barangays: BarangayTenant[];
  programs: Program[];
  auditLogs: SystemAuditLog[];
  onAddBarangay: (t: BarangayTenant) => void;
  onUpdateBarangay: (id: string, updated: Partial<BarangayTenant>) => Promise<void> | void;
  onLogout: () => void;
  userEmail: string;
}

export default function SuperAdminPages({
  barangays,
  programs,
  auditLogs,
  onAddBarangay,
  onUpdateBarangay,
  onLogout,
  userEmail
}: SuperAdminPagesProps) {
  const toNumber = (value: number | string | null | undefined) => {
    const parsed = typeof value === 'number' ? value : Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'barangays' | 'analytics' | 'audit'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // LYDP Report Modal
  const [showLydpModal, setShowLydpModal] = useState(false);

  // Dedicated Assign SK Chairperson Modal State (Email-only)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningBarangay, setAssigningBarangay] = useState<BarangayTenant | null>(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignNotice, setAssignNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [districtFilter, setDistrictFilter] = useState<'All' | 'District 1' | 'District 2'>('All');

  // Tenant Provisioning Modals
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState<BarangayTenant | null>(null);
  const [modalNotice, setModalNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalForm, setModalForm] = useState({
    name: '', chairperson: '', chairpersonEmail: '',
    youthPopulation: 0, totalBudget: 0, contact: '',
    status: '' as 'Active' | 'Inactive' | '',
    logo: ''
  });

  // Calculate Aggregated Metrics
  const totalYouthPop = barangays.reduce((sum, b) => sum + toNumber(b.youthPopulation), 0);
  const totalCityBudget = barangays.reduce((sum, b) => sum + toNumber(b.totalBudget), 0);
  const totalCitySpent = barangays.reduce((sum, b) => sum + toNumber(b.spentBudget), 0);
  const totalActivePrograms = programs.length + barangays.reduce((sum, b) => sum + toNumber(b.activePrograms), 0);
  const avgBudgetUtilization = totalCityBudget > 0 ? Math.round((totalCitySpent / totalCityBudget) * 100) : 0;

  // Consistently sort barangays in alphabetical order
  const sortedBarangays = [...barangays].sort((a, b) => a.name.localeCompare(b.name));

  // Data for Charts
  const chartBarangayData = sortedBarangays.map(b => {
    const youthPopulation = toNumber(b.youthPopulation);
    const totalBudget = toNumber(b.totalBudget);
    const spentBudget = toNumber(b.spentBudget);
    const registeredYouth = youthPopulation;

    return {
      id: b.id,
      name: b.name.length > 10 ? b.name.slice(0, 10) + '...' : b.name,
      fullName: b.name,
      youthPopulation,
      registeredYouth,
      activePrograms: toNumber(b.activePrograms),
      budget: Math.round(totalBudget / 1000), // in thousands
      spent: Math.round(spentBudget / 1000),
      utilization: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0
    };
  });

  const programTrendData = chartBarangayData.map((item) => {
    const brgyPrograms = programs.filter(p => (p as any).tenant_id === item.id || (p as any).barangayId === item.id);
    return {
      label: item.name,
      programs: brgyPrograms.length || item.activePrograms,
      participants: item.registeredYouth,
    };
  });

  const pieBudgetData = [
    { name: 'Governance & Admin', value: Math.round(totalCityBudget * 0.35), color: '#091d64' },
    { name: 'Education & Scholarships', value: Math.round(totalCityBudget * 0.25), color: '#2563eb' },
    { name: 'Health & Sports', value: Math.round(totalCityBudget * 0.20), color: '#059669' },
    { name: 'Environmental Protection', value: Math.round(totalCityBudget * 0.12), color: '#d97706' },
    { name: 'Active Citizenship', value: Math.round(totalCityBudget * 0.08), color: '#7c3aed' }
  ];

  // Filtered Barangays list
  const filteredBarangays = sortedBarangays.filter(b => {
    const bgyDistrict = b.district || BARANGAY_DISTRICTS[b.name] || 'District 1';
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.chairperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.chairpersonEmail && b.chairpersonEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || bgyDistrict === districtFilter;
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const handleOpenAssignModal = (b?: BarangayTenant) => {
    const target = b || sortedBarangays[0];
    setAssigningBarangay(target || null);
    setAssignEmail(target?.chairpersonEmail && target.chairpersonEmail !== '' ? target.chairpersonEmail : '');
    setAssignError(null);
    setAssignNotice(null);
    setCopiedLink(false);
    setShowAssignModal(true);
  };

  const handleAssignChairpersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBarangay) return;

    const email = assignEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAssignError('Please enter a valid official email address.');
      setAssignNotice(null);
      return;
    }

    setIsAssigning(true);
    setAssignError(null);
    setAssignNotice(null);

    try {
      const res = await kabisigApi.assignChairpersonByEmail(assigningBarangay.id, email);
      if (!res.success) {
        setAssignError(res.message || 'Failed to dispatch Chairperson assignment.');
        setAssignNotice({ type: 'error', text: res.message || 'Failed to dispatch Chairperson assignment.' });
        setIsAssigning(false);
        return;
      }

      await onUpdateBarangay(assigningBarangay.id, {
        chairperson: res.data?.full_name || (assigningBarangay.chairperson && assigningBarangay.chairperson !== 'Unassigned' ? assigningBarangay.chairperson : 'Pending Invitation'),
        chairpersonEmail: email,
      });

      setShowAssignModal(false);
      setAssigningBarangay(null);
      setAssignEmail('');
      setAssignNotice(null);
      setAssignError(null);
    } catch (err: any) {
      setAssignError(err.message || 'Network connection failed.');
      setAssignNotice({ type: 'error', text: err.message || 'Network connection failed.' });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filtered Audit Logs - SK President / Federation President (ONLY SK Chairperson history)
  const filteredAuditLogs = auditLogs.filter(log => {
    // Restrict strictly to SK Chairperson / Barangay Admin history
    const isChairpersonLog = log.role === 'Barangay Admin' || log.role === 'SK Chairperson' || log.user.toLowerCase().includes('chairperson') || log.user.startsWith('Hon.');
    if (!isChairpersonLog) return false;

    if (!auditSearchTerm.trim()) return true;

    const searchValue = auditSearchTerm.trim().toLowerCase();
    const searchableText = [log.user, log.role, log.action, log.details].join(' ').toLowerCase();
    return searchableText.includes(searchValue);
  });

  const handleEditClick = (b: BarangayTenant) => {
    setEditingBarangay(b);
    setModalNotice(null);
    const defaultLogo = DEFAULT_BARANGAY_LOGOS[b.name] || '';
    setModalForm({
      name: b.name,
      chairperson: b.chairperson && b.chairperson !== 'Unassigned' ? b.chairperson : '',
      chairpersonEmail: b.chairpersonEmail || '',
      youthPopulation: b.youthPopulation || 0,
      totalBudget: b.totalBudget || 0,
      contact: b.contact || '',
      status: b.status || '',
      logo: b.logo || defaultLogo
    });
    setShowModal(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setModalNotice({ type: 'error', text: 'File size exceeds 2MB. Please choose a smaller image.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setModalForm(prev => ({ ...prev, logo: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBarangay = async () => {
    const email = modalForm.chairpersonEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setModalNotice({ type: 'error', text: 'Please enter a valid official email address.' });
      return;
    }

    const currentName = editingBarangay?.name || modalForm.name;
    const defaultLogo = DEFAULT_BARANGAY_LOGOS[currentName] || '';
    const nextStatus = modalForm.status || editingBarangay?.status || 'Active';

    const payload: Partial<BarangayTenant> & { chairpersonEmail?: string; contact?: string; logo?: string } = {
      ...modalForm,
      chairperson: modalForm.chairperson.trim(),
      chairpersonEmail: email || editingBarangay?.chairpersonEmail || '',
      contact: modalForm.contact.trim(),
      youthPopulation: modalForm.youthPopulation || 0,
      status: nextStatus,
      logo: modalForm.logo || defaultLogo
    };

    if (modalForm.totalBudget > 0) {
      payload.totalBudget = modalForm.totalBudget;
      payload.allocatedBudget = modalForm.totalBudget;
    } else {
      delete payload.totalBudget;
      delete payload.allocatedBudget;
    }

    setIsSaving(true);
    try {
      if (editingBarangay) {
        await onUpdateBarangay(editingBarangay.id, payload);
      } else {
        const matched = barangays.find(b => b.name.toLowerCase() === modalForm.name.trim().toLowerCase());
        if (matched) {
          await onUpdateBarangay(matched.id, payload);
        } else {
          setModalNotice({ type: 'error', text: 'Barangay must be one of the 27 official Naga City barangays.' });
          setIsSaving(false);
          return;
        }
      }
      setModalNotice({
        type: 'success',
        text: `Barangay ${currentName} settings and SK Chairperson assignment saved permanently to the database.`
      });
      setTimeout(() => {
        setShowModal(false);
      }, 1200);
    } catch (err: any) {
      setModalNotice({
        type: 'error',
        text: `Failed to save to database: ${err.message || 'Make sure you are logged in as Super Admin and the backend server is operational.'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
      
      {/* MOBILE TOP HEADER BAR */}
      <div className="lg:hidden bg-[#091d64] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <KabisigLogo className="scale-75" />
          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-amber-300">Super Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <KabisigLogo className="scale-90" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                Municipal System Administration
              </div>
              <button
                onClick={() => { setActiveMenu('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'dashboard' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-amber-400" />
                Dashboard
              </button>
              <button
                onClick={() => { setActiveMenu('barangays'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'barangays' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <Building2 className="w-4.5 h-4.5 text-amber-400" />
                Barangay Management
              </button>
              <button
                onClick={() => { setActiveMenu('analytics'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'analytics' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <BarChart3 className="w-4.5 h-4.5 text-amber-400" />
                Analytics & LYDP Reports
              </button>
              <button
                onClick={() => { setActiveMenu('audit'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'audit' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <History className="w-4.5 h-4.5 text-amber-400" />
                Audit Logs
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={onLogout}
              className="w-full py-3 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR - DESKTOP ONLY */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col justify-between h-full flex-shrink-0 z-40 shadow-xs">
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 pb-4 border-b border-slate-50 flex flex-col items-center">
            <KabisigLogo className="scale-90" />
          </div>

          <nav className="p-4 space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">
              Municipal System Administration
            </div>
            
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeMenu === 'dashboard' 
                  ? 'bg-[#091d64] text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeMenu === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
              Dashboard
            </button>

            <button
              onClick={() => setActiveMenu('barangays')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeMenu === 'barangays' 
                  ? 'bg-[#091d64] text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeMenu === 'barangays' ? 'text-white' : 'text-slate-400'}`} />
              Barangay Management
            </button>

            <button
              onClick={() => setActiveMenu('analytics')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeMenu === 'analytics' 
                  ? 'bg-[#091d64] text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeMenu === 'analytics' ? 'text-white' : 'text-slate-400'}`} />
              Analytics
            </button>

            <button
              onClick={() => setActiveMenu('audit')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                activeMenu === 'audit' 
                  ? 'bg-[#091d64] text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <History className={`w-4 h-4 ${activeMenu === 'audit' ? 'text-white' : 'text-slate-400'}`} />
              Audit Logs
            </button>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Log Out
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* RIGHT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* DESKTOP TOP HEADER */}
        <header className="hidden lg:flex bg-white border-b border-slate-100 h-20 items-center justify-between px-8 flex-shrink-0 z-30">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="font-sans font-bold text-[#091d64] text-2xl tracking-tight leading-none">
                {activeMenu === 'dashboard' && 'City-Wide Federation Oversight'}
                {activeMenu === 'barangays' && 'Barangay Tenant Management'}
                {activeMenu === 'analytics' && 'Municipal Youth Analytics & LYDP Reports'}
                {activeMenu === 'audit' && 'System Audit Trails & Compliance Logs'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#091d64] text-white">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Naga City SK Federation Central Management Hub</p>
          </div>

          <div className="flex items-center gap-5">
            <UserMenu 
              userName="Hon. Federation President"
              role="SK Federation President (Super Admin)"
              onLogout={onLogout}
            />
          </div>
        </header>

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-8 bg-[#f8fafc]">
          
          {/* ==================== 1. DASHBOARD TAB ==================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* TOP METRIC CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Barangays</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-[#091d64]">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-[#091d64] block">{barangays.length}</span>
                  <p className="text-[11px] text-slate-400 font-medium">Component Barangays Connected</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Youth Pop.</span>
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-[#091d64] block">{totalYouthPop.toLocaleString()}</span>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    {totalYouthPop > 0 ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{totalYouthPop} Registered KK Members</span>
                      </>
                    ) : (
                      '0 Registered KK Members'
                    )}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total City AIP Budget</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-emerald-600 block">
                    {totalCityBudget > 0 ? `₱${(totalCityBudget / 1000000).toFixed(1)}M` : '₱0'}
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {totalCitySpent > 0 ? `₱${(totalCitySpent / 1000000).toFixed(1)}M Spent (${avgBudgetUtilization}%)` : '₱0 Spent (0%)'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Youth Programs</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-amber-600 block">{totalActivePrograms}</span>
                  <p className="text-[11px] text-slate-400 font-medium">Across all 27 Barangays</p>
                </div>
              </div>

              {/* CITY-WIDE QUICK ACTIONS BAR */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl text-slate-800 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Super Admin Tools</span>
                  <h3 className="font-sans font-black text-lg text-slate-900">Super Admin Quick Actions</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingBarangay(null);
                      setModalForm({ name: '', chairperson: '', chairpersonEmail: '', youthPopulation: 0, totalBudget: 0, contact: '', status: 'Active', logo: '' });
                      setShowModal(true);
                    }}
                    className="px-4 py-2.5 bg-white text-[#091d64] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs border border-slate-200"
                  >
                    <Plus className="w-4 h-4" /> Provision New Tenant
                  </button>
                  <button 
                    onClick={() => setShowLydpModal(true)}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-4 h-4" /> Generate LYDP Report
                  </button>
                </div>
              </div>

              {/* OVERVIEW CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* BAR CHART: YOUTH POPULATION PER BARANGAY */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs lg:col-span-2 space-y-4 min-w-0">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-sans font-bold text-slate-800 text-sm">Youth Population & KK Registration by Barangay</h4>
                      <p className="text-xs text-slate-400">Total youth population vs. registered KK members across component barangays</p>
                    </div>
                  </div>
                  <div className="h-64 w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <BarChart data={chartBarangayData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="youthPopulation" fill="#091d64" name="Total Youth Pop." radius={[4, 4, 0, 0]} />
                        <Bar dataKey="registeredYouth" fill="#2563eb" name="Registered KK Members" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PIE CHART: BUDGET ALLOCATION BREAKDOWN */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4 min-w-0">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="font-sans font-bold text-slate-800 text-sm">Municipal Budget Allocation</h4>
                    <p className="text-xs text-slate-400">Distribution by Youth Development Pillar</p>
                  </div>
                  {totalCityBudget === 0 ? (
                    <div className="h-52 w-full flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-2 font-bold text-lg">
                        ₱0
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Budget Allocated Yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Barangay AIP budgets have not been inputted yet</p>
                    </div>
                  ) : (
                    <div className="h-52 w-full min-w-0 overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                        <PieChart>
                          <Pie data={pieBudgetData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                            {pieBudgetData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₱${(value / 1000000).toFixed(2)}M`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {pieBudgetData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 truncate max-w-[140px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.value > 0 ? `₱${(item.value / 1000000).toFixed(1)}M` : '₱0'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* TOP PERFORMING BARANGAYS QUICK TABLE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-sm">Component Barangay Performance Overview</h4>
                    <p className="text-xs text-slate-400">Budget utilization rate & ABYIP compliance status</p>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('barangays')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    View All {barangays.length} Barangays →
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-3">Barangay</th>
                        <th className="p-3">SK Chairperson</th>
                        <th className="p-3">Youth Population</th>
                        <th className="p-3">Total AIP Budget</th>
                        <th className="p-3">Budget Spent</th>
                        <th className="p-3">Utilization Rate</th>
                        <th className="p-3">ABYIP Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {sortedBarangays.slice(0, 5).map(b => {
                        const totalBudget = toNumber(b.totalBudget);
                        const spentBudget = toNumber(b.spentBudget);
                        const spent = spentBudget;
                        const rate = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-[#091d64]">
                              <div className="flex items-center gap-2">
                                {b.logo ? (
                                  <img src={b.logo} alt="" className="w-6 h-6 rounded-lg object-contain border border-slate-200 bg-white p-0.5 flex-shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#091d64] font-bold text-[10px] flex items-center justify-center border border-indigo-100 flex-shrink-0">
                                    {b.name.charAt(0)}
                                  </div>
                                )}
                                <span>Brgy. {b.name}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold">
                              {b.chairperson && b.chairperson !== 'Unassigned' ? (
                                <div className="flex items-center gap-1.5">
                                  <span>{b.chairperson}</span>
                                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Assigned
                                  </span>
                                </div>
                              ) : (
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono">{toNumber(b.youthPopulation).toLocaleString()}</td>
                            <td className="p-3 font-mono font-bold text-slate-800">₱{totalBudget.toLocaleString()}</td>
                            <td className="p-3 font-mono text-emerald-700">₱{spent.toLocaleString()}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${rate > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                                    style={{ width: `${rate}%` }} 
                                  />
                                </div>
                                <span className={`text-[11px] font-bold ${rate > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>{rate}%</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Approved
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 2. BARANGAYS TAB ==================== */}
          {activeMenu === 'barangays' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* CONTROL & FILTER BAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search barangay name, chairperson, or email..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#091d64]"
                    />
                  </div>

                  {/* District Filter */}
                  <select 
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value as any)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#091d64] cursor-pointer"
                  >
                    <option value="All">All Districts</option>
                    <option value="District 1">District 1 (11 Barangays)</option>
                    <option value="District 2">District 2 (16 Barangays)</option>
                  </select>

                  {/* Status Filter */}
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#091d64] cursor-pointer"
                  >
                    <option value="All">All Status ({barangays.length})</option>
                    <option value="Active">Active ({barangays.filter(b => b.status === 'Active').length})</option>
                    <option value="Inactive">Inactive ({barangays.filter(b => b.status === 'Inactive').length})</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{filteredBarangays.length} of 27 Naga Barangays</span>
                </div>
              </div>

              {/* DATA TABLE: BARANGAY NAME | DISTRICT | ASSIGNED CHAIRPERSON | STATUS | ACTION */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Barangay Name</th>
                        <th className="py-3.5 px-4 font-bold">District</th>
                        <th className="py-3.5 px-4 font-bold">Assigned Chairperson</th>
                        <th className="py-3.5 px-4 font-bold">Status</th>
                        <th className="py-3.5 px-4 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredBarangays.map(b => {
                        const bDistrict = b.district || BARANGAY_DISTRICTS[b.name] || 'District 1';
                        const isAssigned = b.chairperson && b.chairperson.trim() !== '' && b.chairperson.toLowerCase() !== 'unassigned';

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Barangay Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {b.logo ? (
                                  <img 
                                    src={b.logo} 
                                    alt={b.name} 
                                    className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-2xs shrink-0" 
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#091d64] font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                                    {b.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-slate-900 block text-xs">Brgy. {b.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {b.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </td>

                            {/* District */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                bDistrict === 'District 1'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                              }`}>
                                {bDistrict}
                              </span>
                            </td>

                            {/* Assigned Chairperson (Name & Email) */}
                            <td className="py-3.5 px-4">
                              {isAssigned ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {b.chairperson === 'Pending Invitation' ? 'Pending Invitation' : b.chairperson}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Assigned
                                    </span>
                                  </div>
                                  {b.chairpersonEmail ? (
                                    <span className="text-[11px] text-slate-500 font-mono block">
                                      {b.chairpersonEmail}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic block">No email recorded</span>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                      Unassigned
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 italic block">
                                    No chairperson assigned yet
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                b.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                {b.status}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleEditClick(b)}
                                className="p-1.5 text-slate-500 hover:text-[#091d64] hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                                title="Configure AIP Budget & Settings"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 3. ANALYTICS TAB ==================== */}
          {activeMenu === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* LYDP REPORT GENERATOR BANNER */}
              <div className="bg-gradient-to-r from-[#091d64] via-[#102a83] to-[#1e3a8a] p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-400 text-amber-950">
                      RA 10742 Compliance
                    </span>
                    <span className="text-xs text-blue-200 font-medium">Local Youth Development Plan (LYDP 2026-2029)</span>
                  </div>
                  <h3 className="font-sans font-black text-xl">Municipal Youth Development Master Plan Analytics</h3>
                  <p className="text-xs text-blue-100 max-w-2xl">
                    Aggregated comparative indicators for the 3-Year LYDP strategic priority pillars across all 27 component barangays.
                  </p>
                </div>
                <button 
                  onClick={() => setShowLydpModal(true)}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer flex-shrink-0"
                >
                  <FileText className="w-4 h-4" /> Generate Official LYDP Report
                </button>
              </div>

              {/* COMPARISON CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CHART 1: YOUTH REGISTRATION COMPARISON */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4 min-w-0">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="font-sans font-bold text-slate-800 text-sm">Youth Population & Registration Rate Comparison</h4>
                    <p className="text-xs text-slate-400">Total youth vs. KK registered members by barangay</p>
                  </div>
                  <div className="h-64 w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <BarChart data={chartBarangayData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="youthPopulation" fill="#091d64" name="Youth Pop." radius={[4, 4, 0, 0]} />
                        <Bar dataKey="registeredYouth" fill="#3b82f6" name="KK Registered" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART 2: BUDGET VS SPENT COMPARISON */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4 min-w-0">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="font-sans font-bold text-slate-800 text-sm">AIP Budget Allocation vs. Actual Expenditure (in ₱1k)</h4>
                    <p className="text-xs text-slate-400">Financial execution tracking across component barangays</p>
                  </div>
                  <div className="h-64 w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <BarChart data={chartBarangayData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip formatter={(val: number) => `₱${val}k`} />
                        <Legend />
                        <Bar dataKey="budget" fill="#059669" name="Total AIP Budget" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="spent" fill="#10b981" name="Actual Spent" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              <ProgramTrendD3 data={programTrendData} />

              {/* DETAILED BARANGAYS COMPARISON TABLE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-sm">Barangay Performance & Metrics Matrix</h4>
                    <p className="text-xs text-slate-400">Comprehensive municipal statistics table</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-3">Barangay Name</th>
                        <th className="p-3">SK Chairperson</th>
                        <th className="p-3">Youth Population</th>
                        <th className="p-3">KK Registered</th>
                        <th className="p-3">AIP Budget</th>
                        <th className="p-3">Budget Spent</th>
                        <th className="p-3">Utilization Rate</th>
                        <th className="p-3">Active Programs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {sortedBarangays.map(b => {
                        const youthPopulation = toNumber(b.youthPopulation);
                        const totalBudget = toNumber(b.totalBudget);
                        const spentBudget = toNumber(b.spentBudget);
                        const activePrograms = toNumber(b.activePrograms);
                        const reg = youthPopulation;
                        const rate = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;
                        const registrationPct = youthPopulation > 0 ? 100 : 0;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-[#091d64]">Brgy. {b.name}</td>
                            <td className="p-3 font-semibold">{b.chairperson}</td>
                            <td className="p-3 font-mono">{youthPopulation.toLocaleString()}</td>
                            <td className="p-3 font-mono text-blue-700">{reg.toLocaleString()} ({registrationPct}%)</td>
                            <td className="p-3 font-mono font-bold text-slate-800">₱{totalBudget.toLocaleString()}</td>
                            <td className="p-3 font-mono text-emerald-700">₱{spentBudget.toLocaleString()}</td>
                            <td className="p-3 font-bold text-emerald-800">{rate}%</td>
                            <td className="p-3 font-mono">{activePrograms} Programs</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 4. AUDIT LOGS TAB ==================== */}
          {activeMenu === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* COMPLIANCE TRACKING DASHBOARD PANEL */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-sans font-bold text-slate-800 text-sm">Barangay Compliance & Document Status</h4>
                    <p className="text-xs text-slate-400">Tracking ABYIP, CBYDP, and Financial Report Submissions across all barangays</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-[10px] rounded-full uppercase">
                    0 / 0 Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ABYIP Submission Rate</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1 block">0% (0/0)</span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Annual Barangay Youth Investment Program</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Audit Compliance</span>
                    <span className="text-2xl font-black text-blue-600 mt-1 block">0% (0/0)</span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Quarterly Financial & Inventory Reports</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3-Year CBYDP Status</span>
                    <span className="text-2xl font-black text-purple-600 mt-1 block">0% Approved</span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Comprehensive Barangay Youth Development Plan</span>
                  </div>
                </div>
              </div>

              {/* AUDIT LOGS TABLE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-[#091d64] font-black text-[10px] rounded uppercase tracking-wider">
                        CHAIRPERSON EXECUTIVE AUDIT TRAIL
                      </span>
                    </div>
                    <h4 className="font-sans font-bold text-slate-800 text-sm mt-1">SK Chairperson Executive History Log</h4>
                    <p className="text-xs text-slate-400">Official log of all SK Chairperson activities across 27 component barangays (programs created, ABYIP promulgations, resolutions & approvals)</p>
                  </div>

                  <div className="relative min-w-[220px] w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={auditSearchTerm}
                      onChange={(e) => setAuditSearchTerm(e.target.value)}
                      placeholder="Search audit logs..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#091d64]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">SK Chairperson & Barangay</th>
                        <th className="p-3">Action Code</th>
                        <th className="p-3">Activity & Executive Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {filteredAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-3 font-bold text-slate-800">
                            <span className="text-[#091d64]">{log.user}</span>
                            <span className="block text-[10px] text-slate-400 font-semibold">{log.role === 'Barangay Admin' ? 'SK Chairperson' : log.role}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold text-[11px]">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{log.details}</td>
                        </tr>
                      ))}
                      {filteredAuditLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400 font-bold">
                            No SK Chairperson history records found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* LYDP REPORT GENERATOR PREVIEW MODAL */}
      {showLydpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#091d64] p-6 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">DILG & RA 10742 Standard Report</span>
                <h3 className="font-sans font-black text-lg">Local Youth Development Plan (LYDP FY 2026-2029)</h3>
              </div>
              <button onClick={() => setShowLydpModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 text-left max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Naga City SK Federation - 3-Year LYDP Summary</h4>
                <p className="text-slate-600">
                  Synthesized framework across all 27 component barangay youth plans targeting 48,200 total youth population in Naga City.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Strategic Priority Pillars:</h5>
                
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <span className="font-bold text-[#091d64] block">1. Governance & Active Citizenship</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">100% KK Assembly conduct & transparent digital AIP financial disclosures.</p>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <span className="font-bold text-emerald-800 block">2. Education, Livelihood & Skills Empowerment</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">Provision of 1,200 annual educational assistance grants and digital skills workshops.</p>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                  <span className="font-bold text-amber-900 block">3. Health, Sports & Anti-Drug Risk Prevention</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">Inter-purok sports tournaments and mental wellness peer counseling programs.</p>
                </div>

                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                  <span className="font-bold text-purple-900 block">4. Climate Action & Environmental Protection</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">Tree growing initiatives along Naga River and community recycling campaigns.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowLydpModal(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100">
                Close
              </button>
              <button 
                onClick={() => {
                  setShowLydpModal(false);
                }}
                className="px-5 py-2 bg-[#091d64] text-white text-xs font-bold rounded-xl hover:bg-opacity-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED ASSIGN SK CHAIRPERSON MODAL (ONLY CHAIRPERSON EMAIL) */}
      {showAssignModal && assigningBarangay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#091d64] p-5 text-white flex justify-between items-center text-left">
              <div>
                <h3 className="font-sans font-black text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  Assign SK Chairperson
                </h3>
                <p className="text-xs text-blue-100">Barangay {assigningBarangay.name} • Naga City Multi-Tenant Registry</p>
              </div>
              <button 
                onClick={() => { setShowAssignModal(false); setAssigningBarangay(null); }} 
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

              <form onSubmit={handleAssignChairpersonSubmit} className="p-6 space-y-4 text-left text-xs">

                {/* Selected Barangay Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {assigningBarangay.logo ? (
                      <img 
                        src={assigningBarangay.logo} 
                        alt="" 
                        className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#091d64] font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                        {assigningBarangay.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold block">Target Jurisdiction</span>
                      <h4 className="font-extrabold text-[#091d64] text-xs">Barangay {assigningBarangay.name}</h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {assigningBarangay.district || BARANGAY_DISTRICTS[assigningBarangay.name] || 'District 1'}
                    </span>
                  </div>
                </div>

                {/* Target Barangay Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Change Target Barangay (27 Naga Barangays)
                  </label>
                  <select
                    value={assigningBarangay.id}
                    onChange={(e) => {
                      const selected = barangays.find(b => b.id === e.target.value);
                      if (selected) {
                        setAssigningBarangay(selected);
                        setAssignEmail(selected.chairpersonEmail || '');
                        setAssignError(null);
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[#091d64] focus:outline-none cursor-pointer"
                  >
                    {sortedBarangays.map(b => (
                      <option key={b.id} value={b.id}>
                        Barangay {b.name} ({b.chairperson && b.chairperson !== 'Unassigned' ? `Assigned: ${b.chairperson}` : 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chairperson Official Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Chairperson Official Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      value={assignEmail}
                      onChange={(e) => setAssignEmail(e.target.value)}
                      placeholder="chairperson.example@naga.gov.ph"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#091d64] focus:border-[#091d64] font-mono"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter ONLY the Chairperson's email. An invitation link will be triggered.
                  </p>
                </div>

                {/* Onboarding Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    The backend sets the user's role to <strong>BARANGAY_ADMIN</strong> bound to <strong>Barangay {assigningBarangay.name}</strong>. The Chairperson will be prompted to create their password and confirm it upon sign in.
                  </p>
                </div>

                {assignError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{assignError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button 
                    type="button"
                    disabled={isAssigning}
                    onClick={() => { setShowAssignModal(false); setAssigningBarangay(null); }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isAssigning}
                    className="px-5 py-2 bg-[#091d64] hover:bg-[#112d75] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Dispatching Invitation...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>Send Invitation & Assign</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* TENANT CONFIGURATION & SK CHAIRPERSON ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#091d64] p-5 text-white flex justify-between items-center text-left">
              <div>
                <h3 className="font-sans font-black text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  {editingBarangay ? `Configure Tenant: Barangay ${editingBarangay.name}` : 'Assign SK Chairperson / Configure Tenant'}
                </h3>
                <p className="text-xs text-blue-100">Citywide Cross-Tenant Administration • Official Naga City 27-Barangay Registry</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left text-xs font-semibold">
              {modalNotice && (
                <div className={`p-3 rounded-xl border flex items-start gap-2 ${modalNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  {modalNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{modalNotice.text}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Barangay Name
                  </label>
                  <input
                    type="text"
                    value={modalForm.name}
                    readOnly
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Barangay ID
                  </label>
                  <input
                    type="text"
                    value={editingBarangay?.id || ''}
                    readOnly
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-mono"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Logo
                      </label>
                      <p className="text-[10px] text-slate-500">This can be changed anytime.</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                      {modalForm.logo ? (
                        <img
                          src={modalForm.logo}
                          alt="Barangay Logo Preview"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImageIcon className="w-6 h-6 mx-auto mb-0.5 text-slate-300" />
                          <span className="text-[8px] font-bold block uppercase">No Seal</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-[#091d64] hover:bg-[#122e7d] text-white text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {modalForm.logo && (
                      <button
                        type="button"
                        onClick={() => setModalForm(prev => ({ ...prev, logo: '' }))}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    SK Chairperson Full Name
                  </label>
                  <input
                    type="text"
                    value={modalForm.chairperson}
                    onChange={(e) => setModalForm({ ...modalForm, chairperson: e.target.value })}
                    placeholder="e.g. Hon. Juan Dela Cruz (or auto-resolved if already registered)"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-[#091d64] focus:outline-none bg-slate-50 text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Optional. Automatically resolved if the email belongs to a registered user.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={modalForm.chairpersonEmail}
                    onChange={(e) => setModalForm({ ...modalForm, chairpersonEmail: e.target.value })}
                    placeholder="Enter official email"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-[#091d64] focus:outline-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tenant Status
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value as 'Active' | 'Inactive' | '' })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-[#091d64] focus:outline-none bg-slate-50"
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    AIP
                  </label>
                  <input
                    type="number"
                    value={modalForm.totalBudget === 0 ? '' : modalForm.totalBudget}
                    onChange={(e) => setModalForm({ ...modalForm, totalBudget: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                    placeholder="Enter AIP budget"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-[#091d64] focus:outline-none bg-slate-50"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Optional. Leave blank if not yet finalized.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  disabled={isSaving}
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSaving}
                  onClick={handleSaveBarangay} 
                  className="px-5 py-2 bg-[#091d64] text-white text-xs font-bold rounded-xl hover:bg-opacity-95 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Save Settings & Assign Chairperson</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex justify-around items-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'dashboard' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeMenu === 'dashboard' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveMenu('barangays')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'barangays' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Building2 className={`w-5 h-5 ${activeMenu === 'barangays' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Barangays</span>
        </button>

        <button
          onClick={() => setActiveMenu('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'analytics' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeMenu === 'analytics' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Analytics</span>
        </button>

        <button
          onClick={() => setActiveMenu('audit')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'audit' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <History className={`w-5 h-5 ${activeMenu === 'audit' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Audit</span>
        </button>
      </div>

    </div>
  );
}

