from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import joblib
import numpy as np

model = joblib.load("mental_health_model.pkl")

app = Flask(__name__)
app.secret_key = "mindmend_secret_key"


# --------------- DATABASE CONNECTION ----------------
def get_db_connection():
    conn = sqlite3.connect("users.db", timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------- HOME ----------------
@app.route("/")
def home():
    return render_template("index.html")


# ---------------- SIGNUP ----------------
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        name = request.form.get("name")
        contact = request.form.get("contact")
        age = request.form.get("age")
        email = request.form.get("email")
        password = request.form.get("password")

        if not all([name, contact, age, email, password]):
            return render_template("signup.html", error="All fields are required.")

        import re
        email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_pattern, email):
            return render_template("signup.html", error="Please enter a valid email address.")

        if len(password) < 6:
            return render_template("signup.html", error="Password must be at least 6 characters long.")

        try:
            with get_db_connection() as conn:
                conn.execute(
                    """
                    INSERT INTO users (name, contact, age, email, password)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (name, contact, int(age), email, password)
                )
                conn.commit()

            session["user"] = email
            return redirect(url_for("questionnaire"))

        except sqlite3.IntegrityError:
            return render_template("signup.html", error="An account with this email already exists.")

    return render_template("signup.html")


# ---------------- LOGIN ----------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        with get_db_connection() as conn:
            user = conn.execute(
                "SELECT * FROM users WHERE email=? AND password=?",
                (email, password)
            ).fetchone()

        if user:
            session["user"] = email
            return redirect(url_for("questionnaire"))
        else:
            return render_template("login.html", error="Invalid email or password. Please try again.")

    return render_template("login.html")


# ---------------- QUESTIONNAIRE ----------------
@app.route("/questionnaire", methods=["GET"])
def questionnaire():
    if "user" not in session:
        return redirect(url_for("login"))

    return render_template("questionnaire.html")


# ---------------- DASHBOARD ----------------
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login"))

    return render_template("dashboard.html")


# ---------------- THANK YOU ----------------
@app.route("/thank-you")
def thank_you():
    return "<h2 style='text-align:center;margin-top:100px;'>Thank you for checking in </h2>"


# ---------------- LOGOUT ----------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------------- RESULT (Optional Direct Access) ----------------
@app.route("/result")
def result():
    if "user" not in session:
        return redirect(url_for("login"))

    score = 50
    level = "Moderate"
    color = "#facc15"
    emotions = []

    strategies = [
        {
            "title": "Controlled Breathing",
            "description": "Inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds."
        }
    ]

    return render_template(
        "result.html",
        prediction=level,
        severity=score,
        strategies=strategies,
        score=score,
        level=level,
        color=color,
        emotions=emotions
    )


# ---------------- PREDICT (MODEL) ----------------
@app.route("/predict", methods=["POST"])
def predict():
    if "user" not in session:
        return redirect(url_for("login"))

    # Collect answers
    features = [int(request.form[f"q{i+1}"]) for i in range(10)]
    input_data = np.array([features])

    # Model prediction
    risk_level = model.predict(input_data)[0]

    # Override for self-harm
    if features[9] >= 3:
        risk_level = "Critical"

    # Score & Color Maps
    color_map = {
        "Low": "#4ade80",
        "Moderate": "#facc15",
        "High": "#f87171",
        "Critical": "#b91c1c"
    }

    score_map = {
        "Low": 25,
        "Moderate": 50,
        "High": 75,
        "Critical": 100
    }

    # --------- INTERACTIVE RISK-BASED ACTIVITIES ---------

    if risk_level == "Low":
        strategies = [
            {
                "title": "Guided Breathing",
                "description": "Practice calm breathing to maintain balance.",
                "type": "breathing"
            }
        ]

    elif risk_level == "Moderate":
        strategies = [
            {
                "title": "4-4-6 Breathing Exercise",
                "description": "Inhale 4 sec, hold 4 sec, exhale 6 sec.",
                "type": "breathing"
            },
            {
                "title": "Gratitude Reflection",
                "description": "Write 3 things you’re grateful for.",
                "type": "reflection"
            }
        ]

    elif risk_level == "High":
        strategies = [
            {
                "title": "5-4-3-2-1 Grounding",
                "description": "Use grounding to reduce anxiety.",
                "type": "grounding"
            },
            {
                "title": "Muscle Relaxation",
                "description": "Tense and release muscle groups slowly.",
                "type": "relaxation"
            }
        ]

    else:  # Critical
        strategies = [
            {
                "title": "Emergency Calm Breathing",
                "description": "Slow breathing to stabilize emotions.",
                "type": "breathing"
            },
            {
                "title": "Immediate Professional Support",
                "description": "Please contact a professional immediately.",
                "type": "support"
            }
        ]

    return render_template(
        "result.html",
        prediction=risk_level,
        severity=score_map.get(risk_level, 0),
        strategies=strategies,
        score=score_map.get(risk_level, 0),
        level=risk_level,
        color=color_map.get(risk_level, "#000000"),
        emotions=[]
    )


# ---------------- RUN APP ----------------
if __name__ == "__main__":
    app.run(debug=True)