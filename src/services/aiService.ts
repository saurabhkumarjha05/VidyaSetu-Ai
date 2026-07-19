import { apiFetch } from "./apiClient";
import { AIInsight, ChatMessage } from "../types";

export const aiService = {
  async predict(studentId: string): Promise<any> {
    return apiFetch<any>("/api/ai/predict", {
      method: "POST",
      body: JSON.stringify({ studentId }),
    });
  },

  async diagnose(studentId: string): Promise<{ success: boolean; insight: AIInsight }> {
    return apiFetch<{ success: boolean; insight: AIInsight }>("/api/ai/diagnose", {
      method: "POST",
      body: JSON.stringify({ studentId }),
    });
  },

  async chat(studentId: string, messages: { role: "user" | "model"; text: string }[]): Promise<{ success: boolean; text: string }> {
    return apiFetch<{ success: boolean; text: string }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ studentId, messages }),
    });
  },

  async adminInsight(): Promise<{ success: boolean; report: any }> {
    return apiFetch<{ success: boolean; report: any }>("/api/ai/admin-insight", {
      method: "POST",
    });
  },

  async solveDoubt(question: string, subject: string): Promise<{ success: boolean; solution: any }> {
    return apiFetch<{ success: boolean; solution: any }>("/api/ai/doubt-solver", {
      method: "POST",
      body: JSON.stringify({ question, subject }),
    });
  },

  async summarizeNotes(notes: string): Promise<{ success: boolean; summary: string }> {
    return apiFetch<{ success: boolean; summary: string }>("/api/ai/notes-summarizer", {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  },
};
