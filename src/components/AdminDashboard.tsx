import React, { useState, useEffect } from "react";
import { Student, User } from "../types";
import { useSocket } from "../lib/socket";
import { adminService } from "../services/adminService";
import {
  Brain, Sparkles, Shield, LogOut, Users, TrendingUp, CheckCircle, AlertTriangle,
  ClipboardList, Sliders, Database, Calendar, Lock, Settings, LayoutDashboard,
  Search, Bell, Plus, ChevronDown, ChevronRight, MessageSquare, BookOpen, Layers,
  Activity, Briefcase, Clock, FileText, Send, UserCheck, HardDrive, RefreshCw,
  HelpCircle, UserX, Download, Key, ShieldCheck, Heart, Trash2, Check, CheckCircle2,
  LockKeyhole, MapPin, Phone, Mail, FileUp, X, Menu
} from "lucide-react";

// Import modular sub-components
import AdminStudentsTab from "./AdminStudentsTab";
import AdminTeachersTab from "./AdminTeachersTab";
import AdminCommsTab from "./AdminCommsTab";
import AdminTimetableTab from "./AdminTimetableTab";
import AdminAIAnalyticsTab from "./AdminAIAnalyticsTab";
import SetupWizard from "./SetupWizard";

interface AdminDashboardProps {
  user: User;
  students: Student[];
  onLogout: () => void;
}

type TabType =
  | "DASHBOARD"
  | "STUDENTS"
  | "TEACHERS"
  | "PARENTS"
  | "CLASSES"
  | "SECTIONS"
  | "SUBJECTS"
  | "DEPARTMENTS"
  | "ATTENDANCE"
  | "HOMEWORK"
  | "ASSIGNMENTS"
  | "EXAMINATIONS"
  | "TIMETABLE"
  | "ANNOUNCEMENTS"
  | "SCHOOL_CALENDAR"
  | "REPORTS"
  | "COMMUNICATION"
  | "AI_ANALYTICS"
  | "USER_MANAGEMENT"
  | "ROLES"
  | "DOCUMENTS"
  | "SETTINGS"
  | "AUDIT_LOGS"
  | "BACKUP"
  | "SUPPORT"
  | "PROFILE";

export default function AdminDashboard({ user, students: propStudents, onLogout }: AdminDashboardProps) {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Setup Wizard configuration state
  const [setupCompleted, setSetupCompleted] = useState<boolean>(() => {
    // Legacy/default schools are pre-configured
    if (user.schoolCode === "VIDYA-99" || user.schoolCode === "DPS-88") {
      return true;
    }
    const val = localStorage.getItem(`vidyasetu_setup_completed_${user.schoolCode}`);
    return val === "true";
  });

  const [setupStep, setSetupStep] = useState(1);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Local state for students to allow persistent additions/edits within session
  const [students, setStudents] = useState<Student[]>(propStudents);

  // Sync state for students on updates
  useEffect(() => {
    setStudents(propStudents);
  }, [propStudents]);
  
  // Search state across dashboard
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [selectedBranch, setSelectedBranch] = useState("Main Campus (West)");

  // State for parents list
  const [parents, setParents] = useState([
    { id: "p-01", name: "Rajesh Kumar", email: "rajesh.kumar@gmail.com", phone: "+91 98765 43210", childName: "Aarav Sharma", relationship: "Father", status: "Verified" },
    { id: "p-02", name: "Sunita Patel", email: "sunita.patel@yahoo.com", phone: "+91 91234 56789", childName: "Priya Patel", relationship: "Mother", status: "Verified" },
    { id: "p-03", name: "Gurpreet Singh", email: "g.singh@outlook.com", phone: "+91 98989 89898", childName: "Kabir Singh", relationship: "Father", status: "Verified" },
    { id: "p-04", name: "Minati Sen", email: "m.sen@gmail.com", phone: "+91 97777 66666", childName: "Meera Sen", relationship: "Mother", status: "Verified" }
  ]);

  // Parents CRUD
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [parentFormData, setParentFormData] = useState({ name: "", email: "", phone: "", childName: "", relationship: "Father" });

  // System logs
  const [auditLogs, setAuditLogs] = useState([
    { timestamp: "10:14:22 AM", user: "Principal Office", action: "Initiated secure database backup protocol", ip: "192.168.1.45" },
    { timestamp: "09:30:15 AM", user: "Mr. Ananya Shastri", action: "Synchronized standard 9 Calculus exam scorecards", ip: "192.168.1.101" },
    { timestamp: "08:15:00 AM", user: "System Cron", action: "Dispatched automated RFID attendance anomaly summary", ip: "localhost" }
  ]);

  // Announcement notices state
  const [notices, setNotices] = useState([
    { id: "not-01", title: "Quarterly Evaluation Submissions", body: "Ensure all grade sheets are finalized by tomorrow morning for compliance checks.", date: "2026-07-10", author: "Super Admin", files: "Exam_Syllabus.pdf" }
  ]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");

  // Load notices from central backend
  useEffect(() => {
    adminService.getAnnouncements()
      .then((announcements) => {
        if (announcements.length > 0) {
          const mapped = announcements.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.content,
            date: n.date,
            author: "Super Admin",
            files: "N/A",
          }));
          setNotices(mapped);
        }
      })
      .catch((err) => console.error("Error retrieving administrative announcements:", err));
  }, []);

  // Fetch central security audit logs
  useEffect(() => {
    adminService.getActivityLogs()
      .then((logs) => {
        if (logs.length > 0) {
          const mapped = logs.map((l: any) => ({
            timestamp: new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            user: l.actor || l.triggeredBy,
            action: l.description || l.action,
            ip: "192.168.1.10"
          }));
          setAuditLogs(mapped);
        }
      })
      .catch((err) => console.error("Error retrieving system logs:", err));
  }, [activeTab]);

  // Real-time listeners for logs and notices
  useEffect(() => {
    if (!socket) return;

    const onNoticeNew = (notice: any) => {
      const mapped = {
        id: notice.id,
        title: notice.title,
        body: notice.content,
        date: notice.date,
        author: "Super Admin",
        files: "N/A"
      };
      setNotices((prev) => {
        if (prev.some((n) => n.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    };

    const onActivityNew = (act: any) => {
      const mapped = {
        timestamp: new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        user: act.actor,
        action: act.description,
        ip: "192.168.1.10"
      };
      setAuditLogs((prev) => [mapped, ...prev]);
    };

    socket.on("announcement:new", onNoticeNew);
    socket.on("activity:new", onActivityNew);

    return () => {
      socket.off("announcement:new", onNoticeNew);
      socket.off("activity:new", onActivityNew);
    };
  }, [socket]);

  // User Management lists
  const [users, setUsers] = useState([
    { id: "u-01", name: "Principal Office", username: "admin_principal", role: "ADMIN", status: "Active" },
    { id: "u-02", name: "Mr. Ananya Shastri", username: "teacher_shastri", role: "TEACHER", status: "Active" },
    { id: "u-03", name: "Rajesh Kumar", username: "parent_rajesh", role: "PARENT", status: "Active" },
    { id: "u-04", name: "Aarav Sharma", username: "std_aarav", role: "STUDENT", status: "Active" }
  ]);

  // Roles Matrix Permissions State
  const [permissions, setPermissions] = useState([
    { name: "Manage Enrollments", admin: true, principal: true, teacher: false, parent: false, student: false },
    { name: "Publish Grade Sheets", admin: true, principal: true, teacher: true, parent: false, student: false },
    { name: "Post Global Notices", admin: true, principal: true, teacher: true, parent: false, student: false },
    { name: "Access Financial Ledgers", admin: true, principal: false, teacher: false, parent: false, student: false },
    { name: "View Mood Observations", admin: true, principal: true, teacher: true, parent: true, student: false }
  ]);

  // Documents State
  const [documents, setDocuments] = useState([
    { name: "Registration_Policy_2026.pdf", size: "2.4 MB", type: "PDF", date: "2026-07-01" },
    { name: "Faculty_Evaluation_Form.xlsx", size: "1.2 MB", type: "Excel", date: "2026-07-05" },
    { name: "Intelligent_Wellness_Dossier.docx", size: "840 KB", type: "Word", date: "2026-07-10" }
  ]);

  // Support logs State
  const [tickets, setTickets] = useState([
    { id: "tkt-101", requester: "Sarah Jones (Teacher)", query: "Unable to view grade sheet - Grade 9-A Parent", priority: "Medium", status: "Open" },
    { id: "tkt-102", requester: "Gurpreet Singh (Parent)", query: "RFID login issues at the western entrance", priority: "High", status: "Open" }
  ]);

  // Reports downloader state
  const [reportType, setReportType] = useState("ATTENDANCE");
  const [reportFormat, setReportFormat] = useState("PDF");
  const [isCompilingReport, setIsCompilingReport] = useState(false);

  // Backup state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupLogs, setBackupLogs] = useState<string[]>([]);

  // Calculations for dashboard
  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.attendance.totalDays > 0 ? (s.attendance.presentDays / s.attendance.totalDays * 100) : 100), 0) / totalStudents)
    : 0;

  const avgGrade = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => {
        const studentGrades = s.academics.subjects.flatMap((sub) => sub.grades);
        if (studentGrades.length === 0) return sum + 75; // Default baseline if empty
        const totalScore = studentGrades.reduce((a, g) => a + g.score, 0);
        const totalMax = studentGrades.reduce((a, g) => a + g.maxScore, 0);
        const avg = totalMax > 0 ? (totalScore / totalMax * 100) : 75;
        return sum + avg;
      }, 0) / totalStudents)
    : 0;

  const avgMood = totalStudents > 0
    ? (students.reduce((sum, s) => {
        if (s.wellbeing.moodHistory.length === 0) return sum + 3;
        const avg = s.wellbeing.moodHistory.reduce((a, m) => a + m.rating, 0) / s.wellbeing.moodHistory.length;
        return sum + avg;
      }, 0) / totalStudents).toFixed(1)
    : "3.5";

  // Trigger individual report compiling
  const triggerCompileReport = () => {
    setIsCompilingReport(true);
    setTimeout(() => {
      setIsCompilingReport(false);
      alert(`Success: Compiled ${reportType} report card list in ${reportFormat} format.`);
    }, 2000);
  };

  // Trigger central backup
  const triggerBackup = () => {
    setIsBackingUp(true);
    setBackupLogs(["[1/3] Securing relational database blocks...", "[2/3] Compiling modern index sheets...", "[3/3] Syncing backup to secure encrypted ledger..."]);
    setTimeout(() => {
      setIsBackingUp(false);
      setBackupLogs([]);
      alert("Operational backup stored successfully in encrypted cloud system.");
    }, 3000);
  };

  // Quick notices posting handler
  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) return;

    adminService.createAnnouncement({
      title: noticeTitle,
      content: noticeBody,
      category: "Circular"
    } as any)
      .then(() => {
        setNoticeTitle("");
        setNoticeBody("");
        alert("New announcement posted and pushed to student & parent notification registers.");
      })
      .catch((err) => console.error("Error posting announcement:", err));
  };

  if (!setupCompleted) {
    return (
      <SetupWizard
        user={user}
        onLogout={onLogout}
        onComplete={(newStudents) => {
          setStudents(newStudents);
          setSetupCompleted(true);
          localStorage.setItem(`vidyasetu_setup_completed_${user.schoolCode}`, "true");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row font-sans text-gray-800 relative overflow-x-hidden">
      
      {/* Sidebar mobile overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR (Notion/Stripe dashboard inspired) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-full overflow-y-auto transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 space-y-5">
          
          {/* School branding */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-extrabold text-gray-900 tracking-tight text-xs block">VidyaSetu School OS</span>
                <span className="px-1 py-0.1 text-[8px] font-bold bg-indigo-50 text-indigo-600 rounded uppercase font-mono border border-indigo-100 block mt-0.5">
                  Central Operations Console
                </span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Super Admin Quick card badge */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider font-mono">Operations Office</span>
            <span className="text-xs font-bold text-gray-800 block truncate">{user.name}</span>
            <span className="text-[9px] text-slate-400 font-mono font-semibold block">{user.role} • West Wing</span>
          </div>

          {/* Left Navigation Directory Tree grouped by Context */}
          <div className="space-y-4">
            
            {/* GROUP 1: Core Console */}
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2.5 pb-1 font-mono">Core Console</p>
              
              <button
                onClick={() => setActiveTab("DASHBOARD")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "DASHBOARD" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard Home</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("AI_ANALYTICS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "AI_ANALYTICS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>AI Analytics queue</span>
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full font-mono ${activeTab === "AI_ANALYTICS" ? "bg-white text-indigo-600" : "bg-indigo-50 text-indigo-700"}`}>Intelligent</span>
              </button>
            </div>

            {/* GROUP 2: Registries */}
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2.5 pb-1 font-mono">Registries (CRUD)</p>
              
              <button
                onClick={() => setActiveTab("STUDENTS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "STUDENTS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Students Registry</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{students.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("TEACHERS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "TEACHERS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Teachers Directory</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("PARENTS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "PARENTS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 shrink-0" />
                  <span>Parents CRM</span>
                </span>
              </button>
            </div>

            {/* GROUP 3: Academic Architecture */}
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2.5 pb-1 font-mono">Architecture</p>
              
              <button
                onClick={() => setActiveTab("CLASSES")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "CLASSES" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Classes & Sections</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("SUBJECTS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "SUBJECTS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Subjects & Depts</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("TIMETABLE")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "TIMETABLE" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Visual Timetable</span>
                </span>
              </button>
            </div>

            {/* GROUP 4: Operations & Management */}
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2.5 pb-1 font-mono">Operations</p>

              <button
                onClick={() => setActiveTab("ATTENDANCE")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "ATTENDANCE" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>Attendance Logs</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("HOMEWORK")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "HOMEWORK" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>Homework & Tasks</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("EXAMINATIONS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "EXAMINATIONS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Exams Schedules</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ANNOUNCEMENTS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "ANNOUNCEMENTS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  <span>Announcements</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("DOCUMENTS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "DOCUMENTS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Document Locker</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("REPORTS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "REPORTS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Report Exporter</span>
                </span>
              </button>
            </div>

            {/* GROUP 5: System Admin */}
            <div className="space-y-0.5">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-2.5 pb-1 font-mono">Central System</p>

              <button
                onClick={() => setActiveTab("USER_MANAGEMENT")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "USER_MANAGEMENT" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserX className="w-4 h-4 shrink-0" />
                  <span>User Mappings</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ROLES")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "ROLES" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>RBAC Permissions</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("BACKUP")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "BACKUP" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 shrink-0" />
                  <span>Backup & Restore</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("AUDIT_LOGS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "AUDIT_LOGS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Security Audit Logs</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("SUPPORT")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "SUPPORT" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Helpdesk Tickets</span>
                </span>
                {tickets.filter(t => t.status === "Open").length > 0 && (
                  <span className="bg-rose-500 text-white font-bold font-mono text-[9px] h-4 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                    {tickets.filter(t => t.status === "Open").length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("SETTINGS")}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === "SETTINGS" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-gray-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>System Config</span>
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* LOGOUT STRIP */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out from OS
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN DASHBOARD PORTAL CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4 sticky top-0 z-30 shadow-sm/50">
          
          {/* Logo and Selector panel */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-100 flex items-center justify-center shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="p-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] rounded px-2 uppercase font-mono tracking-wider">West Wing</span>
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-bold text-slate-700 focus:outline-none bg-slate-50 border border-slate-100 p-1.5 rounded-xl"
            >
              <option value="Main Campus (West)">Main Campus (West)</option>
              <option value="East Primary Wing">East Primary Wing</option>
            </select>

            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 p-1.5 rounded-xl focus:outline-none"
            >
              <option value="2026-2027">Term 2026 - 2027</option>
              <option value="2027-2028">Term 2027 - 2028</option>
            </select>
          </div>

          {/* Interactive Global Search & Quick Actions bar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Global Search across registry fields */}
            <div className="relative w-full md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Global searching registry..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && globalSearch.trim()) {
                    alert(`Global Search results for "${globalSearch}": Matched 1 Student (Aarav), 1 Teacher (Shastri). Redirecting to registries.`);
                    setActiveTab("STUDENTS");
                    setGlobalSearch("");
                  }
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-1.5 pl-8 pr-3 text-[11px] focus:outline-none focus:bg-white font-semibold"
              />
            </div>

            {/* Quick Actions Drawer Trigger */}
            <div className="relative">
              <button 
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-100 flex items-center justify-center font-bold text-xs gap-1"
                title="Quick Actions menu"
              >
                <Plus className="w-4 h-4 text-slate-700" /> Quick
              </button>
              {quickActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-40 text-xs">
                  <button 
                    onClick={() => { setActiveTab("STUDENTS"); setQuickActionsOpen(false); }}
                    className="w-full text-left p-2 hover:bg-slate-50 font-bold text-slate-700 rounded-lg"
                  >
                    + Enroll Student
                  </button>
                  <button 
                    onClick={() => { setActiveTab("TEACHERS"); setQuickActionsOpen(false); }}
                    className="w-full text-left p-2 hover:bg-slate-50 font-bold text-slate-700 rounded-lg"
                  >
                    + Appoint Teacher
                  </button>
                  <button 
                    onClick={() => { setActiveTab("ANNOUNCEMENTS"); setQuickActionsOpen(false); }}
                    className="w-full text-left p-2 hover:bg-slate-50 font-bold text-slate-700 rounded-lg"
                  >
                    + Create notice announcement
                  </button>
                </div>
              )}
            </div>

            {/* Professional Messages Top Navbar Link with Unread Badge */}
            <button
              onClick={() => {
                setActiveTab("COMMUNICATION");
                setMobileMenuOpen(false);
              }}
              className={`p-1.5 hover:bg-slate-100 rounded-xl relative transition-all border ${
                activeTab === "COMMUNICATION" ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-50 border-slate-100 text-slate-500"
              }`}
              title="Dedicated Messaging Terminal (3 Unread)"
            >
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-indigo-600 rounded-full border border-white scale-90 flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Simulated Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-100 relative"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-3.5 z-40 text-xs space-y-2.5">
                  <p className="font-bold text-slate-800 border-b border-slate-50 pb-1.5">Administrative Alerts Queue</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <p className="font-bold text-indigo-950">AI Warning: Low Attendance class</p>
                      <p className="text-[10px] text-indigo-700 mt-0.5">Grade 9-A attendance fell below 85% standard.</p>
                    </div>
                    <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                      <p className="font-bold text-amber-950">Audit log trigger: Backup Successful</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">Operational records compiled successfully.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ACTIVE TAB DISPLAY PORTAL CONTAINER */}
        <div className="p-6 lg:p-8 flex-1 space-y-6">
          
          {/* TAB 1: DASHBOARD OVERVIEW HOME */}
          {activeTab === "DASHBOARD" && (
            <div className="space-y-6">
              
              {/* Dynamic Welcome card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">Welcome back, Superintendant Office</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">VidyaSetu School OS is fully compiled and synchronized with attendance matrices.</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> School System Online
                  </span>
                </div>
              </div>

              {/* Central Key stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-100 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Total Pupils Registered</span>
                  <h3 className="text-2xl font-display font-extrabold text-slate-800 mt-1 font-mono">{totalStudents} Pupils</h3>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-1">100% Active Enrolled</span>
                </div>

                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-100 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Average Attendance</span>
                  <h3 className="text-2xl font-display font-extrabold text-slate-800 mt-1 font-mono">{avgAttendance}%</h3>
                  <span className="text-[9px] text-slate-400 block mt-1 font-semibold">Standard target is &gt;90%</span>
                </div>

                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-100 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Academic Mean GPA</span>
                  <h3 className="text-2xl font-display font-extrabold text-slate-800 mt-1 font-mono">{avgGrade}% Mean</h3>
                  <span className="text-[9px] text-indigo-600 font-bold block mt-1">Term 1 grading compiled</span>
                </div>

                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-100 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Wellness Index</span>
                  <h3 className="text-2xl font-display font-extrabold text-slate-800 mt-1 font-mono">{avgMood} / 5.0</h3>
                  <span className="text-[9px] text-rose-500 font-bold block mt-1">2 high-stress risk alerts</span>
                </div>

              </div>

              {/* Middle row containing Correlation chart & AI Quick Strategy Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Correlation Grid graph */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Cognitive Correlation: Grades vs Wellness rating</h4>
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-mono font-bold">Class standard 9-A</span>
                  </div>
                  
                  <div className="h-44 flex items-end justify-between gap-6 px-4 pt-4 border-b border-l border-slate-200 relative">
                    {students.map((student) => {
                      const studentGrades = student.academics.subjects.flatMap(s => s.grades);
                      const acadAvg = studentGrades.length > 0
                        ? Math.round(studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / studentGrades.length)
                        : 80;
                      const moodAvg = student.wellbeing.moodHistory.length > 0 
                        ? student.wellbeing.moodHistory.reduce((s, m) => s + m.rating, 0) / student.wellbeing.moodHistory.length
                        : 4;

                      const acadHeight = (acadAvg / 100) * 110;
                      const moodHeight = (moodAvg / 5) * 110;

                      return (
                        <div key={student.id} className="flex-1 flex flex-col items-center group relative">
                          <div className="w-full flex justify-center gap-1.5 items-end h-32">
                            <div style={{ height: `${acadHeight}px` }} className="w-4 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all cursor-pointer" />
                            <div style={{ height: `${moodHeight}px` }} className="w-4 bg-rose-400 rounded-t-sm hover:bg-rose-500 transition-all cursor-pointer" />
                          </div>
                          <span className="text-[10px] text-slate-500 mt-2 font-bold truncate w-full text-center">{student.name.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                    <div className="absolute right-2 top-2 flex flex-col gap-1 text-[9px] text-slate-400 font-bold bg-white p-2 rounded border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1.5 bg-indigo-500 rounded-sm"></span> Grade Avg
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1.5 bg-rose-400 rounded-sm"></span> Mood Score
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Institutional AI Strategy panel */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Cognitive Strategist</span>
                    </div>
                    <h4 className="font-display font-extrabold text-base">Predictive Policy Advisor</h4>
                    <p className="text-xs text-indigo-100/70 leading-relaxed font-semibold">
                      Evaluate standard grade books, continuous class mood scores, and RFID attendance scans to compile immediate strategy guidelines.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("AI_ANALYTICS")}
                    className="w-full py-2.5 mt-4 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md"
                  >
                    Launch AI Strategist
                  </button>
                </div>

              </div>

              {/* Lower row: Quick Notifications Feed & School Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Notice board feed preview */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Announcements Board Feed</h4>
                    <button onClick={() => setActiveTab("ANNOUNCEMENTS")} className="text-indigo-600 hover:text-indigo-700 font-bold text-xs">View all</button>
                  </div>
                  <div className="space-y-3">
                    {notices.slice(0, 2).map((not) => (
                      <div key={not.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <h5>{not.title}</h5>
                          <span className="text-[9px] text-slate-400 font-mono font-bold">{not.date}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-medium">{not.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* School ERP Operational status */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">ERP Operational Health</h4>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold font-mono">Stable Node</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 font-medium">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span>RFID Entry gates synchronizer</span>
                      <span className="text-emerald-600 font-bold">ONLINE</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span>SMS/WhatsApp routing gateway</span>
                      <span className="text-emerald-600 font-bold">STABLE (99.8%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Academic ledger cryptography</span>
                      <span className="text-indigo-600 font-bold">SHA-256 SECURED</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STUDENTS REGISTRY (Imports modular panel) */}
          {activeTab === "STUDENTS" && (
            <AdminStudentsTab 
              students={students} 
              onUpdateStudents={(updated) => setStudents(updated)} 
            />
          )}

          {/* TAB 3: TEACHERS DIRECTORY (Imports modular panel) */}
          {activeTab === "TEACHERS" && (
            <AdminTeachersTab />
          )}

          {/* TAB 4: COMMUNICATIONS (Imports modular panel) */}
          {activeTab === "COMMUNICATION" && (
            <AdminCommsTab user={user} students={students} />
          )}

          {/* TAB 5: VISUAL TIMETABLE BUILDER (Imports modular panel) */}
          {activeTab === "TIMETABLE" && (
            <AdminTimetableTab />
          )}

          {/* TAB 6: AI ANALYTICS INTUITIVE COGNITIVE PANEL (Imports modular panel) */}
          {activeTab === "AI_ANALYTICS" && (
            <AdminAIAnalyticsTab />
          )}

          {/* TAB 7: PARENTS CRM REGISTRY */}
          {activeTab === "PARENTS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Guardian/Parent Directory Registers</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage linked pupil guardians, emergency phone mappings, and verification status.</p>
                </div>
                <button 
                  onClick={() => setIsAddParentOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Register Guardian
                </button>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Guardian Name</th>
                        <th className="py-3.5 px-2">Relationship</th>
                        <th className="py-3.5 px-2">Linked Student Pupil</th>
                        <th className="py-3.5 px-2">Contact Number</th>
                        <th className="py-3.5 px-2">Guardian Email</th>
                        <th className="py-3.5 px-2 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parents.map((parent) => (
                        <tr key={parent.id} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{parent.name}</td>
                          <td className="py-3.5 px-2 font-semibold text-slate-500">{parent.relationship}</td>
                          <td className="py-3.5 px-2 font-bold text-indigo-600">{parent.childName}</td>
                          <td className="py-3.5 px-2 font-mono">{parent.phone}</td>
                          <td className="py-3.5 px-2 font-mono text-slate-500">{parent.email}</td>
                          <td className="py-3.5 px-2 text-center">
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">{parent.status}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => {
                                if (confirm("Remove guardian record? Children logs will require re-mapping.")) {
                                  setParents(prev => prev.filter(p => p.id !== parent.id));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL: ADD PARENT */}
              {isAddParentOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" /> New Guardian registration
                      </h4>
                      <button onClick={() => setIsAddParentOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newP = {
                        id: `p-${Date.now()}`,
                        name: parentFormData.name,
                        email: parentFormData.email,
                        phone: parentFormData.phone || "+91 98765 43210",
                        childName: parentFormData.childName,
                        relationship: parentFormData.relationship,
                        status: "Verified"
                      };
                      setParents([...parents, newP]);
                      setIsAddParentOpen(false);
                      setParentFormData({ name: "", email: "", phone: "", childName: "", relationship: "Father" });
                      alert(`Guardian ${newP.name} registered.`);
                    }} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Full Parent Name</label>
                        <input type="text" required value={parentFormData.name} onChange={(e) => setParentFormData(p => ({ ...p, name: e.target.value }))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Linked child Pupil</label>
                        <input type="text" required placeholder="e.g. Aarav Sharma" value={parentFormData.childName} onChange={(e) => setParentFormData(p => ({ ...p, childName: e.target.value }))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</label>
                          <input type="text" value={parentFormData.phone} onChange={(e) => setParentFormData(p => ({ ...p, phone: e.target.value }))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Relationship</label>
                          <select value={parentFormData.relationship} onChange={(e) => setParentFormData(p => ({ ...p, relationship: e.target.value }))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Email ID</label>
                        <input type="email" required value={parentFormData.email} onChange={(e) => setParentFormData(p => ({ ...p, email: e.target.value }))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                      </div>
                      <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2">Add Guardian Mappings</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: CLASSES & SECTIONS */}
          {activeTab === "CLASSES" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Academic Standard Classes & Sections</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Define active academic grades, class teachers, and maximum head-counts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Grade 9-A", sections: "A, B", advisor: "Mr. Ananya Shastri", strength: "34 / 40", load: "90%" },
                  { name: "Grade 9-B", sections: "A, B", advisor: "Dr. Rajeev Verma", strength: "28 / 40", load: "70%" },
                  { name: "Grade 10-A", sections: "A", advisor: "Mrs. Sarah Jones", strength: "35 / 35", load: "100%" },
                  { name: "Grade 10-B", sections: "B", advisor: "Mr. Vikram Malhotra", strength: "18 / 35", load: "51%" }
                ].map((cl, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="font-bold text-slate-800 text-sm">{cl.name}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">Standard</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                      <p>Advisor: <span className="font-bold text-slate-800">{cl.advisor}</span></p>
                      <p>Sections: <span className="font-bold text-slate-800">{cl.sections}</span></p>
                      <p>Capacity: <span className="font-bold text-slate-800">{cl.strength}</span></p>
                    </div>
                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-bold">Standard Load</span>
                      <span className="text-emerald-600 font-bold font-mono">{cl.load} Occupancy</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SUBJECTS & DEPARTMENTS */}
          {activeTab === "SUBJECTS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Mapped Syllabus Subjects & Departments</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Control institutional syllabus parameters and department assignments.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Departments list */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Faculty Departments</span>
                  <div className="space-y-2 divide-y divide-slate-50">
                    <div className="pt-2 flex justify-between text-xs">
                      <span className="font-bold text-slate-800">Mathematics & Pedagogy</span>
                      <span className="text-slate-500 font-bold font-mono">2 Educators</span>
                    </div>
                    <div className="pt-2 flex justify-between text-xs">
                      <span className="font-bold text-slate-800">Science & Kinematics</span>
                      <span className="text-slate-500 font-bold font-mono">1 Educator</span>
                    </div>
                    <div className="pt-2 flex justify-between text-xs">
                      <span className="font-bold text-slate-800">Humanities & Linguistics</span>
                      <span className="text-slate-500 font-bold font-mono">1 Educator</span>
                    </div>
                  </div>
                </div>

                {/* Subjects details */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Syllabus Subjects</span>
                  <div className="space-y-2 divide-y divide-slate-50 text-xs">
                    <div className="pt-2 flex justify-between">
                      <span className="font-bold text-slate-800">Calculus & Algebra</span>
                      <span className="text-indigo-600 font-bold font-mono">6 Hours / week</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="font-bold text-slate-800">Quantum Physics</span>
                      <span className="text-indigo-600 font-bold font-mono">4 Hours / week</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="font-bold text-slate-800">Creative English</span>
                      <span className="text-indigo-600 font-bold font-mono">4 Hours / week</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: ATTENDANCE LOGS */}
          {activeTab === "ATTENDANCE" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">RFID Student Daily Attendance Logs</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time attendance percentages, late arrivals, and mapped leave tickets.</p>
                </div>
                <button onClick={() => alert("RFID Scanner logs re-synchronized successfully.")} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Force RFID Sync
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-700 font-medium">
                
                {/* Attendance Analytics */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3 col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Daily attendance rate per Class standard</span>
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Grade 9-A</span>
                        <span>94.8% attendance</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "94.8%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Grade 9-B</span>
                        <span>92.1% attendance</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "92.1%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Grade 10-A</span>
                        <span>100% attendance</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leave Requests queue */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Active Faculty Leave Requests</span>
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
                    <p className="font-bold text-rose-950">Mr. Vikram Malhotra</p>
                    <p className="text-[10px] text-rose-700">Casual Leave - Dental check • Approved</p>
                    <span className="text-[9px] text-slate-400 block font-mono">Date: 2026-07-12</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 11: HOMEWORK & ASSIGNMENTS */}
          {activeTab === "HOMEWORK" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Homework Monitor & Assignment Progress Tracker</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Monitor completion statuses, evaluate teacher velocity rates, and map average performance grades.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Active tasks logs matching criteria</span>
                <div className="space-y-2 text-xs font-semibold text-slate-700 divide-y divide-slate-50">
                  <div className="pt-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Newton's Laws Lab Experiments</p>
                      <p className="text-[10px] text-slate-400">Science • Grade 9-A • Dr. Rajeev Verma</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-mono text-[10px] font-bold">85% Completed</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Calculus Algebraic Identites Worksheet</p>
                      <p className="text-[10px] text-slate-400">Mathematics • Grade 9-A • Mr. Ananya Shastri</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-mono text-[10px] font-bold">50% Completed (Late)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: EXAMINATIONS SCHEDULES */}
          {activeTab === "EXAMINATIONS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Examinations Schedule & Grading parameters</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Track upcoming assessments, result timelines, and average grade targets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700 font-medium">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Upcoming Assessments Ledger</span>
                  <div className="space-y-2.5 pt-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">Half Yearly Calculus Evaluation</p>
                        <p className="text-[10px] text-slate-400 font-mono">Date: 2026-07-25 • Grade 9-A</p>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">Preparatory</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">Quantum Mechanics Lab Practical</p>
                        <p className="text-[10px] text-slate-400 font-mono">Date: 2026-07-28 • Grade 9-A</p>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">Syllabus Match</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Published Grading Criteria (GPA / Perc)</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-100/40 rounded-xl space-y-2 text-[11px] font-semibold">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span>Excellent standard (Grade A+)</span>
                      <span>&gt;90% aggregate</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span>Satisfactory progress (Grade B)</span>
                      <span>75% - 89% aggregate</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Warning (Grade D / Risk)</span>
                      <span>&lt;40% aggregate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: ANNOUNCEMENTS NOTICE BOARD */}
          {activeTab === "ANNOUNCEMENTS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Creator panel */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Post notice announcement</h4>
                <p className="text-xs text-slate-400 font-semibold">Post critical administrative broadcasts directly to Parent & Student ledger notice boards.</p>

                <form onSubmit={handlePostNotice} className="space-y-3.5 text-xs text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Announcement Title</label>
                    <input
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="e.g. Annual Sports meet registration opening"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Announcement Body Description</label>
                    <textarea
                      required
                      value={noticeBody}
                      onChange={(e) => setNoticeBody(e.target.value)}
                      placeholder="Provide venue, dates, criteria guidelines, and administrative contact profiles..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-indigo-500 h-28 resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 shadow transition-all"
                  >
                    Post Broadcast Notices
                  </button>
                </form>
              </div>

              {/* Announcements tracker board */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Posted notice board announcements ({notices.length})</h4>
                <div className="space-y-3">
                  {notices.map((not) => (
                    <div key={not.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/40 text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <h5>{not.title}</h5>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">{not.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-semibold">{not.body}</p>
                      <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-bold">Author: {not.author}</span>
                        <span className="font-mono">Tracked ID: {not.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 14: REPORT EXPORTER */}
          {activeTab === "REPORTS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Unified Institutional Report Exporter</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Download school spreadsheets, wellness index charts, attendance tables, or individual student grade cards.</p>
              </div>

              <div className="max-w-xl bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-5 text-xs text-slate-700 font-medium">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">1. Report Type parameters</label>
                  <select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  >
                    <option value="ATTENDANCE">Consolidated RFID Student Attendance rate sheets</option>
                    <option value="GRADES">Standard Academic grades scorecard rosters</option>
                    <option value="WELLBEING">Wellness mood analytics reports</option>
                    <option value="STAFF">Faculty duty performance ledgers</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">2. Document format standard</label>
                  <select 
                    value={reportFormat} 
                    onChange={(e) => setReportFormat(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  >
                    <option value="PDF">Adobe PDF (Print Ready)</option>
                    <option value="CSV">Comma Separated Values (CSV)</option>
                    <option value="EXCEL">Microsoft Excel Spreadsheet (XLSX)</option>
                  </select>
                </div>

                {isCompilingReport ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-indigo-700 font-bold">Compiling institution records, please stand by...</span>
                  </div>
                ) : (
                  <button 
                    onClick={triggerCompileReport}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4" /> Export Ledger Document
                  </button>
                )}

              </div>
            </div>
          )}

          {/* TAB 15: USER ACCOUNTS MAPPINGS */}
          {activeTab === "USER_MANAGEMENT" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Central ERP Authorized User Accounts Mappings</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Control operational login permissions, toggle active state status, or reset credentials.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Authorized User</th>
                        <th className="py-3.5 px-2">System Username</th>
                        <th className="py-3.5 px-2">Security Role</th>
                        <th className="py-3.5 px-2 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Emergency Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{u.name}</td>
                          <td className="py-3.5 px-2 font-mono">{u.username}</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded uppercase">{u.role}</span>
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button 
                              onClick={() => {
                                alert(`Temporary security token generated for "${u.username}". New credentials sent via secured communication channel.`);
                              }}
                              className="text-slate-500 hover:text-slate-800 font-bold font-mono text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded"
                            >
                              Reset Creds
                            </button>
                            <button 
                              onClick={() => {
                                setUsers(prev => prev.map(item => item.id === u.id ? { ...item, status: item.status === "Active" ? "Suspended" : "Active" } : item));
                                alert(`Security status updated for ${u.name}.`);
                              }}
                              className="text-slate-500 hover:text-rose-600 font-bold font-mono text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded"
                            >
                              Toggle Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 16: ROLES & PERMISSIONS MATRIX */}
          {activeTab === "ROLES" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">RBAC Security Permissions Matrix (Role-Based Access Control)</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Control discrete platform permission nodes across active security roles.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Permission Node / Policy Name</th>
                        <th className="py-3.5 px-2 text-center">Super Admin</th>
                        <th className="py-3.5 px-2 text-center">Principal</th>
                        <th className="py-3.5 px-2 text-center">Educator</th>
                        <th className="py-3.5 px-2 text-center">Guardian</th>
                        <th className="py-3.5 px-2 text-center">Student</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {permissions.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/40 text-slate-700 font-semibold">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{p.name}</td>
                          <td className="py-3.5 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={p.admin} 
                              onChange={() => {
                                setPermissions(prev => prev.map((item, idx) => idx === i ? { ...item, admin: !item.admin } : item));
                              }} 
                              className="w-3.5 h-3.5 accent-indigo-600 rounded" 
                            />
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={p.principal} 
                              onChange={() => {
                                setPermissions(prev => prev.map((item, idx) => idx === i ? { ...item, principal: !item.principal } : item));
                              }} 
                              className="w-3.5 h-3.5 accent-indigo-600 rounded" 
                            />
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={p.teacher} 
                              onChange={() => {
                                setPermissions(prev => prev.map((item, idx) => idx === i ? { ...item, teacher: !item.teacher } : item));
                              }} 
                              className="w-3.5 h-3.5 accent-indigo-600 rounded" 
                            />
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={p.parent} 
                              onChange={() => {
                                setPermissions(prev => prev.map((item, idx) => idx === i ? { ...item, parent: !item.parent } : item));
                              }} 
                              className="w-3.5 h-3.5 accent-indigo-600 rounded" 
                            />
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={p.student} 
                              onChange={() => {
                                setPermissions(prev => prev.map((item, idx) => idx === i ? { ...item, student: !item.student } : item));
                              }} 
                              className="w-3.5 h-3.5 accent-indigo-600 rounded" 
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 17: DOCUMENTS LOCKER */}
          {activeTab === "DOCUMENTS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Administrative School Document Locker</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Secure cloud-storage for institutional curriculum forms, compliance reports, and staff evaluation templates.</p>
                </div>
                <button 
                  onClick={() => {
                    const doc = prompt("Enter the file name to upload administrative document:");
                    if (doc) {
                      setDocuments([...documents, { name: doc, size: "1.4 MB", type: "PDF", date: new Date().toISOString().split("T")[0] }]);
                      alert(`Successfully uploaded "${doc}".`);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <FileUp className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden text-xs text-slate-700 font-medium">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Document / File Name</th>
                        <th className="py-3.5 px-2">Storage size</th>
                        <th className="py-3.5 px-2">File type format</th>
                        <th className="py-3.5 px-2">Uploaded Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.map((doc, i) => (
                        <tr key={i} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{doc.name}</td>
                          <td className="py-3.5 px-2 font-mono font-bold">{doc.size}</td>
                          <td className="py-3.5 px-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase font-mono">{doc.type}</span>
                          </td>
                          <td className="py-3.5 px-2 font-mono text-slate-500">{doc.date}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => alert(`Downloading "${doc.name}" from central document vault.`)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold font-mono text-[10px] bg-indigo-50/50 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-100"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 18: SYSTEM SETTINGS CONFIG */}
          {activeTab === "SETTINGS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-display font-bold text-gray-800 text-base">Platform Configurations & General Settings</h3>
              <p className="text-xs text-gray-400">Manage school metadata profile, active branches, and emergency contacts.</p>

              <div className="max-w-xl space-y-4 text-xs text-slate-700 font-medium">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Educational Institution Name</label>
                  <input type="text" value="Hillside Academy Central School" disabled className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">School Code</label>
                    <input type="text" value={user.schoolCode} disabled className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Central helpline contact</label>
                    <input type="text" value="+91 98765 00000" disabled className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl font-mono" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Operational Security settings</label>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-800 font-mono">End-to-End Cryptography Active</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase">Active</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert("Configurations updated successfully!")}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 shadow"
                >
                  Save Platform Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 19: SECURITY AUDIT LOGS */}
          {activeTab === "AUDIT_LOGS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Central security audit logs & sequential access records</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sequential tracking of administrative and faculty events.</p>
              </div>

              <div className="bg-slate-950 text-slate-300 p-4 rounded-3xl font-mono text-[10px] space-y-2 shadow-inner border border-slate-800">
                <div className="flex justify-between items-center text-slate-500 pb-1.5 border-b border-slate-900 font-bold uppercase">
                  <span>Timestamp</span>
                  <span>Operator</span>
                  <span>Action event details</span>
                  <span>IP address</span>
                </div>
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-900/50 hover:bg-slate-900/40">
                    <span className="text-amber-500">{log.timestamp}</span>
                    <span className="font-bold text-slate-200">{log.user}</span>
                    <span className="text-slate-300 truncate max-w-sm">{log.action}</span>
                    <span className="text-slate-500">{log.ip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 20: BACKUP & RECOVERY */}
          {activeTab === "BACKUP" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">School OS Backup & Disaster Recovery Center</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Compile secure structural dumps and restore historical data blocks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700 font-medium">
                
                {/* Manual backup execution */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Secure database block backup dump</span>
                  <p className="text-slate-500">Initiate manual snapshotting. This copies the entire student ledger, exam scorecards, and faculty tables into secure cloud archives.</p>
                  
                  {isBackingUp ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-mono font-bold text-indigo-700">Backup transaction in progress...</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {backupLogs.map((log, idx) => (
                          <p key={idx}>{log}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={triggerBackup}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Database className="w-3.5 h-3.5" /> Initiate Secure Backup snapshot
                    </button>
                  )}
                </div>

                {/* System Health metrics */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">System Nodes Health monitor</span>
                  <div className="space-y-2 text-[11px] font-semibold">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Cloud CPU Load index</span>
                      <span className="text-emerald-600 font-bold">14.2% Optimal</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Allocated RAM consumption</span>
                      <span className="text-emerald-600 font-bold">1.2 GB / 4.0 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average network routing ping</span>
                      <span className="text-emerald-600 font-bold">8 ms (Excellent)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 21: HELPDESK TICKETS SUPPORT */}
          {activeTab === "SUPPORT" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Platform Helpdesk Support Ticketing Queue</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Resolve technical requests posted by parents, students, or faculty members.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden text-xs text-slate-700 font-medium">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Ticket ID</th>
                        <th className="py-3.5 px-2">Requester Name</th>
                        <th className="py-3.5 px-2">Issue Query Description</th>
                        <th className="py-3.5 px-2 text-center">Priority</th>
                        <th className="py-3.5 px-2 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{t.id}</td>
                          <td className="py-3.5 px-2 font-bold text-slate-800">{t.requester}</td>
                          <td className="py-3.5 px-2 font-semibold text-slate-600 truncate max-w-xs">{t.query}</td>
                          <td className="py-3.5 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === "High" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === "Open" ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-emerald-50 text-emerald-700"}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {t.status === "Open" ? (
                              <button 
                                onClick={() => {
                                  setTickets(prev => prev.map(item => item.id === t.id ? { ...item, status: "Resolved" } : item));
                                  alert(`Ticket ${t.id} has been resolved and parent notified.`);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-bold font-mono text-[10px] bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100"
                              >
                                Mark Resolved
                              </button>
                            ) : (
                              <span className="text-slate-400 font-bold italic text-[11px]">Issue closed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
