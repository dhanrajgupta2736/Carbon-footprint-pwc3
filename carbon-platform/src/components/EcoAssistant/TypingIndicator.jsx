export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Eco-Assistant is thinking"
      className="flex items-center gap-2 px-4 py-3 bg-eco-50 border border-eco-200 rounded-2xl rounded-tl-sm w-fit"
    >
      <span aria-hidden="true" className="text-sm">🤖</span>
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-eco-400 typing-dot" />
        ))}
      </div>
    </div>
  )
}
