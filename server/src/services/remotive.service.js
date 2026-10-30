// Fetches the public Remotive remote-jobs feed (read-only, no API key needed).
// The whole feed is cached because Remotive asks API users to keep requests low.
const FEED_URL = 'https://remotive.com/api/remote-jobs';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let cache = null; // { jobs, fetchedAt, savedAt }

class RemotiveError extends Error {
    constructor(message, status = 502) {
        super(message);
        this.status = status;
    }
}

function normalize(j) {
    return {
        id: j.id,
        title: j.title || '',
        company: j.company_name || '',
        category: j.category || '',
        jobType: j.job_type || '',
        location: j.candidate_required_location || '',
        salary: j.salary || '',
        tags: Array.isArray(j.tags) ? j.tags : [],
        publishedAt: j.publication_date || null,
        url: j.url,
    };
}

async function loadFeed() {
    if (cache && Date.now() - cache.savedAt < CACHE_TTL_MS) {
        return { ...cache, fromCache: true, stale: false };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await fetch(FEED_URL, {
            headers: { Accept: 'application/json', 'User-Agent': 'folio-voice' },
            signal: controller.signal,
        });
        if (res.status === 429) throw new RemotiveError('Remotive rate limit reached. Please try again later.', 429);
        if (!res.ok) throw new RemotiveError(`Remotive returned an error (${res.status}).`, 502);

        const body = await res.json();
        if (!body || !Array.isArray(body.jobs)) {
            throw new RemotiveError('Remotive returned an unexpected response.', 502);
        }

        const jobs = body.jobs
            .filter((j) => typeof j.url === 'string' && j.url.startsWith('https://'))
            .map(normalize);

        cache = { jobs, fetchedAt: new Date().toISOString(), savedAt: Date.now() };
        return { ...cache, fromCache: false, stale: false };
    } catch (err) {
        // If Remotive is down or limiting us, fall back to saved data only if we really have it
        if (cache) return { ...cache, fromCache: true, stale: true };
        if (err instanceof RemotiveError) throw err;
        if (err.name === 'AbortError') throw new RemotiveError('Remotive took too long to respond.', 504);
        throw new RemotiveError('Could not reach Remotive. Live data is temporarily unavailable.', 502);
    } finally {
        clearTimeout(timer);
    }
}

function cleanKeywords(input) {
    const list = Array.isArray(input) ? input : String(input || '').split(',');
    return list
        .map((k) => String(k).trim().toLowerCase().slice(0, 30))
        .filter(Boolean)
        .slice(0, 8);
}

async function fetchJobs(keywordsInput, limit = 12) {
    const terms = cleanKeywords(keywordsInput);
    const feed = await loadFeed();

    const matched = terms.length === 0
        ? feed.jobs
        : feed.jobs.filter((j) => {
            const haystack = `${j.title} ${j.company} ${j.category} ${j.tags.join(' ')}`.toLowerCase();
            return terms.some((t) => haystack.includes(t));
        });

    return {
        keywords: terms,
        jobs: matched.slice(0, limit),
        matchedCount: matched.length,
        totalInFeed: feed.jobs.length,
        fetchedAt: feed.fetchedAt,
        fromCache: feed.fromCache,
        stale: feed.stale,
        source: 'Remotive',
    };
}

module.exports = { fetchJobs, RemotiveError };