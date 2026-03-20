import pandas as pd
import numpy as np
import os
import joblib
import shap
import matplotlib.pyplot as plt
import warnings

warnings.filterwarnings('ignore')

def generate_explanations():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    model_dir = os.path.join(base_dir, 'ml_model')
    data_dir = os.path.join(base_dir, 'data')
    
    print("Loading test data and risk model...")
    X_test = pd.read_csv(os.path.join(data_dir, 'X_test.csv'))
    
    # Sample data to reduce SHAP computation time for large datasets
    # We will use 500 samples
    X_sample = X_test.sample(n=min(500, len(X_test)), random_state=42)
    
    risk_model = joblib.load(os.path.join(model_dir, 'risk_model.joblib'))
    
    print("Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(risk_model)
    shap_values = explainer.shap_values(X_sample)
    
    print("Generating SHAP Summary Bar Plot...")
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_sample, plot_type="bar", show=False)
    plt.title("Feature Importance - SHAP Summary (All Classes)")
    plt.tight_layout()
    plt.savefig(os.path.join(model_dir, 'shap_summary_bar.png'), bbox_inches='tight')
    plt.close('all')
    
    print(f"SHAP explanation artifacts saved in {model_dir}")

if __name__ == "__main__":
    generate_explanations()
