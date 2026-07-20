export class EvaluationDomainService {
  static calculateScore(correctCount: number, totalQuestions: number): number {
    if (totalQuestions <= 0) return 0;
    return Math.round((correctCount / totalQuestions) * 100);
  }

  static isPassing(score: number, passingScore = 70): boolean {
    return score >= passingScore;
  }
}
