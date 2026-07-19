import { apiFetch } from "./apiClient";

export interface Announcement {
  id: string;
  title: string;
  category: "Urgent" | "Academic" | "Holiday" | "Platform";
  date: string;
  content: string;
  schoolCode: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  triggeredBy: string;
  role: string;
  timestamp: string;
  details?: string;
  schoolCode: string;
}

export const adminService = {
  async getAnnouncements(): Promise<Announcement[]> {
    const data = await apiFetch<{ success: boolean; announcements: Announcement[] }>("/api/announcements");
    return data.announcements || [];
  },

  async createAnnouncement(announcement: Omit<Announcement, "id" | "date" | "schoolCode">): Promise<Announcement> {
    const data = await apiFetch<{ success: boolean; announcement: Announcement }>("/api/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    });
    if (data.success && data.announcement) {
      return data.announcement;
    }
    throw new Error("Failed to publish announcement");
  },

  async getSafetyState(): Promise<{ success: boolean; state: string; logs: any[] }> {
    return apiFetch<{ success: boolean; state: string; logs: any[] }>("/api/safety");
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const data = await apiFetch<{ success: boolean; logs: ActivityLog[] }>("/api/activity-logs");
    return data.logs || [];
  },
};
