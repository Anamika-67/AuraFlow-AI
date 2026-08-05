import os
import json
import time
import uuid
from typing import Dict, Any, List, Optional
from backend.config import PROJECTS_DIR

class ProjectManager:
    def create_project(self, name: str, description: str = "") -> Dict[str, Any]:
        """Creates a new Aura Studio creative project."""
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        project = {
            "id": project_id,
            "name": name,
            "description": description,
            "created_at": time.time(),
            "updated_at": time.time(),
            "context": None,
            "assets": {
                "images": [],
                "edited_images": [],
                "videos": [],
                "audios": [],
                "renders": []
            }
        }
        self.save_project(project)
        return project

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves project by ID."""
        filepath = PROJECTS_DIR / f"{project_id}.json"
        if not filepath.exists():
            return None
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None

    def list_projects(self) -> List[Dict[str, Any]]:
        """Lists all existing projects sorted by last update."""
        projects = []
        for file in os.listdir(PROJECTS_DIR):
            if file.endswith(".json"):
                pid = file.replace(".json", "")
                proj = self.get_project(pid)
                if proj:
                    projects.append(proj)
        projects.sort(key=lambda p: p.get("updated_at", 0), reverse=True)
        return projects

    def save_project(self, project: Dict[str, Any]):
        """Persists project structure to JSON storage."""
        project["updated_at"] = time.time()
        filepath = PROJECTS_DIR / f"{project['id']}.json"
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(project, f, indent=2)

    def add_asset(self, project_id: str, category: str, asset_data: Dict[str, Any]):
        """Appends a generated asset (image, video, audio, render) to project history."""
        proj = self.get_project(project_id)
        if proj:
            if category in proj["assets"]:
                proj["assets"][category].append(asset_data)
                self.save_project(proj)

project_manager = ProjectManager()
