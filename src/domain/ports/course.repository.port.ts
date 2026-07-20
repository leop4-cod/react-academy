import type { CourseEntity } from '../entities/course.entity';

export interface CourseRepositoryPort {
  list(params?: { category?: number; search?: string }): Promise<CourseEntity[]>;
  getById(id: number): Promise<CourseEntity>;
  create(data: Partial<CourseEntity>): Promise<CourseEntity>;
  update(id: number, data: Partial<CourseEntity>): Promise<CourseEntity>;
  delete(id: number): Promise<void>;
  uploadImage(id: number, formData: FormData): Promise<any>;
}
