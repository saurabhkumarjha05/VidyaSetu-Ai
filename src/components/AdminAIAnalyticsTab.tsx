import React, { useState } from "react";
import { 
  Sparkles, TrendingUp, AlertTriangle, CheckCircle, Brain, 
  ArrowRight, Users, MessageSquare, ClipboardList, HelpCircle 
} from "lucide-react";

interface AIIntervention {
  id: string;
  studentName: string;
  class: string;
  riskLevel: "High" | "Medium" | "Low";
  category: "Attendance Risk" | "Academic Falloff" | "Wellbeing Alert" | "Workload Stress";
  dataAnalyzed: string;
  whyExists: string;
  suggestedAction: string;
  status: "Pending Action" | "Addressed" | "Monitoring";
}

export default function AdminAIAnalyticsTab() {
  const [interventions, setInterventions] = useState<AIIntervention[]>([
    {
      id: "ai-int-01",
      studentName: "Kabir Singh",
      class: "Grade 9-A",
      riskLevel: "High",
      category: "Attendance Risk",
      dataAnalyzed: "Attendance historical registry for the past 14 consecutive school days. Cross-referenced with late entries logs.",
      whyExists: "Kabir missed 4 school days this fortnight with no prior excuse logs or parent sick leave authorizations.",
      suggestedAction: "Trigger automated PTM conference. Dispatch educational therapist guidance counselor to the residence.",
      status: "Pending Action"
    },
    {
      id: "ai-int-02",
      studentName: "Priya Patel",
      class: "Grade 9-A",
      riskLevel: "Medium",
      category: "Academic Falloff",
      dataAnalyzed: "Calculus quarterly examination scoring (62/100) compared to continuous assessment algebra worksheets.",
      whyExists: "Priya holds a strong verbal participation index but is struggling with foundational calculus theorems. Homework submissions are late.",
      suggestedAction: "Assign 3 weekly remedial math slots with Mr. Ananya Shastri. Provide custom interactive homework modules on algebra foundations.",
      status: "Monitoring"
    },
    {
      id: "ai-int-03",
      studentName: "Aarav Sharma",
      class: "Grade 9-A",
      riskLevel: "High",
      category: "Wellbeing Alert",
      dataAnalyzed: "Self-logged daily mood index (dropped from 4.0 to 2.0) and negative descriptive sentiments in Science lab notes.",
      whyExists: "Aarav expresses severe sleep deprivation (averaging 4 hours) due to overwhelming home academic expectations.",
      suggestedAction: "Conduct confidential counseling chat. Suggest a structured workload reduction program to Aarav's parents.",
      status: "Pending Action"
    }
  ]);

  const [filter, setFilter] = useState<"ALL" | "High" | "Medium" | "Low">("ALL");

  const filtered = interventions.filter(item => filter === "ALL" || item.riskLevel === filter);

  const handleTriggerAction = (id: string) => {
    setInterventions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: "Addressed" as const };
      }
      return item;
    }));
    alert("Administrative intervention workflow triggered. Notifications dispatched to counselors and primary parent profiles.");
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Badge */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Background abstract decoration */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-700 rounded-full blur-2xl opacity-40 pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 font-mono">Cognitive Analytics Engine</span>
          </div>
          <h3 className="font-display font-bold text-lg md:text-xl leading-tight">VidyaSetu School OS Intelligent Core</h3>
          <p className="text-xs text-indigo-100 max-w-xl font-medium leading-relaxed">
            Parsing student records, daily mood trackers, RFID attendance scans, and continuous class grades to isolate risk vectors before they manifest in standard reports.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 text-center shrink-0 min-w-[140px]">
          <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-mono font-bold">Predictive Risk Level</p>
          <p className="text-2xl font-bold text-white mt-1">94.2%</p>
          <span className="inline-block mt-1 text-[9px] font-bold text-emerald-300 font-mono bg-emerald-500/20 px-2 py-0.5 rounded-full">Optimal Standard</span>
        </div>
      </div>

      {/* Analytics widgets and chart simulation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Visual Metric Card 1 */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-rose-50 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </span>
            <span className="text-rose-500 text-xs font-bold font-mono">-1.2% this week</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Attendance Deficit Vector</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1 font-mono">3 Enrolled</h4>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">Active chronic absence alerts (Attendance &lt; 85%)</p>
          </div>
        </div>

        {/* Visual Metric Card 2 */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-indigo-50 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </span>
            <span className="text-emerald-500 text-xs font-bold font-mono">+4.6% term over term</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Curriculum Velocity Index</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1 font-mono">82.1%</h4>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">Syllabus progression mapping matching milestone targets</p>
          </div>
        </div>

        {/* Visual Metric Card 3 */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-emerald-50 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </span>
            <span className="text-emerald-500 text-xs font-bold font-mono">98.2% healthy</span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">System-wide Wellbeing Index</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1 font-mono">4.2 / 5.0</h4>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">Consolidated mood rating extracted from peer observations</p>
          </div>
        </div>

      </div>

      {/* AI PRIORITY INTERVENTIONS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-widest font-mono text-[10px]">
            <Brain className="w-4 h-4 text-indigo-600" /> Early Intervention Priority Queue
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600">
            <button onClick={() => setFilter("ALL")} className={`px-2.5 py-1 rounded-lg ${filter === "ALL" ? "bg-white text-slate-800 shadow-sm" : ""}`}>All Alerts</button>
            <button onClick={() => setFilter("High")} className={`px-2.5 py-1 rounded-lg ${filter === "High" ? "bg-white text-rose-600 shadow-sm" : ""}`}>High Risk</button>
            <button onClick={() => setFilter("Medium")} className={`px-2.5 py-1 rounded-lg ${filter === "Medium" ? "bg-white text-amber-700 shadow-sm" : ""}`}>Medium</button>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white border p-5 rounded-3xl shadow-sm transition-all relative overflow-hidden ${
                item.riskLevel === "High" ? "border-rose-100" : "border-amber-100"
              }`}
            >
              
              {/* Corner priority ribbon */}
              <div className={`absolute right-4 top-4 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                item.riskLevel === "High" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"
              }`}>
                {item.riskLevel} Priority
              </div>

              <div className="space-y-3 max-w-4xl text-xs">
                
                {/* Header detail */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                    {item.studentName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{item.studentName}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.class} • {item.category}</p>
                  </div>
                </div>

                {/* Cognitive three-fold logic details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2.5 text-xs text-slate-600 font-medium">
                  
                  {/* Step 1: Data Analyzed */}
                  <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/40 space-y-1.5">
                    <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">1. Data Analyzed</p>
                    <p className="text-slate-600 leading-relaxed text-[11px] font-semibold">{item.dataAnalyzed}</p>
                  </div>

                  {/* Step 2: Why exists */}
                  <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/40 space-y-1.5">
                    <p className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">2. Why Recommendation Exists</p>
                    <p className="text-slate-600 leading-relaxed text-[11px] font-semibold">{item.whyExists}</p>
                  </div>

                  {/* Step 3: Action */}
                  <div className="bg-indigo-50/20 p-3.5 rounded-2xl border border-indigo-100/40 space-y-1.5">
                    <p className="text-[9px] uppercase font-bold text-indigo-700 font-mono tracking-wider">3. Suggested Action</p>
                    <p className="text-slate-700 leading-relaxed text-[11px] font-bold">{item.suggestedAction}</p>
                  </div>

                </div>

                {/* Footer Action Strip */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">ID ref: {item.id}</span>
                  <div className="flex gap-2.5">
                    {item.status === "Addressed" ? (
                      <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-sm border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Action dispatched
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleTriggerAction(item.id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-sm transition-all hover:translate-x-0.5"
                      >
                        Execute Action <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
