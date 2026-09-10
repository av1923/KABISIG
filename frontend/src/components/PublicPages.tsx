import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Calendar, 
  DollarSign, 
  Shield, 
  ArrowRight, 
  Check, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  BookOpen, 
  HeartHandshake, 
  FileText,
  Lock,
  Upload,
  Eye,
  ChevronLeft,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import logoImage from '../assets/images/Logo w bg.png';
import { BarangayTenant, Program, YouthProfile, UserRole } from '../types';
import { kabisigApi } from '../lib/api';

export function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function DecorativeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Upper Left Curvy Abstract Vectors */}
      <svg className="absolute top-0 left-0 w-[55%] h-[55%] opacity-90" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-80 -80 C 180 -80, 260 160, 160 320 C 80 440, -80 380, -80 380 Z" fill="rgba(30, 58, 138, 0.08)" />
        <path d="M-120 -120 C 120 -120, 220 70, 120 250 C 50 350, -120 300, -120 300 Z" fill="rgba(219, 39, 119, 0.06)" />
        <path d="M-50 -50 C 80 -50, 180 200, 110 210 C 20 280, -50 220, -50 220 Z" fill="rgba(251, 191, 36, 0.05)" />
        {/* Connected Node Network */}
        <circle cx="120" cy="120" r="5" fill="rgba(30, 58, 138, 0.35)" />
        <circle cx="220" cy="80" r="6" fill="rgba(30, 58, 138, 0.25)" />
        <circle cx="180" cy="250" r="5" fill="rgba(219, 39, 119, 0.3)" />
        <circle cx="60" cy="300" r="5" fill="rgba(30, 58, 138, 0.3)" />
        <line x1="120" y1="120" x2="220" y2="80" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
        <line x1="120" y1="120" x2="180" y2="250" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
        <line x1="180" y1="250" x2="60" y2="300" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
        <line x1="60" y1="300" x2="120" y2="120" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
      </svg>

      {/* Upper Right Curvy Abstract Vectors */}
      <svg className="absolute top-0 right-0 w-[45%] h-[45%] opacity-90" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M450 -50 C 280 -50, 220 120, 300 240 C 360 320, 450 280, 450 280 Z" fill="rgba(219, 39, 119, 0.06)" />
        <path d="M480 -80 C 320 -80, 250 50, 320 180 C 370 260, 480 220, 480 220 Z" fill="rgba(251, 191, 36, 0.05)" />
      </svg>

      {/* Lower Left Curvy Abstract Vectors */}
      <svg className="absolute bottom-0 left-0 w-[45%] h-[45%] opacity-90" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50 450 C 120 450, 180 280, 100 160 C 40 80, -50 120, -50 120 Z" fill="rgba(219, 39, 119, 0.06)" />
        <path d="M-80 480 C 80 480, 150 350, 80 220 C 30 140, -80 180, -80 180 Z" fill="rgba(251, 191, 36, 0.05)" />
      </svg>

      {/* Lower Right Curvy Abstract Vectors */}
      <svg className="absolute bottom-0 right-0 w-[55%] h-[55%] opacity-90" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M580 580 C 320 580, 240 340, 340 180 C 420 60, 580 120, 580 120 Z" fill="rgba(30, 58, 138, 0.08)" />
        <path d="M620 620 C 380 620, 280 430, 380 250 C 450 150, 620 200, 620 200 Z" fill="rgba(219, 39, 119, 0.06)" />
        <path d="M550 550 C 420 550, 320 300, 390 290 C 480 220, 550 280, 550 280 Z" fill="rgba(251, 191, 36, 0.05)" />
        {/* Connected Node Network */}
        <circle cx="380" cy="380" r="5" fill="rgba(30, 58, 138, 0.35)" />
        <circle cx="280" cy="420" r="6" fill="rgba(219, 39, 119, 0.3)" />
        <circle cx="320" cy="250" r="5" fill="rgba(30, 58, 138, 0.3)" />
        <circle cx="440" cy="200" r="5" fill="rgba(251, 191, 36, 0.4)" />
        <line x1="380" y1="380" x2="280" y2="420" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
        <line x1="380" y1="380" x2="320" y2="250" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
        <line x1="320" y1="250" x2="440" y2="200" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
        <line x1="440" y1="200" x2="380" y2="380" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function KabisigLogo({ className = "w-28" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <img 
        src={logoImage.src}
        alt="KABISIG Logo" 
        className="w-full h-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

interface PublicPagesProps {
  onLogin: (email: string, role: UserRole, barangayId?: string, userObj?: any) => void;
  onSignUp: (profile: Partial<YouthProfile>) => void;
  barangays: BarangayTenant[];
  programs: Program[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PublicPages({
  onLogin,
  onSignUp,
  barangays,
  programs,
  activeTab,
  setActiveTab
}: PublicPagesProps) {
  // Navigation tabs for public pages: 'home', 'login', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Youth Constituent');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);

  // Sign up state (Multi-step)
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpBarangayId, setSignUpBarangayId] = useState('');
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    sex: 'Male' as 'Male' | 'Female' | 'Other',
    birthdate: '',
    age: 0,
    mobile: '',
    email: '',
    address: '',
    zone: '',
    zone: 'Zone 1',
    school: '',
    educationalLevel: 'College' as any,
    course: '',
    year: '1st Year',
    scholarStatus: 'Non-Scholar' as 'Scholar' | 'Non-Scholar',
    guardianName: '',
    guardianContact: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    profilePic: undefined,
    registeredRole: 'Youth Constituent' as UserRole
    registeredRole: '' as any
  });

  const totalYouth = barangays.reduce((acc, curr) => acc + curr.youthPopulation, 0);
  const totalBudget = barangays.reduce((acc, curr) => acc + curr.totalBudget, 0);
  const featuredPrograms = programs.slice(0, 3);

  // Auto-calculate age from birthdate
  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    setSignUpForm({
      ...signUpForm,
      birthdate: dob,
      age: isNaN(calculatedAge) ? 0 : calculatedAge
    });
  };

  const activeBarangayId = selectedBarangay || (barangays[0]?.id ?? '');

  const handleSignIn = async () => {
    setLoginError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLoginError('Please enter your KABISIG email address.');
      return;
    }
    if (!password) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Connect to backend API: Authenticate against Supabase Database
      const res = await kabisigApi.login(cleanEmail, password);
      if (!res.success || !res.token) {
        setLoginError(res.message || 'Invalid login credentials. Please check your email and password.');
        setIsLoggingIn(false);
        return;
      }

      // Check user role from database
      const dbUser = res.user;
      const roleId = dbUser?.role_id;
      let finalRole: UserRole = selectedRole;
      let finalBarangay = dbUser?.tenant_id || (selectedRole === 'Super Admin' ? '' : activeBarangayId);

      if (roleId === 1) {
        finalRole = 'Super Admin';
        finalBarangay = '';
      } else if (roleId === 2) {
        finalRole = 'Barangay Admin';
      } else if (roleId === 3) {
        finalRole = selectedRole.startsWith('SK') ? selectedRole : 'SK Kagawad';
      } else if (roleId === 4) {
        finalRole = 'Youth Constituent';
      }

      if (dbUser?.status === 'pending') {
        alert('Access Denied!\n\nYour account is currently PENDING approval by your Sangguniang Kabataan Chairperson.');
        setIsLoggingIn(false);
        return;
      }
      if (dbUser?.status === 'rejected') {
        alert('Access Denied!\n\nYour account application was rejected.');
        setIsLoggingIn(false);
        return;
      }

      onLogin(cleanEmail, finalRole, finalBarangay, dbUser);
    } catch (err: any) {
      setLoginError(err.message || 'Network error: Backend server unavailable.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignUpSubmit = async () => {
    const targetBarangayId = signUpBarangayId || selectedBarangay;
    if (!targetBarangayId) {
      alert('Please select your Home Barangay from the Naga City registry.');
      return;
    }
    if (!signUpForm.registeredRole) {
      alert('Please select your Desired KABISIG Role.');
      return;
    }
    if (!signUpForm.email.trim()) {
      alert('Please enter your KABISIG email address.');
      return;
    }
    if (!signUpForm.agreeTerms) {
      alert('Please consent to the Data Privacy guidelines before proceeding.');
      return;
    }

    const checks = validatePassword(signUpForm.password);
    if (!checks.minLength || !checks.hasUpper || !checks.hasLower || !checks.hasNumber || !checks.hasSymbol) {
      alert('Password is not secure! It must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.');
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsSubmittingSignUp(true);
    const isChairperson = signUpForm.registeredRole === 'SK Chairperson' || signUpForm.registeredRole === 'Barangay Admin';
    const isOfficial = isChairperson || (signUpForm.registeredRole && signUpForm.registeredRole !== 'Youth Constituent');

    const newProfile: Partial<YouthProfile> = {
      name: signUpForm.name || 'Anonymous Youth',
      name: signUpForm.name || 'Anonymous User',
      sex: signUpForm.sex,
      birthdate: signUpForm.birthdate,
      age: signUpForm.age,
      mobile: signUpForm.mobile,
      email: signUpForm.email,
      address: signUpForm.address,
      zone: signUpForm.zone,
      school: signUpForm.school,
      school: isChairperson ? 'Naga City Official Administration' : signUpForm.school,
      educationalLevel: signUpForm.educationalLevel,
      course: signUpForm.course,
      year: signUpForm.year,
      scholarStatus: signUpForm.scholarStatus,
      guardianName: signUpForm.guardianName,
      guardianContact: signUpForm.guardianContact,
      status: 'Pending',
      status: isChairperson ? 'Approved' : 'Pending',
      dateRegistered: new Date().toISOString().split('T')[0],
      profilePic: signUpForm.profilePic,
      registeredRole: signUpForm.registeredRole,
      barangayId: activeBarangayId
      barangayId: targetBarangayId
    };

    try {
      const isOfficial = signUpForm.registeredRole && signUpForm.registeredRole !== 'Youth Constituent';
      if (isOfficial) {
        const res = await kabisigApi.registerOfficial({
          email: signUpForm.email.trim(),
          password: signUpForm.password,
          full_name: signUpForm.name.trim(),
          barangay_id: activeBarangayId,
          barangay_id: targetBarangayId,
          role: signUpForm.registeredRole || 'SK_OFFICIAL',
          phone: signUpForm.mobile.trim(),
        });
        if (!res.success) {
          alert(`Official registration failed: ${res.message || 'Error occurred.'}`);
          setIsSubmittingSignUp(false);
          return;
        }

        if (isChairperson) {
          alert('SK Chairperson account created successfully!\n\nYou can now sign in with your email and password to access the Barangay Admin Portal.');
          setEmail(signUpForm.email.trim());
          setPassword('');
          setSelectedRole('Barangay Admin');
          setSelectedBarangay(targetBarangayId);
          setActiveTab('login');
          setSignUpStep(1);
          return;
        }
      } else {
        const res = await kabisigApi.registerYouth({
          email: signUpForm.email.trim(),
          password: signUpForm.password,
          full_name: signUpForm.name.trim(),
          barangay_id: activeBarangayId,
          barangay_id: targetBarangayId,
          phone: signUpForm.mobile.trim(),
          birthdate: signUpForm.birthdate,
          sex: signUpForm.sex,
          address: `${signUpForm.address}, ${signUpForm.zone}`,
          educational_status: signUpForm.educationalLevel,
          is_registered_voter: true,
        });
        if (!res.success) {
          alert(`Youth registration failed: ${res.message || 'Error occurred.'}`);
          setIsSubmittingSignUp(false);
          return;
        }
      }

      onSignUp(newProfile);
      alert('Registration submitted successfully!\n\nYour profile has been saved into the database and is pending validation by your Sangguniang Kabataan officials.');
      setActiveTab('login');
      setSignUpStep(1);
    } catch (err: any) {
      alert(`Registration error: ${err.message || 'Network error.'}`);
    } finally {
      setIsSubmittingSignUp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden">
      {/* Main Content Area depending on current tab */}
      <main className="flex-grow">
        {(activeTab === 'home' || activeTab === 'login') && (
          <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-12">
            <DecorativeBackground />

            <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              {isChangingPassword ? (
                <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 flex flex-col items-center">
                  <KabisigLogo className="mb-4" />
                  <h2 className="font-sans font-black text-[#1a237e] text-xs tracking-[0.15em] uppercase mb-2 text-center">
                    MANDATORY PASSWORD CHANGE
                  </h2>
                  <p className="text-xs text-slate-500 mb-6 text-center">Your account is using a temporary password. Please set a new password to continue.</p>
                  
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5 font-sans">New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5 font-sans">Confirm New Password</label>
                      <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-colors" />
                    </div>
                    <button
                      onClick={() => {
                        if (newPassword !== confirmNewPassword) {
                          alert('Passwords do not match!');
                          return;
                        }
                        const checks = validatePassword(newPassword);
                        if (!checks.minLength || !checks.hasUpper || !checks.hasLower || !checks.hasNumber || !checks.hasSymbol) {
                          alert('Password is not secure! It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.');
                          return;
                        }
                        alert('Password updated successfully!');
                        setIsChangingPassword(false);
                        const emailLower = email.trim().toLowerCase();
                        sessionStorage.setItem(`passwordChanged_${emailLower}`, 'true');
                        let finalRole: UserRole = selectedRole || 'Youth Constituent';
                        let finalBarangay = selectedBarangay || '';
                        
                        if (emailLower.includes('superadmin')) {
                          finalRole = 'Super Admin';
                        } else if (emailLower.includes('admin') || emailLower.includes('chairperson')) {
                          finalRole = 'Barangay Admin';
                        }

                        onLogin(email, finalRole, finalBarangay);
                      }}
                      className="w-full py-3.5 bg-[#133285] hover:bg-[#112d75] text-white font-sans font-bold rounded-xl shadow-sm transition-all cursor-pointer mt-2"
                    >
                      Update Password & Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 flex flex-col items-center">
                  <KabisigLogo className="mb-4" />
                  
                  <div className="w-6 h-0.5 bg-amber-400 rounded-full mb-3"></div>

                  <h2 className="font-sans font-black text-[#1a237e] text-xs tracking-[0.15em] uppercase mb-6 text-center">
                  <h2 className="font-sans font-black text-[#1a237e] text-xs tracking-[0.15em] uppercase mb-4 text-center">
                    SECURE SIGN-IN PORTAL
                  </h2>

                  {/* Navigation Switcher: Sign In / Create Account */}
                  <div className="flex w-full p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); }}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white text-[#133285] shadow-xs cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signup'); setSignUpStep(1); }}
                      className="flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>

                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5 font-sans">
                        KABISIG Email
                      </label>
                      <div className="relative w-full">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEmail(val);
                            const valLower = val.toLowerCase();
                            if (valLower.includes('superadmin')) {
                              setSelectedRole('Super Admin');
                            } else if (valLower.includes('chairperson') || valLower.includes('zaldy')) {
                              setSelectedRole('Barangay Admin');
                            } else if (valLower.includes('kagawad')) {
                              setSelectedRole('SK Kagawad');
                            } else if (valLower.includes('secretary')) {
                              setSelectedRole('SK Secretary');
                            } else if (valLower.includes('treasurer')) {
                              setSelectedRole('SK Treasurer');
                            }
                          }}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                          placeholder="Enter KABISIG Email"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1.5 font-sans">
                        Select Role / Portal Access
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-300 transition-colors cursor-pointer"
                      >
                        <option value="Super Admin">SK Federation President (Super Admin)</option>
                        <option value="Barangay Admin">SK Chairperson (Barangay Admin)</option>
                        <option value="SK Kagawad">SK Kagawad</option>
                        <option value="SK Secretary">SK Secretary</option>
                        <option value="SK Treasurer">SK Treasurer</option>
                        <option value="Youth Constituent">Youth Constituent (KK Member)</option>
                      </select>
                    </div>

                    {selectedRole !== 'Super Admin' && (
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold text-slate-900 font-sans">
                            Select Barangay Tenant (Naga City)
                          </label>
                          <span className="text-[10px] text-blue-600 font-bold">27 Barangays</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const currentBgy = barangays.find(b => b.id === activeBarangayId) || barangays[0];
                            return currentBgy?.logo ? (
                              <img src={currentBgy.logo} alt="" className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 p-0.5 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[#091d64] border border-indigo-100 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {currentBgy?.name?.charAt(0) || 'B'}
                              </div>
                            );
                          })()}
                          <select
                            value={activeBarangayId}
                            onChange={(e) => setSelectedBarangay(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-300 transition-colors cursor-pointer"
                          >
                            {barangays.map(b => (
                              <option key={b.id} value={b.id}>Barangay {b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-900 font-sans">
                          Password
                        </label>
                        <a 
                          href="#forgot" 
                          onClick={(e) => { e.preventDefault(); alert('Reset link simulated! Code forwarded securely to registered official mail.'); }} 
                          className="text-xs text-[#1a237e] font-bold hover:underline"
                        >
                          Forgot Password?
                        </a>
                      </div>
                      <div className="relative w-full">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                          placeholder="Enter Password"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Login Error Notification */}
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{loginError}</span>
                      </div>
                    )}

                    {/* Premade Super Admin Account Quick-Fill */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-left">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#133285]" /> Premade Super Admin Account:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('kyla.vinzon@example.com');
                            setPassword('KabisigSuperAdmin2026!');
                            setSelectedRole('Super Admin');
                            setLoginError(null);
                          }}
                          className="text-[10px] font-bold text-[#133285] hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 cursor-pointer transition-colors"
                        >
                          Auto-Fill
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 flex flex-col gap-0.5">
                        <div>Email: <span className="font-semibold text-slate-800">kyla.vinzon@example.com</span></div>
                        <div>Password: <span className="font-semibold text-slate-800">KabisigSuperAdmin2026!</span></div>
                      </div>
                    </div>

                    <button
                      disabled={isLoggingIn}
                      onClick={handleSignIn}
                      className="w-full py-3.5 bg-[#133285] hover:bg-[#112d75] disabled:opacity-60 text-white font-sans font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Authenticating with Database...</span>
                        </>
                      ) : (
                        <span>Sign In to Portal</span>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative flex py-4 items-center w-full">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-4 text-xs text-slate-400 font-normal">or</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                {/* Transparency Button */}
                <div className="w-full">
                  <button
                    onClick={() => onLogin('viewer@kabisig.ph', 'Viewer')}
                    className="w-full py-3 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#4f46e5] font-sans font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-[#4f46e5]" />
                    View Public Transparency Portal
                  </button>
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center text-xs text-slate-500 font-sans">
                  New to KABISIG?{' '}
                  <button 
                    onClick={() => { setActiveTab('signup'); setSignUpStep(1); }}
                    className="text-[#1a237e] font-bold hover:underline transition-colors cursor-pointer"
                  >
                    Register Youth Profile
                  </button>
                </div>
              </div>
            )}

            </div>
          </section>
        )}

        {/* YOUTH SIGN UP MULTI-STEP PAGE (A3) */}
        {activeTab === 'signup' && (
          <section className="relative min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
            <DecorativeBackground />

            <div className="relative z-10 w-full max-w-[500px]">
              <div id="signup-card" className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 sm:p-10 relative">
                
                {/* Back Button on Top Left matching Image 1 */}
                {signUpStep > 1 && (
                  <button 
                    type="button"
                    onClick={() => setSignUpStep(signUpStep - 1)}
                    onClick={() => {
                      if (signUpStep === 4 && (signUpForm.registeredRole === 'SK Chairperson' || signUpForm.registeredRole === 'Barangay Admin')) {
                        setSignUpStep(2);
                      } else {
                        setSignUpStep(signUpStep - 1);
                      }
                    }}
                    className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                {/* Central Logo, tagline and star matching Image 1 */}
                <div className="flex flex-col items-center mb-4">
                  <KabisigLogo className="mb-2" />
                  <div className="w-6 h-0.5 bg-amber-400 rounded-full mb-1"></div>
                  <div className="w-6 h-0.5 bg-amber-400 rounded-full mb-3"></div>
                </div>

                {/* Navigation Switcher: Sign In / Create Account */}
                <div className="flex w-full p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); }}
                    className="flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); setSignUpStep(1); }}
                    className="flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white text-[#133285] shadow-xs cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>

                {/* Headings according to Step */}
                <div className="text-center mb-6">
                  {signUpStep === 1 && (
                    <>
                      <h2 className="font-sans font-extrabold text-[#091d64] text-lg tracking-[0.1em] uppercase mb-1.5">
                        CREATE YOUR PROFILE
                      </h2>
                      <p className="text-xs text-slate-500">
                        Fill in your basic personal details below to start.
                      </p>
                    </>
                  )}
                  {signUpStep === 2 && (
                    <>
                      <h2 className="font-sans font-extrabold text-[#091d64] text-lg tracking-[0.1em] uppercase mb-1.5">
                        CONTACT & RESIDENCY
                      </h2>
                      <p className="text-xs text-slate-500">
                        Provide your current phone number and purok/zone.
                      </p>
                    </>
                  )}
                  {signUpStep === 3 && (
                    <>
                      <h2 className="font-sans font-extrabold text-[#091d64] text-lg tracking-[0.1em] uppercase mb-1.5">
                        EDUCATION & GUARDIAN
                      </h2>
                      <p className="text-xs text-slate-500">
                        Specify your current school level and emergency contact.
                      </p>
                    </>
                  )}
                  {signUpStep === 4 && (
                    <>
                      <h2 className="font-sans font-extrabold text-[#091d64] text-lg tracking-[0.1em] uppercase mb-1.5">
                        CREATE YOUR ACCOUNT
                        {signUpForm.registeredRole === 'SK Chairperson'
                          ? 'CREATE CHAIRPERSON ACCOUNT'
                          : 'CREATE YOUR ACCOUNT'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Fill in the details below to create your KABISIG account.
                        {signUpForm.registeredRole === 'SK Chairperson'
                          ? 'Set your official email and password to activate your Barangay Admin portal.'
                          : 'Fill in the details below to create your KABISIG account.'}
                      </p>
                    </>
                  )}
                </div>

                {/* Form Steps */}
                <div className="space-y-4">
                  {signUpStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 font-sans">
                            Home Barangay (Naga City Registry) <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                            27 Naga Barangays
                          </span>
                        </div>
                        <select 
                          value={activeBarangayId}
                          onChange={(e) => setSelectedBarangay(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors font-bold"
                          value={signUpBarangayId}
                          onChange={(e) => setSignUpBarangayId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors font-bold cursor-pointer"
                        >
                          <option value="">-- Select Home Barangay --</option>
                          {barangays.map(b => (
                            <option key={b.id} value={b.id}>Barangay {b.name}</option>
                          ))}
                        </select>

                        {/* SELECTED BARANGAY LOGO & JURISDICTION CARD */}
                        {(() => {
                          const currentBgy = barangays.find(b => b.id === activeBarangayId) || barangays[0];
                          if (!signUpBarangayId) {
                            return (
                              <div className="mt-2 p-3 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-center">
                                <span className="text-[11px] text-slate-400">Please select your Naga City barangay to bind your account.</span>
                              </div>
                            );
                          }
                          const currentBgy = barangays.find(b => b.id === signUpBarangayId);
                          return (
                            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 animate-fade-in">
                              {currentBgy?.logo ? (
                                <img 
                                  src={currentBgy.logo} 
                                  alt={`${currentBgy.name} Logo`} 
                                  className="w-11 h-11 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-2xs flex-shrink-0" 
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-[#091d64] flex items-center justify-center font-black text-base shadow-2xs flex-shrink-0">
                                  {currentBgy?.name?.charAt(0) || 'B'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Official Barangay Jurisdiction</span>
                                <h4 className="font-extrabold text-[#091d64] text-xs truncate">Barangay {currentBgy?.name}</h4>
                                <span className="text-[10px] text-slate-600 font-medium block truncate">
                                  {currentBgy?.chairperson && currentBgy?.chairperson !== 'Unassigned' 
                                    ? `SK Chairperson: ${currentBgy.chairperson}` 
                                    : 'Naga City Multi-Tenant Registry'}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        <p className="text-[10px] text-slate-400 mt-1">
                          Binds your profile directly to this Naga City tenant registry. Accounts cannot create a new barangay.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          Desired KABISIG Role <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={signUpForm.registeredRole}
                          onChange={(e) => setSignUpForm({...signUpForm, registeredRole: e.target.value as any})}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors animate-fade-in"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors font-semibold cursor-pointer animate-fade-in"
                        >
                          <option value="">-- Select Role --</option>
                          <option value="Youth Constituent">Youth Constituent</option>
                          <option value="SK Chairperson">SK Chairperson (Barangay Admin)</option>
                          <option value="SK Kagawad">SK Kagawad</option>
                          <option value="SK Secretary">SK Secretary</option>
                          <option value="SK Treasurer">SK Treasurer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={signUpForm.name}
                            onChange={(e) => setSignUpForm({...signUpForm, name: e.target.value})}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                            placeholder="Enter your full name"
                            required
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            Biological Sex <span className="text-red-500">*</span>
                          </label>
                          <select 
                            value={signUpForm.sex}
                            onChange={(e) => setSignUpForm({...signUpForm, sex: e.target.value as any})}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            Birthdate <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={signUpForm.birthdate}
                            onChange={handleBirthdateChange}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {signUpStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          Mobile Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full">
                          <input
                            type="tel"
                            value={signUpForm.mobile}
                            onChange={(e) => {
                              // Restrict input to digits and phone symbols only (no alphabetic characters)
                              const sanitized = e.target.value.replace(/[^0-9+\s()-]/g, '');
                              setSignUpForm({...signUpForm, mobile: sanitized});
                            }}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                            placeholder="09123456789 (Numbers only)"
                            required
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Numbers only (letters are not accepted)</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative w-full">
                            <input
                              type="text"
                              value={signUpForm.address}
                              onChange={(e) => setSignUpForm({...signUpForm, address: e.target.value})}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                              placeholder="House No., Street"
                              required
                            />
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            Zone / Purok <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={signUpForm.zone}
                            onChange={(e) => setSignUpForm({...signUpForm, zone: e.target.value})}
                            className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="Zone 1">Zone 1</option>
                            <option value="Zone 2">Zone 2</option>
                            <option value="Zone 3">Zone 3</option>
                            <option value="Zone 4">Zone 4</option>
                            <option value="Zone 5">Zone 5</option>
                            <option value="Zone 6">Zone 6</option>
                            <option value="Zone 7">Zone 7</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {signUpStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          School / Institution
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={signUpForm.school}
                            onChange={(e) => setSignUpForm({...signUpForm, school: e.target.value})}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            placeholder="Enter your school name"
                          />
                          <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            Educational Level <span className="text-red-500">*</span>
                          </label>
                          <select 
                            value={signUpForm.educationalLevel}
                            onChange={(e) => setSignUpForm({...signUpForm, educationalLevel: e.target.value as any})}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="High School">High School</option>
                            <option value="College">College Student</option>
                            <option value="Vocational">Vocational</option>
                            <option value="Employed">Employed / Working</option>
                            <option value="Unemployed">Unemployed</option>
                            <option value="Out of School Youth">Out of School</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                            Guardian Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative w-full">
                            <input
                              type="text"
                              value={signUpForm.guardianName}
                              onChange={(e) => setSignUpForm({...signUpForm, guardianName: e.target.value})}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                              placeholder="Elena Dela Cruz"
                              required
                            />
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          Guardian Mobile Contact <span className="text-red-500">*</span>
                        </label>
                        <div className="relative w-full">
                          <input
                            type="tel"
                            value={signUpForm.guardianContact}
                            onChange={(e) => {
                              const sanitized = e.target.value.replace(/[^0-9+\s()-]/g, '');
                              setSignUpForm({...signUpForm, guardianContact: sanitized});
                            }}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            placeholder="09123456789 (Numbers only)"
                            required
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Numbers only (letters are not accepted)</p>
                      </div>
                    </div>
                  )}

                  {signUpStep === 4 && (
                    <div className="space-y-4">
                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          KABISIG Email
                        </label>
                        <div className="relative w-full">
                          <input
                            type="email"
                            value={signUpForm.email}
                            onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                            placeholder="Enter your KABISIG email address"
                            required
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          Password
                        </label>
                        <div className="relative w-full">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={signUpForm.password}
                            onChange={(e) => setSignUpForm({...signUpForm, password: e.target.value})}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                            placeholder="Enter secure password"
                            required
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Live Password Criteria Checklist */}
                        {(() => {
                          const checks = validatePassword(signUpForm.password);
                          return (
                            <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px]">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Password Requirements:
                              </span>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                <div className={`flex items-center gap-1.5 ${checks.minLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${checks.minLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {checks.minLength ? '✓' : '•'}
                                  </span>
                                  <span>At least 8 characters</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${checks.hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${checks.hasUpper ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {checks.hasUpper ? '✓' : '•'}
                                  </span>
                                  <span>1 Uppercase (A-Z)</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${checks.hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${checks.hasLower ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {checks.hasLower ? '✓' : '•'}
                                  </span>
                                  <span>1 Lowercase (a-z)</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${checks.hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${checks.hasNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {checks.hasNumber ? '✓' : '•'}
                                  </span>
                                  <span>1 Number (0-9)</span>
                                </div>
                                <div className={`flex items-center gap-1.5 col-span-2 ${checks.hasSymbol ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${checks.hasSymbol ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {checks.hasSymbol ? '✓' : '•'}
                                  </span>
                                  <span>1 Symbol (!@#$%^&*...)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                          Confirm Password
                        </label>
                        <div className="relative w-full">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={signUpForm.confirmPassword}
                            onChange={(e) => setSignUpForm({...signUpForm, confirmPassword: e.target.value})}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-colors"
                            placeholder="Confirm your password"
                            required
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Data Privacy RA 10173 consent check */}
                      <div className="flex items-start gap-2 text-left mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-snug font-sans">
                        <input 
                          type="checkbox" 
                          id="privacy-consent" 
                          checked={signUpForm.agreeTerms} 
                          onChange={(e) => setSignUpForm({...signUpForm, agreeTerms: e.target.checked})} 
                          className="mt-0.5 rounded border-slate-300 text-[#091d64] focus:ring-[#091d64]" 
                        />
                        <label htmlFor="privacy-consent" className="cursor-pointer select-none">
                          I voluntarily consent to the secure collection and processing of my profiling data per RA 10173 Privacy guidelines.
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Single large solid deep blue button exactly like Image 1 */}
                  {signUpStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        // Validate active step with strict phone & format rules
                        if (signUpStep === 1) {
                          if (!signUpBarangayId) { alert('Please select your Home Barangay from the Naga City registry.'); return; }
                          if (!signUpForm.registeredRole) { alert('Please select your Desired KABISIG Role.'); return; }
                          if (!signUpForm.name.trim()) { alert('Full Name is required.'); return; }
                          if (!signUpForm.birthdate) { alert('Birthdate is required.'); return; }
                        }
                        if (signUpStep === 2) {
                          if (!signUpForm.mobile.trim()) { alert('Mobile phone number is required.'); return; }
                          if (/[a-zA-Z]/i.test(signUpForm.mobile)) { alert('Mobile phone number can only contain numbers and cannot accept alphabetic letters.'); return; }
                          if (signUpForm.mobile.replace(/[^0-9]/g, '').length < 10) { alert('Please enter a valid mobile number (at least 10 digits).'); return; }
                          if (!signUpForm.address.trim()) { alert('Street address is required.'); return; }

                          // If user is registering as SK Chairperson, skip school/guardian details straight to account password creation
                          if (signUpForm.registeredRole === 'SK Chairperson' || signUpForm.registeredRole === 'Barangay Admin') {
                            setSignUpStep(4);
                            return;
                          }
                        }
                        if (signUpStep === 3) {
                          if (!signUpForm.guardianName.trim()) { alert('Guardian name is required.'); return; }
                          if (!signUpForm.guardianContact.trim()) { alert('Guardian contact number is required.'); return; }
                          if (/[a-zA-Z]/i.test(signUpForm.guardianContact)) { alert('Guardian contact number can only contain numbers and cannot accept alphabetic letters.'); return; }
                          if (signUpForm.guardianContact.replace(/[^0-9]/g, '').length < 10) { alert('Please enter a valid guardian contact number (at least 10 digits).'); return; }
                        }
                        setSignUpStep(signUpStep + 1);
                      }}
                      className="w-full mt-4 py-3 bg-[#091d64] hover:bg-[#061344] text-white font-bold rounded-lg shadow-sm transition-all active:scale-[0.99] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmittingSignUp}
                      onClick={handleSignUpSubmit}
                      className="w-full mt-4 py-3 bg-[#091d64] hover:bg-[#061344] disabled:opacity-60 text-white font-bold rounded-lg shadow-sm transition-all active:scale-[0.99] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingSignUp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <span>Complete Registration</span>
                        <span>
                          {signUpForm.registeredRole === 'SK Chairperson'
                            ? 'Create Chairperson Account'
                            : 'Complete Registration'}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="relative flex py-4 items-center w-full">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-xs text-slate-400 font-normal">or</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Already have an account? Log in exactly like Image 1 */}
                <div className="text-center text-xs text-slate-700 font-sans">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { setActiveTab('login'); setSignUpStep(1); }}
                    className="text-[#091d64] font-bold hover:underline transition-colors"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
