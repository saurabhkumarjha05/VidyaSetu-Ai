import { Student } from "../types";

export const initialStudents: Student[] = [
  {
    id: "std-01",
    name: "Aarav Sharma",
    rollNumber: "9A-01",
    class: "Grade 9-A",
    schoolCode: "VIDYA-99",
    attendance: {
      totalDays: 45,
      presentDays: 43,
      history: [
        { date: "2026-07-01", status: "Present" },
        { date: "2026-07-02", status: "Present" },
        { date: "2026-07-03", status: "Present" },
        { date: "2026-07-06", status: "Present" },
        { date: "2026-07-07", status: "Present" },
        { date: "2026-07-08", status: "Present" },
        { date: "2026-07-09", status: "Present" },
        { date: "2026-07-10", status: "Present" },
      ],
    },
    academics: {
      subjects: [
        {
          name: "Mathematics",
          grades: [
            { assessment: "Unit Test 1", score: 95, maxScore: 100, date: "2026-06-15" },
            { assessment: "Quarterly Exam", score: 98, maxScore: 100, date: "2026-07-02" },
          ],
        },
        {
          name: "Science",
          grades: [
            { assessment: "Unit Test 1", score: 92, maxScore: 100, date: "2026-06-16" },
            { assessment: "Quarterly Exam", score: 94, maxScore: 100, date: "2026-07-03" },
          ],
        },
        {
          name: "English",
          grades: [
            { assessment: "Unit Test 1", score: 88, maxScore: 100, date: "2026-06-18" },
            { assessment: "Quarterly Exam", score: 90, maxScore: 100, date: "2026-07-04" },
          ],
        },
      ],
    },
    wellbeing: {
      moodHistory: [
        { date: "2026-07-06", rating: 4, notes: "Feeling energetic today." },
        { date: "2026-07-07", rating: 3, notes: "A bit tired from exam preparation." },
        { date: "2026-07-08", rating: 2, notes: "Very stressed about upcoming science project presentation." },
        { date: "2026-07-09", rating: 2, notes: "Overwhelmed. Slept only 4 hours." },
        { date: "2026-07-10", rating: 3, notes: "Slightly better after presenting." },
      ],
      observations: [
        {
          date: "2026-07-08",
          category: "Behavior",
          content: "Aarav seemed highly anxious during class. He was fidgeting and refused to speak up when asked.",
          teacherId: "t-01",
          sentiment: "Negative",
        },
        {
          date: "2026-07-09",
          category: "Academic Stress",
          content: "Spoke to Aarav about his Science performance. He expressed immense pressure from home to score 100%. Needs counseling support.",
          teacherId: "t-01",
          sentiment: "Negative",
        },
      ],
    },
    homework: [
      { id: "hw-01", title: "Algebraic Identities", subject: "Mathematics", dueDate: "2026-07-05", status: "Completed", score: 10 },
      { id: "hw-02", title: "Newton's Laws Lab", subject: "Science", dueDate: "2026-07-08", status: "Completed", score: 10 },
      { id: "hw-03", title: "Grammar & Verbs", subject: "English", dueDate: "2026-07-12", status: "Pending" },
    ],
  },
  {
    id: "std-02",
    name: "Priya Patel",
    rollNumber: "9A-02",
    class: "Grade 9-A",
    schoolCode: "VIDYA-99",
    attendance: {
      totalDays: 45,
      presentDays: 44,
      history: [
        { date: "2026-07-01", status: "Present" },
        { date: "2026-07-02", status: "Present" },
        { date: "2026-07-03", status: "Present" },
        { date: "2026-07-06", status: "Present" },
        { date: "2026-07-07", status: "Present" },
        { date: "2026-07-08", status: "Present" },
        { date: "2026-07-09", status: "Present" },
        { date: "2026-07-10", status: "Present" },
      ],
    },
    academics: {
      subjects: [
        {
          name: "Mathematics",
          grades: [
            { assessment: "Unit Test 1", score: 58, maxScore: 100, date: "2026-06-15" },
            { assessment: "Quarterly Exam", score: 62, maxScore: 100, date: "2026-07-02" },
          ],
        },
        {
          name: "Science",
          grades: [
            { assessment: "Unit Test 1", score: 60, maxScore: 100, date: "2026-06-16" },
            { assessment: "Quarterly Exam", score: 65, maxScore: 100, date: "2026-07-03" },
          ],
        },
        {
          name: "English",
          grades: [
            { assessment: "Unit Test 1", score: 85, maxScore: 100, date: "2026-06-18" },
            { assessment: "Quarterly Exam", score: 88, maxScore: 100, date: "2026-07-04" },
          ],
        },
      ],
    },
    wellbeing: {
      moodHistory: [
        { date: "2026-07-06", rating: 4, notes: "Happy with english exam." },
        { date: "2026-07-07", rating: 5, notes: "Had fun working on a group presentation." },
        { date: "2026-07-08", rating: 4, notes: "Enjoyed music class." },
        { date: "2026-07-09", rating: 3, notes: "Struggling with math problem set, but feeling hopeful." },
        { date: "2026-07-10", rating: 4, notes: "Grateful for math teacher's extra time." },
      ],
      observations: [
        {
          date: "2026-07-07",
          category: "Engagement",
          content: "Priya is an exceptional peer-collaborator. She actively assisted other students during our English writing group.",
          teacherId: "t-01",
          sentiment: "Positive",
        },
        {
          date: "2026-07-10",
          category: "Effort",
          content: "Priya requested extra help after school for Calculus basics. She is highly motivated despite her academic struggles.",
          teacherId: "t-01",
          sentiment: "Positive",
        },
      ],
    },
    homework: [
      { id: "hw-01", title: "Algebraic Identities", subject: "Mathematics", dueDate: "2026-07-05", status: "Completed", score: 6 },
      { id: "hw-02", title: "Newton's Laws Lab", subject: "Science", dueDate: "2026-07-08", status: "Completed", score: 7 },
      { id: "hw-03", title: "Grammar & Verbs", subject: "English", dueDate: "2026-07-12", status: "Completed", score: 9 },
    ],
  },
  {
    id: "std-03",
    name: "Kabir Singh",
    rollNumber: "9A-03",
    class: "Grade 9-A",
    schoolCode: "VIDYA-99",
    attendance: {
      totalDays: 45,
      presentDays: 37,
      history: [
        { date: "2026-07-01", status: "Absent" },
        { date: "2026-07-02", status: "Present" },
        { date: "2026-07-03", status: "Present" },
        { date: "2026-07-06", status: "Absent" },
        { date: "2026-07-07", status: "Present" },
        { date: "2026-07-08", status: "Absent" },
        { date: "2026-07-09", status: "Present" },
        { date: "2026-07-10", status: "Absent" },
      ],
    },
    academics: {
      subjects: [
        {
          name: "Mathematics",
          grades: [
            { assessment: "Unit Test 1", score: 72, maxScore: 100, date: "2026-06-15" },
            { assessment: "Quarterly Exam", score: 55, maxScore: 100, date: "2026-07-02" },
          ],
        },
        {
          name: "Science",
          grades: [
            { assessment: "Unit Test 1", score: 75, maxScore: 100, date: "2026-06-16" },
            { assessment: "Quarterly Exam", score: 58, maxScore: 100, date: "2026-07-03" },
          ],
        },
        {
          name: "English",
          grades: [
            { assessment: "Unit Test 1", score: 80, maxScore: 100, date: "2026-06-18" },
            { assessment: "Quarterly Exam", score: 70, maxScore: 100, date: "2026-07-04" },
          ],
        },
      ],
    },
    wellbeing: {
      moodHistory: [
        { date: "2026-07-06", rating: 3, notes: "Tired." },
        { date: "2026-07-07", rating: 3, notes: "Not feeling well." },
        { date: "2026-07-08", rating: 2, notes: "Stayed home. Very demotivated." },
        { date: "2026-07-09", rating: 2, notes: "Felt detached from school today." },
        { date: "2026-07-10", rating: 1, notes: "Skipped classes, spent the day sleeping." },
      ],
      observations: [
        {
          date: "2026-07-02",
          category: "Attendance Alert",
          content: "Kabir missed the quarterly examinations setup. He came late and left his desk during recess.",
          teacherId: "t-01",
          sentiment: "Negative",
        },
        {
          date: "2026-07-09",
          category: "Apathy",
          content: "Kabir seems completely disengaged. He put his head down during Science and didn't open his textbook. High risk of academic failure.",
          teacherId: "t-01",
          sentiment: "Negative",
        },
      ],
    },
    homework: [
      { id: "hw-01", title: "Algebraic Identities", subject: "Mathematics", dueDate: "2026-07-05", status: "Late", score: 4 },
      { id: "hw-02", title: "Newton's Laws Lab", subject: "Science", dueDate: "2026-07-08", status: "Pending" },
      { id: "hw-03", title: "Grammar & Verbs", subject: "English", dueDate: "2026-07-12", status: "Pending" },
    ],
  },
  {
    id: "std-04",
    name: "Meera Sen",
    rollNumber: "9A-04",
    class: "Grade 9-A",
    schoolCode: "VIDYA-99",
    attendance: {
      totalDays: 45,
      presentDays: 45,
      history: [
        { date: "2026-07-01", status: "Present" },
        { date: "2026-07-02", status: "Present" },
        { date: "2026-07-03", status: "Present" },
        { date: "2026-07-06", status: "Present" },
        { date: "2026-07-07", status: "Present" },
        { date: "2026-07-08", status: "Present" },
        { date: "2026-07-09", status: "Present" },
        { date: "2026-07-10", status: "Present" },
      ],
    },
    academics: {
      subjects: [
        {
          name: "Mathematics",
          grades: [
            { assessment: "Unit Test 1", score: 85, maxScore: 100, date: "2026-06-15" },
            { assessment: "Quarterly Exam", score: 86, maxScore: 100, date: "2026-07-02" },
          ],
        },
        {
          name: "Science",
          grades: [
            { assessment: "Unit Test 1", score: 88, maxScore: 100, date: "2026-06-16" },
            { assessment: "Quarterly Exam", score: 90, maxScore: 100, date: "2026-07-03" },
          ],
        },
        {
          name: "English",
          grades: [
            { assessment: "Unit Test 1", score: 92, maxScore: 100, date: "2026-06-18" },
            { assessment: "Quarterly Exam", score: 91, maxScore: 100, date: "2026-07-04" },
          ],
        },
      ],
    },
    wellbeing: {
      moodHistory: [
        { date: "2026-07-06", rating: 5, notes: "Excited about school trip!" },
        { date: "2026-07-07", rating: 4, notes: "Good day." },
        { date: "2026-07-08", rating: 4, notes: "Quiet day, study was good." },
        { date: "2026-07-09", rating: 5, notes: "Spent time in library." },
        { date: "2026-07-10", rating: 5, notes: "Excited for the weekend." },
      ],
      observations: [
        {
          date: "2026-07-06",
          category: "Leadership",
          content: "Meera took charge of organizing the class decoration committee. Excellent initiative.",
          teacherId: "t-01",
          sentiment: "Positive",
        },
      ],
    },
    homework: [
      { id: "hw-01", title: "Algebraic Identities", subject: "Mathematics", dueDate: "2026-07-05", status: "Completed", score: 9 },
      { id: "hw-02", title: "Newton's Laws Lab", subject: "Science", dueDate: "2026-07-08", status: "Completed", score: 9 },
      { id: "hw-03", title: "Grammar & Verbs", subject: "English", dueDate: "2026-07-12", status: "Completed", score: 10 },
    ],
  },
  // Multi-Tenant School Tenant 2 (DPS-88) Students
  {
    id: "std-05",
    name: "Rohan Malhotra",
    rollNumber: "10B-01",
    class: "Grade 10-B",
    schoolCode: "DPS-88",
    attendance: {
      totalDays: 30,
      presentDays: 29,
      history: [
        { date: "2026-07-08", status: "Present" },
        { date: "2026-07-09", status: "Present" },
        { date: "2026-07-10", status: "Present" },
      ],
    },
    academics: {
      subjects: [
        {
          name: "Mathematics",
          grades: [
            { assessment: "Unit Test 1", score: 90, maxScore: 100, date: "2026-06-20" },
          ],
        },
        {
          name: "Science",
          grades: [
            { assessment: "Unit Test 1", score: 92, maxScore: 100, date: "2026-06-21" },
          ],
        },
      ],
    },
    wellbeing: {
      moodHistory: [
        { date: "2026-07-10", rating: 5, notes: "Great transition to new school!" },
      ],
      observations: [
        {
          date: "2026-07-10",
          category: "Adaptability",
          content: "Rohan has adjusted wonderfully. Highly responsive to feedback.",
          teacherId: "t-02",
          sentiment: "Positive",
        },
      ],
    },
    homework: [
      { id: "hw-201", title: "Quadratic Equations", subject: "Mathematics", dueDate: "2026-07-15", status: "Pending" },
    ],
  },
  {
    id: "std-06",
    name: "Sanya Roy",
    rollNumber: "10B-02",
    class: "Grade 10-B",
    schoolCode: "DPS-88",
    attendance: {
      totalDays: 30,
      presentDays: 28,
      history: [
        { date: "2026-07-08", status: "Present" },
        { date: "2026-07-09", status: "Absent" },
        { date: "2026-07-10", status: "Present" },
      ],
    },
    academics: {
      subjects: [
        {
          name: "Mathematics",
          grades: [
            { assessment: "Unit Test 1", score: 78, maxScore: 100, date: "2026-06-20" },
          ],
        },
        {
          name: "Science",
          grades: [
            { assessment: "Unit Test 1", score: 80, maxScore: 100, date: "2026-06-21" },
          ],
        },
      ],
    },
    wellbeing: {
      moodHistory: [
        { date: "2026-07-10", rating: 4, notes: "Feeling well." },
      ],
      observations: [],
    },
    homework: [
      { id: "hw-201", title: "Quadratic Equations", subject: "Mathematics", dueDate: "2026-07-15", status: "Completed", score: 8 },
    ],
  }
];
