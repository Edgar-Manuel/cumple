"""Tests para autenticación"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine

# Crear cliente de test
client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    """Setup database para tests"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_register(setup_db):
    """Test registrar usuario"""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_register_duplicate_email(setup_db):
    """Test registrar con email duplicado"""
    client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "user1",
            "password": "pass123"
        }
    )

    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "username": "user2",
            "password": "pass123"
        }
    )
    assert response.status_code == 400

def test_login(setup_db):
    """Test login"""
    # Registrar primero
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "testpass123"
        }
    )

    # Login
    response = client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_password(setup_db):
    """Test login con contraseña incorrecta"""
    client.post(
        "/auth/register",
        json={
            "email": "wrongpass@example.com",
            "username": "wrongpassuser",
            "password": "correctpass"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401
