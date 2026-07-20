export interface CourseEntity {
  id: number;
  title: string;
  description: string;
  price: string;
  level: string;
  thumbnailUrl?: string;
  categoryId?: number;
  subcategoryId?: number;
  teacherId?: number;
  teacherName?: string;
  tags?: number[];
  createdAt?: string;
}
