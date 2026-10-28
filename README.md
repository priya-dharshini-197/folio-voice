# Folio Voice — Voice-Enabled Freelancer Portfolio Manager

> *"Your work. Your portfolio. Your voice."*

A multi-user web platform where freelancers create, manage, publish, share, and analyze professional portfolios.

---

## 🚀 Quick Start (Run Locally)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Setup
Run the setup command from the project root:
```bash
npm run setup
```
*(Installs all backend and frontend dependencies and applies SQLite database migrations.)*

### 3. Start the Application
Open two terminal windows:

**Terminal 1 — Backend API (Port 5001):**
```bash
npm run dev:server
```
Backend runs at: `http://localhost:5001`

**Terminal 2 — Frontend Application (Port 5173):**
```bash
npm run dev:client
```
Frontend runs at: `http://localhost:5173`

---

## 👁️ View Tracking Definition & Rules (Part 14)

1. **Definition of a View:** A view is recorded when an external visitor loads a freelancer's public portfolio page (`/u/:username`).
2. **Deduplication Rule (1 View per Visitor per Portfolio per Day):**
   - Each visitor session is anonymized into a cryptographic hash of their IP address, user-agent, and a server salt.
   - Stored in the `portfolio_views` table with a unique constraint on `(user_id, visitor_hash, view_date)`.
   - Repeated page refreshes or revisits from the same visitor on the same calendar day **do not increment** the view count.
3. **Owner Exemption:**
   - If the logged-in freelancer views their own public portfolio (`req.user.id === portfolio.user_id`), the event is flagged as `owner_exempt` and **is never recorded**, preventing preview visits from inflating analytics.
4. **Zero-Data State:**
   - If there are zero recorded views, the analytics dashboard renders an honest zero state (`0 views recorded`). Analytics are strictly derived from real database records and never simulated.

---

## 🛡️ Public Security & Isolation Rules

1. **Sanitized Public API (`GET /api/public/u/:username`):**
   - Returns **only published items** (`is_published: true`).
   - **Never exposes** account emails, password hashes, or private messages.
   - Contact is performed through the secure portfolio contact form.
2. **Contact Form Protection (`POST /api/public/u/:username/message`):**
   - Server-side email format validation.
   - Message length enforcement (10 to 2,000 characters).
   - Rate limiting: maximum 5 messages per 15 minutes per IP address.
   - Hidden honeypot field (`hp_field`): submissions containing data in this field are blocked as bot spam.
   - Messages are saved directly with the recipient freelancer's `user_id`.
3. **Strict Cross-User Isolation:**
   - Private dashboard routes (`/api/projects`, `/api/case-studies`, `/api/testimonials`, `/api/messages`, `/api/analytics`) enforce server-side ownership checks (`where({ user_id: req.user.id })`).
   - Freelancers cannot view, edit, or delete another freelancer's projects or private client inquiries.

---

## 🧪 Phase 2 Verification Test Results

```
--- PHASE 2 TEST SUMMARY ---
Total tests executed: 22
Passed: 22
Failed: 0
```

| # | Test Case | Action Verified | Result |
| :---: | :--- | :--- | :---: |
| 1 | **User Registration** | `POST /api/auth/register` creates account & profile with JWT cookie | **PASSED** |
| 2 | **Published & Draft Projects** | Saved items with publication flags (`is_published`) | **PASSED** |
| 3 | **Case Studies CRUD** | Created problem, solution, approach, and impact metrics | **PASSED** |
| 4 | **Testimonials Management** | Created client endorsements with transparent *self-entered* distinction | **PASSED** |
| 5 | **Public API Publication Filter** | `GET /api/public/u/:username` returns published items only; drafts withheld | **PASSED** |
| 6 | **Public Data Sanitization** | No password hashes, account emails, or private messages exposed | **PASSED** |
| 7 | **Unpublish Flow** | Unpublishing a project immediately removes it from the public portfolio | **PASSED** |
| 8 | **View Tracking: Initial Visit** | Unique visitor records view in `portfolio_views` | **PASSED** |
| 9 | **View Tracking: Deduplication** | 2nd visit from same visitor on same day ignored (`already_viewed_today`) | **PASSED** |
| 10 | **View Tracking: Owner Exemption** | Authenticated owner viewing own portfolio ignored (`owner_exempt`) | **PASSED** |
| 11 | **Contact Form: Invalid Email** | Rejected malformed email address with HTTP 400 | **PASSED** |
| 12 | **Contact Form: Short Message** | Rejected message under 10 characters with HTTP 400 | **PASSED** |
| 13 | **Contact Form: Honeypot** | Rejected spam bot submission with HTTP 400 | **PASSED** |
| 14 | **Contact Form: Valid Message** | Persisted message with 201 Created and confirmed confirmation message | **PASSED** |
| 15 | **Freelancer Inbox** | Recipient freelancer receives inquiry in `/api/messages` | **PASSED** |
| 16 | **Message Read Status** | `PATCH /api/messages/:id/read` marks inquiry as read | **PASSED** |
| 17 | **Cross-User Project Read Security** | User B cannot read User A's project (HTTP 404) | **PASSED** |
| 18 | **Cross-User Project Edit Security** | User B cannot modify User A's project (HTTP 404) | **PASSED** |
| 19 | **Cross-User Messages Isolation** | User B inbox shows 0 messages (User A's inquiries are confidential) | **PASSED** |
| 20 | **Analytics: Real Data** | User A chart displays real recorded view count | **PASSED** |
| 21 | **Analytics: Honest Zero State** | User B with 0 views shows honest zero state (`has_views: false`) | **PASSED** |
| 22 | **Device Preview** | "Public Page on Every Screen" interactive controls (Desktop, Tablet, Phone) | **PASSED** |
