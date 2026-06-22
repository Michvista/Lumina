# Lumina — The Women's Health Decoder

> Stop Googling your lab results. Understand your body, prep for your doctor.

## Stack

| Layer    | Tech                                        |
|----------|---------------------------------------------|
| Frontend | Vite + React + TypeScript                   |
| Backend  | Node + Express + TypeScript                 |
| Database | PostgreSQL + Prisma ORM                     |
| AI (OCR) | Google Gemini 1.5 Flash (vision extraction) |
| AI (NLP) | Groq — Llama 3.3 70B (empathetic analysis) |
| Storage  | Cloudinary (PDF + image hosting)            |
| TTS      | YarnGPT (Gradio Space) + browser fallback   |

## Features

- **"Don't Panic" Protocol** — context-aware, empathetic explanations per marker
- **Phase-Aware Analysis** — asks cycle day before analysis to prevent misinterpretations
- **Longitudinal Memory** — tracks markers across reports, spots trends (e.g. TSH creeping up)
- **ConsentClear Advocacy** — generates personalised doctor question checklists
- **Audio readout** — YarnGPT TTS with browser `speechSynthesis` fallback

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a hosted Postgres URL)
- API keys: Gemini, Groq, Cloudinary

### 2. Environment setup

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your keys in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Install dependencies

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 4. Set up the database

```bash
cd backend
npm run db:push      # push schema to your Postgres instance
npm run db:generate  # generate Prisma client
```

### 5. Run in development

```bash
# From the root — starts both backend (port 3001) and frontend (port 5173)
npm run dev
```

Then open: http://localhost:5173

## Project Structure

```
Lumina/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # User, Report, Marker models
│   ├── src/
│   │   ├── index.ts            # Express server entry
│   │   ├── lib/prisma.ts       # Prisma singleton
│   │   ├── middleware/upload.ts # Multer config
│   │   ├── routes/
│   │   │   ├── reports.ts      # Upload pipeline + CRUD
│   │   │   ├── markers.ts      # Trend queries
│   │   │   ├── users.ts        # Guest session management
│   │   │   └── audio.ts        # TTS endpoint
│   │   └── services/
│   │       ├── gemini.ts       # Vision extraction
│   │       ├── groq.ts         # Empathetic analysis
│   │       ├── cloudinary.ts   # File storage
│   │       └── yarngpt.ts      # TTS with fallback
│   └── package.json
│
├── frontend/
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── FileUpload.tsx   # Drag & drop
│   │   │   ├── MarkerCard.tsx   # Per-marker display with range bar
│   │   │   ├── TrendChart.tsx   # Recharts line chart
│   │   │   ├── AdvocacyChecklist.tsx
│   │   │   └── AudioPlayer.tsx  # TTS with waveform animation
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Landing page
│   │   │   ├── Upload.tsx       # Two-step upload form
│   │   │   ├── Results.tsx      # Polling + full analysis display
│   │   │   └── History.tsx      # Report list + trend chart tab
│   │   ├── hooks/useSession.ts  # Guest session (localStorage)
│   │   ├── lib/api.ts           # Typed axios client
│   │   ├── types/index.ts       # Shared TypeScript types
│   │   └── index.css            # Design system
│   └── package.json
│
└── package.json                 # Monorepo root with workspaces
```

## Database Schema (simplified)

```
User       → id, sessionId (UUID from localStorage)
Report     → id, userId, fileUrl, cycleDay, cyclePhase, status, explanation, advocacyChecklist
Marker     → id, reportId, name, displayName, value, unit, refLow, refHigh, status, plainExplanation, trendNote
```

## Deployment

- **Frontend** → Vercel (set `VITE_API_URL` env var to your backend URL)
- **Backend** → Render (set all env vars from `.env.example`)

## Disclaimer

Lumina is an educational tool. It does not provide medical diagnoses or treatment recommendations.
Always discuss your lab results with a qualified healthcare professional.
