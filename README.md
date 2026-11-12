# CycleCare

A modern, privacy-focused menstrual health tracking Progressive Web Application.

Track your cycles, log symptoms, get personalized daily wellness guidance, and discover patterns in your menstrual health.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript strict)
- **Styling:** Tailwind CSS v4, Plus Jakarta Sans
- **UI Components:** Custom shadcn/ui-inspired components
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Auth:** Supabase Auth (email/password)
- **State:** TanStack Query, React Hook Form + Zod
- **Testing:** Vitest, React Testing Library, Playwright
- **PWA:** Service worker, web manifest, offline support

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd count-cycles
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Go to **Settings → API** and copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, signup, forgot password
│   ├── (dashboard)/        # Protected dashboard pages
│   ├── api/auth/           # Auth callback route
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── ui/                 # Base UI components (Button, Card, Input, etc.)
│   ├── layout/             # App shell, navigation
│   └── shared/             # Offline indicator, update prompt
├── features/
│   ├── auth/               # Authentication & profile
│   ├── onboarding/         # New user onboarding wizard
│   ├── dashboard/          # Main dashboard, cycle ring
│   ├── periods/            # Period tracking hooks
│   ├── calendar/           # Interactive calendar
│   ├── symptoms/           # Symptom logging
│   ├── daily-care/         # Phase-based wellness guidance
│   ├── analytics/          # Insights & data export
│   └── education/          # Health education articles
├── hooks/                  # Shared React hooks
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   ├── validation/         # Zod schemas
│   ├── dates/              # Cycle prediction engine
│   └── utils/              # Utilities (cn)
├── providers/              # React context providers
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles
```

## Key Features

- **Cycle Tracking:** Log periods with start/end dates and flow intensity
- **Interactive Calendar:** Visual monthly calendar with period, symptom, and mood indicators
- **Cycle Predictions:** Deterministic prediction engine based on personal cycle history
- **Daily Care:** Phase-specific wellness guidance (nutrition, exercise, self-care)
- **Symptom Logging:** Track 14+ symptoms with severity ratings
- **Insights:** Cycle trends, symptom frequency, mood distribution, data export
- **Education:** Evidence-based menstrual health articles
- **PWA:** Installable, offline-capable app shell
- **Dark Mode:** System-aware theme switching
- **Privacy:** Row Level Security, no third-party trackers

## Database

PostgreSQL via Supabase with Row Level Security on all tables. Users can only access their own data. Tables:

- `profiles` — User profile and cycle estimates
- `user_preferences` — Theme, notifications, settings
- `period_records` — Period start/end dates
- `daily_logs` — Daily mood, energy, sleep, flow, notes
- `symptom_logs` — Individual symptom entries with severity
- `reminders` — Configurable reminders

## Testing

### Unit Tests (122 tests)
- Cycle prediction engine: 88 tests covering all calculation functions
- Validation schemas: 34 tests for all input schemas

### E2E Tests
- Landing page navigation
- Auth page rendering and validation
- PWA manifest accessibility
- Protected route redirects

## Deployment

### Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
4. Deploy

Preview deployments are automatic for pull requests.

### CI/CD

GitHub Actions runs on every push and PR:
1. Format check
2. ESLint
3. TypeScript type check
4. Unit tests with coverage
5. Production build
6. E2E tests (Chromium)

## Medical Disclaimer

CycleCare provides general educational information about menstrual health. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns. Do not rely on this app for contraception or medical decisions.

## Known Limitations

- PWA icons are SVG (PNG generation requires a build tool like Sharp)
- Offline data sync uses basic queue — conflicts resolve with server-wins strategy
- Web Push notifications depend on browser support (limited on iOS Safari)
- Ovulation estimates are calendar-based approximations with appropriate uncertainty warnings
- Coverage thresholds enforce 95%+ on core logic; UI components tested via E2E

## License

Private — All rights reserved.
