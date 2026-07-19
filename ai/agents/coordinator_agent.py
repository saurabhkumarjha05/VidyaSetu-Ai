# ai/agents/coordinator_agent.py
import os
import json
from agents.prediction_agent import PredictionAgent
from agents.gemini_agent import GeminiAgent
from agents.analytics_agent import AnalyticsAgent
from agents.report_generator import ReportGenerator

class CoordinatorAgent:
    def __init__(self, model_paths: dict, api_key: str = None):
        self.prediction_agent = PredictionAgent(model_paths)
        self.gemini_agent = GeminiAgent(api_key)
        self.analytics_agent = AnalyticsAgent()
        self.report_generator = ReportGenerator()

    def process_student_data(self, student_name: str, class_name: str, section: str, 
                             features: dict, subject_marks: dict) -> dict:
        """
        Orchestrates predictions, analytics compilation, Gemini reasoning models generation,
        and pedagogical reports publishing.
        """
        # 1. Run Machine Learning predictions
        predictions = self.prediction_agent.predict(features)
        
        # 2. Run deterministic analytics
        analytics = self.analytics_agent.calculate_metrics(features, subject_marks)
        
        # 3. Generate Gemini explanations & insights
        pred_perf = predictions.get("predicted_performance", 0.0)
        needs_inter = predictions.get("needs_intervention", 0)
        risk_str = "High Attention Risk" if needs_inter == 1 else "Low Risk / On Track"
        
        # Format a single unified prompt to request detailed explanations from Gemini
        prompt = f"""
        Analyze this student's pedagogical performance:
        - Student Name: {student_name}
        - Class: {class_name}-{section}
        - Attendance: {analytics['attendance_status']['percentage']}% ({analytics['attendance_status']['status']})
        - Homework Completion: {analytics['homework_status']['percentage']}% ({analytics['homework_status']['status']})
        - Participation Score: {analytics['participation_status']['score']}% ({analytics['participation_status']['status']})
        - Predicted Performance: {pred_perf:.1f}%
        - Term Grade: {analytics['grade']}
        - Intervention Quotient: {risk_str}
        - Weakest Subject: {analytics['subject_analysis']['weak_subject']}
        - Strongest Subject: {analytics['subject_analysis']['strong_subject']}
        
        Please provide:
        1. A prediction summary paragraph (approx 60-80 words).
        2. A decision explanation clarifying why they need intervention or are on track (approx 50 words).
        3. A brief analysis of their strengths (approx 30 words).
        4. A brief analysis of their areas for improvement (approx 30 words).
        
        Your output must be in JSON format matching this schema:
        {{
            "prediction_summary": "string",
            "intervention_explanation": "string",
            "strengths_analysis": "string",
            "weaknesses_analysis": "string"
        }}
        """
        
        gemini_explanations = {
            "prediction_summary": f"The student {student_name} is predicted to achieve an overall academic performance of {pred_perf:.1f}% with a term grade of {analytics['grade']}. They are currently classified as {risk_str}.",
            "intervention_explanation": f"Based on current classroom metrics, {student_name} is classified as {risk_str} with {predictions.get('prediction_confidence', 1.0)*100:.1f}% confidence.",
            "strengths_analysis": f"Main strengths include consistent performance in {analytics['subject_analysis']['strong_subject']}.",
            "weaknesses_analysis": f"Improvement should be focused on {analytics['subject_analysis']['weak_subject']} and late homework submissions."
        }
        
        try:
            # We can use types.Schema or a dict schema for Gemini 2.5 response schema configuration
            from google.genai import types
            json_schema = types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "prediction_summary": types.Schema(type=types.Type.STRING),
                    "intervention_explanation": types.Schema(type=types.Type.STRING),
                    "strengths_analysis": types.Schema(type=types.Type.STRING),
                    "weaknesses_analysis": types.Schema(type=types.Type.STRING),
                },
                required=["prediction_summary", "intervention_explanation", "strengths_analysis", "weaknesses_analysis"]
            )
            
            response = self.gemini_agent.generate_content(
                contents=prompt,
                model="gemini-2.5-flash",
                json_schema=json_schema,
                temperature=0.7
            )
            
            # Parse response
            if response.text:
                parsed = json.loads(response.text)
                for key in gemini_explanations.keys():
                    if key in parsed and parsed[key]:
                        gemini_explanations[key] = parsed[key]
        except Exception as e:
            # Fallback is already pre-populated in gemini_explanations
            pass
            
        # 4. Generate final report
        report = self.report_generator.generate_report(
            student_name, class_name, section,
            predictions, analytics, gemini_explanations
        )
        
        return {
            "student_name": student_name,
            "class": class_name,
            "section": section,
            "features": features,
            "subject_marks": subject_marks,
            "predictions": predictions,
            "analytics": analytics,
            "gemini_explanations": gemini_explanations,
            "report": report
        }
