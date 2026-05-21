import { motion } from 'framer-motion';

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end gap-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-cyan-300/80"
          animate={
            active
              ? { height: [8, 28, 12, 20, 8] }
              : { height: 8 }
          }
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}
