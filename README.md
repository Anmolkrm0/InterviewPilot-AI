# InterviewPilot AI 🎯

> **A realistic, responsive, and functional mock interview practice MVP for job seekers.**

InterviewPilot AI prepares candidates for upcoming technical and behavioral interviews, analyzes weaknesses in submitted answers, and accelerates skill growth through targeted practice drills.

---

## 🌟 The 4-Screen Core Journey

1. **Setup Screen (`/`)**
   - **Candidate Resume:** Drag-and-drop or file picker accepting PDF and DOCX (up to 10MB) with magic byte validation, parsed status badges, replace, and remove actions.
   - **Job Description:** 3 distinct input tabs — **Paste Text**, **Upload PDF/DOCX**, and **Fetch from URL** (hardened against SSRF with private IP blocking and redirect checks).
   - **Target Role & Focus:** Editable role detection and selector for **Technical**, **Behavioral**, or **Mixed (Recommended)** interviews.
   - **Simulation Engine & Architecture:** Live preview of mapped competencies and synthesis pipeline.

2. **Live Session Screen (`/session`)**
   - **Progress & Persona:** "Question X of 5", remaining time estimation, and lead interviewer persona.
   - **Audio Accessibility:** **Listen Prompt** (Web Speech API text-to-speech) and **Voice Dictation** (Web Speech API speech recognition) for hands-free answering.
   - **Pacing Analysis:** Real-time words-per-minute (WPM) calculation with an equalizer visualization.
   - **Session Navigator:** Real-time tracking of answered questions, active status, and practice guidelines.

3. **Feedback & Metrics Screen (`/feedback`)**
   - **Practice Report:** Overall score out of 100 with peer median comparison and animated circular progress gauge.
   - **Key Insights:** Strongest area (e.g. Test Architecture 90%) and biggest opportunity (e.g. Failure Triage 58%).
   - **Evaluated Answer Breakdown:** Detailed evaluation cards with candidate quotes, strengths, missing details, improvement suggestions, and collapsible STAR framework examples with 1-click outline copying.
   - **Actionable Next Step:** Direct CTA to **Fix My Weakest Answer (Q2)**.

4. **Focused Practice Screen (`/practice`)**
   - **Targeted Drill:** Focuses on the candidate's lowest-scoring question.
   - **Coaching Framework:** Explains why the previous response needed work, alongside 3 key principles to remember.
   - **Real-Time Concept Chips:** Live detection chips (`Quarantine mentioned`, `Root-cause logs`, `Needs SLA metric`) that light up as the candidate writes.
   - **Grounded Before-and-After Comparison:** Side-by-side score progression (e.g., 58 → 89, +31 pts), what changed, and concepts added.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 App Router (React 18, TypeScript strict mode)
- **Styling & UI:** Tailwind CSS, Lucide React icons, next-themes (Light, Dark, and System modes)
- **Document Parsers:** `pdf-parse` (PDF inspection and text extraction), `mammoth` (DOCX extraction)
- **Security:** Strict SSRF validator preventing loopback (`127.0.0.1`), private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), metadata endpoints (`169.254.169.254`), and non-HTTP protocols
- **AI Integration:** Server-side `InterviewAIProvider` adapter supporting hosted LLMs (`gemini`, `groq`, `openai`) and deterministic `mock` provider for testing
- **Testing:** Vitest for automated unit and integration tests

---

## 🎨 Visual Design Tokens

- **Light Mode Default:** Background `#F9F8FF`, Surface `#FFFFFF`, Primary `#1456E8`, Borders `#E4E7F0`
- **Dark Mode:** Background `#0B1220`, Card Surface `#111827`, Elevated `#172033`, Primary Accent `#3B82F6`, Borders `#334155`

---

## 🚀 Local Development

### 1. Prerequisites
- Node.js 20+ installed
- npm 10+ installed

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd "AI Mock Interview Coach"

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
- By default, `AI_PROVIDER=mock` runs a deterministic, offline-capable provider that matches the screenshots.
- To use Google Gemini: set `AI_PROVIDER=gemini` and `AI_API_KEY=your_key_here`.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the Vitest test suite covering document parsers, SSRF safety, rubric consistency, and AI schemas:
```bash
# Run unit tests
npm test

# Run TypeScript type check
npm run typecheck

# Run production build
npm run build
```

---

## 🚢 Render Deployment Guide

The repository includes a ready-to-deploy `render.yaml` Blueprint for a Node.js Web Service.

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Build InterviewPilot AI complete MVP"
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and configure:
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`
   - **Health Check Path:** `/`
5. In the **Environment Variables** section of the service settings:
   - `NODE_ENV`: `production`
   - `AI_PROVIDER`: `mock` (or `gemini`)
   - `AI_API_KEY`: *(Your API key if using live AI provider)*
6. Click **Apply** to trigger the deployment.

---

## 🔒 Privacy & Data Architecture

- **No login or sign-up required.**
- **Zero permanent storage without explicit export:** Practice sessions, uploaded resumes, and candidate answers are processed in-session and never stored permanently in a database.
- **Client-Side Draft Protection:** In-session state is stored in temporary browser `sessionStorage` and cleared upon session exit.
