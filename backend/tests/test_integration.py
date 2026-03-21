import pytest
from fastapi.testclient import TestClient
import sys
import os

# Align python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app

client = TestClient(app)

def test_patients_route_status():
    """Validating that the patients endpoint connects safely to the Database without hanging."""
    response = client.get("/api/patients")
    assert response.status_code == 200

def test_predict_route_status():
    """Validating that prediction endpoints evaluate XGBoost binaries natively."""
    sample = {
        "age": 45, "bmi": 24.5, "asa_status": 2, "heart_rate": 72,
        "sys_bp": 115, "dia_bp": 75, "spo2": 99, "surgery_type": "Orthopedic",
        "emergency": 0, "hypertension": 0, "diabetes": 0,
        "cardiac_disease": 0, "resp_disease": 0, "kidney_disease": 0
    }
    response = client.post("/api/predict", json=sample)
    assert response.status_code == 200
    assert "risk_level" in response.json()
    assert "survival_probability" in response.json()

def test_chat_route_status():
    """Validating LLM endpoint structure and fallback behaviors."""
    sample = {"message": "Hello"}
    response = client.post("/api/chat", json=sample)
    assert response.status_code == 200
    assert "reply" in response.json()
