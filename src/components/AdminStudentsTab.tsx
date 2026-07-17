import React, { useState } from "react";
import { Student } from "../types";
import { 
  Search, Filter, ChevronDown, Download, Upload, Trash2, Edit3, UserPlus, 
  CheckSquare, Square, RefreshCw, Send, Sliders, X, Eye, FileText, CheckCircle2 
} from "lucide-react";

interface AdminStudentsTabProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
}

export default function AdminStudentsTab({ students, onUpdateStudents }: AdminStudentsTabProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"name" | "roll" | "attendance" | "marks">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states for creating/editing
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    rollNumber: "",
    class: "Grade 9-A",
    guardianName: "Rajesh Kumar",
    guardianPhone: "+91 98765 43210",
    status: "Active" as "Active" | "Suspended",
    photoUrl: ""
  });

  // Calculate stats for a student
  const getStudentStats = (student: Student) => {
    const presentRate = student.attendance.totalDays > 0 
      ? Math.round((student.attendance.presentDays / student.attendance.totalDays) * 100)
      : 100;
    
    const grades = student.academics.subjects.flatMap(s => s.grades);
    const avgScore = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / grades.length)
      : 80;

    return { presentRate, avgScore };
  };

  // Filter & Sort implementation
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesClass = classFilter === "ALL" || student.class === classFilter;
    
    // Simulate status check (mock metadata)
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "Active" ? student.id !== "std-03" : student.id === "std-03");

    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => {
    let valA: any = a.name;
    let valB: any = b.name;

    if (sortBy === "roll") {
      valA = a.rollNumber;
      valB = b.rollNumber;
    } else if (sortBy === "attendance") {
      valA = getStudentStats(a).presentRate;
      valB = getStudentStats(b).presentRate;
    } else if (sortBy === "marks") {
      valA = getStudentStats(a).avgScore;
      valB = getStudentStats(b).avgScore;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Bulk selectors
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Bulk actions triggers
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to remove the ${selectedIds.length} selected student profiles?`)) {
      const remaining = students.filter(s => !selectedIds.includes(s.id));
      onUpdateStudents(remaining);
      setSelectedIds([]);
      alert("Selected student profiles purged from academic registrar database.");
    }
  };

  const handleBulkPromote = () => {
    if (selectedIds.length === 0) return;
    const updated = students.map(s => {
      if (selectedIds.includes(s.id)) {
        const nextClass = s.class === "Grade 9-A" ? "Grade 10-A" : "Grade 11-A";
        return { ...s, class: nextClass };
      }
      return s;
    });
    onUpdateStudents(updated);
    alert(`Successfully promoted ${selectedIds.length} students to their consecutive academic standard class.`);
    setSelectedIds([]);
  };

  const handleBulkSendNotice = () => {
    if (selectedIds.length === 0) return;
    const msg = prompt("Enter announcement text to dispatch to these students & their guardians:");
    if (msg) {
      alert(`Priority SMS & WhatsApp notice dispatched to ${selectedIds.length} recipients via central SMS routing gateway.`);
    }
  };

  // Individual Actions
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: formData.name,
      rollNumber: formData.rollNumber || `9A-${students.length + 1}`,
      class: formData.class,
      schoolCode: students[0]?.schoolCode || "VIDYA-99",
      attendance: {
        totalDays: 45,
        presentDays: 45,
        history: [{ date: "2026-07-10", status: "Present" }]
      },
      academics: {
        subjects: [
          { name: "Mathematics", grades: [{ assessment: "Initial Test", score: 85, maxScore: 100, date: "2026-07-01" }] },
          { name: "Science", grades: [{ assessment: "Initial Test", score: 80, maxScore: 100, date: "2026-07-01" }] },
          { name: "English", grades: [{ assessment: "Initial Test", score: 90, maxScore: 100, date: "2026-07-01" }] }
        ]
      },
      wellbeing: {
        moodHistory: [{ date: "2026-07-10", rating: 4, notes: "Onboarding completed." }],
        observations: []
      },
      homework: []
    };

    onUpdateStudents([newStudent, ...students]);
    setIsAddOpen(false);
    resetForm();
    alert(`Enrollment complete: ${newStudent.name} is now registered in the school ledger.`);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          name: formData.name,
          class: formData.class,
          rollNumber: formData.rollNumber
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setIsEditOpen(false);
    setSelectedStudent(null);
    resetForm();
    alert("Student profile card synchronized with registrar databases.");
  };

  const handleDeleteOne = (id: string) => {
    if (confirm("Permanently delete student profile? This operation is audited and cannot be undone.")) {
      const remaining = students.filter(s => s.id !== id);
      onUpdateStudents(remaining);
      alert("Academic file purged.");
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      guardianName: "Rajesh Kumar",
      guardianPhone: "+91 98765 43210",
      status: student.id === "std-03" ? "Suspended" : "Active",
      photoUrl: student.photoUrl || ""
    });
    setIsEditOpen(true);
  };

  const openProfileModal = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      rollNumber: "",
      class: "Grade 9-A",
      guardianName: "Rajesh Kumar",
      guardianPhone: "+91 98765 43210",
      status: "Active",
      photoUrl: ""
    });
  };

  // Mock Export
  const triggerExport = (format: "CSV" | "PDF" | "Excel") => {
    alert(`Compiling student ledger list... ${format} downloaded successfully containing active enrollment details.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Strip */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by student name or roll..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-[11px] font-bold text-slate-600"
            >
              <option value="ALL">All Standards</option>
              <option value="Grade 9-A">Grade 9-A</option>
              <option value="Grade 9-B">Grade 9-B</option>
              <option value="Grade 10-A">Grade 10-A</option>
              <option value="Grade 10-B">Grade 10-B</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-[11px] font-bold text-slate-600"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active Enrolled</option>
              <option value="Suspended">Suspended / Risk</option>
            </select>
          </div>

          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Bulk actions and Export strip */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-indigo-900">
            {selectedIds.length} of {students.length} students selected for bulk modifications:
          </span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleBulkPromote}
              className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Bulk Promote Class
            </button>
            <button 
              onClick={handleBulkSendNotice}
              className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Bulk Notice
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge Records
            </button>
          </div>
        </div>
      )}

      {/* CSV Export & PDF Strip */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-semibold font-mono">Found {filteredStudents.length} matching students</span>
        <div className="flex gap-2">
          <button onClick={() => triggerExport("CSV")} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => triggerExport("PDF")} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> PDF Reports
          </button>
        </div>
      </div>

      {/* Professional Data Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                    {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-2">Pupil Name</th>
                <th className="py-3.5 px-2">Admission No</th>
                <th className="py-3.5 px-2">Class standard</th>
                <th className="py-3.5 px-2 text-center">Present Rate</th>
                <th className="py-3.5 px-2 text-center">Term Average</th>
                <th className="py-3.5 px-2">Primary Guardian</th>
                <th className="py-3.5 px-2 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const stats = getStudentStats(student);
                const isActive = student.id !== "std-03"; // Kabir is suspended in mock
                return (
                  <tr key={student.id} className={`hover:bg-slate-50/40 transition-colors ${isSelected ? "bg-indigo-50/20" : ""}`}>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => toggleSelectOne(student.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-[10px] text-slate-400">UID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-mono text-slate-500 font-bold">{student.rollNumber}</td>
                    <td className="py-3.5 px-2 font-semibold text-slate-600">{student.class}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${stats.presentRate < 85 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {stats.presentRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${stats.avgScore < 70 ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"}`}>
                        {stats.avgScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <p className="font-semibold text-slate-700">Rajesh Kumar</p>
                      <p className="text-[9px] text-slate-400 font-mono">+91 98765 43210</p>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                        {isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button 
                        onClick={() => openProfileModal(student)} 
                        className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded transition-colors"
                        title="View Profile dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => openEditModal(student)} 
                        className="p-1 hover:bg-amber-50 hover:text-amber-600 text-slate-400 rounded transition-colors"
                        title="Edit Student card"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOne(student.id)} 
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded transition-colors"
                        title="Purge student file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD STUDENT */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" /> New Student Enrollment
              </h4>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Full Legal Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Rahul Sen"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Admission / Roll No</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9A-05"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Standard Class</label>
                  <select 
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  >
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 9-B">Grade 9-B</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Primary Parent Name</label>
                <input 
                  type="text" 
                  value={formData.guardianName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Guardian Emergency Contact</label>
                <input 
                  type="text" 
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 transition-all shadow-md shadow-indigo-100"
              >
                Onboard Student & Authorize login credentials
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" /> Edit Student profile Card
              </h4>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="space-y-3.5 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Full Legal Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Roll / Standard UID</label>
                  <input 
                    type="text" 
                    value={formData.rollNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Class Standard</label>
                  <select 
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  >
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 9-B">Grade 9-B</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                >
                  <option value="Active">Active Enrolled</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl mt-2 transition-all shadow-md shadow-amber-100"
              >
                Synchronize and update registrar profiles
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFILE DOSSIER */}
      {isProfileOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider font-mono">Student Dossier Registry</h4>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {selectedStudent.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedStudent.class} • Roll {selectedStudent.rollNumber}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">RFID Connected</span>
              </div>
            </div>

            {/* Metrics overview */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/40">
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Present days</p>
                <p className="text-base font-bold text-slate-800">{selectedStudent.attendance.presentDays} / {selectedStudent.attendance.totalDays}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/40">
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Weekly Mood</p>
                <p className="text-base font-bold text-slate-800">
                  {selectedStudent.wellbeing.moodHistory.length > 0 
                    ? (selectedStudent.wellbeing.moodHistory.reduce((s, m) => s + m.rating, 0) / selectedStudent.wellbeing.moodHistory.length).toFixed(1)
                    : "4.0"
                  }/5.0
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/40">
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Active Homeworks</p>
                <p className="text-base font-bold text-slate-800">
                  {selectedStudent.homework.filter(h => h.status === "Pending").length} Pending
                </p>
              </div>
            </div>

            {/* Subject grades breakdown */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] font-mono">Subject Performance Registers</p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedStudent.academics.subjects.map((sub, i) => {
                  const subAvg = Math.round(sub.grades.reduce((s, g) => s + (g.score / g.maxScore * 100), 0) / (sub.grades.length || 1));
                  return (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="font-bold text-slate-700">{sub.name}</span>
                      <span className="font-mono font-bold text-indigo-600">{subAvg}% Average</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-50">
              <button 
                onClick={() => setIsProfileOpen(false)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
