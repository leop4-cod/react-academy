import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar?: string;
  avatar_url?: string;
  role?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_teacher?: boolean;
  is_student?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user?: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (token, user) => {
        const decoded = decodeJwt(token);
        const isAdmin = !!(decoded?.is_staff || decoded?.is_superuser || user?.email === 'admin@codeacademy.com' || user?.role === 'admin' || user?.is_staff || user?.is_superuser);
        const isTeacher = !!(user?.is_teacher || user?.role === 'teacher' || decoded?.is_teacher);
        const resolvedRole = isAdmin ? 'admin' : (isTeacher ? 'teacher' : 'student');
        const updatedUser = user ? { ...user, role: resolvedRole } : null;
        set({
          token,
          user: updatedUser,
          isAuthenticated: true,
          isAdmin,
        });
      },
      updateUser: (userUpdates) => set((state) => {
        const decoded = state.token ? decodeJwt(state.token) : null;
        const tempUser = state.user ? { ...state.user, ...userUpdates } : null;
        const isAdmin = !!(decoded?.is_staff || decoded?.is_superuser || tempUser?.email === 'admin@codeacademy.com' || tempUser?.role === 'admin' || tempUser?.is_staff || tempUser?.is_superuser);
        const isTeacher = !!(tempUser?.is_teacher || tempUser?.role === 'teacher' || decoded?.is_teacher);
        const resolvedRole = isAdmin ? 'admin' : (isTeacher ? 'teacher' : 'student');
        const updatedUser = tempUser ? { ...tempUser, role: resolvedRole } : null;
        return {
          user: updatedUser,
          isAdmin,
        };
      }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
