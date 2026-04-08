const rawBase = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

// Accept either http://host or http://host/api from env and normalize to /api.
export const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
