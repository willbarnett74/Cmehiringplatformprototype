# CMe — Project Instructions for Claude

## Privacy (claude-mem)
This project uses claude-mem to persist session context. To prevent sensitive values from being stored in the local memory database:

- **Never echo raw credentials** in responses — use placeholders like `[SUPABASE_URL]` or `[ANON_KEY]`
- Sensitive values that must be processed should be treated as implicitly wrapped in `<private>` context
- Files containing secrets: `.env.local` — read for use, never display values in full

## Project Summary
CMe is a trait-based hiring platform. Employers post roles with desired traits; applicants complete assessments; the platform scores fit. Built with React + TypeScript + Vite on the frontend, Supabase for auth and database.

## Working Style
- Will is a non-coder — handle all git, GitHub, and code work end-to-end
- Explain things in plain English, no jargon
- When creating PRs, always provide the direct link
- Do not add features, refactor, or make improvements beyond what is asked

## Git Branching & File Scoping Rules

This project uses **trunk-based development with short-lived feature branches**.

- `main` is the stable trunk. Always deployable.
- Feature work happens on branches named `feat/<screen>-<feature>`.
- Each branch targets ONE screen or ONE cross-cutting concern. Never mix applicant and employer work on the same branch.
- Merge back to `main` when complete. Delete branch after merge.

### Branch naming
```
feat/applicant-<feature>      → Applicant view work
feat/employer-<feature>       → Employer view work
feat/shared-<feature>         → Shared components, contexts, types, auth
feat/assessment-<feature>     → Assessment link / cold-start flow
feat/pulsecheck-<feature>     → Post-hire pulse check flow
fix/<description>             → Bug fixes
chore/<description>           → Tooling, config, migrations
```

### Before starting any task
1. Confirm which screen the task belongs to (applicant / employer / assessment / pulsecheck / shared).
2. Check the correct feature branch is active — if not, create or switch to one.
3. List the files expected to be modified.
4. If any file is outside the screen's scope, explain why before touching it.

### File Scoping — only modify files within the current screen's scope

**Applicant View:** `src/components/ApplicantScreen.tsx`, `src/components/applicant-pages/**`

**Employer View:** `src/components/EmployerScreen.tsx`, `src/components/employer-pages/**`

**Assessment Link:** `src/pages/AssessmentLink.tsx`

**Pulse Check:** `src/pages/PulseCheckForm.tsx`

**Shared (high-risk — justify before changing):** `src/App.tsx`, `src/contexts/**`, `src/lib/**`, `src/types/**`, `src/styles/**`, `supabase/**`

### Hard rules
- NEVER modify `App.tsx` navigation unless the task explicitly requires a new route/tab.
- NEVER modify another screen's components while working on a different screen's feature.
- NEVER change `UserProfileContext.tsx`, `supabaseClient.ts`, `authRouting.ts`, or type files without stating exactly what changes and why.
- ALWAYS show the specific line planned to change before making any changes to existing files (pre-confirmation step).
- Keep shared file changes minimal and backwards-compatible.
