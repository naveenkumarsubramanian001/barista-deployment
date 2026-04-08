# ─── Barista CI — Backend Dockerfile ───────────────────────────────────────
# Base image: Python 3.11 slim for a smaller footprint
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# ---------------------------------------------------------------------------
# System dependencies
# Playwright needs chromium libs; spaCy model download requires curl/wget
# ---------------------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Python dependencies installed before source copy so Docker can cache them
# ---------------------------------------------------------------------------
COPY backend/requirements.txt .

# Upgrade pip then install all requirements
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium browser (required by scraper nodes)
RUN python -m playwright install chromium --with-deps || true

# ---------------------------------------------------------------------------
# Copy application source
# ---------------------------------------------------------------------------
COPY backend/ .

# ---------------------------------------------------------------------------
# SQLite paths are relative so the container working directory acts as the DB
# location. No extra volume config needed for development; mount /app in prod.
# ---------------------------------------------------------------------------

# Expose FastAPI port
EXPOSE 8000

# ---------------------------------------------------------------------------
# Startup — production mode (no --reload)
# ---------------------------------------------------------------------------
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
