# TalentLens — IS026

Explainable AI-Based Recruitment and Skill Matching System

## Technology Stack

- React.js and Vite
- Python and Flask
- MySQL
- spaCy and Sentence Transformers
- PyMuPDF and python-docx

## Project Structure

- frontend/: React application
- backend/: Flask API and AI services
- docs/: Project documentation

## Development

Start the frontend from the frontend directory:

    npm install
    npm run dev

Start the backend from the backend directory after activating
the Python virtual environment:

    pip install -r requirements.txt
    python run.py

Frontend: http://localhost:5173
Backend: http://127.0.0.1:5000
Health endpoint: http://127.0.0.1:5000/api/health

Configure local environment variables before integrating MySQL
or deploying the application.