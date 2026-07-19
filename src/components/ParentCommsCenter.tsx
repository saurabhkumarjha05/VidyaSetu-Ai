import React, { useState, useEffect, useRef, useMemo } from "react";
import { Student, User, Role } from "../types";
import { useSocket } from "../lib/socket";
import { aiService } from "../services/aiService";
import { chatService } from "../services/chatService";
import {
  MessageSquare, Search, Plus, Send, MoreVertical, Paperclip, Smile, Mic,
  Image as ImageIcon, FileText, Check, CheckCheck, Phone, Video, User as UserIcon,
  Sparkles, ArrowRight, TrendingUp, AlertTriangle, Calendar, Lock, FileUp, Copy,
  CheckSquare, Bookmark, Reply, Trash2, Archive, Volume2, Bot, VideoOff, MicOff,
  ScreenShare, Pin, Star, Download, Eye, Info, X, PlusCircle, ArchiveRestore,
  VolumeX, Share2, FileSpreadsheet, Activity, Heart, ChevronRight, ChevronLeft,
  FileDown, HelpCircle, CheckCircle2, Clock, ArrowLeft, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ParentCommsCenterProps {
  user: User;
  students: Student[];
  onAddLog?: (studentId: string, type: string, data: any) => Promise<boolean>;
}

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
  read: boolean;
  attachment?: {
    type: "Document" | "Image" | "Audio" | "Homework" | "PDF" | "DOC";
    name: string;
    size: string;
  };
  starred?: boolean;
  pinned?: boolean;
  replyTo?: {
    sender: string;
    text: string;
  };
  reactions?: string[];
}

interface ChatRoom {
  id: string; // Room ID
  type: "parent" | "student" | "channel" | "teacher" | "admin" | "ai";
  name: string; // Contact or channel name
  avatarLetter: string;
  studentId?: string; // Associated student ID for context
  studentName?: string;
  className?: string;
  rollNumber?: string;
  online: boolean;
  unread: number;
  pinned: boolean;
  priority: boolean;
  muted: boolean;
  archived: boolean;
  lastSeen?: string;
  roleBadge?: string;
  messages: Message[];
}

export default function ParentCommsCenter({ user, students, onAddLog }: ParentCommsCenterProps) {
  const { socket, sendChatMessage, sendTypingStatus, onlineUsers } = useSocket();

  // Custom Toast notification system to bypass iframe alert blocking
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Generate dynamic conversational list (WhatsApp style) based on user role and students roster
  const initialConversations = useMemo<ChatRoom[]>(() => {
    const studentContext = students[0] || { id: "std-01", name: "Aarav Sharma", class: "Grade 9-A", rollNumber: "05" };
    
    const globalChannels: ChatRoom[] = [
      {
        id: "channel:urgent-alerts",
        type: "channel",
        name: "urgent-alerts",
        avatarLetter: "UA",
        online: true,
        unread: 0,
        pinned: true,
        priority: true,
        muted: false,
        archived: false,
        lastSeen: "Priority Broadcasts",
        roleBadge: "Broadcast",
        messages: [
          { id: "msg-ua1", sender: "System Administrator", senderRole: "Admin", text: "Scheduled Database Backup and System Updates scheduled for tonight at 23:00 UTC. Live service will remain active.", timestamp: "2026-07-15T08:00:00Z", read: true },
          { id: "msg-ua2", sender: "Principal Office", senderRole: "Admin", text: "Important: All students are encouraged to utilize the dynamic AI Revision Planner ahead of Term-1 Finals next week.", timestamp: "2026-07-15T10:15:00Z", read: false }
        ]
      }
    ];

    const staffChannels: ChatRoom[] = [
      {
        id: "channel:staff-general",
        type: "channel",
        name: "staff-general",
        avatarLetter: "SG",
        online: true,
        unread: 0,
        pinned: false,
        priority: false,
        muted: false,
        archived: false,
        lastSeen: "Advisors & Admins",
        roleBadge: "Staff",
        messages: [
          { id: "msg-sg1", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Good morning team, have we finalized the timetable adjustments for standard 9 exam preparation?", timestamp: "2026-07-15T09:12:00Z", read: true },
          { id: "msg-sg2", sender: "Mr. Vikram Saxena", senderRole: "Teacher", text: "Yes, standard 9 English has an extra preparatory session mapped on Tuesdays now.", timestamp: "2026-07-15T09:20:00Z", read: true }
        ]
      }
    ];

    const parentChannels: ChatRoom[] = [
      {
        id: "channel:parents-council",
        type: "channel",
        name: "parents-council",
        avatarLetter: "PC",
        online: true,
        unread: 0,
        pinned: false,
        priority: false,
        muted: false,
        archived: false,
        lastSeen: "Representatives",
        roleBadge: "Parents",
        messages: [
          { id: "msg-pc1", sender: "Rajesh Kumar", senderRole: "Parent", text: "Will there be counseling sessions regarding exam stress for Grade 9? Aarav is feeling quite pressured.", timestamp: "2026-07-14T14:15:00Z", read: true },
          { id: "msg-pc2", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Yes, Rajesh. We are scheduling a counseling seminar this Thursday with certified counselors. Details incoming.", timestamp: "2026-07-14T14:32:00Z", read: true }
        ]
      }
    ];

    const studentChannels: ChatRoom[] = [
      {
        id: "channel:student-council",
        type: "channel",
        name: "student-council",
        avatarLetter: "SC",
        online: true,
        unread: 0,
        pinned: false,
        priority: false,
        muted: false,
        archived: false,
        lastSeen: "Student Council",
        roleBadge: "Students",
        messages: [
          { id: "msg-sc1", sender: "Priya Patel", senderRole: "Student", text: "Hey standard 9, let's coordinate the upcoming science exhibition club entries!", timestamp: "2026-07-15T11:00:00Z", read: true },
          { id: "msg-sc2", sender: "Kabir Singh", senderRole: "Student", text: "Agreed! Let's submit an entry for the AI-powered smart agriculture assistant.", timestamp: "2026-07-15T11:12:00Z", read: false }
        ]
      }
    ];

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      return [
        ...globalChannels,
        ...staffChannels,
        ...parentChannels,
        ...studentChannels,
        {
          id: "admin-teacher",
          type: "teacher",
          name: "Mrs. Ananya Shastri (Advisor)",
          avatarLetter: "AS",
          online: true,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Online Now",
          roleBadge: "Teacher",
          messages: [
            { id: "msg-ad1", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Respectful Admin, standard 9 attendance lists have been synchronized successfully.", timestamp: "2026-07-15T14:14:00Z", read: true }
          ]
        },
        {
          id: "parent-teacher:std-01:t-01",
          type: "parent",
          name: "Mr. Sharma (Father of Aarav)",
          avatarLetter: "AS",
          studentId: "std-01",
          studentName: "Aarav Sharma",
          className: "Grade 9-A",
          rollNumber: "05",
          online: true,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Active Now",
          roleBadge: "Parent",
          messages: []
        }
      ];
    } else if (user.role === Role.TEACHER) {
      return [
        ...globalChannels,
        ...staffChannels,
        ...parentChannels,
        {
          id: "parent-teacher:std-01:t-01",
          type: "parent",
          name: "Mr. Sharma (Father)",
          avatarLetter: "AS",
          studentId: "std-01",
          studentName: "Aarav Sharma",
          className: "Grade 9-A",
          rollNumber: "05",
          online: true,
          unread: 0,
          pinned: true,
          priority: true,
          muted: false,
          archived: false,
          lastSeen: "Online Now",
          roleBadge: "Parent",
          messages: [
            { id: "msg-p1", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Hello Mr. Sharma, just wanted to check on Aarav. He seemed a bit drained in Science class yesterday.", timestamp: "2026-07-14T14:15:00Z", read: true },
            { id: "msg-p2", sender: "Mr. Sharma (Father)", senderRole: "Parent", text: "Thank you for the update, Mrs. Shastri. We have noticed him studying late for the math assessments. We are working with him.", timestamp: "2026-07-14T14:32:00Z", read: true },
            { id: "msg-p3", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Perfect. I have drafted a custom practice checklist for him to cover at his own pace.", timestamp: "2026-07-15T09:00:00Z", read: true },
            { id: "msg-p4", sender: "Mr. Sharma (Father)", senderRole: "Parent", text: "We appreciate your support so much! Is there any specific chapter we should emphasize?", timestamp: "2026-07-15T09:45:00Z", read: false }
          ]
        },
        {
          id: "parent-teacher:std-02:t-01",
          type: "parent",
          name: "Mrs. Patel (Mother)",
          avatarLetter: "PP",
          studentId: "std-02",
          studentName: "Priya Patel",
          className: "Grade 9-A",
          rollNumber: "12",
          online: false,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Last seen 2h ago",
          roleBadge: "Parent",
          messages: [
            { id: "msg-p5", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Hi Priya's team, she did an exceptional job supporting her group in English class today!", timestamp: "2026-07-15T16:00:00Z", read: true },
            { id: "msg-p6", sender: "Mrs. Patel (Mother)", senderRole: "Parent", text: "That is wonderful to hear, Mrs. Shastri! She has been talking about the writing project all week.", timestamp: "2026-07-15T16:45:00Z", read: true }
          ]
        },
        {
          id: "student-teacher:std-01:t-01",
          type: "student",
          name: "Aarav Sharma",
          avatarLetter: "AS",
          studentId: "std-01",
          studentName: "Aarav Sharma",
          className: "Grade 9-A",
          rollNumber: "05",
          online: true,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Active Now",
          roleBadge: "Student",
          messages: [
            { id: "msg-st1", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Aarav, outstanding work on your English thesis!", timestamp: "2026-07-15T10:00:00Z", read: true },
            { id: "msg-st2", sender: "Aarav Sharma", senderRole: "Student", text: "Thank you Mrs. Shastri! I am working on the science revision next.", timestamp: "2026-07-15T10:12:00Z", read: true }
          ]
        }
      ];
    } else if (user.role === Role.PARENT) {
      return [
        ...globalChannels,
        ...parentChannels,
        {
          id: "parent-teacher:std-01:t-01",
          type: "teacher",
          name: "Mrs. Ananya Shastri (Advisor)",
          avatarLetter: "AS",
          studentId: studentContext.id,
          studentName: studentContext.name,
          className: studentContext.class,
          rollNumber: studentContext.rollNumber,
          online: true,
          unread: 0,
          pinned: true,
          priority: true,
          muted: false,
          archived: false,
          lastSeen: "Online Now",
          roleBadge: "Advisor",
          messages: [
            { id: "msg-p1", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Hello Mr. Sharma, just wanted to check on Aarav. He seemed a bit drained in Science class yesterday.", timestamp: "2026-07-14T14:15:00Z", read: true },
            { id: "msg-p2", sender: "Mr. Sharma (Father)", senderRole: "Parent", text: "Thank you for the update, Mrs. Shastri. We have noticed him studying late for the math assessments. We are working with him.", timestamp: "2026-07-14T14:32:00Z", read: true },
            { id: "msg-p3", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Perfect. I have drafted a custom practice checklist for him to cover at his own pace.", timestamp: "2026-07-15T09:00:00Z", read: true },
            { id: "msg-p4", sender: "Mr. Sharma (Father)", senderRole: "Parent", text: "We appreciate your support so much! Is there any specific chapter we should emphasize?", timestamp: "2026-07-15T09:45:00Z", read: false }
          ]
        },
        {
          id: "parent-student:std-01",
          type: "student",
          name: `${studentContext.name} (Your Ward)`,
          avatarLetter: "WS",
          studentId: studentContext.id,
          studentName: studentContext.name,
          className: studentContext.class,
          rollNumber: studentContext.rollNumber,
          online: true,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Active Now",
          roleBadge: "Ward",
          messages: [
            { id: "msg-ps1", sender: "Mr. Sharma (Father)", senderRole: "Parent", text: "Aarav, make sure you finish your math homework before dinner.", timestamp: "2026-07-15T15:00:00Z", read: true },
            { id: "msg-ps2", sender: "Aarav Sharma", senderRole: "Student", text: "Yes Dad, I am on it. Almost done with the practice set.", timestamp: "2026-07-15T15:05:00Z", read: true }
          ]
        }
      ];
    } else {
      // Default / STUDENT role
      return [
        ...globalChannels,
        ...studentChannels,
        {
          id: "student-teacher:std-01:t-01",
          type: "teacher",
          name: "Mrs. Ananya Shastri (Advisor)",
          avatarLetter: "AS",
          studentId: studentContext.id,
          studentName: studentContext.name,
          className: studentContext.class,
          rollNumber: studentContext.rollNumber,
          online: true,
          unread: 0,
          pinned: true,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Online Now",
          roleBadge: "Advisor",
          messages: [
            { id: "msg-st1", sender: "Mrs. Ananya Shastri", senderRole: "Teacher", text: "Aarav, outstanding work on your English thesis!", timestamp: "2026-07-15T10:00:00Z", read: true },
            { id: "msg-st2", sender: "Aarav Sharma", senderRole: "Student", text: "Thank you Mrs. Shastri! I am working on the science revision next.", timestamp: "2026-07-15T10:12:00Z", read: true }
          ]
        },
        {
          id: "parent-student:std-01",
          type: "parent",
          name: "Mr. Sharma (Father)",
          avatarLetter: "MS",
          studentId: studentContext.id,
          studentName: studentContext.name,
          className: studentContext.class,
          rollNumber: studentContext.rollNumber,
          online: true,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Active Now",
          roleBadge: "Parent",
          messages: [
            { id: "msg-ps1", sender: "Mr. Sharma (Father)", senderRole: "Parent", text: "Aarav, make sure you finish your math homework before dinner.", timestamp: "2026-07-15T15:00:00Z", read: true },
            { id: "msg-ps2", sender: "Aarav Sharma", senderRole: "Student", text: "Yes Dad, I am on it. Almost done with the practice set.", timestamp: "2026-07-15T15:05:00Z", read: true }
          ]
        },
        {
          id: "student-ai:std-01",
          type: "ai",
          name: "Vidya AI Companion",
          avatarLetter: "AI",
          studentId: studentContext.id,
          studentName: studentContext.name,
          className: studentContext.class,
          rollNumber: studentContext.rollNumber,
          online: true,
          unread: 0,
          pinned: false,
          priority: false,
          muted: false,
          archived: false,
          lastSeen: "Grounded Companion",
          roleBadge: "AI Agent",
          messages: [
            { id: "msg-ai1", sender: "Vidya AI Companion", senderRole: "Admin", text: "Hello Aarav! I am your AI study copilot. How can I assist with your Standard 9 exam prep today?", timestamp: "2026-07-15T12:00:00Z", read: true },
            { id: "msg-ai2", sender: "Aarav Sharma", senderRole: "Student", text: "Can you help me summarize Chapter 4 in Science?", timestamp: "2026-07-15T12:01:00Z", read: true },
            { id: "msg-ai3", sender: "Vidya AI Companion", senderRole: "Admin", text: "Absolutely! Chapter 4 covers Atoms and Molecules. Let's break down Dalton's atomic theory in a fun way.", timestamp: "2026-07-15T12:02:00Z", read: true }
          ]
        }
      ];
    }
  }, [user, students]);

  // Master local state
  const [conversations, setConversations] = useState<ChatRoom[]>(initialConversations);

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    return initialConversations[0]?.id || "channel:urgent-alerts";
  });

  const [mobileActiveView, setMobileActiveView] = useState<"LIST" | "CHAT" | "INFO">("LIST");
  const [chatSearch, setChatSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "ALL" | "TEACHER" | "PARENT" | "STUDENT" | "UNREAD" | "STARRED" | "ALPHABETICAL"
  >("ALL");

  // Chat inputs & attachments
  const [inputText, setInputText] = useState("");
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"CONTEXT" | "FILES" | "AI_ASSIST">("CONTEXT");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Attachment upload helper
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: "Document" | "Image"; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time presence & typing registries
  const [typingStatus, setTypingStatus] = useState<Record<string, { isTyping: boolean; sender: string }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebRTC Live PTM Call structures
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<"AUDIO" | "VIDEO">("VIDEO");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [callNotes, setCallNotes] = useState("");
  const [meetingSummary, setMeetingSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // AI assistant states
  const [draftType, setDraftType] = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Group creation, voice notes, and message forwarding state
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<"channel" | "parent" | "student">("channel");
  const [newGroupRoleBadge, setNewGroupRoleBadge] = useState("Class Group");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);

  // Active chat context calculations
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0] || initialConversations[0];
  }, [conversations, activeChatId, initialConversations]);

  const activeStudent = useMemo(() => {
    if (!activeChat) return students[0];
    return students.find((s) => s.id === activeChat.studentId) || students[0];
  }, [students, activeChat]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, typingStatus[activeChatId]?.isTyping, isCallActive]);

  // Handle active room joins and historical synchronization
  useEffect(() => {
    if (!socket || !activeChat) return;
    
    // Joint room (with isolated namespace applied under-the-hood via backend helper)
    socket.emit("chat:join", activeChat.id);

    // Fetch messages from database endpoint
    chatService.getMessages(activeChat.id)
      .then((messages) => {
        if (messages.length > 0) {
          const mapped: Message[] = messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            senderRole: m.senderRole,
            text: m.text,
            timestamp: m.timestamp,
            read: m.read || false,
            attachment: m.attachment,
            starred: m.starred || false,
            pinned: m.pinned || false,
            replyTo: m.replyTo
          }));

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeChat.id) {
                return { ...c, messages: mapped, unread: 0 };
              }
              return c;
            })
          );
        }
      })
      .catch((err) => console.error("Error retrieving historical messages:", err));
  }, [activeChatId, socket, activeChat]);

  // Handle real-time incoming events
  useEffect(() => {
    if (!socket) return;

    const onChatMessage = (msg: any) => {
      // Decode room namespace mapping (e.g., channel:urgent-alerts:VIDYA-99 back to channel:urgent-alerts)
      let roomClean = msg.room;
      if (roomClean.includes(":")) {
        const parts = roomClean.split(":");
        if (parts[0] === "channel" || parts[0] === "parent-teacher" || parts[0] === "student-teacher" || parts[0] === "parent-student" || parts[0] === "student-ai") {
          roomClean = parts.slice(0, parts.length - 1).join(":");
        }
      }

      const uiMsg: Message = {
        id: msg.id,
        sender: msg.sender,
        senderRole: msg.senderRole,
        text: msg.text,
        timestamp: msg.timestamp,
        read: msg.read || false,
        attachment: msg.attachment,
        starred: msg.starred || false,
        pinned: msg.pinned || false,
        replyTo: msg.replyTo
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === roomClean) {
            if (c.messages.some((m) => m.id === uiMsg.id)) return c;
            return {
              ...c,
              unread: roomClean === activeChatId ? 0 : c.unread + 1,
              messages: [...c.messages, uiMsg]
            };
          }
          return c;
        })
      );
    };

    const onTyping = (data: any) => {
      let roomClean = data.room;
      if (roomClean.includes(":")) {
        const parts = roomClean.split(":");
        if (parts[0] === "channel" || parts[0] === "parent-teacher" || parts[0] === "student-teacher" || parts[0] === "parent-student" || parts[0] === "student-ai") {
          roomClean = parts.slice(0, parts.length - 1).join(":");
        }
      }

      if (roomClean === activeChatId) {
        setTypingStatus((prev) => ({
          ...prev,
          [roomClean]: { isTyping: data.isTyping, sender: data.sender }
        }));
      }
    };

    socket.on("chat:message", onChatMessage);
    socket.on("chat:typing", onTyping);

    return () => {
      socket.off("chat:message", onChatMessage);
      socket.off("chat:typing", onTyping);
    };
  }, [socket, activeChatId]);

  // Automatically read messages for active channel
  useEffect(() => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            unread: 0,
            messages: c.messages.map((m) => ({ ...m, read: true }))
          };
        }
        return c;
      })
    );
  }, [activeChatId]);

  // WebRTC local camera feed simulation
  useEffect(() => {
    if (isCallActive && callType === "VIDEO" && !isCamOff) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Camera media access blocked or sandboxed:", err);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCallActive, callType, isCamOff]);

  // WebRTC Call Timer
  useEffect(() => {
    let interval: any = null;
    if (isCallActive) {
      setCallTimer(0);
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rSecs.toString().padStart(2, "0")}`;
  };

  // Voice note recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Group creation handler
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: ChatRoom = {
      id: `channel:${newGroupName.toLowerCase().replace(/\s+/g, "-")}`,
      type: newGroupType,
      name: newGroupName,
      avatarLetter: newGroupName.substring(0, 2).toUpperCase(),
      online: true,
      unread: 0,
      pinned: false,
      priority: false,
      muted: false,
      archived: false,
      lastSeen: newGroupDescription || "Public Community",
      roleBadge: newGroupRoleBadge,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "System",
          senderRole: "Admin",
          text: `Welcome to the newly created ${newGroupName} community group!`,
          timestamp: new Date().toISOString(),
          read: true
        }
      ]
    };

    setConversations((prev) => [newGroup, ...prev]);
    setActiveChatId(newGroup.id);
    setNewGroupName("");
    setNewGroupDescription("");
    setIsCreateGroupOpen(false);
    showToast(`Group "${newGroupName}" created successfully.`);
  };

  // Message forwarding handler
  const handleForwardMessage = (roomId: string) => {
    if (!forwardMessage) return;
    const roleLabel =
      user.role === Role.TEACHER ? "Teacher" :
      user.role === Role.PARENT ? "Parent" :
      user.role === Role.STUDENT ? "Student" : "Admin";

    sendChatMessage(roomId, user.name, roleLabel, `[Forwarded]: ${forwardMessage.text}`);
    setIsForwardModalOpen(false);
    setForwardMessage(null);
    showToast("Message forwarded successfully.");
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Message copied to clipboard.");
  };

  // Dispatch live message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const attachmentObj = attachedFile
      ? {
          type: attachedFile.type === "Image" ? ("Image" as const) : ("Document" as const),
          name: attachedFile.name,
          size: attachedFile.size
        }
      : undefined;

    const roleLabel =
      user.role === Role.TEACHER ? "Teacher" :
      user.role === Role.PARENT ? "Parent" :
      user.role === Role.STUDENT ? "Student" : "Admin";

    // Dynamic AI auto-response sequence for the student study companion bot
    if (activeChat.id.startsWith("student-ai:") && inputText.trim()) {
      // 1. Send user message
      sendChatMessage(activeChat.id, user.name, roleLabel, inputText, attachmentObj);
      sendTypingStatus(activeChat.id, roleLabel, false);
      const userTextSaved = inputText;
      setInputText("");
      setAttachedFile(null);
      setReplyMessage(null);

      // 2. Trigger AI bot typing state
      setTimeout(() => {
        setTypingStatus((prev) => ({
          ...prev,
          [activeChat.id]: { isTyping: true, sender: "Vidya AI Companion" }
        }));

        // 3. Request actual Gemini API generation or contextual response
        aiService.chat(
          activeStudent.id,
          [{ role: "user", text: `You are Vidya AI Companion, a brilliant grounded digital study tutor. Answer this student inquiry contextually, matching their Standard 9 level. Query: "${userTextSaved}"` }]
        )
          .then((data) => {
            setTypingStatus((prev) => ({
              ...prev,
              [activeChat.id]: { isTyping: false, sender: "Vidya AI Companion" }
            }));

            const aiReply = data.success ? data.text : "Standard 9 concepts are exciting! Let's explore atoms, mathematical layouts, and chapter summaries together. Feel free to ask more specifics.";
            sendChatMessage(activeChat.id, "Vidya AI Companion", "Admin", aiReply);
          })
          .catch((err) => {
            console.error(err);
            setTypingStatus((prev) => ({
              ...prev,
              [activeChat.id]: { isTyping: false, sender: "Vidya AI Companion" }
            }));
            sendChatMessage(activeChat.id, "Vidya AI Companion", "Admin", "My digital connection is robust. Let's work on this standard math assignment or topic together!");
          });
      }, 1000);

      return;
    }

    // Standard Room routing
    sendChatMessage(activeChat.id, user.name, roleLabel, inputText, attachmentObj);
    sendTypingStatus(activeChat.id, roleLabel, false);

    setInputText("");
    setAttachedFile(null);
    setReplyMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (socket) {
      const isTypingNow = e.target.value.length > 0;
      const roleLabel =
        user.role === Role.TEACHER ? "Teacher" :
        user.role === Role.PARENT ? "Parent" :
        user.role === Role.STUDENT ? "Student" : "Admin";

      sendTypingStatus(activeChat.id, roleLabel, isTypingNow);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      setAttachedFile({
        name: file.name,
        type: isImage ? "Image" : "Document",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      showToast(`Attached file ${file.name} successfully.`);
    }
  };

  // Chat interactive micro-features
  const toggleStarMessage = (msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === msgId ? { ...m, starred: !m.starred } : m))
          };
        }
        return c;
      })
    );
    showToast("Message star state updated.");
  };

  const togglePinMessage = (msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === msgId ? { ...m, pinned: !m.pinned } : m))
          };
        }
        return c;
      })
    );
    showToast("Message pin state toggled.");
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === msgId) {
                const reactions = m.reactions || [];
                if (reactions.includes(emoji)) {
                  return { ...m, reactions: reactions.filter((r) => r !== emoji) };
                }
                return { ...m, reactions: [...reactions, emoji] };
              }
              return m;
            })
          };
        }
        return c;
      })
    );
  };

  const handleDeleteMessage = (msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== msgId)
          };
        }
        return c;
      })
    );
    showToast("Message deleted successfully.", "info");
  };

  // Contextual AI assist drafts using Gemini API wrapper
  const generateAIDraft = async (type: string) => {
    if (!activeStudent) return;
    setGeneratingDraft(true);
    setDraftType(type);
    setAiDraft("");

    const attendanceRate = Math.round((activeStudent.attendance.presentDays / activeStudent.attendance.totalDays) * 100);
    const subjectAverages = activeStudent.academics.subjects
      .map((sub) => {
        const totalScore = sub.grades.reduce((s, g) => s + g.score, 0);
        const totalMax = sub.grades.reduce((s, g) => s + g.maxScore, 0);
        return `${sub.name}: ${Math.round((totalScore / totalMax) * 100)}%`;
      })
      .join(", ");

    let promptGoal = "";
    if (type === "APPRECIATION") promptGoal = "an appreciation note highlighting standard academic excellence and exceptional good behavior.";
    else if (type === "REMINDER") promptGoal = "a friendly but clear study reminder pointing out pending homework tasks.";
    else if (type === "PTM_INVITE") promptGoal = "a formal Parent-Teacher Conference (PTM) invitation to sync on school progress.";
    else if (type === "IMPROVEMENT") promptGoal = "a highly constructive notice addressing standard academic decline and proposing an actionable recovery plan.";
    else if (type === "WEEKLY") promptGoal = "a comprehensive status summary covering grades, attendance rate, and classroom wellbeing notes.";
    else if (type === "SUMMARIZE") {
      const recentChatsText = activeChat.messages
        .slice(-6)
        .map((m) => `${m.sender} (${m.senderRole}): ${m.text}`)
        .join("\n");
      promptGoal = `a summary of this recent conversation exchanges:\n"${recentChatsText}"`;
    }

    const context = `
      You are the class advisor, Mrs. Ananya Shastri. Draft an empathetic, clear, and highly professional message regarding student progress.
      Student details:
      - Student Name: ${activeStudent.name}
      - Attendance rate: ${attendanceRate}%
      - Current average grades: ${subjectAverages}
      - Risk profile: ${attendanceRate < 85 ? "At Risk" : "Stable"}
      
      Goal: Please write ${promptGoal}
      
      Tone: Warm, collaborative, elite, crisp. Keep the output under 100 words. Do not use generic placeholders.
    `;

    try {
      const data = await aiService.chat(
        activeStudent.id,
        [{ role: "user", text: context }]
      );
      if (data.success) {
        setAiDraft(data.text);
      } else {
        setAiDraft(`Dear parent, I wanted to follow up on ${activeStudent.name}'s progress. Everything looks great, but let's connect soon to optimize their exam prep.`);
      }
    } catch (err) {
      console.error(err);
      setAiDraft("Dear parent, I hope you are well. Let's schedule a brief call to align on academic strategies for standard term exams.");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleApplyDraft = () => {
    if (aiDraft) {
      setInputText((prev) => (prev ? prev + "\n" + aiDraft : aiDraft));
      setAiDraft("");
      setDraftType(null);
      showToast("AI draft applied to chat input.");
    }
  };

  // Generate WebRTC meeting summary using Gemini API
  const handleGenerateCallSummary = async () => {
    if (!activeStudent) return;
    setGeneratingSummary(true);
    setMeetingSummary(null);

    const context = `
      You are Class Advisor Mrs. Ananya Shastri. Summarize this Parent-Teacher meeting for ${activeStudent.name} and their parent ${activeChat.name}:
      Meeting Notes taken during the live WebRTC call: "${callNotes}"
      Provide:
      1. Key Discussion Points (Bulleted)
      2. Agreed Action items for both Teacher and Parent
      Keep it very concise, professional, and clear.
    `;

    try {
      const data = await aiService.chat(
        activeStudent.id,
        [{ role: "user", text: context }]
      );
      if (data.success) {
        setMeetingSummary(data.text);
      } else {
        setMeetingSummary(`Parent-Teacher Meeting Summary for ${activeStudent.name}:\n• Discussed study timelines.\n• Action: Aarav to use Vidya AI Planner daily.\n• Mrs. Shastri to share weekly feedback.`);
      }
    } catch (err) {
      console.error(err);
      setMeetingSummary(`Meeting successfully logged. Action items registered on the parent dashboard.`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Contextual actions based on role
  const triggerQuickAction = async (action: string) => {
    if (!activeStudent) return;

    let success = false;
    if (action === "HOMEWORK_REMINDER") {
      if (onAddLog) {
        success = await onAddLog(activeStudent.id, "HOMEWORK", {
          title: "Homework Sync Triggered",
          description: "Class advisor pushed a pending homework synchronization notification to parents.",
          dueDate: "Immediate",
          priority: "High"
        });
        if (success) {
          showToast(`Homework reminder dispatched to ${activeChat.name} regarding incomplete subjects.`);
        }
      } else {
        showToast(`Homework reminder dispatched to ${activeChat.name} successfully.`);
      }
    } else if (action === "SCHEDULE_PTM") {
      if (onAddLog) {
        success = await onAddLog(activeStudent.id, "PTM", {
          title: "PTM Slot Confirmed",
          description: "A 15-minute conference is locked in. Meeting room credentials and links updated.",
          dateTime: new Date(Date.now() + 86400000).toISOString(),
          teacherId: "t-01"
        });
        if (success) {
          showToast(`Parent-Teacher Meeting booked and calendar links pushed to ${activeChat.name}.`);
        }
      } else {
        showToast(`Parent-Teacher Meeting booked and calendar links pushed to ${activeChat.name}.`);
      }
    } else if (action === "SHARE_PROGRESS") {
      showToast(`Report card progress files zipped and sent securely via verified channels.`);
    } else if (action === "CALL_PARENT" || action === "CALL_GUIDE") {
      setCallType("AUDIO");
      setIsCallActive(true);
      showToast("Voice call initiated.");
    } else if (action === "VIDEO_MEETING") {
      setCallType("VIDEO");
      setIsCallActive(true);
      showToast("Video meeting initiated.");
    } else if (action === "POST_NOTICE") {
      showToast("Advisor notice compiled and broadcast to all school registers.");
    } else if (action === "REQUEST_MEETING") {
      setInputText("Dear Teacher Advisor, we would love to request a quick PTM video slot to sync on my ward's exam prep. Please let us know when is convenient.");
      showToast("PTM request draft pre-filled.");
    } else if (action === "REPORT_ABSENCE") {
      setInputText(`Dear Mrs. Shastri, my ward ${activeStudent.name} is unwell today and will not be able to attend class. Kindly grant sick leave leave. Thank you.`);
      showToast("Sick leave request pre-filled.");
    } else if (action === "ASK_AI") {
      setInputText("Can you explain Dalton's atomic theory in a simpler way?");
      showToast("AI query drafted.");
    }
  };

  // Searching & Filtering logic
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Left-sidebar search
      const matchesSearch =
        c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
        (c.studentName && c.studentName.toLowerCase().includes(chatSearch.toLowerCase())) ||
        (c.className && c.className.toLowerCase().includes(chatSearch.toLowerCase())) ||
        c.messages.some((m) => m.text.toLowerCase().includes(chatSearch.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter rows
      if (filterCategory === "TEACHER") return c.type === "teacher" || c.id.includes("staff");
      if (filterCategory === "PARENT") return c.type === "parent" || c.id.includes("parents-council");
      if (filterCategory === "STUDENT") return c.type === "student" || c.id.includes("student-council");
      if (filterCategory === "UNREAD") return c.unread > 0;
      if (filterCategory === "STARRED") return c.messages.some((m) => m.starred);

      return true;
    }).sort((a, b) => {
      if (filterCategory === "ALPHABETICAL") {
        return a.name.localeCompare(b.name);
      }
      // Pinned chats stay at the top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Otherwise sort by latest message timestamp (WhatsApp-style)
      const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
      const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversations, chatSearch, filterCategory]);

  const filteredChatMessages = useMemo(() => {
    if (!activeChat) return [];
    return activeChat.messages.filter((m) => {
      if (!messageSearch) return true;
      return m.text.toLowerCase().includes(messageSearch.toLowerCase());
    });
  }, [activeChat, messageSearch]);

  const presentRate = useMemo(() => {
    if (!activeStudent) return 92;
    return Math.round((activeStudent.attendance.presentDays / activeStudent.attendance.totalDays) * 100);
  }, [activeStudent]);

  const averageGrade = useMemo(() => {
    if (!activeStudent || !activeStudent.academics?.subjects) return 84;
    const subs = activeStudent.academics.subjects;
    if (subs.length === 0) return 84;
    return Math.round(
      subs.reduce((sum, sub) => {
        const score = sub.grades.reduce((acc, g) => acc + g.score, 0);
        const max = sub.grades.reduce((acc, g) => acc + g.maxScore, 0);
        return sum + (max > 0 ? (score / max) * 100 : 0);
      }, 0) / subs.length
    );
  }, [activeStudent]);

  const weakSubjects = useMemo(() => {
    if (!activeStudent || !activeStudent.academics?.subjects) return ["Chemistry"];
    const weak = activeStudent.academics.subjects
      .filter((sub) => {
        const score = sub.grades.reduce((acc, g) => acc + g.score, 0);
        const max = sub.grades.reduce((acc, g) => acc + g.maxScore, 0);
        return max > 0 && (score / max) * 100 < 75;
      })
      .map((sub) => sub.name);
    return weak.length > 0 ? weak : ["None"];
  }, [activeStudent]);

  const pendingHomeworkCount = useMemo(() => {
    if (!activeStudent || !activeStudent.homework) return 0;
    return activeStudent.homework.filter((h) => h.status === "Pending").length;
  }, [activeStudent]);

  const canManageActions = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN || user.role === Role.TEACHER;

  return (
    <div className="h-[calc(100vh-90px)] min-h-[600px] bg-slate-50 border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 font-sans relative w-full">
      
      {/* Toast Render Engine */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
              toast.type === "error" ? "bg-rose-50 border-rose-100 text-rose-800" :
              "bg-indigo-50 border-indigo-100 text-indigo-800"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full bg-current animate-ping`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. LEFT SIDEBAR: Conversational List */}
      <div className={`lg:col-span-4 border-r border-slate-200/80 flex flex-col h-full bg-white relative ${
        mobileActiveView === "LIST" ? "flex" : "hidden lg:flex"
      }`}>
        {/* User Profile Header */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md relative">
              {user.name.substring(0, 2).toUpperCase()}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.name}</h3>
              <div className="flex items-center gap-1">
                <span className="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 font-bold rounded">
                  {user.role}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[8px] text-gray-400 font-semibold font-mono">LIVE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {canManageActions && (
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all"
                title="Create Group / Channel"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => showToast("Direct communication filter active.")}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all"
              title="Archive & Folders"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast("Workspace notifications muted.", "info")}
              className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all"
              title="Mute Notifications"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Unified Search */}
        <div className="p-3 shrink-0 bg-white border-b border-slate-100 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats, students, or messages..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full py-2 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-gray-400"
            />
            {chatSearch && (
              <button
                onClick={() => setChatSearch("")}
                className="absolute right-2.5 top-2.5 p-0.5 hover:bg-slate-200 rounded-full"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* Scrolling filters */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none shrink-0 text-gray-500">
            {(["ALL", "TEACHER", "PARENT", "STUDENT", "UNREAD", "STARRED", "ALPHABETICAL"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`py-1 px-2.5 rounded-full text-[9px] font-bold tracking-wide uppercase transition-all shrink-0 border ${
                  filterCategory === cat
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white hover:bg-slate-50 hover:text-slate-800 border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-2 space-y-1">
          {filteredConversations.some((c) => c.pinned) && (
            <div className="px-2 py-1 text-[8px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Pin className="w-2.5 h-2.5 rotate-45" /> Pinned Chats
            </div>
          )}

          {filteredConversations.map((conv) => {
            const isActive = activeChatId === conv.id;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isTyping = typingStatus[conv.id]?.isTyping;
            const typingSender = typingStatus[conv.id]?.sender;

            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveChatId(conv.id);
                  setMobileActiveView("CHAT");
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all relative border ${
                  isActive
                    ? "bg-white border-slate-200 shadow-md translate-x-1"
                    : "hover:bg-white border-transparent hover:shadow-sm"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                    {conv.avatarLetter}
                  </div>
                  {conv.online && (
                    <span className="absolute bottom-[-2px] right-[-2px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold text-slate-800 truncate">{conv.name}</span>
                    <span className="text-[9px] text-gray-400 font-bold shrink-0">
                      {lastMsg
                        ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>

                  {conv.studentName && (
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-indigo-500 font-semibold truncate">
                      <span>{conv.studentName}</span>
                      <span className="text-slate-300">•</span>
                      <span>{conv.className}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                    {isTyping ? (
                      <span className="text-emerald-600 font-bold animate-pulse flex items-center gap-1">
                        <Bot className="w-3 h-3 animate-bounce" /> {typingSender} is typing...
                      </span>
                    ) : lastMsg ? (
                      <>
                        {lastMsg.attachment && (
                          <span className="text-indigo-500 flex items-center gap-0.5 shrink-0">
                            <Paperclip className="w-3 h-3" /> [{lastMsg.attachment.type}]
                          </span>
                        )}
                        <span className="truncate leading-tight">{lastMsg.text}</span>
                      </>
                    ) : (
                      <span className="italic text-gray-400">Open conversation</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
                  {conv.unread > 0 ? (
                    <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow">
                      {conv.unread}
                    </span>
                  ) : (
                    conv.pinned && <Pin className="w-3.5 h-3.5 text-indigo-400 rotate-45 shrink-0" />
                  )}
                  {conv.priority && (
                    <span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[8px] font-extrabold uppercase">
                      Urgent
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <span>No matching conversations found.</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. MIDDLE CHAT AREA */}
      <div className={`${
        isRightPanelOpen ? "lg:col-span-5" : "lg:col-span-8"
      } flex flex-col h-full bg-slate-50/50 relative ${
        mobileActiveView === "CHAT" ? "flex" : "hidden lg:flex"
      }`}>
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileActiveView("LIST")}
              className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">
              {activeChat?.avatarLetter}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-800">{activeChat?.name}</h4>
                <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 font-extrabold rounded uppercase">
                  {activeChat?.roleBadge}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${activeChat?.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">
                  {activeChat?.online ? "Active Now" : activeChat?.lastSeen || "Offline"}
                </span>
                {activeChat?.studentName && (
                  <>
                    <span className="text-slate-300 font-semibold">•</span>
                    <span className="text-[10px] text-indigo-600 font-extrabold">
                      Context: {activeChat.studentName} ({activeChat.className})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => triggerQuickAction(user.role === Role.PARENT ? "CALL_GUIDE" : "CALL_PARENT")}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => triggerQuickAction("VIDEO_MEETING")}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Video Consultation"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSearchingInChat(!isSearchingInChat)}
              className={`p-2 rounded-xl transition-all ${
                isSearchingInChat ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
              title="Search this ledger"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsRightPanelOpen(!isRightPanelOpen);
                setMobileActiveView(mobileActiveView === "CHAT" ? "INFO" : "CHAT");
              }}
              className={`p-2 rounded-xl transition-all ${
                isRightPanelOpen ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
              title="Toggle Information drawer"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat search overlay */}
        <AnimatePresence>
          {isSearchingInChat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 bg-white border-b border-slate-100 z-10 flex items-center gap-2 overflow-hidden shrink-0"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Find in this chat ledger..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs py-1 text-slate-800 outline-none placeholder:text-gray-400"
              />
              {messageSearch && (
                <span className="text-[10px] text-indigo-600 font-bold font-mono">
                  {filteredChatMessages.length} results
                </span>
              )}
              <button
                onClick={() => {
                  setMessageSearch("");
                  setIsSearchingInChat(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WebRTC Video call simulation */}
        <AnimatePresence>
          {isCallActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "460px", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 border-b border-slate-800 text-white z-20 flex flex-col overflow-hidden relative shadow-inner shrink-0 animate-fade-in"
            >
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                <div className="px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs font-mono font-bold flex items-center gap-1.5 pointer-events-auto border border-white/10">
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
                  <span>LIVE CONSTITUENCY CALL</span>
                  <span className="text-gray-400">|</span>
                  <span>{formatTime(callTimer)}</span>
                </div>
                <div className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold pointer-events-auto shadow-lg flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>Secure WebRTC Tunnel Active</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-16">
                <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group shadow-md">
                  {isCamOff ? (
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto flex items-center justify-center text-xl font-bold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs text-gray-400">Camera Off</p>
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
                    />
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/5">
                    {user.name} (You)
                  </div>
                </div>

                <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group shadow-md">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 mx-auto flex items-center justify-center text-xl font-bold animate-pulse shadow-lg">
                      {activeChat?.avatarLetter}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{activeChat?.name}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Media Stream Linked</p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/5">
                    {activeChat?.name}
                  </div>
                  {isHandRaised && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white p-2 rounded-full shadow-lg border border-amber-400">
                      <span className="text-xs font-bold font-mono">✋ Peer Raised Hand</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-full transition-all ${
                      isMicMuted ? "bg-rose-600 text-white" : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsCamOff(!isCamOff)}
                    className={`p-3 rounded-full transition-all ${
                      isCamOff ? "bg-rose-600 text-white" : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {isCamOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3 rounded-full transition-all ${
                      isScreenSharing ? "bg-emerald-600 text-white animate-pulse" : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    <ScreenShare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className={`p-3 rounded-full transition-all ${
                      isHandRaised ? "bg-amber-500 text-white" : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    ✋
                  </button>
                </div>

                {canManageActions && (
                  <div className="flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Take meeting brief / feedback notes..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  {canManageActions && (
                    <button
                      onClick={handleGenerateCallSummary}
                      disabled={generatingSummary || !callNotes.trim()}
                      className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Call Summary</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsCallActive(false)}
                    className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Call Summary overlay */}
              <AnimatePresence>
                {meetingSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-x-4 bottom-20 bg-slate-950/95 backdrop-blur border border-indigo-500/30 p-4 rounded-2xl z-30 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>AI Grounded Conference Summary</span>
                      </div>
                      <button onClick={() => setMeetingSummary(null)} className="p-0.5 hover:bg-slate-800 rounded">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                      {meetingSummary}
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(meetingSummary || "");
                          showToast("Summary copied to clipboard.");
                        }}
                        className="py-1 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          setInputText((prev) => (prev ? prev + "\n" + meetingSummary : meetingSummary || ""));
                          setMeetingSummary(null);
                        }}
                        className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold"
                      >
                        Use in Chat
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat message history list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 relative select-text">
          <div className="text-center my-2 shrink-0">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full font-mono uppercase border border-indigo-100/50 shadow-sm">
              💬 Secured workspace channel active
            </span>
          </div>

          {filteredChatMessages.map((msg, idx) => {
            const isMe = msg.sender === user.name;
            return (
              <div key={msg.id || idx} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto" : "mr-auto"}`}>
                <div className={`space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && (
                    <span className="text-[9px] text-gray-400 font-bold ml-1">
                      {msg.sender} ({msg.senderRole})
                    </span>
                  )}

                  {msg.replyTo && (
                    <div className="p-2 bg-slate-100/80 border-l-4 border-indigo-500 rounded-r-lg text-[10px] text-gray-500">
                      <span className="font-bold block">{msg.replyTo.sender}</span>
                      <span className="truncate block">{msg.replyTo.text}</span>
                    </div>
                  )}

                  <div className="group relative">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all shadow-sm ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>

                      {msg.attachment && (
                        <div
                          className={`mt-2 p-2 rounded-xl flex items-center gap-2.5 border text-[11px] ${
                            isMe
                              ? "bg-indigo-700/50 border-indigo-500/30 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate">{msg.attachment.name}</p>
                            <p className="text-[9px] opacity-75">{msg.attachment.size}</p>
                          </div>
                          <button
                            onClick={() => showToast(`Downloading attachment ${msg.attachment?.name}...`)}
                            className="p-1 hover:bg-black/10 rounded"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="absolute -bottom-2 right-2 bg-white border border-slate-100 shadow rounded-full px-1.5 py-0.5 flex gap-0.5 text-[10px]">
                          {msg.reactions.map((react, i) => (
                            <span key={i}>{react}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Micro hover actions */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5 z-10 ${
                        isMe ? "-left-[180px]" : "-right-[180px]"
                      }`}
                    >
                      <button
                        onClick={() => setReplyMessage(msg)}
                        className="p-1 bg-white hover:bg-slate-50 text-gray-500 hover:text-indigo-600 border border-slate-200 rounded-lg shadow-sm"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyMessage(msg.text)}
                        className="p-1 bg-white hover:bg-slate-50 text-gray-500 hover:text-slate-800 border border-slate-200 rounded-lg shadow-sm"
                        title="Copy Message"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setForwardMessage(msg);
                          setIsForwardModalOpen(true);
                        }}
                        className="p-1 bg-white hover:bg-slate-50 text-gray-500 hover:text-indigo-600 border border-slate-200 rounded-lg shadow-sm"
                        title="Forward Message"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStarMessage(msg.id)}
                        className={`p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm ${
                          msg.starred ? "text-amber-500" : "text-gray-400"
                        }`}
                        title="Star"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => togglePinMessage(msg.id)}
                        className={`p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm ${
                          msg.pinned ? "text-indigo-600" : "text-gray-400"
                        }`}
                        title="Pin"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 bg-white hover:bg-slate-50 text-rose-500 border border-slate-200 rounded-lg shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAddReaction(msg.id, "👍")}
                        className="p-1 bg-white text-xs border border-slate-200 rounded-lg shadow-sm hover:scale-110"
                      >
                        👍
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-1 justify-end text-[9px] text-gray-400 font-semibold font-mono">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-emerald-500" : "text-slate-300"}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {typingStatus[activeChatId]?.isTyping && (
            <div className="flex gap-2 items-center text-gray-400 text-xs font-semibold ml-2 bg-indigo-50/50 border border-indigo-100/30 p-2.5 rounded-2xl max-w-max animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping shrink-0" />
              <span>{typingStatus[activeChatId].sender} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyMessage && (
          <div className="px-4 py-2 bg-slate-100/90 border-t border-indigo-200 flex justify-between items-center text-xs shrink-0 z-10">
            <div className="border-l-4 border-indigo-500 pl-2">
              <span className="font-bold block text-[10px] text-indigo-600">Replying to {replyMessage.sender}</span>
              <span className="text-gray-500 truncate block max-w-md">{replyMessage.text}</span>
            </div>
            <button onClick={() => setReplyMessage(null)} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attached file preview */}
        {attachedFile && (
          <div className="px-4 py-2 bg-indigo-50/90 border-t border-indigo-200 flex justify-between items-center text-xs shrink-0 z-10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold text-slate-800">{attachedFile.name}</span>
                <span className="text-[10px] text-indigo-600 block">{attachedFile.size} - Ready to send</span>
              </div>
            </div>
            <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-indigo-100 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat input box */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100/40 transition-all p-3">
              {isRecordingVoice ? (
                <div className="w-full flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl p-3 animate-pulse h-14 min-h-[40px]">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                    <span className="text-xs font-bold text-rose-800">Voice Note Recording...</span>
                    <span className="text-xs font-mono font-bold text-rose-600">
                      {formatTime(recordingSeconds)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecordingVoice(false);
                      showToast("Recording cancelled.", "info");
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full bg-transparent border-0 focus:outline-none resize-none text-xs text-gray-800 placeholder-gray-400 h-14 min-h-[40px] leading-relaxed"
                />
              )}

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    title="Upload File"
                    disabled={isRecordingVoice}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const smileys = ["👍", "❤️", "🙌", "😊", "🙏", "🎓"];
                      setInputText((prev) => prev + smileys[Math.floor(Math.random() * smileys.length)]);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    title="Add Emoji"
                    disabled={isRecordingVoice}
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isRecordingVoice) {
                        setIsRecordingVoice(false);
                        const roleLabel =
                          user.role === Role.TEACHER ? "Teacher" :
                          user.role === Role.PARENT ? "Parent" :
                          user.role === Role.STUDENT ? "Student" : "Admin";

                        sendChatMessage(
                          activeChat.id,
                          user.name,
                          roleLabel,
                          `🎙️ Voice Note (${formatTime(recordingSeconds)})`,
                          {
                            type: "Document",
                            name: `voice-note-${Date.now()}.mp3`,
                            size: "240 KB"
                          }
                        );
                        showToast("Voice message sent successfully.");
                      } else {
                        setIsRecordingVoice(true);
                        showToast("Voice recording active. Speak now...");
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      isRecordingVoice
                        ? "text-rose-600 bg-rose-50 animate-pulse border border-rose-100"
                        : "text-slate-400 hover:text-indigo-600 hover:bg-white"
                    }`}
                    title={isRecordingVoice ? "Stop & Send Voice Note" : "Record Voice Note"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!inputText.trim() && !attachedFile}
                    className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 shadow-sm"
                  >
                    <span>Send</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 3. RIGHT DETAILS DRAWER */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`lg:col-span-3 border-l border-slate-200/80 flex flex-col h-full bg-white z-10 w-full ${
              mobileActiveView === "INFO" ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="flex border-b border-slate-100 shrink-0 items-center px-2">
              <button
                type="button"
                onClick={() => setMobileActiveView("CHAT")}
                className="lg:hidden p-2 mr-1 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                title="Back to Chat"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {([
                { id: "CONTEXT", label: "Context" },
                { id: "FILES", label: "Files" },
                { id: "AI_ASSIST", label: "AI Assist" }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightPanelTab(tab.id)}
                  className={`flex-1 py-3 text-center text-[10px] font-bold tracking-wider uppercase transition-all border-b-2 ${
                    rightPanelTab === tab.id
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
                      : "border-transparent text-gray-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white select-text">
              {rightPanelTab === "CONTEXT" && (
                <div className="space-y-4">
                  {/* Student Card */}
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center font-bold text-2xl shadow-sm border border-indigo-200/20">
                      {activeStudent?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{activeStudent?.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {activeStudent?.class} • Roll: {activeStudent?.rollNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
                        <span className="text-[8px] text-gray-400 font-bold block uppercase tracking-wide">
                          Attendance
                        </span>
                        <span
                          className={`text-xs font-extrabold block mt-0.5 ${
                            presentRate < 85 ? "text-rose-500 animate-pulse" : "text-emerald-600"
                          }`}
                        >
                          {presentRate}%
                        </span>
                      </div>
                      <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
                        <span className="text-[8px] text-gray-400 font-bold block uppercase tracking-wide">
                          Avg Grade
                        </span>
                        <span className="text-xs font-extrabold text-indigo-600 block mt-0.5">
                          {averageGrade}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wellbeing metrics */}
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold uppercase tracking-wider text-[9px]">
                        Sync Status
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                          presentRate < 85
                            ? "bg-rose-100 text-rose-700 animate-pulse"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {presentRate < 85 ? "Academic Risk" : "Steady"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      {presentRate < 85
                        ? "Continuous absenteeism detected. Active advisor review recommended."
                        : "No performance flags. Student is progressing on track."}
                    </p>
                  </div>

                  {/* Weak Subjects */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Academic Ledger
                    </span>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Pending Homework</span>
                        <span className="font-bold text-slate-800">{pendingHomeworkCount} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Weak Syllabus Core</span>
                        <span className="font-bold text-rose-600 truncate max-w-[120px]">
                          {weakSubjects.join(", ") || "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contacts details */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Emergency & Contact
                    </span>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block">Advisory Head</span>
                        <p className="font-bold text-slate-800 mt-0.5">Mrs. Ananya Shastri</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase block">Guardian Emergency</span>
                        <p className="font-mono text-slate-600 font-medium mt-0.5">+91 98765 43210</p>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Actions Drawer based on User Role */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {canManageActions ? "Advisor Action Portal" : "Student Action Portal"}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {canManageActions ? (
                        <>
                          <button
                            onClick={() => triggerQuickAction("HOMEWORK_REMINDER")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Remind HW
                          </button>
                          <button
                            onClick={() => triggerQuickAction("SCHEDULE_PTM")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Book PTM
                          </button>
                          <button
                            onClick={() => triggerQuickAction("SHARE_PROGRESS")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5 text-indigo-500" /> Share Progress
                          </button>
                          <button
                            onClick={() => triggerQuickAction("POST_NOTICE")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            📢 Post Notice
                          </button>
                        </>
                      ) : user.role === Role.PARENT ? (
                        <>
                          <button
                            onClick={() => triggerQuickAction("REQUEST_MEETING")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Request PTM
                          </button>
                          <button
                            onClick={() => triggerQuickAction("REPORT_ABSENCE")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            🤒 Sick Leave
                          </button>
                          <button
                            onClick={() => triggerQuickAction("SHARE_PROGRESS")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-500" /> Get Report
                          </button>
                          <button
                            onClick={() => {
                              showToast("Synchronized homework milestones with the household smart board.");
                            }}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            🏡 Sync Board
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => triggerQuickAction("ASK_AI")}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            <Bot className="w-3.5 h-3.5 text-indigo-500" /> AI Coach Prompt
                          </button>
                          <button
                            onClick={() => {
                              showToast("Daily academic study session logged successfully.");
                            }}
                            className="p-2.5 bg-white border border-slate-200/80 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            ⏱️ Log Study
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === "FILES" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Shared Vault
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold font-mono">
                      4 files
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: "Mathematics_Preparatory_Chapters.pdf", size: "2.4 MB", type: "PDF", date: "July 10" },
                      { name: "Grade_9_Calculus_Assessment_Overview.pdf", size: "1.2 MB", type: "PDF", date: "July 08" },
                      { name: "Science_Lab_Term_Guidelines.docx", size: "850 KB", type: "DOC", date: "July 06" },
                      { name: "Student_Report_Card_Q1.pdf", size: "3.1 MB", type: "PDF", date: "July 01" }
                    ].map((file, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2.5 text-xs hover:border-indigo-200 transition-all">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate leading-snug">{file.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold mt-0.5">{file.size} • {file.date}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => showToast(`Opening preview for ${file.name}`)}
                            className="p-1 hover:bg-slate-200 rounded"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => showToast(`Downloading ${file.name}`)}
                            className="p-1 hover:bg-slate-200 rounded"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rightPanelTab === "AI_ASSIST" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <h4 className="text-xs font-display font-extrabold">Grounded AI Companion</h4>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Instantly draft or summarize conversations grounded in attendance and real-time school records.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    {canManageActions ? (
                      <>
                        {[
                          { id: "APPRECIATION", label: "Appreciation" },
                          { id: "REMINDER", label: "HW Reminder" },
                          { id: "PTM_INVITE", label: "PTM Invite" },
                          { id: "IMPROVEMENT", label: "Urge Action" },
                          { id: "WEEKLY", label: "Weekly Status" },
                          { id: "SUMMARIZE", label: "Summarize Chats" }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => generateAIDraft(btn.id)}
                            className={`py-2 px-2.5 border rounded-xl text-[9px] font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-all text-center flex items-center justify-center gap-1 ${
                              draftType === btn.id ? "border-indigo-500 bg-indigo-50 text-indigo-600 font-extrabold" : "border-slate-100 shadow-sm"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => generateAIDraft("SUMMARIZE")}
                          className={`col-span-2 py-3 px-2.5 border rounded-xl text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-all text-center flex items-center justify-center gap-1 border-slate-100 shadow-sm`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Summarize Chat History
                        </button>
                      </>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {generatingDraft && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-indigo-500 animate-bounce" />
                          <span className="text-[10px] font-mono font-bold text-indigo-600">Drafting via Gemini...</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: "70%" }} />
                        </div>
                      </motion.div>
                    )}

                    {!generatingDraft && aiDraft && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-3 relative"
                      >
                        <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider block font-mono">
                          Suggested Draft
                        </span>
                        <p className="text-[11px] text-slate-600 italic leading-relaxed font-medium whitespace-pre-wrap">
                          "{aiDraft}"
                        </p>
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiDraft);
                              showToast("Draft copied to clipboard.");
                            }}
                            className="p-1.5 bg-white border border-slate-100 text-gray-400 hover:text-slate-600 rounded-lg shadow-sm transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleApplyDraft}
                            className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            Use Draft <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Creation Dialog Modal */}
      <AnimatePresence>
        {isCreateGroupOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">Create Community Group</h3>
                </div>
                <button
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Olympiad Club"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Group Type</label>
                  <select
                    value={newGroupType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewGroupType(val);
                      if (val === "channel") setNewGroupRoleBadge("Class Group");
                      else if (val === "parent") setNewGroupRoleBadge("Parent Assembly");
                      else setNewGroupRoleBadge("Student Council");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                  >
                    <option value="channel">Class Group / Announcements</option>
                    <option value="parent">Parent Community</option>
                    <option value="student">Subject Group</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase">Description / Purpose</label>
                  <textarea
                    placeholder="Provide a brief description of the group's guidelines..."
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 h-20 resize-none text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateGroupOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Forwarding Dialog Modal */}
      <AnimatePresence>
        {isForwardModalOpen && forwardMessage && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-800">Forward Message</h3>
                </div>
                <button
                  onClick={() => {
                    setIsForwardModalOpen(false);
                    setForwardMessage(null);
                  }}
                  className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 my-3 shrink-0 italic max-h-24 overflow-y-auto">
                "{forwardMessage.text}"
              </div>

              <span className="text-[10px] font-extrabold text-slate-500 uppercase px-1 shrink-0 mb-2 block">
                Select Destination Conversation
              </span>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleForwardMessage(conv.id)}
                    className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center gap-3 border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
                      {conv.avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{conv.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{conv.roleBadge}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
