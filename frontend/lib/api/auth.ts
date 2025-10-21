import { api } from "./axios";

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceFingerprint?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface EnableMfaData {
  code: string;
}

export interface VerifyMfaData {
  code: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  requiresMfa: boolean;
  otpSent: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
  };
  expiresIn: number;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", {
      ...data,
      role: data.role || "admin",
    });
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await api.post("/auth/reset-password", data);
  },

  verifyEmail: async (data: VerifyEmailData): Promise<void> => {
    await api.post("/auth/verify-email", data);
  },

  // Add to authApi object
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post("/auth/resend-verification", { email });
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  enableMfa: async (data: EnableMfaData): Promise<void> => {
    await api.post("/auth/enable-mfa", data);
  },

  verifyMfa: async (data: VerifyMfaData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/verify-mfa", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
