import type { Message, Scenario } from '../types';

interface MessageBubbleProps {
  message: Message;
  scenario: Scenario;
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

export const MessageBubble = ({ message, scenario }: MessageBubbleProps) => {
  const isEmployee = message.role === 'user';

  return (
    <div className={`flex w-full gap-3 ${isEmployee ? 'justify-end' : 'justify-start'}`}>
      {!isEmployee && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
          {scenario.clientAvatar}
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[68%] ${
          isEmployee
            ? 'rounded-br-md bg-turon-700 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-900'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        <p className={`mt-2 text-[11px] ${isEmployee ? 'text-blue-100' : 'text-slate-400'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};
