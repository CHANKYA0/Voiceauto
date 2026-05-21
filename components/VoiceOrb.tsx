'use client';

import { motion } from 'framer-motion';
import type { AssistantState } from './StatusBadge';

export function VoiceOrb({
  state,
  onClick,
  disabled
}: {
  state: AssistantState;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isBusy = state === 'processing' || state === 'speaking';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative rounded-full p-4 transition disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Toggle recording"
    >
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute inset-0 rounded-full border border-cyan-300/40"
          animate={
            state === 'recording'
              ? { scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }
              : { scale: 1, opacity: 0.2 }
          }
          transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.25 }}
        />
      ))}
      <motion.div
        animate={{
          scale: state === 'recording' ? 1.08 : state === 'speaking' ? [1, 1.03, 1] : 1,
          boxShadow: isBusy ? '0 0 50px rgba(56,189,248,0.5)' : '0 0 30px rgba(56,189,248,0.35)'
        }}
        transition={{ duration: 1.2, repeat: state === 'speaking' ? Infinity : 0 }}
        className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 text-4xl"
      >
        🎤
      </motion.div>
    </button>
  );
}
