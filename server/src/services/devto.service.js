// Fetches a user's PUBLISHED articles from the public DEV (Forem) API. Read-only, no API key needed.
const USERNAME_RE = /^[a-zA-Z0-9_-]{1,30}$/;
const CACHE_TTL_MS = 10 * 60 * 1000; // keep results for 10 minutes
const cache = new Map(); // lowercase username -> { data, savedAt }

class DevtoError extends Error {
    constructor(message, status = 502) {
        super(message);
        this.status = status;
    }
}

function isValidUsername(username) {
    return typeof username === 'string' && USERNAME_RE.test(username);
}

async function fetchArticles(username) {
    if (!isValidUsername(username)) {
        throw new DevtoError('Please enter a valid DEV username.', 400);
    }

    const key = username.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
        return { ...cached.data, fromCache: true, stale: false };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
        const url = `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=6`;
        const res = await fetch(url, {
            headers: { Accept: 'application/json', 'User-Agent': 'folio-voice' },
            signal: controller.signal,
        });

        if (res.status === 429) throw new DevtoError('DEV rate limit reached. Please try again later.', 429);
        if (!res.ok) throw new DevtoError(`DEV returned an error (${res.status}).`, 502);

        const raw = await res.json();
        if (!Array.isArray(raw)) throw new DevtoError('DEV returned an unexpected response.', 502);

        const articles = raw
            .filter((a) => typeof a.url === 'string' && a.url.startsWith('https://'))
            .map((a) => ({
                id: a.id,
                title: a.title,
                description: a.description || '',
                url: a.url,
                author: (a.user && a.user.name) || username,
                publishedAt: a.published_at,
                readingTime: a.reading_time_minutes || null,
                tags: Array.isArray(a.tag_list)
                    ? a.tag_list
                    : String(a.tag_list || '').split(',').map((t) => t.trim()).filter(Boolean),
            }));

        const data = {
            username,
            articles,
            fetchedAt: new Date().toISOString(),
            source: 'DEV',
        };
        cache.set(key, { data, savedAt: Date.now() });
        return { ...data, fromCache: false, stale: false };
    } catch (err) {
        // If DEV is down or limiting us, fall back to saved data only if we really have it
        if (cached) return { ...cached.data, fromCache: true, stale: true };
        if (err instanceof DevtoError) throw err;
        if (err.name === 'AbortError') throw new DevtoError('DEV took too long to respond.', 504);
        throw new DevtoError('Could not reach DEV. Live data is temporarily unavailable.', 502);
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { fetchArticles, isValidUsername, DevtoError };