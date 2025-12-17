import sqlite3
import os

db_path = "data/users.sqlite"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    # Search for it?
    for root, dirs, files in os.walk("."):
        if "users.sqlite" in files:
            print(f"Found at {os.path.join(root, 'users.sqlite')}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        print("Users:", users)
    except Exception as e:
        print("Error querying users:", e)
    conn.close()
