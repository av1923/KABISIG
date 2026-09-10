import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  Bell, 
  Check, 
  X, 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  FileText, 
  Award, 
  TrendingUp, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  ShieldAlert,
  Shield,
  Download,
  CalendarCheck,
  TrendingDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ChevronDown,
  ClipboardList,
  Coins,
  Folder,
  BarChart3,
  Megaphone,
  Settings as SettingsIcon,
  MoreVertical,
  Clock,
  Briefcase,
  AlertTriangle,
  History,
  CheckCircle2,
  Lock,
  Upload,
  Upload as UploadIcon,
  FileCheck,
  XCircle,
  Facebook,
  Printer,
  FileSpreadsheet,
  Share2,
  Sparkles,
  Layers,
  HelpCircle,
  TrendingUpIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { BarangayTenant, Program, YouthProfile, DocumentRecord, SystemAuditLog } from '../types';
import ProfileAvatar from './ProfileAvatar';
import { 
  classifyDemographics, 
  calculateEngagementScore, 
  recommendPrograms, 
  detectLowEngagement, 
  detectScheduleConflicts, 
  getBudgetAnalytics, 
  monitorBudgets, 
  getComplianceIssues, 
  analyzeFeedbackSentiment 
} from '../lib/intelligence';
import { KabisigLogo } from './PublicPages';
import { UserMenu } from './UserMenu';

interface BarangayAdminPagesProps {
  currentBarangay: BarangayTenant;
  programs: Program[];
  youthProfiles: YouthProfile[];
  documents: DocumentRecord[];
  auditLogs?: SystemAuditLog[];
  registrations?: any[];
  feedback?: any[];
  expenses?: any[];
  resolutions?: any[];
  onApproveYouth: (id: string) => void;
  onRejectYouth: (id: string, reason: string) => void;
  onCreateProgram: (newProg: Program) => void;
  onLogout: () => void;
}

export default function BarangayAdminPages({
  currentBarangay,
  programs,
  youthProfiles,
  documents,
  auditLogs = [],
  registrations = [],
  feedback = [],
  expenses = [],
  resolutions = [],
  onApproveYouth,
  onRejectYouth,
  onCreateProgram,
  onLogout
}: BarangayAdminPagesProps) {
  // Navigation inside Barangay Admin:
  // 'dashboard' | 'youth' | 'programs' | 'budget' | 'documents' | 'reports' | 'announcements' | 'audit' | 'calendar' | 'facebook_sync' | 'settings' | 'profile'
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'youth' | 'programs' | 'budget' | 'documents' | 'reports' | 'announcements' | 'audit' | 'calendar' | 'facebook_sync' | 'settings' | 'profile'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');

  const generatePDFReport = (reportTitle: string = 'COA Annual Audit & AIP Financial Performance Report') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to export the PDF report.');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - Barangay ${currentBarangay?.name || 'San Francisco'}</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #ffffff; }
          .header { text-align: center; border-bottom: 3px solid #091d64; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 13px; font-weight: 700; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .header h2 { font-size: 20px; font-weight: 800; color: #091d64; margin: 5px 0; }
          .header p { font-size: 12px; color: #64748b; margin: 0; }
          .section-title { font-size: 13px; font-weight: 800; color: #091d64; background: #eff6ff; padding: 8px 12px; border-left: 4px solid #091d64; margin: 25px 0 15px 0; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; background: #ecfdf5; color: #065f46; }
          .footer { margin-top: 50px; text-align: right; font-size: 12px; color: #475569; }
          .footer .sign { margin-top: 40px; font-weight: 700; color: #091d64; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Republic of the Philippines &bull; Province of Camarines Sur &bull; City of Naga</h1>
          <h2>Barangay ${currentBarangay?.name || 'San Francisco'} &bull; Sangguniang Kabataan Council</h2>
          <p>Official Statutory ${reportTitle} &bull; Date Generated: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section-title">I. Annual Investment Plan (AIP) Financial Summary</div>
        <table>
          <thead>
            <tr>
              <th>Program / Project Category</th>
              <th>AIP Reference Code</th>
              <th class="text-right">Budget Allocated</th>
              <th class="text-right">Disbursed Expenditure</th>
              <th class="text-right">Utilization Rate</th>
              <th class="text-center">Audit Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Sports & Active Citizenship</strong></td>
              <td>AIP-2026-SPT-01</td>
              <td class="text-right">₱180,000</td>
              <td class="text-right">₱152,000</td>
              <td class="text-right">84.4%</td>
              <td class="text-center"><span class="badge">COA Audited</span></td>
            </tr>
            <tr>
              <td><strong>Educational Assistance & Scholarships</strong></td>
              <td>AIP-2026-EDU-02</td>
              <td class="text-right">₱220,000</td>
              <td class="text-right">₱195,000</td>
              <td class="text-right">88.6%</td>
              <td class="text-center"><span class="badge">COA Audited</span></td>
            </tr>
            <tr>
              <td><strong>Health, Nutrition & Anti-Drug Advocacy</strong></td>
              <td>AIP-2026-HLT-03</td>
              <td class="text-right">₱140,000</td>
              <td class="text-right">₱110,000</td>
              <td class="text-right">78.5%</td>
              <td class="text-center"><span class="badge">COA Audited</span></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">II. DILG MC 2023 Compliance & Statutory Transmittals</div>
        <table>
          <thead>
            <tr>
              <th>Statutory Requirement</th>
              <th>Filing Quarter</th>
              <th>Date Submitted</th>
              <th class="text-center">DILG Verification</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Annual Barangay Youth Development Plan (ABYIP 2026)</td>
              <td>Q1 2026</td>
              <td>January 15, 2026</td>
              <td class="text-center"><span class="badge">Compliant</span></td>
            </tr>
            <tr>
              <td>Quarterly Session Minutes & Enacted Resolutions</td>
              <td>Q2 2026</td>
              <td>June 30, 2026</td>
              <td class="text-center"><span class="badge">Compliant</span></td>
            </tr>
            <tr>
              <td>Disbursement Vouchers & 5% VAT Tax Withholding Ledger</td>
              <td>Q2 2026</td>
              <td>July 10, 2026</td>
              <td class="text-center"><span class="badge">Compliant</span></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Certified Correct & Attested:</p>
          <div class="sign">
            HON. CHAIRPERSON &bull; SK EXECUTIVE BOARD<br>
            <span style="font-weight: normal; color: #64748b;">Barangay ${currentBarangay?.name || 'San Francisco'}, City of Naga</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Document repository & digital approval states
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docStatusFilter, setDocStatusFilter] = useState('All');
  const [inspectDoc, setInspectDoc] = useState<DocumentRecord | null>(null);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showApproveDocModal, setShowApproveDocModal] = useState(false);
  const [selectedDocForApprove, setSelectedDocForApprove] = useState<DocumentRecord | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [newDocForm, setNewDocForm] = useState<{
    title: string;
    category: DocumentRecord['category'];
    resolutionNumber: string;
    description: string;
    fileSize: string;
    designatedApprover: string;
  }>({
    title: '',
    category: 'Resolutions',
    resolutionNumber: '',
    description: '',
    fileSize: '1.4 MB',
    designatedApprover: 'Hon. SK Chairperson'
  });

  // Audit log filtering state for SK Chairperson (Only SK Treasurer & Secretary history)
  const [auditLogRoleFilter, setAuditLogRoleFilter] = useState<'All' | 'Treasurer' | 'Secretary'>('All');

  // ==================== REPORTS HUB STATES & GENERATOR HELPERS ====================
  const [reportCategoryFilter, setReportCategoryFilter] = useState<'All' | 'Demographic' | 'Accomplishment' | 'Attendance' | 'Beneficiary' | 'Financial' | 'Feedback'>('All');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [previewReport, setPreviewReport] = useState<{
    type: string;
    title: string;
    subtitle: string;
    reference: string;
    columns: string[];
    rows: any[];
  } | null>(null);

  const exportCSVData = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_Barangay_${currentBarangay?.name || 'San_Francisco'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDynamicPrintPDF = (title: string, subtitle: string, refCode: string, headers: string[], rowsHTML: string, summaryStatsHTML: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to export the PDF report.');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - Barangay ${currentBarangay?.name || 'San Francisco'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #ffffff; }
          .header { text-align: center; border-bottom: 3px solid #091d64; padding-bottom: 20px; margin-bottom: 25px; }
          .header .republic { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
          .header .city { font-size: 13px; font-weight: 700; color: #1e293b; margin: 2px 0; }
          .header h2 { font-size: 22px; font-weight: 800; color: #091d64; margin: 6px 0 4px 0; letter-spacing: -0.5px; }
          .header .meta { font-size: 11px; color: #475569; font-weight: 600; margin: 0; }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; rounded: 8px; border-radius: 8px; }
          .stat-label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; tracking: 0.5px; }
          .stat-value { font-size: 18px; font-weight: 800; color: #091d64; margin-top: 2px; }
          .section-title { font-size: 12px; font-weight: 800; color: #091d64; background: #eff6ff; padding: 8px 12px; border-left: 4px solid #091d64; margin: 20px 0 12px 0; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
          th { background: #091d64; color: #ffffff; font-weight: 700; text-align: left; padding: 9px 10px; border: 1px solid #091d64; text-transform: uppercase; font-size: 10px; }
          td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; border-left: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; color: #334155; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .badge { display: inline-block; padding: 2px 7px; font-size: 9px; font-weight: 800; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; text-transform: uppercase; }
          .badge-blue { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
          .badge-amber { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
          .footer { margin-top: 45px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #475569; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 220px; }
          .sign-line { border-bottom: 1.5px solid #091d64; margin-bottom: 6px; padding-top: 35px; }
          .sign-title { font-weight: 800; color: #091d64; font-size: 11px; }
          .sign-role { font-size: 10px; color: #64748b; font-weight: 600; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="republic">Republic of the Philippines &bull; Province of Camarines Sur &bull; City of Naga</p>
          <p class="city">SANGGUNIANG KABATAAN EXECUTIVE COUNCIL &bull; BARANGAY ${currentBarangay?.name?.toUpperCase() || 'SAN FRANCISCO'}</p>
          <h2>${title}</h2>
          <p class="meta">Statutory Document Ref: <strong>${refCode}</strong> &bull; Generated: ${new Date().toLocaleDateString()} &bull; DILG RA 10742 Compliant System Record</p>
        </div>

        ${summaryStatsHTML}

        <div class="section-title">Official Registry Ledger & Audit Schedule</div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <div class="footer">
          <div class="sign-box">
            <div class="sign-line"><strong>SK SECRETARY</strong></div>
            <div class="sign-title">Document Custodian</div>
            <div class="sign-role">Sangguniang Kabataan Council</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"><strong>SK TREASURER</strong></div>
            <div class="sign-title">Financial Custodian</div>
            <div class="sign-role">Sangguniang Kabataan Council</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"><strong>HON. SK CHAIRPERSON</strong></div>
            <div class="sign-title">Barangay Administrator</div>
            <div class="sign-role">Head of Executive Council</div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Selected Profile for detail Modal inspection
  const [inspectProfile, setInspectProfile] = useState<YouthProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectField, setShowRejectField] = useState(false);

  // Program list and program creation panel state (Image 2)
  const [showCreateProgDrawer, setShowCreateProgDrawer] = useState(true);
  const [progListFilter, setProgListFilter] = useState<'List' | 'Calendar'>('List');
  const [newProgForm, setNewProgForm] = useState({
    title: '',
    description: '',
    startDate: '2025-05-20',
    endDate: '2025-05-22',
    location: `Barangay ${currentBarangay.name} Hall Complex`,
    maxParticipants: 100,
    budgetAllocation: 50000,
    status: 'Upcoming' as 'Draft' | 'Published' | 'Upcoming' | 'Ongoing' | 'Completed'
  });

  // Budget Monitoring state filters (Image 3)
  const [budgetYear, setBudgetYear] = useState('2025');
  const [budgetProgramFilter, setBudgetProgramFilter] = useState('All Programs');

  // Document management mock state
  const [localDocs, setLocalDocs] = useState<DocumentRecord[]>(documents);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocCat, setUploadDocCat] = useState<'Resolutions' | 'Vouchers' | 'Liquidation' | 'Accomplishment' | 'Budget' | 'Minutes'>('Budget');

  // Filter items for KK registrations
  const pendingRegistrations = youthProfiles.filter(p => p.status === 'Pending' && p.barangayId === currentBarangay.id);
  const filteredProfiles = youthProfiles.filter(p => {
    const matchesBarangay = p.barangayId === currentBarangay.id;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : p.status === filterStatus;
    return matchesBarangay && matchesSearch && matchesStatus;
  });

  // Derived statistics & budgets
  const activeLocalProgramsCount = programs.filter(p => p.status === 'Ongoing' || p.status === 'Published').length;

  // --- RULE-BASED INTELLIGENCE EXTRACTIONS ---
  const localProfiles = youthProfiles.filter(p => p.barangayId === currentBarangay.id);
  const intelligentBudget = getBudgetAnalytics(currentBarangay.totalBudget, programs, expenses);
  const budgetAlerts = monitorBudgets(currentBarangay, programs, expenses);
  const complianceIssues = getComplianceIssues(localProfiles, programs, documents, expenses);
  const lowEngagementItems = detectLowEngagement(localProfiles, registrations);

  // Announcements & Facebook Social Sync State
  const [fbAutoSyncEnabled, setFbAutoSyncEnabled] = useState(true);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);

  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Advisory');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState('All Zones');
  const [annPostToFb, setAnnPostToFb] = useState(true);

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    const newAnn = {
      id: `ann-${Date.now().toString().slice(-4)}`,
      title: annTitle,
      category: annCategory,
      content: annContent,
      targetPurok: annTarget,
      author: currentBarangay.chairperson || 'SK Chairperson',
      datePublished: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      postStatus: 'Published',
      fbSyncStatus: (annPostToFb && fbAutoSyncEnabled) ? 'Synced' : 'Draft',
      fbPostId: (annPostToFb && fbAutoSyncEnabled) ? `fb_post_${Math.floor(10000000000 + Math.random() * 90000000000)}` : 'N/A',
      socialReach: { views: 1, reactions: 0, shares: 0 }
    };

    setAnnouncementsList([newAnn, ...announcementsList]);
    setAnnTitle('');
    setAnnContent('');
    alert(
      annPostToFb && fbAutoSyncEnabled
        ? '✅ Announcement published and successfully auto-synced to the Official SK Facebook Page!'
        : '✅ Announcement published on KABISIG Constituent Portal!'
    );
  };

  // Donut Pie chart data: Demographics (Image 1)
  const demographicsDonutData = [
    { name: 'Male', value: 1120, color: '#1e3a8a' },
    { name: 'Female', value: 980, color: '#dc2626' },
    { name: 'Other', value: 50, color: '#f59e0b' }
  ];

  // Bar Chart Data: Program Participation (Image 1 & 2)
  const programParticipationData = [
    { name: 'Kabataan Leadership Training', count: 850 },
    { name: 'Sports Development Program', count: 620 },
    { name: 'Environmental Clean-up Drive', count: 430 },
    { name: 'Digital Literacy Seminar', count: 250 }
  ];

  // Budget vs Actual Monthly chart (Image 3)
  const budgetVsActualMonthlyData = [
    { month: 'Jan', budget: 2300000, spent: 1800000 },
    { month: 'Feb', budget: 2450000, spent: 1950000 },
    { month: 'Mar', budget: 2600000, spent: 2100000 },
    { month: 'Apr', budget: 2750000, spent: 2300000 },
    { month: 'May', budget: 2900000, spent: 2500000 },
    { month: 'Jun', budget: 3000000, spent: 2000000 },
    { month: 'Jul', budget: 3100000, spent: 2200000 },
    { month: 'Aug', budget: 3250000, spent: 1900000 },
    { month: 'Sep', budget: 3300000, spent: 2400000 },
    { month: 'Oct', budget: 3450000, spent: 2100000 },
    { month: 'Nov', budget: 3500000, spent: 2650000 },
    { month: 'Dec', budget: 3600000, spent: 2350000 }
  ];

  // Pie chart: Budget Allocation by Program (Image 3)
  const budgetAllocationByProgramData = [
    { name: 'Youth Leadership Summit', value: 6000000, color: '#091d64', percentage: '23.6%' },
    { name: 'Sports Development Program', value: 5000000, color: '#2563eb', percentage: '19.7%' },
    { name: 'Community Service Initiatives', value: 4500000, color: '#60a5fa', percentage: '17.7%' },
    { name: 'Skills Training & Seminars', value: 3800000, color: '#93c5fd', percentage: '14.9%' },
    { name: 'Environmental Programs', value: 2600000, color: '#94a3b8', percentage: '10.2%' },
    { name: 'Others', value: 3580000, color: '#cbd5e1', percentage: '14.0%' }
  ];

  // Budget utilization summary (Image 3)
  const budgetUtilizationTable = [
    { program: 'Youth Leadership Summit', allocated: 6000000, spent: 2950000, remaining: 3050000, rate: 49.2 },
    { program: 'Sports Development Program', allocated: 5000000, spent: 2800000, remaining: 2200000, rate: 56.0 },
    { program: 'Community Service Initiatives', allocated: 4500000, spent: 1750000, remaining: 2750000, rate: 38.9 },
    { program: 'Skills Training & Seminars', allocated: 3800000, spent: 1950000, remaining: 1850000, rate: 51.3 },
    { program: 'Environmental Programs', allocated: 2600000, spent: 1450000, remaining: 1150000, rate: 55.8 },
    { program: 'Others', allocated: 3580000, spent: 1750000, remaining: 1830000, rate: 48.9 }
  ];

  const handleCreateProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgForm.title) {
      alert('Please enter a Program Title.');
      return;
    }

    const createdProg: Program = {
      id: `prog-${Date.now().toString().slice(-3)}`,
      title: newProgForm.title,
      description: newProgForm.description,
      startDate: newProgForm.startDate,
      endDate: newProgForm.endDate,
      location: newProgForm.location,
      maxParticipants: newProgForm.maxParticipants,
      budgetAllocation: newProgForm.budgetAllocation,
      spentBudget: 0,
      aipReference: `AIP-2025-${currentBarangay.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      category: 'Sports Development',
      status: newProgForm.status,
      registeredCount: 0
    };

    onCreateProgram(createdProg);
    
    // Reset form
    setNewProgForm({
      title: '',
      description: '',
      startDate: '2025-05-20',
      endDate: '2025-05-22',
      location: `Barangay ${currentBarangay.name} Hall Complex`,
      maxParticipants: 100,
      budgetAllocation: 50000,
      status: 'Upcoming'
    });
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocName) return;

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now().toString().slice(-3)}`,
      title: uploadDocName,
      category: uploadDocCat,
      status: 'Pending',
      uploadedBy: currentBarangay.chairperson,
      uploadedDate: new Date().toISOString().split('T')[0],
      fileSize: '1.4 MB',
      description: 'Public transparency report'
    };

    setLocalDocs([newDoc, ...localDocs]);
    setUploadDocName('');
    alert('Document successfully uploaded!');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
      
      {/* MOBILE TOP HEADER BAR */}
      <div className="lg:hidden bg-[#091d64] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <KabisigLogo className="scale-75" />
          <span className="text-[10px] font-bold bg-[#1e3a8a] px-2 py-0.5 rounded text-sky-200">Brgy. {currentBarangay.name}</span>
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
                Executive SK Console — Brgy. {currentBarangay.name}
              </div>
              <button
                onClick={() => { setActiveMenu('dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'dashboard' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-amber-400" />
                Dashboard
              </button>
              <button
                onClick={() => { setActiveMenu('youth'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between ${activeMenu === 'youth' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-4.5 h-4.5 text-amber-400" />
                  Youth Management
                </span>
                {pendingRegistrations.length > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                    {pendingRegistrations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setActiveMenu('programs'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'programs' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <ClipboardList className="w-4.5 h-4.5 text-amber-400" />
                Programs & Projects
              </button>
              <button
                onClick={() => { setActiveMenu('budget'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'budget' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <Coins className="w-4.5 h-4.5 text-amber-400" />
                Budget Monitoring
              </button>
              <button
                onClick={() => { setActiveMenu('documents'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'documents' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <Folder className="w-4.5 h-4.5 text-amber-400" />
                Document Repository
              </button>
              <button
                onClick={() => { setActiveMenu('reports'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'reports' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <BarChart3 className="w-4.5 h-4.5 text-amber-400" />
                Reports Desk
              </button>
              <button
                onClick={() => { setActiveMenu('announcements'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'announcements' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <Megaphone className="w-4.5 h-4.5 text-amber-400" />
                Announcements
              </button>
              <button
                onClick={() => { setActiveMenu('audit'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 ${activeMenu === 'audit' ? 'bg-[#091d64] text-white shadow-md' : 'text-slate-200 hover:bg-white/10'}`}
              >
                <History className="w-4.5 h-4.5 text-amber-400" />
                Audit Log
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

      {/* ==================== LEFT SIDEBAR - DESKTOP ONLY ==================== */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col justify-between h-full flex-shrink-0 z-40 shadow-sm">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="p-6 pb-4 border-b border-slate-50 flex flex-col items-center">
            <KabisigLogo className="scale-90" />
          </div>

          {/* Navigation Links matching Image 1 exactly */}
          <nav className="p-4 space-y-1 flex-1">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'dashboard' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <LayoutDashboard className={`w-4.5 h-4.5 ${activeMenu === 'dashboard' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveMenu('youth')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                activeMenu === 'youth' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className={`w-4.5 h-4.5 ${activeMenu === 'youth' ? 'text-[#091d64]' : 'text-slate-400'}`} />
                Youth Management
              </span>
              {pendingRegistrations.length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">
                  {pendingRegistrations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('programs')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'programs' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <ClipboardList className={`w-4.5 h-4.5 ${activeMenu === 'programs' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Programs & Projects
            </button>

            <button
              onClick={() => setActiveMenu('budget')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'budget' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <Coins className={`w-4.5 h-4.5 ${activeMenu === 'budget' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Budget Management
            </button>

            <button
              onClick={() => setActiveMenu('documents')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'documents' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <Folder className={`w-4.5 h-4.5 ${activeMenu === 'documents' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Documents
            </button>

            <button
              onClick={() => setActiveMenu('reports')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'reports' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <BarChart3 className={`w-4.5 h-4.5 ${activeMenu === 'reports' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Reports
            </button>

            <button
              onClick={() => setActiveMenu('announcements')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'announcements' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <Megaphone className={`w-4.5 h-4.5 ${activeMenu === 'announcements' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Announcements
            </button>

            <button
              onClick={() => setActiveMenu('audit')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${
                activeMenu === 'audit' 
                  ? 'bg-[#eff6ff] text-[#091d64] shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#091d64]'
              }`}
            >
              <History className={`w-4.5 h-4.5 ${activeMenu === 'audit' ? 'text-[#091d64]' : 'text-slate-400'}`} />
              Audit Log
            </button>

            <div className="pt-4 border-t border-slate-50">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Log Out
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* ==================== MAIN WORKSPACE ==================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* DESKTOP HEADER BLOCK */}
        <header className="hidden lg:flex bg-white border-b border-slate-100 h-20 items-center justify-between px-8 flex-shrink-0 z-30">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="font-sans font-extrabold text-[#091d64] text-2xl tracking-tight leading-none">
                {activeMenu === 'dashboard' && `Barangay ${currentBarangay.name} Dashboard`}
                {activeMenu === 'youth' && 'Youth Management Registry'}
                {activeMenu === 'programs' && 'Manage Programs'}
                {activeMenu === 'budget' && 'Budget Monitoring'}
                {activeMenu === 'documents' && 'Document Repository'}
                {activeMenu === 'reports' && 'Reports Desk'}
                {activeMenu === 'announcements' && 'Sangguniang Kabataan Announcements'}
                {activeMenu === 'calendar' && 'AIP Program Scheduling Calendar'}
                {activeMenu === 'settings' && 'System Parameters Settings'}
                {activeMenu === 'profile' && 'Sangguniang Kabataan Admin Profile'}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[#091d64] text-white">
                Barangay Admin
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans tracking-wide font-semibold mt-1">
              Web-Based Kabataan Information System for Inclusive Governance
            </span>
          </div>

          {/* User Profile Block */}
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer"
                title="Pending Approvals"
              >
                <Bell className="w-5 h-5 text-slate-500" />
                {pendingRegistrations.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                    {pendingRegistrations.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Pending Validations</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {pendingRegistrations.length} Pending
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {pendingRegistrations.map(p => (
                      <div 
                        key={p.id} 
                        className="p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer text-left"
                        onClick={() => {
                          setInspectProfile(p);
                          setShowNotifications(false);
                        }}
                      >
                        <ProfileAvatar name={p.name} src={p.profilePic} alt={p.name} className="w-8 h-8 rounded-full border mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold truncate">
                            Requested: <span className="text-blue-700 font-bold">{p.registeredRole || 'Youth Constituent'}</span>
                          </p>
                          <p className="text-[8px] text-slate-400 mt-1">
                            Registered on {p.dateRegistered}
                          </p>
                        </div>
                        <span className="text-[9px] font-black text-blue-600 hover:underline mt-0.5">
                          Review
                        </span>
                      </div>
                    ))}
                    {pendingRegistrations.length === 0 && (
                      <div className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                        No pending registration requests.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <UserMenu 
              userName={currentBarangay.chairperson}
              role="SK Chairperson"
              onLogout={onLogout}
            />
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-grow p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-8 overflow-y-auto bg-[#f8fafc]">
          
          {/* ==================== 1. DASHBOARD VIEW (Image 1) ==================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              
              {/* TOP ROW: 5 HORIZONTAL METRICS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                
                {/* CARD 1: Barangay Seal Badge */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#eff6ff] flex items-center justify-center border-2 border-blue-100 flex-shrink-0 overflow-hidden">
                    {/* SVG Barangay Emblem Seal */}
                    <svg className="w-12 h-12 text-[#091d64]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="45" stroke="#091d64" strokeWidth="2" strokeDasharray="3,3" />
                      <circle cx="50" cy="50" r="38" fill="#eff6ff" stroke="#e0f2fe" strokeWidth="2" />
                      <path d="M50 20 L55 35 L70 35 L58 45 L62 60 L50 50 L38 60 L42 45 L30 35 L45 35 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                      <path d="M25 65 Q 50 85 75 65" stroke="#091d64" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#091d64] leading-tight">Barangay {currentBarangay.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Naga City, Camarines Sur</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">SK Council: 2024-2025</p>
                    <p className="text-[9px] text-slate-500 font-mono">Term: July 1, 2024 - June 30, 2025</p>
                  </div>
                </div>

                {/* CARD 2: Youth Population */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Youth Population</span>
                    <div className="p-2.5 bg-blue-50 text-[#091d64] rounded-lg">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">2,150</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Ages 15-30</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('youth')}
                    className="text-[11px] text-[#091d64] font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    View Details &rarr;
                  </button>
                </div>

                {/* CARD 3: Active Programs */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Programs</span>
                    <div className="p-2.5 bg-blue-50 text-[#091d64] rounded-lg">
                      <ClipboardList className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">3</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Ongoing Programs</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('programs')}
                    className="text-[11px] text-[#091d64] font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    View Programs &rarr;
                  </button>
                </div>

                {/* CARD 4: Total Budget */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Budget</span>
                    <div className="p-2.5 bg-blue-50 text-[#091d64] rounded-lg">
                      <Coins className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">₱ 850,000</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">FY 2025 Budget</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('budget')}
                    className="text-[11px] text-[#091d64] font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    View Budget &rarr;
                  </button>
                </div>

                {/* CARD 5: Pending Approvals */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</span>
                    <div className="p-2.5 bg-red-50 text-red-500 rounded-lg">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">5</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">For Your Review</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('youth')}
                    className="text-[11px] text-red-600 font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    Review Now &rarr;
                  </button>
                </div>

              </div>

              {/* QUICK ACTIONS ROW */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quick Actions</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => { setActiveMenu('programs'); }}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-100 text-left flex items-center gap-4 transition-all"
                  >
                    <div className="p-3 bg-blue-50 text-[#091d64] rounded-lg">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Create Program</h5>
                      <p className="text-[10px] text-slate-400">Add a new program or activity</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveMenu('youth')}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-100 text-left flex items-center gap-4 transition-all"
                  >
                    <div className="p-3 bg-blue-50 text-[#091d64] rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">View Registrations</h5>
                      <p className="text-[10px] text-slate-400">Manage youth registrations</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveMenu('documents')}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-100 text-left flex items-center gap-4 transition-all"
                  >
                    <div className="p-3 bg-blue-50 text-[#091d64] rounded-lg">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Manage Documents</h5>
                      <p className="text-[10px] text-slate-400">Upload and manage documents</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ==================== SMART COMPLIANCE & BUDGET ALERTS (Rule-Based) ==================== */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Panel 1: Smart Compliance Tracker */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-[#091d64] uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Smart Compliance Tracker (Rule-Based)
                    </h4>
                    <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                      DILG Statutory Audit
                    </span>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {complianceIssues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border flex gap-3 items-start ${
                        issue.level === 'Urgent' ? 'bg-red-50/50 border-red-100 text-red-950' : 'bg-amber-50/50 border-amber-100 text-amber-950'
                      }`}>
                        <div className={`p-1.5 rounded-full mt-0.5 flex-shrink-0 ${issue.level === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-tight">{issue.message}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500">Action: {issue.action}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                if (issue.action.includes('Document') || issue.action.includes('Budget')) {
                                  setActiveMenu('documents');
                                } else if (issue.action.includes('registration')) {
                                  setActiveMenu('youth');
                                } else {
                                  setActiveMenu('programs');
                                }
                              }}
                              className="text-[9px] text-blue-700 font-extrabold hover:underline"
                            >
                              Resolve &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {complianceIssues.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 font-bold">
                        🎉 Zero compliance issues detected. Sangguniang Kabataan fully compliant!
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 2: Smart Budget Monitor */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-[#091d64] uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[#091d64]" />
                      Smart Budget Auditor & Alerts (Rule-Based)
                    </h4>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      intelligentBudget.consumptionTrend === 'Accelerated' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Trend: {intelligentBudget.consumptionTrend}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {budgetAlerts.map((alert, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border flex gap-3 items-start ${
                        alert.level === 'Critical' ? 'bg-red-50/50 border-red-100' : alert.level === 'Warning' ? 'bg-amber-50/50 border-amber-100' : 'bg-blue-50/50 border-blue-100'
                      }`}>
                        <div className={`p-1.5 rounded-full mt-0.5 flex-shrink-0 ${
                          alert.level === 'Critical' ? 'bg-red-100 text-red-600' : alert.level === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-tight text-slate-800">{alert.message}</p>
                          <span className="text-[8px] text-slate-400 font-mono font-bold block mt-1">Rule Trigger Code: {alert.code}</span>
                        </div>
                      </div>
                    ))}
                    {budgetAlerts.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 font-bold">
                        🛡️ Budget spend checks successfully completed. No irregularities.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TWO COLUMN GRAPHS + PENDING APPROVALS LIST */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* COLUMN 1: YOUTH DEMOGRAPHICS DONUT */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs min-w-0">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Youth Demographics</h4>
                    <span className="text-[10px] text-slate-400">As of May 20, 2025</span>
                  </div>
                  <div className="h-60 w-full min-w-0 relative flex items-center justify-center overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <PieChart>
                        <Pie
                          data={demographicsDonutData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {demographicsDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} youth`]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center flex flex-col justify-center pointer-events-none">
                      <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Total</span>
                      <span className="text-2xl font-extrabold text-slate-800 mt-1 leading-none">2,150</span>
                    </div>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4">
                    <div className="text-center">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-950 mr-1.5"></span>
                      <span className="text-[11px] font-bold text-slate-600 block">Male</span>
                      <span className="text-xs font-extrabold text-slate-800">1,120 <span className="text-[10px] text-slate-400 font-normal">(52.1%)</span></span>
                    </div>
                    <div className="text-center">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 mr-1.5"></span>
                      <span className="text-[11px] font-bold text-slate-600 block">Female</span>
                      <span className="text-xs font-extrabold text-slate-800">980 <span className="text-[10px] text-slate-400 font-normal">(45.6%)</span></span>
                    </div>
                    <div className="text-center">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                      <span className="text-[11px] font-bold text-slate-600 block">Other</span>
                      <span className="text-xs font-extrabold text-slate-800">50 <span className="text-[10px] text-slate-400 font-normal">(2.3%)</span></span>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: PROGRAM PARTICIPATION BAR */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs min-w-0">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Program Participation</h4>
                    <select className="border border-slate-200 text-[10px] font-bold rounded-lg px-2.5 py-1 bg-white focus:outline-none">
                      <option>This Year</option>
                      <option>Previous Year</option>
                    </select>
                  </div>
                  <div className="h-64 w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <BarChart data={programParticipationData} layout="vertical">
                        <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={8} width={80} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#091d64" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-center">
                    <button 
                      onClick={() => setActiveMenu('programs')}
                      className="text-xs text-[#091d64] font-extrabold hover:underline"
                    >
                      View All Programs &rarr;
                    </button>
                  </div>
                </div>

                {/* COLUMN 3: SMART LOW ENGAGEMENT OUTREACH (Rule-Based) */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-black text-[#091d64] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Targeted Youth Outreach (Rule-Based)
                      </h4>
                      <span className="text-[9px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-full">
                        Score &lt; 50
                      </span>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {lowEngagementItems.map((item, index) => (
                        <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{item.profile.name}</span>
                            <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                              Score: {item.score}
                            </span>
                          </div>
                          <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Recommended Outreach
                          </div>
                          <ul className="mt-1 space-y-1 list-disc list-inside text-[11px] text-slate-600 font-medium">
                            {item.recommendedOutreach.map((outreach, oIdx) => (
                              <li key={oIdx}>{outreach}</li>
                            ))}
                          </ul>
                          <div className="mt-2.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Notification sent to KABISIG account of ${item.profile.name}.`);
                              }}
                              className="text-[10px] bg-[#091d64] hover:bg-blue-900 text-white font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                            >
                              Send KABISIG Alert
                            </button>
                          </div>
                        </div>
                      ))}
                      {lowEngagementItems.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-400 font-bold">
                          🎉 All registered youth have high engagement. No outreach needed!
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-center">
                    <button 
                      onClick={() => setActiveMenu('youth')}
                      className="text-xs text-[#091d64] font-extrabold hover:underline"
                    >
                      Manage Youth Registry &rarr;
                    </button>
                  </div>
                </div>

              </div>

              {/* RECENT ACTIVITIES TABLE */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Recent Activities</h4>
                  <button 
                    onClick={() => setActiveMenu('reports')}
                    className="text-[10px] font-extrabold text-[#091d64] hover:underline"
                  >
                    View All Activities &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 text-green-600 rounded-full">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">New youth registered: Maria Kristina P. Gomez</p>
                        <span className="text-[10px] text-slate-400">May 20, 2025 9:15 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">Document "Quarterly Report Q1 2025" uploaded</p>
                        <span className="text-[10px] text-slate-400">May 20, 2025 8:45 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 text-yellow-600 rounded-full">
                        <ClipboardList className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">Program "Sports Development Program" updated</p>
                        <span className="text-[10px] text-slate-400">May 19, 2025 4:30 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-full">
                        <Megaphone className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">Announcement "Barangay Assembly" published</p>
                        <span className="text-[10px] text-slate-400">May 19, 2025 3:20 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== 2. YOUTH MANAGEMENT (REGISTRATIONS DESK) ==================== */}
          {activeMenu === 'youth' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-extrabold text-[#091d64] text-lg">Katipunan ng Kabataan Registry Desk</h3>
                    <p className="text-xs text-slate-400 mt-1">Review and validate youth profile records matching DILG profiling requirements</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending Validation</option>
                      <option value="Approved">Approved Profiles</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="relative mb-6">
                  <input 
                    type="text" 
                    placeholder="Search registry by name, email or Purok..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 font-extrabold uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Applicant Profile</th>
                        <th className="px-6 py-3">Age / Sex</th>
                        <th className="px-6 py-3">Residency Address</th>
                        <th className="px-6 py-3">Scholastic State</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Desk Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredProfiles.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-extrabold text-slate-800 flex items-center gap-3">
                            <ProfileAvatar name={p.name} src={p.profilePic} alt={p.name} className="w-8 h-8 rounded-full border border-slate-100" />
                            <div>
                              <span className="block font-bold">{p.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono font-bold block mt-0.5">{p.id}</span>
                              {(p.registeredRole === 'SK Kagawad' || p.registeredRole === 'SK Secretary' || p.registeredRole === 'SK Treasurer' || p.registeredRole === 'Barangay Admin') ? (
                                <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black block mt-1 w-max uppercase tracking-wider">
                                  {p.registeredRole}
                                </span>
                              ) : (
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold block mt-1 w-max">
                                  Youth Constituent
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold">
                            {p.age} yrs / <span className="text-slate-500 font-semibold">{p.sex}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-500">
                            {p.address} ({p.zone})
                          </td>
                          <td className="px-6 py-4">
                            <span className="block font-bold text-slate-700">{p.educationalLevel}</span>
                            <span className="text-[9px] text-amber-600 font-bold block mt-0.5">{p.scholarStatus}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              p.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              p.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => setInspectProfile(p)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-lg flex items-center gap-1 mx-auto transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold text-xs">
                            No matching applicant profiles found in registry.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. MANAGE PROGRAMS (Image 2) ==================== */}
          {activeMenu === 'programs' && (
            <div className="space-y-6">
              
              {/* HEADER CAPTION */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#091d64]">Manage Programs</h3>
                  <p className="text-xs text-slate-400 mt-1">View, manage, and track all programs and initiatives.</p>
                </div>
                
                {/* LIST / CALENDAR VIEW TOGGLE + CREATE NEW BUTTON */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-100">
                    <button 
                      onClick={() => setProgListFilter('List')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                        progListFilter === 'List' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      List View
                    </button>
                    <button 
                      onClick={() => setProgListFilter('Calendar')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                        progListFilter === 'Calendar' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Calendar View
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setShowCreateProgDrawer(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Program
                  </button>
                </div>
              </div>

              {/* GRID: LEFT LIST, RIGHT CREATE FORM DRAWER */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* PROGRAM LIST COLUMN */}
                <div className="xl:col-span-2 space-y-4">
                  {progListFilter === 'Calendar' ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xs space-y-6 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-base font-extrabold text-[#091d64]">AIP Localized Program Timeline</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Monthly schedule representation of published developmental programs and activities.</p>
                        </div>
                        <span className="text-xs font-bold text-[#091d64] bg-blue-50 px-3 py-1 rounded-full">July 2026</span>
                      </div>
                      
                      <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                        <div className="grid grid-cols-7 bg-[#091d64] text-white text-[11px] font-bold text-center py-2.5 uppercase tracking-wider">
                          <div>Sun</div>
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                        </div>

                        <div className="grid grid-cols-7 gap-[1px] bg-slate-100">
                          {/* June Padding */}
                          <div className="bg-white/50 p-2 min-h-[85px] text-slate-300 text-xs font-semibold">28</div>
                          <div className="bg-white/50 p-2 min-h-[85px] text-slate-300 text-xs font-semibold">29</div>
                          <div className="bg-white/50 p-2 min-h-[85px] text-slate-300 text-xs font-semibold">30</div>

                          {Array.from({ length: 31 }).map((_, index) => {
                            const day = index + 1;
                            const evts: { title: string; color: string }[] = [];
                            // SK Balatas Youth Tech Bootcamp 2026: July 15 to 30
                            // Balatas Mental Health Seminar: July 8
                            if (day === 8) {
                              evts.push({ title: "Mental Health Seminar", color: "bg-purple-600" });
                            }
                            if (day >= 15 && day <= 30) {
                              evts.push({ title: "Youth Tech Bootcamp", color: "bg-blue-600" });
                            }
                            // Also map other dynamic programs if their startDate is in July 2026
                            programs.filter(p => p.id !== 'prog-01' && p.id !== 'prog-02' && p.id !== 'prog-03').forEach(p => {
                              if (p.startDate.startsWith('2026-07-')) {
                                const startD = parseInt(p.startDate.split('-')[2], 10);
                                const endD = parseInt(p.endDate.split('-')[2], 10);
                                if (day >= startD && day <= endD) {
                                  evts.push({ title: p.title, color: "bg-red-600" });
                                }
                              }
                            });

                            return (
                              <div key={day} className="bg-white p-2 min-h-[85px] flex flex-col justify-between hover:bg-slate-50 transition-colors">
                                <span className="text-xs font-bold text-slate-700">{day}</span>
                                <div className="space-y-1 mt-1">
                                  {evts.map((e, i) => (
                                    <div key={i} className={`text-[8px] font-extrabold ${e.color} text-white px-1 py-0.5 rounded truncate`} title={e.title}>
                                      {e.title}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* CARD 1: Kabataan Sports Fest 2025 */}
                      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                        <div className="flex gap-4 items-start">
                          <div className="w-24 h-24 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-[#091d64]">Kabataan Sports Fest 2025</h4>
                            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] mt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              May 20, 2025 - May 22, 2025
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                              A 3-day sports festival that promotes camaraderie, teamwork, and a healthy lifestyle among the youth.
                            </p>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Status</span>
                            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                              Ongoing
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Budget</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">₱ 50,000.00</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Registrations</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">120 / 200</span>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center gap-1 border border-slate-100 text-[10px] font-bold">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center gap-1 border border-slate-100 text-[10px] font-bold">
                              <FileText className="w-3.5 h-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: Youth Leadership Summit */}
                      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                        <div className="flex gap-4 items-start">
                          <div className="w-24 h-24 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-[#091d64]">Youth Leadership Summit</h4>
                            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] mt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Jun 10, 2025 - Jun 11, 2025
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                              A summit that empowers the youth to become effective leaders in their communities.
                            </p>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Status</span>
                            <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                              Upcoming
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Budget</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">₱ 30,000.00</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Registrations</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">45 / 150</span>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center gap-1 border border-slate-100 text-[10px] font-bold">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center gap-1 border border-slate-100 text-[10px] font-bold">
                              <FileText className="w-3.5 h-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: Coastal Clean-up Drive */}
                      <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                        <div className="flex gap-4 items-start">
                          <div className="w-24 h-24 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-[#091d64]">Coastal Clean-up Drive</h4>
                            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] mt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Apr 15, 2025
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                              A community initiative to clean the coastline and promote environmental awareness.
                            </p>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Status</span>
                            <span className="bg-green-50 text-green-600 border border-green-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                              Completed
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Budget</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">₱ 20,000.00</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Registrations</span>
                            <span className="text-xs font-extrabold text-slate-800 block mt-0.5">80 / 80</span>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center gap-1 border border-slate-100 text-[10px] font-bold">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center gap-1 border border-slate-100 text-[10px] font-bold">
                              <FileText className="w-3.5 h-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* DYNAMIC PROGRAMS DISPLAY FROM STATE */}
                      {programs.filter(p => p.id !== 'prog-01' && p.id !== 'prog-02' && p.id !== 'prog-03').map(p => (
                        <div key={p.id} className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                          <div className="flex gap-4 items-start">
                            <div className="w-24 h-24 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-[#091d64]">{p.title}</h4>
                              <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] mt-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {p.startDate} - {p.endDate}
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{p.description}</p>
                            </div>
                          </div>

                          <div className="w-full md:w-auto flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">Status</span>
                              <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                                {p.status}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold">Budget</span>
                              <span className="text-xs font-extrabold text-slate-800 block mt-0.5">₱ {p.budgetAllocation.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold">Registrations</span>
                              <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{p.registeredCount} / {p.maxParticipants}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                </div>

                {/* CREATE NEW PROGRAM DRAWER */}
                {showCreateProgDrawer && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs h-fit sticky top-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Create New Program</h4>
                      <button 
                        onClick={() => setShowCreateProgDrawer(false)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateProgramSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Program Title</label>
                        <input 
                          type="text" 
                          value={newProgForm.title}
                          onChange={(e) => setNewProgForm({...newProgForm, title: e.target.value})}
                          placeholder="Enter program title"
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                        <textarea 
                          value={newProgForm.description}
                          onChange={(e) => setNewProgForm({...newProgForm, description: e.target.value})}
                          placeholder="Enter program description"
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
                          <input 
                            type="date" 
                            value={newProgForm.startDate}
                            onChange={(e) => setNewProgForm({...newProgForm, startDate: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">End Date</label>
                          <input 
                            type="date" 
                            value={newProgForm.endDate}
                            onChange={(e) => setNewProgForm({...newProgForm, endDate: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Budget</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₱</span>
                          <input 
                            type="number" 
                            value={newProgForm.budgetAllocation}
                            onChange={(e) => setNewProgForm({...newProgForm, budgetAllocation: parseInt(e.target.value) || 0})}
                            placeholder="Enter budget amount"
                            className="w-full border border-slate-200 rounded-lg pl-7 pr-3 p-2 text-xs focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Registrations</label>
                        <input 
                          type="number" 
                          value={newProgForm.maxParticipants}
                          onChange={(e) => setNewProgForm({...newProgForm, maxParticipants: parseInt(e.target.value) || 100})}
                          className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                        <select 
                          value={newProgForm.status}
                          onChange={(e) => setNewProgForm({...newProgForm, status: e.target.value as any})}
                          className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs focus:outline-none font-bold"
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <button 
                          type="button"
                          onClick={() => { setShowCreateProgDrawer(false); }}
                          className="flex-1 py-2 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 font-bold"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                        >
                          Create Program
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================== 4. BUDGET MANAGEMENT (Image 3) ==================== */}
          {activeMenu === 'budget' && (
            <div className="space-y-6">
              
              {/* TOP HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#091d64]">Budget Monitoring</h3>
                  <p className="text-xs text-slate-400 mt-1">Track and monitor the utilization of the SK Federation budget.</p>
                </div>
                
                <button 
                  onClick={() => generatePDFReport('COA Annual Budget Audit Report')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Generate COA Report
                </button>
              </div>

              {/* FILTERS */}
              <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Year</span>
                  <select 
                    value={budgetYear} 
                    onChange={(e) => setBudgetYear(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1 bg-white text-xs font-bold focus:outline-none"
                  >
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Program</span>
                  <select 
                    value={budgetProgramFilter} 
                    onChange={(e) => setBudgetProgramFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1 bg-white text-xs font-bold focus:outline-none"
                  >
                    <option>All Programs</option>
                    <option>Youth Leadership Summit</option>
                    <option>Sports Development Program</option>
                  </select>
                </div>

                <button 
                  onClick={() => { setBudgetYear('2025'); setBudgetProgramFilter('All Programs'); }}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RefreshCwIcon className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              </div>

              {/* METRIC CARDS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Total Budget */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Budget</span>
                    <h4 className="text-xl font-extrabold text-slate-800 mt-1">₱ 25,480,000</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">FY 2025 Budget</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Spent</span>
                    <h4 className="text-xl font-extrabold text-slate-800 mt-1">₱ 12,650,000</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">As of May 20, 2025</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

                {/* Total Remaining */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Remaining</span>
                    <h4 className="text-xl font-extrabold text-slate-800 mt-1">₱ 12,830,000</h4>
                    <p className="text-[9px] text-green-600 font-bold mt-0.5">50.4% of Total Budget</p>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                {/* Utilization Rate gauge */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Utilization Rate</span>
                    <h4 className="text-xl font-extrabold text-[#091d64] mt-1">49.6%</h4>
                    <p className="text-[9px] text-green-600 font-bold mt-0.5">On Track</p>
                  </div>
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    {/* Tiny gauge representation */}
                    <svg className="w-12 h-12" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-blue-600" strokeDasharray="50, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* GRID CHARTS (IMAGE 3 LOWER) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* COLUMN 1 & 2: Budget vs Actual Monthly Bar */}
                <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Budget vs Actual (Monthly)</h4>
                    <select className="border border-slate-200 text-[10px] font-bold rounded-lg px-2.5 py-1 bg-white focus:outline-none">
                      <option>This Year</option>
                      <option>Previous Year</option>
                    </select>
                  </div>
                  <div className="h-64 w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <BarChart data={budgetVsActualMonthlyData}>
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="budget" name="Allocated Budget" fill="#091d64" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="spent" name="Actual Spending" fill="#93c5fd" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* COLUMN 3: Budget Allocation by Program Pie */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">Budget Allocation by Program</h4>
                  <div className="h-44 w-full min-w-0 relative flex items-center justify-center overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                      <PieChart>
                        <Pie
                          data={budgetAllocationByProgramData}
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {budgetAllocationByProgramData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₱ ${value.toLocaleString()}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t pt-4 text-[10px] font-bold text-slate-600 max-h-36 overflow-y-auto">
                    {budgetAllocationByProgramData.map((p, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="truncate">{p.name}</span>
                        </span>
                        <span className="text-slate-700 ml-2">{p.percentage} (₱{(p.value/1000000).toFixed(1)}M)</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* BUDGET UTILIZATION TABLE + ALERTS */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* TABLE COLUMN */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs p-6 overflow-x-auto">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">Budget Utilization by Program</h4>
                  <table className="w-full text-left text-xs font-semibold text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 font-extrabold uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5">Program</th>
                        <th className="px-4 py-2.5">Allocated</th>
                        <th className="px-4 py-2.5">Spent</th>
                        <th className="px-4 py-2.5">Remaining</th>
                        <th className="px-4 py-2.5">Utilization %</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {budgetUtilizationTable.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.program}</td>
                          <td className="px-4 py-3 font-mono">₱ {item.allocated.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono">₱ {item.spent.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono">₱ {item.remaining.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-8 block text-[10px] ${item.rate > 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-400 font-bold'}`}>{item.rate}%</span>
                              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden w-16">
                                <div className={`h-full rounded-full transition-all duration-300 ${item.rate > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} style={{ width: `${item.rate}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-green-50 text-green-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-green-200">
                              On Track
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ALERTS & QUICK ACTIONS COLUMN */}
                <div className="space-y-4">
                  
                  {/* Overspending Alerts */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Overspending Alerts</h4>
                      <button className="text-[10px] font-bold text-red-600 hover:underline">View All</button>
                    </div>

                    <div className="space-y-2.5">
                      
                      {/* Alert 1 */}
                      <div className="bg-red-50/50 p-3 rounded-lg border border-red-100 flex gap-2.5 items-start">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h6 className="text-[11px] font-extrabold text-slate-800">Barangay Sports Festival</h6>
                          <span className="bg-red-100 text-red-800 text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block">Over Budget</span>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">
                            Spent ₱ 2,150,000 which is <span className="font-bold text-red-600">107%</span> of the allocated budget (₱ 2,000,000).
                          </p>
                          <span className="text-[8px] text-slate-400 block mt-1 font-bold">Updated: May 19, 2025</span>
                        </div>
                      </div>

                      {/* Alert 2 */}
                      <div className="bg-red-50/50 p-3 rounded-lg border border-red-100 flex gap-2.5 items-start">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h6 className="text-[11px] font-extrabold text-slate-800">Environmental Cleanup Drive</h6>
                          <span className="bg-red-100 text-red-800 text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block">Over Budget</span>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">
                            Spent ₱ 1,200,000 which is <span className="font-bold text-red-600">104%</span> of the allocated budget (₱ 1,150,000).
                          </p>
                          <span className="text-[8px] text-slate-400 block mt-1 font-bold">Updated: May 18, 2025</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== 5. DOCUMENTS VIEW & DIGITAL APPROVAL WORKFLOW ==================== */}
          {activeMenu === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6">
                
                {/* HEADER BANNER WITH ACTION BUTTONS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-[#091d64] font-black text-[10px] rounded uppercase tracking-wider border border-blue-200">
                        Module 3 Governance Vault
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded uppercase border border-emerald-200">
                        Digital Sign-Off Workflow
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#091d64] mt-1.5 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-600" />
                      Barangay Document Repository & Executive Approval Desk
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Collaborative governance archive maintained by SK Secretary (Minutes/Resolutions), SK Treasurer (Vouchers/Budget), and Hon. SK Chairperson (Executive Orders/Digital Sign-offs).
                    </p>
                  </div>

                  {/* MASTER ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button 
                      onClick={() => setShowUploadDocModal(true)}
                      className="px-4 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      Upload Official Document
                    </button>
                    <button 
                      onClick={() => {
                        const headers = ['Document Code', 'Title', 'Category', 'Author / Role', 'Date Recorded', 'File Size', 'Status', 'Approver'];
                        const rows = localDocs.map(d => [
                          d.resolutionNumber || d.id, d.title, d.category, d.uploadedBy, d.uploadedDate, d.fileSize, d.status, d.designatedApprover || 'SK Chairperson'
                        ]);
                        exportCSVData('SK_Document_Repository_Vault', headers, rows);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      Export Vault (CSV)
                    </button>
                  </div>
                </div>

                {/* SEARCH & FILTERS TOOLBAR */}
                <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Search document title, resolution number, or author..."
                      value={docSearchTerm}
                      onChange={(e) => setDocSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20 focus:border-[#091d64]"
                    />
                  </div>

                  <select
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#091d64]/20"
                  >
                    <option value="All">All Categories</option>
                    <option value="Resolutions">Resolutions & Ordinances</option>
                    <option value="Budget">Budget & Ledgers</option>
                    <option value="Minutes">Minutes of Meetings</option>
                    <option value="Liquidation">Liquidation Reports</option>
                    <option value="Accomplishment">Accomplishment Reports</option>
                    <option value="Vouchers">Disbursement Vouchers</option>
                    <option value="Reports">Statutory Reports</option>
                    <option value="Communications">Communications</option>
                  </select>

                  <select
                    value={docStatusFilter}
                    onChange={(e) => setDocStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#091d64]/20"
                  >
                    <option value="All">All Approval Statuses</option>
                    <option value="Pending">Pending Digital Sign-Off</option>
                    <option value="Approved">Approved / Signed</option>
                    <option value="Draft">Draft</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* DOCUMENTS TABLE */}
                <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
                  <table className="w-full text-left text-xs font-semibold text-slate-600">
                    <thead className="bg-[#091d64] text-[10px] text-white font-extrabold uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-3.5">Code / Ref No.</th>
                        <th className="px-5 py-3.5">Document Title & Summary</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Author / Officer</th>
                        <th className="px-5 py-3.5">Date & Size</th>
                        <th className="px-5 py-3.5 text-center">Approval Status</th>
                        <th className="px-5 py-3.5 text-right">Executive Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                      {localDocs
                        .filter(doc => {
                          const matchesSearch = doc.title.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
                            (doc.resolutionNumber && doc.resolutionNumber.toLowerCase().includes(docSearchTerm.toLowerCase())) ||
                            doc.uploadedBy.toLowerCase().includes(docSearchTerm.toLowerCase());
                          const matchesCat = docCategoryFilter === 'All' || doc.category === docCategoryFilter;
                          const matchesStat = docStatusFilter === 'All' || doc.status === docStatusFilter;
                          return matchesSearch && matchesCat && matchesStat;
                        })
                        .map(doc => (
                          <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-[#091d64]">
                              {doc.resolutionNumber || doc.id}
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-900 block leading-tight">{doc.title}</span>
                                  {doc.description && (
                                    <span className="text-[11px] text-slate-400 font-normal block mt-0.5 line-clamp-1">{doc.description}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                                {doc.category}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block text-xs">{doc.uploadedBy}</span>
                                <span className="text-[10px] font-semibold text-slate-400 block">
                                  {doc.uploadedBy.includes('Secretary') ? 'Secretary Office' :
                                   doc.uploadedBy.includes('Treasurer') ? 'Treasury Office' : 'Executive Office'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-mono text-slate-600 block text-xs">{doc.uploadedDate}</span>
                              <span className="text-[10px] text-slate-400 block">{doc.fileSize}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                                doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                doc.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                                doc.status === 'Archived' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {doc.status === 'Approved' ? '✓ Approved / Signed' :
                                 doc.status === 'Pending' ? '⏳ Pending Sign-Off' : doc.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* DIGITAL SIGN-OFF WORKFLOW BUTTON */}
                                {doc.status === 'Pending' && (
                                  <button
                                    onClick={() => {
                                      setSelectedDocForApprove(doc);
                                      setApprovalDecision('Approved');
                                      setApprovalNotes(`Reviewed and digitally signed by Hon. SK Chairperson on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
                                      setShowApproveDocModal(true);
                                    }}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                                    title="Perform Digital Sign-Off Approval"
                                  >
                                    <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                                    Sign-Off
                                  </button>
                                )}

                                <button
                                  onClick={() => setInspectDoc(doc)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Inspect
                                </button>

                                <button
                                  onClick={() => {
                                    const element = document.createElement("a");
                                    const file = new Blob([`OFFICIAL SK BARANGAY DOCUMENT RECORD\n\nTitle: ${doc.title}\nRef No: ${doc.resolutionNumber || doc.id}\nCategory: ${doc.category}\nUploaded By: ${doc.uploadedBy}\nDate: ${doc.uploadedDate}\nStatus: ${doc.status}\nApprover: ${doc.designatedApprover || 'SK Chairperson'}\n\nDescription: ${doc.description || 'N/A'}`], {type: 'text/plain'});
                                    element.href = URL.createObjectURL(file);
                                    element.download = `${(doc.resolutionNumber || doc.id).replace(/\s+/g, '_')}_Record.txt`;
                                    document.body.appendChild(element);
                                    element.click();
                                    document.body.removeChild(element);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-[#091d64] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Download Document Copy"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {localDocs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">
                            No documents found matching the filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 6. EXECUTIVE REPORTS & DECISION ANALYTICS CENTER ==================== */}
          {activeMenu === 'reports' && (() => {
            // Dynamic derived metrics from real synchronized state props
            const totalYouth = youthProfiles.length;
            const totalProgs = programs.length;
            const totalDisbursed = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
            const totalAllocatedBudget = currentBarangay?.totalBudget || currentBarangay?.allocatedBudget || programs.reduce((acc, p) => acc + (p.budgetAllocation || 0), 0) || 630000;
            const totalTaxWithheld = expenses.reduce((acc, e) => acc + Math.round((e.amount || 0) * 0.05), 0);
            const liquidCashRemaining = Math.max(0, totalAllocatedBudget - totalDisbursed);

            // Demographic classifications
            const studentProfiles = youthProfiles.filter(p => p.education === 'In-School' || p.education === 'High School' || p.education === 'College' || p.youthSector === 'In-School Youth' || (p.education && p.education !== 'Graduate' && p.education !== 'Out-of-School Youth'));
            const osyProfiles = youthProfiles.filter(p => p.youthSector === 'Out-of-School Youth' || (p.employment === 'Unemployed' && p.education !== 'College'));
            const employedProfiles = youthProfiles.filter(p => p.employment === 'Employed' || p.employment === 'Self-Employed' || p.youthSector === 'Working Youth');
            const scholarProfiles = youthProfiles.filter(p => p.isScholar);
            const pwdSoloProfiles = youthProfiles.filter(p => p.youthSector === 'PWD' || p.youthSector === 'Solo Parent');

            const avgEngagementScore = totalYouth > 0 
              ? Math.round(youthProfiles.reduce((acc, p) => acc + (p.engagementScore || 85), 0) / totalYouth)
              : 85;

            // CBYDP Budget vs Expenditure breakdown by category
            const getCatAllocated = (keywords: string[]) => programs
              .filter(p => keywords.some(kw => (p.category || '').toLowerCase().includes(kw.toLowerCase())))
              .reduce((acc, p) => acc + (p.budgetAllocation || 0), 0);

            const getCatSpent = (keywords: string[]) => expenses
              .filter(e => keywords.some(kw => (e.category || '').toLowerCase().includes(kw.toLowerCase()) || (e.title || '').toLowerCase().includes(kw.toLowerCase())))
              .reduce((acc, e) => acc + (e.amount || 0), 0);

            const sportsAlloc = getCatAllocated(['sports', 'leadership', 'active']) || 180000;
            const sportsSpentVal = getCatSpent(['sports', 'leadership', 'active']) || 152000;

            const eduAlloc = getCatAllocated(['education', 'scholar', 'school']) || 220000;
            const eduSpentVal = getCatSpent(['education', 'scholar', 'supplies']) || 195000;

            const healthAlloc = getCatAllocated(['health', 'drug', 'medical']) || 140000;
            const healthSpentVal = getCatSpent(['health', 'drug', 'medical']) || 110000;

            const envAlloc = getCatAllocated(['environment', 'livelihood', 'clean']) || 90000;
            const envSpentVal = getCatSpent(['environment', 'livelihood', 'clean']) || 75000;

            const dynamicCbydpChart = [
              { center: 'Sports & Active', allocated: sportsAlloc, spent: sportsSpentVal },
              { center: 'Education', allocated: eduAlloc, spent: eduSpentVal },
              { center: 'Health & Drug', allocated: healthAlloc, spent: healthSpentVal },
              { center: 'Environment', allocated: envAlloc, spent: envSpentVal },
            ];

            // Feedback sentiment ratio
            const positiveFeedback = feedback.filter(f => f.sentiment === 'Positive' || !f.sentiment);
            const positivePercent = feedback.length > 0 ? Math.round((positiveFeedback.length / feedback.length) * 100) : 84;

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-left">
                
                {/* EXECUTIVE HEADER BANNER */}
                <div className="bg-gradient-to-r from-[#091d64] via-[#102a7c] to-[#1e3a8a] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950 flex items-center gap-1 shadow-xs">
                          <Award className="w-3 h-3" />
                          DILG MC 2023 & COA Standard
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/30 text-blue-100 border border-blue-300/30">
                          Barangay {currentBarangay?.name || 'San Francisco'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black font-sans tracking-tight">Executive Reports & Decision Analytics Center</h3>
                      <p className="text-xs text-blue-100 max-w-2xl font-medium">
                        Synchronized live governance database across SK Officers (Chairperson, Secretary, Treasurer, Kagawad). Generate official statutory summaries, COA-compliant financial ledgers, DILG Annex 4 Katipunan ng Kabataan census reports, and CBYDP accomplishment metrics.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button 
                        onClick={() => generatePDFReport('SK Executive Summary & COA Financial Performance Report')}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        Export Master PDF Report
                      </button>
                      <button 
                        onClick={() => {
                          const headers = ['Resident Name', 'Sex', 'Age', 'Zone', 'Education', 'Employment', 'Scholar', 'Youth Sector', 'Status'];
                          const rows = youthProfiles.map(p => [
                            p.name, p.sex, p.age, p.zone, p.education, p.employment, p.isScholar ? 'Yes' : 'No', p.youthSector || 'General', p.status
                          ]);
                          exportCSVData('Master_KK_Youth_Census', headers, rows);
                        }}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                        Export Master CSV
                      </button>
                    </div>
                  </div>

                  {/* EXECUTIVE STATS HIGHLIGHT BAR */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">KK Youth Census</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black">{totalYouth}</span>
                        <span className="text-[10px] text-emerald-300 font-bold">Live Residents</span>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Active CBYDP Programs</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black">{totalProgs}</span>
                        <span className="text-[10px] text-blue-200 font-bold">Initiatives</span>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">10% SK Allocation Spent</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black">
                          ₱{(totalDisbursed / 1000).toFixed(1)}k
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold">Disbursed</span>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">DILG & COA Audit Status</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black text-emerald-300">100% Dynamic Sync</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FILTERING & SEARCH TOOLBAR */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {(['All', 'Demographic', 'Accomplishment', 'Attendance', 'Beneficiary', 'Financial', 'Feedback'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setReportCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          reportCategoryFilter === cat 
                            ? 'bg-[#091d64] text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'All' ? 'All Statutory Reports' : `${cat} Reports`}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      placeholder="Search reports or codes..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20 focus:border-[#091d64]"
                    />
                  </div>
                </div>

                {/* VISUAL ANALYTICS BREAKDOWN SUMMARY (MODULE 5 DEMOGRAPHICS & BUDGET) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* YOUTH SECTOR DEMOGRAPHIC DISTRIBUTION CHART */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#091d64] flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Youth Sector Demographic Distribution
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">Live rule-based classification breakdown across Katipunan ng Kabataan</p>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                        Live Registry Analytics
                      </span>
                    </div>

                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[
                            { sector: 'Students', count: studentProfiles.length },
                            { sector: 'OSY', count: osyProfiles.length },
                            { sector: 'Employed', count: employedProfiles.length },
                            { sector: 'Scholars', count: scholarProfiles.length },
                            { sector: 'PWD / Solo', count: pwdSoloProfiles.length },
                          ]} 
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <XAxis dataKey="sector" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#091d64', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="count" fill="#091d64" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CBYDP BUDGET ALLOCATION VS EXPENDITURE PER CENTER CHART */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#091d64] flex items-center gap-2">
                          <Coins className="w-4 h-4 text-emerald-600" />
                          CBYDP Budget Allocation vs Expenditures
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">10% SK Annual Investment Plan spend per development center</p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                        Live Ledger Audit
                      </span>
                    </div>

                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={dynamicCbydpChart} 
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <XAxis dataKey="center" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} tickFormatter={(val) => `₱${val/1000}k`} />
                          <Tooltip 
                            formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, '']}
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="allocated" name="Allocated" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="spent" name="Spent" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* REPORT CARDS GRID (6 STATUTORY REPORTS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* 1. DEMOGRAPHIC CENSUS REPORT CARD */}
                  {(reportCategoryFilter === 'All' || reportCategoryFilter === 'Demographic') && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-blue-50 text-[#091d64] rounded-xl flex items-center justify-center font-bold">
                            <Users className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            DILG Annex 4
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#091d64]">Katipunan ng Kabataan Demographic Census</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Official profiling breakdown of registered youth constituents by age brackets, education, employment, scholar status, and Zone distributions.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Total Registered:</span>
                            <strong className="text-slate-900">{totalYouth} Youth Residents</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Scholars:</span>
                            <strong className="text-emerald-700">{scholarProfiles.length} Scholars</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const headers = ['Name', 'Sex', 'Age', 'Zone', 'Education', 'Employment', 'Scholar', 'Sector', 'Score'];
                            const rowsHTML = youthProfiles.map(p => `
                              <tr>
                                <td><strong>${p.name}</strong></td>
                                <td>${p.sex}</td>
                                <td>${p.age}</td>
                                <td>Zone ${p.zone}</td>
                                <td>${p.education || 'N/A'}</td>
                                <td>${p.employment || 'N/A'}</td>
                                <td>${p.isScholar ? '<span class="badge">Yes</span>' : 'No'}</td>
                                <td>${p.youthSector || 'In-School'}</td>
                                <td class="text-center"><strong>${p.engagementScore || 85}</strong>/100</td>
                              </tr>
                            `).join('');
                            const summaryHTML = `
                              <div class="stat-grid">
                                <div class="stat-box"><div class="stat-label">Total Registered Youth</div><div class="stat-value">${totalYouth}</div></div>
                                <div class="stat-box"><div class="stat-label">In-School Youth</div><div class="stat-value">${studentProfiles.length}</div></div>
                                <div class="stat-box"><div class="stat-label">Active Scholars</div><div class="stat-value">${scholarProfiles.length}</div></div>
                                <div class="stat-box"><div class="stat-label">Avg Engagement Score</div><div class="stat-value">${avgEngagementScore} pts</div></div>
                              </div>
                            `;
                            openDynamicPrintPDF(
                              'Katipunan ng Kabataan Demographic Census Report',
                              'Comprehensive Resident Profiling & Sectoral Distribution',
                              'DILG-ANNEX-4-2026',
                              headers,
                              rowsHTML,
                              summaryHTML
                            );
                          }}
                          className="flex-1 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button
                          onClick={() => {
                            const headers = ['Resident Name', 'Sex', 'Age', 'Zone', 'Education', 'Employment', 'Scholar', 'Youth Sector', 'Status'];
                            const rows = youthProfiles.map(p => [
                              p.name, p.sex, p.age, p.zone, p.education, p.employment, p.isScholar ? 'Yes' : 'No', p.youthSector || 'General', p.status
                            ]);
                            exportCSVData('KK_Demographic_Census', headers, rows);
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. CBYDP PROGRAM ACCOMPLISHMENT REPORT CARD */}
                  {(reportCategoryFilter === 'All' || reportCategoryFilter === 'Accomplishment') && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                            <ClipboardList className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            ABYIP FY 2026
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#091d64]">CBYDP Program Accomplishment Report</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Comprehensive audit of completed youth initiatives, target vs actual registered attendees, budget performance, and AYDP center outcomes.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Total Initiatives:</span>
                            <strong className="text-slate-900">{totalProgs} Programs</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Registrations:</span>
                            <strong className="text-blue-700">{registrations.length} Registrations</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const headers = ['AIP Code', 'Program Title', 'AYDP Center', 'Start Date', 'Registered Youth', 'Budget', 'Status'];
                            const rowsHTML = programs.map(p => {
                              const progRegs = registrations.filter(r => r.programId === p.id).length || p.registeredCount || 0;
                              return `
                                <tr>
                                  <td><strong>${p.aipReference || 'AIP-2026-001'}</strong></td>
                                  <td><strong>${p.title}</strong></td>
                                  <td>${p.category}</td>
                                  <td>${p.startDate}</td>
                                  <td class="text-center"><span class="badge badge-blue">${progRegs} Attendees</span></td>
                                  <td class="text-right">₱${(p.budgetAllocation || 0).toLocaleString()}</td>
                                  <td class="text-center"><span class="badge">${p.status}</span></td>
                                </tr>
                              `;
                            }).join('');
                            const summaryHTML = `
                              <div class="stat-grid">
                                <div class="stat-box"><div class="stat-label">Active Programs</div><div class="stat-value">${totalProgs}</div></div>
                                <div class="stat-box"><div class="stat-label">Total Registrations</div><div class="stat-value">${registrations.length}</div></div>
                                <div class="stat-box"><div class="stat-label">Gross AIP Allocation</div><div class="stat-value">₱${programs.reduce((acc, p) => acc + (p.budgetAllocation || 0), 0).toLocaleString()}</div></div>
                                <div class="stat-box"><div class="stat-label">Barangay Tenant</div><div class="stat-value">${currentBarangay?.name || 'San Francisco'}</div></div>
                              </div>
                            `;
                            openDynamicPrintPDF(
                              'Annual Youth Development Plan Accomplishment Report',
                              'Statutory Program Implementation & Youth Beneficiary Census',
                              'ABYIP-COMP-2026',
                              headers,
                              rowsHTML,
                              summaryHTML
                            );
                          }}
                          className="flex-1 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button
                          onClick={() => {
                            const headers = ['AIP Code', 'Program Title', 'Category', 'Start Date', 'Registered Youth', 'Budget Allocation', 'Status'];
                            const rows = programs.map(p => [
                              p.aipReference || 'AIP-2026-001', p.title, p.category, p.startDate, registrations.filter(r => r.programId === p.id).length || p.registeredCount || 0, p.budgetAllocation || 0, p.status
                            ]);
                            exportCSVData('CBYDP_Accomplishment_Report', headers, rows);
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. EVENT ATTENDANCE & YOUTH ENGAGEMENT AUDIT REPORT CARD */}
                  {(reportCategoryFilter === 'All' || reportCategoryFilter === 'Attendance') && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-violet-50 text-violet-700 rounded-xl flex items-center justify-center font-bold">
                            <CalendarCheck className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                            QR Verified Log
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#091d64]">Attendance & Youth Engagement Audit</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Live camera QR code check-in logs, volunteer hours tracking, engagement scoring classifications, and inactive sector identification.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Verified Registrations:</span>
                            <strong className="text-slate-900">{registrations.length} Check-Ins</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Engagement Score:</span>
                            <strong className="text-emerald-700">{avgEngagementScore} pts / 100</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const headers = ['Resident Name', 'Zone', 'Registered Date', 'Verification Method', 'Engagement Score'];
                            const rowsHTML = youthProfiles.map(p => `
                              <tr>
                                <td><strong>${p.name}</strong></td>
                                <td>Zone ${p.zone}</td>
                                <td>${(p as any).registeredDate || 'Aug 2026'}</td>
                                <td class="text-center"><span class="badge">QR Verified Pass</span></td>
                                <td class="text-center"><span class="badge badge-blue">${p.engagementScore || 85} pts</span></td>
                              </tr>
                            `).join('');
                            const summaryHTML = `
                              <div class="stat-grid">
                                <div class="stat-box"><div class="stat-label">Total Youth Roster</div><div class="stat-value">${totalYouth}</div></div>
                                <div class="stat-box"><div class="stat-label">Verified Registrations</div><div class="stat-value">${registrations.length}</div></div>
                                <div class="stat-box"><div class="stat-label">Avg Engagement Score</div><div class="stat-value">${avgEngagementScore} pts</div></div>
                                <div class="stat-box"><div class="stat-label">Verification Mode</div><div class="stat-value">Live QR Camera</div></div>
                              </div>
                            `;
                            openDynamicPrintPDF(
                              'Event Attendance & Youth Engagement Audit Report',
                              'QR Verification Logs & Rule-Based Participation Scoring',
                              'QR-AUDIT-2026',
                              headers,
                              rowsHTML,
                              summaryHTML
                            );
                          }}
                          className="flex-1 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button
                          onClick={() => {
                            const headers = ['Resident Name', 'Zone', 'Engagement Score', 'Classification'];
                            const rows = youthProfiles.map(p => [
                              p.name, p.zone, p.engagementScore || 85, (p.engagementScore || 85) >= 80 ? 'Highly Active' : 'Active'
                            ]);
                            exportCSVData('Attendance_Engagement_Audit', headers, rows);
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. SECTORAL BENEFICIARY ASSISTANCE REPORT CARD */}
                  {(reportCategoryFilter === 'All' || reportCategoryFilter === 'Beneficiary') && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                            <Award className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Priority Sectors
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#091d64]">Youth Sector & Beneficiary Assistance Roster</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Official tracking registry of Out-of-School Youth (OSY), active scholarship awardees, Solo Parents, and PWD constituents receiving assistance.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Scholarship Grantees:</span>
                            <strong className="text-slate-900">{scholarProfiles.length} Scholars</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>OSY & Special Sectors:</span>
                            <strong className="text-amber-800">{osyProfiles.length + pwdSoloProfiles.length} Beneficiaries</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const headers = ['Beneficiary Name', 'Category / Sector', 'Zone', 'School / Institution', 'Scholar Status', 'Record Status'];
                            const rowsHTML = youthProfiles.map(p => `
                              <tr>
                                <td><strong>${p.name}</strong></td>
                                <td><span class="badge badge-amber">${p.youthSector || (p.isScholar ? 'Tertiary Scholar' : 'General')}</span></td>
                                <td>Zone ${p.zone}</td>
                                <td>${p.school || 'Naga City Youth Center'}</td>
                                <td>${p.isScholar ? '<strong class="text-emerald-700">Active Scholar</strong>' : 'Constituent'}</td>
                                <td class="text-center"><span class="badge">${p.status}</span></td>
                              </tr>
                            `).join('');
                            const summaryHTML = `
                              <div class="stat-grid">
                                <div class="stat-box"><div class="stat-label">Total Youth Roster</div><div class="stat-value">${totalYouth}</div></div>
                                <div class="stat-box"><div class="stat-label">Active Scholars</div><div class="stat-value">${scholarProfiles.length}</div></div>
                                <div class="stat-box"><div class="stat-label">Out-of-School Youth</div><div class="stat-value">${osyProfiles.length}</div></div>
                                <div class="stat-box"><div class="stat-label">PWD / Solo Parent Support</div><div class="stat-value">${pwdSoloProfiles.length}</div></div>
                              </div>
                            `;
                            openDynamicPrintPDF(
                              'Youth Sector & Priority Beneficiary Assistance Report',
                              'Official Lister of OSY, Scholar, PWD, and Solo Parent Assistance Recipients',
                              'BEN-SECTOR-2026',
                              headers,
                              rowsHTML,
                              summaryHTML
                            );
                          }}
                          className="flex-1 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button
                          onClick={() => {
                            const headers = ['Beneficiary Name', 'Sector Category', 'Zone', 'Contact', 'Scholar Status'];
                            const rows = youthProfiles.map(p => [
                              p.name, p.youthSector || 'General', p.zone, p.mobile, p.isScholar ? 'Active Scholar' : 'N/A'
                            ]);
                            exportCSVData('Youth_Beneficiary_Roster', headers, rows);
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. COA FINANCIAL AUDIT & 10% SK ALLOCATION REPORT CARD */}
                  {(reportCategoryFilter === 'All' || reportCategoryFilter === 'Financial') && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center font-bold">
                            <Coins className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                            COA Audit Ready
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#091d64]">COA Financial Ledger & 10% SK Allocation</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Official disbursement vouchers, 5% VAT / 1% EWT tax withholdings, supplier payees, liquidation records, and unexpended cash balances.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Gross 10% Budget:</span>
                            <strong className="text-slate-900">₱{totalAllocatedBudget.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Withholding Tax Ledger:</span>
                            <strong className="text-emerald-700">₱{totalTaxWithheld.toLocaleString()} (5% VAT)</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const headers = ['DV Voucher #', 'Payee / Supplier', 'AIP Code & Purpose', 'Gross Amount', '5% VAT Tax', 'COA Audit Status'];
                            const rowsHTML = expenses.map(e => `
                              <tr>
                                <td><strong>${e.voucherNumber || e.id}</strong></td>
                                <td>${e.supplier || e.payee || 'Authorized Supplier'}</td>
                                <td>${e.title || e.category} (${e.aipCode || 'AIP-2026-001'})</td>
                                <td class="text-right">₱${Number(e.amount).toLocaleString()}</td>
                                <td class="text-right">₱${Math.round(e.amount * 0.05).toLocaleString()}</td>
                                <td class="text-center"><span class="badge">COA Audited</span></td>
                              </tr>
                            `).join('');
                            const summaryHTML = `
                              <div class="stat-grid">
                                <div class="stat-box"><div class="stat-label">Gross 10% SK Allocation</div><div class="stat-value">₱${totalAllocatedBudget.toLocaleString()}</div></div>
                                <div class="stat-box"><div class="stat-label">Total Disbursed Expenses</div><div class="stat-value">₱${totalDisbursed.toLocaleString()}</div></div>
                                <div class="stat-box"><div class="stat-label">Unexpended Liquid Funds</div><div class="stat-value">₱${liquidCashRemaining.toLocaleString()}</div></div>
                                <div class="stat-box"><div class="stat-label">Statutory Tax Withheld</div><div class="stat-value">₱${totalTaxWithheld.toLocaleString()}</div></div>
                              </div>
                            `;
                            openDynamicPrintPDF(
                              'Commission on Audit Financial Ledger & Tax Withholding Statement',
                              'Statutory 10% SK Allocation Expenditure Audit',
                              'COA-FIN-LEDGER-2026',
                              headers,
                              rowsHTML,
                              summaryHTML
                            );
                          }}
                          className="flex-1 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button
                          onClick={() => {
                            const headers = ['DV Number', 'Payee', 'Purpose', 'AIP Code', 'Gross Amount', '5% VAT Tax', 'Audit Status'];
                            const rows = expenses.map(e => [
                              e.voucherNumber || e.id, e.supplier || e.payee || 'Supplier', e.title || e.category, e.aipCode || 'AIP-2026-001', e.amount, Math.round(e.amount * 0.05), 'Audited'
                            ]);
                            exportCSVData('COA_Financial_Disbursement_Ledger', headers, rows);
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6. BOSES NG KABATAAN YOUTH SENTIMENT & FEEDBACK REPORT CARD */}
                  {(reportCategoryFilter === 'All' || reportCategoryFilter === 'Feedback') && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            Rule-Based Sentiment
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#091d64]">Youth Sentiment & Boses Feedback Analytics</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                            Automated keyword extraction, community concern categorization, program requests analysis, and constituent sentiment ratio.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                          <div className="flex justify-between">
                            <span>Positive Sentiment:</span>
                            <strong className="text-emerald-700">{positivePercent}% Approval Rate</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Submissions Count:</span>
                            <strong className="text-blue-700">{feedback.length} Submissions</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            const headers = ['Constituent Name', 'Category', 'Feedback Content', 'Sentiment Classification', 'Official SK Status'];
                            const rowsHTML = feedback.map(f => `
                              <tr>
                                <td><strong>${f.authorName}</strong></td>
                                <td>${f.category || 'General Suggestion'}</td>
                                <td>"${f.content}"</td>
                                <td class="text-center"><span class="badge ${f.sentiment === 'Positive' ? '' : 'badge-amber'}">${f.sentiment || 'Positive'}</span></td>
                                <td class="text-center"><span class="badge badge-blue">Reviewed by SK Officer</span></td>
                              </tr>
                            `).join('');
                            const summaryHTML = `
                              <div class="stat-grid">
                                <div class="stat-box"><div class="stat-label">Total Submissions</div><div class="stat-value">${feedback.length}</div></div>
                                <div class="stat-box"><div class="stat-label">Positive Sentiment</div><div class="stat-value">${positivePercent}%</div></div>
                                <div class="stat-box"><div class="stat-label">Target Barangay</div><div class="stat-value">${currentBarangay?.name || 'San Francisco'}</div></div>
                                <div class="stat-box"><div class="stat-label">Response Velocity</div><div class="stat-value">&lt; 24 Hours</div></div>
                              </div>
                            `;
                            openDynamicPrintPDF(
                              'Boses ng Kabataan Youth Sentiment & Community Feedback Report',
                              'Rule-Based Sentiment Classification & Youth Priority Demand Analytics',
                              'FEEDBACK-SENTIMENT-2026',
                              headers,
                              rowsHTML,
                              summaryHTML
                            );
                          }}
                          className="flex-1 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button
                          onClick={() => {
                            const headers = ['Constituent Name', 'Category', 'Feedback Text', 'Sentiment', 'Date'];
                            const rows = feedback.map(f => [
                              f.authorName, f.category || 'General', f.content, f.sentiment || 'Positive', f.date || '2026-08-15'
                            ]);
                            exportCSVData('Youth_Sentiment_Feedback_Report', headers, rows);
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                          title="Export CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })()}

          {/* ==================== 7. ANNOUNCEMENTS & FACEBOOK SOCIAL SYNC ==================== */}
          {activeMenu === 'announcements' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              
              {/* FACEBOOK PAGE INTEGRATION STATUS HEADER */}
              <div className="bg-gradient-to-r from-[#1877f2] to-[#0d5cb6] p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                      <Facebook className="w-7 h-7 text-white fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans font-black text-lg tracking-tight">SK Facebook Page Auto-Sync Integration</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-emerald-950 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected & Active
                        </span>
                      </div>
                      <p className="text-xs text-blue-100 font-medium mt-1">
                        Official Page: <span className="font-bold underline">SK Barangay {currentBarangay.name} - Official</span> (Page ID: <span className="font-mono">fb-104928571928</span>)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-100">Auto-Sync to Meta/Facebook</span>
                      <span className="text-xs font-black">{fbAutoSyncEnabled ? 'ENABLED (Instant Cross-Post)' : 'DISABLED (KABISIG Only)'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFbAutoSyncEnabled(!fbAutoSyncEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        fbAutoSyncEnabled ? 'bg-emerald-400' : 'bg-slate-400/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                        fbAutoSyncEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN WORKSPACE: COMPOSE (LEFT) + PUBLISHED & REACH ANALYTICS (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COMPOSE ADVISORY & SOCIAL SYNC FORM */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xs space-y-4 lg:col-span-1">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#091d64]" />
                      Compose Advisory / Advisory Notice
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Author announcements with automatic Facebook cross-posting.</p>
                  </div>

                  <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Announcement Title *</label>
                      <input 
                        type="text" 
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. SK Youth Assembly Consultation Notice" 
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#091d64] bg-slate-50 focus:bg-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                        <select 
                          value={annCategory}
                          onChange={(e) => setAnnCategory(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#091d64] bg-slate-50"
                        >
                          <option value="Advisory">Advisory</option>
                          <option value="Program Launch">Program Launch</option>
                          <option value="Assembly Notice">Assembly Notice</option>
                          <option value="Scholarship Alert">Scholarship Alert</option>
                          <option value="Emergency Advisory">Emergency Advisory</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Zone / Purok</label>
                        <select 
                          value={annTarget}
                          onChange={(e) => setAnnTarget(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#091d64] bg-slate-50"
                        >
                          <option value="All Zones">All Zones / Puroks</option>
                          <option value="Purok 1-3">Purok 1-3</option>
                          <option value="Purok 4-7">Purok 4-7</option>
                          <option value="Students Only">Students & Scholars</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Announcement Body Content *</label>
                      <textarea 
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        rows={5} 
                        placeholder="Type announcement details, location, requirements, and schedule..." 
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#091d64] bg-slate-50 focus:bg-white"
                        required
                      />
                    </div>

                    <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-[#1877f2] fill-[#1877f2]" />
                        <span className="text-[11px] font-bold text-slate-700">Auto-Sync to Official FB Page</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={annPostToFb}
                        onChange={(e) => setAnnPostToFb(e.target.checked)}
                        className="w-4 h-4 text-[#1877f2] rounded border-slate-300 focus:ring-[#1877f2] cursor-pointer"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#091d64] hover:bg-opacity-95 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Megaphone className="w-4 h-4" />
                      Publish & Sync to Facebook Page
                    </button>
                  </form>
                </div>

                {/* PUBLISHED ANNOUNCEMENTS TABLE & REACH ANALYTICS */}
                <div className="space-y-4 lg:col-span-2">
                  
                  {/* METRIC CARDS */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Published</span>
                      <span className="text-xl font-black text-[#091d64] mt-1 block">{announcementsList.length}</span>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facebook Social Reach</span>
                      <span className="text-xl font-black text-blue-600 mt-1 block">
                        {announcementsList.reduce((a, b) => a + b.socialReach.views, 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">Views</span>
                      </span>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Social Engagement</span>
                      <span className="text-xl font-black text-emerald-600 mt-1 block">
                        {announcementsList.reduce((a, b) => a + (b.socialReach.reactions + b.socialReach.shares), 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">Interactions</span>
                      </span>
                    </div>
                  </div>

                  {/* ANNOUNCEMENT FEED LIST */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Active Broadcasts & Facebook Sync Logs</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Auto-Sync Server: Online</span>
                    </div>

                    {announcementsList.map(ann => (
                      <div key={ann.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-50 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-[#091d64]">
                              {ann.category}
                            </span>
                            <span className="text-slate-400 text-xs font-semibold">● {ann.targetPurok}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                              ann.fbSyncStatus === 'Synced' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              <Facebook className="w-3 h-3 fill-current" />
                              {ann.fbSyncStatus}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{ann.datePublished}</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{ann.title}</h5>
                          <p className="text-slate-600 text-xs mt-1 leading-relaxed">{ann.content}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400 font-semibold">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-mono text-[10px]">FB Post ID: <span className="font-bold text-slate-700">{ann.fbPostId}</span></span>
                            <span>By: {ann.author}</span>
                          </div>

                          <div className="flex items-center gap-3 text-slate-600 font-bold">
                            <span>👁️ {ann.socialReach.views} Views</span>
                            <span>👍 {ann.socialReach.reactions} Reactions</span>
                            <span>🔁 {ann.socialReach.shares} Shares</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== 8. CALENDAR ==================== */}
          {activeMenu === 'calendar' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#091d64]">AIP Program Scheduling Calendar</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Track Sangguniang Kabataan events, council sessions, and program milestones for July 2026.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#091d64] bg-blue-50 px-3 py-1 rounded-full">July 2026</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">7 Scheduled Events</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Calendar Grid (3/4 width) */}
                  <div className="lg:col-span-3 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                    {/* Days of the week header */}
                    <div className="grid grid-cols-7 bg-[#091d64] text-white text-[11px] font-bold text-center py-2.5 uppercase tracking-wider">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-[1px] bg-slate-100">
                      {/* Empty cells or padded days for previous month (June 28, 29, 30) */}
                      <div className="bg-white/50 p-2 min-h-[90px] text-slate-300 text-xs font-semibold">28</div>
                      <div className="bg-white/50 p-2 min-h-[90px] text-slate-300 text-xs font-semibold">29</div>
                      <div className="bg-white/50 p-2 min-h-[90px] text-slate-300 text-xs font-semibold">30</div>

                      {/* July 2026 Days 1 to 31 */}
                      {Array.from({ length: 31 }).map((_, index) => {
                        const day = index + 1;
                        // Events matching:
                        const events: { title: string; color: string; desc: string }[] = [];
                        if (day === 3) events.push({ title: "SK Council Session", color: "bg-amber-500", desc: "SK Council Hall, 9:00 AM" });
                        if (day === 10) events.push({ title: "KK Profiling Drive", color: "bg-blue-500", desc: "Zone 1-3 Community Center" });
                        if (day === 15) events.push({ title: "SK Sports Opening", color: "bg-emerald-500", desc: "Balatas Sports Complex, 4:00 PM" });
                        if (day === 16) events.push({ title: "Sports Day 2", color: "bg-emerald-400", desc: "Eliminations & Matches" });
                        if (day === 17) events.push({ title: "Sports Championship", color: "bg-emerald-600", desc: "Awarding Ceremony, 6:00 PM" });
                        if (day === 24) events.push({ title: "Leadership Seminar", color: "bg-purple-500", desc: "Session Hall, 1:00 PM" });
                        if (day === 25) events.push({ title: "Tree Planting Drive", color: "bg-green-500", desc: "Zone 5 Watershed Area" });

                        return (
                          <div key={day} className="bg-white p-2 min-h-[90px] flex flex-col justify-between hover:bg-slate-50 transition-colors">
                            <span className="text-xs font-bold text-slate-700">{day}</span>
                            <div className="space-y-1 mt-1">
                              {events.map((evt, idx) => (
                                <div key={idx} className={`text-[8px] font-extrabold ${evt.color} text-white px-1 py-0.5 rounded truncate`} title={`${evt.title} - ${evt.desc}`}>
                                  {evt.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Padding cells for next month (August 1) */}
                      <div className="bg-white/50 p-2 min-h-[90px] text-slate-300 text-xs font-semibold">1</div>
                    </div>
                  </div>

                  {/* Calendar Agenda sidebar (1/4 width) */}
                  <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheduled AIP Events</h4>
                    <div className="space-y-3">
                      <div className="p-3.5 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-lg text-xs">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">July 3 • 9:00 AM</span>
                        <span className="font-bold text-slate-800 mt-1 block leading-tight">SK Regular Council Session</span>
                        <p className="text-[11px] text-slate-400 mt-1">Review resolution drafts and compliance updates.</p>
                      </div>

                      <div className="p-3.5 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg text-xs">
                        <span className="text-[10px] font-bold text-blue-700 block uppercase">July 10 • All Day</span>
                        <span className="font-bold text-slate-800 mt-1 block leading-tight">KK Youth Profiling Drive</span>
                        <p className="text-[11px] text-slate-400 mt-1">Registrations for new constituents at Barangay Hall.</p>
                      </div>

                      <div className="p-3.5 border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-lg text-xs">
                        <span className="text-[10px] font-bold text-emerald-700 block uppercase">July 15-17 • 4:00 PM</span>
                        <span className="font-bold text-slate-800 mt-1 block leading-tight">SK Summer Sports Fest</span>
                        <p className="text-[11px] text-slate-400 mt-1">Basketball tournaments and sports development.</p>
                      </div>

                      <div className="p-3.5 border-l-4 border-purple-500 bg-purple-50/50 rounded-r-lg text-xs">
                        <span className="text-[10px] font-bold text-purple-700 block uppercase">July 24 • 1:00 PM</span>
                        <span className="font-bold text-slate-800 mt-1 block leading-tight">Youth Leadership Summit</span>
                        <p className="text-[11px] text-slate-400 mt-1">Mandatory digital capacity workshop for SK youth.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== FACEBOOK SYNC (NEW) ==================== */}
          {activeMenu === 'facebook_sync' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
                <div>
                  <h2 className="text-2xl font-black text-[#091d64] tracking-tight">Social Media Sync</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Manage your connected Facebook Page, format announcements, and schedule youth updates.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Connected to Facebook</span>
                  </div>
                  <button className="bg-[#091d64] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1a2d75] transition-all flex items-center gap-2 shadow-sm">
                    <Facebook className="w-4 h-4" />
                    Create Post
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Composer */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-blue-600" />
                      Announcement Formatter
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <input type="text" placeholder="Post Title (Optional)" className="w-full text-sm font-bold border-b border-slate-200 px-2 py-3 focus:outline-none focus:border-blue-600 transition-colors" />
                      </div>
                      <div>
                        <textarea placeholder="What's happening in your Barangay? Format your announcements for the youth..." className="w-full text-sm p-4 border border-slate-200 rounded-xl min-h-[150px] resize-y focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"></textarea>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Attach Image">
                            <UploadIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Schedule Post">
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2">Save Draft</button>
                          <button className="bg-blue-600 text-white text-xs font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-all">Publish Now</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled & Recent */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-sm font-extrabold text-slate-800">Recent & Scheduled Posts</h3>
                      <button className="text-xs font-bold text-blue-600 hover:underline">View Log</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-extrabold text-slate-800">Sports Fest Registration Reminder</h4>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Scheduled</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">Friendly reminder to all youth constituents that the registration for the Summer Sports Fest will close in 3 days. Register via KABISIG now!</p>
                          <span className="text-[10px] font-bold text-slate-400 mt-2 block">Will post on: July 12, 2026 • 10:00 AM</span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-extrabold text-slate-800">SK Regular Council Session Results</h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Published</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">Transparency update! The council has approved Resolution No. 04-2026 allocating funds for the upcoming Leadership Training.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-bold text-slate-400">Posted on: July 3, 2026</span>
                            <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Facebook className="w-3 h-3" /> 245 Reach</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  {/* Page Status */}
                  <div className="bg-gradient-to-br from-[#091d64] to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                    <Facebook className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl p-2 flex items-center justify-center border border-white/20">
                          <Facebook className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold tracking-tight">SK {currentBarangay.name} Official</h4>
                          <span className="text-[10px] font-medium text-blue-200">Page ID: 1029485726</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                          <span className="text-[10px] font-medium text-blue-200 block mb-1 uppercase tracking-wider">Followers</span>
                          <span className="text-xl font-black">2,450</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                          <span className="text-[10px] font-medium text-blue-200 block mb-1 uppercase tracking-wider">Weekly Reach</span>
                          <span className="text-xl font-black">1.2K</span>
                        </div>
                      </div>
                      
                      <button className="w-full mt-6 bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold py-2 rounded-lg border border-white/20 backdrop-blur-sm">
                        Manage Page Connection
                      </button>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 mb-4">Automation Settings</h3>
                    <div className="space-y-4 text-sm font-semibold text-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block">Auto-post Approved Programs</span>
                          <span className="text-[10px] font-medium text-slate-400">Draft posts when new programs are created.</span>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="block">Sync Financial Summaries</span>
                          <span className="text-[10px] font-medium text-slate-400">Monthly auto-posting of public budgets.</span>
                        </div>
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="block">Cross-post to Main LGU</span>
                          <span className="text-[10px] font-medium text-slate-400">Tag Naga City Youth Development Office.</span>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 9. SETTINGS ==================== */}
          {activeMenu === 'settings' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs max-w-2xl">
                <h3 className="text-lg font-extrabold text-[#091d64] mb-2">Barangay Admin System Parameters</h3>
                <p className="text-xs text-slate-400 mb-6">Manage localized KK profiling requirements, registration security controls, and digital verification rules under project KABISIG.</p>
                
                <div className="space-y-6 text-xs font-semibold">
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-4">
                    <h4 className="text-xs font-bold text-[#091d64] uppercase tracking-wider">Demographic Profile Parameters</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Tenant Barangay</label>
                        <input type="text" value={`Barangay ${currentBarangay.name}`} disabled className="w-full px-3 py-2 border rounded-lg bg-white/70 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#091d64]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Localized Resident Subdivisions</label>
                        <select className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold">
                          <option>7 Residential Zones (Default)</option>
                          <option>5 Residential Puroks</option>
                          <option>Custom Subdivisions</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-[#091d64] uppercase tracking-wider">Katipunan ng Kabataan Validation Rules</h4>
                    
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <div>
                        <span className="text-slate-700 block">Require Document Upload on Sign Up</span>
                        <span className="text-[10px] text-slate-400 font-medium">Require uploading a digital copy of valid IDs or Barangay Certifications.</span>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-[#091d64] focus:ring-[#091d64] w-4 h-4" />
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <div>
                        <span className="text-slate-700 block">Automatic Email Notifications to KK Youth</span>
                        <span className="text-[10px] text-slate-400 font-medium">Send automatic feedback when program applications are approved or rejected.</span>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-[#091d64] focus:ring-[#091d64] w-4 h-4" />
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="text-slate-700 block">Enforce Digital QR Verification IDs</span>
                        <span className="text-[10px] text-slate-400 font-medium">Issue authenticated QR codes on approved profiles for event physical logging.</span>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-[#091d64] focus:ring-[#091d64] w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-right">
                    <button 
                      onClick={() => alert('Barangay system configurations successfully saved!')}
                      className="px-5 py-2.5 bg-[#091d64] text-white hover:bg-opacity-95 font-bold rounded-lg text-xs shadow-xs"
                    >
                      Save Configurations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 10. PROFILE ==================== */}
          {activeMenu === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                <h3 className="text-lg font-extrabold text-[#091d64] mb-4">Sangguniang Kabataan Admin Profile</h3>
                <div className="flex items-center gap-4 mb-6">
                  <ProfileAvatar name={currentBarangay?.chairperson} className="w-20 h-20 rounded-full border border-slate-100 shadow-xs" />
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{currentBarangay.chairperson}</h4>
                    <span className="text-xs bg-blue-50 text-[#091d64] border border-blue-100 px-2.5 py-0.5 rounded-full font-bold inline-block mt-1">
                      SK Chairperson
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Barangay {currentBarangay.name} Sangguniang Kabataan</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs font-bold text-slate-600 max-w-xl">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Official Email</span>
                    <span className="text-slate-800 font-bold block">
                      {currentBarangay.chairperson.toLowerCase().replace(/hon\.\s+/g, '').replace(/[^a-z0-9.]/g, '')}@naga.gov.ph
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Contact Number</span>
                    <span className="text-slate-800 font-bold block">{currentBarangay.contact}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 11. AUDIT LOG (SK CHAIRPERSON SUPERVISORY DESK) ==================== */}
          {activeMenu === 'audit' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-[#091d64] font-black text-[10px] rounded uppercase tracking-wider">
                        CHAIRPERSON SUPERVISORY DESK
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#091d64] mt-1">Official Activity & Audit Log</h3>
                    <p className="text-xs text-slate-400">
                      Supervisory log of administrative and financial transactions executed by the <span className="font-bold text-slate-600">SK Treasurer</span> and <span className="font-bold text-slate-600">SK Secretary</span>.
                    </p>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setAuditLogRoleFilter('All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        auditLogRoleFilter === 'All'
                          ? 'bg-[#091d64] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Officials (Treasurer & Secretary)
                    </button>
                    <button
                      onClick={() => setAuditLogRoleFilter('Treasurer')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        auditLogRoleFilter === 'Treasurer'
                          ? 'bg-[#091d64] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      SK Treasurer History
                    </button>
                    <button
                      onClick={() => setAuditLogRoleFilter('Secretary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        auditLogRoleFilter === 'Secretary'
                          ? 'bg-[#091d64] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      SK Secretary History
                    </button>
                  </div>
                </div>

                {/* Stat Summary Cards */}
                {(() => {
                  const treasurerLogs = auditLogs.filter(
                    l => l.role === 'SK Treasurer' || l.user.toLowerCase().includes('treasurer')
                  );
                  const secretaryLogs = auditLogs.filter(
                    l => l.role === 'SK Secretary' || l.user.toLowerCase().includes('secretary')
                  );
                  const totalOfficialLogs = treasurerLogs.length + secretaryLogs.length;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                          Total Monitored Logs
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#091d64]">{totalOfficialLogs}</span>
                          <span className="text-xs text-slate-500 font-semibold">Official entries</span>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block mb-1">
                          SK Treasurer Financial History
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-emerald-700">{treasurerLogs.length}</span>
                          <span className="text-xs text-emerald-600 font-semibold">Vouchers & SRE</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <span className="text-[10px] text-blue-800 font-extrabold uppercase tracking-wider block mb-1">
                          SK Secretary Governance History
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-blue-700">{secretaryLogs.length}</span>
                          <span className="text-xs text-blue-600 font-semibold">Minutes & Rosters</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Audit Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs font-semibold text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 font-extrabold uppercase border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Official Name & Role</th>
                        <th className="p-3.5">Action Code</th>
                        <th className="p-3.5">Transaction & Activity Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {auditLogs
                        .filter(log => {
                          const isOfficer =
                            log.role === 'SK Treasurer' ||
                            log.role === 'SK Secretary' ||
                            log.user.toLowerCase().includes('treasurer') ||
                            log.user.toLowerCase().includes('secretary');
                          if (!isOfficer) return false;

                          if (auditLogRoleFilter === 'Treasurer') {
                            return log.role === 'SK Treasurer' || log.user.toLowerCase().includes('treasurer');
                          }
                          if (auditLogRoleFilter === 'Secretary') {
                            return log.role === 'SK Secretary' || log.user.toLowerCase().includes('secretary');
                          }
                          return true;
                        })
                        .map(log => {
                          const isTreasurer = log.role === 'SK Treasurer' || log.user.toLowerCase().includes('treasurer');
                          return (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                              <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-3.5 font-bold text-slate-800">
                                <span className="text-[#091d64] block">{log.user}</span>
                                <span
                                  className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md mt-0.5 border ${
                                    isTreasurer
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-blue-50 text-blue-800 border-blue-200'
                                  }`}
                                >
                                  {log.role}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-600">{log.details}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="h-12 border-t border-slate-100 bg-white flex items-center justify-center text-[11px] text-slate-400 font-sans tracking-wide">
          © 2025 SK Federation Naga City. All rights reserved.
        </footer>

      </div>

      {/* ==================== YOUTH PROFILE DETAILS INSPECT MODAL ==================== */}
      {inspectProfile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#091d64] text-white p-5 border-b-4 border-[#fbbf24] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Katipunan ng Kabataan Profile Verification</h3>
                <p className="text-xs text-slate-300">Desk inspection for {inspectProfile.name}</p>
              </div>
              <button 
                onClick={() => { setInspectProfile(null); setShowRejectField(false); }}
                className="p-1 text-slate-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              <div className="flex items-center gap-4 border-b pb-4">
                  <ProfileAvatar name={inspectProfile.name} src={inspectProfile.profilePic} alt={inspectProfile.name} className="w-16 h-16 rounded-full border border-slate-100 shadow-2xs" />
                <div>
                  <h4 className="text-xl font-bold text-slate-800 leading-none">{inspectProfile.name}</h4>
                  <span className="text-xs text-slate-400 font-mono font-bold mt-1 inline-block">ID: {inspectProfile.id}</span>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-50 text-[#091d64] border border-blue-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {inspectProfile.sex}
                    </span>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {inspectProfile.scholarStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                <div className="sm:col-span-2 p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Desired KABISIG Role / Affiliation</span>
                    <span className="text-slate-800 font-black text-sm text-[#091d64] flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      {inspectProfile.registeredRole || 'Youth Constituent'}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Registration Barangay & Date</span>
                    <span className="text-slate-700 font-bold block text-xs">
                      Barangay {currentBarangay.name} • {inspectProfile.dateRegistered}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Birthdate & calculated age</span>
                  <span className="text-slate-800 block">{inspectProfile.birthdate} ({inspectProfile.age} yrs old)</span>
                </div>
                
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Registered Location Address</span>
                  <span className="text-slate-800 block">{inspectProfile.address} ({inspectProfile.zone})</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Mobile Phone Number</span>
                  <span className="text-slate-800 block">{inspectProfile.mobile}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Email Address</span>
                  <span className="text-slate-800 block">{inspectProfile.email}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Current School & Scholastic level</span>
                  <span className="text-slate-800 block">{inspectProfile.school || 'Not Enrolled'} ({inspectProfile.educationalLevel})</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Course Strand / Year level</span>
                  <span className="text-slate-800 block">{inspectProfile.course || 'N/A'} - {inspectProfile.year || 'N/A'}</span>
                </div>

                 <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">Emergency Parent / Guardian Info</span>
                  <span className="text-slate-800 font-bold block">{inspectProfile.guardianName} ({inspectProfile.guardianContact})</span>
                </div>

                {/* Rule-Based Intelligence Suite */}
                <div className="sm:col-span-2 p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-4 text-left">
                  <h5 className="text-xs font-black text-[#091d64] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    KABISIG Rule-Based Intelligence Suite
                  </h5>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Column 1: Demographics Classification & Engagement Score */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 block mb-1 text-[9px] uppercase tracking-wider font-extrabold">Smart Demographic Classifications</span>
                        <div className="flex flex-wrap gap-1.5">
                          {classifyDemographics(inspectProfile).map((cat, cIdx) => (
                            <span key={cIdx} className="bg-[#091d64] text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                              {cat}
                            </span>
                          ))}
                          {classifyDemographics(inspectProfile).length === 0 && (
                            <span className="text-slate-400 text-[11px] font-semibold">General Youth</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1 text-[9px] uppercase tracking-wider font-extrabold">Calculated Engagement Analytics</span>
                        {(() => {
                          const engagement = calculateEngagementScore(inspectProfile, registrations, feedback, resolutions);
                          return (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800">
                                Score: <span className="text-blue-700 font-mono font-black">{engagement.score}</span>/100
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                engagement.classification === 'Highly Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                engagement.classification === 'Active' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                engagement.classification === 'Moderately Active' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {engagement.classification}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Column 2: Personalized Program Recommendations */}
                    <div>
                      <span className="text-slate-400 block mb-1 text-[9px] uppercase tracking-wider font-extrabold">Smart Program Recommendations</span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {recommendPrograms(inspectProfile, programs, registrations).map((rec, rIdx) => (
                          <div key={rIdx} className="p-2 rounded bg-white border border-blue-100/50">
                            <span className="text-[11px] font-bold text-slate-800 block leading-tight">{rec.program.title}</span>
                            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{rec.reason}</span>
                          </div>
                        ))}
                        {recommendPrograms(inspectProfile, programs, registrations).length === 0 && (
                          <span className="text-slate-400 text-[11px] font-semibold block">No matching recommendations found.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showRejectField && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs space-y-2">
                  <label className="block font-bold text-slate-700">Reason for Application Rejection</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason (e.g. Non-resident of this Barangay, Invalid Age group...)"
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowRejectField(false)}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-md font-bold"
                    >
                      Cancel Rejection
                    </button>
                    <button 
                      onClick={() => {
                        if (!rejectionReason) {
                          alert('Please enter a rejection reason.');
                          return;
                        }
                        onRejectYouth(inspectProfile.id, rejectionReason);
                        setInspectProfile(null);
                        setShowRejectField(false);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md font-bold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 border-t flex justify-between items-center">
              {!showRejectField && (
                <button
                  onClick={() => setShowRejectField(true)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Reject Profile
                </button>
              )}
              <div />

              <div className="flex gap-2">
                <button
                  onClick={() => { setInspectProfile(null); setShowRejectField(false); }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs"
                >
                  Close Desk
                </button>
                {inspectProfile.status === 'Pending' && !showRejectField && (
                  <button
                    onClick={() => {
                      onApproveYouth(inspectProfile.id);
                      setInspectProfile(null);
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-md flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Approve Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DOCUMENT DETAILS INSPECT MODAL ==================== */}
      {inspectDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#091d64] text-white p-5 border-b-4 border-[#fbbf24] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base">Archived Document Record</h3>
                  <p className="text-[11px] text-slate-300">Official Barangay Repository Record</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectDoc(null)}
                className="p-1 text-slate-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Document Title</span>
                <span className="text-sm font-bold text-[#091d64] block">{inspectDoc.title}</span>
                {inspectDoc.resolutionNumber && (
                  <span className="text-xs text-slate-500 font-mono mt-0.5 block">Reference: {inspectDoc.resolutionNumber}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Category</span>
                  <span className="font-bold text-slate-800">{inspectDoc.category}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Status</span>
                  <span className="font-bold text-emerald-700">{inspectDoc.status}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Recorded By</span>
                  <span className="font-bold text-slate-800">{inspectDoc.uploadedBy}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Date & Size</span>
                  <span className="font-bold text-slate-800">{inspectDoc.uploadedDate} ({inspectDoc.fileSize})</span>
                </div>
              </div>

              {inspectDoc.description && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Official Notes / Summary</span>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">{inspectDoc.description}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const element = document.createElement("a");
                  const file = new Blob([`OFFICIAL SK BARANGAY DOCUMENT RECORD\n\nTitle: ${inspectDoc.title}\nRef No: ${inspectDoc.resolutionNumber || inspectDoc.id}\nCategory: ${inspectDoc.category}\nUploaded By: ${inspectDoc.uploadedBy}\nDate: ${inspectDoc.uploadedDate}\nStatus: ${inspectDoc.status}\nApprover: ${inspectDoc.designatedApprover || 'SK Chairperson'}\n\nDescription: ${inspectDoc.description || 'N/A'}`], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `${(inspectDoc.resolutionNumber || inspectDoc.id).replace(/\s+/g, '_')}_Record.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  setInspectDoc(null);
                }}
                className="px-4 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== UPLOAD OFFICIAL DOCUMENT MODAL (SK CHAIRPERSON) ==================== */}
      {showUploadDocModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 text-left">
            <div className="bg-[#091d64] text-white p-5 border-b-4 border-[#fbbf24] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base">Upload Official Governance Document</h3>
                  <p className="text-[11px] text-blue-200 font-medium">SK Executive Order, Policy Resolution, or Statutory Vault Record</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadDocModal(false)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDocForm.title.trim()) {
                  alert('Please enter a document title.');
                  return;
                }
                const createdDoc: DocumentRecord = {
                  id: `DOC-2026-00${localDocs.length + 1}`,
                  title: newDocForm.title,
                  category: newDocForm.category,
                  uploadedBy: `Hon. SK Chairperson (${currentBarangay?.name || 'San Francisco'})`,
                  uploadedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  fileSize: newDocForm.fileSize || '1.8 MB',
                  status: 'Approved',
                  resolutionNumber: newDocForm.resolutionNumber || `EO-2026-00${localDocs.length + 1}`,
                  description: newDocForm.description,
                  designatedApprover: 'Hon. SK Chairperson'
                };
                setLocalDocs([createdDoc, ...localDocs]);
                setShowUploadDocModal(false);
                setNewDocForm({
                  title: '',
                  category: 'Resolutions',
                  resolutionNumber: '',
                  description: '',
                  fileSize: '1.4 MB',
                  designatedApprover: 'Hon. SK Chairperson'
                });
                alert(`Successfully uploaded "${createdDoc.title}" to the Official Governance Vault.`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Order No. 04 - SK Youth Emergency Council"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20 focus:border-[#091d64]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Category</label>
                  <select
                    value={newDocForm.category}
                    onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value as DocumentRecord['category'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#091d64]/20"
                  >
                    <option value="Resolutions">Resolutions & Ordinances</option>
                    <option value="Budget">Budget & Ledgers</option>
                    <option value="Minutes">Minutes of Meetings</option>
                    <option value="Liquidation">Liquidation Reports</option>
                    <option value="Accomplishment">Accomplishment Reports</option>
                    <option value="Vouchers">Disbursement Vouchers</option>
                    <option value="Reports">Statutory Reports</option>
                    <option value="Communications">Communications</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resolution / Tracking Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RES-2026-005"
                    value={newDocForm.resolutionNumber}
                    onChange={(e) => setNewDocForm({ ...newDocForm, resolutionNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Executive Summary / Scope</label>
                <textarea
                  rows={3}
                  placeholder="Enter official document notes, rationale, or legislative background..."
                  value={newDocForm.description}
                  onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20"
                />
              </div>

              {/* SIMULATED ATTACHMENT UPLOAD ZONE */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-1">
                <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                <span className="text-xs font-bold text-slate-700 block">Click or Drag PDF/DOCX File to Attach</span>
                <span className="text-[10px] text-slate-400 block">Max file size: 25 MB (Digital Verification Enabled)</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  Upload & Archive to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DIGITAL SIGN-OFF & APPROVAL WORKFLOW MODAL ==================== */}
      {showApproveDocModal && selectedDocForApprove && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 text-left">
            <div className="bg-[#091d64] text-white p-5 border-b-4 border-amber-400 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base">Executive Digital Sign-Off Workflow</h3>
                  <p className="text-[11px] text-blue-200 font-medium">SK Chairperson Official Approval & Seal</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApproveDocModal(false)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Document Pending Review</span>
                <h4 className="font-extrabold text-sm text-[#091d64]">{selectedDocForApprove.title}</h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>Code: <strong>{selectedDocForApprove.resolutionNumber || selectedDocForApprove.id}</strong></span>
                  <span>•</span>
                  <span>Author: <strong>{selectedDocForApprove.uploadedBy}</strong></span>
                  <span>•</span>
                  <span>Category: <strong>{selectedDocForApprove.category}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Executive Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApprovalDecision('Approved')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      approvalDecision === 'Approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Approve & Sign-Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalDecision('Rejected')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      approvalDecision === 'Rejected'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Reject / Return for Revision
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chairperson Official Sign-Off Notes</label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add approval remarks or feedback instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20"
                />
              </div>

              {/* DIGITAL SIGNATURE SEAL PREVIEW */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-700 flex-shrink-0" />
                <div className="text-[11px] text-amber-950 font-medium">
                  <strong>Digital Signature Verification Enabled</strong>
                  <p className="text-[10px] text-amber-800 mt-0.5">
                    Submitting this form attaches the Hon. SK Chairperson executive seal timestamp to Document #{selectedDocForApprove.resolutionNumber || selectedDocForApprove.id}.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApproveDocModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = localDocs.map(d => {
                      if (d.id === selectedDocForApprove.id) {
                        return {
                          ...d,
                          status: (approvalDecision === 'Approved' ? 'Approved' : 'Rejected') as DocumentRecord['status'],
                          description: `${d.description || ''} [Chairperson Note: ${approvalNotes}]`,
                          designatedApprover: `Hon. SK Chairperson (${new Date().toLocaleDateString()})`
                        };
                      }
                      return d;
                    });
                    setLocalDocs(updated);
                    setShowApproveDocModal(false);
                    setSelectedDocForApprove(null);
                    alert(`Document "${selectedDocForApprove.title}" has been marked as ${approvalDecision}.`);
                  }}
                  className={`px-5 py-2 font-extrabold rounded-xl text-xs flex items-center gap-1.5 text-white shadow-xs transition-all cursor-pointer ${
                    approvalDecision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  Confirm & Digital Sign-Off
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
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'dashboard' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeMenu === 'dashboard' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Home</span>
        </button>

        <button
          onClick={() => setActiveMenu('youth')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeMenu === 'youth' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Users className={`w-5 h-5 ${activeMenu === 'youth' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Youth</span>
          {pendingRegistrations.length > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveMenu('programs')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'programs' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <ClipboardList className={`w-5 h-5 ${activeMenu === 'programs' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Programs</span>
        </button>

        <button
          onClick={() => setActiveMenu('budget')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'budget' ? 'text-[#091d64] font-extrabold bg-blue-50/80' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Coins className={`w-5 h-5 ${activeMenu === 'budget' ? 'text-[#091d64] scale-110' : 'text-slate-400'} transition-transform`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">Budget</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 font-medium hover:text-slate-600 cursor-pointer"
        >
          <Menu className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans">More</span>
        </button>
      </div>

    </div>
  );
}

function RefreshCwIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}
