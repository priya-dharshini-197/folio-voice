const db = require('../config/db');
const { fetchRepos, fetchProfile, GithubError } = require('../services/github.service');
const MAX_IMPORT = 20;

function clean(value, max) {
    if (typeof value !== 'string') return null;
    const v = value.trim().slice(0, max);
    return v || null;
}

function safeHttpUrl(value) {
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
    } catch (e) {
        return null;
    }
}

function sendError(err, res, next) {
    if (err instanceof GithubError) {
        return res.status(err.status).json({ error: err.message });
    }
    return next(err);
}

/**
 * GET /api/github/repos?username=...
 * Lists a user's public repos and marks the ones already imported by this freelancer.
 */
async function listRepos(req, res, next) {
    try {
        const username = String(req.query.username || '').trim();
        const data = await fetchRepos(username);

        const existing = await db('projects')
            .where({ user_id: req.user.id })
            .whereNotNull('github_url')
            .select('github_url');
        const imported = new Set(existing.map((p) => p.github_url));
        // The profile call is optional: if it fails, the repo list still works
        const profile = await fetchProfile(username).catch(() => null);

        return res.json({
            ...data,
            profile,
            repos: data.repos.map((r) => ({ ...r, alreadyImported: imported.has(r.url) })),
        });
    } catch (err) {
        return sendError(err, res, next);
    }
}

/**
 * POST /api/github/import
 * Body: { username, repos: [{ id, title?, description?, category? }] }
 * Repo details (URL, language, topics) are re-fetched on the server, never trusted from the browser.
 * Imported projects are ALWAYS saved as unpublished drafts.
 */
async function importRepos(req, res, next) {
    try {
        const username = String(req.body.username || '').trim();
        const selected = Array.isArray(req.body.repos) ? req.body.repos : [];

        if (selected.length === 0) {
            return res.status(400).json({ error: 'Select at least one repository to import.' });
        }
        if (selected.length > MAX_IMPORT) {
            return res.status(400).json({ error: `You can import up to ${MAX_IMPORT} repositories at a time.` });
        }

        const data = await fetchRepos(username);
        const byId = new Map(data.repos.map((r) => [r.id, r]));

        const existing = await db('projects')
            .where({ user_id: req.user.id })
            .whereNotNull('github_url')
            .select('github_url');
        const importedUrls = new Set(existing.map((p) => p.github_url));

        const created = [];
        const skipped = [];

        for (const item of selected) {
            const repo = byId.get(Number(item && item.id));
            if (!repo) {
                skipped.push({ id: item && item.id, reason: 'Repository not found for this username.' });
                continue;
            }
            if (importedUrls.has(repo.url)) {
                skipped.push({ id: repo.id, name: repo.name, reason: 'Already imported.' });
                continue;
            }

            const row = {
                user_id: req.user.id,
                title: clean(item.title, 120) || repo.name,
                description: clean(item.description, 2000) || repo.description || null,
                cover_image_url: null,
                category: clean(item.category, 60) || 'GitHub',
                tags: JSON.stringify((repo.topics || []).slice(0, 10)),
                tech_stack: JSON.stringify(repo.language ? [repo.language] : []),
                github_url: repo.url,
                live_url: repo.homepage ? safeHttpUrl(repo.homepage) : null,
                is_featured: false,
                is_published: false, // never auto-publish imported repos
            };

            const [insertedId] = await db('projects').insert(row);
            const actualId = typeof insertedId === 'object' ? insertedId.id : insertedId;
            importedUrls.add(repo.url);
            created.push({ id: actualId, title: row.title });
        }

        return res.status(201).json({ created, skipped });
    } catch (err) {
        return sendError(err, res, next);
    }
}

module.exports = { listRepos, importRepos };