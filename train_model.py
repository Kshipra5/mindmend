import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ---------------- LOAD DATASET ----------------
df = pd.read_csv("mental_health.csv")

print("Dataset Shape:", df.shape)
print(df.head())


# ---------------- FEATURES & LABEL ----------------
X = df.drop(["risk_level", "recommended_support"], axis=1)
y = df["risk_level"]


# ---------------- TRAIN TEST SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ---------------- MODEL ----------------
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42
)


# ---------------- TRAIN MODEL ----------------
model.fit(X_train, y_train)


# ---------------- PREDICTION ----------------
y_pred = model.predict(X_test)


# ---------------- EVALUATION ----------------
print("\nModel Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))


# ---------------- SAVE MODEL ----------------
joblib.dump(model, "mental_health_model.pkl")

print("\n✅ Model trained and saved as mental_health_model.pkl")

