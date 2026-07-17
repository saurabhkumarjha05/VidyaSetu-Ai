import React, { useState, useEffect } from "react";
import { User, Role } from "../types";
import { useSocket } from "../lib/socket";
import {
  Brain, Shield, Sliders, Database, LayoutDashboard, Key,
  Search, Bell, Plus, ChevronRight, MessageSquare, Activity,
  Clock, FileText, Send, UserCheck, HardDrive, RefreshCw,
  HelpCircle, UserX, ShieldCheck, X, Menu, CheckCircle, AlertTriangle,
  FileCheck, Cpu, ArrowUpRight, Check, Ban
} from "lucide-react";

interface SuperAdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface SchoolWorkspace {
  id: string;
  name: string;
  registeredAt: string;
  status: "Active" | "Pending" | "Suspended";
  adminEmail: string;
  documentUrl?: string;
}

interface SupportTicket {
  id: string;
  schoolName: string;
  subject: string;
  message: string;
  status: "Open" | "Resolved";
  createdAt: string;
  reply?: string;
}

interface PlatformAnalytics {
  cpuUsage: number;
  memoryUsage: number;
  activeSockets: number;
  storageUsed: string;
  storageLimit: string;
  totalSchools: number;
  activeSchools: number;
  pendingSchools: number;
  totalStudents: number;
  totalNotices: number;
}

type TabType = "DASHBOARD" | "SCHOOLS" | "TICKETS" | "NOTICES" | "AUDIT" | "SECURITY";

export default function SuperAdminDashboard({ user, onLogout }: SuperAdminDashboardProps) {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Platform Registers Data
  const [schools, setSchools] = useState<SchoolWorkspace[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Forms State
  const [isNewSchoolOpen, setIsNewSchoolOpen] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({ id: "", name: "", adminEmail: "" });
  const [schoolFormError, setSchoolFormError] = useState("");
  const [schoolFormSuccess, setSchoolFormSuccess] = useState("");

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState("");

  const [noticeData, setNoticeData] = useState({ title: "", body: "", category: "Circular" });
  const [noticeSuccess, setNoticeSuccess] = useState("");

  // Security Policy State
  const [mfaRequired, setMfaRequired] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("Daily");
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [policySaved, setPolicySaved] = useState(false);

  const fetchPlatformData = async () => {
    try {
      setRefreshing(true);
      // Fetch schools list
      const schoolsRes = await fetch("/api/super/schools", {
        headers: {
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        }
      });
      const schoolsData = await schoolsRes.json();
      if (schoolsData.success) {
        setSchools(schoolsData.schools);
      }

      // Fetch support tickets
      const ticketsRes = await fetch("/api/super/tickets", {
        headers: {
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        }
      });
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setTickets(ticketsData.tickets);
      }

      // Fetch analytics
      const analyticsRes = await fetch("/api/super/analytics", {
        headers: {
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        }
      });
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // Fetch platform activity logs
      const logsRes = await fetch("/api/activity-logs", {
        headers: {
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        }
      });
      const logsData = await logsRes.json();
      if (logsData.success) {
        setAuditLogs(logsData.logs);
      }

    } catch (e) {
      console.error("Error fetching Super Admin data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  // Handle school provisioning
  const handleProvisionSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolFormError("");
    setSchoolFormSuccess("");

    if (!newSchoolData.id || !newSchoolData.name || !newSchoolData.adminEmail) {
      setSchoolFormError("Please enter all required tenant fields.");
      return;
    }

    try {
      const res = await fetch("/api/super/schools/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        },
        body: JSON.stringify(newSchoolData)
      });
      const data = await res.json();
      if (data.success) {
        setSchools(data.schools);
        setSchoolFormSuccess(`Workspace ${newSchoolData.id} provisioned with active super credentials.`);
        setNewSchoolData({ id: "", name: "", adminEmail: "" });
        // Refresh analytics
        fetchPlatformData();
        setTimeout(() => {
          setIsNewSchoolOpen(false);
          setSchoolFormSuccess("");
        }, 1500);
      } else {
        setSchoolFormError(data.error || "Provisioning failed.");
      }
    } catch (err) {
      setSchoolFormError("Network error provisioning school.");
    }
  };

  // Handle status updates (Approve, Reject, Suspend, Activate)
  const handleUpdateSchoolStatus = async (schoolId: string, status: "Active" | "Pending" | "Suspended") => {
    try {
      const res = await fetch("/api/super/schools/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        },
        body: JSON.stringify({ schoolId, status })
      });
      const data = await res.json();
      if (data.success) {
        setSchools(data.schools);
        fetchPlatformData();
      }
    } catch (err) {
      console.error("Error changing school status", err);
    }
  };

  // Handle support tickets reply
  const handleTicketReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReply.trim()) return;

    try {
      const res = await fetch("/api/super/tickets/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        },
        body: JSON.stringify({ ticketId: selectedTicket.id, reply: ticketReply })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        setSelectedTicket(null);
        setTicketReply("");
      }
    } catch (err) {
      console.error("Error replying to ticket", err);
    }
  };

  // Publish Platform-Wide Announcements
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeSuccess("");

    if (!noticeData.title.trim() || !noticeData.body.trim()) {
      return;
    }

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": Role.SUPER_ADMIN,
          "x-user-id": user.id,
          "x-school-code": user.schoolCode
        },
        body: JSON.stringify({
          title: noticeData.title,
          body: noticeData.body,
          category: noticeData.category,
          isGlobal: true // This flags it for all tenants
        })
      });
      const data = await res.json();
      if (data.success) {
        setNoticeSuccess("Platform bulletin successfully broadcasted to all school tenants.");
        setNoticeData({ title: "", body: "", category: "Circular" });
        fetchPlatformData();
        setTimeout(() => setNoticeSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error posting announcement", err);
    }
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 shadow-sm animate-pulse">
          <Brain className="w-8 h-8 text-indigo-600 animate-spin" />
          <div>
            <h1 className="font-display font-bold text-gray-800 leading-tight">VidyaSetu AI Superintendent</h1>
            <p className="text-xs text-indigo-600 font-medium">Authorizing system registers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row relative">
      
      {/* MOBILE HEADER - Only visible on Mobile */}
      <header className="lg:hidden w-full bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-slate-800">VidyaSetu AI</h1>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Platform Team</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchPlatformData()}
            className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* BACKDROP FOR MOBILE MENU */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
        />
      )}

      {/* RESPONSIVE DRAWER SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-full overflow-y-auto transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="p-5 space-y-6">
          {/* Logo & Platform Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-display font-black text-slate-800 leading-none">VidyaSetu AI</h1>
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block font-mono mt-0.5">Platform Team</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Badge */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider font-mono">Operator Identity</span>
            <span className="text-xs font-bold text-gray-800 block truncate">{user.name}</span>
            <span className="text-[9px] text-indigo-600 font-mono font-semibold block">SUPERINTENDENT • v2.4.0</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {[
              { id: "DASHBOARD", label: "Operations Room", icon: LayoutDashboard },
              { id: "SCHOOLS", label: "Tenant Workspaces", icon: Database },
              { id: "TICKETS", label: "Support Desk", icon: HelpCircle },
              { id: "NOTICES", label: "Global Bulletins", icon: FileText },
              { id: "AUDIT", label: "System Audit Logs", icon: Clock },
              { id: "SECURITY", label: "Security & Policy", icon: Shield }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                    isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom operator logout section */}
        <div className="p-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 font-bold font-mono">Cognitive Grid: Secure</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>Platform Sign Out</span>
          </button>
        </div>

      </aside>

      {/* CORE WORKSPACE WINDOW */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* DESKTOP STICKY UPPER HEADER */}
        <header className="hidden lg:flex w-full bg-white border-b border-slate-100 h-16 items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h2 className="text-base font-display font-extrabold text-slate-800">
              {activeTab === "DASHBOARD" && "Platform Operations & System Health"}
              {activeTab === "SCHOOLS" && "Multi-Tenant Workspaces Management"}
              {activeTab === "TICKETS" && "Cross-Tenant Support & Help Desk"}
              {activeTab === "NOTICES" && "Global Bulletin Broadcasting"}
              {activeTab === "AUDIT" && "Platform-Wide Security Audit Logs"}
              {activeTab === "SECURITY" && "Global Tenant Policies & Controls"}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Cognitive platform orchestration node — Central Workspace Console</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchPlatformData()}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Sync Ledger</span>
            </button>

            <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/50 px-3 py-1.5 rounded-xl">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700">All Tenancies Active</span>
            </div>
          </div>
        </header>

        {/* REAL-TIME CONTENT WINDOW */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* TAB 1: OPERATIONS DASHBOARD (BENTO HEALTH) */}
          {activeTab === "DASHBOARD" && analytics && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Core metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Provisioned Schools</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800 leading-none">{analytics.totalSchools}</span>
                    <span className="text-[10px] text-emerald-600 font-bold font-mono">+{schools.filter(s => s.status === "Pending").length} pending</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Live Sockets Connected</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800 leading-none">{analytics.activeSockets}</span>
                    <span className="text-[10px] text-indigo-600 font-bold font-mono">real-time sync</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Total Tracked Students</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800 leading-none">{analytics.totalStudents}</span>
                    <span className="text-[10px] text-slate-400 font-mono">active cohort</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Grid Platform Load</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800 leading-none">{analytics.cpuUsage}%</span>
                    <span className="text-[10px] text-indigo-600 font-bold font-mono">CPU load</span>
                  </div>
                </div>

              </div>

              {/* Bento Grid - Diagnostics, Platform status, Pending requests */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Platform Health & Storage */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-5">
                  <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                    <Activity className="w-4 h-4 text-indigo-600" /> Platform Diagnostic Telemetry
                  </h3>

                  <div className="space-y-4">
                    {/* CPU Loading Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">CPU Thread Allocation</span>
                        <span className="text-indigo-600 font-mono">{analytics.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${analytics.cpuUsage}%` }} />
                      </div>
                    </div>

                    {/* RAM Loading Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Virtual RAM Partitioning</span>
                        <span className="text-indigo-600 font-mono">{analytics.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${analytics.memoryUsage}%` }} />
                      </div>
                    </div>

                    {/* Storage Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Tenant Media Drive S3</span>
                        <span className="text-indigo-600 font-mono">{analytics.storageUsed} / {analytics.storageLimit}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: "41.5%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50 border border-indigo-100/50 rounded-xl text-[11px] text-indigo-700 font-semibold space-y-1 leading-snug">
                    <p className="flex items-center gap-1.5 font-bold"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Hypervisor Enforcer Mode: ON</p>
                    <p>All micro-containers are performing within nominal latency thresholds. Isolated multi-tenant schemas are secured by workspace namespaces.</p>
                  </div>
                </div>

                {/* Column 2: Quick Provisioning Workspace */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                      <Database className="w-4 h-4 text-indigo-600" /> Fast Provisioning Core
                    </h3>
                    <p className="text-xs text-slate-400">Instantly deploy a secure sandbox workspace with automated administrator credentials and isolation firewalls.</p>
                  </div>

                  <button
                    onClick={() => setIsNewSchoolOpen(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Deploy Workspace Sandbox
                  </button>
                </div>

                {/* Column 3: Active Platform Tickets */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600" /> Open Operator Tickets
                    </h3>
                    <span className="py-0.5 px-2 bg-rose-50 text-rose-600 text-[9px] font-bold rounded-full font-mono border border-rose-100 animate-pulse">
                      {tickets.filter(t => t.status === "Open").length} Pending
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[190px] overflow-y-auto">
                    {tickets.filter(t => t.status === "Open").map(t => (
                      <div 
                        key={t.id}
                        onClick={() => {
                          setSelectedTicket(t);
                          setActiveTab("TICKETS");
                        }}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-800">{t.schoolName}</span>
                          <span className="text-[8px] font-bold uppercase text-slate-400 font-mono">{t.createdAt.split("T")[0]}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate">{t.subject}</p>
                      </div>
                    ))}
                    {tickets.filter(t => t.status === "Open").length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400 font-bold">
                        All operator support tickets resolved.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Lower Section: Active Tenants status overview */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800">Workspace Namespace Registry</h3>
                    <p className="text-[10px] text-slate-400">Overview of all active and pending school database partitions</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("SCHOOLS")}
                    className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
                  >
                    View All Tenants <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Adaptive Table to stacked cards on mobile */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] font-mono border-b border-slate-100">
                        <th className="py-3 px-5">Workspace ID</th>
                        <th className="py-3 px-5">School Name</th>
                        <th className="py-3 px-5">Admin Email</th>
                        <th className="py-3 px-5">Registered On</th>
                        <th className="py-3 px-5">Isolation Security</th>
                        <th className="py-3 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {schools.slice(0, 3).map((school) => (
                        <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 font-mono text-indigo-600 font-bold">{school.id}</td>
                          <td className="py-3 px-5 font-bold text-gray-800">{school.name}</td>
                          <td className="py-3 px-5 text-slate-500 font-mono">{school.adminEmail}</td>
                          <td className="py-3 px-5 text-slate-400">{school.registeredAt}</td>
                          <td className="py-3 px-5">
                            <span className="inline-flex items-center gap-1 py-0.5 px-2 bg-indigo-50 border border-indigo-100 rounded-full text-[9px] font-bold text-indigo-700 font-mono">
                              <ShieldCheck className="w-3 h-3" /> Isolated Schema
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <span className={`inline-flex py-0.5 px-2 text-[9px] font-bold rounded-full font-mono ${
                              school.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                              school.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}>
                              {school.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile version of namespace register */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {schools.slice(0, 3).map((school) => (
                    <div key={school.id} className="p-4 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-indigo-600 font-bold text-xs">{school.id}</span>
                        <span className={`inline-flex py-0.5 px-2 text-[9px] font-bold rounded-full font-mono ${
                          school.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          school.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {school.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-800">{school.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{school.adminEmail}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TENANT WORKSPACES */}
          {activeTab === "SCHOOLS" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-800">Workspace Directory</h3>
                  <p className="text-xs text-slate-400">Approve new registrations, manage API limits, and configure tenant suspensions</p>
                </div>
                <button
                  onClick={() => setIsNewSchoolOpen(true)}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4.5 h-4.5" /> Deploy New Workspace
                </button>
              </div>

              {/* Tenants Grid/List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <div key={school.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-mono font-bold py-0.5 px-2 bg-indigo-50 border border-indigo-100 rounded text-indigo-700">{school.id}</span>
                        <span className={`inline-flex py-0.5 px-2 text-[9px] font-bold rounded-full font-mono ${
                          school.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          school.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {school.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">{school.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{school.adminEmail}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Provisioned: {school.registeredAt}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-50 space-y-1.5 text-[10px] text-slate-500 font-semibold font-mono">
                        <div className="flex justify-between">
                          <span>Db Schema Isolation:</span>
                          <span className="text-indigo-600">Active PG-Namespace</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API Endpoint Firewall:</span>
                          <span className="text-indigo-600">Strict Auth Headers</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                      {school.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => handleUpdateSchoolStatus(school.id, "Active")}
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateSchoolStatus(school.id, "Suspended")}
                            className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-100 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : school.status === "Active" ? (
                        <button
                          onClick={() => handleUpdateSchoolStatus(school.id, "Suspended")}
                          className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-100 transition-all flex items-center justify-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> Suspend Workspace
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateSchoolStatus(school.id, "Active")}
                          className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 transition-all flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Re-Activate Workspace
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TICKETS */}
          {activeTab === "TICKETS" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">Support tickets</h3>
                <p className="text-xs text-slate-400">Resolve tenant configuration queries, administrative lockouts, and subscription tier adjustments</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Tickets List */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                  <h4 className="font-display font-bold text-sm text-slate-800 pb-2 border-b border-slate-50">Support Request Queue</h4>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {tickets.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all space-y-2 ${
                          selectedTicket?.id === t.id 
                            ? "bg-indigo-50/50 border-indigo-200 shadow-xs" 
                            : "bg-slate-50 hover:bg-slate-100 border-slate-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-gray-800">{t.schoolName}</span>
                          <span className={`py-0.5 px-2 text-[8px] font-bold rounded-full font-mono ${
                            t.status === "Open" ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{t.subject}</p>
                          <p className="text-[11px] text-slate-400 truncate">{t.message}</p>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
                          <span>{t.id}</span>
                          <span>{t.createdAt.split("T")[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Reply Box */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
                  {selectedTicket ? (
                    <div className="space-y-6 h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-indigo-600">{selectedTicket.id}</span>
                            <h4 className="font-bold text-sm text-slate-800">{selectedTicket.subject}</h4>
                            <p className="text-xs text-slate-400 font-bold">{selectedTicket.schoolName}</p>
                          </div>
                          <span className="text-xs font-mono text-slate-400">{selectedTicket.createdAt.split("T")[0]}</span>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">"{selectedTicket.message}"</p>
                        </div>

                        {selectedTicket.reply && (
                          <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl space-y-1">
                            <span className="text-[9px] uppercase font-bold text-emerald-600 font-mono tracking-wider block">Official Reply Sent</span>
                            <p className="text-xs text-emerald-800 font-medium">"{selectedTicket.reply}"</p>
                          </div>
                        )}
                      </div>

                      {selectedTicket.status === "Open" ? (
                        <form onSubmit={handleTicketReplySubmit} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Operator Reply</label>
                            <textarea
                              rows={3}
                              required
                              value={ticketReply}
                              onChange={(e) => setTicketReply(e.target.value)}
                              placeholder="Write your resolution reply..."
                              className="w-full text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Resolve & Close Ticket
                          </button>
                        </form>
                      ) : (
                        <div className="py-2.5 px-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Ticket has been successfully resolved.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
                      <MessageSquare className="w-12 h-12 text-slate-200" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-500">No Ticket Selected</h4>
                        <p className="text-[10px] text-slate-400">Click any support request from the queue to draft and dispatch a resolution.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: BULLETINS */}
          {activeTab === "NOTICES" && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">Global Announcements</h3>
                <p className="text-xs text-slate-400">Broadcast platform system advisories, feature updates, or maintenance notes globally to all registered workspaces</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Announcement Creator */}
                <form onSubmit={handlePublishAnnouncement} className="md:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="font-display font-bold text-sm text-slate-800 pb-2 border-b border-slate-50">Publish Global Broadcast</h4>
                  
                  {noticeSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> {noticeSuccess}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Notice Category</label>
                    <select
                      value={noticeData.category}
                      onChange={(e) => setNoticeData({ ...noticeData, category: e.target.value })}
                      className="text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl w-full font-bold focus:outline-none"
                    >
                      <option value="Circular">General Circular</option>
                      <option value="Event">Platform Event</option>
                      <option value="Holiday">System Upgrade</option>
                      <option value="Exam">Important Warning</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Bulletin Title</label>
                    <input
                      type="text"
                      required
                      value={noticeData.title}
                      onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                      placeholder="e.g., Scheduled Database Maintenance & Upgrades"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Notice Description</label>
                    <textarea
                      rows={5}
                      required
                      value={noticeData.body}
                      onChange={(e) => setNoticeData({ ...noticeData, body: e.target.value })}
                      placeholder="Enter detailed global announcement content..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Broadcast Bulletin Now
                  </button>
                </form>

                {/* Real-time Preview */}
                <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                  <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest block">Live Dashboard Preview</span>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="py-0.5 px-2 bg-indigo-500/15 text-indigo-300 text-[8px] font-black uppercase font-mono rounded border border-indigo-500/20">
                        {noticeData.category}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono font-bold">TODAY</span>
                    </div>

                    <h4 className="font-display font-extrabold text-base text-white tracking-tight leading-snug">
                      {noticeData.title || "Untitled Platform Bulletin"}
                    </h4>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {noticeData.body || "Detailed bulletin text will be mirrored here. Global broadcasts will instantly appear on Student, Parent, Teacher, and School Admin workspaces."}
                    </p>

                    <div className="flex items-center gap-2 pt-6 border-t border-slate-800 text-[10px] text-slate-400 font-mono font-bold">
                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ISSUER: VIDYASETU PLATFORM CORE</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === "AUDIT" && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-800">Platform Audit Trails</h3>
                  <p className="text-xs text-slate-400">Chronological immutable safety records for all schools, tenants, and security updates</p>
                </div>
                <div className="py-1 px-2.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold font-mono">
                  IMMUTABLE LEDGER MODE
                </div>
              </div>

              {/* Logs chronological list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Operational Log Streams</span>
                </div>

                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto pr-1">
                  {auditLogs.map((log, idx) => (
                    <div key={log.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-xl ${
                          log.type === "SOS" ? "bg-rose-50 text-rose-600" :
                          log.type === "ANNOUNCEMENT" ? "bg-indigo-50 text-indigo-600" :
                          "bg-slate-50 text-slate-500"
                        }`}>
                          <Sliders className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{log.title}</p>
                          <p className="text-slate-500 font-medium text-[11px]">{log.description}</p>
                          <div className="flex gap-2 text-[9px] text-slate-400 font-mono font-semibold mt-1">
                            <span>Actor: {log.actor}</span>
                            <span>•</span>
                            <span>Workspace: {log.schoolCode || "GLOBAL"}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold sm:text-right shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs">
                      No operational logs loaded. Try executing active database modifications.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY POLICIES */}
          {activeTab === "SECURITY" && (
            <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-800">Security Policies & Features</h3>
                <p className="text-xs text-slate-400">Configure global tenant workspace firewalls, password criteria, and automated cron frequencies</p>
              </div>

              <form onSubmit={handleSavePolicies} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                <h4 className="font-display font-bold text-sm text-slate-800 pb-2 border-b border-slate-50 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Platform Security Configuration
                </h4>

                {policySaved && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-4 h-4" /> Global security policies synchronized and saved.
                  </div>
                )}

                <div className="space-y-4">
                  
                  {/* MFA Requirement */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">Enforce Multi-Factor Auth (MFA)</span>
                      <span className="text-[10px] text-slate-400 block">Require MFA verification for School Admins & Platform Team logins</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={mfaRequired} 
                        onChange={(e) => setMfaRequired(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Backup Schedules */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Automated DB Backup Cron</label>
                      <select
                        value={backupSchedule}
                        onChange={(e) => setBackupSchedule(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                      >
                        <option value="Hourly">Every Hour (Enterprise Tier)</option>
                        <option value="Daily">Daily Scheduled (Default)</option>
                        <option value="Weekly">Weekly Scheduled</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Password Complexity (Min Length)</label>
                      <input
                        type="number"
                        min={6}
                        max={16}
                        value={passwordMinLength}
                        onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100/50 rounded-2xl space-y-1.5 text-[11px] text-indigo-700 font-semibold leading-relaxed">
                    <span className="flex items-center gap-1 font-bold"><Key className="w-3.5 h-3.5 text-indigo-600" /> Dynamic License Firewalls</span>
                    <p>All client requests must provide the cryptographic School Tenant Token mapped under the <b>x-school-code</b> HTTP header. Any mismatch triggers automated lockout. IP verification is recorded on platform security registers.</p>
                  </div>

                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  Save Global Tenant Policies
                </button>
              </form>
            </div>
          )}

        </div>

      </main>

      {/* MODAL: PROVISION NEW SCHOOL WORKSPACE */}
      {isNewSchoolOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-800">Deploy School Workspace</h3>
                <p className="text-[10px] text-slate-400">Provision isolated PG namespaces & API firewalls</p>
              </div>
              <button 
                onClick={() => {
                  setIsNewSchoolOpen(false);
                  setSchoolFormError("");
                  setSchoolFormSuccess("");
                }}
                className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {schoolFormError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> {schoolFormError}
              </div>
            )}

            {schoolFormSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> {schoolFormSuccess}
              </div>
            )}

            <form onSubmit={handleProvisionSchool} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Workspace ID / School Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DPS-88, STX-77"
                  value={newSchoolData.id}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, id: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Delhi Public School Core Group"
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Primary Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., superintendent@dps.edu"
                  value={newSchoolData.adminEmail}
                  onChange={(e) => setNewSchoolData({ ...newSchoolData, adminEmail: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4.5 h-4.5" /> Deploy Tenant Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
