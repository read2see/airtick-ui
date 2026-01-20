export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  role: "ADMIN" | "CUSTOMER";
  message: string;
}

export interface RegisterRequest {
  email_address: string;
  password: string;
}

export interface AuthenticatedUserResponse {
  id: number;
  role: "ADMIN" | "CUSTOMER";
  email_verified: boolean;
  email: string;
  first_name: string;
  last_name: string;
  profile_img: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailPasswordResetRequest {
  email: string;
}

export interface PasswordResetTokenRequest {
  token: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface PasswordResetRequest {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}
