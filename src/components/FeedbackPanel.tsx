import type { FeedbackAnalysis, Scenario, SessionResult } from '../types';

interface FeedbackPanelProps {
  scenario: Scenario | null;
  result: SessionResult | null;
  isLoading: boolean;
  error: string | null;
  onRepeat: () => void;
  onChooseAnother: () => void;
}

const criteria = [
  ['greeting', 'Приветствие'],
  ['questioning', 'Вопросы'],
  ['empathy', 'Эмпатия'],
  ['solution', 'Решение'],
  ['closing', 'Завершение'],
] as const;

const parseFeedback = (feedback: string): FeedbackAnalysis | null => {
  try {
    return JSON.parse(feedback) as FeedbackAnalysis;
  } catch {
    return null;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 75) return 'text-emerald-700';
  if (score >= 50) return 'text-amber-700';
  return 'text-red-700';
};

const getBarColor = (score: number) => {
  if (score >= 15) return 'bg-emerald-500';
  if (score >= 10) return 'bg-amber-500';
  return 'bg-red-500';
};

export const FeedbackPanel = ({
  scenario,
  result,
  isLoading,
  error,
  onRepeat,
  onChooseAnother,
}: FeedbackPanelProps) => {
  const analysis = result ? parseFeedback(result.feedback) : null;
  const totalScore = analysis?.totalScore ?? result?.totalScore ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-turon-700">AI-Mentor | Результаты тренировки</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
          {scenario?.title ?? 'Обратная связь'}
        </h1>
      </header>

      {isLoading && (
        <section className="grid flex-1 place-items-center py-20">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-turon-100 border-t-turon-700" />
            <p className="mt-5 text-lg font-semibold text-slate-950">Анализируем вашу беседу...</p>
            <p className="mt-2 text-sm text-slate-500">Старший тренер оценивает структуру, эмпатию и решение.</p>
          </div>
        </section>
      )}

      {!isLoading && error && !result && (
        <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">Не удалось получить оценку</p>
          <p className="mt-2 text-sm">{error}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRepeat}
              className="rounded-md bg-turon-700 px-4 py-3 text-sm font-semibold text-white hover:bg-turon-800"
            >
              Повторить сценарий
            </button>
            <button
              type="button"
              onClick={onChooseAnother}
              className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Выбрать другой сценарий
            </button>
          </div>
        </section>
      )}

      {!isLoading && result && analysis && (
        <section className="grid gap-5 py-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-medium text-slate-500">Итоговый балл</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <p className={`text-6xl font-semibold leading-none ${getScoreColor(totalScore)}`}>
                {totalScore}
              </p>
              <p className="pb-2 text-2xl font-semibold text-slate-400">/ 100</p>
            </div>
          </div>

          <div className="grid gap-4">
            {criteria.map(([key, label]) => {
              const item = analysis.scores[key];

              return (
                <article key={key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-slate-950">{label}</h2>
                    <p className="text-sm font-semibold text-slate-700">{item.score} / 20</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.score)}`}
                      style={{ width: `${Math.min(100, Math.max(0, (item.score / 20) * 100))}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.comment}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="font-semibold text-emerald-900">Сильные стороны</h2>
              <ul className="mt-4 space-y-3">
                {analysis.strengths.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-emerald-800">
                    <span className="mt-0.5 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-900">Что улучшить</h2>
              <ul className="mt-4 space-y-3">
                {analysis.improvements.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-amber-800">
                    <span className="mt-0.5 font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-lg border border-turon-100 bg-turon-50 p-5">
            <h2 className="font-semibold text-turon-900">Общее впечатление</h2>
            <p className="mt-3 text-sm leading-6 text-turon-900">{analysis.overallComment}</p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRepeat}
              className="rounded-md bg-turon-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-turon-800"
            >
              Повторить сценарий
            </button>
            <button
              type="button"
              onClick={onChooseAnother}
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Выбрать другой сценарий
            </button>
          </div>
        </section>
      )}

      {!isLoading && result && !analysis && (
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <p className="font-semibold text-slate-950">Оценка получена</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-100 p-4 text-sm text-slate-700">
            {result.feedback}
          </pre>
        </section>
      )}
    </main>
  );
};
