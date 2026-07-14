
from flask import Flask, request, jsonify
from flask_cors import CORS

import numpy as np
import joblib
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

import bcrypt
import jwt
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Mail, Message

# chatbot
from chatbot import get_ai_reply

# ---------------- LOAD ENV ----------------
load_dotenv()

SECRET_KEY = "mindmend_secret_key_123"
MONGO_URI = os.getenv("MONGO_URI")

# ---------------- MONGODB ----------------
client = MongoClient(MONGO_URI)
db = client["mindmend"]

chat_collection = db["chats"]
results_collection = db["results"]
sos_collection = db["sos_alerts"]
users_collection = db["users"]
emotions_collection = db["emotions"]
journals_collection = db["journals"]
# ---------------- APP ----------------
app = Flask(__name__)
CORS(app)

# ---------------- MAIL CONFIG ----------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your_email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your_app_password'

mail = Mail(app)

# ---------------- MODEL ----------------
model = joblib.load("mental_health_model.pkl")
label_encoder = joblib.load("label_encoder.pkl")

# =================================================
# HELPERS
# =================================================

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_token(email):
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=1)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["email"]

    except:
        return None

# =================================================
# EMOTION DETECTOR
# =================================================

def detect_emotion(text):

    text = text.lower()

    if "suicide" in text or "kill myself" in text:
        return "suicidal"

    if "sad" in text or "cry" in text:
        return "sad"

    if "anxious" in text or "panic" in text:
        return "anxious"

    if "stress" in text:
        return "stressed"

    if "lonely" in text:
        return "lonely"

    if "angry" in text:
        return "angry"

    if "confused" in text:
        return "confused"

    if "happy" in text:
        return "happy"

    return "neutral"


# =================================================
# BUILD FEATURES FOR CHAT ML
# =================================================

def build_features(message, emotion):

    base = {
        "sad": 2,
        "anxious": 3,
        "stressed": 3,
        "lonely": 2,
        "angry": 2,
        "confused": 2,
        "happy": 0,
        "neutral": 1,
        "suicidal": 4
    }

    score = base.get(emotion, 1)

    features = np.array([[
        score,
        score,
        max(score - 1, 0),
        score,
        score,
        score,
        score,
        score,
        4 if emotion == "suicidal" else max(score - 1, 0),
        score
    ]])

    return features

# =================================================
# AUTH ROUTES
# =================================================

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    contact = data.get("contact")
    age = data.get("age")

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed = hash_password(password)

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed,
        "contact": contact,
        "age": age,
        "created_at": datetime.now(timezone.utc)
    })

    return jsonify({"message": "Signup successful"})


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not check_password(password, user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(email)

    return jsonify({
        "token": token,
        "name": user["name"],
        "email": user["email"]
    })


@app.route("/user", methods=["GET"])
def get_user():

    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "No token"}), 401

    email = verify_token(token)

    if not email:
        return jsonify({"error": "Invalid token"}), 401

    user = users_collection.find_one({"email": email})

    return jsonify({
        "name": user["name"],
        "email": user["email"]
    })

# =================================================
# FORGOT PASSWORD
# =================================================

@app.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()
    email = data.get("email")

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Email not found"}), 404

    token = jwt.encode({
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }, SECRET_KEY, algorithm="HS256")

    reset_link = f"http://localhost:3000/reset-password/{token}"

    try:
        msg = Message(
            subject="Reset Your Password - MindMend",
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )

        msg.body = f"""
Hi,

Click the link below to reset your password:

{reset_link}

This link will expire in 15 minutes.
"""

        mail.send(msg)

        return jsonify({"message": "Reset link sent to email"})

    except Exception as e:
        print("EMAIL FAILED:", e)

        return jsonify({
            "message": "Email not configured, use link manually",
            "reset_link": reset_link
        })


@app.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = data["email"]

    except:
        return jsonify({"error": "Invalid or expired token"}), 400

    new_password = request.json.get("password")

    hashed = hash_password(new_password)

    users_collection.update_one(
        {"email": email},
        {"$set": {"password": hashed}}
    )

    return jsonify({"message": "Password updated successfully"})

# =================================================
# CHAT
# =================================================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    message = data.get("message", "")
    email = data.get("email", "guest")

    emotion = detect_emotion(message)

    try:
        features = build_features(message, emotion)

        pred = model.predict(features)[0]
        risk_level = label_encoder.inverse_transform([pred])[0]

        probabilities = model.predict_proba(features)[0]
        confidence = round(float(np.max(probabilities)) * 100, 2)

    except Exception as e:
        print("Chat prediction error:", e)

        risk_level = "Low"
        confidence = 50

    reply = get_ai_reply(message, emotion, risk_level, email)

    chat_collection.insert_one({
        "user_id": email,
        "message": message,
        "reply": reply,
        "emotion": emotion,
        "risk_level": risk_level,
        "confidence": confidence,
        "timestamp": datetime.now(timezone.utc)
    })

    return jsonify({
        "reply": reply,
        "emotion": emotion,
        "risk_level": risk_level,
        "confidence": confidence
    })
# =================================================
# PREDICT
# =================================================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    answers = data.get("answers", [])
    email = data.get("email", "guest")

    try:

        # =================================================
        # ANSWER MAPPING
        # =================================================

        mapping = {

            # LOW
            "Not at all": 0,
            "No change": 0,
            "Never": 0,

            # MILD
            "Rarely": 1,
            "A little": 1,
            "Slight change": 1,
            "Occasionally": 1,
            "Mild": 1,

            # MODERATE
            "Sometimes": 2,
            "Moderate": 2,
            "Noticeable": 2,
            "Frequently": 2,

            # HIGH / CRITICAL
            "Often": 3,
            "Severe": 4,
            "Very often": 4,
            "Severe change": 4,
            "Always": 4
        }

        # =================================================
        # CONVERT ANSWERS
        # =================================================

        features = [mapping.get(a, 0) for a in answers]

        # ensure exactly 10 values
        while len(features) < 10:
            features.append(0)

        features = features[:10]

        # numpy conversion
        features_array = np.array([features])

        # =================================================
        # OPTIONAL ML MODEL
        # =================================================

        # model prediction only for background reference
        try:

            pred = model.predict(features_array)[0]

            ml_prediction = label_encoder.inverse_transform([pred])[0]

        except Exception as e:

            print("ML model error:", e)

            ml_prediction = "Unknown"

        # =================================================
        # SMART SEVERITY ENGINE
        # =================================================

        raw_score = sum(features)

        # max score = 40
        severity = int((raw_score / 40) * 100)

        severity = max(5, min(severity, 100))

        # =================================================
        # ANALYSIS
        # =================================================

        high_answers = sum(
            1 for x in features if x >= 3
        )

        moderate_answers = sum(
            1 for x in features if x >= 2
        )

        # self harm question = last question
        self_harm_score = features[9]

        # =================================================
        # CRITICAL OVERRIDES
        # =================================================

        # SELF HARM OVERRIDE
        if self_harm_score >= 3:

            severity = max(severity, 98)

        # MANY EXTREME ANSWERS
        elif high_answers >= 8:

            severity = max(severity, 95)

        elif high_answers >= 6:

            severity = max(severity, 88)

        elif high_answers >= 4:

            severity = max(severity, 75)

        # MANY MODERATE ANSWERS
        elif moderate_answers >= 7:

            severity = max(severity, 65)

        # =================================================
        # FINAL LABEL
        # =================================================

        if severity <= 20:

            prediction = "Low"

        elif severity <= 40:

            prediction = "Mild"

        elif severity <= 60:

            prediction = "Moderate"

        elif severity <= 80:

            prediction = "High"

        else:

            prediction = "Critical"

        # =================================================
        # SMART CONFIDENCE SCORE
        # =================================================

        if severity >= 90:

            confidence = 98

        elif severity >= 75:

            confidence = 92

        elif severity >= 60:

            confidence = 85

        elif severity >= 40:

            confidence = 78

        else:

            confidence = 70

    except Exception as e:

        print("Prediction error:", e)

        prediction = "Moderate"
        severity = 50
        confidence = 50

        high_answers = 0
        self_harm_score = 0

    # =================================================
    # SOS TRIGGER
    # =================================================

    sos_triggered = False

    if (
        severity >= 85
        or self_harm_score >= 3
        or high_answers >= 7
    ):

        sos_triggered = True

        sos_collection.insert_one({

            "email": email,

            "prediction": prediction,

            "severity": severity,

            "confidence": confidence,

            "answers": answers,

            "created_at": datetime.now(timezone.utc)

        })

    # =================================================
    # SAVE RESULT
    # =================================================

    existing = results_collection.find_one({
        "email": email,
        "answers": answers
    })

    if not existing:
        results_collection.insert_one({

            "email": email,
            "answers": answers,
            "prediction": prediction,
            "severity": severity,
            "confidence": confidence,
            "sos_triggered": sos_triggered,
            "ml_reference_prediction": ml_prediction,
            "created_at": datetime.now(timezone.utc)

        })

    # =================================================
    # RESPONSE
    # =================================================

    return jsonify({

        "prediction": prediction,

        "severity": severity,

        "confidence": confidence,

        "sos_triggered": sos_triggered

    })
# =================================================
# SAVE EMOTIONS
# =================================================

@app.route("/save-emotions", methods=["POST"])
def save_emotions():

    data = request.json

    emotions_collection.insert_one({
        "email": data.get("email"),
        "emotions": data.get("emotions"),
        "created_at": datetime.now(timezone.utc)
    })

    return jsonify({
        "message": "Saved"
    })

# =================================================
# SAVE JOURNAL
# =================================================

@app.route("/save-journal", methods=["POST"])
@jwt_required()
def save_journal():

    data = request.get_json()

    entry = {
        "user_id": get_jwt_identity(),
        "text": data.get("text"),
        "mood": data.get("mood"),
        "wordCount": data.get("wordCount"),
        "characterCount": data.get("characterCount"),
        "created_at": datetime.now(timezone.utc)
    }

    db.journals.insert_one(entry)

    return jsonify({
        "message": "Journal saved successfully"
    }), 201

# =================================================
# SAVE ASSESSMENT
# =================================================

@app.route("/save-assessment", methods=["POST"])
def save_assessment():

    data = request.get_json()

    try:

        assessment = {
            "email": data.get("email"),
            "prediction": data.get("prediction"),
            "severity": data.get("severity"),
            "emotionalState": data.get("emotionalState"),
            "sosTriggered": data.get("sosTriggered"),
            "created_at": datetime.now(timezone.utc)
        }

        results_collection.insert_one(assessment)

        return jsonify({
            "message": "Assessment saved successfully"
        }), 201

    except Exception as e:

        print("Save assessment error:", e)

        return jsonify({
            "error": "Failed to save assessment"
        }), 500

 # =================================================
# DASHBOARD
# =================================================
@app.route("/dashboard/<email>", methods=["GET"])
def dashboard(email):

    try:

        # ---------------- USER ----------------
        user = users_collection.find_one(
            {"email": email},
            {"password": 0}
        )

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        user["_id"] = str(user["_id"])

        # ---------------- ASSESSMENTS ----------------
        assessments = []

        for item in results_collection.find(
                {"email": email}
        ).sort("created_at", -1):

            item["_id"] = str(item["_id"])
            assessments.append(item)

        # ---------------- JOURNALS ----------------
        journals = []

        for item in journals_collection.find(
                {"user_id": email}
        ).sort("created_at", -1).limit(50):

            item["_id"] = str(item["_id"])
            journals.append(item)

        # ---------------- CHATS ----------------
        chats = []

        for item in chat_collection.find(
                {"user_id": email}
        ).sort("timestamp", -1).limit(50):

            item["_id"] = str(item["_id"])
            chats.append(item)

        # ---------------- EMOTIONS ----------------
        emotions = []

        for item in emotions_collection.find(
                {"email": email}
        ).sort("created_at", -1):

            item["_id"] = str(item["_id"])
            emotions.append(item)

        # ---------------- LATEST ASSESSMENT ----------------
        latest_assessment = (
            assessments[0]
            if len(assessments) > 0
            else None
        )

        # ---------------- DASHBOARD STATS ----------------
        total_assessments = len(assessments)

        critical_count = len([
            a for a in assessments
            if a.get("prediction") == "Critical"
        ])

        moderate_count = len([
            a for a in assessments
            if a.get("prediction") == "Moderate"
        ])

        mild_count = len([
            a for a in assessments
            if a.get("prediction") == "Mild"
        ])

        low_count = len([
            a for a in assessments
            if a.get("prediction") == "Low"
        ])

        sos_count = len([
            a for a in assessments
            if a.get("sos_triggered") == True
        ])

        average_severity = round(
            sum(
                a.get("severity", 0)
                for a in assessments
            ) / total_assessments,
            1
        ) if total_assessments > 0 else 0

        average_confidence = round(
            sum(
                a.get("confidence", 0)
                for a in assessments
                if "confidence" in a
            ) / max(
                len([
                    a for a in assessments
                    if "confidence" in a
                ]),
                1
            ),
            1
        )

        # ---------------- WELLNESS SCORE ----------------
        wellness_score = max(
            0,
            100 - average_severity
        )

        # ---------------- RETURN ----------------
        return jsonify({

            "user": user,

            "latestAssessment": latest_assessment,

            "assessments": assessments,

            "journals": journals,

            "chats": chats,

            "emotions": emotions,

            "stats": {

                "wellnessScore": wellness_score,

                "totalAssessments": total_assessments,

                "criticalCount": critical_count,

                "moderateCount": moderate_count,

                "mildCount": mild_count,

                "lowCount": low_count,

                "sosCount": sos_count,

                "averageSeverity": average_severity,

                "averageConfidence": average_confidence
            }

        })

    except Exception as e:

        print("Dashboard Error:", str(e))

        return jsonify({
            "error": str(e)
        }), 500
# =================================================
# RUN
# =================================================

if __name__ == "__main__":
    app.run(debug=True)
