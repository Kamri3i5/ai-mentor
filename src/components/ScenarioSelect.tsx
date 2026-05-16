import type { Scenario, SessionResult } from '../types';

interface ScenarioSelectProps {
  scenarios: Scenario[];
  history: SessionResult[];
  onStart: (scenario: Scenario) => void;
}

const difficultyMeta = {
  easy: { label: 'easy', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { label: 'medium', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  hard: { label: 'hard', className: 'bg-red-50 text-red-700 ring-red-200' },
} satisfies Record<Scenario['difficulty'], { label: string; className: string }>;

const getScoreClass = (score: number) => {
  if (score >= 75) return 'text-emerald-700';
  if (score >= 50) return 'text-amber-700';
  return 'text-red-700';
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

export const ScenarioSelect = ({ scenarios, history, onStart }: ScenarioSelectProps) => {
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-turon-700 text-lg font-bold text-white shadow-soft">
            T
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              AI-Mentor | Тренажёр сотрудника
            </h1>
            <p className="mt-1 text-sm text-slate-600">Выберите сценарий для тренировки</p>
          </div>
        </div>
        <div className="rounded-full border border-turon-100 bg-white px-4 py-2 text-sm font-medium text-turon-700 shadow-sm">
          Turonbank Training
        </div>
      </header>

      <section className="grid gap-4 py-8 md:grid-cols-2">
        {scenarios.map((scenario) => {
          const difficulty = difficultyMeta[scenario.difficulty];

          return (
            <article
              key={scenario.id}
              className="group flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-turon-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-slate-100 text-5xl">
                    {scenario.clientAvatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{scenario.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {scenario.clientName}, {scenario.clientAge} лет
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${difficulty.className}`}
                >
                  {difficulty.label}
                </span>
              </div>

              <p className="mt-5 flex-1 text-sm leading-6 text-slate-600">{scenario.description}</p>

              <button
                type="button"
                onClick={() => onStart(scenario)}
                className="mt-5 rounded-md bg-turon-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-turon-800 focus:outline-none focus:ring-4 focus:ring-turon-200"
              >
                Начать тренировку
              </button>
            </article>
          );
        })}
      </section>

      <section className="mt-auto rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">История сессий</h2>
          <span className="text-sm text-slate-500">Последние 5</span>
        </div>

        {history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Пока нет завершённых тренировок.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {history.slice(0, 5).map((result) => {
              const scenario = scenarioById.get(result.scenarioId);

              return (
                <div
                  key={`${result.scenarioId}-${result.completedAt.toString()}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {scenario?.title ?? 'Сценарий'}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(result.completedAt)}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-semibold ${getScoreClass(result.totalScore)}`}>
                    {result.totalScore} / 100
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};
