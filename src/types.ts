export interface IdeaMapResult {
  analysis: {
    type: string;
    topic: string;
    requirements: string;
    emotion: string;
  };
  outline: {
    intro: string[];
    body: string[];
    conclusion: string[];
  };
  support: {
    vocabulary: string[];
    imagery: string[];
    examples: string[];
  };
}

export interface FeedbackResult {
  essayContent: string;
  teacherFeedback: {
    content: string;
    structure: string;
    emotion: string;
  };
  errors: {
    spelling: { original: string; correction: string; reason: string }[];
    vocabulary: { original: string; correction: string; reason: string }[];
    sentences: { original: string; correction: string; reason: string }[];
  };
  evaluation: {
    overall: string;
    improvement: string;
    scores: {
      spelling: number;
      structure: number;
      vocabulary: number;
      emotion: number;
    };
  };
  message: string;
  tips: string[];
  questions: string[];
  strongSentences?: { text: string; praise: string }[];
}

export interface HistoryItem {
  id: number;
  type: 'idea-map' | 'feedback';
  title: string;
  date: string;
  data: IdeaMapResult | FeedbackResult;
  prompt?: string;
  content?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
