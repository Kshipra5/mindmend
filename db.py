import sqlite3

def create_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        age INTEGER NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    """)

    # Mental health reports table (SAFE DATA)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mental_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        risk_level TEXT,
        created_at DATE DEFAULT CURRENT_DATE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()
    print("✅ Database and tables created successfully")

if __name__ == "__main__":
    create_db()
