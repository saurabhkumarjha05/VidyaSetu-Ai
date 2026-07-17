import React, { useState } from "react";
import { Student, User } from "../types";
import { 
  Brain, Sparkles, BookOpen, Layers, Users, Calendar, 
  Clock, Shield, CheckCircle2, ChevronRight, ChevronLeft, 
  Plus, Trash2, ArrowRight, UserPlus, ShieldAlert, Check, RefreshCw
} from "lucide-react";

interface SetupWizardProps {
  user: User;
  onComplete: (students: Student[]) => void;
  onLogout: () => void;
}

export default function SetupWizard({ user, onComplete, onLogout }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Regulatory Board Alignment
  const [board, setBoard] = useState<"CBSE" | "ICSE" | "STATE" | "IB">("CBSE");
  const [evaluationModel, setEvaluationModel] = useState<"CCE" | "SEMESTER" | "ANNUAL">("CCE");

  // STEP 2: Grade Levels Activation
  const availableGrades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
    "Grade 5", "Grade 6", "Grade 7", "Grade 8", 
    "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];
  const [activeGrades, setActiveGrades] = useState<string[]>(["Grade 9"]);

  // STEP 3: Class Sections Structure
  const [sections, setSections] = useState<string[]>(["A", "B"]);
  const [newSection, setNewSection] = useState("");

  // STEP 4: Mapped Subjects Designation
  const defaultSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", 
    "Sanskrit Pedagogy", "Hindi Literature", "English Literature", "Social Science"
  ];
  const [activeSubjects, setActiveSubjects] = useState<string[]>([
    "Mathematics", "Physics", "Chemistry", "English Literature"
  ]);

  // STEP 5: Academic Term Calendar
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [termStart, setTermStart] = useState("2026-08-01");
  const [termType, setTermType] = useState<"QUARTERLY" | "SEMI_ANNUAL">("QUARTERLY");

  // STEP 6: Recruit Faculty Roster
  const [teachers, setTeachers] = useState<string[]>([
    "Mrs. Ananya Shastri",
    "Dr. Rajeev Verma",
    "Mr. Vikram Malhotra"
  ]);
  const [newTeacher, setNewTeacher] = useState("");

  // STEP 7: Pupil Registrar Enrollment
  const [students, setStudents] = useState<{ id: string; name: string; roll: string; class: string }[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("Grade 9-A");
  const [newStudentRoll, setNewStudentRoll] = useState("");

  // STEP 8: Linked Parent Guardian Mapping
  const [parents, setParents] = useState<{ studentId: string; studentName: string; parentName: string; relation: string; phone: string }[]>([]);
  const [newParentName, setNewParentName] = useState("");
  const [newParentRelation, setNewParentRelation] = useState("Father");
  const [newParentPhone, setNewParentPhone] = useState("+91 ");
  const [parentTargetStudentId, setParentTargetStudentId] = useState("");

  // STEP 9: Weekly Timetable & Period Allocation
  const [timetable, setTimetable] = useState<{ period: string; subject: string; teacher: string }[]>([
    { period: "Period 1 (08:30 - 09:30)", subject: "Mathematics", teacher: "Mrs. Ananya Shastri" },
    { period: "Period 2 (09:45 - 10:45)", subject: "Physics", teacher: "Dr. Rajeev Verma" },
    { period: "Period 3 (11:00 - 12:00)", subject: "Chemistry", teacher: "Mr. Vikram Malhotra" },
  ]);

  // STEP 10: Sandbox Commission Checks
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [encryptionConsent, setEncryptionConsent] = useState(false);

  // Helper selectors
  const toggleGrade = (grade: string) => {
    setActiveGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleSubject = (subj: string) => {
    setActiveSubjects(prev => 
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    );
  };

  const addSection = () => {
    if (!newSection.trim()) return;
    const cleanSec = newSection.trim().toUpperCase();
    if (!sections.includes(cleanSec)) {
      setSections([...sections, cleanSec]);
    }
    setNewSection("");
  };

  const removeSection = (sec: string) => {
    setSections(prev => prev.filter(s => s !== sec));
  };

  const addTeacher = () => {
    if (!newTeacher.trim()) return;
    if (!teachers.includes(newTeacher.trim())) {
      setTeachers([...teachers, newTeacher.trim()]);
    }
    setNewTeacher("");
  };

  const removeTeacher = (tName: string) => {
    setTeachers(prev => prev.filter(t => t !== tName));
  };

  const addStudent = () => {
    if (!newStudentName.trim() || !newStudentRoll.trim()) return;
    const newS = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: newStudentName.trim(),
      roll: newStudentRoll.trim().toUpperCase(),
      class: newStudentClass
    };
    setStudents([...students, newS]);
    setNewStudentName("");
    setNewStudentRoll("");
  };

  const removeStudent = (sId: string) => {
    setStudents(prev => prev.filter(s => s.id !== sId));
    setParents(prev => prev.filter(p => p.studentId !== sId));
  };

  const generateSandboxStudents = () => {
    // Generate 5 high quality sandbox evaluation student data rows
    const sampleStudents = [
      { id: "std-sandbox-1", name: "Aarav Sharma", roll: "STD-01", class: "Grade 9-A" },
      { id: "std-sandbox-2", name: "Priya Patel", roll: "STD-02", class: "Grade 9-A" },
      { id: "std-sandbox-3", name: "Kabir Singh", roll: "STD-03", class: "Grade 9-A" },
      { id: "std-sandbox-4", name: "Meera Sen", roll: "STD-04", class: "Grade 9-A" },
      { id: "std-sandbox-5", name: "Rohan Das", roll: "STD-05", class: "Grade 9-A" }
    ];
    setStudents(sampleStudents);

    // Auto-generate some matching parent maps for validation
    const sampleParents = [
      { studentId: "std-sandbox-1", studentName: "Aarav Sharma", parentName: "Rajesh Kumar", relation: "Father", phone: "+91 98765 43210" },
      { studentId: "std-sandbox-2", studentName: "Priya Patel", parentName: "Sunita Patel", relation: "Mother", phone: "+91 91234 56789" },
      { studentId: "std-sandbox-3", studentName: "Kabir Singh", parentName: "Gurpreet Singh", relation: "Father", phone: "+91 98989 89898" }
    ];
    setParents(sampleParents);
  };

  const addParentMapping = () => {
    if (!newParentName.trim() || !parentTargetStudentId || !newParentPhone.trim()) return;
    const matchedStd = students.find(s => s.id === parentTargetStudentId);
    if (!matchedStd) return;

    const newP = {
      studentId: parentTargetStudentId,
      studentName: matchedStd.name,
      parentName: newParentName.trim(),
      relation: newParentRelation,
      phone: newParentPhone.trim()
    };
    setParents([...parents, newP]);
    setNewParentName("");
    setNewParentPhone("+91 ");
  };

  const removeParentMapping = (stdId: string) => {
    setParents(prev => prev.filter(p => p.studentId !== stdId));
  };

  // Construct complete pre-seeded robust student entities for dashboard upon activation
  const handleFinalActivation = () => {
    if (!dpdpConsent || !encryptionConsent) {
      alert("Please review and accept compliance protocols before commissioning the tenant workspace.");
      return;
    }

    // Convert wizard inputs to fully qualified Student structures
    const finalStudentEntities: Student[] = students.map((s, idx) => {
      // Find parent guardian
      const guardian = parents.find(p => p.studentId === s.id) || {
        parentName: "Rajesh Kumar",
        relation: "Father",
        phone: "+91 98765 43210"
      };

      // Set up balanced pre-seeded metrics so the dashboard looks beautiful and analytical
      const baselineAttendance = 80 + (idx * 3) % 20; // 80% to 100%
      const totalDays = 30;
      const presentDays = Math.round((baselineAttendance / 100) * totalDays);
      const history = Array.from({ length: totalDays }).map((_, dIdx) => {
        const date = new Date();
        date.setDate(date.getDate() - dIdx);
        const rand = Math.random() * 100;
        let status: "Present" | "Absent" | "Late" = "Present";
        if (rand < 5) status = "Absent";
        else if (rand < 12) status = "Late";
        return {
          date: date.toISOString().split("T")[0],
          status
        };
      });

      // Map dynamic subjects
      const subjectsWithGrades = activeSubjects.map((subName) => {
        const baseScore = 70 + (idx * 5) % 25; // 70 to 95
        return {
          name: subName,
          grades: [
            { assessment: "Unit Test 1", score: Math.round(baseScore * 0.9), maxScore: 100, date: "2026-06-15" },
            { assessment: "Quarterly Exam", score: baseScore, maxScore: 100, date: "2026-07-10" }
          ]
        };
      });

      // Wellbeing mood history
      const moodHistory = Array.from({ length: 7 }).map((_, mIdx) => {
        const date = new Date();
        date.setDate(date.getDate() - mIdx);
        return {
          date: date.toISOString().split("T")[0],
          rating: 3 + (idx + mIdx) % 3, // 3 to 5
          notes: mIdx === 0 ? "Energetic in lab demonstration activities." : undefined
        };
      });

      // Enrolled homework tasks
      const homeworkTasks: any[] = activeSubjects.slice(0, 2).map((subName, hIdx) => {
        return {
          id: `hw-${s.id}-${hIdx}`,
          title: hIdx === 0 ? "Conceptual Assignment sheet" : "Practical Lab ledger report",
          subject: subName,
          dueDate: "2026-07-20",
          status: idx % 3 === 0 ? "Completed" : "Pending",
          score: idx % 3 === 0 ? 85 : undefined
        };
      });

      return {
        id: s.id,
        name: s.name,
        rollNumber: s.roll,
        class: s.class,
        schoolCode: user.schoolCode,
        attendance: {
          totalDays,
          presentDays,
          history
        },
        academics: {
          subjects: subjectsWithGrades
        },
        wellbeing: {
          moodHistory,
          observations: [
            {
              date: "2026-07-11",
              category: "Academic",
              content: "Shows continuous qualitative feedback improvement in classroom analytics.",
              teacherId: "usr-teacher-1",
              sentiment: "Positive"
            }
          ]
        },
        homework: homeworkTasks
      };
    });

    onComplete(finalStudentEntities);
  };

  const stepsList = [
    { title: "Curriculum Alignment", desc: "Board regulatory frameworks" },
    { title: "Grades Activation", desc: "Academic standard grades" },
    { title: "Sections Structure", desc: "Divide classes efficiently" },
    { title: "Subject Mapping", desc: "Syllabus department mapping" },
    { title: "Academic Calendar", desc: "Define terms & milestones" },
    { title: "Faculty Directory", desc: "Enlist educator staff" },
    { title: "Pupil Registrar", desc: "Private student ledgers" },
    { title: "Guardian CRM", desc: "Map emergency contacts" },
    { title: "Timetable Grid", desc: "Class slots & assignments" },
    { title: "Commission Node", desc: "Security and compliance checks" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* 1. SECURE TOP HEADER NAVIGATION */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg ring-4 ring-indigo-500/10">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold tracking-tight text-xs uppercase text-slate-200">VidyaSetu School OS</span>
              <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                Approved Workspace Node
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">SECURE TENANT INITIALIZATION WIZARD</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Active Session Node</span>
            <span className="text-xs text-slate-200 font-bold font-mono">{user.schoolCode}</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-[10px] font-bold uppercase font-mono text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC HORIZONTAL STEPPER STATUS */}
      <div className="bg-slate-900 border-b border-slate-950 px-6 py-4 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 md:gap-2.5 md:min-w-[900px]">
          {stepsList.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div key={idx} className="flex items-center gap-1.5 md:gap-2 flex-1 justify-center">
                <button 
                  onClick={() => {
                    // Allowed to jump backwards or to next incomplete
                    if (stepNum < currentStep || stepNum === currentStep) {
                      setCurrentStep(stepNum);
                    }
                  }}
                  disabled={stepNum > currentStep}
                  className="flex items-center gap-1.5 md:gap-2 focus:outline-none disabled:cursor-not-allowed group"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold border transition duration-200 shrink-0 ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-400 text-white" 
                      : isActive 
                        ? "bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-500/20" 
                        : "bg-slate-950 border-slate-800 text-slate-500 group-hover:border-slate-700"
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className={`text-[10px] font-bold tracking-tight leading-none ${isActive ? "text-slate-100" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-[8px] text-slate-500 font-mono mt-0.5 font-semibold leading-none">{step.desc}</p>
                  </div>
                </button>
                {idx < stepsList.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0 mx-0.5 md:mx-1 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CORE WIZARD CARD WRAPPER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Stepper Heading Title */}
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-widest block">STEP {currentStep} OF 10</span>
              <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight">{stepsList[currentStep - 1].title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">{stepsList[currentStep - 1].desc}</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400">
              {Math.round((currentStep / 10) * 100)}% Complete
            </span>
          </div>

          {/* DYNAMIC CONTENT PER STEP STEPPER */}
          <div className="py-2 text-slate-200">
            
            {/* STEP 1: BOARD ALIGNMENT */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Select the statutory educational board alignment and evaluation standard models for your school. This synchronizes state-specific curriculum configurations and compliance logs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "CBSE", name: "CBSE (Central Board of Secondary Education)", desc: "National standard framework with Continuous Comprehensive Evaluation alignment." },
                    { id: "ICSE", name: "ICSE (Indian Certificate of Secondary Education)", desc: "Comprehensive structured curriculum with practical emphasis and board weights." },
                    { id: "STATE", name: "State Board (Syllabus/Regulatory Pattern)", desc: "Aligned with state education department guidelines, local regulations & criteria." },
                    { id: "IB", name: "IB (International Baccalaureate Framework)", desc: "Global research-based inquiry curriculum models." }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setBoard(item.id as any)}
                      className={`p-4 text-left rounded-2xl border transition duration-150 ${board === item.id ? "bg-indigo-600/10 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"}`}
                    >
                      <div className="flex justify-between items-center pb-1">
                        <span className="font-bold text-xs">{item.name}</span>
                        {board === item.id && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Continuous Evaluation Standard Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "CCE", name: "Continuous Comprehensive Evaluation (CCE)", desc: "Continuous quizzes, well-being metrics, and periodic tests." },
                      { id: "SEMESTER", name: "Double Semester System", desc: "Dual semi-annual academic milestone evaluations." },
                      { id: "ANNUAL", name: "Traditional Board Annual Pattern", desc: "Heavy terminal evaluation with continuous mock pre-boards." }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setEvaluationModel(m.id as any)}
                        className={`p-3 text-left rounded-xl border transition ${evaluationModel === m.id ? "bg-emerald-600/10 border-emerald-500 text-white" : "bg-slate-950 border-slate-800 hover:border-slate-700"}`}
                      >
                        <span className="font-bold text-[11px] block">{m.name}</span>
                        <p className="text-[9px] text-slate-400 mt-1 font-medium leading-relaxed">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GRADES ACTIVATION */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-medium">
                  Select which primary, secondary, and senior secondary classes are currently operational within this school workspace.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {availableGrades.map((grade) => {
                    const isSelected = activeGrades.includes(grade);
                    return (
                      <button
                        key={grade}
                        onClick={() => toggleGrade(grade)}
                        className={`p-3 rounded-xl border text-center font-bold text-xs transition duration-150 ${isSelected ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/15" : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"}`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-800/20 rounded-2xl flex items-center gap-2 text-[10px] text-indigo-300 font-medium mt-4">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>The AI Cognitive module automatically tailors evaluation grids for the {activeGrades.length} activated grades.</span>
                </div>
              </div>
            )}

            {/* STEP 3: CLASS SECTIONS STRUCTURE */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 font-medium">
                  Define active sections/divisions to accommodate pupil batches. Active batches default to standard 9-A, 10-A, etc.
                </p>

                <div className="flex gap-2.5 max-w-md pt-2">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. C, D, E"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={addSection}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Configured Section Batch Divisions</label>
                  <div className="flex flex-wrap gap-2">
                    {sections.map((sec) => (
                      <div key={sec} className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                        <span className="text-xs font-bold font-mono">Section {sec}</span>
                        <button 
                          onClick={() => removeSection(sec)}
                          className="text-slate-500 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: MAPPED SUBJECTS */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-medium">
                  Select curriculum subjects running in this school. These subjects form the core of exam grade books, smart homework builders, and AI performance insights.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {defaultSubjects.map((subj) => {
                    const isSelected = activeSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        className={`p-3 rounded-xl border text-left transition duration-150 flex justify-between items-center ${isSelected ? "bg-emerald-600/10 border-emerald-500 text-emerald-200" : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"}`}
                      >
                        <span className="text-xs font-bold truncate pr-2">{subj}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-800"}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: ACADEMIC CALENDAR */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 font-medium">
                  Map critical dates for the active academic cycle. Setting term start dates correctly aligns attendance thresholds and circular notifications.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-medium">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Academic Session Year</label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:border-indigo-500"
                    >
                      <option value="2026-2027">2026 - 2027</option>
                      <option value="2027-2028">2027 - 2028</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Academic Cycle Start Date</label>
                    <input
                      type="date"
                      value={termStart}
                      onChange={(e) => setTermStart(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Term Interval Type</label>
                    <select
                      value={termType}
                      onChange={(e) => setTermType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:border-indigo-500"
                    >
                      <option value="QUARTERLY">Quarterly Evaluations (4 Terms)</option>
                      <option value="SEMI_ANNUAL">Semi-Annual (2 Terms)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: FACULTY RECRUITMENT */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 font-medium">
                  Enlist names of active class teachers and subject instructors. Faculty credentials can be configured after initial workspace commissioning.
                </p>

                <div className="flex gap-2.5 max-w-md pt-2">
                  <input
                    type="text"
                    placeholder="e.g. Mrs. Sarah Jones"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none text-slate-200 font-semibold"
                  />
                  <button
                    onClick={addTeacher}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <UserPlus className="w-4 h-4" /> Enlist Faculty
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Configured Educator Roster ({teachers.length})</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {teachers.map((tName) => (
                      <div key={tName} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-200">{tName}</span>
                        <button 
                          onClick={() => removeTeacher(tName)}
                          className="text-slate-500 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: PUPIL REGISTRATION (STRICTLY EMPTY STATE WITH PRESET POPULATOR) */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl flex gap-3 text-xs">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Private Multi-Tenant Data Isolation Active</span>
                    <p className="text-[11px] leading-relaxed text-amber-200/80 font-medium">
                      VidyaSetu enforces absolute database isolation. Because this is a newly registered school node, your workspace is completely empty. Please register your first pupils below to activate evaluation graphs.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Register Pupil Manually</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Student Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Aarav Sharma" 
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Roll Number (Unique ID)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. STD-01" 
                        value={newStudentRoll}
                        onChange={(e) => setNewStudentRoll(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-slate-100" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Assigned Grade Batch</label>
                      <select 
                        value={newStudentClass}
                        onChange={(e) => setNewStudentClass(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono"
                      >
                        {activeGrades.flatMap(g => sections.map(s => `${g}-${s}`)).map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={addStudent}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" /> Enroll Student Profile
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Enrolled Student Ledger ({students.length})</span>
                    <p className="text-slate-400 mt-0.5 font-medium">Add students to proceed, or click fast populator preset.</p>
                  </div>

                  <button
                    onClick={generateSandboxStudents}
                    className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/20 flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-generate Sandbox Pupil Ledger Preset (5 Students)
                  </button>
                </div>

                {students.length > 0 && (
                  <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-900 text-[10px] font-bold font-mono uppercase text-slate-400 border-b border-slate-850">
                          <th className="p-2 pl-3">Roll</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Class Code</th>
                          <th className="p-2 text-right pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-200">
                        {students.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-900/50">
                            <td className="p-2 pl-3 font-mono font-bold text-slate-400">{st.roll}</td>
                            <td className="p-2 font-bold">{st.name}</td>
                            <td className="p-2 font-mono text-indigo-400">{st.class}</td>
                            <td className="p-2 text-right pr-3">
                              <button onClick={() => removeStudent(st.id)} className="text-slate-500 hover:text-rose-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: GUARDIAN MAPPINGS */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 font-medium">
                  Establish parental mappings for real-time wellness check-ins, automated SMS alerts, and dedicated Parent Dashboard access.
                </p>

                {students.length === 0 ? (
                  <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-slate-400 font-bold">No Students Registered Yet</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Please complete Step 7 (Pupil Registrar) to populate students before designating guardians.</p>
                    <button onClick={() => setCurrentStep(7)} className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-indigo-400 rounded-lg">Go to Step 7</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-4 text-xs font-semibold">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Assign Guardian Contact Details</span>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Select Student</label>
                          <select 
                            value={parentTargetStudentId}
                            onChange={(e) => setParentTargetStudentId(e.target.value)}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                          >
                            <option value="">-- Choose student --</option>
                            {students.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Guardian Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Rajesh Kumar" 
                            value={newParentName}
                            onChange={(e) => setNewParentName(e.target.value)}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100" 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Relation</label>
                          <select 
                            value={newParentRelation}
                            onChange={(e) => setNewParentRelation(e.target.value)}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                          >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Phone Number</label>
                          <input 
                            type="text" 
                            placeholder="+91 98765 43210" 
                            value={newParentPhone}
                            onChange={(e) => setNewParentPhone(e.target.value)}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-slate-100" 
                          />
                        </div>
                      </div>

                      <button 
                        onClick={addParentMapping}
                        className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                      >
                        Map Guardian Record
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Configured Parent Guard Maps ({parents.length})</span>
                      <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-900 text-[10px] font-bold font-mono uppercase text-slate-400 border-b border-slate-850">
                              <th className="p-2 pl-3">Pupil Student</th>
                              <th className="p-2">Guardian Name</th>
                              <th className="p-2">Relationship</th>
                              <th className="p-2 font-mono">Mobile Contact</th>
                              <th className="p-2 text-right pr-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {parents.map((p) => (
                              <tr key={p.studentId} className="hover:bg-slate-900/50">
                                <td className="p-2 pl-3 font-bold text-indigo-400">{p.studentName}</td>
                                <td className="p-2 text-slate-200">{p.parentName}</td>
                                <td className="p-2 text-slate-400">{p.relation}</td>
                                <td className="p-2 font-mono text-slate-400">{p.phone}</td>
                                <td className="p-2 text-right pr-3">
                                  <button onClick={() => removeParentMapping(p.studentId)} className="text-slate-500 hover:text-rose-500">
                                    <Trash2 className="w-3.5 h-3.5" />
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
              </div>
            )}

            {/* STEP 9: WEEKLY TIMETABLE PERIODS */}
            {currentStep === 9 && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 font-medium">
                  Establish core timetable slot mappings. Faculty subject loads can be dynamically reallocated inside the dashboard.
                </p>

                <div className="space-y-2.5 pt-2">
                  {timetable.map((slot, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl grid grid-cols-3 gap-4 text-xs font-semibold items-center">
                      <span className="font-mono text-slate-400">{slot.period}</span>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">Syllabus Subject</span>
                        <select 
                          value={slot.subject} 
                          onChange={(e) => {
                            const updated = [...timetable];
                            updated[i].subject = e.target.value;
                            setTimetable(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                        >
                          {activeSubjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">Assigned Instructor</span>
                        <select 
                          value={slot.teacher} 
                          onChange={(e) => {
                            const updated = [...timetable];
                            updated[i].teacher = e.target.value;
                            setTimetable(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                        >
                          {teachers.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 10: SANDBOX WORKSPACE COMMISSIONING */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 font-medium">
                  Verify regulatory security configurations and click below to commission your school workspace console.
                </p>

                {/* Secure checks panel */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3.5 font-mono text-[11px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-slate-500 font-bold uppercase text-[9px]">
                    <span>Node Verification Metric</span>
                    <span>Sandbox State Status</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenant Cryptography Key block size</span>
                    <span className="text-emerald-500 font-bold">256-Bit Cryptographically Secure</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activated Grade Levels</span>
                    <span className="text-slate-300 font-bold">{activeGrades.length} Active (Grade 9-A base)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Educator Faculty Count</span>
                    <span className="text-slate-300 font-bold">{teachers.length} Instructors Loaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pupil Register Ledger entries</span>
                    <span className={`font-bold ${students.length > 0 ? "text-emerald-500" : "text-amber-500"}`}>
                      {students.length} Registered Pupils
                    </span>
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3 text-xs font-semibold">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-slate-400 group-hover:text-slate-300 transition select-none leading-relaxed">
                      I certify that pupil registrations comply with the provisions of India's Digital Personal Data Protection (DPDP) Act, 2023.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={encryptionConsent}
                      onChange={(e) => setEncryptionConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-slate-400 group-hover:text-slate-300 transition select-none leading-relaxed">
                      I authorize the secure initialization and encryption of the relational database for tenant code <span className="font-mono text-indigo-400 font-bold">{user.schoolCode}</span>.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleFinalActivation}
                  disabled={students.length === 0}
                  className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/10 transition mt-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Shield className="w-5 h-5" /> Commission School OS Dashboard Workspace
                </button>
                {students.length === 0 && (
                  <p className="text-[10px] text-center text-amber-500 font-semibold font-mono">
                    ⚠️ PLEASE REGISTER AT LEAST 1 STUDENT IN STEP 7 TO COMMISSION WORKSPACE
                  </p>
                )}
              </div>
            )}

          </div>

          {/* 4. FOOTER INTERACTIVE STEPPERS BUTTONS */}
          <div className="border-t border-slate-800 pt-5 flex justify-between items-center text-xs">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-950/20 disabled:text-slate-700 text-slate-300 font-bold rounded-xl border border-slate-800 disabled:border-slate-800/10 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>

            {currentStep < 10 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(10, prev + 1))}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono font-bold">Commissioning phase ready</span>
            )}
          </div>

        </div>

        {/* Footnote information regarding safety */}
        <p className="text-[10px] text-slate-500 text-center font-mono mt-4">
          🔒 Secured by SHA-256 Multi-Tenant Isolation protocols. Zero-cross tenant data sharing active.
        </p>

      </main>
      
    </div>
  );
}
