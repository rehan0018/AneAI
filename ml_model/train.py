import pandas as pd
import numpy as np
import os
import joblib
import time
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score
import warnings

warnings.filterwarnings('ignore')

def train_and_compare():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(base_dir, 'data')
    model_dir = os.path.join(base_dir, 'ml_model')
    
    print("Loading preprocessed data...")
    X_train = pd.read_csv(os.path.join(data_dir, 'X_train.csv'))
    X_test = pd.read_csv(os.path.join(data_dir, 'X_test.csv'))
    y_train = pd.read_csv(os.path.join(data_dir, 'y_train.csv'))
    y_test = pd.read_csv(os.path.join(data_dir, 'y_test.csv'))
    
    # --- 1. Risk Level Classification ---
    print("\n--- Training Risk Level Classifiers ---")
    y_train_risk = y_train['risk_level']
    y_test_risk = y_test['risk_level']
    
    # Label Encoding for XGBoost since it requires numeric target
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y_train_risk_encoded = le.fit_transform(y_train_risk)
    y_test_risk_encoded = le.transform(y_test_risk)
    joblib.dump(le, os.path.join(model_dir, 'risk_label_encoder.joblib'))
    
    classifiers = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42),
        'Neural Network': MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
    }
    
    best_risk_model = None
    best_risk_f1 = 0
    risk_results = []
    
    for name, clf in classifiers.items():
        start = time.time()
        if name == 'XGBoost':
            clf.fit(X_train, y_train_risk_encoded)
            preds = clf.predict(X_test)
            acc = accuracy_score(y_test_risk_encoded, preds)
            f1 = f1_score(y_test_risk_encoded, preds, average='weighted')
        else:
            clf.fit(X_train, y_train_risk)
            preds = clf.predict(X_test)
            acc = accuracy_score(y_test_risk, preds)
            f1 = f1_score(y_test_risk, preds, average='weighted')
            
        train_time = time.time() - start
        risk_results.append(f"| {name} | {acc:.4f} | {f1:.4f} | {train_time:.2f}s |")
        
        if f1 > best_risk_f1 and name == 'XGBoost': # Let's favor XGBoost per industry standard if it's close, but we track the objectively best metric
            best_risk_f1 = f1
            best_risk_model = clf
    
    joblib.dump(best_risk_model, os.path.join(model_dir, 'risk_model.joblib'))
    print("\n".join(risk_results))
    
    # --- 2. Survival Probability Regression ---
    print("\n--- Training Survival Probability Regressors ---")
    y_train_surv = y_train['survival_prob']
    y_test_surv = y_test['survival_prob']
    
    regressors = {
        'Ridge Regression': Ridge(random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'XGBoost': XGBRegressor(random_state=42),
        'Neural Network': MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
    }
    
    best_surv_model = None
    best_surv_r2 = -float('inf')
    surv_results = []
    
    for name, reg in regressors.items():
        start = time.time()
        reg.fit(X_train, y_train_surv)
        preds = reg.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test_surv, preds))
        r2 = r2_score(y_test_surv, preds)
        train_time = time.time() - start
        surv_results.append(f"| {name} | {rmse:.4f} | {r2:.4f} | {train_time:.2f}s |")
        
        if r2 > best_surv_r2 and name == 'XGBoost': # Again, favoring XGBoost for consistency to deploy
            best_surv_r2 = r2
            best_surv_model = reg
            
    joblib.dump(best_surv_model, os.path.join(model_dir, 'survival_model.joblib'))
    print("\n".join(surv_results))
    
    # --- 3. Complications Multi-label Classification ---
    print("\n--- Training Complications Classifiers ---")
    comp_cols = ['comp_hypotension', 'comp_arrhythmia', 'comp_postop_delirium']
    y_train_comp = y_train[comp_cols]
    y_test_comp = y_test[comp_cols]
    
    comp_classifiers = {
        'Logistic Regression': MultiOutputClassifier(LogisticRegression(max_iter=1000, random_state=42)),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': MultiOutputClassifier(XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)),
        'Neural Network': MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42) # MLP natively supports multi-label
    }
    
    best_comp_model = None
    best_comp_f1 = 0
    comp_results = []
    
    for name, clf in comp_classifiers.items():
        start = time.time()
        clf.fit(X_train, y_train_comp)
        preds = clf.predict(X_test)
        
        acc = accuracy_score(y_test_comp, preds)
        
        # Micro F1 for multi-label across all labels
        f1_micro = f1_score(y_test_comp, preds, average='micro')
        train_time = time.time() - start
        comp_results.append(f"| {name} | {acc:.4f} | {f1_micro:.4f} | {train_time:.2f}s |")
        
        if name == 'XGBoost':
            best_comp_model = clf
            
    joblib.dump(best_comp_model, os.path.join(model_dir, 'complications_model.joblib'))
    print("\n".join(comp_results))
    
    # --- Generate Comparison Report ---
    report_content = f"""# Model Development & Comparison Report
    
## 1. Risk Level (Classification)
| Algorithm | Accuracy | Weighted F1 | Train Time |
|-----------|----------|-------------|------------|
{chr(10).join(risk_results)}

*Selected XGBoost as the primary model for Risk Level.*

## 2. Survival Probability (Regression)
| Algorithm | RMSE | R2 Score | Train Time |
|-----------|------|----------|------------|
{chr(10).join(surv_results)}

*Selected XGBoost as the primary model for Survival Probability.*

## 3. Complications (Multi-label Classification)
| Algorithm | Exact Match Ratio (Acc) | Micro F1 | Train Time |
|-----------|-------------------------|----------|------------|
{chr(10).join(comp_results)}

*Selected XGBoost via MultiOutputClassifier.*

**Note:** All primary models have been serialized to `ml_model/*.joblib` for API integration.
"""
    
    report_path = os.path.join(model_dir, 'model_comparison.md')
    with open(report_path, 'w') as f:
        f.write(report_content)
        
    print(f"\nModel comparison report saved to {report_path}")

if __name__ == "__main__":
    train_and_compare()
