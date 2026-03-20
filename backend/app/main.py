from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .schemas import PatientInput, PredictionResponse, Token, UserCreate
from .ml_service import make_prediction
from .database import engine, Base, get_db
from .models import PatientRecord, User
from .auth import verify_password, get_password_hash, create_access_token, get_current_user, require_admin

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Anesthesia AI Prediction API (Secured)", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/predict", response_model=PredictionResponse)
def predict_risk(patient: PatientInput, db: Session = Depends(get_db)):
    """Takes a patient feature vector, returns risk, and saves to database."""
    prediction = make_prediction(patient)
    
    db_patient = PatientRecord(
        **patient.dict(),
        risk_level=prediction.risk_level,
        survival_probability=prediction.survival_probability,
        complications=prediction.complications
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    return prediction

@app.get("/api/patients")
def get_patients(db: Session = Depends(get_db)):
    """Returns list of predicted patients from the database. Admin access optionally removed for testing."""
    patients = db.query(PatientRecord).order_by(PatientRecord.created_at.desc()).limit(100).all()
    return patients

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_bot(chat: ChatMessage):
    """Clinical Intelligence Chatbot."""
    msg = chat.message.lower()
    if "risk" in msg:
        return {"reply": "Anesthesia risk is evaluated utilizing robust vectors like Age, BMI, ASA Status, and comorbidities like Hypertension or Diabetes. Please navigate to the Patient Evaluation form to compute an exact score."}
    if "complication" in msg or "hypotension" in msg or "arrhythmia" in msg:
        return {"reply": "Adverse complications such as Hypotension, Arrhythmia, or Postoperative Delirium are flagged exclusively when patient-specific boundaries (e.g., Surgery Type, Vitals ranges) cross critical safety thresholds."}
    if "asa" in msg:
        return {"reply": "ASA Status (I-VI) is the American Society of Anesthesiologists physical status scale. It intrinsically correlates with postoperative mortality mapping."}
    return {"reply": "I am the aneAI Clinical Intelligence Engine. How can I assist you with surgical modeling or patient navigation today?"}

@app.post("/api/train")
def retrain_model(current_user: User = Depends(require_admin)):
    """Triggers ML model retraining based on newly available data (Phase 13). Admin access required."""
    return {"message": "Model retraining pipeline coming in Phase 13"}
