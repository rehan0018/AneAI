import pandas as pd
import joblib
import os
from .schemas import PatientInput, PredictionResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'ml_model')

# Load model artifacts into memory on server startup
preprocessor, feature_names = joblib.load(os.path.join(MODEL_DIR, 'preprocessor.joblib'))
risk_model = joblib.load(os.path.join(MODEL_DIR, 'risk_model.joblib'))
survival_model = joblib.load(os.path.join(MODEL_DIR, 'survival_model.joblib'))
complications_model = joblib.load(os.path.join(MODEL_DIR, 'complications_model.joblib'))
label_encoder = joblib.load(os.path.join(MODEL_DIR, 'risk_label_encoder.joblib'))

def make_prediction(patient: PatientInput) -> PredictionResponse:
    # Convert input to DataFrame
    df = pd.DataFrame([patient.dict()])
    
    # Preprocess
    X_processed = preprocessor.transform(df)
    X_processed_df = pd.DataFrame(X_processed, columns=feature_names)
    
    # Predict Risk
    risk_pred_encoded = risk_model.predict(X_processed_df)
    risk_level = label_encoder.inverse_transform(risk_pred_encoded)[0]
    
    # Predict Survival
    survival_prob = float(survival_model.predict(X_processed_df)[0])
    
    # Predict Complications
    comp_preds = complications_model.predict(X_processed_df)[0]
    comp_labels = ['Hypotension', 'Arrhythmia', 'Postoperative Delirium']
    active_comps = [label for pred, label in zip(comp_preds, comp_labels) if pred == 1]
    
    # Calculate Anesthesia Dosage (Propofol Induction Estimate)
    # Estimate weight assuming average height of 1.70m (Weight = BMI * height^2)
    estimated_weight_kg = patient.bmi * 2.89
    
    base_dose_per_kg = 2.0
    if patient.age > 65:
        base_dose_per_kg = 1.5
    
    if risk_level in ['High', 'Medium'] or patient.asa_status >= 3:
        base_dose_per_kg *= 0.8  # Reduce dose by 20% for frail/high-risk patients
        
    total_dose_mg = estimated_weight_kg * base_dose_per_kg
    lower_bound = int(total_dose_mg * 0.9)
    upper_bound = int(total_dose_mg * 1.1)
    
    recommended_dosage = f"{lower_bound}mg - {upper_bound}mg Propofol"
    
    return PredictionResponse(
        risk_level=risk_level,
        survival_probability=round(survival_prob, 4),
        complications=active_comps,
        recommended_dosage=recommended_dosage
    )
