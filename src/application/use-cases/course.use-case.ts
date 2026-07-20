import { apiService } from '../../infrastructure/http/api-service';

export class CourseUseCase {
  static async getCatalog(params?: { category?: number; search?: string }) {
    return await apiService.courses.list(params);
  }

  static async enroll(courseId: number) {
    return await apiService.enrollments.create(courseId);
  }
}
