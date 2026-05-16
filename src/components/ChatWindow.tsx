import { useEffect, useRef, useState } from 'react';
import type { Message, Scenario } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
  scenario: Scenario;
  messages: Message[];
  isLoading: boolean;
  sessionActive: boolean;
  error: string | null;
  onStartSession: () => Promise<void>;
  onSendMessage: (content: string) => Promise<void>;
  onEndSession: () => void;
}

const difficultyMeta = {
  easy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  hard: 'bg-red-50 text-red-700 ring-red-200',
} satisfies Record<Scenario['difficulty'], string>;

export const ChatWindow = ({
  scenario,
  messages,
  isLoading,
  sessionActive,
  error,
  onStartSession,
  onSendMessage,
  onEndSession,
}: ChatWindowProps) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void onStartSession();
  }, [onStartSession]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const content = draft.trim();

    if (!content || isLoading) return;

    setDraft('');
    await onSendMessage(content);
  };

  return (
    <main className="mx-auto flex h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-xl font-semibold text-slate-950">{scenario.title}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${difficultyMeta[scenario.difficulty]}`}
            >
              {scenario.difficulty}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{scenario.description}</p>
        </div>
        <button
          type="button"
          onClick={onEndSession}
          disabled={isLoading && messages.length === 0}
          className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          Завершить сессию
        </button>
      </header>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-slate-100 text-4xl">
              {scenario.clientAvatar}
            </div>
            <div>
              <p className="font-semibold text-slate-950">{scenario.clientName}</p>
              <p className="text-sm text-slate-500">{scenario.clientAge} лет</p>
            </div>
          </div>
          <div className="flex min-w-[92px] items-center justify-end gap-2 text-sm text-slate-500">
            {isLoading ? (
              <>
                <span>печатает</span>
                <TypingIndicator />
              </>
            ) : (
              <span>{sessionActive ? 'на связи' : 'сессия завершена'}</span>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-100 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} scenario={scenario} />
          ))}

          {isLoading && messages.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl">
                {scenario.clientAvatar}
              </div>
              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </section>

      <footer className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            rows={2}
            disabled={isLoading || !sessionActive}
            placeholder="Введите ответ сотрудника..."
            className="min-h-[52px] flex-1 resize-none rounded-md border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-turon-500 focus:ring-4 focus:ring-turon-100 disabled:bg-slate-100"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!draft.trim() || isLoading || !sessionActive}
            className="rounded-md bg-turon-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-turon-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-32"
          >
            Отправить
          </button>
        </div>
      </footer>
    </main>
  );
};
