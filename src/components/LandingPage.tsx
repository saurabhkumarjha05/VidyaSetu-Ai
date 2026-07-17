import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Users,
  Database,
  Lock,
  MessageSquare,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Send,
  Heart,
  Calendar,
  Layers,
  ClipboardList,
  Fingerprint,
  ChevronDown,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Active showcase screen tab
  const [activePreviewTab, setActivePreviewTab] = useState<"ADMIN" | "TEACHER" | "PARENT" | "STUDENT">("ADMIN");

  const faqs = [
    {
      q: "How does the school registration and verification workflow operate?",
      a: "Newly registered schools submit their board affiliation documents, principal identities, and administrator credentials. Once our platform board conducts regulatory background verification (typically under 24 hours), the school workspace is provisioned, and the admin receives credentials to trigger the Onboarding Setup Wizard."
    },
    {
      q: "How does the Setup Wizard assist new institutions?",
      a: "First-time School Administrators are guided through a structured 10-step checklist to configure their entire educational framework: from defining classes, sections, and academic calendars, to enrolling teachers, students, parents, and assigning timetable schedules."
    },
    {
      q: "Is there any default/demo student information loaded for brand new schools?",
      a: "No. In accordance with strict data compliance policies, all newly approved school workspaces start completely empty. Real rosters must be entered or imported via the admin dashboard before analytical indicators, attendance records, or homework logs begin computing."
    },
    {
      q: "How does VidyaSetu safeguard student personal data?",
      a: "VidyaSetu is built with robust cross-tenant isolation and data protection practices. Our multi-tenant architecture implements rigorous header-based schema isolation and strict role-based access controls (RBAC), ensuring that no cross-tenant reading occurs. All metrics are fully compliant with India's DPDP Act."
    },
    {
      q: "Can parents communicate directly with teachers via the workspace?",
      a: "Yes. The Parent Portal includes a centralized communications center, letting guardians consult Mrs. Shastri or any assigned faculty member. Parents receive automated SMS and WhatsApp notices for instant, real-time safety alerts or attendance anomalies."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactSuccess(false);
    }, 4000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess(true);
    setTimeout(() => {
      setNewsletterEmail("");
      setNewsletterSuccess(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* 1. TOP PREMIUM NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-slate-950 tracking-tight text-lg">VidyaSetu AI</span>
                <span className="px-1.5 py-0.5 text-[8px] font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-100 uppercase font-mono">
                  OS v2.5
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">India's Cognitive School Engine</p>
            </div>
          </div>

          {/* Center Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#preview" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Portals Preview</a>
            <a href="#security" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Security & DPDP</a>
            <a href="#faq" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">FAQ</a>
            <a href="#contact" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Contact</a>
          </nav>

          {/* Right Action Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 transition-all"
            >
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
            >
              Register New School <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger menu */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onLoginClick}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 px-3 py-1.5 transition-all"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 space-y-6 lg:hidden flex flex-col justify-between pb-8">
          <nav className="flex flex-col gap-6 text-sm font-semibold text-slate-700">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 transition-colors">Portals Preview</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 transition-colors">Security & DPDP</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 transition-colors">FAQ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
              className="w-full py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all text-center"
            >
              School Portal Login
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onRegisterClick(); }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              Register New School <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-[#F7F8FC] to-white">
        
        {/* Subtle glowing mesh backdrop */}
        <div className="absolute inset-0 bg-radial-at-t from-indigo-50/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-100/30 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-8">
          
          {/* Badge indicator */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white text-indigo-700 rounded-full border border-indigo-50 text-[10px] font-bold uppercase tracking-wider font-mono shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> 
            One AI Platform connecting Schools, Teachers, Parents and Students
          </motion.div>

          {/* Big Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-display font-extrabold text-slate-950 tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            Empower Your School with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
              India's First Cognitive AI OS
            </span>
          </motion.h1>

          {/* Core Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            VidyaSetu is a secure, multi-tenant administrative engine and student wellness system that integrates formative academic rosters with real-time feedback loops and Gemini intelligence.
          </motion.p>

          {/* Clean Enterprise Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4"
          >
            <button
              onClick={onLoginClick}
              className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg active:scale-97 transition-all flex items-center justify-center gap-1.5"
            >
              School Portal Login <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto py-3 px-8 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all shadow-xs flex items-center justify-center"
            >
              Register New School
            </button>
          </motion.div>

          {/* Quick stats / trust points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto"
          >
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-left">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Tenant Isolation</span>
              </div>
              <p className="text-xs font-bold text-slate-900">Secure Sandboxing</p>
              <p className="text-[10px] text-slate-400 mt-1">Multi-Tenant database architectures protect administrative workspaces strictly.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-left">
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <Heart className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Empathy First</span>
              </div>
              <p className="text-xs font-bold text-slate-900">Continuous Wellness</p>
              <p className="text-[10px] text-slate-400 mt-1">Tracks student fatigue metrics and morale levels to prevent academic stress.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-left">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">AI Diagnostics</span>
              </div>
              <p className="text-xs font-bold text-slate-900">Grounded Gemini</p>
              <p className="text-[10px] text-slate-400 mt-1">Synthesizes roster data to suggest custom strategic evaluation pathways.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-left">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Fingerprint className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Compliance</span>
              </div>
              <p className="text-xs font-bold text-slate-900">DPDP Ready</p>
              <p className="text-[10px] text-slate-400 mt-1">Built to comply natively with India's digital personal data protection frameworks.</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. BENTO GRID FEATURES SHOWCASE */}
      <section id="features" className="py-20 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">System Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              An AI-First Suite Built For Excellence
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
              Ditch outdated systems. VidyaSetu AI leverages deep language modeling to automate administration and secure child development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: AI Study Coach */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="p-2.5 bg-indigo-500 text-white rounded-xl w-fit">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">AI Study Coach & Tutor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students access Vidya 24/7. Grounded in their school’s approved textbook syllabus, she guides them through difficult algebra assignments, schedules revisions, and runs mock practices without home-bound pressure.
              </p>
            </div>

            {/* Box 2: Attendance Automation */}
            <div className="bg-gradient-to-br from-[#FCF5F5] to-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl w-fit">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">RFID Attendance Anomaly Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect hardware sensors or digital sign-ins. Parents and principals receive instant SMS or WhatsApp notices if a pupil misses the morning roll-call, providing transparent and real-time campus safety checks.
              </p>
            </div>

            {/* Box 3: Holistic Well-being */}
            <div className="bg-gradient-to-br from-emerald-50/40 to-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="p-2.5 bg-emerald-500 text-white rounded-xl w-fit">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Continuous Student Morale Logs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We believe education must be empathetic. Pupils log daily mood ratings. If a student’s morale index experiences sudden declines, teachers receive counseling diagnostics to coordinate supportive interventions.
              </p>
            </div>

            {/* Box 4: Multi-Tenant Architecture */}
            <div className="bg-slate-50/60 border border-slate-100 p-6 rounded-2xl md:col-span-2 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl w-fit">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Isolated Multi-Tenant Ledger Engine</h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">ENTERPRISE SAAS STANDARDS</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                No data is ever leaked. VidyaSetu leverages a highly secure multi-tenant architecture. School codes (e.g., <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-bold font-mono text-[10px]">VIDYA-99</code>) act as isolated cryptographic sandboxes. Administrator credentials, parent registries, and teacher scorecards are verified strictly within headers, preventing any cross-tenant data leaks.
              </p>
            </div>

            {/* Box 5: Document Locker */}
            <div className="bg-gradient-to-br from-amber-50/40 to-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Institutional Document Locker</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Store registration certificates, CBSE permits, local recognition documents, and staff contracts in highly encrypted cloud servers, instantly reviewable during Super Admin platform checks.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. DYNAMIC INTERACTIVE PORTALS PREVIEW SECTION */}
      <section id="preview" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Interactive Previews</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight">
              A Unified Interface for Every Member
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
              Explore custom mockup screens representing the clean, high-contrast dashboards designed for school administrators, faculty, parents, and students.
            </p>
          </div>

          {/* Interactive Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {[
              { id: "ADMIN", label: "School Admin", icon: Database },
              { id: "TEACHER", label: "Teacher Portal", icon: BookOpen },
              { id: "PARENT", label: "Parent CRM", icon: Heart },
              { id: "STUDENT", label: "Student Hub", icon: Brain }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Showcase visual card */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header top bar simulating a real browser */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 text-white font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" />
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" />
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                <span className="text-slate-500 font-semibold ml-2">vidyasetu-os.in/workspace/VIDYA-99</span>
              </div>
              <div className="text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>Isolated Workspace • SSL SECURE</span>
              </div>
            </div>

            {/* Display Simulated Screens based on Active Tab */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {activePreviewTab === "ADMIN" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">Hillside Academy (Delhi NCR)</span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">Superintendent Operations Console</h3>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      Roster Status: <span className="text-emerald-600 font-bold">Active</span>
                    </div>
                  </div>

                  {/* Simulated Metrics widgets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Enrollment</span>
                      <span className="text-lg font-black text-slate-900">1,245</span>
                      <span className="text-[9px] text-emerald-600 font-bold block mt-1">↑ 4% this term</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Faculty Count</span>
                      <span className="text-lg font-black text-slate-900">62</span>
                      <span className="text-[9px] text-indigo-600 font-bold block mt-1">Full-time standard</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Avg Attendance</span>
                      <span className="text-lg font-black text-slate-900">94.2%</span>
                      <span className="text-[9px] text-emerald-600 font-bold block mt-1">Stable index</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Morale Rating</span>
                      <span className="text-lg font-black text-slate-900">4.1 / 5.0</span>
                      <span className="text-[9px] text-rose-500 font-bold block mt-1">Optimized wellness</span>
                    </div>
                  </div>

                  {/* Simulated Activity logs */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-2">Central Security Audit Ledger</span>
                    <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
                      <p className="flex justify-between border-b border-white pb-1">
                        <span>🛡 Reset secondary admin password protocol</span>
                        <span className="font-mono text-slate-400">10:14:22 AM • IP 192.168.1.45</span>
                      </p>
                      <p className="flex justify-between border-b border-white pb-1">
                        <span>📝 Synchronized standard 9 Calculus exam scorecards</span>
                        <span className="font-mono text-slate-400">09:30:15 AM • Mr. Shastri</span>
                      </p>
                      <p className="flex justify-between">
                        <span>📡 Dispatched RFID morning roll-call alerts</span>
                        <span className="font-mono text-slate-400">08:15:00 AM • System Gateway</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "TEACHER" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">Standard 9-A Classroom</span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">Mrs. Shastri • Academic Roster Registry</h3>
                    </div>
                    <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-bounce" /> Trigger Gemini Diagnostic
                    </button>
                  </div>

                  {/* Student list simulated table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs text-slate-700">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 font-bold text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-4">Student Name</th>
                          <th className="py-2.5 px-2">Roll Number</th>
                          <th className="py-2.5 px-2">Math Score</th>
                          <th className="py-2.5 px-2">Morale Status</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="font-medium divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-900">Aarav Sharma</td>
                          <td className="py-2.5 px-2 font-mono text-slate-400">9A-01</td>
                          <td className="py-2.5 px-2 font-bold text-slate-900">98 / 100</td>
                          <td className="py-2.5 px-2"><span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded font-bold text-[10px]">Stress Alert</span></td>
                          <td className="py-2.5 px-4 text-right"><span className="text-indigo-600 font-bold text-[11px] cursor-pointer hover:underline">Configure Advice</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-bold text-slate-900">Priya Patel</td>
                          <td className="py-2.5 px-2 font-mono text-slate-400">9A-02</td>
                          <td className="py-2.5 px-2 font-bold text-slate-900">62 / 100</td>
                          <td className="py-2.5 px-2"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold text-[10px]">Excelsior</span></td>
                          <td className="py-2.5 px-4 text-right"><span className="text-indigo-600 font-bold text-[11px] cursor-pointer hover:underline">Configure Advice</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Simulated advice dialog */}
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-2.5 text-left text-[11px]">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-indigo-900">Gemini Intervention Strategy Dispatched</p>
                      <p className="text-indigo-800/80 mt-0.5">"Aarav Sharma shows high cognitive scoring but sudden wellbeing fatigue. Advised to bypass homework deadline extensions and allocate self-paced practices."</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === "PARENT" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-mono font-bold">Parent Guardian Account</span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">Child Roster: Aarav Sharma (Grade 9)</h3>
                    </div>
                    <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 flex items-center gap-1">
                      <Heart className="w-3 h-3 animate-pulse" /> Linked Parent Account
                    </div>
                  </div>

                  {/* Attendance and marks grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-left">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Daily Attendance Log</span>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">Roll Status Today:</span>
                        <span className="font-bold text-emerald-600">Present (08:04 AM)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[95%]" />
                      </div>
                      <p className="text-[10px] text-slate-400">Total present days: 43 / 45 (95.5%)</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-left">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Latest Academic Marks</span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-600">Mathematics (UT1)</span>
                          <span className="font-bold text-slate-800">95 / 100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-600">Quarterly Evaluation</span>
                          <span className="font-bold text-slate-800">98 / 100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comms helper */}
                  <div className="border border-slate-100 p-4 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <span>Mrs. Shastri sent 1 private counseling remark</span>
                    </div>
                    <button className="text-[11px] bg-white text-indigo-600 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50 font-bold">
                      Open Messenger
                    </button>
                  </div>
                </div>
              )}

              {activePreviewTab === "STUDENT" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">Interactive Learning Desk</span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">Welcome back, Aarav!</h3>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                      Streak: 🔥 5 Days
                    </span>
                  </div>

                  {/* Study and coach widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Mood Tracker Widget */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-left">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Daily Morale Log</span>
                      <p className="text-xs font-semibold text-slate-700">How is your study pace today?</p>
                      <div className="flex justify-between gap-1">
                        {["😞", "😐", "🙂", "😊", "🤩"].map((emoji, idx) => (
                          <button key={idx} className={`text-sm p-1.5 rounded-lg border border-slate-200 bg-white hover:scale-110 transition-all ${idx === 3 ? "border-indigo-500 bg-indigo-50/20" : ""}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive chatbot preview */}
                    <div className="sm:col-span-2 p-4 bg-purple-950 text-white rounded-xl space-y-3 text-left shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 bg-purple-800/20 blur-xl rounded-full" />
                      <div className="flex items-center gap-2 relative z-10">
                        <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
                        <span className="text-[10px] font-mono font-bold text-purple-200">VIDYA STUDY ASSISTANT</span>
                      </div>
                      <p className="text-[11px] text-purple-100 font-medium relative z-10 leading-relaxed">
                        "Would you like me to generate practice questions for standard 9 Mathematics Chapter 3 (Quadratic Formulas)?"
                      </p>
                      <div className="flex gap-2 relative z-10">
                        <button className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-lg transition-all">Yes, start practice</button>
                        <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-bold rounded-lg transition-all">Explain first</button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 5. PRIVACY, SECURITY, & DPDP ACT COMPLIANCE */}
      <section id="security" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              <Shield className="w-3.5 h-3.5" /> DPDP Compliance Certified
            </div>
            <h2 className="text-3xl font-display font-extrabold text-slate-950 tracking-tight leading-none">
              Rigorous Security for Personal Student Data
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We understand that child academic records and mental wellness trackers are highly sensitive. VidyaSetu implements state-of-the-art cryptographic safeguards and operates in strict alignment with India's Digital Personal Data Protection (DPDP) Act of 2023.
            </p>

            <div className="space-y-3.5">
              <div className="flex gap-3">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-full h-fit"><CheckCircle className="w-4 h-4" /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cryptographic Tenant Sandbox</h4>
                  <p className="text-[11px] text-slate-400">Strict header enforcement ensures each school operates in total memory isolation.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-full h-fit"><CheckCircle className="w-4 h-4" /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Consent-Driven Wellness Logs</h4>
                  <p className="text-[11px] text-slate-400">Moral observations are locked strictly behind verified school counselor permissions.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-full h-fit"><CheckCircle className="w-4 h-4" /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero Public Discoverability</h4>
                  <p className="text-[11px] text-slate-400">Super administrators can only be logged in via hidden internal administrative routes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg text-left">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <LockKeyhole className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="text-xs font-bold font-mono">ENCRYPTION & AUDIT STANDARD</h4>
                <p className="text-[9px] text-slate-500">REALTIME MONITORING ACTIVATED</p>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Data Protection Officer</span>
                <span className="text-indigo-400 font-bold">DP-Officer@vidyasetu.ai</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Access Logs:</span>
                <span className="text-emerald-500 font-bold">Active Logging</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Syllabus Grounding Mode:</span>
                <span className="text-indigo-400 font-bold">Isolated Embedding context</span>
              </div>
              <div className="flex justify-between">
                <span>DPDP Act (India):</span>
                <span className="text-emerald-500 font-bold">Compliant Ledger</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[9px] text-slate-400 leading-normal">
                No third-party trackers are authorized. VidyaSetu never resells pupil metrics or uses child profiles for advertisement targeting.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FAQ DESK */}
      <section id="faq" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">FAQ Desk</span>
            <h2 className="text-3xl font-display font-extrabold text-slate-950">
              Regulatory & Operational FAQs
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Find technical answers regarding multi-tenant setups, approved school onboarding calendars, and student wellbeing security.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left font-display font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-indigo-600 font-mono text-lg">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. CONTACT SALES & INTEGRATIONS */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="md:col-span-1 space-y-4 text-left">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Connect</span>
            <h2 className="text-2xl font-display font-extrabold text-slate-950 leading-tight">
              Get in touch with our institutional support team
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Do you represent a Multi-school administrative trust, a CBSE institution, or want custom hardware RFID routing help? Our education success team is ready to map your integration.
            </p>
            <div className="space-y-3 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>support@vidyasetu.ai</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>+91 (11) 4505-SETU</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>AI Core Park, Sector 62, Noida, India</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#F8FAFC] border border-slate-200/50 p-6 rounded-2xl shadow-xs">
            <h3 className="font-display font-bold text-sm text-slate-900 mb-4 uppercase font-mono tracking-wider">Request Integration Consultation</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Principal/Admin Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Principal Shastri"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-indigo-500"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Official School Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. admin@school.edu"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Your Query Description</label>
                <textarea
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can VidyaSetu OS help support your classrooms?"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-indigo-500 h-24 resize-none"
                />
              </div>

              {contactSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Thank you! Your inquiry has been logged. Our board will contact you shortly.
                </div>
              ) : (
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Submit Consultation Request
                </button>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* 8. DETAILED PREMIUM DARK FOOTER (#0B0B0F) */}
      <footer className="bg-[#0B0B0F] text-slate-400 pt-16 pb-8 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main Footer layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            
            {/* Logo Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="font-display font-black text-white tracking-tight text-lg">VidyaSetu AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                VidyaSetu is India's premier enterprise-grade cognitive school operating system, sandboxing administrative data isolates and securing emotional wellness.
              </p>
              
              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap gap-2 text-[9px] font-mono text-slate-500">
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                  🔒 DPDP COMPLIANT
                </span>
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                  🛡 ISO 27001 ISOLATION
                </span>
              </div>
            </div>

            {/* Column 1: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest font-mono">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#preview" className="hover:text-white transition-colors">AI Study Coach</a></li>
                <li><a href="#preview" className="hover:text-white transition-colors">Attendance Logs</a></li>
                <li><a href="#preview" className="hover:text-white transition-colors">Homework Engine</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Communication CRM</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">DPDP Security</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ Desk</a></li>
              </ul>
            </div>

            {/* Column 2: For Schools */}
            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest font-mono">For Schools</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={onRegisterClick} className="hover:text-white text-left transition-colors">Register New School</button></li>
                <li><button onClick={onLoginClick} className="hover:text-white text-left transition-colors">School Portal Login</button></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Setup Wizard Guide</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Roster Templates</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">DPDP Policy Book</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Consult Support</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest font-mono">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#contact" className="hover:text-white transition-colors">About VidyaSetu</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Cognitive Vision</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Data Safety Charter</a></li>
                <li><span className="text-slate-600 cursor-not-allowed">Careers (Coming Soon)</span></li>
              </ul>
            </div>

            {/* Column 4: Contact & Newsletter */}
            <div className="space-y-4 col-span-1">
              <div className="space-y-2">
                <h4 className="text-white text-xs font-bold uppercase tracking-widest font-mono">Platform Contact</h4>
                <p className="text-[11px] text-slate-500">Response expectancy: Under 3 hours</p>
                <p className="text-xs text-slate-300 font-semibold">support@vidyasetu.ai</p>
              </div>

              {/* Newsletter subscribe */}
              <div className="space-y-2 pt-1">
                <h4 className="text-white text-[10px] font-bold uppercase tracking-widest font-mono">Platform Newsletter</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-1">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Principal Email"
                    className="p-2 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded-lg focus:outline-none w-full"
                  />
                  <button type="submit" className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shrink-0">
                    <Send className="w-3 h-3" />
                  </button>
                </form>
                {newsletterSuccess && (
                  <p className="text-[10px] text-emerald-500 font-semibold">Subscription finalized!</p>
                )}
              </div>
            </div>

          </div>

          <hr className="border-slate-900" />

          {/* Socials & bottom credits */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              {/* Monochrome Rounded Social Links */}
              {["X", "LinkedIn", "YouTube", "GitHub"].map((sc) => (
                <span
                  key={sc}
                  className="w-7 h-7 bg-slate-900 border border-slate-800/80 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 hover:scale-105 transition-all cursor-pointer font-bold font-mono text-[9px]"
                >
                  {sc[0]}
                </span>
              ))}
            </div>
            
            <p className="font-mono text-[10px] uppercase text-slate-600">
              AI Powered • Secure • Multi-Tenant • Made in India 🇮🇳
            </p>

            <div className="text-right text-slate-600 font-mono text-[10px]">
              <p>© 2026 VidyaSetu AI. All rights reserved.</p>
              <p className="mt-0.5 text-slate-500">Stable release v2.5.4</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
