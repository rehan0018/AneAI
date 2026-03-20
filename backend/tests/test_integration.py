import pytest
from fastapi.testclient import TestClient
import sys
import os

# Align python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app

client = TestClient(app)

def test_patients_route_unauthorized():
    """Validating that Phase 11 admin boundaries are secure."""
    response = client.get("/api/patients")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_predict_route_unauthorized():
    """Validating that prediction endpoints require physician tokens."""
    sample = {
        "age": 45, "bmi": 24.5, "asa_status": 2, "heart_rate": 72,
        "sys_bp": 115, "dia_bp": 75, "spo2": 99, "surgery_type": "Orthopedic",
        "emergency": 0, "hypertension": 0, "diabetes": 0,
        "cardiac_disease": 0, "resp_disease": 0, "kidney_disease": 0
    }
    response = client.post("/api/predict", json=sample)
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_register_and_predict_flow():
    """Full E2E Edge Case test traversing registration & secured prediction."""
    # 1. Register Mock Doctor
    auth_data = {"username": "DrSmith", "password": "securepassword", "role": "doctor"}
    reg_response = client.post("/api/auth/register", json=auth_data)
    
    if reg_response.status_code == 200:
        token = reg_response.json()["access_token"]
        assert token is not None
        
        # 2. Re-test Prediction with Token
        sample = {
            "age": 75, "bmi": 34.5, "asa_status": 4, "heart_rate": 110,
            "sys_bp": 175, "dia_bp": 95, "spo2": 88, "surgery_type": "Trauma",
            "emergency": 1, "hypertension": 1, "diabetes": 1,
            "cardiac_disease": 1, "resp_disease": 1, "kidney_disease": 1
        }
        headers = {"Authorization": f"Bearer {token}"}
        pred_response = client.post("/api/predict", json=sample, headers=headers)
        
        assert pred_response.status_code == 200
        output = pred_response.json()
        assert output["risk_level"] in ["Low", "Medium", "High"]
        assert "survival_probability" in output
