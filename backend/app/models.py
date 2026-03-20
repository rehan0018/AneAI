from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from datetime import datetime
try:
    from .database import Base
except ImportError:
    from database import Base

class PatientRecord(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Input Features
    age = Column(Integer)
    bmi = Column(Float)
    asa_status = Column(Integer)
    heart_rate = Column(Integer)
    sys_bp = Column(Integer)
    dia_bp = Column(Integer)
    spo2 = Column(Integer)
    surgery_type = Column(String)
    emergency = Column(Integer)
    hypertension = Column(Integer)
    diabetes = Column(Integer)
    cardiac_disease = Column(Integer)
    resp_disease = Column(Integer)
    kidney_disease = Column(Integer)
    
    # Predictions
    risk_level = Column(String)
    survival_probability = Column(Float)
    complications = Column(JSON)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="doctor") # Supported values: doctor, admin

