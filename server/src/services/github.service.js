// Fetches a user's PUBLIC GitHub repositories (read-only). Used by the backend only.
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const CACHE_TTL_MS = 10 * 60 * 1000; // keep results for 10 minutes
const cache = new Map(); // lowercase username -> { data, savedAt }

class GithubError extends Error {
    constructor(message, status = 502) {
        super(message);
        this.status = status;
    }
}

function isValidUsername(username) {
    return typeof username === 'string' && USERNAME_RE.test(username);
}

async function fetchRepos(username) {
    if (!isValidUsername(username)) {
        throw new GithubError('Please enter a valid GitHub username.', 400);
    }

    const key = username.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
        return { ...cached.data, fromCache: true, stale: false };
    }

    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'folio-voice' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
        const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`;
        const res = await fetch(url, { headers, signal: controller.signal });

        if (res.status === 404) throw new GithubError('GitHub user not found.', 404);
        if (res.status === 403 || res.status === 429) {
            throw new GithubError('GitHub rate limit reached. Please try again later.', 429);
        }
        if (!res.ok) throw new GithubError(`GitHub returned an error (${res.status}).`, 502);

        const raw = await res.json();
        const repos = raw.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description || '',
            language: r.language || '',
            stars: r.stargazers_count,
            url: r.html_url,
            homepage: r.homepage || '',
            updatedAt: r.pushed_at || r.updated_at,
            fork: r.fork,
            topics: r.topics || [],
        }));

        const data = {
            username,
            repos,
            fetchedAt: new Date().toISOString(),
            source: 'GitHub',
        };
        cache.set(key, { data, savedAt: Date.now() });
        return { ...data, fromCache: false, stale: false };
    } catch (err) {
        if (err instanceof GithubError && err.status === 404) throw err;
        // If GitHub is down or limiting us, fall back to saved data only if we really have it
        if (cached) return { ...cached.data, fromCache: true, stale: true };
        if (err instanceof GithubError) throw err;
        if (err.name === 'AbortError') throw new GithubError('GitHub took too long to respond.', 504);
        throw new GithubError('Could not reach GitHub. Live data is temporarily unavailable.', 502);
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { fetchRepos, isValidUsername, GithubError };