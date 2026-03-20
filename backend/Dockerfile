FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for scipy/xgboost if needed
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application files (including ml_model binaries)
COPY . .

# Expose backend port
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
