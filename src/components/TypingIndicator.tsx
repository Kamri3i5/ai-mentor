export const TypingIndicator = () => (
  <div className="flex items-center gap-1" aria-label="Клиент печатает">
    <span className="h-2 w-2 animate-bounce rounded-full bg-turon-700 [animation-delay:-0.2s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-turon-700 [animation-delay:-0.1s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-turon-700" />
  </div>
);
