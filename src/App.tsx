import React, { useState, useEffect } from "react";
import { Role, Student, User } from "./types";
import { studentService } from "./services/studentService";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ParentDashboard from "./components/ParentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import { Brain } from "lucide-react";
import { SocketProvider, socketInstance } from "./lib/socket";

// Intercept all fetch calls globally to inject multi-tenant and role verification headers transparently!
const originalFetch = window.fetch;
const customFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const cached = localStorage.getItem("vidyasetu_session");
  let session = null;
  if (cached) {
    try {
      session = JSON.parse(cached);
    } catch (e) {}
  }

  if (session && typeof input === "string" && input.startsWith("/api/")) {
    const customInit = { ...init };
    const headers = new Headers(customInit.headers || {});
    
    if (!headers.has("x-school-code")) {
      headers.set("x-school-code", session.schoolCode || "VIDYA-99");
    }
    if (!headers.has("x-user-role")) {
      headers.set("x-user-role", session.role);
    }
    if (!headers.has("x-user-id")) {
      headers.set("x-user-id", session.id);
    }
    
    customInit.headers = headers;
    return originalFetch(input, customInit);
  }
  
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, "fetch", {
    value: customFetch,
    configurable: true,
    writable: true,
  });
} catch (e) {
  console.warn("Failed to define window.fetch via Object.defineProperty. Trying Window.prototype...", e);
  try {
    Object.defineProperty(Window.prototype, "fetch", {
      value: customFetch,
      configurable: true,
      writable: true,
    });
  } catch (err) {
    console.error("Failed to redefine fetch on Window.prototype. Setting globally on globalThis.", err);
    try {
      (globalThis as any).fetch = customFetch;
    } catch (gErr) {
      console.error("Failed to set fetch on globalThis.", gErr);
    }
  }
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"Connected" | "Syncing" | "Error">("Connected");

  // Authentication session state
  const [session, setSession] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<"LANDING" | "AUTH" | "REGISTER" | "PLATFORM_LOGIN">(() => {
    const hash = window.location.hash || "";
    const path = window.location.pathname || "";
    if (hash === "#/platform" || hash === "#platform" || path === "/platform" || path === "/admin" || hash === "#/admin" || hash === "#admin") {
      return "PLATFORM_LOGIN";
    }
    return "LANDING";
  });

  // Listen to hash changes for smooth route handling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/platform" || hash === "#platform" || hash === "#/admin" || hash === "#admin") {
        setCurrentPage("PLATFORM_LOGIN");
      } else if (hash === "#/register" || hash === "#register") {
        setCurrentPage("REGISTER");
      } else if (hash === "#/auth" || hash === "#auth") {
        setCurrentPage("AUTH");
      } else if (hash === "#/" || hash === "#" || !hash) {
        setCurrentPage("LANDING");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Load students data from server
  const fetchStudents = async () => {
    try {
      setConnectionStatus("Syncing");
      const studentsData = await studentService.getStudents();
      setStudents(studentsData);
      setConnectionStatus("Connected");
    } catch (err) {
      console.error(err);
      setConnectionStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    // Recover session from localStorage if present
    const cached = localStorage.getItem("vidyasetu_session");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.role) {
          setSession(parsed);
          // Fetch immediately to populate correct rosters
          studentService.getStudents()
            .then(studentsData => setStudents(studentsData))
            .catch(console.error);
        }
      } catch (e) {
        console.error("Stale session cache", e);
      }
    }

    // Subscribe to silent database real-time synchronization updates
    socketInstance.on("db:updated", () => {
      console.log("Real-time database synchronizer triggered. Reloading rosters...");
      fetchStudents();
    });

    return () => {
      socketInstance.off("db:updated");
    };
  }, []);

  const handleLogin = (userSession: User) => {
    setSession(userSession);
    localStorage.setItem("vidyasetu_session", JSON.stringify(userSession));
    // Trigger instant fetch on login state change
    setTimeout(() => {
      fetchStudents();
    }, 50);
  };

  const handleLogout = () => {
    setSession(null);
    setCurrentPage("LANDING");
    localStorage.removeItem("vidyasetu_session");
  };

  const handleAddLog = async (studentId: string, type: string, data: any): Promise<boolean> => {
    try {
      setConnectionStatus("Syncing");
      await studentService.addStudentLog(studentId, type as any, data);
      await fetchStudents(); // Re-sync state
      return true;
    } catch (err) {
      console.error("Error writing log:", err);
      setConnectionStatus("Error");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 shadow-sm animate-pulse">
          <Brain className="w-8 h-8 text-indigo-600 animate-spin" />
          <div>
            <h1 className="font-display font-bold text-gray-800 leading-tight">VidyaSetu AI OS</h1>
            <p className="text-xs text-indigo-600 font-medium">Booting Cognitive School Systems...</p>
          </div>
        </div>
      </div>
    );
  }

  // Active user session dashboard routing
  if (session) {
    let dashboardContent;
    switch (session.role) {
      case Role.STUDENT:
        dashboardContent = (
          <StudentDashboard
            user={session}
            students={students}
            onAddLog={handleAddLog}
            onLogout={handleLogout}
          />
        );
        break;
      case Role.PARENT:
        dashboardContent = (
          <ParentDashboard
            user={session}
            students={students}
            onAddLog={handleAddLog}
            onLogout={handleLogout}
          />
        );
        break;
      case Role.TEACHER:
        dashboardContent = (
          <TeacherDashboard
            user={session}
            students={students}
            onAddLog={handleAddLog}
            onLogout={handleLogout}
          />
        );
        break;
      case Role.ADMIN:
        dashboardContent = (
          <AdminDashboard
            user={session}
            students={students}
            onLogout={handleLogout}
          />
        );
        break;
      case Role.SUPER_ADMIN:
        dashboardContent = (
          <SuperAdminDashboard
            user={session}
            onLogout={handleLogout}
          />
        );
        break;
      default:
        dashboardContent = (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold">Unrecognized role session structure.</p>
            <button onClick={handleLogout} className="mt-4 p-2 bg-indigo-600 text-white text-xs rounded">
              Reset Session
            </button>
          </div>
        );
    }

    return (
      <SocketProvider user={session}>
        {dashboardContent}
      </SocketProvider>
    );
  }

  // Fallback to anonymous landing or auth page
  if (currentPage === "LANDING") {
    return (
      <LandingPage
        onLoginClick={() => setCurrentPage("AUTH")}
        onRegisterClick={() => setCurrentPage("REGISTER")}
      />
    );
  }

  return (
    <AuthPage
      students={students}
      onLogin={handleLogin}
      mode={currentPage}
      onBackToLanding={() => setCurrentPage("LANDING")}
    />
  );
}
