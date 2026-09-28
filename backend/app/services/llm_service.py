import logging
from typing import Optional, Tuple
from groq import Groq
from backend.app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        try:
            self.client = Groq(api_key=settings.groq_api_key)
            self.model = settings.groq_model
            logger.info(f"LLMService initialized with model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            self.client = None

    def generate_response(
        self, 
        system_prompt: str, 
        user_message: str, 
        conversation_history: Optional[list] = None,
        max_tokens: int = 2048,
        temperature: float = 0.2
    ) -> Tuple[str, Optional[str]]:
        """
        Generates reasoning and final response text.
        Returns: (content_text, reasoning_trace)
        """
        if not self.client:
            raise RuntimeError("LLM client is not initialized or GROQ_API_KEY is missing.")

        try:
            messages = [{"role": "system", "content": system_prompt}]
            if conversation_history:
                for msg in conversation_history:
                    role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else "user")
                    content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
                    if role and content:
                        messages.append({"role": role, "content": content})
            
            messages.append({"role": "user", "content": user_message})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            message_obj = response.choices[0].message
            content = (message_obj.content or "").strip()
            reasoning = getattr(message_obj, "reasoning", None)
            
            return content, reasoning
        except Exception as e:
            logger.error(f"Groq API completion error: {e}")
            raise e

llm_service = LLMService()
