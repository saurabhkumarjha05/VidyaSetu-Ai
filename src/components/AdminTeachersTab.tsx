import React, { useState } from "react";
import { 
  Users, Search, Filter, Plus, Trash2, Edit3, Sliders, CheckSquare, 
  Square, Shield, BookOpen, Clock, X, BarChart3, CheckCircle2 
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  department: string;
  assignedSubjects: string[];
  assignedClasses: string[];
  qualification: string;
  experience: string;
  attendance: string; // e.g. "98%"
  performance: "Excellent" | "Satisfactory" | "Needs Review";
  status: "Active" | "On Leave" | "Suspended";
  email: string;
}

export default function AdminTeachersTab() {
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: "t-01",
      name: "Mr. Ananya Shastri",
      department: "Mathematics & Pedagogy",
      assignedSubjects: ["Calculus", "Trigonometry", "Algebra"],
      assignedClasses: ["Grade 9-A", "Grade 10-A"],
      qualification: "Ph.D. in Applied Mathematics",
      experience: "12 Years",
      attendance: "99%",
      performance: "Excellent",
      status: "Active",
      email: "a.shastri@vidyasetu.edu"
    },
    {
      id: "t-02",
      name: "Dr. Rajeev Verma",
      department: "Science & Kinematics",
      assignedSubjects: ["Physics", "Mechanics", "Chemistry"],
      assignedClasses: ["Grade 9-A", "Grade 9-B"],
      qualification: "M.Sc., Ph.D. in Quantum Chemistry",
      experience: "8 Years",
      attendance: "95%",
      performance: "Excellent",
      status: "Active",
      email: "r.verma@vidyasetu.edu"
    },
    {
      id: "t-03",
      name: "Mrs. Sarah Jones",
      department: "Humanities & Linguistics",
      assignedSubjects: ["English Lit", "Creative Writing"],
      assignedClasses: ["Grade 9-A", "Grade 10-B"],
      qualification: "M.A. in English Literature",
      experience: "14 Years",
      attendance: "96%",
      performance: "Satisfactory",
      status: "Active",
      email: "s.jones@vidyasetu.edu"
    },
    {
      id: "t-04",
      name: "Mr. Vikram Malhotra",
      department: "Computer Sciences",
      assignedSubjects: ["Python Basics", "Web Dev"],
      assignedClasses: ["Grade 11-A", "Grade 12-A"],
      qualification: "B.Tech, M.Tech in CS",
      experience: "5 Years",
      attendance: "88%",
      performance: "Needs Review",
      status: "On Leave",
      email: "v.malhotra@vidyasetu.edu"
    }
  ]);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    department: "Mathematics & Pedagogy",
    assignedSubjects: "",
    assignedClasses: "Grade 9-A",
    qualification: "",
    experience: "",
    status: "Active" as "Active" | "On Leave" | "Suspended",
    email: ""
  });

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "ALL" || t.department === deptFilter;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleBulkDelete = () => {
    if (confirm(`Remove selected ${selectedIds.length} faculty members from central registrar databases?`)) {
      setTeachers(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
      alert("Faculty lists compiled. Selected accounts deactivated.");
    }
  };

  const handleBulkAssign = () => {
    const sub = prompt("Enter additional Subject name to bulk assign to selected teachers:");
    if (sub) {
      setTeachers(prev => prev.map(t => {
        if (selectedIds.includes(t.id) && !t.assignedSubjects.includes(sub)) {
          return { ...t, assignedSubjects: [...t.assignedSubjects, sub] };
        }
        return t;
      }));
      setSelectedIds([]);
      alert(`Bulk assigned "${sub}" to chosen educators.`);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: Teacher = {
      id: `t-${Date.now()}`,
      name: formData.name,
      department: formData.department,
      assignedSubjects: formData.assignedSubjects.split(",").map(s => s.trim()).filter(Boolean),
      assignedClasses: [formData.assignedClasses],
      qualification: formData.qualification || "B.Ed, Graduate",
      experience: formData.experience || "3 Years",
      attendance: "100%",
      performance: "Satisfactory",
      status: formData.status,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@vidyasetu.edu`
    };

    setTeachers([newT, ...teachers]);
    setIsAddOpen(false);
    resetForm();
    alert(`Educator profile created: ${newT.name} joined the central faculty.`);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    setTeachers(prev => prev.map(t => {
      if (t.id === selectedTeacher.id) {
        return {
          ...t,
          name: formData.name,
          department: formData.department,
          assignedSubjects: formData.assignedSubjects.split(",").map(s => s.trim()).filter(Boolean),
          status: formData.status,
          email: formData.email
        };
      }
      return t;
    }));

    setIsEditOpen(false);
    setSelectedTeacher(null);
    resetForm();
    alert("Faculty dossier successfully synchronized.");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      department: "Mathematics & Pedagogy",
      assignedSubjects: "",
      assignedClasses: "Grade 9-A",
      qualification: "",
      experience: "",
      status: "Active",
      email: ""
    });
  };

  const openEdit = (t: Teacher) => {
    setSelectedTeacher(t);
    setFormData({
      name: t.name,
      department: t.department,
      assignedSubjects: t.assignedSubjects.join(", "),
      assignedClasses: t.assignedClasses[0] || "Grade 9-A",
      qualification: t.qualification,
      experience: t.experience,
      status: t.status,
      email: t.email
    });
    setIsEditOpen(true);
  };

  const deleteOne = (id: string) => {
    if (confirm("Deactivate this teacher's login credentials and class mappings?")) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      alert("Faculty record archived.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeachers.map(t => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search filters bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search educator or official email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-[11px] font-bold text-slate-600"
            >
              <option value="ALL">All Departments</option>
              <option value="Mathematics & Pedagogy">Mathematics</option>
              <option value="Science & Kinematics">Science</option>
              <option value="Humanities & Linguistics">Linguistics</option>
              <option value="Computer Sciences">Computer Science</option>
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
              <option value="Active">Active Duty</option>
              <option value="On Leave">Sabbatical / Leave</option>
            </select>
          </div>

          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Appoint Faculty
          </button>
        </div>
      </div>

      {/* Bulk actions strip */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-indigo-900">
            {selectedIds.length} teachers selected for bulk modifications:
          </span>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkAssign}
              className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Bulk Assign Subjects
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 rounded-xl text-[11px] font-bold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Suspension / Leave Block
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                    {selectedIds.length === filteredTeachers.length && filteredTeachers.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-2">Educator Name</th>
                <th className="py-3.5 px-2">Department Division</th>
                <th className="py-3.5 px-2">Assigned Classes</th>
                <th className="py-3.5 px-2">Key Mapped Subjects</th>
                <th className="py-3.5 px-2">Qualification credentials</th>
                <th className="py-3.5 px-2 text-center">Attendance</th>
                <th className="py-3.5 px-2 text-center">Performance Rating</th>
                <th className="py-3.5 px-2 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <tr key={t.id} className={`hover:bg-slate-50/40 transition-colors ${isSelected ? "bg-indigo-50/20" : ""}`}>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => toggleSelectOne(t.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-2">
                      <div>
                        <p className="font-bold text-slate-800">{t.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{t.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-slate-600">{t.department}</td>
                    <td className="py-3.5 px-2">
                      <div className="flex flex-wrap gap-1">
                        {t.assignedClasses.map((cl, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded font-bold">{cl}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex flex-wrap gap-1">
                        {t.assignedSubjects.map((sub, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">{sub}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-500 font-medium">{t.qualification} • {t.experience}</td>
                    <td className="py-3.5 px-2 text-center font-bold font-mono text-emerald-600">{t.attendance}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.performance === "Excellent" ? "bg-emerald-50 text-emerald-700" :
                        t.performance === "Satisfactory" ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-600"
                      }`}>
                        {t.performance}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                        t.status === "On Leave" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button 
                        onClick={() => openEdit(t)}
                        className="p-1 hover:bg-amber-50 hover:text-amber-600 text-slate-400 rounded transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteOne(t.id)}
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded transition-colors"
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

      {/* MODAL: APPOINT FACULTY */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Appoint Faculty Member
              </h4>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Full Legal Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Mrs. Meenakshi Das"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Department Division</label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                >
                  <option value="Mathematics & Pedagogy">Mathematics & Pedagogy</option>
                  <option value="Science & Kinematics">Science & Kinematics</option>
                  <option value="Humanities & Linguistics">Humanities & Linguistics</option>
                  <option value="Computer Sciences">Computer Sciences</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Mapped Subjects (Comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Physics, Astrodynamics"
                  value={formData.assignedSubjects}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedSubjects: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Qualification Credentials</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ph.D. Physics"
                    value={formData.qualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Experience Years</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5 Years"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 transition-all shadow-md"
              >
                Onboard Faculty member & Create ERP login credentials
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FACULTY */}
      {isEditOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" /> Edit Faculty Member Card
              </h4>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-3.5 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Educator Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Department Division</label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                >
                  <option value="Mathematics & Pedagogy">Mathematics & Pedagogy</option>
                  <option value="Science & Kinematics">Science & Kinematics</option>
                  <option value="Humanities & Linguistics">Humanities & Linguistics</option>
                  <option value="Computer Sciences">Computer Sciences</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Mapped Subjects (Comma separated)</label>
                <input 
                  type="text" 
                  required
                  value={formData.assignedSubjects}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedSubjects: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-semibold"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Official Email ID</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl mt-2 transition-all shadow-md"
              >
                Synchronize credentials & roster changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
