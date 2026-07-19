# ai/main.py
import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="VidyaSetu AI Services", version="1.0.0")

# Setup relative paths to models
current_dir = os.path.dirname(os.path.abspath(__file__))
model_paths = {
    'performance': os.path.join(current_dir, 'models', 'performance_model.pkl'),
    'intervention': os.path.join(current_dir, 'models', 'intervention_model.pkl')
}

# Late import CoordinatorAgent to ensure environment is fully initialized
from agents.coordinator_agent import CoordinatorAgent
from agents.gemini_agent import GeminiAgent

coordinator = None
gemini_agent = None

@app.on_event("startup")
def startup_event():
    global coordinator, gemini_agent
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable is not defined.")
    try:
        coordinator = CoordinatorAgent(model_paths, api_key)
        gemini_agent = GeminiAgent(api_key)
        logger.info("✅ CoordinatorAgent and GeminiAgent successfully initialized.")
    except Exception as e:
        logger.error(f"❌ Failed to initialize agents: {str(e)}")

# Request Models
class PredictionRequest(BaseModel):
    features: Dict[str, Any]

class DiagnoseRequest(BaseModel):
    student_name: str
    class_name: str
    section: str
    features: Dict[str, Any]
    subject_marks: Dict[str, float]

class ChatMessageItem(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageItem]
    student_context: Optional[str] = None
    system_instruction: Optional[str] = None

class AdminInsightRequest(BaseModel):
    cohort_summary: List[Dict[str, Any]]

class DoubtSolverRequest(BaseModel):
    question: str
    subject: Optional[str] = None

class NotesSummarizerRequest(BaseModel):
    notes: str

# Endpoints
@app.post("/predict")
def predict(request: PredictionRequest):
    if not coordinator:
        raise HTTPException(status_code=503, detail="AI engine is not fully loaded.")
    try:
        results = coordinator.prediction_agent.predict(request.features)
        return {"success": True, "predictions": results}
    except Exception as e:
        logger.exception("Prediction error")
        return {"success": False, "error": str(e)}

@app.post("/diagnose")
def diagnose(request: DiagnoseRequest):
    if not coordinator:
        raise HTTPException(status_code=503, detail="AI engine is not fully loaded.")
    try:
        results = coordinator.process_student_data(
            request.student_name,
            request.class_name,
            request.section,
            request.features,
            request.subject_marks
        )
        return {"success": True, "insight": results}
    except Exception as e:
        logger.exception("Diagnose error")
        return {"success": False, "error": str(e)}

@app.post("/chat")
def chat(request: ChatRequest):
    if not gemini_agent:
        raise HTTPException(status_code=503, detail="Gemini agent is not initialized.")
    try:
        # Build contents from messages history
        contents = []
        for msg in request.messages:
            contents.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [{"text": msg.text}]
            })
            
        sys_inst = request.system_instruction or "You are Vidya Assistant, a supportive school advisor."
        if request.student_context:
            sys_inst += f"\n\nStudent/Child Context:\n{request.student_context}"

        response = gemini_agent.generate_content(
            contents=contents,
            model="gemini-2.5-flash",
            system_instruction=sys_inst,
            temperature=0.7
        )
        
        reply = response.text or "I am here to support you on your learning path."
        return {"success": True, "text": reply}
    except Exception as e:
        logger.exception("Chat error")
        return {"success": False, "error": str(e)}

@app.post("/admin-insight")
def admin_insight(request: AdminInsightRequest):
    if not gemini_agent:
        raise HTTPException(status_code=503, detail="Gemini agent is not initialized.")
    try:
        prompt = f"""
        You are the Principal AI Strategist for VidyaSetu AI.
        Analyze the school metrics and student logs summary:
        {request.cohort_summary}

        Create an Administrative School Performance Report.
        Your output must be in JSON format matching this schema:
        {{
            "title": "string",
            "overview": "string",
            "atRiskStudents": [
                {{
                    "name": "string",
                    "reasons": ["string"],
                    "urgency": "string"
                }}
            ],
            "policyRecommendations": [
                {{
                    "title": "string",
                    "description": "string",
                    "impact": "string"
                }}
            ]
        }}
        """
        
        from google.genai import types
        json_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "title": types.Schema(type=types.Type.STRING),
                "overview": types.Schema(type=types.Type.STRING),
                "atRiskStudents": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "name": types.Schema(type=types.Type.STRING),
                            "reasons": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                            "urgency": types.Schema(type=types.Type.STRING)
                        },
                        required=["name", "reasons", "urgency"]
                    )
                ),
                "policyRecommendations": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "title": types.Schema(type=types.Type.STRING),
                            "description": types.Schema(type=types.Type.STRING),
                            "impact": types.Schema(type=types.Type.STRING)
                        },
                        required=["title", "description", "impact"]
                    )
                )
            },
            required=["title", "overview", "atRiskStudents", "policyRecommendations"]
        )

        response = gemini_agent.generate_content(
            contents=prompt,
            model="gemini-2.5-flash",
            json_schema=json_schema,
            temperature=0.6
        )
        
        import json
        report_data = json.loads(response.text or "{}")
        return {"success": True, "report": report_data}
    except Exception as e:
        logger.exception("Admin insight error")
        return {"success": False, "error": str(e)}

@app.post("/doubt-solver")
def doubt_solver(request: DoubtSolverRequest):
    if not gemini_agent:
        raise HTTPException(status_code=503, detail="Gemini agent is not initialized.")
    try:
        prompt = f"""
        You are an empathetic, step-by-step math and science teacher. Solve the student's doubt.
        Question: {request.question}
        Subject: {request.subject or "General Science"}
        
        Provide the answer in JSON format matching this schema:
        {{
            "question": "string",
            "steps": ["string"],
            "hint": "string",
            "alternatives": "string",
            "related": "string"
        }}
        """
        
        from google.genai import types
        json_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "question": types.Schema(type=types.Type.STRING),
                "steps": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                "hint": types.Schema(type=types.Type.STRING),
                "alternatives": types.Schema(type=types.Type.STRING),
                "related": types.Schema(type=types.Type.STRING),
            },
            required=["question", "steps", "hint", "alternatives", "related"]
        )

        response = gemini_agent.generate_content(
            contents=prompt,
            model="gemini-2.5-flash",
            json_schema=json_schema,
            temperature=0.5
        )
        
        import json
        solution = json.loads(response.text or "{}")
        return {"success": True, "solution": solution}
    except Exception as e:
        logger.exception("Doubt solver error")
        return {"success": False, "error": str(e)}

@app.post("/notes-summarizer")
def notes_summarizer(request: NotesSummarizerRequest):
    if not gemini_agent:
        raise HTTPException(status_code=503, detail="Gemini agent is not initialized.")
    try:
        prompt = f"""
        You are a smart revision coach. Summarize these student notes into a structured revision format:
        
        Notes:
        {request.notes}
        
        Provide key formulas, concepts, and a priority checklist.
        Keep it concise and clear.
        """
        
        response = gemini_agent.generate_content(
            contents=prompt,
            model="gemini-2.5-flash",
            temperature=0.5
        )
        
        return {"success": True, "summary": response.text or "Could not summarize notes."}
    except Exception as e:
        logger.exception("Notes summarizer error")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
