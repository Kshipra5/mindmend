import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, UTC

load_dotenv()

# -------- CONNECT TO MONGODB -------- #

client = MongoClient(os.getenv("MONGO_URI"))

# Create database
db = client["mindmend"]

# Collections
users_collection = db["users"]
reports_collection = db["mental_reports"]

print("✅ Connected to MongoDB successfully")


# -------- USER FUNCTIONS -------- #

def create_user(name, contact, age, email, password):

    # Check if user already exists
    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        print("⚠️ User already exists")
        return False

    user = {
        "name": name,
        "contact": contact,
        "age": age,
        "email": email,
        "password": password
    }

    users_collection.insert_one(user)

    print("✅ User created successfully")
    return True


def get_user_by_email(email):

    try:
        user = users_collection.find_one({"email": email})
        return user

    except Exception as e:
        print("Error fetching user:", e)
        return None


# -------- MENTAL REPORT FUNCTIONS -------- #

def create_report(user_email, risk_level):

    report = {
        "user_email": user_email,
        "risk_level": risk_level,
        "created_at": datetime.now(UTC)
    }

    reports_collection.insert_one(report)

    print("✅ Mental health report saved")


def get_reports_by_user(user_email):

    reports = reports_collection.find({"user_email": user_email})

    return list(reports)


def get_all_reports():

    reports = reports_collection.find()

    return list(reports)


# -------- TESTING -------- #

if __name__ == "__main__":

    # Create sample user
    create_user(
        "Kshipra",
        "9876543210",
        21,
        "kshipra@gmail.com",
        "mypassword"
    )

    # Create mental health report
    create_report(
        "kshipra@gmail.com",
        "Moderate"
    )

    # Fetch reports
    reports = get_all_reports()

    for r in reports:
        print(r)