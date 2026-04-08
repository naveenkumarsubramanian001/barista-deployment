# ─── Barista CI — Monolithic Dockerfile ──────────────────────────────────────
# Stage 1 (builder): install deps + build Vite frontend bundle with pnpm
# Stage 2 (runner):  Python backend that serves the FastAPI + static React build

# ─── Stage 1: Build Frontend ───────────────────────────────────────────────
FROM node:20-slim AS frontend-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
# Copy the entire pnpm workspace root
COPY frontend/ .
# Install all workspace dependencies
ENV CI=true
RUN pnpm install --frozen-lockfile
# Set env vars needed by the Vite build. VITE_API_BASE_URL is /api for monolithic
ENV PORT=5173
ENV BASE_PATH=/
ENV VITE_API_BASE_URL=/api
# Build the research-platform app
RUN pnpm --filter @workspace/research-platform run build

# ─── Stage 2: Build Backend & Serve ─────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# System dependencies for Playwright, spaCy, and python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies securely
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium browser
RUN python -m playwright install chromium --with-deps || true

# Copy python backend code
COPY backend/ .

# Bake the Environment file into the image
COPY backend/.env .

# Copy built frontend assets into static/ dir for FastAPI to serve
COPY --from=frontend-builder /app/artifacts/research-platform/dist/public /app/static

# Expose monolithic unified port
EXPOSE 8000

# Startup — production mode (FastAPI + Static React serving)
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
