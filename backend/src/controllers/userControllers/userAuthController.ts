import { Request, Response } from "express";
import { IUserController } from "./Interface/IUserAuthController";
import { IUserService } from "../../services/userServie/interface/IUserAuthService";
import { ValidationHelper } from "../../utils/validation";

export class UserController implements IUserController {
  constructor(private userService: IUserService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Basic presence validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      // Validate email format
      const emailValidation = ValidationHelper.validateEmail(email);
      if (!emailValidation.isValid) {
        res.status(400).json({
          success: false,
          message: emailValidation.message,
        });
        return;
      }

      // Validate password strength
      const passwordValidation = ValidationHelper.validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
        return;
      }

      // Sanitize email
      const sanitizedEmail = ValidationHelper.sanitizeEmail(email);

      // Call service
      const result = await this.userService.login({
        email: sanitizedEmail,
        password,
      });

      // Handle failure
      if (!result.success) {
        res.status(401).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // Set cookie options
      const isProduction = process.env.NODE_ENV === "production";

      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? ("none" as const) : ("lax" as const),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      };

      // Determine status code based on message
      const statusCode = result.message.includes("created") ? 201 : 200;

      // Set tokens in cookies and send response
      res
        .status(statusCode)
        .cookie("accessToken", result.accessToken!, cookieOptions)
        .cookie("refreshToken", result.refreshToken!, cookieOptions)
        .json({
          success: true,
          message: result.message,
          user: result.user,
        });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
          ? ("none" as const)
          : ("lax" as const),
        path: "/",
      };

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}