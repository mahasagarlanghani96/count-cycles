# QA Checklist

## Build & CI
- [x] TypeScript compiles with zero errors (`npm run typecheck`)
- [x] ESLint passes (`npm run lint`)
- [x] Prettier formatting consistent (`npm run format:check`)
- [x] Production build succeeds (`npm run build`)
- [x] Unit tests pass (122 tests)
- [x] Core logic coverage 95%+ (cycle-engine, validation schemas)
- [x] GitHub Actions CI configured

## Authentication
- [ ] Email signup creates account
- [ ] Email confirmation flow works
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Forgot password sends reset email
- [ ] Logout clears session
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Authenticated users redirected from auth pages to dashboard

## Onboarding
- [ ] Multi-step wizard advances/goes back
- [ ] Optional fields can be skipped
- [ ] Cycle length accepts 18-45 range
- [ ] Period length accepts 1-14 range
- [ ] Saves to profiles and preferences tables
- [ ] Redirects to dashboard on completion

## Dashboard
- [ ] Shows current cycle day
- [ ] Shows estimated phase
- [ ] Displays cycle ring visualization
- [ ] Quick action: Start Period creates record
- [ ] Quick action: End Period updates record
- [ ] Daily guidance shows phase-appropriate content
- [ ] Loading skeleton shown during data fetch

## Calendar
- [ ] Monthly navigation works
- [ ] Period days highlighted
- [ ] Predicted days shown with different style
- [ ] Day click opens detail dialog
- [ ] Can log flow intensity
- [ ] Can log mood
- [ ] Can add symptoms
- [ ] Historical months are browsable

## Symptoms
- [ ] 14 common symptoms selectable
- [ ] Severity selector works (mild/moderate/severe)
- [ ] Saves to symptom_logs table
- [ ] Today's logged symptoms displayed
- [ ] Can delete logged symptoms

## Daily Care
- [ ] Shows phase-appropriate content
- [ ] Covers all 4 phases + unknown
- [ ] Self-care tips relevant to phase
- [ ] Exercise suggestions appropriate
- [ ] Nutrition guidance present
- [ ] "When to see a doctor" section included

## Insights
- [ ] Cycle length trend chart renders
- [ ] Stat cards show correct values
- [ ] Symptom frequency chart works
- [ ] Mood distribution shows logged moods
- [ ] Period history list accurate
- [ ] CSV export downloads file
- [ ] Doctor summary export downloads file
- [ ] "Insufficient data" shown when appropriate

## Profile
- [ ] Display name editable
- [ ] Theme switching works (light/dark/system)
- [ ] Notification preferences toggle
- [ ] Export all data downloads JSON
- [ ] Delete account requires "DELETE" confirmation
- [ ] Sign out works

## Education
- [ ] All 5 articles render
- [ ] Expandable cards work
- [ ] Sources listed
- [ ] Medical disclaimer visible

## PWA
- [ ] manifest.webmanifest accessible
- [ ] Service worker registers
- [ ] App installable on supported browsers
- [ ] Offline indicator shows when disconnected
- [ ] Update prompt appears when new version available
- [ ] Icons display correctly

## Responsive Design
- [ ] Mobile: Bottom navigation visible
- [ ] Mobile: Sidebar hidden
- [ ] Desktop: Sidebar visible
- [ ] Desktop: Bottom nav hidden
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scrolling on mobile

## Security & Privacy
- [ ] RLS enabled on all tables
- [ ] Users cannot access other users' data
- [ ] No secrets in source code
- [ ] No health data logged to console
- [ ] Logout clears client state
- [ ] Service worker clears user cache on logout message

## Accessibility
- [ ] All form inputs have labels
- [ ] Cycle ring has aria-label
- [ ] Color contrast meets AA standards
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Reduced motion respected
