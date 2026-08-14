# Typeform Clone

A highly polished, full-stack clone of the Typeform application that replicates Typeform's design, user experience, and core form-building and form-filling workflows.

## 🎨 UI Design Statement

This application was strictly designed to **totally resemble Typeform's design**. Careful attention was paid to the UI/UX elements, typography, spacing, and animations across the platform:
- **Landing Page**: Features a massive purple glow, custom hero typography, and animated workflow feature cards that match Typeform's dark-mode aesthetic.
- **Authentication (Login/Signup)**: Precisely replicates Typeform's dual-pane login screen, complete with authentic Google/Microsoft SSO placeholder buttons and the "Manage your audience" carousel preview.
- **Form Builder**: Includes a clean, sidebar-driven interface with a live-preview center stage and drag-and-drop question reordering.
- **Respondent Flow**: Features a distraction-free, one-question-at-a-time conversational experience powered by `framer-motion` for smooth slide transitions.
- **Dark Mode Support**: The platform supports dark mode across the builder, dashboard, and respondent flow using `next-themes`.

---

## 🛠 Tech Stack

**Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Drag-and-Drop**: dnd-kit
- **Icons**: Lucide React

**Backend**
- **Framework**: FastAPI (Python)
- **Database**: SQLite (via SQLAlchemy ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database seed script to populate sample data:
   ```bash
   python seed.py
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend runs on `http://127.0.0.1:8000`*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file (optional, defaults to localhost:8000):
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:3000`*

---

## 🏗 Architecture Overview

The application follows a decoupled client-server architecture:
- **Frontend (Next.js)**: Handles all routing, UI state, and animations. The application uses client-side rendering (`"use client"`) heavily for the builder and respondent flows to maintain fluid, app-like interactivity without full page reloads. Data fetching is abstracted into a custom `api` Axios instance that automatically attaches JWT tokens.
- **Backend (FastAPI)**: Serves as a RESTful API providing endpoints for Authentication, Form CRUD operations, Question management, and Response collection. It uses SQLAlchemy for ORM mapping to a local SQLite database.

**Key Interactions:**
- **Builder Flow**: When creating or editing forms, the frontend aggressively caches state locally and performs optimistic UI updates (e.g., when reordering questions via drag-and-drop or updating titles) while simultaneously issuing `PUT` requests to the backend.
- **Respondent Flow**: Designed for extreme speed and focus. Questions are pre-fetched along with the form metadata. Responses are collected in memory and submitted in a single bulk transaction at the end of the flow.

---

## 🗄 Database Schema

The database uses SQLite with the following normalized schema designed using SQLAlchemy:

### `users`
- `id` (String, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `hashed_password` (String)

### `forms`
- `id` (String, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `status` (String) - Enum: 'draft', 'published'
- `is_public` (Boolean) - Default: True
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `user_id` (String, Foreign Key -> `users.id`)

### `questions`
- `id` (String, Primary Key)
- `form_id` (String, Foreign Key -> `forms.id`)
- `type` (String) - Enum: 'short_text', 'long_text', 'multiple_choice', 'dropdown', 'email', 'number', 'yes_no', 'rating'
- `title` (String)
- `description` (String, Optional)
- `is_required` (Boolean) - Default: False
- `order` (Integer) - Determines display sequence
- `options` (String, Optional) - JSON stringified array for choices

### `responses`
- `id` (String, Primary Key)
- `form_id` (String, Foreign Key -> `forms.id`)
- `submitted_at` (DateTime)

### `answers`
- `id` (String, Primary Key)
- `response_id` (String, Foreign Key -> `responses.id`)
- `question_id` (String, Foreign Key -> `questions.id`)
- `value` (String) - The respondent's answer stored as text

---

## 📝 Assumptions Made

1. **Authentication (Evaluation Mode)**: A custom hook (`useAdminAuth.ts`) is used in the frontend. If a valid token is not found, it automatically provisions and logs in a default "Admin" user for ease of evaluation by reviewers, while still fully supporting real JWT authentication if a user registers/logs in normally.
2. **Mocked Features**: As per requirements, "Advanced Logic Jumps", "Integrations", "Team Collaboration", "Payments", and "File Uploads" are visually implemented as "Coming Soon" placeholders and are not functionally backed by the database.
3. **Draft/Published Logic**: The respondent flow (`/f/[id]`) checks the form's `status`. If a form is not `published`, respondents cannot access it.
4. **Data Types**: All answers are stringified before being stored in the database. For example, a "Rating" question will store the value `"4"`, which allows for a simplified, flexible schema.
5. **No Image Uploads**: Profile pictures and custom form backgrounds were omitted to keep the architecture focused on core builder/respondent workflows without needing cloud storage dependencies.
