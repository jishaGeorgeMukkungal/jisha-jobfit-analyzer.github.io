# Jisha MG – Portfolio App

Angular 17 standalone portfolio with AI-powered JD Match scoring via Claude API.

## Project Structure

```
src/app/
├── core/
│   ├── models/
│   │   ├── resume.model.ts          ← All resume data interfaces
│   │   └── jd-analysis.model.ts     ← JD analysis interfaces
│   └── services/
│       ├── resume-data.service.ts   ← All portfolio data (update here!)
│       └── jd-analysis.service.ts  ← Claude API integration + history signal
├── shared/
│   └── components/
│       └── section-label.component.ts
├── features/
│   ├── layout/
│   │   └── navbar/navbar.component.ts
│   ├── about/                        ← About / Resume tab
│   │   ├── about.component.ts        ← Page orchestrator
│   │   └── components/
│   │       ├── hero/                 ← Name, title, download CV button
│   │       ├── experience/           ← Work history timeline
│   │       ├── skills/               ← Grouped skill pills
│   │       ├── education/            ← Degree cards
│   │       ├── projects/             ← Key project cards
│   │       └── awards/               ← Awards & recognition
│   └── jd-match/                     ← JD Match tab
│       ├── jd-match.component.ts     ← Page orchestrator
│       └── components/
│           ├── jd-form/              ← JD + profile input form
│           ├── score-result/         ← AI score display
│           └── history/              ← Past analyses (routed page)
├── app.routes.ts                     ← Lazy-loaded routes
├── app.config.ts                     ← Providers (HttpClient, Router)
└── app.component.ts                  ← Root shell with navbar
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Claude API key
Edit `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  claudeApiKey: 'sk-ant-YOUR_KEY_HERE',   // ← add your key
  claudeApiUrl: 'https://api.anthropic.com/v1/messages'
};
```

> ⚠️ For production, use a backend proxy to keep the API key server-side.

### 3. Run locally
```bash
npm start
# → http://localhost:4200
```

### 4. Build for production
```bash
npm run build:prod
```

## Updating Your Data

All personal/resume data lives in one place:
```
src/app/core/services/resume-data.service.ts
```
Edit the `resumeData` object to update name, experience, skills, projects, awards, etc.

## Routes

| Route       | Component         | Description                        |
|-------------|-------------------|------------------------------------|
| `/about`    | AboutComponent    | Resume / portfolio page            |
| `/jd-match` | JdMatchComponent  | Paste JD → get AI match score      |
| `/history`  | HistoryComponent  | All past JD analyses (in-memory)   |

## Tech Stack

- **Angular 17** – Standalone components, signals, `@for` / `@if` control flow
- **RxJS** – HTTP & reactive state
- **Angular Signals** – History state management (`signal<>`, `asReadonly()`)
- **Claude API** – `claude-sonnet-4-20250514` for JD match scoring
- **Syne + DM Sans** – Typography
- **Tabler Icons** – Icon set via CDN webfont

## Key Angular 17 Features Used

- ✅ Standalone components (no NgModules)
- ✅ New `@for` / `@if` / `@else` template syntax
- ✅ `inject()` function instead of constructor DI
- ✅ Signals for reactive state (`signal`, `computed`, `effect`)
- ✅ `withViewTransitions()` router animations
- ✅ Lazy-loaded routes with `loadComponent`
- ✅ `provideHttpClient(withFetch())`
