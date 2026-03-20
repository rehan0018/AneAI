from fastapi.testclient import TestClient
import sys
import os

# Ensure the backend directory is in the path for module logic
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.main import app

client = TestClient(app)

def test_predict_and_db_flow():
    # 1. Test Prediction
    sample_patient = {
        "age": 65,
        "bmi": 31.5,
        "asa_status": 3,
        "heart_rate": 88,
        "sys_bp": 140,
        "dia_bp": 90,
        "spo2": 95,
        "surgery_type": "Cardiac",
        "emergency": 1,
        "hypertension": 1,
        "diabetes": 1,
        "cardiac_disease": 1,
        "resp_disease": 0,
        "kidney_disease": 0
    }
    
    print("Testing POST /api/predict...")
    response = client.post("/api/predict", json=sample_patient)
    assert response.status_code == 200, f"Error: {response.text}"
    prediction = response.json()
    print("Prediction Output:", prediction)
    
    assert "risk_level" in prediction
    assert "survival_probability" in prediction
    assert "complications" in prediction
    
    # 2. Test fetching from Database
    print("\nTesting GET /api/patients...")
    db_resp = client.get("/api/patients")
    assert db_resp.status_code == 200
    patients = db_resp.json()
    print(f"Total stored patients: {len(patients)}")
    
if __name__ == "__main__":
    test_predict_and_db_flow()
    print("\nBackend and Database Integration passed successfully!")
