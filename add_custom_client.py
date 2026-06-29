import sqlite3
import os
import sys
from datetime import datetime, timedelta

def main():
    # Database path
    db_path = os.path.join("..", "..", "..", "..", "..", "OneDrive", "Desktop", "xlventure", "backend", "decisionflow.db")
    # Resolve relative path fallback
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "backend", "decisionflow.db")
    if not os.path.exists(db_path):
        db_path = "backend/decisionflow.db"
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found. Make sure you run this script from the workspace directory.")
        sys.exit(1)
        
    print(f"Connecting to database: {os.path.abspath(db_path)}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Prompt for input
    print("\n--- Register Custom Customer Profile ---")
    name = input("Client Contact Name (e.g. Sarah Jenkins): ").strip()
    company = input("Company Name (e.g. Stark Industries): ").strip()
    email = input("Email Address (e.g. sarah@stark.com): ").strip()
    
    try:
        health_score = int(input("Initial Health Score (0-100, e.g. 55): ").strip())
    except ValueError:
        health_score = 55
        
    risk_level = input("Risk Level (low, medium, high, e.g. medium): ").strip().lower()
    if risk_level not in ["low", "medium", "high"]:
        risk_level = "medium"
        
    # Renewal date
    renewal_days = 90
    try:
        renewal_days = int(input("Days until Renewal (e.g. 60): ").strip())
    except ValueError:
        pass
    renewal_date = (datetime.utcnow() + timedelta(days=renewal_days)).strftime("%Y-%m-%d %H:%M:%S")
    
    created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        cursor.execute(
            """
            INSERT INTO customers (name, company_name, email, health_score, risk_level, renewal_date, nps, domain, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (name, company, email, health_score, risk_level, renewal_date, 8, "customer_success", created_at)
        )
        conn.commit()
        customer_id = cursor.lastrowid
        print(f"\nSUCCESS: Added Customer '{name}' ({company}) with ID: {customer_id}")
        
        # Insert joined memory event
        cursor.execute(
            """
            INSERT INTO customer_memories (customer_id, interaction_type, content, health_score, risk_level, outcome, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (customer_id, "joined", f"Registered account profile for {name} ({company}). Onboarding sequence initiated.", health_score, risk_level, "completed", created_at)
        )
        conn.commit()
        print(f"Created initial timeline memory for Customer ID {customer_id}.")
        
    except Exception as e:
        print(f"Database error: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
