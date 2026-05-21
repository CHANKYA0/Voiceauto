# Voice Assistant MVP

A smooth voice-only AI assistant built with Next.js App Router, TypeScript, Tailwind, Framer Motion, and OpenAI.

## Features
- Premium dark gradient UI with glassmorphism card.
- Animated voice orb with idle/recording/processing/speaking/error states.
- Spacebar shortcut to start/stop recording.
- Auto-stop recording after 8 seconds.
- Backend-only OpenAI calls for secure key handling.
- Speech-to-text → short chat reply → text-to-speech pipeline.
- Auto-play assistant audio and optional “Stop speaking” control.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Add your OpenAI API key in `.env.local`.
4. Start dev server:
   ```bash
   npm run dev
   ```

## API
### `POST /api/voice-assistant`
- Request: `multipart/form-data`
  - `audio`: recorded audio file
- Response:
  ```json
  {
    "transcript": "string",
    "replyText": "string",
    "audioBase64": "string"
  }
  ```

## Notes
- Microphone permission errors and playback errors are handled in the UI with toast feedback.
- Keep responses short for lower latency.
- No API key exposure in frontend code.
