# ai/agents/analytics_agent.py

class AnalyticsAgent:
    def __init__(self):
        pass

    def calculate_metrics(self, features: dict, subject_marks: dict) -> dict:
        """
        Calculates analytical indices, grades, subject comparisons, strengths, weaknesses,
        and priority recommendations from student indicators.
        """
        # Feature extractions with clean types
        attendance = float(features.get('Attendance_Percentage', features.get('attendance_percentage', 75.0)))
        homework = float(features.get('Homework_Completion', features.get('homework_completion', 70.0)))
        assignments = float(features.get('Assignments_Average', features.get('assignments_average', 70.0)))
        quizzes = float(features.get('Quiz_Average', features.get('quiz_average', 65.0)))
        previous_gpa = float(features.get('Previous_GPA', features.get('previous_gpa', 6.0)))
        participation = float(features.get('Participation_Score', features.get('participation_score', 60.0)))
        teacher_rating = float(features.get('Teacher_Rating', features.get('teacher_rating', 3.0)))
        late_submissions = int(features.get('Late_Submissions', features.get('late_submissions', 0)))

        # Find strong and weak subjects
        strong_subject = "N/A"
        weak_subject = "N/A"
        if subject_marks:
            sorted_subs = sorted(subject_marks.items(), key=lambda x: x[1], reverse=True)
            strong_subject = sorted_subs[0][0]
            weak_subject = sorted_subs[-1][0]

        # Calculate overall academic score average
        if subject_marks:
            academic_avg = sum(subject_marks.values()) / len(subject_marks)
        else:
            academic_avg = (assignments + quizzes) / 2.0

        # Assign Grade
        if academic_avg >= 90:
            grade = "A+"
        elif academic_avg >= 80:
            grade = "A"
        elif academic_avg >= 70:
            grade = "B"
        elif academic_avg >= 60:
            grade = "C"
        elif academic_avg >= 50:
            grade = "D"
        else:
            grade = "F"

        # Determine Attendance Status
        if attendance >= 90:
            att_status = "Excellent"
            att_color = "success"
            att_desc = "Consistently attends classes. Roster compliant."
        elif attendance >= 75:
            att_status = "Good"
            att_color = "warning"
            att_desc = "Satisfactory attendance, but should minimize absences."
        else:
            att_status = "Critical"
            att_color = "danger"
            att_desc = "Urgent: Attendance has fallen below compliance levels."

        # Determine Homework Status
        if homework >= 85:
            hw_status = "Consistent"
            hw_color = "success"
            hw_desc = "Submits assignments on time. High work ethics."
        elif homework >= 70:
            hw_status = "Satisfactory"
            hw_color = "warning"
            hw_desc = "Moderate consistency. Misses occasional worksheets."
        else:
            hw_status = "Needs Rework"
            hw_color = "danger"
            hw_desc = "High gap: Homework compliance is dangerously low."

        # Determine Participation Status
        if participation >= 80:
            part_status = "Highly Engaged"
            part_color = "success"
            part_desc = "Active contributor in classroom discussions."
        elif participation >= 60:
            part_status = "Active"
            part_color = "warning"
            part_desc = "Participates when called upon. Solid interaction."
        else:
            part_status = "Passive"
            part_color = "danger"
            part_desc = "Reserved or distracted. Needs engagement push."

        # Identify strengths
        strengths = []
        if attendance >= 90:
            strengths.append("High attendance and punctuality records.")
        if participation >= 80:
            strengths.append(f"Highly engaged during classes (Score: {participation}%).")
        if subject_marks and strong_subject != "N/A":
            strengths.append(f"Outstanding performance in {strong_subject}.")
        if homework >= 85:
            strengths.append("Exceptional consistency in homework uploads.")
            
        if not strengths:
            strengths.append("Maintains basic classroom codes and respect guidelines.")

        # Identify weaknesses
        weaknesses = []
        if attendance < 75:
            weaknesses.append("Frequent absences leading to instruction gaps.")
        if homework < 70:
            weaknesses.append("Low homework completion rates impacting practice.")
        if late_submissions > 3:
            weaknesses.append(f"High number of late submissions ({late_submissions} counts).")
        if subject_marks and weak_subject != "N/A" and subject_marks[weak_subject] < 60:
            weaknesses.append(f"Struggles with foundational elements of {weak_subject}.")
            
        if not weaknesses:
            weaknesses.append("No critical weaknesses detected in standard parameters.")

        # Generate structural recommendations
        recommendations = []
        if attendance < 75:
            recommendations.append({
                "category": "Attendance",
                "action": "PTM Attendance Consultation",
                "description": "Trigger an immediate counselor-led discussion with the parent to address missing days.",
                "priority": "High"
            })
        if homework < 70:
            recommendations.append({
                "category": "Homework",
                "action": "Homework Intervention Plan",
                "description": "Establish a daily study checklist and assign homework support sessions.",
                "priority": "High"
            })
        if weak_subject != "N/A" and subject_marks.get(weak_subject, 100) < 65:
            recommendations.append({
                "category": "Academics",
                "action": f"Remedial {weak_subject} Coaching",
                "description": f"Schedule targeted remedial slots for {weak_subject} to improve core understanding.",
                "priority": "High" if subject_marks[weak_subject] < 50 else "Medium"
            })
        if participation < 60:
            recommendations.append({
                "category": "Behavior",
                "action": "Engagement Support Plan",
                "description": "Use interactive polling, questioning, and group work to improve active class participation.",
                "priority": "Medium"
            })
        
        # Default baseline recommendations
        if not recommendations:
            recommendations.append({
                "category": "Academics",
                "action": "Advanced Concept Exploration",
                "description": "Maintain steady performance and assign challenging projects for talent expansion.",
                "priority": "Low"
            })

        return {
            "grade": grade,
            "subject_analysis": {
                "strong_subject": strong_subject,
                "weak_subject": weak_subject
            },
            "attendance_status": {
                "percentage": attendance,
                "status": att_status,
                "color": att_color,
                "description": att_desc
            },
            "homework_status": {
                "percentage": homework,
                "status": hw_status,
                "color": hw_color,
                "description": hw_desc
            },
            "participation_status": {
                "score": participation,
                "status": part_status,
                "color": part_color,
                "description": part_desc
            },
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations
        }
