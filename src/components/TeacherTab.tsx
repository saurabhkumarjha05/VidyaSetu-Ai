import React, { useState } from "react";
import { Student } from "../types";
import { aiService } from "../services/aiService";
import {
  Brain,
  FileText,
  Plus,
  Loader2,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Award,
  BookOpen,
  Frown,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface TeacherTabProps {
  students: Student[];
  onAddLog: (studentId: string, type: string, data: any) => Promise<boolean>;
}

export default function TeacherTab({ students, onAddLog }: TeacherTabProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // Forms states
  const [activeForm, setActiveForm] = useState<"OBSERVATION" | "GRADE" | "HOMEWORK" | null>(null);
  const [obsCategory, setObsCategory] = useState("Behavior");
  const [obsContent, setObsContent] = useState("");
  const [obsSentiment, setObsSentiment] = useState<"Positive" | "Neutral" | "Negative">("Neutral");

  const [gradeSubject, setGradeSubject] = useState("Mathematics");
  const [gradeAssessment, setGradeAssessment] = useState("");
  const [gradeScore, setGradeScore] = useState("");
  const [gradeMaxScore, setGradeMaxScore] = useState("100");

  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState("Mathematics");
  const [hwDueDate, setHwDueDate] = useState("");

  const [formSubmitting, setFormSubmitting] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleDiagnose = async () => {
    if (!selectedStudentId) return;
    setDiagnosing(true);
    setDiagnosisResult(null);
    try {
      const data = await aiService.diagnose(selectedStudentId);
      if (data.success) {
        setDiagnosisResult(data.insight);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiagnosing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !activeForm) return;
    setFormSubmitting(true);

    let payload: any = {};
    if (activeForm === "OBSERVATION") {
      payload = {
        category: obsCategory,
        content: obsContent,
        sentiment: obsSentiment,
      };
    } else if (activeForm === "GRADE") {
      payload = {
        subjectName: gradeSubject,
        assessment: gradeAssessment,
        score: gradeScore,
        maxScore: gradeMaxScore,
      };
    } else if (activeForm === "HOMEWORK") {
      payload = {
        title: hwTitle,
        subject: hwSubject,
        dueDate: hwDueDate,
      };
    }

    const typeMapping = {
      OBSERVATION: "OBSERVATION",
      GRADE: "GRADE",
      HOMEWORK: "ASSIGN_HOMEWORK",
    };

    const success = await onAddLog(selectedStudentId, typeMapping[activeForm], payload);
    setFormSubmitting(false);

    if (success) {
      // Reset state
      setObsContent("");
      setGradeAssessment("");
      setGradeScore("");
      setHwTitle("");
      setHwDueDate("");
      setActiveForm(null);
    }
  };

  if (!selectedStudent) {
    return <div className="text-center py-10 text-gray-400">Please add students to get started.</div>;
  }

  // Compute student-specific metrics
  const totalHomework = selectedStudent.homework.length;
  const completedHomework = selectedStudent.homework.filter((h) => h.status === "Completed").length;
  const homeworkRate = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0;

  const attendanceRate = selectedStudent.attendance.totalDays > 0 ? Math.round(
    (selectedStudent.attendance.presentDays / selectedStudent.attendance.totalDays) * 100
  ) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roster & Quick Actions (Col 1) */}
      <div className="space-y-6">
        {/* Student Selector Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            Select Active Student
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setDiagnosisResult(null);
            }}
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {students.map((std) => (
              <option key={std.id} value={std.id}>
                {std.name} ({std.rollNumber})
              </option>
            ))}
          </select>

          <div className="pt-2 border-t border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
              {selectedStudent.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{selectedStudent.name}</h4>
              <p className="text-xs text-gray-400">{selectedStudent.class}</p>
            </div>
          </div>
        </div>

        {/* Quick Log Form Launcher */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-gray-800 text-sm">Add Logs & Worksheets</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setActiveForm(activeForm === "OBSERVATION" ? null : "OBSERVATION")}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                activeForm === "OBSERVATION"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-slate-50 text-gray-600 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Teacher Observation Log
            </button>
            <button
              onClick={() => setActiveForm(activeForm === "GRADE" ? null : "GRADE")}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                activeForm === "GRADE"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-slate-50 text-gray-600 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <Award className="w-4 h-4" />
              Register Test Grades
            </button>
            <button
              onClick={() => setActiveForm(activeForm === "HOMEWORK" ? null : "HOMEWORK")}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                activeForm === "HOMEWORK"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-slate-50 text-gray-600 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Assign Personalized Homework
            </button>
          </div>

          {/* Form Overlay */}
          {activeForm && (
            <form onSubmit={handleFormSubmit} className="pt-4 border-t border-gray-100 space-y-3">
              {activeForm === "OBSERVATION" && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Category</label>
                    <select
                      value={obsCategory}
                      onChange={(e) => setObsCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    >
                      <option value="Behavior">Behavior & Focus</option>
                      <option value="Academic Stress">Academic Stress</option>
                      <option value="Engagement">Social Engagement</option>
                      <option value="Health">Physical Health</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Log Content</label>
                    <textarea
                      required
                      value={obsContent}
                      onChange={(e) => setObsContent(e.target.value)}
                      placeholder="Enter specific teacher observations..."
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs h-20 resize-none focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Sentiment Tone</label>
                    <div className="flex gap-2">
                      {["Positive", "Neutral", "Negative"].map((tone) => (
                        <button
                          type="button"
                          key={tone}
                          onClick={() => setObsSentiment(tone as any)}
                          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                            obsSentiment === tone
                              ? tone === "Positive"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : tone === "Negative"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                              : "bg-slate-50 text-gray-500 border-slate-100"
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeForm === "GRADE" && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Subject</label>
                    <select
                      value={gradeSubject}
                      onChange={(e) => setGradeSubject(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Assessment Label</label>
                    <input
                      type="text"
                      required
                      value={gradeAssessment}
                      onChange={(e) => setGradeAssessment(e.target.value)}
                      placeholder="e.g., Weekly Quiz 4, Midterm"
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Score Obtained</label>
                      <input
                        type="number"
                        required
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder="85"
                        className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Max Score</label>
                      <input
                        type="number"
                        required
                        value={gradeMaxScore}
                        onChange={(e) => setGradeMaxScore(e.target.value)}
                        placeholder="100"
                        className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeForm === "HOMEWORK" && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Worksheet Title</label>
                    <input
                      type="text"
                      required
                      value={hwTitle}
                      onChange={(e) => setHwTitle(e.target.value)}
                      placeholder="e.g., Trigonometry Basics Quiz"
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Subject</label>
                    <select
                      value={hwSubject}
                      onChange={(e) => setHwSubject(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {formSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Record Log
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Holistic Performance Records (Col 2 & 3) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Core Roster Summary Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Attendance Trend</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-800">{attendanceRate}%</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                attendanceRate >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {attendanceRate >= 90 ? "Normal" : "Review Required"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Homework Yield</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-800">{homeworkRate}%</span>
              <span className="text-xs text-gray-400">
                {completedHomework}/{totalHomework} done
              </span>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Wellness Index</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-800">
                {(selectedStudent.wellbeing.moodHistory.reduce((s, m) => s + m.rating, 0) /
                  (selectedStudent.wellbeing.moodHistory.length || 1)).toFixed(1)}/5.0
              </span>
              <span className="text-xs text-gray-400">
                {selectedStudent.wellbeing.observations.length} logs
              </span>
            </div>
          </div>
        </div>

        {/* Live Observation Ledger */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-gray-800 text-base">Observation & Behavioral Ledger</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {selectedStudent.wellbeing.observations.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">No behavioral records listed for this student.</p>
            ) : (
              [...selectedStudent.wellbeing.observations].reverse().map((obs, index) => {
                const sentimentColor =
                  obs.sentiment === "Positive"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : obs.sentiment === "Negative"
                    ? "bg-rose-50 text-rose-700 border-rose-100"
                    : "bg-slate-50 text-slate-700 border-slate-100";

                return (
                  <div key={index} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">{obs.category}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{obs.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${sentimentColor}`}>
                        {obs.sentiment} Tone
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{obs.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Diagnostics Launcher Panel */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700">
                <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Pedagogical Diagnosis</span>
              </div>
              <h4 className="font-display font-bold text-gray-800 text-lg">
                Run Gemini AI Holistic Diagnosis
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Formulates adaptive homework sheets, evaluates behavioral risks, and designs structural plans for teachers and parents.
              </p>
            </div>

            <button
              onClick={handleDiagnose}
              disabled={diagnosing}
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              {diagnosing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-200" />
              )}
              {diagnosing ? "Analyzing..." : "Diagnose Student"}
            </button>
          </div>

          {/* Diagnostic Result Rendering */}
          {diagnosisResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white border border-indigo-100 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono text-indigo-600">
                    DIAGNOSIS REPORT: {selectedStudent.name}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  diagnosisResult.riskLevel === "High"
                    ? "bg-rose-100 text-rose-700"
                    : diagnosisResult.riskLevel === "Medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {diagnosisResult.riskLevel} Attention Risk
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-600 leading-relaxed italic bg-indigo-50/20 p-3 rounded-lg">
                  "{diagnosisResult.summary}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Findings */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Core Findings
                  </h5>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-gray-500">
                    {diagnosisResult.keyFindings.map((finding: string, i: number) => (
                      <li key={i}>{finding}</li>
                    ))}
                  </ul>
                </div>

                {/* Directives */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-indigo-500" /> Action Guidelines
                  </h5>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-gray-500">
                    {diagnosisResult.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Personalized homework generator adaptions */}
              <div className="pt-3 border-t border-gray-50 space-y-2">
                <h5 className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500 animate-pulse" />
                  AI-Personalized Homework Adaptation Topics
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {diagnosisResult.recommendedHomework.map((hw: string, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-4 h-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      {hw}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
