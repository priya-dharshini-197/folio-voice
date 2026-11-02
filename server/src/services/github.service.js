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

async function fetchProfile(username) {
    if (!isValidUsername(username)) {
        throw new GithubError('Please enter a valid GitHub username.', 400);
    }
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'folio-voice' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
            headers,
            signal: controller.signal,
        });
        if (res.status === 404) throw new GithubError('GitHub user not found.', 404);
        if (res.status === 403 || res.status === 429) {
            throw new GithubError('GitHub rate limit reached. Please try again later.', 429);
        }
        if (!res.ok) throw new GithubError(`GitHub returned an error (${res.status}).`, 502);
        const u = await res.json();
        return {
            followers: u.followers,
            following: u.following,
            publicRepos: u.public_repos,
            profileUrl: u.html_url,
        };
    } catch (err) {
        if (err instanceof GithubError) throw err;
        if (err.name === 'AbortError') throw new GithubError('GitHub took too long to respond.', 504);
        throw new GithubError('Could not reach GitHub. Live data is temporarily unavailable.', 502);
    } finally {
        clearTimeout(timer);
    }
}

const CONTRIBUTION_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const contributionCache = new Map();
const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function fetchContributions(username, weeks = 26) {
    if (!isValidUsername(username)) {
        throw new GithubError('Please enter a valid GitHub username.', 400);
    }
    // The GraphQL API needs a token. Without one we say so honestly instead of inventing data.
    if (!process.env.GITHUB_TOKEN) {
        return { available: false, reason: 'no_token' };
    }

    const key = `${username.toLowerCase()}:${weeks}`;
    const cached = contributionCache.get(key);
    if (cached && Date.now() - cached.savedAt < CONTRIBUTION_CACHE_TTL_MS) {
        return { ...cached.data, fromCache: true, stale: false };
    }

    const to = new Date();
    const from = new Date(to.getTime() - (weeks + 1) * 7 * 24 * 60 * 60 * 1000);
    const query = `query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'folio-voice',
            },
            body: JSON.stringify({
                query,
                variables: { login: username, from: from.toISOString(), to: to.toISOString() },
            }),
            signal: controller.signal,
        });

        if (res.status === 401) return { available: false, reason: 'token_rejected' };
        if (res.status === 403 || res.status === 429) {
            throw new GithubError('GitHub rate limit reached. Please try again later.', 429);
        }
        if (!res.ok) throw new GithubError(`GitHub returned an error (${res.status}).`, 502);

        const body = await res.json();
        if (body.errors && body.errors.length) {
            const notFound = body.errors.some((e) => e.type === 'NOT_FOUND');
            if (notFound) throw new GithubError('GitHub user not found.', 404);
            throw new GithubError('GitHub could not return contribution data.', 502);
        }

        const rawWeeks = body.data.user.contributionsCollection.contributionCalendar.weeks;
        const recent = rawWeeks.slice(-weeks).map((w) =>
            w.contributionDays.map((d) => ({
                date: d.date,
                count: d.contributionCount,
                level: LEVELS[d.contributionLevel] ?? 0,
            }))
        );
        const total = recent.reduce((sum, w) => sum + w.reduce((s, d) => s + d.count, 0), 0);

        const data = {
            available: true,
            username,
            weeks: recent,
            totalContributions: total,
            weeksShown: recent.length,
            fetchedAt: new Date().toISOString(),
            source: 'GitHub',
        };
        contributionCache.set(key, { data, savedAt: Date.now() });
        return { ...data, fromCache: false, stale: false };
    } catch (err) {
        if (cached) return { ...cached.data, fromCache: true, stale: true };
        if (err instanceof GithubError) throw err;
        if (err.name === 'AbortError') throw new GithubError('GitHub took too long to respond.', 504);
        throw new GithubError('Could not reach GitHub. Live data is temporarily unavailable.', 502);
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { fetchRepos, fetchProfile, fetchContributions, isValidUsername, GithubError };