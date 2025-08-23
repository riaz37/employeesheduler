import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services/auth.service';
import { LoginRequest, ChangePasswordRequest, Employee } from '@/types';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.employee);
      // Use replace instead of push to prevent back button issues
      router.replace('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
    },
    onError: () => {
      // Clear local data even if logout API fails
      AuthService.clearAuth();
      queryClient.clear();
      router.replace('/login');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => AuthService.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  const profileQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: AuthService.getProfile,
    enabled: AuthService.isAuthenticated(),
    retry: false,
  });

  const login = (credentials: LoginRequest) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const changePassword = (data: ChangePasswordRequest) => {
    return changePasswordMutation.mutateAsync(data);
  };

  const isAuthenticated = AuthService.isAuthenticated();
  const user = profileQuery.data || AuthService.getCurrentUser();

  return {
    // State
    user,
    isAuthenticated,
    isLoading: profileQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
    isError: profileQuery.isError,
    error: profileQuery.error,

    // Actions
    login,
    logout,
    changePassword,

    // Mutation states
    loginMutation,
    logoutMutation,
    changePasswordMutation,
  };
};

export const useCurrentUser = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: AuthService.getProfile,
    enabled: AuthService.isAuthenticated(),
    retry: false,
  });

  return {
    user: user || AuthService.getCurrentUser(),
    isLoading,
    error,
  };
}; 