🌿 MediTriage: Next-Gen Health AssessmentMediTriage is a professional medical triage application designed with a Healing Green wellness aesthetic. It leverages machine learning to analyze user symptoms and provide a preliminary triage status (Critical vs. Normal) while securely managing user data via a cloud-based Postgres database.

✨ Key Features

Healing Green UI: A calming, accessible design utilizing soft mint backgrounds, emerald accents, and fluid geometric animations.
AI-Powered Triage: Uses a Logistic Regression model and TF-IDF Vectorization to classify symptoms based on professional medical terminology
Interactive Survey: A multi-step health assessment with progress tracking and conditional follow-up questions based on pain levels and specific symptoms.
Secure Authentication: User sign-up and sign-in powered by Neon Postgres with hashed password security.
Interactive Visuals: Floating geometric "ElegantShapes" and smooth page transitions powered by Framer Motion.
Enhanced UX: Password visibility toggles ("Eye" icon) and responsive feedback through specialized toast notifications.

🛠️ Tech Stack

Frontend

Framework: React (Vite) 
Styling: Tailwind CSS 
Animations: Framer Motion 
Icons: Lucide React 
UI Components: Radix UI (Shadcn/UI) 

Backend

Language: Python 3

Framework: Flask 
Database: Neon Postgres (Serverless)
ORM: Flask-SQLAlchemy 
Deployment: Render

Machine Learning

Library: Scikit-Learn
Classification Model: Logistic Regression (model.pkl) 
Vectorization: TF-IDF Vectorizer (vectorized.pkl)
Vocabulary: Trained on symptoms like chest pain, shortness of breath, irregular heartbeat, and fever.

🚀 Getting Started

Backend Setup

1. Install Dependencies:
pip install flask flask-cors flask-sqlalchemy psycopg2-binary scikit-learn pandas gunicorn python-dotenv

2. Environment Variables:
Create a .env file in the backend root:
DATABASE_URL=postgresql://neondb_owner:npg_fVXkv9HzJh3g@ep-snowy-butterfly-anu5k8mx-pooler.c-6.us-east-1.aws.neon.tech/medicalservices?sslmode=require

3. Run Server:
python app.py

Frontend Setup

1. Install Dependencies:
npm install lucide-react framer-motion clsx tailwind-merge

2. Run Development Server:
npm run dev

📁 Project Structure

frontend/
├── src/
│   ├── components/
│   │   ├── layout/        # MainLayout with floating shapes 
│   │   └── ui/            # shape-landing-hero.tsx, button.tsx, etc. [cite: 12]
│   ├── features/
│   │   ├── auth/          # Auth.tsx (Green aesthetic) [cite: 14]
│   │   ├── survey/        # Survey.tsx (AI-integrated) 
│   │   └── triage/        # triage.ts (Logic) and results.tsx
│   └── lib/               # utils.ts (Tailwind merge)
└── tailwind.config.js     # Global Green Wellness palette [cite: 14]

backend/
├── app.py                 # Flask server with ML & DB routes 
├── model.pkl              # Logistic Regression model 
├── vectorized.pkl         # TfidfVectorizer 
└── requirements.txt       # Backend dependencies

🌐 Deployment

Backend: Deployed as a Web Service on Render using Gunicorn.
Frontend: Deployed as a Static Site on Render.
Database: Hosted on Neon.tech.

⚖️ Disclaimer
This application is a non-diagnostic demonstration for a hackathon project. The AI triage results do not constitute medical advice. Always consult a healthcare professional for medical assessments.