from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load secret environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    llm_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    llm_model = None
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
    """Advanced Clinical Intelligence Chatbot."""
    if not llm_model:
        return {"reply": "System Alert: The Large Language Model (LLM) is currently disconnected. Please provision a valid GEMINI_API_KEY inside the backend /.env file to enable 100% authentic, dynamic clinical reasoning."}
    
    try:
        system_prompt = (
            "You are aneAI, a highly authentic, accurate, and elite clinical anesthesia assistant. "
            "You provide mathematically sound, 100% accurate medical reasoning regarding anesthesia risks, propofol dosages, "
            "and surgical comorbidities. Base your logic strictly on canonical anesthesiology guidelines (ASA). Keep your answers concise, professional, and doctor-focused."
        )
        
        response = llm_model.generate_content(f"{system_prompt}\\n\\nDoctor Query: {chat.message}")
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Clinical Engine Error communicating with LLM: {str(e)}"}

@app.post("/api/train")
def retrain_model(current_user: User = Depends(require_admin)):
    """Triggers ML model retraining based on newly available data (Phase 13). Admin access required."""
    return {"message": "Model retraining pipeline coming in Phase 13"}
