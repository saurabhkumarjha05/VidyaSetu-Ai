import React, { useState } from "react";
import { Student, User } from "../types";
import { aiService } from "../services/aiService";
import {
  Sparkles,
  BookOpen,
  FileText,
  Bookmark,
  Calendar,
  Loader2,
  Copy,
  Download,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Award,
  ListTodo,
  FileDown,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIWorkplaceHubProps {
  user: User;
  students: Student[];
}

export default function AIWorkplaceHub({ user, students }: AIWorkplaceHubProps) {
  const [activeTool, setActiveTool] = useState<"LESSON_PLANNER" | "WORKSHEET" | "REPORT_GEN">("LESSON_PLANNER");

  // Lesson Planner states
  const [grade, setGrade] = useState("Grade 9-A");
  const [subject, setSubject] = useState("Science");
  const [topic, setTopic] = useState("Newton's Laws of Motion");
  const [duration, setDuration] = useState("45 mins");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<string>("");

  // Worksheet Generator states
  const [wsGrade, setWsGrade] = useState("Grade 9-A");
  const [wsSubject, setWsSubject] = useState("Mathematics");
  const [wsTopic, setWsTopic] = useState("Quadratic Equations");
  const [wsDifficulty, setWsDifficulty] = useState("Medium");
  const [loadingWorksheet, setLoadingWorksheet] = useState(false);
  const [worksheetContent, setWorksheetContent] = useState<string>("");

  // Report card generator states
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportSummary, setReportSummary] = useState<string>("");

  const handleGenerateLesson = async () => {
    setLoadingLesson(true);
    setLessonPlan("");

    const prompt = `
      You are an expert curriculum designer. Generate a highly structured and comprehensive lesson plan for:
      - Grade: ${grade}
      - Subject: ${subject}
      - Topic: ${topic}
      - Duration: ${duration}
      
      Format the output beautifully as clear markdown sections:
      - ## LESSON OVERVIEW
      - ## PEDAGOGICAL OBJECTIVES
      - ## INSTRUCTIONAL SEQUENCE (with minute-by-minute breakdowns)
      - ## INTERACTIVE CLASSROOM ACTIVITIES
      - ## DIFFERENTIATED LEARNING ADAPTATIONS (For struggling vs advanced students)
      - ## CONCISE SUMMATIVE EVALUATION QUESTIONS
      
      Ensure the plan uses modern active-learning strategies.
    `;

    try {
      const data = await aiService.chat(
        students[0]?.id || "std-01",
        [{ role: "user", text: prompt }]
      );
      if (data.success) {
        setLessonPlan(data.text);
      } else {
        setLessonPlan("Could not compile lesson plan. Please check server status.");
      }
    } catch (err) {
      console.error(err);
      setLessonPlan("Unable to generate. Check your local API configurations.");
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleGenerateWorksheet = async () => {
    setLoadingWorksheet(true);
    setWorksheetContent("");

    const prompt = `
      You are a senior teacher's assistant. Generate a professional class worksheet for:
      - Grade: ${wsGrade}
      - Subject: ${wsSubject}
      - Topic: ${wsTopic}
      - Difficulty: ${wsDifficulty}
      
      Format the output with clear markdown sections:
      - ## PRACTICE WORKSHEET: ${wsTopic}
      - ## PART A: CONCEPTUAL DRILLS (3 Multiple-Choice Questions with brief explanations)
      - ## PART B: ANALYTICAL PROBLEM SOLVING (2 Multi-step questions showing breakdown steps)
      - ## PART C: REAL-WORLD PROBLEM SOLVING CASE STUDY (1 Applied scenario)
      - ## COMPLETE SOLUTIONS & ANSWER KEY (provide detailed scoring guidelines)
    `;

    try {
      const data = await aiService.chat(
        students[0]?.id || "std-01",
        [{ role: "user", text: prompt }]
      );
      if (data.success) {
        setWorksheetContent(data.text);
      } else {
        setWorksheetContent("Failed to generate worksheet. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setWorksheetContent("Connection timeout. Confirm backend is serving.");
    } finally {
      setLoadingWorksheet(false);
    }
  };

  const handleGenerateReport = async () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    setLoadingReport(true);
    setReportSummary("");

    const presentRate = Math.round((student.attendance.presentDays / student.attendance.totalDays) * 100);
    const avgScore = student.academics.subjects.reduce((sum, sub) => {
      const subAvg = sub.grades.reduce((acc, g) => acc + g.score, 0) / sub.grades.reduce((acc, g) => acc + g.maxScore, 0) * 100;
      return sum + subAvg;
    }, 0) / student.academics.subjects.length;

    const prompt = `
      You are Class Advisor Mrs. Shastri. Compile an authentic, highly detailed, and constructive End-of-Term Report Card Summary for:
      - Student Name: ${student.name}
      - Attendance rate: ${presentRate}%
      - Academic Score Average: ${Math.round(avgScore)}%
      
      Format with clear markdown sections:
      - ## ACADEMIC MILESTONES & DISCIPLINARY STRENGTHS
      - ## OPPORTUNITIES FOR PEDAGOGICAL GROWTH (Specifically address areas for refinement)
      - ## CLASSROOM MORALE & BEHAVIOR OBSERVATIONS
      - ## PERSONALIZED WORKPLAN STRATEGY FOR TERM 2
      - ## EMOTIONAL ENCOURAGEMENT MESSAGE FOR THE GUARDIAN
      
      Tone should be professional, insightful, and motivating.
    `;

    try {
      const data = await aiService.chat(
        selectedStudentId,
        [{ role: "user", text: prompt }]
      );
      if (data.success) {
        setReportSummary(data.text);
      } else {
        setReportSummary("Failed to generate report card summary.");
      }
    } catch (err) {
      console.error(err);
      setReportSummary("Connection timeout. Please retry.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper Navigation Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">VidyaSetu AI Workspace</span>
          </div>
          <h2 className="text-xl font-display font-extrabold text-white mt-1">Cognitive Workspace Engine</h2>
          <p className="text-xs text-indigo-100/70 max-w-lg leading-relaxed mt-0.5">
            Automate core administrative prep. Generate custom worksheets, lesson curriculums, and detailed report cards using server-side Gemini 3.5.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex flex-wrap gap-1 bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
          {[
            { id: "LESSON_PLANNER", label: "Lesson Planner", icon: BookOpen },
            { id: "WORKSHEET", label: "Worksheet Gen", icon: FileText },
            { id: "REPORT_GEN", label: "Report summaries", icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id as any)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  active ? "bg-white text-indigo-950 shadow-sm" : "text-indigo-200/60 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPILER PANEL: Parameters Form */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-800">Operational Configurations</h3>
          </div>

          {activeTool === "LESSON_PLANNER" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Target Roster Class</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                >
                  <option value="Grade 9-A">Grade 9-A (Science & Math)</option>
                  <option value="Grade 8-B">Grade 8-B (Aesthetics)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Subject Field</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                >
                  <option value="Science">Science (Physics/Chemistry)</option>
                  <option value="Mathematics">Mathematics (Calculus/Algebra)</option>
                  <option value="English">English Literature</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Topic Curriculum Heading</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Gravitation Laws"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Period Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                >
                  <option value="45 mins">Standard Period (45 mins)</option>
                  <option value="60 mins">Extended Session (60 mins)</option>
                  <option value="90 mins">Lab Block (90 mins)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateLesson}
                disabled={loadingLesson || !topic.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {loadingLesson ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Compiling Curriculum...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Compile AI Lesson Plan</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTool === "WORKSHEET" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Target Grade</label>
                <select
                  value={wsGrade}
                  onChange={(e) => setWsGrade(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                >
                  <option value="Grade 9-A">Grade 9-A (Science & Math)</option>
                  <option value="Grade 8-B">Grade 8-B (Aesthetics)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Syllabus Area</label>
                <select
                  value={wsSubject}
                  onChange={(e) => setWsSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Chapter Focus Theme</label>
                <input
                  type="text"
                  value={wsTopic}
                  onChange={(e) => setWsTopic(e.target.value)}
                  placeholder="e.g. Trigonometric Ratios"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Difficulty Standard</label>
                <div className="grid grid-cols-3 gap-1">
                  {["Easy", "Medium", "Hard"].map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setWsDifficulty(diff)}
                      className={`py-2 px-1 border rounded-xl text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all ${
                        wsDifficulty === diff ? "border-indigo-600 bg-indigo-50 text-indigo-600 font-extrabold" : "border-slate-100 shadow-sm"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateWorksheet}
                disabled={loadingWorksheet || !wsTopic.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {loadingWorksheet ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating Exercises...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Compile AI Worksheet</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTool === "REPORT_GEN" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Select Target Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={loadingReport || !selectedStudentId}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {loadingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Drafting Summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Compile Report Card Summary</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT DISPLAY PANEL: Generated Output Console */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-[450px]">
          
          {/* Output Header */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                {activeTool === "LESSON_PLANNER" ? "Compiled Curriculum Ledger" : activeTool === "WORKSHEET" ? "Generated Conceptual Exercises" : "Empathetic Performance Summary"}
              </span>
            </div>

            {/* Actions for generated content */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const content = activeTool === "LESSON_PLANNER" ? lessonPlan : activeTool === "WORKSHEET" ? worksheetContent : reportSummary;
                  if (content) {
                    navigator.clipboard.writeText(content);
                    alert("Content successfully copied to clipboard.");
                  }
                }}
                disabled={!(lessonPlan || worksheetContent || reportSummary)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-gray-500 border border-slate-100 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                title="Copy to Clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  alert("Preparing PDF asset compilation for print...");
                }}
                disabled={!(lessonPlan || worksheetContent || reportSummary)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-gray-500 border border-slate-100 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                title="Print PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* 1. Lesson plan loading / layout */}
              {activeTool === "LESSON_PLANNER" && (
                <div className="h-full">
                  {loadingLesson && (
                    <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-mono text-indigo-600 font-bold animate-pulse">Gemini formulating interactive instructional sequence...</p>
                    </div>
                  )}

                  {!loadingLesson && lessonPlan && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed space-y-4 font-mono bg-slate-50 p-5 rounded-2xl border border-slate-100"
                    >
                      {lessonPlan}
                    </motion.div>
                  )}

                  {!loadingLesson && !lessonPlan && (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-2">
                      <BookOpen className="w-10 h-10 text-gray-300" />
                      <h4 className="text-xs font-bold text-slate-700">No Lesson Plan Formulated</h4>
                      <p className="text-[11px] text-gray-400 max-w-xs">Configure the topic focus on the left and click Compile to run the server-side pedagogical engine.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Worksheet loading / layout */}
              {activeTool === "WORKSHEET" && (
                <div className="h-full">
                  {loadingWorksheet && (
                    <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-mono text-indigo-600 font-bold animate-pulse">Gemini assembling analytical question keys...</p>
                    </div>
                  )}

                  {!loadingWorksheet && worksheetContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed space-y-4 font-mono bg-slate-50 p-5 rounded-2xl border border-slate-100"
                    >
                      {worksheetContent}
                    </motion.div>
                  )}

                  {!loadingWorksheet && !worksheetContent && (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-2">
                      <FileDown className="w-10 h-10 text-gray-300" />
                      <h4 className="text-xs font-bold text-slate-700">No Custom Drills Assembled</h4>
                      <p className="text-[11px] text-gray-400 max-w-xs">Generate highly customized worksheets and solution manuals specific to student grade standards.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Report summaries loading / layout */}
              {activeTool === "REPORT_GEN" && (
                <div className="h-full">
                  {loadingReport && (
                    <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-mono text-indigo-600 font-bold animate-pulse">Gemini synthesizing holistic report summaries...</p>
                    </div>
                  )}

                  {!loadingReport && reportSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed space-y-4 font-mono bg-slate-50 p-5 rounded-2xl border border-slate-100"
                    >
                      {reportSummary}
                    </motion.div>
                  )}

                  {!loadingReport && !reportSummary && (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-2">
                      <Award className="w-10 h-10 text-gray-300" />
                      <h4 className="text-xs font-bold text-slate-700">No Report Summaries Compiled</h4>
                      <p className="text-[11px] text-gray-400 max-w-xs">Select a student and generate a highly detailed and professional summative growth adapter.</p>
                    </div>
                  )}
                </div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
