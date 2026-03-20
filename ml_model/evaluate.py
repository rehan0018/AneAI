import pandas as pd
import numpy as np
import os
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import seaborn as sns
import warnings

warnings.filterwarnings('ignore')

def evaluate_models():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    model_dir = os.path.join(base_dir, 'ml_model')
    data_dir = os.path.join(base_dir, 'data')
    
    print("Loading test data and models...")
    X_test = pd.read_csv(os.path.join(data_dir, 'X_test.csv'))
    y_test = pd.read_csv(os.path.join(data_dir, 'y_test.csv'))
    
    # Load Risk Model and Encoder
    risk_model = joblib.load(os.path.join(model_dir, 'risk_model.joblib'))
    label_encoder = joblib.load(os.path.join(model_dir, 'risk_label_encoder.joblib'))
    
    y_test_risk = y_test['risk_level']
    y_test_risk_encoded = label_encoder.transform(y_test_risk)
    
    print("Evaluating Risk Prediction Model (XGBoost)...")
    preds = risk_model.predict(X_test)
    pred_probs = risk_model.predict_proba(X_test)
    
    acc = accuracy_score(y_test_risk_encoded, preds)
    precision = precision_score(y_test_risk_encoded, preds, average='weighted')
    recall = recall_score(y_test_risk_encoded, preds, average='weighted')
    f1 = f1_score(y_test_risk_encoded, preds, average='weighted')
    roc_auc = roc_auc_score(y_test_risk_encoded, pred_probs, multi_class='ovr')
    
    # Save Confusion Matrix
    cm = confusion_matrix(y_test_risk_encoded, preds)
    fig, ax = plt.subplots(figsize=(8, 6))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=label_encoder.classes_)
    disp.plot(cmap='Blues', values_format='d', ax=ax)
    plt.title('Confusion Matrix - Risk Prediction (XGBoost)')
    plt.savefig(os.path.join(model_dir, 'confusion_matrix.png'))
    plt.close(fig)
    
    report = f"""# Detailed Evaluation Report (Best Models)

## 1. Anesthesia Risk Level (XGBoost)
- **Accuracy:** {acc:.4f}
- **Precision:** {precision:.4f}
- **Recall:** {recall:.4f}
- **F1-Score:** {f1:.4f}
- **ROC-AUC (OVR):** {roc_auc:.4f}

*Confusion Matrix saved as `confusion_matrix.png`*
"""
    with open(os.path.join(model_dir, 'detailed_evaluation.md'), 'w') as f:
        f.write(report)
        
    print("\nEvaluation complete! Report and Confusion Matrix generated.")

if __name__ == "__main__":
    evaluate_models()
