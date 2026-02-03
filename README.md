# Academic Platform MVP LITE

A lightweight academic management system for internal use, built with Next.js 14 and Supabase.

## Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React.
- **Backend:** Supabase (Postgres, Auth, RLS).

## Prerequisities
- Node.js 18+
- Supabase Project

## Installation

1.  **Clone & Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create `.env.local` with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
    *(Note: For this MVP, these are already configured in the delivery environment)*

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`

## Demo Script (Guion de Demo)

### 1. Admin Setup (Pre-requisite)
- **Login** as Admin (requires `role='admin'` in `profiles`).
- **Create Academic Year:** Go to `/admin/dashboard`, create "2026".
- **Catalog:** Go to `/admin/catalog`, ensure Levels (Inicial, Primary, Secondary) exist. Create a Grade (e.g., "1st Grade") and Course (e.g., "Math").

### 2. User & Assignment Setup
- **Import Students:** Go to `/admin/students` -> Upload CSV.
    - *Sample CSV Row:* `first_names,last_names,level,grade,section` -> `John,Doe,Primaria,1st Grade,A`
- **Manage Teachers:** Go to `/admin/teachers`. (Note: Teachers must sign up via Auth first).
- **Assign:** Go to `/admin/assignments`. Assign Teacher -> Math -> 1st Grade -> 2026.

### 3. Teacher Workflow
- **Login** as Teacher.
- **Dashboard:** See "Math - 1st Grade" card.
- **Gradebook:** Open Gradebook.
- **Grading:**
    - Enter Grades (AD, A, B, C).
    - Enter Attendance (Att/Abs/Just).
    - Save (Auto-save on blur/change).

### 4. Blocking Logic (RLS)
- **Admin:** Go to Dashboard -> Close Bimester 1.
- **Teacher:** Refresh Gradebook. Inputs will be disabled and locked.

## QA Plan & Testing
See [QA_PLAN.md](./QA_PLAN.md) for detailed test cases.
