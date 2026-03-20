# Anesthesia Synthetic Dataset Description

The dataset `anesthesia_dataset.csv` contains 5,000 procedurally generated patient records for the purpose of training the Anesthesia Risk Prediction System. The data includes clinically relevant physical characteristics, baseline vitals, preexisting medical comorbidities, and target variables (risk, survival, complications).

## 1. Input Features (Predictors)
- **age**: Patient age (18 to 95)
- **bmi**: Body Mass Index (15.0 to 50.0) [Continuous]
- **asa_status**: ASA Physical Status Classification (1-5, where 1=healthy, 5=moribund) [Categorical/Ordinal]
- **heart_rate**: Heart rate in beats per minute [Continuous]
- **sys_bp**: Systolic blood pressure (mmHg) [Continuous]
- **dia_bp**: Diastolic blood pressure (mmHg) [Continuous]
- **spo2**: Oxygen saturation (%) [Continuous]
- **surgery_type**: String (General, Cardiac, Orthopedic, Neuro, Trauma) [Categorical]
- **emergency**: Binary flag (1 if emergency surgery, else 0) [Binary]

## 2. Comorbidities
Binary representations (1 = present, 0 = absent) generated mathematically utilizing correlations with age, BMI, and ASA status.
- **hypertension**
- **diabetes**
- **cardiac_disease**
- **resp_disease**
- **kidney_disease**

## 3. Output Variables (Targets)
- **risk_level**: The overall anesthesia risk classification (Low, Medium, High).
- **survival_prob**: A continuous probability score between 0.01 and 0.99 denoting survival likelihood.
- **comp_hypotension**: Binary flag indicating postoperative hypotension.
- **comp_arrhythmia**: Binary flag indicating intra/postoperative arrhythmia.
- **comp_postop_delirium**: Binary flag indicating postoperative delirium.
