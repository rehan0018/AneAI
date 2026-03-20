import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def preprocess_data():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.join(base_dir, 'data', 'anesthesia_dataset.csv')
    
    # Check if dataset exists
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
    
    print("Loading dataset...")
    df = pd.read_csv(data_path)
    
    # Separate Features and Targets
    target_cols = ['risk_level', 'survival_prob', 'comp_hypotension', 'comp_arrhythmia', 'comp_postop_delirium']
    X = df.drop(columns=target_cols)
    y = df[target_cols]
    
    # Handle missing values (None in synthetic data, but good practice)
    X.fillna(X.median(numeric_only=True), inplace=True)
    X.fillna(X.mode().iloc[0], inplace=True)
    
    # Feature Lists
    numeric_features = ['age', 'bmi', 'asa_status', 'heart_rate', 'sys_bp', 'dia_bp', 'spo2']
    categorical_features = ['surgery_type']
    binary_features = ['emergency', 'hypertension', 'diabetes', 'cardiac_disease', 'resp_disease', 'kidney_disease']
    
    print("Building Preprocessing Pipeline...")
    
    # Create preprocessing steps
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    # Combine steps into ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features),
            ('bin', 'passthrough', binary_features) # Pass binary features as-is
        ])
    
    # Fit and Transform Features
    print("Fitting preprocessor...")
    X_processed = preprocessor.fit_transform(X)
    
    # Get Feature Names
    # For numeric and pass-through, the names remain the same
    # For categorical, we get the generated one-hot encoded strings
    cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_features)
    final_feature_names = numeric_features + list(cat_feature_names) + binary_features
    
    # Create processed DataFrame
    X_processed_df = pd.DataFrame(X_processed, columns=final_feature_names)
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X_processed_df, y, test_size=0.2, random_state=42)
    
    # Save processed datasets
    data_dir = os.path.join(base_dir, 'data')
    X_train.to_csv(os.path.join(data_dir, 'X_train.csv'), index=False)
    X_test.to_csv(os.path.join(data_dir, 'X_test.csv'), index=False)
    y_train.to_csv(os.path.join(data_dir, 'y_train.csv'), index=False)
    y_test.to_csv(os.path.join(data_dir, 'y_test.csv'), index=False)
    
    # Save the fitted preprocessor for the API backend to use in deployment
    preprocessor_path = os.path.join(base_dir, 'ml_model', 'preprocessor.joblib')
    joblib.dump((preprocessor, final_feature_names), preprocessor_path)
    
    print("Preprocessing completed successfully!")
    print(f"X_train shape: {X_train.shape}, y_train shape: {y_train.shape}")
    print(f"Preprocessor saved to: {preprocessor_path}")

if __name__ == "__main__":
    preprocess_data()
