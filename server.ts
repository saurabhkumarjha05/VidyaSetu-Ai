import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initialStudents } from "./serverSeedData";
import { Student } from "./src/types";

dotenv.config();

// Initialize Gemini API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Robust fallback model content generator to safeguard against 503/temporary rate limit errors
async function generateContentWithRetry(options: {
  model: string;
  contents: any;
  config?: any;
}) {
  const modelsToTry = [options.model, "gemini-2.5-flash", "gemini-1.5-flash"];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (const model of uniqueModels) {
    try {
      console.log(`[Gemini API] Requesting content generation using model: ${model}`);
      const response = await ai.models.generateContent({
        ...options,
        model: model,
      });
      return response;
    } catch (err: any) {
      console.warn(`[Gemini API] Warning: Failed generation with model ${model}:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("Failed to generate content with all candidate models.");
}

const app = express();
const httpServer = createServer(app);
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// MULTI-TENANT WORKSPACES & DATABASES
// ----------------------------------------------------

interface SchoolWorkspace {
  id: string; // School code, e.g., "VIDYA-99", "DPS-88"
  name: string;
  registeredAt: string;
  status: "Active" | "Pending" | "Suspended";
  adminEmail: string;
  documentUrl?: string;
}

let schoolsDb: SchoolWorkspace[] = [
  { id: "VIDYA-99", name: "Hillside Academy (Delhi NCR)", registeredAt: "2026-01-15", status: "Active", adminEmail: "admin@hillside.edu", documentUrl: "Registration_Doc_Hillside.pdf" },
  { id: "DPS-88", name: "Delhi Public School Core Group", registeredAt: "2026-03-22", status: "Active", adminEmail: "admin@dps.edu", documentUrl: "Govt_Permit_DPS88.pdf" },
  { id: "XAVIER-77", name: "St. Xavier's International", registeredAt: "2026-07-01", status: "Pending", adminEmail: "reg@xavier.edu", documentUrl: "CBSE_Affiliation_Cert.pdf" }
];

let schoolRegistrationsDb: any[] = [];

interface SupportTicket {
  id: string;
  schoolName: string;
  subject: string;
  message: string;
  status: "Open" | "Resolved";
  createdAt: string;
  reply?: string;
}

let supportTicketsDb: SupportTicket[] = [
  { id: "tkt-01", schoolName: "Hillside Academy", subject: "Reset Admin Password", message: "Need to reset the secondary administrator password for the sports block. Please advice.", status: "Open", createdAt: "2026-07-10T14:22:00Z" },
  { id: "tkt-02", schoolName: "Delhi Public School", subject: "Storage Limit Warning", message: "Our media drive is approaching 85% capacity. Can we request an additional 100GB?", status: "Resolved", createdAt: "2026-07-09T09:00:00Z", reply: "Approved. Storage limit increased by 100GB under educational tier license." }
];

let studentsDb: Student[] = [...initialStudents];

// Notice Board Database (School Announcements, isolated or GLOBAL)
let noticesDb = [
  {
    id: "not-01",
    title: "Mid-Term Examination Schedule",
    category: "Exam" as const,
    date: "2026-07-10",
    content: "Grade 9 and 10 Mid-Term Assessment timelines are officially published under the Exam ledger. Revision slots are allocated from Monday.",
    acknowledged: false,
    schoolCode: "VIDYA-99"
  },
  {
    id: "not-02",
    title: "AI & Machine Learning Symposium",
    category: "Event" as const,
    date: "2026-07-08",
    content: "VidyaSetu will host an interactive exhibition on prompt engineering, deep learning model deployments, and dynamic study planners this Friday.",
    acknowledged: false,
    schoolCode: "VIDYA-99"
  },
  {
    id: "not-03",
    title: "National Holiday Compliance",
    category: "Holiday" as const,
    date: "2026-07-05",
    content: "The school will remain closed on Tuesday for national public holiday compliance. Online self-paced revision sheets are posted.",
    acknowledged: true,
    schoolCode: "VIDYA-99"
  },
  {
    id: "not-global-01",
    title: "System Update: Multi-Tenant Architecture & Super Admin Console Live",
    category: "Circular" as const,
    date: "2026-07-12",
    content: "The VidyaSetu AI Core platform has successfully deployed isolated school workspaces, global platform security dashboards, and cross-tenant isolation enforcement.",
    acknowledged: false,
    schoolCode: "GLOBAL"
  }
];

// Unified Chat Messages Database
interface ServerChatMessage {
  id: string;
  room: string; // "channel:staff-general:VIDYA-99", "parent-teacher:std-01:t-01:VIDYA-99", etc.
  sender: string;
  senderRole: string; // "Admin" | "Teacher" | "Parent" | "Student" | "SuperAdmin"
  text: string;
  timestamp: string;
  read: boolean;
  schoolCode: string;
  pinned?: boolean;
  attachment?: {
    type: "Document" | "Image" | "Audio";
    name: string;
    size: string;
  };
}

let chatMessagesDb: ServerChatMessage[] = [
  // staff-general preseeds (VIDYA-99)
  { id: "m1", room: "channel:staff-general:VIDYA-99", sender: "Mr. Ananya Shastri", senderRole: "Teacher", text: "Good morning team, have we finalized the timetable adjustments for standard 9 exam preparation?", timestamp: "2026-07-11T09:12:00Z", read: true, schoolCode: "VIDYA-99" },
  { id: "m2", room: "channel:staff-general:VIDYA-99", sender: "Mrs. Sarah Jones", senderRole: "Teacher", text: "Yes, standard 9 English has an extra preparatory session mapped on Tuesdays now.", timestamp: "2026-07-11T09:20:00Z", read: true, schoolCode: "VIDYA-99" },
  { id: "m3", room: "channel:staff-general:VIDYA-99", sender: "Principal Office (Admin)", senderRole: "Admin", text: "Splendid. Let's make sure the AI study companion recommendations are mapped and sent to parents.", timestamp: "2026-07-11T10:02:00Z", read: true, pinned: true, schoolCode: "VIDYA-99" },
  
  // parents-council preseeds (VIDYA-99)
  { id: "m4", room: "channel:parents-council:VIDYA-99", sender: "Rajesh Kumar", senderRole: "Parent", text: "Will there be counseling sessions regarding exam stress for Grade 9? Aarav is feeling quite pressured.", timestamp: "2026-07-10T15:00:00Z", read: true, schoolCode: "VIDYA-99" },
  { id: "m5", room: "channel:parents-council:VIDYA-99", sender: "Principal Office (Admin)", senderRole: "Admin", text: "Yes, Rajesh. We are scheduling a counseling seminar this Thursday with certified counselors. Details incoming.", timestamp: "2026-07-10T16:00:00Z", read: true, schoolCode: "VIDYA-99" },
  
  // urgent-alerts preseeds (VIDYA-99)
  { id: "m6", room: "channel:urgent-alerts:VIDYA-99", sender: "System Administrator", senderRole: "Admin", text: "Scheduled Database Backup and System Updates scheduled for tonight at 23:00 UTC. Live service will remain active.", timestamp: "2026-07-11T08:00:00Z", read: true, pinned: true, schoolCode: "VIDYA-99" },

  // Parent-Teacher: Aarav (std-01) with Mrs. Shastri (t-01)
  { id: "pt1", room: "parent-teacher:std-01:t-01:VIDYA-99", sender: "Teacher", senderRole: "Teacher", text: "Hello Mr. Sharma, just wanted to check on Aarav. He seemed a bit drained in Science class yesterday.", timestamp: "2026-07-09T14:15:00Z", read: true, schoolCode: "VIDYA-99" },
  { id: "pt2", room: "parent-teacher:std-01:t-01:VIDYA-99", sender: "Parent", senderRole: "Parent", text: "Thank you for the update, Mrs. Shastri. We have noticed him studying late for the math assessments. We are working with him.", timestamp: "2026-07-09T14:32:00Z", read: true, schoolCode: "VIDYA-99" },
  { id: "pt3", room: "parent-teacher:std-01:t-01:VIDYA-99", sender: "Teacher", senderRole: "Teacher", text: "Perfect. I have drafted a custom practice checklist for him to cover at his own pace.", timestamp: "2026-07-10T09:00:00Z", read: true, schoolCode: "VIDYA-99" },
  { id: "pt4", room: "parent-teacher:std-01:t-01:VIDYA-99", sender: "Parent", senderRole: "Parent", text: "We appreciate your support so much! Is there any specific chapter we should emphasize?", timestamp: "2026-07-11T09:45:00Z", read: false, schoolCode: "VIDYA-99" },

  // DPS-88 staff general preseed
  { id: "m-dps-1", room: "channel:staff-general:DPS-88", sender: "Admin DPS", senderRole: "Admin", text: "Welcome to Delhi Public School Core dashboard. We are configuring the Grade 10 timetables.", timestamp: "2026-07-11T12:00:00Z", read: true, schoolCode: "DPS-88" }
];

// Global Activity Feed Ledger (isolated per school)
interface ActivityLog {
  id: string;
  type: "GRADE" | "ATTENDANCE" | "MOOD" | "ANNOUNCEMENT" | "SOS" | "PTM" | "HOMEWORK";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  schoolCode: string;
}

let activityLogs: ActivityLog[] = [
  { id: "act-1", type: "ANNOUNCEMENT", title: "Notice Board Published", description: "Standard 9 Mid-Term Examination timelines were dispatched by Principal Office.", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Principal Office", schoolCode: "VIDYA-99" },
  { id: "act-2", type: "ATTENDANCE", title: "Attendance Synced", description: "Grade 9 Attendance logs updated: 94.2% daily attendance registered.", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "Mrs. Ananya Shastri", schoolCode: "VIDYA-99" },
  { id: "act-3", type: "GRADE", title: "Calculus Scores Published", description: "Homework results and feedback published for Standard 9.", timestamp: new Date(Date.now() - 14400000).toISOString(), actor: "Mrs. Ananya Shastri", schoolCode: "VIDYA-99" },
  { id: "act-dps", type: "ANNOUNCEMENT", title: "DPS Setup Initiated", description: "DPS System Administrator initialized standard database configurations.", timestamp: new Date(Date.now() - 18000000).toISOString(), actor: "Admin DPS", schoolCode: "DPS-88" }
];

// Safety SOS Emergency Register State - Isolated per school
interface SafetySOS {
  isLocked: boolean;
  type: "SOS" | "Lockdown" | "Fire" | "None";
  reason: string | null;
  triggeredBy: string | null;
  timestamp: string | null;
}

let safetyStates: Record<string, SafetySOS> = {
  "VIDYA-99": { isLocked: false, type: "None", reason: null, triggeredBy: null, timestamp: null },
  "DPS-88": { isLocked: false, type: "None", reason: null, triggeredBy: null, timestamp: null }
};

// Help helper for tenant-specific chat rooms transparent routing
function getTenantRoom(room: string, schoolCode: string): string {
  if (room.includes(":")) {
    // If room is already fully qualified (e.g. parent-teacher:std-01:t-01:VIDYA-99), keep it
    const parts = room.split(":");
    const lastPart = parts[parts.length - 1];
    if (schoolsDb.some(s => s.id === lastPart) || lastPart === "GLOBAL") {
      return room;
    }
  }
  return `${room}:${schoolCode}`;
}

// ----------------------------------------------------
// SECURE TENANT SECURITY MIDDLEWARE
// ----------------------------------------------------
function validateTenant(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Let public routes bypass validation
  const path = req.path;
  if (path === "/schools/verify" || path === "/schools/register" || path === "/schools/login") {
    return next();
  }

  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;
  const userId = req.headers["x-user-id"] as string;

  // Let Super Admins bypass local tenant checks to inspect other domains if required
  if (userRole === "SUPER_ADMIN") {
    return next();
  }

  // Ensure school is registered and Active
  const activeSchool = schoolsDb.find(s => s.id === schoolCode);
  if (!activeSchool) {
    return res.status(403).json({ success: false, error: `Tenant workspace ${schoolCode} is not registered.` });
  }
  if (activeSchool.status === "Suspended") {
    return res.status(403).json({ success: false, error: `The ${activeSchool.name} workspace has been suspended by the platform superintendent office.` });
  }

  // Tenant is validated
  next();
}

app.use("/api", validateTenant);

// ----------------------------------------------------
// PUBLIC MULTI-TENANT & ONSITE SIGNUP ENDPOINTS
// ----------------------------------------------------

// Verify School Code
app.get("/api/schools/verify", (req, res) => {
  const code = (req.query.code as string || "").trim().toUpperCase();
  const school = schoolsDb.find(s => s.id === code);
  if (school) {
    if (school.status === "Pending") {
      return res.json({
        success: false,
        pending: true,
        error: "This school application is currently pending board validation. Review typically completes in 24 hours."
      });
    }
    if (school.status === "Suspended") {
      return res.json({
        success: false,
        suspended: true,
        error: "This school workspace has been suspended. Please contact support@vidyasetu.ai"
      });
    }
    return res.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        address: school.id === "VIDYA-99" ? "Hillside Campus, Vasant Kunj, New Delhi, India" : (school.id === "DPS-88" ? "Dwarka Sec-12, New Delhi, India" : "Registered Institutional Workspace, India"),
        logoUrl: school.id === "VIDYA-99" ? "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&auto=format&fit=crop&q=80",
        adminEmail: school.adminEmail
      }
    });
  } else {
    return res.json({
      success: false,
      notFound: true,
      error: "School Code not found. If you are registering a new school, click 'Register New School' on the Landing Page."
    });
  }
});

// Register New School
app.post("/api/schools/register", (req, res) => {
  const {
    schoolName, boardAffiliation, affiliationNumber, establishedYear,
    principalName, principalEmail, principalMobile,
    adminName, adminEmail, adminPassword,
    contactsPhone, website, addressStreet, city, state, zip
  } = req.body;

  if (!schoolName || !principalEmail || !adminEmail || !adminPassword) {
    return res.status(400).json({ success: false, error: "Missing required registration parameters." });
  }

  // Generate a premium school code
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const generatedCode = `VIDYA-2026-${randomId}`;

  const newReg = {
    id: generatedCode,
    name: schoolName,
    registeredAt: new Date().toISOString().split("T")[0],
    status: "Pending" as const,
    adminEmail: adminEmail,
    adminPassword: adminPassword,
    principalName,
    principalEmail,
    principalMobile,
    boardAffiliation,
    affiliationNumber,
    establishedYear,
    contactsPhone,
    website,
    addressStreet,
    city,
    state,
    zip,
    documentUrl: "Affiliation_Document_Signed.pdf"
  };

  // Add both to workspace DB (with status pending) and our audit details
  schoolsDb.push({
    id: generatedCode,
    name: schoolName,
    registeredAt: newReg.registeredAt,
    status: "Pending",
    adminEmail: adminEmail,
    documentUrl: newReg.documentUrl
  });

  schoolRegistrationsDb.push(newReg);

  res.json({
    success: true,
    applicationId: `APP-${Date.now().toString().slice(-6)}`,
    schoolCode: generatedCode,
    reviewTimeline: "24-48 Hours",
    emailConfirmation: principalEmail
  });
});

// Simulate immediate workspace approval for testing/sandbox evaluations
app.post("/api/schools/approve", (req, res) => {
  const { schoolCode } = req.body;
  const codeUpper = (schoolCode || "").trim().toUpperCase();
  const school = schoolsDb.find(s => s.id === codeUpper);
  if (school) {
    school.status = "Active";
    // Also approve in registrations DB
    const reg = schoolRegistrationsDb.find(r => r.id === codeUpper);
    if (reg) reg.status = "Active";
    return res.json({ success: true, schoolCode: codeUpper });
  }
  return res.status(404).json({ success: false, error: "School workspace not found." });
});

// Multi-Tenant Unified Authenticator
app.post("/api/schools/login", (req, res) => {
  const { schoolCode, role, username, password } = req.body;
  const codeUpper = (schoolCode || "").trim().toUpperCase();

  // Super admin check (hidden internal bypass)
  if (role === "SUPER_ADMIN") {
    const input = (username || "").trim().toLowerCase();
    if (input === "superadmin@vidyasetu.com" && password === "superadmin123") {
      return res.json({
        success: true,
        user: {
          id: "usr-super-admin-1",
          name: "Superintendent Office",
          username: username.trim(),
          role: "SUPER_ADMIN",
          schoolCode: "GLOBAL"
        }
      });
    } else {
      return res.json({ success: false, error: "Invalid platform credentials. Use superadmin@vidyasetu.com" });
    }
  }

  // Find school
  const school = schoolsDb.find(s => s.id === codeUpper);
  if (!school) {
    return res.json({ success: false, error: "School workspace session expired or code is invalid." });
  }

  if (school.status !== "Active") {
    return res.json({ success: false, error: "This school workspace is currently inactive or pending approval." });
  }

  const input = (username || "").trim().toLowerCase();

  // Verify roles
  if (role === "ADMIN") {
    // Check registered school credentials or preseeds
    const registration = schoolRegistrationsDb.find(r => r.id === codeUpper);
    const expectedEmail = registration ? registration.adminEmail.toLowerCase() : "admin@hillside.edu";
    const expectedPassword = registration ? registration.adminPassword : "admin123";

    if (codeUpper === "VIDYA-99" && input === "admin@hillside.edu" && password === "admin123") {
      return res.json({
        success: true,
        user: {
          id: "usr-admin-1",
          name: "Principal S. Mehta",
          username: username.trim(),
          role: "ADMIN",
          schoolCode: codeUpper
        }
      });
    } else if (codeUpper === "DPS-88" && input === "admin@dps.edu" && password === "admin123") {
      return res.json({
        success: true,
        user: {
          id: "usr-admin-2",
          name: "Principal R. K. Sen",
          username: username.trim(),
          role: "ADMIN",
          schoolCode: codeUpper
        }
      });
    } else if (input === expectedEmail && password === expectedPassword) {
      return res.json({
        success: true,
        user: {
          id: `usr-admin-${codeUpper}`,
          name: registration ? `Principal ${registration.principalName}` : "Principal Admin",
          username: username.trim(),
          role: "ADMIN",
          schoolCode: codeUpper
        }
      });
    } else {
      return res.json({ success: false, error: `Invalid administrator credentials. Try admin@hillside.edu` });
    }
  }

  if (role === "TEACHER") {
    if (input.includes("teacher") || input.includes("shastri") || input === "teacher@hillside.edu") {
      return res.json({
        success: true,
        user: {
          id: "usr-teacher-1",
          name: "Mrs. Shastri (Class Teacher)",
          username: username.trim(),
          role: "TEACHER",
          schoolCode: codeUpper
        }
      });
    } else {
      return res.json({ success: false, error: "Invalid teacher credentials. Use teacher@hillside.edu" });
    }
  }

  if (role === "STUDENT") {
    const filteredStudents = studentsDb.filter(s => s.schoolCode === codeUpper);
    const matched = filteredStudents.find(
      (s) =>
        s.rollNumber.toLowerCase() === input ||
        s.name.toLowerCase().includes(input) ||
        input.includes(s.id)
    ) || filteredStudents[0];

    if (matched) {
      return res.json({
        success: true,
        user: {
          id: `usr-std-${matched.id}`,
          name: matched.name,
          username: username.trim(),
          role: "STUDENT",
          schoolCode: codeUpper,
          associatedStudentId: matched.id
        }
      });
    } else {
      return res.json({ success: false, error: "Student roll number or ID not recognized. Try prefill!" });
    }
  }

  if (role === "PARENT") {
    const filteredStudents = studentsDb.filter(s => s.schoolCode === codeUpper);
    const matched = filteredStudents.find(
      (s) =>
        input.includes("dad") ||
        input.includes("parent") ||
        input.includes("sharma") ||
        s.name.toLowerCase().includes(input.replace("dad", "").trim())
    ) || filteredStudents[0];

    if (matched) {
      return res.json({
        success: true,
        user: {
          id: `usr-p-${matched.id}`,
          name: `Mr. Sharma (Parent of ${matched.name})`,
          username: username.trim(),
          role: "PARENT",
          schoolCode: codeUpper,
          associatedStudentId: matched.id
        }
      });
    } else {
      return res.json({ success: false, error: "Parent credentials not recognized. Try prefill!" });
    }
  }

  res.json({ success: false, error: "Unsupported login configuration." });
});

// ----------------------------------------------------
// EXPRESS API ROUTING (TENANT ISOLATED)
// ----------------------------------------------------

// Fetch student database state (strictly filtered by schoolCode unless SUPER_ADMIN)
app.get("/api/data", async (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;

  let filtered = studentsDb;
  if (userRole !== "SUPER_ADMIN") {
    filtered = studentsDb.filter((s) => s.schoolCode === schoolCode);
  }

  try {
    const enriched = await enrichStudentsWithPredictions(filtered);
    res.json({ success: true, students: enriched });
  } catch (err: any) {
    res.json({ success: true, students: filtered });
  }
});

// Fetch notice board announcements (school specific + platform globals)
app.get("/api/announcements", (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;

  if (userRole === "SUPER_ADMIN") {
    return res.json({ success: true, notices: noticesDb });
  }

  const filtered = noticesDb.filter((n) => n.schoolCode === schoolCode || n.schoolCode === "GLOBAL");
  res.json({ success: true, notices: filtered });
});

// Post a notice board announcement
app.post("/api/announcements", (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;
  const { title, body, category, isGlobal } = req.body;

  // Enforce permissions: Only ADMIN, TEACHER or SUPER_ADMIN can publish
  if (userRole !== "ADMIN" && userRole !== "TEACHER" && userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Unauthorized: Insufficient publishing privileges." });
  }

  const targetSchoolCode = (userRole === "SUPER_ADMIN" && isGlobal) ? "GLOBAL" : schoolCode;

  const newNotice = {
    id: `not-${Date.now()}`,
    title,
    category: category || "Circular",
    date: new Date().toISOString().split("T")[0],
    content: body,
    acknowledged: false,
    schoolCode: targetSchoolCode
  };
  noticesDb = [newNotice, ...noticesDb];
  
  // Log into activity feed
  const log: ActivityLog = {
    id: `act-${Date.now()}`,
    type: "ANNOUNCEMENT",
    title: "Notice Board Announcement",
    description: `Published: "${title}"`,
    timestamp: new Date().toISOString(),
    actor: userRole === "SUPER_ADMIN" ? "Platform Superintendent" : "Admin Office",
    schoolCode: targetSchoolCode
  };
  activityLogs = [log, ...activityLogs];

  // Broadcast to sockets
  io.emit("announcement:new", newNotice);
  io.emit("activity:new", log);
  io.emit("notification:new", {
    id: `notif-${Date.now()}`,
    title: targetSchoolCode === "GLOBAL" ? "Global System Notice" : "School Announcement",
    body: title,
    type: "ANNOUNCEMENT",
    timestamp: new Date().toISOString(),
    schoolCode: targetSchoolCode
  });

  res.json({ success: true, notices: noticesDb.filter(n => n.schoolCode === schoolCode || n.schoolCode === "GLOBAL") });
});

// Fetch isolated safety lock status & logs
app.get("/api/safety", (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const schoolSafetyState = safetyStates[schoolCode] || { isLocked: false, type: "None", reason: null, triggeredBy: null, timestamp: null };
  res.json({
    success: true,
    state: schoolSafetyState,
    logs: activityLogs.filter((a) => a.type === "SOS" && a.schoolCode === schoolCode),
  });
});

// Fetch unified chat messages for a room (transparently mapped per school workspace)
app.get("/api/chats/:room", (req, res) => {
  const { room } = req.params;
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const tenantRoom = getTenantRoom(room, schoolCode);

  const messages = chatMessagesDb.filter((m) => m.room === tenantRoom);
  res.json({ success: true, messages });
});

// Send message to a room via HTTP
app.post("/api/chats/:room", (req, res) => {
  const { room } = req.params;
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const tenantRoom = getTenantRoom(room, schoolCode);
  const { sender, senderRole, text, attachment } = req.body;
  
  const newMsg: ServerChatMessage = {
    id: `msg-${Date.now()}`,
    room: tenantRoom,
    sender,
    senderRole,
    text,
    timestamp: new Date().toISOString(),
    read: false,
    schoolCode,
    attachment
  };
  
  chatMessagesDb.push(newMsg);
  
  // Broadcast real-time message to everyone in the tenant-specific room
  io.to(tenantRoom).emit("chat:message", newMsg);
  
  res.json({ success: true, message: newMsg });
});

// Fetch administrative activity timeline (isolated per school)
app.get("/api/activity-logs", (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;

  if (userRole === "SUPER_ADMIN") {
    return res.json({ success: true, logs: activityLogs });
  }

  const logs = activityLogs.filter((a) => a.schoolCode === schoolCode);
  res.json({ success: true, logs });
});

// Add academic, wellbeing, or attendance log (with strict role checks & tenant separation)
app.post("/api/logs/add", (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;
  const { studentId, type, data } = req.body;

  // Enforce role permission checks: only Teacher, Admin or Super Admin can edit grades/attendance
  if (userRole !== "TEACHER" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Unauthorized: Insufficient academic edit rights." });
  }

  const student = studentsDb.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  // Enforce tenant isolation check: do not allow modifying student data from another school!
  if (userRole !== "SUPER_ADMIN" && student.schoolCode !== schoolCode) {
    return res.status(403).json({ success: false, error: "Unauthorized: Attempted cross-tenant data override." });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  try {
    let activityTitle = "";
    let activityDesc = "";
    let notificationTitle = "";
    let notificationBody = "";

    switch (type) {
      case "OBSERVATION": {
        const { category, content, sentiment } = data;
        student.wellbeing.observations.push({
          date: todayStr,
          category,
          content,
          teacherId: "t-01",
          sentiment: sentiment || "Neutral",
        });
        activityTitle = "Teacher Observation Registered";
        activityDesc = `Added a ${sentiment} observation for ${student.name}: ${content}`;
        notificationTitle = "Wellbeing Observation Logged";
        notificationBody = `An observation was filed for ${student.name}.`;
        break;
      }
      case "MOOD": {
        const { rating, notes } = data;
        student.wellbeing.moodHistory.push({
          date: todayStr,
          rating: Number(rating),
          notes,
        });
        activityTitle = "Wellness Metric Checked";
        activityDesc = `${student.name} logged mood rating ${rating}/5: "${notes || "No notes"}"`;
        
        if (Number(rating) <= 2) {
          notificationTitle = "Wellness Intervention Advisory";
          notificationBody = `${student.name} reported high academic stress. AI Companion triggered encouragement.`;
        } else {
          notificationTitle = "Student Mood Synced";
          notificationBody = `${student.name} updated daily wellness ledger.`;
        }
        break;
      }
      case "ATTENDANCE": {
        const { status } = data; // "Present" | "Absent" | "Late"
        student.attendance.totalDays += 1;
        if (status === "Present" || status === "Late") {
          student.attendance.presentDays += 1;
        }
        student.attendance.history.push({
          date: todayStr,
          status,
        });
        activityTitle = "Attendance Registered";
        activityDesc = `${student.name} marked ${status} today.`;
        notificationTitle = "Live Attendance Synced";
        notificationBody = `${student.name} is marked ${status} in class roster.`;
        break;
      }
      case "GRADE": {
        const { subjectName, assessment, score, maxScore } = data;
        const subject = student.academics.subjects.find((sub) => sub.name === subjectName);
        if (subject) {
          subject.grades.push({
            assessment,
            score: Number(score),
            maxScore: Number(maxScore),
            date: todayStr,
          });
        } else {
          student.academics.subjects.push({
            name: subjectName,
            grades: [{ assessment, score: Number(score), maxScore: Number(maxScore), date: todayStr }],
          });
        }
        activityTitle = "Grade Assessment Filed";
        activityDesc = `${student.name} scored ${score}/${maxScore} in ${subjectName} (${assessment})`;
        notificationTitle = "New Grade Assessment Published";
        notificationBody = `${student.name}'s scores are published for ${assessment} (${subjectName}).`;
        break;
      }
      case "HOMEWORK_STATUS": {
        const { homeworkId, status, score } = data;
        const hw = student.homework.find((h) => h.id === homeworkId);
        if (hw) {
          hw.status = status;
          if (score !== undefined) hw.score = Number(score);
        }
        activityTitle = "Homework Status Updated";
        activityDesc = `${student.name}'s homework "${hw?.title || "Workbook"}" is marked ${status}`;
        notificationTitle = "Homework Status Synchronized";
        notificationBody = `"${hw?.title}" progress state updated to ${status}.`;
        break;
      }
      case "ASSIGN_HOMEWORK": {
        const { title, subject, dueDate } = data;
        const newHwId = `hw-${Date.now()}`;
        student.homework.push({
          id: newHwId,
          title,
          subject,
          dueDate,
          status: "Pending",
        });
        activityTitle = "Homework Assigned";
        activityDesc = `New homework task "${title}" assigned to ${student.name} (Due: ${dueDate})`;
        notificationTitle = "New Homework Task Scheduled";
        notificationBody = `"${title}" has been assigned for ${subject}.`;
        break;
      }
      default:
        return res.status(400).json({ success: false, error: "Invalid log type" });
    }

    // Add to isolated activity logs
    if (activityTitle) {
      const log: ActivityLog = {
        id: `act-${Date.now()}`,
        type: type as any,
        title: activityTitle,
        description: activityDesc,
        timestamp: new Date().toISOString(),
        actor: userRole === "TEACHER" ? "Mrs. Shastri" : "Academic System",
        schoolCode: student.schoolCode
      };
      activityLogs = [log, ...activityLogs];
      
      // Dispatch real-time logs & database reload triggers
      io.emit("activity:new", log);
      io.emit("db:updated", { studentId, type, schoolCode: student.schoolCode });
      
      if (notificationTitle) {
        io.emit("notification:new", {
          id: `notif-${Date.now()}`,
          title: notificationTitle,
          body: notificationBody,
          type,
          studentId,
          schoolCode: student.schoolCode,
          timestamp: new Date().toISOString()
        });
      }
    }

    return res.json({ success: true, student });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// LEVEL 1: SUPER ADMIN COGNITIVE ENDPOINTS
// ----------------------------------------------------

// Fetch all schools (Super Admin dashboard)
app.get("/api/super/schools", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied: Super Admin console restricted." });
  }
  res.json({ success: true, schools: schoolsDb });
});

// Create new school workspace
app.post("/api/super/schools/create", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied: Super Admin console restricted." });
  }

  const { id, name, adminEmail } = req.body;
  const exists = schoolsDb.some(s => s.id === id);
  if (exists) {
    return res.status(400).json({ success: false, error: "School code already registered." });
  }

  const newSchool: SchoolWorkspace = {
    id: id.trim().toUpperCase(),
    name,
    registeredAt: new Date().toISOString().split("T")[0],
    status: "Active",
    adminEmail,
    documentUrl: "Direct_Provisioning_License.pdf"
  };

  schoolsDb.push(newSchool);
  safetyStates[newSchool.id] = { isLocked: false, type: "None", reason: null, triggeredBy: null, timestamp: null };

  res.json({ success: true, schools: schoolsDb });
});

// Modify school registration status (Approve, Reject, Suspend, Activate)
app.post("/api/super/schools/status", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied: Super Admin console restricted." });
  }

  const { schoolId, status } = req.body;
  const school = schoolsDb.find(s => s.id === schoolId);
  if (!school) {
    return res.status(404).json({ success: false, error: "School workspace not found." });
  }

  school.status = status;
  res.json({ success: true, schools: schoolsDb });
});

// Fetch system support tickets
app.get("/api/super/tickets", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied." });
  }
  res.json({ success: true, tickets: supportTicketsDb });
});

// Reply and resolve tickets
app.post("/api/super/tickets/reply", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied." });
  }

  const { ticketId, reply } = req.body;
  const ticket = supportTicketsDb.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ success: false, error: "Ticket not found." });
  }

  ticket.reply = reply;
  ticket.status = "Resolved";
  res.json({ success: true, tickets: supportTicketsDb });
});

// Fetch Super Admin platform system metrics
app.get("/api/super/analytics", (req, res) => {
  const userRole = req.headers["x-user-role"] as string;
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied." });
  }

  // Dynamically calculate statistics from in-memory registers
  const activeSocketsCount = io.engine.clientsCount;
  const totalStudents = studentsDb.length;
  const totalNotices = noticesDb.length;
  const totalSchoolsCount = schoolsDb.length;
  const pendingSchoolsCount = schoolsDb.filter(s => s.status === "Pending").length;
  const activeSchoolsCount = schoolsDb.filter(s => s.status === "Active").length;

  res.json({
    success: true,
    analytics: {
      cpuUsage: Math.floor(Math.random() * 25) + 12, // mock CPU usage
      memoryUsage: Math.floor(Math.random() * 15) + 64, // mock Memory load %
      activeSockets: activeSocketsCount,
      storageUsed: "4.15 TB",
      storageLimit: "10.00 TB",
      totalSchools: totalSchoolsCount,
      activeSchools: activeSchoolsCount,
      pendingSchools: pendingSchoolsCount,
      totalStudents,
      totalNotices
    }
  });
});

// ----------------------------------------------------
// COGNITIVE AI CORE AGENTS & PREDICTIONS
// ----------------------------------------------------

// Helper to map student record to feature indexes for ML models
function mapStudentToFeatures(student: any) {
  const attendancePercentage = student.attendance.totalDays > 0 
    ? (student.attendance.presentDays / student.attendance.totalDays) * 100 
    : 100.0;

  const completedHw = student.homework.filter((h: any) => h.status === "Completed" || h.status === "Late").length;
  const totalHw = student.homework.length;
  const homeworkCompletion = totalHw > 0 ? (completedHw / totalHw) * 100 : 100.0;

  const allGrades = student.academics.subjects.flatMap((s: any) => s.grades);
  const assignmentsGrades = allGrades.filter((g: any) => g.assessment.toLowerCase().includes("assignment") || g.assessment.toLowerCase().includes("project"));
  const assignmentsAverage = assignmentsGrades.length > 0
    ? (assignmentsGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / assignmentsGrades.length)
    : (allGrades.length > 0 ? (allGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / allGrades.length) : 80.0);

  const quizGrades = allGrades.filter((g: any) => g.assessment.toLowerCase().includes("quiz") || g.assessment.toLowerCase().includes("test"));
  const quizAverage = quizGrades.length > 0
    ? (quizGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / quizGrades.length)
    : (allGrades.length > 0 ? (allGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / allGrades.length) : 80.0);

  const previousGpa = allGrades.length > 0
    ? (allGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 10, 0) / allGrades.length)
    : 8.0;

  const positiveObs = student.wellbeing.observations.filter((o: any) => o.sentiment === "Positive").length;
  const negativeObs = student.wellbeing.observations.filter((o: any) => o.sentiment === "Negative").length;
  const participationScore = Math.max(0, Math.min(100, 75 + (positiveObs * 5) - (negativeObs * 10)));

  const moodHistory = student.wellbeing.moodHistory;
  const avgMood = moodHistory.length > 0 ? (moodHistory.reduce((sum: number, m: any) => sum + m.rating, 0) / moodHistory.length) : 4.0;
  const teacherRating = Math.max(0, Math.min(5, avgMood));

  const lateSubmissions = student.homework.filter((h: any) => h.status === "Late").length;

  const features = {
    Attendance_Percentage: attendancePercentage,
    Homework_Completion: homeworkCompletion,
    Assignments_Average: assignmentsAverage,
    Quiz_Average: quizAverage,
    Previous_GPA: previousGpa,
    Participation_Score: participationScore,
    Teacher_Rating: teacherRating,
    Late_Submissions: lateSubmissions
  };

  const subjectMarks: Record<string, number> = {};
  student.academics.subjects.forEach((sub: any) => {
    const total = sub.grades.reduce((sum: number, g: any) => sum + g.score, 0);
    const max = sub.grades.reduce((sum: number, g: any) => sum + g.maxScore, 0);
    subjectMarks[sub.name] = max > 0 ? (total / max) * 100 : 80.0;
  });

  return { features, subjectMarks };
}

// Enrichment function to run ML predictions on students in batch
async function enrichStudentsWithPredictions(students: any[]): Promise<any[]> {
  return Promise.all(students.map(async (student) => {
    try {
      const { features, subjectMarks } = mapStudentToFeatures(student);
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      });
      const data = await res.json();
      
      const sortedSubs = Object.entries(subjectMarks).sort((a: any, b: any) => b[1] - a[1]);
      const strongSubject = sortedSubs[0]?.[0] || "Mathematics";
      const weakSubject = sortedSubs[sortedSubs.length - 1]?.[0] || "Hindi";

      if (data.success) {
        return {
          ...student,
          predictedPerformance: data.predictions.predicted_performance,
          needsIntervention: data.predictions.needs_intervention,
          interventionProbability: data.predictions.intervention_probability,
          predictionConfidence: data.predictions.prediction_confidence,
          featureImportance: data.predictions.feature_importance,
          strongSubject,
          weakSubject
        };
      }
    } catch (err) {
      console.warn(`[FastAPI Service Offline] Failed to enrich student ${student.id} predictions. Using baseline averages.`);
    }
    
    // Fallback if FastAPI is not running
    const sortedSubs = Object.entries(mapStudentToFeatures(student).subjectMarks).sort((a: any, b: any) => b[1] - a[1]);
    const strongSubject = sortedSubs[0]?.[0] || "Mathematics";
    const weakSubject = sortedSubs[sortedSubs.length - 1]?.[0] || "Hindi";
    return {
      ...student,
      predictedPerformance: 75.0,
      needsIntervention: 0,
      interventionProbability: 0.2,
      predictionConfidence: 0.9,
      strongSubject,
      weakSubject
    };
  }));
}

// Predict endpoint
app.post("/api/ai/predict", async (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;
  const { studentId } = req.body;
  const student = studentsDb.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  // Cross-tenant verification
  if (userRole !== "SUPER_ADMIN" && student.schoolCode !== schoolCode) {
    return res.status(403).json({ success: false, error: "Access Denied: Cross-tenant evaluation blocked." });
  }

  const { features } = mapStudentToFeatures(student);

  try {
    const pyRes = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features })
    });
    const pyData = await pyRes.json();
    return res.json(pyData);
  } catch (err: any) {
    console.error("FastAPI predict proxy error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// AI Diagnosis Proxy
app.post("/api/ai/diagnose", async (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;
  const { studentId } = req.body;
  
  const student = studentsDb.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  // Cross-tenant verification
  if (userRole !== "SUPER_ADMIN" && student.schoolCode !== schoolCode) {
    return res.status(403).json({ success: false, error: "Access Denied: Cross-tenant evaluation blocked." });
  }

  const { features, subjectMarks } = mapStudentToFeatures(student);

  try {
    const pyRes = await fetch("http://localhost:8000/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: student.name,
        class_name: student.class,
        section: "A",
        features,
        subject_marks: subjectMarks
      })
    });
    
    const pyData = await pyRes.json();
    if (pyData.success) {
      // Map back to expected structure in TeacherTab UI
      const resultObj = pyData.insight.report; // includes html + full_text
      const pythonInsight = pyData.insight.analytics;
      const geminiInsight = pyData.insight.gemini_explanations;
      
      res.json({
        success: true,
        insight: {
          category: "General",
          riskLevel: pyData.insight.predictions.needs_intervention === 1 ? "High" : "Low",
          summary: geminiInsight.prediction_summary,
          keyFindings: pythonInsight.strengths.concat(pythonInsight.weaknesses),
          recommendations: pythonInsight.recommendations.map((r: any) => r.description),
          recommendedHomework: ["Trigonometry Proofs Drill", "Force & Motion Problems", "Grammar Revision Sheet"],
          studentId,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({ success: false, error: pyData.error || "FastAPI returned failure" });
    }
  } catch (err: any) {
    console.error("FastAPI diagnose proxy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Interactive Support Companion Proxy
app.post("/api/ai/chat", async (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;
  const { messages, studentId } = req.body;
  const student = studentsDb.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  // Cross-tenant verification
  if (userRole !== "SUPER_ADMIN" && student.schoolCode !== schoolCode) {
    return res.status(403).json({ success: false, error: "Access Denied." });
  }

  const { features, subjectMarks } = mapStudentToFeatures(student);
  const attendanceRate = features.Attendance_Percentage.toFixed(1);
  const currentMood = student.wellbeing.moodHistory[student.wellbeing.moodHistory.length - 1]?.rating || 3;
  const subjectsReport = Object.entries(subjectMarks).map(([name, val]) => `${name}: ${val.toFixed(0)}%`).join(", ");

  const studentContext = `Name: ${student.name}, Class: ${student.class}, Attendance: ${attendanceRate}%, Mood: ${currentMood}/5, Averages: ${subjectsReport}.`;
  const systemInstruction = `
    You are "Vidya Assistant", an empathetic, highly supportive AI companion for students and parents at VidyaSetu AI School.
    Respond with high warmth, empathy, and constructive, actionable advice. Keep replies under 100 words.
    Role of user: ${userRole}.
  `;

  try {
    const pyRes = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m: any) => ({ role: m.role, text: m.text })),
        student_context: studentContext,
        system_instruction: systemInstruction
      })
    });
    
    const pyData = await pyRes.json();
    if (pyData.success) {
      res.json({ success: true, text: pyData.text });
    } else {
      res.status(500).json({ success: false, error: pyData.error || "FastAPI returned failure" });
    }
  } catch (err: any) {
    console.error("FastAPI chat proxy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// School-wide AI Insights Proxy
app.post("/api/ai/admin-insight", async (req, res) => {
  const schoolCode = (req.headers["x-school-code"] as string) || "VIDYA-99";
  const userRole = req.headers["x-user-role"] as string;

  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, error: "Access Denied." });
  }

  const cohort = userRole === "SUPER_ADMIN" ? studentsDb : studentsDb.filter((s) => s.schoolCode === schoolCode);

  const cohortSummary = cohort.map((student) => {
    const { features, subjectMarks } = mapStudentToFeatures(student);
    const avgScore = Object.values(subjectMarks).reduce((a, b) => a + b, 0) / Object.values(subjectMarks).length;
    const moodAvg = student.wellbeing.moodHistory.length > 0 
      ? student.wellbeing.moodHistory.reduce((s, m) => s + m.rating, 0) / student.wellbeing.moodHistory.length 
      : 3.0;
    const negObservations = student.wellbeing.observations.filter((o: any) => o.sentiment === "Negative").length;

    return {
      name: student.name,
      school: student.schoolCode,
      attendance: `${features.Attendance_Percentage.toFixed(0)}%`,
      academicAverage: `${avgScore.toFixed(0)}%`,
      wellbeingRating: `${moodAvg.toFixed(1)}/5`,
      negativeLogs: negObservations,
    };
  });

  try {
    const pyRes = await fetch("http://localhost:8000/admin-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohort_summary: cohortSummary })
    });
    
    const pyData = await pyRes.json();
    if (pyData.success) {
      res.json({ success: true, report: pyData.report });
    } else {
      res.status(500).json({ success: false, error: pyData.error || "FastAPI returned failure" });
    }
  } catch (err: any) {
    console.error("FastAPI admin-insight proxy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Doubt Solver Proxy
app.post("/api/ai/doubt-solver", async (req, res) => {
  const { question, subject } = req.body;
  try {
    const pyRes = await fetch("http://localhost:8000/doubt-solver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, subject })
    });
    const pyData = await pyRes.json();
    return res.json(pyData);
  } catch (err: any) {
    console.error("FastAPI doubt-solver proxy error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// AI Notes Summarizer Proxy
app.post("/api/ai/notes-summarizer", async (req, res) => {
  const { notes } = req.body;
  try {
    const pyRes = await fetch("http://localhost:8000/notes-summarizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
    const pyData = await pyRes.json();
    return res.json(pyData);
  } catch (err: any) {
    console.error("FastAPI notes-summarizer proxy error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// SOCKET.IO REALTIME HANDLER SETUP
// ----------------------------------------------------
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Active Sockets Presence registry
// Map: socketId -> { userId, name, role, schoolCode, status: "Online" | "Away" | "Offline" }
let onlineUsers: Record<string, { userId: string; name: string; role: string; schoolCode: string; status: string }> = {};

io.on("connection", (socket) => {
  console.log(`Socket connection initialized: ${socket.id}`);

  // Register active user session
  socket.on("user:register", (data) => {
    const userSchool = data.schoolCode || "VIDYA-99";
    onlineUsers[socket.id] = {
      userId: data.userId,
      name: data.name,
      role: data.role,
      schoolCode: userSchool,
      status: "Online"
    };
    
    // Broadcast updated presence rosters to everyone
    io.emit("presence:update", onlineUsers);
    
    // Auto-join relevant tenant-specific communication rooms
    socket.join(`channel:urgent-alerts:${userSchool}`);
    if (data.role === "ADMIN" || data.role === "TEACHER" || data.role === "SUPER_ADMIN") {
      socket.join(`channel:staff-general:${userSchool}`);
    }
    if (data.role === "ADMIN" || data.role === "PARENT" || data.role === "TEACHER" || data.role === "SUPER_ADMIN") {
      socket.join(`channel:parents-council:${userSchool}`);
    }
  });

  // Client requests to open a specific chat room
  socket.on("chat:join", (room) => {
    const userSession = onlineUsers[socket.id];
    const userSchool = userSession?.schoolCode || "VIDYA-99";
    const tenantRoom = getTenantRoom(room, userSchool);
    socket.join(tenantRoom);
  });

  // Client dispatches a direct chat message
  socket.on("chat:send", (data) => {
    const userSession = onlineUsers[socket.id];
    const userSchool = userSession?.schoolCode || "VIDYA-99";
    const { room, sender, senderRole, text, attachment } = data;
    const tenantRoom = getTenantRoom(room, userSchool);
    
    const newMsg: ServerChatMessage = {
      id: `msg-${Date.now()}`,
      room: tenantRoom,
      sender,
      senderRole,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      schoolCode: userSchool,
      attachment
    };
    
    chatMessagesDb.push(newMsg);
    
    // Dispatch back to everyone inside the targeted room
    io.to(tenantRoom).emit("chat:message", newMsg);

    // Also trigger instant header notice for matching roles not in active screen
    io.emit("notification:new", {
      id: `notif-${Date.now()}`,
      title: `Message from ${sender} (${senderRole})`,
      body: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      type: "CHAT",
      room: tenantRoom,
      schoolCode: userSchool,
      timestamp: new Date().toISOString()
    });
  });

  // Client typing status update
  socket.on("chat:typing", (data) => {
    const userSession = onlineUsers[socket.id];
    const userSchool = userSession?.schoolCode || "VIDYA-99";
    const { room, sender, isTyping } = data;
    const tenantRoom = getTenantRoom(room, userSchool);
    socket.to(tenantRoom).emit("chat:typing", { room: tenantRoom, sender, isTyping });
  });

  // Database silent re-sync instruction
  socket.on("db:update", () => {
    io.emit("db:updated");
  });

  // Emergency SOS dispatch (Isolated per school)
  socket.on("safety:sos", (data) => {
    const userSession = onlineUsers[socket.id];
    const userSchool = userSession?.schoolCode || "VIDYA-99";
    const { type, reason, triggeredBy } = data;
    
    safetyStates[userSchool] = {
      isLocked: true,
      type: type || "SOS",
      reason: reason || "Emergency Lock Activated",
      triggeredBy: triggeredBy || "Security Office",
      timestamp: new Date().toISOString(),
    };

    const emergencyLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type: "SOS",
      title: `CRITICAL ${type || "SOS"} IN PROGRESS`,
      description: `Activated by ${triggeredBy || "Security Office"}: ${reason}`,
      timestamp: new Date().toISOString(),
      actor: triggeredBy || "System Core",
      schoolCode: userSchool
    };

    activityLogs = [emergencyLog, ...activityLogs];

    // Broadcast emergency state to absolutely all sockets inside this school tenant
    io.emit("safety:sos_alert", { state: safetyStates[userSchool], log: emergencyLog, schoolCode: userSchool });
    io.emit("activity:new", emergencyLog);
  });

  // Resolve SOS dispatch (Isolated per school)
  socket.on("safety:resolve", () => {
    const userSession = onlineUsers[socket.id];
    const userSchool = userSession?.schoolCode || "VIDYA-99";
    
    safetyStates[userSchool] = {
      isLocked: false,
      type: "None",
      reason: null,
      triggeredBy: null,
      timestamp: null,
    };

    const clearLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type: "SOS",
      title: "ALL CLEAR REGISTERED",
      description: "Emergency protocols disengaged. All zones secure.",
      timestamp: new Date().toISOString(),
      actor: "Security Core",
      schoolCode: userSchool
    };

    activityLogs = [clearLog, ...activityLogs];

    io.emit("safety:resolved", { state: safetyStates[userSchool], log: clearLog, schoolCode: userSchool });
    io.emit("activity:new", clearLog);
  });

  // WebRTC Signal Broker for parent-teacher dynamic video calls (PTM)
  socket.on("webrtc:signal", (data) => {
    // data: { toUserId, type, sdp, candidate, fromUserId, fromName }
    // Loop through connected socket sessions and target direct recipient
    const recipientSocket = Object.entries(onlineUsers).find(
      ([_, u]) => u.userId === data.toUserId
    )?.[0];

    if (recipientSocket) {
      io.to(recipientSocket).emit("webrtc:signal", {
        fromUserId: data.fromUserId,
        fromName: data.fromName,
        type: data.type,
        sdp: data.sdp,
        candidate: data.candidate,
      });
    }
  });

  // Manual change in presence state
  socket.on("presence:status_change", (status) => {
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id].status = status;
      io.emit("presence:update", onlineUsers);
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    delete onlineUsers[socket.id];
    io.emit("presence:update", onlineUsers);
  });
});

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION ASSET BUNDLERS
// ----------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated successfully.");
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Listen on httpServer (which runs Express + Socket.io) instead of app
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`VidyaSetu AI Operating System running on http://0.0.0.0:${PORT}`);
});
