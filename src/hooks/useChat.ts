import { useCallback, useRef, useState } from 'react';
import { JUDGE_SYSTEM_PROMPT } from '../data/scenarios';
import type { FeedbackAnalysis, Message, Scenario, SessionResult } from '../types';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

type GeminiRole = 'user' | 'model';

interface GeminiMessage {
  role: GeminiRole;
  parts: { text: string }[];
}

interface UseChatState {
  messages: Message[];
  isLoading: boolean;
  isFeedbackLoading: boolean;
  sessionActive: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  endSession: () => Promise<SessionResult>;
  resetSession: () => void;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createMessage = (role: 'user' | 'assistant', content: string): Message => ({
  id: createId(),
  role,
  content,
  timestamp: new Date(),
});

const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const callGemini = async (
  systemPrompt: string,
  messages: GeminiMessage[],
) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Добавьте VITE_GEMINI_API_KEY в .env, затем перезапустите dev-сервер.');
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages,
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : 'Не удалось получить ответ от Gemini API.';
    throw new Error(message);
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API вернул пустой ответ.');
  }

  return text;
};

const buildScenarioMessages = (visibleMessages: Message[]): GeminiMessage[] => {
  const history = visibleMessages.map((message) => ({
    role: (message.role === 'assistant' ? 'model' : 'user') as GeminiRole,
    parts: [{ text: message.content }],
  }));

  return [
    {
      role: 'user',
      parts: [{ text: 'Системное сообщение тренажёра: клиент уже находится в отделении. Веди себя по сценарию и отвечай только репликами клиента.' }],
    },
    ...history,
  ];
};

const extractJson = (content: string) => {
  const trimmed = content.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Ответ тренера не содержит JSON.');
  }

  return trimmed.slice(start, end + 1);
};

const parseFeedback = (content: string): FeedbackAnalysis => JSON.parse(extractJson(content));

const buildTranscript = (messages: Message[]) =>
  messages
    .map((message) => {
      const speaker = message.role === 'user' ? 'Сотрудник' : 'Клиент';
      return `${speaker}: ${message.content}`;
    })
    .join('\n');

export const useChat = (scenario: Scenario | null): UseChatState => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrappingRef = useRef(false);

  const startSession = useCallback(async () => {
    if (!scenario || bootstrappingRef.current || messages.length > 0) {
      return;
    }

    bootstrappingRef.current = true;
    setSessionActive(true);
    setIsLoading(true);
    setError(null);

    try {
      const firstReply = await callGemini(scenario.systemPrompt, [
        {
          role: 'user',
          parts: [{
            text: 'Начни диалог первым короткой естественной репликой клиента по ситуации. Не объясняй сценарий.',
          }],
        },
      ]);

      setMessages([createMessage('assistant', firstReply)]);
    } catch (err) {
      bootstrappingRef.current = false;
      setSessionActive(false);
      setError(err instanceof Error ? err.message : 'Не удалось начать сессию.');
    } finally {
      setIsLoading(false);
    }
  }, [messages.length, scenario]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!scenario || !content.trim() || isLoading || isFeedbackLoading) {
        return;
      }

      const employeeMessage = createMessage('user', content.trim());
      const nextMessages = [...messages, employeeMessage];

      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);
      setSessionActive(true);

      try {
        const reply = await callGemini(scenario.systemPrompt, buildScenarioMessages(nextMessages));
        setMessages((current) => [...current, createMessage('assistant', reply)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение.');
      } finally {
        setIsLoading(false);
      }
    },
    [isFeedbackLoading, isLoading, messages, scenario],
  );

  const endSession = useCallback(async () => {
    if (!scenario) {
      throw new Error('Сценарий не выбран.');
    }

    setIsFeedbackLoading(true);
    setError(null);
    setSessionActive(false);

    try {
      const transcript = buildTranscript(messages);
      const feedback = await callGemini(
        JUDGE_SYSTEM_PROMPT,
        [
          {
            role: 'user',
            parts: [{ text: `Сценарий: ${scenario.title}\n\nДиалог:\n${transcript}` }],
          },
        ],
      );
      const parsed = parseFeedback(feedback);

      return {
        scenarioId: scenario.id,
        messages,
        feedback: JSON.stringify(parsed),
        totalScore: parsed.totalScore,
        completedAt: new Date(),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось получить оценку.');
      throw err;
    } finally {
      setIsFeedbackLoading(false);
    }
  }, [messages, scenario]);

  const resetSession = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setIsFeedbackLoading(false);
    setSessionActive(false);
    setError(null);
    bootstrappingRef.current = false;
  }, []);

  return {
    messages,
    isLoading,
    isFeedbackLoading,
    sessionActive,
    error,
    startSession,
    sendMessage,
    endSession,
    resetSession,
  };
};
