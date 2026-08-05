import re
from typing import Dict, List, Any, Optional

STYLE_KEYWORDS = {
    "cinematic": {"style": "Cinematic 8K", "lighting": "Dramatic Chiaroscuro", "colors": ["#1A202C", "#E2E8F0", "#3182CE", "#DD6B20"]},
    "cyberpunk": {"style": "Cyberpunk Neon", "lighting": "Volumetric Neon Lights", "colors": ["#00F0FF", "#FF007F", "#7B00FF", "#0A0A12"]},
    "anime": {"style": "Japanese Anime Studio", "lighting": "Vibrant Soft Glow", "colors": ["#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7"]},
    "fantasy": {"style": "Dark High Fantasy", "lighting": "Ethereal Bioluminescence", "colors": ["#4A154B", "#36C5F0", "#ECB22E", "#2EB67D"]},
    "photorealistic": {"style": "Ultra Photorealistic", "lighting": "Natural Golden Hour", "colors": ["#F6AD55", "#ED8936", "#C05621", "#7B341E"]},
    "3d": {"style": "Octane 3D Render", "lighting": "Studio Softbox Key Light", "colors": ["#6366F1", "#8B5CF6", "#EC4899", "#1E1B4B"]},
    "abstract": {"style": "Minimalist Abstract", "lighting": "Ambient Diffusion", "colors": ["#0F172A", "#38BDF8", "#818CF8", "#F43F5E"]},
}

MOOD_KEYWORDS = {
    "futuristic": "High-tech & Sci-Fi",
    "mystical": "Enigmatic & Ethereal",
    "dark": "Somber & Intense",
    "epic": "Grand & Heroic",
    "calm": "Serene & Peaceful",
    "energetic": "Dynamic & Vibrant",
    "melancholy": "Nostalgic & Reflective"
}

class ContextEngine:
    def __init__(self):
        self.active_contexts: Dict[str, Dict[str, Any]] = {}

    def extract_context(self, prompt: str, project_id: Optional[str] = None) -> Dict[str, Any]:
        """Extracts creative metadata from raw user prompt."""
        prompt_lower = prompt.lower()
        
        # 1. Detect Style
        detected_style = "Cinematic Realism"
        detected_lighting = "Balanced Cinematic Studio Light"
        detected_colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"]

        for kw, meta in STYLE_KEYWORDS.items():
            if kw in prompt_lower:
                detected_style = meta["style"]
                detected_lighting = meta["lighting"]
                detected_colors = meta["colors"]
                break

        # 2. Detect Mood
        detected_mood = "Atmospheric & Dramatic"
        for kw, mood in MOOD_KEYWORDS.items():
            if kw in prompt_lower:
                detected_mood = mood
                break

        # 3. Subject Detection (heuristic parsing)
        # Extract main noun phrase after common verbs or articles
        subject = prompt
        clean_prompt = re.sub(r'^(a|an|the|generate|create|render)\s+', '', prompt, flags=re.IGNORECASE)
        parts = clean_prompt.split(' with ')
        if parts:
            subject = parts[0].split(' in ')[0].strip()

        # 4. Generate Narrative Script Seed for TTS
        script_seed = f"Witness the creation of {subject}, brought to life with {detected_style.lower()} aesthetics and {detected_mood.lower()} energy."

        context = {
            "prompt": prompt,
            "subject": subject.capitalize(),
            "style": detected_style,
            "mood": detected_mood,
            "lighting": detected_lighting,
            "color_palette": detected_colors,
            "suggested_narration": script_seed,
            "tags": [detected_style, detected_mood, "Aura-AI", "SDXL-ROCm"]
        }

        if project_id:
            self.active_contexts[project_id] = context

        return context

    def get_context(self, project_id: str) -> Optional[Dict[str, Any]]:
        return self.active_contexts.get(project_id)

    def update_context(self, project_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        if project_id not in self.active_contexts:
            self.active_contexts[project_id] = {}
        self.active_contexts[project_id].update(updates)
        return self.active_contexts[project_id]

# Singleton instance
context_engine = ContextEngine()
