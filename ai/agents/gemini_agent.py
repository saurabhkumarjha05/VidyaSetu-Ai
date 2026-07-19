# ai/agents/gemini_agent.py
import os
import logging
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class GeminiAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not defined in the environment or passed as argument.")
        self.client = genai.Client(api_key=self.api_key)

    def generate_content(self, contents, model="gemini-2.5-flash", system_instruction=None, json_schema=None, temperature=0.7):
        """
        Generates content using Google Gemini API with fallback retry mechanisms.
        """
        # Set up config options
        config = {}
        if system_instruction:
            config["system_instruction"] = system_instruction
        if temperature is not None:
            config["temperature"] = temperature
        if json_schema:
            config["response_mime_type"] = "application/json"
            config["response_schema"] = json_schema

        # Try multiple candidate models if rate limits or 503 errors occur
        models_to_try = [model, "gemini-2.5-flash", "gemini-1.5-flash"]
        unique_models = []
        for m in models_to_try:
            if m not in unique_models:
                unique_models.append(m)

        last_error = None
        for cand_model in unique_models:
            try:
                logger.info(f"[Gemini Python] Requesting content generation using model: {cand_model}")
                response = self.client.models.generate_content(
                    model=cand_model,
                    contents=contents,
                    config=types.GenerateContentConfig(**config) if config else None
                )
                return response
            except Exception as e:
                logger.warning(f"[Gemini Python] Failed generation with model {cand_model}: {str(e)}")
                last_error = e

        raise last_error or RuntimeError("Failed to generate content with all candidate models.")
