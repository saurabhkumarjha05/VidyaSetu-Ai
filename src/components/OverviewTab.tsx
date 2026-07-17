import React, { useState, useEffect } from "react";
import { Student, Role } from "../types";
import { Shield, Brain, AlertTriangle, TrendingUp, Users, ArrowRight, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface OverviewTabProps {
  students: Student[];
}

interface AdminReport {
  title: string;
  overview: string;
  atRiskStudents: {
    name: string;
    reasons: string[];
    urgency: string;
  }[];
  policyRecommendations: {
    title: string;
    description: string;
    impact: string;
  }[];
}

export default function OverviewTab({ students }: OverviewTabProps) {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Aggregating school-wide logs & gradebooks...",
    "Correlating academic score variations with mood indexes...",
    "Running deep sentiment analysis on observation registers...",
    "Formulating localized early-intervention guidelines...",
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateReport = async () => {
    setLoading(true);
    setReport(null);
    setLoadingStep(0);
    try {
      const res = await fetch("/api/ai/admin-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute school-wide stats
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

  // Students with attendance rate < 85% or academic average < 65% are flagged
  const flaggedCount = students.filter((s) => {
    const attRate = s.attendance.totalDays > 0 ? (s.attendance.presentDays / s.attendance.totalDays * 100) : 100;
    const studentGrades = s.academics.subjects.flatMap((sub) => sub.grades);
    const totalScore = studentGrades.reduce((a, g) => a + g.score, 0);
    const totalMax = studentGrades.reduce((a, g) => a + g.maxScore, 0);
    const avg = totalMax > 0 ? (totalScore / totalMax * 100) : 80;
    return attRate < 85 || avg < 65 || s.wellbeing.observations.filter(o => o.sentiment === "Negative").length > 1;
  }).length;

  return (
    <div className="space-y-6">
      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-grid">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total Enrolled</span>
            <h3 className="text-3xl font-display font-bold text-gray-800">{totalStudents}</h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="text-emerald-500 font-medium">100% active</span> across Class 9-A
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Average Attendance</span>
            <h3 className="text-3xl font-display font-bold text-gray-800">{avgAttendance}%</h3>
            <p className="text-xs text-gray-500 mt-2">Target benchmark is 90%</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Academic Average</span>
            <h3 className="text-3xl font-display font-bold text-gray-800">{avgGrade}%</h3>
            <p className="text-xs text-gray-500 mt-2">Formative & Summative average</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Wellbeing Index</span>
            <h3 className="text-3xl font-display font-bold text-gray-800">{avgMood}/5.0</h3>
            <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {flaggedCount} student alerts active
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Metrics & Student Status list */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-display font-bold text-gray-800 text-lg">Active Roster & Analytics</h3>
              <p className="text-xs text-gray-400 mt-1">Holistic tracking of individual student benchmarks</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
              Grade 9-A
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2 text-center">Attendance</th>
                  <th className="py-3 px-2 text-center">Academic Avg</th>
                  <th className="py-3 px-2 text-center">Wellbeing Status</th>
                  <th className="py-3 px-2 text-right">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {students.map((student) => {
                  const attRate = student.attendance.totalDays > 0 ? Math.round((student.attendance.presentDays / student.attendance.totalDays) * 100) : 100;
                  const attColor = attRate >= 90 ? "text-emerald-600 bg-emerald-50" : attRate >= 80 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";

                  const allGrades = student.academics.subjects.flatMap(s => s.grades);
                  const totalScore = allGrades.reduce((sum, g) => sum + g.score, 0);
                  const totalMax = allGrades.reduce((sum, g) => sum + g.maxScore, 0);
                  const acadAvg = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 80;
                  const acadColor = acadAvg >= 85 ? "text-indigo-600" : acadAvg >= 70 ? "text-gray-700" : "text-rose-600 font-medium";

                  const currentMoodVal = student.wellbeing.moodHistory[student.wellbeing.moodHistory.length - 1]?.rating || 3;
                  const moodLabel = currentMoodVal >= 4 ? "Excellent" : currentMoodVal >= 3 ? "Stable" : "Stressed";
                  const moodColor = currentMoodVal >= 4 ? "bg-emerald-500" : currentMoodVal >= 3 ? "bg-amber-500" : "bg-rose-500 animate-pulse";

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block leading-tight">{student.name}</span>
                            <span className="text-xs text-gray-400 font-mono">ID: {student.rollNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${attColor}`}>
                          {attRate}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium">
                        <span className={acadColor}>{acadAvg}%</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${moodColor}`}></span>
                          <span className="text-xs text-gray-600 font-medium">{moodLabel} ({currentMoodVal}/5)</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-xs font-medium text-gray-500">
                          {student.wellbeing.observations.length} logs
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Simple custom SVG chart for Classroom Wellbeing and Academics comparison */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Correlation Dashboard: Academics vs Wellbeing Index
            </h4>
            <div className="h-44 flex items-end justify-between gap-6 px-4 pt-4 border-b border-l border-gray-200 relative">
              {students.map((student, idx) => {
                const allGrades = student.academics.subjects.flatMap(s => s.grades);
                const acadAvg = allGrades.length > 0
                  ? Math.round(allGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / allGrades.length)
                  : 0;
                const moodAvg = student.wellbeing.moodHistory.length > 0 ? student.wellbeing.moodHistory.reduce((s, m) => s + m.rating, 0) / student.wellbeing.moodHistory.length : 3.0;

                // Scale values to fit 120px height
                const acadHeight = (acadAvg / 100) * 120;
                const moodHeight = (moodAvg / 5) * 120;

                return (
                  <div key={student.id} className="flex-1 flex flex-col items-center group relative">
                    <div className="w-full flex justify-center gap-1.5 items-end h-32">
                      {/* Academic Bar */}
                      <div
                        style={{ height: `${acadHeight}px` }}
                        className="w-4 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all relative"
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-950 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono">
                          {acadAvg}%
                        </span>
                      </div>
                      {/* Wellbeing Bar */}
                      <div
                        style={{ height: `${moodHeight}px` }}
                        className="w-4 bg-rose-400 rounded-t-sm hover:bg-rose-500 transition-all relative"
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-950 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono">
                          Mood: {moodAvg.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate w-full text-center mt-2 font-medium">
                      {student.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
              {/* Y Axis Legend */}
              <div className="absolute right-2 top-2 flex flex-col gap-1 text-[9px] text-gray-400 font-semibold bg-white p-1.5 rounded border border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1.5 bg-indigo-500 rounded-sm"></span> Academics
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1.5 bg-rose-400 rounded-sm"></span> Wellbeing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI School Strategist Sidecar Panel */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-200">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">AI Operating System</span>
            </div>

            <h3 className="text-2xl font-display font-bold leading-tight text-white">
              AI Principal & Policy Strategist
            </h3>

            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Consolidate academic metrics, mood ratings, and student wellness reports from all classrooms to generate high-level diagnostic reviews and localized policy recommendations.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {!report && !loading && (
              <button
                onClick={generateReport}
                className="w-full py-3.5 px-5 bg-white text-indigo-950 hover:bg-indigo-50 active:scale-[0.98] transition-all rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Generate Policy Report
              </button>
            )}

            {loading && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  <span className="text-xs font-semibold font-mono text-indigo-200">Gemini Strategist Active</span>
                </div>
                <p className="text-xs text-indigo-100/70 italic min-h-[32px] transition-all">
                  "{loadingSteps[loadingStep]}"
                </p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated AI Report Section */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-indigo-500/10 rounded-2xl shadow-xl overflow-hidden p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-indigo-50/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-gray-800">{report.title}</h3>
                <p className="text-xs text-gray-400">Policy-level diagnosis generated by VidyaSetu AI • Just now</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Directives Generated
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 font-mono">Executive Summary</h4>
            <p className="text-gray-600 leading-relaxed text-sm bg-indigo-50/30 p-4 rounded-xl border border-indigo-50">
              {report.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Early Intervention list */}
            <div className="p-5 bg-rose-50/20 border border-rose-100 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                <span>Urgent Early Intervention Alerts</span>
              </div>
              <div className="space-y-3">
                {report.atRiskStudents.map((atRisk, i) => (
                  <div key={i} className="p-3 bg-white border border-rose-50 rounded-lg shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-800">{atRisk.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-rose-100 text-rose-700">
                        {atRisk.urgency} RISK
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {atRisk.reasons.map((reason, j) => (
                        <li key={j} className="text-xs text-gray-500 flex items-start gap-1">
                          <span className="text-rose-400">•</span> {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* School Policy Decisions */}
            <div className="p-5 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                <Brain className="w-4.5 h-4.5 text-indigo-600" />
                <span>AI Strategy & Policy Directives</span>
              </div>
              <div className="space-y-4">
                {report.policyRecommendations.map((rec, i) => (
                  <div key={i} className="space-y-1">
                    <h5 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {rec.title}
                    </h5>
                    <p className="text-xs text-gray-600 pl-6">{rec.description}</p>
                    <p className="text-[11px] text-indigo-600 font-semibold pl-6 italic font-mono">
                      Expected Impact: {rec.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
