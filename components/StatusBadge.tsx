import { motion } from 'framer-motion';

export type AssistantState = 'idle' | 'recording' | 'processing' | 'speaking' | 'error';

const stateLabel: Record<AssistantState, string> = {
  idle: 'Tap to speak',
  recording: 'Listening…',
  processing: 'Thinking…',
  speaking: 'Speaking…',
  error: 'Something went wrong — tap to retry'
};

export function StatusBadge({ state }: { state: AssistantState }) {
  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur"
    >
      {stateLabel[state]}
    </motion.div>
  );
}
