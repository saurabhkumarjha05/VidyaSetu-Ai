import type { Express, Response } from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db";
import { attachUser, resolveContext, signAuthToken } from "../middleware/auth";
import {
  AiReportModel,
  AssignmentModel,
  AttendanceModel,
  BusTrackingModel,
  GatePassModel,
  HomeworkModel,
  MarkModel,
  MessageModel,
  MoodLogModel,
  NoticeModel,
  NotificationModel,
  ParentModel,
  ReportModel,
  SchoolModel,
  StudentModel,
  TeacherModel,
  TicketModel,
  UserModel,
} from "../models";
import { createResourceStore } from "../services/store";
import { buildAiChatReply, buildStudentInsight } from "../services/ai";
import type { Server } from "socket.io";

const router = Router();

const studentStore = createResourceStore(StudentModel, []);
const teacherStore = createResourceStore(TeacherModel, []);
const parentStore = createResourceStore(ParentModel, []);
const attendanceStore = createResourceStore(AttendanceModel, []);
const markStore = createResourceStore(MarkModel, []);
const homeworkStore = createResourceStore(HomeworkModel, []);
const assignmentStore = createResourceStore(AssignmentModel, []);
const noticeStore = createResourceStore(NoticeModel, []);
const messageStore = createResourceStore(MessageModel, []);
const notificationStore = createResourceStore(NotificationModel, []);
const moodLogStore = createResourceStore(MoodLogModel, []);
const reportStore = createResourceStore(ReportModel, []);
const aiReportStore = createResourceStore(AiReportModel, []);
const gatePassStore = createResourceStore(GatePassModel, []);
const busTrackingStore = createResourceStore(BusTrackingModel, []);
const schoolStore = createResourceStore(SchoolModel, []);
const ticketStore = createResourceStore(TicketModel, []);
const userStore = createResourceStore(UserModel, []);

async function ensureDatabaseReady() {
  await connectDatabase();
}

function getTenantRoom(room: string, schoolCode: string): string {
  if (room.includes(":")) {
    const parts = room.split(":");
    const lastPart = parts[parts.length - 1];
    if (lastPart === schoolCode || lastPart === "GLOBAL") {
      return room;
    }
  }
  return `${room}:${schoolCode}`;
}

function ok(res: Response, payload: any) {
  return res.json({ success: true, ...payload });
}

function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function emitCrudUpdate(io: Server, event: string, payload: any) {
  io.emit(event, payload);
  io.emit("db:updated");
}

function registerCrudRoutes(path: string, store: ReturnType<typeof createResourceStore>) {
  router.get(path, async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    const items = role === "SUPER_ADMIN" ? await store.list() : await store.list({ schoolCode });
    ok(res, { items });
  });

  router.get(`${path}/:id`, async (req, res) => {
    const item = await store.findById(req.params.id);
    if (!item) return fail(res, 404, "Record not found");
    ok(res, { item });
  });

  router.post(path, async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    if (!["ADMIN", "TEACHER", "SUPER_ADMIN"].includes(role)) {
      return fail(res, 403, "Forbidden");
    }
    const item = await store.create({ ...req.body, schoolCode });
    ok(res, { item });
  });

  router.put(`${path}/:id`, async (req, res) => {
    const { role } = resolveContext(req as any);
    if (!["ADMIN", "TEACHER", "SUPER_ADMIN"].includes(role)) {
      return fail(res, 403, "Forbidden");
    }
    const item = await store.update(req.params.id, req.body);
    if (!item) return fail(res, 404, "Record not found");
    ok(res, { item });
  });

  router.delete(`${path}/:id`, async (req, res) => {
    const { role } = resolveContext(req as any);
    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return fail(res, 403, "Forbidden");
    }
    const item = await store.remove(req.params.id);
    if (!item) return fail(res, 404, "Record not found");
    ok(res, { item });
  });
}

export function registerExtendedApi(app: Express, io: Server) {
  void ensureDatabaseReady();

  app.use("/api", attachUser);
  app.use("/api", router);

  router.get("/data", async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    const students = role === "SUPER_ADMIN" ? await studentStore.list() : await studentStore.list({ schoolCode });
    ok(res, { students });
  });

  router.get("/schools/verify", async (req, res) => {
    const code = String(req.query.code || "").trim().toUpperCase();
    const schools = await schoolStore.list();
    const school = schools.find((entry: any) => entry.id === code);
    if (!school) {
      return res.json({
        success: false,
        notFound: true,
        error: "School Code not found. If you are registering a new school, click 'Register New School' on the Landing Page.",
      });
    }

    if (school.status === "Pending") {
      return res.json({
        success: false,
        pending: true,
        error: "This school application is currently pending board validation. Review typically completes in 24 hours.",
      });
    }

    if (school.status === "Suspended") {
      return res.json({
        success: false,
        suspended: true,
        error: "This school workspace has been suspended. Please contact support@vidyasetu.ai",
      });
    }

    return ok(res, {
      success: true,
      school: {
        id: school.id,
        name: school.name,
        address: school.address || "Registered Institutional Workspace",
        logoUrl: school.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&auto=format&fit=crop&q=80",
        adminEmail: school.adminEmail,
      },
    });
  });

  router.post("/schools/register", async (req, res) => {
    const { schoolName, principalName, principalEmail, adminName, adminEmail, adminPassword } = req.body || {};
    if (!schoolName || !principalEmail || !adminEmail || !adminPassword) {
      return fail(res, 400, "Missing required registration parameters.");
    }

    const schoolCode = `VIDYA-${Date.now().toString().slice(-6)}`;
    const hashedPassword = bcrypt.hashSync(String(adminPassword), 10);

    const school = await schoolStore.create({
      id: schoolCode,
      name: schoolName,
      registeredAt: new Date().toISOString().split("T")[0],
      status: "Pending",
      adminEmail,
      principalEmail,
      adminPassword: hashedPassword,
      schoolName,
    } as any);

    await userStore.create({
      id: `usr-${schoolCode.toLowerCase()}-admin`,
      name: adminName || principalName || `${schoolName} Admin`,
      username: adminEmail,
      role: "ADMIN",
      schoolCode,
      password: hashedPassword,
    } as any);

    ok(res, {
      applicationId: `APP-${Date.now().toString().slice(-6)}`,
      schoolCode: school?.id || schoolCode,
      reviewTimeline: "24-48 Hours",
      emailConfirmation: principalEmail,
    });
  });

  router.post("/schools/approve", async (req, res) => {
    const { schoolCode } = req.body || {};
    const codeUpper = String(schoolCode || "").trim().toUpperCase();
    const school = await schoolStore.findById(codeUpper);
    if (!school) {
      return fail(res, 404, "School workspace not found.");
    }
    const updated = await schoolStore.update(codeUpper, { status: "Active" } as any);
    ok(res, { schoolCode: codeUpper, school: updated });
  });

  router.post("/schools/login", async (req, res) => {
    const { schoolCode, role, username, password } = req.body || {};
    const codeUpper = String(schoolCode || "").trim().toUpperCase();
    const school = await schoolStore.findById(codeUpper);
    if (!school && role !== "SUPER_ADMIN") {
      return fail(res, 404, "School workspace session expired or code is invalid.");
    }

    const input = String(username || "").trim().toLowerCase();

    if (role === "SUPER_ADMIN") {
      const user = (await userStore.list()).find((entry: any) => entry.role === "SUPER_ADMIN" && entry.username?.toLowerCase() === input);
      if (!user) return fail(res, 401, "Invalid platform credentials. Use superadmin@vidyasetu.com");
      const valid = user.password ? await bcrypt.compare(String(password || ""), String(user.password)) : false;
      if (!valid) return fail(res, 401, "Invalid platform credentials. Use superadmin@vidyasetu.com");
      return ok(res, {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          schoolCode: user.schoolCode,
        },
      });
    }

    const user = (await userStore.list()).find((entry: any) => entry.schoolCode === codeUpper && entry.role === role && entry.username?.toLowerCase() === input);
    if (!user) return fail(res, 401, "Authentication rejected.");

    const valid = user.password ? await bcrypt.compare(String(password || ""), String(user.password)) : false;
    if (!valid) return fail(res, 401, "Authentication rejected.");

    if (school && school.status !== "Active") {
      return fail(res, 401, "This school workspace is currently inactive or pending approval.");
    }

    return ok(res, {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        schoolCode: user.schoolCode,
        associatedStudentId: user.associatedStudentId,
      },
    });
  });

  router.get("/announcements", async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    const notices = role === "SUPER_ADMIN" ? await noticeStore.list() : await noticeStore.list({ schoolCode });
    ok(res, { notices });
  });

  router.post("/announcements", async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    const { title, body, category, isGlobal } = req.body || {};
    if (!["ADMIN", "TEACHER", "SUPER_ADMIN"].includes(role)) {
      return fail(res, 403, "Unauthorized: Insufficient publishing privileges.");
    }

    const notice = await noticeStore.create({
      id: `not-${Date.now()}`,
      title,
      category: category || "Circular",
      date: new Date().toISOString().split("T")[0],
      content: body,
      acknowledged: false,
      schoolCode: role === "SUPER_ADMIN" && isGlobal ? "GLOBAL" : schoolCode,
    } as any);

    emitCrudUpdate(io, "announcement:new", notice);
    return ok(res, { notices: await noticeStore.list({ schoolCode }) });
  });

  router.get("/activity-logs", async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    const logs = await reportStore.list(role === "SUPER_ADMIN" ? {} : { schoolCode });
    ok(res, { logs });
  });

  router.post("/logs/add", async (req, res) => {
    const { role, schoolCode } = resolveContext(req as any);
    const { studentId, type, data } = req.body || {};
    if (!["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return fail(res, 403, "Unauthorized: Insufficient academic edit rights.");
    }

    const student = await studentStore.findById(studentId);
    if (!student) return fail(res, 404, "Student not found");

    const todayStr = new Date().toISOString().split("T")[0];
    let updatedStudent = student as any;

    if (type === "MOOD") {
      updatedStudent = {
        ...updatedStudent,
        wellbeing: {
          ...(updatedStudent.wellbeing || {}),
          moodHistory: [...(updatedStudent.wellbeing?.moodHistory || []), { date: todayStr, rating: Number(data?.rating || 3), notes: data?.notes }],
        },
      };
    } else if (type === "ATTENDANCE") {
      updatedStudent = {
        ...updatedStudent,
        attendance: {
          ...(updatedStudent.attendance || {}),
          totalDays: Number(updatedStudent.attendance?.totalDays || 0) + 1,
          presentDays: Number(updatedStudent.attendance?.presentDays || 0) + (data?.status === "Present" || data?.status === "Late" ? 1 : 0),
          history: [...(updatedStudent.attendance?.history || []), { date: todayStr, status: data?.status || "Present" }],
        },
      };
    } else if (type === "GRADE") {
      const subjectName = data?.subjectName || data?.subject || "General";
      const subjectIndex = (updatedStudent.academics?.subjects || []).findIndex((subject: any) => subject.name === subjectName);
      const nextSubjects = [...(updatedStudent.academics?.subjects || [])];
      const gradeEntry = { assessment: data?.assessment || "Assessment", score: Number(data?.score || 0), maxScore: Number(data?.maxScore || 100), date: todayStr };
      if (subjectIndex >= 0) {
        nextSubjects[subjectIndex] = { ...nextSubjects[subjectIndex], grades: [...(nextSubjects[subjectIndex].grades || []), gradeEntry] };
      } else {
        nextSubjects.push({ name: subjectName, grades: [gradeEntry] });
      }
      updatedStudent = {
        ...updatedStudent,
        academics: { ...(updatedStudent.academics || {}), subjects: nextSubjects },
      };
    }

    await studentStore.update(studentId, updatedStudent);
    const log = await reportStore.create({
      id: `act-${Date.now()}`,
      type,
      title: `${type} recorded`,
      description: `${student.name} updated by ${role}`,
      timestamp: new Date().toISOString(),
      actor: role,
      schoolCode,
    } as any);
    emitCrudUpdate(io, "activity:new", log);
    emitCrudUpdate(io, "db:updated", { studentId });
    return ok(res, { success: true });
  });

  router.get("/chats/:room", async (req, res) => {
    const { schoolCode } = resolveContext(req as any);
    const room = getTenantRoom(req.params.room, schoolCode);
    const messages = await messageStore.list({ room });
    ok(res, { messages });
  });

  router.post("/chats/:room", async (req, res) => {
    const { schoolCode } = resolveContext(req as any);
    const room = getTenantRoom(req.params.room, schoolCode);
    const message = await messageStore.create({
      id: `msg-${Date.now()}`,
      room,
      sender: req.body?.sender,
      senderRole: req.body?.senderRole,
      text: req.body?.text,
      timestamp: new Date().toISOString(),
      read: false,
      schoolCode,
      attachment: req.body?.attachment,
    } as any);
    io.to(room).emit("chat:message", message);
    emitCrudUpdate(io, "db:updated", { room });
    ok(res, { message });
  });

  router.get("/safety", async (req, res) => {
    const { schoolCode } = resolveContext(req as any);
    ok(res, { state: { isLocked: false, type: "None", reason: null, triggeredBy: null, timestamp: null }, logs: [] });
  });

  router.get("/super/schools", async (req, res) => {
    const { role } = resolveContext(req as any);
    if (role !== "SUPER_ADMIN") return fail(res, 403, "Access Denied: Super Admin console restricted.");
    ok(res, { schools: await schoolStore.list() });
  });

  router.post("/super/schools/create", async (req, res) => {
    const { role } = resolveContext(req as any);
    if (role !== "SUPER_ADMIN") return fail(res, 403, "Access Denied: Super Admin console restricted.");
    const school = await schoolStore.create({
      id: String(req.body?.id || `SCH-${Date.now()}`).trim().toUpperCase(),
      name: req.body?.name,
      registeredAt: new Date().toISOString().split("T")[0],
      status: "Active",
      adminEmail: req.body?.adminEmail,
    } as any);
    ok(res, { schools: await schoolStore.list(), school });
  });

  router.post("/super/schools/status", async (req, res) => {
    const { role } = resolveContext(req as any);
    if (role !== "SUPER_ADMIN") return fail(res, 403, "Access Denied: Super Admin console restricted.");
    const updated = await schoolStore.update(String(req.body?.schoolId || "").toUpperCase(), { status: req.body?.status } as any);
    if (!updated) return fail(res, 404, "School workspace not found.");
    ok(res, { schools: await schoolStore.list(), school: updated });
  });

  router.get("/super/tickets", async (req, res) => {
    const { role } = resolveContext(req as any);
    if (role !== "SUPER_ADMIN") return fail(res, 403, "Access Denied.");
    ok(res, { tickets: await ticketStore.list() });
  });

  router.post("/super/tickets/reply", async (req, res) => {
    const { role } = resolveContext(req as any);
    if (role !== "SUPER_ADMIN") return fail(res, 403, "Access Denied.");
    const updated = await ticketStore.update(String(req.body?.ticketId), { reply: req.body?.reply, status: "Resolved" } as any);
    if (!updated) return fail(res, 404, "Ticket not found.");
    ok(res, { tickets: await ticketStore.list(), ticket: updated });
  });

  router.get("/super/analytics", async (req, res) => {
    const { role } = resolveContext(req as any);
    if (role !== "SUPER_ADMIN") return fail(res, 403, "Access Denied.");
    const students = await studentStore.list();
    const schools = await schoolStore.list();
    ok(res, {
      analytics: {
        cpuUsage: 18,
        memoryUsage: 72,
        activeSockets: io.engine.clientsCount,
        storageUsed: "Connected",
        storageLimit: "Atlas",
        totalSchools: schools.length,
        activeSchools: schools.filter((school: any) => school.status === "Active").length,
        pendingSchools: schools.filter((school: any) => school.status === "Pending").length,
        totalStudents: students.length,
        totalNotices: (await noticeStore.list()).length,
      },
    });
  });

  router.post("/login", async (req, res) => {
    const { username, password } = req.body || {};
    const user = (await userStore.list()).find((entry: any) => entry.username?.toLowerCase() === String(username || "").toLowerCase());
    if (!user) return fail(res, 401, "Invalid credentials");

    const passwordHash = user.password || user.passwordHash || "";
    const valid = passwordHash ? await bcrypt.compare(String(password || ""), passwordHash) : false;
    if (!valid) return fail(res, 401, "Invalid credentials");

    const token = signAuthToken({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      schoolCode: user.schoolCode,
      associatedStudentId: user.associatedStudentId,
    });

    ok(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        schoolCode: user.schoolCode,
        associatedStudentId: user.associatedStudentId,
      },
    });
  });

  router.post("/logout", (_req, res) => ok(res, { message: "Logged out" }));

  registerCrudRoutes("/students", studentStore);
  registerCrudRoutes("/teachers", teacherStore);
  registerCrudRoutes("/parents", parentStore);
  registerCrudRoutes("/attendance", attendanceStore);
  registerCrudRoutes("/marks", markStore);
  registerCrudRoutes("/homework", homeworkStore);
  registerCrudRoutes("/assignments", assignmentStore);
  registerCrudRoutes("/notices", noticeStore);
  registerCrudRoutes("/messages", messageStore);
  registerCrudRoutes("/notifications", notificationStore);
  registerCrudRoutes("/moodLogs", moodLogStore);
  registerCrudRoutes("/reports", reportStore);
  registerCrudRoutes("/aiReports", aiReportStore);
  registerCrudRoutes("/gatePass", gatePassStore);
  registerCrudRoutes("/busTracking", busTrackingStore);
  registerCrudRoutes("/schools", schoolStore);
  registerCrudRoutes("/tickets", ticketStore);

  router.get("/ai/report/:studentId", async (req, res) => {
    const student = await studentStore.findById(req.params.studentId);
    if (!student) return fail(res, 404, "Student not found");
    const report = await buildStudentInsight(student);
    ok(res, { report });
  });

  router.post("/ai/predict", async (req, res) => {
    const student = req.body?.studentId ? await studentStore.findById(req.body.studentId) : req.body?.student;
    if (!student) return fail(res, 404, "Student not found");
    const prediction = await buildStudentInsight(student);
    ok(res, { prediction });
  });

  router.post("/ai/chat", async (req, res) => {
    const student = req.body?.studentId ? await studentStore.findById(req.body.studentId) : req.body?.student;
    if (!student) return fail(res, 404, "Student not found");
    const text = await buildAiChatReply(req.body?.messages || [], student);
    ok(res, { text });
  });

  router.get("/reports/summary", async (_req, res) => {
    const students = await studentStore.list();
    ok(res, {
      summary: {
        totalStudents: students.length,
        totalTeachers: (await teacherStore.list()).length,
        totalParents: (await parentStore.list()).length,
        totalNotices: (await noticeStore.list()).length,
      },
    });
  });
}
