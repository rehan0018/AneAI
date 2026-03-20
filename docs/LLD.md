# Low-Level Design (LLD) - aneAI

## 1. Database Schema (SQLAlchemy Models)
**Table: `users`**
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `hashed_password` (String)
- `role` (String, default: "doctor")

**Table: `patient_records`**
- `id` (Integer, Primary Key)
- `age` (Integer), `bmi` (Float), `asa_status` (Integer)
- `heart_rate`, `sys_bp`, `dia_bp`, `spo2` (Integer)
- `surgery_type` (String), `emergency` (Integer, Boolean representation)
- Comorbidities mapping: `hypertension`, `diabetes`, `cardiac_disease`, `resp_disease`, `kidney_disease` (Integer)
- ML Outputs: `risk_level` (String), `survival_probability` (Float), `complications` (JSON/String mapping)
- `created_at` (DateTime)

## 2. API Endpoints
### Auth Module (`auth.py` & `/api/auth/`)
- `POST /api/auth/register`: Maps `UserCreate` Pydantic model -> bcrypt hashes password -> commits to DB -> returns Bearer JWT.
- `POST /api/auth/login`: Validates OAuth2PasswordRequestForm -> produces access_token via `python-jose`.

### Inference Module (`ml_service.py` & `/api/predict`)
- **Route:** `POST /api/predict`
- **Controller Logic:**
  - Ingests `PatientInput`.
  - Converts Pydantic struct to Python dict -> Pandas DataFrame natively.
  - `preprocessor.transform(df)`.
  - Resolves `risk_level` (XGBClassifier), `survival_probability` (XGBRegressor), and `complications` (MultiOutputClassifier).
  - Integrates `Propofol Induction Range` formula scaling down by 20% if `age > 65` or `asa >= 3`.
  - SQLAlchemy `db.add()` logs transaction.

### AI Assistant Module (`/api/chat`)
- Ingests `ChatMessage` pydantic string.
- Validates `os.getenv("GEMINI_API_KEY")`.
- Packages strictly controlled system prompt + user string natively executing `llm_model.generate_content()`.

## 3. Frontend Component Structure (`React`)
- `App.jsx`: Global router and layout constraints wrapper (`w-full flex-1`).
- `Sidebar.jsx`: Stateful navigation injecting patient metrics into centralized paths.
- `PatientEntryForm.jsx`: Captures complex states efficiently mapping inputs dynamically matching identical naming structures to the backend schema.
- `PredictionResults.jsx`: Transforms prediction floats into `Recharts` visualizations applying deterministic coloring bounds (`success/warning/danger`).
- `ChatWidget.jsx`: Anchored CSS positioned element mapping conversational arrays iteratively.
