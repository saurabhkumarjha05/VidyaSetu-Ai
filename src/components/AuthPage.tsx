import React, { useState } from "react";
import { Role, User, Student } from "../types";
import { motion } from "motion/react";
import {
  Brain,
  Sparkles,
  Shield,
  Loader2,
  Lock,
  ArrowRight,
  School,
  CheckCircle,
  GraduationCap,
  Users,
  Sliders,
  ChevronLeft,
  Building2,
  UploadCloud,
  Copy,
  Check,
  FileText,
  LockKeyhole,
  Mail,
  UserCheck,
  Phone,
  Globe,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

interface AuthPageProps {
  students: Student[];
  onLogin: (user: User) => void;
  onBackToLanding: () => void;
  mode?: "LANDING" | "AUTH" | "REGISTER" | "PLATFORM_LOGIN";
}

export default function AuthPage({ students, onLogin, onBackToLanding, mode = "AUTH" }: AuthPageProps) {
  // Page routing inside AuthPage
  const [currentView, setCurrentView] = useState<"LOGIN_FLOW" | "REGISTRATION_FLOW" | "SUPERVISOR_FLOW">(() => {
    if (mode === "REGISTER") return "REGISTRATION_FLOW";
    if (mode === "PLATFORM_LOGIN") return "SUPERVISOR_FLOW";
    return "LOGIN_FLOW";
  });

  // --- 1. LOGIN STATE ENGINE ---
  const [loginStep, setLoginStep] = useState<"SCHOOL_CODE" | "ROLE_SELECT" | "CREDENTIALS">("SCHOOL_CODE");
  const [schoolCode, setSchoolCode] = useState("");
  const [verifyingSchool, setVerifyingSchool] = useState(false);
  
  // Loaded verified school metadata
  const [verifiedSchool, setVerifiedSchool] = useState<{
    id: string;
    name: string;
    address: string;
    logoUrl: string;
    adminEmail?: string;
  } | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState("");

  // --- 2. REGISTRATION STATE ENGINE ---
  const [regStep, setRegStep] = useState<1 | 2 | 3 | "SUCCESS">(1);
  const [schoolName, setSchoolName] = useState("");
  const [boardAffiliation, setBoardAffiliation] = useState("CBSE");
  const [affiliationNumber, setAffiliationNumber] = useState("");
  const [establishedYear, setEstablishedYear] = useState("2010");
  
  const [principalName, setPrincipalName] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalMobile, setPrincipalMobile] = useState("");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [contactsPhone, setContactsPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Delhi");
  const [zip, setZip] = useState("");

  // Regulatory Documents
  const [uploadedCertificate, setUploadedCertificate] = useState<string | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadedAffiliation, setUploadedAffiliation] = useState<string | null>(null);
  const [uploadingAff, setUploadingAff] = useState(false);

  // Success Results
  const [registrationResult, setRegistrationResult] = useState<{
    schoolCode: string;
    applicationId: string;
    reviewTimeline: string;
    emailConfirmation: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [approvingWorkspace, setApprovingWorkspace] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  // --- 3. SUPERVISOR STATE ENGINE ---
  const [superUsername, setSuperUsername] = useState("");
  const [superPassword, setSuperPassword] = useState("");
  const [superAuthenticating, setSuperAuthenticating] = useState(false);
  const [superError, setSuperError] = useState("");

  // -------------------------------------------------------
  // API HANDLERS
  // -------------------------------------------------------

  // Verify School Code
  const handleVerifySchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolCode.trim()) return;

    setVerifyingSchool(true);
    setLoginError("");

    try {
      const res = await fetch(`/api/schools/verify?code=${encodeURIComponent(schoolCode.trim())}`);
      const data = await res.json();
      
      if (data.success) {
        setVerifiedSchool(data.school);
        setLoginStep("ROLE_SELECT");
      } else {
        setLoginError(data.error || "Workspace code is unrecognized.");
      }
    } catch (err) {
      setLoginError("Could not connect to regulatory validation servers.");
    } finally {
      setVerifyingSchool(false);
    }
  };

  // Perform Unified Multi-Tenant Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError("Please enter all required security credentials.");
      return;
    }

    setAuthenticating(true);
    setLoginError("");

    try {
      const res = await fetch("/api/schools/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolCode: verifiedSchool?.id,
          role: selectedRole,
          username: username.trim(),
          password: password
        })
      });
      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setLoginError(data.error || "Authentication rejected.");
      }
    } catch (err) {
      setLoginError("Failed to initiate login request. Please retry.");
    } finally {
      setAuthenticating(false);
    }
  };

  // Submit School Registration Flow
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !principalEmail || !adminEmail || !adminPassword) {
      alert("Please ensure all core administrative fields are populated.");
      return;
    }

    try {
      const res = await fetch("/api/schools/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName, boardAffiliation, affiliationNumber, establishedYear,
          principalName, principalEmail, principalMobile,
          adminName, adminEmail, adminPassword,
          contactsPhone, website, addressStreet, city, state: stateName, zip
        })
      });
      const data = await res.json();

      if (data.success) {
        setRegistrationResult({
          schoolCode: data.schoolCode,
          applicationId: data.applicationId,
          reviewTimeline: data.reviewTimeline,
          emailConfirmation: data.emailConfirmation
        });
        setRegStep("SUCCESS");
      } else {
        alert(data.error || "Registration encountered an error.");
      }
    } catch (err) {
      alert("Failed to submit school registry application.");
    }
  };

  // Simulate Superintendent Workspace Approval
  const handleSimulateApproval = async () => {
    if (!registrationResult?.schoolCode) return;
    setApprovingWorkspace(true);
    try {
      const res = await fetch("/api/schools/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode: registrationResult.schoolCode })
      });
      const data = await res.json();
      if (data.success) {
        setApprovalSuccess(true);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setApprovingWorkspace(false);
    }
  };

  // Hidden Platform Superintendent Authenticator
  const handleSupervisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superUsername.trim() || !superPassword) {
      setSuperError("Please provide all administrator access keys.");
      return;
    }

    setSuperAuthenticating(true);
    setSuperError("");

    try {
      const res = await fetch("/api/schools/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolCode: "GLOBAL",
          role: "SUPER_ADMIN",
          username: superUsername.trim(),
          password: superPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setSuperError(data.error || "Superintendent credentials invalid.");
      }
    } catch (err) {
      setSuperError("Connection failed. Platform core offline.");
    } finally {
      setSuperAuthenticating(false);
    }
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Quick Prefill Helper for Evaluation
  const triggerPrefill = (role: Role) => {
    setSelectedRole(role);
    setLoginError("");

    if (role === Role.ADMIN) {
      setUsername(verifiedSchool?.adminEmail || "admin@hillside.edu");
      setPassword("admin123");
    } else if (role === Role.TEACHER) {
      setUsername("teacher@hillside.edu");
      setPassword("teacher123");
    } else if (role === Role.STUDENT) {
      // Look for a student matching this school code
      const currentCode = verifiedSchool?.id || "VIDYA-99";
      const matched = students.find(s => s.schoolCode === currentCode) || students[0];
      setUsername(matched ? matched.rollNumber : "9A-01");
      setPassword("student123");
    } else if (role === Role.PARENT) {
      setUsername("dad@aarav.com");
      setPassword("parent123");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-4 sm:py-12 px-2 sm:px-6 lg:px-8 relative font-sans overflow-hidden select-none">
      
      {/* Decorative backdrop shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-70 pointer-events-none" />

      {/* Top Left Navigation Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <button
          onClick={onBackToLanding}
          className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all shadow-xs flex items-center gap-1 hover:shadow"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Website
        </button>
      </div>

      {/* Master Content Card */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[620px]">
        
        {/* Left Informative Column (SaaS Style) */}
        <div className="hidden md:flex md:col-span-5 bg-[#0A0A0F] p-8 text-white flex-col justify-between relative overflow-hidden">
          
          {/* Internal ambient glowing circles */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Core Branding */}
          <div className="space-y-6 relative">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-white text-base tracking-tight">VidyaSetu AI OS</span>
            </div>

            <div className="pt-8 space-y-4">
              <span className="text-[9px] bg-slate-900 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Multi-Tenant Isolation
              </span>
              <h3 className="text-xl font-display font-extrabold text-white leading-tight">
                Empathetic School Intelligence for India
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience seamless workspace sandboxing. Our secure ledger-based schema strictly separates class rosters, timetables, and emotional fatigue indices by institutional school codes.
              </p>
            </div>
          </div>

          {/* Quick Active Indicators */}
          <div className="space-y-4 relative">
            
            {/* Display status details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-md">
              <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300">
                <span>Active Workspace Roster</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md font-bold text-[8px] uppercase font-mono">
                  SECURE SSL
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Standard Isolation</span>
                  <span className="text-sm font-bold text-white font-mono">x-school-code</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">DPDP Compliance</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">Active</span>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-slate-600 leading-relaxed text-center font-mono uppercase tracking-wider">
              Powered by Google Gemini AI • Secure Tenant
            </p>
          </div>

        </div>

        {/* Right Action Block (Forms Container) */}
        <div className="col-span-12 md:col-span-7 p-4 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          
          {/* =======================================================
              VIEW 1: REGISTRATION FLOW
             ======================================================= */}
          {currentView === "REGISTRATION_FLOW" && (
            <div className="space-y-6">
              
              {/* Heading */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">School Onboarding</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-mono font-bold text-[8px] rounded border border-indigo-100">FORM v2.5</span>
                </div>
                <h3 className="text-xl font-display font-extrabold text-slate-900 leading-none">Register New School Workspace</h3>
                <p className="text-xs text-slate-400">Establish a brand new secure sandbox workspace for your educational institution.</p>
              </div>

              {/* Step indicator */}
              {regStep !== "SUCCESS" && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full flex-1 transition-all ${
                        regStep >= s ? "bg-indigo-600" : "bg-slate-100"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase ml-2">Step {regStep} of 3</span>
                </div>
              )}

              {/* Step 1: Institutional Core Details */}
              {regStep === 1 && (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Official School / Academy Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Greenwood International School"
                        className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Board Affiliation</label>
                      <select
                        value={boardAffiliation}
                        onChange={(e) => setBoardAffiliation(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      >
                        <option value="CBSE">CBSE (Central Board)</option>
                        <option value="ICSE">ICSE / CISCE</option>
                        <option value="State Board">State Board</option>
                        <option value="International">IB / Cambridge</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Affiliation Number</label>
                      <input
                        type="text"
                        required
                        value={affiliationNumber}
                        onChange={(e) => setAffiliationNumber(e.target.value)}
                        placeholder="e.g. CBSE-2130129"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Established Year</label>
                      <input
                        type="number"
                        required
                        value={establishedYear}
                        onChange={(e) => setEstablishedYear(e.target.value)}
                        placeholder="e.g. 1998"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Official Website</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="e.g. www.greenwood.edu.in"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!schoolName || !affiliationNumber) {
                        alert("Please fill out the official School Name and Affiliation Number.");
                        return;
                      }
                      setRegStep(2);
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    Continue to Principal & Admin Setup <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button onClick={() => setCurrentView("LOGIN_FLOW")} className="text-[11px] font-bold text-indigo-600 hover:underline">
                      Already registered? Go to Login
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Contact, Principal & Admin Identity */}
              {regStep === 2 && (
                <div className="space-y-4 text-left">
                  
                  {/* Principal & Admin Info */}
                  <div className="border border-slate-100 p-3 rounded-xl space-y-3 bg-slate-50/50">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Principal Identity</span>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Principal Name"
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Principal Email"
                        value={principalEmail}
                        onChange={(e) => setPrincipalEmail(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-100 p-3 rounded-xl space-y-3 bg-slate-50/50">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Workspace Administrator Credentials</span>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Admin Name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500 col-span-1"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Admin Login Email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500 col-span-1"
                      />
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500 col-span-1"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium block">
                      Note: Keep these credentials safe. You will use them to pass the Setup Wizard once approved.
                    </span>
                  </div>

                  {/* Address Details */}
                  <div className="border border-slate-100 p-3 rounded-xl space-y-3 bg-slate-50/50">
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Campus Location</span>
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setRegStep(1)}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!principalName || !principalEmail || !adminEmail || !adminPassword) {
                          alert("Please fill in Principal Name, Email, and Administrator Email/Password details.");
                          return;
                        }
                        setRegStep(3);
                      }}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                    >
                      Continue to Document Locker <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Document Locker */}
              {regStep === 3 && (
                <div className="space-y-4 text-left">
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl">
                    <p className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" /> Regulatory Document Verification
                    </p>
                    <p className="text-[10px] text-indigo-800/80 mt-0.5 leading-normal">
                      Under Indian administrative guidelines, school registries require valid licensing documents before approval. Submit mock certificates below.
                    </p>
                  </div>

                  {/* Document 1: Board Affiliation */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-500" /> CBSE / Board Affiliation Certificate
                      </span>
                      {uploadedAffiliation && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                    </div>
                    
                    {!uploadedAffiliation ? (
                      <div
                        onClick={() => {
                          setUploadingAff(true);
                          setTimeout(() => {
                            setUploadedAffiliation("Affiliation_CBSE_Signed_2026.pdf");
                            setUploadingAff(false);
                          }, 1500);
                        }}
                        className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-all space-y-1"
                      >
                        {uploadingAff ? (
                          <div className="flex flex-col items-center gap-1">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            <span className="text-[10px] font-bold text-slate-400">Uploading regulatory cert...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                            <p className="text-[11px] font-bold text-slate-600">Drag & Drop or Click to Upload</p>
                            <p className="text-[9px] text-slate-400">PDF, PNG, JPG accepted (Max 10MB)</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs font-mono font-bold text-slate-600">
                        <span>{uploadedAffiliation}</span>
                        <button onClick={() => setUploadedAffiliation(null)} className="text-[10px] text-rose-500 hover:underline">Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Document 2: Recognition Permit */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-500" /> State Govt Recognition certificate
                      </span>
                      {uploadedCertificate && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                    </div>

                    {!uploadedCertificate ? (
                      <div
                        onClick={() => {
                          setUploadingCert(true);
                          setTimeout(() => {
                            setUploadedCertificate("State_Recognition_Permit_2026.pdf");
                            setUploadingCert(false);
                          }, 1500);
                        }}
                        className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-all space-y-1"
                      >
                        {uploadingCert ? (
                          <div className="flex flex-col items-center gap-1">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            <span className="text-[10px] font-bold text-slate-400">Uploading government license...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                            <p className="text-[11px] font-bold text-slate-600">Drag & Drop or Click to Upload</p>
                            <p className="text-[9px] text-slate-400">PDF, PNG, JPG accepted (Max 10MB)</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs font-mono font-bold text-slate-600">
                        <span>{uploadedCertificate}</span>
                        <button onClick={() => setUploadedCertificate(null)} className="text-[10px] text-rose-500 hover:underline">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setRegStep(2)}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleRegisterSubmit}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                    >
                      Submit School Application <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS VIEW */}
              {regStep === "SUCCESS" && registrationResult && (
                <div className="space-y-6 text-left">
                  
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-center">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-sm">
                      ✓
                    </div>
                    <h4 className="text-sm font-extrabold text-emerald-900 uppercase tracking-tight">Onboarding Request Dispatched Successfully</h4>
                    <p className="text-xs text-emerald-800 leading-normal">
                      We have logged Greenwood International under Board Review. Your application code is <strong className="font-mono">{registrationResult.applicationId}</strong>.
                    </p>
                  </div>

                  {/* Generated School Code Box */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">YOUR ASSIGNED SCHOOL WORKSPACE ID</span>
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200/50">
                      <div>
                        <p className="text-lg font-black text-slate-900 font-mono tracking-wide">{registrationResult.schoolCode}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Copy this code to trigger the multi-tenant login.</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(registrationResult.schoolCode)}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-xs flex items-center gap-1 text-xs font-bold"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {copiedCode ? "Copied!" : "Copy Code"}
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-500 leading-normal">
                      <p>• <strong>Review Status:</strong> <span className="text-amber-600 font-extrabold uppercase font-mono">Pending Approval (24h)</span></p>
                      <p>• <strong>Workspace Setup Status:</strong> Completely Empty (In accordance with strict regulatory data isolation protocols, zero dummy student records are populated).</p>
                    </div>
                  </div>

                  {/* Sandbox Immediate Approval Shortcut */}
                  <div className="p-4.5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3">
                    <div className="flex gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-indigo-900">Immediate Evaluation Shortcut (Applet Sandbox)</p>
                        <p className="text-[11px] text-indigo-800/80 mt-0.5">
                          Since platform verification takes 24 hours in production, click below to simulate immediate platform board approval so you can log in instantly and test the Setup Wizard!
                        </p>
                      </div>
                    </div>

                    {approvalSuccess ? (
                      <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Workspace APPROVED successfully! Click the button below to proceed and log in as Admin.
                      </div>
                    ) : (
                      <button
                        onClick={handleSimulateApproval}
                        disabled={approvingWorkspace}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1"
                      >
                        {approvingWorkspace ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Commissioning Workspace...
                          </>
                        ) : (
                          "Simulate Immediate Board Approval (Active Workspace)"
                        )}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSchoolCode(registrationResult.schoolCode);
                      setVerifiedSchool({
                        id: registrationResult.schoolCode,
                        name: schoolName,
                        address: `${city}, ${stateName}, India`,
                        logoUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80",
                        adminEmail: adminEmail
                      });
                      setSelectedRole(Role.ADMIN);
                      setUsername(adminEmail);
                      setPassword(adminPassword);
                      setLoginStep("CREDENTIALS");
                      setCurrentView("LOGIN_FLOW");
                    }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Proceed to Unified Login Portal <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              )}

            </div>
          )}

          {/* =======================================================
              VIEW 2: PLATFORM SUPERVISOR FLOW
             ======================================================= */}
          {currentView === "SUPERVISOR_FLOW" && (
            <div className="space-y-6">
              
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Platform Admin Portal</span>
                <h3 className="text-xl font-display font-extrabold text-slate-950 leading-none">Superintendent Login</h3>
                <p className="text-xs text-slate-400">Access platform-wide analytical panels, verify registrations, and manage global notices.</p>
              </div>

              {superError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  {superError}
                </div>
              )}

              <form onSubmit={handleSupervisorSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Superintendent Username</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                    <input
                      type="email"
                      required
                      value={superUsername}
                      onChange={(e) => setSuperUsername(e.target.value)}
                      placeholder="e.g. superadmin@vidyasetu.com"
                      className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrative Security Key</label>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={superPassword}
                      onChange={(e) => setSuperPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={superAuthenticating}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-700"
                >
                  {superAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Platform Keys...
                    </>
                  ) : (
                    <>
                      Authenticate Console Access <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Prefill helper */}
              <div className="pt-2 bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">Platform Demonstration Credential Key</span>
                <div
                  onClick={() => {
                    setSuperUsername("superadmin@vidyasetu.com");
                    setSuperPassword("superadmin123");
                  }}
                  className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-all flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">Platform Superintendent</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">superadmin@vidyasetu.com • superadmin123</p>
                  </div>
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                </div>
              </div>

              <div className="text-center">
                <button onClick={() => setCurrentView("LOGIN_FLOW")} className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Return to School Portals
                </button>
              </div>

            </div>
          )}

          {/* =======================================================
              VIEW 3: STANDARD LOGIN FLOW
             ======================================================= */}
          {currentView === "LOGIN_FLOW" && (
            <div className="space-y-6">
              
              {/* Login Step 1: School Code Input */}
              {loginStep === "SCHOOL_CODE" && (
                <div className="space-y-6 text-left">
                  
                  {/* Heading */}
                  <div className="space-y-1.5 text-center md:text-left">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Step 1 of 3</span>
                    <h3 className="text-xl font-display font-extrabold text-slate-900 leading-none">Verify Your School</h3>
                    <p className="text-xs text-slate-400">Enter your institution's registration code to load the classroom registers.</p>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleVerifySchool} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">School ID / Registration Code</label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                        <input
                          type="text"
                          required
                          value={schoolCode}
                          onChange={(e) => setSchoolCode(e.target.value)}
                          placeholder="e.g. VIDYA-99"
                          className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500 text-slate-700 uppercase font-mono tracking-wider"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium italic block pt-1 leading-normal">
                        Tip: Enter <span className="font-bold text-indigo-500 font-mono">VIDYA-99</span> to load Hillside Academy, or <span className="font-bold text-indigo-500 font-mono">DPS-88</span> for Delhi Public School.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyingSchool}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-indigo-300"
                    >
                      {verifyingSchool ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying School Code...
                        </>
                      ) : (
                        <>
                          Verify School Workspace <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 text-center border-t border-slate-100 flex flex-col items-center gap-2">
                    <button onClick={() => setCurrentView("REGISTRATION_FLOW")} className="text-[11px] font-bold text-indigo-600 hover:underline">
                      Register a New School Workspace
                    </button>
                  </div>

                </div>
              )}

              {/* Login Step 2: Role Selection */}
              {loginStep === "ROLE_SELECT" && verifiedSchool && (
                <div className="space-y-6 text-left">
                  
                  {/* Heading */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Step 2 of 3</span>
                      <button onClick={() => setLoginStep("SCHOOL_CODE")} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                        Change School Code
                      </button>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <img src={verifiedSchool.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{verifiedSchool.name}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold">{verifiedSchool.address}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-extrabold text-slate-950 mt-4 leading-none">Who are you signing in as?</h3>
                    <p className="text-xs text-slate-400">Select your role to load appropriate portals and authorization guards.</p>
                  </div>

                  {/* Role Selection Grid (SUPER_ADMIN EXCLUDED) */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { role: Role.ADMIN, title: "School Admin", desc: "Operations & Wizard", icon: Sliders },
                      { role: Role.TEACHER, title: "Teacher", desc: "Gradebook & Logs", icon: GraduationCap },
                      { role: Role.STUDENT, title: "Student", desc: "Study Desk & Chat", icon: Brain },
                      { role: Role.PARENT, title: "Parent / Guardian", desc: "Wellness Track", icon: Users }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.role}
                          onClick={() => {
                            setSelectedRole(item.role);
                            // Auto reset credentials fields so they can type or use prefill
                            setUsername("");
                            setPassword("");
                            setLoginStep("CREDENTIALS");
                          }}
                          className="border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer p-4 rounded-2xl transition-all space-y-2 text-left bg-white group hover:scale-101 shadow-xs hover:shadow"
                        >
                          <div className="p-2 bg-slate-50 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 rounded-xl w-fit">
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{item.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Login Step 3: Role Credentials & Prefill */}
              {loginStep === "CREDENTIALS" && verifiedSchool && (
                <div className="space-y-6 text-left">
                  
                  {/* Heading */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Step 3 of 3</span>
                      <button onClick={() => setLoginStep("ROLE_SELECT")} className="text-[10px] font-bold text-indigo-600 hover:underline font-mono uppercase font-bold">
                        Back to Roles
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span>Signing in as:</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-mono text-[10px] uppercase font-bold">
                        {selectedRole}
                      </span>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {selectedRole === Role.STUDENT ? "Roll Number or Email" : "Official Email / ID"}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={selectedRole === Role.STUDENT ? "e.g. 9A-01" : "e.g. admin@school.edu"}
                          className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                        <span className="text-[10px] text-slate-400 font-semibold cursor-not-allowed">Forgot Password?</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-indigo-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authenticating}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-indigo-300"
                    >
                      {authenticating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Profile...
                        </>
                      ) : (
                        <>
                          Sign In to Portal <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Evaluator Prefill Assistance block */}
                  <div className="pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      EVALUATION PRESETS FOR THIS TENANT
                    </span>
                    
                    <div
                      onClick={() => triggerPrefill(selectedRole)}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer transition-all flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">Use Template Credentials</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {selectedRole === Role.ADMIN && "admin@hillside.edu • admin123"}
                          {selectedRole === Role.TEACHER && "teacher@hillside.edu • teacher123"}
                          {selectedRole === Role.STUDENT && "9A-01 • student123"}
                          {selectedRole === Role.PARENT && "dad@aarav.com • parent123"}
                        </p>
                      </div>
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
