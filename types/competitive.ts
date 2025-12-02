// TypeScript types for Competitive Exams module

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionStatus = "unanswered" | "answered" | "flagged";

export interface CompetitiveUser {
  id: string;
  name: string;
  email: string;
  selectedExams: string[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  topic?: string;
  difficulty?: Difficulty;
}

export interface TestSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  durationMinutes: number;
  numQuestions: number;
  attempts: number;
  lastScorePercent?: number;
}

export interface Test {
  id: string;
  examId: string;
  categoryId: string;
  title: string;
  difficulty: Difficulty;
  durationMinutes: number;
  questions: Question[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  tests: TestSummary[];
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  badge?: string;
  categories: Category[];
}

export interface TestAttempt {
  testId: string;
  answers: { [questionId: string]: number };
  flagged: Set<string>;
  startTime: Date;
  timeRemainingSeconds: number;
}

export interface TestResult {
  testId: string;
  examId: string;
  categoryId: string;
  scorePercent: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  timeTakenMinutes: number;
  sectionWiseAccuracy: { [sectionName: string]: number };
  topicWeaknesses: string[];
  answers: { [questionId: string]: number };
  completedAt: Date;
}

export interface GuidanceResult {
  recommendedCategory: string;
  recommendedTests: TestSummary[];
  textTips: string[];
}

export interface PerformanceSnapshot {
  scoreHistory: { testName: string; score: number }[];
  subjectAccuracy: { subject: string; accuracy: number }[];
  totalTestsTaken: number;
  averageScore: number;
}
