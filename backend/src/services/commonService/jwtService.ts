import jwt, { SignOptions } from "jsonwebtoken";
import { IJwtService, IJwtPayload, ITokens } from "./interface/IJwtServie";

export class JwtService implements IJwtService {
  private _accessSecret: string;
  private _refreshSecret: string;
  private _accessExpiry: string;
  private _refreshExpiry: string;

  constructor() {
    this._accessSecret = process.env.JWT_SECRET || "";
    this._refreshSecret = process.env.JWT_REFRESH_SECRET || "";
    this._accessExpiry = process.env.JWT_EXPIRATION || "15m";
    this._refreshExpiry = process.env.JWT_REFRESH_EXPIRATION || "7d";

    if (!this._accessSecret) {
      throw new Error("JWT_SECRET not found in environment variables");
    }
    if (!this._refreshSecret) {
      throw new Error("JWT_REFRESH_SECRET not found in environment variables");
    }
  }

  async generateAccessToken(payload: IJwtPayload): Promise<string> {
    return jwt.sign(payload, this._accessSecret, {
      expiresIn: this._accessExpiry,
    } as SignOptions);
  }

  async generateRefreshToken(payload: IJwtPayload): Promise<string> {
    return jwt.sign(payload, this._refreshSecret, {
      expiresIn: this._refreshExpiry,
    } as SignOptions);
  }

  async generateTokens(payload: IJwtPayload): Promise<ITokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<IJwtPayload> {
    try {
      const decoded = jwt.verify(token, this._accessSecret) as IJwtPayload;
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("ACCESS_TOKEN_EXPIRED");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("INVALID_ACCESS_TOKEN");
      }
      throw new Error("ACCESS_TOKEN_VERIFICATION_FAILED");
    }
  }

  async verifyRefreshToken(token: string): Promise<IJwtPayload> {
    try {
      const decoded = jwt.verify(token, this._refreshSecret) as IJwtPayload;
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("REFRESH_TOKEN_EXPIRED");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("INVALID_REFRESH_TOKEN");
      }
      throw new Error("REFRESH_TOKEN_VERIFICATION_FAILED");
    }
  }
}