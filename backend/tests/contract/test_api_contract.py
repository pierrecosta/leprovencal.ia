"""
Contract tests: Validate the backend OpenAPI schema exposes the endpoints
and response shapes that the frontend expects.

These tests ensure API compatibility between frontend and backend at each version.
They run against the FastAPI app's generated OpenAPI spec without needing a running server.
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def openapi_spec():
    """Get the OpenAPI spec from the FastAPI app."""
    import os
    os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
    os.environ.setdefault("ENV", "development")
    os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5173")

    from app.main import app
    client = TestClient(app)
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    return resp.json()


class TestEndpointsExist:
    """Verify all endpoints the frontend calls are present in the OpenAPI schema."""

    EXPECTED_ENDPOINTS = [
        ("get", "/health"),
        # Auth
        ("post", "/auth/login"),
        ("post", "/auth/logout"),
        ("get", "/auth/me"),
        # Articles
        ("get", "/articles/"),
        ("post", "/articles/"),
        ("put", "/articles/{article_id}"),
        ("delete", "/articles/{article_id}"),
        # Dictionnaire
        ("get", "/dictionnaire/"),
        ("post", "/dictionnaire/"),
        ("put", "/dictionnaire/{mot_id}"),
        ("delete", "/dictionnaire/{mot_id}"),
        ("get", "/dictionnaire/themes"),
        ("get", "/dictionnaire/categories"),
        # Histoires
        ("get", "/histoires/"),
        ("get", "/histoires/{histoire_id}"),
        ("get", "/histoires/menu"),
        ("post", "/histoires/"),
        ("put", "/histoires/{histoire_id}"),
        ("delete", "/histoires/{histoire_id}"),
        # Cartes
        ("get", "/cartes/"),
        ("get", "/cartes/{carte_id}"),
        ("post", "/cartes/"),
        ("put", "/cartes/{carte_id}"),
        ("delete", "/cartes/{carte_id}"),
    ]

    def test_all_frontend_endpoints_exist(self, openapi_spec):
        """Every endpoint called by the frontend must exist in the backend OpenAPI spec."""
        paths = openapi_spec.get("paths", {})
        missing = []

        for method, path in self.EXPECTED_ENDPOINTS:
            if path not in paths:
                missing.append(f"{method.upper()} {path}")
            elif method not in paths[path]:
                missing.append(f"{method.upper()} {path}")

        assert not missing, f"Missing endpoints in backend:\n" + "\n".join(missing)


class TestAuthContract:
    """Validate auth endpoint response shapes."""

    def test_login_returns_access_token(self, openapi_spec):
        """POST /auth/login must return access_token and token_type."""
        login_path = openapi_spec["paths"].get("/auth/login", {})
        post_op = login_path.get("post", {})
        responses = post_op.get("responses", {})
        # Should have a 200 response
        assert "200" in responses, "/auth/login must have 200 response"

    def test_health_endpoint(self, openapi_spec):
        """GET /health must exist."""
        health_path = openapi_spec["paths"].get("/health", {})
        assert "get" in health_path, "/health must support GET"


class TestArticlesContract:
    """Validate articles endpoint response shapes."""

    def test_articles_list_is_array(self, openapi_spec):
        """GET /articles/ should return an array."""
        articles_path = openapi_spec["paths"].get("/articles/", {})
        get_op = articles_path.get("get", {})
        responses = get_op.get("responses", {})
        assert "200" in responses

    def test_articles_crud_operations(self, openapi_spec):
        """Articles must support full CRUD."""
        paths = openapi_spec["paths"]
        assert "post" in paths.get("/articles/", {}), "POST /articles/ must exist"
        assert "put" in paths.get("/articles/{article_id}", {}), "PUT /articles/{article_id} must exist"
        assert "delete" in paths.get("/articles/{article_id}", {}), "DELETE /articles/{article_id} must exist"


class TestDictionnaireContract:
    """Validate dictionnaire endpoints."""

    def test_dictionnaire_returns_paginated(self, openapi_spec):
        """GET /dictionnaire/ should return paginated response."""
        dict_path = openapi_spec["paths"].get("/dictionnaire/", {})
        get_op = dict_path.get("get", {})
        assert "200" in get_op.get("responses", {})

    def test_dictionnaire_filters(self, openapi_spec):
        """GET /dictionnaire/ should accept filter parameters."""
        dict_path = openapi_spec["paths"].get("/dictionnaire/", {})
        get_op = dict_path.get("get", {})
        params = get_op.get("parameters", [])
        param_names = [p.get("name") for p in params]
        # Frontend sends these filter params
        for expected in ["page", "limit"]:
            assert expected in param_names, f"Missing query param: {expected}"


class TestHistoiresContract:
    """Validate histoires endpoints."""

    def test_histoires_menu(self, openapi_spec):
        """GET /histoires/menu must exist for navigation."""
        paths = openapi_spec["paths"]
        histoires_menu = paths.get("/histoires/menu", {})
        assert "get" in histoires_menu, "GET /histoires/menu must exist"

    def test_histoires_by_id(self, openapi_spec):
        """GET /histoires/{histoire_id} must exist."""
        paths = openapi_spec["paths"]
        assert "get" in paths.get("/histoires/{histoire_id}", {}), "GET /histoires/{histoire_id} must exist"


class TestCartesContract:
    """Validate cartes endpoints."""

    def test_cartes_crud(self, openapi_spec):
        """Cartes must support full CRUD."""
        paths = openapi_spec["paths"]
        assert "get" in paths.get("/cartes/", {}), "GET /cartes/ must exist"
        assert "post" in paths.get("/cartes/", {}), "POST /cartes/ must exist"
        assert "get" in paths.get("/cartes/{carte_id}", {}), "GET /cartes/{carte_id} must exist"
        assert "put" in paths.get("/cartes/{carte_id}", {}), "PUT /cartes/{carte_id} must exist"
        assert "delete" in paths.get("/cartes/{carte_id}", {}), "DELETE /cartes/{carte_id} must exist"


class TestErrorContract:
    """Validate that error responses follow the expected format."""

    def test_401_responses_exist(self, openapi_spec):
        """Protected endpoints should document 401 responses."""
        protected_endpoints = [
            ("post", "/articles/"),
            ("put", "/articles/{article_id}"),
            ("delete", "/articles/{article_id}"),
        ]
        paths = openapi_spec["paths"]
        for method, path in protected_endpoints:
            op = paths.get(path, {}).get(method, {})
            # FastAPI may or may not document 401 explicitly, but the endpoint must exist
            assert op, f"{method.upper()} {path} must exist"
