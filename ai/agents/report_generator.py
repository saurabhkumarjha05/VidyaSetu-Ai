# ai/agents/report_generator.py

class ReportGenerator:
    def __init__(self):
        pass

    def generate_report(self, student_name: str, class_name: str, section: str, 
                        predictions: dict, analytics: dict, gemini_explanations: dict) -> dict:
        """
        Compiles structural HTML and plain text report copies containing performance models
        and AI coordinator insights.
        """
        pred_perf = predictions.get("predicted_performance", 0.0)
        needs_inter = predictions.get("needs_intervention", 0)
        risk_str = "⚠️ High Attention Risk" if needs_inter == 1 else "✅ Low Risk / On Track"
        risk_class = "priority-high" if needs_inter == 1 else "priority-low"
        
        grade = analytics.get("grade", "C")
        strong_sub = analytics.get("subject_analysis", {}).get("strong_subject", "N/A")
        weak_sub = analytics.get("subject_analysis", {}).get("weak_subject", "N/A")
        
        findings_html = "".join([f"<li>{f}</li>" for f in analytics.get("strengths", []) + analytics.get("weaknesses", [])])
        
        recs = analytics.get("recommendations", [])
        recs_html = ""
        for r in recs:
            rec_priority_class = "priority-high" if r["priority"] == "High" else "priority-medium" if r["priority"] == "Medium" else "priority-low"
            recs_html += f"""
            <div class="report-item {rec_priority_class}" style="padding: 0.5rem; margin-bottom: 0.5rem;">
                <strong>[{r['category']} - {r['priority']} Priority] {r['action']}</strong>: {r['description']}
            </div>
            """
            
        gemini_summary = gemini_explanations.get("prediction_summary", "No AI text generated.")
        
        # 1. HTML representation
        html_report = f"""
        <div class="report-container" style="font-family: inherit; color: #1a1a2e;">
            <div class="report-section">
                <div class="report-title">Academic & Pedagogical Growth Report</div>
                <p>Student: <strong>{student_name}</strong> | Class: <strong>{class_name}-{section}</strong></p>
                <div class="{risk_class}" style="padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0;">
                    <strong>Intervention Index: {risk_str}</strong> (Model Confidence: {predictions.get('prediction_confidence', 1.0)*100:.1f}%)
                </div>
            </div>
            
            <div class="report-section">
                <div class="report-subtitle">📊 Performance Metrics</div>
                <p>Predicted Performance Average: <strong>{pred_perf:.1f}%</strong> (Term Grade: <strong>{grade}</strong>)</p>
                <p>Strong Subject: <span style="color: #28a745; font-weight: bold;">{strong_sub}</span> | Improvement Focus: <span style="color: #dc3545; font-weight: bold;">{weak_sub}</span></p>
            </div>
            
            <div class="report-section">
                <div class="report-subtitle">🤖 AI Strategic Explanation</div>
                <div class="ai-explanation">
                    <p>{gemini_summary}</p>
                </div>
            </div>
            
            <div class="report-section">
                <div class="report-subtitle">🔍 Core Observations & Findings</div>
                <ul style="padding-left: 20px;">
                    {findings_html}
                </ul>
            </div>
            
            <div class="report-section" style="border-bottom: none;">
                <div class="report-subtitle">📋 Actionable Policy Recommendations</div>
                {recs_html}
            </div>
        </div>
        """
        
        # 2. Plain Text representation
        text_report = f"""
ACADEMIC & PEDAGOGICAL GROWTH REPORT
====================================
Student Name: {student_name}
Class & Section: Class {class_name} - {section}
Predicted Performance: {pred_perf:.1f}%
Estimated Term Grade: {grade}

RISK EVALUATION
---------------
Intervention Quotient: {risk_str}
Model Confidence: {predictions.get('prediction_confidence', 1.0)*100:.1f}%
Strongest Area: {strong_sub}
Improvement Area: {weak_sub}

AI DIAGNOSTIC HIGHLIGHTS
------------------------
{gemini_summary}

KEY FINDINGS
------------
"""
        for s in analytics.get("strengths", []):
            text_report += f"- Strength: {s}\n"
        for w in analytics.get("weaknesses", []):
            text_report += f"- Improvement Area: {w}\n"
            
        text_report += "\nRECOMMENDATIONS & INTERVENTIONS\n--------------------------------\n"
        for r in recs:
            text_report += f"- [{r['priority']} Priority] {r['action']}: {r['description']}\n"
            
        return {
            "html": html_report,
            "full_text": text_report.strip()
        }
