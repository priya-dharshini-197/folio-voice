// Gnani voice helpers for the browser.
// The Gnani API key stays on the server: the browser only talks to /api/voice/*.

const BASE = '/api';
const TARGET_RATE = 16000; // 16 kHz mono WAV, accepted by Gnani Prisma
const MAX_SECONDS = 25; // Prisma accepts clips up to 30 seconds

export function isRecordingSupported() {
    return (
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices &&
        !!navigator.mediaDevices.getUserMedia &&
        typeof MediaRecorder !== 'undefined' &&
        !!(window.AudioContext || window.webkitAudioContext)
    );
}

// Asks the server whether the Gnani key is set up (never returns the key itself)
export async function getGnaniStatus() {
    try {
        const res = await fetch(`${BASE}/voice/status`, { credentials: 'include' });
        if (!res.ok) return { configured: false };
        const data = await res.json();
        return { configured: Boolean(data.gnani && data.gnani.configured) };
    } catch (e) {
        return { configured: false };
    }
}

function encodeWav(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const write = (offset, str) => {
        for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
    };
    write(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    write(8, 'WAVE');
    write(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i += 1, offset += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([view], { type: 'audio/wav' });
}

// Any recording the browser makes (WebM, MP4, OGG) -> 16 kHz mono WAV
async function blobToWav(blob) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Ctx();
    try {
        const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
        const length = Math.max(1, Math.ceil(decoded.duration * TARGET_RATE));
        const offline = new Offline(1, length, TARGET_RATE);
        const source = offline.createBufferSource();
        source.buffer = decoded;
        source.connect(offline.destination);
        source.start();
        const rendered = await offline.startRendering();
        return encodeWav(rendered.getChannelData(0), TARGET_RATE);
    } finally {
        ctx.close();
    }
}

// Starts recording. Returns { stop(): Promise<Blob(wav)>, cancel() }.
export async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunks.push(e.data);
    };
    const finished = new Promise((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }));
    });
    recorder.start();
    const timer = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
    }, MAX_SECONDS * 1000);

    const release = () => stream.getTracks().forEach((t) => t.stop());

    return {
        async stop() {
            clearTimeout(timer);
            if (recorder.state === 'recording') recorder.stop();
            const recorded = await finished;
            release();
            return blobToWav(recorded);
        },
        cancel() {
            clearTimeout(timer);
            if (recorder.state === 'recording') recorder.stop();
            release();
        },
    };
}

// WAV recording -> transcript text (Gnani Prisma, through our server)
export async function transcribeWithGnani(wavBlob) {
    const res = await fetch(`${BASE}/voice/transcribe`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'audio/wav' },
        body: wavBlob,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Gnani speech recognition failed.');
    return data.transcript || '';
}

let currentAudio = null;

export function stopGnaniSpeech() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

// Text -> spoken audio (Gnani Timbre, through our server)
export async function speakWithGnani(text, onEnd) {
    stopGnaniSpeech();
    const clean = String(text || '')
        .replace(/[*_#`•]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 300);
    if (!clean) {
        if (onEnd) onEnd();
        return;
    }

    const res = await fetch(`${BASE}/voice/speak`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gnani text-to-speech failed.');
    }

    const url = URL.createObjectURL(await res.blob());
    const audio = new Audio(url);
    currentAudio = audio;
    const cleanup = () => {
        URL.revokeObjectURL(url);
        if (currentAudio === audio) currentAudio = null;
        if (onEnd) onEnd();
    };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    await audio.play();
}