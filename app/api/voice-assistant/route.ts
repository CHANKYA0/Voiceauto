import OpenAI from 'openai';

type VoiceAssistantResponse = {
  transcript: string;
  replyText: string;
  audioBase64: string;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  'You are a fast voice assistant. Reply naturally, briefly, and helpfully. Keep answers under 3 sentences unless the user asks for detail. Use conversational wording. Do not sound robotic.';

const TTS_INSTRUCTIONS =
  'Speak naturally like a helpful person sitting beside the user. Use relaxed pacing, warm tone, small pauses, and conversational intonation. Avoid sounding robotic, dramatic, or like a customer-support bot.';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'Server is missing OPENAI_API_KEY.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get('audio');

    if (!(audio instanceof File)) {
      return Response.json({ error: 'Missing audio file.' }, { status: 400 });
    }

    if (audio.size <= 0) {
      return Response.json({ error: 'Audio file is empty.' }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'gpt-4o-mini-transcribe'
    });

    const transcript = transcription.text?.trim();
    if (!transcript) {
      return Response.json({ error: 'Could not transcribe audio clearly.' }, { status: 422 });
    }

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 120,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript }
      ]
    });

    const replyText = chat.choices[0]?.message?.content?.trim() || 'I could not generate a response this time.';

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: replyText,
      instructions: TTS_INSTRUCTIONS,
      format: 'mp3'
    });

    const audioBase64 = Buffer.from(await speech.arrayBuffer()).toString('base64');

    const payload: VoiceAssistantResponse = { transcript, replyText, audioBase64 };
    return Response.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Voice assistant failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
