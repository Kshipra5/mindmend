import pandas as pd
import random
import numpy as np

random.seed(42)
np.random.seed(42)

data = []

TOTAL_SAMPLES = 4000

# ---------------- GENERATE DATA ----------------
for _ in range(TOTAL_SAMPLES):

    # latent mental distress level
    base_level = random.randint(0, 4)

    # ---------------- FEATURES ----------------
    stress_level = int(np.clip(base_level + np.random.normal(0, 0.8), 0, 4))
    anxiety_level = int(np.clip(base_level + np.random.normal(0, 0.8), 0, 4))

    sleep_issue = int(np.clip(base_level + np.random.normal(0, 1), 0, 4))

    social_withdrawal = int(
        np.clip(base_level + np.random.normal(0, 1), 0, 4)
    )

    hopelessness = int(
        np.clip(base_level + np.random.normal(0, 1), 0, 4)
    )

    motivation_loss = int(
        np.clip(base_level + np.random.normal(0, 1), 0, 4)
    )

    emotional_exhaustion = int(
        np.clip(base_level + np.random.normal(0, 1), 0, 4)
    )

    overthinking = int(
        np.clip(base_level + np.random.normal(0, 1), 0, 4)
    )

    appetite_change = random.randint(0, 4)

    # self-harm feature
    if base_level >= 3:
        self_harm_thoughts = random.randint(1, 4)
    else:
        self_harm_thoughts = random.randint(0, 2)

    # ---------------- WEIGHTED SCORE ----------------
    severity_score = (
        stress_level * 10 +
        anxiety_level * 10 +
        sleep_issue * 8 +
        social_withdrawal * 8 +
        hopelessness * 12 +
        motivation_loss * 8 +
        emotional_exhaustion * 10 +
        overthinking * 8 +
        self_harm_thoughts * 14 +
        appetite_change * 6
    )

    severity_score = severity_score / 4

    # controlled realistic noise
    severity_score += np.random.normal(0, 2)

    severity_score = max(0, min(100, severity_score))

    # ---------------- LABELS ----------------
    if severity_score < 25:
        risk_level = "Low"

    elif severity_score < 45:
        risk_level = random.choices(
            ["Low", "Mild"],
            weights=[0.15, 0.85]
        )[0]

    elif severity_score < 60:
        risk_level = random.choices(
            ["Mild", "Moderate"],
            weights=[0.2, 0.8]
        )[0]

    elif severity_score < 75:
        risk_level = random.choices(
            ["Moderate", "High"],
            weights=[0.25, 0.75]
        )[0]

    elif severity_score < 90:
        risk_level = random.choices(
            ["High", "Critical"],
            weights=[0.2, 0.8]
        )[0]

    else:
        risk_level = "Critical"

    data.append({
        "stress_level": stress_level,
        "anxiety_level": anxiety_level,
        "sleep_issue": sleep_issue,
        "social_withdrawal": social_withdrawal,
        "hopelessness": hopelessness,
        "motivation_loss": motivation_loss,
        "emotional_exhaustion": emotional_exhaustion,
        "overthinking": overthinking,
        "self_harm_thoughts": self_harm_thoughts,
        "appetite_change": appetite_change,
        "severity_score": round(severity_score, 2),
        "risk_level": risk_level
    })

# ---------------- DATAFRAME ----------------
df = pd.DataFrame(data)

# shuffle
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# ---------------- SAVE ----------------
df.to_csv("mindmend_mental_health_dataset.csv", index=False)

print("\nProfessional realistic dataset generated!\n")

print(df["risk_level"].value_counts())

print("\nPreview:\n")
print(df.head())