import React, { useState, useRef, useEffect } from "react";
import { Student, ChatMessage } from "../types";
import {
  Brain,
  Send,
  User,
  Heart,
  Smile,
  BookOpen,
  CheckCircle,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";

interface StudentTabProps {
  students: Student[];
  onAddLog: (studentId: string, type: string, data: any) => Promise<boolean>;
}

export default function StudentTab({ students, onAddLog }: StudentTabProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [moodRating, setMoodRating] = useState<number>(4);
  const [moodNotes, setMoodNotes] = useState("");
  const [loggingMood, setLoggingMood] = useState(false);

  // Chatbot state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: "Hello! I am Vidya, your AI Success Companion. I can help you plan your study schedule, review homework, or suggest fun ways to learn. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, sendingMessage]);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setLoggingMood(true);
    const success = await onAddLog(selectedStudentId, "MOOD", {
      rating: moodRating,
      notes: moodNotes,
    });
    setLoggingMood(false);
    if (success) {
      setMoodNotes("");
      alert("Wellbeing check-in successfully logged! Your teacher will be informed.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage || !selectedStudentId) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");
    setSendingMessage(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          messages: [...chatHistory, userMessage].map((msg) => ({
            role: msg.role,
            text: msg.text,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: "model",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!selectedStudent) {
    return <div className="text-center py-10 text-gray-400">Please select a student.</div>;
  }

  // Calculate high-level attendance and academics stats
  const totalDays = selectedStudent.attendance.totalDays;
  const presentDays = selectedStudent.attendance.presentDays;
  const attRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student Profile & Academic Progress (Col 1 & 2) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Student Context Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 font-bold text-lg">
              {selectedStudent.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Student Access View</span>
              <h3 className="text-xl font-display font-bold text-gray-800 leading-tight">{selectedStudent.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{selectedStudent.class} • Roll No: {selectedStudent.rollNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-400">Select Student:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setChatHistory([
                  {
                    id: "init",
                    role: "model",
                    text: `Hello! I am Vidya, your AI Success Companion. I have loaded the metrics for ${
                      students.find((s) => s.id === e.target.value)?.name
                    }. Let's work together to make today a success!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ]);
              }}
              className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grades Ledger & Checklists */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h4 className="font-display font-bold text-gray-800 text-base">Course Progress & Formative Grades</h4>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Average Gradebook
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedStudent.academics.subjects.map((sub, i) => {
              const totalScore = sub.grades.reduce((sum, g) => sum + g.score, 0);
              const totalMax = sub.grades.reduce((sum, g) => sum + g.maxScore, 0);
              const avg = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
              const barColor = avg >= 85 ? "bg-indigo-500" : avg >= 70 ? "bg-amber-500" : "bg-rose-500";

              return (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-gray-800">{sub.name}</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {avg}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${avg}%` }}></div>
                  </div>
                  <div className="text-[10px] text-gray-400 flex justify-between">
                    <span>Last: {sub.grades[sub.grades.length - 1]?.assessment || "Quiz"}</span>
                    <span className="font-semibold font-mono">{sub.grades[sub.grades.length - 1]?.score || 0}/{sub.grades[sub.grades.length - 1]?.maxScore || 100}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Wellbeing Check-in Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <Heart className="w-5 h-5 fill-rose-500 animate-pulse" />
            <h4 className="font-display font-bold text-gray-800 text-base">Student Wellbeing Check-in</h4>
          </div>
          <p className="text-xs text-gray-500">
            VidyaSetu monitors student morale alongside academic scores. Select your mood score today and tell us how you are feeling:
          </p>

          <form onSubmit={handleMoodSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">How's your mood today?</label>
              <div className="flex justify-between max-w-sm">
                {[1, 2, 3, 4, 5].map((val) => {
                  const emojis = ["😢", "😰", "😐", "🙂", "😎"];
                  const ratingColors = [
                    "hover:bg-red-50 border-red-200 text-red-600 bg-red-50/20",
                    "hover:bg-orange-50 border-orange-200 text-orange-600 bg-orange-50/20",
                    "hover:bg-amber-50 border-amber-200 text-amber-600 bg-amber-50/20",
                    "hover:bg-teal-50 border-teal-200 text-teal-600 bg-teal-50/20",
                    "hover:bg-emerald-50 border-emerald-200 text-emerald-600 bg-emerald-50/20",
                  ];
                  const activeStyle =
                    moodRating === val
                      ? val === 5
                        ? "bg-emerald-500 text-white border-emerald-500 scale-110 shadow-md"
                        : val === 4
                        ? "bg-teal-500 text-white border-teal-500 scale-110 shadow-md"
                        : val === 3
                        ? "bg-amber-500 text-white border-amber-500 scale-110 shadow-md"
                        : val === 2
                        ? "bg-orange-500 text-white border-orange-500 scale-110 shadow-md"
                        : "bg-red-500 text-white border-red-500 scale-110 shadow-md"
                      : "bg-slate-50 border-slate-100 text-gray-500";

                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setMoodRating(val)}
                      className={`w-11 h-11 rounded-full border-2 font-bold text-base flex flex-col items-center justify-center transition-all ${activeStyle}`}
                    >
                      <span>{emojis[val - 1]}</span>
                      <span className="text-[8px] leading-none mt-0.5">{val}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Notes & Reflections</label>
              <textarea
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                required
                placeholder="Optional: How was school today? What did you enjoy or struggle with?"
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-indigo-500 h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingMood}
              className="py-2.5 px-6 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              {loggingMood && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Wellbeing Log
            </button>
          </form>
        </div>
      </div>

      {/* AI Success Companion Chatbot (Col 3) */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col h-[580px]">
        <div className="border-b border-gray-50 pb-3 mb-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h4 className="font-display font-bold text-gray-800 text-sm">Vidya AI Success Companion</h4>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
            Personal academic support companion. Grounded in your attendance, syllabus, and study records.
          </p>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {chatHistory.map((msg) => {
            const isBot = msg.role === "model";
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] space-y-1 ${
                    isBot
                      ? "bg-slate-50 text-gray-700 rounded-tl-none border border-slate-100"
                      : "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[8px] block text-right font-mono font-medium ${
                    isBot ? "text-gray-400" : "text-indigo-200"
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {sendingMessage && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-slate-50 text-gray-400 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1.5 font-mono text-[10px]">
                <span>Vidya is drafting study advice</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Tray */}
        <form onSubmit={handleSendMessage} className="mt-4 border-t border-gray-100 pt-3 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={sendingMessage}
            placeholder="Ask Vidya: how to study, practice guides, etc."
            className="flex-1 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-indigo-500"
          />
          <button
            type="submit"
            disabled={sendingMessage || !chatInput.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center shadow-md disabled:bg-indigo-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
