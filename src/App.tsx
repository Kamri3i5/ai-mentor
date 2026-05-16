import { useEffect, useState } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ScenarioSelect } from './components/ScenarioSelect';
import { scenarios } from './data/scenarios';
import { useChat } from './hooks/useChat';
import type { Scenario, SessionResult } from './types';

const STORAGE_KEY = 'ai-mentor-sessions';

type Screen = 'select' | 'chat' | 'feedback';

const hydrateResult = (result: SessionResult): SessionResult => ({
  ...result,
  completedAt: new Date(result.completedAt),
  messages: result.messages.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  })),
});

const loadHistory = (): SessionResult[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    return (JSON.parse(stored) as SessionResult[]).map(hydrateResult);
  } catch {
    return [];
  }
};

const saveHistory = (history: SessionResult[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
};

function App() {
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<SessionResult[]>(() => loadHistory());
  const [currentResult, setCurrentResult] = useState<SessionResult | null>(null);

  const chat = useChat(selectedScenario);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentResult(null);
    chat.resetSession();
    setScreen('chat');
  };

  const finishSession = () => {
    setScreen('feedback');
    setCurrentResult(null);

    void chat
      .endSession()
      .then((result) => {
        setCurrentResult(result);
        setHistory((items) => [result, ...items].slice(0, 20));
      })
      .catch(() => {
        setCurrentResult(null);
      });
  };

  const repeatScenario = () => {
    chat.resetSession();
    setCurrentResult(null);
    setScreen('chat');
  };

  const chooseAnother = () => {
    chat.resetSession();
    setSelectedScenario(null);
    setCurrentResult(null);
    setScreen('select');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="transition-all duration-300 ease-out">
        {screen === 'select' && (
          <div className="animate-screen-in">
            <ScenarioSelect scenarios={scenarios} history={history} onStart={startScenario} />
          </div>
        )}

        {screen === 'chat' && selectedScenario && (
          <div className="animate-screen-in">
            <ChatWindow
              scenario={selectedScenario}
              messages={chat.messages}
              isLoading={chat.isLoading}
              sessionActive={chat.sessionActive}
              error={chat.error}
              onStartSession={chat.startSession}
              onSendMessage={chat.sendMessage}
              onEndSession={finishSession}
            />
          </div>
        )}

        {screen === 'feedback' && (
          <div className="animate-screen-in">
            <FeedbackPanel
              scenario={selectedScenario}
              result={currentResult}
              isLoading={chat.isFeedbackLoading}
              error={chat.error}
              onRepeat={repeatScenario}
              onChooseAnother={chooseAnother}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
