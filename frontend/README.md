# Typeform Clone - Frontend

This is the Next.js frontend for the Typeform Clone project. It provides the form builder, form management dashboard, and the one-question-at-a-time respondent flow.

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (for smooth transitions)
- dnd-kit (for drag-and-drop form building)
- Axios (with JWT token handling)

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env.local` or `.env`. Ensure it points to your running backend.
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. **Run Server:**
   Start the Next.js development server.
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Deployment (Vercel)

This frontend is designed to be easily deployed on Vercel.
1. Import this repository into Vercel.
2. Set the Framework Preset to Next.js.
3. Set the Root Directory to `frontend`.
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Set to your production backend API URL (e.g., your Render URL).
