import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# --- DATABASE CONFIGURATION ---
# Neon.tech Postgres connection
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://neondb_owner:npg_fVXkv9HzJh3g@ep-snowy-butterfly-anu5k8mx-pooler.c-6.us-east-1.aws.neon.tech/medicalservices?sslmode=require"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

# Create tables in Neon
with app.app_context():
    db.create_all()

# --- ML MODEL LOADING ---
# Load LogisticRegression  and TfidfVectorizer [cite: 21]
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)
except Exception as e:
    print(f"Model load error: {e}")

# --- AUTH ROUTES ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
    
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(name=data['name'], email=data['email'], password_hash=hashed_pw)
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Success"}), 201

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        return jsonify({"id": user.id, "name": user.name}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# --- PREDICTION ROUTE ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    user_input = data.get('symptoms', '')
    
    # Vectorize and classify as 'Critical' or 'Normal' [cite: 1, 21]
    vectorized_text = vectorizer.transform([user_input])
    prediction = model.predict(vectorized_text)[0]
    probabilities = model.predict_proba(vectorized_text)[0]
    
    return jsonify({
        "status": prediction,
        "confidence": round(float(np.max(probabilities)) * 100, 2)
    })

if __name__ == "__main__":
    # Use a port provided by Render or default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)