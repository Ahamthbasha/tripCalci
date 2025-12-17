export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  accessToken?:string;
  refreshToken?:string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}