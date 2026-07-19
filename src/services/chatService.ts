import { apiFetch } from "./apiClient";

export interface Message {
  id: string;
  room: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
  attachment?: any;
}

export const chatService = {
  async getMessages(room: string): Promise<Message[]> {
    const data = await apiFetch<{ success: boolean; messages: Message[] }>(`/api/chats/${encodeURIComponent(room)}`);
    return data.messages || [];
  },

  async sendMessage(room: string, text: string, attachment?: any): Promise<Message> {
    const data = await apiFetch<{ success: boolean; message: Message }>(`/api/chats/${encodeURIComponent(room)}`, {
      method: "POST",
      body: JSON.stringify({ text, attachment }),
    });
    if (data.success && data.message) {
      return data.message;
    }
    throw new Error("Failed to send message");
  },
};
