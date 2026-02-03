# QA Plan - Academic Platform MVP LITE

## Critical Test Cases

### 1. Authentication & Roles
- [ ] **TC01:** Admin can access `/admin/*` routes.
- [ ] **TC02:** Teacher *cannot* access `/admin/*` routes (redirects or 404/Home).
- [ ] **TC03:** Teacher can access `/teacher/*` routes.
- [ ] **TC04:** Unauthenticated user is redirected to Login.

### 2. Academic Structure
- [ ] **TC05:** Creating a Year automatically creates 4 Bimesters (Triggers).
- [ ] **TC06:** Admin can toggle Bimester status (Open/Closed).

### 3. Catalog & Import
- [ ] **TC07:** Student Import creates Grade/Section if missing (Auto-resolution).
- [ ] **TC08:** Student Import handles duplicate DNI (Upsert).

### 4. Operations (Assignments & Grading)
- [ ] **TC09:** Teacher only sees their assigned courses.
- [ ] **TC10:** Teacher can enter grades (AD/A/B/C) when Bimester is OPEN.
- [ ] **TC11:** Teacher *cannot* enter grades when Bimester is CLOSED (UI Disabled + RLS Rejection).
- [ ] **TC12:** Admin can edit grades regardless of status? (Currently Admin is Superuser).

### 5. Data Integrity
- [ ] **TC13:** Invalid Grade values (e.g., 'F') are rejected by DB constraint.
- [ ] **TC14:** Attendance updates persist correctly.

## RLS Verification Checklist
- **Closed Bimester:** Attempting `supabase.from('qualitative_grades').update(...)` as Teacher returns error.
- **Cross-Access:** Teacher A attempting to read Teacher B's students returns empty set or error.

## Manual Demo Steps
1. Create Year 2026.
2. Import `students_demo.csv`.
3. Signup Teacher (`teacher@demo.com`).
4. Admin assigns Teacher to "Math".
5. Teacher grades Student 1 -> 'A'.
6. Admin closes Bimester 1.
7. Teacher tries to change to 'B' -> UI Blocked.
