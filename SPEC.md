# FOLIO VOICE — MASTER PROJECT SPECIFICATION

## Your role

Act as a senior full-stack software engineer, UI/UX designer, database architect, API integration specialist and software tester.

Help me build a complete, responsive and genuinely working web application using Google Antigravity.

I am a beginner. Keep the code organised, readable and easy to understand. Explain important technical decisions in simple language, and provide clear commands for running and testing the application.

**This is not a request for a static website or a visual prototype.** I want a complete working product with a frontend, backend, database, authentication, admin dashboard, public portfolios, analytics, voice assistant, external-data integrations and responsive interactions.

Use this specification as the source of truth for the project. Do not silently remove features, replace the idea with another product or simplify the design into a generic portfolio template.

If a feature requires credentials, external API access or additional configuration, implement the appropriate integration structure, clearly identify the limitation and explain the setup needed.

---

# PART 1 — PRODUCT VISION

## 1.1 Product name

**Folio Voice**

Full name: **Voice-Enabled Freelancer Portfolio Manager**

Tagline: "Your work. Your portfolio. Your voice."

## 1.2 Core idea

Build a web platform where freelancers can create, manage, publish, share and analyse professional portfolios from one place.

Freelancers should be able to manage their information through a conventional dashboard or use voice commands to navigate, retrieve information and initiate portfolio actions.

Clients should be able to visit a public portfolio without signing in, explore the freelancer's work, view projects and case studies, and contact the freelancer.

The platform should bring together the freelancer's professional identity, projects, skills, GitHub activity, articles, testimonials and relevant freelance opportunities.

## 1.3 Problem being solved

Freelancers commonly distribute their professional information across GitHub, social media, project links, PDFs, resumes and separate portfolio websites.

Creating a portfolio from scratch and updating it regularly can be time-consuming. Freelancers may also lack a simple way to understand how people interact with their portfolio.

Folio Voice addresses these problems by providing:

- One place to manage professional information.
- A shareable public portfolio.
- A private portfolio management dashboard.
- Portfolio views and engagement analytics.
- GitHub repository import and developer activity information.
- Voice-assisted dashboard operations.
- An interface that works across desktop, tablet and mobile devices.

## 1.4 Target audience

**Primary users:** Freelancers, independent developers, designers and other professionals who need an online portfolio.

**Secondary users:** Clients and potential employers who want to evaluate a freelancer's experience, skills and previous work.

Build a multi-user system. Each freelancer must be able to maintain an independent account and portfolio.

---

# PART 2 — REQUIRED TECHNOLOGY STACK

Use this stack for the initial implementation:

### Frontend
- React.
- Vite.
- Tailwind CSS.
- Framer Motion for animations.
- React Router for page navigation.
- Recharts for charts where appropriate.

### Backend
- Node.js.
- Express.js.
- REST API endpoints with validation and appropriate error handling.

### Database
- SQLite for the initial development version.
- A clear database schema and initialisation or migration scripts.
- Persistent storage in deployment.

If the chosen hosting configuration cannot safely preserve SQLite data, document and implement a suitable persistent-storage solution or a compatible managed database migration. Do not deploy a database file to ephemeral storage and pretend it is durable.

### Authentication and security
- JWT-based authentication.
- Secure password hashing using an established password-hashing library.
- Secure session handling, preferably using appropriately configured HTTP-only cookies.
- Authentication and authorisation middleware.
- Server-side ownership checks.

### Voice
- Browser Web Speech API for speech recognition and speech synthesis as the original no-paid-service voice option, where the browser supports it.
- Gnani AI Prisma for genuine speech-to-text integration.
- Gnani AI Timbre for genuine text-to-speech integration where supported.
- A typed command fallback when voice is unavailable.

### Hosting targets
- Frontend: Vercel.
- Backend: Render.
- Persistent database storage appropriate to the deployment architecture.

Verify the current documentation and compatibility of libraries, APIs and hosting services before implementing integrations.

Do not change the chosen technologies merely to simplify the project. Explain any necessary change and its reason.

---

# PART 3 — COMPLETE WEBSITE STRUCTURE

Create the following pages and routes.

## Public routes

1. `/` — Landing page.
2. `/login` — Login page.
3. `/register` — Registration page.
4. `/u/:username` — Public freelancer portfolio.
5. Appropriate not-found and error states.

## Private routes

1. `/dashboard` — Overview.
2. `/dashboard/profile` — Profile management.
3. `/dashboard/projects` — Project management.
4. `/dashboard/skills` — Skills management.
5. `/dashboard/case-studies` — Case study management.
6. `/dashboard/testimonials` — Testimonials management.
7. `/dashboard/analytics` — Portfolio analytics.
8. `/dashboard/integrations` — GitHub, voice and external-data settings.
9. `/dashboard/messages` — Client contact messages.
10. `/dashboard/settings` — Account and portfolio settings.

Protect all private pages and API operations appropriately.

Public visitors must not need an account to open a published portfolio.

The design, navigation, route handling and direct URL refresh behaviour must work correctly.

---

# PART 4 — COMPLETE VISUAL DESIGN

The design is one of the defining features of Folio Voice.

Do not create a generic Bootstrap-looking dashboard. Implement the futuristic visual direction described below.

## 4.1 Colour system

Use a dark, premium dual-finish aesthetic.

- Deep navy as the primary colour.
- Glossy ice blue as the secondary visual colour.
- A target visual balance of approximately 60% deep navy and 40% ice-blue influence.
- Supporting slate, white and neutral tones for text and surfaces.
- Aurora-style gradients for selected backgrounds and highlights.

The 60/40 balance is a visual guideline, not a requirement to colour 40% of every individual component blue.

## 4.2 Glassmorphism

Create glass-style cards with:

- Translucent surfaces.
- Subtle background blur where appropriate.
- Thin, polished borders.
- A restrained ice-blue highlight.
- A glossy reflection or sheen.
- Soft shadows and depth.

The cards should look polished, like glass or brushed metal, while keeping their contents readable.

## 4.3 Animated background

Implement a slowly shifting aurora gradient and subtle floating glowing particles.

The motion should be smooth and lightweight. Keep the background behind the content rather than interfering with text, forms or controls.

Avoid excessive effects that reduce usability or performance.

## 4.4 Interaction feedback

Include:

- Cards that lift subtly on hover.
- A gentle cursor-following spotlight on supported desktop devices.
- Optional 3D card tilt with a soft glare effect.
- Glowing ice-blue outlines on selected elements.
- Clear hover, focus, active, loading, success and error states.
- Smooth section transitions.
- Staggered fade-in animations.
- Animated counters.
- Circular profile-completeness progress indicators.

Animations must not interfere with clicks, text selection, accessibility or scrolling.

Respect reduced-motion preferences.

## 4.5 Typography and layout

Use consistent typography, spacing, card padding, border radii and button styles.

Provide a visible content hierarchy. Important actions should be clear, and secondary actions should not overwhelm the interface.

Use accessible contrast and readable font sizes.

---

# PART 5 — RESPONSIVE WEBSITE REQUIREMENTS

The whole application must be responsive, not just the landing page.

Test it at narrow phone widths, tablet widths and large desktop widths.

## Desktop

- Full navigation.
- Sidebar dashboard layout where appropriate.
- Multi-column cards.
- Spacious analytics charts.
- Larger portfolio grids.

## Tablet

- Reduced column counts.
- Adapted sidebar and navigation.
- Appropriately resized cards, charts and forms.

## Mobile

- Working collapsible hamburger navigation.
- Single-column layouts where appropriate.
- Touch-friendly buttons.
- Responsive project cards.
- Full-width forms.
- Modals that fit the screen.
- No horizontal page overflow.
- Voice controls that do not cover essential content.
- Properly scaled charts and analytics cards.

## Interactive device preview

Include a section titled "Public Page on Every Screen".

Provide Desktop, Tablet and Phone controls.

Clicking each option must change the actual portfolio preview container's dimensions and layout. It must not simply change the text label.

Test the controls and ensure that all layouts remain functional.

---

# PART 6 — LANDING PAGE

Create a polished landing page that introduces the product.

Include:

1. Navigation with the Folio Voice logo.
2. Sign In and Get Started actions.
3. Hero section with the headline and description.
4. A prominent call to action.
5. Product feature sections.
6. An explanation of the voice assistant.
7. A visual preview of the freelancer dashboard.
8. A preview of a public portfolio.
9. An explanation of analytics and GitHub integration.
10. A footer with relevant links.

Use a compelling hero visual with subtle animated ice-blue highlights.

The calls to action must navigate to the appropriate pages. Do not leave decorative buttons without real destinations.

Use a clear message such as:

"Build a portfolio that works as hard as you do."

Supporting description:

"Manage your projects, showcase your skills, track your portfolio engagement and use voice commands to navigate your professional workspace."

---

# PART 7 — AUTHENTICATION AND USER ACCOUNTS

Implement real registration, login and logout.

## Registration

Collect the required account details, validate inputs and prevent invalid or duplicate account creation.

Hash passwords before storing them.

## Login

Verify credentials using the backend and establish a secure authenticated session.

Show appropriate errors for invalid credentials, missing fields and failed requests.

## Account security

- Protect private dashboard routes.
- Protect write operations on the backend.
- Verify portfolio ownership for every relevant database operation.
- Prevent one freelancer from editing or deleting another freelancer's data.
- Implement logout correctly.
- Handle expired sessions.
- Do not expose password hashes, authentication secrets or private messages through public APIs.

Do not rely only on hiding frontend elements for security.

---

# PART 8 — ADMIN DASHBOARD

The private dashboard is the freelancer's main management workspace.

Create a clean, interactive overview with:

- Welcome message.
- Freelancer profile summary.
- Profile-completeness ring.
- Total portfolio views.
- Total published projects.
- Skills count.
- Case studies count.
- Testimonials count.
- Recent activity.
- Quick-action buttons.
- Voice assistant access.

The dashboard values must come from saved application data.

Display sensible empty states when the freelancer has not added content or analytics events yet.

The dashboard should immediately help the freelancer understand the status of their portfolio and what needs attention.

---

# PART 9 — PROFILE MANAGEMENT

Provide a complete profile editor.

Allow the freelancer to manage:

- Full name.
- Unique username or public URL slug.
- Professional headline.
- Profile image or avatar.
- Biography.
- Location, if they choose to provide it.
- Contact information.
- GitHub profile.
- LinkedIn profile.
- Other professional links.
- Resume link.

Include:

- Edit controls.
- Save Changes button.
- Cancel or reset unsaved changes.
- Form validation.
- Loading indicators.
- Success and error feedback.

Persist saved data in the database.

The public portfolio must reflect saved and published information rather than hardcoded profile content.

The profile completeness score must be calculated from explicit criteria, such as a completed biography, profile image, skills, published projects and contact or professional links.

Show a checklist of missing elements so users can improve their score.

---

# PART 10 — PROJECT MANAGEMENT

Build a complete project management interface.

Each project must support:

- Project title.
- Description.
- Cover image or image URL.
- Category.
- Tags.
- Technology stack.
- GitHub repository URL.
- Live project URL.
- Featured status.
- Publication status.
- Creation and update timestamps.

Allow users to:

- Add projects.
- View projects.
- Edit projects.
- Delete projects.
- Publish or unpublish projects.
- Mark projects as featured.
- Preview the project as it appears on the public portfolio.

Use proper form validation.

Ask for confirmation before deletion.

Saved projects must remain available after refreshing the page.

## Project filters

Implement working filters:

- All.
- UI/UX.
- Branding.
- React.

Filtering should update the visible cards immediately without a page reload.

Where possible, derive filter values from available categories and allow additional categories to be represented appropriately.

## Project details

Clicking a card must open a working details modal or detail view.

Include the project title, description, technology stack, category, image and available links.

Allow the modal to close using its close button, the Escape key and an appropriate outside-click interaction.

## Live project links

A "View Live Project" button must open the actual configured project URL.

If no live URL exists, do not invent one. Offer a valid repository link if available or display a clear unavailable state.

Never leave a placeholder button that silently does nothing.

---

# PART 11 — SKILLS MANAGEMENT

Allow users to add, edit and delete skills.

Each skill may include:

- Name.
- Category.
- Optional proficiency level.
- Optional years of experience.

Render skills in polished cards, lists or progress indicators appropriate to their type.

Proficiency is self-reported unless independently verified. Do not label it as an objectively measured ability.

Validate values and save them to the database.

---

# PART 12 — CASE STUDIES AND TESTIMONIALS

## Case studies

Support the following fields:

- Title.
- Project context.
- Problem.
- Approach.
- Solution.
- Result.
- Related project.
- Optional images.
- Publication status.

Display published case studies on the public portfolio.

## Testimonials

Support:

- Client name.
- Client designation or role.
- Written testimonial.
- Optional rating.
- Optional date.
- Related project, if applicable.
- Publication status.

Distinguish self-entered testimonials from independently verified reviews.

Ensure that editing and publication changes are persisted correctly.

---

# PART 13 — PUBLIC FREELANCER PORTFOLIO

Each freelancer must have a shareable URL such as:

`yourwebsite.com/u/yourname`

The public portfolio must work without login.

## Public page sections

1. Hero section with name, professional headline and introduction.
2. About section.
3. Skills.
4. Featured projects.
5. Complete project gallery.
6. Case studies.
7. Testimonials.
8. GitHub and professional links.
9. Resume link.
10. Contact form.

Use the saved profile and published content from the database.

Unpublished projects and private account data must never appear publicly.

Provide sensible not-found pages for invalid usernames and missing portfolios.

## Portfolio navigation

Add appropriate section links with smooth scrolling.

On mobile, collapse navigation into a working menu.

## Client contact form

Create a contact form with fields such as:

- Name.
- Email.
- Message.

Validate inputs on both the client and server.

Save submitted messages in the database and show them in the correct freelancer's private dashboard.

Show a genuine confirmation only after the message has been successfully saved.

Implement basic abuse protection and sensible request limits.

---

# PART 14 — PORTFOLIO ANALYTICS

Build a genuine analytics dashboard.

Include:

- Total portfolio views.
- Views over time.
- Project counts.
- Skills counts.
- Case study counts.
- Testimonials counts.
- Profile completeness.
- Missing-information checklist.
- Recent activity.

## View tracking

Record visits to published public portfolios in the backend.

Use a reasonable session-based deduplication approach so refreshing a page does not automatically inflate visitor metrics with repeated counts.

Clearly define what is counted as a portfolio view.

Where useful, include selectable analytics date ranges.

## Charts

Implement a responsive views-over-time chart using actual recorded events.

Use readable tooltips, axis labels, appropriate empty states and correct date aggregation.

If a freelancer has no recorded views, display an honest zero-data state. Do not generate random analytics values or pretend sample data is real.

All analytics must be scoped to the authenticated freelancer's own portfolio.

---

# PART 15 — VOICE ASSISTANT

Voice interaction is a defining feature of Folio Voice.

The assistant must make the dashboard easier to use rather than acting as a decorative microphone.

## 15.1 Preserve both voice modes

### Browser voice mode

Implement the browser's built-in Web Speech API where supported.

Use browser speech recognition for voice input and browser speech synthesis for spoken output where available.

This provides the original no-paid-service option, subject to browser compatibility and permissions.

Provide a typed-command fallback and explain when browser voice capabilities are unavailable.

### Gnani AI mode

For the internship challenge, implement genuine Gnani AI integration using verified Prisma and Timbre APIs where supported.

Before implementation:

- Inspect the official Gnani AI API documentation.
- Confirm request formats and authentication.
- Confirm available audio formats and language support.
- Confirm current API endpoints and response structures.
- Read the actual API credentials from server-side environment variables.
- Never expose API secrets to the browser.
- Test the actual API integration when credentials are available.

Do not make up API endpoints or pretend that a demo request succeeded.

Keep browser voice and Gnani voice as clearly identifiable options where technically appropriate. Do not remove the browser voice option merely because Gnani integration is enabled.

If Gnani credentials are missing, explain the missing setup. Keep the integration structure ready for configuration and never label simulated output as actual Gnani output.

## 15.2 Voice assistant interface

Include:

- Microphone button.
- Listening or recording indicator.
- Recognised speech transcript.
- Assistant response.
- Spoken-response controls.
- Typed-command field.
- Loading indicator.
- Clear error messages.
- Permission instructions where required.

Ensure that the interface is responsive and the microphone is accessible on mobile.

## 15.3 Required voice commands

Support the following commands:

1. "Add a project called Logo Design."
2. "How many views do I have?"
3. "What's my profile completeness?"
4. "Open my public portfolio."
5. "Go to skills."
6. "Preview phone."
7. "Show my recent portfolio activity."
8. "Show my GitHub repositories."

Implement actual actions.

Examples:

- A view-count question retrieves the authenticated user's real analytics data.
- A navigation command opens the correct dashboard section.
- A public portfolio command opens the correct public URL.
- A phone-preview command selects the phone-sized preview.
- A project-creation command opens the project form with the project title filled in.

Do not silently create, publish or delete data. Ask for confirmation when a command will make a consequential change.

## 15.4 Command handling

Implement a clear command-handling layer.

Initially, deterministic intent matching for the supported commands is acceptable. Use Evon or another verified Gnani model only if it provides a useful, tested enhancement to command interpretation.

Validate that the authenticated user has permission to perform each action.

If the request is not understood, ask the user to rephrase it or provide suggested commands.

---

# PART 16 — GITHUB INTEGRATION AND LIVE DEVELOPER DATA

This is an important differentiating feature and must remain part of the product plan.

## 16.1 GitHub repository import

Allow freelancers to connect or specify a public GitHub username.

Fetch available public repository information using the appropriate verified GitHub API endpoints.

Show a "Fetch Repos" button.

When clicked:

1. Show loading placeholders.
2. Fetch the repositories.
3. Display available repository information.
4. Let the freelancer select repositories to import.
5. Allow the freelancer to review or edit the imported information.
6. Import selected repositories as editable portfolio projects.

Display available information such as:

- Repository name.
- Description.
- Programming language.
- Stars.
- Repository URL.
- Last-updated information.

Validate repository URLs and handle API errors and rate limits.

An imported repository must not automatically become a published portfolio project without the freelancer's approval.

## 16.2 Activity heatmap

Create a 26-week contribution activity heatmap inspired by GitHub's contribution grid.

Use ice-blue cells with different intensity levels according to available contribution counts.

Hovering over or selecting a cell should show the corresponding date and available contribution information.

Only display contribution data when it is legitimately accessible through the chosen integration. If complete contribution information requires authentication or a different API, clearly document that restriction.

Never fabricate historical contributions.

## 16.3 Follower, star and language statistics

Display available GitHub follower counts, repository star counts and programming-language breakdowns.

Make clear whether values refer to the account, the imported repositories or the currently displayed project collection.

Do not mix these metrics.

## 16.4 Latest articles

Add a "Latest Articles" section using the Dev.to public API or another verified supported interface.

Display the article title, available summary, author and publication date, with a real article link.

If the freelancer has no available articles, display an appropriate empty state.

## 16.5 Freelance opportunities

Add a "Freelance Opportunities" section using the Remotive job feed or another verified job-listings API.

Display available job information such as:

- Title.
- Company.
- Relevant skills.
- Remote status, when supplied.
- Publication date.
- Actual application URL.

Do not invent job listings or application links.

## 16.6 Data attribution and fallback behaviour

Show source attribution for external-data sections, such as "Data from GitHub", "Data from DEV" and "Data from Remotive", where applicable.

Display a last-updated time when reliable.

Implement backend fetching and sensible caching to avoid unnecessary requests.

If an external API is unavailable, show an honest status such as "Showing saved data" or "Live data temporarily unavailable" when cached data actually exists.

If neither live nor saved data exists, show a suitable empty state.

Sample data may be used during development, but label it explicitly as sample data. Never present sample data as live external information.

If an API feature cannot be implemented or verified, keep the other features working and document the missing access or technical blocker.

---

# PART 17 — EXTRA INTERACTIVE FEATURES

Make the product feel like an interactive application rather than a collection of static screens.

Implement:

### Project filters
Update the displayed cards when a category is selected.

### Detail modals
Open meaningful project information and provide working links.

### Working navigation
Make all navigation items go to the correct route or section.

### Cursor spotlight
Add a subtle cursor-following light effect on desktop, without affecting input selection or pointer behaviour.

### Card tilt and glare
Use restrained 3D tilt and reflection effects on supported desktop devices. Disable or reduce these effects on touch devices.

### Animated counters
Animate actual dashboard values when the component loads or values change. Do not change the underlying data during the animation.

### Progress rings
Animate the real profile-completeness value.

### Preview controls
Make Desktop, Tablet and Phone preview options change the actual preview width and layout.

### Functional command interface
Allow typed commands as an alternative to speaking. Running a command must produce a real action or a useful explanation.

### Working links and buttons
Every visible interactive element must perform its intended action.

If a feature is unavailable, communicate that status clearly rather than leaving a button that appears to work but does nothing.

---

# PART 18 — SECURITY, DATA QUALITY AND RELIABILITY

Implement the following safeguards:

- Validate user inputs on the frontend and backend.
- Use safe, parameterised database queries or a suitable database abstraction.
- Enforce authentication and record ownership on protected operations.
- Avoid exposing credentials, private messages and unpublished projects.
- Add sensible limits to login, contact-form and external API requests.
- Validate external URLs.
- Handle malformed requests and database errors safely.
- Avoid unsafe HTML rendering.
- Keep API keys out of version control and frontend bundles.
- Provide environment variable examples without real secrets.
- Handle failed API calls without losing previously saved portfolio data.
- Prevent duplicate actions where appropriate.
- Use accessible form labels and keyboard interactions.

Do not overstate the security of the system. Document any remaining deployment or security limitations.

---

# PART 19 — IMPLEMENTATION PLAN AND THREE-DAY TARGET

Preserve the original three-day delivery target while using staged implementation and testing.

## Day 1 — Foundation and core management

- Inspect the project directory.
- Establish the architecture.
- Set up React, Vite, Tailwind CSS and Framer Motion.
- Create the design system and animated background.
- Create the database and backend.
- Implement authentication.
- Build the dashboard.
- Implement profile, project and skills forms.

At the end of Day 1, focus on registration, login, saving data and the basic management workflow.

## Day 2 — Public portfolio and analytics

- Finish project management.
- Implement the public portfolio page.
- Add case studies and testimonials.
- Add functional filters and project detail modals.
- Implement the contact form.
- Add view tracking and analytics.
- Make all main pages responsive.

At the end of Day 2, verify the journey from adding a project to publishing and viewing it publicly.

## Day 3 — Voice, integrations and final polish

- Integrate browser voice features.
- Configure and test the genuine Gnani AI integration when credentials are available.
- Implement voice and typed commands.
- Add GitHub repository import.
- Add the activity heatmap and available GitHub statistics.
- Implement Dev.to and Remotive sections where feasible.
- Finish animations and responsive behaviour.
- Perform regression testing.
- Prepare deployment configuration and the README.

The three-day schedule is a delivery target, not permission to pretend that unfinished features work. If a complex external integration remains incomplete, document it honestly and prioritise the working core application.

Preserve the feature in the product plan rather than silently deleting it.

---

# PART 20 — TESTING REQUIREMENTS

Do not declare the project complete merely because the frontend renders.

Run the application and test it through the browser and backend.

## Test A: Registration and authentication
Register an account, log in, open the dashboard, log out and verify private-route protection.

## Test B: Portfolio management
Create a project, edit it, save it, refresh the page and verify persistence. Test deletion with confirmation.

## Test C: Publication
Publish a project and verify that it appears on the public portfolio. Unpublish it and verify that public access to that project's content is removed.

## Test D: Client visit
Open a public portfolio without login, filter projects, open project details, follow valid links and submit a contact message.

## Test E: Analytics
Visit the public page and check whether the correct portfolio's stored view count changes according to the defined tracking rules.

## Test F: Voice commands
Test navigation, view-count queries, project-creation form initiation and the phone-preview command. Check both voice and typed input paths where available.

## Test G: GitHub integration
Fetch available public repositories, inspect their details, import a selected repository and confirm that the project is saved. Test rate-limit and unavailable-data handling.

## Test H: Responsive behaviour
Inspect the landing page, dashboard, public page, analytics chart, voice panel, forms and modals at mobile, tablet and desktop sizes.

## Test I: Security
Check that unauthorised users cannot modify protected information or access another freelancer's private data.

## Test J: Failure handling
Test invalid input, missing API keys, unavailable external services, empty data and failed requests.

Fix the bugs found during testing.

Where automated tests can provide reliable coverage, create and run them. Also inspect the interface visually and test real user journeys.

---

# PART 21 — FUTURE ROADMAP

Preserve these as future enhancements after the initial working product:

- AI-generated biography drafts.
- AI-generated case-study drafts.
- Freelancer-client messaging.
- Additional portfolio templates.
- Custom domains.
- Integration with a freelance job marketplace.

Do not make these features prerequisites for delivering the first usable version, but document them in the roadmap.

---

# PART 22 — DEPLOYMENT AND DOCUMENTATION

Prepare the application for deployment to Vercel and Render.

Include:

- Frontend deployment configuration.
- Backend deployment configuration.
- Required environment variables.
- Database persistence instructions.
- Correct CORS settings.
- Production API URL configuration.
- Secure secret handling.
- README installation instructions.
- Database initialisation instructions.
- Instructions for obtaining and configuring Gnani AI API credentials.
- GitHub integration configuration where needed.
- A list of features that were actually tested.
- A list of features that still require API access or configuration.

Do not publish real secrets, credentials or private personal information in source control.

If deployment cannot be completed because an account, key or external configuration is missing, document the exact remaining steps.

---

# PART 23 — REQUIRED PROJECT DELIVERABLES

The finished project must contain:

1. A complete responsive web application.
2. A private freelancer dashboard.
3. Working authentication and database persistence.
4. Profile and project CRUD functionality.
5. A public portfolio page for each freelancer.
6. Portfolio analytics based on actual records.
7. Functional project filtering and project detail modals.
8. Browser voice functionality and a typed fallback where supported.
9. A genuine Gnani AI integration for the internship submission, tested when credentials are available.
10. GitHub repository import and the planned external-data sections.
11. Responsive layouts and meaningful interactive feedback.
12. Deployment instructions and a README.
13. A test report identifying what passed and what remains incomplete.

The final application must represent the original Folio Voice idea in both functionality and appearance.

---

# FINAL EXECUTION INSTRUCTIONS

First inspect the existing project files and identify any existing implementation or reusable components.

Do not overwrite existing work without understanding it.

Prepare a detailed implementation plan, a proposed folder structure, a database schema and a list of API integrations with their actual documentation requirements.

Show me the plan before beginning large implementation changes.

Then build and test the project in logical phases. Finish the essential functionality first, but preserve every feature in this specification as either an implemented feature or an explicitly tracked integration task.

After each phase, report:
- What was implemented.
- Which files were created or changed.
- Which tests were run.
- What passed.
- What failed.
- What still requires configuration.
- The next recommended step.

Never claim that an API, button, database operation, deployment or voice command works without appropriate verification.

**Begin with planning and project inspection. Keep the complete specification available throughout implementation, and do not silently change the product idea.**