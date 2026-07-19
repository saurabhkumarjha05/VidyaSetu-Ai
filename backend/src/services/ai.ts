import { GoogleGenAI, Type } from "@google/genai";

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
const ai = hasGeminiKey
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    })
  : null;

function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function analyzeStudent(student: any) {
  const attendanceRate = student?.attendance?.totalDays
    ? (student.attendance.presentDays / student.attendance.totalDays) * 100
    : 100;

  const subjectAverages = (student?.academics?.subjects || []).map((subject: any) => {
    const totalScore = (subject.grades || []).reduce((sum: number, grade: any) => sum + safeNumber(grade.score), 0);
    const totalMax = (subject.grades || []).reduce((sum: number, grade: any) => sum + Math.max(safeNumber(grade.maxScore, 1), 1), 0);
    return totalMax ? (totalScore / totalMax) * 100 : 0;
  });

  const academicAverage = subjectAverages.length
    ? subjectAverages.reduce((sum: number, value: number) => sum + value, 0) / subjectAverages.length
    : 75;

  const moodRatings = (student?.wellbeing?.moodHistory || []).map((entry: any) => safeNumber(entry.rating, 3));
  const wellbeingIndex = moodRatings.length
    ? moodRatings.reduce((sum: number, value: number) => sum + value, 0) / moodRatings.length
    : 3;

  const riskScore = (100 - attendanceRate) * 0.35 + (100 - academicAverage) * 0.45 + (5 - wellbeingIndex) * 12;
  const riskLevel = riskScore >= 55 ? "High" : riskScore >= 28 ? "Medium" : "Low";

  return {
    attendanceRate: Number(attendanceRate.toFixed(1)),
    academicAverage: Number(academicAverage.toFixed(1)),
    wellbeingIndex: Number(wellbeingIndex.toFixed(1)),
    riskLevel,
  };
}

async function tryGemini(prompt: string) {
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedHomework: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["category", "riskLevel", "summary", "keyFindings", "recommendations", "recommendedHomework"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function buildStudentInsight(student: any) {
  const stats = analyzeStudent(student);
  const prompt = `
    You are an AI student success engine.
    Analyze this student and return JSON with category, riskLevel, summary, keyFindings, recommendations, recommendedHomework.
    Student: ${student?.name || "Unknown"}
    Class: ${student?.class || "Unknown"}
    Attendance: ${stats.attendanceRate}%
    Academic Average: ${stats.academicAverage}%
    Wellbeing Index: ${stats.wellbeingIndex}/5
    Risk hint: ${stats.riskLevel}
  `;

  try {
    const geminiInsight = await tryGemini(prompt);
    if (geminiInsight?.summary) {
      return {
        ...geminiInsight,
        studentId: student?.id,
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // fall through to deterministic response
  }

  return {
    studentId: student?.id,
    category: "General",
    riskLevel: stats.riskLevel,
    summary: `${student?.name || "This student"} shows ${stats.riskLevel.toLowerCase()} risk based on attendance, marks, and wellbeing indicators.`,
    keyFindings: [
      `Attendance rate is ${stats.attendanceRate}%`,
      `Academic average is ${stats.academicAverage}%`,
      `Wellbeing index is ${stats.wellbeingIndex}/5`,
    ],
    recommendations: [
      "Add structured practice sessions for weak topics.",
      "Send a progress update to parents.",
      "Track mood and attendance weekly.",
    ],
    recommendedHomework: [
      "Revision worksheet for the weakest subject",
      "Short daily practice quiz",
      "One reflective learning journal entry",
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function buildAiChatReply(messages: Array<{ role: string; text: string }>, student: any) {
  const stats = analyzeStudent(student);
  const latestMessage = messages[messages.length - 1]?.text || "";

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map((message) => ({
          role: message.role === "user" ? "user" : "model",
          parts: [{ text: message.text }],
        })),
        config: {
          temperature: 0.7,
          systemInstruction: `You are Vidya Assistant. Student context: attendance ${stats.attendanceRate}%, academic average ${stats.academicAverage}%, wellbeing ${stats.wellbeingIndex}/5. Keep replies under 100 words.`,
        },
      });

      return response.text || "I am here to help you stay on track.";
    } catch {
      // deterministic fallback below
    }
  }

  return `Thanks for your message. Based on current data, focus on attendance consistency, one weak subject, and a short daily study plan. ${latestMessage ? `You mentioned: ${latestMessage.slice(0, 80)}.` : ""}`;
}
