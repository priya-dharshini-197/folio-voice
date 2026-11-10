# Folio Voice

**Your work. Your portfolio. Your voice.**

Folio Voice is a voice-enabled freelancer portfolio manager. Freelancers manage their profile, projects, skills, case studies and testimonials from a private dashboard, publish a public portfolio page, and see how many people visit it. A voice assistant lets them navigate and ask questions by speaking or typing.

- Live site: https://folio-voice-client.vercel.app
- API: https://folio-voice-api.onrender.com/api/health

> The backend runs on a free Render instance, which sleeps after about 15 minutes without traffic. The first request after a quiet period can take 30 to 60 seconds. Open the API health link first if a login attempt times out.

## Features

| Area | What it does |
|---|---|
| Accounts | Register, log in, log out. Passwords are hashed (bcrypt). Sessions use JWT in HTTP-only cookies. |
| Dashboard | Overview, profile editor with a profile-completeness checklist, projects, skills, case studies, testimonials, messages, analytics, integrations and settings. |
| Public portfolio | `/u/<username>` works without signing in and shows only published content. Includes project filters, project detail windows and a contact form. |
| Analytics | Views over time from real recorded visits. One view per visitor per day. The owner's own visits are not counted. |
| Voice assistant | Eight commands (add a project, view count, profile completeness, open public portfolio, go to skills, preview phone, recent activity, GitHub repositories), by typing or speaking. Two voice engines: Browser (Web Speech API) and Gnani AI (Prisma speech-to-text and Timbre text-to-speech). |
| GitHub | Fetch public repositories, import selected ones as **unpublished** drafts, account and repository statistics, and a 26-week contribution heatmap. |
| DEV and Remotive | Latest DEV articles for a username, and remote job listings filtered by keywords. |

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Knex
- **Database:** SQLite for local development, PostgreSQL (Neon) in production
- **Voice:** Web Speech API (browser) and Gnani AI Prisma and Timbre (through the server)
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Run it locally

You need Node.js 20 or newer.

```bash
# 1. Install dependencies
npm --prefix server install
npm --prefix client install

# 2. Create your environment file and fill it in
cp server/.env.example server/.env

# 3. Create the database tables (SQLite file in server/data)
cd server && npx knex migrate:latest && cd ..

# 4. Start the backend (terminal 1)
cd server && node src/index.js

# 5. Start the frontend (terminal 2, from the project root)
npm --prefix client run dev
```

Open http://localhost:5173. The frontend forwards `/api` calls to the backend on port 5001.

Run the backend from inside the `server` folder, so that `server/.env` is found.

## Environment variables (`server/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Backend port. Default 5001. Render sets it automatically. |
| `NODE_ENV` | `development` locally, `production` when deployed. |
| `JWT_SECRET` | Long random string used to sign login tokens. Required. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `CLIENT_URL` | Address of the frontend, used for CORS. |
| `DB_FILENAME` | Local SQLite file. Default `./data/folio.sqlite`. |
| `DB_CLIENT` | Set to `pg` to use Postgres locally. Leave unset to use SQLite. |
| `DATABASE_URL` | PostgreSQL connection string. Used in production. |
| `GITHUB_TOKEN` | Optional. A GitHub token with no scopes. Needed only for the contribution heatmap. Without it the heatmap says "not available". |
| `GNANI_API_KEY` | Optional. Needed only for the Gnani AI voice mode. Without it the panel says Gnani voice is not set up, and browser voice and typed commands still work. |

Never commit `server/.env`. It is listed in `.gitignore`.

## Deployment

1. **Database:** create a free Neon project and copy its connection string.
2. **Backend (Render web service):** root directory `server`, build command `npm install --omit=optional`, start command `npm run start:prod` (runs the migrations, then starts the server). Set `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET` (a different one from local), `CLIENT_URL`, `GNANI_API_KEY` and `GITHUB_TOKEN`.
3. **Frontend (Vercel):** root directory `client`, framework Vite. `client/vercel.json` forwards `/api` to the Render backend, so the login cookie belongs to the frontend's own address and works in all browsers. It also sends page refreshes to the app.

## Voice assistant notes

- **Browser mode** uses the Web Speech API. Support depends on the browser (Chrome works best). Typed commands always work.
- **Gnani AI mode** records from the microphone, converts the audio to a 16 kHz mono WAV file in the browser, and sends it to the server, which calls Gnani. The API key never reaches the browser. Recordings stop after 25 seconds (Gnani accepts up to 30). The app uses English (`en-IN`) and the Kaveri voice.
- Spoken and typed commands share one handler. Nothing is created, published or deleted by voice without the user pressing Save.

## How views are counted

A view is one visit per visitor per portfolio per day. The visitor is identified by a hash of their address and browser, not stored in plain form. The portfolio owner viewing their own page is not counted. If there are no visits, the chart shows zero. No sample data is ever shown.

## Testing

Manual testing, with the status of each area. Update the "Live site" column as you check each item.

| Area | Local (manual) | Live site |
|---|---|---|
| Register, login, logout, protected pages | Passed | To check |
| Projects, skills, case studies, testimonials (create, edit, delete, refresh) | Passed | To check |
| Publish and unpublish, public page shows only published items | Passed | To check |
| Contact form and Messages page | Passed | To check |
| View counting and analytics chart | Passed | To check |
| Voice commands (typed and spoken, browser and Gnani) | Passed | To check |
| GitHub import, statistics, heatmap | Passed | To check |
| DEV articles and Remotive jobs | Passed | To check |
| Another user cannot read or change someone else's projects or messages | Passed (API checked with a second account) | To check |
| Phone-width layouts | Passed | To check |
| Safari login (cookies) | Not tested | To check |

There are no automated tests yet.

## Known limitations

- Free hosting: the backend sleeps when idle (see above).
- The Settings page shows account details, the public link and voice status. Changing the password and deleting the account are not implemented.
- Project cover images are links only. There is no image upload.
- The contact-form rate limit is kept in memory, so it resets when the server restarts.
- The GitHub heatmap needs a server-side token. It shows what GitHub's API reports, which may differ from the graph on github.com.
- Remotive's public feed is small. Jobs are filtered by keyword on the server.
- DEV articles use a DEV username, which can differ from the GitHub username.
- `npm audit` reports vulnerabilities in some dependencies. They have not been reviewed yet.
- Proficiency levels and testimonials are entered by the user. They are not independently verified.

## Roadmap

AI-generated biography and case-study drafts, messaging between freelancers and clients, more portfolio templates, custom domains, and freelance marketplace integration.