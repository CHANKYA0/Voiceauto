export function ChatBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user';
  return (
    <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm md:text-base ${isUser ? 'ml-auto bg-cyan-400/20 border border-cyan-300/30' : 'mr-auto bg-white/10 border border-white/20'}`}>
      <p className="whitespace-pre-wrap text-slate-100">{text}</p>
    </div>
  );
}
