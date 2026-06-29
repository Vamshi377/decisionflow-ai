# Local Installation Guide

Follow these steps to set up DecisionFlow AI locally:

## Prerequisites
* Python 3.10+ installed.
* Node.js v18+ installed.

## Backend Setup
1. Clone the project.
2. Create python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Setup `.env` configuration (refer to `.env.example`).
5. Run the server:
   ```bash
   python backend/run.py
   ```

## Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```