export interface UserResponse {
  id: number;
  email_address?: string;
  emailAddress?: string;
  email?: string;
  active: boolean;
  email_verified?: boolean;
  emailVerified?: boolean;
  role: "ADMIN" | "CUSTOMER";
  user_profile?: {
    id: number;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    profile_img?: string;
    profileImg?: string;
  } | null;
  userProfile?: {
    id: number;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    profile_img?: string;
    profileImg?: string;
  } | null;
  [key: string]: any;
}