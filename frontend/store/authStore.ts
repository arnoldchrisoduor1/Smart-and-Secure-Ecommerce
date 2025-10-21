import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authApi,
  RegisterData,
  LoginData,
  ChangePasswordData,
  ResetPasswordData,
  VerifyEmailData,
  AuthResponse,
} from "@/lib/api/auth";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresMfa: boolean;

  // Actions
  register: (data: RegisterData) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  verifyEmail: (data: VerifyEmailData) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      requiresMfa: false,

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.register(data);

          // Store tokens in localStorage
          localStorage.setItem("access-token", response.accessToken);
          localStorage.setItem("refresh-token", response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            requiresMfa: response.requiresMfa,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.login(data);

          // Store tokens in localStorage
          localStorage.setItem("access-token", response.accessToken);
          localStorage.setItem("refresh-token", response.refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            requiresMfa: response.requiresMfa,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API to invalidate tokens on server
          await authApi.logout();
        } catch (error) {
          console.error("Logout API error:", error);
        } finally {
          // Clear local storage and state regardless of API call result
          localStorage.removeItem("access-token");
          localStorage.removeItem("refresh-token");
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
            requiresMfa: false,
          });
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to send reset email";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (data: ResetPasswordData) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword(data);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Password reset failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(data);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Password change failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // In your authStore.ts - verifyEmail action
      verifyEmail: async (data: VerifyEmailData) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.verifyEmail(data);
          // Update user email verification status
          set((state) => ({
            user: state.user ? { ...state.user, emailVerified: true } : null,
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Email verification failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      resendVerificationEmail: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resendVerificationEmail(email);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            "Failed to resend verification email";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        requiresMfa: state.requiresMfa,
      }),
    }
  )
);
