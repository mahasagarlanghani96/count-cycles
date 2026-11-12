# Deployment Guide

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/migrations/001_initial_schema.sql`
3. Verify tables were created: profiles, user_preferences, period_records, daily_logs, symptom_logs, reminders
4. Verify RLS is enabled on all tables
5. Copy your project URL and anon key from Settings → API

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | Yes |

## Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Set the environment variables listed above
4. Framework preset: Next.js (auto-detected)
5. Deploy

### Preview Deployments
- Every PR automatically gets a preview deployment
- Preview URLs use the PR number: `your-project-pr-123.vercel.app`

### Production Deployment
- Merges to `main` trigger production deployment
- Configure branch protection on GitHub to require passing CI checks

## GitHub Repository Setup

### Branch Protection (recommended)

Go to Settings → Branches → Add rule for `main`:
- Require a pull request before merging
- Require status checks to pass: `quality`, `test`, `build`
- Require branches to be up to date

### Secrets

Add these repository secrets for CI (Settings → Secrets):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Post-Deployment Checklist

- [ ] App loads at production URL
- [ ] Login and signup work
- [ ] Period logging persists to database
- [ ] Calendar shows logged data
- [ ] PWA manifest accessible at /manifest.webmanifest
- [ ] Service worker registers
- [ ] Dark mode toggles correctly
- [ ] Mobile navigation works
- [ ] No console errors with sensitive data
- [ ] RLS prevents cross-user data access
