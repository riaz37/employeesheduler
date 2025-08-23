import { api } from '@/lib/api';
import { LoginRequest, LoginResponse, ChangePasswordRequest, Employee } from '@/types';

// Helper function to check if we're on the client side
const isClient = typeof window !== 'undefined';

// Helper function to safely access localStorage
const getStorageItem = (key: string): string | null => {
  if (!isClient) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string): void => {
  if (!isClient) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore errors
  }
};

const removeStorageItem = (key: string): void => {
  if (!isClient) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
};

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens in localStorage
    setStorageItem('access_token', response.data.access_token);
    setStorageItem('refresh_token', response.data.refresh_token);
    setStorageItem('user', JSON.stringify(response.data.employee));
    
    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await api.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // Update access token
    setStorageItem('access_token', response.data.access_token);
    
    return response.data;
  }

  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  }

  static async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    
    // Clear tokens and user data
    removeStorageItem('access_token');
    removeStorageItem('refresh_token');
    removeStorageItem('user');
    
    return response.data;
  }

  static async getProfile(): Promise<Employee> {
    const response = await api.get<Employee>('/auth/profile');
    
    // Update stored user data
    setStorageItem('user', JSON.stringify(response.data));
    
    return response.data;
  }

  static getCurrentUser(): Employee | null {
    try {
      const user = getStorageItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  static getAccessToken(): string | null {
    return getStorageItem('access_token');
  }

  static getRefreshToken(): string | null {
    return getStorageItem('refresh_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  static clearAuth(): void {
    removeStorageItem('access_token');
    removeStorageItem('refresh_token');
    removeStorageItem('user');
  }
} 