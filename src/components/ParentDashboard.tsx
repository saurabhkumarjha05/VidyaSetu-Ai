import React, { useState, useRef, useEffect } from "react";
import { Student, ChatMessage, User } from "../types";
import { useSocket } from "../lib/socket";
import { aiService } from "../services/aiService";
import { chatService } from "../services/chatService";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Send,
  Heart,
  Smile,
  BookOpen,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  LogOut,
  Bell,
  Settings,
  LayoutDashboard,
  Award,
  MessageSquare,
  ClipboardList,
  Search,
  Users,
  ChevronRight,
  ChevronDown,
  Info,
  MapPin,
  Clock,
  ShieldAlert,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  ChevronLeft,
  X,
  Volume2,
  ArrowRight,
  Plus,
  Play,
  FileText,
  Bookmark,
  Check,
  UserCheck,
  Menu
} from "lucide-react";
import ParentCommsCenter from "./ParentCommsCenter";

interface ParentDashboardProps {
  user: User;
  students: Student[];
  onAddLog: (studentId: string, type: string, data: any) => Promise<boolean>;
  onLogout: () => void;
}

// Highly descriptive, human-labeled mocked items for extra tabs
interface Notice {
  id: string;
  title: string;
  category: "Notice" | "Holiday" | "Exam" | "Event";
  date: string;
  content: string;
  acknowledged: boolean;
  attachment?: string;
}

interface TeacherMessage {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  text: string;
  date: string;
  isPinned?: boolean;
  unread?: boolean;
}

interface PTMSlot {
  id: string;
  time: string;
  status: "Available" | "Booked" | "Selected";
}

export default function ParentDashboard({ user, students, onAddLog, onLogout }: ParentDashboardProps) {
  const { socket, sendChatMessage, sendTypingStatus } = useSocket();
  const [teacherTyping, setTeacherTyping] = useState(false);

  // Use state for selected child. Initialize to first matching or first overall
  const initialChild = students.find((s) => s.id === user.associatedStudentId) || students[0];
  const [selectedChildId, setSelectedChildId] = useState<string>(initialChild?.id || "");
  const child = students.find((s) => s.id === selectedChildId) || initialChild;

  // Tabs structure based on requested left sidebar items
  const [activeTab, setActiveTab] = useState<
    | "DASHBOARD"
    | "CHILDREN"
    | "ATTENDANCE"
    | "HOMEWORK"
    | "EXAMS"
    | "ACADEMICS"
    | "AI_ASSISTANT"
    | "COMMUNICATION"
    | "PTM"
    | "NOTICES"
    | "TRANSPORT"
    | "WELLNESS"
    | "REPORTS"
    | "SETTINGS"
  >("DASHBOARD");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Global settings / states
  const [parentLanguage, setParentLanguage] = useState<"EN" | "HI">("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  // Wellness manual state
  const [moodRating, setMoodRating] = useState<number>(4);
  const [moodNotes, setMoodNotes] = useState("");
  const [loggingMood, setLoggingMood] = useState(false);

  // Notices state with acknowledgement tracking
  const [noticesList, setNoticesList] = useState<Notice[]>([
    {
      id: "notice-01",
      title: "Quarterly Evaluation Term 1 Schedule",
      category: "Exam",
      date: "2026-07-10",
      content: "Ensure all homework assignments and revisions are compiled for evaluation checks by tomorrow morning. Results will be analyzed via VidyaSetu AI companion.",
      acknowledged: false,
      attachment: "Term-1-Syllabus.pdf"
    },
    {
      id: "notice-02",
      title: "Independence Day Cultural Fest & Assembly",
      category: "Event",
      date: "2026-07-08",
      content: "Our annual cultural integration festival will be held next Friday. Parents are cordially invited to witness student science exhibition booths and traditional performances.",
      acknowledged: true,
      attachment: "Cultural-Fest-Flyer.png"
    },
    {
      id: "notice-03",
      title: "National Holiday Notice",
      category: "Holiday",
      date: "2026-07-05",
      content: "The school will remain closed on Tuesday for public holiday compliance. Online self-paced revision sheets are posted under Homework.",
      acknowledged: true
    }
  ]);

  // Messages with teacher state (Slack + WhatsApp Inspired)
  const [selectedTeacherId, setSelectedTeacherId] = useState("t-01");
  const [mobileShowParentChat, setMobileShowParentChat] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [parentChatHistory, setParentChatHistory] = useState<{ [teacherId: string]: Array<{ sender: "parent" | "teacher"; text: string; date: string; isAttachment?: boolean; type?: string }> }>({
    "t-01": [
      { sender: "teacher", text: "Hello! Just following up on your child's recent Mathematics workbook. They are putting in solid efforts but seem exhausted during late periods.", date: "10:15 AM" },
      { sender: "parent", text: "Thank you for noting this, Mrs. Shastri. We noticed they stay up late preparing science flashcards. I will ensure they get to bed early tonight.", date: "10:30 AM" },
      { sender: "teacher", text: "That would be excellent! I have also uploaded a simplified Calculus practice worksheet as a reference. Let's touch base next week.", date: "10:35 AM" }
    ],
    "t-02": [
      { sender: "teacher", text: "Hi, I noticed some outstanding workbook files for English Literature. Is everything okay with the homework deadline?", date: "Yesterday" },
      { sender: "parent", text: "Yes, we just uploaded it. They spent extra time detailing the character summary.", date: "Yesterday" }
    ]
  });

  const teachersList = [
    { id: "t-01", name: "Mrs. Ananya Shastri", subject: "Mathematics & Calculus", isPinned: true, unreadCount: 0, status: "Active Now", experience: "12 Years", email: "a.shastri@school.edu" },
    { id: "t-02", name: "Mr. Rajeev Verma", subject: "Science & Lab Coordinator", isPinned: true, unreadCount: 1, status: "Away", experience: "8 Years", email: "r.verma@school.edu" },
    { id: "t-03", name: "Miss Sarah Jones", subject: "English Literature", isPinned: false, unreadCount: 0, status: "Offline", experience: "5 Years", email: "s.jones@school.edu" }
  ];

  // PTM slots
  const [ptmSlots, setPtmSlots] = useState<PTMSlot[]>([
    { id: "slot-01", time: "02:00 PM - 02:15 PM", status: "Available" },
    { id: "slot-02", time: "02:15 PM - 02:30 PM", status: "Booked" },
    { id: "slot-03", time: "02:30 PM - 02:45 PM", status: "Available" },
    { id: "slot-04", time: "02:45 PM - 03:00 PM", status: "Available" },
    { id: "slot-05", time: "03:00 PM - 03:15 PM", status: "Booked" },
    { id: "slot-06", time: "03:15 PM - 03:30 PM", status: "Available" }
  ]);
  const [bookedMeetings, setBookedMeetings] = useState<Array<{ id: string; teacherName: string; subject: string; time: string; date: string }>>([
    { id: "meet-01", teacherName: "Mrs. Ananya Shastri", subject: "Mathematics", time: "02:15 PM - 02:30 PM", date: "2026-07-15" }
  ]);
  const [selectedPtmDate, setSelectedPtmDate] = useState("2026-07-15");

  // Chat helper state for Vidya AI Companion
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "p-init",
      role: "model",
      text: `Namaste! I am Vidya, your AI Family Advisor. I have synchronized with ${child?.name}'s grading average (${
        child
          ? Math.round(
              child.academics.subjects.flatMap((s) => s.grades).reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
                (child.academics.subjects.flatMap((s) => s.grades).length || 1)
            )
          : 80
      }%) and emotional check-ins. How can I support you today? You can ask me to draft stress-free routines, explain report cards, or translate topics.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulated live transport status
  const [liveBusLatitude, setLiveBusLatitude] = useState(40); // Simple percentage position
  const [liveBusDirection, setLiveBusDirection] = useState(1);
  const [lastEntryExitLogs, setLastEntryExitLogs] = useState([
    { date: "2026-07-11", entry: "08:12 AM (RFID Scanned)", exit: "03:45 PM (Pending)" },
    { date: "2026-07-10", entry: "08:08 AM (RFID Scanned)", exit: "03:42 PM (RFID Scanned)" }
  ]);

  // Notifications pool
  const [notificationList, setNotificationList] = useState([
    { id: "n-01", title: "New Message from Mrs. Shastri", text: "Sent simple practice sheet context", date: "Just Now", type: "message", read: false },
    { id: "n-02", title: "Homework Due Soon", text: "Grammar & Verbs due by tomorrow", date: "2 Hours ago", type: "homework", read: false },
    { id: "n-03", title: "AI Learning Update", text: "Science preparation analysis compiled", date: "4 Hours ago", type: "ai", read: true }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, sendingMessage]);

  // Simulate bus movement
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveBusLatitude((prev) => {
        let next = prev + liveBusDirection * 2;
        if (next >= 85) {
          setLiveBusDirection(-1);
          return 85;
        }
        if (next <= 15) {
          setLiveBusDirection(1);
          return 15;
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [liveBusDirection]);

  if (!child) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">No child profile connected</h1>
          <p className="mt-3 text-sm text-slate-600">
            The backend is reachable, but this parent account does not have a linked student record yet.
          </p>
          <button
            onClick={onLogout}
            className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Pre-calculations for ward analytics
  const attRate = child.attendance.totalDays > 0 ? Math.round((child.attendance.presentDays / child.attendance.totalDays) * 100) : 100;
  const allGrades = child.academics.subjects.flatMap((s) => s.grades);
  const avgGrade = allGrades.length > 0 ? Math.round(allGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / allGrades.length) : 80;
  const pendingHomework = child.homework.filter((h) => h.status === "Pending");
  const completedHomework = child.homework.filter((h) => h.status === "Completed" || h.status === "Late");
  const homeworkCompRate = child.homework.length > 0 ? Math.round((completedHomework.length / child.homework.length) * 100) : 100;

  // Identify strength vs weak subjects based on scores
  const subjectAverages = child.academics.subjects.map((sub) => {
    const total = sub.grades.reduce((sum, g) => sum + g.score, 0);
    const max = sub.grades.reduce((sum, g) => sum + g.maxScore, 0);
    return { name: sub.name, percentage: max > 0 ? Math.round((total / max) * 100) : 0 };
  });

  const sortedSubjects = [...subjectAverages].sort((a, b) => b.percentage - a.percentage);
  const strongSubject = sortedSubjects[0] || { name: "N/A", percentage: 0 };
  const weakSubject = sortedSubjects[sortedSubjects.length - 1] || { name: "N/A", percentage: 0 };

  // AI Learning Score Calculation (combination of average, homework, and mood wellbeing)
  const lastMoodRating = child.wellbeing.moodHistory[child.wellbeing.moodHistory.length - 1]?.rating || 3;
  const aiLearningScore = Math.min(100, Math.round((avgGrade * 0.5) + (homeworkCompRate * 0.3) + (lastMoodRating * 4)));

  // Send message to Vidya AI (persistent and side assistant are unified)
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sendingMessage) return;

    const userMessage: ChatMessage = {
      id: `p-usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");
    setSendingMessage(true);

    try {
      const data = await aiService.chat(
        child.id,
        [...chatHistory, userMessage].map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          text: msg.text
        }))
      );
      if (data.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `p-bot-${Date.now()}`,
            role: "model",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error("API returned failure");
      }
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `p-err-${Date.now()}`,
          role: "model",
          text: "I experienced a brief sync pause. Let me re-verify my analytics connection. How can I help you support " + child.name + "?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Submit mood log to the server
  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingMood(true);
    const success = await onAddLog(child.id, "MOOD", { rating: moodRating, notes: moodNotes });
    setLoggingMood(false);
    if (success) {
      setMoodNotes("");
      alert(`Mood entry saved for ${child.name}. Thank you for maintaining holistic home logs!`);
    } else {
      alert("Encountered connection error. Please try again.");
    }
  };

  // Acknowledge notices
  const acknowledgeNotice = (id: string) => {
    setNoticesList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
    );
  };

  // Send Direct Message to Teacher
  const handleTeacherMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !child) return;

    const room = `parent-teacher:${child.id}:${selectedTeacherId}`;
    sendChatMessage(room, "Rajesh Kumar (Parent)", "Parent", typedMessage);
    sendTypingStatus(room, "Parent", false);
    setTypedMessage("");
  };

  // Sync historical messages and handle socket room subscriptions
  useEffect(() => {
    if (!socket || !child) return;
    const room = `parent-teacher:${child.id}:${selectedTeacherId}`;
    socket.emit("chat:join", room);

    chatService.getMessages(room)
      .then((messages) => {
        if (messages.length > 0) {
          const mapped = messages.map((m: any) => ({
            sender: m.senderRole === "Parent" ? "parent" as const : "teacher" as const,
            text: m.text,
            date: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAttachment: !!m.attachment,
            type: m.attachment?.type
          }));
          setParentChatHistory((prev) => ({
            ...prev,
            [selectedTeacherId]: mapped
          }));
        }
      })
      .catch((err) => console.error("Error fetching historical parent-teacher chats:", err));
  }, [selectedTeacherId, socket, child?.id]);

  // Handle incoming live updates for messages & typing status
  useEffect(() => {
    if (!socket || !child) return;

    const onChatMessage = (msg: any) => {
      const parts = msg.room.split(":");
      if (parts[0] === "parent-teacher") {
        const studentId = parts[1];
        const teacherId = parts[2];
        if (studentId === child.id) {
          const uiMsg = {
            sender: msg.senderRole === "Parent" ? "parent" as const : "teacher" as const,
            text: msg.text,
            date: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAttachment: !!msg.attachment,
            type: msg.attachment?.type
          };
          setParentChatHistory((prev) => {
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
      if (data.room === `parent-teacher:${child.id}:${selectedTeacherId}` && data.sender !== "Parent") {
        setTeacherTyping(data.isTyping);
      }
    };

    socket.on("chat:message", onChatMessage);
    socket.on("chat:typing", onTyping);

    return () => {
      socket.off("chat:message", onChatMessage);
      socket.off("chat:typing", onTyping);
    };
  }, [socket, child?.id, selectedTeacherId]);

  // Book PTM Meeting
  const bookMeeting = (slot: PTMSlot) => {
    if (slot.status !== "Available") return;
    const teacher = teachersList.find((t) => t.id === selectedTeacherId) || teachersList[0];

    // Mark as selected and update meetings
    setPtmSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, status: "Booked" } : s))
    );

    const newMeeting = {
      id: `meet-${Date.now()}`,
      teacherName: teacher.name,
      subject: teacher.subject,
      time: slot.time,
      date: selectedPtmDate
    };

    setBookedMeetings((prev) => [...prev, newMeeting]);
    alert(`Meeting secured with ${teacher.name} on ${selectedPtmDate} at ${slot.time}!`);
  };

  // Summarize chat with AI
  const summarizeConversation = () => {
    const chat = parentChatHistory[selectedTeacherId] || [];
    const fullText = chat.map((c) => `${c.sender === "parent" ? "Parent" : "Teacher"}: ${c.text}`).join("\n");
    const aiPrompt = `Here is a conversation history with the teacher. Can you summarize it and suggest 3 supportive parenting actions to implement at home based on this discussion?\n\n${fullText}`;
    setAiSidebarOpen(true);
    handleSendMessage(aiPrompt);
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
          {/* Logo / Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-slate-900 tracking-tight text-base block">VidyaSetu AI</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Parent Companion</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Active Child Info Banner */}
          <div className="mx-4 mt-4 p-3 bg-indigo-50/40 border border-indigo-50 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-display font-bold flex items-center justify-center text-xs">
              {child.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-indigo-600 tracking-wide uppercase">Active Portfolio</p>
              <p className="text-xs font-bold text-slate-800 truncate">{child.name}</p>
              <p className="text-[10px] text-slate-400">{child.class} • Roll {child.rollNumber}</p>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-4 space-y-1">
            {[
              { id: "DASHBOARD", label: "Dashboard Home", icon: LayoutDashboard },
              { id: "CHILDREN", label: "My Children Profile", icon: Users },
              { id: "ATTENDANCE", label: "Attendance Record", icon: Calendar },
              { id: "HOMEWORK", label: "Homework Ledger", icon: BookOpen },
              { id: "EXAMS", label: "Exams & Results", icon: Award },
              { id: "ACADEMICS", label: "Academic Progress", icon: CheckCircle2 },
              { id: "AI_ASSISTANT", label: "AI Parent Assistant", icon: Brain, highlight: true },
              { id: "PTM", label: "PTM Scheduler", icon: Clock },
              { id: "NOTICES", label: "School Notices", icon: ClipboardList },
              { id: "TRANSPORT", label: "Transport & RFID", icon: MapPin },
              { id: "WELLNESS", label: "Wellness & Mood", icon: Heart },
              { id: "REPORTS", label: "Academic Reports", icon: FileText },
              { id: "SETTINGS", label: "Companion Settings", icon: Settings }
            ].map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`sidebar-${link.id}`}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group ${
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

        {/* Parent / Guardian Badge Footer */}
        <div className="p-4 border-t border-slate-50 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-xs border border-rose-100">
              G
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Parent Guardian</span>
              <span className="text-xs font-bold text-slate-800 block truncate">{user.name}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP NAVBAR */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-100 flex items-center justify-center shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-display font-bold text-slate-900">
                {activeTab === "DASHBOARD" && "Companion Overview"}
                {activeTab === "CHILDREN" && "Linked Portfolios"}
                {activeTab === "ATTENDANCE" && "Attendance Register"}
                {activeTab === "HOMEWORK" && "Homework & Worksheets"}
                {activeTab === "EXAMS" && "Assessment Cards"}
                {activeTab === "ACADEMICS" && "Holistic Learning Progress"}
                {activeTab === "AI_ASSISTANT" && "Vidya AI Family Advisor"}
                {activeTab === "COMMUNICATION" && "Teacher Collaboration Line"}
                {activeTab === "PTM" && "Parent Teacher Meeting Slots"}
                {activeTab === "NOTICES" && "Circular Bulletin"}
                {activeTab === "TRANSPORT" && "RFID Scans & Bus Safety"}
                {activeTab === "WELLNESS" && "Mood Track & Observations"}
                {activeTab === "REPORTS" && "Dossier Generator"}
                {activeTab === "SETTINGS" && "Interface Tuning"}
              </h1>
              <p className="text-xs text-slate-400">
                School partner code: <span className="font-mono font-bold text-indigo-600">{user.schoolCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Global Search Interface */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers, tasks..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Child Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedChildId(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedChildId === s.id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Professional Messages Top Navbar Link with Unread Badge */}
            <button
              onClick={() => {
                setActiveTab("COMMUNICATION");
                setMobileMenuOpen(false);
              }}
              className={`p-2 hover:bg-slate-50 rounded-xl relative transition-all ${
                activeTab === "COMMUNICATION" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "text-slate-500"
              }`}
              title="Dedicated Messaging Terminal (3 Unread)"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-indigo-600 rounded-full border border-white scale-90 flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Notification Ring bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notificationList.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-30"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <span className="font-bold text-xs text-slate-800">Alert Center</span>
                      <button
                        onClick={() => {
                          setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
                        }}
                        className="text-[10px] text-indigo-600 hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-3 mt-3 max-h-60 overflow-y-auto">
                      {notificationList.map((n) => (
                        <div key={n.id} className={`p-2.5 rounded-xl text-xs space-y-1 transition-all ${n.read ? "bg-white" : "bg-indigo-50/30 border border-indigo-50/50"}`}>
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{n.title}</span>
                            <span className="text-[8px] text-slate-400 font-mono">{n.date}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{n.text}</p>
                        </div>
                      ))}
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

        {/* 3. MAIN DASHBOARD CONTENT GRID */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* SEARCH TRIGGERED VIEW OVERLAY */}
          {searchQuery && (
            <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-indigo-700">Filter results for: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Clear Filter</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teachersList.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                  <div key={t.id} className="p-3 bg-white border border-slate-100 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{t.name}</p>
                      <p className="text-slate-400 text-[10px]">{t.subject}</p>
                    </div>
                    <button onClick={() => { setActiveTab("COMMUNICATION"); setSelectedTeacherId(t.id); setSearchQuery(""); }} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-bold text-[10px]">Chat</button>
                  </div>
                ))}
                {child.homework.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()) || h.subject.toLowerCase().includes(searchQuery.toLowerCase())).map(h => (
                  <div key={h.id} className="p-3 bg-white border border-slate-100 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{h.title}</p>
                      <p className="text-slate-400 text-[10px]">{h.subject} • {h.status}</p>
                    </div>
                    <button onClick={() => { setActiveTab("HOMEWORK"); setSearchQuery(""); }} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-bold text-[10px]">View</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC TAB RENDERING */}
          {activeTab === "DASHBOARD" && (
            <div className="space-y-6">
              
              {/* Question Banner (Google Workspace style - emotionally reassuring) */}
              <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/20 border border-indigo-100/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-1.5">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-md uppercase font-mono tracking-wider">Guardian Summary</span>
                  <h2 className="text-xl font-display font-bold text-slate-900">How is {child.name} doing today?</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {child.name} is <span className="font-bold text-emerald-600">Present</span> in class today. RFID registered check-in at 8:12 AM. No major behavioral alerts flagged. Their homework completion remains steady at {homeworkCompRate}%.
                  </p>
                </div>
                <div className="absolute right-6 bottom-0 top-0 w-32 hidden md:flex items-center justify-center text-indigo-200">
                  <Brain className="w-24 h-24 stroke-[1]" />
                </div>
              </div>

              {/* Core 3 Cards answering parent's daily anxiety */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Daily status indicator */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Check-In</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded uppercase">Active</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold font-mono text-slate-800">{attRate}%</h4>
                      <p className="text-xs text-slate-400">Total sessions attended</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-50">
                    "Weekly attendance maintains a solid streak. No unexcused leaves registered this academic cycle."
                  </p>
                </div>

                {/* 2. Urgent Attention Radar */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attention Radar</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded uppercase">Needs Action</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {child.homework.filter(h => h.status === "Pending").length} homework sheets pending
                      </h4>
                      <p className="text-[11px] text-rose-500 font-semibold">{weakSubject.name} needs revision assistance</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-50">
                    Vidya AI suggests prioritizing {weakSubject.name} flashcard exercises before the upcoming tests.
                  </p>
                </div>

                {/* 3. Actionable Next steps */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recommended Parenting Quest</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded uppercase">Next Step</span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab("AI_ASSISTANT")}
                      className="w-full p-2 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 rounded-xl text-[11px] font-bold flex items-center justify-between text-left transition-colors"
                    >
                      <span>1. Consult {weakSubject.name} study routine template</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => setActiveTab("COMMUNICATION")}
                      className="w-full p-2 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 rounded-xl text-[11px] font-bold flex items-center justify-between text-left transition-colors"
                    >
                      <span>2. Book 15-min chat slot with subject advisor</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Daily Summary & Natural Language Explanations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Daily Natural Language Insights */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-display font-bold text-slate-800 text-sm">Vidya's Daily Insights & Why</h3>
                  </div>
                  
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-slate-700">Perfect attendance sustained today.</span>
                      </div>
                      <p className="text-slate-500 pl-4">
                        <strong>Why:</strong> Standard RFID scanners logged entrance at 08:12 AM. Routine compliance promotes steady retention cycles.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="font-bold text-slate-700">Mathematics average trends at {avgGrade}%.</span>
                      </div>
                      <p className="text-slate-500 pl-4">
                        <strong>Why:</strong> Aarav performed exceptionally on the Algebraic Identities worksheet, earning an A grade on modern problem sets.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="font-bold text-slate-700">Science performance flags preparation stress.</span>
                      </div>
                      <p className="text-slate-500 pl-4">
                        <strong>Why:</strong> Classroom logs indicate {child.name} expressed feeling overwhelmed during test preparations. Reassuring supportive guidance is recommended rather than academic score pressure.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setAiSidebarOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      Draft Revision Routine Template
                    </button>
                  </div>
                </div>

                {/* Holistic Metrics Overview Cards */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Ward Learning Score</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                      <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">AI Companion Rating</span>
                      <h4 className="text-4xl font-display font-bold text-indigo-700 mt-1">{aiLearningScore}/100</h4>
                      <p className="text-[11px] text-slate-400 mt-2">Combined academic, attendance & mood engagement index</p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Strongest Domain:</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">{strongSubject.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Active Weak Point:</span>
                        <span className="font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded text-[11px]">{weakSubject.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Homework Completion:</span>
                        <span className="font-bold text-slate-700">{homeworkCompRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* MY CHILDREN TAB */}
          {activeTab === "CHILDREN" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {students.map((s) => {
                  const sAvg = Math.round(s.academics.subjects.flatMap((sub) => sub.grades).reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / (s.academics.subjects.flatMap((sub) => sub.grades).length || 1));
                  const sAtt = Math.round((s.attendance.presentDays / s.attendance.totalDays) * 100);
                  const isSelected = selectedChildId === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`p-6 rounded-2xl border transition-all ${
                        isSelected ? "bg-white border-indigo-500 shadow-lg" : "bg-white border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 font-display font-bold text-slate-700 flex items-center justify-center">
                            {s.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                            <p className="text-[11px] text-slate-400">{s.class} • Roll {s.rollNumber}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedChildId(s.id)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "Active Focus" : "Switch To"}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-50 text-center">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-mono block">Grade Avg</span>
                          <span className="text-sm font-bold text-slate-800">{sAvg}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-mono block">Attendance</span>
                          <span className="text-sm font-bold text-emerald-600">{sAtt}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-mono block">Homework</span>
                          <span className="text-sm font-bold text-indigo-600">
                            {s.homework.filter((h) => h.status === "Completed").length}/{s.homework.length}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-amber-50/50 border border-amber-50 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-amber-800 font-mono text-[10px] uppercase">Advisor Observation Snippet:</span>
                        <p className="text-amber-700 italic">
                          "{s.wellbeing.observations[0]?.content || "No remarks flagged for this student dashboard portfolio."}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === "ATTENDANCE" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Ward Attendance Register</h3>
                  <p className="text-xs text-slate-400">Monthly check-in summaries posted by class tutors.</p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg font-mono">
                  Current Ratio: {attRate}%
                </div>
              </div>

              {/* Attendance Analytics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Present sessions</span>
                  <span className="text-xl font-bold text-emerald-600 block mt-1">{child.attendance.presentDays} Days</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Term Days</span>
                  <span className="text-xl font-bold text-slate-800 block mt-1">{child.attendance.totalDays} sessions</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Leaves / Absent</span>
                  <span className="text-xl font-bold text-rose-500 block mt-1">
                    {child.attendance.totalDays - child.attendance.presentDays} Days
                  </span>
                </div>
                <div className="p-4 bg-indigo-50/40 border border-indigo-50 rounded-xl text-center">
                  <span className="text-[10px] text-indigo-600 block uppercase font-mono font-bold">RFID Status</span>
                  <span className="text-xs font-bold text-indigo-700 block mt-2">Active Tracker</span>
                </div>
              </div>

              {/* Calendar Grid Representation */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Visual Attendance Log Ledger</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {child.attendance.history.map((h, i) => (
                    <div key={i} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <span className="text-[8px] text-slate-400 font-mono block">{h.date.slice(5)}</span>
                      <span className={`text-[10px] font-bold ${h.status === "Present" ? "text-emerald-600" : "text-rose-500"}`}>{h.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance AI Analysis */}
              <div className="p-4 bg-indigo-50/30 border border-indigo-50 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800">Vidya's Attendance Insight</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "{child.name} has maintained consistent school entries. Early scans at 08:12 AM prove their solid routine is working. Ensure bedtime preparations stay steady to avoid late arrivals on exam weeks."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* HOMEWORK TAB */}
          {activeTab === "HOMEWORK" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Homework Worksheets & Deliverables</h3>
                  <p className="text-xs text-slate-400">Review status and scores of homework modules dispatched by instructors.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg font-mono">
                  Completion: {homeworkCompRate}%
                </span>
              </div>

              <div className="space-y-6">
                
                {/* Pending List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Pending Deliverables ({pendingHomework.length})
                  </h4>
                  {pendingHomework.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl">
                      Nice! All pending worksheets submitted successfully.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pendingHomework.map((hw) => (
                        <div key={hw.id} className="p-4 bg-white border border-slate-100 hover:border-indigo-200 rounded-xl space-y-3 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded">
                              {hw.subject}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">Due: {hw.dueDate}</span>
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 text-xs">{hw.title}</h5>
                            <p className="text-[11px] text-slate-400 mt-1">Submit via ward student portal. Instructors added supporting lecture summaries.</p>
                          </div>
                          <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-[10px]">
                            <button
                              onClick={() => {
                                setAiSidebarOpen(true);
                                handleSendMessage(`Explain homework task: "${hw.title}" for subject "${hw.subject}" so I can guide my child.`);
                              }}
                              className="text-indigo-600 hover:underline font-bold"
                            >
                              Ask AI Homework Explanation →
                            </button>
                            <span className="text-rose-500 font-semibold font-mono">Pending Submission</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scored & Completed */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest font-mono">Scored & Submitted ({completedHomework.length})</h4>
                  <div className="divide-y divide-slate-100 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    {completedHomework.map((hw) => (
                      <div key={hw.id} className="py-3 flex justify-between items-center text-xs px-2">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">{hw.subject}</span>
                          <h5 className="font-bold text-slate-700">{hw.title}</h5>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold font-mono text-[10px] rounded-lg">
                            Score: {hw.score || 9}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* EXAMS & PAST RESULTS */}
          {activeTab === "EXAMS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Assessment Cards & Exams</h3>
                  <p className="text-xs text-slate-400">Past grades and syllabus compilation files.</p>
                </div>
                <button
                  onClick={() => alert("Report card PDF generation dispatching to system printer queue...")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Report Card PDF
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {child.academics.subjects.map((sub, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <h5>{sub.name}</h5>
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px]">Term 1</span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {sub.grades.map((g, gi) => (
                        <div key={gi} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">{g.assessment}</span>
                          <span className="font-mono font-bold text-slate-800">{g.score}/{g.maxScore}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Result Summary Explanations */}
              <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-800">Vidya's Result Digest Summary</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Grades reveal balanced critical comprehension skills. {child.name}'s Mathematics scores remain within the top decile. Science practical assignments need additional conceptual reviews. Supportive revisions have been added to the Parent Companion sidebar."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ACADEMIC PROGRESS (Interactive SVG Charts) */}
          {activeTab === "ACADEMICS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Holistic Learning Analytics</h3>
                  <p className="text-xs text-slate-400">Visual trend cycles of academic and engagement portfolios.</p>
                </div>
              </div>

              {/* Custom SVG Line Chart to represent Monthly Growth */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Academic Growth Curve</span>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <div className="h-48 w-full relative">
                    {/* SVG Chart */}
                    <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="25" x2="500" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="125" x2="500" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                      {/* Shading area */}
                      <path d="M 0 150 L 0 90 Q 125 50 250 45 T 500 30 L 500 150 Z" fill="url(#chartGradient)" />
                      {/* Trendline */}
                      <path d="M 0 90 Q 125 50 250 45 T 500 30" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                      {/* Data markers */}
                      <circle cx="0" cy="90" r="5" fill="#4f46e5" />
                      <circle cx="125" cy="65" r="5" fill="#4f46e5" />
                      <circle cx="250" cy="45" r="5" fill="#4f46e5" />
                      <circle cx="375" cy="40" r="5" fill="#4f46e5" />
                      <circle cx="500" cy="30" r="5" fill="#4f46e5" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
                    <span>Term Start</span>
                    <span>Mid-Term</span>
                    <span>Quarterly Exams</span>
                    <span>Today's Sync</span>
                  </div>
                </div>
              </div>

              {/* Subject Wise Performance Lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Strengths & Weak chapters */}
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">Learning Pattern Highlights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 font-semibold">
                      <span>Strong Subjects:</span>
                      <span>{strongSubject.name} ({strongSubject.percentage}%)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-rose-50 rounded-lg text-[11px] text-rose-800 font-semibold">
                      <span>Refinement Needed:</span>
                      <span>{weakSubject.name} ({weakSubject.percentage}%)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg text-[11px] text-indigo-800 font-semibold">
                      <span>Interactive Homework Trends:</span>
                      <span>Steady progress</span>
                    </div>
                  </div>
                </div>

                {/* Analytical explanations */}
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">Vidya's Pedagogical Advice</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    "{child.name} demonstrates excellent conceptual comprehension in analytical algebra, but visual mechanics in sciences have room for interactive focus. We recommend using tactile or visual simulations rather than text drills."
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* DEDICATED AI PARENT COMPANION */}
          {activeTab === "AI_ASSISTANT" && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col h-[520px]">
              <div className="border-b border-slate-50 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <h4 className="font-display font-bold text-slate-800 text-sm">Vidya AI Family Advisor</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Consult Vidya to receive supportive, empathetic coaching tips grounded in {child.name}'s performance.
                  </p>
                </div>
                
                {/* Language selectors */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setParentLanguage("EN")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${parentLanguage === "EN" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setParentLanguage("HI")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${parentLanguage === "HI" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
                {chatHistory.map((m) => {
                  const isBot = m.role === "model";
                  return (
                    <div key={m.id} className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
                      {isBot && (
                        <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl max-w-[80%] space-y-1 ${
                        isBot ? "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100" : "bg-indigo-600 text-white rounded-tr-none shadow"
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        <span className={`text-[8px] font-mono block text-right ${isBot ? "text-slate-400" : "text-indigo-200"}`}>{m.timestamp}</span>
                      </div>
                    </div>
                  );
                })}

                {sendingMessage && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <Brain className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1.5 font-mono text-[10px]">
                      <span>Vidya drafting supportive family recommendations...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-50">
                <button
                  onClick={() => handleSendMessage("Suggest a calm daily study routine for my child.")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] text-slate-600 font-medium"
                >
                  🕒 Suggest Daily Routine
                </button>
                <button
                  onClick={() => handleSendMessage("How can I help my child revise weak chapters?")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] text-slate-600 font-medium"
                >
                  📚 Revise Weak Chapters
                </button>
                <button
                  onClick={() => handleSendMessage("Can you suggest emotional reassurance activities?")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] text-slate-600 font-medium"
                >
                  🌱 Parent Encouragement Tips
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(chatInput);
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={sendingMessage}
                  placeholder={parentLanguage === "EN" ? "Ask Vidya: e.g. how can I support algebra studies?" : "विद्या से पूछें: उदाहरण के लिए, गणित की पढ़ाई में कैसे मदद करें?"}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-indigo-500 font-semibold"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* MESSAGES & COMMUNICATION CENTER (Slack + WhatsApp Inspired) */}
          {activeTab === "COMMUNICATION" && (
            <ParentCommsCenter
              user={user}
              students={students}
              onAddLog={onAddLog}
            />
          )}

          {/* PTM SCHEDULER & BOOKING */}
          {activeTab === "PTM" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Book Parent Teacher Meeting</h3>
                <p className="text-xs text-slate-400">Secure face-to-face or video consultation slots with subject experts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Date Selection */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
                  <h5 className="font-bold text-slate-800">1. Select Target Date</h5>
                  <div className="space-y-1.5">
                    {["2026-07-15", "2026-07-16", "2026-07-17"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedPtmDate(d)}
                        className={`w-full p-2.5 rounded-lg text-left font-bold transition-colors block ${
                          selectedPtmDate === d ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {d === "2026-07-15" ? "Wednesday, July 15" : d === "2026-07-16" ? "Thursday, July 16" : "Friday, July 17"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot Selector */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs col-span-2">
                  <h5 className="font-bold text-slate-800">2. Select Available Slot</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ptmSlots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={slot.status === "Booked"}
                        onClick={() => bookMeeting(slot)}
                        className={`p-2.5 rounded-xl border text-left font-semibold text-xs flex justify-between items-center transition-all ${
                          slot.status === "Booked"
                            ? "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-white border-slate-200 hover:border-indigo-500 text-slate-700"
                        }`}
                      >
                        <span>{slot.time}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          slot.status === "Booked" ? "bg-slate-200 text-slate-500" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {slot.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Booked schedule list */}
              <div className="space-y-3 pt-4 border-t border-slate-50 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-widest font-mono text-[10px]">Your Scheduled Meetings</h4>
                {bookedMeetings.length === 0 ? (
                  <p className="text-slate-400 italic">No scheduled slots booked yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bookedMeetings.map((b) => (
                      <div key={b.id} className="p-3 bg-indigo-50/40 border border-indigo-50 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-indigo-900">{b.teacherName} ({b.subject})</p>
                          <p className="text-[11px] text-slate-500">Date: {b.date} • Time Slot: {b.time}</p>
                        </div>
                        <button
                          onClick={() => {
                            setBookedMeetings((prev) => prev.filter((m) => m.id !== b.id));
                            alert("Meeting slot cancelled successfully.");
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:underline"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCHOOL NOTICES */}
          {activeTab === "NOTICES" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">Circular Bulletin Board</h3>
                  <p className="text-xs text-slate-400">Institutional announcement feeds issued by administration.</p>
                </div>
              </div>

              <div className="space-y-4">
                {noticesList.map((notice) => (
                  <div
                    key={notice.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      notice.acknowledged ? "bg-slate-50/50 border-slate-100" : "bg-white border-indigo-200 shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            notice.category === "Exam" ? "bg-rose-50 text-rose-700" : notice.category === "Holiday" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {notice.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{notice.date}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-1.5">{notice.title}</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{notice.content}</p>
                      </div>
                      <div className="text-right">
                        {notice.acknowledged ? (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                            ✓ Acknowledged
                          </span>
                        ) : (
                          <button
                            onClick={() => acknowledgeNotice(notice.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                          >
                            Mark Read & Acknowledge
                          </button>
                        )}
                      </div>
                    </div>

                    {notice.attachment && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600">
                        <span className="font-mono font-semibold">📎 Attachments: {notice.attachment}</span>
                        <button onClick={() => alert("Downloading notice attachment...")} className="hover:underline font-bold">Download File</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSPORT & safety (RFID tracking visualization) */}
          {activeTab === "TRANSPORT" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">RFID Safety & School Bus Tracker</h3>
                  <p className="text-xs text-slate-400">Live coordinates map and gate entrance RFID logs.</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg uppercase">
                  Connected
                </span>
              </div>

              {/* Live Bus Progress Tracker */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Route 14-A Tracker</span>
                  <span className="text-slate-400">Est. Arrival at Home Stop: <strong className="text-slate-800 font-mono">04:15 PM</strong></span>
                </div>
                
                {/* Visual Route map track bar */}
                <div className="relative w-full h-14 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                  <div className="absolute inset-0 flex justify-between px-6 items-center text-[10px] text-slate-400 font-bold">
                    <span>School Campus</span>
                    <span>Sector 4 Stop</span>
                    <span>Your stop (Main Stop)</span>
                  </div>
                  {/* Moving bus icon */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg transition-all"
                    style={{ left: `${liveBusLatitude}%` }}
                  >
                    🚌
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic text-center">Auto-updates location stop scans every 10 seconds</p>
              </div>

              {/* RFID gate scans */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-widest font-mono text-[10px]">RFID Campus Scan History</h4>
                <div className="divide-y divide-slate-100">
                  {lastEntryExitLogs.map((log, index) => (
                    <div key={index} className="py-2.5 flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-700">{log.date}</span>
                      <div className="flex gap-4">
                        <span className="text-emerald-600">Gate Entry: {log.entry}</span>
                        <span className="text-slate-500">Gate Exit: {log.exit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WELLNESS & MOOD TIMELINE */}
          {activeTab === "WELLNESS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add daily mood reflection */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-50 pb-3">
                  <h3 className="font-display font-bold text-slate-800 text-base">Ward Wellness Diary</h3>
                  <p className="text-xs text-slate-400">Log home mood observations to collaborate with advisors on emotional wellbeing indices.</p>
                </div>

                <form onSubmit={handleMoodSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Rating: How rested does your child seem?</span>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMoodRating(num)}
                          className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm transition-all ${
                            moodRating === num ? "bg-indigo-600 text-white shadow" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Notes or Reflections</span>
                    <textarea
                      value={moodNotes}
                      onChange={(e) => setMoodNotes(e.target.value)}
                      placeholder="e.g. Sleept on time, excited for science project or expressed math exam stress..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loggingMood}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow"
                  >
                    {loggingMood ? "Submitting logs..." : "Record Home Log"}
                  </button>
                </form>

                {/* Wellness logs */}
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Historic Reflections Ledger</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {child.wellbeing.moodHistory.slice().reverse().map((mood, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-700">{mood.date}</p>
                          <p className="text-[11px] text-slate-400 italic mt-0.5">"{mood.notes || "No reflection journal submitted"}"</p>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-bold rounded">Mood index: {mood.rating}/5</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advisor Remarks */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Teacher Stress Indicators</h4>
                <div className="space-y-3">
                  {child.wellbeing.observations.map((obs, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[9px] uppercase">{obs.category}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{obs.date}</span>
                      </div>
                      <p className="text-slate-500 italic">"{obs.content}"</p>
                      <span className={`text-[9px] font-mono font-bold block ${obs.sentiment === "Positive" ? "text-emerald-600" : "text-rose-500"}`}>
                        Sentiment: {obs.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* REPORTS DOSSIER */}
          {activeTab === "REPORTS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Performance Dossier Generator</h3>
                <p className="text-xs text-slate-400">Download, share, or request compiled academic, wellness, and attendance dockets.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Standard Term-1 Report Card", detail: "Formal school dockets", action: "Download compiled report PDF" },
                  { title: "Weekly Homework Completion Index", detail: "Detailed checklist of pending items", action: "Print sheet ledger" },
                  { title: "Holistic Wellness & Stress Dossier", detail: "AI emotional observations summary", action: "Download AI analysis" },
                  { title: "Terminal Attendance Register", detail: "Comprehensive gate entries scan sheet", action: "Share with parents" }
                ].map((rep, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold text-slate-800">{rep.title}</h5>
                      <p className="text-slate-400 text-[10px]">{rep.detail}</p>
                    </div>
                    <button
                      onClick={() => alert(`Dossier generation request dispatched successfully: "${rep.title}"`)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-100 rounded-lg font-bold transition-all"
                    >
                      {rep.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPANION SETTINGS */}
          {activeTab === "SETTINGS" && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Companion Tuning Settings</h3>
                <p className="text-xs text-slate-400">Tweak user parameters, language defaults, and emergency notification rules.</p>
              </div>

              <div className="space-y-4 text-xs">
                
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <h5 className="font-bold text-slate-800">Interface Language Default</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setParentLanguage("EN")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${parentLanguage === "EN" ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-600"}`}
                    >
                      English (US/UK)
                    </button>
                    <button
                      onClick={() => setParentLanguage("HI")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${parentLanguage === "HI" ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-600"}`}
                    >
                      हिन्दी (Devanagari)
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <h5 className="font-bold text-slate-800">Security Preferences</h5>
                  <p className="text-[11px] text-slate-400">Your companion account is linked with Ward student code. Access remains private to guardian registry.</p>
                  <button
                    onClick={() => alert("Redirecting to emergency contact configuration portal...")}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                  >
                    Configure Emergency Contacts
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. OPTIONAL AI ASSISTANT EXPANDABLE SIDE-DRAWER */}
      <AnimatePresence>
        {aiSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Drawer header */}
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-indigo-50/20">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-sm">Vidya AI Companion</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Real-time pedagogical dockets synced</p>
                </div>
              </div>
              <button
                onClick={() => setAiSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {chatHistory.map((m) => {
                const isBot = m.role === "model";
                return (
                  <div key={m.id} className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
                    {isBot && (
                      <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Brain className="w-3 h-3" />
                      </div>
                    )}
                    <div className={`p-3 rounded-xl max-w-[85%] ${
                      isBot ? "bg-slate-50 border border-slate-100 text-slate-700" : "bg-indigo-600 text-white"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap text-[11px]">{m.text}</p>
                    </div>
                  </div>
                );
              })}
              {sendingMessage && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Vidya drafting insights...</span>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="p-3 border-t border-slate-50 flex flex-col gap-1.5">
              <button
                onClick={() => handleSendMessage("Design a balanced home-study calendar for " + child.name)}
                className="w-full p-2 bg-slate-50 hover:bg-slate-100 text-left text-[10px] text-slate-600 rounded-lg block font-medium"
              >
                📅 Draft Study Calendar Template
              </button>
              <button
                onClick={() => handleSendMessage("Formulate some supportive stress management tactics.")}
                className="w-full p-2 bg-slate-50 hover:bg-slate-100 text-left text-[10px] text-slate-600 rounded-lg block font-medium"
              >
                🌱 Reassurance & Encouragement Tactics
              </button>
            </div>

            {/* Input field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50/50"
            >
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Vidya anything..."
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
              <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl shadow">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
