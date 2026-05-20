.PHONY: help install dev test migrate db-migrate docker-build docker-run

help:
	@echo "Comandos disponibles:"
	@echo "  make install     - Instalar dependencias"
	@echo "  make dev         - Ejecutar en modo desarrollo"
	@echo "  make test        - Ejecutar tests"
	@echo "  make migrate     - Ejecutar migraciones pendientes"
	@echo "  make db-migrate  - Crear nueva migración (msg='descripción')"
	@echo "  make docker-build - Construir imagen Docker"
	@echo "  make docker-run   - Ejecutar contenedor"

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest -v

migrate:
	alembic upgrade head

db-migrate:
	alembic revision --autogenerate -m "$(msg)"

docker-build:
	docker build -t cumple-api:latest .

docker-run:
	docker run -p 8000:8000 --env-file .env cumple-api:latest
