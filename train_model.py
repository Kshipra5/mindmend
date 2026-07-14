import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# ---------------- LOAD DATASET ----------------
df = pd.read_csv("mindmend_mental_health_dataset.csv")

print("\nDataset Loaded Successfully!\n")

# ---------------- CHECK CLASS DISTRIBUTION ----------------
print("Class Distribution:\n")
print(df["risk_level"].value_counts())

# ---------------- FEATURES ----------------
# IMPORTANT:
# Do NOT use severity_score for training
# Otherwise the model cheats
X = df.drop(["risk_level", "severity_score"], axis=1)

# ---------------- TARGET ----------------
y = df["risk_level"]

# ---------------- LABEL ENCODING ----------------
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ---------------- TRAIN TEST SPLIT ----------------
# stratify helps maintain equal class distribution
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# ---------------- RANDOM FOREST MODEL ----------------
model = RandomForestClassifier(
    n_estimators=500,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42
)

# ---------------- TRAIN MODEL ----------------
print("\nTraining Model...\n")

model.fit(X_train, y_train)

print("Model Training Complete!")

# ---------------- PREDICTIONS ----------------
y_pred = model.predict(X_test)

# ---------------- ACCURACY ----------------
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy * 100:.2f}%")

# ---------------- CLASSIFICATION REPORT ----------------
print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=1
    )
)

# ---------------- CONFUSION MATRIX ----------------
print("\nConfusion Matrix:\n")

print(confusion_matrix(y_test, y_pred))

# ---------------- FEATURE IMPORTANCE ----------------
feature_importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="Importance",
    ascending=False
)

print("\nTop Important Features:\n")
print(feature_importance)

# ---------------- SAVE MODEL ----------------
joblib.dump(model, "mental_health_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")

print("\nModel Saved Successfully!")