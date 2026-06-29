# API Endpoint Reference Documentation

Serves details for all routes exposed by the FastAPI backend application.

## Endpoints List

### 1. GET `/`
* **Purpose**: Health check status.
* **Response**:
  ```json
  {
    "message": "Welcome to DecisionFlow AI Platform API",
    "documentation": "/docs",
    "status": "active"
  }
  ```

### 2. POST `/api/demo/login`
* **Purpose**: Performs login authentication for customer portal employees.
* **Request Body**:
  ```json
  {
    "username": "EMP01",
    "password": "password",
    "company_id": 1
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "company_id": 1,
    "company_name": "Tony",
    "client_name": "Tony Stark",
    "employee_id": "EMP01"
  }
  ```

### 3. POST `/api/demo/tickets`
* **Purpose**: Submits a support ticket from B2B customer employees.
* **Request Body**:
  ```json
  {
    "customer_id": 1,
    "category": "Bug",
    "priority": "High",
    "subject": "System crash on load",
    "description": "The app crashes when clicking checkout button."
  }
  ```

### 4. POST `/api/demo/gmail/sync`
* **Purpose**: Triggers IMAP email fetching process for the support mailbox.
* **Request Body**:
  ```json
  {
    "customer_id": 1
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "emails_synced_count": 3,
    "details": "Simulated email synchronization completed."
  }
  ```