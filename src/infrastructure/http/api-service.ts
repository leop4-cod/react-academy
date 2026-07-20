import { axiosClient, axiosPublic } from './axios-client';

// --- TYPE DEFINITIONS ---

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
  role?: 'student' | 'teacher' | 'admin' | string;
  is_teacher?: boolean;
  is_student?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
}

export interface Subcategory {
  id: number;
  category: number;
  name: string;
  description?: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  thumbnail_url?: string;
  thumbnail?: string;
  image?: string;
  image_url?: string;
  category?: number;
  subcategory?: number;
  teacher?: number;
  teacher_name?: string;
  tags?: number[];
  created_at?: string;
}

export interface Lesson {
  id: number;
  course: number;
  title: string;
  description?: string;
  video_url?: string;
  duration_minutes?: number;
  order: number;
}

export interface Enrollment {
  id: number;
  student: number;
  course: number;
  course_details?: Course;
  enrolled_at: string;
  is_completed: boolean;
}

export interface Progress {
  id: number;
  enrollment: number;
  lesson: number;
  completed: boolean;
  completed_at?: string;
}

export interface Review {
  id: number;
  course: number;
  student: number;
  student_name?: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface Wishlist {
  id: number;
  student: number;
  course: number;
  course_details?: Course;
  added_at: string;
}

export interface DiscussionForum {
  id: number;
  course: number;
  title: string;
  description?: string;
}

export interface ForumPost {
  id: number;
  forum: number;
  author: number;
  author_name?: string;
  title: string;
  content: string;
  created_at: string;
}

export interface ForumComment {
  id: number;
  post: number;
  author: number;
  author_name?: string;
  content: string;
  created_at: string;
}

export interface LessonQuestion {
  id: number;
  lesson: number;
  student: number;
  student_name?: string;
  title: string;
  content: string;
  created_at: string;
}

export interface LessonAnswer {
  id: number;
  question: number;
  user: number;
  user_name?: string;
  content: string;
  created_at: string;
}

export interface Quiz {
  id: number;
  course: number;
  title: string;
  description?: string;
  passing_score: number;
}

export interface QuizQuestion {
  id: number;
  quiz: number;
  text: string;
  question_type: 'multiple_choice' | 'true_false' | string;
  points: number;
}

export interface QuizAnswer {
  id: number;
  question: number;
  text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: number;
  student: number;
  quiz: number;
  quiz_title?: string;
  score: number;
  passed: boolean;
  attempted_at: string;
}

export interface Certificate {
  id: number;
  student: number;
  course: number;
  course_title?: string;
  issued_at: string;
  certificate_code: string;
  pdf_url?: string;
}

export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// --- API REPOSITORY ACTIONS ---

const unwrapList = <T>(response: any): T[] => {
  return response.data.results !== undefined ? response.data.results : response.data;
};

export const apiService = {
  // Auth & Profile
  profile: {
    get: async (): Promise<User> => {
      const res = await axiosClient.get('/auth/profile/');
      return res.data;
    },
    update: async (data: Partial<User>): Promise<User> => {
      const res = await axiosClient.patch('/auth/profile/', data);
      return res.data;
    },
    uploadAvatar: async (formData: FormData): Promise<any> => {
      const res = await axiosClient.put('/auth/profile/avatar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    deleteAvatar: async (): Promise<void> => {
      await axiosClient.delete('/auth/profile/avatar/');
    },
    resetPassword: async (): Promise<void> => {
      await axiosClient.post('/auth/password-reset/');
    }
  },

  // Courses
  courses: {
    list: async (params?: { category?: number; search?: string; subcategory?: number; teacher?: number }): Promise<Course[]> => {
      // Endpoint público - no requiere autenticación
      const res = await axiosPublic.get('/courses/', { params });
      return unwrapList<Course>(res);
    },
    retrieve: async (id: number): Promise<Course> => {
      const res = await axiosClient.get(`/courses/${id}/`);
      return res.data;
    },
    create: async (data: Partial<Course>): Promise<Course> => {
      const res = await axiosClient.post('/courses/', data);
      return res.data;
    },
    update: async (id: number, data: Partial<Course>): Promise<Course> => {
      const res = await axiosClient.patch(`/courses/${id}/`, data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/courses/${id}/`);
    },
    uploadImage: async (id: number, formData: FormData): Promise<any> => {
      try {
        const res = await axiosClient.post(`/courses/${id}/image/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      } catch (err: any) {
        try {
          const res = await axiosClient.patch(`/courses/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return res.data;
        } catch (err2: any) {
          const res = await axiosClient.put(`/courses/${id}/image/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return res.data;
        }
      }
    }
  },

  // Lessons
  lessons: {
    list: async (params?: { course?: number }): Promise<Lesson[]> => {
      const res = await axiosClient.get('/lessons/', { params });
      return unwrapList<Lesson>(res);
    },
    retrieve: async (id: number): Promise<Lesson> => {
      const res = await axiosClient.get(`/lessons/${id}/`);
      return res.data;
    },
    create: async (data: Partial<Lesson>): Promise<Lesson> => {
      const res = await axiosClient.post('/lessons/', data);
      return res.data;
    },
    update: async (id: number, data: Partial<Lesson>): Promise<Lesson> => {
      const res = await axiosClient.patch(`/lessons/${id}/`, data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/lessons/${id}/`);
    }
  },

  // Categories
  categories: {
    list: async (): Promise<Category[]> => {
      // Endpoint público - no requiere autenticación
      const res = await axiosPublic.get('/categories/');
      return unwrapList<Category>(res);
    },
    create: async (data: Partial<Category>): Promise<Category> => {
      const res = await axiosClient.post('/categories/', data);
      return res.data;
    },
    update: async (id: number, data: Partial<Category>): Promise<Category> => {
      const res = await axiosClient.patch(`/categories/${id}/`, data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/categories/${id}/`);
    }
  },

  // Subcategories
  subcategories: {
    list: async (): Promise<Subcategory[]> => {
      const res = await axiosClient.get('/subcategories/');
      return unwrapList<Subcategory>(res);
    },
    create: async (data: Partial<Subcategory>): Promise<Subcategory> => {
      const res = await axiosClient.post('/subcategories/', data);
      return res.data;
    },
    update: async (id: number, data: Partial<Subcategory>): Promise<Subcategory> => {
      const res = await axiosClient.patch(`/subcategories/${id}/`, data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/subcategories/${id}/`);
    }
  },

  // Tags
  tags: {
    list: async (): Promise<Tag[]> => {
      const res = await axiosClient.get('/tags/');
      return unwrapList<Tag>(res);
    },
    create: async (data: Partial<Tag>): Promise<Tag> => {
      const res = await axiosClient.post('/tags/', data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/tags/${id}/`);
    }
  },

  // Enrollments
  enrollments: {
    list: async (): Promise<Enrollment[]> => {
      const res = await axiosClient.get('/enrollments/');
      return unwrapList<Enrollment>(res);
    },
    create: async (courseId: number): Promise<Enrollment> => {
      try {
        const res = await axiosClient.post('/enrollments/', { course: courseId, course_id: courseId });
        return res.data;
      } catch (err: any) {
        try {
          const res = await axiosClient.post('/enrollments/', { course: courseId });
          return res.data;
        } catch (err2: any) {
          const res = await axiosClient.post('/enrollments/', { course_id: courseId });
          return res.data;
        }
      }
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/enrollments/${id}/`);
    }
  },

  // Progress
  progress: {
    list: async (params?: { enrollment?: number }): Promise<Progress[]> => {
      const res = await axiosClient.get('/progress/', { params });
      return unwrapList<Progress>(res);
    },
    update: async (id: number, data: { completed: boolean; lesson: number; enrollment: number }): Promise<Progress> => {
      const res = await axiosClient.put(`/progress/${id}/`, data);
      return res.data;
    },
    create: async (data: { completed: boolean; lesson: number; enrollment: number }): Promise<Progress> => {
      const res = await axiosClient.post('/progress/', data);
      return res.data;
    }
  },

  // Wishlist
  wishlist: {
    list: async (): Promise<Wishlist[]> => {
      const res = await axiosClient.get('/wishlist/');
      return unwrapList<Wishlist>(res);
    },
    create: async (courseId: number): Promise<Wishlist> => {
      const res = await axiosClient.post('/wishlist/', { course: courseId });
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/wishlist/${id}/`);
    }
  },

  // Reviews
  reviews: {
    list: async (params?: { course?: number }): Promise<Review[]> => {
      const res = await axiosClient.get('/reviews/', { params });
      return unwrapList<Review>(res);
    },
    create: async (data: { course: number; rating: number; comment: string }): Promise<Review> => {
      const res = await axiosClient.post('/reviews/', data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/reviews/${id}/`);
    }
  },

  // Forums & Discussions
  forums: {
    list: async (): Promise<DiscussionForum[]> => {
      const res = await axiosClient.get('/discussion-forums/');
      return unwrapList<DiscussionForum>(res);
    },
    posts: {
      list: async (params?: { forum?: number }): Promise<ForumPost[]> => {
        const res = await axiosClient.get('/forum-posts/', { params });
        return unwrapList<ForumPost>(res);
      },
      create: async (data: { forum: number; title: string; content: string }): Promise<ForumPost> => {
        const res = await axiosClient.post('/forum-posts/', data);
        return res.data;
      },
      destroy: async (id: number): Promise<void> => {
        await axiosClient.delete(`/forum-posts/${id}/`);
      }
    },
    comments: {
      list: async (params?: { post?: number }): Promise<ForumComment[]> => {
        const res = await axiosClient.get('/forum-comments/', { params });
        return unwrapList<ForumComment>(res);
      },
      create: async (data: { post: number; content: string }): Promise<ForumComment> => {
        const res = await axiosClient.post('/forum-comments/', data);
        return res.data;
      },
      destroy: async (id: number): Promise<void> => {
        await axiosClient.delete(`/forum-comments/${id}/`);
      }
    }
  },

  // Lesson Questions & Answers (Q&A)
  qa: {
    questions: {
      list: async (params?: { lesson?: number }): Promise<LessonQuestion[]> => {
        const res = await axiosClient.get('/questions/', { params });
        return unwrapList<LessonQuestion>(res);
      },
      create: async (data: { lesson: number; title: string; content: string }): Promise<LessonQuestion> => {
        const res = await axiosClient.post('/questions/', data);
        return res.data;
      },
      destroy: async (id: number): Promise<void> => {
        await axiosClient.delete(`/questions/${id}/`);
      }
    },
    answers: {
      list: async (params?: { question?: number }): Promise<LessonAnswer[]> => {
        const res = await axiosClient.get('/answers/', { params });
        return unwrapList<LessonAnswer>(res);
      },
      create: async (data: { question: number; content: string }): Promise<LessonAnswer> => {
        const res = await axiosClient.post('/answers/', data);
        return res.data;
      },
      destroy: async (id: number): Promise<void> => {
        await axiosClient.delete(`/answers/${id}/`);
      }
    }
  },

  // Quizzes & Attempts
  quizzes: {
    list: async (params?: { course?: number }): Promise<Quiz[]> => {
      const res = await axiosClient.get('/quizzes/', { params });
      return unwrapList<Quiz>(res);
    },
    retrieve: async (id: number): Promise<Quiz> => {
      const res = await axiosClient.get(`/quizzes/${id}/`);
      return res.data;
    },
    create: async (data: { course: number; title: string; description?: string; passing_score: number }): Promise<Quiz> => {
      const res = await axiosClient.post('/quizzes/', data);
      return res.data;
    },
    destroy: async (id: number): Promise<void> => {
      await axiosClient.delete(`/quizzes/${id}/`);
    },
    // Quiz Attempts
    attempts: {
      list: async (params?: { quiz?: number }): Promise<QuizAttempt[]> => {
        const res = await axiosClient.get('/quiz-attempts/', { params });
        return unwrapList<QuizAttempt>(res);
      },
      create: async (data: { quiz: number; score: number; passed: boolean }): Promise<QuizAttempt> => {
        const res = await axiosClient.post('/quiz-attempts/', data);
        return res.data;
      }
    }
  },

  // Certificates
  certificates: {
    list: async (): Promise<Certificate[]> => {
      const res = await axiosClient.get('/certificates/');
      return unwrapList<Certificate>(res);
    },
    create: async (courseId: number): Promise<Certificate> => {
      const res = await axiosClient.post('/certificates/', { course: courseId });
      return res.data;
    }
  },

  // Notifications
  notifications: {
    list: async (): Promise<Notification[]> => {
      const res = await axiosClient.get('/notifications/');
      return unwrapList<Notification>(res);
    },
    markRead: async (id: number): Promise<Notification> => {
      const res = await axiosClient.patch(`/notifications/${id}/`, { read: true });
      return res.data;
    }
  },

  // Users Management
  users: {
    list: async (): Promise<User[]> => {
      const res = await axiosClient.get('/users/');
      return unwrapList<User>(res);
    },
    updateRole: async (id: number, role: string): Promise<User> => {
      const is_teacher = role === 'teacher';
      const is_student = role === 'student';
      const res = await axiosClient.patch(`/users/${id}/`, { is_teacher, is_student });
      return res.data;
    }
  }
};
