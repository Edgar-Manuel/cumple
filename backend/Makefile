.PHONY: help install dev test lint format migrate

help:
	@echo "Comandos disponibles:"
	@echo "  make install    - Instalar dependencias"
	@echo "  make dev        - Ejecutar en modo desarrollo"
	@echo "  make test       - Ejecutar tests"
	@echo "  make lint       - Ejecutar linter"
	@echo "  make format     - Formatear código"
	@echo "  make migrate    - Ejecutar migraciones"

install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest --cov=app -v

lint:
	flake8 app tests
	pylint app tests

format:
	black app tests

migrate:
	alembic upgrade head

db-init:
	alembic init -t async alembic

db-migrate:
	alembic revision --autogenerate -m "$(msg)"

docker-build:
	docker build -t cumple-api:latest .

docker-run:
	docker run -p 8000:8000 --env-file .env cumple-api:latest
