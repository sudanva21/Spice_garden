# Spice Garden Backend

This is the production-ready Node.js/Express backend for the Spice Garden eco-tourism destination.

## Stack
- Express.js + TypeScript
- Supabase (PostgreSQL, Auth, Storage)
- Anthropic Claude API (AI Chat)
- Resend API (Transactional Emails)
- Zod (Validation)
- Railway (Backend Deployment)
- Vercel (Frontend Deployment)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ANTHROPIC_API_KEY=<anthropic-key>
   RESEND_API_KEY=<resend-key>
   ADMIN_EMAIL=spicegarden@gmail.com
   FRONTEND_URL=http://localhost:3000
   PORT=3000
   NODE_ENV=development
   ```

3. Run migrations and seed data in your Supabase project using SQL Editor:
   - Run `supabase/migrations/20240101000000_init.sql`
   - Run `supabase/seed.sql`

4. Start development server:
   ```bash
   npm run dev
   ```

## Admin Panel
The admin dashboard is statically served at `http://localhost:3000/admin`. 
Log in using a Supabase authenticated user credentials (configured via Supabase Auth). 

## Deployment Guide

### Vercel (Frontend)
The `vercel.json` rewrite rules are prepared. Deploy the Stitch-generated frontend repo via Vercel dashboard and map the API URL.

### Railway (Backend)
The `railway.toml` file contains the build configs. Push this repository to GitHub, link it to Railway, and add the production environment variables there.

## API Documentation
The API conforms to `v1` REST standards at `/api/v1/`.
- `/api/v1/bookings`
- `/api/v1/chat`
- `/api/v1/spices`
- `/api/v1/events`
*(See complete endpoints inside `src/routes/api.ts`)*
