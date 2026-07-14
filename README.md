# 🧠 MindMend

An AI-powered mental health assessment and wellness platform that combines **Machine Learning**, **Full-Stack Web Development**, and **Data Analytics** to help users monitor, assess, and understand their mental well-being.

MindMend provides a secure environment where users can register, complete mental health assessments, track their moods, interact with an AI-powered chatbot, and visualize their emotional journey through an interactive analytics dashboard. The platform integrates a **Random Forest Machine Learning model** to predict a user's mental health risk level based on questionnaire responses, enabling early awareness and encouraging proactive self-care.

---

## ✨ Features

* 🔐 Secure user authentication using JWT
* 👤 User registration and login
* 📧 Email-based password recovery
* 📝 Mental health assessment questionnaire
* 🧠 Machine Learning-based mental health risk prediction
* 😊 Daily mood tracking
* 💬 AI-powered mental health chatbot
* 📊 Interactive analytics dashboard
* 📈 Weekly, monthly, and yearly mood analytics
* 📚 Assessment and chat history
* 🚨 SOS emergency support feature
* ☁️ Secure MongoDB data storage

---

## 🛠️ Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Flask
* Flask-JWT-Extended
* Flask-Mail
* REST APIs

### Machine Learning

* Python
* Scikit-learn
* Random Forest Classifier
* Pandas
* NumPy
* Joblib
* Label Encoding
* Train-Test Split
* Feature Importance Analysis
* Model Evaluation (Accuracy, Classification Report, Confusion Matrix)

### Database

* MongoDB

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

## 🧠 Machine Learning Pipeline

The prediction model was developed using **Scikit-learn** to classify a user's mental health risk level based on assessment responses.

### Workflow

1. Load and preprocess the mental health dataset using Pandas.
2. Remove non-predictive features to prevent data leakage.
3. Encode target labels using LabelEncoder.
4. Perform a stratified train-test split.
5. Train a Random Forest Classifier with optimized hyperparameters.
6. Evaluate the model using:

   * Accuracy Score
   * Classification Report
   * Confusion Matrix
7. Analyze feature importance to identify significant mental health indicators.
8. Save the trained model and label encoder using Joblib for deployment with Flask.

---

## 📊 Dashboard

The dashboard enables users to monitor their mental well-being through:

* Mood trend visualization
* Weekly, monthly, and yearly analytics
* Emotional progress tracking
* Assessment history
* Chat history overview
* Personalized mental health insights

---

## 📂 Project Structure

```text
MindMend/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.js
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── models/
│   ├── utils/
│   ├── requirements.txt
│   ├── mental_health_model.pkl
│   └── label_encoder.pkl
│
├── dataset/
│   └── mindmend_mental_health_dataset.csv
│
└── README.md
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/MindMend.git
cd MindMend
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

python app.py
```

### Frontend Setup

```bash
cd frontend

npm install
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET_KEY=your_secret_key

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

SECRET_KEY=your_flask_secret
```

---

## 📈 Model Evaluation

The Machine Learning model is evaluated using multiple performance metrics to ensure reliable predictions:

* Accuracy Score
* Classification Report
* Confusion Matrix
* Feature Importance Analysis

These metrics help validate the model's performance and identify the factors that contribute most to mental health risk prediction.

---

## 🔒 Security

MindMend prioritizes user privacy through:

* JWT-based authentication
* Password hashing
* Protected API endpoints
* Secure password recovery
* Encrypted user credential handling
* Secure MongoDB data storage

---

## 🌱 Future Enhancements

* Personalized wellness recommendations
* Voice-based emotion analysis
* Therapist appointment scheduling
* PDF report generation
* Report sharing with healthcare professionals
* Mobile application
* Daily wellness reminders
* Dark mode support

---

## ⚠️ Disclaimer

This project was developed as part of an academic major project for educational and portfolio purposes. It is intended to demonstrate practical knowledge of **Machine Learning, Artificial Intelligence, Full-Stack Web Development, and Data Analytics**.

The source code, design, documentation, and implementation are the intellectual work of the author. Unauthorized copying, redistribution, modification, or submission of this project as academic work without permission is prohibited.

This application is **not a substitute for professional medical advice, diagnosis, or treatment**. The predictions generated by the Machine Learning model are intended solely for educational and research purposes and should not be considered clinical recommendations.

---

## 👩‍💻 Author

**Kshipra Navin**

B.Tech – Computer Science Engineering

**Skills:** Python • Machine Learning • React.js • Flask • MongoDB • Java • SQL • Data Analytics

---

## 📬 Contact

Feel free to connect for collaboration, project discussions, or opportunities.

* GitHub: https://github.com/your-username
* LinkedIn: https://linkedin.com/in/your-profile

---

⭐ **If you found this project interesting, consider giving it a Star on GitHub!**

