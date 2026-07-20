import { apiService } from '../../infrastructure/http/api-service';
import { useAuthStore } from '../../presentation/store/auth.store';

export class AuthUseCase {
  static async login(username: string, password?: string) {
    // Authenticate via infrastructure api service
    const response = await apiService.profile.get();
    useAuthStore.getState().setAuth('dummy-token', response);
    return response;
  }

  static logout() {
    useAuthStore.getState().logout();
  }
}
