export enum Role {
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  schoolCode: string;
  associatedStudentId?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  schoolCode: string;
  photoUrl?: string;
  attendance: {
    totalDays: number;
    presentDays: number;
    history: { date: string; status: "Present" | "Absent" | "Late" }[];
  };
  academics: {
    subjects: {
      name: string;
      grades: { assessment: string; score: number; maxScore: number; date: string }[];
    }[];
  };
  wellbeing: {
    moodHistory: { date: string; rating: number; notes?: string }[]; // 1 to 5
    observations: { date: string; category: string; content: string; teacherId: string; sentiment: "Positive" | "Neutral" | "Negative" }[];
  };
  homework: {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: "Completed" | "Pending" | "Late";
    score?: number;
  }[];
}

export interface ClassMetrics {
  className: string;
  averageAttendance: number;
  averageGrade: number;
  wellbeingIndex: number; // 1 to 5
  activeInterventions: number;
}

export interface AIInsight {
  studentId?: string;
  className?: string;
  category: "Academic" | "Wellbeing" | "Attendance" | "Behavior" | "General";
  riskLevel: "Low" | "Medium" | "High";
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  recommendedHomework: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
}
