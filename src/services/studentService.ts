import { apiFetch } from "./apiClient";
import { Student } from "../types";

export const studentService = {
  async getStudents(): Promise<Student[]> {
    const data = await apiFetch<{ success: boolean; students: Student[] }>("/api/data");
    if (data.success) {
      return data.students;
    }
    throw new Error("Failed to load students");
  },

  async addStudentLog(
    studentId: string,
    logType: "academics" | "attendance" | "mood" | "homework",
    payload: any
  ): Promise<Student> {
    const data = await apiFetch<{ success: boolean; student: Student }>("/api/logs/add", {
      method: "POST",
      body: JSON.stringify({
        studentId,
        logType,
        ...payload,
      }),
    });
    if (data.success && data.student) {
      return data.student;
    }
    throw new Error("Failed to update student log");
  },
};
