# NaukariHit: College Placement Management System

Full-stack web app for a college placement cell and its students.

**Stack:** Next.js 14 (React) · Supabase (PostgreSQL + Auth) · Tailwind CSS · Deployed on Vercel

## Features
**Students:** sign up and log in, build a profile, browse drives with an automatic eligibility check (CGPA, branch, deadline), apply in one click, track every application on a status timeline.
**Placement cell (admin):** post, edit and delete drives, view applicants per drive, update each applicant's status, export applicants to CSV, and see a live dashboard (placement rate, applications by stage, offers by company).
**Extras:** dark mode, responsive layout, role-based access enforced in the database with Row Level Security.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key
3. Run `supabase/schema.sql` in the Supabase SQL Editor (optionally `supabase/seed.sql` for sample drives)
4. `npm run dev` and open http://localhost:3000

## Make an admin
Sign up normally, then in the Supabase SQL Editor run:
`update public.profiles set role = 'admin' where email = 'your-email@example.com';`
