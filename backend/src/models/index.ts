import mongoose, { Schema } from "mongoose";

const flexibleSchema = new Schema({}, { strict: false, timestamps: true });

function createFlexibleModel(modelName: string, collectionName: string) {
  return mongoose.models[modelName] || mongoose.model(modelName, flexibleSchema, collectionName);
}

export const UserModel = createFlexibleModel("BackendUser", "users");
export const StudentModel = createFlexibleModel("BackendStudent", "students");
export const ParentModel = createFlexibleModel("BackendParent", "parents");
export const TeacherModel = createFlexibleModel("BackendTeacher", "teachers");
export const AttendanceModel = createFlexibleModel("BackendAttendance", "attendance");
export const MarkModel = createFlexibleModel("BackendMark", "marks");
export const HomeworkModel = createFlexibleModel("BackendHomework", "homework");
export const AssignmentModel = createFlexibleModel("BackendAssignment", "assignments");
export const NoticeModel = createFlexibleModel("BackendNotice", "notices");
export const MessageModel = createFlexibleModel("BackendMessage", "messages");
export const NotificationModel = createFlexibleModel("BackendNotification", "notifications");
export const MoodLogModel = createFlexibleModel("BackendMoodLog", "moodLogs");
export const ReportModel = createFlexibleModel("BackendReport", "reports");
export const AiReportModel = createFlexibleModel("BackendAiReport", "aiReports");
export const GatePassModel = createFlexibleModel("BackendGatePass", "gatePass");
export const BusTrackingModel = createFlexibleModel("BackendBusTracking", "busTracking");
export const SchoolModel = createFlexibleModel("BackendSchool", "schools");
export const TicketModel = createFlexibleModel("BackendTicket", "tickets");
