# Production Deployment Reference Guide

DecisionFlow AI can be deployed on cloud services like Render, Vercel, or Heroku.

## Backend Deployment (Render / Heroku)
1. Add a `render.yaml` or run direct commands:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Configure environmental variables on Render console:
   - `GEMINI_API_KEY`
   - `SUPPORT_EMAIL`
   - `SUPPORT_APP_PASSWORD`

## Frontend Deployment (Vercel / Netlify)
1. Point build folder configuration to Vite output: `frontend/dist`.
2. Override build command:
   ```bash
   cd frontend && npm install && npm run build
   ```
3. Expose environment variable: `VITE_API_BASE_URL` pointing to backend domain.