'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatBubble } from '@/components/ChatBubble';
import { StatusBadge, type AssistantState } from '@/components/StatusBadge';
import { VoiceOrb } from '@/components/VoiceOrb';
import { Waveform } from '@/components/Waveform';
import { base64ToAudioUrl, blobToFile } from '@/lib/audio';

type VoiceResponse = { transcript: string; replyText: string; audioBase64: string };

const MAX_RECORDING_MS = 8000;

export default function HomePage() {
  const [state, setState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState('');
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showError = useCallback((message: string) => {
    setState('error');
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAudioPlaying(false);
    setState('idle');
  }, []);

  const processAudio = useCallback(
    async (blob: Blob) => {
      try {
        setState('processing');
        const formData = new FormData();
        formData.append('audio', await blobToFile(blob, 'recording.webm'));

        const response = await fetch('/api/voice-assistant', { method: 'POST', body: formData });
        const body = (await response.json()) as Partial<VoiceResponse> & { error?: string };
        if (!response.ok) {
          throw new Error(body.error || 'Failed to process audio.');
        }

        if (!body.transcript || !body.replyText || !body.audioBase64) {
          throw new Error('The server returned an incomplete response.');
        }

        setTranscript(body.transcript);
        setReplyText(body.replyText);

        const audio = new Audio(base64ToAudioUrl(body.audioBase64));
        audioRef.current = audio;
        audio.onended = () => {
          setAudioPlaying(false);
          setState('idle');
        };

        setState('speaking');
        setAudioPlaying(true);
        await audio.play();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not play or process audio. Please retry.';
        showError(message);
        setAudioPlaying(false);
      }
    },
    [showError]
  );

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await processAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState('recording');

      timeoutRef.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch {
      showError('Microphone permission denied or unavailable.');
    }
  }, [processAudio, showError, stopRecording]);

  const toggleRecording = useCallback(async () => {
    if (state === 'recording') {
      stopRecording();
      return;
    }
    if (state === 'processing' || state === 'speaking') {
      return;
    }
    await startRecording();
  }, [startRecording, state, stopRecording]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        const target = event.target as HTMLElement | null;
        const isTyping =
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.isContentEditable;

        if (isTyping) {
          return;
        }

        event.preventDefault();
        void toggleRecording();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleRecording]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const isActionDisabled = state === 'processing' || state === 'speaking';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl md:p-8">
        <div className="flex flex-col items-center gap-5">
          <StatusBadge state={state} />
          <VoiceOrb state={state} onClick={() => void toggleRecording()} disabled={isActionDisabled} />
          <Waveform active={state === 'recording'} />

          {state === 'processing' && (
            <div className="flex gap-1" aria-label="Processing">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-2 w-2 rounded-full bg-cyan-200"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex w-full flex-col gap-3">
            {transcript && <ChatBubble role="user" text={transcript} />}
            {replyText && <ChatBubble role="assistant" text={replyText} />}
          </div>

          {audioPlaying && (
            <button
              onClick={stopSpeaking}
              className="rounded-xl border border-red-300/40 bg-red-400/20 px-4 py-2 text-sm text-red-100 transition hover:bg-red-400/30"
            >
              Stop speaking
            </button>
          )}

          <p className="text-center text-xs text-slate-300/80">
            Your microphone is used only when you start recording.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm text-red-100 backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
