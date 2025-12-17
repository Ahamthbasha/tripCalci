import { JwtPayload } from "jsonwebtoken";

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtService {
  generateAccessToken(payload: IJwtPayload): Promise<string>;
  generateRefreshToken(payload: IJwtPayload): Promise<string>;
  generateTokens(payload: IJwtPayload): Promise<ITokens>;
  verifyAccessToken(token: string): Promise<IJwtPayload>;
  verifyRefreshToken(token: string): Promise<IJwtPayload>;
}