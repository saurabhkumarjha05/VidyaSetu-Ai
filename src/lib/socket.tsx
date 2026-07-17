import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { User } from "../types";

// Connect to the same origin server on port 3000
export const socketInstance: Socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface SocketContextType {
  socket: Socket;
  connected: boolean;
  onlineUsers: Record<string, { userId: string; role: string; name: string; status: string }>;
  registerUser: (user: User) => void;
  updateStatus: (status: "Online" | "Away" | "Offline") => void;
  sendChatMessage: (room: string, sender: string, senderRole: string, text: string, attachment?: any) => void;
  sendTypingStatus: (room: string, sender: string, isTyping: boolean) => void;
  triggerSOS: (type: string, reason: string, triggeredBy: string) => void;
  resolveSOS: () => void;
  notifyDatabaseUpdate: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const SocketProvider = ({ children, user }: SocketProviderProps) => {
  const [connected, setConnected] = useState(socketInstance.connected);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      if (user) {
        registerUser(user);
      }
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onPresenceUpdate(users: Record<string, any>) {
      setOnlineUsers(users);
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("presence:update", onPresenceUpdate);

    // Initial connection trigger if already connected
    if (socketInstance.connected) {
      onConnect();
    }

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("presence:update", onPresenceUpdate);
    };
  }, [user]);

  const registerUser = (currentUser: User) => {
    socketInstance.emit("user:register", {
      userId: currentUser.id,
      role: currentUser.role,
      name: currentUser.name,
      associatedStudentId: currentUser.associatedStudentId,
    });
  };

  const updateStatus = (status: "Online" | "Away" | "Offline") => {
    socketInstance.emit("presence:status_change", status);
  };

  const sendChatMessage = (room: string, sender: string, senderRole: string, text: string, attachment?: any) => {
    socketInstance.emit("chat:send", {
      room,
      sender,
      senderRole,
      text,
      attachment,
    });
  };

  const sendTypingStatus = (room: string, sender: string, isTyping: boolean) => {
    socketInstance.emit("chat:typing", {
      room,
      sender,
      isTyping,
    });
  };

  const triggerSOS = (type: string, reason: string, triggeredBy: string) => {
    socketInstance.emit("safety:sos", { type, reason, triggeredBy });
  };

  const resolveSOS = () => {
    socketInstance.emit("safety:resolve");
  };

  const notifyDatabaseUpdate = () => {
    socketInstance.emit("db:update");
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        connected,
        onlineUsers,
        registerUser,
        updateStatus,
        sendChatMessage,
        sendTypingStatus,
        triggerSOS,
        resolveSOS,
        notifyDatabaseUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
