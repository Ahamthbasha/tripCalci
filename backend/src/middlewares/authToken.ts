import { Request, Response, NextFunction } from "express";
import { IJwtPayload, IJwtService } from "../services/commonService/interface/IJwtServie";
import { StatusCode } from "../utils/enums"; // adjust if needed
import { AuthErrorMsg } from "../utils/constants";

export interface AuthenticatedRequest extends Request {
  user?: IJwtPayload;
}

export class AuthMiddleware {
  private _jwtService: IJwtService;

  constructor(jwtService: IJwtService) {
    this._jwtService = jwtService;
  }

  authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
      console.log("❌ No accessToken found in cookies");
      res.status(StatusCode.UNAUTHORIZED).json({
        failToken: true,
        message: AuthErrorMsg.NO_ACCESS_TOKEN,
      });
      return
    }

    try {
      // Try verifying access token
      const decoded = await this._jwtService.verifyAccessToken(accessToken);
      req.user = decoded;
      next();
    } catch (error: any) {
      // If access token is expired, try refreshing
      if (error.message === "ACCESS_TOKEN_EXPIRED") {
        if (!refreshToken) {
          res.status(StatusCode.UNAUTHORIZED).json({
            failToken: true,
            message: AuthErrorMsg.NO_REFRESH_TOKEN,
          });
          return
        }

        try {
          const refreshPayload = await this._jwtService.verifyRefreshToken(refreshToken);

          // Generate new access token
          const newAccessToken = await this._jwtService.generateAccessToken({
            id: refreshPayload.id,
            email: refreshPayload.email,
            role: refreshPayload.role,
          });

          // Set new access token in httpOnly cookie
          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // enable in prod
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          console.log("🔄 Access token refreshed via refresh token");

          req.user = refreshPayload;
          next();
        } catch (refreshError: any) {
          if (refreshError.message === "REFRESH_TOKEN_EXPIRED") {
            res.status(StatusCode.UNAUTHORIZED).json({
              message: AuthErrorMsg.REFRESH_TOKEN_EXPIRED,
            });
            return
          }
          res.status(StatusCode.UNAUTHORIZED).json({
            message: AuthErrorMsg.INVALID_REFRESH_TOKEN,
          });
          return
        }
      } else {
        // Other errors (invalid signature, malformed, etc.)
        res.status(StatusCode.UNAUTHORIZED).json({
          message: AuthErrorMsg.INVALID_ACCESS_TOKEN,
        });
        return
      }
    }
  };
}