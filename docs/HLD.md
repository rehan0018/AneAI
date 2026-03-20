# High-Level Design (HLD) - aneAI

## 1. System Architecture Overview
The aneAI System is an end-to-end Machine Learning pipeline integrated with a secure web application for predicting Anesthesia Risks, Patient Survival Probabilities, and Surgical Complications.
The architecture is divided into three major tiers:
1. **Presentation Layer (Frontend):** React (Vite) + TailwindCSS dashboard providing responsive, user-friendly forms for capturing clinical metrics.
2. **Business & API Layer (Backend):** FastAPI Python server utilizing Pydantic for rigid real-time validation, JWT for role-based Doctor Authentication, and direct endpoints handling inference routing.
3. **Data & ML Layer:**
   - **Database:** PostgreSQL/SQLite ORM schema (SQLAlchemy) managing historical `PatientRecord` arrays.
   - **ML Engine:** Pre-fitted `xgboost` (XGBClassifier for Risk/Complications, XGBRegressor for Survival) models loaded into memory via `joblib`.

## 2. Component Interaction & Data Flow
1. **User Authentication:** Doctor logs in -> Frontend receives JWT -> UI unlocks.
2. **Prediction Pipeline:** 
   - Doctor submits biometrics via React form.
   - JSON Payload sent to `/api/predict`.
   - FastAPI loads `preprocessor.joblib` to scale numericals/One-hot encode categories.
   - Inference runs mapped against 3 distinct XGBoost layers natively.
   - Results + Dosages merged into `PredictionResponse`.
   - Payload saved to SQL Database synchronously before JSON is returned.
3. **Clinical Assistant (LLM):** Queries sent to `/api/chat` hit the Google Gemini 1.5 Flash API directly using injected clinical system prompts and streaming the response back.

## 3. Deployment Architecture
- Configured inherently via `docker-compose.yml`. 
- Nginx serves the static React build on Port 80. 
- The Uvicorn REST API operates on Port 8000 asynchronously.
- Persistent volumes mount to the local PostgreSQL container for DB state.
