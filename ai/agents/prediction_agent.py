# ai/agents/prediction_agent.py
import os
import joblib
import pandas as pd
import numpy as np

class PredictionAgent:
    def __init__(self, model_paths: dict):
        self.feature_names = [
            'Attendance_Percentage',
            'Homework_Completion',
            'Assignments_Average',
            'Quiz_Average',
            'Previous_GPA',
            'Participation_Score',
            'Teacher_Rating',
            'Late_Submissions'
        ]
        
        # Load performance model
        perf_path = model_paths.get('performance')
        if not os.path.exists(perf_path):
            raise FileNotFoundError(f"Performance model not found at {perf_path}")
        self.performance_model = joblib.load(perf_path)
        
        # Load intervention model
        inter_path = model_paths.get('intervention')
        if not os.path.exists(inter_path):
            raise FileNotFoundError(f"Intervention model not found at {inter_path}")
        self.intervention_model = joblib.load(inter_path)

    def predict(self, features: dict) -> dict:
        """
        Accepts features as a dictionary and returns model predictions.
        """
        # Ensure all required features are present, with default values if missing
        row = {}
        for feature in self.feature_names:
            row[feature] = float(features.get(feature, features.get(feature.lower(), 0.0)))
            
        # Create DataFrame matching feature names and order
        df = pd.DataFrame([row], columns=self.feature_names)
        
        # Make predictions
        predicted_performance = float(self.performance_model.predict(df)[0])
        
        # XGBoost intervention prediction
        needs_intervention = int(self.intervention_model.predict(df)[0])
        
        # Get intervention probability if available
        if hasattr(self.intervention_model, "predict_proba"):
            probs = self.intervention_model.predict_proba(df)[0]
            intervention_probability = float(probs[1])
            # Confidence is probability of the predicted class
            prediction_confidence = float(probs[needs_intervention])
        else:
            intervention_probability = 0.5
            prediction_confidence = 1.0
            
        # Calculate feature importance mock or extract if model supports
        feature_importance = {}
        if hasattr(self.intervention_model, "feature_importances_"):
            importances = self.intervention_model.feature_importances_
            for name, val in zip(self.feature_names, importances):
                feature_importance[name] = float(val)
        else:
            # Fallback mock feature importances
            feature_importance = {name: 1.0 / len(self.feature_names) for name in self.feature_names}
            
        return {
            "predicted_performance": predicted_performance,
            "needs_intervention": needs_intervention,
            "intervention_probability": intervention_probability,
            "prediction_confidence": prediction_confidence,
            "feature_importance": feature_importance
        }
