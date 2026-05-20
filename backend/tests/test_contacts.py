"""Tests para contactos"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine

client = TestClient(app)

@pytest.fixture
def auth_token():
    """Obtener token de autenticación"""
    # Registrar y login
    client.post(
        "/auth/register",
        json={
            "email": "contact_test@example.com",
            "username": "contactuser",
            "password": "testpass123"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "contact_test@example.com",
            "password": "testpass123"
        }
    )
    return response.json()["access_token"]

def test_create_contact(auth_token):
    """Test crear contacto"""
    response = client.post(
        "/contacts/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Juan García",
            "email": "juan@example.com",
            "relationship": "friend",
            "interests": "Tecnología, viajes"
        }
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Juan García"

def test_get_contacts(auth_token):
    """Test listar contactos"""
    # Crear contacto primero
    client.post(
        "/contacts/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "María López",
            "relationship": "family"
        }
    )

    response = client.get(
        "/contacts/",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_contact(auth_token):
    """Test obtener contacto específico"""
    # Crear contacto
    create_response = client.post(
        "/contacts/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Carlos Ruiz",
            "relationship": "colleague"
        }
    )
    contact_id = create_response.json()["id"]

    response = client.get(
        f"/contacts/{contact_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Carlos Ruiz"

def test_update_contact(auth_token):
    """Test actualizar contacto"""
    # Crear contacto
    create_response = client.post(
        "/contacts/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Ana Torres",
            "relationship": "friend"
        }
    )
    contact_id = create_response.json()["id"]

    # Actualizar
    response = client.put(
        f"/contacts/{contact_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Ana Torres Martínez",
            "interests": "Fotografía, música"
        }
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Ana Torres Martínez"

def test_delete_contact(auth_token):
    """Test eliminar contacto"""
    # Crear contacto
    create_response = client.post(
        "/contacts/",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Pedro García",
            "relationship": "friend"
        }
    )
    contact_id = create_response.json()["id"]

    # Eliminar
    response = client.delete(
        f"/contacts/{contact_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200

    # Verificar que se eliminó
    response = client.get(
        f"/contacts/{contact_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 404
