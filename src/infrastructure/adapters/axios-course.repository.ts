import { axiosClient } from '../http/axios-client';

export interface Course {
  id: number;
  title: string;
  description: string;
  price: string;
  level: string;
  thumbnail_url?: string;
  category?: number;
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await axiosClient.get('/courses/');
  return response.data.results || response.data;
};
