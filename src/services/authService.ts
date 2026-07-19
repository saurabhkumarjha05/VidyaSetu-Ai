import { apiFetch } from "./apiClient";
import { User } from "../types";

export interface SchoolVerification {
  success: boolean;
  school?: {
    id: string;
    name: string;
    registeredAt: string;
    status: "Pending" | "Active";
  };
  error?: string;
}

export const authService = {
  async verifySchool(code: string): Promise<SchoolVerification> {
    return apiFetch<SchoolVerification>(`/api/schools/verify?code=${encodeURIComponent(code)}`);
  },

  async login(schoolCode: string, role: string, username: string, password?: string): Promise<{ success: boolean; user?: User; school?: any }> {
    return apiFetch<{ success: boolean; user?: User; school?: any }>("/api/schools/login", {
      method: "POST",
      body: JSON.stringify({ schoolCode, role, username, password }),
    });
  },

  async registerSchool(schoolDetails: {
    schoolName: string;
    principalEmail: string;
    principalName: string;
    phone: string;
    regulatoryBoard: string;
  }): Promise<{ success: boolean; schoolCode?: string }> {
    return apiFetch<{ success: boolean; schoolCode?: string }>("/api/schools/register", {
      method: "POST",
      body: JSON.stringify(schoolDetails),
    });
  },

  async approveSchool(schoolCode: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>("/api/schools/approve", {
      method: "POST",
      body: JSON.stringify({ schoolCode }),
    });
  },
};
