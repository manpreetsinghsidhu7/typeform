# Typeform Clone

A full-stack, animated Typeform clone built with Next.js, FastAPI, and SQLite. This project is a minimal, beautifully designed application that replicates the core form-building and form-filling experience of Typeform.

## Features
- **Form Builder**: Drag-and-drop form creation with various question types.
- **Form Management**: Publish, unpublish, and manage forms.
- **Respondent Flow**: The iconic one-question-at-a-time form filling experience.
- **Results Viewer**: View submissions in a clean, tabular format.

## Architecture & Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion (for animations).
- **Backend**: FastAPI, Python 3, SQLAlchemy.
- **Database**: SQLite (Designed to be compatible with Turso via libSQL for edge deployment).
- **Deployment Strategy**: 
  - Backend: Render
  - Frontend: Vercel

## Getting Started

This repository contains two main folders: `frontend/` and `backend/`. Each has its own README with specific setup instructions.

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### Quick Start
1. **Backend Setup**: Navigate to `backend/`, install requirements, and run the FastAPI server. See `backend/README.md`.
2. **Frontend Setup**: Navigate to `frontend/`, install dependencies, and run the Next.js dev server. See `frontend/README.md`.

## Notes
- **Authentication**: Includes real JWT-based authentication for the form creator/admin workspace.
- **Database**: SQLite is used for simplicity but can be swapped out for Postgres or deployed on Turso using libSQL.
