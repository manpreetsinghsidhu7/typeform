# Typeform Clone - Backend

This is the FastAPI backend for the Typeform Clone project. It handles database operations for forms, questions, and responses.

## Tech Stack
- Python 3.9+
- FastAPI
- SQLAlchemy (SQLite by default, compatible with PostgreSQL/Turso)
- Pydantic
- JWT Auth (python-jose, passlib)

## Local Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env`. The default SQLite database URL is fine for local development.

3. **Seed Database:**
   Run the seed script to populate the database with sample forms and responses. It will also create a default admin user (`username: admin`, `password: admin123`) so the app is immediately usable.
   ```bash
   python seed.py
   ```

4. **Run Server:**
   Start the FastAPI development server.
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`.
You can view the interactive Swagger API documentation at `http://localhost:8000/docs`.

## Deployment (Render)

This backend is designed to be easily deployed on Render.
1. Create a new Web Service on Render and point it to this repository.
2. Set the Root Directory to `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `DATABASE_URL`: Set to your production database URL (e.g., Turso libSQL or Render PostgreSQL).
   - `FRONTEND_URL`: Set to your Vercel frontend URL for CORS.
