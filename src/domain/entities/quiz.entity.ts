export interface QuizEntity {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  passingScore: number;
}

export interface QuizAttemptEntity {
  id: number;
  studentId: number;
  quizId: number;
  quizTitle?: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}
