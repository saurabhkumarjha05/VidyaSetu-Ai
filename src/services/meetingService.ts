import { apiFetch } from "./apiClient";

export interface PtmMeeting {
  id: string;
  teacherId: string;
  teacherName: string;
  parentName: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  agenda: string;
  meetingSummary?: string;
}

export const meetingService = {
  async getMeetings(): Promise<PtmMeeting[]> {
    try {
      const data = await apiFetch<{ success: boolean; meetings: PtmMeeting[] }>("/api/meetings");
      return data.meetings || [];
    } catch (err) {
      console.warn("MeetingService: /api/meetings endpoint not fully configured on backend. Returning empty ledger.");
      return [];
    }
  },

  async scheduleMeeting(meeting: Omit<PtmMeeting, "id" | "status">): Promise<PtmMeeting> {
    const data = await apiFetch<{ success: boolean; meeting: PtmMeeting }>("/api/meetings", {
      method: "POST",
      body: JSON.stringify(meeting),
    });
    if (data.success && data.meeting) {
      return data.meeting;
    }
    throw new Error("Failed to schedule meeting");
  },
};
