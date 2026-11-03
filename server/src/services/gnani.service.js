// Talks to Gnani Prisma (speech-to-text) and Timbre (text-to-speech).
// Server-side only: the API key never reaches the browser.
const STT_URL = 'https://api.vachana.ai/stt/v3';
const TTS_URL = 'https://api.vachana.ai/api/v1/tts/inference';
const MAX_SPEAK_CHARS = 300;

class GnaniError extends Error {
    constructor(message, status = 502) {
        super(message);
        this.status = status;
    }
}

function isConfigured() {
    return Boolean(process.env.GNANI_API_KEY);
}

function requireKey() {
    if (!isConfigured()) {
        throw new GnaniError('Gnani voice is not set up on the server. Add GNANI_API_KEY to server/.env.', 503);
    }
    return process.env.GNANI_API_KEY;
}

function explain(status) {
    if (status === 401 || status === 403) {
        return 'Gnani rejected the request. Check the API key, its permissions and your remaining credits.';
    }
    if (status === 429) return 'Gnani rate limit reached. Please try again shortly.';
    if (status === 400) return 'Gnani could not process this request.';
    return 'Gnani is temporarily unavailable.';
}

async function callGnani(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        if (!res.ok) throw new GnaniError(explain(res.status), res.status === 429 ? 429 : 502);
        return res;
    } catch (err) {
        if (err instanceof GnaniError) throw err;
        if (err.name === 'AbortError') throw new GnaniError('Gnani took too long to respond.', 504);
        throw new GnaniError('Could not reach Gnani.', 502);
    } finally {
        clearTimeout(timer);
    }
}

// WAV buffer in, transcript out (Prisma)
async function transcribe(wavBuffer, languageCode = 'en-IN') {
    const key = requireKey();
    const form = new FormData();
    form.append('audio_file', new Blob([wavBuffer], { type: 'audio/wav' }), 'speech.wav');
    form.append('language_code', languageCode);

    const res = await callGnani(STT_URL, { method: 'POST', headers: { 'X-API-Key-ID': key }, body: form });
    const body = await res.json().catch(() => null);
    if (!body || body.success === false || typeof body.transcript !== 'string') {
        throw new GnaniError('Gnani returned an unexpected response.', 502);
    }
    return { transcript: body.transcript.trim(), model: body.model || 'prisma' };
}

// Text in, WAV audio buffer out (Timbre)
async function speak(text) {
    const key = requireKey();
    const clean = String(text || '').trim().slice(0, MAX_SPEAK_CHARS);
    if (!clean) throw new GnaniError('There is no text to speak.', 400);

    const res = await callGnani(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key-ID': key },
        body: JSON.stringify({
            text: clean,
            voice: 'Kaveri',
            model: 'timbre-v2.5',
            language: 'en-IN',
            speed: 1.0,
            audio_config: {
                sample_rate: 24000,
                num_channels: 1,
                sample_width: 2,
                encoding: 'linear_pcm',
                container: 'wav',
            },
        }),
    });
    return Buffer.from(await res.arrayBuffer());
}

module.exports = { isConfigured, transcribe, speak, GnaniError, MAX_SPEAK_CHARS };