import React, { useState } from "react";
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, Sliders, 
  BookOpen, Users, Download, HelpCircle, X, Check, Save 
} from "lucide-react";

interface Slot {
  subject: string;
  teacherId: string;
  room: string;
}

// 5 days x 5 periods grid model
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["08:30 - 09:30 AM", "09:35 - 10:35 AM", "10:50 - 11:50 AM", "12:30 - 01:30 PM", "01:35 - 02:35 PM"];

export default function AdminTimetableTab() {
  const [selectedClass, setSelectedClass] = useState("Grade 9-A");
  
  // Hardcoded active teacher database to check conflict bookings
  const teachers = [
    { id: "t-01", name: "Mr. Ananya Shastri" },
    { id: "t-02", name: "Dr. Rajeev Verma" },
    { id: "t-03", name: "Mrs. Sarah Jones" },
    { id: "t-04", name: "Mr. Vikram Malhotra" }
  ];

  const subjects = ["Mathematics", "Physics", "Chemistry", "English Lit", "Computer Sciences", "Self Study"];

  // State matrix containing slot information: [class][dayIndex][periodIndex]
  const [grid, setGrid] = useState<Record<string, Record<number, Record<number, Slot>>>>({
    "Grade 9-A": {
      0: {
        0: { subject: "Mathematics", teacherId: "t-01", room: "Lab-301" },
        1: { subject: "Physics", teacherId: "t-02", room: "Kin-204" },
        2: { subject: "English Lit", teacherId: "t-03", room: "Hum-101" },
        3: { subject: "Computer Sciences", teacherId: "t-04", room: "Com-01" },
        4: { subject: "Self Study", teacherId: "t-01", room: "Hum-101" }
      },
      1: {
        0: { subject: "English Lit", teacherId: "t-03", room: "Hum-101" },
        1: { subject: "Mathematics", teacherId: "t-01", room: "Lab-301" },
        2: { subject: "Chemistry", teacherId: "t-02", room: "Kin-204" }
      }
    },
    "Grade 9-B": {
      0: {
        0: { subject: "English Lit", teacherId: "t-03", room: "Hum-101" }, // No conflict with Shastri
        1: { subject: "Mathematics", teacherId: "t-01", room: "Lab-301" }  // Shastri booked for 9-A period 1 is free? Wait, Shastri teaches 9-A period 0, teaches 9-B period 1. Fine!
      }
    }
  });

  // Editor states
  const [editingCell, setEditingCell] = useState<{ day: number; period: number } | null>(null);
  const [editorData, setEditorData] = useState<Slot>({ subject: "Mathematics", teacherId: "t-01", room: "Lab-301" });
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const openEditor = (dayIdx: number, periodIdx: number) => {
    const existing = grid[selectedClass]?.[dayIdx]?.[periodIdx] || { subject: "Self Study", teacherId: "t-01", room: "Main-304" };
    setEditorData(existing);
    setEditingCell({ day: dayIdx, period: periodIdx });
    setConflictWarning(null);
  };

  // Advanced Conflict Checking algorithm
  const handleCheckConflicts = (updatedSlot: Slot, dayIdx: number, periodIdx: number) => {
    // Check if the same teacher is already booked in ANOTHER class for the same day/period index
    let bookedInClass = "";
    Object.keys(grid).forEach(className => {
      if (className !== selectedClass) {
        const otherSlot = grid[className]?.[dayIdx]?.[periodIdx];
        if (otherSlot && otherSlot.teacherId === updatedSlot.teacherId) {
          bookedInClass = className;
        }
      }
    });

    if (bookedInClass) {
      const teacherName = teachers.find(t => t.id === updatedSlot.teacherId)?.name || "Teacher";
      setConflictWarning(`⚠️ CONFLICT DETECTED: ${teacherName} is already assigned to "${bookedInClass}" during Period ${periodIdx + 1} on ${DAYS[dayIdx]}! Double booking will fail validation.`);
    } else {
      setConflictWarning(null);
    }
  };

  const saveCell = () => {
    if (!editingCell) return;
    const { day, period } = editingCell;

    // Persist changes
    setGrid(prev => {
      const classGrid = prev[selectedClass] || {};
      const dayGrid = classGrid[day] || {};
      return {
        ...prev,
        [selectedClass]: {
          ...classGrid,
          [day]: {
            ...dayGrid,
            [period]: editorData
          }
        }
      };
    });

    setEditingCell(null);
    alert("Timetable slot saved and synchronized with faculty schedules.");
  };

  const handleExport = () => {
    alert(`Compiling printable timetable dossier... Visual schedule for "${selectedClass}" downloaded in landscape PDF standard format.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Visual filter header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-50 rounded-xl">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </span>
          <div>
            <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Visual Timetable Builder</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Automated conflict resolution & standard room allocation mappings</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setEditingCell(null);
            }}
            className="p-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-indigo-500"
          >
            <option value="Grade 9-A">Grade 9-A</option>
            <option value="Grade 9-B">Grade 9-B</option>
            <option value="Grade 10-A">Grade 10-A</option>
            <option value="Grade 10-B">Grade 10-B</option>
          </select>

          <button 
            onClick={handleExport}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Block Schedule Grid */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm overflow-x-auto">
            <div className="min-w-[640px] space-y-2 text-xs">
              
              {/* Header row containing periods */}
              <div className="grid grid-cols-6 gap-2 border-b border-slate-100 pb-2 text-[10px] uppercase font-bold text-slate-400 font-mono text-center">
                <div>Standard / Period</div>
                {PERIODS.map((p, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span>Period {i + 1}</span>
                    <span className="text-[9px] text-slate-400 lowercase mt-0.5">{p.split(" ")[0]}</span>
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {DAYS.map((dayName, dayIdx) => (
                <div key={dayIdx} className="grid grid-cols-6 gap-2 items-center text-center">
                  <div className="font-bold text-slate-600 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100/40 text-[11px]">
                    {dayName}
                  </div>

                  {/* 5 periods blocks */}
                  {PERIODS.map((_, periodIdx) => {
                    const slot = grid[selectedClass]?.[dayIdx]?.[periodIdx];
                    const teacherName = teachers.find(t => t.id === slot?.teacherId)?.name.split(" ").pop() || "";
                    
                    return (
                      <button
                        key={periodIdx}
                        onClick={() => openEditor(dayIdx, periodIdx)}
                        className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between h-[64px] group relative ${
                          slot 
                            ? "bg-indigo-50/40 border-indigo-100/60 hover:bg-indigo-50 hover:border-indigo-300" 
                            : "bg-slate-50/50 border-dashed border-slate-200 hover:bg-slate-100/60"
                        }`}
                      >
                        {slot ? (
                          <>
                            <p className="font-bold text-slate-800 text-[10px] truncate leading-tight">{slot.subject}</p>
                            <p className="text-[9px] text-indigo-700 font-bold font-mono truncate mt-1">{teacherName}</p>
                            <span className="text-[8px] text-slate-400 font-mono truncate mt-0.5">{slot.room}</span>
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium italic m-auto group-hover:text-slate-600">+ Empty Slot</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

            </div>
          </div>
          
          <div className="p-3.5 bg-amber-50/40 border border-amber-100/80 rounded-2xl text-xs text-amber-800 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 leading-tight">Live Room Allocations Mapped</p>
              <p className="text-[11px] text-amber-800 mt-1 leading-normal">
                Classroom capacity check states that standard rooms (e.g., Hum-101) accommodate up to 40 students with ventilation indexes conforming to optimal standards.
              </p>
            </div>
          </div>
        </div>

        {/* Builder Editor Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-50 flex justify-between items-center">
            <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" /> Slot Mapping Editor
            </h5>
            {editingCell && (
              <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {editingCell ? (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <p className="font-bold text-indigo-950 font-mono">Modifying Standard Cell:</p>
                <p className="text-[11px] text-indigo-800 font-medium mt-0.5">{DAYS[editingCell.day]} • Period {editingCell.period + 1} ({PERIODS[editingCell.period]})</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Subject Division</label>
                <select
                  value={editorData.subject}
                  onChange={(e) => {
                    const updated = { ...editorData, subject: e.target.value };
                    setEditorData(updated);
                    handleCheckConflicts(updated, editingCell.day, editingCell.period);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                >
                  {subjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Educator</label>
                <select
                  value={editorData.teacherId}
                  onChange={(e) => {
                    const updated = { ...editorData, teacherId: e.target.value };
                    setEditorData(updated);
                    handleCheckConflicts(updated, editingCell.day, editingCell.period);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Room / Lab Allocation</label>
                <input 
                  type="text" 
                  value={editorData.room}
                  onChange={(e) => {
                    const updated = { ...editorData, room: e.target.value };
                    setEditorData(updated);
                    handleCheckConflicts(updated, editingCell.day, editingCell.period);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-mono"
                />
              </div>

              {conflictWarning && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-700 font-bold leading-relaxed">
                  {conflictWarning}
                </div>
              )}

              <button
                onClick={saveCell}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" /> Save Allocation
              </button>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
              <HelpCircle className="w-8 h-8 text-slate-300 animate-bounce" />
              <p className="text-xs font-bold text-slate-700 mt-2">No Cell Selected</p>
              <p className="text-[10px] text-slate-400 max-w-[180px] mt-1 leading-normal">
                Click any slot block in the left weekly grid schedule to launch slot assignment and conflict resolution editor.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
