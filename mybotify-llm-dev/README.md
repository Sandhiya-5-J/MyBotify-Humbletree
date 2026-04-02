# Mybotify- backend

## 📋 Requirements

- Python 3.9+
- PostgreSQL
- Docker (optional)

## 🛠️ Installation

### Local Setup

1. Clone the repository

```bash
git clone git@github.com:humbletreeio/mybotify-llm.git
cd mybotify-llm
```

2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4 Run the application

```bash
/start-server.sh
```

## 📊 Database Migrations

Create a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback migration:

```bash
alembic downgrade -1
```

## 🔧 Development Tools

This project uses pre-commit hooks to ensure code quality:

```bash
pre-commit install
```

Format code manually:

```bash
black .
isort .
```

## 📚 API Documentation

After starting the server, access:

- Swagger UI: http://localhost:8000/docs
