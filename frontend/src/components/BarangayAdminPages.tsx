import React, { useEffect, useState } from 'react';
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
import { AnnouncementRecord, BarangayTenant, Program, YouthProfile, DocumentRecord, SystemAuditLog } from '../types';
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
import { DEFAULT_BARANGAY_LOGOS } from '../data';
import kabisigApi from '../lib/api';

export interface BarangayAdminPagesProps {
  currentBarangay: BarangayTenant;
  currentUser?: any;
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
  onApproveDocument: (id: string, notes: string) => Promise<DocumentRecord>;
  onRejectDocument: (id: string, notes: string) => Promise<DocumentRecord>;
  onAddDocument: (document: DocumentRecord) => void;
  onCreateProgram: (newProg: Program) => void;
  onUpdateProgram: (program: Program) => Promise<boolean>;
  onDeleteProgram: (programId: string) => Promise<boolean>;
  onAnnouncementsChanged?: (announcements: AnnouncementRecord[]) => void;
  onLogout: () => void;
}

export default function BarangayAdminPages({
  currentBarangay,
  currentUser,
  programs = [],
  youthProfiles = [],
  documents = [],
  auditLogs = [],
  registrations = [],
  feedback = [],
  expenses = [],
  resolutions = [],
  onApproveYouth,
  onRejectYouth,
  onApproveDocument,
  onRejectDocument,
  onAddDocument,
  onCreateProgram,
  onUpdateProgram,
  onDeleteProgram,
  onAnnouncementsChanged,
  onLogout
}: BarangayAdminPagesProps) {
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'youth' | 'programs' | 'budget' | 'documents' | 'reports' | 'announcements' | 'audit' | 'calendar' | 'facebook_sync' | 'settings' | 'profile'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');
  const barangayLogo = currentBarangay?.logo || DEFAULT_BARANGAY_LOGOS[currentBarangay?.name || ''] || '';

  const generatePDFReport = (reportTitle: string = 'COA Annual Audit & AIP Financial Performance Report') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to export the PDF report.');
      return;
    }
    const reportProgramRows = programs.length > 0
      ? programs.map(program => {
          const allocated = Number(program.budgetAllocation) || 0;
          const spent = expenses.filter(expense => expense.programId === program.id)
            .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) || Number(program.spentBudget) || 0;
          const rate = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0.0';
          return `<tr><td><strong>${program.title}</strong><br><span style="color:#64748b">${program.category}</span></td><td>${program.aipReference || 'Not provided'}</td><td class="text-right">₱${allocated.toLocaleString()}</td><td class="text-right">₱${spent.toLocaleString()}</td><td class="text-right">${rate}%</td><td class="text-center"><span class="badge">${program.status}</span></td></tr>`;
        }).join('')
      : '<tr><td colspan="6" class="text-center">No program records available.</td></tr>';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - Barangay ${currentBarangay?.name || 'Barangay'}</title>
        <style>
          body { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #ffffff; }
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
          <h2>Barangay ${currentBarangay?.name || 'Barangay'} &bull; Sangguniang Kabataan Council</h2>
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
            ${reportProgramRows}
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
              <td colspan="4" class="text-center">No compliance transmittal records available.</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Certified Correct & Attested:</p>
          <div class="sign">
            HON. CHAIRPERSON &bull; SK EXECUTIVE BOARD<br>
            <span style="font-weight: normal; color: #64748b;">Barangay ${currentBarangay?.name || 'Barangay'}, City of Naga</span>
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

  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Document repository & digital approval states
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docStatusFilter, setDocStatusFilter] = useState('All');
  const [inspectDoc, setInspectDoc] = useState<DocumentRecord | null>(null);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState('');
  const [showApproveDocModal, setShowApproveDocModal] = useState(false);
  const [selectedDocForApprove, setSelectedDocForApprove] = useState<DocumentRecord | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isReviewingDocument, setIsReviewingDocument] = useState(false);
  const [documentReviewError, setDocumentReviewError] = useState('');
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

  const [auditLogRoleFilter, setAuditLogRoleFilter] = useState<'All' | 'Treasurer' | 'Secretary'>('All');

  // Reports states
  const [reportCategoryFilter, setReportCategoryFilter] = useState<'All' | 'Demographic' | 'Accomplishment' | 'Attendance' | 'Beneficiary' | 'Financial' | 'Feedback'>('All');
  const [reportSearchQuery, setReportSearchQuery] = useState('');

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
        <title>${title} - Barangay ${currentBarangay?.name || 'Barangay'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
          body { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #ffffff; }
          .header { text-align: center; border-bottom: 3px solid #091d64; padding-bottom: 20px; margin-bottom: 25px; }
          .header .republic { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
          .header .city { font-size: 13px; font-weight: 700; color: #1e293b; margin: 2px 0; }
          .header h2 { font-size: 22px; font-weight: 800; color: #091d64; margin: 6px 0 4px 0; letter-spacing: -0.5px; }
          .header .meta { font-size: 11px; color: #475569; font-weight: 600; margin: 0; }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
          .stat-label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; }
          .stat-value { font-size: 18px; font-weight: 800; color: #091d64; margin-top: 2px; }
          .section-title { font-size: 12px; font-weight: 800; color: #091d64; background: #eff6ff; padding: 8px 12px; border-left: 4px solid #091d64; margin: 20px 0 12px 0; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
          th { background: #091d64; color: #ffffff; font-weight: 700; text-align: left; padding: 9px 10px; border: 1px solid #091d64; text-transform: uppercase; font-size: 10px; }
          td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
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
          <p class="city">SANGGUNIANG KABATAAN EXECUTIVE COUNCIL &bull; BARANGAY ${currentBarangay?.name?.toUpperCase() || 'BARANGAY'}</p>
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

  const [inspectProfile, setInspectProfile] = useState<YouthProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectField, setShowRejectField] = useState(false);

  const [showCreateProgDrawer, setShowCreateProgDrawer] = useState(false);
  const [progListFilter, setProgListFilter] = useState<'List' | 'Calendar'>('List');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [newProgForm, setNewProgForm] = useState({
    title: '',
    description: '',
    category: 'Sports Development' as Program['category'],
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 0,
    budgetAllocation: null as number | null,
    aipReference: '',
    status: 'Upcoming' as 'Draft' | 'Published' | 'Upcoming' | 'Ongoing' | 'Completed'
  });

  const [budgetYear, setBudgetYear] = useState('2026');
  const [budgetProgramFilter, setBudgetProgramFilter] = useState('All Programs');

  const [localDocs, setLocalDocs] = useState<DocumentRecord[]>(documents);

  const handleReviewDocument = async () => {
    if (!selectedDocForApprove) return;
    if (approvalDecision === 'Rejected' && approvalNotes.trim().length < 5) {
      setDocumentReviewError('Enter at least five characters explaining the rejection.');
      return;
    }

    setIsReviewingDocument(true);
    setDocumentReviewError('');
    try {
      const reviewed = approvalDecision === 'Approved'
        ? await onApproveDocument(selectedDocForApprove.id, approvalNotes.trim())
        : await onRejectDocument(selectedDocForApprove.id, approvalNotes.trim());
      setLocalDocs(previous => previous.map(doc => doc.id === reviewed.id ? reviewed : doc));
      setShowApproveDocModal(false);
      setSelectedDocForApprove(null);
      setApprovalNotes('');
    } catch (error: any) {
      setDocumentReviewError(error.message || 'Document review could not be saved.');
    } finally {
      setIsReviewingDocument(false);
    }
  };

  const fallbackBarangay: BarangayTenant = {
    id: '',
    name: '',
    chairperson: '',
    youthPopulation: 0,
    activePrograms: 0,
    totalBudget: 0,
    allocatedBudget: 0,
    spentBudget: 0,
    contact: '',
    status: 'Active',
    district: '',
  };

  const isMatchBarangay = (profile: YouthProfile) =>
    profile.barangayId === currentBarangay?.id ||
    profile.barangayId === currentBarangay?.name ||
    (Boolean(profile.address && currentBarangay?.name && profile.address.toLowerCase().includes(currentBarangay.name.toLowerCase())));

  const pendingRegistrations = youthProfiles.filter(profile => profile.status === 'Pending' && isMatchBarangay(profile));
  const filteredProfiles = youthProfiles.filter(profile => {
    const matchesBarangay = isMatchBarangay(profile);
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : profile.status === filterStatus;
    return matchesBarangay && matchesSearch && matchesStatus;
  });

  const localProfiles = youthProfiles.filter(p => isMatchBarangay(p));
  const programAllocatedBudget = programs.reduce((sum, program) => sum + (Number(program.budgetAllocation) || 0), 0);
  const intelligentBudget = getBudgetAnalytics(programAllocatedBudget, programs, expenses);
  const budgetAlerts = monitorBudgets(currentBarangay || fallbackBarangay, programs, expenses);
  const budgetAlertSignature = budgetAlerts
    .map(alert => `${alert.code}:${alert.level}:${alert.message}`)
    .join('|');
  const complianceIssues = getComplianceIssues(localProfiles, programs, documents, expenses);
  const lowEngagementItems = detectLowEngagement(localProfiles, registrations);
  const complianceIssueSignature = complianceIssues
    .map(issue => `${issue.code}:${issue.level}:${issue.message}`)
    .join('|');

  useEffect(() => {
    if (!currentBarangay?.id || !currentUser?.id || !kabisigApi.getToken() || complianceIssues.length === 0) return;

    const persistIssues = async () => {
      const results = await Promise.all(
        complianceIssues.map(issue => kabisigApi.persistComplianceIssue({
          report_type: issue.code,
          fiscal_year: new Date().getFullYear(),
          status: 'pending',
          notes: `${issue.message} Recommended action: ${issue.action}`,
        }))
      );

      const failed = results.find(result => !result.success);
      if (failed) {
        const message = failed.message || 'Failed to persist one or more compliance issues.';
        if (message.includes("Could not find the table 'public.compliance_monitoring'")) {
          console.warn('Compliance persistence is unavailable until migration 002 is applied in Supabase.');
        } else {
          console.error(message);
        }
      }
    };

    void persistIssues();
  }, [complianceIssueSignature, currentBarangay?.id, currentUser?.id]);

  useEffect(() => {
    if (!currentBarangay?.id || !currentUser?.id || !kabisigApi.getToken() || budgetAlerts.length === 0) return;

    const persistAlerts = async () => {
      const results = await Promise.all(
        budgetAlerts.map(alert => kabisigApi.persistBudgetAlert({
          alert_code: alert.code,
          level: alert.level,
          message: alert.message,
          link: `/budget?alert=${encodeURIComponent(alert.code)}`,
        }))
      );

      const failed = results.find(result => !result.success);
      if (failed) {
        const message = failed.message || 'Failed to persist one or more budget alerts.';
        if (message.includes("Could not find the table 'public.notifications'")) {
          console.warn('Budget-alert persistence is unavailable until migration 002 is applied in Supabase.');
        } else {
          console.error(message);
        }
      }
    };

    void persistAlerts();
  }, [budgetAlertSignature, currentBarangay?.id, currentUser?.id]);

  const [fbAutoSyncEnabled, setFbAutoSyncEnabled] = useState(true);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [announcementError, setAnnouncementError] = useState('');
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Advisory');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState('All Zones');
  const [annPostToFb, setAnnPostToFb] = useState(true);

  const mapAnnouncement = (announcement: any): AnnouncementRecord => ({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    author: announcement.author?.full_name || currentUser?.full_name || 'SK Official',
    barangay: currentBarangay?.name || 'Barangay',
    datePosted: (announcement.published_at || announcement.created_at || new Date().toISOString()).split('T')[0],
    category: announcement.category === 'Advisory' ? 'Notice' : announcement.category,
    attachments: [],
  });

  const refreshAnnouncements = async () => {
    if (!currentBarangay?.id || !kabisigApi.getToken()) return;
    setIsLoadingAnnouncements(true);
    setAnnouncementError('');
    try {
      const rows = await kabisigApi.getAnnouncements(currentBarangay.id);
      const mapped = rows.map(mapAnnouncement);
      setAnnouncementsList(mapped);
      onAnnouncementsChanged?.(mapped);
    } catch (error: any) {
      const message = error?.message || 'Announcements could not be loaded.';
      setAnnouncementError(message.includes('not configured') || message.includes('schema cache')
        ? 'Announcements are unavailable because the Supabase announcement table is not configured. Apply migration 003_add_announcements.sql.'
        : message);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    void refreshAnnouncements();
  }, [currentBarangay?.id]);

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setAnnouncementError('');
    const apiCategory: AnnouncementRecord['category'] = annCategory === 'Advisory' ? 'Notice' : annCategory as AnnouncementRecord['category'];
    const result = await kabisigApi.createAnnouncement({
      title: annTitle.trim(),
      content: `${annContent.trim()}${annTarget !== 'All Zones' ? `\nTarget: ${annTarget}` : ''}`,
      category: apiCategory,
      status: 'published',
    });
    if (!result.success || !result.data) {
      const message = result.message || 'Announcement could not be saved.';
      setAnnouncementError(message.includes('not configured') || message.includes('schema cache')
        ? 'Announcement publishing is unavailable because the Supabase announcement table is not configured. Apply migration 003_add_announcements.sql.'
        : message);
      return;
    }
    setAnnTitle('');
    setAnnContent('');
    await refreshAnnouncements();
  };

  const maleCount = localProfiles.filter(p => p.sex === 'Male').length;
  const femaleCount = localProfiles.filter(p => p.sex === 'Female').length;
  const otherCount = localProfiles.filter(p => p.sex !== 'Male' && p.sex !== 'Female').length;
  const demographicsDonutData = [
    { name: 'Male', value: maleCount, color: '#1e3a8a' },
    { name: 'Female', value: femaleCount, color: '#dc2626' },
    { name: 'Other', value: otherCount, color: '#f59e0b' }
  ];

  const programParticipationData = programs.length > 0 ? programs.map(p => ({
    name: p.title.length > 22 ? p.title.slice(0, 20) + '...' : p.title,
    count: p.registeredCount || registrations.filter(r => r.programId === p.id).length || 0
  })) : [
    { name: 'No Active Programs', count: 0 }
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalBgyBudget = programs.reduce((sum, program) => sum + (Number(program.budgetAllocation) || 0), 0);
  const budgetPrograms = programs.filter(program => budgetProgramFilter === 'All Programs' || program.id === budgetProgramFilter);
  const budgetVsActualMonthlyData = months.map((month, idx) => {
    const monthExpenses = expenses.filter(e => {
      const d = e.date || e.created_at || e.expense_date ? new Date(e.date || e.created_at || e.expense_date) : null;
      return d && d.getFullYear() === Number(budgetYear) && d.getMonth() === idx
        && (budgetProgramFilter === 'All Programs' || e.programId === budgetProgramFilter);
    }).reduce((sum, e) => sum + (Number(e.amount) || Number(e.gross_amount) || 0), 0);
    return {
      month,
      budget: budgetPrograms.reduce((sum, program) => {
        const start = new Date(program.startDate);
        const end = new Date(program.endDate || program.startDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start.getFullYear() !== Number(budgetYear)) return sum;
        const monthCount = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1);
        return idx >= start.getMonth() && idx <= end.getMonth()
          ? sum + (Number(program.budgetAllocation) || 0) / monthCount
          : sum;
      }, 0),
      spent: monthExpenses
    };
  });

  const progColors = ['#091d64', '#2563eb', '#60a5fa', '#93c5fd', '#94a3b8', '#cbd5e1'];
  const totalAllocBudget = programAllocatedBudget;
  const budgetAllocationByProgramData = budgetPrograms.length > 0 ? budgetPrograms.map((p, idx) => {
    const alloc = p.budgetAllocation || 0;
    const pct = totalAllocBudget > 0 ? ((alloc / totalAllocBudget) * 100).toFixed(1) : '0';
    return {
      name: p.title,
      value: alloc,
      color: progColors[idx % progColors.length],
      percentage: `${pct}%`
    };
  }) : [
    { name: 'Unallocated', value: totalBgyBudget, color: '#091d64', percentage: '100%' }
  ];

  const budgetUtilizationTable = budgetPrograms.map(p => {
    const spent = expenses.filter(e => e.programId === p.id).reduce((sum, e) => sum + (Number(e.amount) || Number(e.gross_amount) || 0), 0) || p.spentBudget || 0;
    const remaining = Math.max(0, (p.budgetAllocation || 0) - spent);
    const rate = p.budgetAllocation > 0 ? Number(((spent / p.budgetAllocation) * 100).toFixed(1)) : 0;
    return {
      program: p.title,
      allocated: p.budgetAllocation || 0,
      spent,
      remaining,
      rate
    };
  });

  const handleCreateProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgForm.title) {
      alert('Please enter a Program Title.');
      return;
    }

    const createdProg: Program = {
      id: editingProgram?.id || `prog-${Date.now().toString().slice(-3)}`,
      title: newProgForm.title,
      description: newProgForm.description,
      startDate: newProgForm.startDate,
      endDate: newProgForm.endDate,
      location: newProgForm.location,
      maxParticipants: newProgForm.maxParticipants,
      budgetAllocation: newProgForm.budgetAllocation ?? 0,
      spentBudget: 0,
      aipReference: newProgForm.aipReference.trim(),
      category: newProgForm.category,
      status: newProgForm.status,
      registeredCount: 0
    };

    if (editingProgram) {
      void onUpdateProgram(createdProg).then(success => {
        if (success) {
          setEditingProgram(null);
          setShowCreateProgDrawer(false);
        }
      });
    } else {
      onCreateProgram(createdProg);
    }
    
    setNewProgForm({
      title: '',
      description: '',
      category: 'Sports Development',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: 0,
      budgetAllocation: null,
      aipReference: '',
      status: 'Upcoming'
    });
  };

  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const calendarDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarOffset = calendarStart.getDay();
  const calendarCells = Array.from({ length: Math.ceil((calendarOffset + calendarDays) / 7) * 7 }, (_, index) => {
    const day = index - calendarOffset + 1;
    return day > 0 && day <= calendarDays ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) : null;
  });
  const programsForDay = (day: Date) => programs.filter(program => {
    const start = new Date(program.startDate);
    const end = new Date(program.endDate || program.startDate);
    const current = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    return current >= new Date(start.getFullYear(), start.getMonth(), start.getDate())
      && current <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
  });
  const openProgramEditor = (program?: Program) => {
    if (!program) {
      setEditingProgram(null);
      setNewProgForm(previous => ({ ...previous, title: '', description: '', startDate: '', endDate: '', location: '', maxParticipants: 0, budgetAllocation: null }));
    } else {
      setEditingProgram(program);
      setNewProgForm({
        title: program.title,
        description: program.description,
        category: program.category,
        startDate: program.startDate,
        endDate: program.endDate,
        location: program.location,
        maxParticipants: program.maxParticipants,
        budgetAllocation: Number(program.budgetAllocation) || 0,
        aipReference: program.aipReference || '',
        status: program.status,
      });
    }
    setShowCreateProgDrawer(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-[#091d64] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <KabisigLogo className="scale-75" />
          {barangayLogo && (
            <img 
              src={barangayLogo} 
              alt={`Brgy. ${currentBarangay?.name} Seal`} 
              className="w-7 h-7 object-contain rounded-full bg-white p-0.5 border border-white/30 shrink-0 shadow-2xs" 
            />
          )}
          <span className="text-[10px] font-bold bg-[#1e3a8a] px-2 py-0.5 rounded text-sky-200">Brgy. {currentBarangay?.name}</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div className="space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <KabisigLogo className="scale-90" />
                {barangayLogo && (
                  <img 
                    src={barangayLogo} 
                    alt={`Brgy. ${currentBarangay?.name} Seal`} 
                    className="w-8 h-8 object-contain rounded-full bg-white p-0.5 border border-white/30 shrink-0" 
                  />
                )}
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2">
                Executive SK Console — Brgy. {currentBarangay?.name}
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

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col justify-between h-full flex-shrink-0 z-40 shadow-sm">
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-5 border-b border-slate-100 flex flex-col items-center gap-3 bg-gradient-to-b from-blue-50/40 to-transparent">
            <KabisigLogo className="scale-90" />
            {barangayLogo && (
              <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200/70 shadow-2xs w-full">
                <img 
                  src={barangayLogo} 
                  alt={`Barangay ${currentBarangay?.name} Official Seal`} 
                  className="w-9 h-9 object-contain shrink-0" 
                />
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Official Seal</span>
                  <p className="text-[11px] font-extrabold text-[#091d64] truncate leading-tight">Brgy. {currentBarangay?.name}</p>
                </div>
              </div>
            )}
          </div>

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

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* DESKTOP HEADER */}
        <header className="hidden lg:flex bg-white border-b border-slate-100 h-20 items-center justify-between px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            {barangayLogo && (
              <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/80 p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                <img 
                  src={barangayLogo} 
                  alt={`Barangay ${currentBarangay?.name} Seal`} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="font-sans font-extrabold text-[#091d64] text-2xl tracking-tight leading-none">
                  {activeMenu === 'dashboard' && `Barangay ${currentBarangay?.name || 'Barangay'} Dashboard`}
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
              <span className="text-[11px] text-slate-400 font-sans tracking-wide font-semibold mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Sangguniang Kabataan • Barangay {currentBarangay?.name || 'Barangay'}, Naga City
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
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
              userName={currentUser?.full_name || (currentBarangay?.chairperson && currentBarangay.chairperson !== 'Unassigned' ? currentBarangay.chairperson : 'SK Chairperson')}
              role="SK Chairperson"
              onLogout={onLogout}
            />
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-grow p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-8 overflow-y-auto bg-[#f8fafc]">
          
          {/* 1. DASHBOARD VIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              
              {/* METRICS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                
                {/* CARD 1: BARANGAY IDENTITY */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-200/80 p-1.5 flex-shrink-0 shadow-2xs overflow-hidden">
                    {barangayLogo ? (
                      <img 
                        src={barangayLogo} 
                        alt={`Barangay ${currentBarangay?.name} Official Seal`} 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#091d64]" />
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      Official Seal
                    </span>
                    <h3 className="font-extrabold text-sm text-[#091d64] leading-tight mt-1">Barangay {currentBarangay?.name || 'Barangay'}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Naga City, Camarines Sur</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">SK Council {new Date().getFullYear()}</p>
                  </div>
                </div>

                {/* CARD 2 */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Youth Population</span>
                    <div className="p-2.5 bg-blue-50 text-[#091d64] rounded-lg">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">{currentBarangay?.youthPopulation || localProfiles.length || 0}</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Ages 15-30</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('youth')}
                    className="text-[11px] text-[#091d64] font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    View Details &rarr;
                  </button>
                </div>

                {/* CARD 3 */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Programs</span>
                    <div className="p-2.5 bg-blue-50 text-[#091d64] rounded-lg">
                      <ClipboardList className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">{programs.length}</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Ongoing Initiatives</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('programs')}
                    className="text-[11px] text-[#091d64] font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    View Programs &rarr;
                  </button>
                </div>

                {/* CARD 4 */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Budget</span>
                    <div className="p-2.5 bg-blue-50 text-[#091d64] rounded-lg">
                      <Coins className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">₱ {(currentBarangay?.totalBudget || 0).toLocaleString()}</h4>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">FY {new Date().getFullYear()} Budget</span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('budget')}
                    className="text-[11px] text-[#091d64] font-bold hover:underline flex items-center gap-1 mt-3"
                  >
                    View Budget &rarr;
                  </button>
                </div>

                {/* CARD 5 */}
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</span>
                    <div className="p-2.5 bg-red-50 text-red-500 rounded-lg">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-2xl font-extrabold text-slate-800 leading-none">{pendingRegistrations.length}</h4>
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

              {/* QUICK ACTIONS */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quick Actions</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => { setActiveMenu('programs'); }}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-100 text-left flex items-center gap-4 transition-all cursor-pointer"
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
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-100 text-left flex items-center gap-4 transition-all cursor-pointer"
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
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-100 text-left flex items-center gap-4 transition-all cursor-pointer"
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

              {/* COMPLIANCE & BUDGET ALERTS */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-[#091d64] uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Smart Compliance Tracker
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
                              className="text-[9px] text-blue-700 font-extrabold hover:underline cursor-pointer"
                            >
                              Resolve &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {complianceIssues.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 font-bold">
                        Zero compliance issues detected. Sangguniang Kabataan fully compliant.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-[#091d64] uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[#091d64]" />
                      Smart Budget Auditor & Alerts
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
                          <span className="text-[8px] text-slate-400 font-mono font-bold block mt-1">Trigger Code: {alert.code}</span>
                        </div>
                      </div>
                    ))}
                    {budgetAlerts.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 font-bold">
                        Budget spend checks successfully completed. No irregularities.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. YOUTH MANAGEMENT */}
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
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none cursor-pointer"
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
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-lg flex items-center gap-1 mx-auto transition-colors cursor-pointer"
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

          {/* 3. MANAGE PROGRAMS */}
          {activeMenu === 'programs' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#091d64]">Manage Programs</h3>
                  <p className="text-xs text-slate-400 mt-1">View, manage, and track all programs and initiatives.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-100">
                    <button 
                      onClick={() => setProgListFilter('List')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        progListFilter === 'List' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      List View
                    </button>
                    <button 
                      onClick={() => setProgListFilter('Calendar')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        progListFilter === 'Calendar' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Calendar View
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => openProgramEditor()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Program
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  {progListFilter === 'Calendar' ? (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-extrabold text-[#091d64]">AIP Localized Program Timeline</h4>
                          <p className="text-[11px] text-slate-400">Click a program to edit it. Changes are saved to the shared program record.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="px-2 py-1 border rounded text-xs font-bold">‹</button>
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                            {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                          </span>
                          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="px-2 py-1 border rounded text-xs font-bold">›</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 border-l border-t border-slate-200">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                          <div key={day} className="bg-[#091d64] text-white text-center text-[10px] font-black py-2 border-r border-b border-[#091d64]">{day}</div>
                        ))}
                        {calendarCells.map((day, index) => (
                          <div key={`${day?.toISOString() || 'empty'}-${index}`} className={`min-h-[112px] border-r border-b border-slate-200 p-1.5 ${day ? 'bg-white' : 'bg-slate-50'}`}>
                            {day && <span className="text-[10px] font-bold text-slate-500">{day.getDate()}</span>}
                            <div className="space-y-1 mt-1">
                              {day && programsForDay(day).map(program => (
                                <button
                                  type="button"
                                  key={program.id}
                                  onClick={() => openProgramEditor(program)}
                                  className="w-full text-left rounded px-1.5 py-1 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 truncate"
                                  title={`${program.title} · ${program.category}`}
                                >
                                  {program.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : programs.map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                      <div className="flex gap-4 items-start">
                        <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="w-8 h-8 text-[#091d64]" />
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
                          <span className="text-xs font-extrabold text-slate-800 block mt-0.5">₱ {(p.budgetAllocation || 0).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold">Registrations</span>
                          <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{p.registeredCount || 0} / {p.maxParticipants || 100}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openProgramEditor(p)} className="px-2 py-1 border rounded text-[10px] font-bold">Edit</button>
                          <button type="button" onClick={() => { if (window.confirm(`Delete "${p.title}"?`)) void onDeleteProgram(p.id); }} className="px-2 py-1 border border-red-200 text-red-600 rounded text-[10px] font-bold">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {programs.length === 0 && (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-100 text-slate-400 font-bold text-xs">
                      No programs created yet. Click "Create New Program" to publish one.
                    </div>
                  )}
                </div>

                {showCreateProgDrawer && (
                  <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs h-fit sticky top-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{editingProgram ? 'Edit Program' : 'Create New Program'}</h4>
                      <button 
                        onClick={() => setShowCreateProgDrawer(false)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
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
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Program Category</label>
                          <select
                            value={newProgForm.category}
                            onChange={(e) => setNewProgForm({ ...newProgForm, category: e.target.value as Program['category'] })}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none font-bold"
                          >
                            <option>Health & Nutrition</option>
                            <option>Education & Scholarship</option>
                            <option>Sports Development</option>
                            <option>Livelihood & Skills</option>
                            <option>Peace & Security</option>
                            <option>Environmental Protection</option>
                          </select>
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
                            value={newProgForm.budgetAllocation ?? ''}
                            onChange={(e) => setNewProgForm({
                              ...newProgForm,
                              budgetAllocation: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            placeholder="Enter budget amount"
                            className="w-full border border-slate-200 rounded-lg pl-7 pr-3 p-2 text-xs focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Location</label>
                          <input type="text" required value={newProgForm.location} onChange={(e) => setNewProgForm({ ...newProgForm, location: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total slots</label>
                          <input type="number" min="1" required value={newProgForm.maxParticipants || ''} onChange={(e) => setNewProgForm({ ...newProgForm, maxParticipants: Number(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">AIP reference code</label>
                        <input type="text" value={newProgForm.aipReference} onChange={(e) => setNewProgForm({ ...newProgForm, aipReference: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono" />
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <button 
                          type="button"
                          onClick={() => { setShowCreateProgDrawer(false); }}
                          className="flex-1 py-2 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold cursor-pointer"
                        >
                          {editingProgram ? 'Save Changes' : 'Create Program'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. BUDGET MANAGEMENT */}
          {activeMenu === 'budget' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#091d64]">Budget Management</h3>
                  <p className="text-xs text-slate-400 mt-1">Live allocation and expenditure view for Barangay {currentBarangay?.name || 'Barangay'}.</p>
                </div>
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fiscal year
                    <select value={budgetYear} onChange={event => setBudgetYear(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">
                      {[...new Set([new Date().getFullYear(), ...programs.map(program => new Date(program.startDate).getFullYear()).filter(Boolean)])].sort().reverse().map(year => <option key={year}>{year}</option>)}
                    </select>
                  </label>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Program
                    <select value={budgetProgramFilter} onChange={event => setBudgetProgramFilter(event.target.value)} className="mt-1 block min-w-52 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">
                      <option>All Programs</option>
                      {programs.map(program => <option key={program.id} value={program.id}>{program.title}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => { setBudgetYear(String(new Date().getFullYear())); setBudgetProgramFilter('All Programs'); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Reset filters</button>
                </div>
              </div>

              {(() => {
                const filteredAllocated = budgetPrograms.reduce((sum, program) => sum + (Number(program.budgetAllocation) || 0), 0);
                const filteredSpent = budgetPrograms.reduce((sum, program) => sum + (expenses.filter(expense => expense.programId === program.id).reduce((total, expense) => total + (Number(expense.amount) || Number(expense.gross_amount) || 0), 0) || 0), 0);
                const filteredRemaining = Math.max(0, filteredAllocated - filteredSpent);
                const filteredRate = filteredAllocated > 0 ? (filteredSpent / filteredAllocated) * 100 : 0;
                const overspent = budgetUtilizationTable.filter(row => row.spent > row.allocated && row.allocated > 0);
                return (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        ['Total allocated', filteredAllocated, Briefcase, 'text-blue-600 bg-blue-50'],
                        ['Total spent', filteredSpent, Coins, 'text-amber-600 bg-amber-50'],
                        ['Remaining balance', filteredRemaining, DollarSign, 'text-emerald-600 bg-emerald-50'],
                      ].map(([label, value, Icon, iconClass]) => (
                        <div key={String(label)} className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs">
                          <div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{String(label)}</span><span className={`rounded-lg p-2 ${iconClass}`}><Icon className="h-4 w-4" /></span></div>
                          <p className="mt-3 text-2xl font-extrabold text-slate-800">₱{Number(value).toLocaleString()}</p>
                        </div>
                      ))}
                      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs">
                        <div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Utilization rate</span><span className="rounded-lg bg-violet-50 p-2 text-violet-600"><TrendingUp className="h-4 w-4" /></span></div>
                        <p className="mt-3 text-2xl font-extrabold text-[#091d64]">{filteredRate.toFixed(1)}%</p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">{filteredAllocated ? 'Based on recorded expenses' : 'No allocation recorded'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs xl:col-span-3">
                        <h4 className="text-sm font-extrabold text-slate-800">Monthly budget vs actual</h4>
                        <p className="mb-4 text-[10px] text-slate-400">Actual expenses are grouped by expense date.</p>
                        {budgetPrograms.length || expenses.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={budgetVsActualMonthlyData}><XAxis dataKey="month" fontSize={10} /><YAxis fontSize={10} tickFormatter={value => `₱${Number(value) / 1000}k`} /><Tooltip formatter={(value: any) => `₱${Number(value).toLocaleString()}`} /><Legend /><Bar dataKey="budget" name="Budget" fill="#bfdbfe" radius={[4, 4, 0, 0]} /><Bar dataKey="spent" name="Actual" fill="#091d64" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-64 items-center justify-center text-xs font-semibold text-slate-400">No budget or expense records for this view.</div>}
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs xl:col-span-2">
                        <h4 className="text-sm font-extrabold text-slate-800">Program allocation</h4>
                        <p className="mb-2 text-[10px] text-slate-400">Share of the selected allocation.</p>
                        {budgetAllocationByProgramData.some(item => item.value > 0) ? <><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={budgetAllocationByProgramData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={3}>{budgetAllocationByProgramData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value: any) => `₱${Number(value).toLocaleString()}`} /></PieChart></ResponsiveContainer><div className="space-y-2">{budgetAllocationByProgramData.slice(0, 6).map(item => <div key={item.name} className="flex items-center justify-between text-[10px] font-semibold text-slate-600"><span className="flex min-w-0 items-center gap-2"><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /> <span className="truncate">{item.name}</span></span><span>{item.percentage}</span></div>)}</div></> : <div className="flex h-64 items-center justify-center text-xs font-semibold text-slate-400">No program allocations recorded.</div>}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-2xs">
                      <h4 className="mb-4 text-sm font-extrabold text-slate-800">Utilization by program</h4>
                      {budgetUtilizationTable.length ? <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-3 py-3">Program</th><th className="px-3 py-3 text-right">Allocated</th><th className="px-3 py-3 text-right">Actual</th><th className="px-3 py-3 text-right">Remaining</th><th className="px-3 py-3 text-right">Utilization</th></tr></thead><tbody className="divide-y divide-slate-50">{budgetUtilizationTable.map(row => <tr key={row.program}><td className="px-3 py-3 font-bold text-slate-700">{row.program}</td><td className="px-3 py-3 text-right">₱{row.allocated.toLocaleString()}</td><td className="px-3 py-3 text-right">₱{row.spent.toLocaleString()}</td><td className="px-3 py-3 text-right">₱{row.remaining.toLocaleString()}</td><td className={`px-3 py-3 text-right font-bold ${row.rate > 100 ? 'text-rose-600' : 'text-slate-700'}`}>{row.rate.toFixed(1)}%</td></tr>)}</tbody></table></div> : <div className="py-10 text-center text-xs font-semibold text-slate-400">No programs available for this filter.</div>}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-5"><h4 className="flex items-center gap-2 text-sm font-extrabold text-rose-800"><AlertTriangle className="h-4 w-4" /> Overspending alerts</h4>{overspent.length ? <ul className="mt-3 space-y-2 text-xs font-semibold text-rose-700">{overspent.map(row => <li key={row.program} className="flex justify-between gap-3"><span>{row.program}</span><span>₱{(row.spent - row.allocated).toLocaleString()} over</span></li>)}</ul> : <p className="mt-3 text-xs font-semibold text-slate-500">No overspending detected in the selected programs.</p>}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 5. DOCUMENTS VIEW */}
          {activeMenu === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#091d64] mt-1.5 flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-600" />
                      Barangay Document Repository & Executive Approval Desk
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Collaborative governance archive maintained by SK Secretary, SK Treasurer, and Hon. SK Chairperson.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button 
                      onClick={() => setShowUploadDocModal(true)}
                      className="px-4 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      Upload Official Document
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
                  <table className="w-full text-left text-xs font-semibold text-slate-600">
                    <thead className="bg-[#091d64] text-[10px] text-white font-extrabold uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-3.5">Code / Ref No.</th>
                        <th className="px-5 py-3.5">Document Title</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Author / Officer</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5 text-center">Approval Status</th>
                        <th className="px-5 py-3.5 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                      {localDocs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[#091d64]">
                            {doc.resolutionNumber || doc.id}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900">
                            {doc.title}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                              {doc.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800">
                            {doc.uploadedBy}
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-600">
                            {doc.uploadedDate}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                              doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              doc.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {doc.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDocForApprove(doc);
                                  setApprovalDecision('Approved');
                                  setApprovalNotes('');
                                  setDocumentReviewError('');
                                  setShowApproveDocModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#091d64] text-white text-[10px] font-bold hover:bg-[#122878]"
                              >
                                <FileCheck className="w-3.5 h-3.5" /> Review
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {localDocs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">
                            No documents found in repository.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {showApproveDocModal && selectedDocForApprove && (
                  <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
                      <div className="bg-[#091d64] text-white p-5">
                        <h3 className="font-bold text-base">Review Document</h3>
                        <p className="mt-1 text-xs text-blue-100">{selectedDocForApprove.title}</p>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Review decision">
                          <button
                            type="button"
                            onClick={() => setApprovalDecision('Approved')}
                            className={`rounded-lg border px-3 py-2 text-xs font-bold ${approvalDecision === 'Approved' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200'}`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setApprovalDecision('Rejected')}
                            className={`rounded-lg border px-3 py-2 text-xs font-bold ${approvalDecision === 'Rejected' ? 'bg-rose-700 text-white border-rose-700' : 'bg-white text-slate-600 border-slate-200'}`}
                          >
                            Reject
                          </button>
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] font-bold text-slate-500 uppercase">
                            {approvalDecision === 'Rejected' ? 'Rejection reason (required)' : 'Review notes (optional)'}
                          </label>
                          <textarea
                            value={approvalNotes}
                            onChange={(event) => setApprovalNotes(event.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-xs"
                          />
                        </div>
                        {documentReviewError && <p role="alert" className="text-xs text-rose-700">{documentReviewError}</p>}
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                          <button type="button" disabled={isReviewingDocument} onClick={() => setShowApproveDocModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold disabled:opacity-50">Cancel</button>
                          <button type="button" disabled={isReviewingDocument} onClick={handleReviewDocument} className="rounded-lg bg-[#091d64] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                            {isReviewingDocument ? 'Saving...' : `Confirm ${approvalDecision}`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 6. REPORTS */}
          {activeMenu === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              <div className="bg-[#091d64] p-6 rounded-2xl text-white shadow-md flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black font-sans tracking-tight">Executive Reports & Decision Analytics Center</h3>
                  <p className="text-xs text-blue-100 mt-1 max-w-2xl">
                    Synchronized live governance database across Barangay {currentBarangay?.name || 'Barangay'}.
                  </p>
                </div>
                <button 
                  onClick={() => generatePDFReport('Executive Summary & COA Financial Performance Report')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Export Master PDF Report
                </button>
              </div>
            </div>
          )}

          {/* 7. ANNOUNCEMENTS */}
          {activeMenu === 'announcements' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xs space-y-4">
                <h4 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#091d64]" />
                  Compose Advisory / Announcement
                </h4>
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
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Body Content *</label>
                    <textarea 
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      rows={4} 
                      placeholder="Type announcement details..." 
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#091d64] bg-slate-50 focus:bg-white"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 px-5 bg-[#091d64] hover:bg-opacity-95 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-xs"
                  >
                    Publish Announcement
                  </button>
                  {announcementError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{announcementError}</p>}
                </form>
                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Published portal announcements</h5>
                    <button type="button" onClick={() => void refreshAnnouncements()} className="text-[10px] font-bold text-[#091d64] hover:underline">{isLoadingAnnouncements ? 'Refreshing...' : 'Refresh'}</button>
                  </div>
                  {announcementsList.length ? (
                    <div className="space-y-2">
                      {announcementsList.map((announcement: AnnouncementRecord) => (
                        <article key={announcement.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <h6 className="text-xs font-extrabold text-slate-800">{announcement.title}</h6>
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-700">{announcement.category}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-line text-[11px] font-medium text-slate-600">{announcement.content}</p>
                          <p className="mt-2 text-[10px] text-slate-400">{announcement.datePosted} · {announcement.author}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="py-5 text-center text-xs font-semibold text-slate-400">{isLoadingAnnouncements ? 'Loading announcements...' : 'No persisted announcements found.'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 8. AUDIT LOG */}
          {activeMenu === 'audit' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-lg font-extrabold text-[#091d64]">Barangay Official Activity & Audit Log</h3>
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs font-semibold text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 font-extrabold uppercase border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Official Name & Role</th>
                        <th className="p-3.5">Action Code</th>
                        <th className="p-3.5">Activity Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {log.user} ({log.role})
                          </td>
                          <td className="p-3.5 font-mono text-[10px]">{log.action}</td>
                          <td className="p-3.5 text-slate-600">{log.details}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400 font-bold">
                            No audit logs recorded yet.
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

        <footer className="h-12 border-t border-slate-100 bg-white flex items-center justify-center text-[11px] text-slate-400 font-sans tracking-wide">
          © 2026 SK Federation Naga City. All rights reserved.
        </footer>

      </div>

      {/* INSPECT PROFILE MODAL */}
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
                className="p-1 text-slate-200 hover:text-white cursor-pointer"
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
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Birthdate & calculated age</span>
                  <span className="text-slate-800 block">{inspectProfile.birthdate} ({inspectProfile.age} yrs old)</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Address</span>
                  <span className="text-slate-800 block">{inspectProfile.address} ({inspectProfile.zone})</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Contact & email</span>
                  <span className="text-slate-800 block">{inspectProfile.mobile || 'Not provided'} · {inspectProfile.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Education</span>
                  <span className="text-slate-800 block">{inspectProfile.educationalLevel || 'Not provided'}{inspectProfile.school ? ` · ${inspectProfile.school}` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Employment & scholarship</span>
                  <span className="text-slate-800 block">{inspectProfile.employmentStatus || inspectProfile.employment || 'Not provided'} · {inspectProfile.scholarStatus || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Youth sector</span>
                  <span className="text-slate-800 block">{inspectProfile.youthSector || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Guardian</span>
                  <span className="text-slate-800 block">{inspectProfile.guardianName || 'Not provided'}{inspectProfile.guardianContact ? ` · ${inspectProfile.guardianContact}` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Registration status</span>
                  <span className="text-slate-800 block">{inspectProfile.status} · Registered {inspectProfile.dateRegistered || 'date unavailable'}</span>
                </div>
              </div>

              {showRejectField && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs space-y-2">
                  <label className="block font-bold text-slate-700">Reason for Application Rejection</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowRejectField(false)}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-md font-bold cursor-pointer"
                    >
                      Cancel
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
                      className="px-3 py-1 bg-red-600 text-white rounded-md font-bold cursor-pointer"
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
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Reject Profile
                </button>
              )}
              <div />
              <div className="flex gap-2">
                <button
                  onClick={() => { setInspectProfile(null); setShowRejectField(false); }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Close
                </button>
                {inspectProfile.status === 'Pending' && !showRejectField && (
                  <button
                    onClick={() => {
                      onApproveYouth(inspectProfile.id);
                      setInspectProfile(null);
                    }}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-md flex items-center gap-1 cursor-pointer"
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

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadDocModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 text-left">
            <div className="bg-[#091d64] text-white p-5 border-b-4 border-[#fbbf24] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Upload Official Governance Document</h3>
              </div>
              <button 
                onClick={() => setShowUploadDocModal(false)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newDocForm.title.trim()) return;
                if (!selectedUploadFile) {
                  setDocumentUploadError('Select a document file to upload.');
                  return;
                }
                setIsUploadingDocument(true);
                setDocumentUploadError('');
                try {
                  const documentType = newDocForm.category === 'Resolutions' ? 'Resolution' : newDocForm.category === 'Minutes' ? 'Minutes' : newDocForm.category === 'Reports' || newDocForm.category === 'Budget' ? 'Financial Report' : 'Other';
                  const result = await kabisigApi.uploadDocument({
                    title: newDocForm.title.trim(),
                    document_type: documentType,
                    file: selectedUploadFile,
                  });
                  if (!result.success || !result.data?.id) throw new Error(result.message || 'Document upload failed.');

                  const saved = result.data;
                  const uploaded: DocumentRecord = {
                    id: saved.id,
                    title: saved.title,
                    category: newDocForm.category,
                    uploadedBy: currentUser?.full_name || `Hon. SK Chairperson (${currentBarangay?.name || 'Barangay'})`,
                    uploadedDate: saved.created_at ? new Date(saved.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                    fileSize: `${(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
                    status: 'Pending',
                    resolutionNumber: newDocForm.resolutionNumber || `DOC-${saved.id.slice(0, 8)}`,
                    description: newDocForm.description,
                    designatedApprover: 'Hon. SK Chairperson',
                    barangayId: saved.tenant_id,
                    fileUrl: saved.file_url,
                  };
                  setLocalDocs(previous => [uploaded, ...previous]);
                  onAddDocument(uploaded);
                  setShowUploadDocModal(false);
                  setSelectedUploadFile(null);
                  setNewDocForm({ title: '', category: 'Resolutions', resolutionNumber: '', description: '', fileSize: '1.4 MB', designatedApprover: 'Hon. SK Chairperson' });
                } catch (error: any) {
                  setDocumentUploadError(error.message || 'Document upload failed.');
                } finally {
                  setIsUploadingDocument(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Order No. 04 - SK Youth Council"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#091d64]/20 focus:border-[#091d64]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document File *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    if (file && file.size > 25 * 1024 * 1024) {
                      setDocumentUploadError('File size exceeds maximum limit of 25MB.');
                      setSelectedUploadFile(null);
                      return;
                    }
                    if (file && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(file.type)) {
                      setDocumentUploadError('Only PDF, Word, JPG, and PNG files are allowed.');
                      setSelectedUploadFile(null);
                      return;
                    }
                    setSelectedUploadFile(file);
                    setDocumentUploadError('');
                  }}
                  className="block w-full text-xs"
                />
              </div>
              {documentUploadError && <p role="alert" className="text-xs text-rose-700">{documentUploadError}</p>}
              {documentUploadError && <p role="alert" className="text-xs text-rose-700">{documentUploadError}</p>}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isUploadingDocument}
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDocument}
                  className="px-5 py-2 bg-[#091d64] hover:bg-[#122878] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  {isUploadingDocument ? 'Uploading...' : 'Upload for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}