// One-off check of the Gnani APIs. Prints status codes and the transcript, never the key.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const KEY = process.env.GNANI_API_KEY;
if (!KEY) {
    console.log('GNANI_API_KEY is missing in server/.env');
    process.exit(1);
}

const OUT = path.join(__dirname, 'tts-test.wav');

async function main() {
    // 1. Text-to-speech (Timbre)
    const ttsRes = await fetch('https://api.vachana.ai/api/v1/tts/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key-ID': KEY },
        body: JSON.stringify({
            text: 'Go to skills.',
            voice: 'Kaveri',
            model: 'timbre-v2.5',
            language: 'en-IN',
            speed: 1.0,
            audio_config: {
                sample_rate: 16000,
                num_channels: 1,
                sample_width: 2,
                encoding: 'linear_pcm',
                container: 'wav',
            },
        }),
    });
    console.log('TTS status:', ttsRes.status, ttsRes.headers.get('content-type'));
    if (!ttsRes.ok) {
        console.log('TTS error:', await ttsRes.text());
        return;
    }
    const audio = Buffer.from(await ttsRes.arrayBuffer());
    fs.writeFileSync(OUT, audio);
    console.log('TTS audio saved:', audio.length, 'bytes');

    // 2. Speech-to-text (Prisma) on that same audio
    const form = new FormData();
    form.append('audio_file', new Blob([audio], { type: 'audio/wav' }), 'tts-test.wav');
    form.append('language_code', 'en-IN');
    const sttRes = await fetch('https://api.vachana.ai/stt/v3', {
        method: 'POST',
        headers: { 'X-API-Key-ID': KEY },
        body: form,
    });
    console.log('STT status:', sttRes.status);
    console.log('STT response:', await sttRes.text());
}

main().catch((e) => console.log('ERROR', e.message));