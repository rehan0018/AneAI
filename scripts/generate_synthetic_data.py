import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    # Base Features
    age = np.random.randint(18, 95, num_samples)
    bmi = np.random.normal(26.5, 5.0, num_samples)
    bmi = np.clip(bmi, 15.0, 50.0)
    
    asa_status = np.random.choice([1, 2, 3, 4, 5], num_samples, p=[0.2, 0.4, 0.25, 0.1, 0.05])
    
    heart_rate = np.random.normal(75, 15, num_samples).astype(int)
    sys_bp = np.random.normal(120, 20, num_samples).astype(int)
    dia_bp = np.random.normal(80, 15, num_samples).astype(int)
    spo2 = np.random.normal(97, 2, num_samples)
    spo2 = np.clip(spo2, 85, 100).astype(int)
    
    surgery_types = ['General', 'Cardiac', 'Orthopedic', 'Neuro', 'Trauma']
    surgery_type = np.random.choice(surgery_types, num_samples, p=[0.4, 0.15, 0.25, 0.1, 0.1])
    
    emergency = np.random.choice([0, 1], num_samples, p=[0.8, 0.2])
    
    # Comorbidities
    hypertension = np.random.binomial(1, p=np.clip((age - 30) * 0.01, 0.05, 0.6))
    diabetes = np.random.binomial(1, p=np.clip((bmi - 20) * 0.02, 0.05, 0.4))
    cardiac_disease = np.random.binomial(1, p=np.where(asa_status >= 3, 0.5, 0.05))
    resp_disease = np.random.binomial(1, p=np.where(spo2 < 94, 0.6, 0.1))
    kidney_disease = np.random.binomial(1, p=np.where(asa_status >= 4, 0.4, 0.05))
    
    # Risk calculation (Logical continuous score)
    risk_score = (
        (age * 0.05) +
        (asa_status * 2) +
        (emergency * 3) +
        (hypertension * 1) +
        (diabetes * 1) +
        (cardiac_disease * 2) +
        (resp_disease * 1.5) +
        (kidney_disease * 1.5) +
        np.where(surgery_type == 'Cardiac', 3, 0) +
        np.where(surgery_type == 'Neuro', 2.5, 0) +
        np.where(surgery_type == 'Trauma', 2, 0) +
        np.where(spo2 < 92, 2, 0) +
        np.where((sys_bp > 160) | (sys_bp < 90), 2, 0) +
        np.random.normal(0, 1, num_samples) # Add some noise
    )
    
    # Categorize Risk
    risk_level = np.where(risk_score < 8, 'Low',
                 np.where(risk_score < 14, 'Medium', 'High'))
    
    # Survival Probability (Inverse logit of risk score)
    survival_prob = 1 / (1 + np.exp(0.3 * (risk_score - 10))) 
    survival_prob = np.clip(survival_prob, 0.01, 0.99)
    survival_prob = np.round(survival_prob, 4)
    
    # Complications (Binary Flags)
    # Higher risk score -> higher chance of complications
    hypotension = np.random.binomial(1, p=np.clip(risk_score * 0.03, 0.01, 0.8))
    arrhythmia = np.random.binomial(1, p=np.clip((cardiac_disease * 0.4) + (emergency * 0.1) + (risk_score * 0.02), 0.01, 0.7))
    postop_delirium = np.random.binomial(1, p=np.clip((age > 65) * 0.2 + (asa_status * 0.05) + (surgery_type == 'Neuro') * 0.15, 0.01, 0.6))
    
    df = pd.DataFrame({
        'age': age,
        'bmi': np.round(bmi, 1),
        'asa_status': asa_status,
        'heart_rate': heart_rate,
        'sys_bp': sys_bp,
        'dia_bp': dia_bp,
        'spo2': spo2,
        'surgery_type': surgery_type,
        'emergency': emergency,
        'hypertension': hypertension,
        'diabetes': diabetes,
        'cardiac_disease': cardiac_disease,
        'resp_disease': resp_disease,
        'kidney_disease': kidney_disease,
        'risk_level': risk_level,
        'survival_prob': survival_prob,
        'comp_hypotension': hypotension,
        'comp_arrhythmia': arrhythmia,
        'comp_postop_delirium': postop_delirium
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic dataset...")
    df = generate_synthetic_data(5000)
    
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'anesthesia_dataset.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully at: {output_path}")
    print(f"Shape: {df.shape}")
    print(df.head())
