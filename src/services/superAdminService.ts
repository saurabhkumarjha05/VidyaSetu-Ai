import { apiFetch } from "./apiClient";

export const superAdminService = {
  async getSchools(): Promise<any[]> {
    const data = await apiFetch<{ success: boolean; schools: any[] }>("/api/super/schools");
    return data.schools || [];
  },

  async getTickets(): Promise<any[]> {
    const data = await apiFetch<{ success: boolean; tickets: any[] }>("/api/super/tickets");
    return data.tickets || [];
  },

  async getAnalytics(): Promise<any> {
    const data = await apiFetch<{ success: boolean; analytics: any }>("/api/super/analytics");
    return data.analytics || null;
  },

  async createSchool(schoolDetails: any): Promise<any> {
    const data = await apiFetch<{ success: boolean; school: any }>("/api/super/schools/create", {
      method: "POST",
      body: JSON.stringify(schoolDetails),
    });
    if (data.success) return data.school;
    throw new Error("Failed to initialize school");
  },

  async setSchoolStatus(schoolCode: string, status: string): Promise<any> {
    return apiFetch<any>("/api/super/schools/status", {
      method: "POST",
      body: JSON.stringify({ schoolCode, status }),
    });
  },

  async replyTicket(ticketId: string, reply: string): Promise<any> {
    return apiFetch<any>("/api/super/tickets/reply", {
      method: "POST",
      body: JSON.stringify({ ticketId, reply }),
    });
  },
};
