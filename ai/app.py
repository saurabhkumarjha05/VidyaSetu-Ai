# app.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from agents.coordinator_agent import CoordinatorAgent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Page configuration
st.set_page_config(
    page_title="EduSync Nexus - AI Academic Analyst",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for professional styling
st.markdown("""
    <style>
    /* Main container styling */
    .main {
        padding: 0rem 1rem;
        background-color: #f8f9fa;
    }
    
    /* Card styling */
    .card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        border-left: 4px solid #4A90E2;
    }
    
    .card-success {
        border-left-color: #28a745;
    }
    
    .card-warning {
        border-left-color: #ffc107;
    }
    
    .card-danger {
        border-left-color: #dc3545;
    }
    
    .card-info {
        border-left-color: #17a2b8;
    }
    
    .card-primary {
        border-left-color: #4A90E2;
    }
    
    /* Metric card styling */
    .metric-card {
        background: white;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 0.5rem;
        border: 1px solid #e9ecef;
    }
    
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #1a1a2e;
    }
    
    .metric-label {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 0.25rem;
    }
    
    /* Progress bar styling */
    .progress-container {
        background: #e9ecef;
        border-radius: 10px;
        height: 20px;
        margin: 0.5rem 0;
        overflow: hidden;
    }
    
    .progress-bar {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    /* Status indicators */
    .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-weight: 500;
        font-size: 0.8rem;
    }
    
    .status-success {
        background: #d4edda;
        color: #155724;
    }
    
    .status-warning {
        background: #fff3cd;
        color: #856404;
    }
    
    .status-danger {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status-info {
        background: #d1ecf1;
        color: #0c5460;
    }
    
    /* Expandable section styling */
    .expandable-section {
        background: white;
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    /* Header styling */
    .main-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        margin-bottom: 2rem;
    }
    
    .header-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    
    .header-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
    }
    
    /* Subject mark styling */
    .subject-card {
        background: white;
        border-radius: 8px;
        padding: 0.75rem;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        margin-bottom: 0.5rem;
    }
    
    .subject-name {
        font-size: 0.8rem;
        color: #6c757d;
    }
    
    .subject-mark {
        font-size: 1.2rem;
        font-weight: bold;
        color: #1a1a2e;
    }
    
    /* Custom button styling */
    .stButton > button {
        background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        font-weight: 600;
        border-radius: 8px;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    /* Responsive grid */
    .row {
        display: flex;
        flex-wrap: wrap;
        margin: -0.5rem;
    }
    
    .col {
        flex: 1;
        padding: 0.5rem;
        min-width: 200px;
    }
    
    /* AI Explanation styling */
    .ai-explanation {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        border-left: 4px solid #4A90E2;
        margin: 0.5rem 0;
    }
    
    .ai-explanation h4 {
        color: #1a1a2e;
        margin-top: 0;
    }
    
    .ai-explanation p {
        color: #333;
        line-height: 1.6;
    }
    
    /* Footer */
    .footer {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
        margin-top: 2rem;
        border-top: 1px solid #dee2e6;
    }
    
    /* Debug info */
    .debug-info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.8rem;
        margin: 1rem 0;
        border: 1px solid #dee2e6;
    }
    
    /* Report styling */
    .report-container {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin: 1rem 0;
    }
    
    .report-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e9ecef;
    }
    
    .report-section:last-child {
        border-bottom: none;
    }
    
    .report-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a2e;
        margin-bottom: 1rem;
    }
    
    .report-subtitle {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.75rem;
    }
    
    .report-item {
        padding: 0.5rem 0;
        border-bottom: 1px solid #f1f3f5;
    }
    
    .report-item:last-child {
        border-bottom: none;
    }
    
    .priority-high {
        border-left: 4px solid #dc3545;
        padding-left: 1rem;
        background: #f8d7da;
        border-radius: 4px;
    }
    
    .priority-medium {
        border-left: 4px solid #ffc107;
        padding-left: 1rem;
        background: #fff3cd;
        border-radius: 4px;
    }
    
    .priority-low {
        border-left: 4px solid #28a745;
        padding-left: 1rem;
        background: #d4edda;
        border-radius: 4px;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'analysis_complete' not in st.session_state:
    st.session_state.analysis_complete = False

if 'results' not in st.session_state:
    st.session_state.results = None

if 'coordinator' not in st.session_state:
    st.session_state.coordinator = None

if 'system_ready' not in st.session_state:
    st.session_state.system_ready = False

# Function to initialize coordinator
def initialize_coordinator():
    if st.session_state.coordinator is None:
        with st.spinner("Initializing AI System..."):
            model_paths = {
                'performance': 'models/performance_model.pkl',
                'intervention': 'models/intervention_model.pkl'
            }
            try:
                st.session_state.coordinator = CoordinatorAgent(
                    model_paths,
                    os.getenv('GEMINI_API_KEY')
                )
                st.session_state.system_ready = True
                st.success("✅ AI System initialized successfully!")
            except Exception as e:
                st.error(f"❌ Failed to initialize AI system: {str(e)}")
                st.session_state.system_ready = False

# Main header
def render_header():
    st.markdown("""
    <div class="main-header">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <div class="header-title">🎓 EduSync Nexus</div>
                <div class="header-subtitle">AI Academic Analyst System</div>
                <div style="margin-top: 0.5rem;">
                    <span class="status-badge status-success">ML-Powered</span>
                    <span class="status-badge status-info">Multi-Agent AI</span>
                    <span class="status-badge status-primary" style="background: #4A90E2; color: white;">Real-time Analysis</span>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.9rem; opacity: 0.8;">Powered by</div>
                <div style="font-size: 1.2rem; font-weight: 600;">XGBoost & Gemini AI</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# Input form
def render_input_form():
    with st.container():
        st.markdown("### 📝 Student Information")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            student_name = st.text_input("Student Name", placeholder="Enter student name", value="Raju")
        with col2:
            class_name = st.text_input("Class", placeholder="e.g., 10", value="10")
        with col3:
            section = st.text_input("Section", placeholder="e.g., A", value="A")
        
        st.markdown("### 📊 Academic Indicators")
        st.info("💡 Adjust the sliders below to match the student's academic profile")
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            attendance = st.slider("Attendance (%)", 0, 100, 75, key="attendance")
            homework = st.slider("Homework Completion (%)", 0, 100, 70, key="homework")
        with col2:
            assignments = st.slider("Assignment Average (%)", 0, 100, 72, key="assignments")
            quizzes = st.slider("Quiz Average (%)", 0, 100, 68, key="quizzes")
        with col3:
            gpa = st.slider("Previous GPA", 0.0, 10.0, 6.5, step=0.1, key="gpa")
            participation = st.slider("Participation Score (%)", 0, 100, 65, key="participation")
        with col4:
            teacher_rating = st.slider("Teacher Rating", 0.0, 5.0, 3.5, step=0.1, key="teacher_rating")
            late_submissions = st.number_input("Late Submissions", min_value=0, max_value=20, value=2, key="late")
        
        st.markdown("### 📚 Subject Marks")
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            math = st.slider("Mathematics", 0, 100, 65, key="math")
            science = st.slider("Science", 0, 100, 70, key="science")
        with col2:
            english = st.slider("English", 0, 100, 68, key="english")
            hindi = st.slider("Hindi", 0, 100, 60, key="hindi")
        with col3:
            social_science = st.slider("Social Science", 0, 100, 62, key="social")
            computer = st.slider("Computer Science", 0, 100, 75, key="computer")
        
        # Analyze button
        if st.button("🎯 Analyze Student Performance", use_container_width=True):
            if not student_name:
                st.error("Please enter student name")
                return
            
            # Prepare features for ML models
            features = {
                'Attendance_Percentage': float(attendance),
                'Homework_Completion': float(homework),
                'Assignments_Average': float(assignments),
                'Quiz_Average': float(quizzes),
                'Previous_GPA': float(gpa),
                'Participation_Score': float(participation),
                'Teacher_Rating': float(teacher_rating),
                'Late_Submissions': float(late_submissions)
            }
            
            # Subject marks
            subject_marks = {
                'Mathematics': float(math),
                'Science': float(science),
                'English': float(english),
                'Hindi': float(hindi),
                'Social Science': float(social_science),
                'Computer Science': float(computer)
            }
            
            # Process with coordinator
            try:
                initialize_coordinator()
                if st.session_state.system_ready:
                    with st.spinner("🧠 AI Agents analyzing student data..."):
                        results = st.session_state.coordinator.process_student_data(
                            student_name,
                            class_name,
                            section,
                            features,
                            subject_marks
                        )
                        st.session_state.results = results
                        st.session_state.analysis_complete = True
                        st.rerun()
            except Exception as e:
                st.error(f"❌ Error during analysis: {str(e)}")
                st.exception(e)

# Results display
def render_results():
    if not st.session_state.analysis_complete or st.session_state.results is None:
        return
    
    results = st.session_state.results
    analytics = results['analytics']
    predictions = results['predictions']
    
    # Debug section - show raw predictions
    with st.expander("🔍 Debug - Model Predictions", expanded=False):
        st.write("**Raw Prediction Values:**")
        st.write(f"- Performance Model Output: {predictions.get('predicted_performance', 'N/A')}")
        st.write(f"- Type: {type(predictions.get('predicted_performance', 'N/A'))}")
        st.write(f"- Intervention Prediction: {predictions.get('needs_intervention', 'N/A')}")
        st.write(f"- Intervention Probability: {predictions.get('intervention_probability', 'N/A')}")
        st.write(f"- Confidence: {predictions.get('prediction_confidence', 'N/A')}")
        st.write("**Feature Importance:**")
        st.write(predictions.get('feature_importance', {}))
    
    # Header with student info
    st.markdown(f"""
    <div style="background: white; border-radius: 10px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin: 0; color: #1a1a2e;">{results['student_name']}</h2>
                <p style="margin: 0.25rem 0 0 0; color: #6c757d;">Class {results['class']} - Section {results['section']}</p>
                <p style="margin: 0.25rem 0 0 0; color: #6c757d; font-size: 0.9rem;">Report Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            </div>
            <div style="text-align: right;">
                <span class="status-badge status-success">Analysis Complete</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Key Metrics Cards
    st.markdown("### 📊 Performance Overview")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        predicted_perf = float(predictions.get('predicted_performance', 0))
        perf_color = "green" if predicted_perf >= 70 else "orange" if predicted_perf >= 50 else "red"
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value" style="color: {perf_color};">{predicted_perf:.1f}%</div>
            <div class="metric-label">Predicted Overall Performance</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        needs_intervention = int(predictions.get('needs_intervention', 0))
        intervention_status = "⚠️ Needs Intervention" if needs_intervention == 1 else "✅ On Track"
        status_color = "danger" if needs_intervention == 1 else "success"
        confidence = float(predictions.get('prediction_confidence', 0)) * 100
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value" style="color: {'#dc3545' if needs_intervention == 1 else '#28a745'}; font-size: 1.5rem;">{intervention_status}</div>
            <div class="metric-label">Intervention Status</div>
            <div style="font-size: 0.8rem; color: #6c757d;">Confidence: {confidence:.1f}%</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        grade = analytics.get('grade', 'N/A')
        grade_color = "green" if grade in ['A+', 'A'] else "orange" if grade in ['B', 'C'] else "red"
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-value" style="color: {'#28a745' if grade in ['A+', 'A'] else '#ffc107' if grade in ['B', 'C'] else '#dc3545'};">{grade}</div>
            <div class="metric-label">Grade</div>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        weak_subject = analytics.get('subject_analysis', {}).get('weak_subject', 'N/A')
        strong_subject = analytics.get('subject_analysis', {}).get('strong_subject', 'N/A')
        st.markdown(f"""
        <div class="metric-card">
            <div style="font-size: 1rem; font-weight: bold; color: #dc3545;">⬇️ {weak_subject}</div>
            <div style="font-size: 0.9rem; color: #6c757d;">Weakest Subject</div>
            <div style="font-size: 1rem; font-weight: bold; color: #28a745; margin-top: 0.25rem;">⬆️ {strong_subject}</div>
            <div style="font-size: 0.9rem; color: #6c757d;">Strongest Subject</div>
        </div>
        """, unsafe_allow_html=True)
    
    # Status indicators
    col1, col2, col3 = st.columns(3)
    with col1:
        att_status = analytics.get('attendance_status', {})
        att_percentage = att_status.get('percentage', 0)
        att_color = att_status.get('color', 'info')
        st.markdown(f"""
        <div class="card card-{att_color}">
            <h4>📅 Attendance</h4>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="status-badge status-{att_color}">{att_status.get('status', 'N/A')}</span>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #6c757d;">{att_status.get('description', '')}</p>
                </div>
                <div style="font-size: 1.5rem; font-weight: bold;">{att_percentage:.1f}%</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: {att_percentage}%; background-color: {'#28a745' if att_percentage >= 85 else '#ffc107' if att_percentage >= 70 else '#dc3545'};">
                    {att_percentage:.0f}%
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        hw_status = analytics.get('homework_status', {})
        hw_percentage = hw_status.get('percentage', 0)
        hw_color = hw_status.get('color', 'info')
        st.markdown(f"""
        <div class="card card-{hw_color}">
            <h4>📝 Homework</h4>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="status-badge status-{hw_color}">{hw_status.get('status', 'N/A')}</span>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #6c757d;">{hw_status.get('description', '')}</p>
                </div>
                <div style="font-size: 1.5rem; font-weight: bold;">{hw_percentage:.1f}%</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: {hw_percentage}%; background-color: {'#28a745' if hw_percentage >= 80 else '#ffc107' if hw_percentage >= 60 else '#dc3545'};">
                    {hw_percentage:.0f}%
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        part_status = analytics.get('participation_status', {})
        part_score = part_status.get('score', 0)
        part_color = part_status.get('color', 'info')
        st.markdown(f"""
        <div class="card card-{part_color}">
            <h4>💬 Participation</h4>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="status-badge status-{part_color}">{part_status.get('status', 'N/A')}</span>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #6c757d;">{part_status.get('description', '')}</p>
                </div>
                <div style="font-size: 1.5rem; font-weight: bold;">{part_score:.1f}%</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: {part_score}%; background-color: {'#28a745' if part_score >= 75 else '#ffc107' if part_score >= 50 else '#dc3545'};">
                    {part_score:.0f}%
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    # Subject marks chart
    st.markdown("### 📈 Subject Performance")
    
    subject_data = pd.DataFrame({
        'Subject': list(results['subject_marks'].keys()),
        'Marks': list(results['subject_marks'].values())
    })
    
    fig = px.bar(subject_data, x='Subject', y='Marks', 
                 color='Marks', color_continuous_scale=['red', 'yellow', 'green'],
                 title='Subject-wise Performance',
                 height=400)
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        xaxis_title="Subjects",
        yaxis_title="Marks (%)",
        yaxis_range=[0, 100],
        showlegend=False
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Strengths and Weaknesses
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 💪 Student Strengths")
        strengths = analytics.get('strengths', ['No strengths identified'])
        for strength in strengths:
            st.markdown(f"""
            <div style="background: #d4edda; padding: 0.5rem 1rem; border-radius: 5px; margin-bottom: 0.5rem; border-left: 4px solid #28a745;">
                {strength}
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("### 🎯 Areas of Improvement")
        weaknesses = analytics.get('weaknesses', ['No weaknesses identified'])
        for weakness in weaknesses:
            st.markdown(f"""
            <div style="background: #f8d7da; padding: 0.5rem 1rem; border-radius: 5px; margin-bottom: 0.5rem; border-left: 4px solid #dc3545;">
                {weakness}
            </div>
            """, unsafe_allow_html=True)
    
    # Recommendations
    st.markdown("### 📋 Recommendations")
    
    recommendations = analytics.get('recommendations', [])
    
    # Group by priority
    high_priority = [r for r in recommendations if r.get('priority') == 'High']
    medium_priority = [r for r in recommendations if r.get('priority') == 'Medium']
    low_priority = [r for r in recommendations if r.get('priority') == 'Low']
    
    if high_priority:
        st.markdown("#### 🔴 High Priority (Immediate Action Required)")
        for rec in high_priority:
            st.markdown(f"""
            <div class="priority-high" style="padding: 1rem; margin-bottom: 0.75rem; border-radius: 8px; background: #f8d7da; border-left: 4px solid #dc3545;">
                <strong>{rec.get('category', 'General')}</strong>
                <p style="margin: 0.25rem 0 0 0; color: #333;">{rec.get('action', '')}</p>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #6c757d;">{rec.get('description', '')}</p>
            </div>
            """, unsafe_allow_html=True)
    
    if medium_priority:
        st.markdown("#### 🟡 Medium Priority (Action Within 2-4 Weeks)")
        for rec in medium_priority:
            st.markdown(f"""
            <div class="priority-medium" style="padding: 1rem; margin-bottom: 0.75rem; border-radius: 8px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <strong>{rec.get('category', 'General')}</strong>
                <p style="margin: 0.25rem 0 0 0; color: #333;">{rec.get('action', '')}</p>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #6c757d;">{rec.get('description', '')}</p>
            </div>
            """, unsafe_allow_html=True)
    
    if low_priority:
        st.markdown("#### 🟢 Low Priority (Long-term Strategy)")
        for rec in low_priority:
            st.markdown(f"""
            <div class="priority-low" style="padding: 1rem; margin-bottom: 0.75rem; border-radius: 8px; background: #d4edda; border-left: 4px solid #28a745;">
                <strong>{rec.get('category', 'General')}</strong>
                <p style="margin: 0.25rem 0 0 0; color: #333;">{rec.get('action', '')}</p>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #6c757d;">{rec.get('description', '')}</p>
            </div>
            """, unsafe_allow_html=True)
    
    # Comprehensive Report
    st.markdown("### 📄 Comprehensive Academic Report")
    st.markdown("""
    <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #4A90E2;">
        <p style="margin: 0;">This comprehensive report provides a complete analysis of the student's academic performance,
        including detailed explanations, strengths, weaknesses, and actionable recommendations for teachers, parents, and students.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Display the HTML report
    if 'report' in results and 'html' in results['report']:
        st.markdown(results['report']['html'], unsafe_allow_html=True)
        
        # Also provide option to download the report
        if 'full_text' in results['report']:
            col1, col2 = st.columns(2)
            with col1:
                st.download_button(
                    label="📥 Download Full Report (Text)",
                    data=results['report']['full_text'],
                    file_name=f"Academic_Report_{results['student_name']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
                    mime="text/plain",
                    use_container_width=True
                )
            with col2:
                st.download_button(
                    label="📥 Download Report (Markdown)",
                    data=f"# Academic Report for {results['student_name']}\n\n{results['report']['full_text']}",
                    file_name=f"Academic_Report_{results['student_name']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md",
                    mime="text/markdown",
                    use_container_width=True
                )
    
    # Optional Gemini Explanations (if available)
    if 'gemini_explanations' in results and results['gemini_explanations']:
        st.markdown("### 🤖 AI-Generated Insights (Powered by Gemini)")
        st.info("💡 These additional insights are generated by Google Gemini AI to provide deeper context.")
        
        gemini_sections = [
            ("📊 Prediction Summary", 'prediction_summary'),
            ("🔍 Decision Explanation", 'intervention_explanation'),
            ("💪 Strengths Analysis", 'strengths_analysis'),
            ("🎯 Weaknesses Analysis", 'weaknesses_analysis')
        ]
        
        for title, key in gemini_sections:
            if key in results['gemini_explanations'] and results['gemini_explanations'][key]:
                with st.expander(title):
                    st.markdown(f"""
                    <div class="ai-explanation">
                        <p>{results['gemini_explanations'][key]}</p>
                    </div>
                    """, unsafe_allow_html=True)
    
    # Footer
    st.markdown("""
    <div class="footer">
        <p style="margin: 0;">EduSync Nexus - Multi-Agent AI Collaboration Network for Schools</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem;">Powered by XGBoost, Scikit-Learn, and Google Gemini AI</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #adb5bd;">Report generated using AI Academic Analyst System</p>
    </div>
    """, unsafe_allow_html=True)

# Main app
def main():
    render_header()
    
    if not st.session_state.analysis_complete:
        render_input_form()
    else:
        render_results()
        
        # Reset button
        if st.button("🔄 New Analysis", use_container_width=True):
            st.session_state.analysis_complete = False
            st.session_state.results = None
            st.rerun()

if __name__ == "__main__":
    main()