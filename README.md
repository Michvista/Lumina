# Veritas — Lumina

> One-line summary: Lumina helps women understand lab results, decode clinical reports, and prepare for conversations with doctors.

## HER Hackathon Track

- Track: Health
- Team Name: Veritas
- Team Members:
  - Olumide Michelle Oluwanifemi — Developer
  - Adedunye Imisioluwa Praise — Web Developer
  - Ewelike Virginia Oluchi — Researcher

## Problem Statement

Women often struggle to interpret their lab reports because medical results are written in technical language and lack personalized context. This leads to confusion, anxiety, and missed opportunities to act on health signals.

Evidence from validation:

- Early feedback showed users felt lost reading numerical lab values without plain-language explanations.
- Users wanted a trusted way to convert report findings into doctor questions and actionable summaries.
- People preferred a mobile-friendly, accessible experience with both visual and audio guidance.

## Solution Overview

Lumina transforms lab result PDFs into easy-to-understand health explanations, trend analysis, and personalized doctor advocacy checklists. It also provides audio narration so users can absorb insights hands-free.

Core features:

1. PDF report upload with OCR extraction and structured marker parsing
2. Medical result decoding plus trend chart analysis across reports
3. Personalized doctor question checklist and audio summary playback

## Demo

- Live Demo: https://lumina-frontend-one.vercel.app

## Screenshots

Add screenshots or GIFs of your product here.

| Screen | Description |
|---|---|
| ![Screenshot 1](./assets/screenshot-1.png) | Upload and report interpretation screen |
| ![Screenshot 2](./assets/screenshot-2.png) | Trend chart and advocacy checklist |

## How It Works

1. The user uploads a lab report PDF or image.
2. The backend extracts markers with Google Gemini and analyzes them with Groq.
3. The app shows simplified explanations, trends, and audio narration.

## Validation & Research

Who we spoke to / researched:

- Health-conscious women exploring lab report clarity
- Peer mentors and product advisors in women's wellness
- Desk research on menstrual and reproductive health result interpretation

Key findings:

| Finding | Evidence | Product decision |
|---|---|---|
| Lab results feel overwhelming | User feedback and interview notes | Add plain-language summaries for each marker |
| People want action steps | Observations from validation talks | Build a doctor question checklist feature |
| Audio helps accessibility | Early testers asked for read-aloud support | Add TTS fallback and browser audio playback |

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma ORM
- AI / API Tools: Google Gemini, Groq SDK, Cloudinary, YarnGPT TTS + browser speechSynthesis fallback
- Deployment: Vercel (frontend), Render or equivalent backend hosting

## Architecture

```text
[User Browser]
  ↓
[Frontend: React + Vite]
  ↓
[Backend: Express + Prisma]
  ↓
[PostgreSQL] / [Google Gemini] / [Groq] / [Cloudinary]
```

## Installation / Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- API keys for Google Gemini, Groq, and Cloudinary

### Clone the repository

```bash
git clone [repository-url]
cd Lumina
```

### Install dependencies

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Set up environment variables

Create `.env` files in `backend/` and `frontend/` if required.

Example backend variables:

```env
DATABASE_URL=
CLOUDINARY_URL=
GOOGLE_API_KEY=
GROQ_API_KEY=
FRONTEND_URL=https://lumina-frontend-one.vercel.app
```

Example frontend variables:

```env
VITE_API_URL=https://<your-backend-domain>/api
```

### Run locally

```bash
# Backend and frontend must run separately in this repo structure
cd backend && npm run dev
cd ../frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

1. Upload a lab report PDF or image.
2. View the decoded health markers and trend charts.
3. Listen to the audio summary and copy doctor questions.

## Project Structure

```text
.
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── index.ts
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── package.json
└── README.md
```

## Challenges We Faced

- Extracting medical markers accurately from PDFs and report images
- Making result explanations clear without oversimplifying health context
- Ensuring audio narration works reliably with backend TTS and browser fallback

## What We Would Improve Next

- Add more report formats and lab provider templates
- Expand support for personalized cycle and hormone guidance
- Add user accounts and secure saved history across devices

## Business / Sustainability Model

- Users/customers: women seeking better lab report clarity and health confidence
- Revenue model: subscription or premium access to deeper explanation features
- Key partners: clinics, telehealth providers, wellness coaches
- Main costs: hosting, AI API usage, data privacy and support

## Team Contributions

| Name | Role | Contribution |
|---|---|---|
| Olumide Michelle Oluwanifemi | Developer | Frontend and backend implementation |
| Adedunye Imisioluwa Praise | Web Developer | UI development and integration |
| Ewelike Virginia Oluchi | Researcher | User research and health content validation |

## Acknowledgements

- NITHUB, University of Lagos
- HER Hackathon mentors, facilitators, judges, and volunteers
- Users and stakeholders who helped us validate the problem

## License

For hackathon/demo purposes only.
