# Voiceauto — Voice-only AI Assistant MVP

Premium-feeling voice assistant built with Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, and the OpenAI Node SDK.

## What it does
1. User taps the mic orb (or presses `Space`).
2. Browser requests microphone access and records audio.
3. Recording stops on second tap or after 8 seconds.
4. Audio uploads to `POST /api/voice-assistant` as `multipart/form-data`.
5. Backend performs STT → chat reply → TTS.
6. Frontend displays transcript and reply, then auto-plays assistant audio.

## Stack
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI Node SDK
- Browser MediaRecorder API
- Next.js Route Handlers

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env:
   ```bash
   cp .env.example .env.local
   ```
3. Add your OpenAI key to `.env.local`:
   ```env
   OPENAI_API_KEY=...
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## API
### `POST /api/voice-assistant`
**Request**: `multipart/form-data`
- `audio`: recorded audio file

**Response**
```json
{
  "transcript": "string",
  "replyText": "string",
  "audioBase64": "string"
}
```

## Implementation notes
- OpenAI API calls are backend-only in `app/api/voice-assistant/route.ts`.
- The frontend never receives or stores `OPENAI_API_KEY`.
- UI states: Idle, Recording, Processing, Speaking, Error.
- Toast message is shown for microphone/API/autoplay errors.
- Includes `Stop speaking` while playback is active.

## Suggested models (already wired)
- Transcription: `gpt-4o-mini-transcribe`
- Reply generation: `gpt-4o-mini`
- Text-to-speech: `gpt-4o-mini-tts`

## System prompt
> You are a fast voice assistant. Reply naturally, briefly, and helpfully. Keep answers under 3 sentences unless the user asks for detail. Use conversational wording. Do not sound robotic.

## TTS instruction
> Speak naturally like a helpful person sitting beside the user. Use relaxed pacing, warm tone, small pauses, and conversational intonation. Avoid sounding robotic, dramatic, or like a customer-support bot.

## GitHub push
After committing, push with:
```bash
git push origin <branch-name>
```
If `origin` is not configured, add it first:
```bash
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin <branch-name>
```
