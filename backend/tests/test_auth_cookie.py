from fastapi.testclient import TestClient
from app.main import app


def test_login_sets_access_token_cookie(monkeypatch):
    # Monkeypatch the login_service to avoid DB dependency
    import app.routes.auth as auth_routes

    def fake_login_service(db, username, password):
        return {"access_token": "fake-token-123", "token_type": "bearer"}

    monkeypatch.setattr(auth_routes.auth_service, "login_service", fake_login_service)

    client = TestClient(app)
    resp = client.post("/auth/login", data={"username": "u", "password": "p"})

    assert resp.status_code == 200
    # server should return JSON payload
    assert resp.json().get("access_token") == "fake-token-123"

    # and set-cookie header must include access_token
    sc = resp.headers.get("set-cookie", "")
    assert "access_token=" in sc


def test_logout_clears_cookie():
    client = TestClient(app)
    resp = client.post("/auth/logout")
    assert resp.status_code == 200
    sc = resp.headers.get("set-cookie", "")
    # logout should attempt to clear the cookie (Set-Cookie present)
    assert "access_token=" in sc
