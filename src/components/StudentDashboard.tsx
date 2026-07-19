import React, { useState, useRef, useEffect } from "react";
import { Student, ChatMessage, User } from "../types";
import { useSocket } from "../lib/socket";
import { aiService } from "../services/aiService";
import { chatService } from "../services/chatService";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Send, Heart, Smile, BookOpen, Calendar, Sparkles, AlertCircle, Loader2, LogOut, Bell, Settings,
  LayoutDashboard, Award, Search, Users, ChevronRight, ChevronDown, ChevronLeft, MapPin, Clock, Download,
  Share2, Printer, CheckCircle2, X, Volume2, ArrowRight, Plus, Play, FileText, Bookmark, Check, UserCheck,
  ClipboardList, TrendingUp, Flame, HelpCircle, Upload, CheckSquare, MessageSquare, ListTodo, Sliders, ShieldAlert, Menu
} from "lucide-react";
import ParentCommsCenter from "./ParentCommsCenter";

interface StudentDashboardProps {
  user: User;
  students: Student[];
  onAddLog: (studentId: string, type: string, data: any) => Promise<boolean>;
  onLogout: () => void;
}

interface Notice {
  id: string;
  title: string;
  category: "Circular" | "Holiday" | "Exam" | "Event";
  date: string;
  content: string;
  acknowledged: boolean;
}

interface Goal {
  id: string;
  text: string;
  category: "daily" | "weekly" | "academic";
  completed: boolean;
}

export default function StudentDashboard({ user, students, onAddLog, onLogout }: StudentDashboardProps) {
  const { socket, sendChatMessage, sendTypingStatus } = useSocket();
  const [teacherTyping, setTeacherTyping] = useState(false);
  const currentStudent = students.find((s) => s.id === user.associatedStudentId) || students[0];

  // Wide range of tabs matching the Left Sidebar specification
  const [activeTab, setActiveTab] = useState<
    | "DASHBOARD" | "SUBJECTS" | "ATTENDANCE" | "HOMEWORK" | "ASSIGNMENTS" | "EXAMS" | "TIMETABLE"
    | "NOTES" | "AI_COACH" | "AI_DOUBT_SOLVER" | "REVISION_PLANNER" | "PRACTICE_TESTS" | "ANALYTICS"
    | "ACHIEVEMENTS" | "LEADERBOARD" | "GOALS" | "WELLNESS" | "MESSAGES" | "DOWNLOADS" | "PROFILE" | "SETTINGS"
  >("DASHBOARD");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // State managers
  const [parentLanguage, setParentLanguage] = useState<"EN" | "HI">("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [homeworkTab, setHomeworkTab] = useState<"pending" | "completed">("pending");
  const [leaderboardTab, setLeaderboardTab] = useState<"improved" | "attendance" | "homework">("improved");
  
  // Local active goals
  const [goalsList, setGoalsList] = useState<Goal[]>([
    { id: "g1", text: "Complete Chemistry Practice Worksheet Chapter 4", category: "daily", completed: false },
    { id: "g2", text: "Revise Trigonometry Formulae Sheet for 30 mins", category: "daily", completed: true },
    { id: "g3", text: "Maintain a perfect 5-day attendance streak", category: "weekly", completed: true },
    { id: "g4", text: "Achieve above 85% in the upcoming physics formative mock", category: "academic", completed: false }
  ]);
  const [newGoalText, setNewGoalText] = useState("");

  // Wellness check-in variables
  const [moodRating, setMoodRating] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [studyStress, setStudyStress] = useState<number>(2);
  const [moodNotes, setMoodNotes] = useState("");
  const [loggingMood, setLoggingMood] = useState(false);

  // Notes local storage mockup
  const [studentNotes, setStudentNotes] = useState<string>(
    `# Physics Chapter 4 Revision Notes\n- Newton's Laws are highly applicable here.\n- Friction coefficient formula: f = μ * N\n- Remember to verify standard units (Newtons, kg, m/s^2)`
  );
  const [isSummarizingNotes, setIsSummarizingNotes] = useState(false);

  // Slack + WhatsApp inspired Messages center
  const [selectedTeacherId, setSelectedTeacherId] = useState("t1");
  const [mobileShowStudentChat, setMobileShowStudentChat] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [teacherChatHistory, setTeacherChatHistory] = useState<{ [key: string]: Array<{ sender: "student" | "teacher"; text: string; date: string; attachedFile?: string }> }>({
    "t1": [
      { sender: "teacher", text: "Hi Aarav! Excellent work on your last mathematics assignment. Your scores are improving.", date: "10:15 AM" },
      { sender: "student", text: "Thank you Mr. Shastri! I am practicing trigonometric proofs with the Vidya Study Planner.", date: "10:30 AM" },
      { sender: "teacher", text: "Superb. Remember to look at application-based worksheets before Thursday's exam.", date: "10:32 AM" }
    ],
    "t2": [
      { sender: "teacher", text: "Please upload the revised Science Lab File by tomorrow evening.", date: "Yesterday" }
    ]
  });

  const teachersList = [
    { id: "t1", name: "Mr. Ananya Shastri", subject: "Mathematics & Calculus", status: "Online", icon: "👨‍🏫" },
    { id: "t2", name: "Dr. Rajeev Verma", subject: "Physics & Chemistry", status: "Offline", icon: "👨‍🔬" },
    { id: "t3", name: "Mrs. Sarah Jones", subject: "English & Social Studies", status: "Away", icon: "👩‍🏫" }
  ];

  // AI Doubt Solver Upload Simulation
  const [doubtInput, setDoubtInput] = useState("");
  const [solvingDoubt, setSolvingDoubt] = useState(false);
  const [doubtSolution, setDoubtSolution] = useState<any | null>(null);

  // Practice Tests Simulation
  const [activeTestSubject, setActiveTestSubject] = useState("Mathematics");
  const [testQuestions, setTestQuestions] = useState([
    { q: "If sin(θ) = 3/5, what is the value of cos(θ) for an acute angle?", options: ["4/5", "3/4", "5/4", "1/2"], correct: "4/5", selected: "" },
    { q: "Which of Newton's laws explains the conservation of momentum?", options: ["First Law", "Second Law", "Third Law", "Universal Gravitation"], correct: "Third Law", selected: "" }
  ]);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Leaderboard opt-out variable
  const [optedOutOfLeaderboard, setOptedOutOfLeaderboard] = useState(false);

  // Shared Chat Companion Panel (Vidya AI)
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: `Hey there! I am Vidya, your AI personal mentor. I have analyzed your grades (${
        Math.round(
          currentStudent.academics.subjects.flatMap((s) => s.grades).reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
            (currentStudent.academics.subjects.flatMap((s) => s.grades).length || 1)
        )
      }% average) and study streak. I can generate customized mock tests, explain hard chemistry chapters, or design your daily study timetable. What are we mastering today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, sendingMessage]);

  // Calculations for KPI cards
  const attRate = currentStudent.attendance.totalDays > 0 ? Math.round((currentStudent.attendance.presentDays / currentStudent.attendance.totalDays) * 100) : 100;
  const allGrades = currentStudent.academics.subjects.flatMap((s) => s.grades);
  const avgGrade = allGrades.length > 0 ? Math.round(allGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / allGrades.length) : 80;
  const pendingHomework = currentStudent.homework.filter((h) => h.status === "Pending");
  const completedHomework = currentStudent.homework.filter((h) => h.status === "Completed" || h.status === "Late");
  const homeworkCompRate = currentStudent.homework.length > 0 ? Math.round((completedHomework.length / currentStudent.homework.length) * 100) : 100;

  // AI Chat Messenger Integration
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sendingMessage) return;

    const userMsg: ChatMessage = {
      id: `std-msg-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setSendingMessage(true);

    try {
      const data = await aiService.chat(
        currentStudent.id,
        [...chatHistory, userMsg].map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          text: msg.text
        }))
      );
      if (data.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `bot-msg-${Date.now()}`,
            role: "model",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error("API returned error");
      }
    } catch (e) {
      console.error(e);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "model",
          text: `I had a quick glitch connecting to the main server. But don't worry, here is your immediate strategy: split your homework into 15-minute sprints and focus on trigonometry proofs. Ask me any specific chemistry or math concept to begin!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Chat message submit wrapper
  const handleChatFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(chatInput);
  };

  // Solve doubts instantly with AI step-by-step
  const handleDoubtSolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;
    setSolvingDoubt(true);
    setDoubtSolution(null);

    try {
      const data = await aiService.solveDoubt(doubtInput, activeTestSubject);
      if (data.success && data.solution) {
        setDoubtSolution(data.solution);
      } else {
        throw new Error("Failed to solve doubt");
      }
    } catch (err) {
      console.error(err);
      setDoubtSolution({
        question: doubtInput,
        steps: [
          "Identify parameters: sin(θ) = opposite/hypotenuse = 3/5. Therefore opposite = 3, hypotenuse = 5.",
          "Apply Pythagorean Theorem: adjacent^2 + opposite^2 = hypotenuse^2.",
          "Solve for adjacent side: adjacent = √(5^2 - 3^2) = √(25 - 9) = √16 = 4.",
          "Formulate Cosine: cos(θ) = adjacent/hypotenuse = 4/5."
        ],
        hint: "Always draw a right-angled triangle first to visualize the sides.",
        alternatives: "Alternative: Use the trigonometric identity sin²(θ) + cos²(θ) = 1. Therefore, cos(θ) = 4/5.",
        related: "Trigonometric ratios, unit circle projections, identity calculations."
      });
    } finally {
      setSolvingDoubt(false);
    }
  };

  // Submit mood entry
  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingMood(true);
    const success = await onAddLog(currentStudent.id, "MOOD", { rating: moodRating, notes: moodNotes });
    setLoggingMood(false);
    if (success) {
      setMoodNotes("");
      alert("Holistic study wellness recorded. Stay focused and hydrated!");
    } else {
      alert("Encountered connection errors. Please retry.");
    }
  };

  // Complete Homework simulation
  const handleHomeworkComplete = async (hwId: string) => {
    const success = await onAddLog(currentStudent.id, "HOMEWORK_STATUS", {
      homeworkId: hwId,
      status: "Completed",
      score: 10
    });
    if (success) {
      alert("Worksheet uploaded and analyzed successfully! Streak preserved.");
    }
  };

  // Submit direct message to teacher
  const handleTeacherMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !user) return;
    const studentId = user.associatedStudentId || "std-01";
    const room = `student-teacher:${studentId}:${selectedTeacherId}`;

    sendChatMessage(room, user.name, "Student", typedMessage);
    sendTypingStatus(room, "Student", false);
    setTypedMessage("");
  };

  // Synchronize student-teacher messages and join socket room
  useEffect(() => {
    if (!socket || !user) return;
    const studentId = user.associatedStudentId || "std-01";
    const room = `student-teacher:${studentId}:${selectedTeacherId}`;
    socket.emit("chat:join", room);

    chatService.getMessages(room)
      .then((messages) => {
        if (messages.length > 0) {
          const mapped = messages.map((m: any) => ({
            sender: m.senderRole === "Student" ? "student" as const : "teacher" as const,
            text: m.text,
            date: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            attachedFile: m.attachment?.name
          }));
          setTeacherChatHistory((prev) => ({
            ...prev,
            [selectedTeacherId]: mapped
          }));
        }
      })
      .catch((err) => console.error("Error fetching historical student DMs:", err));
  }, [selectedTeacherId, socket, user]);

  // Handle live incoming messages & typing status
  useEffect(() => {
    if (!socket || !user) return;
    const studentId = user.associatedStudentId || "std-01";

    const onChatMessage = (msg: any) => {
      const parts = msg.room.split(":");
      if (parts[0] === "student-teacher") {
        const sId = parts[1];
        const teacherId = parts[2];
        if (sId === studentId) {
          const uiMsg = {
            sender: msg.senderRole === "Student" ? "student" as const : "teacher" as const,
            text: msg.text,
            date: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            attachedFile: msg.attachment?.name
          };
          setTeacherChatHistory((prev) => {
            const list = prev[teacherId] || [];
            if (list.some((m) => m.text === uiMsg.text && m.sender === uiMsg.sender)) return prev;
            return {
              ...prev,
              [teacherId]: [...list, uiMsg]
            };
          });
        }
      }
    };

    const onTyping = (data: any) => {
      if (data.room === `student-teacher:${studentId}:${selectedTeacherId}` && data.sender !== "Student") {
        setTeacherTyping(data.isTyping);
      }
    };

    socket.on("chat:message", onChatMessage);
    socket.on("chat:typing", onTyping);

    return () => {
      socket.off("chat:message", onChatMessage);
      socket.off("chat:typing", onTyping);
    };
  }, [socket, user, selectedTeacherId]);

  // Add customized goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoalsList((prev) => [
      ...prev,
      { id: `g-${Date.now()}`, text: newGoalText, category: "daily", completed: false }
    ]);
    setNewGoalText("");
  };

  // Summarize notes using AI
  const handleSummarizeNotes = async () => {
    if (!studentNotes.trim()) return;
    setIsSummarizingNotes(true);
    try {
      const data = await aiService.summarizeNotes(studentNotes);
      if (data.success && data.summary) {
        setStudentNotes((prev) => `${prev}\n\n## AI Note Summary\n${data.summary}`);
      } else {
        throw new Error("Failed to summarize notes");
      }
    } catch (err) {
      console.error(err);
      setStudentNotes((prev) => `${prev}\n\n## AI Note Summary\n- Key Formula: f = μ * N\n- Essential concept: Newton's Laws represent the foundation of classical kinematics.\n- Priority action: Memorize standard units before exams.`);
    } finally {
      setIsSummarizingNotes(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      
      {/* Sidebar mobile overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-full overflow-y-auto transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-slate-900 tracking-tight text-base block">VidyaSetu AI</span>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">Learning OS</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Active Student Info Banner */}
          <div className="mx-4 mt-4 p-3 bg-indigo-50/40 border border-indigo-50 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-display font-bold flex items-center justify-center text-xs">
              {currentStudent.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-indigo-600 tracking-wide uppercase">Student desk</p>
              <p className="text-xs font-bold text-slate-800 truncate">{currentStudent.name}</p>
              <p className="text-[10px] text-slate-400">{currentStudent.class} • Roll {currentStudent.rollNumber}</p>
            </div>
          </div>

          {/* Core Navigation Links */}
          <nav className="p-4 space-y-1 max-h-[60vh] overflow-y-auto">
            {[
              { id: "DASHBOARD", label: "Dashboard Home", icon: LayoutDashboard },
              { id: "SUBJECTS", label: "My Subjects", icon: BookOpen },
              { id: "ATTENDANCE", label: "My Attendance", icon: Calendar },
              { id: "HOMEWORK", label: "Homework Ledger", icon: BookOpen },
              { id: "ASSIGNMENTS", label: "Assignments Console", icon: ClipboardList },
              { id: "EXAMS", label: "Exams & Results", icon: Award },
              { id: "TIMETABLE", label: "School Timetable", icon: Clock },
              { id: "NOTES", label: "My Study Notes", icon: FileText },
              { id: "AI_COACH", label: "AI Study Coach", icon: Brain, highlight: true },
              { id: "AI_DOUBT_SOLVER", label: "AI Doubt Solver", icon: Sparkles },
              { id: "REVISION_PLANNER", label: "Revision Planner", icon: ListTodo },
              { id: "PRACTICE_TESTS", label: "Practice Tests", icon: HelpCircle },
              { id: "ANALYTICS", label: "Performance Analytics", icon: TrendingUp },
              { id: "ACHIEVEMENTS", label: "My Achievements", icon: Award },
              { id: "LEADERBOARD", label: "Privacy Leaderboard", icon: Users },
              { id: "GOALS", label: "Study Goals", icon: CheckSquare },
              { id: "WELLNESS", label: "Wellness Mood Log", icon: Heart },
              { id: "DOWNLOADS", label: "Downloads Library", icon: Download },
              { id: "PROFILE", label: "Academic Profile", icon: UserCheck },
              { id: "SETTINGS", label: "Workspace Settings", icon: Settings }
            ].map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`sidebar-${link.id}`}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : link.highlight ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN COLUMN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-100 flex items-center justify-center shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-display font-bold text-slate-900">
                {activeTab === "DASHBOARD" && "Student Workspace Dashboard"}
                {activeTab === "SUBJECTS" && "Curriculum Directory"}
                {activeTab === "ATTENDANCE" && "My Classroom Attendance"}
                {activeTab === "HOMEWORK" && "Homework & Worksheets"}
                {activeTab === "ASSIGNMENTS" && "Assignments & Project Submissions"}
                {activeTab === "EXAMS" && "Assessment Schedules & Past Marks"}
                {activeTab === "TIMETABLE" && "School Class Timetable"}
                {activeTab === "NOTES" && "My Digital Notebook"}
                {activeTab === "AI_COACH" && "Vidya AI Tutor & Coach"}
                {activeTab === "AI_DOUBT_SOLVER" && "AI Step-by-Step Doubt Solver"}
                {activeTab === "REVISION_PLANNER" && "Daily Revision Schedules"}
                {activeTab === "PRACTICE_TESTS" && "Custom MCQ Practice Engine"}
                {activeTab === "ANALYTICS" && "Dossier & Learning Analytics"}
                {activeTab === "ACHIEVEMENTS" && "Badges & Milestone Certificates"}
                {activeTab === "LEADERBOARD" && "Class Learning Leaderboard"}
                {activeTab === "GOALS" && "My Learning Targets"}
                {activeTab === "WELLNESS" && "Mental Health & Stress Tracker"}
                {activeTab === "MESSAGES" && "Direct Line to Tutors"}
                {activeTab === "DOWNLOADS" && "Syllabus Downloads Library"}
                {activeTab === "PROFILE" && "Personal Academic Profile"}
                {activeTab === "SETTINGS" && "Interface Configurations"}
              </h1>
              <p className="text-xs text-slate-400">
                School code: <span className="font-mono font-bold text-indigo-600">{user.schoolCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search bar */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects, notes, tasks..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            {/* Attendance indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl px-3 py-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-slate-700">Streak: 6 Days</span>
            </div>

            {/* Professional Messages Top Navbar Link with Unread Badge */}
            <button
              onClick={() => {
                setActiveTab("MESSAGES");
                setMobileMenuOpen(false);
              }}
              className={`p-2 hover:bg-slate-50 rounded-xl relative transition-all ${
                activeTab === "MESSAGES" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "text-slate-500"
              }`}
              title="Dedicated Messaging Terminal (3 Unread)"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-indigo-600 rounded-full border border-white scale-90 flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Notification drop */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-30 text-xs"
                  >
                    <p className="font-bold text-slate-800 pb-1.5 border-b border-slate-50">Notifications Center</p>
                    <div className="space-y-3 mt-3">
                      <div className="p-2 bg-indigo-50/50 rounded-xl">
                        <p className="font-bold text-indigo-950">AI Homework Recommendation</p>
                        <p className="text-slate-500 text-[10px]">Verify Physics formulas based on weak test scores.</p>
                      </div>
                      <div className="p-2 bg-rose-50/50 rounded-xl">
                        <p className="font-bold text-rose-950">Calculus Quiz tomorrow</p>
                        <p className="text-slate-500 text-[10px]">Prepare worksheets before morning classes begin.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Persistent AI Toggle Icon */}
            <button
              onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
              className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1"
              title="Toggle AI Companion Sidebar"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-bold uppercase hidden lg:inline">Ask Vidya</span>
            </button>
          </div>
        </header>

        {/* Search Results Display */}
        {searchQuery && (
          <div className="mx-6 mt-6 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
            <p className="text-xs font-bold text-indigo-800 mb-2">Search Filter Active: "{searchQuery}"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentStudent.academics.subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((s, i) => (
                <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-700">{s.name} Subject Card</span>
                  <button onClick={() => { setActiveTab("SUBJECTS"); setSearchQuery(""); }} className="text-indigo-600 font-bold hover:underline">Open Tab</button>
                </div>
              ))}
              {goalsList.filter(g => g.text.toLowerCase().includes(searchQuery.toLowerCase())).map((g, i) => (
                <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">{g.text}</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">Goal</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. DYNAMIC VIEWS CONTAINER */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* TAB: DASHBOARD */}
          {activeTab === "DASHBOARD" && (
            <div className="space-y-6">
              {/* Daily Roadmap / Core Objective Questions */}
              <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/30 border border-indigo-100/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-md uppercase font-mono tracking-wider">Daily Study Agenda</span>
                  <h2 className="text-lg font-display font-bold text-slate-900">What should you master today, {currentStudent.name.split(" ")[0]}?</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have <span className="font-bold text-rose-600">{pendingHomework.length} homework</span> sheets pending. 
                    {(currentStudent as any).predictedPerformance !== undefined ? (
                      <span> Your predicted term performance is <span className="font-bold text-indigo-600">{(currentStudent as any).predictedPerformance.toFixed(1)}%</span>. Vidya AI identifies <span className="font-bold text-indigo-600">{(currentStudent as any).strongSubject}</span> as your strongest subject, and suggests focusing on <span className="font-bold text-rose-600">{(currentStudent as any).weakSubject}</span> for revision.</span>
                    ) : (
                      <span> Vidya AI recommends dedicating 35 minutes to <span className="font-bold text-indigo-600">Trigonometric proofs</span> in Mathematics before Thursday's exam cycle.</span>
                    )}
                  </p>
                  
                  {/* Streak & Daily Goals summary mini-widget */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-white border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> Study Streak: 6 Days
                    </span>
                    <span className="px-3 py-1 bg-white border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed Tasks Today: {goalsList.filter(g => g.completed && g.category === "daily").length}
                    </span>
                  </div>
                </div>
                <div className="absolute right-6 bottom-0 top-0 w-32 hidden md:flex items-center justify-center text-indigo-200">
                  <Sparkles className="w-20 h-20 stroke-[1]" />
                </div>
              </div>

              {/* Core Analytics KPI Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Grade Averages */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subject Average</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-display font-bold text-slate-800">{avgGrade}%</h3>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Formative Tier</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${avgGrade}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400">Class percentile ranks high in physics lab assignments.</p>
                </div>

                {/* 2. Attendance Status */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance Register</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-display font-bold text-emerald-600">{attRate}%</h3>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Excellent</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${attRate}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400">No unexcused sick leaves flagged this quarterly roster.</p>
                </div>

                {/* 3. Homework Accomplishment ratio */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Homework Ledger</span>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-display font-bold text-slate-800">{completedHomework.length}/{currentStudent.homework.length}</h3>
                    <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded">{pendingHomework.length} Pending</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${homeworkCompRate}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400">Preserve completion rates to elevate final internal rankings.</p>
                </div>

              </div>

              {/* Two-Column Detail Block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Daily Class Schedule & Pending Assignments list */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Today's Classes Timeline */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <h3 className="font-display font-bold text-slate-800 text-sm">Today's Class Schedule</h3>
                      <button onClick={() => setActiveTab("TIMETABLE")} className="text-xs font-bold text-indigo-600 hover:underline">View Full Timetable →</button>
                    </div>
                    
                    <div className="space-y-3 text-xs">
                      {[
                        { time: "08:30 AM - 09:30 AM", subject: "Mathematics & Calculus", teacher: "Mr. Ananya Shastri", room: "Lecture Room 4B" },
                        { time: "09:45 AM - 10:45 AM", subject: "Physics & Lab Work", teacher: "Dr. Rajeev Verma", room: "Lab Block A" },
                        { time: "11:00 AM - 12:00 PM", subject: "English Literature", teacher: "Mrs. Sarah Jones", room: "Syllabus Hall 1" }
                      ].map((cls, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-800 block">{cls.subject}</span>
                            <span className="text-slate-400 text-[10px]">{cls.teacher} • {cls.room}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{cls.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Homework upload arena */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <h3 className="font-display font-bold text-slate-800 text-sm">Pending Deliverables & Worksheets</h3>
                      <button onClick={() => setActiveTab("HOMEWORK")} className="text-xs font-bold text-indigo-600 hover:underline">Submit Homework →</button>
                    </div>

                    <div className="space-y-3">
                      {pendingHomework.map((hw) => (
                        <div key={hw.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded uppercase">{hw.subject}</span>
                            <p className="font-bold text-slate-800 mt-1">{hw.title}</p>
                            <span className="text-[10px] text-slate-400 block font-mono">Due on: {hw.dueDate}</span>
                          </div>
                          <button
                            onClick={() => handleHomeworkComplete(hw.id)}
                            className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] shadow-sm transition-all"
                          >
                            Upload Worksheet
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Learning Insights (Natural language insights block) */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                      <h3 className="font-display font-bold text-slate-800 text-sm">Vidya AI's Behavior & Performance Insights</h3>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="p-3 bg-indigo-50/20 border border-indigo-50 rounded-xl space-y-1">
                        <p className="font-bold text-indigo-900">1. Optimized Morning Peak Performance</p>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          <strong>Data Analyzed:</strong> Log submission times vs grade scores.
                        </p>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          <strong>Why:</strong> You perform substantially better in Mathematics assessments during morning school hours.
                        </p>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          <strong>Action:</strong> Allocate tough algebraic revisions to 08:30 AM slots rather than late night schedules.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800">2. Homework Submission Velocity</p>
                        <p className="text-slate-500 leading-relaxed text-[11px]">
                          <strong>Data Analyzed:</strong> 30-day homework tracker.
                        </p>
                        <p className="text-slate-500 leading-relaxed text-[11px]">
                          <strong>Why:</strong> Science worksheet completion velocity improved by 14% since using the doubt solver.
                        </p>
                        <p className="text-slate-500 leading-relaxed text-[11px]">
                          <strong>Action:</strong> Continue tracking formula checklist markers before submission.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Daily Goals, Streak, Mood Wellness & Motivational Quote */}
                <div className="space-y-6">
                  
                  {/* Daily Goals Checkbox Tracker */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-xs font-bold text-slate-800">My Study Goals</span>
                      <button onClick={() => setActiveTab("GOALS")} className="text-[10px] font-bold text-indigo-600 hover:underline">Manage</button>
                    </div>

                    <div className="space-y-2.5">
                      {goalsList.filter(g => g.category === "daily").map((g) => (
                        <label key={g.id} className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={g.completed}
                            onChange={() => {
                              setGoalsList(prev => prev.map(item => item.id === g.id ? { ...item, completed: !item.completed } : item));
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-200 mt-0.5"
                          />
                          <span className={g.completed ? "line-through text-slate-400" : ""}>{g.text}</span>
                        </label>
                      ))}
                    </div>

                    <form onSubmit={handleAddGoal} className="flex gap-1.5 pt-2">
                      <input
                        type="text"
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="Add dynamic study task..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  {/* Motivational Quote Widget */}
                  <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-indigo-300 font-mono block tracking-wider">Morning Motivation</span>
                    <p className="text-xs leading-relaxed italic text-indigo-100">
                      "Education is not the learning of facts, but the training of the mind to think."
                    </p>
                    <span className="text-[10px] text-indigo-400 block">— Albert Einstein</span>
                  </div>

                  {/* Wellness Mood logger mini-widget */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <span className="text-xs font-bold text-slate-800">Hydrate & check-in mood</span>
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setMoodRating(v)}
                          className={`w-8 h-8 rounded-full text-sm transition-all ${moodRating === v ? "bg-rose-50 border-rose-200 scale-110 ring-2 ring-rose-300" : "bg-slate-50 border border-slate-100"}`}
                        >
                          {["😢", "😰", "😐", "🙂", "😎"][v - 1]}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleMoodSubmit}
                      className="w-full py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-[10px]"
                    >
                      Log Mood Reflection
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB: SUBJECTS */}
          {activeTab === "SUBJECTS" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStudent.academics.subjects.map((sub, idx) => {
                  const sAvg = Math.round(sub.grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / (sub.grades.length || 1));
                  const isWeak = sAvg < 75;
                  return (
                    <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Class Subject</span>
                          <h4 className="font-display font-bold text-slate-900 text-base">{sub.name}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${isWeak ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {sAvg}%
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-500">
                        <p><strong>Primary Advisor:</strong> Mr. Shastri</p>
                        <p><strong>Weekly Attendance:</strong> 100%</p>
                        <p><strong>Chapter Status:</strong> {isWeak ? "Trigonometric ratios (Needs Practice)" : "Linear Equations (Mastered)"}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-50 flex gap-2">
                        <button
                          onClick={() => {
                            setActiveTab("AI_COACH");
                            handleSendMessage(`Explain weak chapters in ${sub.name} step by step.`);
                          }}
                          className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors text-center"
                        >
                          Consult AI Coach
                        </button>
                        <button
                          onClick={() => setActiveTab("EXAMS")}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg transition-colors"
                        >
                          Grade Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {activeTab === "ATTENDANCE" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Classroom Attendance Ledger</h3>
                  <p className="text-xs text-slate-400">RFID automatic logging records updated live by classroom portals.</p>
                </div>
                <div className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">Ratio: {attRate}%</div>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Total Days</span>
                  <span className="text-lg font-bold text-slate-800">{currentStudent.attendance.totalDays}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Present Sessions</span>
                  <span className="text-lg font-bold text-emerald-600">{currentStudent.attendance.presentDays}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Absent Entries</span>
                  <span className="text-lg font-bold text-rose-500">
                    {currentStudent.attendance.totalDays - currentStudent.attendance.presentDays}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">RFID Status</span>
                  <span className="text-xs font-bold text-indigo-600 block mt-1">Verified Entry</span>
                </div>
              </div>

              {/* Visual Calendar Grid */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Visual Day-to-Day Register</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {currentStudent.attendance.history.map((h, i) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[8px] text-slate-400 font-mono block">{h.date.slice(5)}</span>
                      <span className={`text-[10px] font-bold ${h.status === "Present" ? "text-emerald-600" : "text-rose-500"}`}>{h.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOMEWORK & ASSIGNMENTS (Unified layout) */}
          {(activeTab === "HOMEWORK" || activeTab === "ASSIGNMENTS") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">{activeTab === "HOMEWORK" ? "Homework Worksheets" : "Assignments Hub"}</h3>
                  <p className="text-xs text-slate-400">Submit homework modules and check tutor evaluations.</p>
                </div>
                
                {/* Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setHomeworkTab("pending")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${homeworkTab === "pending" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Pending ({pendingHomework.length})
                  </button>
                  <button
                    onClick={() => setHomeworkTab("completed")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${homeworkTab === "completed" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Completed ({completedHomework.length})
                  </button>
                </div>
              </div>

              {homeworkTab === "pending" ? (
                <div className="space-y-4">
                  {pendingHomework.map((hw) => (
                    <div key={hw.id} className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded uppercase">{hw.subject}</span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1.5">{hw.title}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5">Please check chapter formulas before uploading files.</p>
                        <span className="text-[10px] text-rose-500 font-mono block mt-2">⏳ Due on: {hw.dueDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          onClick={() => {
                            setActiveTab("AI_COACH");
                            handleSendMessage(`Explain worksheet '${hw.title}' in ${hw.subject} using alternative examples.`);
                          }}
                          className="px-3 py-2 bg-white border border-slate-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                        >
                          Ask AI Hint
                        </button>
                        <button
                          onClick={() => handleHomeworkComplete(hw.id)}
                          className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all"
                        >
                          Upload Submission
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {completedHomework.map((hw) => (
                    <div key={hw.id} className="py-3.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">{hw.subject}</span>
                        <span className="font-bold text-slate-800">{hw.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg font-mono">Score: {hw.score || 10}/10</span>
                        <span className="text-slate-400 font-semibold">Evaluated</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: EXAMS */}
          {activeTab === "EXAMS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Assessment Cards & Exam Schedules</h3>
                  <p className="text-xs text-slate-400">Consolidated history of formative and summative school terms.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 block">AI Prep Score</span>
                  <span className="text-lg font-bold font-mono text-slate-800">84% Readiness</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {currentStudent.academics.subjects.map((sub, idx) => {
                  const sAvg = Math.round(sub.grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / (sub.grades.length || 1));
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">{sub.name}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-indigo-700 font-bold font-mono rounded">
                          {sAvg}% Avg
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 pt-2 text-xs">
                        {sub.grades.map((g, gIdx) => (
                          <div key={gIdx} className="flex justify-between text-slate-500">
                            <span>{g.assessment}</span>
                            <span className="font-mono font-semibold">{g.score}/{g.maxScore}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TIMETABLE & REVISION_PLANNER */}
          {(activeTab === "TIMETABLE" || activeTab === "REVISION_PLANNER") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Weekly Class & Revision Planner</h3>
                <p className="text-xs text-slate-400">Coordinate school hours with AI-generated self-paced study blocks.</p>
              </div>

              {/* Grid representation for Mon-Fri timetable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-indigo-700 block border-b border-indigo-100/50 pb-1">{day}</span>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800">08:30: Math</p>
                      <p className="text-slate-400">Classroom 4B</p>
                      <p className="font-semibold text-slate-800 mt-1">10:00: Physics</p>
                      <p className="text-slate-400">Lab Block A</p>
                      <p className="font-semibold text-slate-800 mt-1">12:30: English</p>
                      <p className="text-slate-400">Main Hall</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTES & DOWNLOADS */}
          {(activeTab === "NOTES" || activeTab === "DOWNLOADS") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Notes & Syllabi Download Vault</h3>
                  <p className="text-xs text-slate-400">Access text sheets and offline revision notes with a single click.</p>
                </div>
                <button
                  onClick={handleSummarizeNotes}
                  disabled={isSummarizingNotes}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  {isSummarizingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Summarizer Notes
                </button>
              </div>

              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-mono h-48 focus:outline-indigo-500"
              />

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">Downloadable Materials</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { title: "Calculus_Formulas_Trigonometry.pdf", size: "1.2 MB" },
                    { title: "Physics_Kinematics_Lab_Guidelines.pdf", size: "850 KB" }
                  ].map((file, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                      <span className="font-mono text-slate-700">{file.title} ({file.size})</span>
                      <button onClick={() => alert(`Starting secure download: ${file.title}`)} className="text-indigo-600 font-bold hover:underline">Download</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI COACH & DOUBT SOLVER */}
          {(activeTab === "AI_COACH" || activeTab === "AI_DOUBT_SOLVER") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Vidya AI Personal Mentor</h3>
                  <p className="text-xs text-slate-400">Step-by-step concepts walkthroughs and practice questions solver.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("AI_COACH")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === "AI_COACH" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Coach chat
                  </button>
                  <button
                    onClick={() => setActiveTab("AI_DOUBT_SOLVER")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === "AI_DOUBT_SOLVER" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Doubt Solver (Scan notes)
                  </button>
                </div>
              </div>

              {activeTab === "AI_DOUBT_SOLVER" ? (
                <div className="space-y-4">
                  <form onSubmit={handleDoubtSolveSubmit} className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">Type your academic doubt or upload homework image:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={doubtInput}
                        onChange={(e) => setDoubtInput(e.target.value)}
                        placeholder="e.g. sin(θ) = 3/5, find cos(θ)"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-indigo-500 font-semibold"
                      />
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">Solve</button>
                    </div>
                  </form>

                  {solvingDoubt && (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>AI running step-by-step mathematical calculations...</span>
                    </div>
                  )}

                  {doubtSolution && (
                    <div className="p-4 bg-indigo-50/20 border border-indigo-50 rounded-2xl space-y-3 text-xs text-slate-700">
                      <p className="font-bold text-indigo-950">Doubt Solution: {doubtSolution.question}</p>
                      <ol className="list-decimal list-inside space-y-1.5 pl-2 leading-relaxed">
                        {doubtSolution.steps.map((st: string, i: number) => <li key={i}>{st}</li>)}
                      </ol>
                      <p className="text-slate-500 italic mt-2"><strong>Mentor Hint:</strong> {doubtSolution.hint}</p>
                      <p className="text-slate-500 font-semibold mt-1"><strong>Alternative Approach:</strong> {doubtSolution.alternatives}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {chatHistory.map((m) => (
                      <div key={m.id} className={`flex gap-2 ${m.role === "model" ? "justify-start" : "justify-end"}`}>
                        <div className={`p-3 rounded-2xl max-w-[80%] ${m.role === "model" ? "bg-slate-50 border border-slate-100 text-slate-700" : "bg-indigo-600 text-white"}`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleChatFormSubmit} className="flex gap-2 border-t border-slate-50 pt-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask Vidya anything: e.g. teach trigonometry proofs in simple English"
                      className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                    <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg"><Send className="w-4 h-4" /></button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRACTICE_TESTS */}
          {activeTab === "PRACTICE_TESTS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Custom AI Practice Mock Test</h3>
                  <p className="text-xs text-slate-400">Generate formative test drills matching active weaknesses.</p>
                </div>
                <button
                  onClick={() => {
                    setTestSubmitted(false);
                    alert("Generating fresh Physics & Chemistry mock drill... Answer checkboxes below!");
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg"
                >
                  Regenerate Fresh Mock
                </button>
              </div>

              <div className="space-y-4">
                {testQuestions.map((qObj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <p className="font-bold text-slate-800">Q{idx + 1}: {qObj.q}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {qObj.options.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50/35">
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            checked={qObj.selected === opt}
                            onChange={() => {
                              setTestQuestions(prev => prev.map((q, qIndex) => qIndex === idx ? { ...q, selected: opt } : q));
                            }}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setTestSubmitted(true)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit Answers for AI Evaluation
                </button>

                {testSubmitted && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 space-y-2">
                    <p className="font-bold">Score: 2/2 Correct (100% Mastery)</p>
                    <p className="leading-relaxed">Excellent effort! Both application-based mathematical and motion logic rules are evaluated correctly. Streaks stored in portfolio.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS & LEADERBOARD */}
          {(activeTab === "ANALYTICS" || activeTab === "LEADERBOARD") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Academic Performance & Analytics</h3>
                  <p className="text-xs text-slate-400">Pure responsive tracking trends of assessments and leaderboard standings.</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optedOutOfLeaderboard}
                    onChange={(e) => setOptedOutOfLeaderboard(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Opt out of Class Standings</span>
                </label>
              </div>

              {/* Vector responsive tracking representation */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[160px]">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-3">Academic Growth Trend (Monthly)</span>
                <svg className="w-full max-w-lg h-24 text-indigo-600" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M 5,18 C 15,15 25,12 35,9 C 45,10 55,6 65,4 C 75,3 85,2 95,1" strokeLinecap="round" />
                  <circle cx="5" cy="18" r="1.5" fill="currentColor" />
                  <circle cx="35" cy="9" r="1.5" fill="currentColor" />
                  <circle cx="65" cy="4" r="1.5" fill="currentColor" />
                  <circle cx="95" cy="1" r="1.5" fill="currentColor" />
                </svg>
                <div className="flex justify-between w-full max-w-lg text-[9px] font-mono text-slate-400 mt-2">
                  <span>April (72%)</span>
                  <span>May (78%)</span>
                  <span>June (85%)</span>
                  <span>July (91%)</span>
                </div>
              </div>

              {!optedOutOfLeaderboard ? (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block">Class Standings (Homework & Attendance Champions)</span>
                  <div className="space-y-2 text-xs">
                    {[
                      { rank: 1, name: "Prisha Sharma", points: "980 pts", badge: "🥇 Top Performer" },
                      { rank: 2, name: "Aarav Gupta (You)", points: "940 pts", badge: "🥈 Most Improved" },
                      { rank: 3, name: "Kabir Mehta", points: "910 pts", badge: "🥉 Homework Champion" }
                    ].map((st, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-indigo-600 font-mono w-4">#{st.rank}</span>
                          <span className="font-semibold text-slate-800">{st.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">{st.points}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px]">{st.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-xs">
                  "Standings information hidden based on your privacy preference switches."
                </div>
              )}
            </div>
          )}

          {/* TAB: GOALS & ACHIEVEMENTS */}
          {(activeTab === "GOALS" || activeTab === "ACHIEVEMENTS") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Achievements, Streak Badges & Goals</h3>
                <p className="text-xs text-slate-400">Verifiable academic accolades earned through steady lesson compliance.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: "Quiz Champion", desc: "Achieved perfect score on science mock tests", date: "June 2026", color: "from-amber-500 to-orange-500" },
                  { title: "Perfect Attendance", desc: "No unexcused absences during Term 1", date: "July 2026", color: "from-emerald-500 to-teal-500" },
                  { title: "Streak Master", desc: "Maintained a 6-day study goal check-off log", date: "Active Now", color: "from-indigo-500 to-purple-500" }
                ].map((ach, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                    <div className={`p-3 bg-gradient-to-br ${ach.color} text-white rounded-xl shadow`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-800">{ach.title}</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{ach.desc}</p>
                      <span className="text-[10px] text-slate-400 font-mono block pt-1">{ach.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: WELLNESS & MESSAGES */}
          {(activeTab === "WELLNESS" || activeTab === "MESSAGES") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">{activeTab === "WELLNESS" ? "Wellness, Mind Check & Resources" : "Direct Messenger Center"}</h3>
                  <p className="text-xs text-slate-400">Communicate directly with class guides and preserve emotional balance logs.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("WELLNESS")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === "WELLNESS" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Wellness log
                  </button>
                  <button
                    onClick={() => setActiveTab("MESSAGES")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === "MESSAGES" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    Teacher messenger
                  </button>
                </div>
              </div>

              {activeTab === "WELLNESS" ? (
                <div className="space-y-6">
                  <form onSubmit={handleMoodSubmit} className="space-y-4 max-w-xl text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Mood rating today</span>
                        <select value={moodRating} onChange={(e) => setMoodRating(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg">
                          <option value="5">😎 Energetic & Confident</option>
                          <option value="4">🙂 Focused & Steady</option>
                          <option value="3">😐 Tired / Overwhelmed</option>
                          <option value="2">😰 Stressed out</option>
                        </select>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Energy level</span>
                        <select value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg">
                          <option value="5">High Energy</option>
                          <option value="3">Moderate Energy</option>
                          <option value="1">Low Energy</option>
                        </select>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Classroom stress</span>
                        <select value={studyStress} onChange={(e) => setStudyStress(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg">
                          <option value="1">Very low stress</option>
                          <option value="3">Medium pressure</option>
                          <option value="5">High academic stress</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      value={moodNotes}
                      onChange={(e) => setMoodNotes(e.target.value)}
                      placeholder="Type short study reflections to share with Mrs. Shastri..."
                      className="w-full p-3 bg-slate-50 border rounded-xl h-20"
                    />

                    <button type="submit" className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow">Log Wellness State</button>
                  </form>
                </div>
              ) : (
                <ParentCommsCenter
                  user={user}
                  students={students}
                  onAddLog={onAddLog}
                />
              )}
            </div>
          )}

          {/* TAB: PROFILE & SETTINGS */}
          {(activeTab === "PROFILE" || activeTab === "SETTINGS") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Profile settings & Language options</h3>
                <p className="text-xs text-slate-400">Configure language, themes, and check linked parent contact info.</p>
              </div>

              <div className="space-y-4 max-w-lg text-xs">
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <p><strong>Student Name:</strong> {currentStudent.name}</p>
                  <p><strong>Class Sec:</strong> {currentStudent.class}</p>
                  <p><strong>Roll number ID:</strong> {currentStudent.rollNumber}</p>
                  <p><strong>Guardian contact linked:</strong> {user.name} ({user.role})</p>
                </div>

                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 block">Workspace Language Preference</span>
                  <select
                    value={parentLanguage}
                    onChange={(e) => setParentLanguage(e.target.value as any)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg w-full"
                  >
                    <option value="EN">English (US Standard)</option>
                    <option value="HI">Hindi (हिंदी - standard layout)</option>
                  </select>
                </div>

                <button onClick={() => alert("Personal settings updated successfully!")} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow">Save settings</button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. OPTIONAL AI STUDY ASSISTANT SLIDE-OUT PANEL */}
      <AnimatePresence>
        {aiSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="w-full md:w-80 bg-white border-l border-slate-100 flex flex-col justify-between shrink-0 h-screen fixed md:relative right-0 top-0 z-40 shadow-2xl md:shadow-none"
          >
            <div>
              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-indigo-50/10">
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <Brain className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="font-display font-bold text-xs">Vidya AI Assistant</span>
                </div>
                <button onClick={() => setAiSidebarOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat companion items inside panel */}
              <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto text-[11px] leading-relaxed">
                {chatHistory.slice(-4).map((msg, i) => (
                  <div key={i} className={`p-3 rounded-xl ${msg.role === "model" ? "bg-slate-50 text-slate-700" : "bg-indigo-600 text-white"}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleChatFormSubmit} className="p-4 border-t border-slate-50 flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Vidya anything..."
                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px]"
              />
              <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg"><Send className="w-3.5 h-3.5" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
