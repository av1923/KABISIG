'use client';

import { useState, useEffect } from 'react';
import kabisigApi from './lib/api';
import { 
  NAGA_BARANGAYS, 
  DEFAULT_BARANGAY_LOGOS,
  INITIAL_PROGRAMS, 
  INITIAL_YOUTH_PROFILES, 
  INITIAL_REGISTRATIONS, 
  INITIAL_FEEDBACK, 
  INITIAL_RESOLUTIONS, 
  INITIAL_EXPENSES, 
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS
} from './data';
import PublicPages from './components/PublicPages';
import SuperAdminPages from './components/SuperAdminPages';
import BarangayAdminPages from './components/BarangayAdminPages';
import ChairpersonOnboarding from './components/ChairpersonOnboarding';
import OfficialPages from './components/OfficialPages';
import YouthPages from './components/YouthPages';
import ViewerPages from './components/ViewerPages';
import { 
  BarangayTenant, 
  Program, 
  YouthProfile, 
  Registration, 
  FeedbackRecord, 
  ResolutionRecord, 
  ExpenseRecord, 
  DocumentRecord,
  AnnouncementRecord,
  SystemAuditLog,
  UserRole
} from './types';
import { Settings, Info, RefreshCw, Layers, X } from 'lucide-react';

export default function App() {
  // --- STATEFUL MOCK DATABASE (Multi-Tenant Reactivity) ---
  const [tenants, setTenants] = useState<BarangayTenant[]>(NAGA_BARANGAYS);
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [youthProfiles, setYouthProfiles] = useState<YouthProfile[]>(INITIAL_YOUTH_PROFILES);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>(INITIAL_FEEDBACK);
  const [resolutions, setResolutions] = useState<ResolutionRecord[]>(INITIAL_RESOLUTIONS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);

  // --- AUTHENTICATED USER SESSION ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | 'Viewer' | null>(null);
  const [currentTenant, setCurrentTenant] = useState<BarangayTenant | null>(null);
  const [currentYouth, setCurrentYouth] = useState<YouthProfile | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>('');

  // --- PUBLIC PAGES NAVIGATION STATE ---
  const [publicView, setPublicView] = useState<'landing' | 'login' | 'signup'>('login');

  // Load 27 permanently seeded Naga City barangays and restore session from backend API
  useEffect(() => {
    kabisigApi.getBarangays().then((data) => {
      if (data && data.length > 0) {
        setTenants(prev => {
          const updated = prev.map(existing => {
            const backendBarangay = data.find(b => b.id === existing.id);
            if (!backendBarangay) return existing;

            return {
              ...existing,
              ...backendBarangay,
              youthPopulation: backendBarangay.youthPopulation ?? existing.youthPopulation ?? 0,
              activePrograms: backendBarangay.activePrograms ?? existing.activePrograms ?? 0,
              totalBudget: backendBarangay.totalBudget ?? existing.totalBudget ?? 0,
              allocatedBudget: backendBarangay.allocatedBudget ?? existing.allocatedBudget ?? 0,
              spentBudget: backendBarangay.spentBudget ?? existing.spentBudget ?? 0,
              logo: backendBarangay.logo || existing.logo || ''
            };
          });
          return updated.sort((a, b) => a.name.localeCompare(b.name));
        });

        // If user already restored with tenant_id, sync currentTenant with backend data
        const token = kabisigApi.getToken();
        if (token) {
          kabisigApi.getCurrentUser().then(user => {
            if (user?.tenant_id) {
              const matchedBgy = data.find(b => b.id === user.tenant_id);
              if (matchedBgy) {
                setCurrentTenant({
                  ...matchedBgy,
                  logo: matchedBgy.logo || DEFAULT_BARANGAY_LOGOS[matchedBgy.name] || ''
                });
              }
            }
          }).catch(console.warn);
        }
      }
    }).catch(console.warn);

    // Load live programs from database
    kabisigApi.getPrograms().then((progs) => {
      if (progs && progs.length > 0) {
        const formatted: Program[] = progs.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          startDate: p.start_date ? p.start_date.split('T')[0] : '2026-05-20',
          endDate: p.end_date ? p.end_date.split('T')[0] : '2026-05-22',
          location: p.location || 'Barangay Hall',
          maxParticipants: p.total_slots || 100,
          budgetAllocation: p.budgetAllocation || 0,
          spentBudget: 0,
          aipReference: `AIP-2026-${(p.id || 'PROG').slice(0, 4).toUpperCase()}`,
          category: p.category || 'General',
          status: p.status === 'upcoming' ? 'Upcoming' : p.status === 'ongoing' ? 'Ongoing' : p.status === 'completed' ? 'Completed' : 'Upcoming',
          registeredCount: p.program_registrations?.[0]?.count || 0
        }));
        setPrograms(formatted);
      }
    }).catch(console.warn);

    // Load live documents from database
    kabisigApi.getDocuments().then((docs) => {
      if (docs && docs.length > 0) {
        const formatted: DocumentRecord[] = docs.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.document_type || 'Other',
          uploadedBy: d.submitter?.full_name || 'Official',
          uploadedDate: d.created_at ? new Date(d.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          fileSize: '1.2 MB',
          status: d.status === 'approved' ? 'Approved' : d.status === 'pending_approval' ? 'Pending' : d.status,
          resolutionNumber: `DOC-${d.id.slice(0, 6).toUpperCase()}`,
          description: d.description || '',
          designatedApprover: 'Hon. SK Chairperson',
          barangayId: d.tenant_id
        }));
        setDocuments(formatted);
      }
    }).catch(console.warn);

    // Load live expenses from database
    kabisigApi.getExpenses().then((exps) => {
      if (exps && exps.length > 0) {
        const formatted: ExpenseRecord[] = exps.map((e: any) => ({
          id: e.id,
          programId: e.program_id || '',
          programTitle: e.program?.title || e.title,
          category: e.budget?.category || 'Supplies',
          amount: Number(e.gross_amount) || Number(e.amount) || 0,
          description: e.description || '',
          date: e.expense_date || (e.created_at ? e.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          voucherNumber: `DV-${e.id.slice(0, 6).toUpperCase()}`,
          status: e.status === 'approved' ? 'Approved' : 'Pending',
          payee: e.payee || e.title,
          barangayId: e.tenant_id
        }));
        setExpenses(formatted);
      }
    }).catch(console.warn);

    // Load live feedback from database
    kabisigApi.getFeedback().then((feeds) => {
      if (feeds && feeds.length > 0) {
        const formatted: FeedbackRecord[] = feeds.map((f: any) => ({
          id: f.id,
          type: f.category || 'General',
          title: f.subject,
          content: f.message,
          rating: f.sentiment === 'positive' ? 5 : f.sentiment === 'negative' ? 1 : 3,
          anonymous: f.is_anonymous || false,
          status: f.status === 'resolved' ? 'Resolved' : 'Pending',
          dateSubmitted: f.created_at ? f.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          submittedBy: f.users?.full_name || 'Anonymous Youth',
          response: f.admin_response || ''
        }));
        setFeedback(formatted);
      }
    }).catch(console.warn);

    // Restore authenticated session if token exists
    const token = kabisigApi.getToken();
    if (token) {
      kabisigApi.getCurrentUser().then(user => {
        if (user) {
          setCurrentUser(user);
          setCurrentEmail(user.email || '');
          const roleId = user.role_id;
          if (roleId === 1) {
            setCurrentRole('Super Admin');
          } else if (roleId === 2) {
            setCurrentRole('Barangay Admin');
            if (user.tenant_id) {
              const bgy = tenants.find(t => t.id === user.tenant_id) || NAGA_BARANGAYS.find(t => t.id === user.tenant_id);
              if (bgy) {
                setCurrentTenant({
                  ...bgy,
                  logo: bgy.logo || DEFAULT_BARANGAY_LOGOS[bgy.name] || ''
                });
              }
            }
          } else if (roleId === 3) {
            setCurrentRole('SK Kagawad');
            if (user.tenant_id) {
              const bgy = tenants.find(t => t.id === user.tenant_id) || NAGA_BARANGAYS.find(t => t.id === user.tenant_id);
              if (bgy) {
                setCurrentTenant({
                  ...bgy,
                  logo: bgy.logo || DEFAULT_BARANGAY_LOGOS[bgy.name] || ''
                });
              }
            }
          } else if (roleId === 4) {
            setCurrentRole('Youth Constituent');
            if (user.tenant_id) {
              const bgy = tenants.find(t => t.id === user.tenant_id) || NAGA_BARANGAYS.find(t => t.id === user.tenant_id);
              if (bgy) {
                setCurrentTenant({
                  ...bgy,
                  logo: bgy.logo || DEFAULT_BARANGAY_LOGOS[bgy.name] || ''
                });
              }
            }
            const meta = user.user_metadata || {};
            const resident = user.resident_profile || {};
            const youthFromDb: YouthProfile = {
              id: meta.id || resident.digital_youth_id || `SK-2026-${user.id.slice(0, 4)}`,
              name: user.full_name || meta.name || 'Anonymous',
              sex: resident.sex || meta.sex || 'Female',
              birthdate: resident.birthdate || meta.birthdate || '2005-01-01',
              age: meta.age || 20,
              civilStatus: meta.civilStatus || 'Single',
              address: resident.address || meta.address || '',
              zone: meta.zone || 'Zone 1',
              mobile: user.phone || meta.mobile || '',
              email: user.email || meta.email || '',
              educationalLevel: meta.educationalLevel || resident.educational_status || 'College',
              school: meta.school || '',
              course: meta.course || '',
              year: meta.year || '1st Year',
              employmentStatus: meta.employmentStatus || resident.employment_status || 'Student',
              scholarStatus: meta.scholarStatus || 'Non-Scholar',
              scholarshipType: meta.scholarshipType || '',
              youthSector: meta.youthSector || 'In-School Youth',
              guardianName: meta.guardianName || '',
              guardianContact: meta.guardianContact || '',
              profilePic: meta.profilePic,
              qrCode: resident.qr_code_url || meta.qrCode,
              status: user.status === 'active' ? 'Approved' : (user.status === 'rejected' ? 'Rejected' : 'Pending'),
              barangayId: user.tenant_id || '',
              dateRegistered: user.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              registeredRole: 'Youth Constituent',
            };
            setCurrentYouth(youthFromDb);
            setYouthProfiles(prev => [youthFromDb, ...prev.filter(p => p.id !== youthFromDb.id && p.email !== youthFromDb.email)]);
          }
        }
      }).catch(console.warn);
    }

    // Load registered youth constituents from database
    kabisigApi.getYouthProfiles().then((profiles) => {
      if (profiles && profiles.length > 0) {
        setYouthProfiles(prev => {
          const merged = [...profiles];
          prev.forEach(p => {
            if (!merged.some(m => m.id === p.id || m.email.toLowerCase() === p.email.toLowerCase())) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    }).catch(console.warn);
  }, []);

  // --- AUTH CALLBACKS ---
  const handleLogin = (role: UserRole | 'Viewer', tenantId: string, emailOrName?: string, userObj?: any) => {
    if (emailOrName) {
      setCurrentEmail(emailOrName);
    }
    if (userObj) {
      setCurrentUser(userObj);
    } else {
      kabisigApi.getCurrentUser().then(user => {
        if (user) setCurrentUser(user);
      }).catch(console.warn);
    }
    // Check if the user has a registered profile with a pending or rejected status
    if (emailOrName) {
      const matchedProfile = youthProfiles.find(p => p.email.toLowerCase() === emailOrName.trim().toLowerCase());
      if (matchedProfile && matchedProfile.registeredRole === role) {
        if (matchedProfile.status === 'Pending') {
          alert(`Access Denied!\n\nYour registration as ${role} is currently PENDING approval by your Sangguniang Kabataan Chairperson.\n\nPlease wait for validation.`);
          return;
        } else if (matchedProfile.status === 'Rejected') {
          alert(`Access Denied!\n\nYour registration as ${role} was REJECTED by your Sangguniang Kabataan Chairperson.\n\nReason: ${matchedProfile.rejectionReason || 'No reason specified.'}`);
          return;
        }
      }
    }

    // Resolve tenant with multi-tenant binding priority
    let selectedTenant = tenants.find(t => t.id === tenantId);
    if (!selectedTenant && emailOrName) {
      const emailLower = emailOrName.trim().toLowerCase();
      // Match by youth/official profile binding
      const matchedProfile = youthProfiles.find(p => p.email.toLowerCase() === emailLower);
      if (matchedProfile?.barangayId) {
        selectedTenant = tenants.find(t => t.id === matchedProfile.barangayId);
      }
      // Match by assigned chairperson email
      if (!selectedTenant) {
        selectedTenant = tenants.find(t => t.chairpersonEmail?.toLowerCase() === emailLower);
      }
    }
    if (!selectedTenant) {
      selectedTenant = tenants[0];
    }

    if (selectedTenant) {
      selectedTenant = {
        ...selectedTenant,
        logo: selectedTenant.logo || DEFAULT_BARANGAY_LOGOS[selectedTenant.name] || ''
      };
    }

    const resolvedRole: UserRole = (role === 'SK Chairperson' || role === 'Barangay Admin') ? 'Barangay Admin' : role;
    setCurrentTenant(selectedTenant);
    setCurrentRole(resolvedRole);

    if (resolvedRole === 'Youth Constituent') {
      let matchedProfile = youthProfiles.find(p => p.email.toLowerCase() === emailOrName?.toLowerCase() || p.name === emailOrName);
      if (userObj) {
        const meta = userObj.user_metadata || {};
        const resident = userObj.resident_profile || {};
        const mergedFromDb: YouthProfile = {
          id: meta.id || resident.digital_youth_id || matchedProfile?.id || `SK-2026-${userObj.id.slice(0, 4)}`,
          name: userObj.full_name || meta.name || matchedProfile?.name || 'Anonymous',
          sex: resident.sex || meta.sex || matchedProfile?.sex || 'Female',
          birthdate: resident.birthdate || meta.birthdate || matchedProfile?.birthdate || '2005-01-01',
          age: meta.age || matchedProfile?.age || 20,
          civilStatus: meta.civilStatus || matchedProfile?.civilStatus || 'Single',
          address: resident.address || meta.address || matchedProfile?.address || '',
          zone: meta.zone || matchedProfile?.zone || 'Zone 1',
          mobile: userObj.phone || meta.mobile || matchedProfile?.mobile || '',
          email: userObj.email || meta.email || matchedProfile?.email || emailOrName || '',
          educationalLevel: meta.educationalLevel || resident.educational_status || matchedProfile?.educationalLevel || 'College',
          school: meta.school || matchedProfile?.school || '',
          course: meta.course || matchedProfile?.course || '',
          year: meta.year || matchedProfile?.year || '1st Year',
          employmentStatus: meta.employmentStatus || resident.employment_status || matchedProfile?.employmentStatus || 'Student',
          scholarStatus: meta.scholarStatus || matchedProfile?.scholarStatus || 'Non-Scholar',
          scholarshipType: meta.scholarshipType || matchedProfile?.scholarshipType || '',
          youthSector: meta.youthSector || matchedProfile?.youthSector || 'In-School Youth',
          guardianName: meta.guardianName || matchedProfile?.guardianName || '',
          guardianContact: meta.guardianContact || matchedProfile?.guardianContact || '',
          profilePic: meta.profilePic || matchedProfile?.profilePic,
          qrCode: resident.qr_code_url || meta.qrCode || matchedProfile?.qrCode,
          status: userObj.status === 'active' ? 'Approved' : (userObj.status === 'rejected' ? 'Rejected' : 'Pending'),
          barangayId: userObj.tenant_id || matchedProfile?.barangayId || '',
          dateRegistered: userObj.created_at?.split('T')[0] || matchedProfile?.dateRegistered || new Date().toISOString().split('T')[0],
          registeredRole: 'Youth Constituent',
        };
        matchedProfile = mergedFromDb;
      }

      if (!matchedProfile && typeof window !== 'undefined') {
        const saved = localStorage.getItem('kabisig_current_youth');
        if (saved) {
          try { matchedProfile = JSON.parse(saved); } catch {}
        }
      }

      const finalProfile = matchedProfile || youthProfiles[0];
      setCurrentYouth(finalProfile);
      if (finalProfile) {
        setYouthProfiles(prev => {
          const exists = prev.some(p => p.id === finalProfile.id || p.email.toLowerCase() === finalProfile.email.toLowerCase());
          return exists ? prev.map(p => (p.id === finalProfile.id || p.email.toLowerCase() === finalProfile.email.toLowerCase()) ? finalProfile : p) : [finalProfile, ...prev];
        });
      }
    } else {
      setCurrentYouth(null);
    }
  };

  const handleLogout = () => {
    kabisigApi.logout();
    setCurrentRole(null);
    setCurrentTenant(null);
    setCurrentYouth(null);
    setCurrentUser(null);
    setCurrentEmail('');
    setPublicView('login');
  };

  // --- SYSTEM REGISTRATION WORKFLOWS (Multi-Tenancy Binding) ---
  const handleSignUpSubmit = (newProfile: YouthProfile) => {
    // Bind profile strictly to an existing home barangay from the 27 Naga City registry
    const targetTenant = tenants.find(t => t.id === newProfile.barangayId) || tenants[0];
    const boundProfile: YouthProfile = {
      ...newProfile,
      barangayId: targetTenant.id
    };

    // Add profile to local database
    setYouthProfiles(prev => [boundProfile, ...prev]);

    const isOfficial = boundProfile.registeredRole && boundProfile.registeredRole !== 'Youth Constituent';

    if (isOfficial) {
      // Connect to backend API: Register Official
      kabisigApi.registerOfficial({
        email: boundProfile.email,
        full_name: boundProfile.name,
        barangay_id: targetTenant.id,
        role: boundProfile.registeredRole || 'SK_OFFICIAL',
        phone: boundProfile.mobile,
      }).catch(console.warn);

      // Create a pending SK Official registration request
      const newLog: SystemAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: boundProfile.name,
        role: boundProfile.registeredRole || 'SK Official',
        action: 'Account Self-Registration',
        details: `Registered as ${boundProfile.registeredRole} bound to Brgy. ${targetTenant.name} (Tenant ID: ${targetTenant.id}). Status: PENDING validation.`
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } else {
      // Connect to backend API: Register Youth Constituent
      const validEduStatuses = ['Elementary', 'High School', 'Vocational', 'College', 'Post-Graduate', 'Out of School Youth'];
      const isEdu = validEduStatuses.includes(boundProfile.educationalLevel || '');
      const eduStatus = isEdu ? boundProfile.educationalLevel : undefined;
      let empStatus = boundProfile.employmentStatus;
      if (!empStatus) {
        if (boundProfile.educationalLevel === 'Employed') empStatus = 'Employed';
        else if (boundProfile.educationalLevel === 'Unemployed' || boundProfile.educationalLevel === 'Out of School Youth') empStatus = 'Unemployed';
        else empStatus = 'Student';
      }

      kabisigApi.registerYouth({
        email: boundProfile.email,
        full_name: boundProfile.name,
        barangay_id: targetTenant.id,
        phone: boundProfile.mobile,
        birthdate: boundProfile.birthdate || '2005-01-01',
        sex: (boundProfile.sex as any) || 'Prefer not to say',
        address: boundProfile.address || `${boundProfile.zone || 'Zone 1'}, ${targetTenant.name}, Naga City`,
        educational_status: eduStatus,
        employment_status: empStatus,
        is_registered_voter: false,
      }).catch(console.warn);

      // Create a pending Katipunan Registration request automatically mapped to this youth
      const newReg: Registration = {
        id: `reg-${Date.now().toString().slice(-3)}`,
        programId: 'prog-01',
        programTitle: 'SK Barangay Youth Leadership Academy',
        participantId: boundProfile.id,
        participantName: boundProfile.name,
        status: 'Pending',
        dateRegistered: new Date().toISOString().split('T')[0],
        qrCode: `QR-KK-${boundProfile.id}`
      };
      setRegistrations(prev => [newReg, ...prev]);

      // Automatically sign in as the newly created constituent bound to the selected tenant
      setCurrentTenant(targetTenant);
      setCurrentYouth(boundProfile);
      setCurrentRole('Youth Constituent');
    }
  };

  // --- BARANGAY ADMIN INTERACTION WORKFLOWS ---
  const handleApproveYouth = (id: string) => {
    // Notify backend approval
    kabisigApi.approveUser(id).catch(console.warn);

    const matchedYouth = youthProfiles.find(p => p.id === id);
    const approvedByName = currentTenant ? currentTenant.chairperson : 'SK Chairperson';
    const approvedAtTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Update youth profile state
    setYouthProfiles(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status: 'Approved',
      approvedBy: approvedByName,
      approvedAt: approvedAtTime
    } : p));
    
    // Also approve associated registration tickets
    setRegistrations(prev => prev.map(r => r.participantId === id ? { ...r, status: 'Approved' } : r));
    
    // Update tenant counts if it's a regular constituent
    if (currentTenant && (!matchedYouth?.registeredRole || matchedYouth?.registeredRole === 'Youth Constituent')) {
      setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, youthPopulation: t.youthPopulation + 1 } : t));
    }

    if (matchedYouth) {
      // Create audit log
      const isOfficial = matchedYouth.registeredRole && matchedYouth.registeredRole !== 'Youth Constituent';
      const logRole = isOfficial ? matchedYouth.registeredRole : 'Youth Constituent';
      const newLog: SystemAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: approvedAtTime,
        user: approvedByName,
        role: 'Barangay Admin',
        action: 'Account Verification Approved',
        details: `Approved registry application for ${matchedYouth.name} as ${logRole}. Approved By: ${approvedByName}.`
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // Show alert with email mock notification
      alert(`Approval Successful!\n\nUser: ${matchedYouth.name}\nRole: ${logRole}\nApproved By: ${approvedByName}\nApproved At: ${approvedAtTime}\n\nNotification sent to registered email: ${matchedYouth.email}`);
    }
  };

  const handleRejectYouth = (id: string, reason: string) => {
    const matchedYouth = youthProfiles.find(p => p.id === id);
    const approvedByName = currentTenant ? currentTenant.chairperson : 'SK Chairperson';
    const approvedAtTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setYouthProfiles(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected', rejectionReason: reason } : p));
    setRegistrations(prev => prev.map(r => r.participantId === id ? { ...r, status: 'Rejected' } : r));
    
    if (matchedYouth) {
      // Create audit log
      const isOfficial = matchedYouth.registeredRole && matchedYouth.registeredRole !== 'Youth Constituent';
      const logRole = isOfficial ? matchedYouth.registeredRole : 'Youth Constituent';
      const newLog: SystemAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: approvedAtTime,
        user: approvedByName,
        role: 'Barangay Admin',
        action: 'Account Verification Rejected',
        details: `Rejected registry application for ${matchedYouth.name} (${logRole}). Reason: ${reason}`
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // Log a notification/feedback item to represent the rejection reason to the youth
      const feedbackItem: FeedbackRecord = {
        id: `feed-rej-${Date.now().toString().slice(-3)}`,
        type: 'Complaint',
        title: 'Registry Verification Failed',
        content: `Your Sangguniang Kabataan profile registration was rejected. Reason: ${reason}`,
        rating: 1,
        anonymous: false,
        status: 'Resolved',
        dateSubmitted: new Date().toISOString().split('T')[0],
        submittedBy: matchedYouth.name,
        response: 'Review your residency information details and re-submit a validation inquiry.'
      };
      setFeedback(prev => [feedbackItem, ...prev]);

      // Show alert with email mock rejection
      alert(`Rejection Processed!\n\nUser: ${matchedYouth.name}\nRole: ${logRole}\nReason: ${reason}\n\nRejection notice sent to registered email: ${matchedYouth.email}`);
    }
  };

  // --- SK OFFICIAL ACTIONS WORKFLOWS ---
  const handleCreateProgram = (newP: Program) => {
    // Smart Schedule Conflict Detection
    const hasConflict = programs.some(p =>
      p.startDate === newP.startDate && p.location === newP.location
    );
    if (hasConflict) {
      alert(`Conflict detected: A program is already scheduled at ${newP.location} on ${newP.startDate}.`);
      return;
    }

    setPrograms(prev => [newP, ...prev]);

    // Connect to backend API: Create Program in database
    kabisigApi.createProgram({
      title: newP.title,
      description: newP.description,
      category: newP.category || 'Sports Development',
      location: newP.location || `Barangay ${currentTenant?.name || 'Hall'}`,
      start_date: new Date(newP.startDate).toISOString(),
      end_date: new Date(newP.endDate).toISOString(),
      total_slots: newP.maxParticipants || 50,
      status: 'upcoming',
      tenant_id: currentTenant?.id
    }).catch(console.warn);

    // Also log a public announcement about the new program automatically!
    const authorName = currentUser?.full_name || (currentTenant?.chairperson && currentTenant.chairperson !== 'Unassigned' ? currentTenant.chairperson : 'SK Chairperson');
    const newAnn: AnnouncementRecord = {
      id: `ann-${Date.now().toString().slice(-3)}`,
      title: `Registration Open: ${newP.title}`,
      content: `${newP.description}\nLocation: ${newP.location}\nBudget Allocation: ₱${newP.budgetAllocation.toLocaleString()}\nSlots available: ${newP.maxParticipants}. Under the AIP framework, registration is free for KK validated members.`,
      author: authorName,
      barangay: currentTenant?.name || 'City-Wide',
      datePosted: new Date().toISOString().split('T')[0],
      category: 'Opportunity',
      attachments: ['AIP-Initiative-Flyer.pdf']
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const handleLogExpense = (newE: ExpenseRecord) => {
    setExpenses(prev => [newE, ...prev]);

    if (currentTenant?.id) {
      kabisigApi.recordExpense({
        budget_id: 'a0111111-1111-4000-8000-000000000001',
        program_id: newE.programId || undefined,
        title: newE.programTitle || 'Expense Item',
        description: newE.description,
        gross_amount: newE.amount,
        tax_type: 'VAT',
      }).catch(console.warn);
    }
    
    // Increment the tenant's spent budget reactively
    if (currentTenant) {
      setTenants(prev => prev.map(t => {
        if (t.name === currentTenant.name || t.id === currentTenant.id) {
          return {
            ...t,
            spentBudget: t.spentBudget + newE.amount
          };
        }
        return t;
      }));
    }
  };

  const handleRegisterAttendance = (record: any) => {
    // Check if record is present
    const isDup = registrations.some(r => r.programId === record.programId && r.participantId === record.participantId && r.status === 'Approved');
    if (!isDup) {
      // Add a registration on the fly
      const autoReg: Registration = {
        id: `reg-${Date.now().toString().slice(-3)}`,
        programId: record.programId,
        programTitle: programs.find(p => p.id === record.programId)?.title || 'Civic Event',
        participantId: record.participantId,
        participantName: record.participantName,
        status: 'Approved',
        dateRegistered: new Date().toISOString().split('T')[0],
        qrCode: `QR-AUTO-${record.participantId}`
      };
      setRegistrations(prev => [autoReg, ...prev]);
    }
    
    // Also increment programs' registered counts
    setPrograms(prev => prev.map(p => p.id === record.programId ? { ...p, registeredCount: p.registeredCount + 1 } : p));
  };

  // --- YOUTH CONSTITUENT WORKFLOWS ---
  const handleRegisterProgram = (progId: string) => {
    const selectedP = programs.find(p => p.id === progId);
    if (!selectedP || !currentYouth) return;

    const newReg: Registration = {
      id: `reg-${Date.now().toString().slice(-3)}`,
      programId: progId,
      programTitle: selectedP.title,
      participantId: currentYouth.id,
      participantName: currentYouth.name,
      status: 'Pending',
      dateRegistered: new Date().toISOString().split('T')[0],
      qrCode: `QR-KK-${currentYouth.id}`
    };

    setRegistrations(prev => [newReg, ...prev]);
  };

  const handleVoteResolution = (rId: string, voteType: 'Support' | 'Oppose' | 'Abstain') => {
    if (!currentYouth) return;

    setResolutions(prev => prev.map(res => {
      if (res.id === rId) {
        return {
          ...res,
          votesSupport: voteType === 'Support' ? res.votesSupport + 1 : res.votesSupport,
          votesOppose: voteType === 'Oppose' ? res.votesOppose + 1 : res.votesOppose,
          votesAbstain: voteType === 'Abstain' ? res.votesAbstain + 1 : res.votesAbstain,
          votedUsers: [...res.votedUsers, currentYouth.id]
        };
      }
      return res;
    }));
  };

  // --- SUPER ADMIN INTERACTION WORKFLOWS ---
  const handleCreateTenant = (newTenant: BarangayTenant) => {
    setTenants(prev => [...prev, newTenant].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleUpdateTenant = (updated: BarangayTenant) => {
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDeleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };


  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50">
      
      {/* 1. PUBLIC LANDING / LOGIN / SIGN-UP VIEW */}
      {currentRole === null && (
        <PublicPages 
          barangays={tenants}
          programs={programs}
          activeTab={publicView === 'landing' ? 'home' : publicView}
          setActiveTab={(tab) => setPublicView(tab === 'home' ? 'landing' : tab as any)}
          onLogin={(email, role, tenantId) => handleLogin(role, tenantId || '', email)}
          onSignUp={(partialProfile) => {
            const completeProfile: YouthProfile = {
              id: `SK-2026-${Math.floor(100 + Math.random() * 900)}`,
              name: partialProfile.name || 'Anonymous',
              sex: partialProfile.sex || 'Male',
              birthdate: partialProfile.birthdate || '',
              age: partialProfile.age || 0,
              mobile: partialProfile.mobile || '',
              email: partialProfile.email || '',
              address: partialProfile.address || '',
              zone: partialProfile.zone || '',
              school: partialProfile.school || '',
              educationalLevel: partialProfile.educationalLevel || 'College',
              course: partialProfile.course || '',
              year: partialProfile.year || '1st Year',
              scholarStatus: partialProfile.scholarStatus || 'Non-Scholar',
              guardianName: partialProfile.guardianName || '',
              guardianContact: partialProfile.guardianContact || '',
              status: 'Pending',
              dateRegistered: new Date().toISOString().split('T')[0],
              profilePic: partialProfile.profilePic,
              registeredRole: partialProfile.registeredRole || 'Youth Constituent',
              barangayId: partialProfile.barangayId || '',
              registeredProgramsCount: 0,
              attendanceRate: 0,
              engagementScore: 0
            };
            handleSignUpSubmit(completeProfile);
          }}
        />
      )}

      {/* 2. SUPER ADMIN PANELS */}
      {currentRole === 'Super Admin' && (
        <SuperAdminPages 
          barangays={tenants}
          programs={programs}
          auditLogs={auditLogs}
          onAddBarangay={handleCreateTenant}
          onUpdateBarangay={async (id, updated) => {
            const targetTenant = tenants.find(t => t.id === id);
            const brgyName = targetTenant ? targetTenant.name : id;

            // Connect to backend API: Persist settings and Chairperson in Supabase database
            const configPayload: any = {
              chairperson: updated.chairperson,
              chairpersonEmail: updated.chairpersonEmail !== undefined ? updated.chairpersonEmail : (targetTenant?.chairpersonEmail || ''),
              contact: updated.contact,
              youthPopulation: updated.youthPopulation,
              status: updated.status,
              logo: updated.logo,
            };

            if (typeof updated.totalBudget === 'number' && updated.totalBudget >= 0) {
              configPayload.allocatedBudget = updated.allocatedBudget ?? updated.totalBudget;
              configPayload.totalBudget = updated.totalBudget;
            }

            const res = await kabisigApi.saveBarangayConfiguration(id, configPayload);

            if (!res.success) {
              throw new Error(res.message || 'Database error: Could not save barangay settings.');
            }

            // Update local state reactively with backend response data
            const savedData = res.data || updated;
            setTenants(prev => prev.map(t => t.id === id ? { ...t, ...savedData } : t));

            // Re-fetch all barangays in background to ensure database-level consistency across all views
            kabisigApi.getBarangays().then(fresh => {
              if (fresh && fresh.length > 0) {
                setTenants(fresh);
              }
            }).catch(() => {});

            const detailsMsg = savedData.chairperson && savedData.chairperson !== 'Unassigned'
              ? `Assigned SK Chairperson ${savedData.chairperson} (${savedData.chairpersonEmail || 'email unset'}) to Brgy. ${brgyName} (Tenant ID: ${id}).`
              : `Configured settings for Brgy. ${brgyName} (Tenant ID: ${id}).`;

            // Log an audit log reactively!
            const newLog: SystemAuditLog = {
              id: `log-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              user: 'SK Federation President',
              role: 'Super Admin',
              action: 'TENANT_ADMIN_CONFIGURED',
              details: detailsMsg
            };
            setAuditLogs(prev => [newLog, ...prev]);
          }}
          onLogout={handleLogout}
          userEmail={currentEmail || "kyla.vinzon@example.com"}
        />
      )}

      {/* 3. BARANGAY ADMIN (SK CHAIRPERSON) PANELS */}
      {(currentRole === 'Barangay Admin' || currentRole === 'SK Chairperson') && currentTenant && (
        (!currentUser?.full_name || currentUser.full_name.trim() === '' || currentUser.full_name === 'Pending Chairperson' || currentUser.full_name === 'Pending Invitation' || !currentUser?.resident_profile?.birthdate) ? (
          <ChairpersonOnboarding 
            currentBarangay={currentTenant}
            userEmail={currentEmail || currentUser?.email || ''}
            onProfileCompleted={(updatedUser) => {
              setCurrentUser(updatedUser);
              if (updatedUser.full_name) {
                setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, chairperson: updatedUser.full_name, chairpersonEmail: updatedUser.email } : t));
              }
            }}
            onLogout={handleLogout}
          />
        ) : (
          <BarangayAdminPages 
            currentBarangay={currentTenant}
            currentUser={currentUser}
            programs={programs}
            youthProfiles={youthProfiles}
            documents={documents}
            auditLogs={auditLogs}
            registrations={registrations}
            feedback={feedback}
            expenses={expenses}
            resolutions={resolutions}
            onApproveYouth={handleApproveYouth}
            onRejectYouth={handleRejectYouth}
            onCreateProgram={handleCreateProgram}
            onLogout={handleLogout}
          />
        )
      )}

      {/* 4. OTHER SK OFFICIALS (KAGAWAD, SECRETARY, TREASURER) PANELS */}
      {(currentRole === 'SK Kagawad' || currentRole === 'SK Secretary' || currentRole === 'SK Treasurer') && (
        <OfficialPages 
          currentRole={currentRole}
          programs={programs}
          youthProfiles={youthProfiles}
          registrations={registrations}
          attendance={[]} // Simulated log tracking inside the view
          documents={documents}
          expenses={expenses}
          currentTenant={currentTenant}
          tenants={tenants}
          currentUser={currentUser}
          onAddProgram={handleCreateProgram}
          onAddExpense={handleLogExpense}
          onAddDocument={(d) => setDocuments(prev => [d, ...prev])}
          onRegisterAttendance={handleRegisterAttendance}
          onLogout={handleLogout}
        />
      )}

      {/* 5. YOUTH CONSTITUENT PANELS */}
      {currentRole === 'Youth Constituent' && currentYouth && (
        <YouthPages 
          currentYouth={currentYouth}
          programs={programs}
          registrations={registrations}
          
          feedback={feedback}
          resolutions={resolutions}
          onSubmitFeedback={(feed) => setFeedback(prev => [feed, ...prev])}
          onVoteResolution={handleVoteResolution}
          onRegisterProgram={handleRegisterProgram}
          onUpdateYouthProfile={(updated) => {
            setCurrentYouth(updated);
            setYouthProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
            kabisigApi.updateProfile(updated).catch(console.warn);
            if (typeof window !== 'undefined') {
              localStorage.setItem('kabisig_current_youth', JSON.stringify(updated));
            }
          }}
          onLogout={handleLogout}
        />
      )}

      {/* 6. PUBLIC TRANSPARENCY VIEWER PORTAL */}
      {currentRole === 'Viewer' && (
        <ViewerPages 
          tenants={tenants}
          programs={programs}
          youthProfiles={youthProfiles}
          documents={documents}
          resolutions={resolutions}
          expenses={expenses}
          announcements={announcements}
          onLogout={handleLogout}
          onNavigateSignUp={() => {
            setCurrentRole(null);
            setPublicView('signup');
          }}
        />
      )}



    </div>
  );
}
