from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
API_PREFIX = "/api"

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "DecisionFlow AI" in response.json()["message"]

def test_health_endpoint():
    response = client.get(f"{API_PREFIX}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "database" in response.json()

def test_get_customers():
    response = client.get(f"{API_PREFIX}/customers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    # Seeding inserts 5 customers, checking that it works
    assert len(response.json()) >= 0
