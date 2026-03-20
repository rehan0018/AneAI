from pydantic import BaseModel
from typing import List

class PatientInput(BaseModel):
    age: int
    bmi: float
    asa_status: int
    heart_rate: int
    sys_bp: int
    dia_bp: int
    spo2: int
    surgery_type: str
    emergency: int
    hypertension: int
    diabetes: int
    cardiac_disease: int
    resp_disease: int
    kidney_disease: int

class PredictionResponse(BaseModel):
    risk_level: str
    survival_probability: float
    complications: List[str]
    recommended_dosage: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "doctor"

