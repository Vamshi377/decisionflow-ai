# Churn Risk Classification Model

Classifies account danger status (Low, Medium, High, Critical) using active telemetry:

* **Critical Churn Risk**: Health index < 40%, negative sentiments detected.
* **High Churn Risk**: Health index < 60%, multiple open tickets.
* **Medium Churn Risk**: Under-utilized plans.
* **Low Churn Risk**: Regular updates and high CSAT scores.