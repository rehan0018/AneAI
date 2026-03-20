# Model Development & Comparison Report
    
## 1. Risk Level (Classification)
| Algorithm | Accuracy | Weighted F1 | Train Time |
|-----------|----------|-------------|------------|
| Logistic Regression | 0.8560 | 0.8555 | 0.05s |
| Random Forest | 0.8310 | 0.8293 | 0.39s |
| XGBoost | 0.8390 | 0.8374 | 0.43s |
| Neural Network | 0.8150 | 0.8147 | 4.51s |

*Selected XGBoost as the primary model for Risk Level.*

## 2. Survival Probability (Regression)
| Algorithm | RMSE | R2 Score | Train Time |
|-----------|------|----------|------------|
| Ridge Regression | 0.0800 | 0.8757 | 0.00s |
| Random Forest | 0.0811 | 0.8724 | 1.25s |
| XGBoost | 0.0720 | 0.8993 | 0.08s |
| Neural Network | 0.0829 | 0.8666 | 0.28s |

*Selected XGBoost as the primary model for Survival Probability.*

## 3. Complications (Multi-label Classification)
| Algorithm | Exact Match Ratio (Acc) | Micro F1 | Train Time |
|-----------|-------------------------|----------|------------|
| Logistic Regression | 0.4170 | 0.3489 | 0.03s |
| Random Forest | 0.4100 | 0.3491 | 0.66s |
| XGBoost | 0.3600 | 0.3621 | 0.22s |
| Neural Network | 0.3270 | 0.3791 | 4.98s |

*Selected XGBoost via MultiOutputClassifier.*

**Note:** All primary models have been serialized to `ml_model/*.joblib` for API integration.
