# Folio Voice: Solution Pitch

**Your work. Your portfolio. Your voice.**

Live site: https://folio-voice-client.vercel.app | Code: https://github.com/priya-dharshini-197/folio-voice

## The problem
Freelancers spread their professional proof across GitHub, PDFs, social profiles and separate websites. Building a portfolio and keeping it current takes time, and most freelancers cannot tell whether anyone is actually looking at it. Managing it all through forms is slow, especially on a phone.

## The solution
Folio Voice is a multi-user web platform where a freelancer manages their profile, projects, skills, case studies and testimonials in one dashboard, publishes a shareable page at `/u/<username>`, and sees real visit analytics. A voice assistant lets them run the dashboard by speaking or typing: "How many views do I have?", "Add a project called Logo Design", "Go to skills", "Preview phone".

## How Gnani AI is used
- **Prisma (speech-to-text):** the browser records the microphone, converts the audio to a 16 kHz mono WAV file, and sends it to our server, which calls Prisma. The transcript runs through the same command handler as typed commands.
- **Timbre (text-to-speech):** the assistant's replies are spoken with Timbre (English, Kaveri voice).
- The Gnani API key stays on the server and never reaches the browser. The browser's own speech engine stays available as a separate, clearly labelled option. If Gnani is not configured or fails, the panel says so, typed commands keep working, and no simulated output is ever presented as Gnani output.

## What is built
- Accounts with hashed passwords and HTTP-only cookie sessions, plus ownership checks on every protected operation.
- Dashboard CRUD for profile, projects, skills, case studies and testimonials, with a profile-completeness checklist.
- A public portfolio that shows only published content, with filters, project details and a contact form (validation, rate limit, spam trap).
- Analytics from real recorded visits: one view per visitor per day, owner visits excluded, honest zero state.
- GitHub repository import (as unpublished drafts only), account and repository statistics, and a 26-week contribution heatmap. DEV articles and Remotive job listings from their public APIs.
- Deployed on Vercel (frontend), Render (backend) and Neon PostgreSQL (database).

## Honest by design
Nothing is faked: no sample analytics, no invented repositories or jobs, no auto-published imports. External data shows its source, and shows "not available" instead of guessing.

## Limits and next steps
Tested manually, with no automated test suite yet. The free backend sleeps when idle, so a first visit can take up to a minute. Voice currently uses English; Prisma supports Indian languages, so Hindi and Tamil commands are the natural next step, followed by AI-drafted biographies and case studies.