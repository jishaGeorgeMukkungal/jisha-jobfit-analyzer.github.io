# Jisha MG — Job Fit Analyser & Portfolio

**Live site → https://jisha-job-match-analyzer.netlify.app**

A personal portfolio and JD match tool built with Angular 17. Paste any job description to get an instant keyword-match score against my resume, generate a tailored ATS resume, cover letter, or referral message — all client-side, no API key required.

---

## Features

- **About** — Full resume: experience, skills, education, projects, awards with downloadable CV
- **JD Match** — Paste a job description → instant match score (skills, experience, education, keywords), strengths, gaps, and suggestions
- **Saved Jobs** — Save roles to apply later; track application status, generate tailored documents, export/import via Excel for long-term backup
- **Document Generator** — ATS-friendly resume, cover letter, and referral message tailored to each JD's keywords (no fabrication — only real experience reordered by relevance)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Angular 17 (standalone components, signals, `@for`/`@if`) |
| Language | TypeScript |
| State | Angular Signals (`signal`, `asReadonly`) |
| Routing | Lazy-loaded routes with `loadComponent` |
| Data | `localStorage` + Excel export/import via SheetJS |
| Styling | Component-scoped CSS, Syne + DM Sans, Tabler Icons |
| Hosting | Netlify (auto-deploy on push) |

## Angular 17 Patterns Used

- Standalone components — no NgModules
- New `@for` / `@if` / `@else` control flow syntax
- `inject()` function for dependency injection
- Signals for reactive state management
- `@ViewChild` with `ElementRef` for scroll behaviour
- Lazy-loaded routes

## Run Locally

```bash
npm install
npm start
# → http://localhost:4200
```

## Update Resume Data

All personal data is in one file:
```
src/app/core/services/resume-data.service.ts
```

## Routes

| Route | Description |
|---|---|
| `/about` | Resume / portfolio page |
| `/jd-match` | Paste JD → get match score |
| `/saved-jobs` | Saved roles, document generation, Excel backup |
