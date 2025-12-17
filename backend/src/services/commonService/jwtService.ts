import jwt, { SignOptions } from "jsonwebtoken";
import { IJwtService, IJwtPayload, ITokens } from "./interface/IJwtServie";

export class JwtService implements IJwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;

  constructor() {
    this.accessSecret = process.env.JWT_SECRET || "";
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || "";
    this.accessExpiry = process.env.JWT_EXPIRATION || "15m";
    this.refreshExpiry = process.env.JWT_REFRESH_EXPIRATION || "7d";

    if (!this.accessSecret) {
      throw new Error("JWT_SECRET not found in environment variables");
    }
    if (!this.refreshSecret) {
      throw new Error("JWT_REFRESH_SECRET not found in environment variables");
    }
  }

  async generateAccessToken(payload: IJwtPayload): Promise<string> {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
    } as SignOptions);
  }

  async generateRefreshToken(payload: IJwtPayload): Promise<string> {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
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
      const decoded = jwt.verify(token, this.accessSecret) as IJwtPayload;
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
      const decoded = jwt.verify(token, this.refreshSecret) as IJwtPayload;
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