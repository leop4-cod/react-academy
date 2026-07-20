export interface UserEntity {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  role: 'admin' | 'teacher' | 'student';
  isTeacher?: boolean;
  isStudent?: boolean;
}
