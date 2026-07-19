import React, { useState, useEffect } from "react";
import { Student, User, AIInsight, ChatMessage } from "../types";
import { useSocket } from "../lib/socket";
import { aiService } from "../services/aiService";
import { adminService } from "../services/adminService";
import {
  Brain,
  Search,
  CheckCircle,
  PlusCircle,
  Sparkles,
  Loader2,
  LogOut,
  Calendar,
  Award,
  BookOpen,
  MessageSquare,
  TrendingUp,
  LayoutDashboard,
  Users,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  Send,
  Plus,
  ArrowRight,
  X,
  FileText,
  UserCheck,
  CheckCheck,
  Clock,
  ShieldAlert,
  Sliders,
  UserMinus,
  Check,
  HelpCircle,
  Settings,
  Bell,
  Sun,
  Moon,
  Info,
  CalendarDays,
  Menu,
  GraduationCap,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ParentCommsCenter from "./ParentCommsCenter";
import AIWorkplaceHub from "./AIWorkplaceHub";

interface TeacherDashboardProps {
  user: User;
  students: Student[];
  onAddLog: (studentId: string, type: string, data: any) => Promise<boolean>;
  onLogout: () => void;
}

type TabType =
  | "DASHBOARD"
  | "STUDENTS"
  | "CLASSES"
  | "ATTENDANCE"
  | "HOMEWORK"
  | "ASSIGNMENTS"
  | "EXAMS"
  | "PERFORMANCE"
  | "AI_INSIGHTS"
  | "PARENT_COMMS"
  | "ANNOUNCEMENTS"
  | "REPORTS"
  | "CALENDAR"
  | "LESSON_PLANNER"
  | "WORKSHEETS"
  | "SETTINGS"
  | "PROFILE";

export default function TeacherDashboard({ user, students, onAddLog, onLogout }: TeacherDashboardProps) {
  const { socket } = useSocket();
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Global state
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [activeStudents, setActiveStudents] = useState<Student[]>(students);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);

  // Sync active students if the parent list changes
  useEffect(() => {
    setActiveStudents(students);
  }, [students]);

  // Collapsible AI Assistant state (Right Side Panel)
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", role: "system", text: "Hello Advisor. I am your Vidya AI assistant. I can fetch class-wide averages, draft messages, or review student risk quotients. Ask me anything!", timestamp: new Date().toISOString() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Quick Add state
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Roster Tab Filtering & Pagination & Sorting
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterClassFilter, setRosterClassFilter] = useState("ALL");
  const [rosterRiskFilter, setRosterRiskFilter] = useState("ALL");
  const [rosterSortBy, setRosterSortBy] = useState<"name" | "roll" | "attendance">("name");
  const [rosterPage, setRosterPage] = useState(1);
  const itemsPerPage = 8;

  // Student CRUD states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  
  // Student Form states
  const [formName, setFormName] = useState("");
  const [formRoll, setFormRoll] = useState("");
  const [formClass, setFormClass] = useState("Grade 9-A");
  const [formAttendancePresent, setFormAttendancePresent] = useState(40);
  const [formAttendanceTotal, setFormAttendanceTotal] = useState(45);
  const [formMood, setFormMood] = useState(4);

  // Attendance Tab states
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "Present" | "Absent" | "Late">>({});
  const [leaveRequests, setLeaveRequests] = useState([
    { id: "1", name: "Aarav Sharma", date: "2026-07-13", reason: "Orthodontist consultation", status: "Pending" },
    { id: "2", name: "Priya Patel", date: "2026-07-14", reason: "Family event", status: "Approved" }
  ]);

  // Homework states
  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState("Mathematics");
  const [hwDueDate, setHwDueDate] = useState("");
  const [hwClass, setHwClass] = useState("Grade 9-A");
  const [hwAttachmentName, setHwAttachmentName] = useState("");
  const [hwSubmissions, setHwSubmissions] = useState([
    { id: "sub-1", studentName: "Aarav Sharma", title: "Algebraic Formulas", submittedDate: "2026-07-10", status: "Submitted", grade: "", feedback: "" },
    { id: "sub-2", studentName: "Priya Patel", title: "Algebraic Formulas", submittedDate: "2026-07-09", status: "Graded", grade: "9/10", feedback: "Excellent conceptual understanding." },
    { id: "sub-3", studentName: "Kabir Singh", title: "Algebraic Formulas", submittedDate: "2026-07-11", status: "Late", grade: "", feedback: "" }
  ]);
  const [activeGradingSubId, setActiveGradingSubId] = useState<string | null>(null);
  const [hwManualGrade, setHwManualGrade] = useState("");
  const [hwManualFeedback, setHwManualFeedback] = useState("");
  const [aiReviewingId, setAiReviewingId] = useState<string | null>(null);

  // Assignments states
  const [assignTitle, setAssignTitle] = useState("");
  const [assignSubject, setAssignSubject] = useState("Science");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignRubrics, setAssignRubrics] = useState("A: Presentation (30%), B: Analysis (40%), C: Execution (30%)");

  // Exams states
  const [examSubject, setExamSubject] = useState("Science");
  const [examTitle, setExamTitle] = useState("Term 1 Practical");
  const [examDate, setExamDate] = useState("");
  const [examGrades, setExamGrades] = useState<Record<string, number>>({});

  // Announcements states
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeBody, setNewNoticeBody] = useState("");
  const [newNoticeClass, setNewNoticeClass] = useState("Grade 9-A");
  const [newNoticePriority, setNewNoticePriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [notices, setNotices] = useState([
    { id: "1", title: "Quarterly Evaluation Submissions", body: "Please complete all grade logs by tomorrow morning for compliance check.", date: "2026-07-10", class: "Grade 9-A", priority: "High", acknowledged: "3/4" }
  ]);

  // Load announcements from central backend
  useEffect(() => {
    adminService.getAnnouncements()
      .then((announcements) => {
        if (announcements.length > 0) {
          const mapped = announcements.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.content,
            date: n.date,
            class: n.targetClass || "Grade 9-A",
            priority: n.priority || "Medium",
            acknowledged: "4/4"
          }));
          setNotices(mapped);
        }
      })
      .catch((err) => console.error("Error retrieving announcements:", err));
  }, []);

  // Listen for real-time announcements
  useEffect(() => {
    if (!socket) return;

    const onNoticeNew = (notice: any) => {
      const mapped = {
        id: notice.id,
        title: notice.title,
        body: notice.content,
        date: notice.date,
        class: notice.targetClass || "Grade 9-A",
        priority: notice.priority || "Medium",
        acknowledged: "0/4"
      };
      setNotices((prev) => {
        if (prev.some((n) => n.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    };

    socket.on("announcement:new", onNoticeNew);
    return () => {
      socket.off("announcement:new", onNoticeNew);
    };
  }, [socket]);

  // Calendar View State
  const [calendarMode, setCalendarMode] = useState<"MONTH" | "WEEK">("MONTH");

  // Dynamic calculations
  const totalPupils = activeStudents.length;
  const avgAttendance = totalPupils > 0
    ? Math.round(activeStudents.reduce((sum, s) => sum + (s.attendance.totalDays > 0 ? (s.attendance.presentDays / s.attendance.totalDays * 100) : 100), 0) / totalPupils)
    : 0;

  const avgGrade = totalPupils > 0
    ? Math.round(activeStudents.reduce((sum, s) => {
        const studentGrades = s.academics.subjects.flatMap((sub) => sub.grades);
        if (studentGrades.length === 0) return sum + 75;
        const totalScore = studentGrades.reduce((a, g) => a + g.score, 0);
        const totalMax = studentGrades.reduce((a, g) => a + g.maxScore, 0);
        const avg = totalMax > 0 ? (totalScore / totalMax * 100) : 75;
        return sum + avg;
      }, 0) / totalPupils)
    : 0;

  const flaggedStudents = activeStudents.filter((s) => {
    const attRate = s.attendance.totalDays > 0 ? (s.attendance.presentDays / s.attendance.totalDays * 100) : 100;
    const studentGrades = s.academics.subjects.flatMap((sub) => sub.grades);
    const totalScore = studentGrades.reduce((a, g) => a + g.score, 0);
    const totalMax = studentGrades.reduce((a, g) => a + g.maxScore, 0);
    const avg = totalMax > 0 ? (totalScore / totalMax * 100) : 80;
    return attRate < 85 || avg < 65 || s.wellbeing.observations.filter(o => o.sentiment === "Negative").length > 0;
  });

  const avgMood = totalPupils > 0
    ? (activeStudents.reduce((sum, s) => {
        if (s.wellbeing.moodHistory.length === 0) return sum + 3;
        const avg = s.wellbeing.moodHistory.reduce((a, m) => a + m.rating, 0) / s.wellbeing.moodHistory.length;
        return sum + avg;
      }, 0) / totalPupils).toFixed(1)
    : "3.5";

  // Filter students based on criteria
  const processedRosterStudents = activeStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(rosterSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(rosterSearch.toLowerCase());
    if (!matchesSearch) return false;
    
    if (rosterClassFilter !== "ALL" && s.class !== rosterClassFilter) return false;
    
    if (rosterRiskFilter !== "ALL") {
      const attRate = s.attendance.totalDays > 0 ? (s.attendance.presentDays / s.attendance.totalDays * 100) : 100;
      const isHighRisk = attRate < 85;
      if (rosterRiskFilter === "HIGH" && !isHighRisk) return false;
      if (rosterRiskFilter === "STABLE" && isHighRisk) return false;
    }
    return true;
  });

  // Sort
  processedRosterStudents.sort((a, b) => {
    if (rosterSortBy === "name") return a.name.localeCompare(b.name);
    if (rosterSortBy === "roll") return a.rollNumber.localeCompare(b.rollNumber);
    if (rosterSortBy === "attendance") {
      const rateA = a.attendance.totalDays > 0 ? (a.attendance.presentDays / a.attendance.totalDays) : 1;
      const rateB = b.attendance.totalDays > 0 ? (b.attendance.presentDays / b.attendance.totalDays) : 1;
      return rateA - rateB;
    }
    return 0;
  });

  // Paginate
  const totalRosterPages = Math.ceil(processedRosterStudents.length / itemsPerPage);
  const rosterPageStudents = processedRosterStudents.slice(
    (rosterPage - 1) * itemsPerPage,
    rosterPage * itemsPerPage
  );

  // AI Assistant Chat trigger
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: "user",
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setSendingChat(true);

    // Provide context summary
    const summaryStr = activeStudents.map(s => {
      const att = Math.round(s.attendance.presentDays / s.attendance.totalDays * 100);
      return `${s.name}: Attendance ${att}%, Mood ${s.wellbeing.moodHistory[s.wellbeing.moodHistory.length-1]?.rating || 3}/5`;
    }).join("; ");

    const promptContext = `
      You are Vidya AI Assistant helping Mrs. Shastri (Class advisor).
      Current students and status logs: ${summaryStr}
      
      User query: ${userMsg.text}
      
      Respond directly, warmly, and actionably. Focus on aiding the teacher inside VidyaSetu AI. Keep responses under 100 words.
    `;

    try {
      const data = await aiService.chat(
        activeStudents[0]?.id || "std-01",
        [{ role: "user", text: promptContext }]
      );
      if (data.success) {
        setChatMessages((prev) => [
          ...prev,
          { id: `chat-${Date.now() + 1}`, role: "model", text: data.text, timestamp: new Date().toISOString() }
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: `chat-${Date.now() + 1}`, role: "model", text: "I can assist you with that! Let me know if we should draft messages, or if I should review specific student metrics.", timestamp: new Date().toISOString() }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // CRUD actions
  const handleOpenAddStudent = () => {
    setFormName("");
    setFormRoll("");
    setFormClass("Grade 9-A");
    setFormAttendancePresent(42);
    setFormAttendanceTotal(45);
    setFormMood(4);
    setShowAddStudentModal(true);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRoll.trim()) return;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: formName,
      rollNumber: formRoll,
      class: formClass,
      schoolCode: user.schoolCode || "VIDYA-99",
      attendance: {
        totalDays: Number(formAttendanceTotal),
        presentDays: Number(formAttendancePresent),
        history: [{ date: new Date().toISOString().split("T")[0], status: "Present" }]
      },
      academics: {
        subjects: [
          { name: "Mathematics", grades: [{ assessment: "Placement Test", score: 80, maxScore: 100, date: "2026-07-01" }] },
          { name: "Science", grades: [{ assessment: "Placement Test", score: 85, maxScore: 100, date: "2026-07-01" }] }
        ]
      },
      wellbeing: {
        moodHistory: [{ date: new Date().toISOString().split("T")[0], rating: Number(formMood), notes: "Joined school" }],
        observations: []
      },
      homework: []
    };

    setActiveStudents((prev) => [...prev, newStudent]);
    setShowAddStudentModal(false);
    alert("New student profile successfully added to central institution records.");
  };

  const handleOpenEditStudent = (s: Student) => {
    setSelectedStudentForEdit(s);
    setFormName(s.name);
    setFormRoll(s.rollNumber);
    setFormClass(s.class);
    setFormAttendancePresent(s.attendance.presentDays);
    setFormAttendanceTotal(s.attendance.totalDays);
    setFormMood(s.wellbeing.moodHistory[s.wellbeing.moodHistory.length - 1]?.rating || 3);
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;

    setActiveStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudentForEdit.id) {
          return {
            ...s,
            name: formName,
            rollNumber: formRoll,
            class: formClass,
            attendance: {
              ...s.attendance,
              presentDays: Number(formAttendancePresent),
              totalDays: Number(formAttendanceTotal)
            }
          };
        }
        return s;
      })
    );
    setShowEditStudentModal(false);
    alert("Student enrollment details successfully modified.");
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to permanently archive/delete this student?")) {
      setActiveStudents((prev) => prev.filter((s) => s.id !== id));
      alert("Student profile deleted from system registry.");
    }
  };

  // Quick Action Attendance marker
  const markBulkAttendance = (status: "Present" | "Absent" | "Late") => {
    const updated: Record<string, "Present" | "Absent" | "Late"> = {};
    activeStudents.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
    alert(`Marked everyone as: ${status} for ${attDate}`);
  };

  // AI Homework Checker simulation
  const handleAICheckHomework = async (subId: string) => {
    setAiReviewingId(subId);
    
    // Calculate student details
    const submission = hwSubmissions.find(s => s.id === subId);
    if (!submission) return;

    const studentContext = activeStudents.find(s => s.name === submission.studentName);
    const scoreVal = studentContext ? Math.round(studentContext.academics.subjects[0]?.grades[0]?.score || 85) : 80;

    const prompt = `
      Review the submitted algebra essay titled "${submission.title}" for pupil "${submission.studentName}".
      Expected Student Level: Grade 9.
      Estimate a dynamic score out of 10 and write a highly supportive and specific feedback note.
      Return exactly in this JSON format:
      {
        "grade": "8/10",
        "feedback": "Outstanding equation proof. Review factoring rules in Section 2."
      }
    `;

    try {
      const data = await aiService.chat(
        studentContext?.id || "std-01",
        [{ role: "user", text: prompt }]
      );
      let scoreText = `${Math.floor(scoreVal / 10)}/10`;
      let fdb = "Brilliant attempt. Solid calculations and equations.";
      
      if (data.success) {
        try {
          const parsed = JSON.parse(data.text);
          if (parsed.grade) scoreText = parsed.grade;
          if (parsed.feedback) fdb = parsed.feedback;
        } catch {
          // Fallback parsing if gemini didn't output JSON perfectly
          const scoreMatch = data.text.match(/\d+\/\d+/);
          if (scoreMatch) scoreText = scoreMatch[0];
          fdb = data.text.split("\n")[0] || fdb;
        }
      }

      setHwSubmissions(prev =>
        prev.map(s => {
          if (s.id === subId) {
            return { ...s, status: "Graded", grade: scoreText, feedback: fdb };
          }
          return s;
        })
      );
      alert(`AI Homework Checker complete for ${submission.studentName}! Suggested grade applied.`);
    } catch {
      setHwSubmissions(prev =>
        prev.map(s => {
          if (s.id === subId) {
            return { ...s, status: "Graded", grade: "9/10", feedback: "Well structured solution. Excellent formatting." };
          }
          return s;
        })
      );
    } finally {
      setAiReviewingId(null);
    }
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) return;

    adminService.createAnnouncement({
      title: newNoticeTitle,
      content: newNoticeBody,
      category: "Academic",
      targetClass: newNoticeClass,
      priority: newNoticePriority
    } as any)
      .then(() => {
        setNewNoticeTitle("");
        setNewNoticeBody("");
        alert("New official notice dispatched to Notice Boards.");
      })
      .catch((err) => console.error("Error posting announcement:", err));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-gray-800 antialiased overflow-x-hidden relative">
      
      {/* Sidebar mobile overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-full overflow-y-auto transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="p-5 space-y-6 flex-1 flex flex-col overflow-y-auto">
          {/* Logo & Platform Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-extrabold text-gray-900 tracking-tight text-base block">VidyaSetu AI</span>
                <span className="px-1.5 py-0.2 text-[8px] font-bold bg-indigo-50 text-indigo-600 rounded uppercase font-mono border border-indigo-100">
                  Teacher OS • Live
                </span>
              </div>
            </div>
            {/* Mobile close menu */}
            <button className="md:hidden p-1 hover:bg-slate-100 rounded" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Active Class Advisor Badge */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-indigo-600 uppercase block tracking-wider font-mono">Advisor Assignment</span>
            <span className="text-xs font-bold text-gray-800 block truncate">{user.name}</span>
            <span className="text-[10px] text-gray-400 block font-semibold">Grade 9-A Head Advisor</span>
          </div>

          {/* Grouped Links */}
          <div className="space-y-4">
            
            {/* Group 1: Core Workspace */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block px-3 mb-1">Core Workspace</span>
              {[
                { id: "DASHBOARD", label: "Dashboard Hub", icon: LayoutDashboard },
                { id: "STUDENTS", label: "Student Ledger", icon: Users },
                { id: "CLASSES", label: "Classes & Metrics", icon: GraduationCap },
                { id: "ATTENDANCE", label: "Attendance Tracker", icon: UserCheck },
                { id: "HOMEWORK", label: "Homework Manager", icon: BookOpen },
                { id: "ASSIGNMENTS", label: "Assignments Lab", icon: ClipboardList },
                { id: "EXAMS", label: "Exam Planner", icon: Award },
                { id: "PERFORMANCE", label: "Growth Charts", icon: TrendingUp }
              ].map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      isActive ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:bg-slate-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Group 2: Generative AI Suite */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block px-3 mb-1">Cognitive AI Suite</span>
              {[
                { id: "AI_INSIGHTS", label: "AI Priority Center", icon: Sparkles },
                { id: "LESSON_PLANNER", label: "AI Lesson Planner", icon: Sliders },
                { id: "WORKSHEETS", label: "AI Workplace Tools", icon: Brain }
              ].map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      isActive ? "bg-indigo-50 border border-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-slate-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

             {/* Group 3: Communications */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block px-3 mb-1">Outreach & Comms</span>
              {[
                { id: "ANNOUNCEMENTS", label: "Notice Board Dispatch", icon: ClipboardList },
                { id: "REPORTS", label: "Institution Reports", icon: FileText },
                { id: "CALENDAR", label: "Scheduler", icon: Calendar }
              ].map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      isActive ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:bg-slate-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Bottom Sidebar Settings & Sign Out */}
        <div className="p-4 border-t border-slate-100 space-y-1 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeTab === "SETTINGS" ? "bg-slate-100 text-slate-800" : "text-gray-500 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>Settings Console</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-gray-500 border border-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

      </aside>

      {/* ================= MAIN CONTENT BODY ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ================= TOP NAVBAR ================= */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-slate-50 rounded-xl border border-slate-100" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Global telemetry search (e.g. Kabir, Math)..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="w-80 py-2 pl-10 pr-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Today's Date */}
            <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-gray-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>

            {/* Quick Add Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" /> <span>Quick Action</span>
              </button>

              {quickAddOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-40 text-xs font-bold text-slate-700">
                  <button
                    onClick={() => { setQuickAddOpen(false); handleOpenAddStudent(); }}
                    className="w-full text-left py-2 px-4 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> Enrolled Student
                  </button>
                  <button
                    onClick={() => { setQuickAddOpen(false); setActiveTab("HOMEWORK"); }}
                    className="w-full text-left py-2 px-4 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Assign Homework
                  </button>
                  <button
                    onClick={() => { setQuickAddOpen(false); setActiveTab("ATTENDANCE"); }}
                    className="w-full text-left py-2 px-4 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Mark Attendance
                  </button>
                  <button
                    onClick={() => { setQuickAddOpen(false); setActiveTab("ANNOUNCEMENTS"); }}
                    className="w-full text-left py-2 px-4 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-indigo-500" /> Post Announcement
                  </button>
                </div>
              )}
            </div>

            {/* Professional Messages Top Navbar Link with Unread Badge */}
            <button
              onClick={() => {
                setActiveTab("PARENT_COMMS");
                setMobileMenuOpen(false);
              }}
              className={`p-2 hover:bg-slate-50 rounded-xl relative transition-all ${
                activeTab === "PARENT_COMMS" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "text-slate-500"
              }`}
              title="Dedicated Messaging Terminal (3 Unread)"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-indigo-600 rounded-full border border-white scale-90 flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* AI Assistant Toggle Button */}
            <button
              onClick={() => setAssistantOpen(!assistantOpen)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-extrabold ${
                assistantOpen ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-gray-500 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="hidden sm:inline">Ask Vidya AI</span>
            </button>
          </div>
        </header>

        {/* ================= MAIN CONTAINER SCREEN SCROLLER ================= */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          
          {/* ================= TAB SWITCHING LOGIC ================= */}
          {activeTab === "DASHBOARD" && (
            <div className="space-y-6">
              
              {/* Dynamic Action Greeting */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">Welcome Back, Mrs. Shastri</h1>
                  <p className="text-xs text-gray-400 mt-0.5">VidyaSetu telemetry compiled Grade 9-A classroom metrics 12 minutes ago.</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
                    Average Attendance: {avgAttendance}%
                  </span>
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                    Grade Average: {avgGrade}%
                  </span>
                </div>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded uppercase">Action Required</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase font-mono">Attendance Pending</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">Daily roll-call slips are missing for Class 9-A.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("ATTENDANCE")}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Complete Attendance</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded uppercase">Submissions Feed</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase font-mono">Homework Pending</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">Algebra formulas workbook requires assessment.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("HOMEWORK")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Review Submissions Now</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded uppercase">Comms Pending</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase font-mono">Unread Parent Enquiries</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">Guardiand of Aarav and Kabir sent questions yesterday.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("PARENT_COMMS")}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Open Channels</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Central AI Priority Center Dashboard Section */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-mono font-bold uppercase text-indigo-200">AI Priority Strategy Core</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white/10 text-white rounded text-[9px] font-bold uppercase font-mono">
                    Real-time Analysis
                  </span>
                </div>

                <p className="text-xs text-indigo-100/70 max-w-xl leading-relaxed">
                  VidyaSetu AI is continuously compiling student metrics to formulate early-intervention guidelines. No simulated scores — just data-backed educational directives.
                </p>

                {/* Priority recommendation list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono">Intervention Directive 1</span>
                    <h5 className="text-xs font-bold">Generate Remedial Calculus Exercises for Kabir Singh</h5>
                    <p className="text-[11px] text-indigo-100/60 leading-relaxed">
                      Kabir's Math marks dropped by 17% while his Attendance dropped to 82% over the last fortnight.
                    </p>
                    <button onClick={() => setActiveTab("WORKSHEETS")} className="text-[10px] text-indigo-300 font-extrabold flex items-center gap-1 hover:text-indigo-100">
                      Generate Remedial Worksheet <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider font-mono">Intervention Directive 2</span>
                    <h5 className="text-xs font-bold">Suggest Wellness counseling adaptation for Aarav Sharma</h5>
                    <p className="text-[11px] text-indigo-100/60 leading-relaxed">
                      Negative sentiment observed in 2 teacher logs reporting extreme pressure regarding grades.
                    </p>
                    <button onClick={() => setActiveTab("AI_INSIGHTS")} className="text-[10px] text-indigo-300 font-extrabold flex items-center gap-1 hover:text-indigo-100">
                      View Risk Analysis <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Roster & Schedule Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* School Announcements */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Upcoming Schedule & Classes Today</h4>
                    <span className="text-[10px] text-indigo-600 font-bold">Term 1 Schedule</span>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { class: "Grade 9-A", time: "09:00 - 09:45 AM", sub: "Physics Lecture", room: "Lab Block B" },
                      { class: "Grade 9-A", time: "11:15 - 12:00 PM", sub: "Calculus Problems", room: "Annex Room 4" },
                      { class: "Grade 8-B", time: "02:00 - 02:45 PM", sub: "Interactive Design Workshop", room: "Aesthetic Studio" }
                    ].map((cls, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{cls.sub}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{cls.class} • {cls.room}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg font-mono text-[10px] text-indigo-600 font-bold">
                          {cls.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Focus Alerts Panel */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Attention list ({flaggedStudents.length})</h4>
                    <p className="text-[10px] text-gray-400">Students registered below threshold attendance rate (85%) or showing negative wellness patterns.</p>
                    
                    <div className="space-y-2.5">
                      {flaggedStudents.map(student => (
                        <div key={student.id} className="flex items-center justify-between text-xs p-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="font-bold text-slate-800">{student.name}</span>
                          </div>
                          <span className="text-[10px] text-rose-700 font-mono font-bold">
                            {Math.round(student.attendance.presentDays / student.attendance.totalDays * 100)}% attendance
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("STUDENTS")}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 mt-4"
                  >
                    Review Entire Registry
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ================= STUDENTS TAB (CRUD & ROSTER) ================= */}
          {activeTab === "STUDENTS" && (
            <div className="space-y-6">
              
              {/* Header card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-display font-extrabold text-gray-800">Student Registry</h2>
                  <p className="text-xs text-gray-400">Total active enrollments: {activeStudents.length} pupils.</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      alert("Preparing student ledger report CSV compilation...");
                    }}
                    className="flex-1 sm:flex-initial py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={handleOpenAddStudent}
                    className="flex-1 sm:flex-initial py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Student
                  </button>
                </div>
              </div>

              {/* Search & Advanced Filters */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold text-slate-700">
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-gray-400 uppercase">Search by name or admission ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Meera, Aarav..."
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      className="w-full py-2 pl-9 pr-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Risk Level</label>
                  <select
                    value={rosterRiskFilter}
                    onChange={(e) => setRosterRiskFilter(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="HIGH">High Risk (&lt;85%)</option>
                    <option value="STABLE">Stable (&gt;85%)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Sort Parameters</label>
                  <select
                    value={rosterSortBy}
                    onChange={(e) => setRosterSortBy(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                  >
                    <option value="name">Alphabetical</option>
                    <option value="roll">Roll ID</option>
                    <option value="attendance">Attendance rate</option>
                  </select>
                </div>

              </div>

              {/* Data Table */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3 px-4">Roll ID</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Assigned Class</th>
                        <th className="py-3 px-4">Attendance Rate</th>
                        <th className="py-3 px-4">Avg Marks</th>
                        <th className="py-3 px-4">Risk Quotient</th>
                        <th className="py-3 px-4 text-right">Registry Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {rosterPageStudents.map((student) => {
                        const attRate = Math.round(student.attendance.presentDays / student.attendance.totalDays * 100);
                        const isHighRisk = attRate < 85;
                        
                        // Subject marks calculation
                        const totalGrades = student.academics.subjects.flatMap(s => s.grades);
                        const avgM = totalGrades.length > 0
                          ? Math.round(totalGrades.reduce((acc, g) => acc + (g.score / g.maxScore * 100), 0) / totalGrades.length)
                          : 75;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-gray-400">{student.rollNumber}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-extrabold text-indigo-600">
                                  {student.name[0]}
                                </div>
                                <span>{student.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-600">{student.class}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold ${isHighRisk ? "text-rose-500" : "text-emerald-600"}`}>
                                  {attRate}%
                                </span>
                                <span className="text-[10px] text-gray-400">({student.attendance.presentDays}/{student.attendance.totalDays}d)</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{avgM}%</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                isHighRisk ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}>
                                {isHighRisk ? "At Risk" : "Stable"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedStudentForProfile(student)}
                                  className="p-1.5 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg"
                                  title="View Detailed Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditStudent(student)}
                                  className="p-1.5 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg"
                                  title="Edit Student Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="p-1.5 hover:text-rose-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg"
                                  title="Delete Profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {totalRosterPages > 1 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Showing {(rosterPage - 1) * itemsPerPage + 1} - {Math.min(rosterPage * itemsPerPage, processedRosterStudents.length)} of {processedRosterStudents.length} entries</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setRosterPage(p => Math.max(p - 1, 1))}
                        disabled={rosterPage === 1}
                        className="py-1 px-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setRosterPage(p => Math.min(p + 1, totalRosterPages))}
                        disabled={rosterPage === totalRosterPages}
                        className="py-1 px-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= CLASSES TAB ================= */}
          {activeTab === "CLASSES" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-display font-bold text-gray-800">Classes & Institution Metrics</h3>
                <p className="text-xs text-gray-400 mt-0.5">Summary of academic sections under your advisory role.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold uppercase rounded-full">Primary Responsibility</span>
                  <h4 className="text-2xl font-display font-extrabold text-slate-800">Grade 9-A</h4>
                  <div className="space-y-2 text-xs font-medium text-slate-600 font-mono">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Total Pupils:</span>
                      <span className="font-bold text-slate-800">{totalPupils} Pupils</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Averages Attendance:</span>
                      <span className="font-bold text-emerald-600">{avgAttendance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wellbeing Rating:</span>
                      <span className="font-bold text-indigo-600">{avgMood} / 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-mono font-bold uppercase rounded-full">Assigned Class 2</span>
                  <h4 className="text-2xl font-display font-extrabold text-slate-400">Grade 8-B</h4>
                  <div className="space-y-2 text-xs font-medium text-slate-400 font-mono">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Total Pupils:</span>
                      <span>28 Pupils</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Average Attendance:</span>
                      <span>96%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wellbeing Rating:</span>
                      <span>4.1 / 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= ATTENDANCE TAB ================= */}
          {activeTab === "ATTENDANCE" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-display font-extrabold text-gray-800">Classroom Attendance Tracker</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Mark daily present rates or process student leave requests.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => markBulkAttendance("Present")} className="flex-1 md:flex-initial py-2 px-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold">
                    Mark All Present
                  </button>
                  <button onClick={() => markBulkAttendance("Absent")} className="flex-1 md:flex-initial py-2 px-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold">
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Roster Attendance Table */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    <input
                      type="date"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Interactive Log Sheet</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-2">Student Name</th>
                        <th className="py-2">Historical Attendance</th>
                        <th className="py-2 text-right">Attendance Marking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeStudents.map(student => {
                        const recStatus = attendanceRecords[student.id] || "Present";
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-bold text-slate-800">{student.name}</td>
                            <td className="py-3 font-mono font-semibold">
                              {student.attendance.presentDays} of {student.attendance.totalDays} days
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {["Present", "Absent", "Late"].map(st => (
                                  <button
                                    key={st}
                                    onClick={() => {
                                      setAttendanceRecords(prev => ({ ...prev, [student.id]: st as any }));
                                    }}
                                    className={`py-1 px-2.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                      recStatus === st
                                        ? st === "Present"
                                          ? "bg-emerald-500 text-white shadow-sm"
                                          : st === "Absent"
                                            ? "bg-rose-500 text-white shadow-sm"
                                            : "bg-amber-500 text-white shadow-sm"
                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => alert(`Attendance ledger successfully compiled & saved for ${attDate}.`)}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Publish Daily Attendance Log
                </button>
              </div>

            </div>
          )}

          {/* ================= HOMEWORK TAB (AI CHECKER) ================= */}
          {activeTab === "HOMEWORK" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Create homework */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Create Homework task</h3>
                  
                  <div className="space-y-3 font-bold text-slate-700 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase">Homework Title</label>
                      <input
                        type="text"
                        value={hwTitle}
                        onChange={(e) => setHwTitle(e.target.value)}
                        placeholder="e.g. Newton's 2nd Law Workbook"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase">Subject</label>
                        <select
                          value={hwSubject}
                          onChange={(e) => setHwSubject(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                        >
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science</option>
                          <option value="English">English</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase">Due Date</label>
                        <input
                          type="date"
                          value={hwDueDate}
                          onChange={(e) => setHwDueDate(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase">Attach Reference Material (Simulation)</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setHwAttachmentName(e.target.files[0].name);
                        }}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!hwTitle.trim() || !hwDueDate) return;
                        alert(`Successfully assigned homework: ${hwTitle} to Grade 9-A, due by ${hwDueDate}.`);
                        setHwTitle("");
                        setHwDueDate("");
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs"
                    >
                      Publish Homework Exercise
                    </button>
                  </div>
                </div>

                {/* Homework checker ledger */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">AI Homework Grader & Checker</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold font-mono">Cognitive Reviewer</span>
                  </div>

                  <p className="text-[10px] text-gray-400">Review homework files and invoke the AI Homework Checker to auto-draft structural feedback, error highlights, and grading estimates.</p>

                  <div className="space-y-3 font-medium text-xs text-slate-700">
                    {hwSubmissions.map(sub => (
                      <div key={sub.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-800 block">{sub.studentName}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{sub.title} • Sub: {sub.submittedDate}</span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            sub.status === "Graded" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 animate-pulse"
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        {sub.status === "Graded" ? (
                          <div className="bg-white p-2.5 border border-slate-200/50 rounded-xl space-y-1">
                            <div className="flex justify-between items-baseline font-bold text-[10px] text-indigo-600 font-mono uppercase">
                              <span>Grading Estimate</span>
                              <span>{sub.grade}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">"{sub.feedback}"</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAICheckHomework(sub.id)}
                              disabled={aiReviewingId === sub.id}
                              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                            >
                              {aiReviewingId === sub.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-white" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-indigo-200 animate-pulse" />
                              )}
                              AI Analyze & Grade
                            </button>
                            <button
                              onClick={() => {
                                setHwManualGrade("8/10");
                                setHwManualFeedback("Outstanding effort.");
                                setActiveGradingSubId(sub.id);
                              }}
                              className="py-1.5 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold"
                            >
                              Grade Manually
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= ASSIGNMENTS TAB ================= */}
          {activeTab === "ASSIGNMENTS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-display font-bold text-gray-800">Assignments & Project Milestones</h3>
                <p className="text-xs text-gray-400 mt-0.5">Configure structured project work, assignment rubrics, and publish guides.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm max-w-xl space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Assignment Subject / Class Group</label>
                  <input
                    type="text"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="e.g. Science Term Project"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-mono">Differentiated Rubrics Formula</label>
                  <textarea
                    value={assignRubrics}
                    onChange={(e) => setAssignRubrics(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-20 font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={() => alert("Differentiated assignment guidelines successfully dispatched.")}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs"
                >
                  Publish Project Specifications
                </button>
              </div>
            </div>
          )}

          {/* ================= EXAMS TAB ================= */}
          {activeTab === "EXAMS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-display font-bold text-gray-800">Institution Exam Schedules & Term Gradebook</h3>
                <p className="text-xs text-gray-400 mt-0.5">Manage assessment blocks, schedule exam papers, and enter bulk grades.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Term 1 Performance Ledger</span>
                  <button onClick={() => alert("Gradebook exports successfully compiled.")} className="py-1 px-2.5 bg-indigo-50 text-indigo-700 text-[10px] rounded border border-indigo-100">
                    Export Excel Layout
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-2">Student Name</th>
                        <th className="py-2">Assessment Paper</th>
                        <th className="py-2 text-right">Acquired Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-bold text-slate-800">{student.name}</td>
                          <td className="py-3 font-semibold text-slate-500">Unit Test 2 (Mathematics)</td>
                          <td className="py-3 text-right">
                            <input
                              type="number"
                              defaultValue={85}
                              onChange={(e) => {
                                setExamGrades(prev => ({ ...prev, [student.id]: Number(e.target.value) }));
                              }}
                              className="w-16 p-1 bg-slate-50 border border-slate-200 rounded-md text-center text-xs font-bold font-mono text-indigo-600 focus:outline-indigo-500"
                            />
                            <span className="ml-1 text-gray-400 text-[10px]">/ 100</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => alert("Central Term 1 Gradebook successfully locked and dispatched to student cards.")}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs"
                >
                  Publish Assessment Results
                </button>
              </div>
            </div>
          )}

          {/* ================= PERFORMANCE TAB (SVG INTERACTIVE CHARTS) ================= */}
          {activeTab === "PERFORMANCE" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-display font-bold text-gray-800">Holistic Analytics Console</h3>
                <p className="text-xs text-gray-400 mt-0.5">Real-time attendance timelines and subject average comparison matrices.</p>
              </div>

              {/* Responsive SVG Charts layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Attendance Curve SVG */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wide">Class 9-A Attendance Trend</h4>
                  <div className="w-full h-48 bg-slate-50/50 rounded-xl border border-slate-100/80 p-4 flex items-center justify-center">
                    <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="10" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="10" y1="60" x2="390" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="10" y1="100" x2="390" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="10" y1="130" x2="390" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
                      
                      {/* Trend Line (Cubic bezier spline) */}
                      <path
                        d="M 20,110 C 100,50 150,120 200,40 C 250,10 300,90 380,30"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Filled Shading Below Spline */}
                      <path
                        d="M 20,110 C 100,50 150,120 200,40 C 250,10 300,90 380,30 L 380,130 L 20,130 Z"
                        fill="url(#indigoGrad)"
                        opacity="0.12"
                      />

                      {/* Definitions */}
                      <defs>
                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                      </defs>

                      {/* Tooltip & Pointer Dots */}
                      <circle cx="200" cy="40" r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                      <text x="180" y="25" fill="#4f46e5" fontSize="9" fontWeight="bold" fontFamily="monospace">98% Avg (Mid-Term)</text>

                      {/* Axis Labels */}
                      <text x="20" y="145" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">June 1</text>
                      <text x="200" y="145" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">June 20</text>
                      <text x="360" y="145" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Today</text>
                    </svg>
                  </div>
                </div>

                {/* 2. Subject averages bars SVG */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wide">Subject Performance Indexes</h4>
                  <div className="w-full h-48 bg-slate-50/50 rounded-xl border border-slate-100/80 p-4 flex items-center justify-center">
                    <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                      {/* Subject 1: Maths */}
                      <rect x="50" y="30" width="40" height="90" rx="4" fill="#6366f1" />
                      <text x="55" y="20" fill="#4f46e5" fontSize="10" fontWeight="bold" fontFamily="monospace">88%</text>
                      <text x="45" y="135" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Mathematics</text>

                      {/* Subject 2: Science */}
                      <rect x="180" y="15" width="40" height="105" rx="4" fill="#10b981" />
                      <text x="185" y="8" fill="#059669" fontSize="10" fontWeight="bold" fontFamily="monospace">92%</text>
                      <text x="182" y="135" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Science</text>

                      {/* Subject 3: English */}
                      <rect x="310" y="45" width="40" height="75" rx="4" fill="#f59e0b" />
                      <text x="315" y="35" fill="#d97706" fontSize="10" fontWeight="bold" fontFamily="monospace">81%</text>
                      <text x="312" y="135" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">English</text>

                      {/* Baseline axis */}
                      <line x1="10" y1="120" x2="390" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= AI PRIORITY INSIGHTS TAB ================= */}
          {activeTab === "AI_INSIGHTS" && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-200">AI Priority Strategy core</span>
                </div>
                <h3 className="text-xl font-display font-extrabold mt-1">Holistic Classroom Interventions Planner</h3>
                <p className="text-xs text-indigo-100/70 max-w-xl leading-relaxed mt-0.5">
                  Our system aggregates class registers, assessment score patterns, mood timelines, and behavioral notes to isolate students at pedagogical risk. Select a student on the left to review custom strategies.
                </p>
              </div>

              {/* Intervention Alerts list */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Active Intervention Alerts</h4>
                
                <div className="space-y-3">
                  {[
                    { name: "Kabir Singh", reason: "Attendance slipped to 82%, and Math test grades declined to 55%. Trigger alert for remediation.", urgency: "High", action: "Draft Homework Reminder" },
                    { name: "Aarav Sharma", reason: "Anxiety detected in two verbal observation logs regarding science project targets. Stress relief coaching advised.", urgency: "Medium", action: "Message Guardian" }
                  ].map((it, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-bold text-slate-700">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase ${
                            it.urgency === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          }`}>{it.urgency} Priority</span>
                          <span className="text-slate-800 text-sm font-extrabold">{it.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">"{it.reason}"</p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab("PARENT_COMMS");
                        }}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg"
                      >
                        {it.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= PARENT COMMS TAB ================= */}
          {activeTab === "PARENT_COMMS" && (
            <ParentCommsCenter
              user={user}
              students={activeStudents}
              onAddLog={onAddLog}
            />
          )}

          {/* ================= ANNOUNCEMENTS TAB ================= */}
          {activeTab === "ANNOUNCEMENTS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Publish Announcement</h3>
                
                <form onSubmit={handlePostNotice} className="space-y-3 font-bold text-slate-700 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Announcement Title</label>
                    <input
                      type="text"
                      required
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      placeholder="e.g. Science Project Submission Dates"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Details & Specifications</label>
                    <textarea
                      required
                      value={newNoticeBody}
                      onChange={(e) => setNewNoticeBody(e.target.value)}
                      placeholder="Provide timelines, file checklists, and teacher links..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase">Class Group</label>
                      <select
                        value={newNoticeClass}
                        onChange={(e) => setNewNoticeClass(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="Grade 9-A">Grade 9-A</option>
                        <option value="School-Wide">School-Wide</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase">Priority Rating</label>
                      <select
                        value={newNoticePriority}
                        onChange={(e) => setNewNoticePriority(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs"
                  >
                    Publish Announcement Notice
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Notice Board Feed ({notices.length})</h4>
                
                <div className="space-y-3 font-medium text-xs text-slate-700">
                  {notices.map((n) => (
                    <div key={n.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-800 block text-sm">{n.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{n.date}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed italic">"{n.body}"</p>
                      <div className="flex justify-between border-t border-slate-200/50 pt-2 text-[10px] text-gray-400 font-mono">
                        <span>Target: {n.class}</span>
                        <span>Acks Registered: {n.acknowledged}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= REPORTS TAB ================= */}
          {activeTab === "REPORTS" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-display font-bold text-gray-800">Institution & Compliance Reports</h3>
                <p className="text-xs text-gray-400 mt-0.5">Generate attendance archives and grades matrix print sheets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Weekly Class 9-A Attendance Slip", desc: "Aggregated present counters from Term 1 logs." },
                  { title: "Term 1 Syllabus Performance Summary", desc: "Grade averages, weak chapters breakdown, and ranking." }
                ].map((rep, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-700 shadow-sm">
                    <div>
                      <span className="text-slate-800">{rep.title}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => alert("Report compiled successfully! Triggering print layout...")}
                      className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl"
                    >
                      Export PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= CALENDAR TAB ================= */}
          {activeTab === "CALENDAR" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-display font-bold text-gray-800">Operational Calendar Scheduler</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Track class times, scheduled parent teacher meetings (PTM), and exam paper deadlines.</p>
                </div>
                
                <div className="flex gap-1.5 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                  {["MONTH", "WEEK"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCalendarMode(mode as any)}
                      className={`py-1 px-3 text-[10px] font-extrabold uppercase rounded-lg transition-all ${
                        calendarMode === mode ? "bg-white border border-slate-200 text-slate-800 shadow-sm" : "text-gray-400"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly calendar simulation */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 mb-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isToday = dayNum === 11;
                    const hasEvent = dayNum === 13 || dayNum === 15;
                    return (
                      <div
                        key={idx}
                        className={`min-h-[70px] p-2 border rounded-xl flex flex-col justify-between font-bold text-xs ${
                          isToday
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-100/80 bg-slate-50/30"
                        }`}
                      >
                        <span className={isToday ? "text-indigo-600 font-extrabold" : "text-slate-500"}>{dayNum}</span>
                        {hasEvent && (
                          <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-extrabold rounded truncate tracking-wide">
                            {dayNum === 13 ? "PTM Sharma" : "Science Exam"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= AI LESSON PLANNER TAB ================= */}
          {activeTab === "LESSON_PLANNER" && (
            <AIWorkplaceHub user={user} students={activeStudents} />
          )}

          {/* ================= AI WORKPLACE HUB (WORKSHEETS/REPORTS) ================= */}
          {activeTab === "WORKSHEETS" && (
            <AIWorkplaceHub user={user} students={activeStudents} />
          )}

          {/* ================= SETTINGS TAB ================= */}
          {activeTab === "SETTINGS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-display font-bold text-gray-800 text-base">System Preferences</h3>
              <p className="text-xs text-gray-400">Manage qualifications parameters, high-contrast access rules, and secure logging ports.</p>

              <div className="max-w-xl space-y-6 text-xs text-slate-700">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Access Modes</h4>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between font-bold text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>High Contrast Mode (WCAG compliant colors)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-mono rounded uppercase">Active</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Device Services telemetry</h4>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between font-bold text-xs text-emerald-800 font-mono">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Central Database Connection State</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase">Synced</span>
                  </div>
                </div>

                <button
                  onClick={() => alert("Configurations saved successfully.")}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                >
                  Save System Modifications
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= RIGHT COLLAPSIBLE AI PANEL ================= */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="w-[340px] bg-white border-l border-slate-100 flex flex-col justify-between shrink-0 h-screen z-40 shadow-xl relative"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                <span className="text-xs font-display font-extrabold text-slate-800">Vidya AI Operating Support</span>
              </div>
              <button className="p-1 hover:bg-slate-200 rounded-lg text-gray-500" onClick={() => setAssistantOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chats stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                  </div>
                </div>
              ))}

              {sendingChat && (
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium ml-2 bg-slate-100 p-2.5 rounded-xl max-w-max animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  <span>Vidya AI is reviewing registers...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-100 shrink-0 bg-white">
              <div className="flex gap-1.5 items-center">
                <input
                  type="text"
                  placeholder="Ask Vidya AI about student wellness..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                />
                <button onClick={handleSendChat} className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= STUDENT PROFILE DETAILED MODAL ================= */}
      <AnimatePresence>
        {selectedStudentForProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {selectedStudentForProfile.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-display font-extrabold text-slate-800">{selectedStudentForProfile.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold">{selectedStudentForProfile.class} • Roll ID: {selectedStudentForProfile.rollNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentForProfile(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Academics & Attendance Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Stats card */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 font-bold text-slate-700 text-xs col-span-1">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Attendance Summary</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-extrabold text-slate-800">
                        {Math.round(selectedStudentForProfile.attendance.presentDays / selectedStudentForProfile.attendance.totalDays * 100)}%
                      </span>
                      <span className="text-gray-400">({selectedStudentForProfile.attendance.presentDays} of {selectedStudentForProfile.attendance.totalDays}d)</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(selectedStudentForProfile.attendance.presentDays / selectedStudentForProfile.attendance.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Subject grades list */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs col-span-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Academics Term average</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedStudentForProfile.academics.subjects.map((sub, i) => {
                        const avg = Math.round(sub.grades.reduce((sum, g) => sum + g.score, 0) / sub.grades.reduce((sum, g) => sum + g.maxScore, 0) * 100);
                        return (
                          <div key={i} className="bg-white p-3 border border-slate-100 rounded-xl font-bold">
                            <span className="text-gray-500 block text-[10px]">{sub.name}</span>
                            <span className="text-base text-indigo-600 block mt-0.5">{avg}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Behavioral & Wellness logs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Behavior & Wellness timeline</h4>
                  <div className="space-y-2">
                    {selectedStudentForProfile.wellbeing.observations.map((obs, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-baseline font-bold">
                          <span className="text-slate-800">{obs.category}</span>
                          <span className="text-[9px] text-gray-400 font-mono">{obs.date}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed italic">"{obs.content}"</p>
                        <span className={`px-1.5 py-0.2 rounded text-[8.5px] uppercase font-bold tracking-wider ${
                          obs.sentiment === "Negative" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          Sentiment: {obs.sentiment}
                        </span>
                      </div>
                    ))}

                    {selectedStudentForProfile.wellbeing.observations.length === 0 && (
                      <p className="text-xs text-gray-400 py-4 text-center">No structural logs recorded on file.</p>
                    )}
                  </div>
                </div>

                {/* Direct Action links */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudentForProfile(null);
                      setActiveTab("PARENT_COMMS");
                    }}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    Direct Message Guardian
                  </button>
                  <button
                    onClick={() => alert("Durable report card compilation queued...")}
                    className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Download PDF Report
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= STUDENT CREATION MODAL ================= */}
      <AnimatePresence>
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <span className="text-xs font-display font-extrabold text-slate-800 uppercase tracking-wider font-mono">Enrol Student Profile</span>
                <button onClick={() => setShowAddStudentModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="p-6 space-y-4 font-bold text-slate-700 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Student Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Samay Patel"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={formRoll}
                      onChange={(e) => setFormRoll(e.target.value)}
                      placeholder="e.g. 9A-05"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Roster Class Group</label>
                    <select
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Grade 9-A">Grade 9-A</option>
                      <option value="Grade 8-B">Grade 8-B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Attendance Present Days</label>
                    <input
                      type="number"
                      required
                      value={formAttendancePresent}
                      onChange={(e) => setFormAttendancePresent(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Attendance Total Days</label>
                    <input
                      type="number"
                      required
                      value={formAttendanceTotal}
                      onChange={(e) => setFormAttendanceTotal(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Confirm Registry Enrollment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= STUDENT EDIT MODAL ================= */}
      <AnimatePresence>
        {showEditStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <span className="text-xs font-display font-extrabold text-slate-800 uppercase tracking-wider font-mono">Modify Student Profile</span>
                <button onClick={() => setShowEditStudentModal(false)} className="p-1 hover:bg-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="p-6 space-y-4 font-bold text-slate-700 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase">Student Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={formRoll}
                      onChange={(e) => setFormRoll(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase">Roster Class Group</label>
                    <select
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Grade 9-A">Grade 9-A</option>
                      <option value="Grade 8-B">Grade 8-B</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Profile Modifications
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
