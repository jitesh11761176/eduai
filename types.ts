export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'principal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Principal {
  id: string;
  name: string;
  email: string;
  role: 'principal';
  avatarUrl: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  role: 'parent';
  avatarUrl: string;
  childId: string;
}

export interface InteractiveContent {
    type: 'fill-in-the-blank';
    sentences: (string | { blank: string })[];
    answers: Record<string, string>;
}

export interface CourseMaterial {
  id: string;
  type: 'file' | 'text' | 'video' | 'interactive' | 'drive';
  title: string;
  fileId?: string; // For 'file' type (Mock Google Drive File ID)
  content?: string; // For 'text' type
  url?: string; // For 'video' or 'drive' type
  interactiveContent?: InteractiveContent;
}

export interface RubricCriterion {
    id: string;
    description: string;
    levels: {
        description: string;
        points: number;
    }[];
}

export interface Rubric {
    criteria: RubricCriterion[];
}

export interface DetailedAiFeedback {
    strengths: string;
    weaknesses: string;
    suggestion: string;
}

export interface TestSubmission {
  id: string;
  studentId: string;
  courseId: string;
  chapterId: string;
  testId: string;
  answers: { questionId: string; answer: string }[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  detailedAiFeedback?: DetailedAiFeedback;
  rubricEvaluation?: Record<string, number>; // criterionId -> points awarded
}

export interface MaterialCompletion {
  id: string; // composite id student_course_chapter_material
  studentId: string;
  courseId: string;
  chapterId: string;
  materialId: string;
  completedAt: Date;
}

export interface Test {
  id: string;
  title: string;
  type: 'online' | 'offline';
  questions: Question[];
  duration?: number; // Duration in minutes
  isAdaptive?: boolean;
  rubric?: Rubric;
}

export interface Question {
    id: string;
    text: string;
    type: 'subjective' | 'mcq' | 'true-false';
    options?: string[];
    correctAnswer?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Chapter {
  id: string;
  title: string;
  materials: CourseMaterial[];
  test?: Test;
  completed: boolean;
  isRemedial?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface DiscussionPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: Date;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  title: string;
  posts: DiscussionPost[];
  createdAt: Date;
}

export type KanbanStatus = 'To Do' | 'In Progress' | 'Done';

export interface KanbanTask {
    id: string;
    content: string;
    status: KanbanStatus;
}

export interface ProjectWorkspace {
    tasks: KanbanTask[];
    // Other workspace data like shared files, documents can be added here
}

export interface Project {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    workspace: ProjectWorkspace;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name from lucide-react
  isTemporary?: boolean;
}

export interface Course {
  id: string;
  title: string;
  classLevel: number;
  subject: string;
  teacher: string;
  chapters: Chapter[];
  announcements: Announcement[];
  discussionThreads: DiscussionThread[];
  projects: Project[];
  studyGroups: StudyGroup[];
}

export interface StudyGroup {
    id: string;
    name: string;
    members: { id: string, name: string, avatarUrl: string }[];
    chat: ChatMessage[];
}

export interface Student {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    courses: { courseId: string; progress: number }[];
    points: number;
    badges: Badge[];
    learningStreak: number;
    riskLevel?: 'low' | 'medium' | 'high';
}

export interface Teacher {
    id:string;
    name: string;
    email: string;
    avatarUrl: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot' | string; // Can be user/bot ID
    senderName?: string;
    senderAvatar?: string;
    text: string;
    timestamp?: Date;
}

export type View = 'dashboard' | 'courseDetail' | 'testTaking' | 'createTest' | 'manageUsers' | 'calendar' | 'teacherCommunity' | 'discussionThread' | 'teacherAnalytics' | 'parentDashboard' | 'projectWorkspace' | 'careerCenter' | 'lessonPlanner';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link?: { view: View; context: any };
  createdAt: Date;
  read: boolean;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'test' | 'project';
    courseTitle: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    points: number;
    isCompleted: boolean;
}

export interface SkillNode {
    id: string; // chapterId
    title: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    isSkipped?: boolean;
    isRemedial?: boolean;
    dependencies: string[];
    badge?: Badge;
}

// --- New AI Feature Types ---

export interface GeneratedQuestion {
    text: string;
    type: 'subjective' | 'mcq' | 'true-false';
    options?: string[];
    correctAnswer?: string;
}

export interface FocusPlan {
  summary: string;
  focusAreas: {
    concept: string;
    relevantMaterials: {
      title: string;
      type: 'file' | 'text' | 'video';
    }[];
    suggestion: string;
  }[];
}

export interface ClassInsights {
    overallSummary: string;
    commonMisconceptions: {
        concept: string;
        analysis: string;
        studentExamples: string[];
    }[];
    teachingRecommendations: string[];
}

export interface StudyPlan {
  goal: string;
  schedule: {
    date: string;
    tasks: string[];
  }[];
}


export interface MicroCredential {
    id: string;
    title: string;
    issuer: string; // e.g., "EduAI & Physics Association of India"
    issueDate: string;
    icon: string; // lucide icon name
}

export interface CareerCounselorReport {
    summary: string;
    strengths: string[];
    suggestedCareers: {
        title: string;
        description: string;
        match: 'High' | 'Medium';
    }[];
    recommendedPrograms: string[];
}

export interface Internship {
    id: string;
    company: string;
    logoUrl: string;
    title: string;
    location: string;
    description: string;
}

export interface LessonPlan {
    title: string;
    objective: string;
    activities: {
        title: string;
        description: string;
        duration: number; // in minutes
    }[];
    discussionQuestions: string[];
}

export type AuthenticatedUser = User | Parent | Principal;
