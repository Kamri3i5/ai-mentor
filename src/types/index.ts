export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  clientName: string;
  clientAge: number;
  clientAvatar: string;
  systemPrompt: string;
}

export interface SessionResult {
  scenarioId: string;
  messages: Message[];
  feedback: string;
  totalScore: number;
  completedAt: Date;
}

export interface CriterionFeedback {
  score: number;
  comment: string;
}

export interface FeedbackAnalysis {
  scores: {
    greeting: CriterionFeedback;
    questioning: CriterionFeedback;
    empathy: CriterionFeedback;
    solution: CriterionFeedback;
    closing: CriterionFeedback;
  };
  totalScore: number;
  strengths: string[];
  improvements: string[];
  overallComment: string;
}
